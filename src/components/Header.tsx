import React from 'react';
import { FileText, Send, Users, Package, Building2, Archive } from 'lucide-react';

interface HeaderProps {
  onGeneratePDF: () => void;
  onShowClients: () => void;
  onSendEmail: () => void;
  onShowInvoices: () => void;
  onShowProducts: () => void;
  onScrollToClient?: () => void;
  onScrollToProducts?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onGeneratePDF,
  onShowClients,
  onSendEmail,
  onShowInvoices,
  onShowProducts
}) => {
  const handleTestPDF = () => {
    // Use your exact script configuration
    const element = document.querySelector('.facture-apercu') || document.getElementById('invoice');
    if (!element) {
      alert('❌ Élément facture non trouvé. Assurez-vous qu\'une facture est affichée.');
      return;
    }
    
    const opt = {
      margin: 0,
      filename: 'facture_MYCONFORT.pdf',
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    console.log('🔄 Génération PDF avec votre script exact...');
    // @ts-ignore - html2pdf is loaded globally
    html2pdf().set(opt).from(element).save().then(() => {
      console.log('✅ PDF généré avec succès !');
      alert('✅ PDF téléchargé avec succès !');
    }).catch((error: any) => {
      console.error('❌ Erreur génération PDF:', error);
      alert('❌ Erreur lors de la génération du PDF');
    });
  };

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
          {/* Bouton de test PDF avec votre script exact */}
          <button
            onClick={handleTestPDF}
            className="bg-purple-500 hover:bg-purple-600 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white"
            title="📄 Télécharger PDF avec votre script exact"
          >
            <FileText size={18} />
            <span className="hidden md:inline">Test PDF</span>
          </button>

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
            onClick={onGeneratePDF}
            className="bg-[#F55D3E] hover:bg-[#E54D2E] px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-[#F2EFE2]"
            title="Générer le PDF"
          >
            <FileText size={18} />
            <span className="hidden md:inline">PDF</span>
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
            onClick={onSendEmail}
            className="bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 px-3 md:px-4 py-2 md:py-3 rounded-lg flex items-center space-x-2 font-bold shadow-md transition-all hover:scale-105 text-white"
            title="Configurer EmailJS"
          >
            <Send size={18} />
            <span className="hidden md:inline">EmailJS</span>
          </button>
        </div>
      </div>
    </header>
  );
};