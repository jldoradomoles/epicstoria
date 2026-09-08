#!/bin/bash

##############################################################################
#
# Post-Deploy Script for Epicstoria Image Migration
#
# Script de post-despliegue que se ejecuta después de compilar y antes de
# reiniciar la aplicación. Realiza la migración de imágenes a .webp.
#
# Uso:
#   ./backend/scripts/post-deploy.sh
#
# O en GitHub Actions:
#   - name: Run post-deploy
#     run: bash backend/scripts/post-deploy.sh
#
##############################################################################

set -e  # Salir si hay error

echo "======================================================================"
echo "🚀 Post-Deploy Script - Epicstoria Image Migration"
echo "======================================================================"
echo ""
echo "⏰ Timestamp: $(date '+%Y-%m-%d %H:%M:%S')"
echo "📁 Directorio: $(pwd)"
echo ""

# Verificar que estamos en el directorio correcto
if [ ! -f "backend/package.json" ]; then
    echo "❌ Error: script debe ejecutarse desde la raíz del proyecto"
    exit 1
fi

cd backend

echo "📋 Paso 1: Instalar dependencias..."
npm install --production=false

echo ""
echo "📋 Paso 2: Compilar TypeScript..."
npm run build

echo ""
echo "📋 Paso 3: Ejecutar migraciones de BD..."

# Ejecutar migración de imágenes
echo "   - Migrando imágenes a .webp..."
npm run db:migrate-images-to-webp || {
    echo "⚠️  Advertencia: La migración de imágenes falló"
    echo "   El servidor se reiniciará, pero verifica los logs"
    exit 1
}

echo ""
echo "======================================================================"
echo "✅ Post-Deploy completado exitosamente"
echo "======================================================================"
echo ""
echo "📝 Próximos pasos:"
echo "   1. Reiniciar la aplicación con: npm run start"
echo "   2. O si usas PM2: pm2 reload ecosystem.config.js"
echo ""
