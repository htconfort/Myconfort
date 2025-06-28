import React, { useState } from 'react';
import { Mail, Loader, CheckCircle, AlertCircle, FileText, Shield, Send, Settings, Zap, Download, TestTube, Attachment } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { EmailService } from '../services/emailService';
import { SeparatePdfEmailService } from '../services/separatePdfEmailService';

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
  const [separateLoading, setSeparateLoading] = useState(false);

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

  // 🚀 ENVOI AUTOMATIQUE AVEC PIÈCES JOINTES 2MB (plan premium)
  const sendEmailWithPremiumAttachment = async () => {
    if (!validation.isValid) {
      onError(`Erreurs de validation: ${validation.errors.join(', ')}`);
      return;
    }

    setLoading(true);

    try {
      setStep('🚀 Génération PDF complet pour plan premium (2MB max)...');
      
      const success = await EmailService.sendInvoiceWithPDF(invoice);

      if (success) {
        setStep('✅ Envoi réussi avec pièce jointe premium !');
        
        let successMessage = `✅ Facture envoyée avec succès via EmailJS (Plan Premium) ! `;
        successMessage += `PDF joint automatiquement à ${invoice.client.email}`;
        
        if (acompteAmount > 0) {
          successMessage += `\n💰 Acompte: ${formatCurrency(acompteAmount)} | 💳 Reste: ${formatCurrency(montantRestant)}`;
        }
        
        if (invoice.signature) {
          successMessage += `\n🔒 Signature électronique incluse`;
        }
        
        successMessage += `\n📎 PDF joint comme pièce jointe (jusqu'à 2MB supporté)`;
        
        onSuccess(successMessage);
      } else {
        onError('❌ Erreur lors de l\'envoi via EmailJS. Vérifiez votre configuration et réessayez.');
      }
    } catch (error: any) {
      console.error('❌ Erreur envoi EmailJS avec pièce jointe premium:', error);
      onError(`Erreur lors de l'envoi via EmailJS: ${error.message}`);
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  // 🚀 NOUVELLE MÉTHODE SÉPARÉE : PDF LOCAL + EMAIL SANS PAYLOAD
  const sendWithSeparateMethod = async () => {
    if (!validation.isValid) {
      onError(`Erreurs de validation: ${validation.errors.join(', ')}`);
      return;
    }

    setSeparateLoading(true);

    try {
      setStep('🚀 Création de PDF : PDF local + Email sans payload...');
      
      const result = await SeparatePdfEmailService.generatePDFAndSendEmail(invoice);

      if (result.pdfGenerated && result.emailSent) {
        setStep('✅ Création de PDF terminée avec succès !');
        
        let successMessage = `✅ Création de PDF terminée avec succès !\n\n`;
        successMessage += `📎 PDF généré et téléchargé : facture-myconfort-${invoice.invoiceNumber}.pdf\n`;
        successMessage += `📧 Email de notification envoyé à ${invoice.client.email}\n\n`;
        
        if (acompteAmount > 0) {
          successMessage += `💰 Acompte: ${formatCurrency(acompteAmount)} | 💳 Reste: ${formatCurrency(montantRestant)}\n`;
        }
        
        if (invoice.signature) {
          successMessage += `🔒 Signature électronique incluse\n`;
        }
        
        successMessage += `🎯 Avantages : Pas de limite de taille, PDF complet`;
        
        onSuccess(successMessage);
      } else if (result.pdfGenerated && !result.emailSent) {
        onError(`⚠️ PDF généré mais email non envoyé.\n\n${result.message}`);
      } else if (!result.pdfGenerated && result.emailSent) {
        onError(`⚠️ Email envoyé mais PDF non généré.\n\n${result.message}`);
      } else {
        onError(`❌ Échec de la création de PDF.\n\n${result.message}`);
      }
    } catch (error: any) {
      console.error('❌ Erreur création de PDF:', error);
      onError(`Erreur lors de la création de PDF: ${error.message}`);
    } finally {
      setSeparateLoading(false);
      setStep('');
    }
  };

  // 🧪 TEST DE LA CRÉATION DE PDF
  const testSeparateMethod = async () => {
    if (!validation.isValid) {
      onError(`Erreurs de validation: ${validation.errors.join(', ')}`);
      return;
    }

    try {
      await SeparatePdfEmailService.testSeparateMethod(invoice);
    } catch (error) {
      console.error('❌ Erreur test création de PDF:', error);
      onError('Erreur lors du test de la création de PDF');
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
              <h3 className="text-xl font-bold text-black">Service d'emails professionnel</h3>
              <p className="text-black font-semibold">📎 Plan Premium • 🚀 Pièces jointes 2MB • 📧 Template personnalisé</p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-black mb-1 font-bold">Statut</div>
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

        {/* Configuration EmailJS avec support 2MB */}
        <div className="bg-white rounded-lg p-4 mb-4 border-2 border-[#477A0C]">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Attachment className="w-5 h-5 text-[#477A0C]" />
              <h4 className="font-bold text-black">Configuration EmailJS Plan Premium (2MB)</h4>
            </div>
            <button
              onClick={onShowConfig}
              className="px-3 py-1 bg-[#477A0C] hover:bg-[#3A6A0A] text-[#F2EFE2] rounded text-sm flex items-center space-x-1 font-semibold transition-all"
            >
              <Settings className="w-3 h-3" />
              <span>Configurer</span>
            </button>
          </div>
          
          <div className="text-sm text-black">
            <div className="flex items-center space-x-2">
              {emailConfig.configured ? (
                <CheckCircle className="w-4 h-4 text-green-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-red-600" />
              )}
              <span className="font-bold">{emailConfig.status}</span>
            </div>
            {emailConfig.configured && (
              <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
                <div className="flex items-center space-x-1">
                  <Attachment className="w-3 h-3" />
                  <span className="font-bold">Plan Premium activé :</span>
                </div>
                <ul className="mt-1 ml-4 list-disc text-xs">
                  <li>Pièces jointes jusqu'à 2MB supportées</li>
                  <li>PDF complet sans compression agressive</li>
                  <li>Qualité maximale préservée</li>
                  <li>Fallback automatique si nécessaire</li>
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* NOUVELLE SECTION : CRÉATION DE PDF */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-lg p-4 mb-4 border-2 border-purple-300">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <Download className="w-5 h-5 text-purple-600" />
              <h4 className="font-bold text-purple-800">🚀 **CRÉATION DE PDF** (Alternative)</h4>
            </div>
            <button
              onClick={testSeparateMethod}
              disabled={!validation.isValid}
              className="px-3 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-400 text-white rounded text-sm flex items-center space-x-1 font-semibold transition-all"
            >
              <TestTube className="w-3 h-3" />
              <span>Test</span>
            </button>
          </div>
          
          <div className="text-sm text-purple-800">
            <div className="flex items-center space-x-2 mb-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="font-bold">Création de PDF : PDF local + Email sans payload</span>
            </div>
            <div className="p-2 bg-purple-100 border border-purple-200 rounded text-xs text-purple-700">
              <div className="flex items-center space-x-1 mb-1">
                <Download className="w-3 h-3" />
                <span className="font-bold">Avantages de la création de PDF :</span>
              </div>
              <ul className="ml-4 list-disc text-xs">
                <li>✅ Pas de limite de taille de fichier</li>
                <li>✅ PDF complet avec votre script exact</li>
                <li>✅ Email de notification envoyé séparément</li>
                <li>✅ Évite les erreurs de payload EmailJS</li>
                <li>✅ Utilise votre script html2pdf.js exact</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Informations de la facture avec acompte */}
        <div className="bg-white rounded-lg p-4 mb-4 border-2 border-[#477A0C]">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
            <div>
              <div className="text-black font-bold">Client</div>
              <div className="font-bold text-[#477A0C]">{invoice.client.name || 'Non renseigné'}</div>
            </div>
            <div>
              <div className="text-black font-bold">Email</div>
              <div className="font-bold text-[#477A0C]">{invoice.client.email || 'Non renseigné'}</div>
            </div>
            <div>
              <div className="text-black font-bold">Total TTC</div>
              <div className="font-bold text-[#477A0C]">{formatCurrency(totalTTC)}</div>
            </div>
            <div>
              <div className="text-orange-700 font-bold">Acompte</div>
              <div className="font-bold text-orange-600">
                {acompteAmount > 0 ? formatCurrency(acompteAmount) : 'Aucun'}
              </div>
            </div>
            <div>
              <div className="text-red-700 font-bold">Reste à payer</div>
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
                <div className="font-bold text-orange-800">Mode Acompte Activé</div>
                <div className="text-orange-700 font-semibold">
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
                <div className="font-bold text-red-800">EmailJS n'est pas configuré</div>
                <p className="text-xs mt-1 text-red-700 font-semibold">
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
                <div className="font-bold text-red-800">Erreurs de validation :</div>
                <ul className="list-disc list-inside mt-1 text-xs text-red-700 font-semibold">
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
        {(loading || separateLoading) && step && (
          <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <div className="font-bold text-blue-800">
                  {separateLoading ? 'Création de PDF en cours...' : 'EmailJS Plan Premium en action...'}
                </div>
                <div className="text-sm text-blue-700 font-semibold">{step}</div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col space-y-3">
          {/* Bouton plan premium (recommandé) */}
          <button
            onClick={sendEmailWithPremiumAttachment}
            disabled={loading || !validation.isValid}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 disabled:text-gray-600 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span>Envoi en cours...</span>
              </>
            ) : (
              <>
                <Attachment className="w-6 h-6" />
                <FileText className="w-6 h-6" />
                <Mail className="w-5 h-5" />
                {invoice.signature && <Shield className="w-5 h-5" />}
                <span>📎 Envoyer via EmailJS (Plan Premium 2MB)</span>
              </>
            )}
          </button>

          {/* Bouton création de PDF (alternative) */}
          <button
            onClick={sendWithSeparateMethod}
            disabled={separateLoading || !validation.isValid}
            className="bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 disabled:bg-gray-400 disabled:text-gray-600 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {separateLoading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span>Création en cours...</span>
              </>
            ) : (
              <>
                <Download className="w-6 h-6" />
                <Mail className="w-5 h-5" />
                {invoice.signature && <Shield className="w-5 h-5" />}
                <span>🚀 **CRÉATION DE PDF** (Alternative)</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-black">
          <p className="font-bold">
            {validation.isValid 
              ? `✅ Prêt pour l'envoi à ${invoice.client.email}`
              : '⚠️ Complétez les informations ci-dessus pour activer l\'envoi'
            }
          </p>
          {acompteAmount > 0 && (
            <p className="mt-1 text-xs text-orange-700 font-bold">
              💰 Acompte: {formatCurrency(acompteAmount)} | 💳 Reste: {formatCurrency(montantRestant)}
            </p>
          )}
          <div className="mt-2 text-xs space-y-1">
            <p className="text-green-700 font-bold">
              📎 **PLAN PREMIUM** : Pièces jointes jusqu'à 2MB (Recommandé)
            </p>
            <p className="text-purple-700 font-bold">
              🚀 **CRÉATION DE PDF** : PDF local complet + Email de notification (Alternative)
            </p>
          </div>
        </div>
      </div>
    </>
  );
};