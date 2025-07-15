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

      // Créer le PDF avec jsPDF pour gérer les pages multiples
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // PAGE 1 - FACTURE
      const invoicePage = element.querySelector('.invoice-page') as HTMLElement;
      if (invoicePage) {
        const canvas1 = await html2canvas(invoicePage, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: invoicePage.scrollWidth,
          height: invoicePage.scrollHeight
        });

        const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth1 = canvas1.width;
        const imgHeight1 = canvas1.height;
        const ratio1 = Math.min(pdfWidth / imgWidth1, pdfHeight / imgHeight1);
        const imgX1 = (pdfWidth - imgWidth1 * ratio1) / 2;
        const imgY1 = 0;

        pdf.addImage(imgData1, 'JPEG', imgX1, imgY1, imgWidth1 * ratio1, imgHeight1 * ratio1);
      }

      // PAGE 2 - CONDITIONS GÉNÉRALES DE VENTE
      const termsPage = element.querySelector('.terms-page') as HTMLElement;
      if (termsPage) {
        // Ajouter une nouvelle page
        pdf.addPage();
        
        const canvas2 = await html2canvas(termsPage, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: termsPage.scrollWidth,
          height: termsPage.scrollHeight
        });

        const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
        const imgWidth2 = canvas2.width;
        const imgHeight2 = canvas2.height;
        const ratio2 = Math.min(pdfWidth / imgWidth2, pdfHeight / imgHeight2);
        const imgX2 = (pdfWidth - imgWidth2 * ratio2) / 2;
        const imgY2 = 0;

        pdf.addImage(imgData2, 'JPEG', imgX2, imgY2, imgWidth2 * ratio2, imgHeight2 * ratio2);
      }

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