import supabase from '../config/db.js';

/**
 * Middleware que verifica el JWT de Supabase y adjunta el usuario a req.user.
 * Responde 401 si no hay token o si el token es inválido/expirado.
 */
export async function requireAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.slice(7).trim()
    : null;

  if (!token) {
    return res.status(401).json({ message: 'Token de autorización requerido' });
  }

  try {
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res
        .status(401)
        .json({ message: 'Token inválido o expirado', error: error?.message });
    }

    const { data: profile } = await supabase
      .from('users')
      .select('rol')
      .eq('id', user.id)
      .maybeSingle();

    req.user = {
      id: user.id,
      email: user.email,
      rol: profile?.rol ?? 'usuario',
    };

    next();
  } catch (err) {
    console.error('Auth middleware error:', err);
    return res
      .status(501)
      .json({ message: 'Error al verificar la sesión', error: err?.message });
  }
}

/**
 * Middleware que exige que el usuario tenga rol 'admin'.
 * Debe usarse después de requireAuth.
 */
export function requireAdmin(req, res, next) {
  if (!req.user) {
    return res.status(401).json({ message: 'No autenticado' });
  }
  if (req.user.rol !== 'admin') {
    return res.status(403).json({ message: 'Acceso denegado. Se requiere rol administrador.' });
  }
  next();
}
