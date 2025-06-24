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
    
    // PAGE 1 - FACTURE
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
    
    // PAGE 2 - CONDITIONS GÉNÉRALES DE VENTE
    doc.addPage();
    this.addCGVPage(doc);
    
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
      console.log('🎨 Chargement du logo MYCONFORT...');
      
      // Charger le vrai logo MYCONFORT SVG
      const logoPath = '/logo.svg'; // ✅ Chemin corrigé vers le logo copié
      
      // Créer une image pour charger le logo
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Promesse pour attendre le chargement du logo
      const logoLoaded = new Promise<boolean>((resolve) => {
        img.onload = () => {
          try {
            // Ajouter le logo SVG au PDF avec les bonnes dimensions
            doc.addImage(img, 'SVG', 15, 15, 50, 20);
            console.log('✅ Logo MYCONFORT SVG ajouté au PDF avec succès !');
            resolve(true);
          } catch (error) {
            console.warn('⚠️ Erreur lors de l\'ajout du logo SVG:', error);
            resolve(false);
          }
        };
        
        img.onerror = (error) => {
          console.warn('⚠️ Impossible de charger le logo SVG depuis:', logoPath);
          console.warn('🔍 Erreur de chargement:', error);
          resolve(false);
        };
        
        // Timeout de 3 secondes pour éviter les blocages
        setTimeout(() => {
          console.warn('⏱️ Timeout lors du chargement du logo (3s)');
          resolve(false);
        }, 3000);
      });
      
      // Tenter de charger le logo
      console.log('📂 Tentative de chargement depuis:', logoPath);
      img.src = logoPath;
      const logoSuccess = await logoLoaded;
      
      // Si le logo n'a pas pu être chargé, utiliser un fallback
      if (!logoSuccess) {
        console.log('🔄 Utilisation du logo de fallback MYCONFORT');
        this.addFallbackLogo(doc);
      }
      
    } catch (error) {
      console.warn('❌ Erreur générale lors du chargement du logo:', error);
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
      
      console.log('🔄 Logo de fallback MYCONFORT créé avec succès');
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

  // NOUVELLE MÉTHODE : PAGE 2 - CONDITIONS GÉNÉRALES DE VENTE
  private static addCGVPage(doc: jsPDF): void {
    console.log('📄 Ajout de la page 2 - Conditions Générales de Vente');
    
    // En-tête de la page CGV
    doc.setFillColor(this.COLORS.primary);
    doc.rect(15, 15, 180, 15, 'F');
    
    doc.setTextColor(this.COLORS.light);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('CONDITIONS GÉNÉRALES DE VENTE', 105, 26, { align: 'center' });
    
    let yPos = 45;
    const lineHeight = 5;
    const marginLeft = 15;
    const marginRight = 195;
    const textWidth = marginRight - marginLeft;
    
    // Articles des CGV
    const cgvArticles = [
      {
        title: 'Art. 1 - Livraison',
        content: 'Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités (à la journée ou demi-journée). Le transporteur livre le produit au pas de porte ou en bas de l\'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d\'installation ou de reprise de l\'ancienne literie n\'est prévu.'
      },
      {
        title: 'Art. 2 - Délais de Livraison',
        content: 'Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.'
      },
      {
        title: 'Art. 3 - Risques de Transport',
        content: 'Les marchandises voyagent aux risques du destinataire. En cas d\'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoire sur le bordereau du transporteur. En cas de non-respect de cette obligation on ne peut pas se retourner contre le transporteur.'
      },
      {
        title: 'Art. 4 - Acceptation des Conditions',
        content: 'Toute livraison implique l\'acceptation des présentes conditions. Le transporteur livre à l\'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d\'accepter les marchandises lors de la livraison.'
      },
      {
        title: 'Art. 5 - Réclamations',
        content: 'Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.'
      },
      {
        title: 'Art. 6 - Retours',
        content: 'Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable. Cet accord n\'implique aucune reconnaissance.'
      },
      {
        title: 'Art. 7 - Tailles des Matelas',
        content: 'Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif et ne constituent pas une obligation contractuelle. Les matelas sur mesure doivent inclure les spécifications exactes du cadre de lit.'
      },
      {
        title: 'Art. 8 - Odeur des Matériaux',
        content: 'Les mousses viscoélastiques naturelles (à base d\'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur qui disparaît après déballage. Cela ne constitue pas un défaut.'
      },
      {
        title: 'Art. 9 - Règlements et Remises',
        content: 'Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant. La garantie couvre les mousses, mais pas les textiles et accessoires.'
      },
      {
        title: 'Art. 10 - Paiement',
        content: 'Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.'
      },
      {
        title: 'Art. 11 - Pénalités de Retard',
        content: 'En cas de non-paiement, une majoration de 10% avec un minimum de 300 € sera appliquée, sans préjudice des intérêts de retard. Nous nous réservons le droit de résilier la vente sans sommation.'
      },
      {
        title: 'Art. 12 - Exigibilité en Cas de Non-Paiement',
        content: 'Le non-paiement d\'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.'
      },
      {
        title: 'Art. 13 - Livraison Incomplète ou Non-Conforme',
        content: 'En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison et refusez le produit. Si l\'erreur est constatée après le départ du transporteur, contactez-nous sous 72h ouvrables.'
      },
      {
        title: 'Art. 14 - Litiges',
        content: 'Tout litige sera de la compétence exclusive du Tribunal de Commerce de Perpignan ou du tribunal compétent du prestataire.'
      },
      {
        title: 'Art. 15 - Horaires de Livraison',
        content: 'Les livraisons sont effectuées du lundi au vendredi (hors jours fériés). Une personne majeure doit être présente à l\'adresse lors de la livraison. Toute modification d\'adresse après commande doit être signalée immédiatement à myconfort66@gmail.com.'
      }
    ];
    
    // Ajouter chaque article
    for (const article of cgvArticles) {
      // Vérifier si on a assez de place pour l'article
      if (yPos > 250) {
        doc.addPage();
        yPos = 30;
      }
      
      // Titre de l'article
      doc.setTextColor(this.COLORS.primary);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text(article.title, marginLeft, yPos);
      yPos += lineHeight + 1;
      
      // Contenu de l'article
      doc.setTextColor(this.COLORS.dark);
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      const splitText = doc.splitTextToSize(article.content, textWidth);
      doc.text(splitText, marginLeft, yPos);
      yPos += splitText.length * lineHeight + 3;
    }
    
    // Date de mise à jour
    yPos += 10;
    if (yPos > 270) {
      doc.addPage();
      yPos = 30;
    }
    
    doc.setTextColor(this.COLORS.secondary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Les présentes Conditions générales ont été mises à jour le 23 août 2025', 105, yPos, { align: 'center' });
    
    // Pied de page pour la page CGV
    const pageHeight = doc.internal.pageSize.height;
    
    // Ligne de séparation
    doc.setDrawColor(this.COLORS.primary);
    doc.line(15, pageHeight - 25, 195, pageHeight - 25);
    
    // Informations entreprise
    doc.setTextColor(this.COLORS.primary);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 105, pageHeight - 18, { align: 'center' });
    
    doc.setTextColor(this.COLORS.secondary);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45', 105, pageHeight - 12, { align: 'center' });
    doc.text('Email: myconfort@gmail.com - SIRET: 824 313 530 00027', 105, pageHeight - 8, { align: 'center' });
    
    console.log('✅ Page CGV ajoutée avec succès');
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