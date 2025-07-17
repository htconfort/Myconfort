import html2pdf from 'html2pdf.js';
import emailjs from 'emailjs-com';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

// Configuration EmailJS DÉFINITIVE avec clés API exactes
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ymw6jjh', // ✅ SERVICE ID CONFIRMÉ PAR TEST REÇU
  TEMPLATE_ID: 'template_yng4k8s',
  USER_ID: 'eqxx9fwyTsoAoF00i', // ✅ API KEY DÉFINITIVE (PUBLIC) EXACTE
  PRIVATE_KEY: 'MwZ9s8tHaiq8YimGZrF5_' // ✅ PRIVATE KEY DÉFINITIVE EXACTE
};

export class SeparatePdfEmailService {
  /**
   * Initialise EmailJS
   */
  static initializeEmailJS(): void {
    try {
      emailjs.init(EMAILJS_CONFIG.USER_ID);
      console.log('✅ EmailJS initialisé pour méthode séparée avec CLÉS API DÉFINITIVES');
    } catch (error) {
      console.error('❌ Erreur initialisation EmailJS:', error);
    }
  }

  /**
   * 📄 GÉNÈRE LE PDF EN LOCAL avec html2pdf.js (votre script exact)
   */
  static async generateInvoicePDFLocal(invoice: Invoice): Promise<void> {
    console.log('📄 GÉNÉRATION PDF LOCAL avec votre script exact');
    
    // Chercher l'élément .facture-apercu en priorité
    let element = document.querySelector('.facture-apercu') as HTMLElement;
    
    if (!element) {
      // Fallback vers d'autres éléments
      element = document.getElementById('pdf-preview-content') || 
                document.getElementById('facture-apercu') ||
                document.querySelector('[class*="invoice"]') as HTMLElement;
    }
    
    if (!element) {
      throw new Error('❌ Aucun élément de facture trouvé pour la génération PDF');
    }

    // Attendre que l'élément soit rendu
    await this.waitForElementToRender(element);

    // 📋 CONFIGURATION EXACTE DE VOTRE SCRIPT
    const opt = {
      margin: 0,
      filename: `facture-myconfort-${invoice.invoiceNumber}.pdf`,
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    try {
      console.log('🔄 Génération PDF avec votre script exact...');
      
      // Générer le PDF avec votre script
      await html2pdf().set(opt).from(element).save();
      
      console.log('✅ PDF généré et téléchargé avec succès');
      return;
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      throw new Error('Impossible de générer le PDF avec votre script');
    }
  }

  /**
   * 📧 ENVOIE L'EMAIL SÉPARÉMENT (sans PDF) avec CLÉS API DÉFINITIVES
   */
  static async sendEmailSeparately(invoice: Invoice): Promise<boolean> {
    try {
      console.log('📧 ENVOI EMAIL SÉPARÉ (sans PDF dans le payload) avec CLÉS API DÉFINITIVES');
      
      // Initialiser EmailJS
      this.initializeEmailJS();
      
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

      // Préparer le message personnalisé
      let message = `Bonjour ${invoice.client.name},\n\n`;
      message += `Votre facture n°${invoice.invoiceNumber} a été générée avec succès.\n\n`;
      message += `📋 DÉTAILS :\n`;
      message += `• Numéro: ${invoice.invoiceNumber}\n`;
      message += `• Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}\n`;
      
      if (acompteAmount > 0) {
        message += `• Total TTC: ${formatCurrency(totalAmount)}\n`;
        message += `• Acompte versé: ${formatCurrency(acompteAmount)}\n`;
        message += `• Montant restant: ${formatCurrency(montantRestant)}\n\n`;
      } else {
        message += `• Montant total: ${formatCurrency(totalAmount)}\n\n`;
      }
      
      if (invoice.payment.method) {
        message += `💳 Mode de paiement: ${invoice.payment.method}\n\n`;
      }
      
      if (invoice.signature) {
        message += '✅ Cette facture a été signée électroniquement.\n\n';
      }
      
      message += `📎 Le PDF de votre facture a été généré et téléchargé sur votre appareil.\n\n`;
      message += `Pour toute question, contactez-nous :\n`;
      message += `• Téléphone: 04 68 50 41 45\n`;
      message += `• Email: myconfort@gmail.com\n\n`;
      message += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}`;

      // Paramètres pour le template (SANS PDF) avec CLÉS API DÉFINITIVES
      const templateParams = {
        // Destinataire
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        
        // Expéditeur
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        
        // Sujet et message
        subject: `Facture MYCONFORT n°${invoice.invoiceNumber}`,
        message: message,
        
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
        
        // Conseiller
        advisor_name: invoice.advisorName || 'MYCONFORT',
        
        // Mode de paiement
        payment_method: invoice.payment.method || 'Non spécifié',
        
        // Statut PDF (généré localement)
        has_pdf: 'false', // Pas de PDF dans l'email
        pdf_note: 'PDF généré et téléchargé localement',
        
        // Métadonnées avec CLÉS API DÉFINITIVES
        generated_date: new Date().toLocaleDateString('fr-FR'),
        generated_time: new Date().toLocaleTimeString('fr-FR'),
        template_used: 'template_yng4k8s',
        service_used: 'service_ymw6jjh',
        user_id_used: 'eqxx9fwyTsoAoF00i',
        private_key_used: 'MwZ9s8tHaiq8YimGZrF5_',
        
        // Produits
        products_count: invoice.products.length,
        products_summary: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', ')
      };

      console.log('📧 Envoi email de notification (sans PDF) avec CLÉS API DÉFINITIVES...');
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID, // service_ymw6jjh CONFIRMÉ PAR TEST REÇU
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID // eqxx9fwyTsoAoF00i API KEY DÉFINITIVE
      );

      console.log('✅ Email de notification envoyé avec succès via CLÉS API DÉFINITIVES:', response);
      return true;

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'email séparé avec CLÉS API DÉFINITIVES:', error);
      throw new Error(`Erreur d'envoi email: ${error.message}`);
    }
  }

