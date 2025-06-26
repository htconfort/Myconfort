import React from 'react';
import { FileText, Download, TestTube, Home } from 'lucide-react';

export const TestInvoiceComponent: React.FC = () => {
  const testYourScript = () => {
    console.log('🧪 TEST DE VOTRE SCRIPT EXACT DEPUIS REACT');
    
    // Chercher l'élément .facture-apercu
    const element = document.querySelector('.facture-apercu') as HTMLElement;
    
    if (!element) {
      alert('❌ Élément .facture-apercu non trouvé');
      return;
    }
    
    // VOTRE CONFIGURATION EXACTE
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
      alert('✅ PDF téléchargé avec succès avec votre script exact !');
    }).catch((error: any) => {
      console.error('❌ Erreur génération PDF:', error);
      alert('❌ Erreur lors de la génération du PDF');
    });
  };

  const testWithAlternativeElement = () => {
    console.log('🧪 TEST AVEC ÉLÉMENT ALTERNATIF');
    
    const element = document.getElementById('test-invoice') as HTMLElement;
    
    if (!element) {
      alert('❌ Élément #test-invoice non trouvé');
      return;
    }
    
    const opt = {
      margin: 0,
      filename: 'test_invoice_react.pdf',
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
    };
    
    // @ts-ignore - html2pdf is loaded globally
    html2pdf().set(opt).from(element).save().then(() => {
      console.log('✅ PDF React généré avec succès !');
      alert('✅ PDF React téléchargé avec succès !');
    }).catch((error: any) => {
      console.error('❌ Erreur PDF React:', error);
      alert('❌ Erreur lors de la génération du PDF React');
    });
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-[#477A0C] flex items-center space-x-2">
          <TestTube className="w-6 h-6" />
          <span>Test Invoice Component</span>
        </h2>
      </div>

      {/* Facture de test avec classe .facture-apercu */}
      <div className="border-2 border-[#477A0C] rounded-lg mb-6 overflow-hidden">
        <div 
          id="test-invoice" 
          className="facture-apercu bg-white p-6"
          style={{ fontFamily: 'Arial', maxWidth: '600px', margin: 'auto' }}
        >
          <h2 style={{ color: '#477A0C', marginBottom: '20px' }}>MYCONFORT - Facture</h2>
          <p><strong>Date :</strong> 26/06/2025</p>
          <p><strong>Facture n° :</strong> 2025-6304</p>
          <hr style={{ border: '1px solid #477A0C', margin: '15px 0' }} />
          <p><strong>Client :</strong> Monsieur Dupont</p>
          <p><strong>Produit :</strong> Matelas Confort</p>
          <p><strong>Montant TTC :</strong> 299,00 €</p>
          <hr style={{ border: '1px solid #477A0C', margin: '15px 0' }} />
          <p style={{ textAlign: 'center', color: '#477A0C', fontWeight: 'bold' }}>
            Merci pour votre confiance 🌸
          </p>
        </div>
      </div>

      {/* Boutons de test */}
      <div className="flex flex-wrap gap-3 justify-center">
        <button
          onClick={testYourScript}
          className="bg-[#477A0C] hover:bg-[#3A6A0A] text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-bold transition-all transform hover:scale-105"
        >
          <FileText className="w-5 h-5" />
          <span>Tester Votre Script Exact</span>
        </button>
        
        <button
          onClick={testWithAlternativeElement}
          className="bg-[#89BBFE] hover:bg-[#6BA8FD] text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-bold transition-all transform hover:scale-105"
        >
          <TestTube className="w-5 h-5" />
          <span>Test Élément React</span>
        </button>
        
        <button
          onClick={() => window.open('/test-invoice.html', '_blank')}
          className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg flex items-center space-x-2 font-bold transition-all transform hover:scale-105"
        >
          <Home className="w-5 h-5" />
          <span>Page Test Dédiée</span>
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-green-50 border-2 border-green-200 rounded-lg p-4">
        <h3 className="text-green-800 font-bold mb-2">📋 Instructions de test :</h3>
        <ul className="text-green-700 text-sm space-y-1">
          <li><strong>Tester Votre Script Exact</strong> : Utilise votre configuration avec l'élément .facture-apercu</li>
          <li><strong>Test Élément React</strong> : Teste avec l'ID #test-invoice dans React</li>
          <li><strong>Page Test Dédiée</strong> : Ouvre une page HTML dédiée aux tests</li>
        </ul>
      </div>

      {/* Configuration affichée */}
      <div className="mt-4 bg-gray-50 border border-gray-200 rounded-lg p-4">
        <h4 className="font-bold text-gray-800 mb-2">🎯 Votre configuration :</h4>
        <pre className="text-xs bg-white p-3 rounded border overflow-x-auto">
{`const opt = {
  margin: 0,
  filename: 'facture_MYCONFORT.pdf',
  html2canvas: { scale: 2, useCORS: true },
  jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
};
html2pdf().set(opt).from(element).save();`}
        </pre>
      </div>
    </div>
  );
};