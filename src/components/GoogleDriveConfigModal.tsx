import React, { useState, useEffect } from 'react';
import { X, TestTube, Loader, CheckCircle, AlertCircle, Cloud, Key, Settings, User, LogOut, Link } from 'lucide-react';
import { Modal } from './ui/Modal';
import { GoogleDriveService } from '../services/googleDriveService';

interface GoogleDriveConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const GoogleDriveConfigModal: React.FC<GoogleDriveConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [lastUploadLink, setLastUploadLink] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      checkSignInStatus();
      
      // Retrieve last upload link from localStorage
      const savedLink = localStorage.getItem('lastGoogleDriveUploadLink');
      if (savedLink) {
        setLastUploadLink(savedLink);
      }
    }
  }, [isOpen]);

  const checkSignInStatus = async () => {
    setIsLoading(true);
    try {
      await GoogleDriveService.initialize();
      const signedIn = GoogleDriveService.isUserSignedIn();
      setIsSignedIn(signedIn);
      
      if (signedIn) {
        const user = await GoogleDriveService.getCurrentUser();
        setCurrentUser(user);
      }
    } catch (error) {
      console.error('Error checking sign-in status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignIn = async () => {
    try {
      setIsTesting(true);
      const success = await GoogleDriveService.signIn();
      if (success) {
        setIsSignedIn(true);
        const user = await GoogleDriveService.getCurrentUser();
        setCurrentUser(user);
        onSuccess('✅ Connexion à Google Drive réussie !');
      } else {
        onError('❌ Échec de la connexion à Google Drive');
      }
    } catch (error: any) {
      onError(`Erreur de connexion: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const handleSignOut = async () => {
    try {
      await GoogleDriveService.signOut();
      setIsSignedIn(false);
      setCurrentUser(null);
      onSuccess('✅ Déconnexion de Google Drive réussie');
    } catch (error: any) {
      onError(`Erreur de déconnexion: ${error.message}`);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      const result = await GoogleDriveService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        onSuccess(result.message);
        checkSignInStatus();
      } else {
        onError(result.message);
      }
    } catch (error: any) {
      onError(`Erreur lors du test: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuration Google Drive" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* En-tête de configuration */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Cloud className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Configuration Google Drive</h3>
              <p className="text-blue-100">Sauvegarde automatique des factures dans votre Drive</p>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-blue-100">
            Connectez-vous à Google Drive pour sauvegarder automatiquement vos factures dans le dossier spécifié.
          </p>
        </div>

        {/* Statut de connexion */}
        {isLoading ? (
          <div className="bg-gray-50 border-2 border-gray-300 rounded-lg p-4 flex items-center justify-center">
            <Loader className="w-5 h-5 animate-spin text-blue-600 mr-2" />
            <span className="text-gray-700">Vérification de la connexion...</span>
          </div>
        ) : (
          <div className={`p-4 rounded-lg border-2 ${
            isSignedIn ? 'bg-green-50 border-green-300' : 'bg-yellow-50 border-yellow-300'
          }`}>
            <div className="flex items-center space-x-2 mb-2">
              {isSignedIn ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-600" />
              )}
              <h4 className={`font-medium ${
                isSignedIn ? 'text-green-800' : 'text-yellow-800'
              }`}>
                {isSignedIn ? 'Connecté à Google Drive' : 'Non connecté à Google Drive'}
              </h4>
            </div>
            
            {isSignedIn && currentUser && (
              <div className="space-y-1 text-sm text-green-700">
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4" />
                  <span>Connecté en tant que: <strong>{currentUser.name}</strong></span>
                </div>
                <div className="flex items-center space-x-2">
                  <span>Email: <strong>{currentUser.email}</strong></span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Configuration du dossier */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Settings className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">Dossier de destination</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-blue-700 font-semibold">Dossier ID:</span>
              <span className="text-sm text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded">
                1sdCwbJHWu6QelYwAnQxPKNEOsd_XBtJw
              </span>
            </div>
            <div className="text-xs text-blue-600">
              Les factures seront automatiquement sauvegardées dans ce dossier Google Drive.
            </div>
          </div>
        </div>

        {/* Dernier fichier uploadé */}
        {lastUploadLink && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <Link className="w-5 h-5 text-green-600" />
              <h4 className="font-medium text-green-800">Dernier fichier sauvegardé</h4>
            </div>
            
            <div className="flex items-center space-x-2">
              <a 
                href={lastUploadLink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 underline flex items-center space-x-1"
              >
                <span>Voir la dernière facture sauvegardée</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>
          </div>
        )}

        {/* Instructions de configuration */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">📋 Comment ça marche :</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start space-x-2">
              <Key className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold">1. Connectez-vous à Google Drive</p>
                <p>Cliquez sur le bouton "Se connecter à Google Drive" ci-dessous</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Settings className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold">2. Autorisez l'accès</p>
                <p>Suivez les instructions pour autoriser l'application à accéder à votre Drive</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Cloud className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold">3. Sauvegardez vos factures</p>
                <p>Chaque fois que vous cliquerez sur "Enregistrer", la facture sera sauvegardée dans Google Drive</p>
              </div>
            </div>
          </div>
        </div>

        {/* Résultat du test */}
        {testResult && (
          <div className={`p-4 rounded-lg ${
            testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <div className="flex items-center space-x-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className={`font-medium ${
                  testResult.success ? 'text-green-700' : 'text-red-700'
                }`}>
                  {testResult.success ? '✅ Test de connexion réussi !' : '❌ Test de connexion échoué'}
                </p>
                <p className={`text-sm ${
                  testResult.success ? 'text-green-600' : 'text-red-600'
                }`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Fonctionnalités disponibles */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">🚀 Fonctionnalités Google Drive :</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>📄 Sauvegarde automatique PDF</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>🔒 Authentification sécurisée</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>📁 Organisation par dossier</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>☁️ Accès depuis n'importe où</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isTesting || isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            Fermer
          </button>
          
          <div className="flex space-x-3">
            {isSignedIn ? (
              <>
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting || isLoading}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                >
                  {isTesting ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Test...</span>
                    </>
                  ) : (
                    <>
                      <TestTube className="w-5 h-5" />
                      <span>Tester</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={handleSignOut}
                  disabled={isLoading}
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnecter</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isTesting || isLoading}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
              >
                {isTesting ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin" />
                    <span>Connexion...</span>
                  </>
                ) : (
                  <>
                    <Cloud className="w-5 h-5" />
                    <span>Se connecter à Google Drive</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </Modal>
  );
};

// Icône de vérification simple
const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);