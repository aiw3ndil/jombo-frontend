# Sistema de Reviews - Frontend

## Descripción

Sistema de reseñas implementado en el frontend que permite a los pasajeros calificar al conductor después de que el viaje haya sido completado.

## Archivos Creados

### 1. `app/lib/api/reviews.ts`
API client para interactuar con el sistema de reviews del backend.

**Funciones:**
- `createReview(bookingId, data)` - Crear una nueva reseña
- `getBookingReviews(bookingId)` - Obtener reseñas de una reserva
- `getUserReviews(userId)` - Obtener reseñas de un usuario

### 2. `app/components/ReviewModal.tsx`
Modal reutilizable para crear reseñas con sistema de estrellas interactivo.

**Características:**
- Rating de 1 a 5 estrellas con hover effect
- Comentario opcional (máximo 500 caracteres)
- Validación de campos
- Estados de carga
- Manejo de errores
- Diseño responsive

### 3. Actualizaciones en `app/[lang]/my-bookings/page.tsx`
Integración del sistema de reviews en la página de reservas.

**Funcionalidades añadidas:**
- Botón "Calificar" para reservas completadas
- Indicador "Calificado" para reservas ya revieweadas
- Verificación automática del estado de reviews
- Modal de creación de reviews

## Reglas de Negocio

### ¿Cuándo se puede crear una review?

✅ **SE PUEDE calificar cuando:**
- La reserva tiene status `confirmed`
- La fecha/hora de salida (`departure_time`) ya pasó
- El usuario aún no ha creado una reseña para esa reserva

❌ **NO SE PUEDE calificar cuando:**
- La reserva está `pending`, `rejected` o `cancelled`
- El viaje aún no ha ocurrido (fecha futura)
- El usuario ya creó una reseña para esa reserva

## Flujo de Uso

1. **Usuario hace una reserva** → Status: `pending`
2. **Conductor confirma** → Status: `confirmed`
3. **Viaje ocurre** → `departure_time` pasa
4. **Usuario ve botón "Calificar"** en "Mis Reservas"
5. **Usuario crea review:**
   - Selecciona estrellas (1-5)
   - Escribe comentario (opcional)
   - Envía reseña
6. **Sistema marca como "Calificado"** ✓

## Interfaz de Usuario

### Página "Mis Reservas"

Cada reserva confirmada que ya ocurrió muestra:

```
┌─────────────────────────────────────────────────────────┐
│ Madrid → Barcelona                    ● Confirmada      │
│ Conductor: Juan Pérez                                   │
│                                                          │
│ Salida: 01/12/2025 10:00  │  Asientos: 2              │
│ Precio: €30.00            │  Fecha reserva: 25/11     │
│                                                          │
│                           [⭐ Calificar] [Cancelar]     │
└─────────────────────────────────────────────────────────┘
```

Si ya fue calificado:

```
│                           [✓ Calificado] [Cancelar]    │
```

### Modal de Review

```
┌─────────────────────────────────────┐
│  Calificar viaje               × │
├─────────────────────────────────────┤
│  Conductor: Juan Pérez              │
│  Ruta: Madrid → Barcelona           │
│                                     │
│  ¿Cómo fue tu experiencia?          │
│                                     │
│      ⭐ ⭐ ⭐ ⭐ ⭐               │
│         (Excelente)                 │
│                                     │
│  Comentario (opcional)              │
│  ┌─────────────────────────────┐   │
│  │ Muy buen viaje, conductor   │   │
│  │ puntual y amable...         │   │
│  └─────────────────────────────┘   │
│  150/500 caracteres                 │
│                                     │
│  [Cancelar]  [Enviar reseña]       │
└─────────────────────────────────────┘
```

## Código de Ejemplo

### Crear una review

```typescript
import { createReview } from '@/app/lib/api/reviews';

const handleCreateReview = async () => {
  try {
    const review = await createReview(bookingId, {
      rating: 5,
      comment: "Excelente conductor, muy puntual"
    });
    console.log('Review created:', review);
  } catch (error) {
    console.error('Error:', error.message);
  }
};
```

### Verificar si se puede crear review

