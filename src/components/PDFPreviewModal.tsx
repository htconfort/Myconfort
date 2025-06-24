import React, { useState } from 'react';
import { X, Download, Printer, FileText, Share2, Mail, Camera, Zap, Loader } from 'lucide-react';
import { Modal } from './ui/Modal';
import { InvoicePDF } from './InvoicePDF';
import { Invoice } from '../types';
import { EmailService } from '../services/emailService';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
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

  // Calculer le total pour l'email
  const totalAmount = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

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

  // 🎯 NOUVELLE FONCTIONNALITÉ : Partager l'aperçu exact par email
  const handleSharePreviewByEmail = async () => {
    if (!invoice.client.email) {
      alert('Veuillez renseigner l\'email du client pour partager l\'aperçu');
      return;
    }

    setIsSharing(true);

    try {
      // Étape 1: Capturer l'aperçu visuel exact
      setShareStep('📸 Capture de l\'aperçu exact...');
      const previewElement = document.getElementById('pdf-preview-content');
      
      if (!previewElement) {
        throw new Error('Aperçu non trouvé');
      }

      // Capturer avec html2canvas pour avoir exactement ce que vous voyez
      const canvas = await html2canvas(previewElement, {
        scale: 2, // Haute qualité
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        width: previewElement.scrollWidth,
        height: previewElement.scrollHeight,
        scrollX: 0,
        scrollY: 0
      });

      // Étape 2: Convertir en image haute qualité
      setShareStep('🖼️ Conversion en image haute qualité...');
      const imageDataUrl = canvas.toDataURL('image/png', 1.0);
      const imageBlob = await fetch(imageDataUrl).then(res => res.blob());
      const imageSizeKB = Math.round(imageBlob.size / 1024);

      // Étape 3: Préparer l'email avec l'image de l'aperçu
      setShareStep('📧 Envoi de l\'aperçu exact par email...');
      
      // Convertir l'image en base64 pour EmailJS
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];

        try {
          // Message personnalisé pour l'aperçu partagé
          const acompteAmount = invoice.payment.depositAmount || 0;
          const montantRestant = totalAmount - acompteAmount;
          
          let customMessage = `Bonjour ${invoice.client.name},\n\n`;
          customMessage += `Voici l'aperçu de votre facture n°${invoice.invoiceNumber} tel qu'il apparaît dans notre système.\n\n`;
          
          if (acompteAmount > 0) {
            customMessage += `💰 ACOMPTE VERSÉ: ${formatCurrency(acompteAmount)}\n`;
            customMessage += `💳 MONTANT RESTANT À PAYER: ${formatCurrency(montantRestant)}\n\n`;
          } else {
            customMessage += `💳 MONTANT TOTAL: ${formatCurrency(totalAmount)}\n\n`;
          }
          
          if (invoice.signature) {
            customMessage += '✓ Cette facture a été signée électroniquement.\n\n';
          }
          
          customMessage += `L'image ci-jointe montre exactement l'aperçu de votre facture tel qu'il apparaît dans notre système.\n\n`;
          customMessage += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}\n\n`;
          customMessage += `---\nMYCONFORT - Aperçu de facture partagé directement depuis notre système`;

          // Envoyer avec EmailJS en utilisant l'image comme pièce jointe
          const templateParams = {
            to_email: invoice.client.email,
            to_name: invoice.client.name,
            from_name: invoice.advisorName || 'MYCONFORT',
            invoice_number: invoice.invoiceNumber,
            invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
            total_amount: formatCurrency(totalAmount),
            message: customMessage,
            
            // 📸 IMAGE DE L'APERÇU COMME PIÈCE JOINTE
            invoice_pdf: base64Image, // Utiliser le même champ mais avec l'image
            pdf_filename: `apercu_facture_${invoice.invoiceNumber}.png`,
            pdf_size: imageSizeKB,
            
            // Informations supplémentaires
            reply_to: 'myconfort@gmail.com',
            company_name: 'MYCONFORT',
            company_address: '88 Avenue des Ternes, 75017 Paris',
            company_phone: '04 68 50 41 45',
            company_email: 'myconfort@gmail.com',
            app_name: 'MYCONFORT - Aperçu Bolt',
            generated_date: new Date().toLocaleDateString('fr-FR'),
            generated_time: new Date().toLocaleTimeString('fr-FR')
          };

          const success = await EmailService.sendInvoiceByEmail(
            { output: () => ({ blob: () => imageBlob }) }, // Mock PDF object
            invoice, 
            customMessage
          );

          if (success) {
            setShareStep('✅ Aperçu partagé !');
            alert(`✅ Aperçu exact partagé avec succès !\n\n📸 Image haute qualité (${imageSizeKB} KB) envoyée à ${invoice.client.email}\n\n🎯 Le client recevra exactement ce que vous voyez dans Bolt !`);
          } else {
            throw new Error('Erreur lors de l\'envoi');
          }
        } catch (error) {
          console.error('Erreur partage aperçu:', error);
          alert('❌ Erreur lors du partage de l\'aperçu. Vérifiez votre configuration EmailJS.');
        }
      };

      reader.readAsDataURL(imageBlob);

    } catch (error) {
      console.error('Erreur capture aperçu:', error);
      alert('❌ Erreur lors de la capture de l\'aperçu');
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
            {/* 🎯 NOUVEAU BOUTON : Partager l'aperçu exact */}
            <button
              onClick={handleSharePreviewByEmail}
              disabled={isSharing || !invoice.client.email}
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105 disabled:hover:scale-100"
              title={!invoice.client.email ? "Veuillez renseigner l'email du client" : "Partager cet aperçu exact par email"}
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
                <div className="font-semibold text-orange-900">Partage de l'aperçu exact en cours...</div>
                <div className="text-sm text-orange-700">{shareStep}</div>
              </div>
            </div>
          </div>
        )}

        {/* Instructions pour le partage */}
        <div className="bg-gradient-to-r from-blue-50 to-green-50 border-b p-3">
          <div className="flex items-center space-x-2 text-sm">
            <Zap className="w-4 h-4 text-blue-600" />
            <span className="font-semibold text-blue-900">Nouveau :</span>
            <span className="text-blue-800">
              Le bouton "Partager Aperçu" envoie par email exactement ce que vous voyez ici, sans conversion PDF !
            </span>
            {!invoice.client.email && (
              <span className="text-red-600 font-semibold">
                ⚠️ Email client requis
              </span>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-140px)] bg-gray-100 p-4">
          <div id="pdf-preview-content">
            <InvoicePDF invoice={invoice} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
};