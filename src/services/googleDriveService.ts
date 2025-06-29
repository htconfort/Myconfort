import { Invoice } from '../types';
import { AdvancedPDFService } from './advancedPdfService';

// Google Drive API configuration
const GOOGLE_DRIVE_CONFIG = {
  API_KEY: '821174911169-9etj46edjphaplv9ob3vah1iqtvo3o9i.apps.googleusercontent.com',
  CLIENT_ID: '821174911169-9etj46edjphaplv9ob3vah1iqtvo3o9i.apps.googleusercontent.com',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  SCOPES: 'https://www.googleapis.com/auth/drive.file',
  FOLDER_ID: '1sdCwbJHWu6QelYwAnQxPKNEOsd_XBtJw' // Votre dossier Google Drive
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
  private static tokenClient: any = null;

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

      // Load Google Identity Services script if not already loaded
      if (!window.google?.accounts) {
        await this.loadGoogleIdentityAPI();
      }

      // Initialize gapi client
      await new Promise<void>((resolve) => {
        window.gapi.load('client', async () => {
          await window.gapi.client.init({
            apiKey: GOOGLE_DRIVE_CONFIG.API_KEY,
            discoveryDocs: [GOOGLE_DRIVE_CONFIG.DISCOVERY_DOC],
          });
          resolve();
        });
      });

      // Initialize Google Identity Services
      this.tokenClient = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
        scope: GOOGLE_DRIVE_CONFIG.SCOPES,
        callback: (response: any) => {
          if (response.error) {
            console.error('Error getting token:', response);
            this.isSignedIn = false;
          } else {
            this.isSignedIn = true;
            console.log('✅ Google Drive token obtained');
          }
        }
      });

      this.isInitialized = true;
      console.log('✅ Google Drive API initialized');
      
      // Check if we have a valid token already
      try {
        const token = this.getAccessToken();
        this.isSignedIn = !!token;
      } catch (e) {
        this.isSignedIn = false;
      }
      
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
   * Load Google Identity Services API script dynamically
   */
  private static loadGoogleIdentityAPI(): Promise<void> {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Identity Services API'));
      document.head.appendChild(script);
    });
  }

  /**
   * Get access token
   */
  private static getAccessToken(): string | null {
    if (!window.gapi?.client?.getToken) {
      return null;
    }
    const token = window.gapi.client.getToken();
    return token ? token.access_token : null;
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
        return new Promise((resolve) => {
          this.tokenClient.callback = (response: any) => {
            if (response.error) {
              console.error('Error getting token:', response);
              this.isSignedIn = false;
              resolve(false);
            } else {
              this.isSignedIn = true;
              console.log('✅ Google Drive token obtained');
              resolve(true);
            }
          };
          
          // Request token
          this.tokenClient.requestAccessToken({ prompt: 'consent' });
        });
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

      // Prepare file metadata
      const fileName = `Facture_MYCONFORT_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      
      // Create a multipart request to upload the file
      const metadata = {
        name: fileName,
        mimeType: 'application/pdf',
        parents: [GOOGLE_DRIVE_CONFIG.FOLDER_ID]
      };

      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', pdfBlob);

      // Get the access token
      const accessToken = this.getAccessToken();
      if (!accessToken) {
        return {
          success: false,
          message: 'Aucun token d\'accès disponible. Veuillez vous reconnecter.'
        };
      }

      // Upload the file
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          body: form
        }
      );

      const result = await response.json();

      if (response.ok) {
        console.log('✅ File uploaded successfully:', result);
        
        // Create a shareable link
        const shareResponse = await fetch(
          `https://www.googleapis.com/drive/v3/files/${result.id}?fields=webViewLink`,
          {
            method: 'GET',
            headers: {
              Authorization: `Bearer ${accessToken}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        const shareResult = await shareResponse.json();
        
        return {
          success: true,
          fileId: result.id,
          message: `✅ Facture ${invoice.invoiceNumber} sauvegardée dans Google Drive avec succès !${shareResult.webViewLink ? ` Lien: ${shareResult.webViewLink}` : ''}`
        };
      } else {
        console.error('❌ Error uploading file:', result);
        return {
          success: false,
          message: `Erreur lors de l'upload: ${result.error?.message || 'Erreur inconnue'}`
        };
      }
    } catch (error: any) {
      console.error('❌ Error uploading to Google Drive:', error);
      return {
        success: false,
        message: `Erreur lors de la sauvegarde: ${error.message}`
      };
    }
  }

  /**
   * Check if user is signed in
   */
  static isUserSignedIn(): boolean {
    return this.isSignedIn && !!this.getAccessToken();
  }

  /**
   * Get current user info
   */
  static async getCurrentUser(): Promise<any> {
    if (!this.isUserSignedIn()) {
      return null;
    }
    
    try {
      const accessToken = this.getAccessToken();
      const response = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`
        }
      });
      
      if (response.ok) {
        return await response.json();
      }
      return null;
    } catch (error) {
      console.error('Error getting user info:', error);
      return null;
    }
  }

  /**
   * Sign out from Google Drive
   */
  static async signOut(): Promise<void> {
    try {
      if (this.isInitialized && this.isSignedIn) {
        // Revoke the token
        const token = this.getAccessToken();
        if (token) {
          window.google.accounts.oauth2.revoke(token, () => {
            console.log('✅ Token revoked');
          });
          
          // Clear the token
          window.gapi.client.setToken(null);
        }
        
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
      const accessToken = this.getAccessToken();
      const response = await fetch(
        `https://www.googleapis.com/drive/v3/files?q='${GOOGLE_DRIVE_CONFIG.FOLDER_ID}'+in+parents&pageSize=1`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`
          }
        }
      );

      if (response.ok) {
        const user = await this.getCurrentUser();
        return {
          success: true,
          message: `✅ Connexion Google Drive réussie ! Connecté en tant que: ${user?.name || 'Utilisateur'}`
        };
      } else {
        const error = await response.json();
        return {
          success: false,
          message: `Erreur lors du test de connexion: ${error.error?.message || 'Erreur inconnue'}`
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