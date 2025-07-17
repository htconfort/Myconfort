import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

interface InvoicePreviewProps {
  invoice: Invoice;
  className?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  className = "" 
}) => {
  // Calculer le total TTC
  const totalTTC = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

  // Calculer l'acompte et le montant restant
  const acompteAmount = invoice.payment.depositAmount || 0;
  const montantRestant = totalTTC - acompteAmount;

  // Calculer les totaux pour l'affichage
  const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
  const totalTVA = totalTTC - totalHT;
  const totalDiscount = invoice.products.reduce((sum, product) => {
    const originalTotal = product.priceTTC * product.quantity;
    const discountedTotal = calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
    return sum + (originalTotal - discountedTotal);
  }, 0);

  return (
    <div 
      id="facture-apercu" 
      className={`facture-apercu ${className}`}
    >
      <div className="invoice-container">
        {/* Header */}
        <header className="header">
          <div>
            <h1>MYCONFORT</h1>
            <p className="subtitle">Facturation professionnelle avec signature électronique</p>
          </div>
          {invoice.signature && (
            <div className="signed-badge">✓ SIGNÉE</div>
          )}
        </header>

        {/* Main Information */}
        <section className="main-info">
          <div className="company-details">
            <h3>MYCONFORT</h3>
            <p>88 Avenue des Ternes</p>
            <p>75017 Paris, France</p>
            <p>SIRET: 824 313 530 00027</p>
            <p>Tél: 04 68 50 41 45</p>
            <p>Email: myconfort@gmail.com</p>
            <p>Site web: https://www.htconfort.com</p>
          </div>
          <div className="invoice-meta">
            <div className="meta-item">
              <span className="meta-label">N° Facture:</span>
              <span className="meta-value">{invoice.invoiceNumber}</span>
            </div>
            <div className="meta-item">
              <span className="meta-label">Date:</span>
              <span className="meta-value">{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</span>
            </div>
            {invoice.eventLocation && (
              <div className="meta-item">
                <span className="meta-label">Lieu:</span>
                <span className="meta-value">{invoice.eventLocation}</span>
              </div>
            )}
          </div>
        </section>

        {/* Client Information */}
        <div className="section-header">INFORMATIONS CLIENT</div>
        <div className="client-grid">
          <div className="client-field">
            <span className="label">Nom complet</span>
            <span className="value">{invoice.client.name}</span>
          </div>
          <div className="client-field">
            <span className="label">Adresse</span>
            <span className="value">{invoice.client.address}</span>
          </div>
          <div className="client-field">
            <span className="label">Code postal</span>
            <span className="value">{invoice.client.postalCode}</span>
          </div>
          <div className="client-field">
            <span className="label">Ville</span>
            <span className="value">{invoice.client.city}</span>
          </div>
          <div className="client-field">
            <span className="label">Email</span>
            <span className="value">{invoice.client.email}</span>
          </div>
          <div className="client-field">
            <span className="label">Téléphone</span>
            <span className="value">{invoice.client.phone}</span>
          </div>
        </div>

        {/* Logistics Information */}
        {invoice.delivery.method && (
          <section className="info-section">
            <div className="info-header">INFORMATIONS LOGISTIQUES</div>
            <div className="info-row">
              <span className="info-label">Mode de livraison:</span>
              <span className="info-value">{invoice.delivery.method}</span>
            </div>
          </section>
        )}

        {/* Payment Information */}
        <section className="info-section">
          <div className="info-header payment">MODE DE RÈGLEMENT</div>
          <div className="info-row">
            <span className="info-label">Méthode de paiement:</span>
            <span className="info-value">{invoice.payment.method || 'Non spécifié'}</span>
          </div>
          <div className="info-row">
            <span className="info-label">Signature client MYCONFORT:</span>
            <span className="signature-status">
              {invoice.signature ? '✓ Signature électronique enregistrée' : 'En attente de signature'}
            </span>
          </div>
        </section>

        {/* Products Section */}
        <section className="products-section">
          <div className="products-title">Produits & Tarification</div>
          
          {/* Signature Box */}
          {invoice.signature && (
            <div className="signature-box">
              <div className="signature-label">SIGNATURE CLIENT</div>
              <div className="signature-placeholder">
                <img src={invoice.signature} alt="Signature électronique" style={{ maxHeight: '60px' }} />
                
                {/* Mention légale Article L224‑59 */}
                <div className="mt-3 bg-red-600 border border-red-400 rounded-lg p-3">
                  <div className="text-white">
                    <div className="font-bold text-xs mb-1 flex items-center">
                      <span className="mr-1">⚖️</span>
                      Article L224‑59 du Code de la consommation
                    </div>
                    <div className="text-xs font-bold leading-relaxed">
                      « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon […] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          <table className="products-table">
            <thead>
              <tr>
                <th>Quantité</th>
                <th>PU HT</th>
                <th>PU TTC</th>
                <th>Remise</th>
                <th>Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((product, index) => {
                const unitPriceHT = product.priceTTC / (1 + (invoice.taxRate / 100));
                const totalProduct = calculateProductTotal(
                  product.quantity,
                  product.priceTTC,
                  product.discount,
                  product.discountType
                );
                
                return (
                  <tr key={index}>
                    <td>{product.quantity}</td>
                    <td>{formatCurrency(unitPriceHT)}</td>
                    <td>{formatCurrency(product.priceTTC)}</td>
                    <td>
                      {product.discount > 0 ? (
                        product.discountType === 'percent' ? 
                          `${product.discount}%` : 
                          formatCurrency(product.discount)
                      ) : '-'}
                    </td>
                    <td>{formatCurrency(totalProduct)}</td>
                  </tr>
                );
              })}
              {invoice.products.length === 0 && (
                <tr>
                  <td colSpan={5} style={{ textAlign: 'center', padding: '20px' }}>
                    Aucun produit ajouté
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          <div className="totals">
            <div className="total-row">
              <span className="total-label">Total HT:</span>
              <span className="total-value">{formatCurrency(totalHT)}</span>
            </div>
            <div className="total-row">
              <span className="total-label">TVA ({invoice.taxRate}%):</span>
              <span className="total-value">{formatCurrency(totalTVA)}</span>
            </div>
            {totalDiscount > 0 && (
              <div className="total-row" style={{ color: '#e53e3e' }}>
                <span className="total-label">Remise totale:</span>
                <span className="total-value">-{formatCurrency(totalDiscount)}</span>
              </div>
            )}
            <div className="total-row final-total">
              <span className="total-label">TOTAL TTC:</span>
              <span className="total-value">{formatCurrency(totalTTC)}</span>
            </div>
            
            {/* Mention légale Article L224‑59 - Fond blanc sans encadré */}
            <div className="legal-mention-simple">
              <div className="legal-title">
                ⚖️ Article L224‑59 du Code de la consommation
              </div>
              <div className="legal-text">
                « Avant la conclusion de tout contrat entre un consommateur et un professionnel à l'occasion d'une foire, d'un salon […] le professionnel informe le consommateur qu'il ne dispose pas d'un délai de rétractation. »
              </div>
            </div>
            {/* Acompte si applicable */}
            {acompteAmount > 0 && (
              <>
                <div className="total-row" style={{ marginTop: '10px' }}>
                  <span className="total-label">Acompte versé:</span>
                  <span className="total-value" style={{ color: '#3182ce' }}>{formatCurrency(acompteAmount)}</span>
                </div>
                <div className="total-row" style={{ 
                  backgroundColor: '#fff3cd', 
                  padding: '8px', 
                  borderRadius: '4px',
                  marginTop: '5px',
                  color: '#ff8c00'
                }}>
                  <span className="total-label" style={{ fontWeight: 'bold' }}>RESTE À PAYER:</span>
                  <span className="total-value" style={{ fontWeight: 'bold' }}>{formatCurrency(montantRestant)}</span>
                </div>
              </>
            )}
          </div>
        </section>

        {/* Notes if present */}
        {invoice.invoiceNotes && (
          <section className="info-section">
            <div className="info-header">REMARQUES</div>
            <p style={{ padding: '10px', fontSize: '13px' }}>{invoice.invoiceNotes}</p>
          </section>
        )}

        {/* Footer */}
        <footer className="footer">
          <h3>🌸 MYCONFORT</h3>
          <p>Merci pour votre confiance !</p>
          <p>Votre spécialiste en matelas et literie de qualité</p>
          <p>88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45</p>
          <p>Email: myconfort@gmail.com - SIRET: 824 313 530 00027</p>
        </footer>
      </div>
    </div>
  );
};
