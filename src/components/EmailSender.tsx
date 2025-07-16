import React from 'react';
import { Mail } from 'lucide-react';
import { Invoice } from '../types';

interface EmailSenderProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
  onShowConfig: () => void;
}

export const EmailSender: React.FC<EmailSenderProps> = ({
  invoice,
  onSuccess,
  onError
}) => {
  return (
    <>
      <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
        <Mail className="mr-3 text-xl" />
        <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
          INFORMATIONS GÉNÉRALES
        </span>
      </h2>
      
      <div className="bg-[#F2EFE2] rounded-lg p-6">
        <div className="text-center">
          {/* Mention légale Article L224-59 */}
          <div className="bg-red-50 border-2 border-red-300 rounded-lg p-4">
            <div className="text-red-800">
              <div className="font-bold text-sm mb-2 flex items-center justify-center">
                <span className="mr-2">⚖️</span>
                Article L224‑59 du Code de la consommation
              </div>
              <div className="text-xs leading-relaxed italic">
                « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon […] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
              </div>
              <div className="mt-2 text-xs font-semibold text-red-700">
                ℹ️ Information obligatoire pour les ventes en foire/salon
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};