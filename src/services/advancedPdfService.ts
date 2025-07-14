import { Invoice } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class AdvancedPDFService {
  /**
   * Télécharge le PDF d'une facture
   */
  static async downloadPDF(invoice: Invoice): Promise<void> {
    try {
      const pdfBlob = await this.getPDFBlob(invoice);
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_MYCONFORT_${invoice.invoiceNumber}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      throw new Error('Impossible de télécharger le PDF');
    }
  }

  /**
   * Génère un blob PDF d'une facture
   */
  static async getPDFBlob(invoice: Invoice): Promise<Blob> {
    try {
      // Chercher l'élément de la facture
      const element = document.querySelector('.facture-apercu') || 
                     document.getElementById('pdf-preview-content') ||
                     document.querySelector('[data-invoice-preview]');
      
      if (!element) {
        throw new Error('Élément facture non trouvé pour la génération PDF');
      }

      // Capturer l'élément avec html2canvas
      const canvas = await html2canvas(element as HTMLElement, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight
      });

      // Créer le PDF avec jsPDF
      const imgData = canvas.toDataURL('image/jpeg', 0.95);
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Calculer les dimensions pour s'adapter à A4
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const ratio = Math.min(pdfWidth / imgWidth, pdfHeight / imgHeight);
      const imgX = (pdfWidth - imgWidth * ratio) / 2;
      const imgY = 0;

      pdf.addImage(imgData, 'JPEG', imgX, imgY, imgWidth * ratio, imgHeight * ratio);

      // Retourner le blob
      return pdf.output('blob');
    } catch (error) {
      console.error('Erreur lors de la génération du blob PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  /**
   * Génère un PDF en base64
   */
  static async getPDFBase64(invoice: Invoice): Promise<string> {
    try {
      const pdfBlob = await this.getPDFBlob(invoice);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Erreur lecture du blob PDF'));
        reader.readAsDataURL(pdfBlob);
      });
    } catch (error) {
      console.error('Erreur lors de la génération PDF base64:', error);
      throw new Error('Impossible de générer le PDF en base64');
    }
  }
}