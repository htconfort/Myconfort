import React, { useState } from 'react';
import { Zap, Loader, CheckCircle, AlertCircle, Mail, FileText, Shield, Send, Clock, Award, Calculator, TestTube, ExternalLink, Settings } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { GoogleAppsScriptService } from '../services/googleAppsScriptService';

interface GoogleAppsScriptSenderProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const GoogleAppsScriptSender: React.FC<GoogleAppsScriptSenderProps> = ({
  invoice,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>('');
  const [showConfig, setShowConfig] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // Calculer le total de la facture
  const totalTTC = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

  // Calculer l'acompte et le montant restant
  const acompteAmount = invoice.payment.depositAmount || 0;
  const montantRestant = totalTTC - acompteAmount;

  // Validation des données
  const validation = GoogleAppsScriptService.validateEmailData(invoice);
  const scriptInfo = GoogleAppsScriptService.getScriptInfo();

  // Envoi automatique par Google Apps Script
  const sendEmailViaGoogleScript = async () => {
    if (!validation.isValid) {
      onError(`Erreurs de validation: ${validation.errors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      // Étape 1: Génération et envoi
      setStep('🚀 Génération PDF et envoi via Google Apps Script...');
      
      const success = await GoogleAppsScriptService.sendInvoiceWithPDF(invoice);

      if (success) {
        setStep('✅ Envoi réussi !');
        
        let successMessage = `✅ Facture envoyée avec succès via Google Apps Script ! `;
        successMessage += `PDF avec design identique à l'aperçu livré automatiquement à ${invoice.client.email}`;
        
        if (acompteAmount > 0) {
          successMessage += `\n💰 Acompte: ${formatCurrency(acompteAmount)} | 💳 Reste: ${formatCurrency(montantRestant)}`;
        }
        
        if (invoice.signature) {
          successMessage += `\n🔒 Signature électronique incluse`;
        }
        
        onSuccess(successMessage);
      } else {
        onError('❌ Erreur lors de l\'envoi via Google Apps Script. Vérifiez votre script et réessayez.');
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi Google Apps Script:', error);
      onError('Erreur lors de l\'envoi via Google Apps Script.');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  // Test de connexion
  const handleTestConnection = async () => {
    setLoading(true);
    setStep('🧪 Test de connexion...');
    
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
      setLoading(false);
      setStep('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-xl p-6 mb-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Google Apps Script - Envoi Automatique</h2>
            <p className="text-purple-100">🚀 Votre script personnalisé • 📧 Envoi direct • 📎 PDF identique</p>
          </div>
        </div>
        
        {/* Statut de la facture */}
        <div className="text-right">
          <div className="text-sm text-purple-100 mb-1">Statut</div>
          {invoice.signature ? (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>SIGNÉE</span>
            </div>
          ) : (
            <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              PRÊTE À SIGNER
            </div>
          )}
        </div>
      </div>

      {/* Configuration Google Apps Script */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Settings className="w-5 h-5 text-purple-200" />
            <h4 className="font-semibold text-purple-100">Configuration Google Apps Script</h4>
          </div>
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="text-sm underline text-purple-200 hover:text-white"
          >
            {showConfig ? 'Masquer' : 'Voir'} détails
          </button>
        </div>
        
        <div className="text-sm text-purple-200">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-4 h-4 text-green-300" />
            <span>Script ID: {scriptInfo.scriptId.substring(0, 20)}...</span>
          </div>
          <div className="flex items-center space-x-2 mt-1">
            <CheckCircle className="w-4 h-4 text-green-300" />
            <span>{scriptInfo.status}</span>
          </div>
        </div>
        
        {showConfig && (
          <div className="mt-3 p-3 bg-white/10 rounded border text-xs">
            <div className="font-semibold text-purple-100 mb-2">Détails de configuration :</div>
            <div className="space-y-1 text-purple-200">
              <div>• Script ID: <code className="bg-black/20 px-1 rounded">{scriptInfo.scriptId}</code></div>
              <div>• URL: <code className="bg-black/20 px-1 rounded">{scriptInfo.scriptUrl}</code></div>
              <div>• Type: Déploiement web Google Apps Script</div>
              <div>• Fonctionnalités: Envoi email + PDF en pièce jointe</div>
              <div>• Format: PDF identique à l'aperçu Bolt</div>
            </div>
            
            <div className="mt-3 flex items-center space-x-2">
              <button
                onClick={handleTestConnection}
                disabled={loading}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded text-sm flex items-center space-x-1"
              >
                <TestTube className="w-3 h-3" />
                <span>Tester</span>
              </button>
              <a 
                href="https://script.google.com/home" 
                target="_blank" 
                rel="noopener noreferrer"
                className="underline text-sm flex items-center space-x-1 text-purple-200 hover:text-white"
              >
                <ExternalLink className="w-3 h-3" />
                <span>Google Apps Script</span>
              </a>
            </div>
            
            {testResult && (
              <div className={`mt-2 p-2 rounded text-xs ${testResult.success ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
                {testResult.message}
                {testResult.responseTime && <span className="ml-2">({testResult.responseTime}ms)</span>}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Informations de la facture avec acompte */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
          <div>
            <div className="text-purple-100">Client</div>
            <div className="font-semibold">{invoice.client.name || 'Non renseigné'}</div>
          </div>
          <div>
            <div className="text-purple-100">Email</div>
            <div className="font-semibold">{invoice.client.email || 'Non renseigné'}</div>
          </div>
          <div>
            <div className="text-purple-100">Total TTC</div>
            <div className="font-semibold">{formatCurrency(totalTTC)}</div>
          </div>
          <div>
            <div className="text-orange-100">Acompte</div>
            <div className="font-semibold text-orange-200">
              {acompteAmount > 0 ? formatCurrency(acompteAmount) : 'Aucun'}
            </div>
          </div>
          <div>
            <div className="text-yellow-100">Reste à payer</div>
            <div className="font-semibold text-yellow-200">
              {acompteAmount > 0 ? formatCurrency(montantRestant) : formatCurrency(totalTTC)}
            </div>
          </div>
        </div>
      </div>

      {/* Indicateurs de fonctionnalités */}
      <div className="grid grid-cols-6 gap-2 mb-6">
        <div className="text-center">
          <Zap className="w-5 h-5 mx-auto mb-1 text-yellow-200" />
          <div className="text-xs font-semibold">Google Script</div>
          <div className="text-xs text-yellow-100">Personnalisé</div>
        </div>
        <div className="text-center">
          <Calculator className="w-5 h-5 mx-auto mb-1 text-orange-200" />
          <div className="text-xs font-semibold">Gestion Acompte</div>
          <div className="text-xs text-orange-100">Automatique</div>
        </div>
        <div className="text-center">
          <FileText className="w-5 h-5 mx-auto mb-1 text-blue-200" />
          <div className="text-xs font-semibold">PDF Identique</div>
          <div className="text-xs text-blue-100">Aperçu = PDF</div>
        </div>
        <div className="text-center">
          <Shield className="w-5 h-5 mx-auto mb-1 text-green-200" />
          <div className="text-xs font-semibold">Signature</div>
          <div className="text-xs text-green-100">{invoice.signature ? 'Intégrée' : 'Optionnelle'}</div>
        </div>
        <div className="text-center">
          <Send className="w-5 h-5 mx-auto mb-1 text-purple-200" />
          <div className="text-xs font-semibold">Envoi Direct</div>
          <div className="text-xs text-purple-100">Votre script</div>
        </div>
        <div className="text-center">
          <Clock className="w-5 h-5 mx-auto mb-1 text-red-200" />
          <div className="text-xs font-semibold">Instantané</div>
          <div className="text-xs text-red-100">Temps réel</div>
        </div>
      </div>

      {/* Affichage spécial pour acompte */}
      {acompteAmount > 0 && (
        <div className="bg-orange-500/20 border border-orange-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <Calculator className="w-5 h-5 text-orange-300" />
            <div className="text-sm">
              <div className="font-semibold text-orange-100">Mode Acompte Activé</div>
              <div className="text-orange-200">
                Acompte: {formatCurrency(acompteAmount)} • Reste: {formatCurrency(montantRestant)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Validation et erreurs */}
      {!validation.isValid && (
        <div className="bg-red-500/20 border border-red-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-300" />
            <div className="text-sm">
              <div className="font-semibold">Erreurs de validation :</div>
              <ul className="list-disc list-inside mt-1 text-xs">
                {validation.errors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de progression */}
      {loading && step && (
        <div className="bg-purple-500/20 border border-purple-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-3">
            <Loader className="w-5 h-5 animate-spin text-purple-300" />
            <div>
              <div className="font-semibold text-purple-100">Google Apps Script en action...</div>
              <div className="text-sm text-purple-200">{step}</div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'envoi */}
      <div className="flex justify-center">
        <button
          onClick={sendEmailViaGoogleScript}
          disabled={loading || !validation.isValid}
          className="bg-white text-purple-600 hover:bg-purple-50 disabled:bg-gray-300 disabled:text-gray-500 px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {loading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6" />
              <Calculator className="w-5 h-5" />
              <Mail className="w-5 h-5" />
              {invoice.signature && <Shield className="w-5 h-5" />}
              <span>Envoyer via Google Script</span>
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-purple-100">
        <p>
          {validation.isValid 
            ? `✅ Prêt pour l'envoi via votre Google Apps Script à ${invoice.client.email}`
            : '⚠️ Complétez les informations ci-dessus pour activer l\'envoi'
          }
        </p>
        {acompteAmount > 0 && (
          <p className="mt-1 text-xs text-orange-200 font-semibold">
            💰 Acompte: {formatCurrency(acompteAmount)} | 💳 Reste: {formatCurrency(montantRestant)}
          </p>
        )}
        <p className="mt-1 text-xs text-yellow-200 font-semibold">
          🚀 Utilise votre script Google Apps Script personnalisé : {scriptInfo.scriptId.substring(0, 20)}...
        </p>
      </div>
    </div>
  );
};