import html2pdf from 'html2pdf.js';
import { Invoice } from '../types';

export class PDFService {
  // 🎯 MÉTHODE PRINCIPALE - GÉNÉRATION PDF DEPUIS REF EXACT
  static async generateInvoicePDF(invoice: Invoice, previewRef?: React.RefObject<HTMLDivElement>): Promise<Blob> {
    try {
      console.log('🎯 GÉNÉRATION PDF DEPUIS REF EXACT - COHÉRENCE GARANTIE');
      
      let element: HTMLElement | null = null;
      
      // 🥇 PRIORITÉ 1: Utiliser le ref fourni (aperçu modal)
      if (previewRef?.current) {
        element = previewRef.current;
        console.log('✅ Utilisation du ref fourni (aperçu modal)');
      }
      // 🥇 PRIORITÉ 2: Chercher l'élément .facture-apercu (aperçu principal)
      else {
        element = document.querySelector('.facture-apercu') as HTMLElement;
        if (element) {
          console.log('✅ Utilisation de l\'aperçu .facture-apercu (aperçu principal)');
        }
      }
      
      // 🥇 PRIORITÉ 3: Fallback vers les autres éléments
      if (!element) {
        element = document.getElementById('pdf-preview-content') || 
                  document.getElementById('facture-apercu') ||
                  document.querySelector('[class*="invoice"]') as HTMLElement;
      }
      
      if (!element) {
        throw new Error('❌ Aucun élément d\'aperçu trouvé pour la génération PDF');
      }
      
      return await this.generateFromHTMLElementWithYourExactScript(invoice, element);
    } catch (error) {
      console.error('❌ Erreur génération PDF depuis aperçu:', error);
      throw new Error('Impossible de générer le PDF identique à l\'aperçu');
    }
  }

  // 🎯 MÉTHODE DE TÉLÉCHARGEMENT - DEPUIS REF EXACT
  static async downloadPDF(invoice: Invoice, previewRef?: React.RefObject<HTMLDivElement>): Promise<void> {
    try {
      console.log('📥 TÉLÉCHARGEMENT PDF DEPUIS REF EXACT - COHÉRENCE GARANTIE');
      
      let element: HTMLElement | null = null;
      
      // 🥇 PRIORITÉ 1: Utiliser le ref fourni
      if (previewRef?.current) {
        element = previewRef.current;
        console.log('✅ Téléchargement depuis le ref fourni');
      }
      // 🥇 PRIORITÉ 2: Chercher l'aperçu principal
      else {
        element = document.querySelector('.facture-apercu') as HTMLElement;
        if (element) {
          console.log('✅ Téléchargement depuis l\'aperçu principal');
        }
      }
      
      // 🥇 PRIORITÉ 3: Fallback
      if (!element) {
        element = document.getElementById('pdf-preview-content') || 
                  document.getElementById('facture-apercu') ||
                  document.querySelector('[class*="invoice"]') as HTMLElement;
      }
      
      if (!element) {
        throw new Error('❌ Aucun élément d\'aperçu trouvé pour le téléchargement');
      }
      
      await this.downloadFromHTMLElementWithYourExactScript(invoice, element);
    } catch (error) {
      console.error('❌ Erreur téléchargement PDF depuis aperçu:', error);
      throw new Error('Impossible de télécharger le PDF identique à l\'aperçu');
    }
  }

  // 🎯 GÉNÉRATION PDF AVEC VOTRE SCRIPT EXACT
  private static async generateFromHTMLElementWithYourExactScript(invoice: Invoice, element: HTMLElement): Promise<Blob> {
    console.log('🎯 Génération PDF avec votre script exact depuis l\'élément fourni');
    
    // Attendre que l'élément soit complètement rendu
    await this.waitForElementToRender(element);
    
    // 📋 VOTRE CONFIGURATION EXACTE - IDENTIQUE À VOTRE SCRIPT
    const opt = {
      margin: 0,
      filename: 'facture_MYCONFORT.pdf',
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    try {
      console.log('🔄 Conversion HTML vers PDF avec votre script exact...');
      console.log('📐 Configuration utilisée:', opt);
      console.log('📐 Dimensions élément:', {
        width: element.scrollWidth,
        height: element.scrollHeight,
        offsetWidth: element.offsetWidth,
        offsetHeight: element.offsetHeight
      });
      
      // 🎯 UTILISATION EXACTE DE VOTRE SCRIPT
      const pdf = await html2pdf().set(opt).from(element).outputPdf('blob');
      console.log('✅ PDF généré avec votre script exact - COHÉRENCE GARANTIE');
      return pdf;
    } catch (error) {
      console.error('❌ Erreur conversion HTML vers PDF:', error);
      throw new Error('Erreur lors de la conversion de l\'aperçu en PDF avec votre script');
    }
  }

  // 🎯 TÉLÉCHARGEMENT DIRECT AVEC VOTRE SCRIPT EXACT  
  private static async downloadFromHTMLElementWithYourExactScript(invoice: Invoice, element: HTMLElement): Promise<void> {
    console.log('📥 Téléchargement direct avec votre script depuis l\'élément fourni');
    
    // Attendre que l'élément soit complètement rendu
    await this.waitForElementToRender(element);
    
    // 📋 VOTRE CONFIGURATION EXACTE - IDENTIQUE À VOTRE SCRIPT
    const opt = {
      margin: 0,
      filename: `facture_MYCONFORT_${invoice.invoiceNumber}.pdf`,
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    try {
      console.log('🔄 Téléchargement direct avec votre script exact...');
      console.log('📐 Configuration utilisée:', opt);
      
      // 🎯 UTILISATION EXACTE DE VOTRE SCRIPT POUR TÉLÉCHARGEMENT
      await html2pdf().set(opt).from(element).save();
      console.log('✅ PDF téléchargé avec votre script exact - COHÉRENCE GARANTIE');
    } catch (error) {
      console.error('❌ Erreur téléchargement avec votre script:', error);
      throw new Error('Erreur lors du téléchargement du PDF depuis l\'aperçu avec votre script');
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
        setTimeout(resolve, 200);
        return;
      }
      
      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages >= images.length) {
          // Toutes les images sont chargées, attendre un peu plus pour le rendu final
          setTimeout(resolve, 300);
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
      setTimeout(resolve, 3000);
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
              padding: 0; 
              background: white; 
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

  // 🚀 MÉTHODE GLOBALE POUR UTILISER VOTRE SCRIPT EXACT
  static async generateWithYourExactScript(): Promise<void> {
    console.log('🚀 GÉNÉRATION PDF AVEC VOTRE SCRIPT EXACT - COHÉRENCE GARANTIE');
    
    const element = document.querySelector('.facture-apercu') || document.getElementById('invoice');
    if (!element) {
      alert('❌ Élément facture non trouvé. Assurez-vous qu\'une facture est affichée.');
      return;
    }
    
    // VOTRE CONFIGURATION EXACTE
    const opt = {
      margin: 0,
      filename: 'facture_MYCONFORT.pdf',
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };
    
    try {
      console.log('🔄 Génération PDF avec votre script exact...');
      console.log('📐 Configuration utilisée:', opt);
      await html2pdf().set(opt).from(element).save();
      console.log('✅ PDF généré avec succès - COHÉRENCE GARANTIE !');
      alert('✅ PDF téléchargé avec succès ! Le fichier est cohérent avec l\'aperçu.');
    } catch (error) {
      console.error('❌ Erreur génération PDF:', error);
      alert('❌ Erreur lors de la génération du PDF');
    }
  }
}
