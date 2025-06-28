import html2pdf from 'html2pdf.js';
import emailjs from 'emailjs-com';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

// Configuration EmailJS - Mise à jour avec les BONS paramètres
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ocsxnme', // ✅ Service ID correct
  TEMPLATE_ID: 'Myconfort', // ✅ Template ID correct
  USER_ID: 'hvgYUCG9j2lURrt5k', // ✅ Public Key correcte
  PRIVATE_KEY: 'mh3upHQbKrIViyw4T9-S6' // ✅ Private Key correcte
} as const;

// Configuration spécifique Netlify
const NETLIFY_CONFIG = {
  enableAnalytics: true,
  optimizeForEdge: true,
  cacheStrategy: 'aggressive',
  enableLocalStorage: false,
  fallbackToSessionState: true,
  optimizeForBrowser: true
};

// Types pour meilleure sécurité
interface ProcessResult {
  pdfGenerated: boolean;
  emailSent: boolean;
  message: string;
  performance?: number;
  errors?: string[];
}

interface PdfGenerationOptions {
  margin: number;
  filename: string;
  html2canvas: {
    scale: number;
    useCORS: boolean;
    letterRendering: boolean;
    allowTaint: boolean;
    backgroundColor: string;
    logging: boolean;
    width?: number;
    height?: number;
    scrollX: number;
    scrollY: number;
  };
  jsPDF: {
    unit: string;
    format: string;
    orientation: string;
    compress: boolean;
  };
}

export class SeparatePdfEmailService {
  private static isInitialized = false;
  private static performanceMetrics: Record<string, number> = {};

  /**
   * 📊 Mesure des performances
   */
  private static async measurePerformance<T>(
    operation: string, 
    fn: () => Promise<T>
  ): Promise<T> {
    const start = performance.now();
    try {
      const result = await fn();
      const end = performance.now();
      const duration = end - start;
      this.performanceMetrics[operation] = duration;
      console.log(`⏱️ ${operation}: ${duration.toFixed(2)}ms`);
      return result;
    } catch (error) {
      const end = performance.now();
      console.error(`❌ ${operation} failed after ${(end - start).toFixed(2)}ms`);
      throw error;
    }
  }

  /**
   * 📝 Logging d'erreurs pour Netlify
   */
  private static logToNetlify(error: any, context: string): void {
    console.error(`[NETLIFY-PROD] ${context}:`, {
      error: error.message || error.text || 'Erreur inconnue',
      status: error.status,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    });
  }

  /**
   * 🔧 Gestion d'erreurs Bolt-compatible
   */
  private static handleBoltError(error: any, context: string): string {
    const errorMessage = `[BOLT-${context}] ${error.message || error.text || 'Erreur inconnue'} - Vérifiez la console Bolt.new`;
    this.logToNetlify(error, context);
    return errorMessage;
  }

  /**
   * Initialise EmailJS (singleton pattern) avec gestion d'erreurs améliorée
   */
  static initializeEmailJS(): void {
    if (this.isInitialized) {
      console.log('✅ EmailJS déjà initialisé');
      return;
    }

    try {
      // Initialiser EmailJS avec la nouvelle méthode recommandée
      emailjs.init({
        publicKey: EMAILJS_CONFIG.USER_ID,
        privateKey: EMAILJS_CONFIG.PRIVATE_KEY
      });
      
      this.isInitialized = true;
      console.log('✅ EmailJS initialisé avec les BONS paramètres:', {
        publicKey: EMAILJS_CONFIG.USER_ID,
        serviceId: EMAILJS_CONFIG.SERVICE_ID,
        templateId: EMAILJS_CONFIG.TEMPLATE_ID
      });
    } catch (error) {
      this.logToNetlify(error, 'EMAILJS_INIT');
      throw new Error('Impossible d\'initialiser EmailJS avec les BONS paramètres');
    }
  }

  /**
   * 🔍 Trouve le meilleur élément de facture
   */
  private static findInvoiceElement(): HTMLElement {
    const selectors = [
      '.facture-apercu',
      '#pdf-preview-content',
      '#facture-apercu',
      '[class*="invoice"]',
      '[class*="facture"]',
      '.invoice-preview',
      '.invoice-content',
      '[data-invoice]',
      '.pdf-content'
    ];

    for (const selector of selectors) {
      const element = document.querySelector(selector) as HTMLElement;
      if (element && element.offsetWidth > 0 && element.offsetHeight > 0) {
        console.log(`✅ Élément trouvé avec le sélecteur: ${selector}`);
        return element;
      }
    }

    throw new Error('❌ Aucun élément de facture trouvé pour la génération PDF');
  }

