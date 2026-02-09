import { Router } from 'express';
import { AuthRequest, authMiddleware } from '../middleware/auth.middleware';
import { ChatService } from '../services/chat.service';

const router = Router();

/**
 * Obtener número de mensajes no leídos (debe ir antes de /:userId para evitar conflictos)
 */
router.get('/unread', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const count = await ChatService.getUnreadCount(userId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtener número de mensajes no leídos agrupados por usuario
 */
router.get('/unread-by-user', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const unreadByUser = await ChatService.getUnreadCountByUser(userId);

    res.json({
      success: true,
      data: unreadByUser,
    });
  } catch (error: any) {
    console.error('Error getting unread count by user:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Obtener mensajes con un usuario específico
 */
router.get('/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user!.userId;
    const otherUserId = parseInt(req.params.userId);

    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const messages = await ChatService.getMessages(currentUserId, otherUserId);

    // Marcar mensajes como leídos
    await ChatService.markAsRead(otherUserId, currentUserId);

    res.json({
      success: true,
      data: messages,
    });
  } catch (error: any) {
    console.error('Error getting messages:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Enviar un mensaje
 */
router.post('/send', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const senderId = req.user!.userId;
    const { receiver_id, message } = req.body;

    if (!receiver_id || !message) {
      return res.status(400).json({ error: 'Receiver ID and message are required' });
    }

    if (typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({ error: 'Message cannot be empty' });
    }

    const newMessage = await ChatService.sendMessage(senderId, receiver_id, message.trim());

    res.json({
      success: true,
      data: newMessage,
    });
  } catch (error: any) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Marcar mensajes como leídos
 */
router.put('/read/:userId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const currentUserId = req.user!.userId;
    const otherUserId = parseInt(req.params.userId);

    if (isNaN(otherUserId)) {
      return res.status(400).json({ error: 'Invalid user ID' });
    }

    const count = await ChatService.markAsRead(otherUserId, currentUserId);

    res.json({
      success: true,
      data: { count },
    });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * Eliminar un mensaje
 */
router.delete('/:messageId', authMiddleware, async (req: AuthRequest, res) => {
  try {
    const userId = req.user!.userId;
    const messageId = parseInt(req.params.messageId);

    if (isNaN(messageId)) {
      return res.status(400).json({ error: 'Invalid message ID' });
    }

    await ChatService.deleteMessage(messageId, userId);

    res.json({
      success: true,
      message: 'Message deleted successfully',
    });
  } catch (error: any) {
    console.error('Error deleting message:', error);
    res.status(400).json({ error: error.message });
  }
});

export default router;
