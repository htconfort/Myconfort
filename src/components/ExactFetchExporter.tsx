import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Loader, FileText, Send, CheckCircle, AlertCircle, TestTube, ExternalLink, Zap } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

interface ExactFetchExporterProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const ExactFetchExporter: React.FC<ExactFetchExporterProps> = ({
  invoice,
  onSuccess,
  onError
}) => {
  const [isExporting, setIsExporting] = useState(false);
  const [exportStep, setExportStep] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);

  // NOUVELLE URL À CONFIGURER
  const GOOGLE_SCRIPT_URL = "VOTRE_NOUVELLE_URL_SCRIPT";

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 TEST DE CONNEXION - NOUVELLE URL À CONFIGURER');
      
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          requestType: 'test',
          message: "Test de connexion depuis MYCONFORT"
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const result = await response.text();
      console.log('📨 Réponse du test:', result);

      setTestResult({
        success: response.ok,
        message: response.ok 
          ? `✅ Connexion réussie ! Réponse: "${result}"`
          : `❌ Erreur: ${response.status} - ${result}`
      });

    } catch (error: any) {
      console.error('❌ Erreur test:', error);
      setTestResult({
        success: false,
        message: `❌ Erreur de connexion: ${error.message}`
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

      // Génération PDF avec html2pdf
      const pdfBlob = await html2pdf()
        .from(element)
        .set({
          filename: `Facture_${invoice.invoiceNumber}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .outputPdf("blob");

      setExportStep('🔄 Conversion en base64...');

      // Conversion en base64
      const reader = new FileReader();
      
      const pdfBase64 = await new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            // Garder le format complet avec préfixe data:application/pdf;base64,
            resolve(reader.result);
          } else {
            reject(new Error('Erreur de conversion'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      setExportStep('🚀 Envoi vers Google Apps Script...');

      // UTILISATION DE VOTRE CODE EXACT AVEC NOUVELLE URL
      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: "POST",
        body: JSON.stringify({
          pdfBase64: pdfBase64.split(',')[1],  // base64 du fichier généré (sans le préfixe)
          filename: `Facture_${invoice.invoiceNumber}.pdf`,
          // Données supplémentaires pour votre script
          email: invoice.client.email,
          clientName: invoice.client.name,
          invoiceNumber: invoice.invoiceNumber,
          invoiceDate: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
          totalAmount: formatCurrency(invoice.products.reduce((sum, product) => {
            return sum + calculateProductTotal(
              product.quantity,
              product.priceTTC,
              product.discount,
              product.discountType
            );
          }, 0))
        }),
        headers: {
          "Content-Type": "application/json"
        }
      });

      const data = await response.text();
      console.log("✅ PDF envoyé :", data);

      setExportStep('✅ Envoi réussi !');
      
      let successMessage = `✅ PDF envoyé avec succès !`;
      successMessage += `\n📧 Destinataire: ${invoice.client.email}`;
      successMessage += `\n📄 Fichier: Facture_${invoice.invoiceNumber}.pdf`;
      successMessage += `\n📊 Taille: ${Math.round(pdfBlob.size / 1024)} KB`;
      
      if (invoice.signature) {
        successMessage += `\n🔒 Signature électronique incluse`;
      }
      
      successMessage += `\n📨 Réponse du script: ${data}`;

      onSuccess(successMessage);

    } catch (error: any) {
      console.error("❌ Erreur lors de l'envoi :", error);
      onError(`❌ Erreur lors de l'envoi: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportStep('');
    }
  };

  // Validation des données
  const canExport = invoice.client.email && invoice.products.length > 0;

  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 rounded-xl shadow-xl p-6 mb-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">Export PDF - Nouvelle URL</h2>
            <p className="text-green-100">🎯 Nouvelle URL à configurer • 📧 Google Apps Script • 💾 Base64</p>
          </div>
        </div>
        
        {/* Statut */}
        <div className="text-right">
          <div className="text-sm text-green-100 mb-1">Statut</div>
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

      {/* Configuration */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-300" />
            <h4 className="font-semibold text-green-100">Configuration - Nouvelle URL</h4>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting}
              className="px-3 py-1 bg-green-500 hover:bg-green-600 text-white rounded text-sm flex items-center space-x-1"
            >
              {isTesting ? (
                <Loader className="w-3 h-3 animate-spin" />
              ) : (
                <TestTube className="w-3 h-3" />
              )}
              <span>Tester</span>
            </button>
            <a 
              href="https://script.google.com/home" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-sm flex items-center space-x-1 text-green-200 hover:text-white"
            >
              <ExternalLink className="w-3 h-3" />
              <span>Script</span>
            </a>
          </div>
        </div>
        
        <div className="text-sm text-green-200">
          <div className="font-mono text-xs bg-black/20 p-2 rounded">
            {GOOGLE_SCRIPT_URL}
          </div>
          <div className="mt-2 text-xs">
            📋 Format: JSON avec pdfBase64 et filename (nouvelle URL à configurer)
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
            <div className="text-green-100">Client</div>
            <div className="font-semibold">{invoice.client.name || 'Non renseigné'}</div>
          </div>
          <div>
            <div className="text-green-100">Email</div>
            <div className="font-semibold">{invoice.client.email || 'Non renseigné'}</div>
          </div>
          <div>
            <div className="text-green-100">Facture</div>
            <div className="font-semibold">{invoice.invoiceNumber}</div>
          </div>
          <div>
            <div className="text-green-100">Total</div>
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

      {/* Code utilisé */}
      <div className="bg-black/20 rounded-lg p-3 mb-4">
        <div className="text-xs text-green-100 mb-2 font-semibold">📋 Code utilisé (nouvelle URL à configurer) :</div>
        <div className="font-mono text-xs text-green-200 bg-black/30 p-2 rounded overflow-x-auto">
          {`fetch("${GOOGLE_SCRIPT_URL}", {
  method: "POST",
  body: JSON.stringify({
    pdfBase64: pdfBase64,  // base64 du fichier généré
    filename: "Facture_${invoice.invoiceNumber}.pdf",
    email: "${invoice.client.email}"
  }),
  headers: {
    "Content-Type": "application/json"
  }
})`}
        </div>
      </div>

      {/* Indicateur de progression */}
      {isExporting && exportStep && (
        <div className="bg-green-500/20 border border-green-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-3">
            <Loader className="w-5 h-5 animate-spin text-green-300" />
            <div>
              <div className="font-semibold text-green-100">Export en cours...</div>
              <div className="text-sm text-green-200">{exportStep}</div>
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
          disabled={isExporting || !canExport || GOOGLE_SCRIPT_URL === "VOTRE_NOUVELLE_URL_SCRIPT"}
          className="bg-white text-green-600 hover:bg-green-50 disabled:bg-gray-300 disabled:text-gray-500 px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {isExporting ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>Export en cours...</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6" />
              <FileText className="w-5 h-5" />
              <Send className="w-5 h-5" />
              <span>Envoyer PDF (Nouvelle URL)</span>
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-green-100">
        <p>
          {GOOGLE_SCRIPT_URL === "VOTRE_NOUVELLE_URL_SCRIPT" 
            ? '⚠️ Veuillez configurer une nouvelle URL Google Apps Script'
            : canExport 
              ? `✅ Prêt pour l'envoi avec la nouvelle URL configurée`
              : '⚠️ Complétez les informations ci-dessus'
          }
        </p>
        <p className="mt-1 text-xs text-yellow-200 font-semibold">
          🎯 Utilise la nouvelle URL Google Apps Script à configurer
        </p>
        <div className="mt-2 text-xs text-blue-200 bg-blue-500/20 rounded p-2">
          <p className="font-semibold">💡 Nouvelle URL à configurer :</p>
          <ul className="list-disc list-inside mt-1 text-left">
            <li>Génération PDF avec html2pdf.js</li>
            <li>Conversion en base64 (format sans préfixe)</li>
            <li>Envoi avec votre structure JSON exacte</li>
            <li>Headers Content-Type: application/json</li>
          </ul>
        </div>
      </div>
    </div>
  );
}