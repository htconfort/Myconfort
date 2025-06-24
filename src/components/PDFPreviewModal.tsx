import React from 'react';
import { X, Download, Printer } from 'lucide-react';
import { Modal } from './ui/Modal';
import { InvoicePDF } from './InvoicePDF';
import { Invoice } from '../types';

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
              <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Manrope', sans-serif; margin: 0; padding: 0; }
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b bg-[#477A0C] text-white">
          <h3 className="text-xl font-bold">Aperçu de la facture {invoice.invoiceNumber}</h3>
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePrint}
              className="bg-[#89BBFE] hover:bg-[#7AA9E8] text-[#14281D] px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all"
            >
              <Printer size={18} />
              <span>Imprimer</span>
            </button>
            <button
              onClick={onDownload}
              className="bg-[#F55D3E] hover:bg-[#E45438] text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-semibold transition-all"
            >
              <Download size={18} />
              <span>Télécharger PDF</span>
            </button>
            <button
              onClick={onClose}
              className="bg-gray-500 hover:bg-gray-600 text-white p-2 rounded-lg transition-all"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="overflow-auto max-h-[calc(90vh-80px)] bg-gray-100 p-4">
          <div id="pdf-preview-content">
            <InvoicePDF invoice={invoice} isPreview={true} />
          </div>
        </div>
      </div>
    </div>
  );
};