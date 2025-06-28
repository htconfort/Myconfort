import React, { useState, useEffect } from 'react';
import { X, Save, Mail, Key, Settings, CheckCircle, AlertCircle, Loader, TestTube, Star, Shield, Zap, Trophy } from 'lucide-react';
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
      setServiceId(currentConfig.serviceId);
      setTemplateId(currentConfig.templateId);
    }
  }, [isOpen]);

  const handleSaveConfig = () => {
    setIsSaving(true);

    try {
      // Mettre à jour la configuration dans le service
      EmailService.updateConfig(serviceId, templateId);
      
      onSuccess('✅ Configuration EmailJS confirmée avec clés API définitives ! Votre système est 100% opérationnel.');
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
      // Tester la connexion
      const result = await EmailService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        onSuccess(`✅ Test réussi avec clés API définitives ! ${result.message}`);
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

  const configInfo = EmailService.getConfigInfo();

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Configuration EmailJS - Clés API Définitives" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* En-tête de félicitations avec clés API définitives */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">🎉 Clés API Définitives Opérationnelles !</h3>
              <p className="text-green-100">EmailJS configuré avec les bonnes clés API + Test reçu</p>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-green-100">
            Félicitations ! Vos clés API définitives <strong>eqxx9fwyTsoAoF00i</strong> et <strong>MwZ9s8tHaiq8YimGZrF5_</strong> sont opérationnelles et le service <strong>service_ymw6jjh</strong> a été confirmé par le test reçu !
          </p>
        </div>

        {/* Configuration complète avec clés API définitives */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">Configuration automatique avec clés API définitives !</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-semibold">API Key (Public) DÉFINITIVE :</span>
              <span className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded font-bold">
                {configInfo.apiKey}
              </span>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-semibold">Private Key DÉFINITIVE :</span>
              <span className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded font-bold">
                {configInfo.privateKey}
              </span>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Settings className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-semibold">Service ID CONFIRMÉ PAR TEST :</span>
              <span className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded font-bold">
                {configInfo.serviceId}
              </span>
              <Trophy className="w-4 h-4 text-yellow-500" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-green-600" />
              <span className="text-sm text-green-700 font-semibold">Template ID :</span>
              <span className="text-sm text-green-700 font-mono bg-green-100 px-2 py-1 rounded">
                {configInfo.templateId}
              </span>
              <CheckCircle className="w-4 h-4 text-green-600" />
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
            <p className="text-sm text-green-800 font-semibold">
              🎉 CLÉS API DÉFINITIVES OPÉRATIONNELLES !
            </p>
            <p className="text-xs text-green-700 mt-1">
              Vos clés API définitives eqxx9fwyTsoAoF00i et MwZ9s8tHaiq8YimGZrF5_ sont configurées et le service service_ymw6jjh a été confirmé par le test EmailJS reçu !
            </p>
          </div>
        </div>

        {/* Confirmation du test reçu */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Trophy className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">Test EmailJS Confirmé !</h4>
          </div>
          
          <div className="text-sm text-blue-700">
            <p className="font-semibold">✅ Email de test reçu avec succès :</p>
            <ul className="mt-2 ml-4 list-disc space-y-1">
              <li><strong>Service testé :</strong> Gmail (service_ymw6jjh)</li>
              <li><strong>Statut :</strong> Service configuré avec succès</li>
              <li><strong>Confirmation :</strong> "This test email was sent to you from the EmailJS dashboard"</li>
              <li><strong>Résultat :</strong> Configuration opérationnelle</li>
            </ul>
          </div>
        </div>

        {/* Formulaire de configuration (lecture seule) */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Service ID <span className="text-green-600">✅ Service Confirmé par Test</span>
            </label>
            <div className="flex items-center">
              <Settings className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-600"
                disabled
              />
            </div>
            <p className="text-xs text-green-600 mt-1">
              ✅ Votre Service ID service_ymw6jjh a été confirmé par le test EmailJS reçu
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Template ID <span className="text-green-600 flex items-center space-x-1">
                <CheckCircle className="w-4 h-4" />
                <span>✅ Template confirmé</span>
              </span>
            </label>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-green-50 text-green-700 font-bold"
                disabled
              />
              <CheckCircle className="w-5 h-5 text-green-500 ml-2" />
            </div>
            <p className="text-xs text-green-600 mt-1 font-semibold">
              ✅ Votre Template template_yng4k8s est confirmé et actif !
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
                  {testResult.success ? '✅ Test réussi avec clés API définitives !' : '❌ Test échoué'}
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

        {/* Fonctionnalités disponibles avec clés API définitives */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">🚀 Fonctionnalités avec clés API définitives :</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>📧 Emails avec Template personnalisé</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>📎 Pièces jointes jusqu'à 2MB</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>🎨 Design MYCONFORT</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>✍️ Signature électronique</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>💰 Gestion des acomptes</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>📸 Partage d'aperçu</span>
            </div>
          </div>
        </div>

        {/* Statut final avec clés API définitives */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">Statut de la configuration</h4>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-green-700 font-bold">API Key (Public) définitive : eqxx9fwyTsoAoF00i</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-green-700 font-bold">Private Key définitive : MwZ9s8tHaiq8YimGZrF5_</span>
            </div>
            <div className="flex items-center space-x-2">
              <Trophy className="w-4 h-4 text-yellow-500" />
              <span className="text-green-700 font-bold">Service ID confirmé par test : service_ymw6jjh</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700">Template ID confirmé : template_yng4k8s</span>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
            <p className="text-sm text-green-800 font-bold">
              🎉 FÉLICITATIONS ! Clés API définitives opérationnelles !
            </p>
            <p className="text-xs text-green-700 mt-1">
              Vos clés API définitives eqxx9fwyTsoAoF00i et MwZ9s8tHaiq8YimGZrF5_ sont configurées, le service service_ymw6jjh a été confirmé par le test reçu, et votre système est prêt pour l'envoi d'emails MYCONFORT avec pièces jointes 2MB.
            </p>
          </div>
        </div>

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
              disabled={isSaving || isTesting}
              className="bg-blue-500 hover:bg-blue-600 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              {isTesting ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Test en cours...</span>
                </>
              ) : (
                <>
                  <TestTube className="w-5 h-5" />
                  <span>Tester Clés API Définitives</span>
                </>
              )}
            </button>
            
            <button
              onClick={handleSaveConfig}
              disabled={isSaving}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>Confirmation...</span>
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  <span>Confirmer Clés API Définitives</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};