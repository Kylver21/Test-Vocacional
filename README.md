# Vocational Test - Sistema de Test Vocacional

Sistema de evaluación vocacional con panel administrativo construido con Next.js y Supabase.

## 🚀 Configuración Inicial

### 1. Crear Proyecto en Supabase

1. Ve a [https://supabase.com](https://supabase.com) y crea una cuenta
2. Crea un nuevo proyecto:
   - **Name**: `vocational-test` (o el nombre que prefieras)
   - **Database Password**: Guarda esta contraseña de forma segura
   - **Region**: Selecciona la región más cercana (por ejemplo, `us-east-1`)
3. Espera a que el proyecto se cree (puede tomar 1-2 minutos)

### 2. Configurar Base de Datos

1. Una vez creado el proyecto, ve a **SQL Editor** en el menú lateral
2. **Ejecuta el primer script** (`scripts/01-create-tables.sql`):
   - Abre el archivo en VS Code
   - Copia TODO el contenido (Ctrl+A, Ctrl+C)
   - Pégalo en el SQL Editor de Supabase
   - Haz click en **"RUN"**
   - Verifica que diga "Success"
3. **Ejecuta el segundo script** (`scripts/02-seed-data.sql`):
   - Repite el proceso anterior con este archivo
   - Esto poblará la base de datos con preguntas y carreras iniciales
4. Ve a **Table Editor** y verifica que las tablas se crearon correctamente

### 3. Obtener Credenciales de API

1. Ve a **Project Settings** > **API**
2. Copia los siguientes valores:
   - **Project URL** (ej: `https://xxxxxxxxx.supabase.co`)
   - **Project API keys** > **anon/public** key

### 4. Configurar Variables de Entorno

1. Copia el archivo `.env.example` y renómbralo a `.env.local`:
   ```bash
   cp .env.example .env.local
   ```

2. Edita `.env.local` y reemplaza con tus valores:
   ```env
   # Supabase
   NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-clave-anon-aqui
   
   # Resend (para envío de emails)
   RESEND_API_KEY=re_tu-api-key-de-resend
   
   # URL de la aplicación
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### 5. Configurar Resend (Servicio de Email)

1. Ve a [https://resend.com](https://resend.com) y crea una cuenta
2. Una vez dentro, ve a **API Keys**
3. Crea una nueva API key
4. Copia la key y agrégala a tu `.env.local` como `RESEND_API_KEY`
5. (Opcional) Verifica un dominio personalizado para enviar desde tu dominio

### 5. Instalar Dependencias

```bash
# Con pnpm (recomendado)
pnpm install

# Instalar dependencias adicionales necesarias
pnpm add resend

# O con npm
npm install
npm add resend
```

### 6. Ejecutar el Proyecto

```bash
# Modo desarrollo
pnpm dev

# O con npm
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📋 Estructura del Proyecto

```
├── app/                    # App Router de Next.js
│   ├── api/               # API Routes
│   ├── layout.tsx         # Layout principal
│   └── page.tsx           # Página de inicio
├── components/            # Componentes React
│   ├── ui/               # Componentes de UI (shadcn)
│   ├── vocational-test.tsx
│   ├── admin-panel.tsx
│   └── ...
├── lib/                   # Utilidades y configuración
│   ├── supabase.ts       # Cliente de Supabase (browser)
│   ├── supabase-server.ts # Cliente de Supabase (server)
│   └── vocational-data.ts
├── scripts/              # Scripts SQL
│   └── 01-create-tables.sql
└── .env.local           # Variables de entorno (no incluido en Git)
```

## 🔐 Variables de Entorno

Este proyecto requiere las siguientes variables de entorno en `.env.local`:

- `NEXT_PUBLIC_SUPABASE_URL`: URL de tu proyecto Supabase
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Clave pública/anon de tu proyecto Supabase
- `RESEND_API_KEY`: API Key de Resend para envío de emails
- `NEXT_PUBLIC_APP_URL`: URL de tu aplicación (para links en emails)

**⚠️ IMPORTANTE**: Nunca subas el archivo `.env.local` a Git. Está incluido en `.gitignore`.

## 👥 Trabajo en Equipo

Para que tu equipo pueda trabajar en el proyecto:

1. **Compartir el proyecto Supabase**:
   - Ve a **Project Settings** > **Team**
   - Invita a tus compañeros de equipo por email

2. **Compartir credenciales de forma segura**:
   - Cada miembro del equipo debe crear su propio `.env.local`
   - Usa las mismas credenciales del proyecto Supabase compartido

3. **Clonar el repositorio**:
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd vocational-test-login
   pnpm install
   # Crear .env.local con las credenciales compartidas
   pnpm dev
   ```

## 🗄️ Base de Datos

El proyecto incluye las siguientes tablas:

- `users` - Usuarios del sistema
- `questions` - Preguntas del test
- `question_answers` - Respuestas posibles
- `careers` - Carreras disponibles
- `career_categories` - Categorías de carreras
- `career_universities` - Universidades por carrera
- `test_results` - Resultados de tests completados

## 📦 Tecnologías Utilizadas

- **Next.js 16** - Framework React
- **React 19** - Librería UI
- **Supabase** - Backend as a Service (BaaS)
  - Autenticación
  - Base de datos PostgreSQL
  - Row Level Security (RLS)
- **Resend** - Servicio de envío de emails
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **shadcn/ui** - Componentes de UI

## ✨ Funcionalidades Implementadas

### Usuario Final
- ✅ Registro e inicio de sesión
- ✅ Test vocacional de 30 preguntas
- ✅ Resultados personalizados con top 5 carreras
- ✅ Envío de resultados por email
- ✅ Historial de tests completados
- ✅ Detalles completos de carreras (salario, universidades, videos)

### Administrador
- ✅ Panel de administración protegido
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de preguntas (CRUD)
- ✅ Gestión completa de carreras (CRUD)
- ✅ Visualización de carreras más recomendadas
- ✅ Métricas de uso del sistema

### Sistema
- ✅ Persistencia de datos en Supabase
- ✅ Envío de emails con Resend
- ✅ Validaciones de entrada
- ✅ Manejo de errores
- ✅ Row Level Security (RLS)
- ✅ API Routes protegidas

## 🚀 Deployment

El proyecto está listo para deployarse en Vercel:

1. Sube tu código a GitHub
2. Conecta tu repositorio en [Vercel](https://vercel.com)
3. Agrega las variables de entorno en Vercel
4. Deploy!

## 📝 Licencia

Este proyecto es privado y de uso interno del equipo.
