import html2pdf from 'html2pdf.js';
import { Invoice } from '../types';
import { AdvancedPDFService } from './advancedPdfService';

export class PDFService {
  // 🎯 MÉTHODE PRINCIPALE - UTILISE L'APERÇU EXACT POUR GÉNÉRER LE PDF
  static async generateInvoicePDF(invoice: Invoice, elementId?: string): Promise<Blob> {
    try {
      console.log('🎯 GÉNÉRATION PDF À PARTIR DE L\'APERÇU EXACT');
      
      // PRIORITÉ 1: Utiliser l'aperçu HTML si disponible (identique à ce que voit l'utilisateur)
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          console.log('✅ Utilisation de l\'aperçu HTML pour générer le PDF identique');
          return await this.generateHTMLToPDF(invoice, elementId);
        }
      }
      
      // PRIORITÉ 2: Utiliser l'aperçu de la facture si disponible
      const previewElement = document.getElementById('facture-apercu');
      if (previewElement) {
        console.log('✅ Utilisation de l\'aperçu de la facture pour générer le PDF identique');
        return await this.generateFromPreviewElement(invoice, 'facture-apercu');
      }
      
      // PRIORITÉ 3: Fallback vers le service avancé seulement si aucun aperçu disponible
      console.log('⚠️ Aucun aperçu disponible, utilisation du service avancé');
      return await AdvancedPDFService.getPDFBlob(invoice);
    } catch (error) {
      console.error('❌ Erreur génération PDF depuis aperçu:', error);
      throw new Error('Impossible de générer le PDF identique à l\'aperçu');
    }
  }

  // 🎯 MÉTHODE DE TÉLÉCHARGEMENT - UTILISE L'APERÇU EXACT
  static async downloadPDF(invoice: Invoice, elementId?: string): Promise<void> {
    try {
      console.log('📥 TÉLÉCHARGEMENT PDF IDENTIQUE À L\'APERÇU');
      
      // PRIORITÉ 1: Utiliser l'aperçu HTML si spécifié
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          console.log('✅ Téléchargement depuis l\'aperçu HTML spécifié');
          await this.downloadFromHTMLElement(invoice, elementId);
          return;
        }
      }
      
      // PRIORITÉ 2: Chercher l'aperçu de la facture
      const previewElement = document.getElementById('facture-apercu');
      if (previewElement) {
        console.log('✅ Téléchargement depuis l\'aperçu de la facture');
        await this.downloadFromHTMLElement(invoice, 'facture-apercu');
        return;
      }
      
      // PRIORITÉ 3: Chercher l'aperçu dans le modal PDF
      const pdfPreviewElement = document.getElementById('pdf-preview-content');
      if (pdfPreviewElement) {
        console.log('✅ Téléchargement depuis l\'aperçu du modal PDF');
        await this.downloadFromHTMLElement(invoice, 'pdf-preview-content');
        return;
      }
      
      // PRIORITÉ 4: Fallback vers le service avancé
      console.log('⚠️ Aucun aperçu trouvé, utilisation du service avancé');
      await AdvancedPDFService.downloadPDF(invoice);
    } catch (error) {
      console.error('❌ Erreur téléchargement PDF depuis aperçu:', error);
      throw new Error('Impossible de télécharger le PDF identique à l\'aperçu');
    }
  }

  // 🎯 GÉNÉRATION PDF DEPUIS UN ÉLÉMENT HTML SPÉCIFIQUE (APERÇU)
  private static async generateFromPreviewElement(invoice: Invoice, elementId: string): Promise<Blob> {
    console.log(`🎯 Génération PDF depuis l'élément: ${elementId}`);
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Élément ${elementId} non trouvé`);
    }

    // Configuration optimisée pour reproduire exactement l'aperçu
    const options = {
      margin: [10, 10, 10, 10], // Marges en mm
      filename: `facture_${invoice.invoiceNumber}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.95 // Haute qualité pour correspondre à l'aperçu
      },
      html2canvas: { 
        scale: 2, // Haute résolution
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
      console.log('🔄 Conversion HTML vers PDF avec options optimisées...');
      const pdf = await html2pdf().from(element).set(options).outputPdf('blob');
      console.log('✅ PDF généré depuis l\'aperçu avec succès');
      return pdf;
    } catch (error) {
      console.error('❌ Erreur conversion HTML vers PDF:', error);
      throw new Error('Erreur lors de la conversion de l\'aperçu en PDF');
    }
  }

  // 🎯 TÉLÉCHARGEMENT DEPUIS UN ÉLÉMENT HTML SPÉCIFIQUE
  private static async downloadFromHTMLElement(invoice: Invoice, elementId: string): Promise<void> {
    console.log(`📥 Téléchargement PDF depuis l'élément: ${elementId}`);
    
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Élément ${elementId} non trouvé pour le téléchargement`);
    }

    // Configuration identique à la génération pour cohérence
    const options = {
      margin: [10, 10, 10, 10],
      filename: `facture_${invoice.invoiceNumber}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.95
      },
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
      console.log('🔄 Téléchargement direct depuis l\'aperçu...');
      await html2pdf().from(element).set(options).save();
      console.log('✅ PDF téléchargé depuis l\'aperçu avec succès');
    } catch (error) {
      console.error('❌ Erreur téléchargement depuis aperçu:', error);
      throw new Error('Erreur lors du téléchargement du PDF depuis l\'aperçu');
    }
  }

  // 🎯 MÉTHODE GÉNÉRIQUE HTML VERS PDF (UTILISÉE EN INTERNE)
  private static async generateHTMLToPDF(invoice: Invoice, elementId: string): Promise<Blob> {
    return await this.generateFromPreviewElement(invoice, elementId);
  }

  // 🖨️ IMPRESSION (UTILISE AUSSI L'APERÇU)
  static printInvoice(elementId: string, invoiceNumber: string): void {
    console.log(`🖨️ Impression depuis l'aperçu: ${elementId}`);
    
    const printContent = document.getElementById(elementId);
    
    if (!printContent) {
      // Fallback: chercher l'aperçu de la facture
      const fallbackElement = document.getElementById('facture-apercu');
      if (fallbackElement) {
        console.log('🔄 Utilisation de l\'aperçu de la facture pour l\'impression');
        this.printFromElement(fallbackElement, invoiceNumber);
        return;
      }
      throw new Error('Aucun contenu d\'aperçu trouvé pour l\'impression');
    }

    this.printFromElement(printContent, invoiceNumber);
  }

  // 🖨️ IMPRESSION DEPUIS UN ÉLÉMENT SPÉCIFIQUE
  private static printFromElement(element: HTMLElement, invoiceNumber: string): void {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
    }

    // Copier exactement le contenu de l'aperçu
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
              padding: 20px; 
              background: white;
              color: black;
            }
            @media print {
              .no-print { display: none !important; }
              body { -webkit-print-color-adjust: exact; }
              * { print-color-adjust: exact; }
              @page { margin: 0.5in; }
            }
            /* Assurer que les couleurs sont visibles à l'impression */
            .bg-\\[\\#477A0C\\] { background-color: #477A0C !important; }
            .text-\\[\\#F2EFE2\\] { color: #F2EFE2 !important; }
            .text-black { color: black !important; }
            .font-bold { font-weight: bold !important; }
            .font-semibold { font-weight: 600 !important; }
          </style>
        </head>
        <body class="bg-white">
          ${element.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
      }, 500);
    };
  }
}