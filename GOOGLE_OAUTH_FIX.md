# Fix Google OAuth Popup Issue

## Problema Original
El popup de Google se cerraba sin completar la autenticación.

## Causa
Estabas usando `useGoogleLogin` que abre un popup y devuelve un `access_token`, pero este flujo es menos estable y requiere llamadas adicionales a la API de Google.

## Solución Implementada
Cambio a usar el componente `GoogleLogin` que usa el flujo estándar con **ID Token (JWT credential)**:

### Cambios en Frontend

#### 1. `app/components/GoogleLoginButton.tsx`
- ❌ Antes: `useGoogleLogin` con popup → `access_token` → llamada a userinfo API
- ✅ Ahora: `GoogleLogin` component → `credential` (ID token JWT)

**Ventajas:**
- Más estable (no usa popup)
- Flujo recomendado por Google
- El credential ya contiene toda la info del usuario
- Menos llamadas HTTP

#### 2. `app/lib/api/auth.ts`
- Cambio parámetro: `token` → `credential`
- El backend ahora recibe: `{ credential: "eyJhbGc..." }`

### Cambios Necesarios en Backend

El backend **DEBE** ser actualizado para aceptar el nuevo formato:

```ruby
# app/controllers/api/v1/auth_controller.rb (o similar)

def google
  credential = params[:credential] # Antes era params[:token]
  
  # Validar el ID token con Google
  require 'google-id-token'
  
  validator = GoogleIDToken::Validator.new
  begin
    payload = validator.check(credential, ENV['GOOGLE_CLIENT_ID'])
    
    # payload contiene:
    # {
    #   "sub": "google_user_id",
    #   "email": "user@gmail.com",
    #   "name": "User Name",
    #   "picture": "https://...",
    #   "email_verified": true
    # }
    
    email = payload['email']
    google_id = payload['sub']
    name = payload['name']
    
    # Buscar o crear usuario
    user = User.find_or_create_by(email: email) do |u|
      u.name = name
      u.google_id = google_id
      u.password = SecureRandom.hex(32) # Password aleatorio
    end
    
    # Generar JWT
    token = generate_jwt(user)
    
    # Configurar cookie
    cookies[:jwt] = {
      value: token,
      httponly: true,
      secure: Rails.env.production?,
      same_site: :none,
      expires: 2.hours.from_now
    }
    
    render json: { user: user }, status: :ok
    
  rescue GoogleIDToken::ValidationError => e
    render json: { error: 'Invalid Google token' }, status: :unauthorized
  end
end
```

### Alternativa: Mantener compatibilidad con ambos flujos

Si quieres mantener compatibilidad con el flujo anterior:

```ruby
def google
  # Intentar con credential (nuevo flujo)
  if params[:credential].present?
    validate_google_id_token(params[:credential])
  # Fallback a token (flujo viejo)
  elsif params[:token].present?
    validate_google_access_token(params[:token])
  else
    render json: { error: 'Missing credential or token' }, status: :bad_request
  end
end

private

def validate_google_id_token(credential)
  validator = GoogleIDToken::Validator.new
  payload = validator.check(credential, ENV['GOOGLE_CLIENT_ID'])
  # ... crear/buscar usuario
end

def validate_google_access_token(access_token)
  # Llamar a userinfo API de Google
  response = HTTParty.get(
    "https://www.googleapis.com/oauth2/v3/userinfo",
    headers: { 'Authorization' => "Bearer #{access_token}" }
  )
  # ... crear/buscar usuario
end
```

### Instalación de Dependencias en Backend

```bash
# Gemfile
gem 'google-id-token'

# Instalar
bundle install
```

## Cómo Verificar que Funciona

### 1. Variables de Entorno
```bash
# Frontend (.env.local)
NEXT_PUBLIC_GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
NEXT_PUBLIC_API_BASE_URL=https://api.jombo.fi

# Backend (.env)
GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
```

**IMPORTANTE:** El mismo Client ID en ambos.

### 2. Consola del Navegador
Deberías ver:
```
🔵 [GoogleLogin] Credential received from Google { hasCredential: true, ... }
🔵 [GoogleLogin] Sending credential to backend...
🔵 API Request: { url: 'https://api.jombo.fi/api/v1/auth/google', body: { credential: '...' } }
🔵 API Response status: 200
🔵 [GoogleLogin] Backend login successful: { email: '...', name: '...' }
🔵 [GoogleLogin] Redirecting to: /
```

### 3. Si hay errores

**Error en consola:**
```
❌ [GoogleLogin] Error during login: Invalid Google token
```
→ El backend no puede validar el credential. Verifica que `GOOGLE_CLIENT_ID` sea correcto.

**Error 400 Bad Request:**
```
Missing credential or token
```
→ El backend no está recibiendo el parámetro `credential`. Verifica CORS y la ruta.

**Error de CORS:**
```
Access to fetch at '...' has been blocked by CORS policy
```
→ Configura CORS en el backend (ver `OAUTH_PRODUCTION_TROUBLESHOOTING.md`)

## Ventajas del Nuevo Flujo

1. ✅ **Más estable**: No depende de popups
2. ✅ **Más rápido**: Una sola llamada HTTP (frontend → backend)
3. ✅ **Más seguro**: El ID token es validado por el backend
4. ✅ **Recomendado por Google**: Es el flujo oficial
5. ✅ **Mejor UX**: El usuario ve el diálogo de Google integrado

## Configuración de Google Cloud Console

No cambia nada, solo verifica:

1. **Authorized JavaScript origins:**
   ```
   http://localhost:3001
   https://www.jombo.fi
   https://jombo.fi
   ```

2. **NO necesitas Authorized redirect URIs** para este flujo

## Testing

```bash
# 1. Levantar frontend
npm run dev

# 2. Verificar que el botón se muestra
# 3. Click en "Continuar con Google"
# 4. Seleccionar cuenta
# 5. Ver logs en consola del navegador
```

## Rollback (si necesitas volver al flujo anterior)

```bash
git checkout HEAD -- app/components/GoogleLoginButton.tsx
git checkout HEAD -- app/lib/api/auth.ts
```

## Siguiente Paso

Actualiza el backend para recibir `credential` en lugar de `token`.
