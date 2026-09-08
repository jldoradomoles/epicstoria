# 📊 Conversor de Excel a JSON para Eventos

Esta herramienta te permite gestionar los eventos históricos en Excel y convertirlos automáticamente a JSON.

## 📝 Formato del Excel

Crea un archivo Excel (.xlsx) con las siguientes columnas (primera fila como encabezados):

| Columna | Nombre       | Descripción                                                            | Ejemplo                                                      |
| ------- | ------------ | ---------------------------------------------------------------------- | ------------------------------------------------------------ |
| A       | id           | Identificador único (sin espacios, usar guiones)                       | `apolo-11`                                                   |
| B       | title        | Título del evento                                                      | `Alunizaje del Apolo 11`                                     |
| C       | date         | Fecha (DD-MM-YYYY o YYYY-MM-DD)                                        | `20-07-1969` o `1969-07-20`                                  |
| D       | category     | Categoría del evento                                                   | `Ciencia`                                                    |
| E       | imageUrl     | Ruta de la imagen                                                      | `/images/apolo-11.jpg`                                       |
| F       | summary      | Resumen breve (párrafos separados por `\|\|`)                          | `Párrafo 1\|\|Párrafo 2`                                     |
| G       | context      | Contexto histórico (párrafos separados por `\|\|`)                     | `Párrafo 1\|\|Párrafo 2\|\|Párrafo 3`                        |
| H       | keyFacts     | Datos curiosos (formato: `Título\|Descripción\|\|Título\|Descripción`) | `Primera pisada\|Neil Armstrong...\|\|Duración\|21 horas...` |
| I       | timeline     | Cronología (formato: `Fecha\|Evento\|\|Fecha\|Evento`)                 | `16-07-1969\|Lanzamiento\|\|20-07-1969\|Alunizaje`           |
| J       | consequences | Consecuencias (párrafos separados por `\|\|`)                          | `Impacto 1\|\|Impacto 2`                                     |

## 🔧 Uso

### 1. Preparar el archivo Excel

Crea un archivo `eventos.xlsx` siguiendo el formato descrito arriba.

### 2. Convertir a JSON

```bash
# Opción 1: Usando el script npm
npm run excel:convert eventos.xlsx

# Opción 2: Especificando la ruta de salida
npm run excel:convert eventos.xlsx public/data/events.json

# Opción 3: Usando ts-node directamente
npx ts-node scripts/excel-to-json.ts eventos.xlsx
```

### 3. Verificar el resultado

El archivo JSON se generará en `public/data/events.json` por defecto.

## 📋 Ejemplo de Excel

### Fila 2 (primer evento):

- **A2**: `apolo-11`
- **B2**: `Alunizaje del Apolo 11`
- **C2**: `1969-07-20`
- **D2**: `Ciencia`
- **E2**: `/images/apolo-11.jpg`
- **F2**: `Neil Armstrong y Buzz Aldrin se convierten en los primeros seres humanos en caminar sobre la superficie lunar.`
- **G2**: `Durante la Guerra Fría, Estados Unidos y la Unión Soviética competían por la supremacía espacial.||El programa Apolo fue la respuesta estadounidense al desafío del presidente Kennedy.`
- **H2**: `Primera pisada lunar|Neil Armstrong pronuncia las famosas palabras||Duración de la misión|Los astronautas pasaron aproximadamente 21 horas en la superficie lunar`
- **I2**: `1969-07-16|Lanzamiento del Apolo 11 desde Cabo Cañaveral||1969-07-20|Alunizaje en el Mar de la Tranquilidad||1969-07-24|Amerizaje exitoso`
- **J2**: `El alunizaje demostró la capacidad tecnológica de la humanidad.||Inspiró generaciones de científicos e ingenieros.`

## 💡 Consejos

1. **Párrafos largos**: Separa cada párrafo con `||` para mejor legibilidad
2. **Datos curiosos**: Usa el formato `Título|Descripción||Título|Descripción`
3. **Cronología**: Usa el formato `Fecha|Evento||Fecha|Evento`
4. **Comillas**: Si tu texto contiene comillas dobles, el Excel las manejará automáticamente
5. **Saltos de línea**: Usa `||` en lugar de saltos de línea reales dentro de las celdas

## 🎯 Ventajas

✅ Editar datos en Excel es más fácil y visual
✅ Múltiples personas pueden colaborar en el Excel
✅ Fácil copiar/pegar contenido desde otras fuentes
✅ Sin errores de sintaxis JSON
✅ Conversión automática al formato correcto

## 🔍 Solución de problemas

**Error: Cannot find module 'xlsx'**

```bash
npm install -D xlsx @types/node ts-node
```

**Error: archivo no encontrado**

- Verifica que el archivo Excel esté en la raíz del proyecto o proporciona la ruta completa

**Datos no se convierten correctamente**

- Verifica que los encabezados de la primera fila coincidan exactamente con los nombres esperados
- Asegúrate de usar `||` (dos pipes) para separar elementos

---

# 🖼️ Optimizador de Imágenes JPG → WebP

Script para convertir imágenes JPG/JPEG a formato WebP, reduciendo significativamente el tamaño de archivo manteniendo excelente calidad.

## ¿Por qué WebP?

- ✅ **30-35% más pequeño** que JPG con igual calidad
- ✅ **Mejor para web**: Compatible con navegadores modernos
- ✅ **Mejor rendimiento**: Reduce tiempo de carga
- ✅ **SEO amigable**: Google lo recomienda

