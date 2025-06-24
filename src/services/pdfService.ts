import html2pdf from 'html2pdf.js';
import { Invoice } from '../types';
import { AdvancedPDFService } from './advancedPdfService';

export class PDFService {
  // Méthode principale utilisant le service avancé qui reproduit l'aperçu
  static async generateInvoicePDF(invoice: Invoice, elementId?: string): Promise<Blob> {
    try {
      // Utiliser le service PDF avancé qui reproduit exactement l'aperçu
      console.log('🎨 Génération PDF avec design identique à l\'aperçu Bolt');
      return await AdvancedPDFService.getPDFBlob(invoice);
    } catch (error) {
      console.error('Erreur avec le service avancé, fallback vers html2pdf:', error);
      
      // Fallback vers html2pdf si le service avancé échoue
      if (elementId) {
        return await this.generateHTMLToPDF(invoice, elementId);
      }
      throw new Error('Impossible de générer le PDF');
    }
  }

  // Méthode de fallback utilisant html2pdf
  private static async generateHTMLToPDF(invoice: Invoice, elementId: string): Promise<Blob> {
    const element = document.getElementById(elementId);
    
    if (!element) {
      throw new Error('Élément PDF non trouvé');
    }

    const options = {
      margin: 0,
      filename: `facture_${invoice.invoiceNumber}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.98 
      },
      html2canvas: { 
        scale: 2,
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff'
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    try {
      const pdf = await html2pdf().from(element).set(options).outputPdf('blob');
      return pdf;
    } catch (error) {
      console.error('Erreur lors de la génération PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  static async downloadPDF(invoice: Invoice, elementId?: string): Promise<void> {
    try {
      // Utiliser le service avancé qui reproduit exactement l'aperçu
      console.log('📥 Téléchargement PDF avec design identique à l\'aperçu');
      await AdvancedPDFService.downloadPDF(invoice);
    } catch (error) {
      console.error('Erreur avec le service avancé, fallback vers html2pdf:', error);
      
      // Fallback vers html2pdf
      if (elementId) {
        const element = document.getElementById(elementId);
        
        if (!element) {
          throw new Error('Élément PDF non trouvé');
        }

        const options = {
          margin: 0,
          filename: `facture_${invoice.invoiceNumber}.pdf`,
          image: { 
            type: 'jpeg', 
            quality: 0.98 
          },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: true,
            backgroundColor: '#ffffff'
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          }
        };

        await html2pdf().from(element).set(options).save();
      } else {
        throw new Error('Impossible de télécharger le PDF');
      }
    }
  }

  static printInvoice(elementId: string, invoiceNumber: string): void {
    const printContent = document.getElementById(elementId);
    
    if (!printContent) {
      throw new Error('Contenu à imprimer non trouvé');
    }

    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoiceNumber}</title>
          <link href="https://cdn.tailwindcss.com" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 0; 
              background: white;
            }
            @media print {
              .no-print { display: none !important; }
              body { -webkit-print-color-adjust: exact; }
              * { print-color-adjust: exact; }
            }
          </style>
        </head>
        <body class="bg-white">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.print();
  }
}