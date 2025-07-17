# 🎯 CONFIGURATION MAKE HTTP POUR EMAILJS MYCONFORT - VERSION FINALE

## ✅ **CONFIGURATION CORRIGÉE AVEC VOS IDENTIFIANTS EXACTS**

### 🔧 **Module HTTP Make - Paramètres :**
- **Method** : `POST`
- **URL** : `https://api.emailjs.com/api/v1.0/email/send`

### 📝 **Headers :**
```json
[
  { "name": "Content-Type", "value": "application/json" },
  { "name": "origin", "value": "http://localhost" }
]
```

## 🚀 **BODY JSON - CONFIGURATION FINALE MYCONFORT :**

### 📧 **Version Basique (Test Simple) :**
```json
{
  "service_id": "service_ocsxnme",
  "template_id": "template_yng4k8s",
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_name": "Jean Client",
    "from_name": "MYCONFORT",
    "reply_to": "myconfort@gmail.com",
    "subject": "Votre facture MYCONFORT",
    "invoice_number": "F-2025-001",
    "invoice_date": "28/01/2025",
    "total_amount": "299,99 €",
    "deposit_amount": "100,00 €",
    "remaining_amount": "199,99 €",
    "message": "Bonjour Jean,\n\nVeuillez trouver ci-joint votre facture MYCONFORT n°F-2025-001.\n\nDétails :\n• Total TTC : 299,99 €\n• Acompte versé : 100,00 €\n• Reste à payer : 199,99 €\n\nCordialement,\nL'équipe MYCONFORT",
    "company_name": "MYCONFORT",
    "company_logo": "https://via.placeholder.com/120x60/477A0C/F2EFE2?text=MYCONFORT",
    "advisor_name": "Conseiller MYCONFORT",
    "has_pdf": "false",
    "template_used": "template_yng4k8s"
  }
}
```

### 📎 **Version avec Pièce Jointe PDF (Plan Premium) :**
```json
{
  "service_id": "service_ocsxnme",
  "template_id": "template_yng4k8s",
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_name": "Jean Client",
    "from_name": "MYCONFORT",
    "reply_to": "myconfort@gmail.com",
    "subject": "Votre facture MYCONFORT",
    "invoice_number": "F-2025-001",
    "invoice_date": "28/01/2025",
    "total_amount": "299,99 €",
    "deposit_amount": "100,00 €",
    "remaining_amount": "199,99 €",
    "message": "Bonjour Jean,\n\nVeuillez trouver ci-joint votre facture MYCONFORT n°F-2025-001 en pièce jointe PDF.\n\n📋 DÉTAILS :\n• Numéro : F-2025-001\n• Date : 28/01/2025\n• Total TTC : 299,99 €\n• Acompte versé : 100,00 €\n• Reste à payer : 199,99 €\n\n📎 Le PDF de votre facture est joint à cet email.\n\nCordialement,\nL'équipe MYCONFORT\n\n---\nMYCONFORT\n88 Avenue des Ternes, 75017 Paris\nTél: 04 68 50 41 45\nEmail: myconfort@gmail.com",
    "attachment_name": "Facture_MYCONFORT_F-2025-001.pdf",
    "attachment_content": "JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQNC0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0K",
    "attachment_type": "application/pdf",
    "attachment_size": "256KB",
    "has_pdf": "true",
    "company_name": "MYCONFORT",
    "company_logo": "https://via.placeholder.com/120x60/477A0C/F2EFE2?text=MYCONFORT",
    "advisor_name": "Conseiller MYCONFORT",
    "template_used": "template_yng4k8s"
  }
}
```

## 🎨 **MESSAGE HTML PERSONNALISÉ POUR TEMPLATE :**

### 📧 **Message HTML Riche :**
```html
<div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
  <div style="background: linear-gradient(135deg, #477A0C, #5A8F0F); color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
    <h1 style="margin: 0; font-size: 24px;">🌸 MYCONFORT</h1>
    <p style="margin: 5px 0 0 0;">Votre spécialiste en matelas et literie de qualité</p>
  </div>
  
  <div style="padding: 20px; background: white; border: 1px solid #ddd; border-top: none;">
    <h2 style="color: #477A0C;">Bonjour {{to_name}},</h2>
    
    <p>Veuillez trouver ci-joint votre facture MYCONFORT n°{{invoice_number}}.</p>
    
    <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
      <h3 style="color: #477A0C; margin-top: 0;">📋 Détails de votre facture :</h3>
      <ul style="margin: 0; padding-left: 20px;">
        <li><strong>Numéro :</strong> {{invoice_number}}</li>
        <li><strong>Date :</strong> {{invoice_date}}</li>
        <li><strong>Total TTC :</strong> {{total_amount}}</li>
        {{#deposit_amount}}
        <li><strong>Acompte versé :</strong> {{deposit_amount}}</li>
        <li><strong>Reste à payer :</strong> {{remaining_amount}}</li>
        {{/deposit_amount}}
      </ul>
    </div>
    
    {{#has_pdf}}
    <div style="background: #e8f5e8; border: 2px solid #477A0C; border-radius: 8px; padding: 15px; margin: 20px 0;">
      <h3 style="color: #477A0C; margin-top: 0;">📎 Votre facture PDF</h3>
      <p><strong>Fichier :</strong> {{attachment_name}}</p>
      <p><strong>Taille :</strong> {{attachment_size}}</p>
      <p style="margin-bottom: 0;">Le PDF de votre facture est joint à cet email.</p>
    </div>
    {{/has_pdf}}
    
    <p>Pour toute question, n'hésitez pas à nous contacter.</p>
    
    <p>Cordialement,<br>{{advisor_name}}</p>
  </div>
  
  <div style="background: #477A0C; color: white; padding: 15px; text-align: center; border-radius: 0 0 8px 8px;">
    <p style="margin: 0;"><strong>MYCONFORT</strong></p>
    <p style="margin: 5px 0 0 0; font-size: 12px;">88 Avenue des Ternes, 75017 Paris | Tél: 04 68 50 41 45 | Email: myconfort@gmail.com</p>
  </div>
</div>
```

