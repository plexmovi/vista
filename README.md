# StreamCheck Monitor

Aplicación web para gestionar y monitorear canales de streaming m3u8 con verificación automática cada 30 segundos.

## Características

- 🔐 **Autenticación segura** con PIN de 6 dígitos (198833)
- 📡 **Monitoreo en tiempo real** - Verificación automática cada 30 segundos
- 🎬 **Reproductor HLS** integrado para reproducir canales m3u8
- 💾 **Persistencia** con base de datos Neon (PostgreSQL) o localStorage
- 🌙 **Dark Mode** optimizado para streaming
- 📱 **Diseño responsivo** - Funciona en dispositivos móviles y escritorio

## Requisitos Previos

- Node.js 18+
- pnpm (gestor de paquetes)

## Instalación Local

```bash
# 1. Clonar el repositorio
git clone <tu-repositorio>
cd streamcheck-monitor

# 2. Instalar dependencias
pnpm install

# 3. (Opcional) Configurar Neon Database
# - Crea un proyecto en https://neon.tech
# - Copia el archivo .env.example a .env
# - Configura DATABASE_URL con tus credenciales
cp .env.example .env

# 4. (Opcional) Configurar Prisma
# Si usas Neon, genera el cliente de Prisma:
npx prisma generate
npx prisma db push

# 5. Ejecutar en desarrollo
pnpm dev
```

## Configuración de Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos Neon (PostgreSQL)
DATABASE_URL="postgres://usuario:password@host.neon.tech/dbname?sslmode=require"
DIRECT_URL="postgres://usuario:password@host.neon.tech/dbname?sslmode=require"

# PIN de administrador (6 dígitos)
ADMIN_PIN=198833

# Secreto para sesiones (genera uno aleatorio de al menos 32 caracteres)
SESSION_SECRET=tu_session_secret_aqui_mínimo_32_caracteres
```

## Despliegue en GitHub + Vercel

### Paso 1: Subir a GitHub

```bash
# Inicializar git (si no lo has hecho)
git init
git add .
git commit -m "Initial commit"

# Crear repositorio en GitHub y subir
git remote add origin https://github.com/tu-usuario/streamcheck-monitor.git
git branch -M main
git push -u origin main
```

### Paso 2: Configurar Vercel

1. Ve a [Vercel](https://vercel.com) e inicia sesión
2. Click en "Add New..." → "Project"
3. Importa tu repositorio de GitHub
4. En "Environment Variables", agrega:
   - `ADMIN_PIN` = `198833`
   - `SESSION_SECRET` = (una cadena aleatoria segura)
   - `DATABASE_URL` = (tu URL de Neon)
5. Click en "Deploy"

### Paso 3: Configurar Neon (Base de Datos)

1. Ve a [Neon](https://neon.tech) y crea un proyecto
2. En el dashboard, copia la cadena de conexión
3. Pégala en la variable `DATABASE_URL` de Vercel

## Uso de la Aplicación

1. **Login**: Ingresa el PIN `198833`
2. **Agregar Canales**: Click en "Agregar Canal" e ingresa:
   - Nombre del canal
   - URL del stream m3u8
3. **Verificación Automática**: Los canales se verifican cada 30 segundos automáticamente
4. **Reproducir**: Click en "Reproducir" para ver el canal

## Estructura del Proyecto

```
streamcheck-monitor/
├── src/
│   ├── components/       # Componentes reutilizables
│   │   ├── ui/          # Componentes de UI (botones, inputs, etc.)
│   │   └── HLSPlayer.tsx # Reproductor HLS
│   ├── contexts/        # Contextos de React
│   │   ├── AuthContext.tsx    # Autenticación
│   │   └── ChannelContext.tsx # Gestión de canales
│   ├── pages/           # Páginas
│   │   ├── Login.tsx    # Página de login
│   │   └── Dashboard.tsx # Panel principal
│   ├── types/           # Tipos TypeScript
│   └── App.tsx          # Componente principal
├── prisma/
│   └── schema.prisma    # Esquema de base de datos
└── .env.example         # Ejemplo de variables de entorno
```

## Solución de Problemas

### Error de CORS al verificar streams
Los streams deben tener habilitado CORS en el servidor de origen. Algunos streams públicos pueden bloquear solicitudes desde dominios desconocidos.

### La base de datos no conecta
- Verifica que la URL de Neon sea correcta
- Asegúrate de que el proyecto de Neon esté activo
- Verifica que sslmode=require esté en la URL

### El reproductor no carga
- Verifica que la URL del stream termine en .m3u8
- Algunos streams requieren headers especiales
- Prueba con un stream diferente para confirmar

## Tecnologías Usadas

- **Frontend**: React + TypeScript + Vite
- **Estilos**: Tailwind CSS
- **UI Components**: Radix UI
- **Reproductor**: HLS.js
- **Base de Datos**: Neon (PostgreSQL)
- **ORM**: Prisma
- **Despliegue**: Vercel

## Licencia

MIT
