# Troubleshooting OAuth en Producción

## Problema: El popup de Google se cierra sin hacer login

### Síntomas:
1. Click en "Continuar con Google"
2. Se abre popup de Google
3. Selecciono cuenta y doy "Continuar"
4. El popup se cierra
5. No pasa nada, no hay login ni error visible

### Posibles Causas y Soluciones:

## 1. CORS (Cross-Origin Resource Sharing)

### Verificar:
Abre la consola del navegador (F12) y busca errores como:
```
Access to fetch at 'https://api.jombo.es/api/v1/auth/google' from origin 'https://www.jombo.es' has been blocked by CORS policy
```

### Solución - Backend:
En `jombo-api/config/initializers/cors.rb`:

```ruby
Rails.application.config.middleware.insert_before 0, Rack::Cors do
  allow do
    origins 'https://www.jombo.es', 'https://jombo.es', 'http://localhost:3001'
    
    resource '*',
      headers: :any,
      methods: [:get, :post, :put, :patch, :delete, :options, :head],
      credentials: true,
      expose: ['Authorization', 'access-token', 'client', 'uid', 'token-type', 'expiry']
  end
end
```

**IMPORTANTE:** `credentials: true` es necesario para cookies.

## 2. Variables de Entorno No Configuradas

### Verificar Frontend:
```bash
# En producción, verifica que esté configurado:
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=https://api.jombo.es
```

### Verificar Backend:
```bash
# En producción, verifica que esté configurado:
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

### Cómo verificar en producción:
1. Abre la consola del navegador
2. Ejecuta:
```javascript
console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID);
```

Si devuelve `undefined`, la variable no está configurada.

## 3. Google Cloud Console - Dominios No Autorizados

### Verificar:
En [Google Cloud Console](https://console.cloud.google.com/):

1. Ve a "APIs & Services" → "Credentials"
2. Click en tu OAuth 2.0 Client ID
3. Verifica que AMBOS dominios estén en **Authorized JavaScript origins**:
   ```
   https://jombo.es
   https://www.jombo.es
   ```

4. Y también en **Authorized redirect URIs**:
   ```
   https://jombo.es
   https://www.jombo.es
   ```

**NOTA:** Asegúrate de usar HTTPS, no HTTP.

## 4. Client ID Incorrecto

### El problema:
El Client ID del frontend NO coincide con el del backend.

### Solución:
Ambos deben tener el MISMO Client ID:

```bash
# Frontend (.env.local o variables de entorno)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com

# Backend (.env)
GOOGLE_CLIENT_ID=123456789-abc.apps.googleusercontent.com
```

## 5. Backend No Alcanzable

### Verificar:
Abre la consola del navegador y busca:
```
Failed to fetch
net::ERR_CONNECTION_REFUSED
```

### Solución:
1. Verifica que el backend esté corriendo
2. Verifica que `NEXT_PUBLIC_API_BASE_URL` apunte a la URL correcta
3. Prueba manualmente:
```bash
curl https://api.jombo.es/health
```

## 6. Cookies Bloqueadas (SameSite)

### El problema:
Las cookies httpOnly no se guardan debido a políticas SameSite.

### Solución - Backend:
En `jombo-api/app/controllers/api/v1/oauth_controller.rb`:

```ruby
cookie_opts = {
  value: jwt_token,
  httponly: true,
  secure: true,  # DEBE ser true en producción
  same_site: :none,  # Permite cookies cross-site
  expires: 2.hours.from_now,
  path: "/",
  domain: ".jombo.es"  # Permite compartir entre subdominios
}

