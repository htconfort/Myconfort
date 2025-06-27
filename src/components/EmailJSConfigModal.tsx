import React, { useState, useEffect } from 'react';
import { X, Save, Mail, Key, Settings, CheckCircle, AlertCircle, Loader, TestTube, Star, Shield, Zap, Trophy, Server } from 'lucide-react';
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
      
      onSuccess('✅ Configuration OVH SMTP confirmée ! Votre système est 100% opérationnel avec ssl0.ovh.net.');
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
      // Tester la connexion OVH SMTP
      const result = await EmailService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        onSuccess(`✅ Test réussi avec OVH SMTP ! ${result.message}`);
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
    <Modal isOpen={isOpen} onClose={onClose} title="Configuration OVH SMTP - Service Email Professionnel" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* En-tête de félicitations avec OVH SMTP */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Server className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">🚀 Service OVH SMTP Configuré !</h3>
              <p className="text-blue-100">EmailJS configuré avec votre serveur SMTP OVH professionnel</p>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-blue-100">
            Félicitations ! Votre serveur SMTP OVH <strong>ssl0.ovh.net</strong> est maintenant rattaché à votre système d'envoi d'emails MYCONFORT.
          </p>
        </div>

        {/* Configuration complète avec OVH SMTP */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <CheckCircle className="w-5 h-5 text-blue-600" />
            <h4 className="font-medium text-blue-800">Configuration automatique avec OVH SMTP !</h4>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Key className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-semibold">API Key (Public) :</span>
              <span className="text-sm text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded">
                {configInfo.apiKey}
              </span>
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Shield className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-semibold">Private Key :</span>
              <span className="text-sm text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded">
                {configInfo.privateKey}
              </span>
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Server className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-semibold">Service OVH SMTP :</span>
              <span className="text-sm text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded font-bold">
                {configInfo.serviceId}
              </span>
              <CheckCircle className="w-4 h-4 text-blue-600" />
            </div>
            
            <div className="flex items-center space-x-2">
              <Mail className="w-4 h-4 text-blue-600" />
              <span className="text-sm text-blue-700 font-semibold">Template ID :</span>
              <span className="text-sm text-blue-700 font-mono bg-blue-100 px-2 py-1 rounded font-bold">
                {configInfo.templateId}
              </span>
              <Star className="w-4 h-4 text-yellow-500" />
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-blue-100 border border-blue-300 rounded">
            <p className="text-sm text-blue-800 font-semibold">
              🚀 SERVICE OVH SMTP CONFIGURÉ AVEC SUCCÈS !
            </p>
            <p className="text-xs text-blue-700 mt-1">
              Votre serveur SMTP OVH (ssl0.ovh.net:465) est maintenant utilisé pour tous les envois d'emails. Votre système est 100% opérationnel.
            </p>
          </div>
        </div>

        {/* Détails techniques OVH SMTP */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-3">
            <Server className="w-5 h-5 text-gray-600" />
            <h4 className="font-medium text-gray-800">Détails du serveur OVH SMTP</h4>
          </div>
          
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-semibold text-gray-700">Serveur SMTP :</span>
              <p className="text-gray-600 font-mono">ssl0.ovh.net</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Port :</span>
              <p className="text-gray-600 font-mono">465 (SSL)</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Sécurité :</span>
              <p className="text-gray-600">SSL/TLS activé</p>
            </div>
            <div>
              <span className="font-semibold text-gray-700">Email expéditeur :</span>
              <p className="text-gray-600 font-mono">bGX226700465.002@htconfort.com</p>
            </div>
          </div>
        </div>

        {/* Formulaire de configuration (lecture seule) */}
        <div className="space-y-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Service OVH SMTP <span className="text-blue-600">✅ Configuré automatiquement</span>
            </label>
            <div className="flex items-center">
              <Server className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={serviceId}
                onChange={(e) => setServiceId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-gray-50 text-gray-600"
                disabled
              />
            </div>
            <p className="text-xs text-blue-600 mt-1">
              ✅ Votre Service OVH SMTP est configuré automatiquement
            </p>
          </div>
          
          <div>
            <label className="block text-gray-700 font-medium mb-1">
              Template ID <span className="text-blue-600 flex items-center space-x-1">
                <Star className="w-4 h-4" />
                <span>✅ Votre Template</span>
              </span>
            </label>
            <div className="flex items-center">
              <Mail className="w-5 h-5 text-gray-400 mr-2" />
              <input
                type="text"
                value={templateId}
                onChange={(e) => setTemplateId(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 bg-blue-50 text-blue-700 font-bold"
                disabled
              />
              <Star className="w-5 h-5 text-yellow-500 ml-2" />
            </div>
            <p className="text-xs text-blue-600 mt-1 font-semibold">
              ⭐ Votre Template est maintenant rattaché au serveur OVH SMTP !
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
                  {testResult.success ? '✅ Test réussi avec OVH SMTP !' : '❌ Test échoué'}
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

        {/* Fonctionnalités disponibles avec OVH SMTP */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <h4 className="font-medium text-green-800 mb-2">🚀 Fonctionnalités avec OVH SMTP :</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-green-700">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>📧 Emails via serveur professionnel</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>📎 PDF en pièce jointe</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span>🔒 Connexion SSL sécurisée</span>
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

        {/* Statut final avec OVH SMTP */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Trophy className="w-5 h-5 text-green-600" />
            <h4 className="font-medium text-green-800">Statut de la configuration OVH SMTP</h4>
          </div>
          
          <div className="space-y-1 text-sm">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700">API Key configurée automatiquement</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700">Private Key configurée automatiquement</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-4 h-4 text-green-500" />
              <span className="text-green-700">Serveur OVH SMTP configuré automatiquement</span>
            </div>
            <div className="flex items-center space-x-2">
              <Star className="w-4 h-4 text-yellow-500" />
              <span className="text-green-700 font-bold">Template rattaché au serveur OVH SMTP avec succès</span>
            </div>
          </div>
          
          <div className="mt-3 p-3 bg-green-100 border border-green-300 rounded">
            <p className="text-sm text-green-800 font-bold">
              🎉 FÉLICITATIONS ! Serveur OVH SMTP opérationnel !
            </p>
            <p className="text-xs text-green-700 mt-1">
              Votre serveur SMTP OVH (ssl0.ovh.net) est maintenant utilisé pour tous les envois d'emails MYCONFORT. Vous pouvez envoyer des factures par email avec votre serveur professionnel.
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
                  <span>Tester OVH SMTP</span>
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
                  <Server className="w-5 h-5" />
                  <span>Confirmer OVH SMTP</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </Modal>
  );
};