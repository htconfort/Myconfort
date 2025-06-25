/**
 * 🚀 SCRIPT DE TEST AVANCÉ POUR MYCONFORT
 * 
 * Ce script plus complet inclut :
 * - Gestion des PDF en base64
 * - Sauvegarde dans Google Drive
 * - Envoi d'emails
 * - Tests de performance
 * - Logging détaillé
 */

// 🎯 CONFIGURATION - MODIFIEZ CES VALEURS
const CONFIG = {
  DRIVE_FOLDER_ID: '1sdCwbJHWu6QelYwAnQxPKNEOsd_XBtJw', // Votre dossier Google Drive
  EMAIL_FROM_NAME: 'MYCONFORT',
  DEBUG_MODE: true
};

function doPost(e) {
  const startTime = new Date().getTime();
  
  try {
    log('📨 Nouvelle requête POST reçue');
    
    if (!e.postData || !e.postData.contents) {
      return createResponse('❌ Aucune donnée reçue', 400);
    }
    
    const data = JSON.parse(e.postData.contents);
    log('📋 Données parsées avec succès');
    
    // Test de connexion
    if (data.requestType === 'test' || data.test === true) {
      return handleTestRequest(data, startTime);
    }
    
    // Traitement de facture
    if (data.pdfBase64 && data.filename) {
      return handleInvoiceRequest(data, startTime);
    }
    
    // Partage d'aperçu
    if (data.requestType === 'sharePreview') {
      return handlePreviewRequest(data, startTime);
    }
    
    return createResponse('✅ Script MYCONFORT actif - Données reçues', 200);
    
  } catch (error) {
    logError('❌ Erreur dans doPost', error);
    return createResponse(`❌ Erreur: ${error.toString()}`, 500);
  }
}

function doGet(e) {
  log('🌐 Requête GET reçue');
  
  const html = `
    <html>
      <head><title>MYCONFORT Script Test</title></head>
      <body style="font-family: Arial; padding: 20px;">
        <h1>🌸 MYCONFORT Script de Test</h1>
        <p><strong>Statut:</strong> ✅ Actif et fonctionnel</p>
        <p><strong>Date:</strong> ${new Date().toLocaleString('fr-FR')}</p>
        <p><strong>Script ID:</strong> ${ScriptApp.getScriptId()}</p>
        <hr>
        <h2>Tests disponibles:</h2>
        <ul>
          <li>POST avec requestType: 'test' pour test de connexion</li>
          <li>POST avec pdfBase64 + filename pour test de facture</li>
          <li>POST avec requestType: 'sharePreview' pour test d'aperçu</li>
        </ul>
      </body>
    </html>
  `;
  
  return HtmlService.createHtmlOutput(html);
}

/**
 * 🧪 GESTIONNAIRES DE REQUÊTES
 */

function handleTestRequest(data, startTime) {
  log('🧪 Test de connexion demandé');
  
  const testResults = {
    script: '✅ Script actif',
    drive: testDriveAccess(),
    email: testEmailCapability(),
    performance: `${new Date().getTime() - startTime}ms`
  };
  
  log('📊 Résultats du test:', testResults);
  
  return createResponse(`✅ Test réussi ! Script MYCONFORT actif - ${JSON.stringify(testResults)}`, 200);
}

function handleInvoiceRequest(data, startTime) {
  log('📄 Traitement de facture demandé');
  
  try {
    const clientName = data.clientName || data.name || 'Client';
    const invoiceNumber = data.invoiceNumber || 'XXXX';
    const email = data.email;
    const filename = data.filename;
    
    log(`📋 Facture: ${invoiceNumber}, Client: ${clientName}, Email: ${email}`);
    
    // Sauvegarder le PDF dans Drive
    const driveResult = savePDFToDrive(data.pdfBase64, filename);
    
    // Envoyer par email si demandé
    let emailResult = null;
    if (email && data.message) {
      emailResult = sendEmailWithPDF(email, data.message, data.pdfBase64, filename);
    }
    
    const processingTime = new Date().getTime() - startTime;
    
    const response = {
      status: '✅ Facture traitée avec succès',
      invoice: invoiceNumber,
      client: clientName,
      drive: driveResult,
      email: emailResult,
      processingTime: `${processingTime}ms`
    };
    
    log('📊 Traitement terminé:', response);
    
    return createResponse(`✅ Facture ${invoiceNumber} enregistrée avec succès`, 200);
    
  } catch (error) {
    logError('❌ Erreur traitement facture', error);
    return createResponse(`❌ Erreur traitement: ${error.message}`, 500);
  }
}

function handlePreviewRequest(data, startTime) {
  log('📸 Partage d\'aperçu demandé');
  
  try {
    const clientName = data.name || 'Client';
    const invoiceNumber = data.invoiceNumber || 'XXXX';
    
    // Simuler le partage d'aperçu
    log(`📋 Aperçu: ${invoiceNumber}, Client: ${clientName}`);
    
    const processingTime = new Date().getTime() - startTime;
    
    return createResponse(`✅ Aperçu partagé pour ${clientName} (${processingTime}ms)`, 200);
    
  } catch (error) {
    logError('❌ Erreur partage aperçu', error);
    return createResponse(`❌ Erreur partage: ${error.message}`, 500);
  }
}

/**
 * 🔧 FONCTIONS UTILITAIRES
 */

