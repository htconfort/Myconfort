# 🔧 CONFIGURATION MODULE HTTP MAKE POUR EMAILJS

## 📋 **ÉTAPE 1 – Configuration du Module HTTP dans Make**

### ⚙️ **Paramètres de Base :**
- **Method** : `POST`
- **URL** : `https://api.emailjs.com/api/v1.0/email/send`

### 📝 **Headers à Configurer :**
```json
[
  { 
    "name": "Content-Type", 
    "value": "application/json" 
  },
  { 
    "name": "origin", 
    "value": "http://localhost" 
  }
]
```

### 🎯 **Body (JSON) - Configuration MYCONFORT :**
```json
{
  "service_id": "service_ocsxnme",
  "template_id": "template_yng4k8s",
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_email": "test@myconfort.com",
    "to_name": "Test Client MYCONFORT",
    "from_name": "MYCONFORT",
    "reply_to": "myconfort@gmail.com",
    "subject": "Test EmailJS depuis Make avec template_yng4k8s",
    "message": "Ceci est un test d'intégration EmailJS depuis Make (Integromat) avec le template personnalisé template_yng4k8s et le service Gmail service_ocsxnme.",
    
    "invoice_number": "MAKE-TEST-001",
    "invoice_date": "28/01/2025",
    "total_amount": "150,00 €",
    "deposit_amount": "",
    "remaining_amount": "",
    "has_signature": "Non",
    
    "client_name": "Test Client MYCONFORT",
    "client_email": "test@myconfort.com",
    "client_address": "123 Rue de Test",
    "client_city": "Paris",
    "client_postal_code": "75001",
    "client_phone": "01 23 45 67 89",
    
    "company_name": "MYCONFORT",
    "company_logo": "https://via.placeholder.com/120x60/477A0C/F2EFE2?text=MYCONFORT",
    "company_address": "88 Avenue des Ternes, 75017 Paris",
    "company_phone": "04 68 50 41 45",
    "company_email": "myconfort@gmail.com",
    "company_siret": "824 313 530 00027",
    "company_website": "https://www.htconfort.com",
    
    "advisor_name": "Test Conseiller Make",
    "payment_method": "Test depuis Make",
    
    "has_pdf": "false",
    "has_image": "false",
    "attachment_name": "",
    "attachment_content": "",
    "attachment_type": "",
    "attachment_size": "0 KB",
    
    "generated_date": "28/01/2025",
    "generated_time": "14:30:00",
    "template_used": "template_yng4k8s",
    "service_used": "service_ocsxnme",
    "user_id_used": "hvgYUCG9j2lURrt5k",
    "test_source": "make_integromat",
    
    "products_count": "2",
    "products_summary": "1x MATELAS BAMBOU 140x190, 1x Oreiller Douceur"
  }
}
```

## 🧪 **ÉTAPE 2 – Test Simple (Sans Pièces Jointes)**

### 📧 **Configuration Minimale pour Test :**
```json
{
  "service_id": "service_ocsxnme",
  "template_id": "template_yng4k8s",
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_email": "votre-email@test.com",
    "to_name": "Test MYCONFORT",
    "from_name": "MYCONFORT",
    "subject": "Test Make + EmailJS",
    "message": "Test d'intégration réussi depuis Make !",
    "has_pdf": "false"
  }
}
```

## 📎 **ÉTAPE 3 – Test avec Pièce Jointe (Plan Premium)**

### 🚀 **Configuration avec PDF Joint :**
```json
{
  "service_id": "service_ocsxnme",
  "template_id": "template_yng4k8s",
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_email": "test@myconfort.com",
    "to_name": "Test Pièce Jointe MYCONFORT",
    "from_name": "MYCONFORT",
    "reply_to": "myconfort@gmail.com",
    "subject": "Test EmailJS avec pièce jointe depuis Make",
    "message": "Test d'envoi avec pièce jointe PDF depuis Make (Integromat) vers EmailJS avec template template_yng4k8s.",
    
    "invoice_number": "MAKE-PDF-001",
    "invoice_date": "28/01/2025",
    "total_amount": "250,00 €",
    
    "company_name": "MYCONFORT",
    "company_logo": "https://via.placeholder.com/120x60/477A0C/F2EFE2?text=MYCONFORT",
    "advisor_name": "Test Make avec PDF",
    
    "attachment_name": "test_facture_make.pdf",
    "attachment_content": "JVBERi0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0KQNC0xLjQKJcOkw7zDtsO8CjIgMCBvYmoKPDwKL0xlbmd0aCAzIDAgUgo+PgpzdHJlYW0K",
    "attachment_type": "application/pdf",
    "attachment_size": "1.2MB",
    "has_pdf": "true",
    
    "template_used": "template_yng4k8s",
    "service_used": "service_ocsxnme",
    "test_source": "make_with_attachment"
  }
}
```

