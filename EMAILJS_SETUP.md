# 📧 CONFIGURATION EMAILJS POUR MYCONFORT

## 🔍 PRÉSENTATION
EmailJS est un service qui permet d'envoyer des emails directement depuis le navigateur, sans avoir besoin d'un serveur backend. C'est une solution idéale pour MYCONFORT car elle est simple à mettre en place et fiable.

## 🛠️ ÉTAPES DE CONFIGURATION

### ÉTAPE 1 : Créer un compte EmailJS
1. Allez sur [EmailJS](https://www.emailjs.com/) et créez un compte gratuit
2. Le plan gratuit permet d'envoyer 200 emails par mois, ce qui est suffisant pour la plupart des utilisations

### ÉTAPE 2 : Ajouter un service d'email
1. Dans votre tableau de bord EmailJS, cliquez sur "Email Services"
2. Cliquez sur "Add New Service"
3. Choisissez votre fournisseur d'email (Gmail, Outlook, etc.)
4. Suivez les instructions pour connecter votre compte email
5. Une fois connecté, notez votre **Service ID** (format: `service_xxxxxxx`)

### ÉTAPE 3 : Créer un template d'email
1. Dans votre tableau de bord, cliquez sur "Email Templates"
2. Cliquez sur "Create New Template"
3. Donnez un nom à votre template (ex: "MYCONFORT Facture")
4. Configurez votre template avec les variables suivantes:

**Sujet du mail:**
```
Facture MYCONFORT n°{{invoice_number}}
```

**Corps du mail:**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #477A0C, #5A8F0F); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">🌸 MYCONFORT</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">Facturation professionnelle</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #477A0C; margin-top: 0;">Bonjour {{to_name}},</h2>
    
    <p>Veuillez trouver ci-joint votre facture n°{{invoice_number}} générée avec notre système MYCONFORT.</p>
    
    <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #477A0C;">
      <h3 style="margin: 0 0 10px 0; color: #477A0C;">📋 Détails de la facture</h3>
      <p style="margin: 5px 0;"><strong>Numéro :</strong> {{invoice_number}}</p>
      <p style="margin: 5px 0;"><strong>Date :</strong> {{invoice_date}}</p>
      <p style="margin: 5px 0;"><strong>Montant :</strong> {{total_amount}}</p>
      {{#if deposit_amount}}
      <p style="margin: 5px 0;"><strong>Acompte versé :</strong> {{deposit_amount}}</p>
      <p style="margin: 5px 0; color: #ff6b35;"><strong>Reste à payer :</strong> {{remaining_amount}}</p>
      {{/if}}
    </div>
    
    {{#if has_signature}}
    <p style="color: #28a745;">✅ Cette facture a été signée électroniquement.</p>
    {{/if}}
    
    <p>{{message}}</p>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px;">
      <p><strong>MYCONFORT</strong><br>
      88 Avenue des Ternes, 75017 Paris<br>
      Tél: 04 68 50 41 45 | Email: myconfort@gmail.com<br>
      SIRET: 824 313 530 00027</p>
    </div>
  </div>
</div>
```

5. Cliquez sur "Save" pour enregistrer votre template
6. Notez votre **Template ID** (format: `template_xxxxxxx`)

### ÉTAPE 4 : Obtenir votre User ID (Public Key)
1. Dans votre tableau de bord, cliquez sur "Account"
2. Allez dans l'onglet "API Keys"
3. Notez votre **Public Key** (format: `xxxxxxxxxxxxxxxxxxxxxx`)

### ÉTAPE 5 : Configurer MYCONFORT
1. Dans l'application MYCONFORT, cliquez sur le bouton "EmailJS" dans la barre de navigation
2. Remplissez les champs avec vos identifiants:
   - **Service ID**: votre Service ID noté à l'étape 2
   - **Template ID**: votre Template ID noté à l'étape 3
   - **User ID (Public Key)**: votre Public Key notée à l'étape 4
3. Cliquez sur "Tester la connexion" pour vérifier que tout fonctionne
4. Cliquez sur "Enregistrer" pour sauvegarder votre configuration

## 📋 VARIABLES DISPONIBLES POUR LE TEMPLATE

Voici les variables que vous pouvez utiliser dans votre template EmailJS:

- `{{to_email}}` - Email du destinataire
- `{{to_name}}` - Nom du destinataire
- `{{from_name}}` - Nom de l'expéditeur (MYCONFORT)
- `{{invoice_number}}` - Numéro de facture
- `{{invoice_date}}` - Date de la facture
- `{{total_amount}}` - Montant total TTC
- `{{deposit_amount}}` - Montant de l'acompte (si applicable)
- `{{remaining_amount}}` - Montant restant à payer (si applicable)
- `{{has_signature}}` - Si la facture est signée (Oui/Non)
- `{{advisor_name}}` - Nom du conseiller
- `{{message}}` - Corps du message
- `{{pdf_data}}` - Données PDF en base64 (pour les pièces jointes)

## 🔄 FONCTIONNEMENT DE L'ENVOI D'EMAILS

1. L'utilisateur remplit la facture dans MYCONFORT
2. L'utilisateur clique sur "Envoyer avec EmailJS"
3. MYCONFORT génère un PDF de la facture
4. Le PDF est converti en base64
5. Les données sont envoyées à EmailJS avec le template configuré
6. EmailJS envoie l'email avec le PDF en pièce jointe
7. Le client reçoit l'email avec la facture

## 📊 LIMITES ET QUOTAS

- Plan gratuit: 200 emails par mois
- Taille maximale des pièces jointes: 50 MB
- Nombre maximum de destinataires: 50

## 🔧 DÉPANNAGE

### L'email n'est pas envoyé
- Vérifiez que vos identifiants sont corrects
- Vérifiez que votre service d'email est correctement configuré
- Vérifiez que vous n'avez pas dépassé votre quota mensuel

### Le PDF n'est pas joint à l'email
- Vérifiez que la variable `{{pdf_data}}` est bien présente dans votre template
- Vérifiez que la taille du PDF ne dépasse pas 50 MB

### Erreur lors du test de connexion
- Vérifiez que vos identifiants sont correctement saisis
- Vérifiez que votre compte EmailJS est actif
- Vérifiez votre connexion internet

## 🔒 SÉCURITÉ

- EmailJS utilise votre Public Key pour l'authentification, ce qui est sécurisé pour une utilisation côté client
- Les emails sont envoyés via votre service d'email configuré, donc ils apparaîtront comme envoyés depuis votre adresse
- Les données sont transmises via HTTPS pour garantir la confidentialité

## 📱 COMPATIBILITÉ

EmailJS est compatible avec tous les navigateurs modernes:
- Chrome
- Firefox
- Safari
- Edge
- Opera

## 🆙 MISE À NIVEAU

Si vous avez besoin de plus de 200 emails par mois, vous pouvez passer à un plan payant sur EmailJS:
- Basic: 1000 emails/mois pour $14.95/mois
- Pro: 10000 emails/mois pour $39.95/mois
- Enterprise: Volume personnalisé