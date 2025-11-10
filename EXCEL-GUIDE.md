# 🚀 Guía Rápida: Excel a JSON

## Paso 1: Crear la plantilla Excel

```bash
npm run excel:template
```

Esto crea `eventos-plantilla.xlsx` con ejemplos.

## Paso 2: Editar el Excel

1. Abre `eventos-plantilla.xlsx`
2. Edita los eventos existentes o agrega nuevos
3. **Importante**: Usa `||` para separar:
   - Párrafos en `summary`, `context` y `consequences`
   - Items en `keyFacts`: `Título|Descripción||Título|Descripción`
   - Items en `timeline`: `Fecha|Evento||Fecha|Evento`

## Paso 3: Convertir a JSON

```bash
npm run excel:convert eventos-plantilla.xlsx
```

Esto genera `public/data/events.json` automáticamente.

## 📋 Columnas del Excel

| Columna      | Formato                          | Ejemplo                                          |
| ------------ | -------------------------------- | ------------------------------------------------ |
| id           | slug (sin espacios)              | `apolo-11`                                       |
| title        | Texto libre                      | `Alunizaje del Apolo 11`                         |
| date         | DD-MM-YYYY o YYYY-MM-DD          | `20-07-1969` o `1969-07-20`                      |
| category     | Texto                            | `Ciencia`                                        |
| imageUrl     | Ruta                             | `/images/apolo-11.jpg`                           |
| summary      | Párrafos con `\|\|`              | `Párrafo 1\|\|Párrafo 2`                         |
| context      | Párrafos con `\|\|`              | `Párrafo 1\|\|Párrafo 2`                         |
| keyFacts     | `Título\|Desc\|\|Título\|Desc`   | `Hecho 1\|Info 1\|\|Hecho 2\|Info 2`             |
| timeline     | `Fecha\|Evento\|\|Fecha\|Evento` | `16-07-1969\|Lanzamiento\|\|20-07-1969\|Llegada` |
| consequences | Párrafos con `\|\|`              | `Impacto 1\|\|Impacto 2`                         |

## ✅ ¡Listo!

Recarga tu aplicación y verás los nuevos eventos.
