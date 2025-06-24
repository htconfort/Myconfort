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
    
    // PAGE 1 - FACTURE (format original)
    // Ajouter l'en-tête de l'entreprise (sans logo)
    this.addCompanyHeader(doc);
    
    // Ajouter les informations de la facture
    this.addInvoiceInfo(doc, invoiceData);
    
    // Ajouter la mention Loi Hammon
    this.addLoiHammonNotice(doc);
    
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

  private static addCompanyHeader(doc: jsPDF): void {
    // En-tête simple sans logo
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 15, 25);
    
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('Votre spécialiste en matelas et literie de qualité', 15, 32);
    
    // Informations de l'entreprise
    doc.setFontSize(10);
    doc.text('88 Avenue des Ternes', 15, 45);
    doc.text('75017 Paris, France', 15, 52);
    doc.text('SIRET: 824 313 530 00027', 15, 58);
    doc.text('Tél: 04 68 50 41 45', 15, 64);
    doc.text('Email: myconfort@gmail.com', 15, 70);
    doc.text('Site web: https://www.htconfort.com', 15, 76);
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

  private static addLoiHammonNotice(doc: jsPDF): void {
    // Mention Loi Hammon au-dessus de "FACTURER À"
    doc.setTextColor(this.COLORS.danger);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('LOI HAMMON', 15, 85);
    
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    
    const loiHammonText = 'Les achats effectués sur les foires expositions et salon, à l\'exception de ceux faisant l\'objet d\'un contrat de crédit à la consommation, ne sont pas soumis aux articles L311-10 et L311-15 (délai de rétractation de sept jours) du code de la consommation.';
    
    const splitText = doc.splitTextToSize(loiHammonText, 180);
    doc.text(splitText, 15, 90);
  }

  private static addClientInfo(doc: jsPDF, data: InvoiceData): void {
    // Titre section client avec couleur MYCONFORT (décalé vers le bas)
    doc.setFillColor(this.COLORS.light);
    doc.rect(15, 105, 180, 8, 'F');
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURER À', 20, 111);
    
    // Informations client (décalées vers le bas)
    doc.setTextColor(this.COLORS.dark);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(data.clientName, 20, 122);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(data.clientAddress, 20, 129);
    doc.text(`${data.clientPostalCode} ${data.clientCity}`, 20, 136);
    doc.text(`Tél: ${data.clientPhone}`, 20, 143);
    doc.text(`Email: ${data.clientEmail}`, 20, 150);
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
      startY: 160, // Décalé vers le bas pour faire place à la mention Loi Hammon
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

  // PAGE 2 - CONDITIONS GÉNÉRALES DE VENTE CONDENSÉES
  private static addCondensedCGVPage(doc: jsPDF): void {
    console.log('📄 Ajout de la page 2 - CGV condensées en 2 colonnes');
    
    // En-tête de la page CGV avec couleur MYCONFORT
    doc.setFillColor(this.COLORS.primary);
    doc.rect(15, 15, 180, 12, 'F');
    
    doc.setTextColor(this.COLORS.light);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS GÉNÉRALES DE VENTE', 105, 23, { align: 'center' });
    
    // Articles des CGV condensés
    const cgvArticles = [
      {
        title: 'Art. 1 - Livraison',
        content: 'Livraison au pas de porte après contact SMS/mail pour programmer selon vos disponibilités. Vérifiez dimensions pour passage escaliers/portes. Aucun service installation ou reprise ancienne literie.'
      },
      {
        title: 'Art. 2 - Délais',
        content: 'Délais indicatifs non contractuels. Aucune indemnité ou annulation en cas retard, notamment force majeure. Responsabilité déclinée si délai dépassé.'
      },
      {
        title: 'Art. 3 - Transport',
        content: 'Marchandises aux risques destinataire. Avarie/perte: réserves obligatoires sur bordereau transporteur. Non-respect empêche recours contre transporteur.'
      },
      {
        title: 'Art. 4 - Acceptation',
        content: 'Livraison implique acceptation conditions. Transporteur livre adresse indiquée sans monter étages. Client responsable vérification/acceptation marchandises.'
      },
      {
        title: 'Art. 5 - Réclamations',
        content: 'Réclamations qualité par écrit sous 8 jours suivant livraison, lettre recommandée avec accusé réception.'
      },
      {
        title: 'Art. 6 - Retours',
        content: 'Aucun retour sans accord écrit préalable. Accord n\'implique aucune reconnaissance de notre part.'
      },
      {
        title: 'Art. 7 - Dimensions',
        content: 'Matelas: variations +/- 5 cm possibles (thermosensibilité mousses viscoélastiques). Tailles standards indicatives, non contractuelles. Matelas sur mesure: spécifications exactes cadre lit requises.'
      },
      {
        title: 'Art. 8 - Odeurs',
        content: 'Mousses viscoélastiques naturelles (huile ricin) et conditionnement peuvent émettre légère odeur disparaissant après déballage. Non défaut.'
      },
      {
        title: 'Art. 9 - Garantie',
        content: 'Aucun rabais/escompte sauf accord express pour paiement comptant. Garantie couvre mousses, pas textiles/accessoires.'
      },
      {
        title: 'Art. 10 - Paiement',
        content: 'Factures payables chèque, virement, carte bancaire ou espèces à réception.'
      },
      {
        title: 'Art. 11 - Retard',
        content: 'Non-paiement: majoration 10% minimum 300€, sans préjudice intérêts retard. Droit résiliation vente sans sommation.'
      },
      {
        title: 'Art. 12 - Exigibilité',
        content: 'Non-paiement échéance rend immédiatement exigible solde toutes échéances futures.'
      },
      {
        title: 'Art. 13 - Conformité',
        content: 'Livraison endommagée/non conforme: mentionner bon livraison et refuser produit. Constat après départ transporteur: contact sous 72h ouvrables.'
      },
      {
        title: 'Art. 14 - Litiges',
        content: 'Compétence exclusive Tribunal Commerce Perpignan ou tribunal compétent prestataire.'
      },
      {
        title: 'Art. 15 - Horaires',
        content: 'Livraisons lundi-vendredi hors jours fériés. Personne majeure présente requise. Modification adresse après commande: myconfort66@gmail.com immédiatement.'
      }
    ];
    
    // Disposition en 2 colonnes pour optimiser l'espace
    const leftColumnArticles = cgvArticles.slice(0, 8);
    const rightColumnArticles = cgvArticles.slice(8);
    
    let leftYPos = 35;
    let rightYPos = 35;
    const columnWidth = 85;
    const leftMargin = 15;
    const rightMargin = 105;
    
    // Colonne gauche
    for (const article of leftColumnArticles) {
      // Titre de l'article
      doc.setTextColor(this.COLORS.primary);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(article.title, leftMargin, leftYPos);
      leftYPos += 4;
      
      // Contenu de l'article
      doc.setTextColor(this.COLORS.dark);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      const splitText = doc.splitTextToSize(article.content, columnWidth);
      doc.text(splitText, leftMargin, leftYPos);
      leftYPos += splitText.length * 2.5 + 3;
    }
    
    // Colonne droite
    for (const article of rightColumnArticles) {
      // Titre de l'article
      doc.setTextColor(this.COLORS.primary);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text(article.title, rightMargin, rightYPos);
      rightYPos += 4;
      
      // Contenu de l'article
      doc.setTextColor(this.COLORS.dark);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      
      const splitText = doc.splitTextToSize(article.content, columnWidth);
      doc.text(splitText, rightMargin, rightYPos);
      rightYPos += splitText.length * 2.5 + 3;
    }
    
    // Date de mise à jour
    const pageHeight = doc.internal.pageSize.height;
    doc.setTextColor(this.COLORS.secondary);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.text('Les présentes Conditions générales ont été mises à jour le 23 août 2025', 105, pageHeight - 25, { align: 'center' });
    
    // Pied de page pour la page CGV
    // Ligne de séparation
    doc.setDrawColor(this.COLORS.primary);
    doc.line(15, pageHeight - 20, 195, pageHeight - 20);
    
    // Informations entreprise
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 105, pageHeight - 14, { align: 'center' });
    
    doc.setTextColor(this.COLORS.secondary);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text('88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45', 105, pageHeight - 10, { align: 'center' });
    doc.text('Email: myconfort@gmail.com - SIRET: 824 313 530 00027', 105, pageHeight - 6, { align: 'center' });
    
    console.log('✅ Page CGV condensée en 2 colonnes ajoutée avec succès');
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