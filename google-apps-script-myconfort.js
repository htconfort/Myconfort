function doPost(e) {
  try {
    console.log('📨 Requête reçue:', e.postData.contents);
    
    const data = JSON.parse(e.postData.contents);
    
    // Test de connexion
    if (data.requestType === 'test') {
      return ContentService
        .createTextOutput('✅ Test réussi ! Script MYCONFORT actif')
        .setMimeType(ContentService.MimeType.TEXT);
    }
    
    // Récupération des données (compatible avec tous les formats MYCONFORT)
    const base64Data = data.pdfBase64 || data.pdfData;
    const clientName = data.clientName || data.name || data.client || "client";
    const invoiceNumber = data.invoiceNumber || "facture";
    const date = data.invoiceDate || data.date || new Date().toISOString().split("T")[0];
    const fileName = data.filename || `facture_${clientName}_${invoiceNumber}_${date}.pdf`;
    
    if (!base64Data) {
      throw new Error('Données PDF manquantes');
    }
    
    // Création du blob PDF
    const contentType = "application/pdf";
    const blob = Utilities.newBlob(
      Utilities.base64Decode(base64Data),
      contentType,
      fileName
    );
    
    // 🎯 VOTRE DOSSIER GOOGLE DRIVE CONFIGURÉ
    const folderId = "1sdCwbJHWu6QelYwAnQxPKNEOsd_XBtJw";
    const folder = DriveApp.getFolderById(folderId);
    const file = folder.createFile(blob);
    
    // Log pour debug
    console.log('✅ Fichier créé:', fileName, 'Taille:', blob.getBytes().length);
    
    // Optionnel : Envoi par email si les données sont présentes
    if (data.email && data.message) {
      try {
        GmailApp.sendEmail(
          data.email,
          `Facture ${invoiceNumber} - MYCONFORT`,
          data.message,
          {
            attachments: [blob],
            name: 'MYCONFORT'
          }
        );
        
        return ContentService.createTextOutput(
          `✅ Facture enregistrée ET envoyée par email à ${data.email} : ${file.getUrl()}`
        );
      } catch (emailError) {
        console.error('❌ Erreur email:', emailError);
        return ContentService.createTextOutput(
          `✅ Facture enregistrée (email échoué) : ${file.getUrl()}`
        );
      }
    }
    
    return ContentService.createTextOutput(
      `✅ Facture enregistrée dans Drive : ${file.getUrl()}`
    );
    
  } catch (err) {
    console.error('❌ Erreur script:', err);
    return ContentService.createTextOutput(`❌ Erreur : ${err.message}`);
  }
}

function doGet(e) {
  return ContentService.createTextOutput("🌸 MYCONFORT Script actif ! Utilisez POST pour envoyer un PDF.");
}

// Fonction utilitaire pour tester le script
function testScript() {
  console.log('🧪 Test du script MYCONFORT');
  return 'Script fonctionnel !';
}

// Fonction pour vérifier les permissions Drive
function checkDrivePermissions() {
  try {
    const folderId = "1sdCwbJHWu6QelYwAnQxPKNEOsd_XBtJw";
    const folder = DriveApp.getFolderById(folderId);
    console.log('✅ Accès au dossier:', folder.getName());
    return `Accès OK au dossier: ${folder.getName()}`;
  } catch (error) {
    console.error('❌ Erreur accès Drive:', error);
    return `Erreur accès Drive: ${error.message}`;
  }
}