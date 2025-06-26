import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '../types';
import { formatCurrency, calculateHT, calculateProductTotal } from '../utils/calculations';

export interface InvoiceData {
  clientName: string;
  clientAddress: string;
  clientCity: string;
  clientPostalCode: string;
  clientPhone: string;
  clientEmail: string;
  clientHousingType?: string;
  clientDoorCode?: string;
  clientSiret?: string;
  invoiceNumber: string;
  invoiceDate: string;
  eventLocation?: string;
  items: Array<{
    description: string;
    category?: string;
    qty: number;
    unitPriceHT: number;
    unitPriceTTC: number;
    discount: number;
    discountType: 'percent' | 'fixed';
    total: number;
  }>;
  totalHT: number;
  totalTTC: number;
  totalTVA: number;
  totalDiscount: number;
  taxRate: number;
  notes?: string;
  advisorName?: string;
  paymentMethod?: string;
  depositAmount?: number;
  montantRestant?: number;
  signature?: string;
  deliveryMethod?: string;
  deliveryNotes?: string;
}

export class AdvancedPDFService {
  private static readonly COLORS = {
    // Couleurs exactes de l'aperçu
    primary: [71, 122, 12],      // #477A0C - Vert MYCONFORT
    cream: [242, 239, 226],      // #F2EFE2 - Beige clair
    dark: [20, 40, 29],          // #14281D - Texte foncé
    white: [255, 255, 255],      // Blanc pur
    grayLight: [248, 250, 252],  // Gris très clair pour alternance
    grayBorder: [209, 213, 219], // Gris bordures
    red: [220, 38, 38],          // Rouge pour alertes
    orange: [255, 140, 0],       // Orange pour acompte
    blue: [59, 130, 246],        // Bleu pour informations
    green: [34, 197, 94]         // Vert pour succès
  };

  // 🗜️ NOUVELLE MÉTHODE - PDF COMPRESSÉ POUR EMAILJS
  static async generateCompressedPDFForEmail(invoice: Invoice): Promise<{ blob: Blob; sizeKB: number; compressed: boolean }> {
    console.log('🗜️ GÉNÉRATION PDF COMPRESSÉ POUR EMAILJS (MAX 50KB)');
    
    try {
      // Générer d'abord un PDF standard
      const standardDoc = await this.generateInvoicePDF(invoice);
      const standardBlob = standardDoc.output('blob');
      const standardSizeKB = Math.round(standardBlob.size / 1024);
      
      console.log('📊 Taille PDF standard:', standardSizeKB, 'KB');
      
      // Si déjà sous 50KB, retourner tel quel
      if (standardSizeKB <= 50) {
        console.log('✅ PDF déjà sous 50KB, aucune compression nécessaire');
        return {
          blob: standardBlob,
          sizeKB: standardSizeKB,
          compressed: false
        };
      }
      
      // Sinon, générer une version compressée
      console.log('🔧 PDF trop volumineux, génération version compressée...');
      const compressedDoc = await this.generateCompressedPDF(invoice);
      const compressedBlob = compressedDoc.output('blob');
      const compressedSizeKB = Math.round(compressedBlob.size / 1024);
      
      console.log('📊 Taille PDF compressé:', compressedSizeKB, 'KB');
      
      if (compressedSizeKB <= 50) {
        console.log('✅ PDF compressé sous 50KB pour EmailJS');
        return {
          blob: compressedBlob,
          sizeKB: compressedSizeKB,
          compressed: true
        };
      } else {
        console.warn('⚠️ PDF encore trop volumineux même compressé');
        // Retourner quand même la version compressée (plus petite)
        return {
          blob: compressedBlob,
          sizeKB: compressedSizeKB,
          compressed: true
        };
      }
      
    } catch (error) {
      console.error('❌ Erreur génération PDF compressé:', error);
      throw error;
    }
  }

