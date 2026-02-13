#!/bin/bash

echo "========================================="
echo "🔍 VÉRIFICATION FINALE - Frontend Fixed"
echo "========================================="
echo ""

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

check() {
    if [ $1 -eq 0 ]; then
        echo -e "${GREEN}✅ $2${NC}"
    else
        echo -e "${RED}❌ $2${NC}"
        exit 1
    fi
}

echo "📦 1. Vérification package.json"
echo "-----------------------------------"
if ! grep -q "react-toastify" package.json; then
    check 0 "react-toastify supprimé de package.json"
else
    check 1 "react-toastify ENCORE PRÉSENT dans package.json"
fi

echo ""
echo "📝 2. Vérification des imports"
echo "-----------------------------------"
TOASTIFY_IMPORTS=$(grep -r "react-toastify" src/ --include="*.jsx" --include="*.js" 2>/dev/null | wc -l)
if [ $TOASTIFY_IMPORTS -eq 0 ]; then
    check 0 "Aucun import de react-toastify trouvé"
else
    check 1 "$TOASTIFY_IMPORTS imports de react-toastify trouvés"
fi

echo ""
echo "🔌 3. Vérification appels API"
echo "-----------------------------------"
if grep -q "const API_URL = \`\${API_BASE}/api\`" src/services/api.js; then
    check 0 "Configuration API correcte dans api.js"
else
    check 1 "Configuration API incorrecte"
fi

echo ""
echo "📁 4. Vérification structure"
echo "-----------------------------------"
if [ -f "src/pages/admin/UserPermissionsManager.jsx" ]; then
    check 0 "UserPermissionsManager.jsx présent dans admin/"
else
    check 1 "UserPermissionsManager.jsx manquant"
fi

if [ ! -f "src/pages/UserPermissionsManager.jsx" ]; then
    check 0 "Fichier dupliqué UserPermissionsManager.jsx supprimé"
else
    check 1 "Fichier dupliqué UserPermissionsManager.jsx encore présent"
fi

echo ""
echo "🔨 5. Test du build"
echo "-----------------------------------"
echo "Installation des dépendances..."
npm install --silent 2>&1 > /dev/null

if [ $? -eq 0 ]; then
    check 0 "npm install réussi"
else
    check 1 "npm install échoué"
fi

echo "Build du projet..."
npm run build 2>&1 > /tmp/build.log

if [ $? -eq 0 ]; then
    check 0 "npm run build réussi"
    echo ""
    echo -e "${GREEN}🎉 TOUS LES TESTS PASSENT!${NC}"
    echo ""
    echo "✅ Le projet est prêt pour le déploiement sur Render"
    echo ""
    echo "Prochaines étapes:"
    echo "1. Poussez ce code sur GitHub"
    echo "2. Render va builder automatiquement"
    echo "3. Configurez VITE_API_URL dans Render"
else
    check 1 "npm run build échoué"
    echo ""
    echo "Logs de build:"
    cat /tmp/build.log
fi

echo ""
echo "========================================="
echo "Vérification terminée"
echo "========================================="
