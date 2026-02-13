#!/bin/bash

echo "🔍 Vérification de la configuration - Worship Team Manager"
echo "============================================================"
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Fonction de vérification
check_item() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
    fi
}

echo "📦 Vérification Frontend..."
echo "----------------------------"

# Vérifier si package.json existe
if [ -f "package.json" ]; then
    check_item 0 "package.json trouvé"
    
    # Vérifier react-toastify
    if grep -q "react-toastify" package.json; then
        check_item 0 "react-toastify présent dans package.json"
    else
        check_item 1 "react-toastify MANQUANT dans package.json"
        echo -e "${YELLOW}   → Ajoutez: \"react-toastify\": \"^10.0.0\" dans dependencies${NC}"
    fi
    
    # Vérifier autres dépendances importantes
    if grep -q "react-router-dom" package.json; then
        check_item 0 "react-router-dom présent"
    else
        check_item 1 "react-router-dom MANQUANT"
    fi
    
    if grep -q "axios" package.json; then
        check_item 0 "axios présent"
    else
        check_item 1 "axios MANQUANT"
    fi
else
    check_item 1 "package.json NON TROUVÉ"
fi

echo ""
echo "📝 Vérification App.jsx..."
echo "----------------------------"

# Vérifier si App.jsx existe
if [ -f "src/App.jsx" ]; then
    check_item 0 "src/App.jsx trouvé"
    
    # Vérifier import ToastContainer
    if grep -q "ToastContainer" src/App.jsx; then
        check_item 0 "ToastContainer importé dans App.jsx"
    else
        check_item 1 "ToastContainer NON IMPORTÉ dans App.jsx"
        echo -e "${YELLOW}   → Ajoutez: import { ToastContainer } from 'react-toastify';${NC}"
    fi
    
    # Vérifier import CSS
    if grep -q "ReactToastify.css" src/App.jsx; then
        check_item 0 "CSS de react-toastify importé"
    else
        check_item 1 "CSS de react-toastify NON IMPORTÉ"
        echo -e "${YELLOW}   → Ajoutez: import 'react-toastify/dist/ReactToastify.css';${NC}"
    fi
else
    check_item 1 "src/App.jsx NON TROUVÉ"
fi

echo ""
echo "🔧 Vérification node_modules..."
echo "----------------------------"

if [ -d "node_modules" ]; then
    check_item 0 "node_modules existe"
    
    if [ -d "node_modules/react-toastify" ]; then
        check_item 0 "react-toastify installé dans node_modules"
    else
        check_item 1 "react-toastify NON INSTALLÉ"
        echo -e "${YELLOW}   → Exécutez: npm install${NC}"
    fi
else
    check_item 1 "node_modules NON TROUVÉ"
    echo -e "${YELLOW}   → Exécutez: npm install${NC}"
fi

echo ""
echo "🌍 Vérification variables d'environnement..."
echo "----------------------------"

if [ -f ".env" ] || [ -f ".env.production" ]; then
    check_item 0 "Fichier .env trouvé"
    
    if [ -f ".env" ]; then
        if grep -q "VITE_API_URL" .env; then
            check_item 0 "VITE_API_URL configuré"
        else
            check_item 1 "VITE_API_URL NON configuré"
        fi
    fi
else
    echo -e "${YELLOW}⚠️  Aucun fichier .env trouvé${NC}"
    echo -e "${YELLOW}   → Créez .env.production avec VITE_API_URL${NC}"
fi

echo ""
echo "============================================================"
echo "📊 Résumé"
echo "============================================================"

# Compte des problèmes potentiels
if grep -q "react-toastify" package.json && \
   grep -q "ToastContainer" src/App.jsx 2>/dev/null && \
   [ -d "node_modules/react-toastify" ] 2>/dev/null; then
    echo -e "${GREEN}✅ Tous les prérequis sont satisfaits!${NC}"
    echo ""
    echo "🚀 Vous pouvez maintenant:"
    echo "   1. npm run build"
    echo "   2. Déployer sur Render"
else
    echo -e "${RED}❌ Certains prérequis ne sont pas satisfaits${NC}"
    echo ""
    echo "🔧 Actions recommandées:"
    echo "   1. Ajoutez react-toastify au package.json"
    echo "   2. Ajoutez ToastContainer dans App.jsx"
    echo "   3. Exécutez npm install"
    echo "   4. Testez avec npm run build"
fi

echo ""
echo "============================================================"
echo "📖 Pour plus d'aide, consultez GUIDE_DEPLOIEMENT.md"
echo "============================================================"
