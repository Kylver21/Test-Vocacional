# 🚀 Guía de Configuración Completa - Test Vocacional

Esta guía te llevará paso a paso para configurar completamente la aplicación de Test Vocacional con todas sus funcionalidades.

## ✅ Checklist de Configuración

- [ ] Proyecto Supabase creado
- [ ] Base de datos inicializada
- [ ] Variables de entorno configuradas
- [ ] Resend configurado
- [ ] Dependencias instaladas
- [ ] Servidor funcionando

---

## 1️⃣ Configurar Supabase

### Paso 1.1: Crear Proyecto

1. Ve a [https://supabase.com](https://supabase.com)
2. Click en **"New Project"**
3. Completa:
   - **Name**: `vocational-test`
   - **Database Password**: Crea una contraseña segura y guárdala
   - **Region**: Elige la más cercana (ej: `South America (São Paulo)`)
4. Click **"Create new project"**
5. Espera 2-3 minutos

### Paso 1.2: Ejecutar Scripts SQL

1. Ve a **SQL Editor** (icono en menú lateral)
2. **Script 1 - Crear Tablas:**
   - Abre `scripts/01-create-tables.sql` en VS Code
   - Selecciona TODO (Ctrl+A)
   - Copia (Ctrl+C)
   - Pega en SQL Editor
   - Click **"RUN"**
   - Verifica: "Success. No rows returned"

3. **Script 2 - Datos Iniciales:**
   - Abre `scripts/02-seed-data.sql` en VS Code
   - Repite el proceso anterior
   - Click **"RUN"**
   - Verifica: "Success"

4. **Verificar Tablas:**
   - Ve a **Table Editor**
   - Deberías ver: `users`, `questions`, `question_answers`, `careers`, `career_categories`, `career_universities`, `test_results`

### Paso 1.3: Obtener Credenciales

1. Ve a **Settings** ⚙️ > **API**
2. Copia estos valores:
   ```
   Project URL: https://xxxxx.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   ```

---

## 2️⃣ Configurar Resend (Emails)

### Paso 2.1: Crear Cuenta

1. Ve a [https://resend.com](https://resend.com)
2. Click **"Start Building"** o **"Sign Up"**
3. Crea tu cuenta (puedes usar GitHub)

### Paso 2.2: Obtener API Key

1. Una vez dentro, ve a **API Keys** en el menú lateral
2. Click **"Create API Key"**
3. Dale un nombre: `vocational-test-dev`
4. Selecciona permisos: **"Full Access"**
5. Click **"Create"**
6. **COPIA LA KEY INMEDIATAMENTE** (solo se muestra una vez)
   - Debería verse así: `re_xxxxxxxxxxxxx`

### Paso 2.3: Verificar Dominio (Opcional - Producción)

Para desarrollo, puedes usar el dominio por defecto de Resend.

Para producción:
1. Ve a **Domains** > **"Add Domain"**
2. Agrega tu dominio (ej: `tuapp.com`)
3. Configura los registros DNS según las instrucciones
4. Espera verificación

---

## 3️⃣ Configurar Variables de Entorno

### Paso 3.1: Crear .env.local

1. En la raíz del proyecto, abre `.env.local`
2. Reemplaza con tus valores reales:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://XXXXXXXXXXXX.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.XXXXXXXXXXXXXXX

# Resend Configuration
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX

# Application URL
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. Guarda el archivo (Ctrl+S)

### Paso 3.2: Verificar que .env.local NO esté en Git

```bash
# Verifica que .env.local esté ignorado
git status

# NO debería aparecer en la lista de archivos modificados
```

---

## 4️⃣ Instalar Dependencias

### Paso 4.1: Instalar Node Modules

```powershell
# Con pnpm (recomendado)
pnpm install

# O con npm
npm install
```

### Paso 4.2: Verificar Instalación

```powershell
# Verifica que Resend esté instalado
pnpm list resend

# Deberías ver algo como: resend@x.x.x
```

Si no está instalado:
```powershell
pnpm add resend
```

---

## 5️⃣ Iniciar la Aplicación

### Paso 5.1: Modo Desarrollo

```powershell
pnpm dev
```

### Paso 5.2: Verificar que Funciona

1. Abre el navegador en [http://localhost:3000](http://localhost:3000)
2. Deberías ver la pantalla de login
3. **NO** debería haber error de Supabase

---

## 6️⃣ Probar Funcionalidades

### Test 1: Registro e Inicio de Sesión

1. Click en **"Registrarse"**
2. Ingresa un email y contraseña
3. Deberías entrar al dashboard

### Test 2: Completar Test Vocacional

1. Click en **"Nuevo Test"**
2. Responde las 30 preguntas
3. Verifica que veas los resultados

### Test 3: Enviar Email

1. En la pantalla de resultados
2. Ingresa tu email
3. Click **"Enviar"**
4. Revisa tu bandeja de entrada
5. Deberías recibir el email con resultados

### Test 4: Panel de Administrador

1. Logout del usuario normal
2. Click en **"¿Eres administrador?"**
3. Ingresa credenciales de admin (configúralas en Supabase)
4. Verifica el dashboard con estadísticas

---

## 🔧 Solución de Problemas

### Error: "Your project's URL and API key are required"

✅ **Solución**: 
- Verifica que `.env.local` tenga las credenciales correctas
- Reinicia el servidor (`Ctrl+C` y luego `pnpm dev`)

### Error: "Failed to send email"

✅ **Solución**:
- Verifica que `RESEND_API_KEY` esté en `.env.local`
- Verifica que la key sea válida en Resend
- Revisa la consola del servidor para más detalles

### Las estadísticas no aparecen en Admin Dashboard

✅ **Solución**:
- Completa al menos 1 test vocacional
- Las estadísticas necesitan datos para mostrarse

### Los cambios en Admin Panel no se guardan

✅ **Solución**:
- Verifica que ejecutaste ambos scripts SQL
- Revisa la consola del navegador (F12) para errores
- Verifica la conexión a Supabase

---

## 📊 Verificar que Todo Funciona

### Checklist Final

- [ ] Login/Registro funciona
- [ ] Test vocacional se completa
- [ ] Resultados se muestran correctamente
- [ ] Email se envía y se recibe
- [ ] Historial de tests se guarda
- [ ] Admin dashboard muestra estadísticas
- [ ] Admin puede agregar/editar preguntas
- [ ] Admin puede agregar/editar carreras

---

## 🎉 ¡Listo!

Si todo funciona, tu aplicación está completamente configurada.

### Próximos Pasos

1. **Producción**: Configura tu dominio en Resend
2. **Deploy**: Sube a Vercel con las variables de entorno
3. **Mejoras**: Agrega más preguntas y carreras
4. **Personalización**: Ajusta colores y textos

---

## 🆘 ¿Necesitas Ayuda?

Si algo no funciona:
1. Revisa la consola del navegador (F12)
2. Revisa la consola del servidor
3. Verifica que todas las variables de entorno estén configuradas
4. Asegúrate de haber ejecutado ambos scripts SQL
