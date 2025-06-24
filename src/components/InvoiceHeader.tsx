import React from 'react';
import { Invoice } from '../types';

interface InvoiceHeaderProps {
  invoice: Invoice;
  onUpdate: (updates: Partial<Invoice>) => void;
}

export const InvoiceHeader: React.FC<InvoiceHeaderProps> = ({ invoice, onUpdate }) => {
  return (
    <div className="bg-white rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 border border-gray-100 transform transition-all hover:scale-[1.005]">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Company Info */}
        <div>
          <h2 className="text-xl font-bold text-[#14281D] mb-2">
            <strong>MYCONFORT</strong>
          </h2>
          <p className="text-[#14281D]"><strong>88 Avenue des Ternes</strong></p>
          <p className="text-[#14281D]">75017 Paris, France</p>
          <p className="text-[#14281D]">SIRET: 824 313 530 00027</p>
          <p className="text-[#14281D]">Tél: 04 68 50 41 45</p>
          <p className="text-[#14281D]">Email: myconfort@gmail.com</p>
          <p className="text-[#14281D]">Site web: https://www.htconfort.com</p>
        </div>
        
        {/* Invoice Details */}
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#14281D]">Facture n°:</span>
            <input
              value={invoice.invoiceNumber}
              type="text"
              className="border-b border-gray-300 px-2 py-1 w-32 text-right font-mono text-[#14281D] bg-gray-100"
              readOnly
            />
          </div>
          <div className="flex justify-between items-center">
            <span className="font-semibold text-[#14281D]">Date:</span>
            <input
              value={invoice.invoiceDate}
              onChange={(e) => onUpdate({ invoiceDate: e.target.value })}
              type="date"
              className="border-b border-gray-300 px-2 py-1 text-[#14281D]"
            />
          </div>
          <div>
            <label className="block font-semibold mb-1 text-[#14281D]">
              Lieu de l'événement:
            </label>
            <input
              value={invoice.eventLocation}
              onChange={(e) => onUpdate({ eventLocation: e.target.value })}
              type="text"
              className="w-full border-b border-gray-300 px-2 py-1 text-[#14281D]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};