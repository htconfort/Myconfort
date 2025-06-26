import html2pdf from 'html2pdf.js';
import { Invoice } from '../types';
import { AdvancedPDFService } from './advancedPdfService';

export class PDFService {
  // 🎯 MÉTHODE PRINCIPALE - PRIORITÉ ABSOLUE À L'APERÇU HTML AFFICHÉ (.facture-apercu)
  static async generateInvoicePDF(invoice: Invoice, elementId?: string): Promise<Blob> {
    try {
      console.log('🎯 GÉNÉRATION PDF IDENTIQUE À L\'APERÇU AFFICHÉ (.facture-apercu)');
      
      // 🥇 PRIORITÉ 1: Chercher l'élément .facture-apercu (votre conteneur exact)
      const factureApercuElement = document.querySelector('.facture-apercu') as HTMLElement;
      if (factureApercuElement) {
        console.log('✅ Utilisation de l\'aperçu .facture-apercu (conteneur exact)');
        return await this.generateFromHTMLElementWithYourScript(invoice, factureApercuElement, 'facture-apercu');
      }
      
      // 🥇 PRIORITÉ 2: Aperçu spécifique demandé (modal PDF, etc.)
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          console.log(`✅ Utilisation de l'aperçu spécifique: ${elementId}`);
          return await this.generateFromHTMLElementWithYourScript(invoice, element, elementId);
        }
      }
      
      // 🥇 PRIORITÉ 3: Aperçu principal de la facture (section principale)
      const mainPreviewElement = document.getElementById('facture-apercu');
      if (mainPreviewElement) {
        console.log('✅ Utilisation de l\'aperçu principal de la facture');
        return await this.generateFromHTMLElementWithYourScript(invoice, mainPreviewElement, 'facture-apercu');
      }
      
      // 🥇 PRIORITÉ 4: Aperçu dans le modal PDF
      const pdfPreviewElement = document.getElementById('pdf-preview-content');
      if (pdfPreviewElement) {
        console.log('✅ Utilisation de l\'aperçu du modal PDF');
        return await this.generateFromHTMLElementWithYourScript(invoice, pdfPreviewElement, 'pdf-preview-content');
      }
      
      // 🥇 PRIORITÉ 5: Recherche d'autres aperçus disponibles
      const invoicePreviewElement = document.querySelector('[id*="invoice"], [id*="apercu"], [class*="invoice"], [class*="apercu"]') as HTMLElement;
      if (invoicePreviewElement) {
        console.log('✅ Utilisation d\'un aperçu trouvé automatiquement');
        return await this.generateFromHTMLElementWithYourScript(invoice, invoicePreviewElement, 'apercu-automatique');
      }
      
