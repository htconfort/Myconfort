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
          <div className="bg-blue-100 border-2 border-blue-400 rounded-lg p-4">
            <div className="flex items-center space-x-2 justify-center">
              <Mail className="w-6 h-6 text-blue-600" />
              <div>
                <div className="font-bold text-blue-800">Section informative</div>
                <div className="text-blue-700 font-semibold text-sm">
                  Cette section peut être utilisée pour d'autres fonctionnalités
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};