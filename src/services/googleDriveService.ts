// Service Google Drive pour MyComfort
// Sauvegarde automatique des factures PDF dans Google Drive

import { Invoice } from './invoiceStorage';
import { getPDFBlob } from './pdfGenerator';

// Configuration Google Drive API
const GOOGLE_DRIVE_CONFIG = {
  CLIENT_ID: '416673956609-ushnkvokiicp2ec0uug7dsvpb50mscr5.apps.googleusercontent.com',
  API_KEY: 'AIzaSyCHArqLOqdspuiJZsXjbJiUvz_3sKtEy8M',
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  SCOPES: 'https://www.googleapis.com/auth/drive.file',
  FOLDER_ID: '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-' // Votre dossier Drive
};

// Interface pour les métadonnées de fichier
interface DriveFileMetadata {
  name: string;
  parents?: string[];
  description?: string;
}

// Interface pour la réponse Google Drive
interface DriveUploadResponse {
  id: string;
  name: string;
  webViewLink?: string;
  webContentLink?: string;
}

// Fonction principale de sauvegarde sur Google Drive
export const saveToGoogleDrive = async (
  pdfBlob: Blob, 
  filename: string,
  folderId?: string
): Promise<DriveUploadResponse> => {
  try {
    console.log('☁️ Sauvegarde sur Google Drive:', filename);
    
    // Vérifier l'authentification
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Token d\'accès Google Drive manquant');
    }

    // Préparer les métadonnées
    const metadata: DriveFileMetadata = {
      name: filename,
      parents: [folderId || GOOGLE_DRIVE_CONFIG.FOLDER_ID],
      description: `Facture MyComfort générée le ${new Date().toLocaleDateString('fr-FR')}`
    };

    // Créer le FormData pour l'upload multipart
    const form = new FormData();
    form.append('metadata', new Blob([JSON.stringify(metadata)], {
      type: 'application/json'
    }));
    form.append('file', pdfBlob);

    // Envoyer à Google Drive
    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink,webContentLink',
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${accessToken}`
        },
        body: form
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Erreur Google Drive: ${response.status} - ${errorData}`);
    }

    const result: DriveUploadResponse = await response.json();
    console.log('✅ Fichier sauvegardé sur Google Drive:', result);
    
    return result;

  } catch (error) {
    console.error('❌ Erreur sauvegarde Google Drive:', error);
    throw error;
  }
};

// Fonction pour sauvegarder une facture complète
export const saveInvoiceToGoogleDrive = async (
  invoice: Invoice,
  customFilename?: string
): Promise<DriveUploadResponse> => {
  try {
    // Générer le PDF
    const pdfBlob = await getPDFBlob(invoice);
    
    // Nom de fichier par défaut
    const filename = customFilename || 
      `Facture_${invoice.invoiceNumber}_${invoice.clientName.replace(/\s+/g, '_')}.pdf`;
    
    // Sauvegarder sur Google Drive
    return await saveToGoogleDrive(pdfBlob, filename);
    
  } catch (error) {
    console.error('❌ Erreur sauvegarde facture Google Drive:', error);
    throw error;
  }
};

// Fonction d'authentification Google
export const authenticateGoogleDrive = async (): Promise<boolean> => {
  try {
    // Charger l'API Google si pas déjà fait
    if (!window.gapi) {
      await loadGoogleAPI();
    }

    // Initialiser l'API
    await window.gapi.load('auth2', async () => {
      await window.gapi.auth2.init({
        client_id: GOOGLE_DRIVE_CONFIG.CLIENT_ID,
        scope: GOOGLE_DRIVE_CONFIG.SCOPES
      });
    });

    // Authentifier l'utilisateur
    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = await authInstance.signIn();
    
    if (user.isSignedIn()) {
      console.log('✅ Authentification Google Drive réussie');
      return true;
    }
    
    return false;

  } catch (error) {
    console.error('❌ Erreur authentification Google Drive:', error);
    return false;
  }
};

// Fonction pour obtenir le token d'accès
const getAccessToken = async (): Promise<string | null> => {
  try {
    if (!window.gapi || !window.gapi.auth2) {
      console.warn('⚠️ API Google non initialisée');
      return null;
    }

    const authInstance = window.gapi.auth2.getAuthInstance();
    const user = authInstance.currentUser.get();
    
    if (user.isSignedIn()) {
      return user.getAuthResponse().access_token;
    }
    
    return null;

  } catch (error) {
    console.error('❌ Erreur récupération token:', error);
    return null;
  }
};

// Fonction pour charger l'API Google
const loadGoogleAPI = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.gapi) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://apis.google.com/js/api.js';
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Impossible de charger l\'API Google'));
    document.head.appendChild(script);
  });
};

// Fonction pour créer le dossier MyComfort (si nécessaire)
export const createMyComfortFolder = async (): Promise<string> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Token d\'accès manquant');
    }

    const metadata = {
      name: 'MyComfort Factures',
      mimeType: 'application/vnd.google-apps.folder',
      description: 'Dossier automatique pour les factures MyComfort'
    };

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(metadata)
    });

    if (!response.ok) {
      throw new Error(`Erreur création dossier: ${response.status}`);
    }

    const result = await response.json();
    console.log('✅ Dossier MyComfort créé:', result.id);
    
    return result.id;

  } catch (error) {
    console.error('❌ Erreur création dossier:', error);
    throw error;
  }
};

// Fonction pour lister les factures sur Google Drive
export const listInvoicesFromGoogleDrive = async (): Promise<any[]> => {
  try {
    const accessToken = await getAccessToken();
    if (!accessToken) {
      throw new Error('Token d\'accès manquant');
    }

    const query = `parents in '${GOOGLE_DRIVE_CONFIG.FOLDER_ID}' and name contains 'Facture_'`;
    const response = await fetch(
      `https://www.googleapis.com/drive/v3/files?q=${encodeURIComponent(query)}&fields=files(id,name,createdTime,webViewLink)`,
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`
        }
      }
    );

    if (!response.ok) {
      throw new Error(`Erreur listage: ${response.status}`);
    }

    const result = await response.json();
    return result.files || [];

  } catch (error) {
    console.error('❌ Erreur listage Google Drive:', error);
    return [];
  }
};

// Fonction de test de la configuration
export const testGoogleDriveConfiguration = async (): Promise<boolean> => {
  try {
    console.log('🧪 Test configuration Google Drive...');
    
    // Test d'authentification
    const isAuthenticated = await authenticateGoogleDrive();
    if (!isAuthenticated) {
      console.error('❌ Échec authentification');
      return false;
    }

    // Test de création d'un fichier de test
    const testBlob = new Blob(['Test MyComfort'], { type: 'text/plain' });
    const result = await saveToGoogleDrive(testBlob, 'test-mycomfort.txt');
    
    console.log('✅ Test Google Drive réussi:', result.id);
    return true;

  } catch (error) {
    console.error('❌ Test Google Drive échoué:', error);
    return false;
  }
};

// Export de la configuration pour modification
export { GOOGLE_DRIVE_CONFIG };

// Types pour TypeScript
declare global {
  interface Window {
    gapi: any;
  }
}
