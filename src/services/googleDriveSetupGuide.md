# 🚀 Guide de Configuration Google Drive API

## 📋 Étapes pour configurer Google Drive API

### 1. 🌐 Créer un projet Google Cloud Console

1. Allez sur [Google Cloud Console](https://console.cloud.google.com/)
2. Créez un nouveau projet ou sélectionnez un projet existant
3. Notez l'ID de votre projet

### 2. 🔧 Activer l'API Google Drive

1. Dans la console, allez dans "APIs & Services" > "Library"
2. Recherchez "Google Drive API"
3. Cliquez sur "Enable" pour activer l'API

### 3. 🔑 Créer des identifiants

#### A. API Key (pour l'accès public)
1. Allez dans "APIs & Services" > "Credentials"
2. Cliquez sur "Create Credentials" > "API Key"
3. Copiez votre API Key
4. (Optionnel) Restreignez la clé aux APIs Google Drive

#### B. OAuth 2.0 Client ID (pour l'authentification)
1. Dans "Credentials", cliquez sur "Create Credentials" > "OAuth client ID"
2. Si c'est votre première fois, configurez l'écran de consentement OAuth
3. Choisissez "Web application" comme type d'application
4. Ajoutez vos domaines autorisés :
   - Pour le développement : `http://localhost:5173`
   - Pour la production : votre domaine de production
5. Copiez votre Client ID

### 4. 📝 Configurer le code

Modifiez le fichier `src/services/googleDriveService.ts` :

```typescript
const GOOGLE_DRIVE_CONFIG = {
  API_KEY: 'VOTRE_API_KEY_ICI', // Remplacez par votre API Key
  CLIENT_ID: 'VOTRE_CLIENT_ID_ICI', // Remplacez par votre Client ID
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  SCOPES: 'https://www.googleapis.com/auth/drive.file',
  FOLDER_ID: '1sdCwbJHWu6QelYwAnQxPKNEOsd_XBtJw' // Votre dossier Google Drive
};
```

### 5. 🔒 Sécurité et bonnes pratiques

- **Ne jamais exposer vos clés** dans le code source public
- Utilisez des variables d'environnement pour la production
- Restreignez vos API Keys aux domaines nécessaires
- Configurez correctement l'écran de consentement OAuth

### 6. 🧪 Tester la configuration

1. Cliquez sur le bouton "Drive" dans l'en-tête
2. Cliquez sur "Se connecter à Google Drive"
3. Autorisez l'application à accéder à votre Drive
4. Testez l'upload d'une facture

## 🔧 Variables d'environnement (Production)

Pour la production, créez un fichier `.env` :

```env
VITE_GOOGLE_DRIVE_API_KEY=votre_api_key
VITE_GOOGLE_DRIVE_CLIENT_ID=votre_client_id
```

Et modifiez le service pour utiliser ces variables :

```typescript
const GOOGLE_DRIVE_CONFIG = {
  API_KEY: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY || '',
  CLIENT_ID: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID || '',
  // ...
};
```

## 🎯 Fonctionnalités disponibles

Une fois configuré, vous pourrez :
- ✅ Sauvegarder automatiquement les factures en PDF
- ✅ Organiser les fichiers dans un dossier spécifique
- ✅ Authentification sécurisée avec OAuth 2.0
- ✅ Accès aux fichiers depuis n'importe où
- ✅ Synchronisation automatique avec Google Drive

## 🆘 Dépannage

### Erreur "API Key not valid"
- Vérifiez que l'API Google Drive est activée
- Vérifiez que votre API Key est correcte
- Vérifiez les restrictions de domaine

### Erreur "OAuth client not found"
- Vérifiez que votre Client ID est correct
- Vérifiez que votre domaine est autorisé dans la configuration OAuth

### Erreur "Insufficient permissions"
- Vérifiez que le scope `https://www.googleapis.com/auth/drive.file` est configuré
- Reconnectez-vous à Google Drive

## 📞 Support

Si vous rencontrez des problèmes, vérifiez :
1. La console du navigateur pour les erreurs JavaScript
2. La console Google Cloud pour les erreurs d'API
3. Les logs de l'application MYCONFORT