import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Invoice } from '../types';
import { formatCurrency, calculateHT, calculateProductTotal } from '../utils/calculations';

// Formatage français des montants (version corrigée)
const formatEuro = (val: number): string => {
  // Vérifier que val est un nombre valide
  if (typeof val !== 'number' || isNaN(val)) {
    return '0,00 €';
  }
  
  return Number(val).toLocaleString('fr-FR', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
};

export interface CustomInvoiceData {
  invoiceNumber: string;
  date: string;
  clientName: string;
  clientAddress: string;
  clientPhone: string;
  clientEmail: string;
  items: Array<{
    description: string;
    category?: string;
    qty: number;
    unitPriceHT: number;
    unitPriceTTC: number;
    discount: string;
    totalTTC: number;
  }>;
  totalHT: number;
  vatRate: number;
  vatAmount: number;
  totalDiscount: number;
  totalTTC: number;
  signature?: string;
  advisorName?: string;
  paymentMethod?: string;
  notes?: string;
  depositAmount?: number;
}

export async function generateInvoicePDF(invoiceData: CustomInvoiceData): Promise<jsPDF> {
  const doc = new jsPDF();

  // Logo HT-Confort (simulé avec un cercle coloré et texte)
  doc.setFillColor(71, 122, 12); // Couleur verte MYCONFORT
  doc.circle(25, 20, 8, 'F');
  
  doc.setTextColor(242, 239, 226);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('🌸', 22, 23);

  // En-tête MYCONFORT (sans "FactuSign Pro" comme demandé)
  doc.setTextColor(71, 122, 12);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('MYCONFORT', 40, 20);

  // Informations facture (en haut à droite)
  doc.setTextColor(20, 40, 29);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`N° Facture : ${invoiceData.invoiceNumber}`, 140, 15);
  doc.text(`Date : ${invoiceData.date}`, 140, 20);

  // 📜 Loi Hamon (en haut, sous le logo)
  doc.setFontSize(8);
  doc.setTextColor(100, 100, 100);
  doc.text(
    'Document généré et signé électroniquement — Conforme aux obligations de la loi Hamon',
    15,
    35
  );

  // Informations entreprise
  doc.setTextColor(20, 40, 29);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('88 Avenue des Ternes', 15, 45);
  doc.text('75017 Paris, France', 15, 50);
  doc.text('SIRET: 824 313 530 00027', 15, 55);
  doc.text('Tél: 04 68 50 41 45', 15, 60);
  doc.text('Email: myconfort@gmail.com', 15, 65);

  // Section client
  doc.setFillColor(242, 239, 226);
  doc.rect(15, 75, 180, 8, 'F');
  doc.setTextColor(71, 122, 12);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('FACTURER À :', 20, 81);

  // Informations client
  doc.setTextColor(20, 40, 29);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text(invoiceData.clientName, 20, 92);
  
  doc.setFont('helvetica', 'normal');
  doc.text(invoiceData.clientAddress, 20, 98);
  doc.text(`Tél : ${invoiceData.clientPhone}`, 20, 104);
  doc.text(`Email : ${invoiceData.clientEmail}`, 20, 110);

  // Tableau des produits
  autoTable(doc, {
    startY: 120,
    head: [['Désignation', 'Qté', 'PU HT', 'PU TTC', 'Remise', 'Total TTC']],
    body: invoiceData.items.map((item) => [
      item.description + (item.category ? `\n(${item.category})` : ''),
      item.qty.toString(),
      formatEuro(item.unitPriceHT),
      formatEuro(item.unitPriceTTC),
      item.discount || '-',
      formatEuro(item.totalTTC),
    ]),
    theme: 'grid',
    headStyles: {
      fillColor: [71, 122, 12],
      textColor: [242, 239, 226],
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

  // Totaux (en bas à droite)
  const summaryY = (doc as any).lastAutoTable.finalY + 15;
  
  // Cadre pour les totaux
  doc.setDrawColor(100, 116, 139);
  doc.roundedRect(130, summaryY - 5, 65, 50, 3, 3);
  
  doc.setTextColor(20, 40, 29);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  
  let yPos = summaryY + 3;
  doc.text('Total HT :', 135, yPos);
  doc.text(formatEuro(invoiceData.totalHT), 185, yPos, { align: 'right' });
  yPos += 7;
  
  doc.text(`TVA (${invoiceData.vatRate}%) :`, 135, yPos);
  doc.text(formatEuro(invoiceData.vatAmount), 185, yPos, { align: 'right' });
  yPos += 7;
  
  if (invoiceData.totalDiscount > 0) {
    doc.setTextColor(220, 38, 38);
    doc.text('Remise totale :', 135, yPos);
    doc.text(`-${formatEuro(invoiceData.totalDiscount)}`, 185, yPos, { align: 'right' });
    yPos += 7;
    doc.setTextColor(20, 40, 29);
  }
  
  // Ligne de séparation
  doc.setDrawColor(71, 122, 12);
  doc.line(135, yPos, 190, yPos);
  yPos += 5;
  
  // Total TTC
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(12);
  doc.setTextColor(71, 122, 12);
  doc.text('TOTAL TTC :', 135, yPos);
  doc.text(formatEuro(invoiceData.totalTTC), 185, yPos, { align: 'right' });
  
  // Acompte si applicable
  if (invoiceData.depositAmount && invoiceData.depositAmount > 0) {
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.setTextColor(20, 40, 29);
    doc.text('Acompte versé :', 135, yPos);
    doc.text(formatEuro(invoiceData.depositAmount), 185, yPos, { align: 'right' });
    
    yPos += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(220, 38, 38);
    doc.text('RESTE À PAYER :', 135, yPos);
    doc.text(formatEuro(invoiceData.totalTTC - invoiceData.depositAmount), 185, yPos, { align: 'right' });
  }

  // Signature si présente
  if (invoiceData.signature) {
    try {
      const signatureY = summaryY + 60;
      
      // Cadre pour la signature
      doc.setDrawColor(100, 116, 139);
      doc.roundedRect(130, signatureY, 60, 25, 2, 2);
      
      doc.setTextColor(71, 122, 12);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'bold');
      doc.text('SIGNATURE CLIENT', 160, signatureY + 6, { align: 'center' });
      
      // Si c'est une image de signature
      if (invoiceData.signature.startsWith('data:image')) {
        doc.addImage(
          invoiceData.signature,
          'PNG',
          135,
          signatureY + 8,
          50,
          15,
          undefined,
          'FAST'
        );
      } else {
        // Si c'est du texte
        doc.setFont('helvetica', 'italic');
        doc.setFontSize(10);
        doc.text(invoiceData.signature, 160, signatureY + 15, { align: 'center' });
      }
      
      doc.setTextColor(100, 116, 139);
      doc.setFontSize(7);
      doc.setFont('helvetica', 'normal');
      const signatureDate = new Date().toLocaleDateString('fr-FR');
      doc.text(`Signé le ${signatureDate}`, 160, signatureY + 22, { align: 'center' });
    } catch (error) {
      console.warn('Erreur ajout signature:', error);
    }
  }

  // Modalités de paiement
  let notesY = summaryY + (invoiceData.signature ? 90 : 70);
  
  if (invoiceData.paymentMethod) {
    doc.setTextColor(71, 122, 12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('MODALITÉS DE PAIEMENT', 15, notesY);
    
    doc.setTextColor(20, 40, 29);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`Mode de règlement : ${invoiceData.paymentMethod}`, 15, notesY + 7);
    notesY += 20;
  }

  // Loi Hamon dans un cadre rouge (comme demandé)
  doc.setDrawColor(220, 38, 38);
  doc.setLineWidth(1);
  doc.roundedRect(15, notesY, 180, 25, 2, 2);
  
  doc.setTextColor(220, 38, 38);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.text('LOI HAMON', 20, notesY + 8);
  
  doc.setTextColor(20, 40, 29);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  
  const loiHammonText = 'Les achats effectués sur les foires expositions et salon, à l\'exception de ceux faisant l\'objet d\'un contrat de crédit à la consommation, ne sont pas soumis aux articles L311-10 et L311-15 (délai de rétractation de sept jours) du code de la consommation.';
  
  const splitText = doc.splitTextToSize(loiHammonText, 170);
  doc.text(splitText, 20, notesY + 14);

  // Notes si présentes
  if (invoiceData.notes) {
    notesY += 35;
    doc.setTextColor(71, 122, 12);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('REMARQUES', 15, notesY);
    
    doc.setTextColor(20, 40, 29);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    const splitNotes = doc.splitTextToSize(invoiceData.notes, 180);
    doc.text(splitNotes, 15, notesY + 7);
  }

  // Pied de page
  const pageHeight = doc.internal.pageSize.height;
  doc.setDrawColor(71, 122, 12);
  doc.line(15, pageHeight - 25, 195, pageHeight - 25);
  
  doc.setTextColor(71, 122, 12);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('MYCONFORT', 105, pageHeight - 18, { align: 'center' });
  
  doc.setTextColor(100, 116, 139);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.text('Merci de votre confiance !', 105, pageHeight - 12, { align: 'center' });
  doc.text('TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530', 105, pageHeight - 8, { align: 'center' });

  return doc;
}

// Fonction pour convertir les données de l'application vers le format personnalisé
export function convertInvoiceToCustomFormat(invoice: Invoice): CustomInvoiceData {
  const items = invoice.products.map(product => {
    const unitPriceHT = calculateHT(product.priceTTC, invoice.taxRate);
    const totalTTC = calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
    
    return {
      description: product.name,
      category: product.category,
      qty: product.quantity,
      unitPriceHT: unitPriceHT,
      unitPriceTTC: product.priceTTC,
      discount: product.discount > 0 ? 
        (product.discountType === 'percent' ? `${product.discount}%` : formatEuro(product.discount)) : 
        '',
      totalTTC: totalTTC
    };
  });

  const totalTTC = items.reduce((sum, item) => sum + item.totalTTC, 0);
  const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
  const vatAmount = totalTTC - totalHT;
  const totalDiscount = items.reduce((sum, item) => {
    const originalTotal = item.unitPriceTTC * item.qty;
    return sum + (originalTotal - item.totalTTC);
  }, 0);

  return {
    invoiceNumber: invoice.invoiceNumber,
    date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
    clientName: invoice.client.name,
    clientAddress: `${invoice.client.address}, ${invoice.client.postalCode} ${invoice.client.city}`,
    clientPhone: invoice.client.phone,
    clientEmail: invoice.client.email,
    items,
    totalHT,
    vatRate: invoice.taxRate,
    vatAmount,
    totalDiscount,
    totalTTC,
    signature: invoice.signature,
    advisorName: invoice.advisorName,
    paymentMethod: invoice.payment.method,
    notes: invoice.invoiceNotes,
    depositAmount: invoice.payment.depositAmount
  };
}

// Fonction principale pour télécharger le PDF
export async function downloadCustomPDF(invoice: Invoice): Promise<void> {
  const customData = convertInvoiceToCustomFormat(invoice);
  const doc = await generateInvoicePDF(customData);
  doc.save(`facture_${invoice.invoiceNumber}.pdf`);
}

// Fonction pour obtenir le blob PDF
export async function getCustomPDFBlob(invoice: Invoice): Promise<Blob> {
  const customData = convertInvoiceToCustomFormat(invoice);
  const doc = await generateInvoicePDF(customData);
  return doc.output('blob');
}
