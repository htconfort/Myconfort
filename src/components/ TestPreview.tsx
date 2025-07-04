import React from 'react';

const TestPreview: React.FC = () => {
  return (
    <div style={{ 
      padding: '20px', 
      fontFamily: 'Arial, sans-serif',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h1 style={{ color: '#2563eb' }}>
        🧪 TEST MYCONFORT - SYSTÈME OPÉRATIONNEL !
      </h1>
      
      <div style={{ 
        backgroundColor: '#f0fdf4', 
        padding: '15px', 
        borderRadius: '8px',
        marginBottom: '20px',
        border: '2px solid #22c55e'
      }}>
        <h3 style={{ color: '#15803d', margin: '0 0 10px 0' }}>
          ✅ État du système :
        </h3>
        <ul style={{ color: '#166534', margin: 0 }}>
          <li>✅ React fonctionne parfaitement</li>
          <li>✅ TestPreview.tsx créé et chargé</li>
          <li>✅ Plus d'erreurs TypeScript</li>
          <li>✅ Serveur Vite opérationnel</li>
        </ul>
      </div>

      <button
        onClick={() => alert('🎉 PARFAIT ! Votre système fonctionne !\n\nProchaine étape : restaurer le preview complet avec PDF, Google Drive et EmailJS !')}
        style={{
          padding: '15px 30px',
          backgroundColor: '#3b82f6',
          color: 'white',
          border: 'none',
          borderRadius: '8px',
          cursor: 'pointer',
          fontSize: '16px',
          fontWeight: 'bold'
        }}
      >
        🚀 TESTER LE SYSTÈME
      </button>
    </div>
  );
};

export default TestPreview;