import React, { useState, useEffect } from 'react';
import { X, Save, Mail, Key, Settings, CheckCircle, AlertCircle, Loader, TestTube, Star, Shield } from 'lucide-react';
import { Modal } from './ui/Modal';
import { EmailService } from '../services/emailService';

interface EmailJSConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const EmailJSConfigModal: React.FC<EmailJSConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  onError
}) => {
  const [serviceId, setServiceId] = useState('');
  const [templateId, setTemplateId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Charger la configuration existante
  useEffect(() => {
    if (isOpen) {
      const currentConfig = EmailService.getCurrentConfig();
      setServiceId(currentConfig.serviceId === 'YOUR_SERVICE_ID' ? '' : currentConfig.serviceId);
      setTemplateId(currentConfig.templateId === 'YOUR_TEMPLATE_ID' ? '' : currentConfig.templateId);
    }
  }, [isOpen]);

  const handleSaveConfig = () => {
    if (!serviceId || !templateId) {
      onError('Veuillez remplir le Service ID et le Template ID');
      return;
    }

    setIsSaving(true);

    try {
      // Mettre à jour la configuration dans le service (sans changer les clés API)
      EmailService.updateConfig(serviceId, templateId);
      
      onSuccess('Configuration EmailJS enregistrée avec succès ! Vos clés API sont déjà configurées.');
      setIsSaving(false);
    } catch (error: any) {
      onError(`Erreur lors de l'enregistrement: ${error.message}`);
      setIsSaving(false);
    }
  };

  const handleTestConnection = async () => {
    if (!serviceId || !templateId) {
      onError('Veuillez remplir le Service ID et le Template ID avant de tester');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      // Mettre à jour la configuration temporairement pour le test
      EmailService.updateConfig(serviceId, templateId);
      
      // Tester la connexion
      const result = await EmailService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        onSuccess(`Test réussi ! ${result.message}`);
      } else {
        onError(`Test échoué: ${result.message}`);
      }
    } catch (error: any) {
      onError(`Erreur lors du test: ${error.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (!isOpen) return null;

  const configInfo = EmailService.getConfigInfo();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuration EmailJS" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* En-tête EmailJS */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Mail className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Configuration EmailJS</h3>
              <p className="text-blue-100">Service d'envoi d'emails pour MYCONFORT</p>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-blue-100">
            EmailJS permet d'envoyer des emails directement depuis le navigateur, sans serveur backend.
            Vous devez créer un compte sur <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">EmailJS</a> et configurer un service et un template.
          </p>
        </div>

        {/* Clés API déjà configurées */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Star className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">Clés API déjà configurées !</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-semibold">API Key (Public) :</span>
              <span className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded">
                {configInfo.apiKey}
              </span>
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-semibold">Private Key :</span>
              <span className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded">
                {configInfo.privateKey}
              </span>
            </div>
          </div>
          
          <p className="text-xs text-green-600 mt-2">
            ✅ Vos clés API EmailJS sont déjà configurées. Il vous reste seulement à ajouter votre Service ID et Template ID.
          </p>
        </div>

        {/* Formulaire de configuration */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Service ID <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                placeholder="service_xxxxxxx"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Trouvez votre Service ID dans la section "Email Services" de votre compte EmailJS
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Template ID <span className="text-red-500">*</span>
            </label>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                placeholder="template_xxxxxxx"
                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
              />
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Trouvez votre Template ID dans la section "Email Templates" de votre compte EmailJS
            </p>
          </div>
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
                  {testResult.success ? 'Test réussi !' : 'Test échoué'}
                </p>
                <p className={`text-sm ${testResult.success ? 'text-green-600' : 'text-red-600'}`}>
                  {testResult.message}
                </p>
                {testResult.responseTime && (
                  <p className="text-xs text-gray-500">
                    Temps de réponse: {testResult.responseTime}ms
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Instructions pour créer un template */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h4 className="font-medium text-yellow-800 mb-2">🚀 Étapes rapides pour finaliser la configuration</h4>
          <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1">
            <li>Allez sur <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">EmailJS</a> et connectez-vous</li>
            <li>Ajoutez un service email (Gmail, Outlook, etc.) et notez le <strong>Service ID</strong></li>
            <li>Créez un template d'email et notez le <strong>Template ID</strong></li>
            <li>Collez ces IDs dans les champs ci-dessus</li>
            <li>Cliquez sur "Tester" puis "Enregistrer"</li>
          </ol>
          <div className="mt-2 p-2 bg-yellow-100 rounded text-xs">
            <p className="font-semibold">💡 Variables importantes pour votre template :</p>
            <p><code>{'{{to_email}}'}</code>, <code>{'{{to_name}}'}</code>, <code>{'{{invoice_number}}'}</code>, <code>{'{{message}}'}</code>, <code>{'{{pdf_data}}'}</code></p>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isSaving || isTesting}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            Annuler
          </button>
          
          <div className="flex space-x-3">
            <button
              onClick={handleTestConnection}
              disabled={isSaving || isTesting || !serviceId || !templateId}
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
              disabled={isSaving || !serviceId || !templateId}
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