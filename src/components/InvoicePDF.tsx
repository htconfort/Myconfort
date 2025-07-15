import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateHT, calculateProductTotal } from '../utils/calculations';

interface InvoicePDFProps {
  invoice: Invoice;
  isPreview?: boolean;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, isPreview = false }) => {
  const totals = React.useMemo(() => {
    const subtotal = invoice.products.reduce((sum, product) => {
      return sum + (product.quantity * calculateHT(product.priceTTC, invoice.taxRate));
    }, 0);

    const totalWithTax = invoice.products.reduce((sum, product) => {
      return sum + calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      );
    }, 0);

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

    return {
      subtotal,
      totalWithTax,
      totalDiscount,
      taxAmount: totalWithTax - (totalWithTax / (1 + (invoice.taxRate / 100)))
    };
  }, [invoice.products, invoice.taxRate]);

  const containerClass = isPreview 
    ? "max-w-4xl mx-auto bg-white shadow-2xl" 
    : "w-full bg-white";

  return (
    <div className={containerClass} style={{ fontFamily: 'Inter, sans-serif', color: '#080F0F' }}>
      {/* Bordure supérieure verte */}
      <div className="h-1 bg-[#477A0C]"></div>
      
      {/* En-tête de la facture */}
      <div className="p-8 border-b-4 border-[#477A0C]">
        <div className="flex justify-between items-start">
          {/* Logo et informations entreprise */}
          <div className="flex-1">
            <div className="flex items-center mb-6">
              <div className="bg-[#477A0C] rounded-full w-16 h-16 flex items-center justify-center text-[#F2EFE2] text-4xl mr-4">
                🌸
              </div>
              <div>
                <h1 className="text-4xl font-black text-[#477A0C] tracking-tight">
                  MYCONFORT
                </h1>
                <p className="text-lg font-medium" style={{ color: '#080F0F' }}>Facturation Professionnelle</p>
              </div>
            </div>
            
            <div className="text-sm space-y-1" style={{ color: '#080F0F' }}>
              <p className="font-semibold text-lg" style={{ color: '#080F0F' }}>MYCONFORT</p>
              <p className="font-semibold">88 Avenue des Ternes</p>
              <p>75017 Paris, France</p>
              <p>SIRET: 824 313 530 00027</p>
              <p>Tél: 04 68 50 41 45</p>
              <p>Email: myconfort@gmail.com</p>
              <p>Site web: https://www.htconfort.com</p>
            </div>
          </div>

          {/* Informations facture */}
          <div className="text-right">
            <div className="bg-[#477A0C] text-[#F2EFE2] px-8 py-4 rounded-lg mb-6">
              <h2 className="text-2xl font-bold">FACTURE</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center min-w-[200px]">
                <span className="font-semibold" style={{ color: '#080F0F' }}>N° Facture:</span>
                <span className="font-bold text-xl text-[#477A0C]">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: '#080F0F' }}>Date:</span>
                <span className="font-semibold" style={{ color: '#080F0F' }}>{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</span>
              </div>
              {invoice.eventLocation && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold" style={{ color: '#080F0F' }}>Lieu:</span>
                  <span className="font-semibold" style={{ color: '#080F0F' }}>{invoice.eventLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div className="p-8 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[#477A0C] mb-4 border-b-2 border-[#477A0C] pb-2">
              FACTURER À
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-lg" style={{ color: '#080F0F' }}>{invoice.client.name}</p>
              <p style={{ color: '#080F0F' }}>{invoice.client.address}</p>
              <p style={{ color: '#080F0F' }}>{invoice.client.postalCode} {invoice.client.city}</p>
              {invoice.client.siret && <p style={{ color: '#080F0F' }}>SIRET: {invoice.client.siret}</p>}
              <div className="pt-2 space-y-1">
                <p style={{ color: '#080F0F' }}>
                  <span className="font-semibold">Tél:</span> {invoice.client.phone}
                </p>
                <p style={{ color: '#080F0F' }}>
                  <span className="font-semibold">Email:</span> {invoice.client.email}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#477A0C] mb-4 border-b-2 border-[#477A0C] pb-2">
              INFORMATIONS COMPLÉMENTAIRES
            </h3>
            <div className="space-y-2 text-sm">
              {invoice.client.housingType && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Type de logement:</span> {invoice.client.housingType}</p>
              )}
              {invoice.client.doorCode && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Code d'accès:</span> {invoice.client.doorCode}</p>
              )}
              {invoice.delivery.method && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Livraison:</span> {invoice.delivery.method}</p>
              )}
              {invoice.advisorName && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Conseiller:</span> {invoice.advisorName}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="p-8">
        <h3 className="text-lg font-bold text-[#477A0C] mb-6 border-b-2 border-[#477A0C] pb-2">
          DÉTAIL DES PRODUITS
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#477A0C] text-[#F2EFE2]">
                <th className="border border-gray-300 px-4 py-4 text-left font-bold">DÉSIGNATION</th>
                <th className="border border-gray-300 px-3 py-4 text-center font-bold">QTÉ</th>
                <th className="border border-gray-300 px-3 py-4 text-right font-bold">PU HT</th>
                <th className="border border-gray-300 px-3 py-4 text-right font-bold">PU TTC</th>
                <th className="border border-gray-300 px-3 py-4 text-right font-bold">REMISE</th>
                <th className="border border-gray-300 px-3 py-4 text-right font-bold">TOTAL TTC</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((product, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-4 py-4">
                    <div className="font-semibold" style={{ color: '#080F0F' }}>{product.name}</div>
                    {product.category && (
                      <div className="text-xs mt-1" style={{ color: '#080F0F' }}>{product.category}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-center font-semibold" style={{ color: '#080F0F' }}>
                    {product.quantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-right" style={{ color: '#080F0F' }}>
                    {formatCurrency(calculateHT(product.priceTTC, invoice.taxRate))}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-right font-semibold" style={{ color: '#080F0F' }}>
                    {formatCurrency(product.priceTTC)}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-right">
                    {product.discount > 0 ? (
                      <span className="text-red-600 font-semibold">
                        -{product.discountType === 'percent' 
                          ? `${product.discount}%` 
                          : formatCurrency(product.discount)
                        }
                      </span>
                    ) : (
                      <span style={{ color: '#080F0F' }}>-</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-right font-bold" style={{ color: '#080F0F' }}>
                    {formatCurrency(calculateProductTotal(
                      product.quantity,
                      product.priceTTC,
                      product.discount,
                      product.discountType
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux avec gestion acompte */}
        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-md">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold" style={{ color: '#080F0F' }}>Total HT:</span>
                  <span className="font-semibold" style={{ color: '#080F0F' }}>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold" style={{ color: '#080F0F' }}>TVA ({invoice.taxRate}%):</span>
                  <span className="font-semibold" style={{ color: '#080F0F' }}>{formatCurrency(totals.taxAmount)}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span className="font-semibold">Remise totale:</span>
                    <span className="font-semibold">-{formatCurrency(totals.totalDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span style={{ color: '#080F0F' }}>TOTAL TTC:</span>
                    <span className="text-[#477A0C]">{formatCurrency(totals.totalWithTax)}</span>
                  </div>
                </div>
                
                {/* Gestion acompte - EXACTEMENT comme dans l'aperçu */}
                {invoice.payment.method === 'Acompte' && invoice.payment.depositAmount > 0 && (
                  <>
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold" style={{ color: '#080F0F' }}>Acompte versé:</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(invoice.payment.depositAmount)}</span>
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <div className="flex justify-between text-lg font-bold text-orange-600">
                        <span>RESTE À PAYER:</span>
                        <span>{formatCurrency(totals.totalWithTax - invoice.payment.depositAmount)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Signature si présente */}
        {invoice.signature && (
          <div className="mt-8 flex justify-end">
            <div className="border border-gray-300 rounded p-4 w-64">
              <h4 className="text-[#477A0C] font-bold text-sm mb-2 text-center">SIGNATURE CLIENT</h4>
              <div className="h-16 flex items-center justify-center">
                <img src={invoice.signature} alt="Signature" className="max-h-full max-w-full" />
              </div>
              <p className="text-xs text-center mt-2" style={{ color: '#080F0F' }}>
                Signé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Informations de paiement et notes */}
      <div className="p-8 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[#477A0C] mb-4">MODALITÉS DE PAIEMENT</h3>
            <div className="space-y-2 text-sm">
              {invoice.payment.method && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Mode de règlement:</span> {invoice.payment.method}</p>
              )}
              
              {/* Affichage spécial pour acompte */}
              {invoice.payment.method === 'Acompte' && invoice.payment.depositAmount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                  <p className="font-semibold text-blue-800">Détails de l'acompte:</p>
                  <p className="text-blue-700">Montant versé: <span className="font-bold">{formatCurrency(invoice.payment.depositAmount)}</span></p>
                  <p className="text-orange-700 font-semibold">Reste à payer: <span className="font-bold">{formatCurrency(totals.totalWithTax - invoice.payment.depositAmount)}</span></p>
                </div>
              )}
              
              <div className="bg-white p-4 rounded border mt-4">
                <p className="text-xs" style={{ color: '#080F0F' }}>
                  Paiement à réception de facture. En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal seront appliquées.
                </p>
              </div>
            </div>
          </div>

          <div>
            {invoice.invoiceNotes && (
              <>
                <h3 className="text-lg font-bold text-[#477A0C] mb-4">REMARQUES</h3>
                <div className="text-sm bg-white p-4 rounded border">
                  <p style={{ color: '#080F0F' }}>{invoice.invoiceNotes}</p>
                </div>
              </>
            )}
            
            {invoice.delivery.notes && (
              <>
                <h3 className="text-lg font-bold text-[#477A0C] mb-4 mt-6">LIVRAISON</h3>
                <div className="text-sm bg-white p-4 rounded border">
                  <p style={{ color: '#080F0F' }}>{invoice.delivery.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="p-8 border-t-4 border-[#477A0C] bg-[#477A0C] text-[#F2EFE2]">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl mr-3">🌸</span>
            <span className="text-2xl font-bold">MYCONFORT</span>
          </div>
          <p className="font-bold text-lg mb-2">Merci de votre confiance !</p>
          <p className="text-sm opacity-90">
            Votre spécialiste en matelas et literie de qualité
          </p>
          <div className="mt-4 text-xs opacity-75">
            <p>TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530</p>
          </div>
        </div>
      </div>
    </div>

    {/* PAGE 2 - CONDITIONS GÉNÉRALES DE VENTE */}
    <div style={{ pageBreakBefore: 'always' }} className="w-full bg-white" style={{ fontFamily: 'Inter, sans-serif', color: '#080F0F' }}>
      {/* En-tête page 2 */}
      <div className="h-1 bg-[#477A0C]"></div>
      
      <div className="p-8 border-b-2 border-[#477A0C]">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-[#477A0C] mb-2">CONDITIONS GÉNÉRALES DE VENTE</h1>
          <div className="text-lg font-bold text-red-600 mb-4">
            IMPORTANT : Le consommateur ne bénéficie pas d'un droit de rétractation<br/>
            pour un achat effectué dans une foire ou dans un salon.
          </div>
          <div className="text-sm text-black">
            <strong>MYCONFORT</strong> - 88 Avenue des Ternes, 75017 Paris<br/>
            SIRET: 824 313 530 00027 - Email: myconfort@gmail.com
          </div>
        </div>
      </div>

      {/* Articles des CGV */}
      <div className="p-6 text-sm leading-relaxed">
        <div className="grid grid-cols-1 gap-4">
          {/* Article 1 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 1 - Livraison
            </div>
            <div className="text-black text-justify ml-4">
              Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités et de la planification en demi-journée. Le transporteur livre le produit uniquement en bas de l'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d'installation ou de reprise de l'ancienne literie n'est prévu.
            </div>
          </div>

          {/* Article 2 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 2 - Délais de Livraison
            </div>
            <div className="text-black text-justify ml-4">
              Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.
            </div>
          </div>

          {/* Article 3 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 3 - Risques de Transport
            </div>
            <div className="text-black text-justify ml-4">
              Les marchandises voyagent aux risques du destinataire. En cas d'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoires sur le bordereau du transporteur. En cas de non-respect de cette obligation, il n'est pas possible de se retourner contre le transporteur.
            </div>
          </div>

          {/* Article 4 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 4 - Acceptation des Conditions
            </div>
            <div className="text-black text-justify ml-4">
              Toute livraison implique l'acceptation des présentes conditions. Le transporteur livre à l'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d'accepter les marchandises lors de la livraison.
            </div>
          </div>

          {/* Article 5 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 5 - Droit de Rétractation
            </div>
            <div className="text-black text-justify ml-4">
              Conformément au Code de la consommation, vous disposez d'un délai de 14 jours francs à compter de la réception de votre commande pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités. Les frais de retour sont à votre charge sauf en cas de produit défectueux.
            </div>
          </div>

          {/* Article 6 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 6 - Réclamations
            </div>
            <div className="text-black text-justify ml-4">
              Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.
            </div>
          </div>

          {/* Article 7 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 7 - Retours
            </div>
            <div className="text-black text-justify ml-4">
              Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable, sauf dans le cadre du droit de rétractation légal. Cet accord n'implique aucune reconnaissance de notre part.
            </div>
          </div>

          {/* Article 8 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 8 - Tailles des Matelas
            </div>
            <div className="text-black text-justify ml-4">
              Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif et ne constituent pas une obligation contractuelle. Les matelas sur mesure doivent inclure les spécifications exactes du cadre de lit.
            </div>
          </div>

          {/* Article 9 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 9 - Odeur des Matériaux
            </div>
            <div className="text-black text-justify ml-4">
              Les mousses viscoélastiques naturelles (à base d'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur qui disparaît après déballage. Cela ne constitue pas un défaut.
            </div>
          </div>

          {/* Article 10 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 10 - Règlements et Remises
            </div>
            <div className="text-black text-justify ml-4">
              Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant. La garantie couvre les mousses, mais pas les textiles et accessoires.
            </div>
          </div>

          {/* Article 11 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 11 - Paiement
            </div>
            <div className="text-black text-justify ml-4">
              Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.
            </div>
          </div>

          {/* Article 12 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 12 - Pénalités de Retard
            </div>
            <div className="text-black text-justify ml-4">
              En cas de non-paiement, une majoration de 3% du montant dû avec un minimum de 15 € sera appliquée, sans préjudice des intérêts de retard légaux. Nous nous réservons le droit de résilier la vente sans sommation.
            </div>
          </div>

          {/* Article 13 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 13 - Exigibilité en Cas de Non-Paiement
            </div>
            <div className="text-black text-justify ml-4">
              Le non-paiement d'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.
            </div>
          </div>

          {/* Article 14 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 14 - Livraison Incomplète ou Non-Conforme
            </div>
            <div className="text-black text-justify ml-4">
              En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison et refusez le produit. Si l'erreur est constatée après le départ du transporteur, contactez-nous sous 72h ouvrables.
            </div>
          </div>

          {/* Article 15 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 15 - Garanties Légales
            </div>
            <div className="text-black text-justify ml-4">
              Nos produits bénéficient des garanties légales de conformité et contre les vices cachés prévues par le Code de la consommation. Ces garanties s'appliquent indépendamment de toute garantie commerciale éventuellement accordée.
            </div>
          </div>

          {/* Article 16 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 16 - Litiges
            </div>
            <div className="text-black text-justify ml-4">
              En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, tout litige sera porté devant les tribunaux compétents selon les règles légales de compétence territoriale.
            </div>
          </div>

          {/* Article 17 */}
          <div className="mb-4">
            <div className="font-bold text-black mb-2 border-l-4 border-[#477A0C] pl-3">
              Art. 17 - Horaires de Livraison
            </div>
            <div className="text-black text-justify ml-4">
              Les livraisons sont effectuées du lundi au vendredi (hors jours fériés). Une personne majeure doit être présente à l'adresse lors de la livraison. Toute modification d'adresse après commande doit être signalée immédiatement à myconfort66@gmail.com.
            </div>
          </div>
        </div>

        {/* Contact et footer */}
        <div className="mt-8 pt-4 border-t border-gray-300">
          <div className="text-center bg-gray-100 p-4 rounded">
            <div className="font-bold text-black">Contact : myconfort66@gmail.com</div>
          </div>
          
          <div className="text-center mt-4 text-xs text-gray-600 italic">
            Les présentes Conditions générales ont été mises à jour le 23 août 2024<br/>
            Version corrigée et mise en conformité - 2024
          </div>
        </div>
      </div>

      {/* Pied de page page 2 */}
      <div className="p-4 border-t-2 border-[#477A0C] bg-[#477A0C] text-[#F2EFE2] text-center">
        <div className="text-sm">
          <strong>MYCONFORT</strong> - 88 Avenue des Ternes, 75017 Paris<br/>
          Tél: 04 68 50 41 45 | Email: myconfort@gmail.com | SIRET: 824 313 530 00027
        </div>
      </div>
    </div>
  );
};