```typescript
const canReview = (booking: Booking): boolean => {
  // Solo confirmadas
  if (booking.status !== "confirmed") return false;
  
  // Viaje debe haber ocurrido
  if (!booking.trip?.departure_time) return false;
  const departureTime = new Date(booking.trip.departure_time);
  const now = new Date();
  if (departureTime > now) return false;
  
  // Usuario no debe haber revieweado ya
  if (bookingReviews[booking.id]) return false;
  
  return true;
};
```

## API Endpoints Usados

### POST /api/v1/bookings/:booking_id/reviews
Crear una reseña para una reserva.

**Request:**
```json
{
  "review": {
    "rating": 5,
    "comment": "Excelente conductor"
  }
}
```

**Response (201):**
```json
{
  "id": 1,
  "booking_id": 123,
  "reviewer_id": 1,
  "reviewee_id": 2,
  "rating": 5,
  "comment": "Excelente conductor",
  "created_at": "2025-12-06T18:30:00Z",
  "reviewer": {
    "id": 1,
    "name": "María García"
  },
  "reviewee": {
    "id": 2,
    "name": "Juan Pérez"
  }
}
```

### GET /api/v1/bookings/:booking_id/reviews
Obtener todas las reseñas de una reserva.

### GET /api/v1/users/:user_id/reviews
Obtener todas las reseñas recibidas por un usuario.

## Traducciones

Las traducciones están en `public/locales/{lang}/common.json` bajo `page.myBookings`:

```json
{
  "review": "Calificar",
  "reviewed": "Calificado",
  "reviewModal": {
    "title": "Calificar viaje",
    "driver": "Conductor",
    "route": "Ruta",
    "ratingLabel": "¿Cómo fue tu experiencia?",
    "rating1": "Muy malo",
    "rating2": "Malo",
    "rating3": "Regular",
    "rating4": "Bueno",
    "rating5": "Excelente",
    "commentLabel": "Comentario (opcional)",
    "commentPlaceholder": "Cuéntanos más sobre tu experiencia...",
    "submit": "Enviar reseña",
    "success": "¡Reseña creada exitosamente!",
    "error": "Error al crear la reseña"
  }
}
```

Idiomas soportados: **Español (es)**, **Inglés (en)**, **Finlandés (fi)**

## Manejo de Errores

El sistema maneja los siguientes errores:

- **422 Unprocessable Entity** - El viaje aún no ha ocurrido
- **403 Forbidden** - No participaste en este booking
- **404 Not Found** - Booking no encontrado
- **400 Bad Request** - El usuario ya creó una review para este booking

Todos los errores se muestran en el modal con un mensaje amigable.

## Testing

### En desarrollo:

1. Crea una reserva
2. El conductor la confirma
3. Modifica la fecha del viaje en la base de datos para que sea pasada
4. Recarga "Mis Reservas"
5. Deberías ver el botón "Calificar"
6. Click → Modal se abre
7. Selecciona estrellas y escribe comentario
8. Enviar → Review creada
9. El botón cambia a "✓ Calificado"

### SQL para testing:

```sql
-- Cambiar fecha de un viaje a ayer
UPDATE trips 
SET departure_time = NOW() - INTERVAL '1 day' 
WHERE id = 123;
```

## Próximas Mejoras Sugeridas

- [ ] Mostrar reviews recibidas en el perfil del usuario
- [ ] Mostrar rating promedio del conductor en los resultados de búsqueda
- [ ] Permitir al conductor también reviewear al pasajero
- [ ] Sistema de reportes para reviews inapropiadas
- [ ] Filtrar trips por rating mínimo
- [ ] Ordenar por mejor rating

## Notas Técnicas

- Las reviews se cargan automáticamente al entrar en "Mis Reservas"
- Se usa `Promise.all` para cargar reviews de múltiples bookings en paralelo
- El estado de reviews se guarda en un objeto `{ bookingId: hasReview }`
- El modal es un componente reutilizable que puede usarse en otros lugares
- La validación del rating es en tiempo real con feedback visual

## Build Status

✅ Build exitoso
✅ TypeScript sin errores
✅ Todos los componentes funcionan correctamente
