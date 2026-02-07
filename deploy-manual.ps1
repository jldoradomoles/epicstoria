# Script para despliegue manual en IONOS VPS
# Ejecutar: .\deploy-manual.ps1

Write-Host "🚀 Desplegando en servidor IONOS..." -ForegroundColor Cyan

# Pide la IP del VPS
$VPS_IP = Read-Host "Ingresa la IP de tu VPS"
$VPS_USER = Read-Host "Ingresa el usuario SSH (ej: epicstoria)"

Write-Host "`n📦 Conectando al servidor..." -ForegroundColor Yellow

# Comando SSH que ejecutará el despliegue
$DEPLOY_SCRIPT = @"
cd ~/epicstoria
echo '🔄 Descargando últimos cambios...'
git pull origin main
echo '📦 Instalando dependencias...'
npm install
echo '🔨 Construyendo aplicación...'
npm run build:ionos
echo '🔄 Reiniciando frontend...'
pm2 restart epicstoria-frontend
echo '✅ Despliegue completado!'
pm2 list
"@

# Ejecutar en el servidor
ssh "$VPS_USER@$VPS_IP" $DEPLOY_SCRIPT

Write-Host "`n✅ Despliegue manual completado!" -ForegroundColor Green
Write-Host "Verifica tu sitio: http://$VPS_IP" -ForegroundColor Cyan
