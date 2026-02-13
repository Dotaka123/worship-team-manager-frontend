# ⚡ Commandes Rapides - Worship Team Manager

## 🎯 Solution Express (3 minutes)

```bash
# 1. Naviguez vers votre dossier frontend
cd frontend-fixed

# 2. Installez toutes les dépendances (inclut react-toastify)
npm install

# 3. Testez localement
npm run dev

# 4. Si tout fonctionne, buildez pour production
npm run build

# 5. Testez la build
npm run preview
```

**✅ Si le build réussit, vous êtes prêt pour Render!**

---

## 🔧 Commandes de Vérification

```bash
# Vérifier que react-toastify est installé
npm list react-toastify

# Vérifier la structure du projet
ls -la src/

# Vérifier que le build fonctionne
npm run build

# Voir la taille du build
du -sh dist/
```

---

## 📦 Commandes npm Utiles

```bash
# Installer toutes les dépendances
npm install

# Installer une dépendance spécifique
npm install react-toastify

# Nettoyer et réinstaller
rm -rf node_modules package-lock.json
npm install

# Mettre à jour les dépendances
npm update

# Vérifier les dépendances obsolètes
npm outdated
```

---

## 🚀 Commandes de Déploiement

### Local

```bash
# Développement
npm run dev              # Lance le serveur de dev (port 5173)
npm run build            # Build pour production
npm run preview          # Preview de la build (port 4173)
```

### Git (pour Render)

```bash
# Ajouter les changements
git add .

# Commiter
git commit -m "fix: add react-toastify and configure ToastContainer"

# Pousser vers GitHub
git push origin main
```

**Note**: Render déploiera automatiquement si Auto-Deploy est activé

---

## 🔍 Commandes de Debugging

```bash
# Voir les erreurs de build en détail
npm run build --verbose

# Vérifier la configuration Vite
cat vite.config.js

# Vérifier les variables d'environnement
cat .env.production

# Vérifier les dépendances installées
ls -la node_modules/ | grep react-toastify

# Voir les ports utilisés
lsof -i :5173
lsof -i :4173
```

---

## 🧪 Commandes de Test

```bash
# Tester le build localement
npm run build && npm run preview

# Vérifier qu'il n'y a pas d'erreurs dans le code
npm run build 2>&1 | grep -i error

# Tester une requête API locale
curl http://localhost:5173
curl http://localhost:5000/health
```

---

## 🌐 Backend - Commandes Rapides

```bash
# Naviguez vers le dossier backend
cd worship-team-manager-main

# Installez les dépendances
npm install

# Lancez le serveur
npm start

# Ou en mode développement avec auto-reload
npm run dev

# Testez l'API
curl http://localhost:5000
curl http://localhost:5000/health
```

---

## 🔐 Générer un JWT Secret

```bash
# Génère un secret aléatoire sécurisé
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Copiez le résultat dans votre `.env` comme `JWT_SECRET`

---

## 📊 Vérification Complète

```bash
# Script complet de vérification
cd frontend-fixed

echo "🔍 Vérification du setup..."

# 1. Vérifier react-toastify
if grep -q "react-toastify" package.json; then
    echo "✅ react-toastify dans package.json"
else
    echo "❌ react-toastify MANQUANT"
fi

# 2. Vérifier ToastContainer
if grep -q "ToastContainer" src/App.jsx; then
    echo "✅ ToastContainer dans App.jsx"
else
    echo "❌ ToastContainer MANQUANT"
fi

# 3. Vérifier installation
if [ -d "node_modules/react-toastify" ]; then
    echo "✅ react-toastify installé"
else
    echo "❌ Exécutez: npm install"
fi

# 4. Tester le build
echo "🔨 Test du build..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build réussit!"
else
    echo "❌ Build échoué - vérifiez les erreurs ci-dessus"
fi
```

---

## 🎨 Personnalisation de react-toastify

Dans votre code, utilisez:

```jsx
import { toast } from 'react-toastify';

// Notification de succès
toast.success('Membre ajouté avec succès!');

// Notification d'erreur
toast.error('Erreur lors de la connexion');

// Notification d'info
toast.info('Nouvelle mise à jour disponible');

// Notification d'avertissement
toast.warning('Action requise');

// Notification personnalisée
toast('Message personnalisé', {
  position: "top-center",
  autoClose: 5000,
  hideProgressBar: false,
  closeOnClick: true,
  pauseOnHover: true,
  draggable: true,
  theme: "colored"
});
```

---

## 🆘 En Cas de Problème

```bash
# Problème 1: Build échoue
rm -rf node_modules package-lock.json dist
npm install
npm run build

# Problème 2: Port déjà utilisé
# Tuez le processus sur le port 5173
lsof -ti:5173 | xargs kill -9

# Problème 3: Variables d'env non chargées
# Vérifiez le nom du fichier (.env.production pour build)
cat .env.production

# Problème 4: Render build échoue
# Vérifiez les logs sur Render
# Assurez-vous que VITE_API_URL est configuré dans Render
```

---

## ✅ Checklist Finale

Avant de déployer sur Render:

```bash
# 1. Vérifications locales
[ ] npm install réussit
[ ] npm run dev fonctionne
[ ] npm run build réussit
[ ] npm run preview affiche le site

# 2. Code
[ ] react-toastify dans package.json
[ ] ToastContainer dans App.jsx
[ ] .env.production configuré
[ ] Git commit et push

# 3. Render
[ ] Variables d'environnement configurées
[ ] Build Command: npm install && npm run build
[ ] Publish Directory: dist
[ ] Auto-Deploy activé
```

---

## 🔗 URLs Importantes

**Développement Local:**
- Frontend: http://localhost:5173
- Backend: http://localhost:5000
- API Health: http://localhost:5000/health

**Production (exemples):**
- Frontend: https://votre-frontend.onrender.com
- Backend: https://votre-backend.onrender.com
- API Health: https://votre-backend.onrender.com/health

---

**💡 Astuce**: Gardez ce fichier à portée de main pendant le déploiement!
