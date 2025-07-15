import { Invoice } from '../types';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

export class AdvancedPDFService {
  /**
   * Télécharge le PDF d'une facture
   */
  static async downloadPDF(invoice: Invoice): Promise<void> {
    try {
      console.log('🔍 DEBUG PDF - Données facture reçues:', invoice);
      console.log('🔍 DEBUG PDF - Produits:', invoice.products);
      console.log('🔍 DEBUG PDF - Client:', invoice.client);
      
      // 🚫 VALIDATION : Vérifier qu'il y a des produits
      if (!invoice.products || invoice.products.length === 0) {
        console.error('❌ DEBUG PDF - Aucun produit dans la facture');
        throw new Error('Impossible de générer un PDF sans produits.\n\nVeuillez ajouter au moins un produit à votre facture avant de télécharger le PDF.');
      }
      
      // 🚫 VALIDATION : Vérifier les données client essentielles
      if (!invoice.client.name || !invoice.client.email) {
        console.error('❌ DEBUG PDF - Données client incomplètes:', invoice.client);
        throw new Error('Impossible de générer un PDF sans informations client complètes.\n\nVeuillez remplir au minimum le nom et l\'email du client.');
      }
      
      const pdfBlob = await this.getPDFBlob(invoice);
      console.log('🔍 DEBUG PDF - Blob généré:', pdfBlob);
      console.log('🔍 DEBUG PDF - Taille du blob:', pdfBlob.size, 'bytes');
      
      // Créer un lien de téléchargement
      const url = URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `Facture_MYCONFORT_${invoice.invoiceNumber}.pdf`;
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Erreur lors du téléchargement PDF:', error);
      throw new Error('Impossible de télécharger le PDF');
    }
  }

  /**
   * Génère un blob PDF d'une facture
   */
  static async getPDFBlob(invoice: Invoice): Promise<Blob> {
    try {
      console.log('🔍 DEBUG PDF BLOB - Début génération pour facture:', invoice.invoiceNumber);
      
      // 🚫 VALIDATION : Double vérification des produits
      if (!invoice.products || invoice.products.length === 0) {
        console.error('❌ DEBUG PDF BLOB - Aucun produit pour génération blob');
        throw new Error('Impossible de générer le PDF : aucun produit dans la facture');
      }
      
      // Chercher l'élément de la facture
      const element = document.querySelector('.facture-apercu') || 
                     document.getElementById('pdf-preview-content') ||
                     document.querySelector('[data-invoice-preview]');
      
      console.log('🔍 DEBUG PDF BLOB - Élément trouvé:', element);
      console.log('🔍 DEBUG PDF BLOB - Contenu HTML:', element?.innerHTML?.substring(0, 200) + '...');
      
      if (!element) {
        throw new Error('Élément facture non trouvé pour la génération PDF');
      }

      // Créer le PDF avec jsPDF pour gérer les pages multiples
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      console.log('🔍 DEBUG PDF BLOB - jsPDF initialisé');
      // PAGE 1 - FACTURE
      const invoicePage = element.querySelector('.invoice-page') as HTMLElement;
      console.log('🔍 DEBUG PDF BLOB - Page facture trouvée:', invoicePage);
      
      if (invoicePage) {
        console.log('🔍 DEBUG PDF BLOB - Capture page facture...');
        const canvas1 = await html2canvas(invoicePage, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: invoicePage.scrollWidth,
          height: invoicePage.scrollHeight
        });

        console.log('🔍 DEBUG PDF BLOB - Canvas facture créé:', canvas1.width, 'x', canvas1.height);
        
        const imgData1 = canvas1.toDataURL('image/jpeg', 0.95);
        console.log('🔍 DEBUG PDF BLOB - Image data facture:', imgData1.substring(0, 50) + '...');
        
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = pdf.internal.pageSize.getHeight();
        const imgWidth1 = canvas1.width;
        const imgHeight1 = canvas1.height;
        const ratio1 = Math.min(pdfWidth / imgWidth1, pdfHeight / imgHeight1);
        const imgX1 = (pdfWidth - imgWidth1 * ratio1) / 2;
        const imgY1 = 0;

        pdf.addImage(imgData1, 'JPEG', imgX1, imgY1, imgWidth1 * ratio1, imgHeight1 * ratio1);
        console.log('🔍 DEBUG PDF BLOB - Page facture ajoutée au PDF');
      }

      // PAGE 2 - CONDITIONS GÉNÉRALES DE VENTE
      const termsPage = element.querySelector('.terms-page') as HTMLElement;
      console.log('🔍 DEBUG PDF BLOB - Page CGV trouvée:', termsPage);
      
      if (termsPage) {
        // Ajouter une nouvelle page
        pdf.addPage();
        console.log('🔍 DEBUG PDF BLOB - Nouvelle page ajoutée pour CGV');
        
        const canvas2 = await html2canvas(termsPage, {
          scale: 2,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false,
          width: termsPage.scrollWidth,
          height: termsPage.scrollHeight
        });

        console.log('🔍 DEBUG PDF BLOB - Canvas CGV créé:', canvas2.width, 'x', canvas2.height);
        
        const imgData2 = canvas2.toDataURL('image/jpeg', 0.95);
        console.log('🔍 DEBUG PDF BLOB - Image data CGV:', imgData2.substring(0, 50) + '...');
        
        const imgWidth2 = canvas2.width;
        const imgHeight2 = canvas2.height;
        const ratio2 = Math.min(pdfWidth / imgWidth2, pdfHeight / imgHeight2);
        const imgX2 = (pdfWidth - imgWidth2 * ratio2) / 2;
        const imgY2 = 0;

        pdf.addImage(imgData2, 'JPEG', imgX2, imgY2, imgWidth2 * ratio2, imgHeight2 * ratio2);
        console.log('🔍 DEBUG PDF BLOB - Page CGV ajoutée au PDF');
      }

      // Retourner le blob
      const finalBlob = pdf.output('blob');
      console.log('🔍 DEBUG PDF BLOB - Blob final généré:', finalBlob.size, 'bytes');
      return finalBlob;
    } catch (error) {
      console.error('Erreur lors de la génération du blob PDF:', error);
      console.error('❌ Stack trace:', error.stack);
      throw new Error('Impossible de générer le PDF');
    }
  }

  /**
   * Génère un PDF en base64
   */
  static async getPDFBase64(invoice: Invoice): Promise<string> {
    try {
      const pdfBlob = await this.getPDFBlob(invoice);
      
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const result = reader.result as string;
          resolve(result);
        };
        reader.onerror = () => reject(new Error('Erreur lecture du blob PDF'));
        reader.readAsDataURL(pdfBlob);
      });
    } catch (error) {
      console.error('Erreur lors de la génération PDF base64:', error);
      throw new Error('Impossible de générer le PDF en base64');
    }
  }
}