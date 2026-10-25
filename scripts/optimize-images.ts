import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

interface OptimizationOptions {
  inputDir: string;
  outputDir?: string;
  quality: number;
  replace: boolean;
  verbose: boolean;
}

interface OptimizationStats {
  totalFiles: number;
  processedFiles: number;
  successFiles: number;
  failedFiles: number;
  originalSize: number;
  optimizedSize: number;
  savedSize: number;
  savedPercentage: number;
  startTime: number;
  endTime: number;
}

/**
 * Obtener los argumentos de línea de comandos
 */
function parseArguments(): Partial<OptimizationOptions> {
  const args = process.argv.slice(2);
  const options: Partial<OptimizationOptions> = {
    quality: 80,
    replace: false,
    verbose: true,
  };

  for (let i = 0; i < args.length; i++) {
    switch (args[i]) {
      case '--input':
      case '-i':
        options.inputDir = args[++i];
        break;
      case '--output':
      case '-o':
        options.outputDir = args[++i];
        break;
      case '--quality':
      case '-q':
        options.quality = parseInt(args[++i], 10);
        break;
      case '--replace':
      case '-r':
        options.replace = true;
        break;
      case '--quiet':
        options.verbose = false;
        break;
    }
  }

  return options;
}

/**
 * Validar directorio
 */
function validateDirectory(dir: string): boolean {
  if (!fs.existsSync(dir)) {
    console.error(`❌ El directorio no existe: ${dir}`);
    return false;
  }

  const stats = fs.statSync(dir);
  if (!stats.isDirectory()) {
    console.error(`❌ No es un directorio: ${dir}`);
    return false;
  }

  return true;
}

const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tif', '.tiff', '.avif'];

/**
 * Obtener las carpetas de eventos (subdirectorios directos del directorio de entrada)
 */
function getEventFolders(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((entry) => entry.isDirectory() && !entry.name.startsWith('.'))
    .map((entry) => entry.name);
}

/**
 * Obtener las imágenes de una carpeta de evento (sin entrar en subcarpetas)
 */
function getImageFiles(dir: string): string[] {
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter(
      (entry) => entry.isFile() && IMAGE_EXTENSIONS.includes(path.extname(entry.name).toLowerCase()),
    )
    .map((entry) => path.join(dir, entry.name));
}

/**
 * Normalizar nombre de carpeta (minúsculas, espacios → guiones)
 */
function normalizeFolderName(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, '-');
}

/**
 * Normalizar nombre de archivo (minúsculas, sin tildes, espacios → guiones)
 */
function normalizeFilename(filename: string): string {
  return filename
    .toLowerCase() // Convertir a minúsculas
    .normalize('NFD') // Descomponer caracteres acentuados
    .replace(/[\u0300-\u036f]/g, '') // Eliminar marcas diacríticas
    .replace(/\s+/g, '-'); // Reemplazar espacios con guiones
}

type ConversionResult =
  | { success: true; inputSize: number; outputSize: number }
  | { success: false; error: string };

/**
 * Convertir una imagen a WebP
 */
