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
    <>
      {/* Aperçu principal pour l'affichage */}
      <div 
        id="facture-apercu" 
        className={`facture-apercu bg-white text-black max-w-3xl mx-auto p-6 rounded-xl shadow ${className}`}
      >
        {/* En-tête avec logo */}
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center">
            <div className="bg-[#477A0C] rounded-full w-12 h-12 flex items-center justify-center text-white text-2xl mr-4">
              🌸
            </div>
            <div>
              <h1 className="text-2xl font-bold text-[#477A0C]">MYCONFORT</h1>
              <p className="text-sm text-gray-600">Facturation professionnelle</p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm">
              Facture n° : <strong className="text-[#477A0C]">{invoice.invoiceNumber}</strong>
            </p>
            <p className="text-sm">Date : {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
            {invoice.eventLocation && (
              <p className="text-sm">Lieu : {invoice.eventLocation}</p>
            )}
          </div>
        </div>

        {/* Statut signature */}
        <div className="flex justify-end mb-4">
          {invoice.signature ? (
            <div className="bg-green-100 border border-green-300 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">🔒</span>
                <span className="font-semibold text-green-800 text-sm">FACTURE SIGNÉE</span>
              </div>
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg px-3 py-2">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⏳</span>
                <span className="font-semibold text-yellow-800 text-sm">EN ATTENTE DE SIGNATURE</span>
              </div>
            </div>
          )}
        </div>

        <hr className="my-4 border-gray-300" />

        {/* Informations client et entreprise */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h2 className="font-semibold text-[#477A0C] mb-2 border-b border-[#477A0C] pb-1">
              FACTURER À
            </h2>
            <div className="space-y-1">
              <p className="font-bold text-gray-900">{invoice.client.name}</p>
              <p className="text-gray-700">{invoice.client.address}</p>
              <p className="text-gray-700">{invoice.client.postalCode} {invoice.client.city}</p>
              <p className="text-gray-700">Tél: {invoice.client.phone}</p>
              <p className="text-gray-700">Email: {invoice.client.email}</p>
              {invoice.client.siret && (
                <p className="text-gray-700">SIRET: {invoice.client.siret}</p>
              )}
            </div>
          </div>
          
          <div>
            <h2 className="font-semibold text-[#477A0C] mb-2 border-b border-[#477A0C] pb-1">
              INFORMATIONS COMPLÉMENTAIRES
            </h2>
            <div className="space-y-1">
              {invoice.advisorName && (
                <p className="text-gray-700">
                  <span className="font-medium">Conseiller:</span> {invoice.advisorName}
                </p>
              )}
              {invoice.client.housingType && (
                <p className="text-gray-700">
                  <span className="font-medium">Type logement:</span> {invoice.client.housingType}
                </p>
              )}
              {invoice.client.doorCode && (
                <p className="text-gray-700">
                  <span className="font-medium">Code d'accès:</span> {invoice.client.doorCode}
                </p>
              )}
              {invoice.delivery.method && (
                <p className="text-gray-700">
                  <span className="font-medium">Livraison:</span> {invoice.delivery.method}
                </p>
              )}
              {invoice.payment.method && (
                <p className="text-gray-700">
                  <span className="font-medium">Paiement:</span> {invoice.payment.method}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Tableau des produits */}
        <div className="mb-6">
          <h3 className="font-semibold text-[#477A0C] mb-3 border-b border-[#477A0C] pb-1">
            DÉTAIL DES PRODUITS
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm border border-gray-300 rounded-lg overflow-hidden">
              <thead>
                <tr className="bg-[#477A0C] text-white">
                  <th className="border border-gray-300 px-3 py-2 text-left font-semibold">Désignation</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Qté</th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-semibold">PU TTC</th>
                  <th className="border border-gray-300 px-2 py-2 text-center font-semibold">Remise</th>
                  <th className="border border-gray-300 px-2 py-2 text-right font-semibold">Total TTC</th>
                </tr>
              </thead>
              <tbody>
                {invoice.products.map((item, i) => {
                  const totalProduct = calculateProductTotal(
                    item.quantity,
                    item.priceTTC,
                    item.discount,
                    item.discountType
                  );
                  
                  return (
                    <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                      <td className="border border-gray-300 px-3 py-2">
                        <div className="font-medium">{item.name}</div>
                        {item.category && (
                          <div className="text-xs text-gray-500">{item.category}</div>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center font-semibold">
                        {item.quantity}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-right">
                        {formatCurrency(item.priceTTC)}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-center">
                        {item.discount > 0 ? (
                          <span className="text-red-600 font-medium">
                            -{item.discountType === 'percent' 
                              ? `${item.discount}%` 
                              : formatCurrency(item.discount)
                            }
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="border border-gray-300 px-2 py-2 text-right font-bold">
                        {formatCurrency(totalProduct)}
                      </td>
                    </tr>
                  );
                })}
                {invoice.products.length === 0 && (
                  <tr>
                    <td colSpan={5} className="border border-gray-300 px-3 py-6 text-center text-gray-500">
                      Aucun produit ajouté
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Totaux avec gestion acompte */}
        <div className="flex justify-end mb-6">
          <div className="w-full max-w-md">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">Total HT:</span>
                  <span className="font-medium">{formatCurrency(totalHT)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">TVA ({invoice.taxRate}%):</span>
                  <span className="font-medium">{formatCurrency(totalTVA)}</span>
                </div>
                {totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span className="font-medium">Remise totale:</span>
                    <span className="font-medium">-{formatCurrency(totalDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL TTC:</span>
                    <span className="text-[#477A0C]">{formatCurrency(totalTTC)}</span>
                  </div>
                </div>
                
                {/* Gestion acompte */}
                {acompteAmount > 0 && (
                  <>
                    <div className="border-t border-gray-300 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Acompte versé:</span>
                        <span className="font-medium text-blue-600">
                          {formatCurrency(acompteAmount)}
                        </span>
                      </div>
                    </div>
                    <div className="bg-orange-100 border border-orange-200 rounded p-2">
                      <div className="flex justify-between text-lg font-bold text-orange-600">
                        <span>RESTE À PAYER:</span>
                        <span>{formatCurrency(montantRestant)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Signature client */}
        {invoice.signature && (
          <div className="mb-6">
            <div className="flex justify-end">
              <div className="border border-gray-300 rounded-lg p-4 w-64">
                <h4 className="text-[#477A0C] font-bold text-sm mb-2 text-center">
                  SIGNATURE CLIENT
                </h4>
                <div className="flex items-center justify-center h-16 bg-gray-50 rounded">
                  <img 
                    src={invoice.signature} 
                    alt="Signature client" 
                    className="max-h-full max-w-full"
                  />
                </div>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Signé électroniquement le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Notes si présentes */}
        {invoice.invoiceNotes && (
          <div className="mb-6">
            <h3 className="font-semibold text-[#477A0C] mb-2 border-b border-[#477A0C] pb-1">
              REMARQUES
            </h3>
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
              <p className="text-gray-700 text-sm">{invoice.invoiceNotes}</p>
            </div>
          </div>
        )}

        {/* Pied de page */}
        <div className="text-center mt-8 pt-6 border-t border-gray-300">
          <div className="flex items-center justify-center mb-2">
            <span className="text-2xl mr-2">🌸</span>
            <span className="text-xl font-bold text-[#477A0C]">MYCONFORT</span>
          </div>
          <p className="text-lg font-semibold text-[#477A0C] mb-2">
            Merci pour votre confiance !
          </p>
          <p className="text-sm text-gray-600">
            Votre spécialiste en matelas et literie de qualité
          </p>
          <div className="mt-3 text-xs text-gray-500">
            <p>88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45</p>
            <p>Email: myconfort@gmail.com - SIRET: 824 313 530 00027</p>
          </div>
        </div>
      </div>

      {/* Élément invoice pour la génération PDF avec html2pdf.js */}
      <div 
        id="invoice" 
        style={{
          width: '210mm',
          padding: '20mm',
          fontFamily: 'Arial, sans-serif',
          fontSize: '12pt',
          color: '#000',
          position: 'absolute',
          left: '-9999px',
          top: '0',
          backgroundColor: 'white'
        }}
      >
        <h1 style={{ color: '#477A0C', fontSize: '24pt', marginBottom: '10mm' }}>MYCONFORT</h1>
        <p><strong>Facture n° :</strong> {invoice.invoiceNumber}</p>
        <p><strong>Date :</strong> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</p>
        {invoice.eventLocation && (
          <p><strong>Lieu :</strong> {invoice.eventLocation}</p>
        )}

        <div style={{ marginTop: '15mm', marginBottom: '10mm' }}>
          <h2 style={{ color: '#477A0C', borderBottom: '1px solid #ccc', paddingBottom: '2mm' }}>
            Informations client
          </h2>
          <p><strong>Nom :</strong> {invoice.client.name}</p>
          <p><strong>Adresse :</strong> {invoice.client.address}</p>
          <p><strong>Ville :</strong> {invoice.client.postalCode} {invoice.client.city}</p>
          <p><strong>Téléphone :</strong> {invoice.client.phone}</p>
          <p><strong>Email :</strong> {invoice.client.email}</p>
          {invoice.advisorName && (
            <p><strong>Conseiller :</strong> {invoice.advisorName}</p>
          )}
        </div>

        <h2 style={{ color: '#477A0C', borderBottom: '1px solid #ccc', paddingBottom: '2mm' }}>
          Détail des produits
        </h2>
        <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '5mm' }} border={1}>
          <thead>
            <tr style={{ backgroundColor: '#477A0C', color: '#fff' }}>
              <th style={{ padding: '3mm', textAlign: 'left' }}>Désignation</th>
              <th style={{ padding: '3mm', textAlign: 'center' }}>Qté</th>
              <th style={{ padding: '3mm', textAlign: 'right' }}>PU TTC</th>
              <th style={{ padding: '3mm', textAlign: 'center' }}>Remise</th>
              <th style={{ padding: '3mm', textAlign: 'right' }}>Total TTC</th>
            </tr>
          </thead>
          <tbody>
            {invoice.products.map((item, i) => {
              const totalProduct = calculateProductTotal(
                item.quantity,
                item.priceTTC,
                item.discount,
                item.discountType
              );
              
              return (
                <tr key={i} style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9f9f9' }}>
                  <td style={{ padding: '3mm', borderRight: '1px solid #ccc' }}>
                    {item.name}
                    {item.category && (
                      <div style={{ fontSize: '10pt', color: '#666' }}>({item.category})</div>
                    )}
                  </td>
                  <td style={{ padding: '3mm', textAlign: 'center', borderRight: '1px solid #ccc' }}>
                    {item.quantity}
                  </td>
                  <td style={{ padding: '3mm', textAlign: 'right', borderRight: '1px solid #ccc' }}>
                    {formatCurrency(item.priceTTC)}
                  </td>
                  <td style={{ padding: '3mm', textAlign: 'center', borderRight: '1px solid #ccc' }}>
                    {item.discount > 0 ? (
                      item.discountType === 'percent' 
                        ? `${item.discount}%` 
                        : formatCurrency(item.discount)
                    ) : '-'}
                  </td>
                  <td style={{ padding: '3mm', textAlign: 'right', fontWeight: 'bold' }}>
                    {formatCurrency(totalProduct)}
                  </td>
                </tr>
              );
            })}
            {invoice.products.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: '10mm', textAlign: 'center', color: '#666' }}>
                  Aucun produit ajouté
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ marginTop: '10mm', textAlign: 'right' }}>
          <div style={{ display: 'inline-block', textAlign: 'left', border: '1px solid #ccc', padding: '5mm', backgroundColor: '#f9f9f9' }}>
            <p style={{ margin: '2mm 0' }}>Total HT: <strong>{formatCurrency(totalHT)}</strong></p>
            <p style={{ margin: '2mm 0' }}>TVA ({invoice.taxRate}%): <strong>{formatCurrency(totalTVA)}</strong></p>
            {totalDiscount > 0 && (
              <p style={{ margin: '2mm 0', color: '#d32f2f' }}>
                Remise totale: <strong>-{formatCurrency(totalDiscount)}</strong>
              </p>
            )}
            <hr style={{ margin: '3mm 0', border: 'none', borderTop: '2px solid #477A0C' }} />
            <p style={{ margin: '2mm 0', fontSize: '14pt', color: '#477A0C' }}>
              <strong>TOTAL TTC: {formatCurrency(totalTTC)}</strong>
            </p>
            
            {acompteAmount > 0 && (
              <>
                <hr style={{ margin: '3mm 0', border: 'none', borderTop: '1px solid #ccc' }} />
                <p style={{ margin: '2mm 0', color: '#1976d2' }}>
                  Acompte versé: <strong>{formatCurrency(acompteAmount)}</strong>
                </p>
                <p style={{ margin: '2mm 0', color: '#f57c00', fontSize: '12pt' }}>
                  <strong>RESTE À PAYER: {formatCurrency(montantRestant)}</strong>
                </p>
              </>
            )}
          </div>
        </div>

        {invoice.signature && (
          <div style={{ marginTop: '15mm', textAlign: 'right' }}>
            <div style={{ display: 'inline-block', border: '1px solid #ccc', padding: '5mm', width: '60mm' }}>
              <h4 style={{ color: '#477A0C', textAlign: 'center', margin: '0 0 3mm 0' }}>
                SIGNATURE CLIENT
              </h4>
              <div style={{ height: '20mm', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <img 
                  src={invoice.signature} 
                  alt="Signature" 
                  style={{ maxHeight: '100%', maxWidth: '100%' }}
                />
              </div>
              <p style={{ fontSize: '8pt', color: '#666', textAlign: 'center', margin: '3mm 0 0 0' }}>
                Signé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}

        {invoice.invoiceNotes && (
          <div style={{ marginTop: '10mm' }}>
            <h3 style={{ color: '#477A0C', borderBottom: '1px solid #ccc', paddingBottom: '2mm' }}>
              Remarques
            </h3>
            <p style={{ backgroundColor: '#f9f9f9', padding: '3mm', border: '1px solid #ccc', marginTop: '3mm' }}>
              {invoice.invoiceNotes}
            </p>
          </div>
        )}

        <div style={{ marginTop: '20mm', textAlign: 'center', color: '#477A0C' }}>
          <h2 style={{ margin: '0', fontSize: '18pt' }}>🌸 MYCONFORT</h2>
          <p style={{ margin: '3mm 0', fontSize: '14pt', fontWeight: 'bold' }}>
            Merci pour votre confiance !
          </p>
          <p style={{ margin: '2mm 0', fontSize: '10pt' }}>
            Votre spécialiste en matelas et literie de qualité
          </p>
          <div style={{ marginTop: '5mm', fontSize: '8pt', color: '#666' }}>
            <p>88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45</p>
            <p>Email: myconfort@gmail.com - SIRET: 824 313 530 00027</p>
          </div>
        </div>
      </div>
    </>
  );
};