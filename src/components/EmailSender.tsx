import React from 'react';
import { Download, FileText } from 'lucide-react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { PDFService } from '../services/pdfService';
import { GoogleDriveButton } from './GoogleDriveButton';

interface EmailSenderProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  isValid: boolean;
}

export const EmailSender: React.FC<EmailSenderProps> = ({
  invoice,
  onSuccess,
  onError,
  isValid
}) => {
  const totalTTC = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

  const acompteAmount = invoice.payment.depositAmount || 0;
  const montantRestant = totalTTC - acompteAmount;

  const handleGeneratePDF = async () => {
    if (!isValid) {
      onError('Veuillez compléter tous les champs obligatoires');
      return;
    }

    try {
      await PDFService.generatePDF(invoice);
      onSuccess('PDF généré avec succès');
    } catch (error) {
      onError('Erreur lors de la génération du PDF');
    }
  };

  return (
    <div className="bg-[#477A0C] rounded-xl shadow-lg p-6 mb-6">
      <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
        <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
          ACTIONS FACTURE
        </span>
      </h2>
      
      <div className="bg-[#F2EFE2] rounded-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="bg-[#477A0C] p-3 rounded-full">
              <FileText className="w-8 h-8 text-[#F2EFE2]" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-black">Facture {invoice.invoiceNumber}</h3>
              <p className="text-black font-semibold">
                Total: {formatCurrency(totalTTC)}
                {acompteAmount > 0 && (
                  <span className="text-orange-600 ml-2">
                    (Reste: {formatCurrency(montantRestant)})
                  </span>
                )}
              </p>
            </div>
          </div>
          
          <div className="text-right">
            <div className="text-sm text-black mb-1 font-bold">Statut</div>
            {isValid ? (
              <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ✅ PRÊTE
              </div>
            ) : (
              <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                ⚠️ INCOMPLÈTE
              </div>
            )}
          </div>
        </div>

        {/* Actions principales */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Génération PDF */}
          <button
            onClick={handleGeneratePDF}
            disabled={!isValid}
            className={`w-full px-6 py-3 rounded-xl font-bold text-lg flex items-center justify-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg ${
              isValid 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white' 
                : 'bg-gray-400 text-gray-600 cursor-not-allowed'
            }`}
          >
            <Download className="w-6 h-6" />
            <span>Télécharger PDF</span>
          </button>

          {/* Google Drive */}
          <div className="w-full">
            <GoogleDriveButton 
              invoice={invoice} 
              disabled={!isValid}
              className="w-full px-6 py-3 text-lg font-bold"
            />
          </div>
        </div>

        <div className="mt-4 text-center text-sm text-black">
          <p className="font-bold">
            {isValid 
              ? '✅ Facture prête pour export et sauvegarde'
              : '⚠️ Complétez les informations manquantes'
            }
          </p>
        </div>
      </div>
    </div>
  );
};