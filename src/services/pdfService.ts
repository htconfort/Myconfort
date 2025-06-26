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

  // 🎯 MÉTHODE POUR TESTER VOTRE SCRIPT EXACT AVEC CGV MYCONFORT
  static async testYourScript(invoice: Invoice): Promise<void> {
    console.log('🧪 TEST DE VOTRE SCRIPT EXACT : FACTURE + CGV MYCONFORT');
    
    // Chercher l'élément .facture-apercu
    const element = document.querySelector('.facture-apercu') as HTMLElement;
    
    if (!element) {
      console.error('❌ Élément .facture-apercu non trouvé pour le test');
      alert('❌ Élément .facture-apercu non trouvé. Assurez-vous que l\'aperçu est affiché.');
      return;
    }
    
    try {
      console.log('🔄 Test de votre script : PAGE 1 (Facture) + PAGE 2 (CGV MYCONFORT)...');
      
      // 📋 CRÉER UN CONTENEUR TEMPORAIRE AVEC FACTURE + CGV
      const tempContainer = await this.createFactureWithCGVContainer(invoice, element);
      
      // Configuration exacte de votre script
      const opt = {
        margin: 0,
        filename: `facture_MYCONFORT_${invoice.invoiceNumber}_avec_CGV.pdf`,
        html2canvas: { scale: 2, useCORS: true },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      
      await html2pdf().set(opt).from(tempContainer).save();
      
      // Nettoyer le conteneur temporaire
      document.body.removeChild(tempContainer);
      
      console.log('✅ Test réussi ! PDF généré : PAGE 1 (Facture) + PAGE 2 (CGV MYCONFORT)');
      alert('✅ Test réussi ! PDF avec CGV MYCONFORT généré avec votre script exact.\n\nContenu :\n• PAGE 1 : Votre facture\n• PAGE 2 : Conditions générales de vente MYCONFORT');
    } catch (error) {
      console.error('❌ Erreur lors du test de votre script avec CGV:', error);
      alert('❌ Erreur lors du test. Vérifiez la console pour plus de détails.');
    }
  }

  // 📋 CRÉER UN CONTENEUR TEMPORAIRE AVEC FACTURE + CGV MYCONFORT
  private static async createFactureWithCGVContainer(invoice: Invoice, factureElement: HTMLElement): Promise<HTMLElement> {
    console.log('📋 Création du conteneur temporaire : PAGE 1 (Facture) + PAGE 2 (CGV MYCONFORT)...');
    
    // Créer un conteneur temporaire
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.fontFamily = 'Inter, sans-serif';
    tempContainer.style.fontSize = '12px';
    tempContainer.style.lineHeight = '1.5';
    tempContainer.style.color = 'black';
    
    // PAGE 1: Cloner la facture existante (votre aperçu exact)
    console.log('📄 PAGE 1 : Clonage de votre facture (.facture-apercu)...');
    const factureClone = factureElement.cloneNode(true) as HTMLElement;
    factureClone.style.pageBreakAfter = 'always';
    factureClone.style.minHeight = '297mm';
    factureClone.style.backgroundColor = 'white';
    factureClone.style.padding = '10mm';
    tempContainer.appendChild(factureClone);
    
    // PAGE 2: Créer les CGV MYCONFORT
    console.log('📄 PAGE 2 : Création des CGV MYCONFORT...');
    const cgvPage = this.createCGVMyconfortPage(invoice);
    tempContainer.appendChild(cgvPage);
    
    // Ajouter au DOM temporairement
    document.body.appendChild(tempContainer);
    
    // Attendre le rendu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Conteneur temporaire créé : 2 pages prêtes');
    return tempContainer;
  }

  // 📋 CRÉER LA PAGE CGV MYCONFORT (PAGE 2)
  private static createCGVMyconfortPage(invoice: Invoice): HTMLElement {
    console.log('📋 Création de la page CGV MYCONFORT...');
    
    const cgvPage = document.createElement('div');
    cgvPage.style.minHeight = '297mm';
    cgvPage.style.width = '210mm';
    cgvPage.style.padding = '10mm';
    cgvPage.style.backgroundColor = 'white';
    cgvPage.style.pageBreakBefore = 'always';
    cgvPage.style.fontFamily = 'Inter, sans-serif';
    cgvPage.style.fontSize = '9px';
    cgvPage.style.lineHeight = '1.3';
    cgvPage.style.color = 'black';
    cgvPage.style.boxSizing = 'border-box';
    
    cgvPage.innerHTML = `
      <!-- En-tête CGV MYCONFORT -->
      <div style="background: linear-gradient(135deg, #477A0C, #5A8F0F); color: #F2EFE2; padding: 12px; text-align: center; margin-bottom: 15px; border-radius: 6px;">
        <h1 style="font-size: 16px; font-weight: bold; margin: 0;">CONDITIONS GÉNÉRALES DE VENTE</h1>
        <p style="font-size: 11px; margin: 3px 0 0 0;">MYCONFORT - Vente de matelas et literie</p>
      </div>
      
      <!-- Articles CGV MYCONFORT en 2 colonnes -->
      <div style="columns: 2; column-gap: 12px; font-size: 8px; line-height: 1.2;">
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 1 - LIVRAISON</h3>
          <p style="margin: 0; text-align: justify;">Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités (à la journée ou demi-journée). Le transporteur livre le produit au pas de porte ou en bas de l'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d'installation ou de reprise de l'ancienne literie n'est prévu.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 2 - DÉLAIS DE LIVRAISON</h3>
          <p style="margin: 0; text-align: justify;">Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 3 - RISQUES DE TRANSPORT</h3>
          <p style="margin: 0; text-align: justify;">Les marchandises voyagent aux risques du destinataire. En cas d'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoires sur le bordereau du transporteur.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 4 - ACCEPTATION DES CONDITIONS</h3>
          <p style="margin: 0; text-align: justify;">Toute livraison implique l'acceptation des présentes conditions. Le transporteur livre à l'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d'accepter les marchandises lors de la livraison.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 5 - RÉCLAMATIONS</h3>
          <p style="margin: 0; text-align: justify;">Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 6 - RETOURS</h3>
          <p style="margin: 0; text-align: justify;">Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 7 - TAILLES DES MATELAS</h3>
          <p style="margin: 0; text-align: justify;">Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 8 - ODEUR DES MATÉRIAUX</h3>
          <p style="margin: 0; text-align: justify;">Les mousses viscoélastiques naturelles (à base d'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur après déballage.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 9 - RÈGLEMENTS ET REMISES</h3>
          <p style="margin: 0; text-align: justify;">Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 10 - PAIEMENT</h3>
          <p style="margin: 0; text-align: justify;">Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 11 - PÉNALITÉS DE RETARD</h3>
          <p style="margin: 0; text-align: justify;">En cas de non-paiement, une majoration de 10% avec un minimum de 300 € sera appliquée.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 12 - EXIGIBILITÉ EN CAS DE NON-PAIEMENT</h3>
          <p style="margin: 0; text-align: justify;">Le non-paiement d'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 13 - LIVRAISON INCOMPLÈTE OU NON-CONFORME</h3>
          <p style="margin: 0; text-align: justify;">En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison. Contactez-nous sous 72h ouvrables si constatée après le départ du transporteur.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 14 - LITIGES</h3>
          <p style="margin: 0; text-align: justify;">Tout litige sera de la compétence exclusive du Tribunal de Commerce de Perpignan ou du tribunal compétent du prestataire.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 15 - HORAIRES DE LIVRAISON</h3>
          <p style="margin: 0; text-align: justify;">Les livraisons sont effectuées du lundi au vendredi. Une personne majeure doit être présente. Toute modification d'adresse doit être signalée immédiatement à myconfort66@gmail.com.</p>
        </div>
        
      </div>
      
      <!-- Informations légales MYCONFORT -->
      <div style="background: #f8f9fa; padding: 10px; margin-top: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
        <h3 style="color: #477A0C; font-weight: bold; font-size: 10px; margin: 0 0 6px 0;">INFORMATIONS LÉGALES MYCONFORT</h3>
        <div style="font-size: 8px; line-height: 1.3;">
          <p style="margin: 0 0 2px 0;"><strong>MYCONFORT</strong> - SARL au capital de 10 000 €</p>
          <p style="margin: 0 0 2px 0;">SIRET : 824 313 530 00027 - RCS Paris</p>
          <p style="margin: 0 0 2px 0;">Siège social : 88 Avenue des Ternes, 75017 Paris</p>
          <p style="margin: 0 0 2px 0;">Téléphone : 04 68 50 41 45 - Email : myconfort@gmail.com</p>
          <p style="margin: 0;">Email support : myconfort66@gmail.com</p>
        </div>
      </div>
      
      <!-- Pied de page CGV -->
      <div style="background: linear-gradient(135deg, #477A0C, #5A8F0F); color: #F2EFE2; padding: 10px; text-align: center; margin-top: 15px; border-radius: 6px;">
        <p style="font-weight: bold; font-size: 10px; margin: 0 0 3px 0;">🌸 MYCONFORT - Conditions Générales de Vente</p>
        <p style="font-size: 8px; margin: 0;">Version en vigueur au ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    `;
    
    console.log('✅ Page CGV MYCONFORT créée');
    return cgvPage;
  }
}