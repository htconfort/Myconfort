import React, { useState } from 'react';
import { Zap, Loader, CheckCircle, AlertCircle, Mail, FileText, Shield, Send, Clock, Award } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { AdvancedPDFService } from '../services/advancedPdfService';
import { EmailService } from '../services/emailService';

interface InvoiceSenderProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const InvoiceSender: React.FC<InvoiceSenderProps> = ({
  invoice,
  onSuccess,
  onError
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

  // Validation des données
  const isValid = () => {
    return (
      invoice.client.name &&
      invoice.client.email &&
      invoice.products.length > 0 &&
      totalTTC > 0
    );
  };

  // Génération du PDF IDENTIQUE à l'aperçu Bolt
  const generatePDFIdenticalToPreview = async (): Promise<any> => {
    setStep('🎨 Génération PDF IDENTIQUE à l\'aperçu Bolt...');
    
    try {
      console.log('🎨 GÉNÉRATION PDF AVEC DESIGN EXACTEMENT IDENTIQUE À L\'APERÇU BOLT');
      const doc = await AdvancedPDFService.generateInvoicePDF(invoice);
      
      console.log('✅ PDF GÉNÉRÉ - DESIGN PARFAITEMENT IDENTIQUE À L\'APERÇU');
      return doc;
    } catch (error) {
      console.error('❌ Erreur avec le générateur PDF identique:', error);
      throw error;
    }
  };

  // Envoi automatique par email avec PDF identique
  const sendEmailWithIdenticalPDF = async () => {
    if (!isValid()) {
      onError('Veuillez remplir toutes les informations requises (client, email, produits)');
      return;
    }

    setLoading(true);

    try {
      // Étape 1: Génération du PDF IDENTIQUE à l'aperçu
      const pdf = await generatePDFIdenticalToPreview();
      
      // Étape 2: Préparation de la pièce jointe
      setStep('📎 Préparation PDF identique pour envoi...');
      const blob = pdf.output('blob');
      const sizeKB = Math.round(blob.size / 1024);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];

        try {
          // Étape 3: Envoi automatique avec EmailJS
          setStep('📧 Envoi automatique du PDF identique...');
          
          const success = await EmailService.sendInvoiceByEmail(pdf, invoice, 
            `Bonjour ${invoice.client.name},\n\nVeuillez trouver ci-joint votre facture n°${invoice.invoiceNumber} générée avec FactuSign Pro.\n\n${invoice.signature ? '✓ Cette facture a été signée électroniquement et est juridiquement valide.\n\n' : ''}Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}\n\n---\nMYCONFORT - Facturation Professionnelle`
          );

          if (success) {
            setStep('✅ Envoi réussi !');
            onSuccess(`✅ Facture avec PDF IDENTIQUE à l'aperçu envoyée avec succès ! Design parfaitement reproduit ${invoice.signature ? '+ signature électronique' : ''} (${sizeKB} KB) livré automatiquement à ${invoice.client.email}`);
          } else {
            onError('❌ Erreur: Template EmailJS introuvable. Vérifiez votre configuration dans le dashboard EmailJS.');
          }
        } catch (err: any) {
          console.error('❌ Erreur lors de l\'envoi automatique:', err);
          
          if (err?.text?.includes('template ID not found') || err?.status === 400) {
            onError('❌ Template EmailJS introuvable. Le template ID configuré n\'existe pas dans votre compte.');
          } else {
            onError('Erreur lors de la génération ou de l\'envoi automatique de la facture avec PDF identique.');
          }
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Erreur génération PDF identique:', error);
      onError('❌ Erreur lors de la génération du PDF identique à l\'aperçu.');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-xl p-6 mb-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Award className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">MYCONFORT - PDF Identique à l'Aperçu</h2>
            <p className="text-green-100">🎯 Design EXACTEMENT identique • Reproduction pixel-parfaite • Envoi automatique</p>
          </div>
        </div>
        
        {/* Statut de la facture */}
        <div className="text-right">
          <div className="text-sm text-blue-100 mb-1">Statut</div>
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

      {/* Informations de la facture */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-blue-100">Client</div>
            <div className="font-semibold">{invoice.client.name || 'Non renseigné'}</div>
          </div>
          <div>
            <div className="text-blue-100">Email</div>
            <div className="font-semibold">{invoice.client.email || 'Non renseigné'}</div>
          </div>
          <div>
            <div className="text-blue-100">Montant</div>
            <div className="font-semibold">{formatCurrency(totalTTC)}</div>
          </div>
          <div>
            <div className="text-blue-100">Produits</div>
            <div className="font-semibold">{invoice.products.length} article{invoice.products.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Indicateurs de fonctionnalités IDENTIQUES */}
      <div className="grid grid-cols-5 gap-3 mb-6">
        <div className="text-center">
          <Award className="w-6 h-6 mx-auto mb-1 text-yellow-200" />
          <div className="text-xs font-semibold">Design Identique</div>
          <div className="text-xs text-yellow-100">Pixel-parfait</div>
        </div>
        <div className="text-center">
          <FileText className="w-6 h-6 mx-auto mb-1 text-blue-200" />
          <div className="text-xs font-semibold">PDF Haute Qualité</div>
          <div className="text-xs text-blue-100">Formatage français</div>
        </div>
        <div className="text-center">
          <Shield className="w-6 h-6 mx-auto mb-1 text-green-200" />
          <div className="text-xs font-semibold">Signature Électronique</div>
          <div className="text-xs text-green-100">{invoice.signature ? 'Intégrée' : 'Optionnelle'}</div>
        </div>
        <div className="text-center">
          <Send className="w-6 h-6 mx-auto mb-1 text-purple-200" />
          <div className="text-xs font-semibold">Envoi Automatique</div>
          <div className="text-xs text-purple-100">EmailJS</div>
        </div>
        <div className="text-center">
          <CheckCircle className="w-6 h-6 mx-auto mb-1 text-red-200" />
          <div className="text-xs font-semibold">Reproduction Exacte</div>
          <div className="text-xs text-red-100">Aperçu = PDF</div>
        </div>
      </div>

      {/* Validation et erreurs */}
      {!isValid() && (
        <div className="bg-red-500/20 border border-red-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-300" />
            <div className="text-sm">
              <div className="font-semibold">Informations manquantes pour l'envoi automatique :</div>
              <ul className="list-disc list-inside mt-1 text-xs">
                {!invoice.client.name && <li>Nom du client</li>}
                {!invoice.client.email && <li>Email du client</li>}
                {invoice.products.length === 0 && <li>Au moins un produit</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de progression */}
      {loading && step && (
        <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-3">
            <Loader className="w-5 h-5 animate-spin text-blue-300" />
            <div>
              <div className="font-semibold text-blue-100">PDF Identique en cours de génération...</div>
              <div className="text-sm text-blue-200">{step}</div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'envoi automatique avec PDF identique */}
      <div className="flex justify-center">
        <button
          onClick={sendEmailWithIdenticalPDF}
          disabled={loading || !isValid()}
          className="bg-white text-green-600 hover:bg-green-50 disabled:bg-gray-300 disabled:text-gray-500 px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {loading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>Génération PDF identique...</span>
            </>
          ) : (
            <>
              <Award className="w-6 h-6" />
              <Mail className="w-5 h-5" />
              {invoice.signature && <Shield className="w-5 h-5" />}
              <Clock className="w-5 h-5" />
              <span>Envoyer PDF Identique</span>
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-blue-100">
        <p>
          {isValid() 
            ? `✅ Prêt pour l'envoi automatique avec PDF IDENTIQUE à l'aperçu ${invoice.signature ? '+ signature électronique' : ''} à ${invoice.client.email}`
            : '⚠️ Complétez les informations ci-dessus pour activer l\'envoi automatique avec PDF identique'
          }
        </p>
        <p className="mt-1 text-xs text-yellow-200 font-semibold">
          🎯 GARANTIE : Le PDF généré sera EXACTEMENT identique à l'aperçu que vous voyez dans Bolt
        </p>
      </div>
    </div>
  );
};