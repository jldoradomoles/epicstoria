#!/bin/bash
# Instala el git hook post-merge para sincronizar imágenes adicionales
# y redesplegar la app tras cada git pull en el servidor.
#
# Ejecutar UNA VEZ en el servidor:
#   cd ~/epicstoria && bash backend/install-post-merge-hook.sh

HOOK_PATH="$(git rev-parse --show-toplevel)/.git/hooks/post-merge"

cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash
# Hook post-merge: se ejecuta automáticamente tras cada git pull

export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && . "$NVM_DIR/nvm.sh"  # Cargar nvm si está instalado
export PATH="$PATH:/usr/local/bin:/usr/bin"

REPO_DIR="$(git rev-parse --show-toplevel)"
BACKEND_DIR="$REPO_DIR/backend"

echo "🔄 [post-merge] Instalando dependencias del backend..."
cd "$BACKEND_DIR"
npm install --silent

echo "🖼️  [post-merge] Sincronizando imágenes adicionales..."
npm run db:sync-images

echo "🔨 [post-merge] Compilando frontend..."
cd "$REPO_DIR"
npm install --silent
npm run build:ionos

echo "🔄 [post-merge] Reiniciando servicios..."
pm2 restart all

echo "✅ [post-merge] Despliegue completado."
EOF

chmod +x "$HOOK_PATH"

echo "✅ Hook post-merge instalado en: $HOOK_PATH"
echo "   Se ejecutará automáticamente tras cada 'git pull'."
