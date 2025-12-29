import { NextFunction, Response, Router } from 'express';
import { authMiddleware, AuthRequest } from '../middleware/auth.middleware';
import { AuthService } from '../services/auth.service';

const router = Router();

// All routes require authentication
router.use(authMiddleware);

// GET /api/users/me
router.get('/me', async (req: AuthRequest, res: Response, next: NextFunction) => {
  try {
    const user = await AuthService.getProfile(req.userId!);

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
