import emailjs from 'emailjs-com';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { AdvancedPDFService } from './advancedPdfService';

// Configuration EmailJS avec votre API Key
const EMAILJS_CONFIG = {
  SERVICE_ID: localStorage.getItem('emailjs_service_id') || 'YOUR_SERVICE_ID',
  TEMPLATE_ID: localStorage.getItem('emailjs_template_id') || 'YOUR_TEMPLATE_ID', 
  USER_ID: 'hvgYUCG9j2lURrt5k', // Votre API Key fournie
  CONFIGURED: false
};

// Vérifier si la configuration est complète
const updateConfigStatus = () => {
  EMAILJS_CONFIG.CONFIGURED = 
    EMAILJS_CONFIG.SERVICE_ID !== 'YOUR_SERVICE_ID' &&
    EMAILJS_CONFIG.TEMPLATE_ID !== 'YOUR_TEMPLATE_ID' &&
    EMAILJS_CONFIG.USER_ID === 'hvgYUCG9j2lURrt5k';
};

export class EmailService {
  /**
   * Vérifie si EmailJS est configuré
   */
  static isConfigured(): boolean {
    updateConfigStatus();
    return EMAILJS_CONFIG.CONFIGURED;
  }

  /**
   * Envoie la facture par email via EmailJS
   */
  static async sendInvoiceWithPDF(invoice: Invoice): Promise<boolean> {
    try {
      console.log('🚀 ENVOI FACTURE VIA EMAILJS');
      
      if (!this.isConfigured()) {
        console.error('❌ EmailJS non configuré');
        throw new Error('EmailJS n\'est pas entièrement configuré. Il vous manque le Service ID et/ou le Template ID.');
      }
      
      // Générer le PDF
      console.log('📄 Génération du PDF...');
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);
      
      // Convertir le PDF en base64
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      
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

      // Préparer les données pour EmailJS
      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: 'MYCONFORT',
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(totalAmount),
        deposit_amount: acompteAmount > 0 ? formatCurrency(acompteAmount) : '',
        remaining_amount: acompteAmount > 0 ? formatCurrency(montantRestant) : '',
        has_signature: invoice.signature ? 'Oui' : 'Non',
        advisor_name: invoice.advisorName || 'MYCONFORT',
        pdf_data: pdfBase64,
        message: this.generateDefaultMessage(invoice, totalAmount, acompteAmount, montantRestant)
      };

