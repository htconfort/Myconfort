import html2pdf from 'html2pdf.js';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

export interface Html2PdfOptions {
  filename?: string;
  html2canvas?: {
    scale?: number;
    useCORS?: boolean;
    letterRendering?: boolean;
    allowTaint?: boolean;
    backgroundColor?: string;
  };
  jsPDF?: {
    unit?: string;
    format?: string;
    orientation?: string;
    compress?: boolean;
  };
  margin?: number | number[];
}

export class Html2PdfService {
  // Configuration par défaut optimisée pour MYCONFORT
  private static readonly DEFAULT_OPTIONS: Html2PdfOptions = {
    html2canvas: { 
      scale: 2,
      useCORS: true,
      letterRendering: true,
      allowTaint: true,
      backgroundColor: '#ffffff'
    },
    jsPDF: { 
      unit: "mm", 
      format: "a4", 
      orientation: "portrait",
      compress: true
    },
    margin: 0
  };

  // URL de votre Google Apps Script (mise à jour avec votre nouvelle URL finale)
  private static readonly GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwIj1kxUxR98Zp1zgWLAT3vazv8j3-0OpQyI29NHYn0ENpMVVIwqqaFi_A29XW_Ot4-/exec';

  /**
   * 📄 Génère un PDF à partir de l'élément HTML et l'envoie via Google Apps Script
   */
  static async exportAndSendPDF(
    invoice: Invoice, 
    elementId: string = 'facture-apercu',
    customMessage?: string
  ): Promise<boolean> {
    try {
      console.log('🚀 EXPORT ET ENVOI PDF VIA HTML2PDF + GOOGLE APPS SCRIPT');
      console.log('🎯 Élément cible:', elementId);
      console.log('📧 Destinataire:', invoice.client.email);

      // Étape 1: Vérifier que l'élément existe
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Élément avec l'ID "${elementId}" non trouvé`);
      }

      // Étape 2: Configuration html2pdf optimisée
      const options = {
        ...Html2PdfService.DEFAULT_OPTIONS,
        filename: `Facture_MyConfort_${invoice.invoiceNumber}.pdf`
      };

      console.log('⚙️ Configuration html2pdf:', options);

      // Étape 3: Générer le PDF avec html2pdf
      console.log('📄 Génération PDF avec html2pdf...');
      const pdfBlob = await html2pdf()
        .from(element)
        .set(options)
        .outputPdf('blob');

      console.log('✅ PDF généré:', Math.round(pdfBlob.size / 1024), 'KB');

      // Étape 4: Convertir en base64
      console.log('🔄 Conversion en base64...');
      const base64 = await Html2PdfService.blobToBase64(pdfBlob);

      // Étape 5: Préparer les données pour Google Apps Script
      const requestData = Html2PdfService.prepareGoogleScriptData(
        invoice, 
        base64, 
        options.filename!,
        customMessage
      );

      // Étape 6: Envoyer via Google Apps Script
      console.log('🚀 Envoi vers Google Apps Script...');
      const success = await Html2PdfService.sendToGoogleScript(requestData);

      if (success) {
        console.log('✅ Email envoyé avec succès via Google Apps Script !');
        return true;
      } else {
        console.error('❌ Échec de l\'envoi via Google Apps Script');
        return false;
      }

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'export et envoi PDF:', error);
      throw new Error(`Erreur export PDF: ${error.message}`);
    }
  }

  /**
   * 📄 Génère uniquement le PDF sans l'envoyer
   */
  static async generatePDFOnly(
    elementId: string = 'facture-apercu',
    filename?: string
  ): Promise<Blob> {
    try {
      console.log('📄 GÉNÉRATION PDF UNIQUEMENT avec html2pdf');

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Élément avec l'ID "${elementId}" non trouvé`);
      }

      const options = {
        ...Html2PdfService.DEFAULT_OPTIONS,
        filename: filename || 'Facture_MyConfort.pdf'
      };

      const pdfBlob = await html2pdf()
        .from(element)
        .set(options)
        .outputPdf('blob');

      console.log('✅ PDF généré:', Math.round(pdfBlob.size / 1024), 'KB');
      return pdfBlob;

    } catch (error: any) {
      console.error('❌ Erreur génération PDF:', error);
      throw new Error(`Erreur génération PDF: ${error.message}`);
    }
  }

  /**
   * 💾 Télécharge le PDF directement
   */
  static async downloadPDF(
    elementId: string = 'facture-apercu',
    filename?: string
  ): Promise<void> {
    try {
      console.log('💾 TÉLÉCHARGEMENT PDF avec html2pdf');

      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Élément avec l'ID "${elementId}" non trouvé`);
      }

      const options = {
        ...Html2PdfService.DEFAULT_OPTIONS,
        filename: filename || 'Facture_MyConfort.pdf'
      };

      await html2pdf()
        .from(element)
        .set(options)
        .save();

      console.log('✅ PDF téléchargé avec succès');

    } catch (error: any) {
      console.error('❌ Erreur téléchargement PDF:', error);
      throw new Error(`Erreur téléchargement PDF: ${error.message}`);
    }
  }

  /**
   * 🧪 Test de connexion avec Google Apps Script
   */
  static async testGoogleScriptConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    try {
      console.log('🧪 TEST DE CONNEXION GOOGLE APPS SCRIPT');
      
      const startTime = Date.now();
      
      const testData = {
        requestType: 'test',
        message: 'Test de connexion depuis MYCONFORT html2pdf',
        timestamp: new Date().toISOString()
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(Html2PdfService.GOOGLE_SCRIPT_URL, {
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

        if (!response.ok) {
          return {
            success: false,
            message: `❌ Erreur HTTP: ${response.status} ${response.statusText}`,
            responseTime
          };
        }

        const result = await response.text();
        console.log('📨 Réponse du script:', result);

        const isSuccess = result.includes('Script actif') || 
                         result.includes('success') || 
                         result.includes('OK') ||
                         response.status === 200;

        return {
          success: isSuccess,
          message: isSuccess 
            ? `✅ Connexion réussie ! (${responseTime}ms)`
            : `⚠️ Réponse inattendue: "${result.substring(0, 100)}"`,
          responseTime
        };

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error: any) {
      console.error('❌ Erreur test connexion:', error);
      
      let errorMessage = '❌ Erreur de connexion: ';
      
      if (error.name === 'AbortError') {
        errorMessage += 'Timeout - Le script met trop de temps à répondre';
      } else if (error.name === 'TypeError' && error.message.includes('Failed to fetch')) {
        errorMessage += 'Impossible de joindre le script. Vérifiez le déploiement.';
      } else {
        errorMessage += error.message;
      }

      return {
        success: false,
        message: errorMessage
      };
    }
  }

  /**
   * 📋 Prépare les données pour Google Apps Script
   */
  private static prepareGoogleScriptData(
    invoice: Invoice, 
    pdfBase64: string, 
    filename: string,
    customMessage?: string
  ): any {
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

    // Message par défaut si non fourni
    let emailMessage = customMessage;
    if (!emailMessage) {
      emailMessage = `Bonjour ${invoice.client.name},\n\n`;
      emailMessage += `Veuillez trouver ci-joint votre facture n°${invoice.invoiceNumber} générée avec MYCONFORT.\n\n`;
      
      if (acompteAmount > 0) {
        emailMessage += `💰 Total TTC: ${formatCurrency(totalAmount)}\n`;
        emailMessage += `💳 Acompte versé: ${formatCurrency(acompteAmount)}\n`;
        emailMessage += `💸 Reste à payer: ${formatCurrency(montantRestant)}\n\n`;
      } else {
        emailMessage += `💰 Montant total: ${formatCurrency(totalAmount)}\n\n`;
      }
      
      if (invoice.signature) {
        emailMessage += '✅ Cette facture a été signée électroniquement.\n\n';
      }
      
      emailMessage += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}`;
    }

    return {
      // Données PDF
      pdfBase64: pdfBase64.split(',')[1], // Enlever le préfixe data:application/pdf;base64,
      filename: filename,
      
      // Informations destinataire
      email: invoice.client.email,
      name: invoice.client.name,
      
      // Informations facture
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
      totalAmount: formatCurrency(totalAmount),
      
      // Message
      message: emailMessage,
      
      // Informations entreprise
      companyName: 'MYCONFORT',
      companyAddress: '88 Avenue des Ternes, 75017 Paris',
      companyPhone: '04 68 50 41 45',
      companyEmail: 'myconfort@gmail.com',
      companySiret: '824 313 530 00027',
      
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
      appName: 'MYCONFORT - html2pdf',
      generatedDate: new Date().toLocaleDateString('fr-FR'),
      generatedTime: new Date().toLocaleTimeString('fr-FR'),
      
      // Signature
      hasSigned: !!invoice.signature,
      signatureStatus: invoice.signature ? 'Signé électroniquement' : 'Non signé'
    };
  }

  /**
   * 🚀 Envoie les données vers Google Apps Script
   */
  private static async sendToGoogleScript(data: any): Promise<boolean> {
    try {
      console.log('📤 Envoi vers Google Apps Script...');
      console.log('📊 Taille des données:', JSON.stringify(data).length, 'caractères');

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 secondes

      try {
        const response = await fetch(Html2PdfService.GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
          mode: 'cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        console.log('📊 Statut réponse:', response.status);

        if (!response.ok) {
          throw new Error(`Erreur HTTP: ${response.status} ${response.statusText}`);
        }

        const result = await response.text();
        console.log('📨 Réponse Google Apps Script:', result);

        // Vérifier si l'envoi a réussi
        const isSuccess = result.includes('Facture enregistrée') || 
                         result.includes('success') || 
                         result.includes('OK');

        return isSuccess;

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        throw fetchError;
      }

    } catch (error: any) {
      console.error('❌ Erreur envoi Google Apps Script:', error);
      return false;
    }
  }

  /**
   * 🔄 Convertit un Blob en base64
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
   * 📋 Obtient les informations de configuration
   */
  static getConfigInfo(): { scriptUrl: string; status: string } {
    return {
      scriptUrl: Html2PdfService.GOOGLE_SCRIPT_URL,
      status: '✅ Configuré avec html2pdf.js'
    };
  }

  /**
   * ✅ Valide les données avant envoi
   */
  static validateInvoiceData(invoice: Invoice): { isValid: boolean; errors: string[] } {
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