  /**
   * 🚀 MÉTHODE PRINCIPALE : Génère le PDF ET envoie l'email séparément avec CLÉS API DÉFINITIVES
   */
  static async generatePDFAndSendEmail(invoice: Invoice): Promise<{ pdfGenerated: boolean; emailSent: boolean; message: string }> {
    try {
      console.log('🚀 PROCESSUS SÉPARÉ : PDF LOCAL + EMAIL SANS PAYLOAD avec CLÉS API DÉFINITIVES');
      
      let pdfGenerated = false;
      let emailSent = false;
      let message = '';

      // Étape 1: Générer le PDF localement
      try {
        console.log('📄 Étape 1: Génération PDF local...');
        await this.generateInvoicePDFLocal(invoice);
        pdfGenerated = true;
        message += '✅ PDF généré et téléchargé avec succès\n';
      } catch (error) {
        console.error('❌ Erreur génération PDF:', error);
        message += '❌ Erreur lors de la génération du PDF\n';
      }

      // Étape 2: Envoyer l'email de notification avec CLÉS API DÉFINITIVES
      try {
        console.log('📧 Étape 2: Envoi email de notification avec CLÉS API DÉFINITIVES...');
        emailSent = await this.sendEmailSeparately(invoice);
        message += '✅ Email de notification envoyé avec succès via CLÉS API DÉFINITIVES\n';
      } catch (error) {
        console.error('❌ Erreur envoi email avec CLÉS API DÉFINITIVES:', error);
        message += '❌ Erreur lors de l\'envoi de l\'email\n';
      }

      // Résultat final
      if (pdfGenerated && emailSent) {
        message += '\n🎉 Processus terminé avec succès !\n';
        message += `📎 PDF téléchargé: facture-myconfort-${invoice.invoiceNumber}.pdf\n`;
        message += `📧 Email envoyé à: ${invoice.client.email} via CLÉS API DÉFINITIVES`;
      } else if (pdfGenerated && !emailSent) {
        message += '\n⚠️ PDF généré mais email non envoyé';
      } else if (!pdfGenerated && emailSent) {
        message += '\n⚠️ Email envoyé mais PDF non généré';
      } else {
        message += '\n❌ Échec complet du processus';
      }

      return {
        pdfGenerated,
        emailSent,
        message
      };

    } catch (error: any) {
      console.error('❌ Erreur processus séparé avec CLÉS API DÉFINITIVES:', error);
      return {
        pdfGenerated: false,
        emailSent: false,
        message: `❌ Erreur: ${error.message}`
      };
    }
  }

  /**
   * 🕐 ATTENDRE QUE L'ÉLÉMENT SOIT COMPLÈTEMENT RENDU
   */
  private static async waitForElementToRender(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const images = element.querySelectorAll('img');
      let loadedImages = 0;
      
      if (images.length === 0) {
        setTimeout(resolve, 100);
        return;
      }
      
      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages >= images.length) {
          setTimeout(resolve, 200);
        }
      };
      
      images.forEach((img) => {
        if (img.complete) {
          checkAllImagesLoaded();
        } else {
          img.onload = checkAllImagesLoaded;
          img.onerror = checkAllImagesLoaded;
        }
      });
      
      setTimeout(resolve, 2000);
    });
  }

  /**
   * 🧪 TEST DE LA MÉTHODE SÉPARÉE avec CLÉS API DÉFINITIVES
   */
  static async testSeparateMethod(invoice: Invoice): Promise<void> {
    console.log('🧪 TEST DE LA MÉTHODE SÉPARÉE : PDF LOCAL + EMAIL SANS PAYLOAD avec CLÉS API DÉFINITIVES');
    
    try {
      const result = await this.generatePDFAndSendEmail(invoice);
      
      let alertMessage = '🧪 TEST DE LA MÉTHODE SÉPARÉE TERMINÉ avec CLÉS API DÉFINITIVES\n\n';
      alertMessage += result.message;
      
      if (result.pdfGenerated && result.emailSent) {
        alertMessage += '\n\n✅ Test réussi ! Méthode séparée fonctionnelle avec CLÉS API DÉFINITIVES.';
      } else {
        alertMessage += '\n\n⚠️ Test partiellement réussi. Vérifiez les détails ci-dessus.';
      }
      
      alert(alertMessage);
      
    } catch (error) {
      console.error('❌ Erreur test méthode séparée avec CLÉS API DÉFINITIVES:', error);
      alert('❌ Erreur lors du test de la méthode séparée. Vérifiez la console pour plus de détails.');
    }
  }
}
