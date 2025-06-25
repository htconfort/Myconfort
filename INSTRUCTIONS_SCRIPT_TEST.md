# 🧪 INSTRUCTIONS POUR LE SCRIPT DE TEST MYCONFORT

## 📋 ÉTAPES DE CONFIGURATION

### 1. Créer un nouveau projet Google Apps Script
1. Allez sur https://script.google.com/home
2. Cliquez sur "Nouveau projet"
3. Donnez-lui un nom : "MYCONFORT Test Script"

### 2. Choisir le script approprié

#### Option A : Script Simple (Recommandé pour débuter)
- Copiez le contenu de `google-apps-script-test-simple.js`
- Parfait pour tester la connexion de base
- Minimal et facile à déboguer

#### Option B : Script Avancé (Pour tests complets)
- Copiez le contenu de `google-apps-script-test-avance.js`
- Inclut la gestion Drive, email, et diagnostics
- Modifiez la variable `DRIVE_FOLDER_ID` avec votre ID de dossier

### 3. Déployer le script
1. Cliquez sur "Deploy" > "New deployment"
2. Sélectionnez "Web app" comme type
3. **Configuration CRITIQUE :**
   - **Execute as:** Me (votre email)
   - **Who has access:** Anyone
4. Cliquez "Deploy"
5. **Copiez l'URL /exec** qui se termine par `/exec`

### 4. Tester le script

#### Test dans le navigateur
1. Collez l'URL `/exec` dans votre navigateur
2. Vous devriez voir : "🌸 MYCONFORT Script de test actif !"

#### Test depuis MYCONFORT
1. Remplacez l'ancien script ID par le nouveau dans l'application
2. Utilisez le bouton "Tester Script" dans l'aperçu PDF
3. Vous devriez voir un message de succès

## 🔧 FONCTIONS DE TEST DISPONIBLES

### Script Simple
- `testManuel()` - Test depuis l'éditeur
- `verifierEnvironnement()` - Infos sur le script
- `testConnectivite()` - Test de connectivité
- `diagnosticComplet()` - Diagnostic complet

### Script Avancé
- `testCompletManuel()` - Test complet avec Drive et email
- `simulerRequeteMYCOMFORT()` - Simule une requête de l'app
- Configuration avancée avec logging détaillé

## 🎯 TESTS À EFFECTUER

### 1. Test de connexion de base
```javascript
// Données à envoyer via POST
{
  "requestType": "test",
  "message": "Test depuis MYCONFORT"
}
```
**Réponse attendue :** "✅ Test réussi ! Script MYCONFORT actif"

### 2. Test de facture simulée
```javascript
{
  "pdfBase64": "base64_data_here",
  "filename": "test-facture.pdf",
  "clientName": "Client Test",
  "invoiceNumber": "TEST-001",
  "email": "test@example.com"
}
```
**Réponse attendue :** "✅ Facture TEST-001 traitée avec succès"

### 3. Test d'aperçu
```javascript
{
  "requestType": "sharePreview",
  "name": "Client Test",
  "invoiceNumber": "TEST-001"
}
```
**Réponse attendue :** "✅ Aperçu partagé pour Client Test"

## 🚨 RÉSOLUTION DE PROBLÈMES

### Erreur "Script not found"
- Vérifiez que le script est déployé comme "Web app"
- Assurez-vous d'utiliser l'URL `/exec` et non `/dev`

### Erreur "Permission denied"
- Configurez "Who has access" sur "Anyone"
- Vérifiez que "Execute as" est sur "Me"

### Erreur "Invalid JSON"
- Vérifiez le format des données envoyées
- Assurez-vous que Content-Type est "application/json"

### Test de permissions Drive (Script Avancé)
```javascript
function testDriveAccess() {
  const folderId = "VOTRE_FOLDER_ID";
  const folder = DriveApp.getFolderById(folderId);
  console.log("Accès OK:", folder.getName());
}
```

## 📊 LOGS ET DEBUGGING

### Consulter les logs
1. Dans l'éditeur Google Apps Script
2. Allez dans "Executions" dans le menu de gauche
3. Cliquez sur une exécution pour voir les logs détaillés

### Activer le mode debug (Script Avancé)
```javascript
const CONFIG = {
  DEBUG_MODE: true  // Active les logs détaillés
};
```

## ✅ CHECKLIST DE VALIDATION

- [ ] Script créé et nommé
- [ ] Code copié et collé
- [ ] Configuration modifiée si nécessaire (DRIVE_FOLDER_ID)
- [ ] Script déployé comme "Web app"
- [ ] Permissions configurées ("Execute as: Me", "Who has access: Anyone")
- [ ] URL `/exec` copiée
- [ ] Test dans navigateur réussi
- [ ] Test depuis MYCONFORT réussi
- [ ] Logs vérifiés dans l'éditeur

## 🔄 MISE À JOUR DANS MYCONFORT

Une fois votre script de test fonctionnel :
1. Copiez le nouvel ID de script (partie entre `/s/` et `/exec`)
2. Remplacez l'ancien ID dans tous les services MYCONFORT
3. Testez toutes les fonctionnalités (PDF, email, aperçu)

## 📞 SUPPORT

Si vous rencontrez des problèmes :
1. Vérifiez les logs d'exécution dans Google Apps Script
2. Testez d'abord le script simple avant le script avancé
3. Assurez-vous que toutes les permissions sont accordées
4. Vérifiez que l'URL utilisée se termine bien par `/exec`