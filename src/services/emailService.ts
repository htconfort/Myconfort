import emailjs from '@emailjs/browser';

// Configuration EmailJS
const EMAILJS_SERVICE_ID = 'service_factuflash';
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
  static async initialize() {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      return true;
    } catch (error) {
      console.error('Erreur d\'initialisation EmailJS:', error);
      return false;
    }
  }

  static async sendInvoiceEmail(emailData: EmailData): Promise<boolean> {
    try {
      const templateParams = {
        to_email: emailData.to_email,
        to_name: emailData.to_name,
        from_name: emailData.from_name,
        invoice_number: emailData.invoice_number,
        invoice_date: emailData.invoice_date,
        total_amount: emailData.total_amount,
        message: emailData.message || `Veuillez trouver ci-joint votre facture n°${emailData.invoice_number}.`,
        reply_to: 'contact@factuflash.com'
      };

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      return response.status === 200;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      return false;
    }
  }

  static validateEmail(email: string): boolean {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  static async sendEmailWithPDF(emailData: EmailData, pdfBlob: Blob): Promise<boolean> {
    try {
      // Pour une vraie application, vous devriez utiliser un service backend
      // qui peut gérer les pièces jointes PDF
      
      // Simulation d'envoi réussi
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Dans un environnement réel, vous utiliseriez un service comme:
      // - SendGrid avec API
      // - Nodemailer avec un serveur backend
      // - Service cloud comme AWS SES
      
      console.log('PDF généré:', pdfBlob);
      console.log('Email data:', emailData);
      
      return true;
    } catch (error) {
      console.error('Erreur lors de l\'envoi avec PDF:', error);
      return false;
    }
  }
}