import React, { useState, useEffect } from 'react';
import { X, Save, TestTube, Loader, CheckCircle, AlertCircle, Cloud, Key, Settings, User, LogOut } from 'lucide-react';
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

  useEffect(() => {
    if (isOpen) {
      checkSignInStatus();
    }
  }, [isOpen]);

  const checkSignInStatus = () => {
    const signedIn = GoogleDriveService.isUserSignedIn();
    setIsSignedIn(signedIn);
    if (signedIn) {
      setCurrentUser(GoogleDriveService.getCurrentUser());
    }
  };

  const handleSignIn = async () => {
    try {
      setIsTesting(true);
      const success = await GoogleDriveService.signIn();
      if (success) {
        setIsSignedIn(true);
        setCurrentUser(GoogleDriveService.getCurrentUser());
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
        </div>

        {/* Statut de connexion */}
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
                <span>Connecté en tant que: <strong>{currentUser.getName()}</strong></span>
              </div>
              <div className="flex items-center space-x-2">
                <span>Email: <strong>{currentUser.getEmail()}</strong></span>
              </div>
            </div>
          )}
        </div>

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

        {/* Instructions de configuration */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-2">📋 Configuration requise :</h4>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start space-x-2">
              <Key className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold">1. API Key Google Drive</p>
                <p>Vous devez configurer une API Key dans la Google Cloud Console</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Settings className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold">2. Client ID OAuth 2.0</p>
                <p>Créez des identifiants OAuth 2.0 pour l'authentification</p>
              </div>
            </div>
            <div className="flex items-start space-x-2">
              <Cloud className="w-4 h-4 text-gray-500 mt-0.5" />
              <div>
                <p className="font-semibold">3. Activer l'API Google Drive</p>
                <p>Activez l'API Google Drive dans votre projet Google Cloud</p>
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
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>📄 Sauvegarde automatique PDF</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>🔒 Authentification sécurisée</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>📁 Organisation par dossier</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>☁️ Accès depuis n'importe où</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isTesting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            Fermer
          </button>
          
          <div className="flex space-x-3">
            {isSignedIn ? (
              <>
                <button
                  onClick={handleTestConnection}
                  disabled={isTesting}
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
                  className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
                >
                  <LogOut className="w-5 h-5" />
                  <span>Déconnecter</span>
                </button>
              </>
            ) : (
              <button
                onClick={handleSignIn}
                disabled={isTesting}
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