import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware';
import { FriendshipService } from '../services/friendship.service';

const router = Router();

/**
 * Añadir un amigo
 */
router.post('/add', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const { friendId } = req.body;

    if (!friendId) {
      return res.status(400).json({ error: 'Friend ID is required' });
    }

    await FriendshipService.addFriend(userId, friendId);

    res.json({
      success: true,
      message: 'Friend added successfully',
    });
  } catch (error: any) {
    console.error('Error adding friend:', error);
    res.status(400).json({ error: error.message });
  }
});

/**
 * Eliminar un amigo
 */
router.delete('/remove/:friendId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const friendId = parseInt(req.params.friendId);

    if (isNaN(friendId)) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

    await FriendshipService.removeFriend(userId, friendId);

    res.json({
      success: true,
      message: 'Friend removed successfully',
    });
  } catch (error: any) {
    console.error('Error removing friend:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtener lista de amigos
 */
router.get('/list', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const friends = await FriendshipService.getFriends(userId);

    res.json({
      success: true,
      data: friends,
    });
  } catch (error: any) {
    console.error('Error getting friends:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Verificar si son amigos
 */
router.get('/check/:friendId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const friendId = parseInt(req.params.friendId);

    if (isNaN(friendId)) {
      return res.status(400).json({ error: 'Invalid friend ID' });
    }

    const areFriends = await FriendshipService.areFriends(userId, friendId);

    res.json({
      success: true,
      data: { areFriends },
    });
  } catch (error: any) {
    console.error('Error checking friendship:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtener todos los usuarios (para mostrar fichas)
 */
router.get('/users', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const users = await FriendshipService.getAllUsers(userId);

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Buscar usuarios por nombre o email
 */
router.get('/search', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const searchTerm = req.query.q as string;

    if (!searchTerm || searchTerm.trim().length < 2) {
      return res.json({
        success: true,
        data: [],
      });
    }

    const users = await FriendshipService.searchUsers(userId, searchTerm.trim());

    res.json({
      success: true,
      data: users,
    });
  } catch (error: any) {
    console.error('Error searching users:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