response.set_cookie("jwt", cookie_opts)
```

**IMPORTANTE:** 
- `secure: true` requiere HTTPS
- `same_site: :none` requiere `secure: true`
- `domain: ".jombo.es"` permite cookies en jombo.es y www.jombo.es

## 7. Logs para Debugging

### Ver logs en la consola del navegador:

Con el nuevo código, deberías ver:
```
🔵 [GoogleLogin] Button clicked, opening OAuth popup...
🔵 [GoogleLogin] Token received from Google { hasAccessToken: true, ... }
🔵 [GoogleLogin] Fetching user info from Google...
🔵 [GoogleLogin] User info received: { email: ..., name: ... }
🔵 [GoogleLogin] Sending token to backend...
🔵 API Request: { url: ..., body: { token: ... } }
🔵 API Response status: 200
🔵 [GoogleLogin] Backend login successful: { ... }
🔵 [GoogleLogin] Redirecting to: /es
```

Si ves un error, busca:
```
❌ [GoogleLogin] Error during login: ...
❌ [GoogleLogin] Error details: { message: ..., stack: ... }
```

### Ver logs del backend:

```bash
# En el servidor de producción
tail -f log/production.log

# Busca:
OAuth verification error: ...
Google token aud mismatch
Invalid token
```

## 8. Firewall o Proxy

### El problema:
Un firewall o proxy está bloqueando las peticiones.

### Solución:
1. Verifica que el firewall permita tráfico a `https://www.googleapis.com`
2. Verifica que el firewall permita tráfico entre frontend y backend
3. Si usas Cloudflare u otro proxy, verifica que no esté bloqueando cookies

## 9. Cache de Navegador

### Solución:
1. Limpia el cache del navegador
2. Limpia las cookies de Google y tu sitio
3. Prueba en modo incógnito
4. Prueba en otro navegador

## 10. Verificación Paso a Paso

### En la consola del navegador (F12):

```javascript
// 1. Verificar que el Client ID está configurado
console.log('Frontend Client ID:', document.querySelector('[data-client-id]'));

// 2. Verificar que el GoogleOAuthProvider está montado
console.log('OAuth Context:', window.google);

// 3. Verificar la URL del backend
fetch('https://api.jombo.es/health')
  .then(r => r.json())
  .then(d => console.log('Backend health:', d))
  .catch(e => console.error('Backend error:', e));

// 4. Verificar CORS manualmente
fetch('https://api.jombo.es/api/v1/me', { credentials: 'include' })
  .then(r => console.log('CORS OK:', r.status))
  .catch(e => console.error('CORS Error:', e));
```

## Quick Checklist

Antes de deployar a producción, verifica:

- [ ] `NEXT_PUBLIC_GOOGLE_CLIENT_ID` configurado en frontend
- [ ] `GOOGLE_CLIENT_ID` configurado en backend (mismo valor)
- [ ] `NEXT_PUBLIC_API_BASE_URL` apunta al backend correcto
- [ ] Dominios agregados en Google Cloud Console (https://...)
- [ ] CORS configurado en el backend con `credentials: true`
- [ ] Cookies con `secure: true` y `same_site: :none` en producción
- [ ] Backend corriendo y accesible desde el frontend
- [ ] HTTPS habilitado (requerido para OAuth)
- [ ] Logs activados en frontend y backend

## Comando de Debug Rápido

Pega esto en la consola del navegador para un diagnóstico completo:

```javascript
console.log('=== OAUTH DEBUG ===');
console.log('Client ID:', process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || 'NOT SET');
console.log('API URL:', process.env.NEXT_PUBLIC_API_BASE_URL || 'NOT SET');
console.log('Current URL:', window.location.href);
console.log('Protocol:', window.location.protocol);
console.log('=================');

// Test backend connection
fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/health`, { credentials: 'include' })
  .then(r => r.json())
  .then(d => console.log('✅ Backend reachable:', d))
  .catch(e => console.error('❌ Backend error:', e));
```

## Contacto

Si después de seguir todos estos pasos el problema persiste:

1. Revisa los logs del frontend en la consola del navegador
2. Revisa los logs del backend en `log/production.log`
3. Verifica que las variables de entorno estén configuradas correctamente
4. Prueba primero en local para descartar problemas de configuración de Google
