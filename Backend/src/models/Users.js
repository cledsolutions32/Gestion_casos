import supabase from '../config/db.js';

class Users {
    /**
     * Obtiene todos los usuarios.
     * @returns {Promise<Array>} - Array de usuarios.
     */
    static async getAllUsers() {
        const { data, error } = await supabase.from('users').select('*');
        if (error) throw error;
        return data;
    }
    /**
     * Invita a un usuario por correo. Supabase envía un email con un enlace
     * para que el usuario cree su contraseña y acceda a la plataforma.
     * El trigger handle_new_user crea automáticamente el perfil en public.users
     * con los datos de raw_user_meta_data (nombre, rol).
     */
    static async inviteUser(email, nombre, rol) {
        const frontendUrl = (process.env.FRONTEND_URL || 'http://localhost:5173').replace(/\/$/, '');
        const redirectTo = `${frontendUrl}/reset-password`;

        const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, {
            data: { nombre, rol },
            redirectTo,
        });

        if (error) throw error;
        return data;
    }

    /**
     * Actualiza un usuario existente (nombre, email, rol).
     * No envía correo, solo actualiza datos en auth y public.users.
     */
    static async updateUser(id, { email, nombre, rol }) {
        const validRoles = ['usuario', 'admin'];
        const userRol = validRoles.includes(rol) ? rol : 'usuario';

        // Actualizar auth.users (email y metadata)
        const { error: authError } = await supabase.auth.admin.updateUserById(id, {
            email: email?.trim(),
            user_metadata: { nombre: nombre?.trim(), rol: userRol },
        });
        if (authError) throw authError;

        // Actualizar public.users
        const { error: dbError } = await supabase
            .from('users')
            .update({
                email: email?.trim(),
                nombre: nombre?.trim() || null,
                rol: userRol,
            })
            .eq('id', id);

        if (dbError) throw dbError;
        return { success: true };
    }

    /**
     * Elimina un usuario de auth (CASCADE elimina de public.users).
     */
    static async deleteUser(id) {
        const { error } = await supabase.auth.admin.deleteUser(id);
        if (error) throw error;
        return { success: true };
    }
}

export default Users;