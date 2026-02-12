import express from 'express';
import { requireAdmin } from '../middleware/auth.middleware.js';
import Users from '../models/Users.js';

const router = express.Router();

// Get all users (cualquier usuario autenticado)
router.get('/', async (req, res) => {
    try {
        const users = await Users.getAllUsers();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Invitar usuario (solo admin)
router.post('/', requireAdmin, async (req, res) => {
    try {
        const { email, nombre, rol } = req.body;

        if (!email || !nombre?.trim()) {
            return res.status(400).json({
                message: 'Email y nombre son obligatorios',
            });
        }

        const validRoles = ['usuario', 'admin'];
        const userRol = validRoles.includes(rol) ? rol : 'usuario';

        const data = await Users.inviteUser(email.trim(), nombre.trim(), userRol);
        res.status(201).json({
            message: 'Invitación enviada. El usuario recibirá un correo para crear su contraseña.',
            user: data?.user,
        });
    } catch (error) {
        const msg = error?.message || 'Error al invitar usuario';
        const status = msg.includes('already been registered') || msg.includes('already exists') ? 409 : 500;
        res.status(status).json({ message: msg });
    }
});

// Actualizar usuario (solo admin)
router.patch('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { email, nombre, rol } = req.body;

        if (!id) {
            return res.status(400).json({ message: 'ID de usuario es obligatorio' });
        }
        if (!email || !nombre?.trim()) {
            return res.status(400).json({
                message: 'Email y nombre son obligatorios',
            });
        }

        await Users.updateUser(id, { email: email.trim(), nombre: nombre.trim(), rol });
        res.status(200).json({
            message: 'Usuario actualizado correctamente',
        });
    } catch (error) {
        const msg = error?.message || 'Error al actualizar usuario';
        const status = msg.includes('already been registered') || msg.includes('already exists') ? 409 : 500;
        res.status(status).json({ message: msg });
    }
});

// Eliminar usuario (solo admin)
router.delete('/:id', requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: 'ID de usuario es obligatorio' });
        }

        await Users.deleteUser(id);
        res.status(200).json({
            message: 'Usuario eliminado correctamente',
        });
    } catch (error) {
        res.status(500).json({
            message: error?.message || 'Error al eliminar usuario',
        });
    }
});

export default router;