#!/bin/bash

# Script para desinstalar la tarea de limpieza automática de crontab
# Ejecutar: bash uninstall-crontab.sh

# Colores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${YELLOW}==================================================${NC}"
echo -e "${YELLOW}  Desinstalador de Limpieza Automática${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo ""

# Obtener ruta del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLEANUP_SCRIPT="$SCRIPT_DIR/cleanup-messages.sh"

# Verificar si existe en crontab
if ! crontab -l 2>/dev/null | grep -q "$CLEANUP_SCRIPT"; then
    echo -e "${YELLOW}⚠️  No se encontró la tarea en crontab${NC}"
    exit 0
fi

# Mostrar entrada actual
echo "📋 Entrada encontrada:"
crontab -l | grep "$CLEANUP_SCRIPT"
echo ""

# Confirmar
read -p "¿Deseas eliminar esta tarea de crontab? (s/n): " -n 1 -r
echo ""

if [[ ! $REPLY =~ ^[Ss]$ ]]; then
    echo "Operación cancelada"
    exit 0
fi

# Eliminar
crontab -l | grep -v "$CLEANUP_SCRIPT" | crontab -

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tarea eliminada de crontab${NC}"
    echo ""
    echo -e "${YELLOW}Nota: La limpieza con node-cron seguirá activa${NC}"
    echo -e "${YELLOW}mientras el servidor Node.js esté ejecutándose.${NC}"
else
    echo -e "${RED}❌ Error al eliminar tarea${NC}"
    exit 1
fi
