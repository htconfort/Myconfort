# 🔧 RÉSOLUTION PROBLÈME GOOGLE APPS SCRIPT

## ❌ PROBLÈME ACTUEL
Le script avec l'ID `AKfycbxHriNqmeMTwOY5LQROM1BbiIhtysSn6L9mKA_NPnvIepT-2xZ5hFiN1NpX00_UHdVRtA` n'est pas accessible.

## 🔍 DIAGNOSTIC
L'erreur "IMPOSSIBLE DE JOINDRE LE SCRIPT" signifie généralement :
1. Le script n'est pas déployé correctement
2. Les permissions ne sont pas configurées
3. L'URL n'est pas la bonne
4. Le script a été supprimé ou désactivé

## 🛠️ SOLUTION ÉTAPE PAR ÉTAPE

### ÉTAPE 1 : Créer un nouveau script Google Apps Script

1. Allez sur https://script.google.com/home
2. Cliquez sur "Nouveau projet"
3. Remplacez le code par défaut par le script ci-dessous :

```javascript
function doPost(e) {
  try {
    console.log('📨 Requête reçue MYCONFORT:', e.postData.contents);
    
    // Traitement des données
    const data = JSON.parse(e.postData.contents);
    
    // Test simple
    if (data.requestType === 'test') {
      return ContentService
        .createTextOutput('✅ Test réussi ! Script MYCONFORT actif')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Traitement normal des factures
    if (data.email && (data.pdfBase64 || data.pdfData)) {
      // Logique d'envoi email avec PDF
      const emailSent = sendEmailWithPDF(data);
      
      if (emailSent) {
        return ContentService
          .createTextOutput('✅ Email envoyé avec succès')
          .setMimeType(ContentService.MimeType.TEXT);
      } else {
        return ContentService
          .createTextOutput('❌ Erreur lors de l\'envoi email')
          .setMimeType(ContentService.MimeType.TEXT);
      }
    }
    
    // Partage d'aperçu
    if (data.requestType === 'sharePreview' && data.imageData) {
      const shared = sharePreviewImage(data);
      
      if (shared) {
        return ContentService
          .createTextOutput('✅ Aperçu partagé avec succès')
          .setMimeType(ContentService.MimeType.TEXT);
      } else {
        return ContentService
          .createTextOutput('❌ Erreur lors du partage')
          .setMimeType(ContentService.MimeType.TEXT);
      }
    }
    
    return ContentService
      .createTextOutput('❌ Données manquantes ou format incorrect')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    console.error('❌ Erreur:', error);
    return ContentService
      .createTextOutput('❌ Erreur: ' + error.toString())
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet(e) {
  return ContentService
    .createTextOutput('🌸 MYCONFORT Script actif ! Utilisez POST pour envoyer des données.')
    .setMimeType(ContentService.MimeType.TEXT);
}

function sendEmailWithPDF(data) {
  try {
    // Décoder le PDF base64
    const pdfBase64 = data.pdfBase64 || data.pdfData;
    const pdfBlob = Utilities.newBlob(
      Utilities.base64Decode(pdfBase64),
      'application/pdf',
      data.filename || data.pdfFilename || 'facture.pdf'
    );
    
    // Préparer l'email
    const subject = `Facture MYCONFORT n°${data.invoiceNumber || 'N/A'}`;
    
    let htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #477A0C, #5A8F0F); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🌸 MYCONFORT</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Facturation professionnelle</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #477A0C; margin-top: 0;">Bonjour ${data.name || data.clientName || ''},</h2>
          
          <p>Veuillez trouver ci-joint votre facture générée avec notre système MYCONFORT.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #477A0C;">
            <h3 style="margin: 0 0 10px 0; color: #477A0C;">📋 Détails de la facture</h3>
            <p style="margin: 5px 0;"><strong>Numéro :</strong> ${data.invoiceNumber || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Date :</strong> ${data.invoiceDate || new Date().toLocaleDateString('fr-FR')}</p>
            <p style="margin: 5px 0;"><strong>Montant :</strong> ${data.totalAmount || 'N/A'}</p>
            ${data.depositAmount ? `<p style="margin: 5px 0;"><strong>Acompte versé :</strong> ${data.depositAmount}</p>` : ''}
            ${data.remainingAmount ? `<p style="margin: 5px 0; color: #ff6b35;"><strong>Reste à payer :</strong> ${data.remainingAmount}</p>` : ''}
          </div>
          
          ${data.hasSigned ? '<p style="color: #28a745;">✅ Cette facture a été signée électroniquement.</p>' : ''}
          
          <p>${data.message || 'Merci de votre confiance !'}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px;">
            <p><strong>MYCONFORT</strong><br>
            88 Avenue des Ternes, 75017 Paris<br>
            Tél: 04 68 50 41 45 | Email: myconfort@gmail.com<br>
            SIRET: 824 313 530 00027</p>
          </div>
        </div>
      </div>
    `;
    
    // Envoyer l'email
    GmailApp.sendEmail(
      data.email,
      subject,
      '', // Corps texte vide
      {
        htmlBody: htmlBody,
        attachments: [pdfBlob],
        name: 'MYCONFORT'
      }
    );
    
    console.log('✅ Email envoyé à:', data.email);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    return false;
  }
}

