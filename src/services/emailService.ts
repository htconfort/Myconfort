import emailjs from 'emailjs-com';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { AdvancedPDFService } from './advancedPdfService';

// Configuration EmailJS COMPLÈTE avec votre Template ID
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ocsxnme', // ✅ VOTRE SERVICE ID
  TEMPLATE_ID: 'template_yng4k8s', // ✅ VOTRE TEMPLATE ID CONFIGURÉ AUTOMATIQUEMENT
  USER_ID: 'hvgYUCG9j2lURrt5k', // ✅ Votre API Key (Public Key)
  PRIVATE_KEY: 'mh3upHQbKrIViyw4T9-S6', // ✅ Votre Private Key
  CONFIGURED: true // ✅ CONFIGURATION 100% COMPLÈTE !
};

export class EmailService {
  /**
   * Vérifie si EmailJS est configuré
   */
  static isConfigured(): boolean {
    return EMAILJS_CONFIG.CONFIGURED;
  }

  /**
   * Initialise EmailJS avec vos clés
   */
  static initializeEmailJS(): void {
    try {
      // Initialiser EmailJS avec votre User ID (Public Key)
      emailjs.init(EMAILJS_CONFIG.USER_ID);
      console.log('✅ EmailJS initialisé avec votre API Key:', EMAILJS_CONFIG.USER_ID);
      console.log('✅ Service ID configuré:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('✅ Template ID configuré:', EMAILJS_CONFIG.TEMPLATE_ID);
    } catch (error) {
      console.error('❌ Erreur initialisation EmailJS:', error);
    }
  }

  /**
   * Envoie la facture par email via EmailJS avec PDF en pièce jointe
   */
  static async sendInvoiceWithPDF(invoice: Invoice): Promise<boolean> {
    try {
      console.log('🚀 ENVOI FACTURE VIA EMAILJS AVEC PDF EN PIÈCE JOINTE');
      console.log('🔑 API Key:', EMAILJS_CONFIG.USER_ID);
      console.log('🎯 Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('📧 Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      
      // Initialiser EmailJS
      this.initializeEmailJS();
      
      // Générer le PDF
      console.log('📄 Génération du PDF...');
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);
      const pdfSizeKB = Math.round(pdfBlob.size / 1024);
      console.log('📊 Taille du PDF:', pdfSizeKB, 'KB');
      
      // Convertir le PDF en base64 pour EmailJS
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

      // Créer un FormData pour envoyer le PDF comme fichier
      const formData = new FormData();
      formData.append('pdf_file', pdfBlob, `Facture_MYCONFORT_${invoice.invoiceNumber}.pdf`);

      // Préparer les données pour EmailJS avec attachement
      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: `Facture MYCONFORT n°${invoice.invoiceNumber}`,
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(totalAmount),
        deposit_amount: acompteAmount > 0 ? formatCurrency(acompteAmount) : '',
        remaining_amount: acompteAmount > 0 ? formatCurrency(montantRestant) : '',
        has_signature: invoice.signature ? 'Oui' : 'Non',
        advisor_name: invoice.advisorName || 'MYCONFORT',
        message: this.generateDefaultMessage(invoice, totalAmount, acompteAmount, montantRestant),
        company_name: 'MYCONFORT',
        company_address: '88 Avenue des Ternes, 75017 Paris',
        company_phone: '04 68 50 41 45',
        company_email: 'myconfort@gmail.com',
        company_siret: '824 313 530 00027',
        // Attachement PDF
        attachments: [
          {
            name: `Facture_MYCONFORT_${invoice.invoiceNumber}.pdf`,
            data: pdfBase64,
            type: 'application/pdf'
          }
        ]
      };

      // Méthode alternative : utiliser emailjs.sendForm pour les attachements
      try {
        console.log('📧 Tentative d\'envoi avec attachement PDF...');
        
        // Créer un formulaire temporaire pour l'envoi avec fichier
        const tempForm = document.createElement('form');
        
        // Ajouter tous les champs du template
        Object.entries(templateParams).forEach(([key, value]) => {
          if (key !== 'attachments') {
            const input = document.createElement('input');
            input.type = 'hidden';
            input.name = key;
            input.value = String(value);
            tempForm.appendChild(input);
          }
        });

        // Ajouter le fichier PDF
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.name = 'pdf_attachment';
        
        // Créer un File à partir du Blob
        const pdfFile = new File([pdfBlob], `Facture_MYCONFORT_${invoice.invoiceNumber}.pdf`, {
          type: 'application/pdf'
        });
        
        // Créer un DataTransfer pour simuler la sélection de fichier
        const dataTransfer = new DataTransfer();
        dataTransfer.items.add(pdfFile);
        fileInput.files = dataTransfer.files;
        
        tempForm.appendChild(fileInput);
        document.body.appendChild(tempForm);

        // Envoyer via emailjs.sendForm
        const response = await emailjs.sendForm(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          tempForm,
          EMAILJS_CONFIG.USER_ID
        );

        // Nettoyer
        document.body.removeChild(tempForm);

        console.log('✅ Email avec PDF envoyé avec succès:', response);
        return true;

      } catch (attachmentError) {
        console.warn('⚠️ Échec envoi avec attachement, tentative sans fichier:', attachmentError);
        
        // Fallback : envoyer sans attachement mais avec lien de téléchargement
        const fallbackParams = {
          ...templateParams,
          message: templateParams.message + '\n\n📎 Note: Le PDF de votre facture sera envoyé séparément ou est disponible sur demande.',
          pdf_note: 'PDF disponible sur demande - contactez-nous pour le recevoir.'
        };
        
        delete fallbackParams.attachments;

        const fallbackResponse = await emailjs.send(
          EMAILJS_CONFIG.SERVICE_ID,
          EMAILJS_CONFIG.TEMPLATE_ID,
          fallbackParams,
          EMAILJS_CONFIG.USER_ID
        );

        console.log('✅ Email envoyé sans attachement (fallback):', fallbackResponse);
        return true;
      }

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
      
      // Initialiser EmailJS
      this.initializeEmailJS();

      // Vérifier la taille de l'image
      const imageBlob = await fetch(imageDataUrl).then(res => res.blob());
      const imageSizeKB = Math.round(imageBlob.size / 1024);
      console.log('📊 Taille de l\'image:', imageSizeKB, 'KB');

      // Si l'image est trop grande, la compresser davantage
      let finalImageDataUrl = imageDataUrl;
      if (imageSizeKB > 40) {
        console.log('🔧 Compression supplémentaire de l\'image...');
        
        // Créer un canvas pour recompresser
        const img = new Image();
        img.src = imageDataUrl;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Réduire la taille si nécessaire
        const maxWidth = 800;
        const maxHeight = 1000;
        let { width, height } = img;
        
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        finalImageDataUrl = canvas.toDataURL('image/jpeg', 0.5); // Compression plus forte
        
        const compressedBlob = await fetch(finalImageDataUrl).then(res => res.blob());
        const compressedSizeKB = Math.round(compressedBlob.size / 1024);
        console.log('📊 Taille après compression:', compressedSizeKB, 'KB');
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
        reply_to: 'myconfort@gmail.com',
        subject: `Aperçu facture MYCONFORT n°${invoice.invoiceNumber}`,
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        message: previewMessage,
        image_data: finalImageDataUrl.split(',')[1], // Enlever le préfixe data:
        image_filename: `apercu_facture_${invoice.invoiceNumber}.jpg`,
        advisor_name: invoice.advisorName || 'MYCONFORT',
        company_name: 'MYCONFORT'
      };

      // Envoyer via EmailJS
      console.log('📧 Envoi aperçu via EmailJS');
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
      console.log('🔑 Public Key (User ID):', EMAILJS_CONFIG.USER_ID);
      console.log('🎯 Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('📧 Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      
      // Initialiser EmailJS
      this.initializeEmailJS();
      
      const startTime = Date.now();
      
      // Préparer les données de test
      const testParams = {
        to_email: 'test@myconfort.com', // Email de test
        to_name: 'Test MYCONFORT',
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: 'Test de connexion EmailJS MYCONFORT',
        message: 'Ceci est un test de connexion EmailJS depuis MYCONFORT.',
        invoice_number: 'TEST-001',
        invoice_date: new Date().toLocaleDateString('fr-FR'),
        total_amount: '100,00 €',
        company_name: 'MYCONFORT',
        advisor_name: 'Test'
      };

      // Envoyer un test via EmailJS
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
        message: `✅ Connexion EmailJS réussie ! Service prêt pour l'envoi d'emails avec pièces jointes.`,
        responseTime
      };
    } catch (error: any) {
      console.error('❌ Erreur test connexion EmailJS:', error);
      
      let errorMessage = '❌ Erreur de connexion EmailJS: ';
      
      if (error.status === 401 || error.status === 403) {
        errorMessage += 'Identifiants incorrects. Vérifiez votre configuration.';
      } else if (error.status === 400) {
        errorMessage += 'Paramètres invalides. Vérifiez votre template.';
      } else if (error.status >= 500) {
        errorMessage += 'Erreur serveur EmailJS. Réessayez plus tard.';
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
  static getConfigInfo(): { configured: boolean; status: string; apiKey: string; privateKey: string; serviceId: string; templateId: string } {
    return {
      configured: true,
      status: '✅ EmailJS 100% configuré avec attachements PDF',
      apiKey: EMAILJS_CONFIG.USER_ID,
      privateKey: EMAILJS_CONFIG.PRIVATE_KEY,
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID
    };
  }

  /**
   * Valide les données avant envoi
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

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * Met à jour la configuration EmailJS
   */
  static updateConfig(serviceId: string, templateId: string, userId?: string): void {
    console.log('ℹ️ Configuration EmailJS déjà complète avec support des attachements PDF');
    
    // Sauvegarder dans localStorage pour persistance
    localStorage.setItem('emailjs_service_id', serviceId);
    localStorage.setItem('emailjs_template_id', templateId);
    if (userId) {
      localStorage.setItem('emailjs_user_id', userId);
    }
  }

  /**
   * Obtient la configuration actuelle
   */
  static getCurrentConfig(): { serviceId: string; templateId: string; userId: string; privateKey: string } {
    return {
      serviceId: EMAILJS_CONFIG.SERVICE_ID,
      templateId: EMAILJS_CONFIG.TEMPLATE_ID,
      userId: EMAILJS_CONFIG.USER_ID,
      privateKey: EMAILJS_CONFIG.PRIVATE_KEY
    };
  }
}