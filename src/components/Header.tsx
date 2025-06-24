import React from 'react';
import { Save, FileText, User, Send, Users, Package } from 'lucide-react';

interface HeaderProps {
  onSave: () => void;
  onGeneratePDF: () => void;
  onShowClients: () => void;
  onSendEmail: () => void;
  onScrollToClient?: () => void;
  onScrollToProducts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onSave,
  onGeneratePDF,
  onShowClients,
  onSendEmail,
  onScrollToClient,
  onScrollToProducts
}) => {
  return (
    <header className="bg-[#477A0C] shadow-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="text-3xl text-[#F2EFE2]">🛋️</div>
          <h1 className="text-2xl font-extrabold tracking-tight">
            <span className="text-[#F2EFE2]">MY</span>
            <span className="text-[#F2EFE2]">CONFORT</span> 
            <span className="text-lg font-semibold ml-2 text-[#F2EFE2]">Facturation</span>
          </h1>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Navigation rapide */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={onScrollToClient}
              className="bg-[#89BBFE] hover:bg-[#7AA9E8] px-3 py-2 rounded-lg flex items-center space-x-1 font-semibold shadow-md transition-all hover:scale-105"
              title="Aller à la section client"
            >
              <User className="text-[#14281D]" size={16} />
              <span className="hidden lg:inline text-[#14281D] text-sm">Client</span>
            </button>
            
            <button
              onClick={onScrollToProducts}
              className="bg-[#D68FD6] hover:bg-[#C57FC5] px-3 py-2 rounded-lg flex items-center space-x-1 font-semibold shadow-md transition-all hover:scale-105"
              title="Aller à la section produits"
            >
              <Package className="text-[#14281D]" size={16} />
              <span className="hidden lg:inline text-[#14281D] text-sm">Produits</span>
            </button>
          </div>

          {/* Actions principales */}
          <button
            onClick={onSave}
            className="bg-[#F2EFE2] hover:bg-[#E0DED2] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-[3px_3px_0px_0px_rgba(0,0,0,0.2)] transform transition-all hover:translate-x-[-1px] hover:translate-y-[-1px] hover:shadow-[4px_4px_0px_0px_rgba(0,0,0,0.2)]"
            title="Enregistrer le brouillon"
          >
            <Save className="text-[#14281D]" size={18} />
            <span className="hidden md:inline text-[#14281D]">Enregistrer</span>
          </button>
          
          <button
            onClick={onGeneratePDF}
            className="bg-[#89BBFE] hover:bg-[#7AA9E8] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105"
            title="Générer le PDF"
          >
            <FileText className="text-[#14281D]" size={18} />
            <span className="hidden md:inline text-[#14281D]">PDF</span>
          </button>
          
          <button
            onClick={onShowClients}
            className="bg-[#D68FD6] hover:bg-[#C57FC5] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105"
            title="Gérer les clients"
          >
            <Users className="text-[#14281D]" size={18} />
            <span className="hidden md:inline text-[#14281D]">Clients</span>
          </button>
          
          <button
            onClick={onSendEmail}
            className="bg-[#F55D3E] hover:bg-[#E45438] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105"
            title="Envoyer par email"
          >
            <Send className="text-[#14281D]" size={18} />
            <span className="hidden md:inline text-[#14281D]">Envoyer</span>
          </button>
        </div>
      </div>
    </header>
  );
};