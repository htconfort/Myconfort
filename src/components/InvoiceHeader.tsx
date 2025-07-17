import React from 'react';
import { Invoice } from '../types';

interface InvoiceHeaderProps {
  invoice: Invoice;
  onUpdate: (updates: Partial<Invoice>) => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoice, onUpdate }) => {
  return (
    <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 border border-gray-100 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
      <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
        <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
          INFORMATIONS FACTURE
        </span>
      </h2>
      
      <div className="bg-[#F2EFE2] rounded-lg p-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Company Info */}
          <div>
            <h2 className="text-xl font-bold text-black mb-2">
              <strong>MYCONFORT</strong>
            </h2>
            <p className="text-black font-semibold"><strong>88 Avenue des Ternes</strong></p>
            <p className="text-black font-semibold">75017 Paris, France</p>
            <p className="text-black font-semibold">SIRET: 824 313 530 00027</p>
            <p className="text-black font-semibold">Tél: 04 68 50 41 45</p>
            <p className="text-black font-semibold">Email: myconfort@gmail.com</p>
            <p className="text-black font-semibold">Site web: https://www.htconfort.com</p>
          </div>
          
          {/* Invoice Details */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="font-bold text-black">Facture n°:</span>
              <input
                value={invoice.invoiceNumber}
                type="text"
                className="border-2 border-[#477A0C] rounded-lg px-4 py-2 w-32 text-right font-mono text-black bg-white focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all font-bold"
                readOnly
              />
            </div>
            <div className="flex justify-between items-center">
              <span className="font-bold text-black">
                Date: <span className="text-red-600">*</span>
              </span>
              <input
                value={invoice.invoiceDate}
                onChange={(e) => onUpdate({ invoiceDate: e.target.value })}
                type="date"
                required
                className={`border-2 rounded-lg px-4 py-2 text-black bg-white focus:ring-2 focus:ring-[#89BBFE] transition-all font-bold ${
                  !invoice.invoiceDate || invoice.invoiceDate.trim() === '' 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#477A0C] focus:border-[#F55D3E]'
                }`}
              />
            </div>
            {(!invoice.invoiceDate || invoice.invoiceDate.trim() === '') && (
              <p className="text-red-600 text-xs font-semibold">
                ⚠️ La date de la facture est obligatoire
              </p>
            )}
            <div>
              <label className="block font-bold mb-1 text-black">
                Lieu de l'événement: <span className="text-red-600">*</span>
              </label>
              <input
                value={invoice.eventLocation}
                onChange={(e) => onUpdate({ eventLocation: e.target.value })}
                type="text"
                required
                className={`w-full border-2 rounded-lg px-4 py-2 text-black bg-white focus:ring-2 focus:ring-[#89BBFE] transition-all font-bold ${
                  !invoice.eventLocation || invoice.eventLocation.trim() === '' 
                    ? 'border-red-500 focus:border-red-500' 
                    : 'border-[#477A0C] focus:border-[#F55D3E]'
                }`}
                placeholder="Lieu obligatoire (ex: Salon de l'habitat Paris)"
              />
              {(!invoice.eventLocation || invoice.eventLocation.trim() === '') && (
                <p className="text-red-600 text-xs mt-1 font-semibold">
                  ⚠️ Le lieu de l'événement est obligatoire
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
