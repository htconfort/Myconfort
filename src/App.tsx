import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ClientSection } from './components/ClientSection';
import { ProductSection } from './components/ProductSection';
import { ClientListModal } from './components/ClientListModal';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { EmailJSConfigModal } from './components/EmailJSConfigModal';
import { SignaturePad } from './components/SignaturePad';
import { EmailSender } from './components/EmailSender';
import { InvoicePreview } from './components/InvoicePreview';
import { Toast } from './components/ui/Toast';
import { Invoice, Client, ToastType } from './types';
import { generateInvoiceNumber } from './utils/calculations';
import { saveClients, loadClients, saveDraft, loadDraft, saveClient } from './utils/storage';
import { PDFService } from './services/pdfService';
import { AdvancedPDFService } from './services/advancedPdfService';

function App() {
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    eventLocation: '',
    advisorName: '',
    invoiceNotes: '',
    termsAccepted: false,
    taxRate: 20,
    client: {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      phone: '',
      email: ''
    },
    delivery: {
      method: '',
      notes: ''
    },
    payment: {
      method: '',
      depositAmount: 0
    },
    products: [],
    signature: ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [showClientsList, setShowClientsList] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showEmailJSConfig, setShowEmailJSConfig] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType
  });

  useEffect(() => {
    setClients(loadClients());
    const draft = loadDraft();
    if (draft) {
      setInvoice(draft);
      showToast('Brouillon chargé', 'success');
    }

    // Auto-save every 60 seconds
    const interval = setInterval(() => {
      handleSave();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSave = () => {
    try {
      saveDraft(invoice);
      if (invoice.client.name && invoice.client.email) {
        saveClient(invoice.client);
        setClients(loadClients());
      }
      showToast('Brouillon enregistré', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleShowPDFPreview = () => {
    if (invoice.products.length === 0) {
      showToast('Veuillez ajouter au moins un produit', 'error');
      return;
    }
    if (!invoice.client.name || !invoice.client.email) {
      showToast('Veuillez remplir les informations client', 'error');
      return;
    }
    
    handleSave();
    setShowPDFPreview(true);
  };

  const handleGeneratePDF = async () => {
    try {
      handleSave();
      showToast('Génération du PDF MYCONFORT en cours...', 'success');
      
      await AdvancedPDFService.downloadPDF(invoice);
      showToast(`PDF MYCONFORT téléchargé avec succès${invoice.signature ? ' (avec signature électronique)' : ''}`, 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Erreur lors de la génération du PDF', 'error');
      
      // Fallback vers l'ancienne méthode
      try {
        await PDFService.downloadPDF(invoice, 'pdf-preview-content');
        showToast('PDF téléchargé avec succès (méthode alternative)', 'success');
      } catch (fallbackError) {
        console.error('Fallback PDF error:', fallbackError);
        handlePrint();
      }
    }
  };

  const handlePrint = () => {
    try {
      PDFService.printInvoice('pdf-preview-content', invoice.invoiceNumber);
      showToast('Impression lancée', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'impression', 'error');
    }
  };

  const handleEmailJSSuccess = (message: string) => {
    showToast(message, 'success');
  };

  const handleEmailJSError = (message: string) => {
    showToast(message, 'error');
  };

  const handleLoadClient = (client: Client) => {
    setInvoice(prev => ({ ...prev, client }));
    setShowClientsList(false);
    showToast('Client chargé avec succès', 'success');
  };

  const handleDeleteClient = (index: number) => {
    const updatedClients = clients.filter((_, i) => i !== index);
    setClients(updatedClients);
    saveClients(updatedClients);
    showToast('Client supprimé', 'success');
  };

  const handleSaveSignature = (signature: string) => {
    setInvoice(prev => ({ ...prev, signature }));
    showToast('Signature enregistrée - Facture prête pour envoi !', 'success');
  };

  const handleReset = () => {
    if (window.confirm('Êtes-vous sûr de vouloir créer une nouvelle facture? Toutes les données non enregistrées seront perdues.')) {
      setInvoice({
        invoiceNumber: generateInvoiceNumber(),
        invoiceDate: new Date().toISOString().split('T')[0],
        eventLocation: '',
        advisorName: '',
        invoiceNotes: '',
        termsAccepted: false,
        taxRate: 20,
        client: {
          name: '',
          address: '',
          postalCode: '',
          city: '',
          phone: '',
          email: ''
        },
        delivery: {
          method: '',
          notes: ''
        },
        payment: {
          method: '',
          depositAmount: 0
        },
        products: [],
        signature: ''
      });
      showToast('Nouvelle facture créée', 'success');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const validateInvoice = () => {
    const errors = [];
    
    if (!invoice.client.name) errors.push('Nom du client requis');
    if (!invoice.client.email) errors.push('Email du client requis');
    if (!invoice.client.address) errors.push('Adresse du client requise');
    if (!invoice.client.city) errors.push('Ville du client requise');
    if (!invoice.client.postalCode) errors.push('Code postal du client requis');
    if (!invoice.client.phone) errors.push('Téléphone du client requis');
    if (invoice.products.length === 0) errors.push('Au moins un produit requis');
    
    return errors;
  };

  const handleValidateAndPDF = () => {
    const errors = validateInvoice();
    if (errors.length > 0) {
      showToast(`Erreurs: ${errors.join(', ')}`, 'error');
      return;
    }
    handleShowPDFPreview();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 font-['Inter'] text-gray-900">
      <Header
        onSave={handleSave}
        onGeneratePDF={handleValidateAndPDF}
        onShowClients={() => setShowClientsList(true)}
        onSendEmail={() => setShowEmailJSConfig(true)}
        onScrollToClient={() => scrollToSection('client-section')}
        onScrollToProducts={() => scrollToSection('products-section')}
      />

      <main className="container mx-auto px-4 py-6" id="invoice-content">
        {/* En-tête MYCONFORT */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <span className="text-2xl">🌸</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">MYCONFORT</h1>
                <p className="text-green-100">Facturation professionnelle avec signature électronique</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Statut de la facture</div>
              <div className="flex items-center space-x-2 mt-1">
                {invoice.signature ? (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>🔒</span>
                    <span>SIGNÉE</span>
                  </div>
                ) : (
                  <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    EN ATTENTE DE SIGNATURE
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <InvoiceHeader
          invoice={invoice}
          onUpdate={(updates) => setInvoice(prev => ({ ...prev, ...updates }))}
        />

        <div id="client-section">
          <ClientSection
            client={invoice.client}
            onUpdate={(client) => setInvoice(prev => ({ ...prev, client }))}
          />
        </div>

        <div id="products-section">
          <ProductSection
            products={invoice.products}
            onUpdate={(products) => setInvoice(prev => ({ ...prev, products }))}
            taxRate={invoice.taxRate}
            invoiceNotes={invoice.invoiceNotes}
            onNotesChange={(invoiceNotes) => setInvoice(prev => ({ ...prev, invoiceNotes }))}
            acompteAmount={invoice.payment.depositAmount}
            onAcompteChange={(amount) => setInvoice(prev => ({ 
              ...prev, 
              payment: { ...prev.payment, depositAmount: amount }
            }))}
            paymentMethod={invoice.payment.method}
            onPaymentMethodChange={(method) => setInvoice(prev => ({
              ...prev,
              payment: { ...prev.payment, method }
            }))}
            advisorName={invoice.advisorName}
            onAdvisorNameChange={(name) => setInvoice(prev => ({ ...prev, advisorName: name }))}
            termsAccepted={invoice.termsAccepted}
            onTermsAcceptedChange={(accepted) => setInvoice(prev => ({ ...prev, termsAccepted: accepted }))}
            signature={invoice.signature}
            onShowSignaturePad={() => setShowSignaturePad(true)}
          />
        </div>

        {/* Delivery Section */}
        <div id="delivery-section" className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200 transform transition-all hover:scale-[1.002] hover:shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <span className="bg-blue-600 text-white px-6 py-3 rounded-full font-bold">
              INFORMATIONS LOGISTIQUES
            </span>
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-gray-900 mb-1 font-semibold">
                  Mode de livraison
                </label>
                <select
                  value={invoice.delivery.method}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, method: e.target.value }
                  }))}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-900"
                >
                  <option value="">Sélectionner</option>
                  <option value="Colissimo 48 heures">Colissimo 48 heures</option>
                  <option value="Livraison par transporteur">Livraison par transporteur</option>
                  <option value="Retrait en magasin">Retrait en magasin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-gray-900 mb-1 font-semibold">
                  Précisions de livraison
                </label>
                <textarea
                  value={invoice.delivery.notes}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, notes: e.target.value }
                  }))}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-900 h-20"
                  placeholder="Instructions spéciales, étage, code d'accès..."
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-gray-700 italic">
              <p>📦 Livraison estimée sous 48 heures. Les délais sont donnés à titre indicatif et ne sont pas contractuels.</p>
            </div>
          </div>
        </div>

        {/* EmailJS Sender - BLOC UNIQUE */}
        <EmailSender
          invoice={invoice}
          onSuccess={handleEmailJSSuccess}
          onError={handleEmailJSError}
          onShowConfig={() => setShowEmailJSConfig(true)}
        />

        {/* Aperçu de la facture */}
        {showInvoicePreview && (
          <div className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900">Aperçu de la facture</h2>
              <button
                onClick={() => setShowInvoicePreview(!showInvoicePreview)}
                className="text-blue-600 hover:text-blue-800 underline text-sm"
              >
                {showInvoicePreview ? 'Masquer' : 'Afficher'} l'aperçu
              </button>
            </div>
            
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <InvoicePreview invoice={invoice} />
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
              <p className="font-semibold">🎯 Aperçu de votre facture MYCONFORT</p>
              <p>Cet aperçu sera converti en PDF et envoyé par email via EmailJS avec votre Template "Myconfort".</p>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-lg p-6 mb-6 border border-gray-200 transform transition-all hover:scale-[1.002] hover:shadow-xl">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div>
              <label className="block text-gray-700 mb-1 font-semibold">Email du destinataire</label>
              <input
                value={invoice.client.email}
                onChange={(e) => setInvoice(prev => ({
                  ...prev,
                  client: { ...prev.client, email: e.target.value }
                }))}
                type="email"
                className="w-full md:w-64 border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                placeholder="client@email.com"
              />
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleValidateAndPDF}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105"
              >
                <span>APERÇU & PDF</span>
              </button>
              <button
                onClick={handleReset}
                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105"
              >
                <span>NOUVELLE FACTURE</span>
              </button>
              <button
                onClick={() => setShowEmailJSConfig(true)}
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105"
              >
                <span>📧</span>
                <span>CONFIGURER EMAIL</span>
              </button>
            </div>
          </div>
        </div>
      </main>

      <ClientListModal
        isOpen={showClientsList}
        onClose={() => setShowClientsList(false)}
        clients={clients}
        onLoadClient={handleLoadClient}
        onDeleteClient={handleDeleteClient}
      />

      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        invoice={invoice}
        onDownload={handleGeneratePDF}
      />

      <EmailJSConfigModal
        isOpen={showEmailJSConfig}
        onClose={() => setShowEmailJSConfig(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={handleSaveSignature}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;