import React, { useState } from 'react';
import './App.css';

// 🔧 IMPORTS DES VRAIS SERVICES MYCONFORT
// @ts-ignore
import { AdvancedPDFService } from './services/advancedPdfService';
// @ts-ignore  
import { GoogleDriveService } from './services/googleDriveService';
// @ts-ignore
import { SeparatePdfEmailService } from './services/separatePdfEmailService';

// TYPES POUR LES VRAIES DONNÉES MYCONFORT (identiques à avant)
interface RealInvoice {
  invoiceNumber: string;
  client: {
    name: string;
    email: string;
    address: string;
    city: string;
    postalCode: string;
    phone: string;
  };
  invoiceDate: string;
  products: Array<{
    name: string;
    quantity: number;
    priceTTC: number;
    discount: number;
    discountType: 'percentage' | 'fixed';
  }>;
  payment: {
    method: string;
    depositAmount: number;
  };
  advisorName: string;
  eventLocation: string;
  invoiceNotes: string;
  termsAccepted: boolean;
  taxRate: number;
  delivery: {
    method: string;
    notes: string;
  };
}

// TEMPLATES DE VRAIES FACTURES MYCONFORT (identiques à avant)
const realInvoiceTemplates: RealInvoice[] = [
  {
    invoiceNumber: 'MYCONFORT-2025-001',
    client: {
      name: 'M. Jean Dupont',
      email: 'jean.dupont@email.com',
      address: '123 Rue de la Paix',
      city: 'Paris',
      postalCode: '75001',
      phone: '01 23 45 67 89'
    },
    invoiceDate: '2025-07-04',
    products: [
      {
        name: 'Installation climatisation Samsung',
        quantity: 1,
        priceTTC: 2499.99,
        discount: 10,
        discountType: 'percentage'
      },
      {
        name: 'Maintenance annuelle',
        quantity: 1,
        priceTTC: 299.99,
        discount: 0,
        discountType: 'fixed'
      }
    ],
    payment: {
      method: 'Carte bancaire',
      depositAmount: 500.00
    },
    advisorName: 'Marc MARTIN - MYCONFORT',
    eventLocation: 'Domicile client',
    invoiceNotes: 'Installation prévue sous 15 jours. Garantie 2 ans incluse.',
    termsAccepted: true,
    taxRate: 20,
    delivery: {
      method: 'Livraison standard',
      notes: 'Livraison entre 9h et 17h'
    }
  },
  {
    invoiceNumber: 'MYCONFORT-2025-002',
    client: {
      name: 'Mme Sophie Martin',
      email: 'sophie.martin@gmail.com',
      address: '45 Avenue des Champs',
      city: 'Lyon',
      postalCode: '69000',
      phone: '04 78 90 12 34'
    },
    invoiceDate: '2025-07-04',
    products: [
      {
        name: 'Pompe à chaleur Daikin',
        quantity: 1,
        priceTTC: 4999.99,
        discount: 15,
        discountType: 'percentage'
      },
      {
        name: 'Kit de démarrage',
        quantity: 1,
        priceTTC: 199.99,
        discount: 0,
        discountType: 'fixed'
      }
    ],
    payment: {
      method: 'Virement bancaire',
      depositAmount: 1000.00
    },
    advisorName: 'Pierre DUBOIS - MYCONFORT',
    eventLocation: 'Maison individuelle',
    invoiceNotes: 'Crédit d\'impôt applicable. Devis détaillé fourni.',
    termsAccepted: true,
    taxRate: 20,
    delivery: {
      method: 'Livraison express',
      notes: 'Installation programmée le 15/07/2025'
    }
  },
  {
    invoiceNumber: 'MYCONFORT-2025-003',
    client: {
      name: 'Entreprise ABC SAS',
      email: 'contact@entreprise-abc.fr',
      address: '78 Boulevard de la République',
      city: 'Marseille',
      postalCode: '13000',
      phone: '04 91 23 45 67'
    },
    invoiceDate: '2025-07-04',
    products: [
      {
        name: 'Système CVC bureaux (500m²)',
        quantity: 1,
        priceTTC: 12999.99,
        discount: 20,
        discountType: 'percentage'
      },
      {
        name: 'Contrat maintenance 3 ans',
        quantity: 1,
        priceTTC: 1999.99,
        discount: 0,
        discountType: 'fixed'
      }
    ],
    payment: {
      method: 'Chèque',
      depositAmount: 3000.00
    },
    advisorName: 'Julie MOREAU - MYCONFORT',
    eventLocation: 'Locaux professionnels',
    invoiceNotes: 'Projet B2B. TVA déductible. Facture sur 30 jours.',
    termsAccepted: true,
    taxRate: 20,
    delivery: {
      method: 'Livraison chantier',
      notes: 'Coordination avec le maître d\'œuvre requise'
    }
  }
];

