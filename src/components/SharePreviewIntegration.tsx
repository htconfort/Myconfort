import React from 'react';
import { useSharePreview } from '../hooks/useSharePreview';
import { Share2 } from 'lucide-react';
import { Invoice } from '../types';

interface SharePreviewIntegrationProps {
  clientEmail?: string;
  invoiceNumber: string;
  className?: string;
  invoice?: Invoice; // Optionnel : objet Invoice complet
  clientName?: string; // Optionnel : nom du client
}

const SharePreviewIntegration: React.FC<SharePreviewIntegrationProps> = ({
  clientEmail,
  invoiceNumber,
  className,
  invoice,
  clientName
}) => {
  const { 
    shareByEmail, 
    isSharing, 
    shareProgress 
  } = useSharePreview();

  const handleShare = async () => {
    console.log('🚀 Bouton de partage rapide cliqué !', { clientEmail, invoiceNumber });
    
    if (!clientEmail) {
      alert('⚠️ Veuillez renseigner l\'email du client');
      return;
    }

    // SOLUTION 1: Si vous avez déjà un objet Invoice complet
    if (invoice) {
      console.log('📄 Utilisation de l\'objet Invoice fourni');
      try {
        const result = await shareByEmail(invoice, clientEmail);
        
        if (result.success) {
          let message = '✅ Partage réussi !\n\n';
          if (result.pdfGenerated) message += '📄 PDF généré et téléchargé\n';
          if (result.emailSent) message += '📧 Email envoyé avec succès\n';
          
          alert(message);
        } else {
          alert(`❌ Erreur lors du partage : ${result.error}`);
        }
      } catch (error) {
        console.error('❌ Erreur partage rapide:', error);
        alert('❌ Erreur lors du partage. Vérifiez la console.');
      }
      return;
    }

    // SOLUTION 2: Créer un objet Invoice minimal avec TOUTES les propriétés correctes
    const invoiceData: Invoice = {
      invoiceNumber,
      client: {
        email: clientEmail,
        name: clientName || 'Client',
        address: '',
        city: '',
        postalCode: '',
        phone: ''
      },
      invoiceDate: new Date().toISOString().split('T')[0],
      products: [],
      payment: {
        method: '',
        depositAmount: 0
      },
      advisorName: 'MYCONFORT',
      eventLocation: '',
      invoiceNotes: '',
      termsAccepted: false,
      taxRate: 0,
      delivery: {
        method: '',  // ✅ Propriété DeliveryInfo correcte
        notes: ''    // ✅ Propriété DeliveryInfo correcte
      }
    };

    console.log('📄 Données facture créées pour partage:', invoiceData);

    try {
      const result = await shareByEmail(invoiceData, clientEmail);
      
      if (result.success) {
        let message = '✅ Partage réussi !\n\n';
        if (result.pdfGenerated) message += '📄 PDF généré et téléchargé\n';
        if (result.emailSent) message += '📧 Email envoyé avec succès\n';
        
        alert(message);
      } else {
        alert(`❌ Erreur lors du partage : ${result.error}`);
      }
    } catch (error) {
      console.error('❌ Erreur partage rapide:', error);
      alert('❌ Erreur lors du partage. Vérifiez la console pour plus de détails.');
    }
  };

  // Affichage dynamique selon l'état
  const getButtonContent = () => {
    if (isSharing) {
      return (
        <>
          <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full"></div>
          <span>{shareProgress.message || 'Partage en cours...'}</span>
        </>
      );
    }
    
    return (
      <>
        <Share2 size={18} />
        <span>Partager Aperçu</span>
      </>
    );
  };

  return (
    <button 
      onClick={handleShare} 
      disabled={isSharing || !clientEmail}
      className={`${className} ${
        isSharing ? 'opacity-50 cursor-not-allowed' : ''
      } ${
        !clientEmail ? 'opacity-50 cursor-not-allowed' : 'hover:opacity-80'
      }`}
      style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '0.5rem',
        minWidth: '140px',
        justifyContent: 'center'
      }}
      title={!clientEmail ? 'Email client requis' : 'Générer PDF et envoyer par email'}
    >
      {getButtonContent()}
    </button>
  );
};

export default SharePreviewIntegration;