function savePDFToDrive(base64Data, filename) {
  try {
    if (!CONFIG.DRIVE_FOLDER_ID) {
      return '⚠️ Dossier Drive non configuré';
    }
    
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      'application/pdf',
      filename
    );
    
    const file = folder.createFile(blob);
    log(`💾 Fichier sauvé: ${filename}`);
    
    return `✅ Sauvé: ${file.getUrl()}`;
  } catch (error) {
    logError('❌ Erreur sauvegarde Drive', error);
    return `❌ Erreur Drive: ${error.message}`;
  }
}

function sendEmailWithPDF(email, message, base64Data, filename) {
  try {
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      'application/pdf',
      filename
    );
    
    GmailApp.sendEmail(
      email,
      `Facture MYCONFORT - ${filename}`,
      message,
      {
        attachments: [blob],
        name: CONFIG.EMAIL_FROM_NAME
      }
    );
    
    log(`📧 Email envoyé à: ${email}`);
    return `✅ Email envoyé à ${email}`;
  } catch (error) {
    logError('❌ Erreur envoi email', error);
    return `❌ Erreur email: ${error.message}`;
  }
}

function testDriveAccess() {
  try {
    if (!CONFIG.DRIVE_FOLDER_ID) {
      return '⚠️ Dossier non configuré';
    }
    
    const folder = DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID);
    return `✅ Accès OK: ${folder.getName()}`;
  } catch (error) {
    return `❌ Pas d'accès Drive: ${error.message}`;
  }
}

function testEmailCapability() {
  try {
    const quota = MailApp.getRemainingDailyQuota();
    return `✅ Email OK (quota: ${quota})`;
  } catch (error) {
    return `❌ Pas d'accès email: ${error.message}`;
  }
}

function createResponse(message, statusCode = 200) {
  return ContentService
    .createTextOutput(message)
    .setMimeType(ContentService.MimeType.TEXT);
}

function log(message, data = null) {
  if (CONFIG.DEBUG_MODE) {
    console.log(`[${new Date().toISOString()}] ${message}`, data || '');
  }
}

function logError(message, error) {
  console.error(`[${new Date().toISOString()}] ${message}:`, error);
}

/**
 * 🎯 FONCTIONS DE TEST MANUEL
 */

function testCompletManuel() {
  log('🧪 Test complet manuel démarré');
  
  const tests = {
    environnement: verifierEnvironnement(),
    drive: testDriveAccess(),
    email: testEmailCapability(),
    connectivite: testConnectiviteAvance()
  };
  
  log('📊 Résultats des tests:', tests);
  return tests;
}

function verifierEnvironnement() {
  return {
    scriptId: ScriptApp.getScriptId(),
    utilisateur: Session.getActiveUser().getEmail(),
    timezone: Session.getScriptTimeZone(),
    version: ScriptApp.getService().getUrl()
  };
}

function testConnectiviteAvance() {
  try {
    const response = UrlFetchApp.fetch('https://httpbin.org/json');
    return response.getResponseCode() === 200 ? '✅ Connectivité OK' : '⚠️ Connectivité limitée';
  } catch (error) {
    return `❌ Pas de connectivité: ${error.message}`;
  }
}

// Test avec données simulées
function simulerRequeteMYCOMFORT() {
  const testData = {
    requestType: 'test',
    clientName: 'Client Test',
    invoiceNumber: 'TEST-001',
    email: 'test@example.com',
    message: 'Test depuis le script',
    pdfBase64: 'JVBERi0xLjQKJdPr6eEKMSAwIG9iago8PAovVHlwZSAvQ2F0YWxvZwovUGFnZXMgMiAwIFIKPj4KZW5kb2JqCjIgMCBvYmoKPDwKL1R5cGUgL1BhZ2VzCi9LaWRzIFszIDAgUl0KL0NvdW50IDEKPD4KZW5kb2JqCjMgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAyIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQovUmVzb3VyY2VzIDw8Ci9Gb250IDw8Ci9GMSA0IDAgUgo+Pgo+PgovQ29udGVudHMgNSAwIFIKPj4KZW5kb2JqCjQgMCBvYmoKPDwKL1R5cGUgL0ZvbnQKL1N1YnR5cGUgL1R5cGUxCi9CYXNlRm9udCAvSGVsdmV0aWNhCj4+CmVuZG9iago1IDAgb2JqCjw8Ci9MZW5ndGggNDQKPj4Kc3RyZWFtCkJUCi9GMSA4IFRmCjEwIDcwMCBUZAooVGVzdCBQREYpIFRqCkVUCmVuZHN0cmVhbQplbmRvYmoKeHJlZgowIDYKMDAwMDAwMDAwMCA2NTUzNSBmIAowMDAwMDAwMDA5IDAwMDAwIG4gCjAwMDAwMDAwNTggMDAwMDAgbiAKMDAwMDAwMDExNSAwMDAwMCBuIAowMDAwMDAwMjQ1IDAwMDAwIG4gCjAwMDAwMDAzMjIgMDAwMDAgbiAKdHJhaWxlcgo8PAovU2l6ZSA2Ci9Sb290IDEgMCBSCj4+CnN0YXJ0eHJlZgo0MTQKJSVFT0Y=',
    filename: 'test-facture.pdf'
  };
  
  const mockEvent = {
    postData: {
      contents: JSON.stringify(testData)
    }
  };
  
  return doPost(mockEvent);
}