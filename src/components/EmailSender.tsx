import React, { useState } from 'react';
import { Mail, Loader, CheckCircle, AlertCircle, FileText, Shield, Send, Settings, Zap } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { EmailService } from '../services/emailService';

interface EmailSenderProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onShowConfig: () => void;
}

export const EmailSender: React.FC<EmailSenderProps> = ({
  invoice,
  onSuccess,
  onError,
  onShowConfig
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>('');

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

  // Vérifier la configuration EmailJS
  const emailConfig = EmailService.getConfigInfo();
  
  // Validation des données
  const validation = EmailService.validateEmailData(invoice);

  // Envoi automatique par EmailJS
  const sendEmailWithPDF = async () => {
    if (!validation.isValid) {
      onError(`Erreurs de validation: ${validation.errors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      // Étape 1: Génération et envoi
      setStep('🚀 Génération PDF et envoi via EmailJS...');
      
      const success = await EmailService.sendInvoiceWithPDF(invoice);

      if (success) {
        setStep('✅ Envoi réussi !');
        
        let successMessage = `✅ Facture envoyée avec succès via EmailJS ! `;
        successMessage += `PDF avec design identique à l'aperçu livré automatiquement à ${invoice.client.email}`;
        
        if (acompteAmount > 0) {
          successMessage += `\n💰 Acompte: ${formatCurrency(acompteAmount)} | 💳 Reste: ${formatCurrency(montantRestant)}`;
        }
        
        if (invoice.signature) {
          successMessage += `\n🔒 Signature électronique incluse`;
        }
        
        onSuccess(successMessage);
      } else {
        onError('❌ Erreur lors de l\'envoi via EmailJS. Vérifiez votre configuration et réessayez.');
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi EmailJS:', error);
      onError(`Erreur lors de l'envoi via EmailJS: ${error.message}`);
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  // Test de connexion
  const handleTestConnection = async () => {
    setLoading(true);
    setStep('🧪 Test de connexion EmailJS...');
    
    try {
      const result = await EmailService.testConnection();
      
      if (result.success) {
        onSuccess(`✅ Test réussi ! ${result.message}`);
      } else {
        onError(`❌ Test échoué: ${result.message}`);
      }
    } catch (error: any) {
      onError(`Erreur lors du test de connexion: ${error.message}`);
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <>
      <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
        <Mail className="mr-3 text-xl" />
        <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
          EMAILJS - ENVOI AUTOMATIQUE
        </span>
      </h2>
      
      <div className="bg-[#F2EFE2] rounded-lg p-6">
        {/* Statut de la facture */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-[#477A0C] p-3 rounded-full">
              <Mail className="w-8 h-8 text-[#F2EFE2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-[#14281D]">Service d'emails professionnel</h3>
              <p className="text-[#14281D]">🚀 Envoi direct • 📧 PDF identique • 📎 Template personnalisé</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-[#14281D] mb-1 font-semibold">Statut</div>
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

        {/* Configuration EmailJS */}
        <div className="bg-white rounded-lg p-4 mb-4 border-2 border-[#477A0C]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Settings className="w-5 h-5 text-[#477A0C]" />
              <h4 className="font-semibold text-[#14281D]">Configuration EmailJS</h4>
            </div>
            <button
              onClick={onShowConfig}
              className="px-3 py-1 bg-[#477A0C] hover:bg-[#3A6A0A] text-[#F2EFE2] rounded text-sm flex items-center space-x-1 font-semibold transition-all"
            >
              <Settings className="w-3 h-3" />
              <span>Configurer</span>
            </button>
          </div>
          
          <div className="text-sm text-[#14281D]">
            <div className="flex items-center space-x-2">
              {emailConfig.configured ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="font-semibold">{emailConfig.status}</span>
            </div>
          </div>
        </div>

        {/* Informations de la facture avec acompte */}
        <div className="bg-white rounded-lg p-4 mb-4 border-2 border-[#477A0C]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-[#14281D] font-semibold">Client</div>
              <div className="font-bold text-[#477A0C]">{invoice.client.name || 'Non renseigné'}</div>
            </div>
            <div>
              <div className="text-[#14281D] font-semibold">Email</div>
              <div className="font-bold text-[#477A0C]">{invoice.client.email || 'Non renseigné'}</div>
            </div>
            <div>
              <div className="text-[#14281D] font-semibold">Total TTC</div>
              <div className="font-bold text-[#477A0C]">{formatCurrency(totalTTC)}</div>
            </div>
            <div>
              <div className="text-orange-700 font-semibold">Acompte</div>
              <div className="font-bold text-orange-600">
                {acompteAmount > 0 ? formatCurrency(acompteAmount) : 'Aucun'}
              </div>
            </div>
            <div>
              <div className="text-red-700 font-semibold">Reste à payer</div>
              <div className="font-bold text-red-600">
                {acompteAmount > 0 ? formatCurrency(montantRestant) : formatCurrency(totalTTC)}
              </div>
            </div>
          </div>
        </div>

        {/* Affichage spécial pour acompte */}
        {acompteAmount > 0 && (
          <div className="bg-orange-100 border-2 border-orange-400 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <div className="text-sm">
                <div className="font-semibold text-orange-800">Mode Acompte Activé</div>
                <div className="text-orange-700">
                  Acompte: {formatCurrency(acompteAmount)} • Reste: {formatCurrency(montantRestant)}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Message EmailJS non configuré */}
        {!emailConfig.configured && (
          <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="text-sm">
                <div className="font-semibold text-red-800">EmailJS n'est pas configuré</div>
                <p className="text-xs mt-1 text-red-700">
                  Cliquez sur le bouton "Configurer" pour paramétrer vos identifiants EmailJS.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Validation et erreurs */}
        {!validation.isValid && validation.errors.filter(e => e !== 'EmailJS n\'est pas configuré').length > 0 && (
          <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="text-sm">
                <div className="font-semibold text-red-800">Erreurs de validation :</div>
                <ul className="list-disc list-inside mt-1 text-xs text-red-700">
                  {validation.errors
                    .filter(e => e !== 'EmailJS n\'est pas configuré')
                    .map((error, index) => (
                      <li key={index}>{error}</li>
                    ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Indicateur de progression */}
        {loading && step && (
          <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <div className="font-semibold text-blue-800">EmailJS en action...</div>
                <div className="text-sm text-blue-700">{step}</div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-center space-x-3">
          <button
            onClick={handleTestConnection}
            disabled={loading || !emailConfig.configured}
            className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {loading && step.includes('Test') ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>Test en cours...</span>
              </>
            ) : (
              <>
                <Zap className="w-5 h-5" />
                <span>Tester EmailJS</span>
              </>
            )}
          </button>

          <button
            onClick={sendEmailWithPDF}
            disabled={loading || !validation.isValid}
            className="bg-[#477A0C] hover:bg-[#3A6A0A] disabled:bg-gray-400 disabled:text-gray-600 text-[#F2EFE2] px-8 py-3 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {loading && !step.includes('Test') ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <FileText className="w-6 h-6" />
                <Mail className="w-5 h-5" />
                {invoice.signature && <Shield className="w-5 h-5" />}
                <span>Envoyer via EmailJS</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-[#14281D]">
          <p className="font-semibold">
            {validation.isValid 
              ? `✅ Prêt pour l'envoi via EmailJS à ${invoice.client.email}`
              : '⚠️ Complétez les informations ci-dessus pour activer l\'envoi'
            }
          </p>
          {acompteAmount > 0 && (
            <p className="mt-1 text-xs text-orange-700 font-semibold">
              💰 Acompte: {formatCurrency(acompteAmount)} | 💳 Reste: {formatCurrency(montantRestant)}
            </p>
          )}
          <p className="mt-1 text-xs text-blue-700 font-semibold">
            🚀 Utilise EmailJS pour l'envoi direct d'emails avec pièces jointes
          </p>
        </div>
      </div>
    </>
  );
};