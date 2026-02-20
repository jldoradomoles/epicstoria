# Migración: Campos de Perfil de Usuario

## Cambios implementados

Se han añadido tres nuevos campos al perfil de usuario:

- **Apodo (nickname)**: Campo de texto opcional
- **Fecha de nacimiento (birth_date)**: Campo de fecha opcional
- **País (country)**: Campo de texto/selector opcional

## Para bases de datos existentes

### Opción 1: Ejecutar el script de migración principal (recomendado)

El script principal de migración ya incluye la adición de estas columnas:

```bash
cd backend
npm run db:migrate
```

Este comando ejecutará todas las migraciones, incluida la adición de las nuevas columnas si no existen.

### Opción 2: Ejecutar solo la migración de campos de perfil

Si prefieres ejecutar solo esta migración específica:

```bash
cd backend
npm run db:migrate-user-profile
```

## Impacto en usuarios existentes

✅ **Sin impacto en usuarios existentes**:

- Los tres campos nuevos permiten valores NULL
- Se usan `ADD COLUMN IF NOT EXISTS` para evitar errores si ya existen
- Los usuarios existentes tendrán estos campos vacíos (NULL) hasta que los completen
- La aplicación maneja correctamente valores NULL/undefined en todos los campos

## Verificación

Para verificar que las columnas se añadieron correctamente, ejecuta en PostgreSQL:

```sql
\d users
```

Deberías ver las nuevas columnas:

- `nickname` (varchar(100))
- `birth_date` (date)
- `country` (varchar(100))

## Actualización de usuarios

Los usuarios pueden actualizar estos campos:

1. **En registro**: Al crear una cuenta nueva, pueden completar estos campos opcionalmente
2. **En perfil**: En la sección "Datos Personales" de su perfil, pueden editar y guardar estos campos en cualquier momento
