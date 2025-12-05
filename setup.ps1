# 🚀 Script de Instalación Rápida

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Test Vocacional - Setup Automático" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verificar que estamos en el directorio correcto
if (!(Test-Path "package.json")) {
    Write-Host "❌ Error: No se encontró package.json" -ForegroundColor Red
    Write-Host "Por favor ejecuta este script desde la raíz del proyecto" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Directorio del proyecto detectado" -ForegroundColor Green
Write-Host ""

# Paso 1: Instalar dependencias
Write-Host "📦 Paso 1: Instalando dependencias..." -ForegroundColor Yellow
if (Get-Command pnpm -ErrorAction SilentlyContinue) {
    Write-Host "   Usando pnpm..." -ForegroundColor Gray
    pnpm install
} elseif (Get-Command npm -ErrorAction SilentlyContinue) {
    Write-Host "   Usando npm..." -ForegroundColor Gray
    npm install
} else {
    Write-Host "❌ Error: No se encontró npm ni pnpm" -ForegroundColor Red
    exit 1
}

if ($LASTEXITCODE -eq 0) {
    Write-Host "✅ Dependencias instaladas correctamente" -ForegroundColor Green
} else {
    Write-Host "❌ Error al instalar dependencias" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Paso 2: Verificar .env.local
Write-Host "🔐 Paso 2: Verificando variables de entorno..." -ForegroundColor Yellow
if (!(Test-Path ".env.local")) {
    Write-Host "⚠️  Advertencia: .env.local no existe" -ForegroundColor Yellow
    Write-Host "   Creando desde .env.example..." -ForegroundColor Gray
    Copy-Item ".env.example" ".env.local"
    Write-Host "✅ Archivo .env.local creado" -ForegroundColor Green
    Write-Host ""
    Write-Host "⚠️  IMPORTANTE: Debes configurar tus variables de entorno en .env.local" -ForegroundColor Yellow
    Write-Host "   1. NEXT_PUBLIC_SUPABASE_URL" -ForegroundColor Cyan
    Write-Host "   2. NEXT_PUBLIC_SUPABASE_ANON_KEY" -ForegroundColor Cyan
    Write-Host "   3. RESEND_API_KEY" -ForegroundColor Cyan
    Write-Host ""
} else {
    Write-Host "✅ Archivo .env.local existe" -ForegroundColor Green
    
    # Verificar que las variables no sean placeholders
    $envContent = Get-Content ".env.local" -Raw
    if ($envContent -match "your-project-url-here" -or $envContent -match "your-anon-key-here") {
        Write-Host "⚠️  Advertencia: Parece que las variables aún no están configuradas" -ForegroundColor Yellow
        Write-Host "   Por favor edita .env.local con tus credenciales reales" -ForegroundColor Yellow
    } else {
        Write-Host "✅ Variables de entorno parecen estar configuradas" -ForegroundColor Green
    }
}
Write-Host ""

# Paso 3: Verificar scripts SQL
Write-Host "📄 Paso 3: Verificando scripts SQL..." -ForegroundColor Yellow
if ((Test-Path "scripts/01-create-tables.sql") -and (Test-Path "scripts/02-seed-data.sql")) {
    Write-Host "✅ Scripts SQL encontrados" -ForegroundColor Green
    Write-Host ""
    Write-Host "📋 Recuerda ejecutar estos scripts en Supabase SQL Editor:" -ForegroundColor Cyan
    Write-Host "   1. scripts/01-create-tables.sql" -ForegroundColor White
    Write-Host "   2. scripts/02-seed-data.sql" -ForegroundColor White
} else {
    Write-Host "⚠️  Advertencia: No se encontraron todos los scripts SQL" -ForegroundColor Yellow
}
Write-Host ""

# Resumen final
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  Resumen de Instalación" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "✅ Dependencias instaladas" -ForegroundColor Green
Write-Host "✅ Estructura de archivos verificada" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Pasos pendientes:" -ForegroundColor Yellow
Write-Host "   1. Configurar .env.local con tus credenciales" -ForegroundColor White
Write-Host "   2. Ejecutar scripts SQL en Supabase" -ForegroundColor White
Write-Host "   3. Crear cuenta en Resend y obtener API key" -ForegroundColor White
Write-Host ""
Write-Host "🚀 Para iniciar el servidor:" -ForegroundColor Cyan
Write-Host "   pnpm dev   (o npm run dev)" -ForegroundColor White
Write-Host ""
Write-Host "📖 Lee SETUP.md para instrucciones detalladas" -ForegroundColor Cyan
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
