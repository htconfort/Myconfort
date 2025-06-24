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
    
    // Ajouter le logo MYCONFORT
    await this.addLogo(doc);
    
    // Ajouter l'en-tête de l'entreprise
    this.addCompanyHeader(doc);
    
    // Ajouter les informations de la facture
    this.addInvoiceInfo(doc, invoiceData);
    
    // Ajouter les informations client
    this.addClientInfo(doc, invoiceData);
    
    // Ajouter le tableau des produits
    this.addProductsTable(doc, invoiceData);
    
    // Ajouter les totaux
    this.addTotals(doc, invoiceData);
    
    // Ajouter les notes et conditions
    this.addNotesAndTerms(doc, invoiceData);
    
    // Ajouter le pied de page
    this.addFooter(doc);
    
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

  private static async addLogo(doc: jsPDF): Promise<void> {
    try {
      // Charger le vrai logo MYCONFORT SVG
      const logoPath = '/public/logo.svg';
      
      // Créer une image pour charger le logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Promesse pour attendre le chargement du logo
      const logoLoaded = new Promise<boolean>((resolve) => {
        img.onload = () => {
          try {
            // Ajouter le logo SVG au PDF
            doc.addImage(img, 'SVG', 15, 15, 50, 20);
            console.log('✅ Logo MYCONFORT ajouté au PDF');
            resolve(true);
          } catch (error) {
            console.warn('⚠️ Erreur lors de l\'ajout du logo SVG:', error);
            resolve(false);
          }
        };
        
        img.onerror = () => {
          console.warn('⚠️ Impossible de charger le logo SVG');
          resolve(false);
        };
        
        // Timeout de 2 secondes pour éviter les blocages
        setTimeout(() => {
          console.warn('⏱️ Timeout lors du chargement du logo');
          resolve(false);
        }, 2000);
      });
      
      // Tenter de charger le logo
      img.src = logoPath;
      const logoSuccess = await logoLoaded;
      
      // Si le logo n'a pas pu être chargé, utiliser un fallback
      if (!logoSuccess) {
        this.addFallbackLogo(doc);
      }
      
    } catch (error) {
      console.warn('❌ Erreur lors du chargement du logo:', error);
      this.addFallbackLogo(doc);
    }
  }

  private static addFallbackLogo(doc: jsPDF): void {
    try {
      // Logo de fallback avec la charte graphique MYCONFORT
      doc.setFillColor(this.COLORS.primary);
      doc.roundedRect(15, 15, 50, 20, 3, 3, 'F');
      
      // Icône M pour MYCONFORT
      doc.setTextColor(this.COLORS.light);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.text('M', 22, 28);
      
      // Texte MYCONFORT
      doc.setFontSize(10);
      doc.text('MYCONFORT', 30, 28);
      
      console.log('🔄 Logo de fallback MYCONFORT utilisé');
    } catch (error) {
      console.error('❌ Erreur lors de la création du logo de fallback:', error);
    }
  }

  private static addCompanyHeader(doc: jsPDF): void {
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 15, 45);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text('88 Avenue des Ternes', 15, 52);
    doc.text('75017 Paris, France', 15, 58);
    doc.text('SIRET: 824 313 530 00027', 15, 64);
    doc.text('Tél: 04 68 50 41 45', 15, 70);
    doc.text('Email: myconfort@gmail.com', 15, 76);
    doc.text('Site web: https://www.htconfort.com', 15, 82);
  }

  private static addInvoiceInfo(doc: jsPDF, data: InvoiceData): void {
    // Titre FACTURE avec couleur MYCONFORT
    doc.setFillColor(this.COLORS.primary);
    doc.roundedRect(140, 15, 55, 15, 3, 3, 'F');
    doc.setTextColor(this.COLORS.light);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 155, 26);
    
    // Informations de la facture
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text('N° Facture:', 140, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(data.invoiceNumber, 170, 40);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Date:', 140, 47);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(data.invoiceDate).toLocaleDateString('fr-FR'), 170, 47);
  }

  private static addClientInfo(doc: jsPDF, data: InvoiceData): void {
    // Titre section client avec couleur MYCONFORT
    doc.setFillColor(this.COLORS.light);
    doc.rect(15, 95, 180, 8, 'F');
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURER À', 20, 101);
    
    // Informations client
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(data.clientName, 20, 112);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(data.clientAddress, 20, 119);
    doc.text(`${data.clientPostalCode} ${data.clientCity}`, 20, 126);
    doc.text(`Tél: ${data.clientPhone}`, 20, 133);
    doc.text(`Email: ${data.clientEmail}`, 20, 140);
  }

  private static addProductsTable(doc: jsPDF, data: InvoiceData): void {
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
      startY: 150,
      head: [['DÉSIGNATION', 'QTÉ', 'PU HT', 'PU TTC', 'REMISE', 'TOTAL TTC']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: this.COLORS.primary,
        textColor: this.COLORS.light,
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60, halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });
  }

  private static addTotals(doc: jsPDF, data: InvoiceData): void {
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // Cadre pour les totaux
    doc.setDrawColor(this.COLORS.secondary);
    doc.roundedRect(130, finalY, 65, 45, 3, 3);
    
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let yPos = finalY + 8;
    
    // Total HT
    doc.text('Total HT:', 135, yPos);
    doc.text(formatCurrency(data.totalHT), 185, yPos, { align: 'right' });
    yPos += 7;
    
    // TVA
    doc.text(`TVA (${data.taxRate}%):`, 135, yPos);
    doc.text(formatCurrency(data.totalTVA), 185, yPos, { align: 'right' });
    yPos += 7;
    
    // Remise totale si applicable
    if (data.totalDiscount > 0) {
      doc.setTextColor(this.COLORS.danger);
      doc.text('Remise totale:', 135, yPos);
      doc.text(`-${formatCurrency(data.totalDiscount)}`, 185, yPos, { align: 'right' });
      yPos += 7;
      doc.setTextColor(this.COLORS.dark);
    }
    
    // Ligne de séparation
    doc.setDrawColor(this.COLORS.primary);
    doc.line(135, yPos, 190, yPos);
    yPos += 5;
    
    // Total TTC
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(this.COLORS.primary);
    doc.text('TOTAL TTC:', 135, yPos);
    doc.text(formatCurrency(data.totalTTC), 185, yPos, { align: 'right' });
    
    // Acompte si applicable
    if (data.depositAmount && data.depositAmount > 0) {
      yPos += 10;
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(10);
      doc.setTextColor(this.COLORS.dark);
      doc.text('Acompte versé:', 135, yPos);
      doc.text(formatCurrency(data.depositAmount), 185, yPos, { align: 'right' });
      
      yPos += 7;
      doc.setFont('helvetica', 'bold');
      doc.setTextColor(this.COLORS.danger);
      doc.text('RESTE À PAYER:', 135, yPos);
      doc.text(formatCurrency(data.totalTTC - data.depositAmount), 185, yPos, { align: 'right' });
    }
  }

  private static addNotesAndTerms(doc: jsPDF, data: InvoiceData): void {
    let yPos = 220;
    
    // Notes si présentes
    if (data.notes) {
      doc.setTextColor(this.COLORS.primary);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('REMARQUES', 15, yPos);
      
      doc.setTextColor(this.COLORS.dark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      const splitNotes = doc.splitTextToSize(data.notes, 180);
      doc.text(splitNotes, 15, yPos + 7);
      yPos += 20;
    }
    
    // Modalités de paiement
    if (data.paymentMethod) {
      doc.setTextColor(this.COLORS.primary);
      doc.setFontSize(11);
      doc.setFont('helvetica', 'bold');
      doc.text('MODALITÉS DE PAIEMENT', 15, yPos);
      
      doc.setTextColor(this.COLORS.dark);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(9);
      doc.text(`Mode de règlement: ${data.paymentMethod}`, 15, yPos + 7);
      yPos += 15;
    }
    
    // Conditions générales
    doc.setTextColor(this.COLORS.secondary);
    doc.setFontSize(8);
    doc.text('Paiement à réception de facture. En cas de retard de paiement, des pénalités de 3 fois le taux d\'intérêt légal seront appliquées.', 15, yPos);
  }

  private static addFooter(doc: jsPDF): void {
    const pageHeight = doc.internal.pageSize.height;
    
    // Ligne de séparation avec couleur MYCONFORT
    doc.setDrawColor(this.COLORS.primary);
    doc.line(15, pageHeight - 25, 195, pageHeight - 25);
    
    // Texte du pied de page
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT - Merci de votre confiance !', 105, pageHeight - 18, { align: 'center' });
    
    doc.setTextColor(this.COLORS.secondary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Votre spécialiste en matelas et literie de qualité', 105, pageHeight - 12, { align: 'center' });
    doc.text('TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530', 105, pageHeight - 8, { align: 'center' });
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