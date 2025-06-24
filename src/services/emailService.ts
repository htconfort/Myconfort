import emailjs from '@emailjs/browser';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

// Configuration EmailJS - À remplacer par vos vraies clés
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
  static async initialize(): Promise<boolean> {
    try {
      emailjs.init(EMAILJS_PUBLIC_KEY);
      console.log('EmailJS initialisé avec succès');
      return true;
    } catch (error) {
      console.error('Erreur d\'initialisation EmailJS:', error);
      return false;
    }
  }

  static async sendInvoiceByEmail(pdf: any, invoice: Invoice, customMessage?: string): Promise<boolean> {
    try {
      // Convertir le PDF en blob puis en base64
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

      // Préparer les données pour EmailJS
      const templateParams = {
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        from_name: invoice.advisorName || 'FactuFlash',
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(totalAmount),
        message: customMessage || `Bonjour ${invoice.client.name},\n\nVeuillez trouver ci-joint votre facture n°${invoice.invoiceNumber}.\n\nCordialement,\n${invoice.advisorName || 'L\'équipe FactuFlash'}`,
        invoice_pdf: base64PDF.split(',')[1], // Enlever le préfixe data:application/pdf;base64,
        reply_to: 'contact@factuflash.com'
      };

      console.log('Envoi de l\'email avec les paramètres:', {
        ...templateParams,
        invoice_pdf: '[PDF_DATA]' // Masquer les données PDF dans les logs
      });

      const response = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams
      );

      console.log('Réponse EmailJS:', response);
      return response.status === 200;
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
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
        reply_to: 'contact@factuflash.com'
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
      // Convertir le blob PDF en base64
      const base64PDF = await this.blobToBase64(pdfBlob);
      
      const templateParams = {
        to_email: emailData.to_email,
        to_name: emailData.to_name,
        from_name: emailData.from_name,
        invoice_number: emailData.invoice_number,
        invoice_date: emailData.invoice_date,
        total_amount: emailData.total_amount,
        message: emailData.message,
        invoice_pdf: base64PDF.split(',')[1], // Enlever le préfixe
        reply_to: 'contact@factuflash.com'
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
           EMAILJS_SERVICE_ID !== 'service_factuflash' && 
           EMAILJS_TEMPLATE_ID !== 'template_invoice';
  }
}