      // 🔄 FALLBACK: Service avancé seulement si aucun aperçu HTML disponible
      console.warn('⚠️ Aucun aperçu HTML trouvé, utilisation du service avancé (peut différer de l\'aperçu)');
      return await AdvancedPDFService.getPDFBlob(invoice);
    } catch (error) {
      console.error('❌ Erreur génération PDF depuis aperçu:', error);
      throw new Error('Impossible de générer le PDF identique à l\'aperçu');
    }
  }

  // 🎯 MÉTHODE DE TÉLÉCHARGEMENT - PRIORITÉ ABSOLUE À L'APERÇU HTML (.facture-apercu)
  static async downloadPDF(invoice: Invoice, elementId?: string): Promise<void> {
    try {
      console.log('📥 TÉLÉCHARGEMENT PDF IDENTIQUE À L\'APERÇU (.facture-apercu)');
      
      // 🥇 PRIORITÉ 1: Chercher l'élément .facture-apercu (votre conteneur exact)
      const factureApercuElement = document.querySelector('.facture-apercu') as HTMLElement;
      if (factureApercuElement) {
        console.log('✅ Téléchargement depuis l\'aperçu .facture-apercu (conteneur exact)');
        await this.downloadFromHTMLElementWithYourScript(invoice, factureApercuElement, 'facture-apercu');
        return;
      }
      
      // 🥇 PRIORITÉ 2: Aperçu spécifique demandé
      if (elementId) {
        const element = document.getElementById(elementId);
        if (element) {
          console.log(`✅ Téléchargement depuis l'aperçu spécifique: ${elementId}`);
          await this.downloadFromHTMLElementWithYourScript(invoice, element, elementId);
          return;
        }
      }
      
      // 🥇 PRIORITÉ 3: Aperçu principal de la facture
      const mainPreviewElement = document.getElementById('facture-apercu');
      if (mainPreviewElement) {
        console.log('✅ Téléchargement depuis l\'aperçu principal');
        await this.downloadFromHTMLElementWithYourScript(invoice, mainPreviewElement, 'facture-apercu');
        return;
      }
      
      // 🥇 PRIORITÉ 4: Aperçu dans le modal PDF
      const pdfPreviewElement = document.getElementById('pdf-preview-content');
      if (pdfPreviewElement) {
        console.log('✅ Téléchargement depuis l\'aperçu du modal PDF');
        await this.downloadFromHTMLElementWithYourScript(invoice, pdfPreviewElement, 'pdf-preview-content');
        return;
      }
      
      // 🥇 PRIORITÉ 5: Recherche automatique d'aperçus
      const invoicePreviewElement = document.querySelector('[id*="invoice"], [id*="apercu"], [class*="invoice"], [class*="apercu"]') as HTMLElement;
      if (invoicePreviewElement) {
        console.log('✅ Téléchargement depuis aperçu trouvé automatiquement');
        await this.downloadFromHTMLElementWithYourScript(invoice, invoicePreviewElement, 'apercu-automatique');
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

  // 🎯 GÉNÉRATION PDF AVEC VOTRE SCRIPT EXACT (WYSIWYG PARFAIT)
  private static async generateFromHTMLElementWithYourScript(invoice: Invoice, element: HTMLElement, elementId: string): Promise<Blob> {
    console.log(`🎯 Génération PDF WYSIWYG avec votre script depuis: ${elementId}`);
    
    // Attendre que l'élément soit complètement rendu
    await this.waitForElementToRender(element);
    
    // 📋 CONFIGURATION EXACTE DE VOTRE SCRIPT
    const opt = {
      margin: 0,
      filename: `facture_MYCONFORT_${invoice.invoiceNumber}.pdf`,
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
      }
    };

    try {
      console.log('🔄 Conversion HTML vers PDF avec votre script exact...');
      console.log('📐 Dimensions élément:', {
        width: element.scrollWidth,
        height: element.scrollHeight,
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight
      });
      
      // 🎯 UTILISATION EXACTE DE VOTRE SCRIPT
      const pdf = await html2pdf().set(opt).from(element).outputPdf('blob');
      console.log('✅ PDF généré avec correspondance exacte à l\'aperçu (votre script)');
      return pdf;
    } catch (error) {
      console.error('❌ Erreur conversion HTML vers PDF avec votre script:', error);
      throw new Error(`Erreur lors de la conversion de l'aperçu ${elementId} en PDF avec votre script`);
    }
  }

  // 🎯 TÉLÉCHARGEMENT DIRECT AVEC VOTRE SCRIPT EXACT
  private static async downloadFromHTMLElementWithYourScript(invoice: Invoice, element: HTMLElement, elementId: string): Promise<void> {
    console.log(`📥 Téléchargement direct avec votre script depuis: ${elementId}`);
    
    // Attendre que l'élément soit complètement rendu
    await this.waitForElementToRender(element);
    
    // 📋 CONFIGURATION EXACTE DE VOTRE SCRIPT
    const opt = {
      margin: 0,
      filename: `facture_MYCONFORT_${invoice.invoiceNumber}.pdf`,
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
      }
    };

    try {
      console.log('🔄 Téléchargement direct avec votre script exact...');
      
      // 🎯 UTILISATION EXACTE DE VOTRE SCRIPT POUR TÉLÉCHARGEMENT
      await html2pdf().set(opt).from(element).save();
      console.log('✅ PDF téléchargé avec correspondance exacte à l\'aperçu (votre script)');
    } catch (error) {
      console.error('❌ Erreur téléchargement avec votre script:', error);
      throw new Error(`Erreur lors du téléchargement du PDF depuis l'aperçu ${elementId} avec votre script`);
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

  // 🖨️ IMPRESSION DEPUIS L'APERÇU (.facture-apercu en priorité)
  static printInvoice(elementId: string, invoiceNumber: string): void {
    console.log(`🖨️ Impression depuis l'aperçu: ${elementId}`);
    
    // 🥇 PRIORITÉ 1: Chercher l'élément .facture-apercu
    let printContent = document.querySelector('.facture-apercu') as HTMLElement;
    
    if (!printContent) {
      // Chercher l'élément spécifique demandé
      printContent = document.getElementById(elementId);
      if (printContent) {
        console.log(`🔄 Utilisation de l'élément spécifique: ${elementId}`);
      }
    } else {
      console.log('🔄 Utilisation de l\'aperçu .facture-apercu pour l\'impression');
    }
    
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
    
    // Chercher l'élément .facture-apercu en priorité
    const factureApercuElement = document.querySelector('.facture-apercu');
    if (factureApercuElement) {
      previews.push('CLASS: .facture-apercu (PRIORITÉ 1 - Votre conteneur exact)');
    }
    
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

  // 🎯 MÉTHODE POUR TESTER VOTRE SCRIPT EXACT
  static async testYourScript(invoice: Invoice): Promise<void> {
    console.log('🧪 TEST DE VOTRE SCRIPT EXACT');
    
    // Chercher l'élément .facture-apercu
    const element = document.querySelector('.facture-apercu') as HTMLElement;
    
    if (!element) {
      console.error('❌ Élément .facture-apercu non trouvé pour le test');
      alert('Élément .facture-apercu non trouvé. Assurez-vous que l\'aperçu est affiché.');
      return;
    }
    
    // Configuration exacte de votre script
    const opt = {
      margin: 0,
      filename: 'facture_MYCONFORT.pdf',
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    try {
      console.log('🔄 Test de votre script avec l\'élément .facture-apercu...');
      await html2pdf().set(opt).from(element).save();
      console.log('✅ Test réussi ! PDF généré avec votre script exact');
      alert('✅ Test réussi ! Le PDF a été généré avec votre script exact.');
    } catch (error) {
      console.error('❌ Erreur lors du test de votre script:', error);
      alert('❌ Erreur lors du test. Vérifiez la console pour plus de détails.');
    }
  }
}