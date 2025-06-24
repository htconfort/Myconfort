import React, { useState } from 'react';
import { X, Download, Printer, FileText, Share2, Mail, Camera, Zap, Loader } from 'lucide-react';
import { Modal } from './ui/Modal';
import { InvoicePDF } from './InvoicePDF';
import { Invoice } from '../types';
import { PreviewShareService } from '../services/previewShareService';

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

  // 🎯 PARTAGE APERÇU AVEC EMAILJS (CORRIGÉ)
  const handleSharePreviewByEmail = async () => {
    if (!invoice.client.email) {
      alert('Veuillez renseigner l\'email du client pour partager l\'aperçu');
      return;
    }

    // Vérifier si le partage est possible
    const shareCheck = PreviewShareService.canSharePreview(invoice);
    if (!shareCheck.canShare) {
      alert(`❌ Impossible de partager l'aperçu: ${shareCheck.reason}`);
      return;
    }

    setIsSharing(true);

    try {
      // Étapes de progression
      setShareStep('📸 Capture de l\'aperçu exact...');
      await new Promise(resolve => setTimeout(resolve, 500)); // Petit délai pour l'UX

      setShareStep('🖼️ Conversion en image haute qualité...');
      await new Promise(resolve => setTimeout(resolve, 500));

      setShareStep('📧 Envoi par EmailJS...');
      
      // 🎯 UTILISER LE SERVICE DE PARTAGE AVEC EMAILJS
      const success = await PreviewShareService.sharePreviewByEmail(
        invoice,
        'pdf-preview-content',
        {
          quality: 1.0,
          scale: 2,
          format: 'png',
          backgroundColor: '#ffffff'
        }
      );

      if (success) {
        setShareStep('✅ Aperçu partagé !');
        
        // Message de succès détaillé
        const successMessage = `✅ Aperçu exact partagé avec succès !\n\n` +
          `📸 Image haute qualité envoyée à ${invoice.client.email}\n` +
          `🎯 Le client recevra exactement ce que vous voyez dans Bolt !\n\n` +
          `📋 Configuration EmailJS utilisée :\n` +
          `• Service ID: service_ocsxnme\n` +
          `• Template ID: template_yng4k8s\n` +
          `• Format: PNG haute qualité`;
        
        alert(successMessage);
      } else {
        throw new Error('Échec de l\'envoi via EmailJS');
      }

    } catch (error) {
      console.error('❌ Erreur partage aperçu:', error);
      
      // Message d'erreur avec instructions
      const errorMessage = `❌ Erreur lors du partage de l'aperçu\n\n` +
        `🔧 Vérifiez votre configuration EmailJS :\n` +
        `1. Service ID: service_ocsxnme\n` +
        `2. Template ID: template_yng4k8s\n` +
        `3. Public Key: hvgYUCG9j2lURrt5k\n\n` +
        `📧 Assurez-vous que le template supporte les pièces jointes avec {{invoice_pdf}}`;
      
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
            {/* 🎯 BOUTON PARTAGE APERÇU AVEC EMAILJS */}
            <button
              onClick={handleSharePreviewByEmail}
              disabled={isSharing || !invoice.client.email}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
              title={!invoice.client.email ? "Veuillez renseigner l'email du client" : "Partager cet aperçu exact par EmailJS"}
            >
              {isSharing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Partage...</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <Camera size={16} />
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

        {/* Indicateur de partage en cours */}
        {isSharing && shareStep && (
          <div className="bg-orange-50 border-b border-orange-200 p-3">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-orange-600" />
              <div>
                <div className="font-semibold text-orange-900">Partage de l'aperçu exact avec EmailJS...</div>
                <div className="text-sm text-orange-700">{shareStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions pour le partage */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">EmailJS configuré :</span>
            <span className="text-blue-800">
              Le bouton "Partager Aperçu" utilise votre configuration EmailJS (service_ocsxnme) pour envoyer exactement ce que vous voyez !
            </span>
            {!invoice.client.email && (
              <span className="text-red-600 font-semibold">
                ⚠️ Email client requis
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📧 Template: template_yng4k8s • 📎 Format: PNG haute qualité • 🎯 Identique à l'aperçu Bolt
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-180px)] bg-gray-100 p-4">
          <div id="pdf-preview-content">
            <InvoicePDF invoice={invoice} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
};