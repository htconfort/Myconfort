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
  invoiceNumber: string;
  invoiceDate: string;
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
}

export class AdvancedPDFService {
  private static readonly COLORS = {
    primary: '#477A0C',
    secondary: '#64748b',
    success: '#059669',
    danger: '#dc2626',
    dark: '#14281D',
    light: '#F2EFE2'
  };

  static async generateInvoicePDF(invoice: Invoice): Promise<jsPDF> {
    const doc = new jsPDF();
    
    // Convertir les données de la facture
    const invoiceData = this.convertInvoiceData(invoice);
    
    // PAGE 1 - FACTURE (optimisée)
    this.addCompactCompanyHeader(doc);
    this.addCompactInvoiceInfo(doc, invoiceData);
    this.addCompactClientInfo(doc, invoiceData);
    this.addCompactProductsTable(doc, invoiceData);
    this.addCompactTotals(doc, invoiceData);
    this.addCompactNotesAndTerms(doc, invoiceData);
    this.addCompactFooter(doc);
    
    // PAGE 2 - CONDITIONS GÉNÉRALES DE VENTE (condensées)
    doc.addPage();
    this.addCondensedCGVPage(doc);
    
    return doc;
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
      invoiceNumber: invoice.invoiceNumber,
      invoiceDate: invoice.invoiceDate,
      items,
      totalHT,
      totalTTC,
      totalTVA,
      totalDiscount,
      taxRate: invoice.taxRate,
      notes: invoice.invoiceNotes,
      advisorName: invoice.advisorName,
      paymentMethod: invoice.payment.method,
      depositAmount: invoice.payment.depositAmount
    };
  }

  // En-tête compact
  private static addCompactCompanyHeader(doc: jsPDF): void {
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 15, 20);
    
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('88 Avenue des Ternes, 75017 Paris | SIRET: 824 313 530 00027', 15, 26);
    doc.text('Tél: 04 68 50 41 45 | Email: myconfort@gmail.com | www.htconfort.com', 15, 30);
  }

  // Informations facture compactes
  private static addCompactInvoiceInfo(doc: jsPDF, data: InvoiceData): void {
    doc.setFillColor(this.COLORS.primary);
    doc.roundedRect(140, 12, 50, 12, 2, 2, 'F');
    doc.setTextColor(this.COLORS.light);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 155, 20);
    
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    
    doc.text('N°:', 140, 30);
    doc.setFont('helvetica', 'bold');
    doc.text(data.invoiceNumber, 150, 30);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Date:', 140, 36);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(data.invoiceDate).toLocaleDateString('fr-FR'), 155, 36);
  }

  // Informations client compactes
  private static addCompactClientInfo(doc: jsPDF, data: InvoiceData): void {
    doc.setFillColor(this.COLORS.light);
    doc.rect(15, 45, 180, 6, 'F');
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURER À', 20, 49);
    
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(data.clientName, 20, 57);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`${data.clientAddress}, ${data.clientPostalCode} ${data.clientCity}`, 20, 62);
    doc.text(`Tél: ${data.clientPhone} | Email: ${data.clientEmail}`, 20, 67);
  }

  // Tableau produits compact
  private static addCompactProductsTable(doc: jsPDF, data: InvoiceData): void {
    const tableData = data.items.map(item => [
      item.description,
      item.qty.toString(),
      formatCurrency(item.unitPriceHT),
      formatCurrency(item.unitPriceTTC),
      item.discount > 0 ? 
        (item.discountType === 'percent' ? `${item.discount}%` : formatCurrency(item.discount)) : 
        '-',
      formatCurrency(item.total)
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['DÉSIGNATION', 'QTÉ', 'PU HT', 'PU TTC', 'REMISE', 'TOTAL TTC']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.COLORS.primary,
        textColor: this.COLORS.light,
        fontSize: 8,
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 2
      },
      bodyStyles: {
        fontSize: 7,
        cellPadding: 2
      },
      columnStyles: {
        0: { cellWidth: 65, halign: 'left' },
        1: { cellWidth: 15, halign: 'center' },
        2: { cellWidth: 22, halign: 'right' },
        3: { cellWidth: 22, halign: 'right' },
        4: { cellWidth: 20, halign: 'center' },
        5: { cellWidth: 26, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      },
      margin: { left: 15, right: 15 }
    });
  }

  // Totaux compacts
  private static addCompactTotals(doc: jsPDF, data: InvoiceData): void {
    const finalY = (doc as any).lastAutoTable.finalY + 5;
    
    doc.setDrawColor(this.COLORS.secondary);
    doc.roundedRect(130, finalY, 65, 35, 2, 2);
    
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    let yPos = finalY + 6;
    
    doc.text('Total HT:', 135, yPos);
    doc.text(formatCurrency(data.totalHT), 185, yPos, { align: 'right' });
    yPos += 5;
    
    doc.text(`TVA (${data.taxRate}%):`, 135, yPos);
    doc.text(formatCurrency(data.totalTVA), 185, yPos, { align: 'right' });
    yPos += 5;
    
    if (data.totalDiscount > 0) {
      doc.setTextColor(this.COLORS.danger);
      doc.text('Remise:', 135, yPos);
      doc.text(`-${formatCurrency(data.totalDiscount)}`, 185, yPos, { align: 'right' });
      yPos += 5;
      doc.setTextColor(this.COLORS.dark);
    }
    
    doc.setDrawColor(this.COLORS.primary);
    doc.line(135, yPos, 190, yPos);
    yPos += 3;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(this.COLORS.primary);
    doc.text('TOTAL TTC:', 135, yPos);
    doc.text(formatCurrency(data.totalTTC), 185, yPos, { align: 'right' });
    
    if (data.depositAmount && data.depositAmount > 0) {
      yPos += 6;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(this.COLORS.dark);
      doc.text('Acompte:', 135, yPos);
      doc.text(formatCurrency(data.depositAmount), 185, yPos, { align: 'right' });
      
      yPos += 4;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.danger);
      doc.text('RESTE:', 135, yPos);
      doc.text(formatCurrency(data.totalTTC - data.depositAmount), 185, yPos, { align: 'right' });
    }
  }

  // Notes et conditions compactes
  private static addCompactNotesAndTerms(doc: jsPDF, data: InvoiceData): void {
    let yPos = (doc as any).lastAutoTable.finalY + 45;
    
    // Vérifier qu'on ne dépasse pas la page
    if (yPos > 250) {
      yPos = 250;
    }
    
    if (data.notes && yPos < 250) {
      doc.setTextColor(this.COLORS.primary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('REMARQUES', 15, yPos);
      
      doc.setTextColor(this.COLORS.dark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      const splitNotes = doc.splitTextToSize(data.notes, 180);
      doc.text(splitNotes.slice(0, 2), 15, yPos + 4); // Limiter à 2 lignes
      yPos += 12;
    }
    
    if (data.paymentMethod && yPos < 260) {
      doc.setTextColor(this.COLORS.primary);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('PAIEMENT', 15, yPos);
      
      doc.setTextColor(this.COLORS.dark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.text(`Mode: ${data.paymentMethod}`, 15, yPos + 4);
    }
  }

  // Pied de page compact
  private static addCompactFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    
    doc.setDrawColor(this.COLORS.primary);
    doc.line(15, pageHeight - 20, 195, pageHeight - 20);
    
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT - Merci de votre confiance !', 105, pageHeight - 14, { align: 'center' });
    
    doc.setTextColor(this.COLORS.secondary);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530', 105, pageHeight - 8, { align: 'center' });
  }

  // PAGE 2 - CGV CONDENSÉES
  private static addCondensedCGVPage(doc: jsPDF): void {
    console.log('📄 Ajout de la page 2 - CGV condensées');
    
    // En-tête CGV compact
    doc.setFillColor(this.COLORS.primary);
    doc.rect(15, 10, 180, 12, 'F');
    
    doc.setTextColor(this.COLORS.light);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS GÉNÉRALES DE VENTE', 105, 18, { align: 'center' });
    
    let yPos = 30;
    const lineHeight = 3.5;
    const marginLeft = 15;
    const marginRight = 195;
    const textWidth = marginRight - marginLeft;
    
    // Articles CGV condensés
    const cgvArticles = [
      {
        title: 'Art. 1 - Livraison',
        content: 'Livraison au pas de porte après contact SMS/mail. Vérifiez les dimensions pour le passage. Aucun service d\'installation.'
      },
      {
        title: 'Art. 2 - Délais',
        content: 'Délais indicatifs, non contractuels. Aucune indemnité en cas de retard ou force majeure.'
      },
      {
        title: 'Art. 3 - Transport',
        content: 'Marchandises aux risques du destinataire. Réserves obligatoires sur bordereau transporteur.'
      },
      {
        title: 'Art. 4 - Acceptation',
        content: 'Livraison implique acceptation des conditions. Client responsable de la vérification.'
      },
      {
        title: 'Art. 5 - Réclamations',
        content: 'Réclamations qualité par écrit sous 8 jours, lettre recommandée avec AR.'
      },
      {
        title: 'Art. 6 - Retours',
        content: 'Aucun retour sans accord écrit préalable. Accord n\'implique aucune reconnaissance.'
      },
      {
        title: 'Art. 7 - Dimensions',
        content: 'Matelas: variations +/- 5 cm possibles (thermosensibilité mousses). Tailles indicatives.'
      },
      {
        title: 'Art. 8 - Odeurs',
        content: 'Mousses naturelles peuvent émettre odeur temporaire après déballage. Non défaut.'
      },
      {
        title: 'Art. 9 - Garantie',
        content: 'Aucun rabais sauf accord. Garantie mousses uniquement, pas textiles/accessoires.'
      },
      {
        title: 'Art. 10 - Paiement',
        content: 'Factures payables chèque, virement, CB ou espèces à réception.'
      },
      {
        title: 'Art. 11 - Retard',
        content: 'Non-paiement: majoration 10% minimum 300€ + intérêts. Résiliation possible.'
      },
      {
        title: 'Art. 12 - Exigibilité',
        content: 'Non-paiement échéance rend exigible solde toutes échéances futures.'
      },
      {
        title: 'Art. 13 - Livraison',
        content: 'Dommages: mentionner sur bon, refuser produit. Après départ: contact sous 72h.'
      },
      {
        title: 'Art. 14 - Litiges',
        content: 'Compétence exclusive Tribunal Commerce Perpignan ou tribunal prestataire.'
      },
      {
        title: 'Art. 15 - Horaires',
        content: 'Livraison lundi-vendredi. Personne majeure requise. Modification adresse: myconfort66@gmail.com'
      }
    ];
    
    // Disposition en 2 colonnes pour optimiser l'espace
    const leftColumnArticles = cgvArticles.slice(0, 8);
    const rightColumnArticles = cgvArticles.slice(8);
    
    // Colonne gauche
    let leftYPos = yPos;
    for (const article of leftColumnArticles) {
      doc.setTextColor(this.COLORS.primary);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(article.title, marginLeft, leftYPos);
      leftYPos += 3;
      
      doc.setTextColor(this.COLORS.dark);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      
      const splitText = doc.splitTextToSize(article.content, 85);
      doc.text(splitText, marginLeft, leftYPos);
      leftYPos += splitText.length * 2.5 + 2;
    }
    
    // Colonne droite
    let rightYPos = yPos;
    for (const article of rightColumnArticles) {
      doc.setTextColor(this.COLORS.primary);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'bold');
      doc.text(article.title, 105, rightYPos);
      rightYPos += 3;
      
      doc.setTextColor(this.COLORS.dark);
      doc.setFontSize(6);
      doc.setFont('helvetica', 'normal');
      
      const splitText = doc.splitTextToSize(article.content, 85);
      doc.text(splitText, 105, rightYPos);
      rightYPos += splitText.length * 2.5 + 2;
    }
    
    // Date de mise à jour
    const pageHeight = doc.internal.pageSize.height;
    doc.setTextColor(this.COLORS.secondary);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'italic');
    doc.text('CGV mises à jour le 23 août 2025', 105, pageHeight - 25, { align: 'center' });
    
    // Pied de page CGV
    doc.setDrawColor(this.COLORS.primary);
    doc.line(15, pageHeight - 20, 195, pageHeight - 20);
    
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 105, pageHeight - 14, { align: 'center' });
    
    doc.setTextColor(this.COLORS.secondary);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45 - SIRET: 824 313 530 00027', 105, pageHeight - 8, { align: 'center' });
    
    console.log('✅ Page CGV condensée ajoutée');
  }

  static async downloadPDF(invoice: Invoice): Promise<void> {
    const doc = await this.generateInvoicePDF(invoice);
    doc.save(`facture_${invoice.invoiceNumber}.pdf`);
  }

  static async getPDFBlob(invoice: Invoice): Promise<Blob> {
    const doc = await this.generateInvoicePDF(invoice);
    return doc.output('blob');
  }
}