# 🎯 CONFIGURATION MAKE HTTP MISE À JOUR - NOUVEAU SERVICE ID

## ✅ **CONFIGURATION MISE À JOUR AVEC NOUVEAU SERVICE ID**

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

## 🚀 **BODY JSON - CONFIGURATION MISE À JOUR AVEC NOUVEAU SERVICE :**

### 📧 **Version Basique (Test Simple) :**
```json
{
  "service_id": "service_ymw6jih",
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
    "template_used": "template_yng4k8s",
    "service_used": "service_ymw6jih"
  }
}
```

### 📎 **Version avec Pièce Jointe PDF (Plan Premium) :**
```json
{
  "service_id": "service_ymw6jih",
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
    "template_used": "template_yng4k8s",
    "service_used": "service_ymw6jih"
  }
}
```

## 🧪 **TESTS PROGRESSIFS AVEC NOUVEAU SERVICE :**

### 🥇 **Test 1 - Connexion de Base :**
```json
{
  "service_id": "service_ymw6jih",
  "template_id": "template_yng4k8s", 
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_name": "Test",
    "from_name": "MYCONFORT",
    "subject": "Test Make + EmailJS avec nouveau service",
    "message": "Test de connexion réussi avec nouveau service ID !",
    "has_pdf": "false",
    "service_used": "service_ymw6jih"
  }
}
```

### 🥈 **Test 2 - Facture Complète :**
```json
{
  "service_id": "service_ymw6jih",
  "template_id": "template_yng4k8s",
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_name": "Client Test",
    "from_name": "MYCONFORT",
    "subject": "Facture MYCONFORT Test avec nouveau service",
    "invoice_number": "TEST-001",
    "invoice_date": "28/01/2025",
    "total_amount": "150,00 €",
    "message": "Test facture complète depuis Make avec nouveau service",
    "company_name": "MYCONFORT",
    "advisor_name": "Test Conseiller",
    "has_pdf": "false",
    "service_used": "service_ymw6jih"
  }
}
```

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
- **Solution** : Vérifiez `service_ymw6jih` et `template_yng4k8s`

#### 📧 **422 Unprocessable Entity :**
- **Cause** : Service Gmail non connecté
- **Solution** : Vérifiez la configuration Gmail dans EmailJS

## 🔧 **VARIABLES MAKE DYNAMIQUES AVEC NOUVEAU SERVICE :**

### 📊 **Mapping des Variables :**
```json
{
  "service_id": "service_ymw6jih",
  "template_id": "template_yng4k8s",
  "user_id": "hvgYUCG9j2lURrt5k",
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
    "has_pdf": "{{if(length(1.pdf_base64) > 0; 'true'; 'false')}}",
    "service_used": "service_ymw6jih"
  }
}
```

## 🚀 **AVANTAGES DU NOUVEAU SERVICE :**

### ⚡ **Améliorations :**
- **Service ID mis à jour** : `service_ymw6jih`
- **Compatibilité maintenue** avec template `template_yng4k8s`
- **Support pièces jointes** jusqu'à 2MB
- **Même User ID** : `hvgYUCG9j2lURrt5k`

### 📊 **Monitoring :**
- **Logs Make** : Vérifiez les réponses HTTP
- **EmailJS Dashboard** : Consultez les statistiques
- **Test Mode** : Utilisez des emails de test
- **Validation** : Vérifiez le format JSON

## 🎉 **RÉSULTAT FINAL :**

Avec cette configuration mise à jour, vous pouvez :
- ✅ **Envoyer** des emails MYCONFORT depuis Make avec nouveau service
- 📎 **Joindre** des PDF jusqu'à 2MB
- 🎨 **Utiliser** votre template personnalisé
- 🔄 **Automatiser** tout le processus
- 📊 **Monitorer** les performances

Votre intégration Make + EmailJS + MYCONFORT est maintenant **mise à jour avec le nouveau Service ID** !

---

**🚀 CONFIGURATION MAKE MISE À JOUR !** Testez maintenant avec le nouveau Service ID ! 🔧📧
