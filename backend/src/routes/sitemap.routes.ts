import { Request, Response, Router } from 'express';
import pool from '../config/database';

const router = Router();

router.get('/sitemap.xml', async (req: Request, res: Response) => {
  try {
    // Obtener todos los eventos con su slug y fecha de actualización
    const result = await pool.query(
      'SELECT id, slug, updated_at FROM events ORDER BY updated_at DESC',
    );

    const baseUrl = process.env.FRONTEND_URL || 'https://epicstoria.es';

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">

  <!-- Página principal -->
  <url>
    <loc>${baseUrl}/</loc>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>

  <!-- Páginas estáticas -->
  <url>
    <loc>${baseUrl}/eventos</loc>
    <changefreq>daily</changefreq>
    <priority>0.9</priority>
  </url>

  <url>
    <loc>${baseUrl}/buscar</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${baseUrl}/juegos</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>

  <url>
    <loc>${baseUrl}/galeria</loc>
    <changefreq>weekly</changefreq>
    <priority>0.7</priority>
  </url>

  <url>
    <loc>${baseUrl}/acerca</loc>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>

  <url>
    <loc>${baseUrl}/privacidad</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>

  <url>
    <loc>${baseUrl}/terminos</loc>
    <changefreq>yearly</changefreq>
    <priority>0.3</priority>
  </url>`;

    // Agregar eventos dinámicamente
    result.rows.forEach((event: { id: string; slug: string; updated_at: Date }) => {
      const lastmod = new Date(event.updated_at).toISOString().split('T')[0];
      // Usar slug si existe, sino usar id (compatibilidad)
      const urlPath = event.slug || event.id;
      xml += `

  <!-- Evento: ${event.id} -->
  <url>
    <loc>${baseUrl}/evento/${urlPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>`;
    });

    xml += '\n  \n</urlset>';

    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Error generating sitemap:', error);
    res.status(500).send('Error generating sitemap');
  }
});

export default router;
