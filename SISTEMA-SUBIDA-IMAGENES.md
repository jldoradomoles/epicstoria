# Sistema de Subida de Imágenes - Epicstoria

## 📸 Descripción

Sistema de administración para subir imágenes de eventos, similar al sistema existente de subida de datos mediante Excel. Los administradores pueden subir una o múltiples imágenes que luego pueden usar en los eventos.

## 🎯 Características

- ✅ Subida de imagen única o múltiples imágenes
- ✅ Validación de formato (JPG, PNG, GIF, WEBP)
- ✅ Límite de tamaño: 5MB por imagen
- ✅ Máximo 10 imágenes simultáneas
- ✅ Previsualización de imágenes seleccionadas
- ✅ URLs copiables al portapapeles
- ✅ Almacenamiento en `/public/images/eventos/`
- ✅ Autenticación requerida (solo administradores)
- ✅ **Mantiene el nombre original del archivo** para fácil referencia en Excel

> **⚠️ Importante:** Las imágenes mantienen su nombre original al subirlas. Asegúrate de renombrar tus archivos con nombres descriptivos antes de subirlos (ejemplo: `alunizaje-apolo11.jpg`, `revolucion-francesa.png`). Si subes una imagen con un nombre que ya existe, se sobrescribirá la imagen anterior.

## 🔐 Acceso

Solo los usuarios con rol de **ADMIN** pueden acceder a esta funcionalidad.

### Para acceder:

1. Iniciar sesión como administrador
2. Ir a **Perfil** (icono de usuario en el header)
3. Seleccionar la pestaña **Administración**
4. Encontrarás dos secciones:
   - **Subir Imágenes de Eventos** (nueva)
   - **Cargar Eventos desde Excel** (existente)

## 📋 Uso del Sistema

### Subir una Imagen

1. En la pestaña **Administración** del perfil
2. Haz clic en el área de "Subir Imágenes de Eventos"
3. Selecciona una imagen desde tu computadora
4. Verifica el nombre y tamaño del archivo
5. Haz clic en **Subir Imágenes**
6. Copia la URL generada usando el botón de copiar

### Subir Múltiples Imágenes

1. Selecciona múltiples imágenes (Ctrl+clic o Cmd+clic)
2. Revisa la lista de archivos seleccionados
3. Elimina las que no necesites con el botón ❌
4. Haz clic en **Subir Imágenes**
5. Copia las URLs generadas individualmente

## 🛠️ Detalles Técnicos

### Backend

#### Endpoints Creados

**POST `/api/events/upload-image`** - Subir imagen única

- **Auth:** Bearer token requerido
- **Role:** Admin
- **Body:** FormData con campo `image`
- **Response:**

```json
{
  "success": true,
  "data": {
    "filename": "evento-luna.jpg",
    "imageUrl": "/images/eventos/evento-luna.jpg",
    "originalName": "evento-luna.jpg",
    "size": 1234567
  },
  "message": "Imagen subida exitosamente"
}
```

**POST `/api/events/upload-images`** - Subir múltiples imágenes

- **Auth:** Bearer token requerido
- **Role:** Admin
- **Body:** FormData con campo `images[]` (array)
- **Response:**

```json
{
  "success": true,
  "data": [
    {
      "filename": "evento1.jpg",
      "imageUrl": "/images/eventos/evento1.jpg",
      "originalName": "evento1.jpg",
      "size": 1234567
    }
    // ... más imágenes
  ],
  "message": "5 imágenes subidas exitosamente"
}
```

#### Configuración de Multer

Archivo: [backend/src/routes/event.routes.ts](backend/src/routes/event.routes.ts)

```typescript
const uploadImage = multer({
  storage: multer.diskStorage({
    destination: path.join(__dirname, '../../../public/images/eventos'),
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      const ext = path.extname(file.originalname);
      cb(null, 'event-' + uniqueSuffix + ext);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedMimes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Solo se permiten imágenes (jpg, jpeg, png, gif, webp)'));
    }
  },
});
```

#### Servir Imágenes Estáticas

Archivo: [backend/src/index.ts](backend/src/index.ts)

```typescript
app.use('/images', express.static(path.join(__dirname, '../../public/images')));
```

