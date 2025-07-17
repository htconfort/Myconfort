import React, { useState } from 'react';
import { X, Download, Printer, FileText, Share2, Loader, UploadCloud as CloudUpload } from 'lucide-react';
import { InvoicePDF } from './InvoicePDF';
import { Invoice } from '../types';
import html2canvas from 'html2canvas';
import { AdvancedPDFService } from '../services/advancedPdfService';
import { GoogleDriveService } from '../services/googleDriveService';

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
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  
  const handlePrint = () => {
    window.print();
  };

  // Partage d'aperçu par email
  const handleSharePreviewViaEmail = async () => {
    if (!invoice.client.email) {
      alert('Veuillez renseigner l\'email du client pour partager l\'aperçu');
      return;
    }

    setIsSharing(true);

    try {
      // Étapes de progression
      setShareStep('📸 Capture de l\'aperçu...');
      
      // Capturer l'aperçu avec html2canvas
      const element = document.getElementById('pdf-preview-content');
      if (!element) {
        throw new Error('Élément aperçu non trouvé');
      }

      setShareStep('🖼️ Conversion en image...');
      
      // Utiliser des options optimisées pour réduire la taille
      const canvas = await html2canvas(element, {
        scale: 0.75,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false
      });

      // Convertir en JPEG avec qualité réduite
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.5);
      
      setShareStep('🚀 Préparation pour l\'envoi...');
      
      // Créer un lien de téléchargement pour l'image
      const link = document.createElement('a');
      link.href = imageDataUrl;
      link.download = `apercu-facture-${invoice.invoiceNumber}.jpg`;
      
      // Déclencher le téléchargement
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShareStep('✅ Aperçu capturé !');
      
      // Ouvrir le client mail par défaut
      const mailtoLink = `mailto:${invoice.client.email}?subject=Aperçu facture MYCONFORT n°${invoice.invoiceNumber}&body=Bonjour ${invoice.client.name},%0D%0A%0D%0AVeuillez trouver ci-joint l'aperçu de votre facture n°${invoice.invoiceNumber}.%0D%0A%0D%0ACordialement,%0D%0A${invoice.advisorName || 'MYCONFORT'}`;
      
      window.open(mailtoLink, '_blank');
      
      const successMessage = `✅ Aperçu capturé avec succès !\n\n` +
        `📸 Image enregistrée sur votre appareil\n` +
        `📧 Client mail ouvert pour envoi à ${invoice.client.email}\n\n` +
        `Joignez manuellement l'image téléchargée à votre email.`;
      
      alert(successMessage);

    } catch (error) {
      console.error('❌ Erreur partage aperçu:', error);
      
      const errorMessage = `❌ Erreur lors de la capture de l'aperçu\n\n` +
        `Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n\n` +
        `Consultez la console pour plus de détails`;
      
      alert(errorMessage);
    } finally {
      setIsSharing(false);
      setShareStep('');
    }
  };

  // Upload to Google Drive
  const handleUploadToGoogleDrive = async () => {
    setIsUploading(true);
    setUploadStep('🔄 Génération du PDF...');

    try {
      // Generate PDF blob
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);
      
      setUploadStep('📤 Envoi vers Google Drive...');
      
      // Upload to Google Drive
      const success = await GoogleDriveService.uploadPDFToGoogleDrive(invoice, pdfBlob);
      
      if (success) {
        setUploadStep('✅ PDF envoyé avec succès !');
        alert(`✅ Facture ${invoice.invoiceNumber} envoyée avec succès vers Google Drive !`);
      } else {
        throw new Error('Échec de l\'envoi vers Google Drive');
      }
    } catch (error) {
      console.error('❌ Erreur upload Google Drive:', error);
      alert(`❌ Erreur lors de l'envoi vers Google Drive: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsUploading(false);
      setUploadStep('');
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
            {/* Bouton upload Google Drive */}
            <button
              onClick={handleUploadToGoogleDrive}
              disabled={isUploading}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              title="Envoyer cette facture vers Google Drive"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Envoi en cours...</span>
                </>
              ) : (
                <>
                  <CloudUpload size={18} />
                  <span>Google Drive</span>
                </>
              )}
            </button>
            
            {/* Bouton partage aperçu */}
            <button
              onClick={handleSharePreviewViaEmail}
              disabled={isSharing || !invoice.client.email}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              title={!invoice.client.email ? "Veuillez renseigner l'email du client" : "Capturer cet aperçu et l'envoyer par email"}
            >
              {isSharing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Capture en cours...</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
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
          <div className="bg-purple-50 border-b border-purple-200 p-3">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-purple-600" />
              <div>
                <div className="font-semibold text-purple-900">Capture de l'aperçu en cours...</div>
                <div className="text-sm text-purple-700">{shareStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* Indicateur d'upload en cours */}
        {isUploading && uploadStep && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Envoi vers Google Drive en cours...</div>
                <div className="text-sm text-blue-700">{uploadStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions pour le partage */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Share2 className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-purple-900">Partage d'aperçu :</span>
            <span className="text-purple-800">
              {invoice.client.email 
                ? "Cliquez sur \"Partager Aperçu\" pour capturer et envoyer par email"
                : "⚠️ Email client requis pour le partage d'aperçu"
              }
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📸 Format: JPEG optimisé • 🎯 Téléchargement automatique
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            💡 L'image sera téléchargée et votre client mail s'ouvrira automatiquement
          </div>
        </div>

        {/* Instructions pour Google Drive */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <CloudUpload className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Google Drive :</span>
            <span className="text-blue-800">
              Cliquez sur "Google Drive" pour envoyer cette facture vers votre Drive
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📁 Dossier: {GoogleDriveService.getConfig().folderId} • 🎯 Format: PDF haute qualité
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            💡 La facture sera automatiquement envoyée vers votre Google Drive via n8n
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
};
