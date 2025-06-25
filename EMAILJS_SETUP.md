# 📧 CONFIGURATION EMAILJS POUR MYCONFORT

## 🎉 VOTRE API KEY EST DÉJÀ CONFIGURÉE !

✅ **API Key EmailJS** : `hvgYUCG9j2lURrt5k`

Votre API Key EmailJS est déjà intégrée dans l'application MYCONFORT. Il vous reste seulement **2 étapes simples** pour finaliser la configuration !

## 🚀 ÉTAPES RAPIDES (2 minutes)

### ÉTAPE 1 : Créer votre Service EmailJS
1. **Allez sur** → [EmailJS.com](https://www.emailjs.com/)
2. **Connectez-vous** avec votre compte (ou créez-en un gratuitement)
3. **Cliquez sur "Email Services"** dans le menu
4. **Cliquez "Add New Service"**
5. **Choisissez votre fournisseur** (Gmail recommandé)
6. **Suivez les instructions** pour connecter votre compte
7. **📝 NOTEZ VOTRE SERVICE ID** (format: `service_xxxxxxx`)

### ÉTAPE 2 : Créer votre Template
1. **Cliquez sur "Email Templates"** dans le menu
2. **Cliquez "Create New Template"**
3. **Nom du template** : "MYCONFORT Facture"
4. **Copiez-collez ce template** :

**📧 Sujet :**
```
Facture MYCONFORT n°{{invoice_number}}
```

**📝 Corps du message :**
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

5. **Sauvegardez** et **📝 NOTEZ VOTRE TEMPLATE ID** (format: `template_xxxxxxx`)

### ÉTAPE 3 : Finaliser dans MYCONFORT
1. **Dans l'application MYCONFORT** → Cliquez sur **"EmailJS"** dans l'en-tête
2. **Remplissez les 2 champs** :
   - **Service ID** : `service_xxxxxxx` (de l'étape 1)
   - **Template ID** : `template_xxxxxxx` (de l'étape 2)
   - ✅ **API Key** : Déjà configurée automatiquement !
3. **Cliquez "Tester la connexion"** ✅
4. **Cliquez "Enregistrer"** 💾

## 🎯 **C'EST TOUT !**

Votre application MYCONFORT est maintenant **100% opérationnelle** avec EmailJS ! 

### ✅ **Ce qui fonctionne maintenant :**
- **📧 Envoi d'emails** avec PDF en pièce jointe
- **🎨 PDF identique** à l'aperçu de l'application
- **✍️ Signature électronique** intégrée dans le PDF
- **💰 Gestion des acomptes** automatique
- **🧪 Test de connexion** EmailJS
- **📸 Partage d'aperçu** par email (image PNG)
- **💾 Téléchargement PDF** direct

### 🔧 **Interface utilisateur :**
- **Bouton "EmailJS"** dans l'en-tête pour la configuration
- **Section "EmailJS - Envoi Automatique"** dans la page principale
- **Section "Export PDF Simple"** avec html2pdf.js
- **Aperçu PDF** avec boutons de test et partage

## 📊 **QUOTAS EMAILJS**
- **Plan gratuit** : 200 emails/mois
- **Taille max PDF** : 50 MB
- **Upgrade disponible** si besoin de plus

## 🔍 **DÉPANNAGE**

### ❌ **Si l'email ne part pas :**
1. Vérifiez vos Service ID et Template ID
2. Testez la connexion dans la configuration
3. Vérifiez votre quota mensuel EmailJS
4. Consultez la console du navigateur pour les erreurs

### ❌ **Si le PDF n'est pas joint :**
1. Vérifiez que votre template contient `{{pdf_data}}`
2. Vérifiez la taille du PDF (< 50 MB)

## 🎉 **FÉLICITATIONS !**

Votre système de facturation MYCONFORT avec EmailJS est maintenant **entièrement fonctionnel** ! 

**Votre API Key `hvgYUCG9j2lURrt5k` est déjà configurée** - il vous suffit de suivre les 3 étapes ci-dessus pour être opérationnel en 2 minutes ! 🚀

---

**Besoin d'aide ?** Toutes les instructions détaillées sont dans ce fichier ! 📋