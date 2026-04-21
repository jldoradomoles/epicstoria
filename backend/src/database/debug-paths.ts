import * as fs from 'fs';
import * as path from 'path';

console.log('\n=== Debug de rutas del backend ===\n');
console.log('__dirname:', __dirname);
console.log('process.cwd():', process.cwd());

const relativePaths = ['../../../public', '../../public', '../public', './public'];

console.log('\n=== Verificando rutas posibles para el directorio public ===\n');

for (const relPath of relativePaths) {
  const fullPath = path.join(__dirname, relPath);
  const exists = fs.existsSync(fullPath);

  console.log(`${exists ? '✅' : '❌'} ${relPath}`);
  console.log(`   → ${fullPath}`);

  if (exists) {
    // Verificar si existe el subdirectorio de eventos
    const eventosPath = path.join(fullPath, 'images/eventos');
    const eventosExists = fs.existsSync(eventosPath);
    console.log(`   → images/eventos ${eventosExists ? '✅' : '❌'}`);

    if (eventosExists) {
      // Listar algunas imágenes
      const files = fs
        .readdirSync(eventosPath)
        .filter((f) => f.includes('cesar') || f.includes('Cesar'));
      if (files.length > 0) {
        console.log(`   → Imágenes de César encontradas: ${files.join(', ')}`);
      }
    }
  }
  console.log('');
}

// Verificar la imagen específica de César
console.log('\n=== Verificando imagen de Julio César ===\n');

const cesarImagePaths = ['images/eventos/cesar.jpg', '/images/eventos/cesar.jpg'];

for (const imgPath of cesarImagePaths) {
  for (const relPath of relativePaths) {
    const cleanPath = imgPath.replace(/^\//, '');
    const fullPath = path.join(__dirname, relPath, cleanPath);
    const exists = fs.existsSync(fullPath);

    if (exists) {
      console.log(`✅ ENCONTRADA: ${fullPath}`);
    }
  }
}

console.log('\n');
