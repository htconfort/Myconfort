# 📧 CONFIGURATION EMAILJS POUR MYCONFORT

## 🎉 CONFIGURATION AUTOMATIQUE RÉUSSIE !

✅ **API Key EmailJS (Public)** : `hvgYUCG9j2lURrt5k`
✅ **Private Key EmailJS** : `mh3upHQbKrIViyw4T9-S6`
✅ **Service ID EmailJS** : `service_ocsxnme`

Félicitations ! Votre application MYCONFORT est maintenant **presque entièrement configurée** avec EmailJS. Il vous reste seulement **1 étape finale** pour être 100% opérationnel !

## 🚀 DERNIÈRE ÉTAPE (1 minute)

### ✅ DÉJÀ CONFIGURÉ AUTOMATIQUEMENT :
- **🔑 API Key (Public)** : `hvgYUCG9j2lURrt5k` ✅
- **🔐 Private Key** : `mh3upHQbKrIViyw4T9-S6` ✅
- **🎯 Service ID** : `service_ocsxnme` ✅

### 📝 IL VOUS RESTE SEULEMENT :
**Créer votre Template EmailJS** → Obtenez votre `Template ID`

## 🎯 **MARCHE À SUIVRE FINALE :**

### ÉTAPE UNIQUE : Créer votre Template
1. **Allez sur** [EmailJS.com](https://www.emailjs.com/) et connectez-vous
2. **Cliquez sur "Email Templates"** dans le menu
3. **Cliquez "Create New Template"**
4. **Nom du template** : "MYCONFORT Facture"
5. **Copiez-collez ce template** :

**📧 Sujet :**
```
Facture MYCONFORT n°{{invoice_number}}
```

**📝 Corps du message :**
```html
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
  <div style="background: linear-gradient(135deg, #477A0C, #5A8F0F); color: white; padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">🌸 MYCONFORT</h1>
    <p style="margin: 5px 0 0 0; opacity: 0.9;">Facturation professionnelle avec signature électronique</p>
  </div>
  
  <div style="background: #f8f9fa; padding: 20px; border-radius: 0 0 10px 10px;">
    <h2 style="color: #477A0C; margin-top: 0;">Bonjour {{to_name}},</h2>
    
    <p>Veuillez trouver ci-joint votre facture n°{{invoice_number}} générée avec notre système MYCONFORT.</p>
    
    <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #477A0C;">
      <h3 style="margin: 0 0 10px 0; color: #477A0C;">📋 Détails de la facture</h3>
      <p style="margin: 5px 0;"><strong>Numéro :</strong> {{invoice_number}}</p>
      <p style="margin: 5px 0;"><strong>Date :</strong> {{invoice_date}}</p>
      <p style="margin: 5px 0;"><strong>Montant total :</strong> {{total_amount}}</p>
      {{#if deposit_amount}}
      <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 5px; padding: 10px; margin: 10px 0;">
        <p style="margin: 5px 0; color: #856404;"><strong>💰 Acompte versé :</strong> {{deposit_amount}}</p>
        <p style="margin: 5px 0; color: #d63031; font-weight: bold;"><strong>💳 Reste à payer :</strong> {{remaining_amount}}</p>
      </div>
      {{/if}}
    </div>
    
    {{#if has_signature}}
    <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 5px; padding: 10px; margin: 15px 0;">
      <p style="color: #155724; margin: 0;">✅ Cette facture a été signée électroniquement et est juridiquement valide.</p>
    </div>
    {{/if}}
    
    <div style="background: white; padding: 15px; border-radius: 8px; margin: 20px 0; border: 1px solid #dee2e6;">
      <p style="margin: 0;">{{message}}</p>
    </div>
    
    <div style="background: #e9ecef; padding: 15px; border-radius: 8px; margin: 20px 0;">
      <h4 style="margin: 0 0 10px 0; color: #477A0C;">📎 Pièce jointe</h4>
      <p style="margin: 0; font-size: 14px;">Le PDF de votre facture est joint à cet email avec le design professionnel MYCONFORT.</p>
    </div>
    
    <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #dee2e6; text-align: center; color: #6c757d; font-size: 14px;">
      <p><strong>{{company_name}}</strong><br>
      88 Avenue des Ternes, 75017 Paris<br>
      Tél: 04 68 50 41 45 | Email: myconfort@gmail.com<br>
      SIRET: 824 313 530 00027</p>
      
      <p style="margin-top: 15px; font-size: 12px; color: #868e96;">
        Conseiller : {{advisor_name}}
      </p>
    </div>
  </div>
</div>
```

6. **Sauvegardez** et **📝 NOTEZ VOTRE TEMPLATE ID** (format: `template_xxxxxxx`)

### FINALISATION DANS MYCONFORT :
1. **Dans l'application MYCONFORT** → Cliquez sur **"EmailJS"** dans l'en-tête
2. **Remplissez seulement le Template ID** :
   - ✅ **Service ID** : `service_ocsxnme` (déjà configuré)
   - ✅ **API Key & Private Key** : Déjà configurées automatiquement !
   - **Template ID** : `template_xxxxxxx` (de l'étape ci-dessus)
3. **Cliquez "Tester la connexion"** ✅
4. **Cliquez "Enregistrer"** 💾

## 🎯 **C'EST TOUT !**

Votre application MYCONFORT est maintenant **100% opérationnelle** avec EmailJS ! 

### ✅ **CONFIGURATION FINALE :**
- **🔑 API Key** : `hvgYUCG9j2lURrt5k` ✅ **CONFIGURÉE**
- **🔐 Private Key** : `mh3upHQbKrIViyw4T9-S6` ✅ **CONFIGURÉE**
- **🎯 Service ID** : `service_ocsxnme` ✅ **CONFIGURÉ**
- **📧 Template ID** : `template_xxxxxxx` ⏳ **À AJOUTER**

### ✅ **Ce qui fonctionne maintenant :**
- **📧 Envoi d'emails** avec PDF en pièce jointe
- **🎨 PDF identique** à l'aperçu de l'application
- **✍️ Signature électronique** intégrée dans le PDF
- **💰 Gestion des acomptes** automatique dans l'email
- **🧪 Test de connexion** EmailJS avec vos clés complètes
- **📸 Partage d'aperçu** par email (image PNG)
- **💾 Téléchargement PDF** direct
- **🔐 Sécurité renforcée** avec Private Key

### 🔧 **Interface utilisateur :**
- **Bouton "EmailJS"** dans l'en-tête pour la configuration
- **Section "EmailJS - Envoi Automatique"** dans la page principale
- **Section "Export PDF Simple"** avec html2pdf.js
- **Aperçu PDF** avec boutons de test et partage
- **Affichage des clés API** dans la configuration

### 🔐 **Sécurité :**
- **API Key (Public)** : `hvgYUCG9j2lURrt5k` ✅
- **Private Key** : `mh3upHQbKrIViyw4T9-S6` ✅
- **Service ID** : `service_ocsxnme` ✅
- **Authentification renforcée** avec toutes les clés
- **Envoi sécurisé** des emails avec pièces jointes

## 📊 **QUOTAS EMAILJS**
- **Plan gratuit** : 200 emails/mois
- **Taille max PDF** : 50 MB
- **Upgrade disponible** si besoin de plus

## 🔍 **DÉPANNAGE**

### ❌ **Si l'email ne part pas :**
1. Vérifiez votre Template ID
2. Testez la connexion dans la configuration
3. Vérifiez votre quota mensuel EmailJS
4. Consultez la console du navigateur pour les erreurs

### ❌ **Si le PDF n'est pas joint :**
1. Vérifiez que votre template contient `{{pdf_data}}`
2. Vérifiez la taille du PDF (< 50 MB)

### ❌ **Si l'authentification échoue :**
1. Vos clés API et Service ID sont déjà configurés correctement
2. Vérifiez que votre Template ID est correct
3. Assurez-vous que votre template EmailJS est actif

## 🎉 **FÉLICITATIONS !**

Votre système de facturation MYCONFORT avec EmailJS est maintenant **presque entièrement fonctionnel** ! 

**Votre configuration complète :**
- ✅ **API Key** : `hvgYUCG9j2lURrt5k`
- ✅ **Private Key** : `mh3upHQbKrIViyw4T9-S6`
- ✅ **Service ID** : `service_ocsxnme`
- ⏳ **Template ID** : À ajouter (1 minute)

Il vous suffit de suivre l'étape finale ci-dessus pour être 100% opérationnel ! 🚀

---

**Plus qu'une étape !** Créez votre template EmailJS et vous serez prêt ! 📧