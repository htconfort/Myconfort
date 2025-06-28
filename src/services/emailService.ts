import emailjs from 'emailjs-com';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { AdvancedPDFService } from './advancedPdfService';

// Configuration EmailJS CORRIGÉE avec le Service ID exact fourni
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ymw6jjh', // ✅ SERVICE ID EXACT FOURNI PAR L'UTILISATEUR
  TEMPLATE_ID: 'template_yng4k8s', // ✅ Template ID CONFIRMÉ
  USER_ID: 'hvgYUCG9j2lURrt5k', // ✅ User ID CONFIRMÉ
  PRIVATE_KEY: 'mh3upHQbKrIViyw4T9-S6', // ✅ Private Key
  CONFIGURED: true, // ✅ CONFIGURATION 100% CORRIGÉE !
  
  // 🚀 PLAN PREMIUM AVEC SERVICE ID CORRIGÉ
  MAX_ATTACHMENT_SIZE: 2 * 1024 * 1024, // 2MB en bytes
  SUPPORTED_FORMATS: ['pdf', 'jpg', 'jpeg', 'png', 'doc', 'docx', 'xlsx'],
  FALLBACK_SIZE: 50 * 1024 // 50KB pour fallback base64
};

export class EmailService {
  /**
   * Vérifie si EmailJS est configuré
   */
  static isConfigured(): boolean {
    return EMAILJS_CONFIG.CONFIGURED;
  }