  // 🗜️ GÉNÉRATION PDF COMPRESSÉ (VERSION ALLÉGÉE)
  private static async generateCompressedPDF(invoice: Invoice): Promise<jsPDF> {
    console.log('🗜️ GÉNÉRATION PDF VERSION COMPRESSÉE');
    
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      compress: true // Activer la compression jsPDF
    });
    
    const invoiceData = this.convertInvoiceData(invoice);
    
    // Version simplifiée pour réduire la taille
    this.addCompressedHeader(doc, invoiceData);
    this.addCompressedClientSection(doc, invoiceData);
    this.addCompressedProductsTable(doc, invoiceData);
    this.addCompressedTotals(doc, invoiceData);
    
    // Signature simplifiée si présente
    if (invoiceData.signature) {
      await this.addCompressedSignature(doc, invoiceData.signature);
    }
    
    this.addCompressedFooter(doc);
    
    console.log('✅ PDF COMPRESSÉ GÉNÉRÉ');
    return doc;
  }

  // 📄 EN-TÊTE COMPRESSÉ
  private static addCompressedHeader(doc: jsPDF, data: InvoiceData): void {
    // En-tête simplifié avec moins d'éléments graphiques
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(10, 10, 190, 20, 'F');
    
    // Logo texte simple (pas d'emoji pour réduire la taille)
    doc.setTextColor(...this.COLORS.cream);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 15, 22);
    
    // Statut signature simplifié
    if (data.signature) {
      doc.setFillColor(...this.COLORS.green);
      doc.rect(150, 12, 35, 6, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(7);
      doc.text('SIGNEE', 167, 16, { align: 'center' });
    }
    
    // Informations entreprise (version condensée)
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('MYCONFORT - 88 Avenue des Ternes, 75017 Paris', 15, 38);
    doc.text('Tel: 04 68 50 41 45 - Email: myconfort@gmail.com', 15, 43);
    doc.text('SIRET: 824 313 530 00027', 15, 48);
    
    // Informations facture (coin droit, condensé)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`Facture: ${data.invoiceNumber}`, 140, 38);
    doc.setFont('helvetica', 'normal');
    doc.text(`Date: ${new Date(data.invoiceDate).toLocaleDateString('fr-FR')}`, 140, 43);
  }

  // 👤 SECTION CLIENT COMPRESSÉE
  private static addCompressedClientSection(doc: jsPDF, data: InvoiceData): void {
    // Section client simplifiée
    doc.setFillColor(...this.COLORS.grayLight);
    doc.rect(10, 55, 190, 25, 'F');
    
    doc.setTextColor(...this.COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT:', 15, 63);
    
    // Informations client condensées
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(data.clientName, 15, 68);
    
    doc.setFont('helvetica', 'normal');
    doc.text(`${data.clientAddress}, ${data.clientPostalCode} ${data.clientCity}`, 15, 72);
    doc.text(`Tel: ${data.clientPhone} - Email: ${data.clientEmail}`, 15, 76);
  }

  // 📋 TABLEAU PRODUITS COMPRESSÉ
  private static addCompressedProductsTable(doc: jsPDF, data: InvoiceData): void {
    const tableData = data.items.map(item => [
      item.description,
      item.qty.toString(),
      formatCurrency(item.unitPriceTTC),
      item.discount > 0 ? 
        (item.discountType === 'percent' ? `${item.discount}%` : formatCurrency(item.discount)) : 
        '-',
      formatCurrency(item.total)
    ]);

    autoTable(doc, {
      startY: 85,
      head: [['Produit', 'Qté', 'PU TTC', 'Remise', 'Total']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.COLORS.primary,
        textColor: this.COLORS.cream,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2,
        textColor: this.COLORS.dark
      },
      columnStyles: {
        0: { cellWidth: 80, halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 30, halign: 'right' },
        3: { cellWidth: 25, halign: 'center' },
        4: { cellWidth: 35, halign: 'right', fontStyle: 'bold' }
      },
      margin: { left: 10, right: 10 }
    });
  }

  // 💰 TOTAUX COMPRESSÉS
  private static addCompressedTotals(doc: jsPDF, data: InvoiceData): void {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Cadre totaux simplifié
    doc.setDrawColor(...this.COLORS.grayBorder);
    doc.setLineWidth(0.5);
    doc.rect(130, finalY, 65, 30);
    
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    let yPos = finalY + 6;
    
    // Total HT
    doc.text('Total HT:', 135, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(data.totalHT), 190, yPos, { align: 'right' });
    yPos += 5;
    
    // TVA
    doc.setFont('helvetica', 'normal');
    doc.text(`TVA (${data.taxRate}%):`, 135, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(data.totalTVA), 190, yPos, { align: 'right' });
    yPos += 5;
    
    // Total TTC
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(...this.COLORS.primary);
    doc.text('TOTAL TTC:', 135, yPos + 3);
    doc.text(formatCurrency(data.totalTTC), 190, yPos + 3, { align: 'right' });
    
    // Acompte si applicable
    if (data.depositAmount && data.depositAmount > 0) {
      yPos += 8;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(...this.COLORS.dark);
      doc.text('Acompte:', 135, yPos);
      doc.setTextColor(...this.COLORS.blue);
      doc.text(formatCurrency(data.depositAmount), 190, yPos, { align: 'right' });
      
      yPos += 4;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...this.COLORS.orange);
      doc.text('RESTE:', 135, yPos);
      doc.text(formatCurrency(data.totalTTC - data.depositAmount), 190, yPos, { align: 'right' });
    }
  }

  // ✍️ SIGNATURE COMPRESSÉE
  private static async addCompressedSignature(doc: jsPDF, signatureDataUrl: string): Promise<void> {
    try {
      const signatureY = 180;
      
      // Cadre signature minimal
      doc.setDrawColor(...this.COLORS.grayBorder);
      doc.setLineWidth(0.5);
      doc.rect(10, signatureY, 50, 20);
      
      doc.setTextColor(...this.COLORS.primary);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURE CLIENT', 35, signatureY + 4, { align: 'center' });
      
      // Image signature réduite
      doc.addImage(
        signatureDataUrl,
        'PNG',
        15,
        signatureY + 6,
        40,
        10,
        undefined,
        'FAST'
      );
      
    } catch (error) {
      console.warn('Erreur signature compressée:', error);
      doc.setTextColor(...this.COLORS.green);
      doc.setFontSize(7);
      doc.text('SIGNE ELECTRONIQUEMENT', 35, 185, { align: 'center' });
    }
  }

  // 🦶 PIED DE PAGE COMPRESSÉ
  private static addCompressedFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    
    // Pied de page minimal
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(10, pageHeight - 20, 190, 20, 'F');
    
    doc.setTextColor(...this.COLORS.cream);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 105, pageHeight - 12, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('Merci de votre confiance !', 105, pageHeight - 7, { align: 'center' });
  }

  // 📄 GÉNÉRATION PDF COMPLET AVEC CONDITIONS GÉNÉRALES DE VENTE MYCONFORT
  static async generateInvoicePDF(invoice: Invoice): Promise<jsPDF> {
    console.log('🎨 GÉNÉRATION PDF COMPLET : FACTURE + CONDITIONS GÉNÉRALES DE VENTE MYCONFORT');
    
    const doc = new jsPDF();
    const invoiceData = this.convertInvoiceData(invoice);
    
    // ===== PAGE 1 : FACTURE COMPLÈTE =====
    console.log('📄 PAGE 1 : Génération de la facture...');
    
    // 1. BORDURE SUPÉRIEURE VERTE (comme dans l'aperçu)
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(0, 0, 210, 4, 'F');
    
    // 2. EN-TÊTE AVEC LOGO ET GRADIENT (reproduction exacte)
    this.addHeaderIdenticalToPreview(doc, invoiceData);
    
    // 3. SECTION CLIENT AVEC FOND VERT (exactement comme l'aperçu)
    this.addClientSectionIdentical(doc, invoiceData);
    
    // 4. SECTION INFORMATIONS LOGISTIQUES (fond blanc)
    this.addLogisticsSectionIdentical(doc, invoiceData);
    
    // 5. SECTION PAIEMENT (fond blanc)
    this.addPaymentSectionIdentical(doc, invoiceData);
    
    // 6. TABLEAU PRODUITS (style exact de l'aperçu)
    this.addProductsTableIdentical(doc, invoiceData);
    
    // 7. TOTAUX AVEC ACOMPTE (cadre gris clair comme l'aperçu)
    this.addTotalsWithAcompteIdentical(doc, invoiceData);
    
    // 8. SIGNATURE (si présente)
    if (invoiceData.signature) {
      await this.addSignatureIdentical(doc, invoiceData.signature);
    }
    
    // 9. PIED DE PAGE AVEC FOND VERT
    this.addFooterIdentical(doc);
    
    // ===== PAGE 2 : CONDITIONS GÉNÉRALES DE VENTE MYCONFORT =====
    console.log('📄 PAGE 2 : Ajout des conditions générales de vente MYCONFORT...');
    doc.addPage();
    this.addMyconfortTermsAndConditions(doc);
    
    console.log('✅ PDF COMPLET GÉNÉRÉ - FACTURE + CGV MYCONFORT (2 PAGES)');
    return doc;
  }

  // 📋 NOUVELLE MÉTHODE : CONDITIONS GÉNÉRALES DE VENTE MYCONFORT (PAGE 2)
  private static addMyconfortTermsAndConditions(doc: jsPDF): void {
    console.log('📋 Ajout des conditions générales de vente MYCONFORT...');
    
    // En-tête de la page CGV
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(0, 0, 210, 4, 'F');
    
    // Titre principal
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(15, 10, 180, 15, 'F');
    doc.setTextColor(...this.COLORS.cream);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS GÉNÉRALES DE VENTE', 105, 20, { align: 'center' });
    
    // Sous-titre
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT - Vente de matelas et literie', 105, 32, { align: 'center' });
    
    // Contenu des CGV MYCONFORT
    let yPos = 45;
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...this.COLORS.dark);
    
    // Article 1 : Livraison
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 1 - LIVRAISON', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article1 = 'Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités (à la journée ou demi-journée). Le transporteur livre le produit au pas de porte ou en bas de l\'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d\'installation ou de reprise de l\'ancienne literie n\'est prévu.';
    const splitArticle1 = doc.splitTextToSize(article1, 180);
    doc.text(splitArticle1, 15, yPos);
    yPos += splitArticle1.length * 3 + 5;
    
    // Article 2 : Délais de Livraison
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 2 - DÉLAIS DE LIVRAISON', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article2 = 'Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.';
    const splitArticle2 = doc.splitTextToSize(article2, 180);
    doc.text(splitArticle2, 15, yPos);
    yPos += splitArticle2.length * 3 + 5;
    
    // Article 3 : Risques de Transport
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 3 - RISQUES DE TRANSPORT', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article3 = 'Les marchandises voyagent aux risques du destinataire. En cas d\'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoires sur le bordereau du transporteur.';
    const splitArticle3 = doc.splitTextToSize(article3, 180);
    doc.text(splitArticle3, 15, yPos);
    yPos += splitArticle3.length * 3 + 5;
    
    // Article 4 : Acceptation des Conditions
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 4 - ACCEPTATION DES CONDITIONS', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article4 = 'Toute livraison implique l\'acceptation des présentes conditions. Le transporteur livre à l\'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d\'accepter les marchandises lors de la livraison.';
    const splitArticle4 = doc.splitTextToSize(article4, 180);
    doc.text(splitArticle4, 15, yPos);
    yPos += splitArticle4.length * 3 + 5;
    
    // Article 5 : Réclamations
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 5 - RÉCLAMATIONS', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article5 = 'Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.';
    const splitArticle5 = doc.splitTextToSize(article5, 180);
    doc.text(splitArticle5, 15, yPos);
    yPos += splitArticle5.length * 3 + 5;
    
    // Article 6 : Retours
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 6 - RETOURS', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article6 = 'Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable.';
    const splitArticle6 = doc.splitTextToSize(article6, 180);
    doc.text(splitArticle6, 15, yPos);
    yPos += splitArticle6.length * 3 + 5;
    
    // Article 7 : Tailles des Matelas
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 7 - TAILLES DES MATELAS', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article7 = 'Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif.';
    const splitArticle7 = doc.splitTextToSize(article7, 180);
    doc.text(splitArticle7, 15, yPos);
    yPos += splitArticle7.length * 3 + 5;
    
    // Article 8 : Odeur des Matériaux
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 8 - ODEUR DES MATÉRIAUX', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article8 = 'Les mousses viscoélastiques naturelles (à base d\'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur après déballage.';
    const splitArticle8 = doc.splitTextToSize(article8, 180);
    doc.text(splitArticle8, 15, yPos);
    yPos += splitArticle8.length * 3 + 5;
    
    // Article 9 : Règlements et Remises
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 9 - RÈGLEMENTS ET REMISES', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article9 = 'Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant.';
    const splitArticle9 = doc.splitTextToSize(article9, 180);
    doc.text(splitArticle9, 15, yPos);
    yPos += splitArticle9.length * 3 + 5;
    
    // Article 10 : Paiement
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 10 - PAIEMENT', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article10 = 'Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.';
    const splitArticle10 = doc.splitTextToSize(article10, 180);
    doc.text(splitArticle10, 15, yPos);
    yPos += splitArticle10.length * 3 + 5;
    
    // Article 11 : Pénalités de Retard
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 11 - PÉNALITÉS DE RETARD', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article11 = 'En cas de non-paiement, une majoration de 10% avec un minimum de 300 € sera appliquée.';
    const splitArticle11 = doc.splitTextToSize(article11, 180);
    doc.text(splitArticle11, 15, yPos);
    yPos += splitArticle11.length * 3 + 5;
    
    // Article 12 : Exigibilité en Cas de Non-Paiement
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 12 - EXIGIBILITÉ EN CAS DE NON-PAIEMENT', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article12 = 'Le non-paiement d\'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.';
    const splitArticle12 = doc.splitTextToSize(article12, 180);
    doc.text(splitArticle12, 15, yPos);
    yPos += splitArticle12.length * 3 + 5;
    
    // Article 13 : Livraison Incomplète ou Non-Conforme
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 13 - LIVRAISON INCOMPLÈTE OU NON-CONFORME', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article13 = 'En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison. Contactez-nous sous 72h ouvrables si constatée après le départ du transporteur.';
    const splitArticle13 = doc.splitTextToSize(article13, 180);
    doc.text(splitArticle13, 15, yPos);
    yPos += splitArticle13.length * 3 + 5;
    
    // Article 14 : Litiges
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 14 - LITIGES', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article14 = 'Tout litige sera de la compétence exclusive du Tribunal de Commerce de Perpignan ou du tribunal compétent du prestataire.';
    const splitArticle14 = doc.splitTextToSize(article14, 180);
    doc.text(splitArticle14, 15, yPos);
    yPos += splitArticle14.length * 3 + 5;
    
    // Article 15 : Horaires de Livraison
    doc.setFont('helvetica', 'bold');
    doc.text('ART. 15 - HORAIRES DE LIVRAISON', 15, yPos);
    yPos += 5;
    doc.setFont('helvetica', 'normal');
    const article15 = 'Les livraisons sont effectuées du lundi au vendredi. Une personne majeure doit être présente. Toute modification d\'adresse doit être signalée immédiatement à myconfort66@gmail.com.';
    const splitArticle15 = doc.splitTextToSize(article15, 180);
    doc.text(splitArticle15, 15, yPos);
    yPos += splitArticle15.length * 3 + 8;
    
    // Informations légales MYCONFORT
    doc.setFillColor(...this.COLORS.grayLight);
    doc.rect(15, yPos - 3, 180, 25, 'F');
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('INFORMATIONS LÉGALES MYCONFORT', 15, yPos + 3);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    yPos += 8;
    doc.text('MYCONFORT - SARL au capital de 10 000 €', 15, yPos);
    yPos += 4;
    doc.text('SIRET : 824 313 530 00027 - RCS Paris', 15, yPos);
    yPos += 4;
    doc.text('Siège social : 88 Avenue des Ternes, 75017 Paris', 15, yPos);
    yPos += 4;
    doc.text('Téléphone : 04 68 50 41 45 - Email : myconfort@gmail.com', 15, yPos);
    yPos += 4;
    doc.text('Email support : myconfort66@gmail.com', 15, yPos);
    
    // Pied de page CGV MYCONFORT
    const pageHeight = doc.internal.pageSize.height;
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(15, pageHeight - 20, 180, 20, 'F');
    
    doc.setTextColor(...this.COLORS.cream);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT - Conditions Générales de Vente', 105, pageHeight - 12, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Version en vigueur au ' + new Date().toLocaleDateString('fr-FR'), 105, pageHeight - 7, { align: 'center' });
    
    console.log('✅ Conditions générales de vente MYCONFORT ajoutées (Page 2)');
  }

  private static addHeaderIdenticalToPreview(doc: jsPDF, data: InvoiceData): void {
    // En-tête avec gradient vert-bleu (simulation du gradient de l'aperçu)
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(15, 10, 180, 25, 'F');
    
    // Logo fleur dans cercle (exactement comme l'aperçu)
    doc.setFillColor(...this.COLORS.cream);
    doc.circle(25, 22, 6, 'F');
    doc.setTextColor(...this.COLORS.primary);
    doc.setFontSize(14);
    doc.text('🌸', 22, 25);
    
    // Titre "MYCONFORT" (comme dans l'aperçu)
    doc.setTextColor(...this.COLORS.cream);
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 40, 20);
    
    // Sous-titre (exactement comme l'aperçu)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Facturation professionnelle avec signature électronique', 40, 27);
    
    // Statut signature (coin droit)
    if (data.signature) {
      doc.setFillColor(...this.COLORS.green);
      doc.roundedRect(150, 15, 40, 8, 2, 2, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('🔒 SIGNÉE', 170, 20, { align: 'center' });
    } else {
      doc.setFillColor(255, 193, 7); // Jaune attente
      doc.roundedRect(150, 15, 40, 8, 2, 2, 'F');
      doc.setTextColor(0, 0, 0);
      doc.setFontSize(8);
      doc.text('EN ATTENTE DE SIGNATURE', 170, 20, { align: 'center' });
    }
    
    // Informations entreprise (sous l'en-tête)
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 15, 45);
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('88 Avenue des Ternes', 15, 52);
    doc.text('75017 Paris, France', 15, 57);
    doc.text('SIRET: 824 313 530 00027', 15, 62);
    doc.text('Tél: 04 68 50 41 45', 15, 67);
    doc.text('Email: myconfort@gmail.com', 15, 72);
    doc.text('Site web: https://www.htconfort.com', 15, 77);
    
    // Informations facture (coin droit)
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('N° Facture:', 140, 45);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(data.invoiceNumber, 170, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Date:', 140, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(data.invoiceDate).toLocaleDateString('fr-FR'), 170, 52);
    
    if (data.eventLocation) {
      doc.setFont('helvetica', 'normal');
      doc.text('Lieu:', 140, 59);
      doc.setFont('helvetica', 'bold');
      doc.text(data.eventLocation, 170, 59);
    }
  }

  private static addClientSectionIdentical(doc: jsPDF, data: InvoiceData): void {
    // Section client avec fond vert (exactement comme l'aperçu)
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(15, 85, 180, 35, 'F');
    
    // Titre avec icône utilisateur
    doc.setTextColor(...this.COLORS.cream);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('👤', 20, 95);
    
    // Badge "INFORMATIONS CLIENT" (comme dans l'aperçu)
    doc.setFillColor(...this.COLORS.cream);
    doc.roundedRect(30, 90, 80, 8, 3, 3, 'F');
    doc.setTextColor(...this.COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS CLIENT', 70, 95, { align: 'center' });
    
    // Fond beige pour les informations (comme l'aperçu)
    doc.setFillColor(...this.COLORS.cream);
    doc.rect(15, 100, 180, 20, 'F');
    
    // Informations client (colonne gauche)
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Nom complet*', 20, 108);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientName, 20, 113);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Adresse*', 70, 108);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientAddress, 70, 113);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Code postal*', 120, 108);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientPostalCode, 120, 113);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Ville*', 150, 108);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientCity, 150, 113);
    
    // Deuxième ligne
    doc.setFont('helvetica', 'bold');
    doc.text('Téléphone*', 20, 118);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientPhone, 50, 118);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Email*', 100, 118);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientEmail, 120, 118);
    
    if (data.clientSiret) {
      doc.setFont('helvetica', 'bold');
      doc.text('SIRET:', 150, 118);
      doc.setFont('helvetica', 'normal');
      doc.text(data.clientSiret, 170, 118);
    }
  }

  private static addLogisticsSectionIdentical(doc: jsPDF, data: InvoiceData): void {
    // Section logistique (fond blanc avec bordure)
    doc.setFillColor(...this.COLORS.white);
    doc.setDrawColor(...this.COLORS.grayBorder);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 125, 180, 25, 2, 2, 'FD');
    
    // Titre avec badge bleu
    doc.setFillColor(...this.COLORS.blue);
    doc.roundedRect(70, 130, 70, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS LOGISTIQUES', 105, 134, { align: 'center' });
    
    // Contenu logistique
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    if (data.deliveryMethod) {
      doc.setFont('helvetica', 'bold');
      doc.text('Mode de livraison:', 20, 142);
      doc.setFont('helvetica', 'normal');
      doc.text(data.deliveryMethod, 60, 142);
    }
    
    if (data.deliveryNotes) {
      doc.setFont('helvetica', 'bold');
      doc.text('Précisions:', 120, 142);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(data.deliveryNotes, 60);
      doc.text(splitNotes, 150, 142);
    }
  }

  private static addPaymentSectionIdentical(doc: jsPDF, data: InvoiceData): void {
    // Section paiement (fond blanc avec bordure)
    doc.setFillColor(...this.COLORS.white);
    doc.setDrawColor(...this.COLORS.grayBorder);
    doc.setLineWidth(0.5);
    doc.roundedRect(15, 155, 180, 30, 2, 2, 'FD');
    
    // Titre avec badge vert
    doc.setFillColor(...this.COLORS.green);
    doc.roundedRect(70, 160, 70, 6, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('MODE DE RÈGLEMENT', 105, 164, { align: 'center' });
    
    // Contenu paiement
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(9);
    
    if (data.paymentMethod) {
      doc.setFont('helvetica', 'bold');
      doc.text('Méthode de paiement*:', 20, 172);
      doc.setFont('helvetica', 'normal');
      doc.text(data.paymentMethod, 70, 172);
      
      // Affichage spécial pour acompte
      if (data.paymentMethod === 'Acompte' && data.depositAmount && data.depositAmount > 0) {
        doc.setTextColor(...this.COLORS.orange);
        doc.setFont('helvetica', 'bold');
        doc.text(`Acompte: ${formatCurrency(data.depositAmount)}`, 20, 178);
        doc.setTextColor(...this.COLORS.dark);
      }
    }
    
    if (data.advisorName) {
      doc.setFont('helvetica', 'bold');
      doc.text('Conseiller(e):', 120, 172);
      doc.setFont('helvetica', 'normal');
      doc.text(data.advisorName, 150, 172);
    }
    
    // Signature client (comme dans l'aperçu)
    doc.setFont('helvetica', 'bold');
    doc.text('Signature client MYCONFORT:', 20, 180);
    
    if (data.signature) {
      doc.setTextColor(...this.COLORS.green);
      doc.text('🔒 Signature électronique enregistrée', 80, 180);
    } else {
      doc.setTextColor(156, 163, 175);
      doc.text('✍️ Cliquer pour signer électroniquement', 80, 180);
    }
  }

  private static addProductsTableIdentical(doc: jsPDF, data: InvoiceData): void {
    // Titre section produits (style identique à l'aperçu)
    doc.setTextColor(...this.COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🛒 Produits & Tarification', 20, 200);
    
    const tableData = data.items.map(item => [
      item.description + (item.category ? `\n(${item.category})` : ''),
      item.qty.toString(),
      formatCurrency(item.unitPriceHT),
      formatCurrency(item.unitPriceTTC),
      item.discount > 0 ? 
        (item.discountType === 'percent' ? `${item.discount}%` : formatCurrency(item.discount)) : 
        '-',
      formatCurrency(item.total)
    ]);

    autoTable(doc, {
      startY: 205,
      head: [['PRODUIT', 'Quantité', 'PU HT', 'PU TTC', 'Remise', 'Total TTC']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.COLORS.primary,
        textColor: this.COLORS.cream,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: this.COLORS.dark
      },
      columnStyles: {
        0: { cellWidth: 70, halign: 'left', fontStyle: 'bold' },
        1: { cellWidth: 20, halign: 'center', fontStyle: 'bold' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right', fontStyle: 'bold' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: this.COLORS.grayLight
      },
      margin: { left: 15, right: 15 }
    });
  }

  private static addTotalsWithAcompteIdentical(doc: jsPDF, data: InvoiceData): void {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Calculer la hauteur nécessaire selon les éléments à afficher
    let boxHeight = 35; // Hauteur de base
    if (data.totalDiscount > 0) boxHeight += 7;
    if (data.depositAmount && data.depositAmount > 0) boxHeight += 20; // Plus d'espace pour acompte + reste
    
    // Cadre pour les totaux (exactement comme l'aperçu)
    doc.setFillColor(...this.COLORS.grayLight);
    doc.setDrawColor(...this.COLORS.grayBorder);
    doc.setLineWidth(1);
    doc.roundedRect(130, finalY, 65, boxHeight, 3, 3, 'FD');
    
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let yPos = finalY + 8;
    
    // Total HT
    doc.text('Total HT:', 135, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(data.totalHT), 185, yPos, { align: 'right' });
    yPos += 7;
    
    // TVA
    doc.setFont('helvetica', 'normal');
    doc.text(`TVA (${data.taxRate}%):`, 135, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(formatCurrency(data.totalTVA), 185, yPos, { align: 'right' });
    yPos += 7;
    
    // Remise totale si applicable
    if (data.totalDiscount > 0) {
      doc.setTextColor(...this.COLORS.red);
      doc.setFont('helvetica', 'normal');
      doc.text('Remise totale:', 135, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${formatCurrency(data.totalDiscount)}`, 185, yPos, { align: 'right' });
      yPos += 7;
      doc.setTextColor(...this.COLORS.dark);
    }
    
    // Ligne de séparation
    doc.setDrawColor(...this.COLORS.primary);
    doc.setLineWidth(1);
    doc.line(135, yPos, 190, yPos);
    yPos += 5;
    
    // Total TTC (mise en valeur exacte de l'aperçu)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...this.COLORS.primary);
    doc.text('TOTAL TTC:', 135, yPos);
    doc.text(formatCurrency(data.totalTTC), 185, yPos, { align: 'right' });
    
    // ===== GESTION ACOMPTE (EXACTEMENT COMME L'APERÇU) =====
    if (data.depositAmount && data.depositAmount > 0) {
      yPos += 10;
      
      // Ligne de séparation pour l'acompte
      doc.setDrawColor(...this.COLORS.grayBorder);
      doc.setLineWidth(0.5);
      doc.line(135, yPos, 190, yPos);
      yPos += 5;
      
      // Acompte versé
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...this.COLORS.dark);
      doc.text('Acompte versé:', 135, yPos);
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(...this.COLORS.blue);
      doc.text(formatCurrency(data.depositAmount), 185, yPos, { align: 'right' });
      
      yPos += 7;
      
      // RESTE À PAYER (mise en valeur comme dans l'aperçu)
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(...this.COLORS.orange);
      doc.text('RESTE À PAYER:', 135, yPos);
      
      // Calculer le montant restant
      const montantRestant = data.totalTTC - data.depositAmount;
      doc.text(formatCurrency(montantRestant), 185, yPos, { align: 'right' });
      
      // Encadrer le reste à payer pour le mettre en évidence
      doc.setDrawColor(...this.COLORS.orange);
      doc.setLineWidth(1);
      doc.roundedRect(133, yPos - 4, 59, 8, 1, 1);
    }
  }

  private static async addSignatureIdentical(doc: jsPDF, signatureDataUrl: string): Promise<void> {
    try {
      const signatureY = 200;
      
      // Cadre signature (style identique à l'aperçu)
      doc.setDrawColor(...this.COLORS.grayBorder);
      doc.setLineWidth(2);
      doc.setFillColor(...this.COLORS.white);
      doc.roundedRect(15, signatureY, 60, 25, 2, 2, 'FD');
      
      doc.setTextColor(...this.COLORS.primary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURE CLIENT', 45, signatureY + 6, { align: 'center' });
      
      // Image de signature
      doc.addImage(
        signatureDataUrl,
        'PNG',
        20,
        signatureY + 8,
        50,
        15,
        undefined,
        'FAST'
      );
      
      // Date signature
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const now = new Date();
      const signatureDate = now.toLocaleDateString('fr-FR');
      const signatureTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      doc.text(`Signé le ${signatureDate} à ${signatureTime}`, 45, signatureY + 22, { align: 'center' });
      
    } catch (error) {
      console.warn('Erreur signature, fallback texte:', error);
      doc.setTextColor(...this.COLORS.green);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ DOCUMENT SIGNÉ ÉLECTRONIQUEMENT', 45, 210, { align: 'center' });
    }
  }

  private static addFooterIdentical(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    
    // Pied de page avec fond vert (exactement comme l'aperçu)
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(15, pageHeight - 35, 180, 35, 'F');
    
    // Logo et titre centrés
    doc.setTextColor(...this.COLORS.cream);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('🌸', 95, pageHeight - 25);
    doc.text('MYCONFORT', 110, pageHeight - 25);
    
    // Message principal
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Merci de votre confiance !', 105, pageHeight - 18, { align: 'center' });
    
    // Sous-titre
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Votre spécialiste en matelas et literie de qualité', 105, pageHeight - 13, { align: 'center' });
    
    // Mentions légales
    doc.setFontSize(7);
    doc.text('TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530', 105, pageHeight - 8, { align: 'center' });
  }

  private static convertInvoiceData(invoice: Invoice): InvoiceData {
    const items = invoice.products.map(product => ({
      description: product.name,
      category: product.category,
      qty: product.quantity,
      unitPriceHT: calculateHT(product.priceTTC, invoice.taxRate),
      unitPriceTTC: product.priceTTC,
      discount: product.discount,
      discountType: product.discountType,
      total: calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      )
    }));

    const totalTTC = items.reduce((sum, item) => sum + item.total, 0);
    const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
    const totalTVA = totalTTC - totalHT;
    const totalDiscount = items.reduce((sum, item) => {
      const originalTotal = item.unitPriceTTC * item.qty;
      return sum + (originalTotal - item.total);
    }, 0);

    // Calcul du montant restant si acompte
    const montantRestant = invoice.payment.depositAmount && invoice.payment.depositAmount > 0 
      ? totalTTC - invoice.payment.depositAmount 
      : totalTTC;

    return {
      clientName: invoice.client.name,
      clientAddress: invoice.client.address,
      clientCity: invoice.client.city,
      clientPostalCode: invoice.client.postalCode,
      clientPhone: invoice.client.phone,
      clientEmail: invoice.client.email,
      clientHousingType: invoice.client.housingType,
      clientDoorCode: invoice.client.doorCode,
      clientSiret: invoice.client.siret,
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      eventLocation: invoice.eventLocation,
      items,
      totalHT,
      totalTTC,
      totalTVA,
      totalDiscount,
      taxRate: invoice.taxRate,
      notes: invoice.invoiceNotes,
      advisorName: invoice.advisorName,
      paymentMethod: invoice.payment.method,
      depositAmount: invoice.payment.depositAmount,
      montantRestant: montantRestant,
      signature: invoice.signature,
      deliveryMethod: invoice.delivery.method,
      deliveryNotes: invoice.delivery.notes
    };
  }

  static async downloadPDF(invoice: Invoice): Promise<void> {
    console.log('📥 TÉLÉCHARGEMENT PDF COMPLET : FACTURE + CONDITIONS GÉNÉRALES DE VENTE MYCONFORT');
    const doc = await this.generateInvoicePDF(invoice);
    doc.save(`facture_${invoice.invoiceNumber}_avec_CGV_MYCONFORT.pdf`);
  }

  static async getPDFBlob(invoice: Invoice): Promise<Blob> {
    console.log('📎 GÉNÉRATION BLOB PDF COMPLET : FACTURE + CONDITIONS GÉNÉRALES DE VENTE MYCONFORT');
    const doc = await this.generateInvoicePDF(invoice);
    return doc.output('blob');
  }

  // 🗜️ NOUVELLE MÉTHODE PUBLIQUE - PDF COMPRESSÉ POUR EMAILJS
  static async getCompressedPDFForEmail(invoice: Invoice): Promise<{ blob: Blob; sizeKB: number; compressed: boolean }> {
    return await this.generateCompressedPDFForEmail(invoice);
  }
}