const fs = require('fs');
const path = require('path');

// Buscar y modificar archivos CSS en dist
const distPath = path.join(__dirname, 'dist', 'epicstoria', 'browser');

fs.readdir(distPath, (err, files) => {
  if (err) {
    console.error('Error leyendo directorio dist:', err);
    return;
  }

  files.forEach((file) => {
    if (file.endsWith('.css')) {
      const filePath = path.join(distPath, file);
      let content = fs.readFileSync(filePath, 'utf8');

      // Reemplazar la ruta absoluta con la ruta que incluye base-href
      content = content.replace(/url\(["']?\/images\//g, 'url(/epicstoria/images/');
      content = content.replace(/url\(["']?\/fondo_home\.jpg/g, 'url(/epicstoria/fondo_home.jpg');

      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`✅ CSS actualizado: ${file}`);
    }
  });
});
