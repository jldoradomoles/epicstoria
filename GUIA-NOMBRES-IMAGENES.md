# Guía de Nombres para Imágenes de Eventos

## 📋 Convención de Nombres

Para mantener organización y facilitar la referencia de imágenes en el Excel de eventos, sigue estas convenciones:

### ✅ Formato Recomendado

```
[tema-principal]-[subtema]-[año].extensión
```

**Ejemplos:**

- `alunizaje-apolo11-1969.jpg`
- `revolucion-francesa-1789.png`
- `segunda-guerra-mundial-1945.jpg`
- `descubrimiento-america-1492.webp`
- `renacimiento-italiano-sigloXV.jpg`

### 🎯 Reglas de Nomenclatura

1. **Usa minúsculas:** Facilita la escritura y evita errores
   - ✅ `darwin-evolucion.jpg`
   - ❌ `Darwin-Evolucion.jpg`

2. **Separa palabras con guiones:** No uses espacios
   - ✅ `primera-guerra-mundial.jpg`
   - ❌ `primera guerra mundial.jpg`

3. **Incluye fechas cuando sea relevante:** Ayuda a identificar el evento
   - ✅ `revolucion-industrial-1760.jpg`
   - ✅ `caida-muro-berlin-1989.jpg`

4. **Sé descriptivo pero conciso:** Máximo 50 caracteres
   - ✅ `invencion-imprenta-gutenberg-1440.jpg`
   - ❌ `la-increible-historia-de-como-gutenberg-invento-la-imprenta.jpg`

5. **Evita caracteres especiales:** Se convertirán en `_`
   - ✅ `viaje-colon-america.jpg`
   - ❌ `viaje-colón-américa.jpg` → Se convierte en `viaje-col_n-am_rica.jpg`

### 📚 Ejemplos por Categoría

#### Historia

```
revolucion-francesa-1789.jpg
independencia-eeuu-1776.jpg
caida-imperio-romano-476.jpg
guerra-civil-espanola-1936.jpg
tratado-versalles-1919.jpg
```

#### Ciencia

```
teoria-relatividad-einstein-1905.jpg
descubrimiento-penicilina-1928.jpg
estructura-adn-1953.jpg
primer-transplante-corazon-1967.jpg
teoria-evolucion-darwin-1859.jpg
```

#### Espacio

```
alunizaje-apolo11-1969.jpg
primer-satelite-sputnik-1957.jpg
telescopio-hubble-1990.jpg
estacion-espacial-mir-1986.jpg
voyager-sistema-solar-1977.jpg
```

#### Arte

```
mona-lisa-davinci-1503.jpg
guernica-picasso-1937.jpg
capilla-sixtina-michelangelo-1512.jpg
impresionismo-monet-nenufares.jpg
david-miguel-angel-1504.jpg
```

#### Tecnología

```
primera-computadora-eniac-1946.jpg
internet-arpanet-1969.jpg
primer-iphone-2007.jpg
world-wide-web-1991.jpg
transistor-1947.jpg
```

### 🔄 Proceso Recomendado

1. **Antes de subir la imagen:**

   ```
   Nombre original: IMG_20240115_143022.jpg

   Pasos:
   1. Identificar el evento: Alunizaje del Apolo 11
   2. Crear nombre descriptivo: alunizaje-apolo11-1969.jpg
   3. Renombrar el archivo
   4. Subir a través del panel de administración
   ```

2. **Al usar en Excel:**
   ```excel
   id           | title                    | date       | imageUrl
   -------------|--------------------------|------------|----------------------------------
   apolo-11     | Primer Alunizaje         | 1969-07-20 | /images/eventos/alunizaje-apolo11-1969.jpg
   revolucion-fr| Revolución Francesa      | 1789-07-14 | /images/eventos/revolucion-francesa-1789.jpg
   ```

### ⚠️ Advertencias Importantes

1. **Duplicados:** Si subes una imagen con un nombre que ya existe, reemplazará la imagen anterior sin previo aviso.

2. **Mayúsculas/Minúsculas:** El sistema es sensible a mayúsculas en algunos servidores:
   - `Apolo11.jpg` ≠ `apolo11.jpg`
   - Recomendación: Siempre usa minúsculas

3. **Caracteres especiales:** Evita completamente:
   - Espacios: ` ` → `_`
   - Acentos: `á, é, í, ó, ú` → `_`
   - Símbolos: `@, #, $, %, &` → `_`
   - Paréntesis: `(, )` → `_`

### 📝 Plantilla de Nombres

Crea un documento de referencia con los nombres de tus imágenes antes de subirlas:

```markdown
## Eventos Espaciales

- alunizaje-apolo11-1969.jpg
- primer-satelite-sputnik-1957.jpg
- telescopio-hubble-1990.jpg

## Revoluciones

- revolucion-francesa-1789.jpg
- revolucion-industrial-1760.jpg
- revolucion-rusa-1917.jpg

## Ciencia

- teoria-relatividad-1905.jpg
- descubrimiento-penicilina-1928.jpg
- estructura-adn-1953.jpg
```

### 🎨 Convención de Extensiones

Usa la extensión apropiada según el tipo de imagen:

- **JPG/JPEG:** Fotografías, imágenes con muchos colores
- **PNG:** Imágenes con transparencia, gráficos
- **WEBP:** Formato moderno, mejor compresión
- **GIF:** Animaciones simples (aunque rara vez para eventos históricos)

### 🔍 Verificación Antes de Subir

Checklist rápido:

- [ ] Nombre en minúsculas
- [ ] Palabras separadas con guiones
- [ ] Sin espacios ni caracteres especiales
- [ ] Longitud menor a 50 caracteres
- [ ] Descriptivo y único
- [ ] Incluye fecha si es relevante
- [ ] Extensión correcta (.jpg, .png, .webp)

### 💡 Herramientas Útiles

**Renombrado masivo (PowerShell):**

```powershell
# Convertir todos los archivos a minúsculas
Get-ChildItem *.jpg | Rename-Item -NewName {$_.Name.ToLower()}

# Reemplazar espacios por guiones
Get-ChildItem *.jpg | Rename-Item -NewName {$_.Name -replace ' ','-'}
```

**Renombrado masivo (Linux/Mac):**

```bash
# Convertir a minúsculas y reemplazar espacios
for file in *.jpg; do
  mv "$file" "$(echo $file | tr '[:upper:]' '[:lower:]' | tr ' ' '-')"
done
```

### 📊 Ejemplos de Organización en Excel

```excel
| id                  | title                              | imageUrl                                          |
|---------------------|------------------------------------|---------------------------------------------------|
| revolucion-francesa | La Revolución Francesa de 1789     | /images/eventos/revolucion-francesa-1789.jpg      |
| apolo-11            | Primer Alunizaje - Apolo 11        | /images/eventos/alunizaje-apolo11-1969.jpg        |
| caida-muro-berlin   | Caída del Muro de Berlín           | /images/eventos/caida-muro-berlin-1989.jpg        |
| teoria-relatividad  | Teoría de la Relatividad - Einstein| /images/eventos/teoria-relatividad-einstein-1905.jpg |
| descubrimiento-adn  | Descubrimiento de la Estructura ADN| /images/eventos/estructura-adn-1953.jpg           |
```

---

**Nota:** Siguiendo estas convenciones, mantendrás tu biblioteca de imágenes organizada y será mucho más fácil referenciarlas en el Excel de eventos.
