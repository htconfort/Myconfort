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
  // 🔑 VOTRE ID DE DÉPLOIEMENT GOOGLE APPS SCRIPT
  private static readonly SCRIPT_ID = 'AKfycbyDyrwJROg17hISp3PIN_d_OXB6XjbeIe1yQo_GxBZSouomR8IJ4a2aMC0rDD0vnkWB';
  private static readonly SCRIPT_URL = `https://script.google.com/macros/s/${GoogleAppsScriptService.SCRIPT_ID}/exec`;

  /**
   * 📧 Envoie la facture avec PDF via Google Apps Script
   */
  static async sendInvoiceWithPDF(invoice: Invoice, customMessage?: string): Promise<boolean> {
    try {
      console.log('🚀 ENVOI FACTURE VIA GOOGLE APPS SCRIPT');
      console.log('🔗 Script URL:', GoogleAppsScriptService.SCRIPT_URL);
      
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

      // Étape 4: Préparer les données pour Google Apps Script
      const requestData = {
        // Informations destinataire
        email: invoice.client.email,
        name: invoice.client.name,
        
        // Informations facture
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        totalAmount: formatCurrency(totalAmount),
        
        // PDF en base64
        pdfData: pdfBase64.split(',')[1], // Enlever le préfixe data:application/pdf;base64,
        pdfFilename: `facture_${invoice.invoiceNumber}.pdf`,
        pdfSize: pdfSizeKB,
        
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

      // Étape 5: Envoyer la requête à Google Apps Script
      console.log('📤 Envoi vers Google Apps Script...');
      console.log('📊 Taille PDF:', pdfSizeKB, 'KB');
      console.log('📧 Destinataire:', invoice.client.email);

      const response = await fetch(GoogleAppsScriptService.SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        mode: 'cors' // Important pour les requêtes cross-origin
      });

      // Étape 6: Traiter la réponse
      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
      }

      const result = await response.text();
      console.log('📨 Réponse Google Apps Script:', result);

      // Vérifier si l'envoi a réussi
      if (result.includes('Email envoyé') || result.includes('success') || result.includes('OK')) {
        console.log('✅ Email envoyé avec succès via Google Apps Script !');
        return true;
      } else {
        console.error('❌ Échec de l\'envoi:', result);
        return false;
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi via Google Apps Script:', error);
      console.error('🔍 Détails:', {
        scriptId: GoogleAppsScriptService.SCRIPT_ID,
        scriptUrl: GoogleAppsScriptService.SCRIPT_URL,
        error: error.message
      });
      return false;
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
        imageData: imageDataUrl.split(',')[1], // Enlever le préfixe
        imageFilename: `apercu_facture_${invoice.invoiceNumber}.${format}`,
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

      // Envoyer à Google Apps Script
      const response = await fetch(GoogleAppsScriptService.SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestData),
        mode: 'cors'
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP: ${response.status}`);
      }

      const result = await response.text();
      console.log('📨 Réponse partage aperçu:', result);

      return result.includes('Email envoyé') || result.includes('success') || result.includes('OK');

    } catch (error: any) {
      console.error('❌ Erreur partage aperçu via Google Apps Script:', error);
      return false;
    }
  }

  /**
   * 🧪 Test de la connexion avec Google Apps Script
   */
  static async testConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    try {
      console.log('🧪 TEST DE CONNEXION GOOGLE APPS SCRIPT');
      
      const startTime = Date.now();
      
      const testData = {
        requestType: 'test',
        message: 'Test de connexion depuis MYCONFORT',
        timestamp: new Date().toISOString()
      };

      const response = await fetch(GoogleAppsScriptService.SCRIPT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
        mode: 'cors'
      });

      const responseTime = Date.now() - startTime;

      if (!response.ok) {
        return {
          success: false,
          message: `Erreur HTTP: ${response.status} ${response.statusText}`,
          responseTime
        };
      }

      const result = await response.text();
      console.log('📨 Réponse test:', result);

      return {
        success: true,
        message: `Connexion réussie ! Réponse: ${result}`,
        responseTime
      };

    } catch (error: any) {
      console.error('❌ Erreur test connexion:', error);
      return {
        success: false,
        message: `Erreur de connexion: ${error.message}`
      };
    }
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
      status: '✅ Configuré et prêt'
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