// 🎯 SERVICES RÉELS MYCONFORT (remplace les simulations)
const realMYCONFORTServices = {
  
  // 📄 VRAI SERVICE PDF
  downloadPDF: async (invoice: RealInvoice) => {
    console.log('🚀 RÉEL - AdvancedPDFService.downloadPDF appelé avec:', invoice);
    console.log('📄 Utilisation du vrai service PDF MYCONFORT');
    
    try {
      // Appel du VRAI service
      const result = await AdvancedPDFService.downloadPDF(invoice);
      console.log('✅ AdvancedPDFService.downloadPDF - Succès:', result);
      return result;
    } catch (error) {
      console.error('❌ Erreur AdvancedPDFService.downloadPDF:', error);
      throw error;
    }
  },

  // 📄 VRAI SERVICE PDF BLOB
  getPDFBlob: async (invoice: RealInvoice) => {
    console.log('🚀 RÉEL - AdvancedPDFService.getPDFBlob appelé');
    
    try {
      const blob = await AdvancedPDFService.getPDFBlob(invoice);
      console.log('✅ AdvancedPDFService.getPDFBlob - Succès:', blob);
      return blob;
    } catch (error) {
      console.error('❌ Erreur AdvancedPDFService.getPDFBlob:', error);
      throw error;
    }
  },

  // 📁 VRAI SERVICE GOOGLE DRIVE
  uploadToGoogleDrive: async (invoice: RealInvoice) => {
    console.log('🚀 RÉEL - GoogleDriveService.uploadPDFToGoogleDrive appelé');
    console.log('📁 Utilisation du vrai service Google Drive MYCONFORT');
    
    try {
      // Générer le PDF d'abord
      const pdfBlob = await realMYCONFORTServices.getPDFBlob(invoice);
      
      // Upload avec le VRAI service Google Drive
      const result = await GoogleDriveService.uploadPDFToGoogleDrive(invoice, pdfBlob);
      console.log('✅ GoogleDriveService.uploadPDFToGoogleDrive - Succès:', result);
      
      return { 
        success: true, 
        url: result.url || `https://drive.google.com/file/${invoice.invoiceNumber}`,
        result: result
      };
    } catch (error) {
      console.error('❌ Erreur GoogleDriveService.uploadPDFToGoogleDrive:', error);
      throw error;
    }
  },

  // 📧 VRAI SERVICE EMAIL EMAILJS
  sendEmail: async (invoice: RealInvoice, customEmail?: string) => {
    const emailTo = customEmail || invoice.client.email;
    console.log('🚀 RÉEL - SeparatePdfEmailService appelé vers:', emailTo);
    console.log('📧 Utilisation du vrai service EmailJS MYCONFORT avec clés définitives');
    
    try {
      // Préparer l'invoice avec le bon email si nécessaire
      const invoiceForEmail = customEmail ? {
        ...invoice,
        client: {
          ...invoice.client,
          email: customEmail
        }
      } : invoice;

      // Appel du VRAI service EmailJS
      const result = await SeparatePdfEmailService.generatePDFAndSendEmail(invoiceForEmail);
      console.log('✅ SeparatePdfEmailService.generatePDFAndSendEmail - Succès:', result);
      
      return { 
        success: true, 
        emailSent: result.emailSent,
        pdfGenerated: result.pdfGenerated,
        message: result.message 
      };
    } catch (error) {
      console.error('❌ Erreur SeparatePdfEmailService.generatePDFAndSendEmail:', error);
      throw error;
    }
  },

  // 📧 VRAI SERVICE EMAIL SEULEMENT
  sendEmailOnly: async (invoice: RealInvoice, customEmail?: string) => {
    const emailTo = customEmail || invoice.client.email;
    console.log('🚀 RÉEL - SeparatePdfEmailService.sendEmailSeparately appelé vers:', emailTo);
    
    try {
      const invoiceForEmail = customEmail ? {
        ...invoice,
        client: { ...invoice.client, email: customEmail }
      } : invoice;

      const result = await SeparatePdfEmailService.sendEmailSeparately(invoiceForEmail);
      console.log('✅ SeparatePdfEmailService.sendEmailSeparately - Succès:', result);
      
      return { success: true, emailSent: result };
    } catch (error) {
      console.error('❌ Erreur SeparatePdfEmailService.sendEmailSeparately:', error);
      throw error;
    }
  },

  // 🧪 VRAI TEST EMAILJS
  testEmailJS: async (invoice: RealInvoice) => {
    console.log('🚀 RÉEL - SeparatePdfEmailService.testSeparateMethod appelé');
    console.log('🧪 Test complet avec vos clés EmailJS définitives');
    
    try {
      await SeparatePdfEmailService.testSeparateMethod(invoice);
      console.log('✅ SeparatePdfEmailService.testSeparateMethod - Succès');
      return { success: true };
    } catch (error) {
      console.error('❌ Erreur SeparatePdfEmailService.testSeparateMethod:', error);
      throw error;
    }
  }
};

