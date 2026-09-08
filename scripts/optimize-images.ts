import * as fs from 'fs';
import * as path from 'path';
import sharp from 'sharp';

interface OptimizationOptions {
  inputDir: string;
  outputDir?: string;
  quality: number;
  recursive: boolean;
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
    recursive: true,
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
      case '--no-recursive':
        options.recursive = false;
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

/**
 * Obtener lista de archivos a procesar
 */
function getImageFiles(
  dir: string,
  recursive: boolean = true,
  extensions = ['.jpg', '.jpeg'],
): string[] {
  const files: string[] = [];

  function traverse(currentDir: string) {
    try {
      const entries = fs.readdirSync(currentDir, { withFileTypes: true });

      for (const entry of entries) {
        const fullPath = path.join(currentDir, entry.name);

        if (entry.isDirectory()) {
          if (recursive && !entry.name.startsWith('.')) {
            traverse(fullPath);
          }
        } else if (entry.isFile()) {
          const ext = path.extname(entry.name).toLowerCase();
          if (extensions.includes(ext)) {
            files.push(fullPath);
          }
        }
      }
    } catch (error) {
      console.error(`⚠️  Error leyendo directorio ${currentDir}:`, error);
    }
  }

  traverse(dir);
  return files;
}

/**
 * Convertir una imagen a WebP
 */
async function convertToWebP(
  inputFile: string,
  outputFile: string,
  quality: number,
): Promise<boolean> {
  try {
    const inputStats = fs.statSync(inputFile);
    await sharp(inputFile).webp({ quality }).toFile(outputFile);
    const outputStats = fs.statSync(outputFile);

    return {
      success: true,
      inputSize: inputStats.size,
      outputSize: outputStats.size,
    } as any;
  } catch (error) {
    console.error(`  ❌ Error al procesar ${inputFile}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    } as any;
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

  // Obtener lista de archivos
  const imageFiles = getImageFiles(options.inputDir, options.recursive);
  stats.totalFiles = imageFiles.length;

  if (stats.totalFiles === 0) {
    console.log('⚠️  No se encontraron imágenes JPG/JPEG para procesar');
    return stats;
  }

  if (options.verbose) {
    console.log(`\n🔍 Se encontraron ${stats.totalFiles} imagen(es) a procesar`);
    console.log(`📊 Calidad WebP: ${options.quality}`);
    console.log(`💾 Directorio de salida: ${outputDir}`);
    if (options.replace) {
      console.log(`🗑️  Se eliminarán los JPGs originales después de convertir\n`);
    }
  }

  // Procesar cada archivo
  for (const inputFile of imageFiles) {
    const relativePath = path.relative(options.inputDir, inputFile);
    const outputFileName = path.basename(inputFile, path.extname(inputFile)) + '.webp';
    const outputFilePath = path.join(outputDir, path.dirname(relativePath), outputFileName);

    // Crear subdirectorio si es necesario
    const outputFileDir = path.dirname(outputFilePath);
    if (!fs.existsSync(outputFileDir)) {
      fs.mkdirSync(outputFileDir, { recursive: true });
    }

    if (options.verbose) {
      process.stdout.write(`  ${relativePath} → ${outputFileName}... `);
    }

    const result = await convertToWebP(inputFile, outputFilePath, options.quality);

    if (result.success) {
      stats.successFiles++;
      stats.originalSize += result.inputSize;
      stats.optimizedSize += result.outputSize;

      if (options.verbose) {
        const ratio = ((result.inputSize - result.outputSize) / result.inputSize * 100).toFixed(1);
        console.log(`✅ (${formatSize(result.inputSize)} → ${formatSize(result.outputSize)}, -${ratio}%)`);
      }

      // Eliminar original si se especifica
      if (options.replace) {
        try {
          fs.unlinkSync(inputFile);
          if (options.verbose) {
            console.log(`     🗑️  Original eliminado`);
          }
        } catch (error) {
          console.error(`     ⚠️  No se pudo eliminar: ${error}`);
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

  stats.endTime = Date.now();
  stats.savedSize = stats.originalSize - stats.optimizedSize;
  stats.savedPercentage =
    stats.originalSize > 0 ? (stats.savedSize / stats.originalSize) * 100 : 0;

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
  console.log(`💪 Espacio ahorrado: ${formatSize(stats.savedSize)} (${stats.savedPercentage.toFixed(1)}%)`);
  console.log(`⏱️  Tiempo total: ${duration}s`);
  console.log('='.repeat(60) + '\n');
}

/**
 * Mostrar ayuda
 */
function printHelp(): void {
  console.log(`
🖼️  Optimizador de Imágenes JPG → WebP

Uso:
  npm run images:optimize -- [opciones]

Opciones:
  -i, --input <dir>      Directorio de entrada (requerido)
  -o, --output <dir>     Directorio de salida (por defecto: mismo que entrada)
  -q, --quality <0-100>  Calidad WebP (por defecto: 80)
  -r, --replace          Eliminar JPGs originales después de convertir
  --no-recursive         No procesar subdirectorios
  --quiet                No mostrar mensajes detallados
  -h, --help             Mostrar esta ayuda

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
    recursive: args.recursive !== false,
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
