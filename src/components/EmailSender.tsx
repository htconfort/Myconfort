import React, { useState } from 'react';
import { Mail, Loader, CheckCircle, AlertCircle, FileText, Shield, Download, TestTube } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

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

  // Validation des données
  const validation = {
    isValid: invoice.client.email && invoice.client.name && invoice.products.length > 0,
    errors: []
  };

  // Fonction pour générer le PDF
  const handleGeneratePDF = () => {
    if (!validation.isValid) {
      onError(`Veuillez compléter les informations client et ajouter au moins un produit`);
      return;
    }

    setLoading(true);
    setStep('📄 Génération du PDF...');

    try {
      // Appel à la fonction globale définie dans index.html
      if (typeof window.generateInvoicePDF === 'function') {
        window.generateInvoicePDF();
        
        setStep('✅ PDF généré avec succès !');
        
        let successMessage = `✅ PDF généré avec succès ! `;
        successMessage += `Le fichier a été téléchargé sur votre appareil.`;
        
        if (acompteAmount > 0) {
          successMessage += `\n💰 Acompte: ${formatCurrency(acompteAmount)} | 💳 Reste: ${formatCurrency(montantRestant)}`;
        }
        
        if (invoice.signature) {
          successMessage += `\n🔒 Signature électronique incluse`;
        }
        
        onSuccess(successMessage);
      } else {
        throw new Error("La fonction de génération PDF n'est pas disponible");
      }
    } catch (error: any) {
      console.error('❌ Erreur génération PDF:', error);
      onError(`Erreur lors de la génération du PDF: ${error.message}`);
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
          GÉNÉRATION DE PDF
        </span>
      </h2>
      
      <div className="bg-[#F2EFE2] rounded-lg p-6">
        {/* Statut de la facture */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-[#477A0C] p-3 rounded-full">
              <FileText className="w-8 h-8 text-[#F2EFE2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Génération de PDF professionnels</h3>
              <p className="text-black font-semibold">📎 PDF haute qualité • 🚀 Téléchargement direct • 📄 Format A4</p>
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

        {/* Validation et erreurs */}
        {!validation.isValid && (
          <div className="bg-red-100 border-2 border-red-400 rounded-lg p-3 mb-4">
            <div className="flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <div className="text-sm">
                <div className="font-bold text-red-800">Erreurs de validation :</div>
                <ul className="list-disc list-inside mt-1 text-xs text-red-700 font-semibold">
                  {!invoice.client.name && <li>Nom du client requis</li>}
                  {!invoice.client.email && <li>Email du client requis</li>}
                  {invoice.products.length === 0 && <li>Au moins un produit requis</li>}
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
                <div className="font-bold text-blue-800">
                  Génération de PDF en cours...
                </div>
                <div className="text-sm text-blue-700 font-semibold">{step}</div>
              </div>
            </div>
          </div>
        )}

        {/* Boutons d'action */}
        <div className="flex flex-col space-y-3">
          {/* Bouton génération PDF */}
          <button
            onClick={handleGeneratePDF}
            disabled={loading || !validation.isValid}
            className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:bg-gray-400 disabled:text-gray-600 text-white px-8 py-3 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
          >
            {loading ? (
              <>
                <Loader className="w-6 h-6 animate-spin" />
                <span>Génération en cours...</span>
              </>
            ) : (
              <>
                <Download className="w-6 h-6" />
                <FileText className="w-6 h-6" />
                {invoice.signature && <Shield className="w-5 h-5" />}
                <span>Générer et télécharger le PDF</span>
              </>
            )}
          </button>
        </div>

        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-black">
          <p className="font-bold">
            {validation.isValid 
              ? `✅ Prêt pour la génération du PDF`
              : '⚠️ Complétez les informations ci-dessus pour activer la génération'
            }
          </p>
          {acompteAmount > 0 && (
            <p className="mt-1 text-xs text-orange-700 font-bold">
              💰 Acompte: {formatCurrency(acompteAmount)} | 💳 Reste: {formatCurrency(montantRestant)}
            </p>
          )}
          <div className="mt-2 text-xs space-y-1">
            <p className="text-green-700 font-bold">
              📎 Le PDF généré sera téléchargé directement sur votre appareil
            </p>
            <p className="text-purple-700 font-bold">
              🚀 Utilisez le bouton "Partager Aperçu" dans la prévisualisation pour envoyer par email
            </p>
          </div>
        </div>
      </div>
    </>
  );
};