      // Envoyer via EmailJS avec votre API Key
      console.log('📧 Envoi via EmailJS avec API Key:', EMAILJS_CONFIG.USER_ID);
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      console.log('✅ Email envoyé avec succès via EmailJS:', response);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi via EmailJS:', error);
      throw new Error(`Erreur d'envoi: ${error.message}`);
    }
  }

  /**
   * Partage l'aperçu de la facture via EmailJS
   */
  static async sharePreviewViaEmail(
    invoice: Invoice, 
    imageDataUrl: string
  ): Promise<boolean> {
    try {
      console.log('📸 PARTAGE APERÇU VIA EMAILJS');
      
      if (!this.isConfigured()) {
        console.error('❌ EmailJS non configuré');
        throw new Error('EmailJS n\'est pas entièrement configuré. Il vous manque le Service ID et/ou le Template ID.');
      }

      // Préparer le message pour l'aperçu
      let previewMessage = `Bonjour ${invoice.client.name},\n\n`;
      previewMessage += `Voici l'aperçu de votre facture n°${invoice.invoiceNumber} tel qu'il apparaît dans notre système MYCONFORT.\n\n`;
      previewMessage += `L'image ci-jointe vous montre exactement l'aperçu de votre facture.\n\n`;
      previewMessage += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}`;

      // Préparer les données pour EmailJS
      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: 'MYCONFORT',
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        subject: `Aperçu facture MYCONFORT n°${invoice.invoiceNumber}`,
        message: previewMessage,
        image_data: imageDataUrl,
        advisor_name: invoice.advisorName || 'MYCONFORT'
      };

      // Envoyer via EmailJS avec votre API Key
      console.log('📧 Envoi aperçu via EmailJS avec API Key:', EMAILJS_CONFIG.USER_ID);
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      console.log('✅ Aperçu envoyé avec succès via EmailJS:', response);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'aperçu via EmailJS:', error);
      throw new Error(`Erreur d'envoi d'aperçu: ${error.message}`);
    }
  }

  /**
   * Test de connexion avec EmailJS
   */
  static async testConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    try {
      console.log('🧪 TEST DE CONNEXION EMAILJS');
      console.log('🔑 API Key utilisée:', EMAILJS_CONFIG.USER_ID);
      
      if (!this.isConfigured()) {
        return {
          success: false,
          message: '❌ Configuration incomplète. Il vous manque le Service ID et/ou le Template ID. Votre API Key est déjà configurée !'
        };
      }
      
      const startTime = Date.now();
      
      // Préparer les données de test
      const testParams = {
        to_email: 'test@myconfort.com', // Email de test
        to_name: 'Test MYCONFORT',
        from_name: 'MYCONFORT',
        subject: 'Test de connexion EmailJS',
        message: 'Ceci est un test de connexion EmailJS depuis MYCONFORT.',
        invoice_number: 'TEST-001',
        invoice_date: new Date().toLocaleDateString('fr-FR'),
        total_amount: '100,00 €'
      };

      // Envoyer un test via EmailJS avec votre API Key
      console.log('📧 Test avec Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('📧 Test avec Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        testParams,
        EMAILJS_CONFIG.USER_ID
      );

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: `✅ Connexion EmailJS réussie ! Service prêt pour l'envoi d'emails.`,
        responseTime
      };
    } catch (error: any) {
      console.error('❌ Erreur test connexion EmailJS:', error);
      
      let errorMessage = '❌ Erreur de connexion EmailJS: ';
      
      if (error.status === 401 || error.status === 403) {
        errorMessage += 'Identifiants incorrects ou non autorisés. Vérifiez votre Service ID et Template ID.';
      } else if (error.status === 400) {
        errorMessage += 'Paramètres invalides. Vérifiez votre configuration de template.';
      } else if (error.status >= 500) {
        errorMessage += 'Erreur serveur EmailJS. Réessayez dans quelques minutes.';
      } else {
        errorMessage += error.text || error.message || 'Erreur inconnue';
      }

      return {
        success: false,
        message: errorMessage
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
   * Obtient les informations de configuration
   */
  static getConfigInfo(): { configured: boolean; status: string; apiKey: string } {
    updateConfigStatus();
    return {
      configured: this.isConfigured(),
      status: this.isConfigured() 
        ? '✅ EmailJS configuré et prêt à l\'emploi' 
        : '⚠️ Il vous manque le Service ID et/ou le Template ID',
      apiKey: EMAILJS_CONFIG.USER_ID
    };
  }

  /**
   * Valide les données avant envoi
   */
  static validateEmailData(invoice: Invoice): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    if (!this.isConfigured()) {
      errors.push('Configuration EmailJS incomplète (Service ID et/ou Template ID manquants)');
    }

    if (!invoice.client.email) {
      errors.push('Email du client requis');
    }

    if (!invoice.client.name) {
      errors.push('Nom du client requis');
    }

    if (invoice.products.length === 0) {
      errors.push('Au moins un produit requis');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Met à jour la configuration EmailJS
   */
  static updateConfig(serviceId: string, templateId: string, userId?: string): void {
    EMAILJS_CONFIG.SERVICE_ID = serviceId;
    EMAILJS_CONFIG.TEMPLATE_ID = templateId;
    
    // Garder votre API Key si userId n'est pas fourni
    if (userId) {
      EMAILJS_CONFIG.USER_ID = userId;
    }
    
    // Sauvegarder dans localStorage
    localStorage.setItem('emailjs_service_id', serviceId);
    localStorage.setItem('emailjs_template_id', templateId);
    
    updateConfigStatus();
  }

  /**
   * Obtient la configuration actuelle
   */
  static getCurrentConfig(): { serviceId: string; templateId: string; userId: string } {
    return {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID,
      userId: EMAILJS_CONFIG.USER_ID
    };
  }
}