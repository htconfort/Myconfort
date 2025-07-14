import { useState, useEffect, useCallback } from 'react';
import { GOOGLE_DRIVE_CONFIG } from '../config/googleDrive';
import { GoogleAuthStatus, UploadProgress } from '../types/googleDrive';

export const useGoogleDrive = () => {
  const [authStatus, setAuthStatus] = useState<GoogleAuthStatus>({
    isSignedIn: false,
    isLoaded: false
  });
  
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // 🔧 Initialisation de l'API Google
  useEffect(() => {
    const initializeGoogleAPI = async () => {
      try {
        // Vérifier la configuration
        if (!GOOGLE_DRIVE_CONFIG.isConfigured()) {
          const errors = GOOGLE_DRIVE_CONFIG.getErrors();
          setAuthStatus({
            isSignedIn: false,
            isLoaded: false,
            error: `Configuration manquante: ${errors.join(', ')}`
          });
          return;
        }

        // Attendre que gapi soit disponible
        if (typeof window.gapi === 'undefined') {
          setAuthStatus({
            isSignedIn: false,
            isLoaded: false,
            error: 'Google API non disponible. Vérifiez que le script est chargé.'
          });
          return;
        }

        // Charger les modules nécessaires
        await new Promise<void>((resolve) => {
          window.gapi.load('client:auth2', resolve);
        });

        // Initialiser le client
        await window.gapi.client.init({
          apiKey: GOOGLE_DRIVE_CONFIG.API_KEY,
          clientId: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
          discoveryDocs: [GOOGLE_DRIVE_CONFIG.DISCOVERY_DOC],
          scope: GOOGLE_DRIVE_CONFIG.SCOPES.join(' ')
        });

        const authInstance = window.gapi.auth2.getAuthInstance();
        const isSignedIn = authInstance.isSignedIn.get();
        
        // Obtenir l'email de l'utilisateur si connecté
        let userEmail = '';
        if (isSignedIn) {
          const user = authInstance.currentUser.get();
          userEmail = user.getBasicProfile().getEmail();
        }

        setAuthStatus({
          isSignedIn,
          isLoaded: true,
          userEmail
        });

        // Écouter les changements d'authentification
        authInstance.isSignedIn.listen((signedIn: boolean) => {
          let email = '';
          if (signedIn) {
            const user = authInstance.currentUser.get();
            email = user.getBasicProfile().getEmail();
          }
          
          setAuthStatus(prev => ({
            ...prev,
            isSignedIn: signedIn,
            userEmail: email
          }));
        });

      } catch (error) {
        console.error('❌ Erreur initialisation Google API:', error);
        setAuthStatus({
          isSignedIn: false,
          isLoaded: false,
          error: `Erreur d'initialisation: ${error}`
        });
      }
    };

    initializeGoogleAPI();
  }, []);

  // 🔐 Connexion Google
  const signIn = useCallback(async (): Promise<boolean> => {
    try {
      if (!authStatus.isLoaded) {
        throw new Error('API Google non initialisée');
      }

      setUploadProgress({
        stage: 'auth',
        message: 'Connexion à Google Drive...'
      });

      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
      
      setUploadProgress(null);
      return true;
    } catch (error) {
      console.error('❌ Erreur connexion Google:', error);
      setUploadProgress({
        stage: 'error',
        message: `Erreur de connexion: ${error}`
      });
      return false;
    }
  }, [authStatus.isLoaded]);

  // 🚪 Déconnexion Google
  const signOut = useCallback(async (): Promise<void> => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
    } catch (error) {
      console.error('❌ Erreur déconnexion Google:', error);
    }
  }, []);

  // 📤 Upload de fichier vers Google Drive
  const uploadFile = useCallback(async (file: File, fileName: string, folderId?: string): Promise<boolean> => {
    try {
      if (!authStatus.isSignedIn) {
        const connected = await signIn();
        if (!connected) return false;
      }

      // Validation du fichier
      if (file.size > GOOGLE_DRIVE_CONFIG.MAX_FILE_SIZE) {
        setUploadProgress({
          stage: 'error',
          message: `Fichier trop volumineux (max ${GOOGLE_DRIVE_CONFIG.MAX_FILE_SIZE / 1024 / 1024}MB)`
        });
        return false;
      }

      if (!GOOGLE_DRIVE_CONFIG.ALLOWED_TYPES.includes(file.type)) {
        setUploadProgress({
          stage: 'error',
          message: 'Type de fichier non autorisé (PDF uniquement)'
        });
        return false;
      }

      setUploadProgress({
        stage: 'upload',
        message: 'Upload en cours vers Google Drive...',
        progress: 0
      });

      // Métadonnées du fichier
      const metadata = {
        name: fileName,
        parents: [folderId || GOOGLE_DRIVE_CONFIG.FOLDER_ID],
        description: `Facture MyConfort générée le ${new Date().toLocaleDateString('fr-FR')}`
      };

      // Préparer la requête multipart
      const form = new FormData();
      form.append('metadata', new Blob([JSON.stringify(metadata)], { type: 'application/json' }));
      form.append('file', file);

      // Obtenir le token d'accès
      const authInstance = window.gapi.auth2.getAuthInstance();
      const user = authInstance.currentUser.get();
      const accessToken = user.getAuthResponse().access_token;

      setUploadProgress({
        stage: 'upload',
        message: 'Envoi vers Google Drive...',
        progress: 50
      });

      // Upload vers Google Drive
      const response = await fetch('https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      });

      if (!response.ok) {
        throw new Error(`Erreur HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      
      setUploadProgress({
        stage: 'complete',
        message: `✅ Fichier uploadé avec succès dans Google Drive !`,
        progress: 100
      });

      // Nettoyer le message après 3 secondes
      setTimeout(() => setUploadProgress(null), 3000);

      console.log('✅ Upload réussi:', result);
      return true;

    } catch (error) {
      console.error('❌ Erreur upload Google Drive:', error);
      setUploadProgress({
        stage: 'error',
        message: `Erreur d'upload: ${error}`
      });
      return false;
    }
  }, [authStatus.isSignedIn, signIn]);

  // 🧪 Test de connexion
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const { GoogleDriveService } = await import('../services/googleDriveService');
      const config = GoogleDriveService.getConfig();
      const targetFolderId = config.folderId || GOOGLE_DRIVE_CONFIG.FOLDER_ID;
      
      if (!authStatus.isSignedIn) {
        const connected = await signIn();
        if (!connected) return false;
      }

      setUploadProgress({
        stage: 'upload',
        message: 'Test de connexion Google Drive...'
      });

      // Tester l'accès au dossier
      const response = await window.gapi.client.drive.files.get({
        fileId: targetFolderId,
        fields: 'id,name,mimeType'
      });

      if (response.result) {
        setUploadProgress({
          stage: 'complete',
          message: `✅ Connexion réussie ! Dossier: ${response.result.name}`
        });
        setTimeout(() => setUploadProgress(null), 3000);
        return true;
      }

      return false;
    } catch (error) {
      console.error('❌ Erreur test connexion:', error);
      setUploadProgress({
        stage: 'error',
        message: `Erreur de test: ${error}`
      });
      return false;
    }
  }, [authStatus.isSignedIn, signIn]);

  return {
    authStatus,
    uploadProgress,
    signIn,
    signOut,
    uploadFile,
    testConnection,
    clearProgress: () => setUploadProgress(null)
  };
};