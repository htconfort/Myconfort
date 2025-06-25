import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { AdvancedPDFService } from './advancedPdfService';

export interface GoogleAppsScriptResponse {
  success: boolean;
  message: string;
  emailSent?: boolean;
  error?: string;
}

export class GoogleAppsScriptService {
  // 🔑 VOTRE SCRIPT ID CONFIRMÉ
  private static readonly SCRIPT_ID = 'AKfycbwIj1kxUxR98Zp1zgWLAT3vazv8j3-0OpQyI29NHYn0ENpMVVIwqqaFi_A29XW_Ot4-';
  private static readonly SCRIPT_URL = `https://script.google.com/macros/s/${GoogleAppsScriptService.SCRIPT_ID}/exec`;

  /**
   * 📧 Envoie la facture avec PDF via Google Apps Script
   */
  static async sendInvoiceWithPDF(invoice: Invoice, customMessage?: string): Promise<boolean> {
    try {
      console.log('🚀 ENVOI FACTURE VIA GOOGLE APPS SCRIPT - SCRIPT CONFIRMÉ');
      console.log('🔗 Script URL:', GoogleAppsScriptService.SCRIPT_URL);
      console.log('🆔 Script ID:', GoogleAppsScriptService.SCRIPT_ID);
      
      // Étape 1: Générer le PDF identique à l'aperçu
      console.log('📄 Génération du PDF identique...');
      const pdfDoc = await AdvancedPDFService.generateInvoicePDF(invoice);
      const pdfBlob = pdfDoc.output('blob');
      const pdfSizeKB = Math.round(pdfBlob.size / 1024);
      
      // Convertir le PDF en base64
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      
      // Étape 2: Calculer les montants
      const totalAmount = invoice.products.reduce((sum, product) => {
        return sum + calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        );
      }, 0);

      const acompteAmount = invoice.payment.depositAmount || 0;
      const montantRestant = totalAmount - acompteAmount;

      // Étape 3: Préparer le message personnalisé
      let emailMessage = customMessage || this.generateDefaultMessage(invoice, totalAmount, acompteAmount, montantRestant);

      // Étape 4: Préparer les données pour Google Apps Script (FORMAT COMPATIBLE)
      const requestData = {
        // Format principal pour votre script
        pdfBase64: pdfBase64.split(',')[1], // Enlever le préfixe data:application/pdf;base64,
        filename: `facture_${invoice.invoiceNumber}.pdf`,
        
        // Informations destinataire
        email: invoice.client.email,
        clientName: invoice.client.name,
        name: invoice.client.name, // Alias pour compatibilité
        
        // Informations facture
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        totalAmount: formatCurrency(totalAmount),
        
        // Message personnalisé
        message: emailMessage,
        
        // Informations entreprise
        companyName: 'MYCONFORT',
        companyAddress: '88 Avenue des Ternes, 75017 Paris',
        companyPhone: '04 68 50 41 45',
        companyEmail: 'myconfort@gmail.com',
        companySiret: '824 313 530 00027',
        companyWebsite: 'https://www.htconfort.com',
        
        // Informations client détaillées
        clientAddress: `${invoice.client.address}, ${invoice.client.postalCode} ${invoice.client.city}`,
        clientPhone: invoice.client.phone,
        
        // Informations paiement et acompte
        paymentMethod: invoice.payment.method || 'Non spécifié',
        depositAmount: acompteAmount > 0 ? formatCurrency(acompteAmount) : '',
        remainingAmount: acompteAmount > 0 ? formatCurrency(montantRestant) : '',
        
        // Informations conseiller
        advisor: invoice.advisorName || 'MYCONFORT',
        advisorName: invoice.advisorName || 'MYCONFORT',
        
        // Métadonnées
        appName: 'MYCONFORT - FactuSign Pro',
        generatedDate: new Date().toLocaleDateString('fr-FR'),
        generatedTime: new Date().toLocaleTimeString('fr-FR'),
        
        // Signature si présente
        hasSigned: !!invoice.signature,
        signatureStatus: invoice.signature ? 'Signé électroniquement' : 'Non signé',
        
        // Informations produits (résumé)
        productsCount: invoice.products.length,
        hasDiscount: invoice.products.some(p => p.discount > 0)
      };

      // Étape 5: Envoyer la requête à Google Apps Script avec timeout
      console.log('📤 Envoi vers Google Apps Script...');
      console.log('📊 Taille PDF:', pdfSizeKB, 'KB');
      console.log('📧 Destinataire:', invoice.client.email);

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes timeout

      try {
        const response = await fetch(GoogleAppsScriptService.SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          mode: 'cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        // Étape 6: Traiter la réponse
        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }

        const result = await response.text();
        console.log('📨 Réponse Google Apps Script:', result);

        // Vérifier si l'envoi a réussi - MISE À JOUR POUR GÉRER VOTRE SCRIPT
        if (result.includes('Facture enregistrée') || result.includes('success') || result.includes('OK') || response.ok) {
          console.log('✅ Email envoyé avec succès via Google Apps Script !');
          return true;
        } else {
          console.error('❌ Échec de l\'envoi:', result);
          return false;
        }
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi via Google Apps Script:', error);
      
      // Amélioration du message d'erreur avec diagnostic détaillé
      let detailedError = this.generateDetailedErrorMessage(error);
      console.error('🔍 Diagnostic détaillé:', detailedError);
      
      // Lancer une erreur avec plus de contexte
      throw new Error(detailedError);
    }
  }

