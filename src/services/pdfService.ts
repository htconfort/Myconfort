import { Invoice } from '../types';
import { AdvancedPDFService } from './advancedPdfService';

export class PDFService {
  static async generatePDF(invoice: Invoice): Promise<void> {
    try {
      await AdvancedPDFService.downloadPDF(invoice);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }

  static async getPDFBlob(invoice: Invoice): Promise<Blob> {
    try {
      return await AdvancedPDFService.getPDFBlob(invoice);
    } catch (error) {
      console.error('Erreur génération PDF blob:', error);
      throw new Error('Impossible de générer le PDF');
    }
  }
}