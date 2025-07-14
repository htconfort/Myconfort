import { Invoice } from '../types';
import { GOOGLE_DRIVE_CONFIG } from '../config/googleDrive';
import { PDFService } from './pdfService';

interface GoogleDriveConfig {
  webhookUrl: string;
  folderId: string;
}

export class GoogleDriveService {
  private static readonly STORAGE_KEY = 'google_drive_config';

  /**
   * 🔧 Récupérer la configuration Google Drive
   */
  static getConfig(): GoogleDriveConfig {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const config = JSON.parse(stored);
        return {
          webhookUrl: config.webhookUrl || import.meta.env.N8N_WEBHOOK_URL || '',
          folderId: config.folderId || import.meta.env.GOOGLE_DRIVE_FOLDER_ID || ''
        };
      }
    } catch (error) {
      console.warn('⚠️ Erreur lecture config Google Drive:', error);
    }

    // Configuration par défaut depuis les variables d'environnement
    return {
      webhookUrl: import.meta.env.N8N_WEBHOOK_URL || '',
      folderId: import.meta.env.GOOGLE_DRIVE_FOLDER_ID || ''
    };
  }

  /**
   * 💾 Mettre à jour la configuration Google Drive
   */
  static updateWebhookConfig(webhookUrl: string, folderId: string): void {
    try {
      const config: GoogleDriveConfig = {
        webhookUrl: webhookUrl.trim(),
        folderId: folderId.trim()
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(config));
      console.log('✅ Configuration Google Drive sauvegardée');
    } catch (error) {
      console.error('❌ Erreur sauvegarde config Google Drive:', error);
      throw new Error('Impossible de sauvegarder la configuration');
    }
  }

  /**
   * 📤 Upload d'une facture PDF vers Google Drive
   */
  static async uploadInvoicePDF(
    invoice: Invoice, 
    uploadFunction: (file: File, fileName: string, folderId: string) => Promise<boolean>
  ): Promise<boolean> {
    try {
      console.log('📤 Début upload facture vers Google Drive...');

      const config = this.getConfig();
      if (!config.folderId) {
        throw new Error('ID du dossier Google Drive non configuré');
      }

      // Générer le PDF
      const pdfBlob = await PDFService.getPDFBlob(invoice);
      
      // Créer le fichier
      const fileName = `Facture_MyConfort_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

      // Upload via le hook avec l'ID du dossier
      const success = await uploadFunction(file, fileName, config.folderId);

      if (success) {
        console.log('✅ Upload facture réussi:', fileName);
        
        // Optionnel: Notifier n8n si configuré
        if (config.webhookUrl) {
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
   * 📤 Upload direct d'un PDF vers Google Drive
   */
  static async uploadPDFToGoogleDrive(invoice: Invoice, pdfBlob: Blob): Promise<boolean> {
    try {
      const config = this.getConfig();
      
      if (!config.webhookUrl) {
        throw new Error('URL webhook n8n non configurée');
      }

      const fileName = `Facture_MyConfort_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Convertir le blob en base64
      const base64 = await this.blobToBase64(pdfBlob);
      
      const webhookData = {
        type: 'upload_pdf',
        invoice_number: invoice.invoiceNumber,
        client_name: invoice.client.name,
        client_email: invoice.client.email,
        file_name: fileName,
        file_data: base64,
        folder_id: config.folderId,
        upload_date: new Date().toISOString()
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      console.log('✅ PDF envoyé vers Google Drive via n8n');
      return true;
    } catch (error) {
      console.error('❌ Erreur upload PDF Google Drive:', error);
      throw error;
    }
  }

  /**
   * 🔔 Notification vers n8n
   */
  private static async notifyN8N(invoice: Invoice, fileName: string): Promise<void> {
    try {
      const config = this.getConfig();
      
      const webhookData = {
        type: 'invoice_uploaded',
        invoice_number: invoice.invoiceNumber,
        client_name: invoice.client.name,
        client_email: invoice.client.email,
        file_name: fileName,
        upload_date: new Date().toISOString(),
        folder_id: config.folderId
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        console.log('✅ Notification n8n envoyée');
      } else {
        console.warn('⚠️ Erreur notification n8n:', response.status, response.statusText);
      }
    } catch (error) {
      console.warn('⚠️ Erreur notification n8n (non bloquante):', error);
    }
  }

  /**
   * 🧪 Test de l'intégration Google Drive
   */
  static async testGoogleDriveIntegration(): Promise<{ success: boolean; message: string }> {
    try {
      const config = this.getConfig();
      
      if (!config.webhookUrl) {
        return {
          success: false,
          message: '❌ URL webhook n8n non configurée'
        };
      }

      if (!config.folderId) {
        return {
          success: false,
          message: '❌ ID du dossier Google Drive non configuré'
        };
      }

      // Test de connectivité avec le webhook n8n
      const testData = {
        type: 'test_connection',
        timestamp: new Date().toISOString(),
        folder_id: config.folderId
      };

      const response = await fetch(config.webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(testData)
      });

      if (response.ok) {
        return {
          success: true,
          message: `✅ Connexion réussie !\n\n• Webhook n8n: Accessible\n• Dossier Google Drive: ${config.folderId}\n• Statut HTTP: ${response.status}`
        };
      } else {
        return {
          success: false,
          message: `❌ Erreur de connexion\n\n• Statut HTTP: ${response.status}\n• Message: ${response.statusText}\n• Vérifiez que votre workflow n8n est actif`
        };
      }
    } catch (error) {
      return {
        success: false,
        message: `❌ Erreur de test\n\n• Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n• Vérifiez votre connexion internet et l'URL du webhook`
      };
    }
  }

  /**
   * 🔧 Validation de la configuration
   */
  static validateConfig(): { isValid: boolean; errors: string[] } {
    const config = this.getConfig();
    const errors: string[] = [];

    if (!config.webhookUrl) {
      errors.push('URL webhook n8n manquante');
    } else {
      try {
        new URL(config.webhookUrl);
      } catch {
        errors.push('URL webhook n8n invalide');
      }
    }

    if (!config.folderId) {
      errors.push('ID du dossier Google Drive manquant');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  /**
   * 🔄 Convertir un blob en base64
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Supprimer le préfixe "data:application/pdf;base64,"
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }
}