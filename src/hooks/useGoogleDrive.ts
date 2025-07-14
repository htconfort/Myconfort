import { useState, useEffect, useCallback } from 'react';
import { googleDriveService } from '../services/googleDriveService';

interface GoogleDriveStatus {
  isLoaded: boolean;
  isSignedIn: boolean;
  error?: string;
  userEmail?: string;
}

interface UploadProgress {
  stage: 'auth' | 'upload' | 'complete' | 'error';
  message: string;
  progress?: number;
}

export const useGoogleDrive = () => {
  const [status, setStatus] = useState<GoogleDriveStatus>({
    isLoaded: false,
    isSignedIn: false
  });
  
  const [uploadProgress, setUploadProgress] = useState<UploadProgress | null>(null);

  // 🔧 Initialisation
  useEffect(() => {
    const initializeGoogleDrive = async () => {
      try {
        await googleDriveService.initialize();
        setStatus({
          isLoaded: true,
          isSignedIn: googleDriveService.isAuthenticated()
        });
      } catch (error) {
        console.error('❌ Erreur initialisation Google Drive:', error);
        setStatus({
          isLoaded: false,
          isSignedIn: false,
          error: error instanceof Error ? error.message : 'Erreur d\'initialisation'
        });
      }
    };

    initializeGoogleDrive();
  }, []);

  // 🔐 Connexion
  const signIn = useCallback(async (): Promise<boolean> => {
    try {
      setUploadProgress({
        stage: 'auth',
        message: 'Connexion à Google Drive...'
      });

      console.log('🔐 Appel direct à googleDriveService.authenticate()...');
      const success = await googleDriveService.authenticate();
      
      if (success) {
        console.log('✅ Authentification réussie, mise à jour du statut...');
        setStatus(prev => ({ ...prev, isSignedIn: true }));
        setUploadProgress(null);
        return true;
      } else {
        console.log('❌ Authentification échouée');
        setUploadProgress({
          stage: 'error',
          message: 'Échec de l\'authentification'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur connexion:', error);
      setUploadProgress({
        stage: 'error',
        message: `Erreur de connexion: ${error}`
      });
      return false;
    }
  }, []);

  // 📤 Upload de fichier
  const uploadFile = useCallback(async (file: File, fileName: string, folderId?: string): Promise<boolean> => {
    try {
      if (!status.isSignedIn) {
        const connected = await signIn();
        if (!connected) return false;
      }

      setUploadProgress({
        stage: 'upload',
        message: 'Upload en cours vers Google Drive...',
        progress: 0
      });

      const result = await googleDriveService.uploadFile(file, folderId);

      if (result.success) {
        setUploadProgress({
          stage: 'complete',
          message: '✅ Fichier uploadé avec succès !',
          progress: 100
        });

        // Nettoyer après 3 secondes
        setTimeout(() => setUploadProgress(null), 3000);
        return true;
      } else {
        setUploadProgress({
          stage: 'error',
          message: `Erreur d'upload: ${result.error}`
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur upload:', error);
      setUploadProgress({
        stage: 'error',
        message: `Erreur d'upload: ${error}`
      });
      return false;
    }
  }, [status.isSignedIn, signIn]);

  // 🧪 Test de connexion
  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      setUploadProgress({
        stage: 'upload',
        message: 'Test de connexion Google Drive...'
      });

      // Vérifier la configuration
      const config = googleDriveService.getConfig();
      if (!config.API_KEY || !config.CLIENT_ID) {
        setUploadProgress({
          stage: 'error',
          message: '❌ Configuration Google Drive manquante dans .env'
        });
        return false;
      }

      // Tester l'initialisation
      await googleDriveService.initialize();
      
      // Tester l'authentification
      const authenticated = await googleDriveService.authenticate();
      
      if (authenticated) {
        setUploadProgress({
          stage: 'complete',
          message: `✅ Connexion Google Drive réussie !\n\n• API Key: Configurée\n• Client ID: Configuré\n• Dossier: ${config.FOLDER_ID}\n• Authentification: OK`
        });
        setTimeout(() => setUploadProgress(null), 5000);
        return true;
      } else {
        setUploadProgress({
          stage: 'error',
          message: '❌ Échec de l\'authentification Google'
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur test connexion:', error);
      setUploadProgress({
        stage: 'error',
        message: `❌ Erreur de test: ${error instanceof Error ? error.message : 'Erreur inconnue'}`
      });
      return false;
    }
  }, []);

  return {
    authStatus: status,
    uploadProgress,
    signIn,
    uploadFile,
    testConnection,
    clearProgress: () => setUploadProgress(null)
  };
};