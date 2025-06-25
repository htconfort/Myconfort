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

  static async generateInvoicePDF(invoice: Invoice): Promise<jsPDF> {
    console.log('🎨 GÉNÉRATION PDF IDENTIQUE À L\'APERÇU AVEC SUPPORT ACOMPTE');
    
    const doc = new jsPDF();
    const invoiceData = this.convertInvoiceData(invoice);
    
    // ===== REPRODUCTION EXACTE DE L'APERÇU =====
    
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
    
    console.log('✅ PDF GÉNÉRÉ - IDENTIQUE À L\'APERÇU AVEC ACOMPTE');
    return doc;
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
    console.log('📥 TÉLÉCHARGEMENT PDF IDENTIQUE AVEC ACOMPTE');
    const doc = await this.generateInvoicePDF(invoice);
    doc.save(`facture_${invoice.invoiceNumber}.pdf`);
  }

  static async getPDFBlob(invoice: Invoice): Promise<Blob> {
    console.log('📎 GÉNÉRATION BLOB PDF IDENTIQUE AVEC ACOMPTE');
    const doc = await this.generateInvoicePDF(invoice);
    return doc.output('blob');
  }
}