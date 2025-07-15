import React from 'react';
import { X, FileText, Download, Printer } from 'lucide-react';
import { TermsAndConditions } from './TermsAndConditions';

interface TermsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAccept?: () => void;
  showAcceptButton?: boolean;
}

export const TermsModal: React.FC<TermsModalProps> = ({
  isOpen,
  onClose,
  onAccept,
  showAcceptButton = false
}) => {
  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(`
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Conditions Générales de Vente - MYCONFORT</title>
          <style>
            @page { size: A4; margin: 2cm; }
            body { font-family: 'Times New Roman', serif; font-size: 11pt; line-height: 1.4; color: #333; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 15px; }
            .header h1 { font-size: 18pt; font-weight: bold; margin: 0; text-transform: uppercase; letter-spacing: 1px; }
            .article { margin-bottom: 20px; page-break-inside: avoid; }
            .article-title { font-size: 12pt; font-weight: bold; color: #000; margin-bottom: 8px; border-left: 4px solid #333; padding-left: 10px; }
            .article-content { text-align: justify; margin-left: 14px; }
            .footer { margin-top: 30px; text-align: center; font-style: italic; font-size: 10pt; border-top: 1px solid #666; padding-top: 15px; }
            .contact-info { margin-top: 20px; text-align: center; font-size: 10pt; background-color: #f5f5f5; padding: 10px; border-radius: 5px; }
            .important { margin-top: 15px; font-size: 12pt; font-weight: bold; color: #d32f2f; text-transform: uppercase; letter-spacing: 0.5px; }
          </style>
        </head>
        <body>
          ${document.querySelector('.terms-and-conditions')?.innerHTML || ''}
        </body>
        </html>
      `);
      printWindow.document.close();
      printWindow.print();
    }
  };

  const handleDownloadPDF = () => {
    // Utiliser html2pdf si disponible
    if (typeof window !== 'undefined' && (window as any).html2pdf) {
      const element = document.querySelector('.terms-and-conditions');
      if (element) {
        const opt = {
          margin: [20, 20, 20, 20],
          filename: 'Conditions_Generales_Vente_MYCONFORT.pdf',
          html2canvas: { scale: 2, useCORS: true },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };
        (window as any).html2pdf().set(opt).from(element).save();
      }
    } else {
      // Fallback vers l'impression
      handlePrint();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-[#477A0C] text-white">
          <div className="flex items-center space-x-3">
            <FileText className="w-6 h-6" />
            <h3 className="text-xl font-bold">Conditions Générales de Vente - MYCONFORT</h3>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105"
              title="Imprimer les CGV"
            >
              <Printer size={18} />
              <span>Imprimer</span>
            </button>
            <button
              onClick={handleDownloadPDF}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all hover:scale-105"
              title="Télécharger en PDF"
            >
              <Download size={18} />
              <span>PDF</span>
            </button>
            <button
              onClick={onClose}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white p-2 rounded-lg transition-all hover:scale-105"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-140px)] p-6">
          <TermsAndConditions />
        </div>

        {/* Footer avec boutons d'action */}
        {showAcceptButton && (
          <div className="border-t p-4 bg-gray-50 flex justify-between items-center">
            <div className="text-sm text-gray-600">
              En acceptant, vous confirmez avoir lu et accepté les conditions générales de vente.
            </div>
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
              >
                Fermer
              </button>
              {onAccept && (
                <button
                  onClick={() => {
                    onAccept();
                    onClose();
                  }}
                  className="bg-[#477A0C] hover:bg-[#3A6A0A] text-white px-6 py-2 rounded-lg font-bold transition-all"
                >
                  J'accepte les CGV
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};