function sharePreviewImage(data) {
  try {
    // Décoder l'image base64
    const imageBlob = Utilities.newBlob(
      Utilities.base64Decode(data.imageData),
      `image/${data.imageFormat.toLowerCase()}`,
      data.imageFilename || 'apercu_facture.png'
    );
    
    // Préparer l'email pour l'aperçu
    const subject = `Aperçu facture MYCONFORT n°${data.invoiceNumber || 'N/A'}`;
    
    let htmlBody = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #477A0C, #5A8F0F); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">🌸 MYCONFORT</h1>
          <p style="margin: 5px 0 0 0; opacity: 0.9;">Aperçu de votre facture</p>
        </div>
        
        <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #477A0C; margin-top: 0;">Bonjour ${data.name || ''},</h2>
          
          <p>Voici l'aperçu de votre facture tel qu'il apparaît dans notre système MYCONFORT.</p>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #477A0C;">
            <h3 style="margin: 0 0 10px 0; color: #477A0C;">📋 Informations</h3>
            <p style="margin: 5px 0;"><strong>Numéro :</strong> ${data.invoiceNumber || 'N/A'}</p>
            <p style="margin: 5px 0;"><strong>Date :</strong> ${data.invoiceDate || new Date().toLocaleDateString('fr-FR')}</p>
            <p style="margin: 5px 0;"><strong>Montant :</strong> ${data.totalAmount || 'N/A'}</p>
          </div>
          
          <p>🎯 L'image ci-jointe vous montre exactement l'aperçu de votre facture.</p>
          
          <p>${data.message || 'Cordialement, l\'équipe MYCONFORT'}</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px;">
            <p><strong>MYCONFORT</strong><br>
            88 Avenue des Ternes, 75017 Paris<br>
            Tél: 04 68 50 41 45 | Email: myconfort@gmail.com</p>
          </div>
        </div>
      </div>
    `;
    
    // Envoyer l'email avec l'image
    GmailApp.sendEmail(
      data.email,
      subject,
      '', // Corps texte vide
      {
        htmlBody: htmlBody,
        attachments: [imageBlob],
        name: 'MYCONFORT'
      }
    );
    
    console.log('✅ Aperçu partagé à:', data.email);
    return true;
    
  } catch (error) {
    console.error('❌ Erreur partage aperçu:', error);
    return false;
  }
}
```

### ÉTAPE 2 : Déployer le script

1. **Sauvegardez le script** (Ctrl+S)
2. **Cliquez sur "Deploy" > "New deployment"**
3. **Sélectionnez "Web app"**
4. **Configuration CRITIQUE :**
   - **Execute as:** Me (votre email)
   - **Who has access:** Anyone
5. **Cliquez "Deploy"**
6. **Copiez la nouvelle URL /exec**

### ÉTAPE 3 : Autoriser les permissions

1. Google vous demandera d'autoriser les permissions
2. Cliquez sur "Review permissions"
3. Sélectionnez votre compte Google
4. Cliquez sur "Advanced" puis "Go to [nom du projet] (unsafe)"
5. Cliquez sur "Allow"

### ÉTAPE 4 : Tester le nouveau script

Une fois déployé, testez avec cette URL dans votre navigateur :
```
https://script.google.com/macros/s/VOTRE_NOUVEAU_ID/exec
```

Vous devriez voir : "🌸 MYCONFORT Script actif ! Utilisez POST pour envoyer des données."

## 🆔 MISE À JOUR DE L'APPLICATION

Une fois votre script redéployé, copiez le nouvel ID et je mettrai à jour l'application MYCONFORT.

## 📋 CHECKLIST DE VÉRIFICATION

- [ ] Script créé sur script.google.com
- [ ] Code copié et collé
- [ ] Sauvegardé (Ctrl+S)
- [ ] Déployé comme "Web app"
- [ ] "Execute as: Me"
- [ ] "Who has access: Anyone"
- [ ] Permissions autorisées
- [ ] URL /exec copiée
- [ ] Test dans navigateur réussi

## 🔧 DÉPANNAGE

Si vous rencontrez encore des problèmes :

1. **Vérifiez les logs** : Dans Google Apps Script, allez dans "Executions" pour voir les erreurs
2. **Testez l'URL directement** : Collez l'URL /exec dans votre navigateur
3. **Vérifiez les permissions** : Assurez-vous que "Anyone" peut accéder
4. **Redéployez** : Parfois il faut créer un nouveau déploiement

Une fois que vous avez un nouveau script ID qui fonctionne, donnez-le moi et je mettrai à jour toute l'application MYCONFORT !