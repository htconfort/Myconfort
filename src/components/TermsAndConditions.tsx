import React from "react";

export const TermsAndConditions = () => (
  <div style={{ fontFamily: 'Times New Roman, serif', fontSize: 11, color: '#333', background: 'white', padding: 32 }}>
    <div style={{ textAlign: 'center', marginBottom: 30, borderBottom: '2px solid #333', paddingBottom: 15 }}>
      <h1 style={{ fontSize: 18, fontWeight: 'bold', margin: 0, textTransform: 'uppercase', letterSpacing: 1 }}>Conditions Générales de Vente</h1>
      <div style={{ marginTop: 15, fontSize: 12, fontWeight: 'bold', color: '#d32f2f', textTransform: 'uppercase', letterSpacing: 0.5 }}>
        IMPORTANT : Le consommateur ne bénéficie pas d'un droit de rétractation<br />
        pour un achat effectué dans une foire ou dans un salon.
      </div>
    </div>

    {/* -- Articles CGV, adapte ici avec ton contenu exact si besoin -- */}
    <div style={{ marginBottom: 20, pageBreakInside: 'avoid' }}>
      <div style={{ fontSize: 12, fontWeight: 'bold', color: '#000', marginBottom: 8, borderLeft: '4px solid #333', paddingLeft: 10 }}>
        Art. 1 - Livraison
      </div>
      <div style={{ textAlign: 'justify', marginLeft: 14 }}>
        Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison...
        {/* (mets ici chaque article, copier/coller ton texte html → en JSX) */}
      </div>
    </div>
    {/* ... répète pour chaque article ... */}

    <div style={{ marginTop: 20, textAlign: 'center', fontSize: 10, background: '#f5f5f5', padding: 10, borderRadius: 5 }}>
      <strong>Contact :</strong> myconfort66@gmail.com
    </div>
    <div style={{ marginTop: 30, textAlign: 'center', fontStyle: 'italic', fontSize: 10, borderTop: '1px solid #666', paddingTop: 15 }}>
      Les présentes Conditions générales ont été mises à jour le 23 août 2024<br />
      Version corrigée et mise en conformité - 2024
    </div>
    <div className="no-print" style={{ marginTop: 30, textAlign: 'center', fontSize: 10, color: '#666' }}>
      <p><em>Document prêt pour impression ou conversion PDF</em></p>
      <p><em>Format A4 - Police 11pt - Optimisé pour la lisibilité</em></p>
    </div>
  </div>
);

export default TermsAndConditions;