  /**
   * 📄 Génération PDF avec gestion d'erreurs améliorée
   */
  static async generateInvoicePDFLocal(invoice: Invoice): Promise<void> {
    return this.measurePerformance('PDF_GENERATION', async () => {
      console.log('📄 GÉNÉRATION PDF LOCAL avec script optimisé');
      
      try {
        const element = this.findInvoiceElement();
        
        // Attendre que l'élément soit rendu
        await this.waitForElementToRender(element);

        const opt: PdfGenerationOptions = {
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

        console.log('🔄 Génération PDF optimisée...');
        
        // Timeout de sécurité pour Netlify
        const pdfPromise = html2pdf().set(opt).from(element).save();
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Timeout PDF génération')), 30000)
        );

        await Promise.race([pdfPromise, timeoutPromise]);
        
        console.log('✅ PDF généré et téléchargé avec succès');
      } catch (error: any) {
        const errorMsg = this.handleBoltError(error, 'PDF_GENERATION');
        throw new Error(errorMsg);
      }
    });
  }

  /**
   * 📧 Envoi d'email avec retry automatique et gestion d'erreurs améliorée
   */
  static async sendEmailSeparately(invoice: Invoice, retries = 3): Promise<boolean> {
    return this.measurePerformance('EMAIL_SENDING', async () => {
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          console.log(`📧 ENVOI EMAIL - Tentative ${attempt}/${retries}`);
          
          this.initializeEmailJS();
          
          const { totalAmount, acompteAmount, montantRestant } = this.calculateInvoiceAmounts(invoice);
          const message = this.generateEmailMessage(invoice, totalAmount, acompteAmount, montantRestant);

          const templateParams = {
            // Format mis à jour pour correspondre au template
            from_name: 'HT Confort',
            to_name: invoice.client.name,
            to_email: invoice.client.email,
            reply_to: 'htconfort@gmail.com',
            
            // Sujet et message
            subject: `Facture HT Confort n°${invoice.invoiceNumber}`,
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
            company_name: 'HT Confort',
            company_address: '88 Avenue des Ternes, 75017 Paris',
            company_phone: '04 68 50 41 45',
            company_email: 'htconfort@gmail.com',
            company_siret: '824 313 530 00027',
            
            // Conseiller
            advisor_name: invoice.advisorName || 'HT Confort',
            
            // Mode de paiement
            payment_method: invoice.payment.method || 'Non spécifié',
            
            // Statut PDF
            has_pdf: 'false',
            pdf_note: 'PDF généré et téléchargé localement',
            
            // Métadonnées
            generated_date: new Date().toLocaleDateString('fr-FR'),
            generated_time: new Date().toLocaleTimeString('fr-FR'),
            performance_metrics: JSON.stringify(this.performanceMetrics),
            
            // Produits
            products_count: invoice.products.length,
            products_summary: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', ')
          };

          console.log('📧 Envoi email de notification (sans PDF)...');
          console.log('🔧 Configuration utilisée:', {
            serviceId: EMAILJS_CONFIG.SERVICE_ID,
            templateId: EMAILJS_CONFIG.TEMPLATE_ID,
            publicKey: EMAILJS_CONFIG.USER_ID
          });

          // Utiliser la nouvelle méthode EmailJS avec gestion d'erreurs améliorée
          const emailPromise = emailjs.send(
            EMAILJS_CONFIG.SERVICE_ID,
            EMAILJS_CONFIG.TEMPLATE_ID,
            templateParams,
            {
              publicKey: EMAILJS_CONFIG.USER_ID
            }
          );

          const timeoutPromise = new Promise((_, reject) => 
            setTimeout(() => reject(new Error('Timeout envoi email')), 15000)
          );

          const response = await Promise.race([emailPromise, timeoutPromise]);

          console.log('✅ Email envoyé avec succès:', response);
          return true;

        } catch (error: any) {
          console.error(`❌ Tentative ${attempt} échouée:`, error);
          this.logToNetlify(error, `EMAIL_SENDING_ATTEMPT_${attempt}`);
          
          // Analyser le type d'erreur pour un meilleur diagnostic
          let errorMessage = 'Erreur inconnue';
          if (error.status === 404) {
            errorMessage = 'Service EmailJS non trouvé. Vérifiez votre Service ID.';
          } else if (error.status === 401 || error.status === 403) {
            errorMessage = 'Authentification échouée. Vérifiez vos clés API.';
          } else if (error.status === 400) {
            errorMessage = 'Paramètres invalides. Vérifiez votre Template ID.';
          } else if (error.text) {
            errorMessage = error.text;
          } else if (error.message) {
            errorMessage = error.message;
          }
          
          if (attempt === retries) {
            this.logToNetlify(error, 'EMAIL_SENDING_FINAL_FAILURE');
            throw new Error(`Erreur d'envoi email après ${retries} tentatives: ${errorMessage}`);
          }
          
          // Délai avant retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
      return false;
    });
  }

  /**
   * 🚀 MÉTHODE PRINCIPALE améliorée avec gestion d'erreurs robuste
   */
  static async generatePDFAndSendEmail(invoice: Invoice): Promise<ProcessResult> {
    const startTime = performance.now();
    console.log('🚀 PROCESSUS SÉPARÉ OPTIMISÉ : PDF LOCAL + EMAIL');
    
    let pdfGenerated = false;
    let emailSent = false;
    let message = '';
    const errors: string[] = [];

    // Validation des données
    if (!invoice || !invoice.invoiceNumber || !invoice.client?.email) {
      throw new Error('❌ Données de facture invalides');
    }

    // Étape 1: PDF
    try {
      console.log('📄 Étape 1: Génération PDF optimisée...');
      await this.generateInvoicePDFLocal(invoice);
      pdfGenerated = true;
      message += '✅ PDF généré et téléchargé avec succès\n';
    } catch (error: any) {
      const errorMsg = error.message || 'Erreur génération PDF';
      errors.push(`PDF: ${errorMsg}`);
      message += `❌ Erreur PDF: ${errorMsg}\n`;
    }

    // Étape 2: Email
    try {
      console.log('📧 Étape 2: Envoi email avec retry...');
      emailSent = await this.sendEmailSeparately(invoice);
      message += '✅ Email envoyé avec succès\n';
    } catch (error: any) {
      const errorMsg = error.message || 'Erreur envoi email';
      errors.push(`Email: ${errorMsg}`);
      message += `❌ Erreur email: ${errorMsg}\n`;
    }

    // Résultat final
    const totalTime = performance.now() - startTime;
    
    if (pdfGenerated && emailSent) {
      message += `\n🎉 Processus terminé avec succès en ${totalTime.toFixed(2)}ms!\n`;
      message += `📎 PDF: facture-myconfort-${invoice.invoiceNumber}.pdf\n`;
      message += `📧 Email: ${invoice.client.email}`;
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
      message,
      performance: totalTime,
      errors: errors.length > 0 ? errors : undefined
    };
  }

  /**
   * Calcul des montants de facture
   */
  private static calculateInvoiceAmounts(invoice: Invoice) {
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

    return { totalAmount, acompteAmount, montantRestant };
  }

  /**
   * Génération du message email
   */
  private static generateEmailMessage(invoice: Invoice, totalAmount: number, acompteAmount: number, montantRestant: number): string {
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
    
    message += `📎 Le PDF de votre facture a été généré et téléchargé.\n\n`;
    message += `Pour toute question, contactez-nous :\n`;
    message += `• Téléphone: 04 68 50 41 45\n`;
    message += `• Email: htconfort@gmail.com\n\n`;
    message += `Cordialement,\n${invoice.advisorName || 'L\'équipe HT Confort'}`;

    return message;
  }

  /**
   * Attente du rendu des éléments
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
   * 🧪 Tests de compatibilité Bolt.new
   */
  static async runBoltCompatibilityTests(): Promise<boolean> {
    console.log('🧪 Tests de compatibilité Bolt.new...');
    
    try {
      // Test 1: Disponibilité des dépendances
      const htmlToPdfAvailable = typeof html2pdf !== 'undefined';
      const emailjsAvailable = typeof emailjs !== 'undefined';
      
      console.log(`📋 html2pdf: ${htmlToPdfAvailable ? '✅' : '❌'}`);
      console.log(`📧 emailjs: ${emailjsAvailable ? '✅' : '❌'}`);
      
      // Test 2: Éléments DOM
      const hasInvoiceElement = document.querySelector('.facture-apercu') !== null;
      console.log(`🏷️ Élément facture: ${hasInvoiceElement ? '✅' : '❌'}`);
      
      // Test 3: Configuration EmailJS
      console.log(`🔧 Configuration EmailJS:`, {
        serviceId: EMAILJS_CONFIG.SERVICE_ID,
        templateId: EMAILJS_CONFIG.TEMPLATE_ID,
        publicKey: EMAILJS_CONFIG.USER_ID ? '✅' : '❌'
      });
      
      return htmlToPdfAvailable && emailjsAvailable;
      
    } catch (error) {
      console.error('❌ Erreur tests compatibilité:', error);
      return false;
    }
  }

  /**
   * 🔧 Vérification des services avec diagnostic détaillé
   */
  static async checkServicesAvailability(): Promise<{ html2pdf: boolean; emailjs: boolean; message: string }> {
    let html2pdfAvailable = false;
    let emailjsAvailable = false;
    let message = '';

    try {
      if (typeof html2pdf !== 'undefined') {
        html2pdfAvailable = true;
        message += '✅ html2pdf disponible\n';
      } else {
        message += '❌ html2pdf non disponible\n';
      }
    } catch (error) {
      message += '❌ Erreur html2pdf\n';
    }

    try {
      if (typeof emailjs !== 'undefined') {
        this.initializeEmailJS();
        emailjsAvailable = true;
        message += '✅ EmailJS disponible et initialisé avec les BONS paramètres\n';
        message += `🔧 Service ID: ${EMAILJS_CONFIG.SERVICE_ID}\n`;
        message += `📧 Template ID: ${EMAILJS_CONFIG.TEMPLATE_ID}\n`;
        message += `🔑 Public Key: ${EMAILJS_CONFIG.USER_ID}\n`;
      } else {
        message += '❌ EmailJS non disponible\n';
      }
    } catch (error: any) {
      message += `❌ Erreur EmailJS: ${error.message}\n`;
    }

    return {
      html2pdf: html2pdfAvailable,
      emailjs: emailjsAvailable,
      message
    };
  }

  /**
   * 🧪 Test de la méthode séparée avec diagnostic complet
   */
  static async testSeparateMethod(invoice: Invoice): Promise<void> {
    console.log('🧪 TEST DE LA MÉTHODE SÉPARÉE : PDF LOCAL + EMAIL SANS PAYLOAD');
    
    try {
      // Vérifier d'abord la disponibilité des services
      const serviceCheck = await this.checkServicesAvailability();
      console.log('🔧 Vérification des services:', serviceCheck.message);
      
      if (!serviceCheck.emailjs) {
        alert('❌ EmailJS non disponible. Vérifiez la configuration.');
        return;
      }
      
      const result = await this.generatePDFAndSendEmail(invoice);
      
      let alertMessage = '🧪 TEST DE LA MÉTHODE SÉPARÉE TERMINÉ\n\n';
      alertMessage += result.message;
      
      if (result.errors && result.errors.length > 0) {
        alertMessage += '\n\n🔍 ERREURS DÉTECTÉES:\n';
        result.errors.forEach(error => {
          alertMessage += `• ${error}\n`;
        });
      }
      
      if (result.pdfGenerated && result.emailSent) {
        alertMessage += '\n\n✅ Test réussi ! Méthode séparée fonctionnelle.';
      } else {
        alertMessage += '\n\n⚠️ Test partiellement réussi. Vérifiez les détails ci-dessus.';
      }
      
      alert(alertMessage);
      
    } catch (error: any) {
      console.error('❌ Erreur test méthode séparée:', error);
      this.logToNetlify(error, 'TEST_SEPARATE_METHOD');
      
      let errorMessage = '❌ Erreur lors du test de la méthode séparée.\n\n';
      errorMessage += `Détails: ${error.message || 'Erreur inconnue'}\n\n`;
      errorMessage += 'Vérifiez la console pour plus de détails.';
      
      alert(errorMessage);
    }
  }
}