  /**
   * 📸 Partage l'aperçu de la facture via Google Apps Script
   */
  static async sharePreviewViaScript(
    invoice: Invoice, 
    imageDataUrl: string, 
    imageSizeKB: number, 
    format: string = 'png'
  ): Promise<boolean> {
    try {
      console.log('📸 PARTAGE APERÇU VIA GOOGLE APPS SCRIPT');
      
      // Calculer les montants
      const totalAmount = invoice.products.reduce((sum, product) => {
        return sum + calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        );
      }, 0);

      const acompteAmount = invoice.payment.depositAmount || 0;
      const montantRestant = totalAmount - acompteAmount;

      // Message pour l'aperçu
      let previewMessage = `Bonjour ${invoice.client.name},\n\n`;
      previewMessage += `Voici l'aperçu de votre facture n°${invoice.invoiceNumber} tel qu'il apparaît dans notre système MYCONFORT.\n\n`;
      previewMessage += `📋 DÉTAILS :\n`;
      previewMessage += `• Numéro: ${invoice.invoiceNumber}\n`;
      previewMessage += `• Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}\n`;
      
      if (acompteAmount > 0) {
        previewMessage += `• Total TTC: ${formatCurrency(totalAmount)}\n`;
        previewMessage += `• Acompte versé: ${formatCurrency(acompteAmount)}\n`;
        previewMessage += `• Montant restant: ${formatCurrency(montantRestant)}\n\n`;
      } else {
        previewMessage += `• Montant total: ${formatCurrency(totalAmount)}\n\n`;
      }
      
      if (invoice.signature) {
        previewMessage += '✅ Cette facture a été signée électroniquement.\n\n';
      }
      
      previewMessage += `🎯 L'image ci-jointe vous montre exactement l'aperçu de votre facture.\n\n`;
      previewMessage += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}`;

      // Préparer les données pour Google Apps Script
      const requestData = {
        // Type de requête
        requestType: 'sharePreview',
        
        // Informations destinataire
        email: invoice.client.email,
        name: invoice.client.name,
        
        // Informations facture
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        totalAmount: formatCurrency(totalAmount),
        
        // Image de l'aperçu
        pdfBase64: imageDataUrl.split(',')[1], // Utiliser le même format que pour les PDF
        filename: `apercu_facture_${invoice.invoiceNumber}.${format}`,
        imageSize: imageSizeKB,
        imageFormat: format.toUpperCase(),
        
        // Message
        message: previewMessage,
        
        // Informations entreprise
        companyName: 'MYCONFORT',
        companyEmail: 'myconfort@gmail.com',
        advisorName: invoice.advisorName || 'MYCONFORT',
        
        // Métadonnées
        appName: 'MYCONFORT - Partage Aperçu',
        generatedDate: new Date().toLocaleDateString('fr-FR'),
        generatedTime: new Date().toLocaleTimeString('fr-FR')
      };

      // Envoyer à Google Apps Script avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(GoogleAppsScriptService.SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestData),
          mode: 'cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status}`);
        }

        const result = await response.text();
        console.log('📨 Réponse partage aperçu:', result);

        return result.includes('Facture enregistrée') || result.includes('success') || result.includes('OK') || response.ok;
      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error: any) {
      console.error('❌ Erreur partage aperçu via Google Apps Script:', error);
      
      // Amélioration du message d'erreur
      let detailedError = this.generateDetailedErrorMessage(error);
      console.error('🔍 Diagnostic partage aperçu:', detailedError);
      
      throw new Error(detailedError);
    }
  }

  /**
   * 🧪 Test de la connexion avec Google Apps Script
   */
  static async testConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    try {
      console.log('🧪 TEST DE CONNEXION GOOGLE APPS SCRIPT');
      console.log('🔗 URL de test:', GoogleAppsScriptService.SCRIPT_URL);
      console.log('🆔 Script ID utilisé:', GoogleAppsScriptService.SCRIPT_ID);
      
      const startTime = Date.now();
      
      const testData = {
        requestType: 'test',
        message: 'Test de connexion depuis MYCONFORT',
        timestamp: new Date().toISOString(),
        scriptId: GoogleAppsScriptService.SCRIPT_ID,
        testFrom: 'MYCONFORT Aperçu'
      };

      console.log('📤 Envoi des données de test:', testData);

      // Add timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 seconds timeout

      try {
        const response = await fetch(GoogleAppsScriptService.SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
          mode: 'cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);
        const responseTime = Date.now() - startTime;

        console.log('📊 Réponse HTTP status:', response.status);
        console.log('📊 Temps de réponse:', responseTime, 'ms');

        if (!response.ok) {
          return {
            success: false,
            message: `❌ Erreur HTTP: ${response.status} ${response.statusText}. Vérifiez que votre Google Apps Script est déployé comme application web avec les bonnes permissions.`,
            responseTime
          };
        }

        const result = await response.text();
        console.log('📨 Réponse complète du script:', result);

        // Vérifier différents types de réponses de succès
        const isSuccess = result.includes('Test réussi') || 
                         result.includes('success') || 
                         result.includes('OK') ||
                         result.includes('MYCONFORT Script actif') ||
                         result.includes('Script actif') ||
                         response.status === 200;

        return {
          success: isSuccess,
          message: isSuccess 
            ? `✅ Connexion réussie ! Script répond: "${result}"`
            : `⚠️ Script accessible mais réponse inattendue: "${result}"`,
          responseTime
        };

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error: any) {
      console.error('❌ Erreur test connexion:', error);
      
      // Générer un message d'erreur détaillé pour le test
      const detailedError = this.generateDetailedErrorMessage(error);
      
      return {
        success: false,
        message: detailedError
      };
    }
  }

  /**
   * 🔍 Génère un message d'erreur détaillé avec diagnostic
   */
  private static generateDetailedErrorMessage(error: any): string {
    let errorMessage = '❌ Erreur de connexion Google Apps Script:\n\n';
    
    if (error.name === 'AbortError') {
      errorMessage += '⏱️ TIMEOUT - Le script met trop de temps à répondre (30s)\n\n';
      errorMessage += '🔧 SOLUTIONS POSSIBLES:\n';
      errorMessage += '• Vérifiez que votre script Google Apps Script fonctionne correctement\n';
      errorMessage += '• Le script peut être surchargé ou avoir des erreurs internes\n';
      errorMessage += '• Consultez les logs d\'exécution dans Google Apps Script\n\n';
    } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
      errorMessage += '🌐 IMPOSSIBLE DE JOINDRE LE SCRIPT\n\n';
      errorMessage += '🔧 VÉRIFICATIONS NÉCESSAIRES:\n';
      errorMessage += '1. ✅ Script déployé comme "Web app"\n';
      errorMessage += '2. ✅ Permissions définies sur "Anyone" ou "Anyone, even anonymous"\n';
      errorMessage += '3. ✅ URL correcte avec /exec (pas /dev)\n';
      errorMessage += '4. ✅ Script ID complet et correct\n';
      errorMessage += '5. ✅ Connexion internet fonctionnelle\n\n';
      errorMessage += `📋 SCRIPT ACTUEL:\n`;
      errorMessage += `• ID: ${GoogleAppsScriptService.SCRIPT_ID}\n`;
      errorMessage += `• URL: ${GoogleAppsScriptService.SCRIPT_URL}\n\n`;
      errorMessage += '🔗 ÉTAPES DE DÉPLOIEMENT:\n';
      errorMessage += '1. Allez sur script.google.com/home\n';
      errorMessage += '2. Ouvrez votre projet de script\n';
      errorMessage += '3. Cliquez sur "Deploy" > "New deployment"\n';
      errorMessage += '4. Sélectionnez "Web app" comme type\n';
      errorMessage += '5. Configurez "Execute as: Me"\n';
      errorMessage += '6. Configurez "Who has access: Anyone"\n';
      errorMessage += '7. Cliquez "Deploy" et copiez l\'URL /exec\n\n';
    } else if (error.message.includes('CORS')) {
      errorMessage += '🚫 ERREUR CORS - Problème de permissions cross-origin\n\n';
      errorMessage += '🔧 SOLUTION:\n';
      errorMessage += '• Vérifiez que le script est configuré pour accepter les requêtes externes\n';
      errorMessage += '• Les permissions doivent être sur "Anyone" ou "Anyone, even anonymous"\n\n';
    } else if (error.message.includes('HTTP')) {
      errorMessage += `🌐 ERREUR HTTP: ${error.message}\n\n`;
      errorMessage += '🔧 VÉRIFICATIONS:\n';
      errorMessage += '• Le script est-il correctement déployé ?\n';
      errorMessage += '• Y a-t-il des erreurs dans le code du script ?\n';
      errorMessage += '• Consultez les logs d\'exécution dans Google Apps Script\n\n';
    } else {
      errorMessage += `🔍 ERREUR TECHNIQUE: ${error.message}\n\n`;
      errorMessage += '🔧 DIAGNOSTIC GÉNÉRAL:\n';
      errorMessage += '• Vérifiez la console du navigateur pour plus de détails\n';
      errorMessage += '• Testez l\'URL du script directement dans un navigateur\n';
      errorMessage += '• Consultez les logs Google Apps Script\n\n';
    }
    
    errorMessage += '💡 AIDE SUPPLÉMENTAIRE:\n';
    errorMessage += '• Documentation: https://developers.google.com/apps-script/guides/web\n';
    errorMessage += '• Vérifiez les quotas et limites Google Apps Script\n';
    errorMessage += '• Testez avec un script simple d\'abord\n';
    
    return errorMessage;
  }

  /**
   * Génère un message par défaut pour l'email
   */
  private static generateDefaultMessage(
    invoice: Invoice, 
    totalAmount: number, 
    acompteAmount: number, 
    montantRestant: number
  ): string {
    let message = `Bonjour ${invoice.client.name},\n\n`;
    message += `Veuillez trouver ci-joint votre facture n°${invoice.invoiceNumber} générée avec notre système MYCONFORT.\n\n`;
    
    message += `📋 DÉTAILS DE LA FACTURE :\n`;
    message += `• Numéro: ${invoice.invoiceNumber}\n`;
    message += `• Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}\n`;
    
    if (acompteAmount > 0) {
      message += `• Total TTC: ${formatCurrency(totalAmount)}\n`;
      message += `• Acompte versé: ${formatCurrency(acompteAmount)}\n`;
      message += `• Montant restant à payer: ${formatCurrency(montantRestant)}\n\n`;
    } else {
      message += `• Montant total: ${formatCurrency(totalAmount)}\n\n`;
    }
    
    if (invoice.payment.method) {
      message += `💳 Mode de paiement: ${invoice.payment.method}\n\n`;
    }
    
    if (invoice.signature) {
      message += '✅ Cette facture a été signée électroniquement et est juridiquement valide.\n\n';
    }
    
    message += `📎 Le PDF de votre facture est joint à cet email.\n\n`;
    message += `Pour toute question, n'hésitez pas à nous contacter.\n\n`;
    message += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}\n\n`;
    message += `---\nMYCONFORT\n`;
    message += `88 Avenue des Ternes, 75017 Paris\n`;
    message += `Tél: 04 68 50 41 45\n`;
    message += `Email: myconfort@gmail.com\n`;
    message += `SIRET: 824 313 530 00027`;

    return message;
  }

  /**
   * Convertit un Blob en base64
   */
  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erreur de conversion blob vers base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Obtient l'URL du script pour information
   */
  static getScriptInfo(): { scriptId: string; scriptUrl: string; status: string } {
    return {
      scriptId: GoogleAppsScriptService.SCRIPT_ID,
      scriptUrl: GoogleAppsScriptService.SCRIPT_URL,
      status: '✅ Configuré avec votre script final'
    };
  }

  /**
   * Valide l'email avant envoi
   */
  static validateEmailData(invoice: Invoice): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!invoice.client.email) {
      errors.push('Email du client requis');
    }

    if (!invoice.client.name) {
      errors.push('Nom du client requis');
    }

    if (invoice.products.length === 0) {
      errors.push('Au moins un produit requis');
    }

    const totalAmount = invoice.products.reduce((sum, product) => {
      return sum + calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      );
    }, 0);

    if (totalAmount <= 0) {
      errors.push('Montant total doit être supérieur à 0');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }
}