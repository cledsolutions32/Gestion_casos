# Configuración de Usuarios en Supabase

Este documento explica cómo configurar y usar la base de datos de usuarios en Supabase.

## Pasos de Configuración

### 1. Ejecutar la Migración SQL

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **SQL Editor**
3. Copia y pega el contenido del archivo `supabase_migration.sql`
4. Ejecuta el script

Este script creará:
- La tabla `users` con los campos: `id`, `email`, `nombre`, `rol`
- Políticas de seguridad (RLS) para proteger los datos
- Triggers para crear automáticamente perfiles cuando se registra un usuario
- Funciones para actualizar automáticamente el campo `updated_at`

### 2. Configurar Variables de Entorno

Edita el archivo `.env` en el backend y agrega tus credenciales de Supabase:

```env
SUPABASE_URL=https://tu-proyecto.supabase.co
SUPABASE_SERVICE_ROLE_KEY=tu_service_role_key_aqui
FRONTEND_URL=https://tu-dominio.com
```

**Importante:** El `SERVICE_ROLE_KEY` es una clave administrativa que bypass las políticas RLS.
`FRONTEND_URL` se usa para el enlace de invitación por correo (por defecto: `http://localhost:5173`). 
Nunca la expongas en el frontend. Solo úsala en el backend.

### 3. Obtener las Credenciales

1. Ve a tu proyecto en Supabase Dashboard
2. Navega a **Settings** > **API**
3. Copia:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (secret) → `SUPABASE_SERVICE_ROLE_KEY`

## Uso de las Funciones

### Ejemplo en una ruta de Express

```javascript
import express from 'express';
import { 
  createOrUpdateUser, 
  getUserByUid, 
  getAllUsers,
  updateUserRole 
} from './config/users.js';

const router = express.Router();

// Crear o actualizar usuario
router.post('/users', async (req, res) => {
  const { uid, email, nombre, rol } = req.body;
  const result = await createOrUpdateUser(uid, email, nombre, rol);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(400).json({ error: result.error });
  }
});

// Obtener usuario por UID
router.get('/users/:uid', async (req, res) => {
  const { uid } = req.params;
  const result = await getUserByUid(uid);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(404).json({ error: result.error });
  }
});

// Obtener todos los usuarios
router.get('/users', async (req, res) => {
  const result = await getAllUsers();
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: result.error });
  }
});

// Actualizar rol de usuario
router.patch('/users/:uid/role', async (req, res) => {
  const { uid } = req.params;
  const { rol } = req.body;
  const result = await updateUserRole(uid, rol);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(400).json({ error: result.error });
  }
});

export default router;
```

## Funciones Disponibles

- `createOrUpdateUser(uid, email, nombre, rol)` - Crea o actualiza un usuario
- `getUserByUid(uid)` - Obtiene un usuario por su UID
- `getAllUsers()` - Obtiene todos los usuarios
- `updateUserRole(uid, rol)` - Actualiza el rol de un usuario
- `updateUserName(uid, nombre)` - Actualiza el nombre de un usuario
- `deleteUser(uid)` - Elimina un usuario
- `getUsersByRole(rol)` - Obtiene usuarios filtrados por rol

## Roles Sugeridos

Puedes usar cualquier valor para los roles, pero algunos comunes son:
- `usuario` - Usuario estándar (default)
- `admin` - Administrador
- `moderador` - Moderador
- `editor` - Editor

## Invitar usuarios por correo

Al crear un usuario desde el formulario "Crear usuario", el backend envía una invitación por correo usando `inviteUserByEmail` de Supabase. El usuario recibe un enlace para crear su contraseña y acceder a la plataforma.

**Requisitos en Supabase Dashboard:**
1. **Authentication** → **URL Configuration**: Añade tu `FRONTEND_URL` (ej. `https://tu-app.com`) a **Redirect URLs**.
2. **Authentication** → **Email Templates**: Puedes personalizar la plantilla "Invite user" para el correo de invitación.

## Seguridad

Las políticas RLS configuradas permiten:
- Los usuarios pueden ver y actualizar su propio perfil
- Solo los administradores pueden ver todos los usuarios
- Solo los administradores pueden cambiar roles
- Solo los administradores pueden crear nuevos usuarios manualmente

El trigger automático crea un perfil cuando se registra un usuario en `auth.users`, 
pero puedes crear perfiles manualmente usando las funciones del backend.
