import React, { useRef, useState } from 'react';
import { X, Download, Printer, FileText, Share2, Loader, UploadCloud as CloudUpload } from 'lucide-react';
import { InvoicePDF } from './InvoicePDF'; // ✅ MÊME COMPOSANT que l'aperçu principal !
import { Invoice } from '../types';
import { PDFService } from '../services/pdfService';
import { saveInvoiceToGoogleDrive } from '../services/googleDriveService';
import html2canvas from 'html2canvas';
import html2pdf from 'html2pdf.js';

interface PDFPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onDownload?: () => void;
}

export const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({
  isOpen,
  onClose,
  invoice
}) => {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStep, setUploadStep] = useState('');
  const [isSharing, setIsSharing] = useState(false);
  const [shareStep, setShareStep] = useState('');

  // 🎯 GÉNÉRATION PDF IDENTIQUE À L'APERÇU - MÊME DOM
  const generatePDFFromPreview = async (): Promise<Blob> => {
    if (!previewRef.current) {
      throw new Error('Aperçu non trouvé pour la génération PDF');
    }

    console.log('🎯 GÉNÉRATION PDF DEPUIS LE MÊME DOM QUE L\'APERÇU');
    
    // Attendre que l'élément soit complètement rendu
    await new Promise(resolve => setTimeout(resolve, 500));

    // 📋 CONFIGURATION EXACTE - IDENTIQUE À VOTRE SCRIPT
    const opt = {
      margin: 0,
      filename: `MyConfort_Facture_${invoice.invoiceNumber}.pdf`,
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: previewRef.current.scrollWidth,
        height: previewRef.current.scrollHeight
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    try {
      console.log('🔄 Génération PDF depuis l\'aperçu avec votre configuration exacte...');
      const pdfBlob = await html2pdf().set(opt).from(previewRef.current).outputPdf('blob');
      console.log('✅ PDF généré depuis l\'aperçu - IDENTIQUE À L\'AFFICHAGE !');
      return pdfBlob;
    } catch (error) {
      console.error('❌ Erreur génération PDF depuis aperçu:', error);
      throw new Error('Impossible de générer le PDF depuis l\'aperçu');
    }
  };

  // 📥 TÉLÉCHARGER LE PDF DEPUIS L'APERÇU
  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      console.log('📥 TÉLÉCHARGEMENT PDF DEPUIS L\'APERÇU AFFICHÉ');
      
      if (!previewRef.current) {
        throw new Error('Aperçu non trouvé');
      }

      // Utiliser html2pdf directement sur l'aperçu affiché
      const opt = {
        margin: 0,
        filename: `MyConfort_Facture_${invoice.invoiceNumber}.pdf`,
        html2canvas: { 
          scale: 2, 
          useCORS: true,
          letterRendering: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          logging: false
        },
        jsPDF: { 
          unit: 'mm', 
          format: 'a4', 
          orientation: 'portrait',
          compress: true
        }
      };

      await html2pdf().set(opt).from(previewRef.current).save();
      console.log('✅ PDF téléchargé depuis l\'aperçu - IDENTIQUE À L\'AFFICHAGE !');
      
    } catch (error) {
      console.error('❌ Erreur téléchargement PDF:', error);
      alert(`❌ Erreur lors du téléchargement du PDF: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsDownloading(false);
    }
  };

  // 📤 TÉLÉCHARGER ET ENVOYER SUR GOOGLE DRIVE
  const handleDownloadAndUploadPDF = async () => {
    setIsDownloading(true);
    setIsUploading(true);
    setUploadStep('🔄 Génération du PDF depuis l\'aperçu...');
    
    try {
      console.log('🚀 PROCESSUS COMPLET : TÉLÉCHARGEMENT + GOOGLE DRIVE');
      
      // 1. Générer le PDF depuis l'aperçu affiché
      const pdfBlob = await generatePDFFromPreview();
      
      setUploadStep('📥 Téléchargement local...');
      
      // 2. Téléchargement local
      const url = window.URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `MyConfort_Facture_${invoice.invoiceNumber}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      
      setUploadStep('📤 Envoi vers Google Drive...');
      
      // 3. Envoi Google Drive
      const result = await saveInvoiceToGoogleDrive(invoice);
      
      if (result) {
        setUploadStep('✅ PDF téléchargé et envoyé !');
        alert(`✅ Facture ${invoice.invoiceNumber} téléchargée et envoyée sur Google Drive avec succès !`);
      } else {
        throw new Error('Échec de l\'envoi vers Google Drive');
      }
      
    } catch (error) {
      console.error('❌ Erreur processus complet:', error);
      alert(`❌ Erreur lors du processus: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
    } finally {
      setIsDownloading(false);
      setIsUploading(false);
      setUploadStep('');
    }
  };

  // 📤 ENVOYER UNIQUEMENT SUR GOOGLE DRIVE
  const handleUploadToGoogleDrive = async () => {
    setIsUploading(true);
    setUploadStep('🔄 Génération du PDF...');

    try {
      // Generate PDF blob from the preview
      const pdfBlob = await generatePDFFromPreview();
      
      setUploadStep('📤 Envoi vers Google Drive...');
      
      // Upload to Google Drive
      const result = await saveInvoiceToGoogleDrive(invoice);
      
      if (result) {
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

  // 🖨️ IMPRESSION DEPUIS L'APERÇU
  const handlePrint = () => {
    if (!previewRef.current) {
      alert('Aperçu non trouvé pour l\'impression.');
      return;
    }
    
    const printContents = previewRef.current.innerHTML;
    const printWindow = window.open('', '', 'height=900,width=700');
    
    if (!printWindow) {
      alert('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les pop-ups.');
      return;
    }
    
    printWindow.document.write(`
      <html>
        <head>
          <title>Facture ${invoice.invoiceNumber}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Inter', Arial, sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: #fff; 
              color: #333;
              line-height: 1.4;
            }
            .facture-apercu { 
              background: #fff; 
              font-family: 'Inter', Arial, sans-serif;
            }
            @media print {
              body { margin: 0; padding: 10mm; }
              .no-print { display: none !important; }
            }
            /* Styles pour l'impression */
            .invoice-container { max-width: none; box-shadow: none; }
            .header { background: linear-gradient(135deg, #477A0C, #5A8F0F) !important; }
            .footer { background: linear-gradient(135deg, #477A0C, #5A8F0F) !important; }
          </style>
        </head>
        <body>${printContents}</body>
      </html>
    `);
    
    printWindow.document.close();
    printWindow.onload = () => {
      setTimeout(() => {
        printWindow.print();
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      }, 500);
    };
  };

  // 📸 PARTAGE APERÇU PAR EMAIL
  const handleSharePreviewViaEmail = async () => {
    if (!invoice.client.email) {
      alert('Veuillez renseigner l\'email du client pour partager l\'aperçu');
      return;
    }

    setIsSharing(true);

    try {
      setShareStep('📸 Capture de l\'aperçu...');
      
      if (!previewRef.current) {
        throw new Error('Aperçu non trouvé');
      }

      setShareStep('🖼️ Conversion en image...');
      
      // Capturer l'aperçu avec html2canvas
      const canvas = await html2canvas(previewRef.current, {
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
      alert(`❌ Erreur lors de la capture de l'aperçu: ${error instanceof Error ? error.message : 'Erreur inconnue'}`);
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
            {/* Bouton téléchargement seul */}
            <button
              onClick={handleDownloadPDF}
              disabled={isDownloading}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
              title="Télécharger le PDF identique à cet aperçu"
            >
              {isDownloading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Téléchargement...</span>
                </>
              ) : (
                <>
                  <Download size={18} />
                  <span>Télécharger PDF</span>
                </>
              )}
            </button>

            {/* Bouton Google Drive seul */}
            <button
              onClick={handleUploadToGoogleDrive}
              disabled={isUploading}
              className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
              title="Envoyer cette facture vers Google Drive"
            >
              {isUploading ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Envoi...</span>
                </>
              ) : (
                <>
                  <CloudUpload size={18} />
                  <span>Google Drive</span>
                </>
              )}
            </button>

            {/* Bouton combiné téléchargement + Google Drive */}
            <button
              onClick={handleDownloadAndUploadPDF}
              disabled={isDownloading || isUploading}
              className="bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
              title="Télécharger ET envoyer sur Google Drive"
            >
              {(isDownloading || isUploading) ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Traitement...</span>
                </>
              ) : (
                <>
                  <CloudUpload size={18} />
                  <span>Télécharger & Drive</span>
                </>
              )}
            </button>
            
            {/* Bouton partage aperçu */}
            <button
              onClick={handleSharePreviewViaEmail}
              disabled={isSharing || !invoice.client.email}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
              title={!invoice.client.email ? "Veuillez renseigner l'email du client" : "Capturer cet aperçu et l'envoyer par email"}
            >
              {isSharing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Capture...</span>
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
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg transition-all hover:scale-105"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Indicateur de traitement en cours */}
        {(isDownloading || isUploading) && uploadStep && (
          <div className="bg-blue-50 border-b border-blue-200 p-3">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">Traitement en cours...</div>
                <div className="text-sm text-blue-700">{uploadStep}</div>
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
                <div className="font-semibold text-purple-900">Capture de l'aperçu en cours...</div>
                <div className="text-sm text-purple-700">{shareStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions */}
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <FileText className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-900">PDF identique à l'aperçu :</span>
            <span className="text-green-800">
              Le PDF généré sera exactement identique à ce que vous voyez ci-dessous
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📥 Téléchargement local • 📤 Envoi Google Drive • 🖨️ Impression • 📸 Partage aperçu
          </div>
        </div>

        {/* Content - APERÇU IDENTIQUE */}
        <div className="overflow-auto max-h-[calc(90vh-200px)] bg-gray-100 p-4">
          <div ref={previewRef} className="facture-apercu" id="pdf-preview-content">
            <InvoicePDF invoice={invoice} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
};