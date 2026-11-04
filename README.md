# Jombo Frontend

Aplicación web de carpooling (compartir viajes) construida con Next.js 16, TypeScript y Tailwind CSS.

## 📋 Descripción

Jombo es una plataforma de carpooling que permite a los usuarios publicar y reservar viajes compartidos. La aplicación facilita la conexión entre conductores que tienen asientos disponibles y pasajeros que buscan transporte, promoviendo un transporte más sostenible y económico.

## ✨ Características

### Para Pasajeros
- 🔍 **Búsqueda de viajes** - Encuentra viajes disponibles desde tu ciudad de origen
- 📅 **Reservar asientos** - Solicita reservas para los viajes que necesites
- 📋 **Mis reservas** - Gestiona tus reservas activas, pendientes y confirmadas
- 🌍 **Multiidioma** - Disponible en finés e inglés

### Para Conductores
- 🚗 **Publicar viajes** - Crea nuevos viajes indicando origen, destino, fecha, hora, asientos y precio
- 👥 **Gestionar reservas** - Acepta o rechaza solicitudes de reserva de pasajeros
- 📊 **Mis viajes** - Visualiza todos tus viajes publicados y sus reservas

### Sistema de Reservas
- **Estados de reserva:**
  - `Pendiente` - Solicitud enviada, esperando confirmación del conductor
  - `Confirmada` - Conductor ha aceptado la reserva
  - `Rechazada` - Conductor ha rechazado la reserva
  - `Cancelada` - Pasajero ha cancelado la reserva

### Características Técnicas
- 🔐 **Autenticación** - Sistema de login/registro con JWT
- 🎨 **UI Responsiva** - Diseño adaptable a móviles, tablets y desktop
- 🌐 **Internacionalización** - Sistema completo de traducciones (i18n)
- 🔄 **Estado en tiempo real** - Actualización automática de asientos disponibles
- 🎯 **Validaciones** - Validación de formularios y estados

## 🚀 Comenzando

### Prerrequisitos

- Node.js 18+ 
- npm, yarn, pnpm o bun
- Backend de Rails corriendo en `http://localhost:3001`
- PostgreSQL (para el backend)

### Instalación

1. Clona el repositorio:
```bash
git clone <repository-url>
cd jombo-frontend
```

2. Instala las dependencias:
```bash
npm install
```

3. Configura las variables de entorno creando un archivo `.env.local`:
```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:3001
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id.apps.googleusercontent.com
```

> **Nota:** Las rutas de API (`/api/v1/login`, `/api/v1/register`, `/api/v1/me`) están hardcodeadas en el código y no requieren variables de entorno.

4. Inicia el servidor de desarrollo:
```bash
npm run dev
```

5. Abre [http://localhost:3000](http://localhost:3000) en tu navegador

## 🏗️ Estructura del Proyecto

```
jombo-frontend/
├── app/
│   ├── [lang]/              # Rutas por idioma
│   │   ├── page.tsx         # Página principal
│   │   ├── login/           # Página de login
│   │   ├── register/        # Página de registro
│   │   ├── search/          # Búsqueda de viajes
│   │   ├── create-trip/     # Crear viaje
│   │   ├── my-trips/        # Mis viajes (conductor)
│   │   └── my-bookings/     # Mis reservas (pasajero)
│   ├── components/          # Componentes reutilizables
│   ├── contexts/            # Context API (Auth)
│   ├── hooks/               # Custom hooks
│   └── lib/
│       └── api/             # Funciones de API
├── public/
│   └── locales/            # Archivos de traducción
│       ├── en/
│       └── fi/
└── middleware.ts           # Middleware de i18n
```

## 🌐 Idiomas Soportados

- 🇫🇮 Finés (`fi`) — idioma por defecto, servido en la raíz: `https://jombo.fi/...`
- 🇬🇧 Inglés (`en`) — servido bajo `/en`: `https://jombo.fi/en/...`

Jombo solo opera en Finlandia (jombo.fi). `proxy.ts` reescribe internamente las URLs sin prefijo a la ruta `/fi` y redirige `/fi/...` y las antiguas `/es/...` a la URL sin prefijo. Para generar enlaces usa `localePath(lang, path)` de `app/lib/i18n/config.ts`.

## 🔌 API Backend

El frontend se conecta a un backend de Ruby on Rails. Endpoints principales:

### Autenticación
- `POST /api/v1/register` - Registro de usuario
- `POST /api/v1/login` - Login
- `GET /api/v1/me` - Obtener usuario actual
- `DELETE /api/v1/logout` - Cerrar sesión

### Viajes
- `GET /api/v1/trips/search/:location` - Buscar viajes
- `POST /api/v1/trips` - Crear viaje
- `GET /api/v1/trips/my_trips` - Mis viajes (conductor)
- `GET /api/v1/trips/:id/bookings` - Reservas de un viaje

### Reservas
- `POST /api/v1/bookings` - Crear reserva
- `GET /api/v1/bookings` - Mis reservas
- `PUT /api/v1/bookings/:id/confirm` - Confirmar reserva (conductor)
- `PUT /api/v1/bookings/:id/reject` - Rechazar reserva (conductor)
- `DELETE /api/v1/bookings/:id` - Cancelar reserva (pasajero)

## 🎨 Tecnologías

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** Tailwind CSS
- **Autenticación:** JWT con cookies HTTP-only
- **Internacionalización:** Sistema custom con JSON
- **Gestión de Estado:** React Context API

## 📝 Flujos Principales

### Flujo de Reserva
1. Usuario busca viajes desde una ciudad
2. Selecciona un viaje y solicita reserva
3. Reserva queda en estado "Pendiente"
4. Conductor recibe notificación y puede confirmar/rechazar
5. Si confirma, se descuentan los asientos y reserva pasa a "Confirmada"
6. Usuario puede cancelar reserva antes del viaje

### Flujo de Publicación
1. Conductor completa formulario con detalles del viaje
2. Sistema valida datos (fecha, hora, asientos, precio)
3. Viaje se publica y aparece en búsquedas
4. Conductor recibe solicitudes de reserva
5. Gestiona reservas desde "Mis Viajes"

## 🔧 Scripts Disponibles

```bash
npm run dev          # Servidor de desarrollo
npm run build        # Build de producción
npm run start        # Servidor de producción
npm run lint         # Linter
```

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT.

## 👥 Autores

- Equipo Jombo

## 🙏 Agradecimientos

- Next.js team
- Tailwind CSS
- Comunidad de código abierto
