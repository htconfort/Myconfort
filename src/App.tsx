import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ClientSection } from './components/ClientSection';
import { ProductSection } from './components/ProductSection';
import { ClientListModal } from './components/ClientListModal';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { EmailModal } from './components/EmailModal';
import { SignaturePad } from './components/SignaturePad';
import { Toast } from './components/ui/Toast';
import { Invoice, Client, ToastType } from './types';
import { generateInvoiceNumber } from './utils/calculations';
import { saveClients, loadClients, saveDraft, loadDraft, saveClient } from './utils/storage';
import { PDFService } from './services/pdfService';
import { AdvancedPDFService } from './services/advancedPdfService';
import { EmailService } from './services/emailService';

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
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
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

    // Initialiser EmailJS
    EmailService.initialize();

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
      showToast('Génération du PDF FactuSign Pro en cours...', 'success');
      
      // Utiliser le service PDF avancé avec signature
      await AdvancedPDFService.downloadPDF(invoice);
      showToast(`PDF FactuSign Pro téléchargé avec succès${invoice.signature ? ' (avec signature électronique)' : ''}`, 'success');
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

  const handleShowEmailModal = () => {
    if (!invoice.client.email) {
      showToast('Veuillez renseigner l\'email du client', 'error');
      return;
    }
    
    if (invoice.products.length === 0) {
      showToast('Veuillez ajouter au moins un produit', 'error');
      return;
    }

    if (!invoice.client.name) {
      showToast('Veuillez renseigner le nom du client', 'error');
      return;
    }

    handleSave();
    setShowEmailModal(true);
  };

  const handleEmailSuccess = (message: string) => {
    showToast(message, 'success');
  };

  const handleEmailError = (message: string) => {
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
    showToast('Signature enregistrée - Facture prête pour FactuSign Pro !', 'success');
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

  // Validation functions
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
        onSendEmail={handleShowEmailModal}
        onScrollToClient={() => scrollToSection('client-section')}
        onScrollToProducts={() => scrollToSection('products-section')}
      />

      <main className="container mx-auto px-4 py-6" id="invoice-content">
        {/* En-tête FactuSign Pro */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl shadow-xl p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <span className="text-2xl">⚡</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">FactuSign Pro</h1>
                <p className="text-green-100">Factures intelligentes, signées et envoyées automatiquement</p>
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

        {/* Payment Section */}
        <div id="payment-section" className="bg-white rounded-xl shadow-lg p-6 mb-6 border border-gray-200 transform transition-all hover:scale-[1.002] hover:shadow-xl">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center justify-center">
            <span className="bg-green-600 text-white px-6 py-3 rounded-full font-bold">
              MODE DE RÈGLEMENT
            </span>
          </h2>
          
          <div className="bg-gray-50 rounded-lg p-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-gray-900 mb-1 font-semibold">
                  Méthode de paiement*
                </label>
                <select
                  value={invoice.payment.method}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    payment: { ...prev.payment, method: e.target.value }
                  }))}
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-900"
                >
                  <option value="">Sélectionner</option>
                  <option value="Virement">Virement bancaire</option>
                  <option value="Carte Bleue">Carte Bleue</option>
                  <option value="Alma">Alma (paiement en plusieurs fois)</option>
                  <option value="PayPal">PayPal</option>
                  <option value="Chèque">Chèque</option>
                  <option value="Acompte">Acompte</option>
                </select>
                
                {invoice.payment.method === 'Acompte' && (
                  <div className="mt-4 space-y-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div>
                      <label className="block text-gray-900 mb-1 font-semibold">
                        Montant de l'acompte (€)
                      </label>
                      <input
                        value={invoice.payment.depositAmount}
                        onChange={(e) => setInvoice(prev => ({
                          ...prev,
                          payment: { ...prev.payment, depositAmount: parseFloat(e.target.value) || 0 }
                        }))}
                        type="number"
                        step="0.01"
                        min="0"
                        className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-900"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-gray-900 mb-1 font-semibold">
                  Conseiller(e)
                </label>
                <input
                  value={invoice.advisorName}
                  onChange={(e) => setInvoice(prev => ({ ...prev, advisorName: e.target.value }))}
                  type="text"
                  className="w-full border-2 border-gray-300 rounded-lg px-4 py-3 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-gray-900"
                  placeholder="Nom du conseiller"
                />
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      checked={invoice.termsAccepted}
                      onChange={(e) => setInvoice(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-blue-600 rounded focus:ring-blue-500 focus:ring-2"
                    />
                    <span className="ml-2 text-gray-900 font-semibold">
                      J'ai lu et j'accepte les conditions générales de vente
                    </span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-900 mb-1 font-semibold">Signature client FactuSign Pro</label>
                  <div className="border-2 border-dashed border-gray-300 rounded h-20 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                    {invoice.signature ? (
                      <div className="text-center">
                        <div className="text-green-600 font-semibold flex items-center justify-center space-x-1">
                          <span>🔒</span>
                          <span>Signature électronique enregistrée</span>
                        </div>
                        <button
                          onClick={() => setShowSignaturePad(true)}
                          className="text-sm text-blue-600 hover:text-blue-800 underline mt-1"
                        >
                          Modifier la signature
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowSignaturePad(true)}
                        className="text-gray-700 hover:text-gray-900 font-semibold flex items-center space-x-2"
                      >
                        <span>✍️</span>
                        <span>Cliquer pour signer électroniquement</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

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
                onClick={handleShowEmailModal}
                className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105"
              >
                <span>⚡</span>
                <span>FACTUSIGN PRO</span>
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

      <EmailModal
        isOpen={showEmailModal}
        onClose={() => setShowEmailModal(false)}
        invoice={invoice}
        onSuccess={handleEmailSuccess}
        onError={handleEmailError}
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