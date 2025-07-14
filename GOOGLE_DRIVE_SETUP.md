# 🔧 Guide de configuration Google Drive OAuth2

## ✅ Checklist de configuration

### 1. Google Cloud Console
- [ ] Projet sélectionné/créé
- [ ] Google Drive API activée
- [ ] Client OAuth 2.0 créé
- [ ] URLs ajoutées dans "Origines JavaScript autorisées"
- [ ] URLs ajoutées dans "URIs de redirection autorisées"

### 2. Variables d'environnement
- [ ] Fichier .env créé à la racine
- [ ] VITE_GOOGLE_DRIVE_API_KEY configurée
- [ ] VITE_GOOGLE_DRIVE_CLIENT_ID configurée
- [ ] VITE_GOOGLE_DRIVE_FOLDER_ID configurée

### 3. Test de fonctionnement
- [ ] Serveur redémarré après modification .env
- [ ] Pop-ups autorisées dans le navigateur
- [ ] Bouton "Connexion Google Drive" fonctionne
- [ ] Pas d'erreur redirect_uri_mismatch
- [ ] Upload de fichier réussi

## 🐛 Erreurs courantes et solutions

### `redirect_uri_mismatch`
**Cause** : URL non autorisée dans Google Cloud Console
**Solution** : Vérifier que l'URL exacte est dans "URIs de redirection autorisées"

### `popup_blocked_by_browser`
**Cause** : Pop-up bloquée par le navigateur
**Solution** : Autoriser les pop-ups pour votre domaine

### `access_denied`
**Cause** : Utilisateur a refusé les permissions
**Solution** : Réessayer et accepter les permissions Google Drive

### Variables d'environnement non chargées
**Cause** : Serveur non redémarré ou mauvais nom de fichier
**Solution** : Redémarrer avec `npm run dev` et vérifier le nom `.env`

## 🔧 URLs à configurer dans Google Cloud Console

### Environnement local
```
http://localhost:5173
https://localhost:5173
```

### Production Netlify
```
https://velvety-medovik-f70904.netlify.app
https://deploy-preview-*--velvety-medovik-f70904.netlify.app
```

### Domaine personnalisé (si applicable)
```
https://your-custom-domain.com
```

## 🧪 Test de la configuration

1. Ouvrir la console du navigateur
2. Cliquer sur "Connexion Google Drive"
3. Vérifier les logs :
   - `🔧 Configuration actuelle: { API_KEY: "✅ Configurée", ... }`
   - `🔐 Démarrage authentification Google Drive...`
   - `🔓 Ouverture popup d'authentification...`
   - `✅ Authentification réussie`

## 📞 Support

Si problème persistant :
1. Vérifier les logs de la console
2. Tester en navigation privée
3. Vider le cache du navigateur
4. Vérifier que les APIs sont activées dans Google Cloud Console