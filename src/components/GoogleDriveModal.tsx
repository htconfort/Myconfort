import React, { useState, useEffect } from 'react';
import { X, Save, CloudUpload, TestTube, Loader, CheckCircle, AlertCircle, FolderOpen } from 'lucide-react';
import { Modal } from './ui/Modal';
import { GoogleDriveService } from '../services/googleDriveService';

interface GoogleDriveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const GoogleDriveModal: React.FC<GoogleDriveModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [webhookUrl, setWebhookUrl] = useState('');
  const [folderId, setFolderId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Load the current configuration
  useEffect(() => {
    if (isOpen) {
      const config = GoogleDriveService.getConfig();
      setWebhookUrl(config.webhookUrl);
      setFolderId(config.folderId);
    }
  }, [isOpen]);

  const handleSaveConfig = () => {
    setIsSaving(true);

    try {
      // Update the configuration
      GoogleDriveService.updateWebhookConfig(webhookUrl, folderId);
      
      onSuccess('✅ Configuration Google Drive mise à jour avec succès !');
      setIsSaving(false);
    } catch (error: any) {
      onError(`Erreur lors de l'enregistrement: ${error.message}`);
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      // Test the Google Drive integration
      const result = await GoogleDriveService.testGoogleDriveIntegration();
      setTestResult(result);
      
      if (result.success) {
        onSuccess(`✅ Test réussi ! ${result.message}`);
      } else {
        onError(`❌ Test échoué: ${result.message}`);
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
        {/* En-tête */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <CloudUpload className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Intégration Google Drive</h3>
              <p className="text-blue-100">Sauvegardez automatiquement vos factures dans Google Drive</p>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-blue-100">
            Cette intégration permet d'envoyer automatiquement vos factures PDF vers Google Drive via Make (Integromat).
          </p>
        </div>

        {/* Formulaire de configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              URL du Webhook Make
            </label>
            <div className="flex items-center">
              <CloudUpload className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={webhookUrl}
                onChange={(e) => setWebhookUrl(e.target.value)}
                placeholder="https://hook.eu1.make.com/votre-webhook-id"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              URL du webhook Make qui recevra les données de la facture
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              ID du Dossier Google Drive
            </label>
            <div className="flex items-center">
              <FolderOpen className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={folderId}
                onChange={(e) => setFolderId(e.target.value)}
                placeholder="1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              ID du dossier Google Drive où seront stockées les factures
            </p>
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Comment configurer l'intégration :</h4>
          <ol className="list-decimal ml-5 space-y-2 text-sm text-blue-700">
            <li>Créez un scénario dans Make (Integromat) avec un webhook comme déclencheur</li>
            <li>Ajoutez un module Google Drive pour uploader un fichier</li>
            <li>Copiez l'URL du webhook Make et collez-la ci-dessus</li>
            <li>Créez un dossier dans Google Drive et copiez son ID</li>
            <li>Testez la connexion pour vérifier que tout fonctionne</li>
          </ol>
        </div>

        {/* Résultat du test */}
        {testResult && (
          <div className={`p-4 rounded-lg ${testResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <div className="flex items-center space-x-2">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-500" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-500" />
              )}
              <div>
                <p className={`font-medium ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResult.success ? '✅ Test réussi !' : '❌ Test échoué'}
                </p>
                <p className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.message}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isSaving || isTesting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            Fermer
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleTestConnection}
              disabled={!webhookUrl || isSaving || isTesting}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Test en cours...</span>
                </>
              ) : (
                <>
                  <TestTube className="w-5 h-5" />
                  <span>Tester la connexion</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSaveConfig}
              disabled={!webhookUrl || isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Enregistrement...</span>
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  <span>Enregistrer</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};