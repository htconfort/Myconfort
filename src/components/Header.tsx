import React from 'react';
import { Users, Package, Building2, Archive, UploadCloud as CloudUpload } from 'lucide-react';

interface HeaderProps {
  onGeneratePDF: () => void;
  onShowClients: () => void;
  onShowInvoices: () => void;
  onShowProducts: () => void;
  onShowGoogleDrive: () => Promise<void>;
  onScrollToClient?: () => void;
  onScrollToProducts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGeneratePDF,
  onShowClients,
  onShowInvoices,
  onShowProducts,
  onShowGoogleDrive
}) => {
  return (
    <header className="bg-gradient-to-r from-[#477A0C] to-[#5A8F0F] shadow-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white/20 p-2 rounded-full">
            <Building2 className="w-6 h-6 text-[#F2EFE2]" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#F2EFE2]">
              MYCONFORT
            </h1>
            <p className="text-[#F2EFE2]/80 text-sm font-medium">Facturation professionnelle avec signature électronique</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Actions principales */}
          <button
            onClick={onShowProducts}
            className="bg-[#F2EFE2] hover:bg-white px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-black"
            title="Gérer les produits"
          >
            <Package size={18} />
            <span className="hidden md:inline">Produits</span>
          </button>

          <button
            onClick={onShowInvoices}
            className="bg-[#14281D] hover:bg-[#0F1F15] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-[#F2EFE2]"
            title="Voir toutes les factures"
          >
            <Archive size={18} />
            <span className="hidden md:inline">Factures</span>
          </button>
          
          <button
            onClick={onShowClients}
            className="bg-[#D68FD6] hover:bg-[#C67FC6] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-[#14281D]"
            title="Gérer les clients"
          >
            <Users size={18} />
            <span className="hidden md:inline">Clients</span>
          </button>
          
          <button
            onClick={onShowGoogleDrive}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white"
            title="Envoyer la facture vers Google Drive"
          >
            <CloudUpload size={18} />
            <span className="hidden md:inline">📤 Drive</span>
          </button>
        </div>
      </div>
    </header>
  );
};
