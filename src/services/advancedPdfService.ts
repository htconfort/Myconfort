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
    // Couleurs exactes de l'aperçu HTML fourni
    primary: [104, 159, 56],     // #689f38 - Vert principal de l'exemple
    primaryDark: [124, 179, 66], // #7cb342 - Vert dégradé
    cream: [242, 239, 226],      // #F2EFE2 - Beige clair
    dark: [51, 51, 51],          // #333333 - Texte foncé
    white: [255, 255, 255],      // Blanc pur
    grayLight: [248, 248, 248],  // #f8f8f8 - Gris très clair
    grayBorder: [221, 221, 221], // #dddddd - Gris bordures
    red: [220, 38, 38],          // Rouge pour alertes
    orange: [255, 140, 0],       // Orange pour acompte
    blue: [25, 118, 210],        // #1976d2 - Bleu pour informations
    green: [76, 175, 80]         // #4caf50 - Vert pour succès
  };

  // 💰 FONCTION POUR FORMATER LES MONTANTS SANS SLASHES
  private static formatAmountClean(amount: number): string {
    if (typeof amount !== 'number' || isNaN(amount)) {
      return '0,00 €';
    }
    
    // Utiliser Intl.NumberFormat pour un formatage propre
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'EUR',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  }
  // 🎯 MÉTHODE PRINCIPALE - PDF IDENTIQUE À L'EXEMPLE HTML
  static async generateInvoicePDF(invoice: Invoice): Promise<jsPDF> {
    console.log('🎨 GÉNÉRATION PDF IDENTIQUE À L\'EXEMPLE HTML FOURNI');
    
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const invoiceData = this.convertInvoiceData(invoice);
    
    // Générer le PDF avec le style exact de l'exemple HTML
    this.addHeaderLikeHTML(doc, invoiceData);
    this.addInvoiceInfoLikeHTML(doc, invoiceData);
    this.addClientSectionLikeHTML(doc, invoiceData);
    this.addLogisticsSectionLikeHTML(doc, invoiceData);
    this.addPaymentSectionLikeHTML(doc, invoiceData);
    this.addProductsSectionLikeHTML(doc, invoiceData);
    this.addImprovedTotalsSection(doc, invoiceData);
    
    // Signature si présente
    if (invoiceData.signature) {
      await this.addSignatureLikeHTML(doc, invoiceData.signature);
    }
    
    this.addFooterLikeHTML(doc);
    
    console.log('✅ PDF GÉNÉRÉ IDENTIQUE À L\'EXEMPLE HTML');
    return doc;
  }

  // 📄 EN-TÊTE COMME L'EXEMPLE HTML
  private static addHeaderLikeHTML(doc: jsPDF, data: InvoiceData): void {
    // Dégradé vert comme dans l'exemple HTML
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(0, 0, 210, 35, 'F');
    
    // Titre MYCONFORT en blanc
    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 20, 20);
    
    // Sous-titre
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Facturation professionnelle avec signature électronique', 20, 28);
    
    // Bouton signature (coin droit)
    if (data.signature) {
      doc.setFillColor(255, 255, 255, 0.2); // Blanc transparent
      doc.roundedRect(160, 12, 35, 10, 2, 2, 'F');
      doc.setTextColor(...this.COLORS.white);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNÉE', 177, 18, { align: 'center' });
    }
  }

  // 📋 INFORMATIONS FACTURE COMME L'EXEMPLE HTML
  private static addInvoiceInfoLikeHTML(doc: jsPDF, data: InvoiceData): void {
    // Fond blanc pour les informations
    doc.setFillColor(...this.COLORS.white);
    doc.rect(0, 35, 210, 40, 'F');
    
    // Informations entreprise (gauche)
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 20, 50);
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('88 Avenue des Ternes', 20, 56);
    doc.text('75017 Paris, France', 20, 61);
    doc.text('SIRET: 824 313 530 00027', 20, 66);
    doc.text('Tél: 04 68 50 41 45', 20, 71);
    
    // Informations facture (droite)
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`N° Facture: ${data.invoiceNumber}`, 140, 50);
    doc.text(`Date: ${new Date(data.invoiceDate).toLocaleDateString('fr-FR')}`, 140, 56);
    
    if (data.eventLocation) {
      doc.text(`Lieu: ${data.eventLocation}`, 140, 62);
    }
  }

  // 👤 SECTION CLIENT COMME L'EXEMPLE HTML
  private static addClientSectionLikeHTML(doc: jsPDF, data: InvoiceData): void {
    // En-tête section client (vert)
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(0, 75, 210, 12, 'F');
    
    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS CLIENT', 105, 82, { align: 'center' });
    
    // Fond gris clair pour les informations client
    doc.setFillColor(...this.COLORS.grayLight);
    doc.rect(0, 87, 210, 25, 'F');
    
    // Informations client en colonnes (comme l'exemple HTML)
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    
    // Première ligne
    doc.text('Nom complet*', 20, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientName, 20, 100);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Adresse*', 60, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientAddress, 60, 100);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Code postal*', 120, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientPostalCode, 120, 100);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Ville*', 150, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientCity, 150, 100);
    
    doc.setFont('helvetica', 'bold');
    doc.text('Email*', 180, 95);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientEmail, 180, 100);
    
    // Deuxième ligne
    doc.setFont('helvetica', 'bold');
    doc.text('Téléphone*', 20, 107);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientPhone, 50, 107);
  }

  // 🚚 SECTION LOGISTIQUE COMME L'EXEMPLE HTML
  private static addLogisticsSectionLikeHTML(doc: jsPDF, data: InvoiceData): void {
    let currentY = 115;
    
    // En-tête logistique (bleu)
    doc.setFillColor(...this.COLORS.blue);
    doc.roundedRect(20, currentY, 170, 8, 2, 2, 'F');
    
    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS LOGISTIQUES', 105, currentY + 5, { align: 'center' });
    
    currentY += 12;
    
    if (data.deliveryMethod) {
      doc.setTextColor(...this.COLORS.dark);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Mode de livraison:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(data.deliveryMethod, 60, currentY);
      currentY += 8;
    }
  }

  // 💳 SECTION PAIEMENT COMME L'EXEMPLE HTML
  private static addPaymentSectionLikeHTML(doc: jsPDF, data: InvoiceData): void {
    let currentY = 135;
    
    // En-tête paiement (vert)
    doc.setFillColor(...this.COLORS.primary);
    doc.roundedRect(20, currentY, 170, 8, 2, 2, 'F');
    
    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MODE DE REGLEMENT', 105, currentY + 5, { align: 'center' });
    
    currentY += 12;
    
    if (data.paymentMethod) {
      doc.setTextColor(...this.COLORS.dark);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('Méthode de paiement:', 20, currentY);
      doc.setFont('helvetica', 'normal');
      doc.text(data.paymentMethod, 70, currentY);
      currentY += 8;
    }
    
    // Signature client
    doc.setFont('helvetica', 'bold');
    doc.text('Signature client MYCONFORT:', 20, currentY);
    if (data.signature) {
      doc.setTextColor(...this.COLORS.green);
      doc.text('✓ Signature électronique enregistrée', 80, currentY);
    }
  }

  // 📦 SECTION PRODUITS COMME L'EXEMPLE HTML
  private static addProductsSectionLikeHTML(doc: jsPDF, data: InvoiceData): void {
    let currentY = 160;
    
    // En-tête produits (vert)
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(20, currentY, 170, 12, 'F');
    
    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Produits & Tarification', 105, currentY + 7, { align: 'center' });
    
    currentY += 20;
    
    // Section signature si présente
    if (data.signature) {
      doc.setTextColor(...this.COLORS.dark);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURE CLIENT', 105, currentY, { align: 'center' });
      
      // Cadre pour signature
      doc.setDrawColor(...this.COLORS.grayBorder);
      doc.setFillColor(...this.COLORS.grayLight);
      doc.roundedRect(20, currentY + 3, 170, 15, 1, 1, 'FD');
      
      try {
        // Ajouter l'image de signature
        doc.addImage(
          data.signature,
          'PNG',
          85,
          currentY + 5,
          40,
          10,
          undefined,
          'FAST'
        );
      } catch (error) {
        console.warn('Erreur ajout signature:', error);
        doc.setTextColor(153, 153, 153);
        doc.setFontSize(8);
        doc.text('[Signature électronique validée]', 105, currentY + 11, { align: 'center' });
      }
      
      currentY += 25;
    }
    
    // Tableau des produits
    const tableData = data.items.map(item => [
      item.qty.toString(),
      this.formatAmountClean(item.unitPriceHT),
      this.formatAmountClean(item.unitPriceTTC),
      item.discount > 0 ? 
        (item.discountType === 'percent' ? `${item.discount}%` : this.formatAmountClean(item.discount)) : 
        '-',
      this.formatAmountClean(item.total)
    ]);

    autoTable(doc, {
      startY: currentY,
      head: [['Quantité', 'PU HT', 'PU TTC', 'Remise', 'Total TTC']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.COLORS.primary,
        textColor: this.COLORS.white,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 3
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3,
        textColor: this.COLORS.dark,
        halign: 'center'
      },
      alternateRowStyles: {
        fillColor: this.COLORS.grayLight
      },
      margin: { left: 20, right: 20 }
    });
  }

  // 💰 NOUVELLE SECTION TOTAUX AMÉLIORÉE - Sans slashes et meilleur agencement
  private static addImprovedTotalsSection(doc: jsPDF, data: InvoiceData): void {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Cadre principal pour les totaux
    const totalsX = 120;
    const totalsY = finalY + 5;
    const totalsWidth = 70;
    
    // Bordure du cadre totaux
    doc.setDrawColor(...this.COLORS.primary);
    doc.setLineWidth(2);
    doc.roundedRect(totalsX, totalsY, totalsWidth, 60, 3, 3, 'D');
    
    // En-tête du cadre totaux
    doc.setFillColor(...this.COLORS.primary);
    doc.roundedRect(totalsX, totalsY, totalsWidth, 12, 3, 3, 'F');
    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('RÉCAPITULATIF FINANCIER', totalsX + totalsWidth/2, totalsY + 7, { align: 'center' });
    
    // Corps du cadre totaux
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let yPos = totalsY + 18;
    
    // Total HT
    doc.text('Total HT :', totalsX + 5, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatAmountClean(data.totalHT), totalsX + totalsWidth - 5, yPos, { align: 'right' });
    yPos += 7;
    
    // TVA
    doc.setFont('helvetica', 'normal');
    doc.text(`TVA (${data.taxRate}%) :`, totalsX + 5, yPos);
    doc.setFont('helvetica', 'bold');
    doc.text(this.formatAmountClean(data.totalTVA), totalsX + totalsWidth - 5, yPos, { align: 'right' });
    yPos += 7;
    
    // Remise si applicable
    if (data.totalDiscount > 0) {
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'normal');
      doc.text('Remise totale :', totalsX + 5, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${this.formatAmountClean(data.totalDiscount)}`, totalsX + totalsWidth - 5, yPos, { align: 'right' });
      yPos += 7;
      doc.setTextColor(...this.COLORS.dark);
    }
    
    // Ligne de séparation
    doc.setDrawColor(...this.COLORS.primary);
    doc.setLineWidth(1);
    doc.line(totalsX + 5, yPos + 2, totalsX + totalsWidth - 5, yPos + 2);
    yPos += 8;
    
    // Total TTC
    doc.setFillColor(71, 122, 12, 0.1); // Fond vert très léger
    doc.roundedRect(totalsX + 2, yPos - 3, totalsWidth - 4, 10, 2, 2, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(...this.COLORS.primary);
    doc.text('TOTAL TTC :', totalsX + 5, yPos + 2);
    doc.setFontSize(13);
    doc.text(this.formatAmountClean(data.totalTTC), totalsX + totalsWidth - 5, yPos + 2, { align: 'right' });
    
    // Acompte si applicable
    if (data.depositAmount && data.depositAmount > 0) {
      yPos += 15;
      
      // Cadre séparé pour l'acompte
      const acompteY = yPos;
      doc.setDrawColor(25, 118, 210);
      doc.setLineWidth(1);
      doc.roundedRect(totalsX, acompteY, totalsWidth, 25, 2, 2, 'D');
      
      // En-tête acompte
      doc.setFillColor(25, 118, 210);
      doc.roundedRect(totalsX, acompteY, totalsWidth, 8, 2, 2, 'F');
      doc.setTextColor(...this.COLORS.white);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('DÉTAIL DU PAIEMENT', totalsX + totalsWidth/2, acompteY + 5, { align: 'center' });
      
      yPos += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.setTextColor(...this.COLORS.blue);
      doc.text('Acompte versé :', totalsX + 5, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(this.formatAmountClean(data.depositAmount), totalsX + totalsWidth - 5, yPos, { align: 'right' });
      
      yPos += 8;
      
      // Reste à payer - Mise en valeur
      doc.setFillColor(255, 140, 0, 0.2); // Fond orange léger
      doc.roundedRect(totalsX + 2, yPos - 2, totalsWidth - 4, 8, 1, 1, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(...this.COLORS.orange);
      doc.text('RESTE À PAYER :', totalsX + 5, yPos + 2);
      doc.setFontSize(11);
      doc.text(this.formatAmountClean(data.totalTTC - data.depositAmount), totalsX + totalsWidth - 5, yPos + 2, { align: 'right' });
    }
  }

  // ✍️ SIGNATURE COMME L'EXEMPLE HTML
  private static async addSignatureLikeHTML(doc: jsPDF, signatureDataUrl: string): Promise<void> {
    try {
      const signatureY = 200;
      
      // Cadre signature
      doc.setDrawColor(...this.COLORS.grayBorder);
      doc.setLineWidth(1);
      doc.roundedRect(130, signatureY, 60, 25, 2, 2, 'D');
      
      doc.setTextColor(...this.COLORS.primary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURE CLIENT', 160, signatureY + 6, { align: 'center' });
      
      // Image signature
      doc.addImage(
        signatureDataUrl,
        'PNG',
        135,
        signatureY + 8,
        50,
        12,
        undefined,
        'FAST'
      );
      
    } catch (error) {
      console.warn('Erreur signature:', error);
      doc.setTextColor(...this.COLORS.green);
      doc.setFontSize(8);
      doc.text('SIGNÉ ÉLECTRONIQUEMENT', 160, 210, { align: 'center' });
    }
  }

  // 🦶 PIED DE PAGE COMME L'EXEMPLE HTML
  private static addFooterLikeHTML(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    
    // Pied de page vert
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(0, pageHeight - 30, 210, 30, 'F');
    
    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('🌸 MYCONFORT', 105, pageHeight - 20, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Merci pour votre confiance !', 105, pageHeight - 14, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Votre spécialiste en matelas et literie de qualité', 105, pageHeight - 10, { align: 'center' });
    doc.text('88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45', 105, pageHeight - 6, { align: 'center' });
    doc.text('Email: myconfort@gmail.com - SIRET: 824 313 530 00027', 105, pageHeight - 2, { align: 'center' });
  }

  // 🗜️ PDF COMPRESSÉ POUR EMAILJS
  static async getCompressedPDFForEmail(invoice: Invoice): Promise<{ blob: Blob; sizeKB: number; compressed: boolean }> {
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
      
      return {
        blob: compressedBlob,
        sizeKB: compressedSizeKB,
        compressed: true
      };
      
    } catch (error) {
      console.error('❌ Erreur génération PDF compressé:', error);
      throw error;
    }
  }

  // 🗜️ VERSION COMPRESSÉE
  private static async generateCompressedPDF(invoice: Invoice): Promise<jsPDF> {
    const doc = new jsPDF({
      unit: 'mm',
      format: 'a4',
      compress: true
    });
    
    const invoiceData = this.convertInvoiceData(invoice);
    
    // Version simplifiée pour réduire la taille
    this.addCompressedHeader(doc, invoiceData);
    this.addCompressedContent(doc, invoiceData);
    this.addCompressedFooter(doc);
    
    return doc;
  }

  private static addCompressedHeader(doc: jsPDF, data: InvoiceData): void {
    doc.setFillColor(...this.COLORS.primary);
    doc.rect(10, 10, 190, 15, 'F');
    
    doc.setTextColor(...this.COLORS.white);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 15, 20);
    
    doc.setFontSize(10);
    doc.text(`Facture: ${data.invoiceNumber}`, 150, 20);
  }

  private static addCompressedContent(doc: jsPDF, data: InvoiceData): void {
    let y = 35;
    
    // Client
    doc.setTextColor(...this.COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('CLIENT:', 15, y);
    doc.setFont('helvetica', 'normal');
    doc.text(data.clientName, 15, y + 5);
    doc.text(data.clientEmail, 15, y + 10);
    
    y += 20;
    
    // Produits simplifiés
    doc.setFont('helvetica', 'bold');
    doc.text('PRODUITS:', 15, y);
    y += 5;
    
    data.items.forEach((item, index) => {
      doc.setFont('helvetica', 'normal');
      doc.text(`${item.qty}x ${item.description} - ${this.formatAmountClean(item.total)}`, 15, y);
      y += 5;
    });
    
    y += 10;
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.text(`TOTAL TTC: ${this.formatAmountClean(data.totalTTC)}`, 15, y);
  }

  private static addCompressedFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    doc.setTextColor(...this.COLORS.primary);
    doc.setFontSize(8);
    doc.text('MYCONFORT - Merci de votre confiance !', 105, pageHeight - 10, { align: 'center' });
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
      montantRestant: totalTTC - (invoice.payment.depositAmount || 0),
      signature: invoice.signature,
      deliveryMethod: invoice.delivery.method,
      deliveryNotes: invoice.delivery.notes
    };
  }

  static async downloadPDF(invoice: Invoice): Promise<void> {
    console.log('📥 TÉLÉCHARGEMENT PDF IDENTIQUE À L\'EXEMPLE HTML');
    const doc = await this.generateInvoicePDF(invoice);
    doc.save(`facture_${invoice.invoiceNumber}.pdf`);
  }

  static async getPDFBlob(invoice: Invoice): Promise<Blob> {
    console.log('📎 GÉNÉRATION BLOB PDF IDENTIQUE À L\'EXEMPLE HTML');
    const doc = await this.generateInvoicePDF(invoice);
    return doc.output('blob');
  }
}
