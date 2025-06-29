import { Invoice } from '../types';
import { AdvancedPDFService } from './advancedPdfService';

// Google Drive API configuration
const GOOGLE_DRIVE_CONFIG = {
  API_KEY: '', // You'll need to set this
  CLIENT_ID: '', // You'll need to set this
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  SCOPES: 'https://www.googleapis.com/auth/drive.file',
  FOLDER_ID: '1sdCwbJHWu6QelYwAnQxPKNEOsd_XBtJw' // Your Google Drive folder ID
};

declare global {
  interface Window {
    gapi: any;
    google: any;
  }
}

export class GoogleDriveService {
  private static isInitialized = false;
  private static isSignedIn = false;

  /**
   * Initialize Google Drive API
   */
  static async initialize(): Promise<boolean> {
    try {
      if (this.isInitialized) {
        return this.isSignedIn;
      }

      // Load Google API script if not already loaded
      if (!window.gapi) {
        await this.loadGoogleAPI();
      }

      // Initialize gapi
      await new Promise<void>((resolve) => {
        window.gapi.load('auth2:client', resolve);
      });

      // Initialize the client
      await window.gapi.client.init({
        apiKey: GOOGLE_DRIVE_CONFIG.API_KEY,
        clientId: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
        discoveryDocs: [GOOGLE_DRIVE_CONFIG.DISCOVERY_DOC],
        scope: GOOGLE_DRIVE_CONFIG.SCOPES
      });

      this.isInitialized = true;
      this.isSignedIn = window.gapi.auth2.getAuthInstance().isSignedIn.get();

      console.log('✅ Google Drive API initialized');
      return this.isSignedIn;
    } catch (error) {
      console.error('❌ Error initializing Google Drive API:', error);
      return false;
    }
  }

  /**
   * Load Google API script dynamically
   */
  private static loadGoogleAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://apis.google.com/js/api.js';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google API'));
      document.head.appendChild(script);
    });
  }

  /**
   * Sign in to Google Drive
   */
  static async signIn(): Promise<boolean> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      if (!this.isSignedIn) {
        const authInstance = window.gapi.auth2.getAuthInstance();
        await authInstance.signIn();
        this.isSignedIn = authInstance.isSignedIn.get();
      }

      return this.isSignedIn;
    } catch (error) {
      console.error('❌ Error signing in to Google Drive:', error);
      return false;
    }
  }

  /**
   * Upload invoice PDF to Google Drive
   */
  static async uploadInvoicePDF(invoice: Invoice): Promise<{ success: boolean; fileId?: string; message: string }> {
    try {
      console.log('📤 Uploading invoice to Google Drive...');

      // Ensure we're signed in
      const signedIn = await this.signIn();
      if (!signedIn) {
        return {
          success: false,
          message: 'Échec de la connexion à Google Drive. Veuillez vous connecter.'
        };
      }

      // Generate PDF blob
      console.log('📄 Generating PDF for upload...');
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);

      // Convert blob to base64
      const base64Data = await this.blobToBase64(pdfBlob);
      const base64Content = base64Data.split(',')[1]; // Remove data:application/pdf;base64, prefix

      // Prepare file metadata
      const fileName = `Facture_MYCONFORT_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const metadata = {
        name: fileName,
        parents: [GOOGLE_DRIVE_CONFIG.FOLDER_ID],
        description: `Facture MYCONFORT n°${invoice.invoiceNumber} - Client: ${invoice.client.name}`
      };

      // Upload file using multipart upload
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', pdfBlob, fileName);

      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${window.gapi.auth2.getAuthInstance().currentUser.get().getAuthResponse().access_token}`
        },
        body: form
      });

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Invoice uploaded to Google Drive:', result);
        
        return {
          success: true,
          fileId: result.id,
          message: `✅ Facture ${invoice.invoiceNumber} sauvegardée dans Google Drive avec succès !`
        };
      } else {
        const error = await response.text();
        console.error('❌ Google Drive upload error:', error);
        return {
          success: false,
          message: `❌ Erreur lors de l'upload vers Google Drive: ${response.statusText}`
        };
      }

    } catch (error: any) {
      console.error('❌ Error uploading to Google Drive:', error);
      return {
        success: false,
        message: `❌ Erreur lors de la sauvegarde: ${error.message}`
      };
    }
  }

  /**
   * Convert blob to base64
   */
  private static blobToBase64(blob: Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (typeof reader.result === 'string') {
          resolve(reader.result);
        } else {
          reject(new Error('Failed to convert blob to base64'));
        }
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  }

  /**
   * Check if user is signed in
   */
  static isUserSignedIn(): boolean {
    return this.isSignedIn && window.gapi?.auth2?.getAuthInstance()?.isSignedIn?.get();
  }

  /**
   * Get current user info
   */
  static getCurrentUser(): any {
    if (this.isUserSignedIn()) {
      return window.gapi.auth2.getAuthInstance().currentUser.get().getBasicProfile();
    }
    return null;
  }

  /**
   * Sign out from Google Drive
   */
  static async signOut(): Promise<void> {
    try {
      if (this.isInitialized && this.isSignedIn) {
        await window.gapi.auth2.getAuthInstance().signOut();
        this.isSignedIn = false;
        console.log('✅ Signed out from Google Drive');
      }
    } catch (error) {
      console.error('❌ Error signing out:', error);
    }
  }

  /**
   * Test Google Drive connection
   */
  static async testConnection(): Promise<{ success: boolean; message: string }> {
    try {
      const signedIn = await this.signIn();
      if (!signedIn) {
        return {
          success: false,
          message: 'Impossible de se connecter à Google Drive'
        };
      }

      // Try to list files in the folder to test access
      const response = await window.gapi.client.drive.files.list({
        q: `'${GOOGLE_DRIVE_CONFIG.FOLDER_ID}' in parents`,
        pageSize: 1
      });

      if (response.status === 200) {
        const user = this.getCurrentUser();
        return {
          success: true,
          message: `✅ Connexion Google Drive réussie ! Connecté en tant que: ${user?.getName() || 'Utilisateur'}`
        };
      } else {
        return {
          success: false,
          message: 'Erreur lors du test de connexion'
        };
      }
    } catch (error: any) {
      return {
        success: false,
        message: `Erreur de connexion: ${error.message}`
      };
    }
  }
}