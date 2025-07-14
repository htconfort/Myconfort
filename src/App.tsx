import React, { useState } from 'react';
import { Header } from './components/Header';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ClientSection } from './components/ClientSection';
import { ProductSection } from './components/ProductSection';
import { EmailSender } from './components/EmailSender';
import { InvoicePreview } from './components/InvoicePreview';
import { ClientListModal } from './components/ClientListModal';
import { InvoicesListModal } from './components/InvoicesListModal';
import { ProductsListModal } from './components/ProductsListModal';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { SignaturePad } from './components/SignaturePad';
import { Toast } from './components/ui/Toast';
import { useInvoice } from './hooks/useInvoice';
import { useToast } from './hooks/useToast';
import { PDFService } from './services/pdfService';

function App() {
  const { 
    invoice, 
    clients, 
    invoices, 
    updateInvoice, 
    saveInvoiceData, 
    createNewInvoice, 
    validateInvoice,
    setClients,
    setInvoices 
  } = useInvoice();
  
  const { toast, showToast, hideToast } = useToast();
  
  const [showClientsList, setShowClientsList] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showProductsList, setShowProductsList] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showGoogleDriveConfig, setShowGoogleDriveConfig] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(true);

  const validation = validateInvoice();

  const handleShowPDFPreview = () => {
    if (!validation.isValid) {
      showToast(`Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    saveInvoiceData();
    setShowPDFPreview(true);
  };

  const handleGeneratePDF = async () => {
    try {
      await PDFService.generatePDF(invoice);
      showToast('PDF généré avec succès', 'success');
    } catch (error) {
      showToast('Erreur lors de la génération du PDF', 'error');
    }
  };

  const handleSaveSignature = (signature: string) => {
    updateInvoice({ signature });
    showToast('Signature enregistrée', 'success');
  };

  return (
    <div className="min-h-screen font-['Inter'] text-gray-100" style={{ backgroundColor: '#14281D' }}>
      <Header
        onGeneratePDF={handleShowPDFPreview}
        onShowClients={() => setShowClientsList(true)}
        onShowInvoices={() => setShowInvoicesList(true)}
        onShowProducts={() => setShowProductsList(true)}
        onShowGoogleDrive={() => setShowGoogleDriveConfig(true)}
      />

      <main className="container mx-auto px-4 py-6">
        {/* En-tête MYCONFORT */}
        <div className="text-white rounded-xl shadow-xl p-6 mb-6" style={{
          background: 'linear-gradient(135deg, #477A0C 0%, #5A8F0F 25%, #3A6A0A 50%, #6BA015 75%, #477A0C 100%)'
        }}>
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
                {validation.isValid ? (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>✅</span>
                    <span>COMPLÈTE</span>
                  </div>
                ) : (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>INCOMPLÈTE</span>
                  </div>
                )}
                {invoice.signature && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>🔒</span>
                    <span>SIGNÉE</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <InvoiceHeader invoice={invoice} onUpdate={updateInvoice} />
        <ClientSection client={invoice.client} onUpdate={(client) => updateInvoice({ client })} />
        <ProductSection
          products={invoice.products}
          onUpdate={(products) => updateInvoice({ products })}
          taxRate={invoice.taxRate}
          invoiceNotes={invoice.invoiceNotes}
          onNotesChange={(invoiceNotes) => updateInvoice({ invoiceNotes })}
          acompteAmount={invoice.payment.depositAmount}
          onAcompteChange={(amount) => updateInvoice({ 
            payment: { ...invoice.payment, depositAmount: amount }
          })}
          paymentMethod={invoice.payment.method}
          onPaymentMethodChange={(method) => updateInvoice({
            payment: { ...invoice.payment, method }
          })}
          advisorName={invoice.advisorName}
          onAdvisorNameChange={(name) => updateInvoice({ advisorName: name })}
          termsAccepted={invoice.termsAccepted}
          onTermsAcceptedChange={(accepted) => updateInvoice({ termsAccepted: accepted })}
          signature={invoice.signature}
          onShowSignaturePad={() => setShowSignaturePad(true)}
        />

        <EmailSender
          invoice={invoice}
          onSuccess={showToast}
          onError={(msg) => showToast(msg, 'error')}
          isValid={validation.isValid}
        />

        {showInvoicePreview && (
          <div className="bg-[#477A0C] rounded-xl shadow-lg p-6 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#F2EFE2] flex items-center justify-center">
                <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
                  APERÇU DE LA FACTURE
                </span>
              </h2>
              <button
                onClick={() => setShowInvoicePreview(!showInvoicePreview)}
                className="text-[#F2EFE2] hover:text-white underline text-sm font-semibold"
              >
                {showInvoicePreview ? 'Masquer' : 'Afficher'} l'aperçu
              </button>
            </div>
            
            <div className="bg-[#F2EFE2] rounded-lg p-4">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <InvoicePreview invoice={invoice} />
              </div>
            </div>
          </div>
        )}

        {/* Actions principales */}
        <div className="bg-[#477A0C] rounded-xl shadow-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
              ACTIONS PRINCIPALES
            </span>
          </h2>
          
          <div className="bg-[#F2EFE2] rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-4">
              <button
                onClick={handleShowPDFPreview}
                disabled={!validation.isValid}
                className={`px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all hover:scale-105 disabled:hover:scale-100 ${
                  validation.isValid 
                    ? 'bg-green-600 hover:bg-green-700 text-white' 
                    : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                }`}
              >
                <span>APERÇU & PDF</span>
              </button>
              
              <button
                onClick={saveInvoiceData}
                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform transition-all hover:scale-105"
              >
                ENREGISTRER
              </button>
              
              <button
                onClick={createNewInvoice}
                className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-bold shadow-lg transform transition-all hover:scale-105"
              >
                ✨ NOUVELLE FACTURE
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Modals */}
      <ClientListModal
        isOpen={showClientsList}
        onClose={() => setShowClientsList(false)}
        clients={clients}
        onLoadClient={(client) => updateInvoice({ client })}
        onDeleteClient={(index) => {
          const updatedClients = clients.filter((_, i) => i !== index);
          setClients(updatedClients);
        }}
      />

      <InvoicesListModal
        isOpen={showInvoicesList}
        onClose={() => setShowInvoicesList(false)}
        invoices={invoices}
        onLoadInvoice={(loadedInvoice) => updateInvoice(loadedInvoice)}
        onDeleteInvoice={(index) => {
          const updatedInvoices = invoices.filter((_, i) => i !== index);
          setInvoices(updatedInvoices);
        }}
      />

      <ProductsListModal
        isOpen={showProductsList}
        onClose={() => setShowProductsList(false)}
      />

      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        invoice={invoice}
        onDownload={handleGeneratePDF}
      />

      <GoogleDriveModal
        isOpen={showGoogleDriveConfig}
        onClose={() => setShowGoogleDriveConfig(false)}
        onSuccess={showToast}
        onError={(msg) => showToast(msg, 'error')}
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