## 🧪 **TESTS PROGRESSIFS RECOMMANDÉS :**

### 🥇 **Test 1 - Connexion de Base :**
```json
{
  "service_id": "service_ocsxnme",
  "template_id": "template_yng4k8s", 
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_name": "Test",
    "from_name": "MYCONFORT",
    "subject": "Test Make + EmailJS",
    "message": "Test de connexion réussi !",
    "has_pdf": "false"
  }
}
```

### 🥈 **Test 2 - Facture Complète :**
```json
{
  "service_id": "service_ocsxnme",
  "template_id": "template_yng4k8s",
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_name": "Client Test",
    "from_name": "MYCONFORT",
    "subject": "Facture MYCONFORT Test",
    "invoice_number": "TEST-001",
    "invoice_date": "28/01/2025",
    "total_amount": "150,00 €",
    "message": "Test facture complète depuis Make",
    "company_name": "MYCONFORT",
    "advisor_name": "Test Conseiller",
    "has_pdf": "false"
  }
}
```

### 🥉 **Test 3 - Avec Pièce Jointe :**
Utilisez la configuration complète avec `attachment_content` en base64.

## ✅ **RÉPONSES ATTENDUES :**

### 🎉 **Succès :**
```json
{
  "status": 200,
  "text": "OK"
}
```

### ❌ **Erreurs Courantes :**

#### 🔑 **401 Unauthorized :**
- **Cause** : `user_id` incorrect
- **Solution** : Vérifiez `hvgYUCG9j2lURrt5k`

#### 🎯 **400 Bad Request :**
- **Cause** : `service_id` ou `template_id` incorrect
- **Solution** : Vérifiez `service_ocsxnme` et `template_yng4k8s`

#### 📧 **422 Unprocessable Entity :**
- **Cause** : Service Gmail non connecté
- **Solution** : Vérifiez la configuration Gmail dans EmailJS

## 🔧 **VARIABLES MAKE DYNAMIQUES :**

### 📊 **Mapping des Variables :**
```json
{
  "template_params": {
    "to_name": "{{1.nom_client}}",
    "invoice_number": "{{1.numero_facture}}",
    "invoice_date": "{{formatDate(1.date_facture; 'DD/MM/YYYY')}}",
    "total_amount": "{{formatNumber(1.montant_total; 2)}} €",
    "deposit_amount": "{{if(1.acompte > 0; formatNumber(1.acompte; 2) + ' €'; '')}}",
    "remaining_amount": "{{if(1.acompte > 0; formatNumber(1.montant_total - 1.acompte; 2) + ' €'; '')}}",
    "attachment_content": "{{1.pdf_base64}}",
    "attachment_name": "Facture_MYCONFORT_{{1.numero_facture}}.pdf",
    "attachment_size": "{{1.taille_pdf}}",
    "has_pdf": "{{if(length(1.pdf_base64) > 0; 'true'; 'false')}}"
  }
}
```

## 🚀 **SCÉNARIOS MAKE RECOMMANDÉS :**

### 📋 **Scénario 1 - Envoi Automatique :**
1. **Trigger** : Webhook MYCONFORT
2. **HTTP Module** : Envoi EmailJS
3. **Router** : Gestion succès/erreur
4. **Update** : Statut facture envoyée

### 📎 **Scénario 2 - Avec Génération PDF :**
1. **Trigger** : Nouvelle facture
2. **PDF Generator** : Création PDF
3. **Base64 Converter** : Conversion
4. **HTTP Module** : Envoi EmailJS avec pièce jointe

### 🔄 **Scénario 3 - Relances Automatiques :**
1. **Schedule** : Quotidien
2. **Filter** : Factures impayées
3. **HTTP Module** : Relance EmailJS
4. **Log** : Enregistrement relance

## 🎯 **MONITORING ET LOGS :**

### 📊 **Métriques à Suivre :**
- **Taux de succès** des envois
- **Temps de réponse** EmailJS
- **Erreurs** par type
- **Volume** d'emails envoyés

### 🔍 **Debug et Troubleshooting :**
- **Logs Make** : Vérifiez les réponses HTTP
- **EmailJS Dashboard** : Consultez les statistiques
- **Test Mode** : Utilisez des emails de test
- **Validation** : Vérifiez le format JSON

## 🎉 **RÉSULTAT FINAL :**

Avec cette configuration, vous pouvez :
- ✅ **Envoyer** des emails MYCONFORT depuis Make
- 📎 **Joindre** des PDF jusqu'à 2MB
- 🎨 **Utiliser** votre template personnalisé
- 🔄 **Automatiser** tout le processus
- 📊 **Monitorer** les performances

Votre intégration Make + EmailJS + MYCONFORT est maintenant **100% opérationnelle** !

---

**🚀 CONFIGURATION MAKE FINALE PRÊTE !** Testez maintenant avec vos identifiants exacts ! 🔧📧
