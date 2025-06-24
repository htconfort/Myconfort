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
  signature?: string;
  deliveryMethod?: string;
  deliveryNotes?: string;
}

export class AdvancedPDFService {
  private static readonly COLORS = {
    primary: '#477A0C',      // Vert MYCONFORT
    primaryRGB: [71, 122, 12],
    secondary: '#64748b',
    success: '#059669',
    danger: '#dc2626',
    dangerRGB: [220, 38, 38],
    dark: '#14281D',
    darkRGB: [20, 40, 29],
    light: '#F2EFE2',
    lightRGB: [242, 239, 226],
    white: [255, 255, 255],
    grayLight: [248, 250, 252],
    grayBorder: [200, 200, 200]
  };

  static async generateInvoicePDF(invoice: Invoice): Promise<jsPDF> {
    const doc = new jsPDF();
    
    // Convertir les données de la facture
    const invoiceData = this.convertInvoiceData(invoice);
    
    console.log('🎨 Génération PDF avec design EXACTEMENT identique à l\'aperçu Bolt');
    
    // REPRODUCTION PIXEL-PARFAITE DE L'APERÇU BOLT
    
    // 1. Bordure supérieure verte (comme dans l'aperçu)
    doc.setFillColor(...this.COLORS.primaryRGB);
    doc.rect(15, 15, 180, 4, 'F');
    
    // 2. En-tête avec logo et informations entreprise
    this.addCompanyHeaderProfessional(doc);
    
    // 3. Informations facture (coin supérieur droit)
    this.addInvoiceInfoProfessional(doc, invoiceData);
    
    // 4. Section client avec fond beige et informations complémentaires
    this.addClientSectionProfessional(doc, invoiceData);
    
    // 5. Tableau des produits (style identique à l'aperçu)
    this.addProductsTableProfessional(doc, invoiceData);
    
    // 6. Section totaux (cadre gris clair, style identique)
    this.addTotalsSectionProfessional(doc, invoiceData);
    
    // 7. Signature si présente (positionnée correctement)
    if (invoiceData.signature) {
      await this.addSignatureProfessional(doc, invoiceData.signature);
    }
    
    // 8. Modalités de paiement
    this.addPaymentSectionProfessional(doc, invoiceData);
    
    // 9. Loi Hamon dans cadre rouge (repositionnée comme demandé)
    this.addLoiHamonProfessional(doc);
    
    // 10. Pied de page avec fond vert et message
    this.addFooterProfessional(doc);
    
    console.log('✅ PDF généré avec design PARFAITEMENT identique à l\'aperçu');
    
    return doc;
  }

  private static addCompanyHeaderProfessional(doc: jsPDF): void {
    // Logo avec cercle vert et fleur (exactement comme l'aperçu)
    doc.setFillColor(...this.COLORS.primaryRGB);
    doc.circle(25, 35, 8, 'F');
    
    doc.setTextColor(...this.COLORS.lightRGB);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('🌸', 22, 38);
    
    // Nom de l'entreprise (style identique à l'aperçu)
    doc.setTextColor(...this.COLORS.primaryRGB);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 40, 35);
    
    // Sous-titre "Facturation Professionnelle"
    doc.setTextColor(...this.COLORS.darkRGB);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Facturation Professionnelle', 40, 42);
    
