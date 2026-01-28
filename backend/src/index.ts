import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import path from 'path';
import { errorHandler } from './middleware/error.middleware';
import authRoutes from './routes/auth.routes';
import chatRoutes from './routes/chat.routes';
import eventRoutes from './routes/event.routes';
import friendshipRoutes from './routes/friendship.routes';
import pointsRoutes from './routes/points.routes';
import sitemapRoutes from './routes/sitemap.routes';
import userRoutes from './routes/user.routes';
import { scheduleMessageCleanup } from './services/message-cleanup.scheduler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(
  cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:4200',
    credentials: true,
  }),
);
app.use(express.json());

// Servir archivos estáticos (imágenes subidas)
app.use('/images', express.static(path.join(__dirname, '../../public/images')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/users', userRoutes);
app.use('/api/points', pointsRoutes);
app.use('/api/friends', friendshipRoutes);
app.use('/api/chat', chatRoutes);

// Sitemap (sin prefijo /api para que sea accesible en /sitemap.xml)
app.use('/', sitemapRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Error handler
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/api`);

  // Iniciar tarea programada de limpieza de mensajes
  scheduleMessageCleanup();
});

export default app;
