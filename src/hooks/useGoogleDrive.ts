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

      const success = await googleDriveService.authenticate();
      
      if (success) {
        setStatus(prev => ({ ...prev, isSignedIn: true }));
        setUploadProgress(null);
        return true;
      } else {
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

      const result = await googleDriveService.testGoogleDriveIntegration();

      if (result.success) {
        setUploadProgress({
          stage: 'complete',
          message: result.message
        });
        setTimeout(() => setUploadProgress(null), 5000);
        return true;
      } else {
        setUploadProgress({
          stage: 'error',
          message: result.message
        });
        return false;
      }
    } catch (error) {
      console.error('❌ Erreur test connexion:', error);
      setUploadProgress({
        stage: 'error',
        message: `Erreur de test: ${error}`
      });
      return false;
    }
  }, []);

  return {
    authStatus: status, // Pour compatibilité avec l'ancien code
    uploadProgress,
    signIn,
    uploadFile,
    testConnection,
    clearProgress: () => setUploadProgress(null)
  };
};