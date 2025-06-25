import React, { useState } from 'react';
import { X, Download, Printer, FileText, Share2, Mail, Camera, Zap, Loader, CheckCircle, AlertTriangle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { InvoicePDF } from './InvoicePDF';
import { Invoice } from '../types';
import { GoogleAppsScriptService } from '../services/googleAppsScriptService';
import html2canvas from 'html2canvas';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onDownload: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onDownload
}) => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareStep, setShareStep] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<any>(null);
  
  const scriptInfo = GoogleAppsScriptService.getScriptInfo();
  const scriptConfigured = scriptInfo.scriptId !== 'VOTRE_NOUVEAU_SCRIPT_ID';

  const handlePrint = () => {
    const printContent = document.getElementById('pdf-preview-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Facture ${invoice.invoiceNumber}</title>
              <link href="https://cdn.tailwindcss.com" rel="stylesheet">
              <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Inter', sans-serif; margin: 0; padding: 0; }
                @media print {
                  .no-print { display: none !important; }
                  body { -webkit-print-color-adjust: exact; }
                }
              </style>
            </head>
            <body>
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // 🧪 TEST DE CONNEXION GOOGLE APPS SCRIPT
  const handleTestGoogleScript = async () => {
    if (!scriptConfigured) {
      alert('Veuillez configurer un nouveau script Google Apps Script');
      return;
    }

    setIsTesting(true);
    setTestResult(null);

    try {
      console.log('🧪 TEST DE CONNEXION GOOGLE APPS SCRIPT DEPUIS L\'APERÇU');
      
      const result = await GoogleAppsScriptService.testConnection();
      setTestResult(result);
      
      console.log('📊 Résultat du test:', result);
      
    } catch (error) {
      console.error('❌ Erreur test:', error);
      setTestResult({
        success: false,
        message: 'Erreur lors du test de connexion',
        responseTime: 0
      });
    } finally {
      setIsTesting(false);
    }
  };

  // 🚀 PARTAGE APERÇU AVEC GOOGLE APPS SCRIPT
  const handleSharePreviewViaGoogleScript = async () => {
    if (!invoice.client.email) {
      alert('Veuillez renseigner l\'email du client pour partager l\'aperçu');
      return;
    }

    if (!scriptConfigured) {
      alert('Veuillez configurer un nouveau script Google Apps Script');
      return;
    }

    setIsSharing(true);

    try {
      // Étapes de progression
      setShareStep('📸 Capture de l\'aperçu exact...');
      await new Promise(resolve => setTimeout(resolve, 500));

      // Capturer l'aperçu avec html2canvas
      const element = document.getElementById('pdf-preview-content');
      if (!element) {
        throw new Error('Élément aperçu non trouvé');
      }

      setShareStep('🖼️ Conversion en image haute qualité...');
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });

      const imageDataUrl = canvas.toDataURL('image/png', 1.0);
      const imageBlob = await fetch(imageDataUrl).then(res => res.blob());
      const imageSizeKB = Math.round(imageBlob.size / 1024);

      setShareStep('🚀 Envoi via Google Apps Script...');
      
      // Envoyer via Google Apps Script
      const success = await GoogleAppsScriptService.sharePreviewViaScript(
        invoice,
        imageDataUrl,
        imageSizeKB,
        'png'
      );

      if (success) {
        setShareStep('✅ Aperçu partagé !');
        
        const successMessage = `✅ Aperçu exact partagé avec succès !\n\n` +
          `📸 Image haute qualité envoyée à ${invoice.client.email}\n` +
          `🎯 Le client recevra exactement ce que vous voyez dans Bolt !\n\n` +
          `🚀 Envoyé via votre Google Apps Script personnalisé\n` +
          `📊 Taille: ${imageSizeKB} KB • Format: PNG haute qualité`;
        
        alert(successMessage);
      } else {
        throw new Error('Échec de l\'envoi via Google Apps Script');
      }

    } catch (error) {
      console.error('❌ Erreur partage aperçu:', error);
      
      const errorMessage = `❌ Erreur lors du partage de l'aperçu\n\n` +
        `🔧 Vérifiez votre Google Apps Script :\n` +
        `• Script ID: ${GoogleAppsScriptService.getScriptInfo().scriptId}\n` +
        `• Le script doit être déployé comme application web\n` +
        `• Les autorisations doivent être accordées\n\n` +
        `💡 Consultez la console pour plus de détails`;
      
      alert(errorMessage);
    } finally {
      setIsSharing(false);
      setShareStep('');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-blue-600 text-white">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <h3 className="text-xl font-bold">Aperçu de la facture {invoice.invoiceNumber}</h3>
            {invoice.signature && (
              <div className="bg-green-500 text-white px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <span>🔒</span>
                <span>SIGNÉE</span>
              </div>
            )}
          </div>
          <div className="flex items-center space-x-3">
            {/* 🧪 BOUTON TEST GOOGLE APPS SCRIPT */}
            <button
              onClick={handleTestGoogleScript}
              disabled={isTesting || !scriptConfigured}
              className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              title={scriptConfigured ? "Tester la connexion avec votre Google Apps Script" : "Veuillez configurer un nouveau script"}
            >
              {isTesting ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Test...</span>
                </>
              ) : (
                <>
                  <CheckCircle size={18} />
                  <Zap size={16} />
                  <span>Tester Script</span>
                </>
              )}
            </button>

            {/* 🚀 BOUTON PARTAGE APERÇU AVEC GOOGLE APPS SCRIPT */}
            <button
              onClick={handleSharePreviewViaGoogleScript}
              disabled={isSharing || !invoice.client.email || !scriptConfigured}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              title={!invoice.client.email ? "Veuillez renseigner l'email du client" : !scriptConfigured ? "Veuillez configurer un nouveau script" : "Partager cet aperçu exact via Google Apps Script"}
            >
              {isSharing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Partage...</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <Zap size={16} />
                  <span>Partager Aperçu</span>
                </>
              )}
            </button>

            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105"
            >
              <Printer size={18} />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onDownload}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105"
            >
              <Download size={18} />
              <span>Télécharger PDF</span>
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg transition-all hover:scale-105"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Résultat du test de connexion */}
        {testResult && (
          <div className={`border-b p-3 ${testResult.success ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
            <div className="flex items-center space-x-3">
              {testResult.success ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <div>
                <div className={`font-semibold ${testResult.success ? 'text-green-900' : 'text-red-900'}`}>
                  {testResult.success ? '✅ Test de connexion réussi !' : '❌ Test de connexion échoué'}
                </div>
                <div className={`text-sm ${testResult.success ? 'text-green-700' : 'text-red-700'}`}>
                  {testResult.message}
                  {testResult.responseTime && <span className="ml-2">({testResult.responseTime}ms)</span>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Indicateur de partage en cours */}
        {isSharing && shareStep && (
          <div className="bg-purple-50 border-b border-purple-200 p-3">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-purple-600" />
              <div>
                <div className="font-semibold text-purple-900">Partage de l'aperçu exact avec Google Apps Script...</div>
                <div className="text-sm text-purple-700">{shareStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions pour Google Apps Script */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-purple-900">Google Apps Script :</span>
            <span className="text-purple-800">
              {scriptConfigured 
                ? "Votre script personnalisé est prêt pour l'envoi automatique !"
                : "⚠️ Veuillez configurer un nouveau script Google Apps Script"
              }
            </span>
            {!invoice.client.email && (
              <span className="text-red-600 font-semibold">
                ⚠️ Email client requis
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-600">
            🚀 Script: {scriptConfigured ? `${scriptInfo.scriptId.substring(0, 20)}...` : "Non configuré"} • 📎 Format: PNG haute qualité • 🎯 Identique à l'aperçu Bolt
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            💡 {scriptConfigured 
              ? "Cliquez sur \"Tester Script\" pour vérifier la connexion avec votre Google Apps Script"
              : "Veuillez créer un nouveau script Google Apps Script et mettre à jour l'ID dans le code"
            }
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-220px)] bg-gray-100 p-4">
          <div id="pdf-preview-content">
            <InvoicePDF invoice={invoice} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
}