import { gapi } from 'gapi-script';

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private readonly API_KEY = import.meta.env.VITE_GOOGLE_DRIVE_API_KEY;
  private readonly CLIENT_ID = import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID;
  private readonly SCOPES = 'https://www.googleapis.com/auth/drive.file';
  private readonly DISCOVERY_DOC = 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest';
  private readonly FOLDER_ID = '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-'; // Ton dossier Drive

  private gapiLoaded = false;
  private isSignedIn = false;

  private constructor() {}

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  // Optionnel : expose la config (DEBUG)
  public static getConfig() {
    return {
      API_KEY: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
      CLIENT_ID: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
      SCOPES: 'https://www.googleapis.com/auth/drive.file',
      DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
      FOLDER_ID: '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-',
    };
  }

  public async initialize(): Promise<void> {
    if (!this.API_KEY || !this.CLIENT_ID) throw new Error('API Google Drive non configurée (.env)');
    if (this.gapiLoaded) return;
    return new Promise((resolve, reject) => {
      const start = () => {
        gapi.client.init({
          apiKey: this.API_KEY,
          clientId: this.CLIENT_ID,
          scope: this.SCOPES,
          discoveryDocs: [this.DISCOVERY_DOC],
        }).then(() => {
          const auth = gapi.auth2.getAuthInstance();
          this.isSignedIn = auth.isSignedIn.get();
          auth.isSignedIn.listen((signedIn: boolean) => {
            this.isSignedIn = signedIn;
          });
          this.gapiLoaded = true;
          console.log('✅ Google API initialisée');
          resolve();
        }).catch((error: any) => {
          console.error('❌ Erreur initialisation Google API:', error);
          reject(error);
        });
      };
      if (typeof gapi !== 'undefined' && gapi.client) {
        start();
      } else {
        gapi.load('client:auth2', start);
      }
    });
  }

  public async authenticate(): Promise<boolean> {
    try {
      if (!this.gapiLoaded) await this.initialize();
      const auth = gapi.auth2.getAuthInstance();
      if (this.isSignedIn) return true;
      await auth.signIn();
      this.isSignedIn = true;
      return true;
    } catch (e) {
      console.error('❌ Erreur authentification Google:', e);
      return false;
    }
  }

  public async uploadFile(
    file: File,
    folderId: string = this.FOLDER_ID
  ): Promise<{ success: boolean; fileId?: string; error?: string }> {
    try {
      if (!this.isSignedIn) {
        const authenticated = await this.authenticate();
        if (!authenticated) return { success: false, error: 'Authentification échouée' };
      }
      const metadata = {
        name: file.name,
        mimeType: file.type,
        parents: [folderId]
      };
      const accessToken = gapi.auth.getToken().access_token;
      const formData = new FormData();
      formData.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      formData.append('file', file);
      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name',
        {
          method: 'POST',
          headers: { 'Authorization': `Bearer ${accessToken}` },
          body: formData,
        }
      );
      if (response.ok) {
        const result = await response.json();
        return { success: true, fileId: result.id };
      } else {
        const errorText = await response.text();
        return { success: false, error: `Erreur HTTP ${response.status}: ${errorText}` };
      }
    } catch (e) {
      return { success: false, error: e instanceof Error ? e.message : 'Erreur inconnue' };
    }
  }

  public isAuthenticated(): boolean {
    return this.isSignedIn && this.gapiLoaded;
  }

  // Méthodes pour compatibilité avec l'ancien code
  public async uploadInvoicePDF(invoice: any, uploadFunction: (file: File, fileName: string, folderId: string) => Promise<boolean>): Promise<boolean> {
    try {
      const { AdvancedPDFService } = await import('./advancedPdfService');
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);
      const fileName = `Facture_MyConfort_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      return await uploadFunction(file, fileName, this.FOLDER_ID);
    } catch (error) {
      console.error('❌ Erreur upload facture PDF:', error);
      return false;
    }
  }

  public async uploadPDFToGoogleDrive(invoice: any, pdfBlob: Blob): Promise<boolean> {
    try {
      const fileName = `Facture_MyConfort_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      const result = await this.uploadFile(file, this.FOLDER_ID);
      return result.success;
    } catch (error) {
      console.error('❌ Erreur upload PDF Google Drive:', error);
      return false;
    }
  }

  public async testGoogleDriveIntegration(): Promise<{ success: boolean; message: string }> {
    try {
      if (!this.API_KEY || !this.CLIENT_ID) {
        return {
          success: false,
          message: '❌ Configuration Google Drive manquante dans .env'
        };
      }

      await this.initialize();
      
      if (!this.isAuthenticated()) {
        const authenticated = await this.authenticate();
        if (!authenticated) {
          return {
            success: false,
            message: '❌ Échec de l\'authentification Google'
          };
        }
      }

      return {
        success: true,
        message: `✅ Connexion Google Drive réussie !\n\n• API Key: Configurée\n• Client ID: Configuré\n• Dossier: ${this.FOLDER_ID}\n• Authentification: OK`
      };
    } catch (error) {
      return {
        success: false,
        message: `❌ Erreur de test\n\n• Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      };
    }
  }
}

export const googleDriveService = GoogleDriveService.getInstance();