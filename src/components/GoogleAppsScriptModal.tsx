import React, { useState } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle, Loader, TestTube, FileText, Paperclip, AlertTriangle, Zap, Shield, Clock } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Invoice } from '../types';
import { GoogleAppsScriptService } from '../services/googleAppsScriptService';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

interface GoogleAppsScriptModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const GoogleAppsScriptModal: React.FC<GoogleAppsScriptModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
  onError
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [sendingStep, setSendingStep] = useState<string>('');
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  const totalAmount = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

  const acompteAmount = invoice.payment.depositAmount || 0;
  const montantRestant = totalAmount - acompteAmount;

  const scriptInfo = GoogleAppsScriptService.getScriptInfo();
  const validation = GoogleAppsScriptService.validateEmailData(invoice);
  const scriptConfigured = scriptInfo.scriptId !== 'VOTRE_NOUVEAU_SCRIPT_ID';

  const handleSendViaGoogleScript = async () => {
    if (!validation.isValid) {
      onError(`Erreurs de validation: ${validation.errors.join(', ')}`);
      return;
    }

    if (!scriptConfigured) {
      onError('Veuillez configurer un nouveau script Google Apps Script');
      return;
    }

    setIsLoading(true);

    try {
      setSendingStep('🚀 Génération PDF et envoi via Google Apps Script...');
      
      const success = await GoogleAppsScriptService.sendInvoiceWithPDF(invoice);

      if (success) {
        setSendingStep('✅ Envoi réussi !');
        
        let successMessage = `✅ Facture envoyée avec succès via Google Apps Script ! `;
        successMessage += `PDF avec design identique à l'aperçu livré automatiquement à ${invoice.client.email}`;
        
        if (acompteAmount > 0) {
          successMessage += `\n💰 Acompte: ${formatCurrency(acompteAmount)} | 💳 Reste: ${formatCurrency(montantRestant)}`;
        }
        
        if (invoice.signature) {
          successMessage += `\n🔒 Signature électronique incluse`;
        }
        
        onSuccess(successMessage);
        onClose();
      } else {
        onError('❌ Erreur lors de l\'envoi via Google Apps Script. Vérifiez votre script et réessayez.');
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi Google Apps Script:', error);
      onError('Erreur lors de l\'envoi via Google Apps Script.');
    } finally {
      setIsLoading(false);
      setSendingStep('');
    }
  };

  const handleTestConfiguration = async () => {
    if (!scriptConfigured) {
      onError('Veuillez configurer un nouveau script Google Apps Script');
      return;
    }

    setIsLoading(true);
    setSendingStep('🧪 Test de connexion...');
    
    try {
      const result = await GoogleAppsScriptService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        onSuccess(`✅ Test réussi ! ${result.message} (${result.responseTime}ms)`);
      } else {
        onError(`❌ Test échoué: ${result.message}`);
      }
    } catch (error) {
      onError('Erreur lors du test de connexion');
    } finally {
      setIsLoading(false);
      setSendingStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Google Apps Script - Envoi Automatique" maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* En-tête Google Apps Script */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Google Apps Script</h3>
              <p className="text-purple-100">Envoi automatique via votre script personnalisé</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-1 text-green-200" />
              <div className="text-sm font-semibold">Signature Électronique</div>
              <div className="text-xs text-green-100">Conforme eIDAS</div>
            </div>
            <div className="text-center">
              <Zap className="w-8 h-8 mx-auto mb-1 text-blue-200" />
              <div className="text-sm font-semibold">Script Personnalisé</div>
              <div className="text-xs text-blue-100">Votre configuration</div>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-1 text-purple-200" />
              <div className="text-sm font-semibold">Instantané</div>
              <div className="text-xs text-purple-100">Livraison immédiate</div>
            </div>
          </div>
        </div>

        {/* Informations de la facture */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Facture à envoyer</h4>
            {invoice.signature && (
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>SIGNÉE</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">N° Facture:</span> {invoice.invoiceNumber}
            </div>
            <div>
              <span className="font-medium">Date:</span> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
            </div>
            <div>
              <span className="font-medium">Client:</span> {invoice.client.name}
            </div>
            <div>
              <span className="font-medium">Montant:</span> {formatCurrency(totalAmount)}
            </div>
          </div>
          
          {acompteAmount > 0 && (
            <div className="mt-3 p-2 bg-orange-100 border border-orange-200 rounded">
              <div className="text-sm font-medium text-orange-700">
                💰 Acompte: {formatCurrency(acompteAmount)} • 💳 Reste: {formatCurrency(montantRestant)}
              </div>
            </div>
          )}
          
          {/* Indicateur de pièce jointe PDF */}
          <div className="mt-3 flex items-center space-x-2 p-2 bg-green-100 border border-green-200 rounded">
            <Paperclip className="w-4 h-4 text-green-600" />
            <FileText className="w-4 h-4 text-green-600" />
            {invoice.signature && <Shield className="w-4 h-4 text-green-600" />}
            <span className="text-sm font-medium text-green-700">
              PDF {invoice.signature ? 'signé électroniquement' : 'professionnel'} sera automatiquement attaché
            </span>
          </div>
        </div>

        {/* Configuration Google Apps Script */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {scriptConfigured ? (
                <CheckCircle className="w-5 h-5 text-purple-600" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-600" />
              )}
              <h4 className="font-semibold text-purple-900">
                {scriptConfigured ? "Google Apps Script Configuré" : "Google Apps Script Non Configuré"}
              </h4>
            </div>
            <button
              onClick={() => setShowConfiguration(!showConfiguration)}
              className="text-sm underline text-purple-700 hover:text-purple-900"
            >
              {showConfiguration ? 'Masquer' : 'Voir'} détails
            </button>
          </div>
          
          <p className="text-sm text-purple-700 mb-2">
            {scriptConfigured ? (
              <>✅ Script ID: <code className="bg-purple-100 px-2 py-1 rounded">{scriptInfo.scriptId.substring(0, 20)}...</code></>
            ) : (
              <>⚠️ <code className="bg-red-100 px-2 py-1 rounded">Veuillez configurer un nouveau script</code></>
            )}
          </p>
          
          {showConfiguration && (
            <div className="mt-3 p-3 bg-purple-100 rounded border text-sm">
              <p className="font-medium mb-2 text-purple-900">Configuration Google Apps Script :</p>
              <ul className="space-y-1 text-purple-700">
                <li>• Script ID: {scriptInfo.scriptId}</li>
                <li>• URL: {scriptInfo.scriptUrl}</li>
                <li>• 📎 Attachement PDF: Automatique avec signature</li>
                <li>• 🔒 Sécurité: Conforme eIDAS</li>
                <li>• 🚀 Type: Déploiement web Google Apps Script</li>
              </ul>
              
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={handleTestConfiguration}
                  disabled={isLoading || !scriptConfigured}
                  className="px-3 py-1 bg-purple-600 hover:bg-purple-700 text-white rounded text-sm flex items-center space-x-1 disabled:opacity-50"
                >
                  <TestTube className="w-3 h-3" />
                  <span>Tester</span>
                </button>
                <a 
                  href="https://script.google.com/home" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="underline text-sm flex items-center space-x-1 text-purple-700 hover:text-purple-900"
                >
                  <span>Google Apps Script</span>
                </a>
              </div>
              
              {testResult && (
                <div className={`mt-2 p-2 rounded text-xs ${testResult.success ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {testResult.message}
                  {testResult.responseTime && <span className="ml-2">({testResult.responseTime}ms)</span>}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message script non configuré */}
        {!scriptConfigured && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              <h4 className="font-semibold text-yellow-900">Script Google Apps Script non configuré</h4>
            </div>
            <p className="text-sm text-yellow-700 mb-2">
              Vous devez créer un nouveau script Google Apps Script et mettre à jour l'ID dans le code.
            </p>
            <ol className="list-decimal list-inside text-sm text-yellow-700 space-y-1 ml-2">
              <li>Allez sur <a href="https://script.google.com/home" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">script.google.com/home</a></li>
              <li>Créez un nouveau projet</li>
              <li>Copiez le code du script de test fourni</li>
              <li>Déployez comme "Web app" avec "Execute as: Me" et "Who has access: Anyone"</li>
              <li>Copiez le nouvel ID de script et mettez à jour le code</li>
            </ol>
          </div>
        )}

        {/* Erreurs de validation */}
        {!validation.isValid && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-900">Erreurs de validation</h4>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {validation.errors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Indicateur de progression */}
        {isLoading && sendingStep && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-purple-600" />
              <div>
                <div className="font-semibold text-purple-900">Google Apps Script en action...</div>
                <div className="text-sm text-purple-700">{sendingStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            Annuler
          </button>
          
          <button
            onClick={handleSendViaGoogleScript}
            disabled={isLoading || !validation.isValid || !scriptConfigured}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white px-8 py-3 rounded-lg font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-105 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <Paperclip className="w-4 h-4" />
                {invoice.signature && <Shield className="w-4 h-4" />}
                <span>Envoyer via Google Script</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h5 className="font-semibold text-blue-900 mb-2">🚀 Google Apps Script pour MYCONFORT :</h5>
          <div className="text-blue-700">
            <p className="mb-2">Votre script personnalisé gère automatiquement :</p>
            <ul className="list-disc list-inside space-y-1 ml-2">
              <li>📎 Génération et attachement du PDF avec signature</li>
              <li>📧 Envoi automatique par email</li>
              <li>💰 Gestion des acomptes et montants restants</li>
              <li>🔒 Intégration de la signature électronique</li>
              <li>📋 Formatage professionnel des emails</li>
            </ul>
          </div>
          <p className="mt-2 text-blue-600 font-medium">
            {scriptConfigured 
              ? "✅ Script configuré et prêt pour l'envoi automatique"
              : "⚠️ Veuillez configurer un nouveau script Google Apps Script"
            }
          </p>
        </div>
      </div>
    </Modal>
  );
}