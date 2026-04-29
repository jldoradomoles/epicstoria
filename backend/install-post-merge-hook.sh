#!/bin/bash
# Instala el git hook post-merge para sincronizar imágenes adicionales
# tras cada git pull en el servidor.
#
# Ejecutar UNA VEZ en el servidor:
#   cd ~/epicstoria && bash backend/install-post-merge-hook.sh

HOOK_PATH="$(git rev-parse --show-toplevel)/.git/hooks/post-merge"

cat > "$HOOK_PATH" << 'EOF'
#!/bin/bash
# Hook post-merge: se ejecuta automáticamente tras cada git pull

echo "🔄 [post-merge] Sincronizando imágenes adicionales..."

cd "$(git rev-parse --show-toplevel)/backend"

# Cargar variables de entorno si existe el fichero
if [ -f .env ]; then
  export $(grep -v '^#' .env | xargs)
fi

npx ts-node src/database/sync-additional-images.ts

echo "✅ [post-merge] Sincronización completada."
EOF

chmod +x "$HOOK_PATH"

echo "✅ Hook post-merge instalado en: $HOOK_PATH"
echo "   Se ejecutará automáticamente tras cada 'git pull'."
