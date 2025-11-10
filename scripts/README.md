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
