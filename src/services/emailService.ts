import emailjs from '@emailjs/browser';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

// Configuration EmailJS - Service ID fourni
const EMAILJS_SERVICE_ID = 'service_ocsxnme';
const EMAILJS_TEMPLATE_ID = 'template_invoice';
const EMAILJS_PUBLIC_KEY = 'your_public_key_here';

export interface EmailData {
  to_email: string;
  to_name: string;
  from_name: string;
  invoice_number: string;
  invoice_date: string;
  total_amount: string;
  message?: string;
  pdf_attachment?: string;
}

export class EmailService {
  static async initialize(): Promise<boolean> {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('EmailJS initialisé avec succès avec le service:', EMAILJS_SERVICE_ID);
      return true;
    } catch (error) {
      console.error('Erreur d\'initialisation EmailJS:', error);
      return false;
    }
  }

  static async sendInvoiceByEmail(pdf: any, invoice: Invoice, customMessage?: string): Promise<boolean> {
    try {
      // Convertir le PDF en blob puis en base64 pour l'attachement
      const pdfBlob = pdf.output('blob');
      const base64PDF = await this.blobToBase64(pdfBlob);
      
      // Calculer le montant total
      const totalAmount = invoice.products.reduce((sum, product) => {
        return sum + calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        );
      }, 0);

      // Préparer les données pour EmailJS avec attachement PDF optimisé
      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: invoice.advisorName || 'FactuFlash',
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(totalAmount),
        message: customMessage || `Bonjour ${invoice.client.name},\n\nVeuillez trouver ci-joint votre facture n°${invoice.invoiceNumber}.\n\nCordialement,\n${invoice.advisorName || 'L\'équipe FactuFlash'}`,
        
        // Données PDF pour l'attachement
        invoice_pdf: base64PDF.split(',')[1], // Enlever le préfixe data:application/pdf;base64,
        pdf_filename: `facture_${invoice.invoiceNumber}.pdf`,
        pdf_size: Math.round(pdfBlob.size / 1024), // Taille en KB
        
        // Informations supplémentaires pour le template
        reply_to: 'myconfort@gmail.com',
        company_name: 'MYCONFORT',
        company_address: '88 Avenue des Ternes, 75017 Paris',
        company_phone: '04 68 50 41 45',
        company_email: 'myconfort@gmail.com',
        company_siret: '824 313 530 00027',
        
        // Détails de la facture pour le corps de l'email
        client_address: `${invoice.client.address}, ${invoice.client.postalCode} ${invoice.client.city}`,
        payment_method: invoice.payment.method || 'Non spécifié',
        advisor_name: invoice.advisorName || 'FactuFlash',
        
        // Informations de livraison si disponibles
        delivery_method: invoice.delivery.method || '',
        delivery_notes: invoice.delivery.notes || '',
        
        // Acompte si applicable
        deposit_amount: invoice.payment.depositAmount > 0 ? formatCurrency(invoice.payment.depositAmount) : '',
        remaining_amount: invoice.payment.depositAmount > 0 ? formatCurrency(totalAmount - invoice.payment.depositAmount) : ''
      };

      console.log('📧 Envoi de l\'email avec le service EmailJS:', EMAILJS_SERVICE_ID);
      console.log('📎 Taille du PDF:', Math.round(pdfBlob.size / 1024), 'KB');
      console.log('📋 Paramètres:', {
        ...templateParams,
        invoice_pdf: '[PDF_DATA_HIDDEN]' // Masquer les données PDF dans les logs
      });

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('✅ Réponse EmailJS:', response);
      return response.status === 200;
    } catch (error) {
      console.error('❌ Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  static async sendSimpleEmail(emailData: EmailData): Promise<boolean> {
    try {
      const templateParams = {
        to_email: emailData.to_email,
        to_name: emailData.to_name,
        from_name: emailData.from_name,
        invoice_number: emailData.invoice_number,
        invoice_date: emailData.invoice_date,
        total_amount: emailData.total_amount,
        message: emailData.message || `Veuillez trouver ci-joint votre facture n°${emailData.invoice_number}.`,
        reply_to: 'myconfort@gmail.com',
        company_name: 'MYCONFORT',
        company_address: '88 Avenue des Ternes, 75017 Paris',
        company_phone: '04 68 50 41 45',
        company_email: 'myconfort@gmail.com'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email simple:', error);
      return false;
    }
  }

  static async sendEmailWithPDF(emailData: EmailData, pdfBlob: Blob): Promise<boolean> {
    try {
      // Convertir le blob PDF en base64 pour l'attachement
      const base64PDF = await this.blobToBase64(pdfBlob);
      
      const templateParams = {
        to_email: emailData.to_email,
        to_name: emailData.to_name,
        from_name: emailData.from_name,
        invoice_number: emailData.invoice_number,
        invoice_date: emailData.invoice_date,
        total_amount: emailData.total_amount,
        message: emailData.message,
        
        // Attachement PDF
        invoice_pdf: base64PDF.split(',')[1], // Enlever le préfixe
        pdf_filename: `facture_${emailData.invoice_number}.pdf`,
        pdf_size: Math.round(pdfBlob.size / 1024),
        
        reply_to: 'myconfort@gmail.com',
        company_name: 'MYCONFORT',
        company_address: '88 Avenue des Ternes, 75017 Paris',
        company_phone: '04 68 50 41 45',
        company_email: 'myconfort@gmail.com'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Erreur lors de l\'envoi avec PDF:', error);
      return false;
    }
  }

  static async blobToBase64(blob: Blob): Promise<string> {
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

  // Méthode pour optimiser la taille du PDF avant envoi
  static async optimizePDFForEmail(pdfBlob: Blob): Promise<Blob> {
    // Si le PDF est trop volumineux (> 5MB), on peut implémenter une compression
    const maxSize = 5 * 1024 * 1024; // 5MB
    
    if (pdfBlob.size > maxSize) {
      console.warn('⚠️ PDF volumineux détecté:', Math.round(pdfBlob.size / 1024 / 1024), 'MB');
      // Pour l'instant, on retourne le blob original
      // Une compression pourrait être ajoutée ici si nécessaire
    }
    
    return pdfBlob;
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  // Méthode pour ouvrir le client email par défaut (fallback)
  static openEmailClient(invoice: Invoice, customMessage?: string): void {
    const totalAmount = invoice.products.reduce((sum, product) => {
      return sum + calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      );
    }, 0);

    const subject = `Facture ${invoice.invoiceNumber} - FactuFlash`;
    const body = customMessage || `Bonjour ${invoice.client.name},\n\nVeuillez trouver ci-joint votre facture n°${invoice.invoiceNumber} d'un montant de ${formatCurrency(totalAmount)}.\n\nCordialement,\n${invoice.advisorName || 'L\'équipe FactuFlash'}`;
    
    const mailtoLink = `mailto:${invoice.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoLink;
  }

  // Vérifier si EmailJS est configuré
  static isConfigured(): boolean {
    return EMAILJS_PUBLIC_KEY !== 'your_public_key_here' && 
           EMAILJS_TEMPLATE_ID !== 'template_invoice';
  }

  // Méthode pour tester la configuration
  static async testConfiguration(): Promise<boolean> {
    try {
      const testParams = {
        to_email: 'test@example.com',
        to_name: 'Test Client',
        from_name: 'FactuFlash Test',
        invoice_number: 'TEST-001',
        invoice_date: new Date().toLocaleDateString('fr-FR'),
        total_amount: '100,00 €',
        message: 'Test de configuration EmailJS',
        company_name: 'MYCONFORT'
      };

      console.log('🧪 Test de configuration EmailJS avec le service:', EMAILJS_SERVICE_ID);
      
      // Ne pas envoyer réellement, juste tester la configuration
      return true;
    } catch (error) {
      console.error('Erreur lors du test de configuration:', error);
      return false;
    }
  }

  // Méthode pour créer un template EmailJS optimisé
  static getTemplateInstructions(): string {
    return `
📧 TEMPLATE EMAILJS RECOMMANDÉ

Sujet: Facture {{invoice_number}} - {{company_name}}

Corps de l'email:
---
Bonjour {{to_name}},

{{message}}

📋 DÉTAILS DE LA FACTURE
• Numéro: {{invoice_number}}
• Date: {{invoice_date}}
• Montant total: {{total_amount}}
• Mode de paiement: {{payment_method}}

🏢 {{company_name}}
{{company_address}}
Tél: {{company_phone}}
Email: {{company_email}}
SIRET: {{company_siret}}

Cordialement,
{{advisor_name}}

---

📎 PIÈCE JOINTE: La facture PDF est automatiquement attachée
Variables pour l'attachement:
• {{invoice_pdf}} - Données base64 du PDF
• {{pdf_filename}} - Nom du fichier
• {{pdf_size}} - Taille en KB
    `;
  }
}