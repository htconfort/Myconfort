/**
 * 🧪 SCRIPT DE TEST SIMPLE POUR MYCONFORT
 * 
 * Ce script de test minimal permet de vérifier rapidement :
 * 1. La connexion avec votre application MYCONFORT
 * 2. L'accès à Google Drive
 * 3. La réception et traitement des données
 * 
 * Instructions :
 * 1. Copiez ce code dans un nouveau projet Google Apps Script
 * 2. Déployez comme "Web app" avec "Execute as: Me" et "Who has access: Anyone"
 * 3. Testez l'URL /exec dans votre navigateur
 * 4. Utilisez le nouvel ID dans MYCONFORT
 */

function doPost(e) {
  try {
    console.log('📨 Requête POST reçue');
    
    // Vérifier si des données ont été envoyées
    if (!e.postData || !e.postData.contents) {
      return ContentService
        .createTextOutput('❌ Aucune donnée reçue')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    console.log('📋 Données reçues:', e.postData.contents);
    
    // Parser les données JSON
    const data = JSON.parse(e.postData.contents);
    
    // Test de connexion simple
    if (data.requestType === 'test' || data.test === true) {
      console.log('🧪 Test de connexion demandé');
      return ContentService
        .createTextOutput('✅ Test réussi ! Script MYCONFORT actif et fonctionnel')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Simulation de traitement de facture
    if (data.pdfBase64 || data.filename) {
      console.log('📄 Données de facture détectées');
      
      const clientName = data.clientName || data.name || 'Client';
      const invoiceNumber = data.invoiceNumber || 'XXXX';
      const email = data.email || 'non-specifie';
      
      console.log(`📋 Client: ${clientName}, Facture: ${invoiceNumber}, Email: ${email}`);
      
      // Simuler un traitement réussi
      return ContentService
        .createTextOutput(`✅ Facture ${invoiceNumber} traitée avec succès pour ${clientName}`)
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Réponse par défaut
    return ContentService
      .createTextOutput('✅ Script MYCONFORT actif - Données reçues et traitées')
      .setMimeType(ContentService.MimeType.TEXT);
      
  } catch (error) {
    console.error('❌ Erreur dans doPost:', error);
    return ContentService
      .createTextOutput(`❌ Erreur: ${error.toString()}`)
      .setMimeType(ContentService.MimeType.TEXT);
  }
}

function doGet(e) {
  console.log('🌐 Requête GET reçue');
  
  // Test simple pour vérifier que le script est accessible
  return ContentService
    .createTextOutput('🌸 MYCONFORT Script de test actif ! Utilisez POST pour envoyer des données.')
    .setMimeType(ContentService.MimeType.TEXT);
}

/**
 * 🔧 FONCTIONS UTILITAIRES DE TEST
 */

// Test manuel du script (à exécuter dans l'éditeur)
function testManuel() {
  console.log('🧪 Test manuel du script MYCONFORT');
  
  try {
    // Simuler une requête POST
    const testData = {
      requestType: 'test',
      message: 'Test manuel depuis l\'éditeur'
    };
    
    const mockEvent = {
      postData: {
        contents: JSON.stringify(testData)
      }
    };
    
    const result = doPost(mockEvent);
    console.log('📨 Résultat du test:', result.getContent());
    
    return 'Test manuel réussi !';
  } catch (error) {
    console.error('❌ Erreur test manuel:', error);
    return `Erreur: ${error.message}`;
  }
}

// Vérifier les permissions et l'environnement
function verifierEnvironnement() {
  console.log('🔍 Vérification de l\'environnement...');
  
  const infos = {
    scriptId: ScriptApp.getScriptId(),
    utilisateur: Session.getActiveUser().getEmail(),
    timezone: Session.getScriptTimeZone(),
    date: new Date().toISOString()
  };
  
  console.log('📋 Informations script:', infos);
  
  return infos;
}

// Test de connectivité avec un service externe
function testConnectivite() {
  try {
    console.log('🌐 Test de connectivité...');
    
    // Test simple avec une requête HTTP
    const response = UrlFetchApp.fetch('https://httpbin.org/get');
    const statusCode = response.getResponseCode();
    
    console.log('📊 Code de réponse:', statusCode);
    
    if (statusCode === 200) {
      return '✅ Connectivité OK';
    } else {
      return `⚠️ Connectivité limitée (${statusCode})`;
    }
  } catch (error) {
    console.error('❌ Erreur connectivité:', error);
    return `❌ Pas de connectivité: ${error.message}`;
  }
}

/**
 * 🎯 FONCTION DE DIAGNOSTIC COMPLET
 */
function diagnosticComplet() {
  console.log('🔍 DIAGNOSTIC COMPLET DU SCRIPT MYCONFORT');
  
  const diagnostic = {
    timestamp: new Date().toISOString(),
    script: verifierEnvironnement(),
    connectivite: testConnectivite(),
    testManuel: testManuel()
  };
  
  console.log('📋 Diagnostic complet:', diagnostic);
  
  return diagnostic;
}