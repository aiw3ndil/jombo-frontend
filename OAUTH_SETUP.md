# Autenticación OAuth con Google

Este documento explica cómo está implementada la autenticación OAuth con Google en el frontend de Jombo.

## Configuración

### 1. Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto con las siguientes variables:

```bash
NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_google_client_id
```

### 2. Obtener el Google Client ID

1. Ve a [Google Cloud Console](https://console.cloud.google.com/)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a "APIs & Services" > "Credentials"
4. Crea un "OAuth 2.0 Client ID"
5. Configura el tipo de aplicación como "Web application"
6. Agrega los siguientes orígenes autorizados:
   - `http://localhost:3001` (desarrollo)
   - `https://tu-dominio.com` (producción)
7. Copia el Client ID generado

## Arquitectura

### Componentes Principales

#### 1. `GoogleOAuthWrapper` (`app/components/GoogleOAuthWrapper.tsx`)
- Proveedor que envuelve toda la aplicación
- Inicializa el cliente OAuth de Google
- Se encuentra en el layout principal

#### 2. `GoogleLoginButton` (`app/components/GoogleLoginButton.tsx`)
- Componente reutilizable para el botón de login
- Maneja el flujo completo de autenticación
- Integrado en la página de login

#### 3. API Helper (`app/lib/api/auth.ts`)
- Funciones `loginWithGoogle` y `loginWithFacebook`
- Envían el token al backend para validación
- Manejan la respuesta y errores

### Flujo de Autenticación

```
Usuario clickea "Continuar con Google"
    ↓
Google muestra popup de selección de cuenta
    ↓
Usuario selecciona cuenta y autoriza
    ↓
Google devuelve credential token
    ↓
Frontend envía token a /api/v1/auth/google
    ↓
Backend valida token con Google
    ↓
Backend crea/actualiza usuario y genera JWT
    ↓
Backend envía JWT en cookie httpOnly
    ↓
Frontend redirige a página de destino
```

## Uso

### En la Página de Login

El botón de Google ya está integrado en `/[lang]/login/page.tsx` y **se traduce automáticamente** según el idioma:

```tsx
<GoogleLoginButton 
  redirect={redirect}
  onError={handleOAuthError}
/>
```

El botón mostrará:
- **Español**: "Continuar con Google"
- **English**: "Continue with Google"  
- **Suomi**: "Jatka Googlella"

### Traducciones

Las traducciones se gestionan en los archivos de locale:
- `public/locales/es/login.json`
- `public/locales/en/login.json`
- `public/locales/fi/login.json`

Claves agregadas:
```json
{
  "continueWith": "Continuar con {provider}",
  "or": "o"
}
```

### Propiedades del Componente

```typescript
interface GoogleLoginButtonProps {
  onSuccess?: (user: any) => void;  // Callback cuando login exitoso
  onError?: (error: string) => void; // Callback cuando hay error
  redirect?: string | null;          // URL de redirección después del login
}
```

## Seguridad

1. **Validación en Backend**: El token siempre se valida en el backend con Google
2. **Cookies httpOnly**: El JWT se guarda en cookies httpOnly (protección XSS)
3. **CORS**: Configurado en el backend para aceptar solo dominios autorizados
4. **No se expone el secret**: Solo se usa el Client ID en el frontend

## Testing

### Desarrollo Local

1. Configura `NEXT_PUBLIC_GOOGLE_CLIENT_ID` en `.env.local`
2. Asegúrate de que el backend esté corriendo en `http://localhost:3000`
3. Inicia el frontend: `npm run dev`
4. Ve a `http://localhost:3001/es/login`
5. Haz click en "Continuar con Google"

### Producción

1. Actualiza las URLs autorizadas en Google Cloud Console
2. Configura la variable de entorno en tu servidor
3. Asegúrate de que HTTPS esté habilitado

## Extensibilidad

### Agregar Facebook Login

Si quieres agregar Facebook, necesitas:

1. Instalar: `npm install react-facebook-login`
2. Crear `FacebookLoginButton.tsx` similar a `GoogleLoginButton`
3. Agregar `NEXT_PUBLIC_FACEBOOK_APP_ID` en las variables de entorno
4. Usar la función `loginWithFacebook` que ya está implementada en `auth.ts`

## Troubleshooting

### Error: "Google Client ID is not set"

- Verifica que `NEXT_PUBLIC_GOOGLE_CLIENT_ID` esté en `.env.local`
- Reinicia el servidor de desarrollo después de agregar la variable

### Error: "Invalid token"

- Verifica que el Client ID en el frontend coincida con el del backend
- Verifica que el backend tenga configurado `GOOGLE_CLIENT_ID`
- Verifica que las URLs autorizadas en Google Cloud Console sean correctas

### El botón no aparece

- Verifica que `GoogleOAuthWrapper` esté en el layout
- Abre la consola del navegador para ver errores
- Verifica que la librería `@react-oauth/google` esté instalada

## Referencias

- [Google OAuth Documentation](https://developers.google.com/identity/gsi/web)
- [@react-oauth/google](https://github.com/MomenSherif/react-oauth)
- [Backend OAuth Implementation](../jombo-api/OAUTH_AUTHENTICATION.md)
