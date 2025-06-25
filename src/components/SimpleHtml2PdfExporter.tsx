import React, { useState } from 'react';
import html2pdf from 'html2pdf.js';
import { Loader, FileText, Send, CheckCircle, AlertCircle, TestTube, ExternalLink } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { EmailService } from '../services/emailService';

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

  const emailConfig = EmailService.getConfigInfo();
  const emailConfigured = emailConfig.configured;

  const handleTestConnection = async () => {
    if (!emailConfigured) {
      onError('Veuillez configurer EmailJS avant de tester la connexion');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 TEST DE CONNEXION EMAILJS');
      
      const result = await EmailService.testConnection();
      setTestResult(result);
      
      if (result.success) {
        onSuccess(`✅ Test réussi ! ${result.message}`);
      } else {
        onError(`❌ Test échoué: ${result.message}`);
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

    if (!emailConfigured) {
      onError('Veuillez configurer EmailJS avant d\'envoyer la facture');
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

      // Conversion en base64
      const reader = new FileReader();
      
      const base64Promise = new Promise<string>((resolve, reject) => {
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            reject(new Error('Erreur de conversion'));
          }
        };
        reader.onerror = reject;
        reader.readAsDataURL(pdfBlob);
      });

      const base64 = await base64Promise;

      setExportStep('🚀 Envoi via EmailJS...');

      // Calculer les montants pour informations supplémentaires
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

      // Envoi via EmailJS
      const success = await EmailService.sendInvoiceWithPDF(invoice);

      if (success) {
        setExportStep('✅ Facture envoyée !');
        
        let successMessage = `✅ Facture envoyée avec succès via EmailJS !`;
        successMessage += `\n📧 Envoyée à ${invoice.client.email}`;
        
        if (acompteAmount > 0) {
          successMessage += `\n💰 Acompte: ${formatCurrency(acompteAmount)} | 💳 Reste: ${formatCurrency(montantRestant)}`;
        }
        
        if (invoice.signature) {
          successMessage += `\n🔒 Signature électronique incluse`;
        }

        onSuccess(successMessage);
      } else {
        throw new Error('Échec de l\'envoi via EmailJS');
      }

    } catch (error: any) {
      console.error('❌ Erreur export et envoi:', error);
      onError(`❌ Une erreur est survenue: ${error.message}`);
    } finally {
      setIsExporting(false);
      setExportStep('');
    }
  };

  // Téléchargement PDF uniquement
  const handleDownloadOnly = async () => {
    setIsExporting(true);
    setExportStep('💾 Téléchargement PDF...');
    
    try {
      const element = document.getElementById("facture-apercu");
      
      if (!element) {
        throw new Error('Élément facture-apercu non trouvé');
      }

      await html2pdf()
        .from(element)
        .set({
          filename: `Facture_MyConfort_${invoice.invoiceNumber}.pdf`,
          html2canvas: { scale: 2 },
          jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        })
        .save();
      
      onSuccess('✅ PDF téléchargé avec succès !');
    } catch (error: any) {
      onError(`Erreur téléchargement: ${error.message}`);
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
            <p className="text-blue-100">🎯 html2pdf.js • 📧 EmailJS • 💾 Téléchargement</p>
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

      {/* Configuration EmailJS */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-300" />
            <h4 className="font-semibold text-blue-100">EmailJS Configuré</h4>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handleTestConnection}
              disabled={isTesting || !emailConfigured}
              className="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white rounded text-sm flex items-center space-x-1 disabled:opacity-50"
            >
              <TestTube className="w-3 h-3" />
              <span>Tester</span>
            </button>
            <a 
              href="https://www.emailjs.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="underline text-sm flex items-center space-x-1 text-blue-200 hover:text-white"
            >
              <ExternalLink className="w-3 h-3" />
              <span>EmailJS</span>
            </a>
          </div>
        </div>
        
        <div className="text-sm text-blue-200">
          <div className="flex items-center space-x-2">
            <span>{emailConfig.status}</span>
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

      {/* Message EmailJS non configuré */}
      {!emailConfigured && (
        <div className="bg-yellow-500/20 border border-yellow-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-yellow-300" />
            <div className="text-sm">
              <div className="font-semibold">EmailJS non configuré</div>
              <p className="mt-1 text-xs">
                Veuillez configurer EmailJS pour activer l'envoi d'emails.
              </p>
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

      {/* Boutons d'action */}
      <div className="flex justify-center space-x-3">
        <button
          onClick={handleDownloadOnly}
          disabled={isExporting}
          className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-bold flex items-center space-x-2 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {isExporting && exportStep.includes('Téléchargement') ? (
            <>
              <Loader className="w-5 h-5 animate-spin" />
              <span>Téléchargement...</span>
            </>
          ) : (
            <>
              <FileText className="w-5 h-5" />
              <span>Télécharger PDF</span>
            </>
          )}
        </button>

        <button
          onClick={handleExportAndSend}
          disabled={isExporting || !canExport || !emailConfigured}
          className="bg-white text-blue-600 hover:bg-blue-50 disabled:bg-gray-300 disabled:text-gray-500 px-8 py-3 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {isExporting && !exportStep.includes('Téléchargement') ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : (
            <>
              <FileText className="w-6 h-6" />
              <Send className="w-5 h-5" />
              <span>Envoyer avec EmailJS</span>
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-blue-100">
        <p>
          {!emailConfigured
            ? '⚠️ Veuillez configurer EmailJS pour activer l\'envoi d\'emails'
            : canExport 
              ? `✅ Prêt pour l'envoi via EmailJS à ${invoice.client.email}`
              : '⚠️ Complétez les informations ci-dessus pour activer l\'export'
          }
        </p>
        <p className="mt-1 text-xs text-yellow-200 font-semibold">
          🎯 Utilise html2pdf.js pour convertir l'aperçu exact en PDF
        </p>
        <div className="mt-2 text-xs text-orange-200 bg-orange-500/20 rounded p-2">
          <p className="font-semibold">💡 Pour configurer EmailJS :</p>
          <ul className="list-disc list-inside mt-1 text-left">
            <li>Créez un compte sur <a href="https://www.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">EmailJS</a></li>
            <li>Configurez un service d'email (Gmail, Outlook, etc.)</li>
            <li>Créez un template d'email avec les variables nécessaires</li>
            <li>Copiez les identifiants dans la configuration</li>
          </ul>
        </div>
      </div>
    </div>
  );
};