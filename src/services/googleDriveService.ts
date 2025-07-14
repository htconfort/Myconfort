import { Invoice } from '../types';
import { GOOGLE_DRIVE_CONFIG } from '../config/googleDrive';
import { PDFService } from './pdfService';

export class GoogleDriveService {
  /**
   * 📤 Upload d'une facture PDF vers Google Drive
   */
  static async uploadInvoicePDF(
    invoice: Invoice, 
    uploadFunction: (file: File, fileName: string) => Promise<boolean>
  ): Promise<boolean> {
    try {
      console.log('📤 Début upload facture vers Google Drive...');

      // Générer le PDF
      const pdfBlob = await PDFService.getPDFBlob(invoice);
      
      // Créer le fichier
      const fileName = `Facture_MyConfort_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Upload via le hook
      const success = await uploadFunction(file, fileName);

      if (success) {
        console.log('✅ Upload facture réussi:', fileName);
        
        // Optionnel: Notifier n8n si configuré
        if (GOOGLE_DRIVE_CONFIG.WEBHOOK_URL) {
          await this.notifyN8N(invoice, fileName);
        }
      }

      return success;
    } catch (error) {
      console.error('❌ Erreur upload facture:', error);
      return false;
    }
  }

  /**
   * 🔔 Notification optionnelle vers n8n
   */
  private static async notifyN8N(invoice: Invoice, fileName: string): Promise<void> {
    try {
      const webhookData = {
        type: 'invoice_uploaded',
        invoice_number: invoice.invoiceNumber,
        client_name: invoice.client.name,
        client_email: invoice.client.email,
        file_name: fileName,
        upload_date: new Date().toISOString(),
        folder_id: GOOGLE_DRIVE_CONFIG.FOLDER_ID
      };

      await fetch(GOOGLE_DRIVE_CONFIG.WEBHOOK_URL!, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      console.log('✅ Notification n8n envoyée');
    } catch (error) {
      console.warn('⚠️ Erreur notification n8n (non bloquante):', error);
    }
  }

  /**
   * 🔧 Validation de la configuration
   */
  static validateConfig(): { isValid: boolean; errors: string[] } {
    const errors = GOOGLE_DRIVE_CONFIG.getErrors();
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}