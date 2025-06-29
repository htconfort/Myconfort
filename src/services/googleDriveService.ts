import { GoogleFile, GoogleDriveResponse } from '../types/google';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

// Configuration for Google Drive integration via n8n webhook
const MAKE_CONFIG = {
  WEBHOOK_URL: 'https://n8n.srv765811.hstgr.cloud/webhook-test/facture-myconfort', // n8n webhook URL
  FOLDER_ID: '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-' // Google Drive folder ID
};

export class GoogleDriveService {
  private static instance: GoogleDriveService;

  static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  /**
   * Uploads a PDF to Google Drive via n8n webhook
   */
  static async uploadPDFToGoogleDrive(invoice: Invoice, pdfBlob: Blob): Promise<boolean> {
    try {
      console.log('🚀 UPLOAD PDF VERS GOOGLE DRIVE VIA n8n');
      
      // Convert PDF blob to base64
      const pdfBase64 = await this.blobToBase64(pdfBlob);
      
      // Calculate invoice totals for metadata
      const totalAmount = invoice.products.reduce((sum, product) => {
        return sum + calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        );
      }, 0);

      const acompteAmount = invoice.payment.depositAmount || 0;
      const montantRestant = totalAmount - acompteAmount;
      
      // Prepare data for n8n webhook
      const webhookData = {
        // PDF data
        nom_facture: `Facture_MYCONFORT_${invoice.invoiceNumber}`,
        fichier_facture: pdfBase64.split(',')[1], // Remove data:application/pdf;base64, prefix
        date_creation: new Date().toISOString(),
        
        // Invoice metadata
        numero_facture: invoice.invoiceNumber,
        date_facture: invoice.invoiceDate,
        montant_total: totalAmount,
        acompte: acompteAmount,
        montant_restant: montantRestant,
        
        // Client information
        nom_client: invoice.client.name,
        email_client: invoice.client.email,
        telephone_client: invoice.client.phone,
        adresse_client: `${invoice.client.address}, ${invoice.client.postalCode} ${invoice.client.city}`,
        
        // Payment information
        mode_paiement: invoice.payment.method || 'Non spécifié',
        signature: invoice.signature ? 'Oui' : 'Non',
        
        // Additional metadata
        conseiller: invoice.advisorName || 'MYCONFORT',
        lieu_evenement: invoice.eventLocation || 'Non spécifié',
        nombre_produits: invoice.products.length,
        produits: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', '),
        
        // Google Drive folder ID
        dossier_id: MAKE_CONFIG.FOLDER_ID
      };
      
      console.log('📤 Envoi des données vers n8n pour upload Google Drive...');
      
      // Send data to n8n webhook
      const response = await fetch(MAKE_CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur n8n: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('✅ PDF envoyé avec succès vers Google Drive via n8n:', result);
      
      return true;
    } catch (error) {
      console.error('❌ Erreur lors de l\'upload vers Google Drive:', error);
      return false;
    }
  }
  
  /**
   * Converts a Blob to base64
   */
  private static async blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Erreur de conversion blob vers base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  async testGoogleDriveIntegration(): Promise<GoogleDriveResponse> {
    try {
      // Vérifier si GAPI est initialisé
      if (!window.gapi || !window.gapi.client || !window.gapi.client.drive) {
        throw new Error('Google API non initialisé');
      }

      // Vérifier la connexion
      const authInstance = window.gapi.auth2.getAuthInstance();
      if (!authInstance.isSignedIn.get()) {
        throw new Error('Utilisateur non connecté à Google');
      }

      console.log('🔍 Test de connexion Google Drive...');

      // Lister les fichiers
      const response = await window.gapi.client.drive.files.list({
        pageSize: 10,
        fields: 'nextPageToken, files(id, name, mimeType, size, modifiedTime)',
        orderBy: 'modifiedTime desc'
      });

      console.log('✅ Connexion Google Drive réussie:', response.result);
      return response.result;

    } catch (error) {
      console.error('❌ Erreur test Google Drive:', error);
      throw error;
    }
  }

  async uploadFile(file: File, parentFolderId?: string): Promise<GoogleFile> {
    try {
      const metadata = {
        name: file.name,
        parents: parentFolderId ? [parentFolderId] : undefined,
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`,
        },
        body: form,
      });

      if (!response.ok) {
        throw new Error(`Erreur upload: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Erreur upload fichier:', error);
      throw error;
    }
  }

  /**
   * Tests the Google Drive integration
   */
  static async testGoogleDriveIntegration(): Promise<{ success: boolean; message: string }> {
    try {
      console.log('🧪 TEST DE L\'INTÉGRATION GOOGLE DRIVE VIA n8n');
      
      // Create a small test PDF
      const testBlob = new Blob(['Test PDF content for Google Drive integration'], { type: 'application/pdf' });
      const testBase64 = await this.blobToBase64(testBlob);
      
      // Prepare test data
      const testData = {
        nom_facture: 'Test_Integration_n8n_GoogleDrive',
        fichier_facture: testBase64.split(',')[1],
        date_creation: new Date().toISOString(),
        test: true,
        dossier_id: MAKE_CONFIG.FOLDER_ID
      };
      
      // Send test data to n8n webhook
      const response = await fetch(MAKE_CONFIG.WEBHOOK_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });
      
      if (!response.ok) {
        throw new Error(`Erreur n8n: ${response.status} ${response.statusText}`);
      }
      
      const result = await response.json();
      
      return {
        success: true,
        message: `✅ Test d'intégration Google Drive réussi ! Le fichier test a été uploadé dans le dossier ${MAKE_CONFIG.FOLDER_ID}.`
      };
    } catch (error: any) {
      console.error('❌ Erreur test intégration Google Drive:', error);
      
      return {
        success: false,
        message: `❌ Erreur lors du test d'intégration Google Drive: ${error.message}`
      };
    }
  }
  
  /**
   * Configures the n8n webhook URL
   */
  static updateWebhookConfig(webhookUrl: string, folderId?: string): void {
    if (webhookUrl) {
      localStorage.setItem('n8n_webhook_url', webhookUrl);
    }
    
    if (folderId) {
      localStorage.setItem('google_drive_folder_id', folderId);
    }
    
    // Update the configuration
    const savedWebhookUrl = localStorage.getItem('n8n_webhook_url');
    const savedFolderId = localStorage.getItem('google_drive_folder_id');
    
    if (savedWebhookUrl) {
      MAKE_CONFIG.WEBHOOK_URL = savedWebhookUrl;
    }
    
    if (savedFolderId) {
      MAKE_CONFIG.FOLDER_ID = savedFolderId;
    }
  }
  
  /**
   * Gets the current configuration
   */
  static getConfig(): { webhookUrl: string; folderId: string } {
    // Initialize with default values from localStorage if available
    const savedWebhookUrl = localStorage.getItem('n8n_webhook_url');
    const savedFolderId = localStorage.getItem('google_drive_folder_id');
    
    if (savedWebhookUrl) {
      MAKE_CONFIG.WEBHOOK_URL = savedWebhookUrl;
    }
    
    if (savedFolderId) {
      MAKE_CONFIG.FOLDER_ID = savedFolderId;
    }
    
    return {
      webhookUrl: MAKE_CONFIG.WEBHOOK_URL,
      folderId: MAKE_CONFIG.FOLDER_ID
    };
  }
}