## 🚀 Uso Rápido

### Instalación de dependencias

```bash
npm install
```

### Optimizar imágenes de eventos

```bash
npm run images:optimize -- -i public/images/eventos
```

### Optimizar imágenes de avatares por nivel

```bash
npm run images:optimize -- -i public/images/logos-levels -q 85
```

### Optimizar con calidad específica

```bash
npm run images:optimize -- -i public/images/eventos -q 80
```

### Guardar en directorio diferente

```bash
npm run images:optimize -- -i public/images/eventos -o public/images/eventos-webp
```

### Reemplazar originales (eliminar JPGs después de convertir)

```bash
npm run images:optimize -- -i public/images/eventos -r
```

### Ver opciones disponibles

```bash
npm run images:optimize -- -h
```

## 📋 Opciones de Línea de Comandos

| Opción           | Corta | Descripción                       | Defecto           |
| ---------------- | ----- | --------------------------------- | ----------------- |
| `--input`        | `-i`  | Directorio de entrada (requerido) | -                 |
| `--output`       | `-o`  | Directorio de salida              | Mismo que entrada |
| `--quality`      | `-q`  | Calidad WebP (1-100)              | 80                |
| `--replace`      | `-r`  | Eliminar JPGs originales          | No                |
| `--no-recursive` | -     | No procesar subdirectorios        | Recursivo         |
| `--quiet`        | -     | Sin mensajes detallados           | Verbose           |
| `--help`         | `-h`  | Mostrar ayuda                     | -                 |

## 💡 Ejemplos Completos

### Flujo 1: Optimizar eventos nuevos

```bash
# Copiar nuevas imágenes a public/images/eventos
# Luego ejecutar:
npm run images:optimize -- -i public/images/eventos -q 80
```

### Flujo 2: Optimizar avatares nivel a nivel

```bash
# Optimizar con mejor calidad para avatares
npm run images:optimize -- -i public/images/logos-levels -q 85
```

### Flujo 3: Generar versión WebP alternativa

```bash
# Mantener originales JPG, crear subdirectorio webp/
npm run images:optimize -- -i public/images/eventos -o public/images/eventos/webp
```

### Flujo 4: Reemplazar todo (limpiar espacio)

```bash
# Convertir a WebP y eliminar JPGs originales
npm run images:optimize -- -i public/images/eventos -r
```

## 📊 Resultado de Optimización

El script muestra un resumen como este:

```
🚀 Iniciando optimización de imágenes...

🔍 Se encontraron 24 imagen(es) a procesar
📊 Calidad WebP: 80
💾 Directorio de salida: public/images/eventos

  evento1.jpg → evento1.webp... ✅ (2.5 MB → 750 KB, -70.0%)
  evento2.jpg → evento2.webp... ✅ (1.8 MB → 540 KB, -70.0%)
  ...

============================================================
📊 RESUMEN DE OPTIMIZACIÓN
============================================================
✅ Imágenes procesadas exitosamente: 24/24
❌ Imágenes con errores: 0

💾 Tamaño original: 50 MB
📦 Tamaño optimizado: 15 MB
💪 Espacio ahorrado: 35 MB (70.0%)
⏱️  Tiempo total: 12.50s
============================================================

✨ ¡Optimización completada exitosamente!
```

## ⚙️ Configuración de Calidad Recomendada

- **80** (defecto): Buena relación calidad/tamaño para la mayoría de casos
- **75**: Para imágenes de fondo o menos críticas
- **85**: Para avatares o imágenes importantes donde la calidad es crítica
- **90+**: Para imágenes muy importantes (más grande, use raramente)

## 🔄 Integración en Pipeline

Puedes automatizar optimizaciones en tu flujo de trabajo:

```json
// package.json - ejemplo
{
  "scripts": {
    "build": "npm run images:optimize -- -i public/images/eventos && ng build",
    "deploy": "npm run images:optimize -- -i public/images -q 80 && npm run build"
  }
}
```

## ❓ Preguntas Frecuentes

**P: ¿Perderé calidad con WebP?**
R: No significativamente. Con calidad 80 (defecto), el cambio es imperceptible al ojo humano.

**P: ¿Debo eliminar los JPGs originales?**
R: Recomendamos mantenerlos inicialmente. Una vez verificado que funciona bien, usa `-r` para limpiar.

**P: ¿Funciona en Windows/Mac/Linux?**
R: Sí, funciona en todos. Sharp es multiplataforma.

**P: ¿Qué pasa si falla la conversión?**
R: El script reporta el error y continúa con los demás archivos. Revisa los errores en la salida.

**P: ¿Puedo revertir si algo sale mal?**
R: Sí, siempre que no uses `-r`. Los JPGs originales se mantienen junto a los WebPs.

## 🛠️ Solución de Problemas

**Error: sharp: error on line 1 char 1 (libjpeg)**

```bash
# Reinstala sharp
npm install --save-dev sharp@latest
```

**Proceso muy lento**

- Reduce la calidad a 75
- Verifica que no haya procesos de CPU intensivos
- En Windows, puede ser más lento que en Linux

**Archivo WebP más grande que JPG**

- Esto puede ocurrir con imágenes muy simples o pequeñas
- Reduce la calidad a 70-75
- El algoritmo WebP no siempre es óptimo para todo tipo de imagen
