import React, { useState } from 'react';
import { X, Download, Printer, FileText, Share2, Mail, Camera, Zap, Loader, CheckCircle, AlertCircle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { InvoicePDF } from './InvoicePDF';
import { Invoice } from '../types';
import { EmailService } from '../services/emailService';
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
  
  const emailConfig = EmailService.getConfigInfo();
  const emailConfigured = emailConfig.configured;

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
                body { 
                  font-family: 'Inter', sans-serif; 
                  margin: 0; 
                  padding: 0; 
                  background: white;
                  color: black;
                  line-height: 1.5;
                }
                
                /* Styles pour l'impression */
                @media print {
                  .no-print { display: none !important; }
                  body { 
                    -webkit-print-color-adjust: exact; 
                    print-color-adjust: exact;
                    margin: 0;
                    padding: 10mm;
                  }
                  * { 
                    print-color-adjust: exact; 
                    -webkit-print-color-adjust: exact;
                  }
                  @page { 
                    margin: 10mm; 
                    size: A4;
                  }
                }
                
                /* Préservation des couleurs MYCONFORT */
                .bg-\\[\\#477A0C\\] { background-color: #477A0C !important; }
                .text-\\[\\#F2EFE2\\] { color: #F2EFE2 !important; }
                .text-\\[\\#477A0C\\] { color: #477A0C !important; }
                .text-black { color: black !important; }
                .font-bold { font-weight: bold !important; }
                .font-semibold { font-weight: 600 !important; }
              </style>
            </head>
            <body class="bg-white">
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
      }
    }
  };

  // 🚀 PARTAGE APERÇU AVEC EMAILJS
  const handleSharePreviewViaEmail = async () => {
    if (!invoice.client.email) {
      alert('Veuillez renseigner l\'email du client pour partager l\'aperçu');
      return;
    }

    if (!emailConfigured) {
      alert('Veuillez configurer EmailJS avant de partager l\'aperçu');
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

      setShareStep('🖼️ Conversion en image optimisée...');
      const canvas = await html2canvas(element, {
        scale: 1, // Reduced from 2 to 1 to decrease file size
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0,
        logging: false
      });

      // Convert to JPEG with compression instead of PNG
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8); // JPEG format with 80% quality
      const imageBlob = await fetch(imageDataUrl).then(res => res.blob());
      const imageSizeKB = Math.round(imageBlob.size / 1024);

      console.log(`📊 Taille de l'image: ${imageSizeKB} KB`);

      // Check if image is still too large (updated to 49KB limit)
      if (imageSizeKB > 49) {
        setShareStep('🔧 Optimisation supplémentaire...');
        // Further reduce quality if still too large
        const optimizedImageDataUrl = canvas.toDataURL('image/jpeg', 0.4); // Changed from 0.6 to 0.4 for more aggressive compression
        const optimizedBlob = await fetch(optimizedImageDataUrl).then(res => res.blob());
        const optimizedSizeKB = Math.round(optimizedBlob.size / 1024);
        
        console.log(`📊 Taille optimisée: ${optimizedSizeKB} KB`);
        
        if (optimizedSizeKB <= 49) {
          setShareStep('🚀 Envoi via EmailJS...');
          
          // Envoyer via EmailJS avec l'image optimisée
          const success = await EmailService.sharePreviewViaEmail(
            invoice,
            optimizedImageDataUrl
          );

          if (success) {
            setShareStep('✅ Aperçu partagé !');
            
            const successMessage = `✅ Aperçu partagé avec succès !\n\n` +
              `📸 Image optimisée envoyée à ${invoice.client.email}\n` +
              `🎯 Format JPEG optimisé pour EmailJS\n\n` +
              `🚀 Envoyé via EmailJS\n` +
              `📊 Taille: ${optimizedSizeKB} KB • Format: JPEG optimisé`;
            
            alert(successMessage);
          } else {
            throw new Error('Échec de l\'envoi via EmailJS');
          }
        } else {
          // If still too large, try even more aggressive compression
          setShareStep('🔧 Compression maximale...');
          const maxOptimizedImageDataUrl = canvas.toDataURL('image/jpeg', 0.2); // Even more aggressive compression
          const maxOptimizedBlob = await fetch(maxOptimizedImageDataUrl).then(res => res.blob());
          const maxOptimizedSizeKB = Math.round(maxOptimizedBlob.size / 1024);
          
          console.log(`📊 Taille compression maximale: ${maxOptimizedSizeKB} KB`);
          
          if (maxOptimizedSizeKB <= 49) {
            setShareStep('🚀 Envoi via EmailJS...');
            
            const success = await EmailService.sharePreviewViaEmail(
              invoice,
              maxOptimizedImageDataUrl
            );

            if (success) {
              setShareStep('✅ Aperçu partagé !');
              
              const successMessage = `✅ Aperçu partagé avec succès !\n\n` +
                `📸 Image fortement compressée envoyée à ${invoice.client.email}\n` +
                `🎯 Format JPEG compression maximale pour EmailJS\n\n` +
                `🚀 Envoyé via EmailJS\n` +
                `📊 Taille: ${maxOptimizedSizeKB} KB • Format: JPEG compression maximale`;
              
              alert(successMessage);
            } else {
              throw new Error('Échec de l\'envoi via EmailJS');
            }
          } else {
            throw new Error(`Image trop volumineuse même avec compression maximale (${maxOptimizedSizeKB} KB). Limite EmailJS: 50 KB`);
          }
        }
      } else {
        setShareStep('🚀 Envoi via EmailJS...');
        
        // Envoyer via EmailJS
        const success = await EmailService.sharePreviewViaEmail(
          invoice,
          imageDataUrl
        );

        if (success) {
          setShareStep('✅ Aperçu partagé !');
          
          const successMessage = `✅ Aperçu partagé avec succès !\n\n` +
            `📸 Image optimisée envoyée à ${invoice.client.email}\n` +
            `🎯 Format JPEG optimisé pour EmailJS\n\n` +
            `🚀 Envoyé via EmailJS\n` +
            `📊 Taille: ${imageSizeKB} KB • Format: JPEG optimisé`;
          
          alert(successMessage);
        } else {
          throw new Error('Échec de l\'envoi via EmailJS');
        }
      }

    } catch (error) {
      console.error('❌ Erreur partage aperçu:', error);
      
      const errorMessage = `❌ Erreur lors du partage de l'aperçu\n\n` +
        `🔧 Vérifiez votre configuration EmailJS :\n` +
        `• Assurez-vous que vos identifiants sont corrects\n` +
        `• Vérifiez que votre template est configuré correctement\n` +
        `• Vérifiez votre quota d'emails\n\n` +
        `💡 Erreur: ${error instanceof Error ? error.message : 'Erreur inconnue'}\n\n` +
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
            {/* 🚀 BOUTON PARTAGE APERÇU AVEC EMAILJS */}
            <button
              onClick={handleSharePreviewViaEmail}
              disabled={isSharing || !invoice.client.email || !emailConfigured}
              className="bg-gradient-to-r from-purple-500 to-indigo-500 hover:from-purple-600 hover:to-indigo-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100 disabled:opacity-50"
              title={!invoice.client.email ? "Veuillez renseigner l'email du client" : !emailConfigured ? "Veuillez configurer EmailJS" : "Partager cet aperçu exact via EmailJS"}
            >
              {isSharing ? (
                <>
                  <Loader className="w-4 h-4 animate-spin" />
                  <span>Partage...</span>
                </>
              ) : (
                <>
                  <Share2 size={18} />
                  <Mail size={16} />
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
                <div className="font-semibold text-purple-900">Partage de l'aperçu optimisé avec EmailJS...</div>
                <div className="text-sm text-purple-700">{shareStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions pour votre script */}
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Zap className="w-4 h-4 text-green-600" />
            <span className="font-semibold text-green-900">Votre Script :</span>
            <span className="text-green-800">
              Le bouton "Télécharger PDF" utilise exactement votre configuration html2pdf.js
            </span>
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📋 Configuration: margin: 0, scale: 2, useCORS: true, format: a4, orientation: portrait
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            💡 Le PDF généré sera exactement identique à cet aperçu (WYSIWYG parfait)
          </div>
        </div>

        {/* Instructions pour EmailJS */}
        <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Mail className="w-4 h-4 text-purple-600" />
            <span className="font-semibold text-purple-900">EmailJS :</span>
            <span className="text-purple-800">
              {emailConfigured 
                ? "Votre service d'emails est configuré pour l'envoi automatique !"
                : "⚠️ Veuillez configurer EmailJS pour activer l'envoi d'emails"
              }
            </span>
            {!invoice.client.email && (
              <span className="text-red-600 font-semibold">
                ⚠️ Email client requis
              </span>
            )}
          </div>
          <div className="mt-1 text-xs text-gray-600">
            📎 Format: JPEG optimisé • 🎯 Limite 50KB pour EmailJS
          </div>
          <div className="mt-1 text-xs text-blue-600 font-semibold">
            💡 {emailConfigured 
              ? "Cliquez sur \"Partager Aperçu\" pour envoyer l'image par email"
              : "Configurez EmailJS pour activer l'envoi d'emails"
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
};