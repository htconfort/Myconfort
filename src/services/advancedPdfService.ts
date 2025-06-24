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
  signature?: string;
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
    
    // REPRODUIRE EXACTEMENT LE DESIGN DE L'APERÇU BOLT
    
    // En-tête avec bordure verte (comme dans l'aperçu)
    doc.setFillColor(71, 122, 12); // #477A0C
    doc.rect(15, 15, 180, 4, 'F'); // Bordure supérieure verte
    
    // Logo et nom entreprise (comme dans l'aperçu)
    this.addCompanyHeader(doc);
    
    // Informations facture (comme dans l'aperçu)
    this.addInvoiceInfo(doc, invoiceData);
    
    // Section client avec fond beige (comme dans l'aperçu)
    this.addClientSection(doc, invoiceData);
    
    // Tableau des produits (style identique à l'aperçu)
    this.addProductsTable(doc, invoiceData);
    
    // Totaux (style identique à l'aperçu)
    this.addTotalsSection(doc, invoiceData);
    
    // Signature si présente
    if (invoiceData.signature) {
      await this.addSignature(doc, invoiceData.signature);
    }
    
    // Modalités de paiement et Loi Hamon (comme dans l'aperçu)
    this.addPaymentAndLegalSection(doc, invoiceData);
    
    // Pied de page (comme dans l'aperçu)
    this.addFooter(doc);
    
    return doc;
  }

  private static addCompanyHeader(doc: jsPDF): void {
    // Logo simulé avec emoji et cercle (comme dans l'aperçu)
    doc.setFillColor(71, 122, 12);
    doc.circle(25, 35, 8, 'F');
    
    doc.setTextColor(242, 239, 226);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('🌸', 22, 38);
    
    // Nom de l'entreprise (comme dans l'aperçu)
    doc.setTextColor(71, 122, 12);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 40, 35);
    
    doc.setTextColor(20, 40, 29);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'normal');
    doc.text('Facturation Professionnelle', 40, 42);
    
    // Informations entreprise (comme dans l'aperçu)
    doc.setFontSize(9);
    doc.text('MYCONFORT', 15, 55);
    doc.text('88 Avenue des Ternes', 15, 60);
    doc.text('75017 Paris, France', 15, 65);
    doc.text('SIRET: 824 313 530 00027', 15, 70);
    doc.text('Tél: 04 68 50 41 45', 15, 75);
    doc.text('Email: myconfort@gmail.com', 15, 80);
    doc.text('Site web: https://www.htconfort.com', 15, 85);
  }

  private static addInvoiceInfo(doc: jsPDF, data: InvoiceData): void {
    // Cadre FACTURE (comme dans l'aperçu)
    doc.setFillColor(71, 122, 12);
    doc.roundedRect(140, 25, 50, 12, 3, 3, 'F');
    doc.setTextColor(242, 239, 226);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 165, 33, { align: 'center' });
    
    // Informations facture (comme dans l'aperçu)
    doc.setTextColor(20, 40, 29);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('N° Facture:', 140, 45);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(71, 122, 12);
    doc.text(data.invoiceNumber, 170, 45);
    
    doc.setTextColor(20, 40, 29);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('Date:', 140, 52);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(data.invoiceDate).toLocaleDateString('fr-FR'), 170, 52);
  }

  private static addClientSection(doc: jsPDF, data: InvoiceData): void {
    // Section client avec fond beige et bordure verte (comme dans l'aperçu)
    doc.setFillColor(242, 239, 226); // Fond beige
    doc.rect(15, 95, 180, 8, 'F');
    
    doc.setTextColor(71, 122, 12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURER À', 20, 101);
    
    // Fond beige pour les informations client (comme dans l'aperçu)
    doc.setFillColor(242, 239, 226);
    doc.rect(15, 105, 180, 35, 'F');
    
    // Informations client (comme dans l'aperçu)
    doc.setTextColor(20, 40, 29);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(data.clientName, 20, 115);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(data.clientAddress, 20, 122);
    doc.text(`${data.clientPostalCode} ${data.clientCity}`, 20, 129);
    doc.text(`Tél: ${data.clientPhone}`, 20, 136);
    doc.text(`Email: ${data.clientEmail}`, 100, 136);
  }

  private static addProductsTable(doc: jsPDF, data: InvoiceData): void {
    // Titre section produits (comme dans l'aperçu)
    doc.setTextColor(71, 122, 12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('DÉTAIL DES PRODUITS', 20, 155);
    
    // Ligne de séparation verte (comme dans l'aperçu)
    doc.setDrawColor(71, 122, 12);
    doc.setLineWidth(2);
    doc.line(20, 158, 80, 158);
    
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
      startY: 165,
      head: [['DÉSIGNATION', 'QTÉ', 'PU HT', 'PU TTC', 'REMISE', 'TOTAL TTC']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 122, 12], // Vert MYCONFORT
        textColor: [242, 239, 226], // Beige clair
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 4
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
        fillColor: [248, 250, 252] // Gris très clair
      }
    });
  }

  private static addTotalsSection(doc: jsPDF, data: InvoiceData): void {
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Cadre pour les totaux (comme dans l'aperçu)
    doc.setFillColor(248, 250, 252); // Fond gris clair
    doc.setDrawColor(200, 200, 200);
    doc.roundedRect(130, finalY, 65, 45, 3, 3, 'FD');
    
    doc.setTextColor(20, 40, 29);
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
      doc.setTextColor(220, 38, 38);
      doc.setFont('helvetica', 'normal');
      doc.text('Remise totale:', 135, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(`-${formatCurrency(data.totalDiscount)}`, 185, yPos, { align: 'right' });
      yPos += 7;
      doc.setTextColor(20, 40, 29);
    }
    
    // Ligne de séparation
    doc.setDrawColor(100, 116, 139);
    doc.line(135, yPos, 190, yPos);
    yPos += 5;
    
    // Total TTC (comme dans l'aperçu)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(71, 122, 12);
    doc.text('TOTAL TTC:', 135, yPos);
    doc.text(formatCurrency(data.totalTTC), 185, yPos, { align: 'right' });
    
    // Acompte si applicable
    if (data.depositAmount && data.depositAmount > 0) {
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(20, 40, 29);
      doc.text('Acompte versé:', 135, yPos);
      doc.setFont('helvetica', 'bold');
      doc.text(formatCurrency(data.depositAmount), 185, yPos, { align: 'right' });
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(12);
      doc.setTextColor(255, 140, 0);
      doc.text('RESTE À PAYER:', 135, yPos);
      doc.text(formatCurrency(data.totalTTC - data.depositAmount), 185, yPos, { align: 'right' });
    }
  }

  private static async addSignature(doc: jsPDF, signatureDataUrl: string): Promise<void> {
    try {
      const signatureY = 200;
      
      // Cadre pour la signature (comme dans l'aperçu)
      doc.setDrawColor(100, 116, 139);
      doc.roundedRect(130, signatureY, 60, 25, 2, 2);
      
      doc.setTextColor(71, 122, 12);
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
      
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const signatureDate = new Date().toLocaleDateString('fr-FR');
      doc.text(`Signé le ${signatureDate}`, 160, signatureY + 22, { align: 'center' });
    } catch (error) {
      console.warn('Erreur ajout signature:', error);
      // Fallback texte
      doc.setTextColor(5, 150, 105);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ DOCUMENT SIGNÉ ÉLECTRONIQUEMENT', 160, 210, { align: 'center' });
    }
  }

  private static addPaymentAndLegalSection(doc: jsPDF, data: InvoiceData): void {
    let yPos = 235;
    
    // Modalités de paiement (comme dans l'aperçu)
    if (data.paymentMethod) {
      doc.setTextColor(71, 122, 12);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('MODALITÉS DE PAIEMENT', 15, yPos);
      
      doc.setTextColor(20, 40, 29);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.text(`Mode de règlement: ${data.paymentMethod}`, 15, yPos + 7);
      yPos += 20;
    }
    
    // Loi Hamon dans un cadre rouge (comme dans l'aperçu et demandé)
    doc.setFillColor(254, 242, 242); // Fond rouge très clair
    doc.setDrawColor(239, 68, 68); // Bordure rouge
    doc.setLineWidth(2);
    doc.roundedRect(15, yPos, 180, 20, 2, 2, 'FD');
    
    doc.setTextColor(220, 38, 38);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('LOI HAMON', 20, yPos + 6);
    
    doc.setTextColor(20, 40, 29);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const loiHammonText = 'Les achats effectués sur les foires expositions et salon, à l\'exception de ceux faisant l\'objet d\'un contrat de crédit à la consommation, ne sont pas soumis aux articles L311-10 et L311-15 (délai de rétractation de sept jours) du code de la consommation.';
    
    const splitText = doc.splitTextToSize(loiHammonText, 170);
    doc.text(splitText, 20, yPos + 12);
    
    // Notes si présentes
    if (data.notes) {
      yPos += 30;
      doc.setTextColor(71, 122, 12);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('REMARQUES', 15, yPos);
      
      doc.setFillColor(255, 255, 255);
      doc.setDrawColor(200, 200, 200);
      doc.roundedRect(15, yPos + 5, 180, 15, 2, 2, 'FD');
      
      doc.setTextColor(20, 40, 29);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(data.notes, 170);
      doc.text(splitNotes, 20, yPos + 12);
    }
  }

  private static addFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    
    // Bordure supérieure verte (comme dans l'aperçu)
    doc.setFillColor(71, 122, 12);
    doc.rect(15, pageHeight - 35, 180, 4, 'F');
    
    // Fond vert pour le pied de page (comme dans l'aperçu)
    doc.setFillColor(71, 122, 12);
    doc.rect(15, pageHeight - 30, 180, 30, 'F');
    
    // Contenu du pied de page (comme dans l'aperçu)
    doc.setTextColor(242, 239, 226);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('🌸', 100, pageHeight - 22);
    doc.text('MYCONFORT', 110, pageHeight - 22);
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Merci de votre confiance !', 105, pageHeight - 15, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Votre spécialiste en matelas et literie de qualité', 105, pageHeight - 10, { align: 'center' });
    
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
      depositAmount: invoice.payment.depositAmount,
      signature: invoice.signature
    };
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