import React, { useState } from 'react';
import { X, FileText, Eye, Download, Trash2, Search, Calendar, Euro, User, Mail, Filter, MapPin, Printer, Edit } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';
import { AdvancedPDFService } from '../services/advancedPdfService';
import { PDFPreviewModal } from './PDFPreviewModal';
import { PDFService } from '../services/pdfService';

interface InvoicesListModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoices: Invoice[];
  onDeleteInvoice: (index: number) => void;
  onLoadInvoice: (invoice: Invoice) => void;
}

export const InvoicesListModal: React.FC<InvoicesListModalProps> = ({
  isOpen,
  onClose,
  invoices,
  onDeleteInvoice,
  onLoadInvoice
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'number' | 'client' | 'amount' | 'eventLocation'>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [filterStatus, setFilterStatus] = useState<'all' | 'signed' | 'unsigned'>('all');
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  // Filtrer et trier les factures
  const filteredAndSortedInvoices = React.useMemo(() => {
    let filtered = invoices.filter(invoice => {
      const matchesSearch = 
        invoice.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        invoice.client.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (invoice.eventLocation && invoice.eventLocation.toLowerCase().includes(searchTerm.toLowerCase()));
      
      const matchesFilter = 
        filterStatus === 'all' ||
        (filterStatus === 'signed' && invoice.signature) ||
        (filterStatus === 'unsigned' && !invoice.signature);
      
      return matchesSearch && matchesFilter;
    });

    return filtered.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'date':
          comparison = new Date(a.invoiceDate).getTime() - new Date(b.invoiceDate).getTime();
          break;
        case 'number':
          comparison = a.invoiceNumber.localeCompare(b.invoiceNumber);
          break;
        case 'client':
          comparison = a.client.name.localeCompare(b.client.name);
          break;
        case 'amount':
          const totalA = a.products.reduce((sum, product) => 
            sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType), 0);
          const totalB = b.products.reduce((sum, product) => 
            sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType), 0);
          comparison = totalA - totalB;
          break;
        case 'eventLocation':
          // Tri par lieu d'événement (les factures sans lieu en dernier)
          const locationA = a.eventLocation || '';
          const locationB = b.eventLocation || '';
          comparison = locationA.localeCompare(locationB);
          break;
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });
  }, [invoices, searchTerm, sortBy, sortOrder, filterStatus]);

  const handlePreviewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice);
    setShowPreview(true);
  };

  const handleDownloadPDF = async (invoice: Invoice) => {
    try {
      await AdvancedPDFService.downloadPDF(invoice);
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error);
      alert('Erreur lors du téléchargement du PDF');
    }
  };

  const handlePrintInvoice = async (invoice: Invoice) => {
    try {
      // Créer un aperçu temporaire pour l'impression
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Impossible d\'ouvrir la fenêtre d\'impression. Veuillez autoriser les pop-ups.');
        return;
      }

      // Calculer le total pour l'affichage
      const total = calculateInvoiceTotal(invoice);
      
      // Créer le contenu HTML pour l'impression
      const printContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Facture ${invoice.invoiceNumber}</title>
          <meta charset="UTF-8">
          <style>
            body { 
              font-family: 'Arial', sans-serif; 
              margin: 0; 
              padding: 20px; 
              background: white; 
              color: #333;
            }
            .header { 
              background: linear-gradient(135deg, #477A0C, #5A8F0F); 
              color: white; 
              padding: 20px; 
              text-align: center; 
              margin-bottom: 20px;
            }
            .invoice-info { 
              display: grid; 
              grid-template-columns: 1fr 1fr; 
              gap: 20px; 
              margin-bottom: 20px; 
            }
            .client-info { 
              background: #f8f9fa; 
              padding: 15px; 
              border-radius: 8px; 
            }
            .products-table { 
              width: 100%; 
              border-collapse: collapse; 
              margin: 20px 0; 
            }
            .products-table th, .products-table td { 
              border: 1px solid #ddd; 
              padding: 8px; 
              text-align: left; 
            }
            .products-table th { 
              background: #477A0C; 
              color: white; 
            }
            .total { 
              text-align: right; 
              font-size: 18px; 
              font-weight: bold; 
              margin: 20px 0; 
              color: #477A0C; 
            }
            @media print {
              body { margin: 0; padding: 10mm; }
              .no-print { display: none !important; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>🌸 MYCONFORT</h1>
            <h2>Facture ${invoice.invoiceNumber}</h2>
          </div>
          
          <div class="invoice-info">
            <div>
              <h3>Informations Facture</h3>
              <p><strong>Numéro:</strong> ${invoice.invoiceNumber}</p>
              <p><strong>Date:</strong> ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
              ${invoice.eventLocation ? `<p><strong>Lieu:</strong> ${invoice.eventLocation}</p>` : ''}
              ${invoice.advisorName ? `<p><strong>Conseiller:</strong> ${invoice.advisorName}</p>` : ''}
            </div>
            
            <div class="client-info">
              <h3>Client</h3>
              <p><strong>${invoice.client.name}</strong></p>
              <p>${invoice.client.address}</p>
              <p>${invoice.client.postalCode} ${invoice.client.city}</p>
              <p>Tél: ${invoice.client.phone}</p>
              <p>Email: ${invoice.client.email}</p>
            </div>
          </div>
          
          <table class="products-table">
            <thead>
              <tr>
                <th>Produit</th>
                <th>Quantité</th>
                <th>Prix TTC</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.products.map(product => `
                <tr>
                  <td>${product.name}</td>
                  <td>${product.quantity}</td>
                  <td>${formatCurrency(product.priceTTC)}</td>
                  <td>${formatCurrency(calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType))}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
          
          <div class="total">
            TOTAL TTC: ${formatCurrency(total)}
            ${invoice.payment.depositAmount > 0 ? `<br>Acompte versé: ${formatCurrency(invoice.payment.depositAmount)}<br>Reste à payer: ${formatCurrency(total - invoice.payment.depositAmount)}` : ''}
          </div>
          
          ${invoice.signature ? '<p><strong>✅ Facture signée électroniquement</strong></p>' : ''}
          
          <div style="margin-top: 40px; text-align: center; color: #666; font-size: 12px;">
            <p>MYCONFORT - 88 Avenue des Ternes, 75017 Paris</p>
            <p>Tél: 04 68 50 41 45 - Email: myconfort@gmail.com</p>
            <p>SIRET: 824 313 530 00027</p>
          </div>
        </body>
        </html>
      `;
      
      printWindow.document.write(printContent);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé puis imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
          setTimeout(() => {
            printWindow.close();
          }, 1000);
        }, 500);
      };
      
    } catch (error) {
      console.error('Erreur impression:', error);
      alert('Erreur lors de l\'impression de la facture');
    }
  };

  const handleDeleteInvoice = (index: number, invoice: Invoice) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer la facture ${invoice.invoiceNumber} ?\n\nCette action est irréversible.`)) {
      onDeleteInvoice(index);
    }
  };

  const handleLoadInvoice = (invoice: Invoice) => {
    if (window.confirm(`Charger la facture ${invoice.invoiceNumber} ?\n\nLes données actuelles seront remplacées par cette facture.`)) {
      onLoadInvoice(invoice);
      onClose();
    }
  };

  const calculateInvoiceTotal = (invoice: Invoice) => {
    return invoice.products.reduce((sum, product) => 
      sum + calculateProductTotal(product.quantity, product.priceTTC, product.discount, product.discountType), 0);
  };

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="📋 Toutes les Factures MYCONFORT" maxWidth="max-w-7xl">
        <div className="space-y-6">
          {/* Filtres et recherche */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Recherche */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Rechercher facture, client, lieu..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white font-semibold"
                />
              </div>

              {/* Tri */}
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white font-semibold"
              >
                <option value="date">Trier par date</option>
                <option value="number">Trier par numéro</option>
                <option value="client">Trier par client</option>
                <option value="amount">Trier par montant</option>
                <option value="eventLocation">Trier par lieu d'événement</option>
              </select>

              {/* Ordre */}
              <select
                value={sortOrder}
                onChange={(e) => setSortOrder(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white font-semibold"
              >
                <option value="desc">Décroissant</option>
                <option value="asc">Croissant</option>
              </select>

              {/* Filtre statut */}
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-black bg-white font-semibold"
              >
                <option value="all">Toutes les factures</option>
                <option value="signed">Factures signées</option>
                <option value="unsigned">En attente de signature</option>
              </select>
            </div>
          </div>

          {/* Liste des factures */}
          <div className="overflow-x-auto">
            <table className="w-full border-collapse bg-white rounded-lg overflow-hidden shadow-sm">
              <thead>
                <tr className="bg-[#477A0C] text-[#F2EFE2]">
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">N° Facture</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">Date</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">Client</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">Email</th>
                  <th className="border border-gray-300 px-4 py-3 text-left font-bold">Lieu d'événement</th>
                  <th className="border border-gray-300 px-4 py-3 text-right font-bold">Montant TTC</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold">Statut</th>
                  <th className="border border-gray-300 px-4 py-3 text-center font-bold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredAndSortedInvoices.map((invoice, index) => {
                  const total = calculateInvoiceTotal(invoice);
                  const originalIndex = invoices.findIndex(inv => 
                    inv.invoiceNumber === invoice.invoiceNumber && 
                    inv.invoiceDate === invoice.invoiceDate
                  );
                  
                  return (
                    <tr key={`${invoice.invoiceNumber}-${index}`} className="hover:bg-gray-50">
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="font-bold text-[#477A0C]">{invoice.invoiceNumber}</div>
                        {invoice.products.length > 0 && (
                          <div className="text-xs text-gray-600 font-semibold">
                            {invoice.products.length} produit{invoice.products.length > 1 ? 's' : ''}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-black font-semibold">{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <User className="w-4 h-4 text-gray-400" />
                          <span className="font-bold text-black">{invoice.client.name}</span>
                        </div>
                        {invoice.client.city && (
                          <div className="text-xs text-gray-600 font-semibold">{invoice.client.city}</div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <Mail className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-black font-semibold">{invoice.client.email}</span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex items-center space-x-1">
                          <MapPin className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-black font-semibold">
                            {invoice.eventLocation || (
                              <span className="text-gray-400 italic">Non spécifié</span>
                            )}
                          </span>
                        </div>
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-right">
                        <div className="font-bold text-lg text-[#477A0C]">
                          {formatCurrency(total)}
                        </div>
                        {invoice.payment.depositAmount > 0 && (
                          <div className="text-xs text-orange-600 font-bold">
                            Acompte: {formatCurrency(invoice.payment.depositAmount)}
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3 text-center">
                        {invoice.signature ? (
                          <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center justify-center space-x-1">
                            <span>🔒</span>
                            <span>Signée</span>
                          </div>
                        ) : (
                          <div className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full text-xs font-semibold">
                            En attente
                          </div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-4 py-3">
                        <div className="flex justify-center space-x-1">
                          <button
                            onClick={() => handlePreviewInvoice(invoice)}
                            className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-all"
                            title="Aperçu de la facture"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handlePrintInvoice(invoice)}
                            className="bg-green-500 hover:bg-green-600 text-white p-2 rounded transition-all"
                            title="Imprimer la facture"
                          >
                            <Printer className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleLoadInvoice(invoice)}
                            className="bg-purple-500 hover:bg-purple-600 text-white p-2 rounded transition-all"
                            title="Charger cette facture pour modification"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteInvoice(originalIndex, invoice)}
                            className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-all"
                            title="Supprimer cette facture"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredAndSortedInvoices.length === 0 && (
                  <tr>
                    <td colSpan={8} className="border border-gray-300 px-4 py-8 text-center">
                      {searchTerm || filterStatus !== 'all' ? (
                        <div>
                          <Filter className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-black font-bold">Aucune facture ne correspond aux critères de recherche</p>
                        </div>
                      ) : (
                        <div>
                          <FileText className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                          <p className="text-black font-bold">Aucune facture enregistrée</p>
                          <p className="text-sm mt-1 text-gray-600 font-semibold">Les factures seront automatiquement sauvegardées</p>
                        </div>
                      )}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Résumé en bas */}
          {filteredAndSortedInvoices.length > 0 && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-sm text-black font-bold">
                <strong>{filteredAndSortedInvoices.length}</strong> facture{filteredAndSortedInvoices.length > 1 ? 's' : ''} affichée{filteredAndSortedInvoices.length > 1 ? 's' : ''} 
                {searchTerm && ` pour "${searchTerm}"`}
                {filterStatus !== 'all' && ` (${filterStatus === 'signed' ? 'signées' : 'en attente'})`}
              </div>
            </div>
          )}
        </div>
      </Modal>

      {/* Modal d'aperçu PDF */}
      {selectedInvoice && (
        <PDFPreviewModal
          isOpen={showPreview}
          onClose={() => {
            setShowPreview(false);
            setSelectedInvoice(null);
          }}
          invoice={selectedInvoice}
          onDownload={() => handleDownloadPDF(selectedInvoice)}
        />
      )}
    </>
  );
};
