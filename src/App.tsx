import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ClientSection } from './components/ClientSection';
import { ProductSection } from './components/ProductSection';
import { ClientListModal } from './components/ClientListModal';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { SignaturePad } from './components/SignaturePad';
import { Toast } from './components/ui/Toast';
import { Invoice, Client, ToastType } from './types';
import { generateInvoiceNumber } from './utils/calculations';
import { saveClients, loadClients, saveDraft, loadDraft, saveClient } from './utils/storage';

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

  const handleGeneratePDF = () => {
    handleSave();
    
    // Import html2pdf dynamically
    import('html2pdf.js').then((html2pdf) => {
      const element = document.getElementById('pdf-preview-content');
      if (element) {
        const opt = {
          margin: 0,
          filename: `facture_${invoice.invoiceNumber}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { 
            scale: 2,
            useCORS: true,
            letterRendering: true,
            allowTaint: true
          },
          jsPDF: { 
            unit: 'mm', 
            format: 'a4', 
            orientation: 'portrait',
            compress: true
          }
        };
        
        html2pdf.default().from(element).set(opt).save().then(() => {
          showToast('PDF téléchargé avec succès', 'success');
        }).catch((error) => {
          console.error('PDF generation error:', error);
          showToast('Erreur lors de la génération du PDF', 'error');
          // Fallback to print
          handlePrint();
        });
      }
    }).catch((error) => {
      console.error('html2pdf import error:', error);
      showToast('Erreur lors du chargement du générateur PDF', 'error');
      // Fallback to print
      handlePrint();
    });
  };

  const handlePrint = () => {
    const printContent = document.getElementById('pdf-preview-content');
    if (printContent) {
      const printWindow = window.open('', '_blank');
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
            <head>
              <title>Facture ${invoice.invoiceNumber}</title>
              <link href="https://cdn.tailwindcss.com" rel="stylesheet">
              <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&display=swap" rel="stylesheet">
              <style>
                body { font-family: 'Manrope', sans-serif; }
                @media print {
                  .no-print { display: none !important; }
                  body { -webkit-print-color-adjust: exact; }
                }
              </style>
            </head>
            <body class="bg-white">
              ${printContent.innerHTML}
            </body>
          </html>
        `);
        printWindow.document.close();
        printWindow.print();
        showToast('Impression lancée', 'success');
      }
    }
  };

  const handleSendEmail = () => {
    if (!invoice.client.email) {
      showToast('Veuillez renseigner l\'email du client', 'error');
      return;
    }
    
    if (invoice.products.length === 0) {
      showToast('Veuillez ajouter au moins un produit', 'error');
      return;
    }

    handleSave();
    
    const subject = `Facture ${invoice.invoiceNumber} - MYCONFORT`;
    const body = `Bonjour ${invoice.client.name},\n\nVeuillez trouver ci-joint votre facture n°${invoice.invoiceNumber}.\n\nCordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}`;
    
    try {
      window.location.href = `mailto:${invoice.client.email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      showToast('Client email ouvert pour envoi', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'ouverture du client email', 'error');
    }
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
    showToast('Signature enregistrée', 'success');
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
    <div className="min-h-screen bg-[#F2EFE2] font-['Manrope'] text-[#14281D]">
      <Header
        onSave={handleSave}
        onGeneratePDF={handleValidateAndPDF}
        onShowClients={() => setShowClientsList(true)}
        onSendEmail={handleSendEmail}
        onScrollToClient={() => scrollToSection('client-section')}
        onScrollToProducts={() => scrollToSection('products-section')}
      />

      <main className="container mx-auto px-4 py-6" id="invoice-content">
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
        <div id="delivery-section" className="bg-[#89BBFE] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-[#14281D] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#14281D] px-4 py-2 rounded-full font-bold">
              INFORMATIONS LOGISTIQUES
            </span>
          </h2>
          
          <div className="bg-[#F2EFE2] rounded-lg p-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-[#14281D] mb-1 font-semibold">
                  Mode de livraison
                </label>
                <select
                  value={invoice.delivery.method}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, method: e.target.value }
                  }))}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
                >
                  <option value="">Sélectionner</option>
                  <option value="Colissimo 48 heures">Colissimo 48 heures</option>
                  <option value="Livraison par transporteur">Livraison par transporteur</option>
                  <option value="Retrait en magasin">Retrait en magasin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-[#14281D] mb-1 font-semibold">
                  Précisions de livraison
                </label>
                <textarea
                  value={invoice.delivery.notes}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, notes: e.target.value }
                  }))}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D] h-20"
                  placeholder="Instructions spéciales, étage, code d'accès..."
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-[#477A0C] bg-opacity-10 rounded-lg text-[#14281D] italic">
              <p>📦 Livraison estimée sous 48 heures. Les délais sont donnés à titre indicatif et ne sont pas contractuels.</p>
            </div>
          </div>
        </div>

        {/* Payment Section */}
        <div id="payment-section" className="bg-[#D68FD6] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-[#14281D] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#14281D] px-4 py-2 rounded-full font-bold">
              MODE DE RÈGLEMENT
            </span>
          </h2>
          
          <div className="bg-[#F2EFE2] rounded-lg p-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#14281D] mb-1 font-semibold">
                  Méthode de paiement*
                </label>
                <select
                  value={invoice.payment.method}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    payment: { ...prev.payment, method: e.target.value }
                  }))}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
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
                  <div className="mt-4 space-y-3 p-4 bg-[#477A0C] bg-opacity-10 rounded-lg">
                    <div>
                      <label className="block text-[#14281D] mb-1 font-semibold">
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
                        className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
                      />
                    </div>
                  </div>
                )}
              </div>
              
              <div>
                <label className="block text-[#14281D] mb-1 font-semibold">
                  Conseiller(e)
                </label>
                <input
                  value={invoice.advisorName}
                  onChange={(e) => setInvoice(prev => ({ ...prev, advisorName: e.target.value }))}
                  type="text"
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
                  placeholder="Nom du conseiller"
                />
                
                <div className="mt-4">
                  <label className="flex items-center">
                    <input
                      checked={invoice.termsAccepted}
                      onChange={(e) => setInvoice(prev => ({ ...prev, termsAccepted: e.target.checked }))}
                      type="checkbox"
                      className="form-checkbox h-5 w-5 text-[#477A0C] rounded focus:ring-[#477A0C] focus:ring-2"
                    />
                    <span className="ml-2 text-[#14281D] font-semibold">
                      J'ai lu et j'accepte les conditions générales de vente
                    </span>
                  </label>
                </div>

                <div className="mt-4">
                  <label className="block text-[#14281D] mb-1 font-semibold">Signature client</label>
                  <div className="border-2 border-dashed border-gray-300 rounded h-20 flex items-center justify-center bg-white hover:bg-gray-50 transition-colors">
                    {invoice.signature ? (
                      <div className="text-center">
                        <div className="text-green-600 font-semibold">✓ Signature enregistrée</div>
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
                        className="text-[#14281D] hover:text-[#0F1E16] font-semibold"
                      >
                        ✍️ Cliquer pour signer
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="bg-white rounded-lg shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
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
                className="w-full md:w-64 border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all"
                placeholder="client@email.com"
              />
            </div>
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleValidateAndPDF}
                className="bg-[#477A0C] hover:bg-[#3A6A0A] text-white px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)] transform transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,0.3)]"
              >
                <span>APERÇU & PDF</span>
              </button>
              <button
                onClick={handleReset}
                className="bg-[#F2EFE2] hover:bg-[#E0DED2] text-[#14281D] border-2 border-[#477A0C] px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.2)] transform transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,0.2)]"
              >
                <span>NOUVELLE FACTURE</span>
              </button>
              <button
                onClick={handleSendEmail}
                className="bg-[#F55D3E] hover:bg-[#E45438] text-[#F2EFE2] px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-[5px_5px_0px_0px_rgba(0,0,0,0.3)] transform transition-all hover:translate-x-[-2px] hover:translate-y-[-2px] hover:shadow-[7px_7px_0px_0px_rgba(0,0,0,0.3)]"
              >
                <span>ENVOYER PAR EMAIL</span>
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