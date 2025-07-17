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
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded shadow mb-4">
            <strong>⛔ Article L224-59 du Code de la consommation</strong><br />
            « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d\'une foire, d'un salon […] le professionnel informe le consommateur qu\'il ne dispose pas d'un délai de rétractation. »
          </div>
        </div>
      </div>
    </>
  );
};
