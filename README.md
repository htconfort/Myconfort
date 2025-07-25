# Myconfort - Application de Facturation

Une application moderne de génération et gestion de factures développée avec React, TypeScript et Vite.

## 🚀 Fonctionnalités

- **Génération de factures PDF** : Créez des factures professionnelles avec aperçu en temps réel
- **Gestion des clients** : Enregistrez et gérez vos informations clients
- **Signature électronique** : Intégration de signature numérique sur les factures
- **Sauvegarde automatique** : Sauvegarde locale et intégration Google Drive
- **Envoi par email** : Envoi automatique des factures par EmailJS
- **Interface moderne** : Interface utilisateur responsive avec Tailwind CSS

## 🛠️ Technologies utilisées

- **Frontend** : React 18, TypeScript, Vite
- **Styling** : Tailwind CSS
- **PDF Generation** : html2pdf.js, jsPDF
- **Icônes** : Lucide React
- **Signature** : Signature Pad
- **Intégrations** : Google Drive API, EmailJS

## 📦 Installation

1. Clonez le repository :
```bash
git clone https://github.com/htconfort/Myconfort.git
cd Myconfort
```

2. Installez les dépendances :
```bash
npm install
```

3. Lancez l'application en mode développement :
```bash
npm run dev
```

4. Ouvrez [http://localhost:5173](http://localhost:5173) dans votre navigateur

## 🔧 Scripts disponibles

- `npm run dev` : Lance le serveur de développement
- `npm run build` : Construit l'application pour la production
- `npm run lint` : Exécute ESLint pour vérifier le code
- `npm run preview` : Prévisualise la version de production

## 📁 Structure du projet

```
src/
├── components/         # Composants React réutilisables
├── services/          # Services (PDF, email, Google Drive)
├── types/             # Définitions TypeScript
├── utils/             # Fonctions utilitaires
└── hooks/             # Hooks React personnalisés
```

## ⚙️ Configuration

Pour utiliser toutes les fonctionnalités, configurez :

1. **Google Drive API** : Ajoutez vos clés API dans `src/services/googleDriveService.ts`
2. **EmailJS** : Configurez votre service EmailJS pour l'envoi automatique

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à ouvrir une issue ou soumettre une pull request.

## 📄 Licence

Ce projet est sous licence privée - voir le fichier LICENSE pour plus de détails.
