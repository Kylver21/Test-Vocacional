# 👥 Instrucciones para el Equipo - Test Vocacional

## 🎯 Bienvenido al Proyecto

Este documento te ayudará a configurar el proyecto en tu máquina local y empezar a colaborar.

---

## 📋 Pre-requisitos

Antes de empezar, asegúrate de tener instalado:

- ✅ **Node.js** (v18 o superior) - [Descargar](https://nodejs.org/)
- ✅ **pnpm** (recomendado) o npm
- ✅ **Git**
- ✅ **VS Code** (recomendado)

---

## 🚀 Configuración Inicial (Primera Vez)

### Paso 1: Clonar el Repositorio

```bash
git clone https://github.com/Kylver21/Test-Vocacional.git
cd Test-Vocacional
```

### Paso 2: Ejecutar Script de Setup Automático

```powershell
# En PowerShell
.\setup.ps1
```

Este script:
- ✅ Instala todas las dependencias
- ✅ Crea el archivo .env.local
- ✅ Verifica que todo esté listo

### Paso 3: Configurar Variables de Entorno

1. Abre el archivo `.env.local`
2. Contacta al líder del proyecto para obtener las credenciales
3. Pega los valores en el archivo

**No compartas las credenciales públicamente ni las subas a Git.**

### Paso 4: Iniciar el Proyecto

```bash
pnpm dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

---

## 🔑 Credenciales Necesarias

Solicita estas credenciales al líder del proyecto:

1. **Supabase URL** - Para la base de datos
2. **Supabase Anon Key** - Para autenticación
3. **Resend API Key** - Para envío de emails
4. **Admin Password** - Para acceder al panel de administración

---

## 📁 Estructura del Proyecto

```
vocational-test-login/
├── app/                    # Rutas de Next.js
│   ├── api/               # API Routes
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI (shadcn)
│   ├── admin-dashboard.tsx    # Dashboard de admin
│   ├── admin-panel.tsx        # Panel de administración
│   ├── vocational-test.tsx    # Test vocacional
│   └── test-results.tsx       # Resultados
├── lib/                   # Utilidades y lógica
│   ├── supabase.ts           # Cliente Supabase (browser)
│   ├── supabase-server.ts    # Cliente Supabase (server)
│   ├── supabase-queries.ts   # Queries a la BD
│   ├── email.ts              # Servicio de emails
│   └── vocational-data.ts    # Datos hardcodeados
├── scripts/               # Scripts SQL
│   ├── 01-create-tables.sql  # Crear tablas
│   └── 02-seed-data.sql      # Datos iniciales
├── .env.local            # Variables de entorno (NO subir a Git)
├── .env.example          # Plantilla de variables
├── SETUP.md              # Guía completa de setup
├── CHANGES.md            # Registro de cambios
└── README.md             # Documentación principal
```

---

## 🌿 Flujo de Trabajo con Git

### Crear una Nueva Rama para tu Tarea

```bash
# Actualiza main
git checkout main
git pull origin main

# Crea tu rama
git checkout -b feature/nombre-de-tu-tarea
```

### Hacer Commits

```bash
# Ver cambios
git status

# Agregar archivos
git add .

# Commit con mensaje descriptivo
git commit -m "feat: descripción de lo que hiciste"
```

### Subir Cambios

```bash
# Sube tu rama
git push origin feature/nombre-de-tu-tarea
```

### Crear Pull Request

1. Ve a GitHub
2. Click en "New Pull Request"
3. Selecciona tu rama
4. Describe los cambios
5. Solicita revisión del equipo

---

## 🎨 Convención de Nombres de Commits

Usa estos prefijos:

- `feat:` Nueva funcionalidad
- `fix:` Corrección de bug
- `docs:` Cambios en documentación
- `style:` Cambios de formato/estilo
- `refactor:` Refactorización de código
- `test:` Agregar tests
- `chore:` Tareas de mantenimiento

**Ejemplos:**
```bash
git commit -m "feat: agregar validación de email en formulario"
git commit -m "fix: corregir error en guardado de resultados"
git commit -m "docs: actualizar README con nuevas instrucciones"
```

---

## 🧪 Cómo Probar tus Cambios

### 1. Prueba Local

```bash
pnpm dev
```

- Navega por la aplicación
- Prueba la funcionalidad que modificaste
- Verifica que no haya errores en consola (F12)

### 2. Prueba en Diferentes Escenarios

- ✅ Usuario normal
- ✅ Usuario administrador
- ✅ Sin internet (para errores de red)
- ✅ Diferentes navegadores

### 3. Revisa Errores

```bash
# Revisa errores de TypeScript
pnpm build

# Revisa errores de linting
pnpm lint
```

---

## 📝 Tareas Comunes

### Agregar una Nueva Pregunta (Manual)

1. Ve al Panel de Administrador
2. Click en "Gestionar Preguntas"
3. Llena el formulario
4. Click "Agregar Pregunta"

### Agregar una Nueva Carrera (Manual)

1. Ve al Panel de Administrador
2. Click en "Gestionar Carreras"
3. Llena el formulario con todos los datos
4. Click "Agregar Carrera"

### Ver Estadísticas

1. Accede como administrador
2. Click en "Dashboard"
3. Verás métricas en tiempo real

---

## 🆘 Problemas Comunes

### "Cannot find module..."

```bash
# Reinstala dependencias
rm -rf node_modules
pnpm install
```

### "Port 3000 already in use"

```bash
# Cambia el puerto
pnpm dev -- -p 3001
```

### Conflictos en Git

```bash
# Actualiza tu rama con main
git checkout main
git pull origin main
git checkout tu-rama
git merge main

# Resuelve conflictos manualmente
# Luego:
git add .
git commit -m "fix: resolver conflictos con main"
```

### Cambios no se reflejan

```bash
# Limpia cache y reinicia
Ctrl+C  # Detén el servidor
rm -rf .next
pnpm dev
```

---

## 💬 Comunicación del Equipo

### Antes de Empezar una Tarea

1. Revisa el tablero de proyecto (GitHub Projects)
2. Asigna la tarea a tu nombre
3. Mueve a "In Progress"
4. Crea una rama

### Durante el Desarrollo

- Actualiza el progreso diariamente
- Pide ayuda si te bloqueas
- Haz commits frecuentes

### Al Terminar

1. Prueba todo
2. Actualiza documentación si es necesario
3. Crea Pull Request
4. Notifica al equipo

---

## 📚 Recursos Útiles

### Documentación

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [Resend Docs](https://resend.com/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)

### Archivos del Proyecto

- `SETUP.md` - Configuración completa
- `CHANGES.md` - Historial de cambios
- `README.md` - Documentación general

---

## 🎯 Objetivos del Proyecto

### Corto Plazo
- [ ] Completar todas las funcionalidades críticas
- [ ] Hacer testing exhaustivo
- [ ] Optimizar rendimiento

### Mediano Plazo
- [ ] Agregar más preguntas y carreras
- [ ] Mejorar diseño UI/UX
- [ ] Implementar analytics avanzados

### Largo Plazo
- [ ] Deploy a producción
- [ ] Multilenguaje (inglés/español)
- [ ] App móvil

---

## 🤝 Colaboración

### Pull Request Checklist

Antes de crear un PR, verifica:

- [ ] El código funciona localmente
- [ ] No hay errores de TypeScript
- [ ] No hay errores de linting
- [ ] La documentación está actualizada
- [ ] Los commits tienen mensajes descriptivos
- [ ] Has probado en diferentes escenarios

### Code Review

Cuando revises PRs de otros:

- ✅ Prueba los cambios localmente
- ✅ Revisa la lógica del código
- ✅ Verifica que siga las convenciones
- ✅ Deja comentarios constructivos
- ✅ Aprueba cuando esté todo bien

---

## 📞 Contacto

**Líder del Proyecto**: Kylver21

**Canales de Comunicación**:
- GitHub Issues - Para bugs y features
- GitHub Discussions - Para preguntas generales
- Pull Requests - Para revisión de código

---

¡Bienvenido al equipo! 🚀