async function convertToWebP(
  inputFile: string,
  outputFile: string,
  quality: number,
): Promise<ConversionResult> {
  try {
    const inputStats = fs.statSync(inputFile);
    await sharp(inputFile).webp({ quality }).toFile(outputFile);
    const outputStats = fs.statSync(outputFile);

    return {
      success: true,
      inputSize: inputStats.size,
      outputSize: outputStats.size,
    };
  } catch (error) {
    console.error(`  ❌ Error al procesar ${inputFile}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
}

/**
 * Formatear tamaño en bytes
 */
function formatSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Procesar imágenes
 */
async function optimizeImages(options: OptimizationOptions): Promise<OptimizationStats> {
  const stats: OptimizationStats = {
    totalFiles: 0,
    processedFiles: 0,
    successFiles: 0,
    failedFiles: 0,
    originalSize: 0,
    optimizedSize: 0,
    savedSize: 0,
    savedPercentage: 0,
    startTime: Date.now(),
    endTime: 0,
  };

  // Validar directorio de entrada
  if (!validateDirectory(options.inputDir)) {
    process.exit(1);
  }

  // Crear directorio de salida si es necesario
  const outputDir = options.outputDir || options.inputDir;
  if (outputDir !== options.inputDir && !fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
    if (options.verbose) {
      console.log(`📁 Directorio de salida creado: ${outputDir}`);
    }
  }

  // Obtener carpetas de eventos
  const eventFolders = getEventFolders(options.inputDir);

  if (eventFolders.length === 0) {
    console.log('⚠️  No se encontraron carpetas de eventos para procesar');
    return stats;
  }

  if (options.verbose) {
    console.log(`
🔍 Se encontraron ${eventFolders.length} carpeta(s) de eventos`);
    console.log(`📊 Calidad WebP: ${options.quality}`);
    console.log(`💾 Directorio de salida: ${outputDir}`);
    if (options.replace) {
      console.log(`🗑️  Se eliminarán las imágenes originales después de convertir
`);
    }
  }

  for (const folderName of eventFolders) {
    const inputFolder = path.join(options.inputDir, folderName);
    const normalizedFolderName = normalizeFolderName(folderName);
    const outputFolder = path.join(outputDir, normalizedFolderName);
    const imageFiles = getImageFiles(inputFolder);

    if (imageFiles.length === 0) {
      if (options.verbose) {
        console.log(`📁 ${folderName}: sin imágenes, se omite`);
      }
      continue;
    }

    stats.totalFiles += imageFiles.length;

    if (options.verbose) {
      console.log(`
📁 ${folderName} → ${normalizedFolderName} (${imageFiles.length} imagen(es))`);
    }

    fs.mkdirSync(outputFolder, { recursive: true });

    const usedNames = new Set<string>();

    for (const inputFile of imageFiles) {
      const baseName = path.basename(inputFile, path.extname(inputFile));
      const outputFileName = normalizeFilename(baseName) + '.webp';
      const outputFilePath = path.join(outputFolder, outputFileName);

      if (options.verbose) {
        process.stdout.write(`  ${path.basename(inputFile)} → ${outputFileName}... `);
      }

      if (usedNames.has(outputFileName)) {
        stats.failedFiles++;
        stats.processedFiles++;
        console.log(`❌ Nombre duplicado en la carpeta, se omite`);
        continue;
      }
      usedNames.add(outputFileName);

      const result = await convertToWebP(inputFile, outputFilePath, options.quality);

      if (result.success) {
        stats.successFiles++;
        stats.originalSize += result.inputSize;
        stats.optimizedSize += result.outputSize;

        if (options.verbose) {
          const ratio = (
            ((result.inputSize - result.outputSize) / result.inputSize) *
            100
          ).toFixed(1);
          console.log(
            `✅ (${formatSize(result.inputSize)} → ${formatSize(result.outputSize)}, -${ratio}%)`,
          );
        }

        if (options.replace) {
          try {
            fs.unlinkSync(inputFile);
          } catch (error) {
            console.error(`     ⚠️  No se pudo eliminar ${inputFile}: ${error}`);
          }
        }
      } else {
        stats.failedFiles++;
        if (options.verbose) {
          console.log(`❌ ${result.error}`);
        }
      }

      stats.processedFiles++;
    }

    // Con --replace, la carpeta original se sustituye por la normalizada
    if (options.replace && path.resolve(inputFolder) !== path.resolve(outputFolder)) {
      try {
        const sameFolderDifferentCase =
          path.resolve(inputFolder).toLowerCase() === path.resolve(outputFolder).toLowerCase();
        if (sameFolderDifferentCase) {
          // Sistema de archivos insensible a mayúsculas: renombrar vía nombre temporal
          const tmp = inputFolder + '.tmp-rename';
          fs.renameSync(inputFolder, tmp);
          fs.renameSync(tmp, outputFolder);
        } else if (fs.readdirSync(inputFolder).length === 0) {
          fs.rmdirSync(inputFolder);
        }
        if (options.verbose) {
          console.log(`  ✏️  Carpeta renombrada a: ${normalizedFolderName}`);
        }
      } catch (error) {
        console.error(`  ⚠️  No se pudo renombrar/eliminar la carpeta ${inputFolder}: ${error}`);
      }
    }
  }

  stats.endTime = Date.now();
  stats.savedSize = stats.originalSize - stats.optimizedSize;
  stats.savedPercentage = stats.originalSize > 0 ? (stats.savedSize / stats.originalSize) * 100 : 0;

  return stats;
}

/**
 * Mostrar resumen de estadísticas
 */
function printStats(stats: OptimizationStats): void {
  const duration = ((stats.endTime - stats.startTime) / 1000).toFixed(2);

  console.log('\n' + '='.repeat(60));
  console.log('📊 RESUMEN DE OPTIMIZACIÓN');
  console.log('='.repeat(60));
  console.log(`✅ Imágenes procesadas exitosamente: ${stats.successFiles}/${stats.totalFiles}`);
  console.log(`❌ Imágenes con errores: ${stats.failedFiles}`);
  console.log(`\n💾 Tamaño original: ${formatSize(stats.originalSize)}`);
  console.log(`📦 Tamaño optimizado: ${formatSize(stats.optimizedSize)}`);
  console.log(
    `💪 Espacio ahorrado: ${formatSize(stats.savedSize)} (${stats.savedPercentage.toFixed(1)}%)`,
  );
  console.log(`⏱️  Tiempo total: ${duration}s`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Mostrar ayuda
 */
function printHelp(): void {
  console.log(`
🖼️  Optimizador de Imágenes → WebP por carpeta de evento

Uso:
  npm run images:optimize -- [opciones]

Opciones:
  -i, --input <dir>      Directorio con una carpeta por evento (requerido)
  -o, --output <dir>     Directorio de salida (por defecto: mismo que entrada)
  -q, --quality <0-100>  Calidad WebP (por defecto: 80)
  -r, --replace          Eliminar originales y renombrar carpetas
  --quiet                No mostrar mensajes detallados
  -h, --help             Mostrar esta ayuda

Funcionamiento:
  • Entra en cada subcarpeta (evento) del directorio de entrada
  • Convierte todas sus imágenes a WebP
  • La carpeta resultante se llama igual en minúsculas y con guiones
    en lugar de espacios (ej: "Abbas Ibn Firnas" → "abbas-ibn-firnas")

Normalización de nombres de archivo:
  • Convierte a minúsculas
  • Elimina tildes y acentos
  • Reemplaza espacios con guiones
  • Ejemplo: "Mi Imagen.jpg" → "mi-imagen.webp"
  • Ejemplo: "Café Español.jpg" → "cafe-espanol.webp"

Ejemplos:
  npm run images:optimize -- -i public/images/eventos
  npm run images:optimize -- -i public/images/logos-levels -q 85
  npm run images:optimize -- -i public/images/eventos -o public/images/eventos-webp -r
`);
}

/**
 * Función principal
 */
async function main(): Promise<void> {
  const args = parseArguments();

  if (process.argv.includes('-h') || process.argv.includes('--help')) {
    printHelp();
    return;
  }

  if (!args.inputDir) {
    console.error('❌ Error: Se requiere especificar el directorio de entrada con -i o --input');
    console.log('\nUsa: npm run images:optimize -- -i <directorio>');
    console.log('O:   npm run images:optimize -- -h  para ver la ayuda completa\n');
    process.exit(1);
  }

  // Validar calidad
  if (args.quality && (args.quality < 1 || args.quality > 100)) {
    console.error('❌ Error: La calidad debe estar entre 1 y 100');
    process.exit(1);
  }

  const options: OptimizationOptions = {
    inputDir: args.inputDir,
    outputDir: args.outputDir,
    quality: args.quality || 80,
    replace: args.replace || false,
    verbose: args.verbose !== false,
  };

  console.log('\n🚀 Iniciando optimización de imágenes...\n');

  try {
    const stats = await optimizeImages(options);
    printStats(stats);

    if (stats.successFiles > 0) {
      console.log('✨ ¡Optimización completada exitosamente!');
    } else {
      console.log('⚠️  No se optimizaron imágenes');
      process.exit(1);
    }
  } catch (error) {
    console.error('❌ Error durante la optimización:', error);
    process.exit(1);
  }
}

main();
