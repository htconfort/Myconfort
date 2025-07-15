import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="terms-conditions-page" style={{
      fontFamily: 'Times New Roman, serif',
      fontSize: '11pt',
      lineHeight: '1.4',
      color: '#333',
      maxWidth: '210mm',
      margin: '0 auto',
      padding: '20px',
      background: 'white',
      pageBreakBefore: 'always'
    }}>
      {/* Header */}
      <div style={{
        textAlign: 'center',
        marginBottom: '30px',
        borderBottom: '2px solid #333',
        paddingBottom: '15px'
      }}>
        <h1 style={{
          fontSize: '18pt',
          fontWeight: 'bold',
          margin: '0',
          textTransform: 'uppercase',
          letterSpacing: '1px'
        }}>
          Conditions Générales de Vente
        </h1>
      </div>

      {/* Articles */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 1 - Livraison
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités et de la planification en demi-journée. Le transporteur livre le produit uniquement en bas de l'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d'installation ou de reprise de l'ancienne literie n'est prévu.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 2 - Délais de Livraison
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 3 - Risques de Transport
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Les marchandises voyagent aux risques du destinataire. En cas d'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoires sur le bordereau du transporteur. En cas de non-respect de cette obligation, il n'est pas possible de se retourner contre le transporteur.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 4 - Acceptation des Conditions
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Toute livraison implique l'acceptation des présentes conditions. Le transporteur livre à l'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d'accepter les marchandises lors de la livraison.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 5 - Droit de Rétractation
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Conformément au Code de la consommation, vous disposez d'un délai de 14 jours francs à compter de la réception de votre commande pour exercer votre droit de rétractation sans avoir à justifier de motifs ni à payer de pénalités. Les frais de retour sont à votre charge sauf en cas de produit défectueux.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 6 - Réclamations
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 7 - Retours
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable, sauf dans le cadre du droit de rétractation légal. Cet accord n'implique aucune reconnaissance de notre part.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 8 - Tailles des Matelas
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif et ne constituent pas une obligation contractuelle. Les matelas sur mesure doivent inclure les spécifications exactes du cadre de lit.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 9 - Odeur des Matériaux
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Les mousses viscoélastiques naturelles (à base d'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur qui disparaît après déballage. Cela ne constitue pas un défaut.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 10 - Règlements et Remises
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant. La garantie couvre les mousses, mais pas les textiles et accessoires.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 11 - Paiement
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 12 - Pénalités de Retard
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          En cas de non-paiement, une majoration de 3% du montant dû avec un minimum de 15 € sera appliquée, sans préjudice des intérêts de retard légaux. Nous nous réservons le droit de résilier la vente sans sommation.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 13 - Exigibilité en Cas de Non-Paiement
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Le non-paiement d'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 14 - Livraison Incomplète ou Non-Conforme
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison et refusez le produit. Si l'erreur est constatée après le départ du transporteur, contactez-nous sous 72h ouvrables.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 15 - Garanties Légales
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Nos produits bénéficient des garanties légales de conformité et contre les vices cachés prévues par le Code de la consommation. Ces garanties s'appliquent indépendamment de toute garantie commerciale éventuellement accordée.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 16 - Litiges
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          En cas de litige, les parties s'efforceront de trouver une solution amiable. À défaut, tout litige sera porté devant les tribunaux compétents selon les règles légales de compétence territoriale.
        </div>
      </div>

      <div style={{ marginBottom: '20px' }}>
        <div style={{
          fontSize: '12pt',
          fontWeight: 'bold',
          color: '#000',
          marginBottom: '8px',
          borderLeft: '4px solid #333',
          paddingLeft: '10px'
        }}>
          Art. 17 - Horaires de Livraison
        </div>
        <div style={{ textAlign: 'justify', marginLeft: '14px' }}>
          Les livraisons sont effectuées du lundi au vendredi (hors jours fériés). Une personne majeure doit être présente à l'adresse lors de la livraison. Toute modification d'adresse après commande doit être signalée immédiatement à myconfort66@gmail.com.
        </div>
      </div>

      {/* Contact Info */}
      <div style={{
        marginTop: '20px',
        textAlign: 'center',
        fontSize: '10pt',
        backgroundColor: '#f5f5f5',
        padding: '10px',
        borderRadius: '5px'
      }}>
        <strong>Contact :</strong> myconfort66@gmail.com
      </div>

      {/* Footer */}
      <div style={{
        marginTop: '30px',
        textAlign: 'center',
        fontStyle: 'italic',
        fontSize: '10pt',
        borderTop: '1px solid #666',
        paddingTop: '15px'
      }}>
        Les présentes Conditions générales ont été mises à jour le 23 août 2024<br />
        Version corrigée et mise en conformité - 2024
      </div>
    </div>
  );