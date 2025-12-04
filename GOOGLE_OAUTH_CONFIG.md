# Configuración de Google OAuth - Guía Paso a Paso

## Error: redirect_uri_mismatch

Este error significa que las URIs de redirección no están configuradas correctamente en Google Cloud Console.

## Solución: Configurar Google Cloud Console

### 1. Ir a Google Cloud Console

Visita: https://console.cloud.google.com/

### 2. Crear o Seleccionar Proyecto

1. Click en el selector de proyectos (arriba a la izquierda)
2. Click en "NEW PROJECT" o selecciona un proyecto existente
3. Dale un nombre (ej: "Jombo App")

### 3. Habilitar Google+ API

1. Ve a "APIs & Services" > "Library"
2. Busca "Google+ API"
3. Click en "ENABLE"

### 4. Crear Credenciales OAuth 2.0

1. Ve a "APIs & Services" > "Credentials"
2. Click en "+ CREATE CREDENTIALS"
3. Selecciona "OAuth client ID"
4. Si es la primera vez, configura la "OAuth consent screen":
   - User Type: **External**
   - App name: Jombo
   - User support email: tu email
   - Developer contact: tu email
   - Click "SAVE AND CONTINUE"
   - Scopes: Puedes dejarlo vacío o agregar:
     - `.../auth/userinfo.email`
     - `.../auth/userinfo.profile`
   - Test users: Agrega emails de prueba
   - Click "SAVE AND CONTINUE"

### 5. Configurar OAuth Client ID

1. Application type: **Web application**
2. Name: Jombo Frontend
3. **Authorized JavaScript origins:**
   ```
   http://localhost:3001
   https://tu-dominio.com
   https://www.tu-dominio.com
   ```

4. **Authorized redirect URIs:**
   ```
   http://localhost:3001
   https://tu-dominio.com
   https://www.tu-dominio.com
   ```

   **IMPORTANTE:** Por defecto, `useGoogleLogin` de `@react-oauth/google` 
   usa el mismo origen como redirect_uri. NO necesitas agregar rutas 
   específicas como `/callback` o `/auth/google/callback`.

5. Click en "CREATE"

### 6. Copiar Client ID

1. Se mostrará un popup con tu Client ID
2. Cópialo
3. Pégalo en tu `.env.local`:
   ```bash
   NEXT_PUBLIC_GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
   ```

### 7. Configurar Backend

En el backend (jombo-api), configura también:
```bash
GOOGLE_CLIENT_ID=tu_client_id_aqui.apps.googleusercontent.com
```

**NOTA:** Debe ser el MISMO Client ID en frontend y backend.

## Verificar Configuración

### Desarrollo Local

1. Asegúrate de que tu app corre en: `http://localhost:3001`
2. Si usas un puerto diferente, actualiza las URIs en Google Cloud Console
3. Reinicia el servidor después de cambiar `.env.local`

### Producción

1. Agrega tu dominio de producción a las URIs autorizadas
2. Usa HTTPS (obligatorio para OAuth)
3. Actualiza las variables de entorno en tu servidor

## Dominios Comunes a Configurar

```
Desarrollo:
http://localhost:3001

Staging:
https://staging.jombo.es

Producción:
https://jombo.es
https://www.jombo.es
```

## Flujo OAuth Simplificado

```
useGoogleLogin() por defecto usa:
- Flow: implicit
- Redirect URI: window.location.origin
- Scopes: profile, email
```

Esto significa que NO necesitas configurar un redirect_uri customizado.
El popup de Google maneja todo automáticamente.

## Troubleshooting

### Error: redirect_uri_mismatch

**Causa:** Las URIs en Google Cloud Console no coinciden con tu app.

**Solución:**
1. Verifica que `http://localhost:3001` esté en las URIs autorizadas
2. Verifica que NO haya espacios ni saltos de línea extra
3. La URI debe ser EXACTAMENTE igual (incluyendo http/https, puerto, etc.)
4. Reinicia el navegador después de cambiar la configuración

### Error: invalid_client

**Causa:** El Client ID no es correcto.

**Solución:**
1. Verifica que `NEXT_PUBLIC_GOOGLE_CLIENT_ID` esté correcto
2. Debe terminar en `.apps.googleusercontent.com`
3. Reinicia el servidor después de cambiar `.env.local`

### Error: access_denied

**Causa:** El usuario canceló o denegó el acceso.

**Solución:** Normal, el usuario decidió no continuar.

### El popup no se abre

**Causa:** Bloqueador de popups del navegador.

**Solución:** 
1. Permite popups para localhost en tu navegador
2. O haz click derecho en el botón → "Permitir popups"

## Testing

1. Limpia cookies y cache
2. Ve a `http://localhost:3001/es/login`
3. Click en "Continuar con Google"
4. Deberías ver el popup de selección de cuenta de Google
5. Selecciona tu cuenta
6. La primera vez pedirá permisos
7. Después redirige a tu app

## Scopes Solicitados

Por defecto se solicitan:
- `openid`: Identificación básica
- `profile`: Nombre, foto
- `email`: Correo electrónico

Si necesitas más scopes, modifica el componente GoogleLoginButton:
```typescript
const login = useGoogleLogin({
  scope: 'openid profile email additional_scope',
  // ...
});
```

## Seguridad

✅ Client ID es público (puede exponerse en frontend)  
❌ Client Secret NO debe estar en frontend (solo backend)  
✅ El token se verifica en el backend antes de crear sesión  
✅ OAuth 2.0 es el estándar de la industria  

## Referencias

- [Google OAuth Docs](https://developers.google.com/identity/protocols/oauth2)
- [Google Cloud Console](https://console.cloud.google.com/)
- [@react-oauth/google](https://github.com/MomenSherif/react-oauth)
