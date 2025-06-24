import React from 'react';
import { Save, FileText, User, Send, Users, Package, Zap } from 'lucide-react';

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
    <header className="bg-gradient-to-r from-blue-600 to-blue-700 shadow-xl sticky top-0 z-40">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="bg-white rounded-lg p-2">
            <Zap className="w-8 h-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-white">
              FactuFlash
            </h1>
            <p className="text-blue-100 text-sm font-medium">Facturation Professionnelle</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 md:space-x-4">
          {/* Navigation rapide */}
          <div className="hidden md:flex items-center space-x-2">
            <button
              onClick={onScrollToClient}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center space-x-1 font-semibold shadow-md transition-all hover:scale-105 text-white"
              title="Aller à la section client"
            >
              <User size={16} />
              <span className="hidden lg:inline text-sm">Client</span>
            </button>
            
            <button
              onClick={onScrollToProducts}
              className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg flex items-center space-x-1 font-semibold shadow-md transition-all hover:scale-105 text-white"
              title="Aller à la section produits"
            >
              <Package size={16} />
              <span className="hidden lg:inline text-sm">Produits</span>
            </button>
          </div>

          {/* Actions principales */}
          <button
            onClick={onSave}
            className="bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white"
            title="Enregistrer le brouillon"
          >
            <Save size={18} />
            <span className="hidden md:inline">Enregistrer</span>
          </button>
          
          <button
            onClick={onGeneratePDF}
            className="bg-green-500 hover:bg-green-600 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white"
            title="Générer le PDF"
          >
            <FileText size={18} />
            <span className="hidden md:inline">PDF</span>
          </button>
          
          <button
            onClick={onShowClients}
            className="bg-purple-500 hover:bg-purple-600 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white"
            title="Gérer les clients"
          >
            <Users size={18} />
            <span className="hidden md:inline">Clients</span>
          </button>
          
          <button
            onClick={onSendEmail}
            className="bg-orange-500 hover:bg-orange-600 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white"
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