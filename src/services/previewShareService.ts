import html2canvas from 'html2canvas';
import { Invoice } from '../types';
import { EmailService } from '../services/emailService';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

export interface PreviewShareOptions {
  quality?: number;
  scale?: number;
  format?: 'png' | 'jpeg';
  backgroundColor?: string;
}

export class PreviewShareService {
  /**
   * 🎯 Capture l'aperçu exact de la facture et l'envoie par EmailJS
   * Cette méthode garantit que le client reçoit exactement ce que vous voyez dans Bolt
   */
  static async sharePreviewByEmail(
    invoice: Invoice, 
    elementId: string = 'pdf-preview-content',
    options: PreviewShareOptions = {}
  ): Promise<boolean> {
    try {
      console.log('📸 PARTAGE APERÇU EXACT AVEC EMAILJS - Capture de ce que vous voyez dans Bolt');
      console.log('🔑 Configuration EmailJS: service_ocsxnme / template_yng4k8s');
      
      // Configuration par défaut optimisée
      const config = {
        quality: options.quality || 1.0,
        scale: options.scale || 2,
        format: options.format || 'png',
        backgroundColor: options.backgroundColor || '#ffffff',
        ...options
      };

      // Étape 1: Trouver l'élément à capturer
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Élément ${elementId} non trouvé pour la capture`);
      }

      // Étape 2: Capturer l'aperçu avec html2canvas
      console.log('📷 Capture en cours avec html2canvas...');
      const canvas = await html2canvas(element, {
        scale: config.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: config.backgroundColor,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false, // Désactiver les logs pour la production
        imageTimeout: 15000, // Timeout de 15 secondes
        removeContainer: true
      });

      // Étape 3: Convertir en image haute qualité
      console.log('🖼️ Conversion en image haute qualité...');
      const mimeType = config.format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const imageDataUrl = canvas.toDataURL(mimeType, config.quality);
      
      // Calculer la taille de l'image
      const imageBlob = await fetch(imageDataUrl).then(res => res.blob());
      const imageSizeKB = Math.round(imageBlob.size / 1024);
      
      console.log(`📊 Image générée: ${canvas.width}x${canvas.height}px, ${imageSizeKB} KB`);

      // Étape 4: Préparer les données pour EmailJS
      const emailData = this.prepareEmailDataForEmailJS(invoice, imageDataUrl, imageSizeKB, config.format);

      // Étape 5: Envoyer directement avec EmailJS
      console.log('📧 Envoi de l\'aperçu exact par EmailJS...');
      const success = await this.sendPreviewViaEmailJS(emailData);

      if (success) {
        console.log('✅ Aperçu exact partagé avec succès via EmailJS !');
        return true;
      } else {
        throw new Error('Échec de l\'envoi de l\'aperçu via EmailJS');
      }

    } catch (error) {
      console.error('❌ Erreur lors du partage de l\'aperçu avec EmailJS:', error);
      return false;
    }
  }

  /**
   * Prépare les données spécifiquement pour EmailJS
   */
  private static prepareEmailDataForEmailJS(
    invoice: Invoice, 
    imageDataUrl: string, 
    imageSizeKB: number, 
    format: string
  ) {
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

    // Message personnalisé pour l'aperçu partagé
    let customMessage = `Bonjour ${invoice.client.name},\n\n`;
    customMessage += `Voici l'aperçu de votre facture n°${invoice.invoiceNumber} tel qu'il apparaît exactement dans notre système de facturation MYCONFORT.\n\n`;
    
    customMessage += `📋 DÉTAILS DE LA FACTURE :\n`;
    customMessage += `• Numéro: ${invoice.invoiceNumber}\n`;
    customMessage += `• Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}\n`;
    
    if (acompteAmount > 0) {
      customMessage += `• Total TTC: ${formatCurrency(totalAmount)}\n`;
      customMessage += `• Acompte versé: ${formatCurrency(acompteAmount)}\n`;
      customMessage += `• Montant restant: ${formatCurrency(montantRestant)}\n\n`;
    } else {
      customMessage += `• Montant total: ${formatCurrency(totalAmount)}\n\n`;
    }
    
    if (invoice.signature) {
      customMessage += '✅ Cette facture a été signée électroniquement et est juridiquement valide.\n\n';
    }
    
    customMessage += `🎯 L'image ci-jointe vous montre exactement l'aperçu de votre facture tel qu'il apparaît dans notre système.\n`;
    customMessage += `Cette représentation visuelle est identique à celle que nous voyons de notre côté.\n\n`;
    
    if (invoice.payment.method) {
      customMessage += `💳 Mode de paiement: ${invoice.payment.method}\n\n`;
    }
    
    customMessage += `Pour toute question, n'hésitez pas à nous contacter.\n\n`;
    customMessage += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}\n\n`;
    customMessage += `---\nMYCONFORT - Aperçu de facture partagé directement depuis notre système\n`;
    customMessage += `📸 Image haute qualité (${imageSizeKB} KB) • Format: ${format.toUpperCase()}`;

    return {
      invoice,
      imageDataUrl,
      imageSizeKB,
      format,
      customMessage,
      totalAmount,
      acompteAmount,
      montantRestant
    };
  }

  /**
   * 📧 Envoie l'aperçu directement via EmailJS (sans passer par EmailService)
   */
  private static async sendPreviewViaEmailJS(emailData: any): Promise<boolean> {
    try {
      // Import dynamique d'EmailJS
      const emailjs = await import('@emailjs/browser');
      
      // Configuration EmailJS (vos clés)
      const EMAILJS_SERVICE_ID = 'service_ocsxnme';
      const EMAILJS_TEMPLATE_ID = 'template_yng4k8s';
      const EMAILJS_PUBLIC_KEY = 'hvgYUCG9j2lURrt5k';

      // Convertir l'image en base64 pour EmailJS
      const base64Image = emailData.imageDataUrl.split(',')[1];

      // Paramètres pour le template EmailJS
      const templateParams = {
        // Destinataire
        to_email: emailData.invoice.client.email,
        to_name: emailData.invoice.client.name,
        
        // Expéditeur
        from_name: emailData.invoice.advisorName || 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        
        // Informations facture
        invoice_number: emailData.invoice.invoiceNumber,
        invoice_date: new Date(emailData.invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(emailData.totalAmount),
        
        // Message personnalisé
        message: emailData.customMessage,
        
        // 📸 IMAGE DE L'APERÇU COMME PIÈCE JOINTE
        invoice_pdf: base64Image, // Utiliser le champ PDF pour l'image
        pdf_filename: `apercu_facture_${emailData.invoice.invoiceNumber}.${emailData.format}`,
        pdf_size: emailData.imageSizeKB,
        
        // Informations entreprise
        company_name: 'MYCONFORT',
        company_address: '88 Avenue des Ternes, 75017 Paris',
        company_phone: '04 68 50 41 45',
        company_email: 'myconfort@gmail.com',
        company_siret: '824 313 530 00027',
        company_website: 'https://www.htconfort.com',
        
        // Métadonnées de l'aperçu
        preview_type: 'Aperçu Bolt',
        image_format: emailData.format.toUpperCase(),
        image_size: `${emailData.imageSizeKB} KB`,
        app_name: 'MYCONFORT - Partage Aperçu',
        generated_date: new Date().toLocaleDateString('fr-FR'),
        generated_time: new Date().toLocaleTimeString('fr-FR'),
        
        // Informations acompte si applicable
        deposit_amount: emailData.acompteAmount > 0 ? formatCurrency(emailData.acompteAmount) : '',
        remaining_amount: emailData.acompteAmount > 0 ? formatCurrency(emailData.montantRestant) : '',
        
        // Informations client
        client_address: `${emailData.invoice.client.address}, ${emailData.invoice.client.postalCode} ${emailData.invoice.client.city}`,
        client_phone: emailData.invoice.client.phone,
        
        // Informations paiement
        payment_method: emailData.invoice.payment.method || 'Non spécifié',
        advisor_name: emailData.invoice.advisorName || 'MYCONFORT'
      };

      console.log('📧 Envoi avec EmailJS...');
      console.log('🔑 Service:', EMAILJS_SERVICE_ID);
      console.log('📄 Template:', EMAILJS_TEMPLATE_ID);
      console.log('📎 Image:', emailData.imageSizeKB, 'KB');
      console.log('📋 Destinataire:', emailData.invoice.client.email);

      // Envoyer avec EmailJS
      const response = await emailjs.default.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('✅ Aperçu envoyé avec succès via EmailJS !');
      console.log('📊 Réponse EmailJS:', response);
      
      return response.status === 200;

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi via EmailJS:', error);
      console.error('🔍 Détails de l\'erreur:', {
        service: 'service_ocsxnme',
        template: 'template_yng4k8s',
        error: error
      });

      // Messages d'erreur spécifiques
      if (error?.text?.includes('template ID not found') || error?.status === 400) {
        console.error('🚨 ERREUR DE CONFIGURATION:');
        console.error('📄 Le template ID "template_yng4k8s" n\'existe pas dans votre compte EmailJS');
        console.error('🔧 Solutions:');
        console.error('   1. Créez un template avec l\'ID "template_yng4k8s" sur https://dashboard.emailjs.com/admin/templates');
        console.error('   2. Vérifiez que vous êtes connecté au bon compte EmailJS');
        console.error('   3. Assurez-vous que le template supporte les pièces jointes avec {{invoice_pdf}}');
      }

      return false;
    }
  }

  /**
   * Vérifie si le partage d'aperçu est possible
   */
  static canSharePreview(invoice: Invoice): { canShare: boolean; reason?: string } {
    if (!invoice.client.email) {
      return { canShare: false, reason: 'Email du client requis' };
    }

    if (!invoice.client.name) {
      return { canShare: false, reason: 'Nom du client requis' };
    }

    if (invoice.products.length === 0) {
      return { canShare: false, reason: 'Aucun produit dans la facture' };
    }

    // Vérifier la configuration EmailJS basique
    const hasEmailJSConfig = true; // Les clés sont hardcodées dans le service
    if (!hasEmailJSConfig) {
      return { canShare: false, reason: 'Configuration EmailJS incomplète' };
    }

    return { canShare: true };
  }

  /**
   * 🎨 Capture uniquement l'aperçu sans l'envoyer (pour prévisualisation)
   */
  static async capturePreview(
    elementId: string = 'pdf-preview-content',
    options: PreviewShareOptions = {}
  ): Promise<{ dataUrl: string; blob: Blob; sizeKB: number } | null> {
    try {
      const element = document.getElementById(elementId);
      if (!element) {
        throw new Error(`Élément ${elementId} non trouvé`);
      }

      const config = {
        quality: options.quality || 1.0,
        scale: options.scale || 2,
        format: options.format || 'png',
        backgroundColor: options.backgroundColor || '#ffffff',
        ...options
      };

      const canvas = await html2canvas(element, {
        scale: config.scale,
        useCORS: true,
        allowTaint: true,
        backgroundColor: config.backgroundColor,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });

      const mimeType = config.format === 'jpeg' ? 'image/jpeg' : 'image/png';
      const dataUrl = canvas.toDataURL(mimeType, config.quality);
      const blob = await fetch(dataUrl).then(res => res.blob());
      const sizeKB = Math.round(blob.size / 1024);

      return { dataUrl, blob, sizeKB };

    } catch (error) {
      console.error('❌ Erreur lors de la capture:', error);
      return null;
    }
  }
}