    // Informations entreprise (style et positionnement identiques)
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 15, 55);
    
    doc.setFont('helvetica', 'normal');
    doc.text('88 Avenue des Ternes', 15, 60);
    doc.text('75017 Paris, France', 15, 65);
    doc.text('SIRET: 824 313 530 00027', 15, 70);
    doc.text('Tél: 04 68 50 41 45', 15, 75);
    doc.text('Email: myconfort@gmail.com', 15, 80);
    doc.text('Site web: https://www.htconfort.com', 15, 85);
  }

  private static addInvoiceInfoProfessional(doc: jsPDF, data: InvoiceData): void {
    // Cadre FACTURE (style identique à l'aperçu)
    doc.setFillColor(...this.COLORS.primaryRGB);
    doc.roundedRect(140, 25, 50, 12, 3, 3, 'F');
    doc.setTextColor(...this.COLORS.lightRGB);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 165, 33, { align: 'center' });
    
    // Informations facture (style identique)
    doc.setTextColor(...this.COLORS.darkRGB);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('N° Facture:', 140, 45);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(...this.COLORS.primaryRGB);
    doc.text(data.invoiceNumber, 170, 45);
    
    doc.setTextColor(...this.COLORS.darkRGB);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Date:', 140, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(data.invoiceDate).toLocaleDateString('fr-FR'), 170, 52);
    
    // Lieu de l'événement si présent
    if (data.eventLocation) {
      doc.setFont('helvetica', 'normal');
      doc.text('Lieu:', 140, 59);
      doc.setFont('helvetica', 'bold');
      doc.text(data.eventLocation, 170, 59);
    }
  }

  private static addClientSectionProfessional(doc: jsPDF, data: InvoiceData): void {
    // Section client avec fond beige (exactement comme l'aperçu)
    doc.setFillColor(...this.COLORS.lightRGB);
    doc.rect(15, 95, 180, 8, 'F');
    
    doc.setTextColor(...this.COLORS.primaryRGB);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS CLIENT', 20, 101);
    
    // Fond beige pour les informations (style identique)
    doc.setFillColor(...this.COLORS.lightRGB);
    doc.rect(15, 105, 180, 40, 'F');
    
    // Colonne gauche - Informations principales
    doc.setTextColor(...this.COLORS.darkRGB);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(data.clientName, 20, 115);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(data.clientAddress, 20, 122);
    doc.text(`${data.clientPostalCode} ${data.clientCity}`, 20, 129);
    doc.text(`Tél: ${data.clientPhone}`, 20, 136);
    doc.text(`Email: ${data.clientEmail}`, 20, 143);
    
    // Colonne droite - Informations complémentaires
    doc.setTextColor(...this.COLORS.primaryRGB);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('INFORMATIONS COMPLÉMENTAIRES', 110, 115);
    
    doc.setTextColor(...this.COLORS.darkRGB);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    let yPos = 125;
    if (data.clientHousingType) {
      doc.text(`Type de logement: ${data.clientHousingType}`, 110, yPos);
      yPos += 6;
    }
    if (data.clientDoorCode) {
      doc.text(`Code d'accès: ${data.clientDoorCode}`, 110, yPos);
      yPos += 6;
    }
    if (data.deliveryMethod) {
      doc.text(`Livraison: ${data.deliveryMethod}`, 110, yPos);
      yPos += 6;
    }
    if (data.advisorName) {
      doc.text(`Conseiller: ${data.advisorName}`, 110, yPos);
      yPos += 6;
    }
  }

  private static addProductsTableProfessional(doc: jsPDF, data: InvoiceData): void {
    // Titre section produits (style identique à l'aperçu)
    doc.setTextColor(...this.COLORS.primaryRGB);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL DES PRODUITS', 20, 160);
    
    // Ligne de séparation verte (comme dans l'aperçu)
    doc.setDrawColor(...this.COLORS.primaryRGB);
    doc.setLineWidth(2);
    doc.line(20, 163, 100, 163);
    
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
      startY: 170,
      head: [['DÉSIGNATION', 'QTÉ', 'PU HT', 'PU TTC', 'REMISE', 'TOTAL TTC']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.COLORS.primaryRGB,
        textColor: this.COLORS.lightRGB,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 4
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4,
        textColor: this.COLORS.darkRGB
      },
      columnStyles: {
        0: { cellWidth: 70, halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: this.COLORS.grayLight
      },
      margin: { left: 15, right: 15 }
    });
  }

  private static addTotalsSectionProfessional(doc: jsPDF, data: InvoiceData): void {
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Cadre pour les totaux (style identique à l'aperçu)
    doc.setFillColor(...this.COLORS.grayLight);
    doc.setDrawColor(...this.COLORS.grayBorder);
    doc.setLineWidth(1);
    doc.roundedRect(130, finalY, 65, 50, 3, 3, 'FD');
    
    doc.setTextColor(...this.COLORS.darkRGB);
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
      doc.setTextColor(...this.COLORS.dangerRGB);
      doc.setFont('helvetica', 'normal');
      doc.text('Remise totale:', 135, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${formatCurrency(data.totalDiscount)}`, 185, yPos, { align: 'right' });
      yPos += 7;
      doc.setTextColor(...this.COLORS.darkRGB);
    }
    
    // Ligne de séparation
    doc.setDrawColor(...this.COLORS.primaryRGB);
    doc.setLineWidth(1);
    doc.line(135, yPos, 190, yPos);
    yPos += 5;
    
    // Total TTC (mise en valeur comme dans l'aperçu)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(...this.COLORS.primaryRGB);
    doc.text('TOTAL TTC:', 135, yPos);
    doc.text(formatCurrency(data.totalTTC), 185, yPos, { align: 'right' });
    
    // Acompte si applicable
    if (data.depositAmount && data.depositAmount > 0) {
      yPos += 12;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(...this.COLORS.darkRGB);
      doc.text('Acompte versé:', 135, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(data.depositAmount), 185, yPos, { align: 'right' });
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 140, 0); // Orange
      doc.text('RESTE À PAYER:', 135, yPos);
      doc.text(formatCurrency(data.totalTTC - data.depositAmount), 185, yPos, { align: 'right' });
    }
  }

  private static async addSignatureProfessional(doc: jsPDF, signatureDataUrl: string): Promise<void> {
    try {
      const signatureY = 200;
      
      // Cadre pour la signature (espacé du total TTC comme demandé)
      doc.setDrawColor(100, 116, 139);
      doc.setLineWidth(1);
      doc.roundedRect(130, signatureY, 60, 25, 2, 2);
      
      doc.setTextColor(...this.COLORS.primaryRGB);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURE CLIENT', 160, signatureY + 6, { align: 'center' });
      
      // Ajouter l'image de signature
      doc.addImage(
        signatureDataUrl,
        'PNG',
        135,
        signatureY + 8,
        50,
        15,
        undefined,
        'FAST'
      );
      
      // Date et heure de signature
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const now = new Date();
      const signatureDate = now.toLocaleDateString('fr-FR');
      const signatureTime = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      doc.text(`Signé le ${signatureDate} à ${signatureTime}`, 160, signatureY + 22, { align: 'center' });
      
      console.log('✅ Signature ajoutée avec date et heure');
    } catch (error) {
      console.warn('Erreur ajout signature, utilisation fallback:', error);
      // Fallback texte
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ DOCUMENT SIGNÉ ÉLECTRONIQUEMENT', 160, 210, { align: 'center' });
      
      const signatureDate = new Date().toLocaleDateString('fr-FR');
      const signatureTime = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'normal');
      doc.text(`Signé le ${signatureDate} à ${signatureTime}`, 160, 217, { align: 'center' });
    }
  }

  private static addPaymentSectionProfessional(doc: jsPDF, data: InvoiceData): void {
    let yPos = 240;
    
    // Modalités de paiement (section claire en haut de pied de page)
    if (data.paymentMethod) {
      doc.setTextColor(...this.COLORS.primaryRGB);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('MODALITÉS DE PAIEMENT', 15, yPos);
      
      doc.setTextColor(...this.COLORS.darkRGB);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Mode de règlement: ${data.paymentMethod}`, 15, yPos + 7);
      
      // Cadre blanc pour les conditions
      doc.setFillColor(...this.COLORS.white);
      doc.setDrawColor(...this.COLORS.grayBorder);
      doc.roundedRect(15, yPos + 12, 180, 12, 2, 2, 'FD');
      
      doc.setFontSize(8);
      doc.setTextColor(100, 100, 100);
      doc.text('Paiement à réception de facture. En cas de retard de paiement, des pénalités de 3 fois le taux d\'intérêt légal seront appliquées.', 20, yPos + 18);
      
      yPos += 30;
    }
    
    // Notes si présentes
    if (data.notes) {
      doc.setTextColor(...this.COLORS.primaryRGB);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('REMARQUES', 15, yPos);
      
      doc.setFillColor(...this.COLORS.white);
      doc.setDrawColor(...this.COLORS.grayBorder);
      doc.roundedRect(15, yPos + 5, 180, 15, 2, 2, 'FD');
      
      doc.setTextColor(...this.COLORS.darkRGB);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(data.notes, 170);
      doc.text(splitNotes, 20, yPos + 12);
    }
  }

  private static addLoiHamonProfessional(doc: jsPDF): void {
    // Loi Hamon dans un cadre rouge (repositionnée au-dessus du tableau comme demandé)
    const loiHamonY = 145;
    
    doc.setFillColor(254, 242, 242); // Fond rouge très clair
    doc.setDrawColor(...this.COLORS.dangerRGB);
    doc.setLineWidth(2);
    doc.roundedRect(15, loiHamonY, 180, 20, 2, 2, 'FD');
    
    doc.setTextColor(...this.COLORS.dangerRGB);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('LOI HAMON', 20, loiHamonY + 6);
    
    doc.setTextColor(...this.COLORS.darkRGB);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const loiHammonText = 'Les achats effectués sur les foires expositions et salon, à l\'exception de ceux faisant l\'objet d\'un contrat de crédit à la consommation, ne sont pas soumis aux articles L311-10 et L311-15 (délai de rétractation de sept jours) du code de la consommation.';
    
    const splitText = doc.splitTextToSize(loiHammonText, 170);
    doc.text(splitText, 20, loiHamonY + 12);
  }

  private static addFooterProfessional(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    
    // Bordure supérieure verte
    doc.setFillColor(...this.COLORS.primaryRGB);
    doc.rect(15, pageHeight - 35, 180, 4, 'F');
    
    // Fond vert pour le pied de page (comme dans l'aperçu)
    doc.setFillColor(...this.COLORS.primaryRGB);
    doc.rect(15, pageHeight - 30, 180, 30, 'F');
    
    // Contenu du pied de page centré
    doc.setTextColor(...this.COLORS.lightRGB);
    
    // Logo et nom au centre
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('🌸', 100, pageHeight - 22);
    doc.text('MYCONFORT', 110, pageHeight - 22);
    
    // Message principal
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('Merci de votre confiance !', 105, pageHeight - 15, { align: 'center' });
    
    // Sous-titre
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Votre spécialiste en matelas et literie de qualité', 105, pageHeight - 10, { align: 'center' });
    
    // Mentions légales
    doc.setFontSize(7);
    doc.text('TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530', 105, pageHeight - 6, { align: 'center' });
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
      signature: invoice.signature,
      deliveryMethod: invoice.delivery.method,
      deliveryNotes: invoice.delivery.notes
    };
  }

  static async downloadPDF(invoice: Invoice): Promise<void> {
    console.log('📥 Téléchargement PDF professionnel identique à l\'aperçu');
    const doc = await this.generateInvoicePDF(invoice);
    doc.save(`facture_${invoice.invoiceNumber}.pdf`);
  }

  static async getPDFBlob(invoice: Invoice): Promise<Blob> {
    console.log('📎 Génération blob PDF professionnel');
    const doc = await this.generateInvoicePDF(invoice);
    return doc.output('blob');
  }
}