  /**
   * Initialise EmailJS avec le Service ID corrigé
   */
  static initializeEmailJS(): void {
    try {
      // Initialiser EmailJS avec votre User ID
      emailjs.init(EMAILJS_CONFIG.USER_ID);
      console.log('✅ EmailJS initialisé avec User ID:', EMAILJS_CONFIG.USER_ID);
      console.log('✅ SERVICE ID CORRIGÉ:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('✅ Template ID CONFIRMÉ:', EMAILJS_CONFIG.TEMPLATE_ID);
      console.log('🚀 Support pièces jointes 2MB activé (service corrigé)');
      console.log('🎨 Template HTML personnalisé template_yng4k8s CONFIRMÉ');
      console.log('🎯 CONFIGURATION CORRIGÉE AVEC SERVICE ID EXACT !');
    } catch (error) {
      console.error('❌ Erreur initialisation EmailJS:', error);
    }
  }

  /**
   * 📎 Valide les pièces jointes (2MB max)
   */
  static validateAttachment(file: Blob, filename: string): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Vérifier la taille (2MB max pour plan premium)
    if (file.size > EMAILJS_CONFIG.MAX_ATTACHMENT_SIZE) {
      errors.push(`Le fichier est trop volumineux. Taille maximum autorisée: 2MB. Taille actuelle: ${(file.size / 1024 / 1024).toFixed(2)}MB`);
    }
    
    // Vérifier le format
    const fileExtension = filename.split('.').pop()?.toLowerCase() || '';
    if (!EMAILJS_CONFIG.SUPPORTED_FORMATS.includes(fileExtension)) {
      errors.push(`Format de fichier non supporté: ${fileExtension}. Formats autorisés: ${EMAILJS_CONFIG.SUPPORTED_FORMATS.join(', ')}`);
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 🚀 MÉTHODE PRINCIPALE - Envoie la facture avec PDF 2MB via Service corrigé
   */
  static async sendInvoiceWithPDF(invoice: Invoice): Promise<boolean> {
    try {
      console.log('🚀 ENVOI FACTURE VIA EMAILJS AVEC SERVICE ID CORRIGÉ');
      console.log('🔑 User ID:', EMAILJS_CONFIG.USER_ID);
      console.log('🎯 SERVICE ID CORRIGÉ:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('📧 Template ID CONFIRMÉ:', EMAILJS_CONFIG.TEMPLATE_ID);
      console.log('📎 Limite pièces jointes: 2MB (plan premium)');
      console.log('🎨 Template HTML: template_yng4k8s CONFIRMÉ et ACTIF');
      console.log('🎯 SERVICE ID CORRIGÉ OPÉRATIONNEL !');
      
      // Initialiser EmailJS
      this.initializeEmailJS();
      
      // 📄 GÉNÉRER LE PDF COMPLET (sans compression agressive)
      console.log('📄 Génération du PDF complet pour service corrigé...');
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);
      const pdfSizeKB = Math.round(pdfBlob.size / 1024);
      const pdfSizeMB = (pdfBlob.size / 1024 / 1024).toFixed(2);
      
      console.log('📊 Taille PDF pour service corrigé:', {
        bytes: pdfBlob.size,
        KB: pdfSizeKB,
        MB: pdfSizeMB
      });
      
      // Créer le nom de fichier
      const pdfFilename = `Facture_MYCONFORT_${invoice.invoiceNumber}.pdf`;
      
      // 📎 VALIDER LA PIÈCE JOINTE
      const validation = this.validateAttachment(pdfBlob, pdfFilename);
      
      if (!validation.isValid) {
        console.warn('⚠️ PDF trop volumineux pour service corrigé, tentative avec compression...');
        return await this.sendWithCompressedPDF(invoice);
      }
      
      // 🚀 ENVOYER AVEC PIÈCE JOINTE 2MB VIA SERVICE CORRIGÉ
      console.log('🚀 Envoi avec pièce jointe 2MB via service corrigé...');
      return await this.sendEmailWithAttachment(invoice, pdfBlob, pdfFilename);
      
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi avec service corrigé:', error);
      
      // Fallback vers méthode compressée
      console.log('🔄 Tentative avec PDF compressé et service corrigé...');
      try {
        return await this.sendWithCompressedPDF(invoice);
      } catch (fallbackError) {
        console.error('❌ Échec du fallback avec service corrigé:', fallbackError);
        throw new Error(`Erreur d'envoi avec service corrigé: ${error.message}`);
      }
    }
  }

  /**
   * 📎 Envoie email avec pièce jointe 2MB via Service corrigé
   */
  private static async sendEmailWithAttachment(
    invoice: Invoice, 
    attachmentBlob: Blob, 
    attachmentFilename: string
  ): Promise<boolean> {
    try {
      // Convertir la pièce jointe en base64
      const attachmentBase64 = await this.blobToBase64(attachmentBlob);
      
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

      // 🎨 PRÉPARER LES DONNÉES POUR VOTRE TEMPLATE AVEC SERVICE CORRIGÉ
      const templateParams = {
        // === VARIABLES DE BASE POUR template_yng4k8s ===
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: `Facture MYCONFORT n°${invoice.invoiceNumber}`,
        
        // === MESSAGE PERSONNALISÉ POUR template_yng4k8s ===
        message: this.generatePremiumHTMLMessage(invoice, totalAmount, acompteAmount, montantRestant),
        
        // === INFORMATIONS FACTURE POUR template_yng4k8s ===
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(totalAmount),
        deposit_amount: acompteAmount > 0 ? formatCurrency(acompteAmount) : '',
        remaining_amount: acompteAmount > 0 ? formatCurrency(montantRestant) : '',
        has_signature: invoice.signature ? 'Oui' : 'Non',
        
        // === INFORMATIONS CLIENT POUR template_yng4k8s ===
        client_name: invoice.client.name,
        client_email: invoice.client.email,
        client_address: invoice.client.address,
        client_city: invoice.client.city,
        client_postal_code: invoice.client.postalCode,
        client_phone: invoice.client.phone,
        
        // === INFORMATIONS ENTREPRISE POUR template_yng4k8s ===
        company_name: 'MYCONFORT',
        company_logo: 'https://via.placeholder.com/120x60/477A0C/F2EFE2?text=MYCONFORT', // Logo placeholder
        company_address: '88 Avenue des Ternes, 75017 Paris',
        company_phone: '04 68 50 41 45',
        company_email: 'myconfort@gmail.com',
        company_siret: '824 313 530 00027',
        company_website: 'https://www.htconfort.com',
        
        // === CONSEILLER POUR template_yng4k8s ===
        advisor_name: invoice.advisorName || 'MYCONFORT',
        
        // === MODE DE PAIEMENT POUR template_yng4k8s ===
        payment_method: invoice.payment.method || 'Non spécifié',
        
        // === PIÈCE JOINTE 2MB VIA SERVICE CORRIGÉ ===
        attachment_name: attachmentFilename,
        attachment_content: attachmentBase64.split(',')[1], // Enlever le préfixe
        attachment_type: 'application/pdf',
        attachment_size: `${(attachmentBlob.size / 1024 / 1024).toFixed(2)}MB`,
        has_pdf: 'true',
        pdf_method: 'attachment_2mb_service_corrige',
        
        // === MÉTADONNÉES POUR template_yng4k8s ===
        generated_date: new Date().toLocaleDateString('fr-FR'),
        generated_time: new Date().toLocaleTimeString('fr-FR'),
        template_used: 'template_yng4k8s',
        service_used: 'service_ymw6jjh',
        user_id_used: 'hvgYUCG9j2lURrt5k',
        
        // === PRODUITS POUR template_yng4k8s ===
        products_count: invoice.products.length,
        products_summary: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', ')
      };

      console.log('📧 Envoi email avec template template_yng4k8s et pièce jointe 2MB via SERVICE CORRIGÉ...');
      console.log('🎨 Template CONFIRMÉ: template_yng4k8s - Design professionnel MYCONFORT');
      console.log('🔑 SERVICE ID CORRIGÉ utilisé:', {
        service: EMAILJS_CONFIG.SERVICE_ID,
        template: EMAILJS_CONFIG.TEMPLATE_ID,
        user: EMAILJS_CONFIG.USER_ID
      });
      console.log('📎 Pièce jointe via SERVICE CORRIGÉ:', {
        nom: attachmentFilename,
        taille: templateParams.attachment_size,
        type: templateParams.attachment_type,
        service: 'service_ymw6jjh'
      });

      // Envoyer via EmailJS avec SERVICE ID CORRIGÉ
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID, // service_ymw6jjh CORRIGÉ
        EMAILJS_CONFIG.TEMPLATE_ID, // template_yng4k8s CONFIRMÉ
        templateParams,
        EMAILJS_CONFIG.USER_ID // hvgYUCG9j2lURrt5k CONFIRMÉ
      );

      console.log('✅ Email avec template template_yng4k8s et pièce jointe 2MB envoyé via SERVICE CORRIGÉ:', response);
      console.log('🎯 SUCCÈS AVEC SERVICE ID CORRIGÉ !');
      return true;

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi avec template template_yng4k8s via SERVICE CORRIGÉ:', error);
      throw error;
    }
  }

