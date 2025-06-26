import html2pdf from 'html2pdf.js';
import { Invoice } from '../types';
import { AdvancedPDFService } from './advancedPdfService';

export class PDFService {
  // 🎯 MÉTHODE PRINCIPALE - PRIORITÉ ABSOLUE À L'APERÇU HTML AFFICHÉ
  static async generateInvoicePDF(invoice: Invoice, elementId?: string): Promise<Blob> {
    try {
      console.log('🎯 GÉNÉRATION PDF IDENTIQUE À L\'APERÇU AFFICHÉ DANS BOLT');
      
      // 🥇 PRIORITÉ 1: Aperçu spécifique demandé (modal PDF, etc.)
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          console.log(`✅ Utilisation de l'aperçu spécifique: ${elementId}`);
          return await this.generateFromHTMLElement(invoice, element, elementId);
        }
      }
      
      // 🥇 PRIORITÉ 2: Aperçu principal de la facture (section principale)
      const mainPreviewElement = document.getElementById('facture-apercu');
      if (mainPreviewElement) {
        console.log('✅ Utilisation de l\'aperçu principal de la facture');
        return await this.generateFromHTMLElement(invoice, mainPreviewElement, 'facture-apercu');
      }
      
      // 🥇 PRIORITÉ 3: Aperçu dans le modal PDF
      const pdfPreviewElement = document.getElementById('pdf-preview-content');
      if (pdfPreviewElement) {
        console.log('✅ Utilisation de l\'aperçu du modal PDF');
        return await this.generateFromHTMLElement(invoice, pdfPreviewElement, 'pdf-preview-content');
      }
      
      // 🥇 PRIORITÉ 4: Recherche d'autres aperçus disponibles
      const invoicePreviewElement = document.querySelector('[id*="invoice"], [id*="apercu"], [class*="invoice"], [class*="apercu"]') as HTMLElement;
      if (invoicePreviewElement) {
        console.log('✅ Utilisation d\'un aperçu trouvé automatiquement');
        return await this.generateFromHTMLElement(invoice, invoicePreviewElement, 'apercu-automatique');
      }
      
