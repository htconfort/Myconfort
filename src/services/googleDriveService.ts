import { gapi } from 'gapi-script';

// 🔧 Configuration Google Drive OAuth2
const GOOGLE_DRIVE_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
  CLIENT_ID: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
  FOLDER_ID: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID || '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-',
  SCOPES: 'https://www.googleapis.com/auth/drive.file',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
};

export class GoogleDriveService {
  private static instance: GoogleDriveService;
  private readonly API_KEY = GOOGLE_DRIVE_CONFIG.API_KEY;
  private readonly CLIENT_ID = GOOGLE_DRIVE_CONFIG.CLIENT_ID;
  private readonly SCOPES = GOOGLE_DRIVE_CONFIG.SCOPES;
  private readonly DISCOVERY_DOC = GOOGLE_DRIVE_CONFIG.DISCOVERY_DOC;
  private readonly FOLDER_ID = GOOGLE_DRIVE_CONFIG.FOLDER_ID;
  private gapiLoaded = false;
  private isSignedIn = false;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): GoogleDriveService {
    if (!GoogleDriveService.instance) {
      GoogleDriveService.instance = new GoogleDriveService();
    }
    return GoogleDriveService.instance;
  }

  // Expose la config (pour compatibilité avec vos composants existants)
  public static getConfig() {
    return {
      ...GOOGLE_DRIVE_CONFIG,
      isConfigured: !!(GOOGLE_DRIVE_CONFIG.API_KEY && GOOGLE_DRIVE_CONFIG.CLIENT_ID)
    };
  }

  public async initialize(): Promise<void> {
    // Éviter les initialisations multiples simultanées
    if (this.initPromise) {
      return this.initPromise;
    }

    if (!this.API_KEY || !this.CLIENT_ID) {
      throw new Error('❌ Configuration Google Drive manquante dans .env\n\nVérifiez :\n• VITE_GOOGLE_DRIVE_API_KEY\n• VITE_GOOGLE_DRIVE_CLIENT_ID');
    }
    
    console.log('🔧 Initialisation Google Drive avec config:', {
      API_KEY: this.API_KEY ? '✅ Configurée' : '❌ Manquante',
      CLIENT_ID: this.CLIENT_ID ? '✅ Configurée' : '❌ Manquante',
      FOLDER_ID: this.FOLDER_ID
    });
    
    if (this.gapiLoaded) {
      return Promise.resolve();
    }

    this.initPromise = new Promise((resolve, reject) => {
      const start = () => {
        gapi.client.init({
          apiKey: this.API_KEY,
          clientId: this.CLIENT_ID,
          scope: this.SCOPES,
          discoveryDocs: [this.DISCOVERY_DOC],
        }).then(() => {
          const auth = gapi.auth2.getAuthInstance();
          if (auth) {
            this.isSignedIn = auth.isSignedIn.get();
            auth.isSignedIn.listen((signedIn: boolean) => {
              this.isSignedIn = signedIn;
              console.log(`🔄 Statut authentification changé: ${signedIn ? 'Connecté' : 'Déconnecté'}`);
            });
          }
          this.gapiLoaded = true;
          console.log('✅ Google API initialisée avec succès');
          resolve();
        }).catch((error: any) => {
          console.error('❌ Erreur initialisation Google API:', error);
          this.initPromise = null; // Permettre une nouvelle tentative
          
          // Messages d'erreur plus explicites
          if (error.details && error.details.includes('API key not valid')) {
            reject(new Error('❌ Clé API Google invalide. Vérifiez VITE_GOOGLE_DRIVE_API_KEY dans .env'));
          } else if (error.details && error.details.includes('unauthorized_client')) {
            reject(new Error('❌ Client OAuth non autorisé. Vérifiez VITE_GOOGLE_DRIVE_CLIENT_ID et les URLs dans Google Console'));
          } else {
            reject(new Error(`❌ Erreur d'initialisation Google API: ${error.error || error.message || 'Erreur inconnue'}`));
          }
        });
      };

      // Vérifier si gapi est disponible
      if (typeof window === 'undefined') {
        reject(new Error('❌ Google API non disponible (environnement serveur)'));
        return;
      }

      if (typeof gapi !== 'undefined' && gapi.client) {
        start();
      } else {
        // Charger gapi si pas encore disponible
        if (typeof gapi !== 'undefined') {
          gapi.load('client:auth2', {
            callback: start,
            onerror: () => {
              this.initPromise = null;
              reject(new Error('❌ Impossible de charger Google API client:auth2'));
            }
          });
        } else {
          this.initPromise = null;
          reject(new Error('❌ Google API (gapi) non disponible. Vérifiez que gapi-script est installé.'));
        }
      }
    });

    return this.initPromise;
  }

  public async authenticate(): Promise<boolean> {
    try {
      console.log('🔐 Démarrage authentification Google Drive...');
      
      // S'assurer que l'API est initialisée
      if (!this.gapiLoaded) {
        await this.initialize();
      }

      const auth = gapi.auth2.getAuthInstance();
      if (!auth) {
        throw new Error('❌ Instance d\'authentification Google non disponible');
      }

      if (this.isSignedIn) {
        console.log('✅ Utilisateur déjà authentifié');
        return true;
      }
      
      console.log('🔓 Ouverture popup d\'authentification Google...');
      
      // Vérifier si les pop-ups sont autorisées
      const popup = window.open('', '_blank', 'width=1,height=1');
      if (!popup || popup.closed) {
        throw new Error('popup_blocked_by_browser');
      }
      popup.close();

      await auth.signIn({
        prompt: 'select_account' // Forcer la sélection du compte
      });
      
      this.isSignedIn = true;
      console.log('✅ Authentification Google Drive réussie');
      
      // Vérifier les permissions accordées
      const user = auth.currentUser.get();
      const scopes = user.getGrantedScopes();
      console.log('🔑 Permissions accordées:', scopes);
      
      return true;

    } catch (e: any) {
      console.error('❌ Erreur authentification Google:', e);
      
      // Gestion des erreurs spécifiques avec messages plus clairs
      if (e.error === 'popup_blocked_by_browser' || e.message?.includes('popup_blocked_by_browser')) {
        alert('❌ Pop-up bloquée par le navigateur\n\n• Autorisez les pop-ups pour ce site\n• Réessayez l\'authentification');
      } else if (e.error === 'access_denied') {
        alert('❌ Accès refusé par l\'utilisateur\n\n• Acceptez les permissions Google Drive\n• Réessayez l\'authentification');
      } else if (e.error === 'redirect_uri_mismatch') {
        alert('❌ Erreur de configuration OAuth\n\n• Vérifiez les URLs dans Google Cloud Console\n• Ajoutez votre domaine dans "URIs de redirection autorisées"');
      } else if (e.error === 'unauthorized_client') {
        alert('❌ Client OAuth non autorisé\n\n• Vérifiez VITE_GOOGLE_DRIVE_CLIENT_ID\n• Vérifiez la configuration dans Google Cloud Console');
      } else if (e.error === 'invalid_client') {
        alert('❌ Client OAuth invalide\n\n• Vérifiez VITE_GOOGLE_DRIVE_CLIENT_ID dans .env\n• Régénérez les clés si nécessaire');
      } else {
        alert(`❌ Erreur d'authentification Google\n\nErreur: ${e.error || e.message || 'Erreur inconnue'}\n\nVérifiez la console pour plus de détails.`);
      }
      
      return false;
    }
  }

  // Upload d'un fichier vers Google Drive avec retry
  public async uploadFile(
    file: File, 
    folderId: string = this.FOLDER_ID
  ): Promise<{ success: boolean; fileId?: string; webViewLink?: string; error?: string }> {
    try {
      // Vérifications préliminaires
      if (!file) {
        return { success: false, error: 'Aucun fichier fourni' };
      }

      if (file.size > 100 * 1024 * 1024) { // 100MB
        return { success: false, error: 'Fichier trop volumineux (max 100MB)' };
      }

      if (!this.isSignedIn) {
        console.log('🔐 Authentification requise pour l\'upload...');
        const authenticated = await this.authenticate();
        if (!authenticated) {
          return { success: false, error: 'Authentification échouée' };
        }
      }

      console.log('📤 Upload du fichier vers Google Drive...', {
        fileName: file.name,
        fileSize: `${(file.size / 1024 / 1024).toFixed(2)} MB`,
        fileType: file.type,
        folderId
      });

      // Vérifier que le dossier existe (optionnel)
      if (folderId !== this.FOLDER_ID) {
        try {
          await gapi.client.drive.files.get({ fileId: folderId });
        } catch (error) {
          console.warn('⚠️ Dossier spécifié introuvable, utilisation du dossier par défaut');
          folderId = this.FOLDER_ID;
        }
      }

      const metadata = {
        name: file.name,
        parents: [folderId]
      };

      const formData = new FormData();
      formData.append(
        'metadata',
        new Blob([JSON.stringify(metadata)], { type: 'application/json' })
      );
      formData.append('file', file);

      const auth = gapi.auth2.getAuthInstance();
      const user = auth.currentUser.get();
      const authResponse = user.getAuthResponse();

      if (!authResponse || !authResponse.access_token) {
        throw new Error('Token d\'accès Google non disponible');
      }

      const response = await fetch(
        'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,size',
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${authResponse.access_token}`,
          },
          body: formData,
        }
      );

      if (response.ok) {
        const result = await response.json();
        console.log('✅ Fichier uploadé avec succès:', {
          id: result.id,
          name: result.name,
          size: result.size,
          link: result.webViewLink
        });
        
        return { 
          success: true, 
          fileId: result.id,
          webViewLink: result.webViewLink
        };
      } else {
        const errorText = await response.text();
        console.error('❌ Erreur HTTP upload:', response.status, errorText);
        
        // Gestion des erreurs HTTP spécifiques
        if (response.status === 401) {
          // Token expiré, réessayer l'authentification
          this.isSignedIn = false;
          return { success: false, error: 'Token expiré. Veuillez vous reconnecter.' };
        } else if (response.status === 403) {
          return { success: false, error: 'Permissions insuffisantes pour Google Drive' };
        } else if (response.status === 404) {
          return { success: false, error: 'Dossier de destination introuvable' };
        } else {
          return { success: false, error: `Erreur HTTP ${response.status}: ${errorText}` };
        }
      }

    } catch (error: any) {
      console.error('❌ Erreur upload Google Drive:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur inconnue lors de l\'upload' 
      };
    }
  }

  // Créer ou récupérer le dossier MyConfort Factures
  public async ensureFolder(folderName: string = 'MyConfort Factures'): Promise<string> {
    try {
      if (!this.isSignedIn) {
        await this.authenticate();
      }

      console.log(`📁 Recherche du dossier "${folderName}"...`);

      // Chercher le dossier existant
      const response = await gapi.client.drive.files.list({
        q: `name='${folderName}' and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: 'files(id, name)'
      });

      if (response.result.files && response.result.files.length > 0) {
        const folderId = response.result.files[0].id!;
        console.log(`📁 Dossier "${folderName}" trouvé:`, folderId);
        return folderId;
      }

      console.log(`📁 Création du dossier "${folderName}"...`);

      // Créer le dossier s'il n'existe pas
      const createResponse = await gapi.client.drive.files.create({
        resource: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });

      const folderId = createResponse.result.id!;
      console.log(`📁 Dossier "${folderName}" créé:`, folderId);
      return folderId;

    } catch (error) {
      console.error('❌ Erreur création/recherche dossier:', error);
      console.log('📁 Utilisation du dossier par défaut:', this.FOLDER_ID);
      return this.FOLDER_ID; // Fallback sur l'ID configuré
    }
  }

  // Méthodes utilitaires améliorées
  public isAuthenticated(): boolean {
    return this.isSignedIn && this.gapiLoaded;
  }

  public isConfigured(): boolean {
    return !!(this.API_KEY && this.CLIENT_ID);
  }

  public getStatus() {
    return {
      isConfigured: this.isConfigured(),
      isAuthenticated: this.isAuthenticated(),
      gapiLoaded: this.gapiLoaded,
      apiKey: this.API_KEY ? '✅ Configurée' : '❌ Manquante',
      clientId: this.CLIENT_ID ? '✅ Configurée' : '❌ Manquante',
      folderId: this.FOLDER_ID
    };
  }

  public getFolderInfo() {
    return {
      id: this.FOLDER_ID,
      name: 'MyConfort Factures',
      url: `https://drive.google.com/drive/folders/${this.FOLDER_ID}`
    };
  }

  public async signOut(): Promise<void> {
    try {
      if (this.gapiLoaded && this.isSignedIn) {
        const auth = gapi.auth2.getAuthInstance();
        if (auth) {
          await auth.signOut();
          this.isSignedIn = false;
          console.log('✅ Déconnexion Google réussie');
        }
      }
    } catch (error) {
      console.error('❌ Erreur lors de la déconnexion:', error);
    }
  }

  // Méthode de test complète
  public async testConnection(): Promise<{ success: boolean; message: string; details?: any }> {
    try {
      console.log('🧪 Test de connexion Google Drive...');

      // Test 1: Configuration
      if (!this.isConfigured()) {
        return {
          success: false,
          message: '❌ Configuration manquante\n\nVérifiez votre fichier .env :\n• VITE_GOOGLE_DRIVE_API_KEY\n• VITE_GOOGLE_DRIVE_CLIENT_ID'
        };
      }

      // Test 2: Initialisation
      await this.initialize();

      // Test 3: Authentification
      const authenticated = await this.authenticate();
      if (!authenticated) {
        return {
          success: false,
          message: '❌ Échec de l\'authentification Google'
        };
      }

      // Test 4: Test d'accès à l'API
      const testResponse = await gapi.client.drive.about.get({
        fields: 'user,storageQuota'
      });

      const userInfo = testResponse.result;

      return {
        success: true,
        message: `✅ Connexion Google Drive réussie !\n\n• Utilisateur: ${userInfo.user?.displayName || 'Inconnu'}\n• Email: ${userInfo.user?.emailAddress || 'Inconnu'}\n• Espace utilisé: ${userInfo.storageQuota ? Math.round(parseInt(userInfo.storageQuota.usage || '0') / 1024 / 1024) + ' MB' : 'Inconnu'}\n• Dossier: ${this.FOLDER_ID}`,
        details: {
          user: userInfo.user,
          quota: userInfo.storageQuota,
          config: this.getStatus()
        }
      };

    } catch (error: any) {
      console.error('❌ Test de connexion échoué:', error);
      return {
        success: false,
        message: `❌ Test de connexion échoué\n\nErreur: ${error.message || error.error || 'Erreur inconnue'}\n\nVérifiez :\n• Votre configuration .env\n• Les URLs dans Google Cloud Console\n• Votre connexion internet`
      };
    }
  }

  // Téléchargement local de secours amélioré
  public async downloadLocal(file: File, customName?: string): Promise<{ success: boolean; error?: string }> {
    try {
      const url = URL.createObjectURL(file);
      const link = document.createElement('a');
      link.download = customName || file.name;
      link.href = url;
      link.style.display = 'none';
      
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Nettoyer l'URL après un délai
      setTimeout(() => URL.revokeObjectURL(url), 1000);
      
      console.log('✅ Téléchargement local réussi:', link.download);
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur téléchargement local:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Erreur de téléchargement local' 
      };
    }
  }

  // Méthode pour uploader une facture PDF (spécifique à votre app)
  public async uploadInvoicePDF(invoice: any, pdfBlob: Blob): Promise<boolean> {
    try {
      const fileName = `Facture_MYCONFORT_${invoice.invoiceNumber}_${new Date().toISOString().split('T')[0]}.pdf`;
      const file = new File([pdfBlob], fileName, { type: 'application/pdf' });
      
      // Utiliser ou créer le dossier spécifique
      const folderId = await this.ensureFolder('MYCONFORT Factures');
      
      const result = await this.uploadFile(file, folderId);
      
      if (result.success) {
        console.log('✅ Facture PDF uploadée:', result.webViewLink);
        return true;
      } else {
        console.error('❌ Échec upload facture:', result.error);
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur upload facture PDF:', error);
      return false;
    }
  }

  // Alias pour compatibilité
  public async uploadPDFToGoogleDrive(invoice: any, pdfBlob: Blob): Promise<boolean> {
    return this.uploadInvoicePDF(invoice, pdfBlob);
  }
}

// Export de l'instance singleton (pour compatibilité)
export const googleDriveService = GoogleDriveService.getInstance();