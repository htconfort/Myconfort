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
    <header className="bg-gradient-to-r from-[#477A0C] to-[#5A8F0F] shadow-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-[#F2EFE2] rounded-lg p-2">
            <img 
              src="/public/logo.svg" 
              alt="MYCONFORT Logo" 
              className="w-8 h-8"
              onError={(e) => {
                // Fallback si le logo ne charge pas
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                target.nextElementSibling?.classList.remove('hidden');
              }}
            />
            <div className="hidden w-8 h-8 bg-[#477A0C] rounded flex items-center justify-center">
              <span className="text-[#F2EFE2] font-bold text-lg">M</span>
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#F2EFE2]">
              MYCONFORT
            </h1>
            <p className="text-[#F2EFE2]/80 text-sm font-medium">Facturation Professionnelle</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Navigation rapide */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={onScrollToClient}
              className="bg-[#F2EFE2]/10 hover:bg-[#F2EFE2]/20 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center space-x-1 font-semibold shadow-md transition-all hover:scale-105 text-[#F2EFE2]"
              title="Aller à la section client"
            >
              <User size={16} />
              <span className="hidden lg:inline text-sm">Client</span>
            </button>
            
            <button
              onClick={onScrollToProducts}
              className="bg-[#F2EFE2]/10 hover:bg-[#F2EFE2]/20 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center space-x-1 font-semibold shadow-md transition-all hover:scale-105 text-[#F2EFE2]"
              title="Aller à la section produits"
            >
              <Package size={16} />
              <span className="hidden lg:inline text-sm">Produits</span>
            </button>
          </div>

          {/* Actions principales */}
          <button
            onClick={onSave}
            className="bg-[#F2EFE2]/10 hover:bg-[#F2EFE2]/20 backdrop-blur-sm px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-[#F2EFE2]"
            title="Enregistrer le brouillon"
          >
            <Save size={18} />
            <span className="hidden md:inline">Enregistrer</span>
          </button>
          
          <button
            onClick={onGeneratePDF}
            className="bg-[#F55D3E] hover:bg-[#E54D2E] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-[#F2EFE2]"
            title="Générer le PDF"
          >
            <FileText size={18} />
            <span className="hidden md:inline">PDF</span>
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
            onClick={onSendEmail}
            className="bg-[#89BBFE] hover:bg-[#79ABEE] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-[#14281D]"
            title="Envoyer par email"
          >
            <Send size={18} />
            <span className="hidden md:inline">Envoyer</span>
          </button>
        </div>
      </div>
    </header>
  );
};