### Frontend

#### Servicio Angular

Archivo: [src/app/services/event-api.service.ts](src/app/services/event-api.service.ts)

```typescript
// Subir imagen única
uploadEventImage(file: File): Observable<ImageUploadResponse> {
  const formData = new FormData();
  formData.append('image', file);

  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.post<ApiResponse<ImageUploadResponse>>(
    `${this.apiUrl}/events/upload-image`,
    formData,
    { headers }
  ).pipe(map(response => response.data));
}

// Subir múltiples imágenes
uploadEventImages(files: File[]): Observable<ImageUploadResponse[]> {
  const formData = new FormData();
  files.forEach(file => formData.append('images', file));

  const token = this.authService.getToken();
  const headers = new HttpHeaders({
    Authorization: `Bearer ${token}`,
  });

  return this.http.post<ApiResponse<ImageUploadResponse[]>>(
    `${this.apiUrl}/events/upload-images`,
    formData,
    { headers }
  ).pipe(map(response => response.data));
}
```

#### Componente de Perfil

Archivo: [src/app/pages/profile/profile.ts](src/app/pages/profile/profile.ts)

**Nuevos signals:**

```typescript
selectedImages = signal<File[]>([]);
isUploadingImages = signal<boolean>(false);
imageUploadResult = signal<ImageUploadResponse[] | null>(null);
imageSuccessMessage = signal<string>('');
imageErrorMessage = signal<string>('');
```

**Métodos principales:**

- `onImagesSelected(event: Event)` - Maneja la selección de archivos
- `onUploadImages()` - Sube las imágenes al servidor
- `removeImage(index: number)` - Elimina una imagen de la selección
- `copyToClipboard(text: string)` - Copia URL al portapapeles

## 📁 Estructura de Archivos

```
epicstoria/
├── backend/
│   └── src/
│       ├── routes/
│       │   └── event.routes.ts          # ✨ Endpoints de imágenes
│       └── index.ts                      # ✨ Servir archivos estáticos
├── public/
│   └── images/
│       └── eventos/                      # 📂 Directorio de imágenes subidas
│           ├── event-1234567890-123.jpg
│           └── event-1234567891-456.png
└── src/
    └── app/
        ├── services/
        │   └── event-api.service.ts      # ✨ Métodos de upload
        └── pages/
            └── profile/
                ├── profile.ts            # ✨ Lógica de subida
                └── profile.html          # ✨ UI de subida
```

## 🔒 Seguridad

1. **Autenticación:** Se requiere token JWT válido
2. **Autorización:** Solo usuarios con rol `ADMIN` pueden subir
3. **Validación de tipo:** Solo formatos de imagen permitidos
4. **Límite de tamaño:** 5MB por imagen para prevenir abusos
5. **Nombres sanitizados:** Caracteres especiales se reemplazan por `_` para evitar problemas
6. **Sobreescritura:** Si subes una imagen con el mismo nombre, reemplazará la existente

## 📝 Uso de las URLs Generadas

Las URLs generadas pueden usarse directamente en el Excel de eventos:

```excel
id          | title              | imageUrl
------------|--------------------|-----------------alunizaje-apolo11.jpg
evento-2    | Otro Evento        | /images/eventos/discovery-telescopio.png
```

**Importante:** Usa nombres descriptivos para tus imágenes antes de subirlas, ya que mantendrán ese nombre. Por ejemplo:

- ✅ `alunizaje-apolo11.jpg`
- ✅ `revolucion-francesa-1789.png`
- ✅ `darwin-evolucion.jpg`
- ❌ `IMG_20240115.jpg` (poco descriptivo)
- ❌ `foto (1).png` (caracteres especiales se reemplazarán por `_`)
  O en la API directamente al crear/actualizar eventos.

## 🎨 Interfaz de Usuario

### Características de la UI

- **Drag & Drop simulado:** Click para seleccionar archivos
- **Preview de archivos:** Lista con nombre y tamaño
- **Botón de eliminar:** Para quitar archivos antes de subir
- **Feedback visual:** Mensajes de éxito/error claros
- **Copiar URL:** Botón directo para copiar al portapapeles
- **Loading states:** Indicadores mientras se suben las imágenes
- **Responsive:** Funciona en móvil y escritorio