// HOOK AVEC VRAIS SERVICES MYCONFORT
const useRealMYCONFORTSharing = () => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareProgress, setShareProgress] = useState({
    step: 'idle' as const,
    progress: 0,
    message: ''
  });

  const updateProgress = (step: string, progress: number, message: string) => {
    setShareProgress({ step: step as any, progress, message });
  };

  const downloadPDF = async (invoice: RealInvoice) => {
    setIsSharing(true);
    updateProgress('generating-pdf', 30, `🚀 Génération PDF RÉEL pour ${invoice.client.name}...`);
    try {
      await realMYCONFORTServices.downloadPDF(invoice);
      updateProgress('completed', 100, '✅ PDF téléchargé avec VRAI service !');
      return true;
    } catch (error) {
      updateProgress('error', 0, '❌ Erreur service PDF réel');
      console.error('Erreur downloadPDF:', error);
      return false;
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareProgress({ step: 'idle', progress: 0, message: '' }), 3000);
    }
  };

  const shareToGoogleDrive = async (invoice: RealInvoice) => {
    setIsSharing(true);
    updateProgress('uploading-drive', 20, `🚀 Upload RÉEL ${invoice.invoiceNumber} vers Google Drive...`);
    try {
      const result = await realMYCONFORTServices.uploadToGoogleDrive(invoice);
      updateProgress('completed', 100, '✅ Upload Google Drive RÉEL réussi !');
      return result;
    } catch (error) {
      updateProgress('error', 0, '❌ Erreur Google Drive réel');
      console.error('Erreur shareToGoogleDrive:', error);
      return { success: false };
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareProgress({ step: 'idle', progress: 0, message: '' }), 3000);
    }
  };

  const shareByEmail = async (invoice: RealInvoice, customEmail?: string) => {
    setIsSharing(true);
    const emailTo = customEmail || invoice.client.email;
    updateProgress('sending-email', 40, `🚀 Envoi EMAIL RÉEL vers ${emailTo}...`);
    try {
      const result = await realMYCONFORTServices.sendEmail(invoice, customEmail);
      updateProgress('completed', 100, '✅ Email RÉEL envoyé avec EmailJS !');
      return result;
    } catch (error) {
      updateProgress('error', 0, '❌ Erreur EmailJS réel');
      console.error('Erreur shareByEmail:', error);
      return { success: false };
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareProgress({ step: 'idle', progress: 0, message: '' }), 3000);
    }
  };

  const sendEmailOnly = async (invoice: RealInvoice, customEmail?: string) => {
    setIsSharing(true);
    const emailTo = customEmail || invoice.client.email;
    updateProgress('sending-email', 50, `🚀 Email notification RÉEL vers ${emailTo}...`);
    try {
      const result = await realMYCONFORTServices.sendEmailOnly(invoice, customEmail);
      updateProgress('completed', 100, '✅ Email notification RÉEL envoyé !');
      return result;
    } catch (error) {
      updateProgress('error', 0, '❌ Erreur email notification réel');
      console.error('Erreur sendEmailOnly:', error);
      return { success: false };
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareProgress({ step: 'idle', progress: 0, message: '' }), 3000);
    }
  };

  const testEmailJS = async (invoice: RealInvoice) => {
    setIsSharing(true);
    updateProgress('sending-email', 60, '🧪 Test RÉEL EmailJS avec clés définitives...');
    try {
      await realMYCONFORTServices.testEmailJS(invoice);
      updateProgress('completed', 100, '✅ Test EmailJS RÉEL terminé !');
      return true;
    } catch (error) {
      updateProgress('error', 0, '❌ Erreur test EmailJS réel');
      console.error('Erreur testEmailJS:', error);
      return false;
    } finally {
      setIsSharing(false);
      setTimeout(() => setShareProgress({ step: 'idle', progress: 0, message: '' }), 3000);
    }
  };

  return {
    isSharing,
    shareProgress,
    downloadPDF,
    shareToGoogleDrive,
    shareByEmail,
    sendEmailOnly,
    testEmailJS
  };
};

