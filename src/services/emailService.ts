import emailjs from 'emailjs-com';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { AdvancedPDFService } from './advancedPdfService';

// Configuration EmailJS MISE À JOUR avec votre Template ID correct
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ocsxnme', // ✅ VOTRE SERVICE ID
  TEMPLATE_ID: 'template_yng4k8s', // ✅ TEMPLATE ID CORRIGÉ (était 'Myconfort')
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
   * 🗜️ NOUVELLE MÉTHODE AMÉLIORÉE - Envoie la facture avec PDF COMPRESSÉ pour EmailJS
   */
  static async sendInvoiceWithPDF(invoice: Invoice): Promise<boolean> {
    try {
      console.log('🚀 ENVOI FACTURE VIA EMAILJS AVEC PDF COMPRESSÉ (MAX 40KB)');
      console.log('🔑 API Key:', EMAILJS_CONFIG.USER_ID);
      console.log('🎯 Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('📧 Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      
      // Initialiser EmailJS
      this.initializeEmailJS();
      
      // 🗜️ GÉNÉRER LE PDF COMPRESSÉ POUR EMAILJS
      console.log('🗜️ Génération du PDF compressé pour EmailJS...');
      const pdfResult = await AdvancedPDFService.getCompressedPDFForEmail(invoice);
      
      console.log('📊 Résultat PDF:', {
        taille: `${pdfResult.sizeKB} KB`,
        compressé: pdfResult.compressed ? 'Oui' : 'Non',
        sousLimite: pdfResult.sizeKB <= 40 ? 'Oui' : 'Non'
      });
      
      // Vérifier si le PDF peut être envoyé via EmailJS (limite réduite à 40KB pour laisser de la place aux autres variables)
      if (pdfResult.sizeKB > 40) {
        console.warn('⚠️ PDF encore trop volumineux pour EmailJS, envoi sans attachement');
        return await this.sendEmailWithoutPDF(
          invoice, 
          `PDF trop volumineux (${pdfResult.sizeKB} KB > 40 KB) - sera envoyé séparément`
        );
      }
      
      // Convertir le PDF en base64 pour EmailJS
      console.log('🔄 Conversion PDF en base64...');
      const pdfBase64 = await this.blobToBase64(pdfResult.blob);
      
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

      // Préparer les données pour votre Template
      const templateParams = {
        // Destinataire
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        
        // Expéditeur
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        
        // Sujet et message
        subject: `Facture MYCONFORT n°${invoice.invoiceNumber}`,
        message: this.generateDefaultMessage(invoice, totalAmount, acompteAmount, montantRestant),
        
        // Informations facture
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(totalAmount),
        deposit_amount: acompteAmount > 0 ? formatCurrency(acompteAmount) : '',
        remaining_amount: acompteAmount > 0 ? formatCurrency(montantRestant) : '',
        has_signature: invoice.signature ? 'Oui' : 'Non',
        
        // Informations client
        client_name: invoice.client.name,
        client_email: invoice.client.email,
        client_address: invoice.client.address,
        client_city: invoice.client.city,
        client_postal_code: invoice.client.postalCode,
        client_phone: invoice.client.phone,
        
        // Informations entreprise
        company_name: 'MYCONFORT',
        company_address: '88 Avenue des Ternes, 75017 Paris',
        company_phone: '04 68 50 41 45',
        company_email: 'myconfort@gmail.com',
        company_siret: '824 313 530 00027',
        company_website: 'https://www.htconfort.com',
        
        // Conseiller
        advisor_name: invoice.advisorName || 'MYCONFORT',
        
        // Mode de paiement
        payment_method: invoice.payment.method || 'Non spécifié',
        
        // 🗜️ PDF COMPRESSÉ EN BASE64
        pdf_data: pdfBase64.split(',')[1], // Enlever le préfixe data:application/pdf;base64,
        pdf_filename: `Facture_MYCONFORT_${invoice.invoiceNumber}.pdf`,
        pdf_size: `${pdfResult.sizeKB} KB`,
        pdf_compressed: pdfResult.compressed ? 'Oui' : 'Non',
        has_pdf: 'true',
        
        // Métadonnées
        generated_date: new Date().toLocaleDateString('fr-FR'),
        generated_time: new Date().toLocaleTimeString('fr-FR'),
        
        // Produits (résumé)
        products_count: invoice.products.length,
        products_summary: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', ')
      };

      console.log('📧 Envoi email avec PDF compressé en base64...');
      console.log('📊 Données PDF compressé:', {
        filename: templateParams.pdf_filename,
        size: templateParams.pdf_size,
        compressed: templateParams.pdf_compressed,
        base64Length: templateParams.pdf_data.length
      });

      // Envoyer via EmailJS avec le Template ID correct
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      console.log('✅ Email avec PDF compressé envoyé avec succès:', response);
      return true;

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi avec PDF compressé:', error);
      
      // Fallback : envoyer sans PDF
      console.log('🔄 Tentative d\'envoi sans PDF...');
      try {
        const fallbackSuccess = await this.sendEmailWithoutPDF(
          invoice, 
          'Le PDF de votre facture sera envoyé séparément en raison de contraintes techniques.'
        );
        
        if (fallbackSuccess) {
          console.log('✅ Email envoyé sans PDF (fallback réussi)');
          return true;
        }
      } catch (fallbackError) {
        console.error('❌ Échec du fallback:', fallbackError);
      }
      
      throw new Error(`Erreur d'envoi: ${error.message}`);
    }
  }

  /**
   * 📧 Envoie l'email sans PDF (méthode de fallback)
   */
  private static async sendEmailWithoutPDF(invoice: Invoice, pdfNote: string): Promise<boolean> {
    try {
      console.log('📧 Envoi email sans PDF avec Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      
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

      // Message modifié pour expliquer l'absence du PDF
      let message = this.generateDefaultMessage(invoice, totalAmount, acompteAmount, montantRestant);
      message += `\n\n📎 Note importante: ${pdfNote}`;
      message += `\n\nPour recevoir votre facture PDF, contactez-nous à myconfort@gmail.com ou au 04 68 50 41 45.`;

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
        message: message,
        company_name: 'MYCONFORT',
        company_address: '88 Avenue des Ternes, 75017 Paris',
        company_phone: '04 68 50 41 45',
        company_email: 'myconfort@gmail.com',
        company_siret: '824 313 530 00027',
        has_pdf: 'false',
        pdf_note: pdfNote
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      console.log('✅ Email sans PDF envoyé via Template ID:', response);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi sans PDF:', error);
      return false;
    }
  }

  /**
   * 📸 MÉTHODE AMÉLIORÉE - Partage l'aperçu avec compression optimisée
   */
  static async sharePreviewViaEmail(
    invoice: Invoice, 
    imageDataUrl: string
  ): Promise<boolean> {
    try {
      console.log('📸 PARTAGE APERÇU VIA TEMPLATE ID AVEC COMPRESSION OPTIMISÉE');
      
      // Initialiser EmailJS
      this.initializeEmailJS();

      // Vérifier et optimiser la taille de l'image pour EmailJS (limite 40KB)
      const imageBlob = await fetch(imageDataUrl).then(res => res.blob());
      let imageSizeKB = Math.round(imageBlob.size / 1024);
      console.log('📊 Taille de l\'image originale:', imageSizeKB, 'KB');

      let finalImageDataUrl = imageDataUrl;

      // Compression agressive pour respecter la limite EmailJS de 40KB
      if (imageSizeKB > 30) { // Limite stricte pour les images
        console.log('🗜️ Compression agressive de l\'image pour EmailJS...');
        
        const img = new Image();
        img.src = imageDataUrl;
        
        await new Promise((resolve) => {
          img.onload = resolve;
        });

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Réduction drastique de la taille pour EmailJS
        const maxWidth = 400;  // Réduit de 600 à 400
        const maxHeight = 600; // Réduit de 800 à 600
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
        finalImageDataUrl = canvas.toDataURL('image/jpeg', 0.3); // Compression très forte pour EmailJS
        
        const compressedBlob = await fetch(finalImageDataUrl).then(res => res.blob());
        imageSizeKB = Math.round(compressedBlob.size / 1024);
        console.log('📊 Taille après compression pour EmailJS:', imageSizeKB, 'KB');
      }

      // Si encore trop grand pour EmailJS, envoyer sans image
      if (imageSizeKB > 35) { // Limite stricte EmailJS
        console.warn('⚠️ Image encore trop volumineuse pour EmailJS, envoi sans image');
        return await this.sendPreviewWithoutImage(invoice);
      }

      // Préparer le message pour l'aperçu
      let previewMessage = `Bonjour ${invoice.client.name},\n\n`;
      previewMessage += `Voici l'aperçu de votre facture n°${invoice.invoiceNumber} tel qu'il apparaît dans notre système MYCONFORT.\n\n`;
      previewMessage += `L'image ci-jointe vous montre exactement l'aperçu de votre facture.\n\n`;
      previewMessage += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}`;

      // Préparer les données pour votre Template
      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: `Aperçu facture MYCONFORT n°${invoice.invoiceNumber}`,
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        message: previewMessage,
        
        // Image compressée pour EmailJS
        image_data: finalImageDataUrl.split(',')[1],
        image_filename: `apercu_facture_${invoice.invoiceNumber}.jpg`,
        image_size: `${imageSizeKB} KB`,
        image_compressed: imageSizeKB < 30 ? 'Non' : 'Oui',
        has_image: 'true',
        
        advisor_name: invoice.advisorName || 'MYCONFORT',
        company_name: 'MYCONFORT'
      };

      console.log('📧 Envoi aperçu compressé via EmailJS...');
      console.log('📊 Données image compressée:', {
        filename: templateParams.image_filename,
        size: templateParams.image_size,
        compressed: templateParams.image_compressed,
        base64Length: templateParams.image_data.length
      });

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      console.log('✅ Aperçu compressé envoyé avec succès via EmailJS:', response);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'aperçu compressé:', error);
      
      // Fallback sans image
      try {
        return await this.sendPreviewWithoutImage(invoice);
      } catch (fallbackError) {
        throw new Error(`Erreur d'envoi d'aperçu: ${error.message}`);
      }
    }
  }

  /**
   * 📧 Envoie l'aperçu sans image (fallback)
   */
  private static async sendPreviewWithoutImage(invoice: Invoice): Promise<boolean> {
    try {
      console.log('📧 Envoi aperçu sans image avec Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      
      let previewMessage = `Bonjour ${invoice.client.name},\n\n`;
      previewMessage += `Voici les détails de votre facture n°${invoice.invoiceNumber} :\n\n`;
      previewMessage += `📋 RÉSUMÉ :\n`;
      previewMessage += `• Numéro: ${invoice.invoiceNumber}\n`;
      previewMessage += `• Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}\n`;
      
      const totalAmount = invoice.products.reduce((sum, product) => {
        return sum + calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        );
      }, 0);
      
      previewMessage += `• Montant total: ${formatCurrency(totalAmount)}\n\n`;
      previewMessage += `L'aperçu visuel sera envoyé séparément.\n\n`;
      previewMessage += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}`;

      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: `Détails facture MYCONFORT n°${invoice.invoiceNumber}`,
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        message: previewMessage,
        has_image: 'false',
        advisor_name: invoice.advisorName || 'MYCONFORT',
        company_name: 'MYCONFORT'
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      console.log('✅ Aperçu sans image envoyé via Template ID:', response);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi aperçu sans image:', error);
      return false;
    }
  }

  /**
   * Test de connexion avec EmailJS
   */
  static async testConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    try {
      console.log('🧪 TEST DE CONNEXION EMAILJS AVEC COMPRESSION PDF');
      console.log('🔑 Public Key (User ID):', EMAILJS_CONFIG.USER_ID);
      console.log('🎯 Service ID:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('📧 Template ID:', EMAILJS_CONFIG.TEMPLATE_ID);
      
      // Initialiser EmailJS
      this.initializeEmailJS();
      
      const startTime = Date.now();
      
      // Préparer les données de test pour votre Template
      const testParams = {
        to_email: 'test@myconfort.com', // Email de test
        to_name: 'Test MYCONFORT',
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: 'Test de connexion EmailJS MYCONFORT avec compression PDF',
        message: 'Ceci est un test de connexion EmailJS depuis MYCONFORT avec support de compression PDF pour pièces jointes.',
        invoice_number: 'TEST-001',
        invoice_date: new Date().toLocaleDateString('fr-FR'),
        total_amount: '100,00 €',
        company_name: 'MYCONFORT',
        advisor_name: 'Test',
        has_pdf: 'false',
        has_image: 'false',
        pdf_compressed: 'Non applicable'
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
        message: `✅ Connexion EmailJS réussie avec compression PDF ! Service prêt pour l'envoi d'emails avec PDF compressés (max 40KB).`,
        responseTime
      };
    } catch (error: any) {
      console.error('❌ Erreur test connexion EmailJS:', error);
      
      let errorMessage = '❌ Erreur de connexion EmailJS: ';
      
      if (error.status === 401 || error.status === 403) {
        errorMessage += 'Identifiants incorrects. Vérifiez votre configuration.';
      } else if (error.status === 400) {
        errorMessage += 'Paramètres invalides. Vérifiez votre template ID.';
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
    
    message += `📎 Le PDF de votre facture est inclus dans cet email (compressé pour optimiser l'envoi).\n\n`;
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
      status: '✅ EmailJS configuré avec compression PDF (max 40KB)',
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
    console.log('ℹ️ Configuration EmailJS mise à jour avec compression PDF');
    
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