### Estados de la Interfaz

1. **Estado inicial:** Área de selección vacía
2. **Archivos seleccionados:** Lista de archivos con opción de eliminar
3. **Subiendo:** Spinner y botón deshabilitado
4. **Éxito:** Lista de URLs con botones de copiar
5. **Error:** Mensaje de error descriptivo

## 🐛 Manejo de Errores

### Errores Comunes

| Error                                   | Causa                       | Solución                       |
| --------------------------------------- | --------------------------- | ------------------------------ |
| "Formato no permitido"                  | Archivo no es imagen válida | Use JPG, PNG, GIF o WEBP       |
| "Tamaño máximo 5MB"                     | Archivo muy grande          | Comprima la imagen             |
| "No se ha proporcionado ninguna imagen" | No se seleccionó archivo    | Seleccione al menos una imagen |
| "Token inválido"                        | Sesión expirada             | Inicie sesión nuevamente       |
| "No autorizado"                         | Usuario no es admin         | Use cuenta de administrador    |

### Notas sobre Nombres de Archivo

- ✅ **Nombres descriptivos:** `alunizaje-apolo11.jpg`, `revolucion-francesa-1789.png`
- ✅ **Caracteres permitidos:** letras, números, guiones, puntos y guiones bajos
- ⚠️ **Caracteres especiales:** Se reemplazan automáticamente por `_` (espacios, paréntesis, acentos, etc.)
- ⚠️ **Duplicados:** Si subes una imagen con el mismo nombre, reemplazará la anterior
- 💡 **Recomendación:** Renombra tus archivos antes de subirlos para mantener consistencia

| "Tamaño máximo 5MB"Imagen con Nombre Descriptivo

```typescript
// 1. Usuario renombra su archivo a "alunizaje-apolo11.jpg"
// 2. Selecciona el archivo (2MB)
// 3. Click en "Subir Imágenes"
// 4. Sistema responde:
{
  "filename": "alunizaje-apolo11.jpg",
  "imageUrl": "/images/eventos/alunizaje-apolo11.jpg",
  "originalName": "alunizaje-apolo11.jpg",
  "size": 2097152
}
// 5. Usuario copia URL: /images/eventos/alunizaje-apolo11.jpg
// 6. En Excel, en la columna imageUrl escribe: /images/eventos/alunizaje-apolo11.jpg
  "filename": "event-1705670400-987654321.png",
  "imageUrl": "/images/eventos/event-1705670400-987654321.png",
  "originalName": "logo.png",
  "size": 2097152
}
// 4. Usuario renombra sus archivos con nombres descriptivos:
//    - primera-guerra-mundial.jpg
//    - segunda-guerra-mundial.jpg
//    - revolucion-industrial.png
//    - renacimiento-italiano.jpg
//    - descubrimiento-america.webp
// 2. Selecciona los 5 archivos
// 3. Sistema muestra lista con los nombres originales
// 4. Click en "Subir Imágenes"
// 5. Sistema responde con array de 5 URLs manteniendo los nombres
// 6. Usuario copia las URLs para usar en Excel
//    - foto2.jpg (1.5 MB)
//    - foto3.png (2.1 MB)
//    - foto4.jpg (900 KB)
//    - foto5.webp (1.8 MB)
// 3. Click en "Subir Imágenes"
// 4. Sistema responde con array de 5 URLs
// 5. Usuario copia las URLs necesarias
```

## 🚀 Próximas Mejoras

- [ ] Drag & Drop real para subir archivos
- [ ] Preview de imágenes antes de subir
- [ ] Galería de imágenes subidas previamente
- [ ] Eliminar imágenes ya subidas
- [ ] Redimensionamiento automático
- [ ] Optimización de imágenes (webp conversion)
- [ ] Búsqueda en galería
- [ ] Categorización de imágenes

## 📖 Referencias

- [Multer Documentation](https://github.com/expressjs/multer)
- [Angular FormData](https://angular.io/api/common/http/HttpClient)
- [MDN - File API](https://developer.mozilla.org/en-US/docs/Web/API/File)

---

**Desarrollado con ❤️ para Epicstoria**