## ✅ **ÉTAPE 4 – Réponses Attendues**

### 🎉 **Succès (Status 200) :**
```json
{
  "status": 200,
  "text": "OK"
}
```

### ❌ **Erreurs Possibles :**

#### 🔑 **Erreur 401/403 - Authentification :**
```json
{
  "status": 401,
  "text": "Unauthorized"
}
```
**Solution** : Vérifiez le `user_id` (hvgYUCG9j2lURrt5k)

#### 🎯 **Erreur 400 - Service/Template :**
```json
{
  "status": 400,
  "text": "Bad Request"
}
```
**Solution** : Vérifiez `service_id` et `template_id`

#### 📧 **Erreur 422 - Email :**
```json
{
  "status": 422,
  "text": "The service is not connected"
}
```
**Solution** : Vérifiez la configuration Gmail dans EmailJS

## 🔧 **ÉTAPE 5 – Variables Make Dynamiques**

### 📊 **Utilisation de Variables Make :**
```json
{
  "service_id": "service_ocsxnme",
  "template_id": "template_yng4k8s",
  "user_id": "hvgYUCG9j2lURrt5k",
  "template_params": {
    "to_email": "{{email_client}}",
    "to_name": "{{nom_client}}",
    "from_name": "MYCONFORT",
    "subject": "Facture MYCONFORT n°{{numero_facture}}",
    "message": "{{message_personnalise}}",
    
    "invoice_number": "{{numero_facture}}",
    "invoice_date": "{{date_facture}}",
    "total_amount": "{{montant_total}}",
    
    "company_name": "MYCONFORT",
    "advisor_name": "{{nom_conseiller}}",
    
    "attachment_name": "{{nom_fichier_pdf}}",
    "attachment_content": "{{contenu_pdf_base64}}",
    "attachment_type": "application/pdf",
    "attachment_size": "{{taille_fichier}}",
    "has_pdf": "{{a_pdf}}"
  }
}
```

## 🎯 **ÉTAPE 6 – Scénarios Make Recommandés**

### 📋 **Scénario 1 - Nouvelle Facture :**
1. **Trigger** : Nouvelle ligne dans Google Sheets / Airtable
2. **Module HTTP** : Envoi EmailJS avec données facture
3. **Action** : Mise à jour statut "Email envoyé"

### 📎 **Scénario 2 - Facture avec PDF :**
1. **Trigger** : Webhook depuis MYCONFORT
2. **Conversion** : PDF en base64 (si nécessaire)
3. **Module HTTP** : Envoi EmailJS avec pièce jointe
4. **Notification** : Confirmation d'envoi

### 🔄 **Scénario 3 - Suivi Client :**
1. **Trigger** : Programmé (quotidien/hebdomadaire)
2. **Filtre** : Factures non payées
3. **Module HTTP** : Relance EmailJS
4. **Log** : Enregistrement de la relance

## 🚀 **AVANTAGES DE L'INTÉGRATION MAKE + EMAILJS :**

### ⚡ **Automatisation Complète :**
- **Envoi automatique** des factures
- **Relances programmées** 
- **Notifications** en temps réel
- **Synchronisation** multi-plateformes

### 📊 **Suivi et Analytics :**
- **Logs d'envoi** détaillés
- **Taux de réussite** des emails
- **Gestion des erreurs** automatique
- **Rapports** de performance

### 🔧 **Flexibilité :**
- **Templates dynamiques** selon le contexte
- **Conditions d'envoi** personnalisées
- **Intégration** avec autres outils
- **Scalabilité** illimitée

## 🎉 **RÉSULTAT FINAL :**

Avec cette configuration, vous pouvez :
- **✅ Tester** l'API EmailJS depuis Make
- **📧 Envoyer** des emails automatiquement
- **📎 Joindre** des PDF jusqu'à 2MB
- **🔄 Automatiser** tout le processus de facturation
- **📊 Suivre** les performances d'envoi

Votre intégration Make + EmailJS + MYCONFORT est maintenant opérationnelle !

---

**🚀 CONFIGURATION MAKE PRÊTE !** Testez maintenant votre intégration EmailJS ! 🔧📧
