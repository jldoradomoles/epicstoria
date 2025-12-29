import { NextFunction, Request, Response, Router } from 'express';
import { EventService } from '../services/event.service';

const router = Router();

// GET /api/events
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const events = await EventService.getAllEvents();

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/categories
router.get('/categories', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const categories = await EventService.getCategories();

    res.json({
      success: true,
      data: categories,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/search
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { q } = req.query;

    if (!q || typeof q !== 'string') {
      return res.status(400).json({
        success: false,
        message: 'Search query is required',
      });
    }

    const events = await EventService.searchEvents(q);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/category/:category
router.get('/category/:category', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { category } = req.params;
    const events = await EventService.getEventsByCategory(category);

    res.json({
      success: true,
      data: events,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/events/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const event = await EventService.getEventById(id);

    res.json({
      success: true,
      data: event,
    });
  } catch (error) {
    next(error);
  }
});

export default router;