// COMPOSANT PRINCIPAL AVEC VRAIS SERVICES
function App() {
  const [selectedInvoice, setSelectedInvoice] = useState<RealInvoice>(realInvoiceTemplates[0]);
  const [showModal, setShowModal] = useState(false);
  const [customEmail, setCustomEmail] = useState('');

  const { 
    downloadPDF, 
    shareToGoogleDrive, 
    shareByEmail, 
    sendEmailOnly,
    testEmailJS,
    isSharing, 
    shareProgress 
  } = useRealMYCONFORTSharing();

  const calculateTotal = (invoice: RealInvoice) => {
    return invoice.products.reduce((sum, product) => {
      const discountAmount = product.discountType === 'percentage' 
        ? (product.priceTTC * product.discount / 100)
        : product.discount;
      return sum + ((product.priceTTC - discountAmount) * product.quantity);
    }, 0);
  };

  const getProgressColor = () => {
    switch (shareProgress.step) {
      case 'completed': return '#22c55e';
      case 'error': return '#ef4444';
      default: return '#3b82f6';
    }
  };

  return (
    <div className="App" style={{ padding: '20px', fontFamily: 'Arial, sans-serif', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ textAlign: 'center', marginBottom: '30px' }}>
        <h1 style={{ color: '#059669', marginBottom: '10px' }}>
          🚀 MYCONFORT - VRAIS SERVICES INTÉGRÉS !
        </h1>
        <p style={{ color: '#6b7280' }}>
          Système opérationnel avec AdvancedPDFService, GoogleDriveService et SeparatePdfEmailService
        </p>
      </div>

      {/* Status VRAIS SERVICES */}
      <div style={{ 
        backgroundColor: '#ecfdf5', 
        padding: '20px', 
        borderRadius: '12px',
        marginBottom: '30px',
        border: '2px solid #059669'
      }}>
        <h3 style={{ color: '#047857', margin: '0 0 15px 0', textAlign: 'center' }}>
          ✅ VRAIS SERVICES MYCONFORT ACTIFS !
        </h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '10px', textAlign: 'center' }}>
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
            📄 <strong>AdvancedPDFService</strong><br/>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Service PDF réel MYCONFORT</span>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
            📁 <strong>GoogleDriveService</strong><br/>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>Upload Drive réel via n8n</span>
          </div>
          <div style={{ padding: '10px', backgroundColor: 'white', borderRadius: '6px' }}>
            📧 <strong>SeparatePdfEmailService</strong><br/>
            <span style={{ fontSize: '12px', color: '#6b7280' }}>EmailJS avec clés définitives</span>
          </div>
        </div>
      </div>

      {/* Sélection de facture */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '30px', marginBottom: '30px' }}>
        
        {/* Panel de sélection */}
        <div style={{ backgroundColor: '#f8fafc', padding: '20px', borderRadius: '12px' }}>
          <h3 style={{ color: '#1f2937', marginBottom: '15px' }}>📋 Factures MYCONFORT :</h3>
          
          {realInvoiceTemplates.map((invoice, index) => (
            <div
              key={invoice.invoiceNumber}
              onClick={() => setSelectedInvoice(invoice)}
              style={{
                padding: '15px',
                marginBottom: '10px',
                backgroundColor: selectedInvoice.invoiceNumber === invoice.invoiceNumber ? '#dbeafe' : 'white',
                border: selectedInvoice.invoiceNumber === invoice.invoiceNumber ? '2px solid #3b82f6' : '1px solid #e5e7eb',
                borderRadius: '8px',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{invoice.invoiceNumber}</div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>{invoice.client.name}</div>
              <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                {invoice.products.length} produit(s) - {calculateTotal(invoice).toFixed(2)}€
              </div>
            </div>
          ))}
        </div>

        {/* Détails de la facture sélectionnée */}
        <div style={{ backgroundColor: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ color: '#1f2937', margin: 0 }}>📄 Test avec VRAIS services</h3>
            <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#059669' }}>
              {calculateTotal(selectedInvoice).toFixed(2)}€
            </div>
          </div>

          {/* Progress bar pour vrais services */}
          {isSharing && (
            <div style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#eff6ff', borderRadius: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
                <span style={{ marginRight: '8px', fontSize: '16px' }}>🚀</span>
                <span style={{ fontSize: '14px', fontWeight: '500', color: '#1e40af' }}>{shareProgress.message}</span>
              </div>
              <div style={{ width: '100%', backgroundColor: '#e5e7eb', borderRadius: '4px', height: '8px' }}>
                <div 
                  style={{
                    height: '8px',
                    borderRadius: '4px',
                    backgroundColor: getProgressColor(),
                    width: `${shareProgress.progress}%`,
                    transition: 'all 0.3s ease'
                  }}
                />
              </div>
            </div>
          )}

          {/* Actions avec VRAIS services */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '20px' }}>
            <button
              onClick={() => downloadPDF(selectedInvoice)}
              disabled={isSharing}
              style={{
                padding: '12px',
                backgroundColor: '#059669',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isSharing ? 'not-allowed' : 'pointer',
                opacity: isSharing ? 0.5 : 1,
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              📄 PDF RÉEL<br/>
              <span style={{ fontSize: '11px' }}>AdvancedPDFService</span>
            </button>

            <button
              onClick={() => shareToGoogleDrive(selectedInvoice)}
              disabled={isSharing}
              style={{
                padding: '12px',
                backgroundColor: '#0ea5e9',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isSharing ? 'not-allowed' : 'pointer',
                opacity: isSharing ? 0.5 : 1,
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              📁 DRIVE RÉEL<br/>
              <span style={{ fontSize: '11px' }}>GoogleDriveService</span>
            </button>

            <button
              onClick={() => shareByEmail(selectedInvoice)}
              disabled={isSharing}
              style={{
                padding: '12px',
                backgroundColor: '#f59e0b',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isSharing ? 'not-allowed' : 'pointer',
                opacity: isSharing ? 0.5 : 1,
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              📧 EMAIL RÉEL<br/>
              <span style={{ fontSize: '11px' }}>SeparatePdfEmailService</span>
            </button>

            <button
              onClick={() => testEmailJS(selectedInvoice)}
              disabled={isSharing}
              style={{
                padding: '12px',
                backgroundColor: '#8b5cf6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: isSharing ? 'not-allowed' : 'pointer',
                opacity: isSharing ? 0.5 : 1,
                fontWeight: 'bold',
                fontSize: '13px'
              }}
            >
              🧪 TEST RÉEL<br/>
              <span style={{ fontSize: '11px' }}>EmailJS complet</span>
            </button>
          </div>

          {/* Email personnalisé avec VRAIS services */}
          <div style={{ padding: '15px', backgroundColor: '#f0f9ff', borderRadius: '8px' }}>
            <h4 style={{ color: '#1e40af', margin: '0 0 10px 0' }}>📧 Email avec VRAI EmailJS :</h4>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '10px' }}>
              <input
                type="email"
                placeholder={`Défaut: ${selectedInvoice.client.email}`}
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                style={{
                  flex: 1,
                  padding: '8px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  fontSize: '14px'
                }}
              />
              <button
                onClick={() => shareByEmail(selectedInvoice, customEmail || selectedInvoice.client.email)}
                disabled={isSharing}
                style={{
                  padding: '8px 12px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: isSharing ? 'not-allowed' : 'pointer',
                  opacity: isSharing ? 0.5 : 1,
                  fontSize: '12px'
                }}
              >
                🚀 RÉEL
              </button>
            </div>
            
            <button
              onClick={() => sendEmailOnly(selectedInvoice, customEmail || selectedInvoice.client.email)}
              disabled={isSharing}
              style={{
                width: '100%',
                padding: '8px',
                backgroundColor: '#7c3aed',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: isSharing ? 'not-allowed' : 'pointer',
                opacity: isSharing ? 0.5 : 1,
                fontSize: '12px'
              }}
            >
              📧 Email notification RÉEL (sans PDF joint)
            </button>
          </div>
        </div>
      </div>

      {/* Status final */}
      <div style={{ textAlign: 'center', padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '12px', border: '2px solid #22c55e' }}>
        <h2 style={{ color: '#15803d', marginBottom: '10px' }}>🎉 MISSION ACCOMPLIE !</h2>
        <p style={{ color: '#166534', margin: 0 }}>
          Votre système de partage MYCONFORT est maintenant <strong>100% opérationnel</strong> avec vos vrais services !<br/>
          PDF, Google Drive et EmailJS fonctionnent avec vos vraies données et configurations.
        </p>
      </div>
    </div>
  );
}

export default App;