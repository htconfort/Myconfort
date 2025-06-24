import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Loader, FileText, Send, CheckCircle, AlertCircle, TestTube, ExternalLink } from 'lucide-react';
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
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // VOTRE NOUVELLE URL GOOGLE APPS SCRIPT
  const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwIj1kxUxR98Zp1zgWLAT3vazv8j3-0OpQyI29NHYn0ENpMVVIwqqaFi_A29XW_Ot4-/exec";

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 TEST DE CONNEXION GOOGLE APPS SCRIPT');
      
      const testData = {
        requestType: 'test',
        message: 'Test de connexion depuis MYCONFORT Simple Exporter',
        timestamp: new Date().toISOString()
      };

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(testData),
          mode: 'cors',
          signal: controller.signal
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          setTestResult({
            success: false,
            message: `❌ Erreur HTTP: ${response.status} ${response.statusText}`
          });
          return;
        }

        const result = await response.text();
        console.log('📨 Réponse du script:', result);

        const isSuccess = result.includes('Test réussi') || 
                         result.includes('success') || 
                         result.includes('OK') ||
                         response.status === 200;

        setTestResult({
          success: isSuccess,
          message: isSuccess 
            ? `✅ Connexion réussie ! Réponse: "${result}"`
            : `⚠️ Réponse inattendue: "${result}"`
        });

      } catch (fetchError: any) {
        clearTimeout(timeoutId);
        
        let errorMessage = '❌ Erreur de connexion: ';
        
        if (fetchError.name === 'AbortError') {
          errorMessage += 'Timeout - Le script met trop de temps à répondre';
        } else if (fetchError.name === 'TypeError' && fetchError.message.includes('Failed to fetch')) {
          errorMessage += 'Impossible de joindre le script. Vérifiez le déploiement.';
        } else {
          errorMessage += fetchError.message;
        }

        setTestResult({
          success: false,
          message: errorMessage
        });
      }

    } catch (error: any) {
      console.error('❌ Erreur test connexion:', error);
      setTestResult({
        success: false,
        message: `❌ Erreur: ${error.message}`
      });
    } finally {
      setIsTesting(false);
    }
  };

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

      // Envoi avec configuration CORS améliorée et gestion d'erreurs détaillée
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000);

      try {
        const response = await fetch(GOOGLE_SCRIPT_URL, {
          method: "POST",
          headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json, text/plain, */*"
          },
          body: JSON.stringify(requestData),
          signal: controller.signal,
          mode: 'cors',
          credentials: 'omit'
        });

        clearTimeout(timeoutId);

        // Check if response is ok before trying to read it
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const result = await response.text();
        console.log('📨 Réponse Google Apps Script:', result);

        setExportStep('✅ Facture enregistrée et envoyée !');
        
        let successMessage = `✅ Facture enregistrée dans Drive !`;
        
        // Votre script répond donc on considère que c'est un succès si pas d'erreur
        if (response.ok) {
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
          throw new Error('Timeout - Le script met trop de temps à répondre (30s)');
        } else if (fetchError.message.includes('Failed to fetch')) {
          // More specific error message for CORS/network issues
          throw new Error(`Impossible de contacter Google Apps Script. Vérifiez que:
• Le script est déployé comme "Web app"
• L'accès est configuré sur "Anyone" ou "Anyone, even anonymous"
• L'URL du script est correcte
• Votre connexion internet fonctionne

Erreur technique: ${fetchError.message}`);
        } else if (fetchError.message.includes('CORS')) {
          throw new Error(`Erreur CORS: Le script Google Apps Script doit être configuré pour accepter les requêtes cross-origin. Vérifiez les paramètres de déploiement.`);
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

      {/* Configuration Google Apps Script */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-300" />
            <h4 className="font-semibold text-blue-100">Google Apps Script Configuré</h4>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center space-x-1"
            >
              <TestTube className="w-3 h-3" />
              <span>Tester</span>
            </button>
            <a 
              href="https://script.google.com/home" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-sm flex items-center space-x-1 text-blue-200 hover:text-white"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Google Apps Script</span>
            </a>
          </div>
        </div>
        
        <div className="text-sm text-blue-200">
          <div className="flex items-center space-x-2">
            <span>Script ID: AKfycbwIj1kxUxR98Zp1zgWLAT3vazv8j3-0OpQyI29NHYn0ENpMVVIwqqaFi_A29XW_Ot4-</span>
          </div>
          <div className="text-xs mt-1">
            URL: {GOOGLE_SCRIPT_URL}
          </div>
        </div>
        
        {/* Résultat du test */}
        {testResult && (
          <div className={`mt-2 p-2 rounded text-xs ${testResult.success ? 'bg-green-500/20 text-green-200' : 'bg-red-500/20 text-red-200'}`}>
            {testResult.message}
          </div>
        )}
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
          🔗 Script: AKfycbwIj1kxUxR98Zp1zgWLAT3vazv8j3-0OpQyI29NHYn0ENpMVVIwqqaFi_A29XW_Ot4-
        </p>
        <div className="mt-2 text-xs text-orange-200 bg-orange-500/20 rounded p-2">
          <p className="font-semibold">💡 Pour configurer votre Google Apps Script :</p>
          <ul className="list-disc list-inside mt-1 text-left">
            <li>Déployez comme "Web app"</li>
            <li>Configurez l'accès sur "Anyone" ou "Anyone, even anonymous"</li>
            <li>Exécutez en tant que "Me" (votre compte)</li>
            <li>Utilisez l'URL /exec (pas /dev) pour la production</li>
          </ul>
        </div>
      </div>
    </div>
  );
};