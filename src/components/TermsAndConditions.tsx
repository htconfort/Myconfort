import React from "react";

interface ArticleProps {
  num: string;
  titre: string;
  children: React.ReactNode;
}

const Article: React.FC<ArticleProps> = ({ num, titre, children }) => (
  <div className="mb-5" style={{ pageBreakInside: 'avoid' }}>
    <div className="text-sm font-bold text-black mb-2 border-l-4 border-[#333] pl-3">
      Art. {num} - {titre}
    </div>
    <div className="text-justify ml-4" style={{ fontSize: '14px', lineHeight: '1.4' }}>
      {children}
    </div>
  </div>
);

const TermsAndConditions: React.FC = () => (
  <div className="w-full bg-white px-8 py-10" style={{ fontFamily: 'Times New Roman, serif', fontSize: 14, color: '#333' }}>
    <div className="text-center mb-8 pb-4 border-b-2 border-[#333]">
      <h1 className="text-2xl font-bold uppercase tracking-wider">Conditions Générales de Vente</h1>
      <div className="mt-4 text-base font-bold uppercase tracking-wider" style={{ color: '#d32f2f' }}>
        IMPORTANT : Le consommateur ne bénéficie pas d&apos;un droit de rétractation<br />pour un achat effectué dans une foire ou dans un salon.
      </div>
    </div>
    
    <section>
      <Article num="1" titre="Livraison">
        Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités et de la planification en demi-journée. Le transporteur livre le produit uniquement en bas de l&apos;immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d&apos;installation ou de reprise de l&apos;ancienne literie n&apos;est prévu.
      </Article>
      
      <Article num="2" titre="Délais de Livraison">
        Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.
      </Article>
      
      <Article num="3" titre="Risques de Transport">
        Les marchandises voyagent aux risques du destinataire. En cas d&apos;avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoires sur le bordereau du transporteur. En cas de non-respect de cette obligation, il n&apos;est pas possible de se retourner contre le transporteur.
      </Article>
      
      <Article num="4" titre="Acceptation des Conditions">
        Toute livraison implique l&apos;acceptation des présentes conditions. Le transporteur livre à l&apos;adresse indiquée sans monter les étages. Le client est responsable de vérifier et d&apos;accepter les marchandises lors de la livraison.
      </Article>
      
      <Article num="5" titre="Droit de Rétractation">
        Conformément au Code de la consommation, vous disposez d&apos;un délai de 14 jours francs à compter de la réception de votre commande pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités. Les frais de retour sont à votre charge sauf en cas de produit défectueux.
      </Article>
      
      <Article num="6" titre="Réclamations">
        Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.
      </Article>
      
      <Article num="7" titre="Retours">
        Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable, sauf dans le cadre du droit de rétractation légal. Cet accord n&apos;implique aucune reconnaissance de notre part.
      </Article>
      
      <Article num="8" titre="Tailles des Matelas">
        Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif et ne constituent pas une obligation contractuelle. Les matelas sur mesure doivent inclure les spécifications exactes du cadre de lit.
      </Article>
      
      <Article num="9" titre="Odeur des Matériaux">
        Les mousses viscoélastiques naturelles (à base d&apos;huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur qui disparaît après déballage. Cela ne constitue pas un défaut.
      </Article>
      
      <Article num="10" titre="Règlements et Remises">
        Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant. La garantie couvre les mousses, mais pas les textiles et accessoires.
      </Article>
      
      <Article num="11" titre="Paiement">
        Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.
      </Article>
      
      <Article num="12" titre="Pénalités de Retard">
        En cas de non-paiement, une majoration de 3% du montant dû avec un minimum de 15 € sera appliquée, sans préjudice des intérêts de retard légaux. Nous nous réservons le droit de résilier la vente sans sommation.
      </Article>
      
      <Article num="13" titre="Exigibilité en Cas de Non-Paiement">
        Le non-paiement d&apos;une échéance rend immédiatement exigible le solde de toutes les échéances à venir.
      </Article>
      
      <Article num="14" titre="Livraison Incomplète ou Non-Conforme">
        En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison et refusez le produit. Si l&apos;erreur est constatée après le départ du transporteur, contactez-nous sous 72h ouvrables.
      </Article>
      
      <Article num="15" titre="Garanties Légales">
        Nos produits bénéficient des garanties légales de conformité et contre les vices cachés prévues par le Code de la consommation. Ces garanties s&apos;appliquent indépendamment de toute garantie commerciale éventuellement accordée.
      </Article>
      
      <Article num="16" titre="Litiges">
        En cas de litige, les parties s&apos;efforceront de trouver une solution amiable. À défaut, tout litige sera porté devant les tribunaux compétents selon les règles légales de compétence territoriale.
      </Article>
      
      <Article num="17" titre="Horaires de Livraison">
        Les livraisons sont effectuées du lundi au vendredi (hors jours fériés). Une personne majeure doit être présente à l&apos;adresse lors de la livraison. Toute modification d&apos;adresse après commande doit être signalée immédiatement à myconfort66@gmail.com.
      </Article>
    </section>

    <div className="mt-5 text-center text-xs bg-gray-100 p-3 rounded">
      <strong>Contact :</strong> myconfort66@gmail.com
    </div>

    <div className="mt-8 text-center italic text-xs border-t border-gray-400 pt-4">
      Les présentes Conditions générales ont été mises à jour le 23 août 2024<br />
      Version corrigée et mise en conformité - 2024
    </div>

    <div className="mt-8 text-center text-xs text-gray-500 print:hidden">
      <p><em>Document prêt pour impression ou conversion PDF</em></p>
      <p><em>Format A4 - Police 14px - Optimisé pour la lisibilité</em></p>
    </div>
  </div>
);

export { TermsAndConditions };