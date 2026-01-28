#!/bin/bash

# Script para instalar la tarea de limpieza automática en crontab
# Ejecutar: bash install-crontab.sh

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${YELLOW}==================================================${NC}"
echo -e "${YELLOW}  Instalador de Limpieza Automática de Mensajes${NC}"
echo -e "${YELLOW}==================================================${NC}"
echo ""

# Obtener el directorio absoluto del script
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
CLEANUP_SCRIPT="$SCRIPT_DIR/cleanup-messages.sh"

# Verificar que el script existe
if [ ! -f "$CLEANUP_SCRIPT" ]; then
    echo -e "${RED}❌ Error: No se encontró cleanup-messages.sh${NC}"
    exit 1
fi

# Dar permisos de ejecución
echo "📝 Configurando permisos de ejecución..."
chmod +x "$CLEANUP_SCRIPT"
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Permisos configurados${NC}"
else
    echo -e "${RED}❌ Error al configurar permisos${NC}"
    exit 1
fi

# Crear directorio de logs
mkdir -p "$SCRIPT_DIR/logs"
echo -e "${GREEN}✅ Directorio de logs creado${NC}"

# Verificar crontab actual
echo ""
echo "📋 Verificando crontab actual..."
CRON_LINE="0 3 * * * $CLEANUP_SCRIPT"

# Verificar si ya existe la entrada
if crontab -l 2>/dev/null | grep -q "$CLEANUP_SCRIPT"; then
    echo -e "${YELLOW}⚠️  La tarea ya está instalada en crontab${NC}"
    echo ""
    echo "Entrada actual:"
    crontab -l | grep "$CLEANUP_SCRIPT"
    echo ""
    read -p "¿Deseas reinstalarla? (s/n): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Ss]$ ]]; then
        echo "Instalación cancelada"
        exit 0
    fi

    # Eliminar entrada existente
    crontab -l | grep -v "$CLEANUP_SCRIPT" | crontab -
    echo -e "${GREEN}✅ Entrada antigua eliminada${NC}"
fi

# Agregar nueva entrada
echo ""
echo "📅 Instalando tarea en crontab..."
(crontab -l 2>/dev/null; echo "$CRON_LINE") | crontab -

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Tarea instalada exitosamente${NC}"
else
    echo -e "${RED}❌ Error al instalar en crontab${NC}"
    exit 1
fi

# Mostrar configuración final
echo ""
echo -e "${GREEN}==================================================${NC}"
echo -e "${GREEN}  ✅ Instalación Completada${NC}"
echo -e "${GREEN}==================================================${NC}"
echo ""
echo "📊 Configuración instalada:"
echo "   - Script: $CLEANUP_SCRIPT"
echo "   - Logs: $SCRIPT_DIR/logs/cleanup.log"
echo "   - Horario: Diariamente a las 3:00 AM"
echo ""
echo "🔍 Verificar instalación:"
echo "   crontab -l"
echo ""
echo "📋 Ver logs:"
echo "   tail -f $SCRIPT_DIR/logs/cleanup.log"
echo ""
echo "🧪 Probar manualmente:"
echo "   $CLEANUP_SCRIPT"
echo ""
echo -e "${YELLOW}⚠️  Nota: También se ejecuta automáticamente con node-cron${NC}"
echo -e "${YELLOW}   mientras el servidor Node.js esté activo.${NC}"
echo ""
