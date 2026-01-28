#!/bin/bash

# Script para ejecutar limpieza de mensajes del chat
# Se ejecuta automáticamente con crontab del sistema

# Obtener el directorio donde está el script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKEND_DIR="$SCRIPT_DIR"

# Crear directorio de logs si no existe
mkdir -p "$BACKEND_DIR/logs"

# Archivo de log
LOG_FILE="$BACKEND_DIR/logs/cleanup.log"

# Iniciar log
echo "========================================" >> "$LOG_FILE"
echo "Limpieza iniciada: $(date)" >> "$LOG_FILE"

# Navegar al directorio del backend
cd "$BACKEND_DIR" || {
    echo "Error: No se pudo acceder al directorio $BACKEND_DIR" >> "$LOG_FILE"
    exit 1
}

# Cargar variables de entorno si existe archivo .env
if [ -f .env ]; then
    export $(cat .env | grep -v '^#' | xargs)
fi

# Ejecutar limpieza
echo "Ejecutando limpieza..." >> "$LOG_FILE"

# Intentar con ts-node primero (desarrollo)
if command -v ts-node &> /dev/null; then
    npx ts-node src/database/cleanup-messages.ts >> "$LOG_FILE" 2>&1
    EXIT_CODE=$?
# Si no, usar node con archivos compilados (producción)
elif [ -f "dist/database/cleanup-messages.js" ]; then
    node dist/database/cleanup-messages.js >> "$LOG_FILE" 2>&1
    EXIT_CODE=$?
else
    echo "Error: No se encontró ts-node ni archivos compilados" >> "$LOG_FILE"
    EXIT_CODE=1
fi

# Registrar resultado
if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Limpieza completada exitosamente" >> "$LOG_FILE"
else
    echo "❌ Error en la limpieza (código: $EXIT_CODE)" >> "$LOG_FILE"
fi

echo "Finalizada: $(date)" >> "$LOG_FILE"
echo "========================================" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

exit $EXIT_CODE
