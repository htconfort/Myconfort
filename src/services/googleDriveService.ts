import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

const WEBHOOK_CONFIG = {
  URL: 'https://n8n.srv765811.hstgr.cloud/webhook-test/facture-myconfort',
  FOLDER_ID: '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-'
};

export class GoogleDriveService {
  static async uploadPDF(invoice: Invoice, pdfBlob: Blob): Promise<boolean> {
    try {
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      const totalAmount = this.calculateTotal(invoice);
      
      const webhookData = {
        nom_facture: `Facture_MYCONFORT_${invoice.invoiceNumber}`,
        fichier_facture: pdfBase64.split(',')[1],
        date_creation: new Date().toISOString(),
        numero_facture: invoice.invoiceNumber,
        montant_total: totalAmount,
        nom_client: invoice.client.name,
        email_client: invoice.client.email,
        dossier_id: WEBHOOK_CONFIG.FOLDER_ID
      };
      
      const response = await fetch(WEBHOOK_CONFIG.URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(webhookData),
        signal: AbortSignal.timeout(30000)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}`);
      }
      
      return true;
    } catch (error) {
      console.error('Erreur upload Google Drive:', error);
      throw error;
    }
  }

  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  private static calculateTotal(invoice: Invoice): number {
    return invoice.products.reduce((sum, product) => {
      return sum + calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      );
    }, 0);
  }
}