      // 🔄 FALLBACK: Service avancé seulement si aucun aperçu HTML disponible
      console.warn('⚠️ Aucun aperçu HTML trouvé, utilisation du service avancé (peut différer de l\'aperçu)');
      return await AdvancedPDFService.getPDFBlob(invoice);
    } catch (error) {
      console.error('❌ Erreur génération PDF depuis aperçu:', error);
      throw new Error('Impossible de générer le PDF identique à l\'aperçu');
    }
  }

  // 🎯 MÉTHODE DE TÉLÉCHARGEMENT - PRIORITÉ ABSOLUE À L'APERÇU HTML
  static async downloadPDF(invoice: Invoice, elementId?: string): Promise<void> {
    try {
      console.log('📥 TÉLÉCHARGEMENT PDF IDENTIQUE À L\'APERÇU AFFICHÉ');
      
      // 🥇 PRIORITÉ 1: Aperçu spécifique demandé
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          console.log(`✅ Téléchargement depuis l'aperçu spécifique: ${elementId}`);
          await this.downloadFromHTMLElement(invoice, element, elementId);
          return;
        }
      }
      
      // 🥇 PRIORITÉ 2: Aperçu principal de la facture
      const mainPreviewElement = document.getElementById('facture-apercu');
      if (mainPreviewElement) {
        console.log('✅ Téléchargement depuis l\'aperçu principal');
        await this.downloadFromHTMLElement(invoice, mainPreviewElement, 'facture-apercu');
        return;
      }
      
      // 🥇 PRIORITÉ 3: Aperçu dans le modal PDF
      const pdfPreviewElement = document.getElementById('pdf-preview-content');
      if (pdfPreviewElement) {
        console.log('✅ Téléchargement depuis l\'aperçu du modal PDF');
        await this.downloadFromHTMLElement(invoice, pdfPreviewElement, 'pdf-preview-content');
        return;
      }
      
      // 🥇 PRIORITÉ 4: Recherche automatique d'aperçus
      const invoicePreviewElement = document.querySelector('[id*="invoice"], [id*="apercu"], [class*="invoice"], [class*="apercu"]') as HTMLElement;
      if (invoicePreviewElement) {
        console.log('✅ Téléchargement depuis aperçu trouvé automatiquement');
        await this.downloadFromHTMLElement(invoice, invoicePreviewElement, 'apercu-automatique');
        return;
      }
      
      // 🔄 FALLBACK: Service avancé
      console.warn('⚠️ Aucun aperçu HTML trouvé, utilisation du service avancé');
      await AdvancedPDFService.downloadPDF(invoice);
    } catch (error) {
      console.error('❌ Erreur téléchargement PDF depuis aperçu:', error);
      throw new Error('Impossible de télécharger le PDF identique à l\'aperçu');
    }
  }

  // 🎯 GÉNÉRATION PDF DEPUIS UN ÉLÉMENT HTML SPÉCIFIQUE (WYSIWYG)
  private static async generateFromHTMLElement(invoice: Invoice, element: HTMLElement, elementId: string): Promise<Blob> {
    console.log(`🎯 Génération PDF WYSIWYG depuis: ${elementId}`);
    
    // Attendre que l'élément soit complètement rendu
    await this.waitForElementToRender(element);
    
    // Configuration optimisée pour reproduire EXACTEMENT l'aperçu
    const options = {
      margin: [5, 5, 5, 5], // Marges minimales pour correspondre à l'aperçu
      filename: `facture_${invoice.invoiceNumber}.pdf`,
      image: { 
        type: 'jpeg', 
        quality: 0.98 // Très haute qualité pour correspondance exacte
      },
      html2canvas: { 
        scale: 2, // Haute résolution pour netteté
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        // Options supplémentaires pour correspondance exacte
        foreignObjectRendering: true,
        removeContainer: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        precision: 16 // Haute précision pour correspondance exacte
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: '.no-page-break'
      }
    };

    try {
      console.log('🔄 Conversion HTML vers PDF avec correspondance exacte...');
      console.log('📐 Dimensions élément:', {
        width: element.scrollWidth,
        height: element.scrollHeight,
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight
      });
      
      const pdf = await html2pdf().from(element).set(options).outputPdf('blob');
      console.log('✅ PDF généré avec correspondance exacte à l\'aperçu');
      return pdf;
    } catch (error) {
      console.error('❌ Erreur conversion HTML vers PDF:', error);
      throw new Error(`Erreur lors de la conversion de l'aperçu ${elementId} en PDF`);
    }
  }

  // 🎯 TÉLÉCHARGEMENT DIRECT DEPUIS UN ÉLÉMENT HTML
  private static async downloadFromHTMLElement(invoice: Invoice, element: HTMLElement, elementId: string): Promise<void> {
    console.log(`📥 Téléchargement direct depuis: ${elementId}`);
    
    // Attendre que l'élément soit complètement rendu
    await this.waitForElementToRender(element);
    
    // Configuration identique à la génération pour cohérence parfaite
    const options = {
      margin: [5, 5, 5, 5],
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
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        foreignObjectRendering: true,
        removeContainer: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true,
        precision: 16
      },
      pagebreak: { 
        mode: ['avoid-all', 'css', 'legacy'],
        before: '.page-break-before',
        after: '.page-break-after',
        avoid: '.no-page-break'
      }
    };

    try {
      console.log('🔄 Téléchargement direct avec correspondance exacte...');
      await html2pdf().from(element).set(options).save();
      console.log('✅ PDF téléchargé avec correspondance exacte à l\'aperçu');
    } catch (error) {
      console.error('❌ Erreur téléchargement depuis aperçu:', error);
      throw new Error(`Erreur lors du téléchargement du PDF depuis l'aperçu ${elementId}`);
    }
  }

  // 🕐 ATTENDRE QUE L'ÉLÉMENT SOIT COMPLÈTEMENT RENDU
  private static async waitForElementToRender(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      // Attendre que toutes les images soient chargées
      const images = element.querySelectorAll('img');
      let loadedImages = 0;
      
      if (images.length === 0) {
        // Pas d'images, attendre un court délai pour le rendu CSS
        setTimeout(resolve, 100);
        return;
      }
      
      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages >= images.length) {
          // Toutes les images sont chargées, attendre un peu plus pour le rendu final
          setTimeout(resolve, 200);
        }
      };
      
      images.forEach((img) => {
        if (img.complete) {
          checkAllImagesLoaded();
        } else {
          img.onload = checkAllImagesLoaded;
          img.onerror = checkAllImagesLoaded; // Continuer même si une image échoue
        }
      });
      
      // Timeout de sécurité
      setTimeout(resolve, 2000);
    });
  }

  // 🖨️ IMPRESSION DEPUIS L'APERÇU
  static printInvoice(elementId: string, invoiceNumber: string): void {
    console.log(`🖨️ Impression depuis l'aperçu: ${elementId}`);
    
    // Chercher l'élément spécifique ou un aperçu disponible
    let printContent = document.getElementById(elementId);
    
    if (!printContent) {
      // Fallback: chercher l'aperçu principal
      printContent = document.getElementById('facture-apercu');
      if (printContent) {
        console.log('🔄 Utilisation de l\'aperçu principal pour l\'impression');
      }
    }
    
    if (!printContent) {
      // Fallback: chercher l'aperçu du modal
      printContent = document.getElementById('pdf-preview-content');
      if (printContent) {
        console.log('🔄 Utilisation de l\'aperçu du modal pour l\'impression');
      }
    }
    
    if (!printContent) {
      throw new Error('Aucun aperçu trouvé pour l\'impression');
    }

    this.printFromElement(printContent, invoiceNumber);
  }

  // 🖨️ IMPRESSION DEPUIS UN ÉLÉMENT SPÉCIFIQUE
  private static printFromElement(element: HTMLElement, invoiceNumber: string): void {
    const printWindow = window.open('', '_blank');
    
    if (!printWindow) {
      throw new Error('Impossible d\'ouvrir la fenêtre d\'impression');
    }

    // Copier exactement le contenu et les styles de l'aperçu
    const elementClone = element.cloneNode(true) as HTMLElement;
    
    // Récupérer tous les styles CSS appliqués
    const allStyles = Array.from(document.styleSheets)
      .map(styleSheet => {
        try {
          return Array.from(styleSheet.cssRules)
            .map(rule => rule.cssText)
            .join('\n');
        } catch (e) {
          console.warn('Impossible d\'accéder aux règles CSS:', e);
          return '';
        }
      })
      .join('\n');

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Facture ${invoiceNumber}</title>
          <meta charset="UTF-8">
          <link href="https://cdn.tailwindcss.com" rel="stylesheet">
          <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
          <style>
            body { 
              font-family: 'Inter', sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white;
              color: black;
              line-height: 1.5;
            }
            
            /* Styles pour l'impression */
            @media print {
              .no-print { display: none !important; }
              body { 
                -webkit-print-color-adjust: exact; 
                print-color-adjust: exact;
                margin: 0;
                padding: 10mm;
              }
              * { 
                print-color-adjust: exact; 
                -webkit-print-color-adjust: exact;
              }
              @page { 
                margin: 10mm; 
                size: A4;
              }
            }
            
            /* Préservation des couleurs MYCONFORT */
            .bg-\\[\\#477A0C\\] { background-color: #477A0C !important; }
            .text-\\[\\#F2EFE2\\] { color: #F2EFE2 !important; }
            .text-\\[\\#477A0C\\] { color: #477A0C !important; }
            .text-black { color: black !important; }
            .font-bold { font-weight: bold !important; }
            .font-semibold { font-weight: 600 !important; }
            
            /* Styles récupérés de la page */
            ${allStyles}
          </style>
        </head>
        <body class="bg-white">
          ${elementClone.innerHTML}
        </body>
      </html>
    `);
    
    printWindow.document.close();
    
    // Attendre que le contenu soit chargé avant d'imprimer
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        // Fermer la fenêtre après impression
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  }

  // 🔍 MÉTHODE DE DIAGNOSTIC - LISTER LES APERÇUS DISPONIBLES
  static listAvailablePreviews(): string[] {
    const previews: string[] = [];
    
    // Chercher les aperçus par ID
    const previewIds = [
      'facture-apercu',
      'pdf-preview-content',
      'invoice-preview',
      'apercu-facture'
    ];
    
    previewIds.forEach(id => {
      const element = document.getElementById(id);
      if (element) {
        previews.push(`ID: ${id} (${element.tagName})`);
      }
    });
    
    // Chercher les aperçus par classe ou attribut
    const previewSelectors = [
      '[class*="invoice"]',
      '[class*="apercu"]',
      '[class*="preview"]',
      '[id*="invoice"]',
      '[id*="apercu"]'
    ];
    
    previewSelectors.forEach(selector => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element, index) => {
        const id = element.id || `${selector}-${index}`;
        previews.push(`Selector: ${selector} -> ${id} (${element.tagName})`);
      });
    });
    
    console.log('🔍 Aperçus disponibles:', previews);
    return previews;
  }
}