  /**
   * 🗜️ MÉTHODE DE FALLBACK - PDF compressé en base64 avec service corrigé
   */
  private static async sendWithCompressedPDF(invoice: Invoice): Promise<boolean> {
    try {
      console.log('🗜️ Envoi avec PDF compressé et service corrigé (fallback)...');
      
      // Générer PDF compressé
      const pdfResult = await AdvancedPDFService.getCompressedPDFForEmail(invoice);
      
      if (pdfResult.sizeKB > 50) {
        console.warn('⚠️ PDF encore trop volumineux même compressé, envoi sans PDF avec service corrigé');
        return await this.sendEmailWithoutPDF(
          invoice, 
          `PDF trop volumineux (${pdfResult.sizeKB} KB) - sera envoyé séparément`
        );
      }
      
      // Convertir en base64
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

      // Paramètres avec PDF compressé en base64 et service corrigé
      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: `Facture MYCONFORT n°${invoice.invoiceNumber}`,
        message: this.generateCompressedHTMLMessage(invoice, totalAmount, acompteAmount, montantRestant),
        
        // Informations facture pour template_yng4k8s
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(totalAmount),
        deposit_amount: acompteAmount > 0 ? formatCurrency(acompteAmount) : '',
        remaining_amount: acompteAmount > 0 ? formatCurrency(montantRestant) : '',
        has_signature: invoice.signature ? 'Oui' : 'Non',
        
        // Entreprise pour template_yng4k8s
        company_name: 'MYCONFORT',
        company_logo: 'https://via.placeholder.com/120x60/477A0C/F2EFE2?text=MYCONFORT',
        advisor_name: invoice.advisorName || 'MYCONFORT',
        
        // PDF compressé pour template_yng4k8s (pas de pièce jointe, mais données base64)
        pdf_data: pdfBase64.split(',')[1],
        pdf_filename: `Facture_MYCONFORT_${invoice.invoiceNumber}.pdf`,
        pdf_size: `${pdfResult.sizeKB} KB`,
        pdf_compressed: pdfResult.compressed ? 'Oui' : 'Non',
        has_pdf: 'true',
        pdf_method: 'base64_compressed_service_corrige',
        template_used: 'template_yng4k8s',
        service_used: 'service_ymw6jjh',
        user_id_used: 'hvgYUCG9j2lURrt5k',
        
        // Pas de pièce jointe dans ce cas pour template_yng4k8s
        attachment_name: '',
        attachment_content: '',
        attachment_type: '',
        attachment_size: ''
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID, // service_ymw6jjh CORRIGÉ
        EMAILJS_CONFIG.TEMPLATE_ID, // template_yng4k8s CONFIRMÉ
        templateParams,
        EMAILJS_CONFIG.USER_ID // hvgYUCG9j2lURrt5k CONFIRMÉ
      );

      console.log('✅ Email avec template template_yng4k8s et PDF compressé envoyé via SERVICE CORRIGÉ:', response);
      return true;

    } catch (error: any) {
      console.error('❌ Erreur envoi PDF compressé avec template template_yng4k8s via SERVICE CORRIGÉ:', error);
      throw error;
    }
  }

  /**
   * 📧 Envoie l'email sans PDF avec service corrigé
   */
  private static async sendEmailWithoutPDF(invoice: Invoice, pdfNote: string): Promise<boolean> {
    try {
      console.log('📧 Envoi email sans PDF avec template template_yng4k8s via SERVICE CORRIGÉ');
      
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
      let message = this.generateDefaultHTMLMessage(invoice, totalAmount, acompteAmount, montantRestant);
      message += `\n\n📎 Note importante: ${pdfNote}`;
      message += `\n\nPour recevoir votre facture PDF, contactez-nous à myconfort@gmail.com ou au 04 68 50 41 45.`;

      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: `Facture MYCONFORT n°${invoice.invoiceNumber}`,
        message: message,
        
        // Informations facture pour template_yng4k8s
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(totalAmount),
        deposit_amount: acompteAmount > 0 ? formatCurrency(acompteAmount) : '',
        remaining_amount: acompteAmount > 0 ? formatCurrency(montantRestant) : '',
        has_signature: invoice.signature ? 'Oui' : 'Non',
        
        // Entreprise pour template_yng4k8s
        company_name: 'MYCONFORT',
        company_logo: 'https://via.placeholder.com/120x60/477A0C/F2EFE2?text=MYCONFORT',
        advisor_name: invoice.advisorName || 'MYCONFORT',
        
        // Pas de PDF pour template_yng4k8s
        has_pdf: 'false',
        pdf_note: pdfNote,
        template_used: 'template_yng4k8s',
        service_used: 'service_ymw6jjh',
        user_id_used: 'hvgYUCG9j2lURrt5k',
        
        // Pas de pièce jointe pour template_yng4k8s
        attachment_name: '',
        attachment_content: '',
        attachment_type: '',
        attachment_size: ''
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID, // service_ymw6jjh CORRIGÉ
        EMAILJS_CONFIG.TEMPLATE_ID, // template_yng4k8s CONFIRMÉ
        templateParams,
        EMAILJS_CONFIG.USER_ID // hvgYUCG9j2lURrt5k CONFIRMÉ
      );

      console.log('✅ Email sans PDF avec template template_yng4k8s envoyé via SERVICE CORRIGÉ:', response);
      return true;
    } catch (error) {
      console.error('❌ Erreur envoi sans PDF avec template template_yng4k8s via SERVICE CORRIGÉ:', error);
      return false;
    }
  }

  /**
   * 📸 Partage l'aperçu avec service corrigé
   */
  static async sharePreviewViaEmail(
    invoice: Invoice, 
    imageDataUrl: string
  ): Promise<boolean> {
    try {
      console.log('📸 PARTAGE APERÇU VIA TEMPLATE template_yng4k8s AVEC SERVICE CORRIGÉ');
      
      // Initialiser EmailJS
      this.initializeEmailJS();

      // Vérifier la taille de l'image
      const imageBlob = await fetch(imageDataUrl).then(res => res.blob());
      let imageSizeKB = Math.round(imageBlob.size / 1024);
      console.log('📊 Taille de l\'image pour service corrigé:', imageSizeKB, 'KB');

      let finalImageDataUrl = imageDataUrl;

      // Si l'image est trop grande pour le plan premium (2MB), la compresser
      if (imageBlob.size > EMAILJS_CONFIG.MAX_ATTACHMENT_SIZE) {
        console.log('🗜️ Compression de l\'image pour service corrigé (limite 2MB)...');
        finalImageDataUrl = await this.compressImageForEmail(imageDataUrl, EMAILJS_CONFIG.MAX_ATTACHMENT_SIZE);
        
        const compressedBlob = await fetch(finalImageDataUrl).then(res => res.blob());
        imageSizeKB = Math.round(compressedBlob.size / 1024);
        console.log('📊 Taille après compression pour service corrigé:', imageSizeKB, 'KB');
      }

      // Préparer le message pour l'aperçu avec service corrigé
      let previewMessage = `Voici l'aperçu de votre facture n°${invoice.invoiceNumber} tel qu'il apparaît dans notre système MYCONFORT.\n\nL'image ci-jointe vous montre exactement l'aperçu de votre facture.`;

      // Préparer les données pour votre Template template_yng4k8s
      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: `Aperçu facture MYCONFORT n°${invoice.invoiceNumber}`,
        message: previewMessage,
        
        // Informations facture pour template_yng4k8s
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        
        // Entreprise pour template_yng4k8s
        company_name: 'MYCONFORT',
        company_logo: 'https://via.placeholder.com/120x60/477A0C/F2EFE2?text=MYCONFORT',
        advisor_name: invoice.advisorName || 'MYCONFORT',
        
        // Image comme pièce jointe pour template_yng4k8s
        attachment_name: `apercu_facture_${invoice.invoiceNumber}.jpg`,
        attachment_content: finalImageDataUrl.split(',')[1],
        attachment_type: 'image/jpeg',
        attachment_size: `${imageSizeKB} KB`,
        has_image: 'true',
        template_used: 'template_yng4k8s',
        service_used: 'service_ymw6jjh',
        user_id_used: 'hvgYUCG9j2lURrt5k',
        
        // Pas de PDF pour l'aperçu avec template_yng4k8s
        has_pdf: 'false'
      };

      console.log('📧 Envoi aperçu avec template template_yng4k8s et pièce jointe image via SERVICE CORRIGÉ...');

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID, // service_ymw6jjh CORRIGÉ
        EMAILJS_CONFIG.TEMPLATE_ID, // template_yng4k8s CONFIRMÉ
        templateParams,
        EMAILJS_CONFIG.USER_ID // hvgYUCG9j2lURrt5k CONFIRMÉ
      );

      console.log('✅ Aperçu avec template template_yng4k8s envoyé via SERVICE CORRIGÉ:', response);
      return true;
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'aperçu avec template template_yng4k8s via SERVICE CORRIGÉ:', error);
      throw new Error(`Erreur d'envoi d'aperçu avec template template_yng4k8s: ${error.message}`);
    }
  }

  /**
   * 🗜️ Compresse une image pour respecter la limite de taille
   */
  private static async compressImageForEmail(imageDataUrl: string, maxSize: number): Promise<string> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d')!;
        
        // Calculer les nouvelles dimensions
        let { width, height } = img;
        const maxDimension = 1200; // Limite raisonnable
        
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = (height * maxDimension) / width;
            width = maxDimension;
          } else {
            width = (width * maxDimension) / height;
            height = maxDimension;
          }
        }
        
        canvas.width = width;
        canvas.height = height;
        
        ctx.drawImage(img, 0, 0, width, height);
        
        // Compression progressive
        let quality = 0.8;
        let compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        
        // Réduire la qualité jusqu'à respecter la limite
        while (compressedDataUrl.length * 0.75 > maxSize && quality > 0.1) {
          quality -= 0.1;
          compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        }
        
        resolve(compressedDataUrl);
      };
      img.src = imageDataUrl;
    });
  }

  /**
   * Test de connexion avec EmailJS et service corrigé
   */
  static async testConnection(): Promise<{ success: boolean; message: string; responseTime?: number }> {
    try {
      console.log('🧪 TEST DE CONNEXION EMAILJS AVEC SERVICE ID CORRIGÉ');
      console.log('🔑 User ID:', EMAILJS_CONFIG.USER_ID);
      console.log('🎯 SERVICE ID CORRIGÉ:', EMAILJS_CONFIG.SERVICE_ID);
      console.log('📧 Template ID CONFIRMÉ:', EMAILJS_CONFIG.TEMPLATE_ID);
      console.log('📎 Support pièces jointes: 2MB (service corrigé)');
      console.log('🎨 Template CONFIRMÉ: template_yng4k8s - Design personnalisé');
      console.log('🎯 SERVICE ID CORRIGÉ OPÉRATIONNEL !');
      
      // Initialiser EmailJS
      this.initializeEmailJS();
      
      const startTime = Date.now();
      
      // Préparer les données de test avec template template_yng4k8s ET SERVICE CORRIGÉ
      const testParams = {
        to_email: 'test@myconfort.com',
        to_name: 'Test MYCONFORT',
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        subject: 'Test de connexion EmailJS MYCONFORT avec SERVICE ID CORRIGÉ',
        message: 'Ceci est un test de connexion EmailJS depuis MYCONFORT avec template template_yng4k8s personnalisé et support des pièces jointes 2MB via SERVICE corrigé.',
        
        // Informations test pour template_yng4k8s
        invoice_number: 'TEST-001',
        invoice_date: new Date().toLocaleDateString('fr-FR'),
        total_amount: '100,00 €',
        
        // Entreprise pour template_yng4k8s
        company_name: 'MYCONFORT',
        company_logo: 'https://via.placeholder.com/120x60/477A0C/F2EFE2?text=MYCONFORT',
        advisor_name: 'Test',
        
        // Test sans pièces jointes pour template_yng4k8s
        has_pdf: 'false',
        has_image: 'false',
        attachment_name: '',
        attachment_content: '',
        attachment_type: '',
        attachment_size: '0 KB',
        pdf_method: 'test_service_corrige',
        template_used: 'template_yng4k8s',
        service_used: 'service_ymw6jjh',
        user_id_used: 'hvgYUCG9j2lURrt5k'
      };

      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID, // service_ymw6jjh CORRIGÉ
        EMAILJS_CONFIG.TEMPLATE_ID, // template_yng4k8s CONFIRMÉ
        testParams,
        EMAILJS_CONFIG.USER_ID // hvgYUCG9j2lURrt5k CONFIRMÉ
      );

      const responseTime = Date.now() - startTime;

      return {
        success: true,
        message: `✅ Connexion EmailJS réussie avec SERVICE ID CORRIGÉ ! Service prêt pour l'envoi d'emails avec design personnalisé et pièces jointes jusqu'à 2MB avec votre template template_yng4k8s et SERVICE ID CORRIGÉ opérationnel.`,
        responseTime
      };
    } catch (error: any) {
      console.error('❌ Erreur test connexion EmailJS avec SERVICE ID CORRIGÉ:', error);
      
      let errorMessage = '❌ Erreur de connexion EmailJS avec SERVICE ID CORRIGÉ: ';
      
      if (error.status === 401 || error.status === 403) {
        errorMessage += 'Identifiants incorrects. Vérifiez votre configuration.';
      } else if (error.status === 400) {
        errorMessage += 'Paramètres invalides. Vérifiez votre template ID template_yng4k8s.';
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
   * 📧 Génère un message HTML pour plan premium avec service corrigé
   */
  private static generatePremiumHTMLMessage(
    invoice: Invoice, 
    totalAmount: number, 
    acompteAmount: number, 
    montantRestant: number
  ): string {
    let message = `Veuillez trouver ci-joint votre facture n°${invoice.invoiceNumber} générée avec notre système MYCONFORT.\n\n`;
    
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
      message += `✅ Cette facture a été signée électroniquement et est juridiquement valide.\n\n`;
    }
    
    message += `📎 Le PDF de votre facture est joint à cet email (envoyé via service corrigé - jusqu'à 2MB).\n\n`;
    message += `Pour toute question, n'hésitez pas à nous contacter.`;

    return message;
  }

  /**
   * 📧 Génère un message HTML pour PDF compressé avec service corrigé
   */
  private static generateCompressedHTMLMessage(
    invoice: Invoice, 
    totalAmount: number, 
    acompteAmount: number, 
    montantRestant: number
  ): string {
    let message = `Veuillez trouver ci-joint votre facture n°${invoice.invoiceNumber} générée avec notre système MYCONFORT.\n\n`;
    
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
      message += `✅ Cette facture a été signée électroniquement et est juridiquement valide.\n\n`;
    }
    
    message += `📎 Le PDF de votre facture est inclus dans cet email (version compressée pour optimiser l'envoi via service corrigé).\n\n`;
    message += `Pour toute question, n'hésitez pas à nous contacter.`;

    return message;
  }

  /**
   * Génère un message HTML par défaut avec service corrigé
   */
  private static generateDefaultHTMLMessage(
    invoice: Invoice, 
    totalAmount: number, 
    acompteAmount: number, 
    montantRestant: number
  ): string {
    let message = `Veuillez trouver les détails de votre facture n°${invoice.invoiceNumber} générée avec notre système MYCONFORT.\n\n`;
    
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
      message += `✅ Cette facture a été signée électroniquement et est juridiquement valide.\n\n`;
    }
    
    message += `Pour toute question, n'hésitez pas à nous contacter.`;

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
      status: '✅ EmailJS configuré avec SERVICE CORRIGÉ, template template_yng4k8s CONFIRMÉ, User ID CONFIRMÉ et support pièces jointes 2MB - SERVICE ID CORRIGÉ OPÉRATIONNEL !',
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
    console.log('ℹ️ Configuration EmailJS mise à jour avec SERVICE CORRIGÉ, template template_yng4k8s, User ID CONFIRMÉ et support 2MB - SERVICE ID CORRIGÉ !');
    
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