# SPEC 01 — Registro e inicio de sesión con Google

**Estado:** Draft
**Fecha:** 2026-11-05
**Depende de:** —
**Objetivo:** Permitir a los usuarios de Epicstoria registrarse e iniciar sesión usando su cuenta de Google mediante Google Identity Services.

---

## Alcance

### Incluido
- Botón "Continuar con Google" en `/login` y `/register`
- Servicio Angular `GoogleAuthService` que carga GSI y gestiona el flujo OAuth
- Nuevas interfaces de modelo: `GoogleAuthRequest` y `GoogleLinkRequest`
- Endpoint backend `POST /auth/google` en Express que verifica el `id_token`, crea o autentica al usuario
- Campo `google_id` en la tabla `users` de la base de datos
- Flujo de vinculación con confirmación cuando el email ya existe con contraseña

### No incluido
- Inicio de sesión con otros proveedores (Facebook, Twitter, etc.)
- Desvinculación de cuenta Google desde el perfil
- Foto de perfil importada desde Google (`picture`)
- Cambio de contraseña para cuentas creadas solo con Google
- Apellido (`lastname`) importado desde Google

---

## Modelo de datos

### Nuevas interfaces en `src/app/models/user.model.ts`

```typescript
export interface GoogleAuthRequest {
  idToken: string;
  linkConfirmed?: boolean; // true cuando el usuario confirma vincular una cuenta existente
}

export interface GoogleAuthLinkNeededResponse {
  success: false;
  code: 'ACCOUNT_EXISTS';
  message: string;
}
```

### Cambio en base de datos (backend)

Tabla `users`: añadir columna `google_id VARCHAR(255) NULL UNIQUE`.

---

## Plan de implementación

### Paso 1 — Backend: migración de base de datos
Añadir columna `google_id` a la tabla `users`. La columna es nullable para no romper los usuarios existentes.

### Paso 2 — Backend: instalar google-auth-library
```
npm install google-auth-library
```

### Paso 3 — Backend: endpoint `POST /auth/google`
Crear el endpoint en el router de autenticación (`/api/auth/google`):

1. Recibir `{ idToken, linkConfirmed? }` en el body.
2. Verificar `idToken` con `google-auth-library` usando el `CLIENT_ID` de Google.
3. Extraer del payload: `sub` (google_id), `email`, `given_name`.
4. Buscar usuario por `google_id`:
   - Si existe → devolver `AuthResponse` (autenticar).
5. Buscar usuario por `email`:
   - Si existe y `linkConfirmed !== true` → devolver `{ success: false, code: 'ACCOUNT_EXISTS', message: '...' }` (HTTP 409).
   - Si existe y `linkConfirmed === true` → actualizar `google_id`, devolver `AuthResponse`.
6. Si no existe ningún usuario → crear nuevo usuario con `name = given_name`, `email`, `google_id`, `password = null`. Devolver `AuthResponse`.

La respuesta exitosa usa el mismo `AuthResponse` que ya usa `POST /auth/login`.

### Paso 4 — Frontend: añadir `GOOGLE_CLIENT_ID` al environment

```typescript
// src/environments/environment.ts
export const environment = {
  production: false,
  apiUrl: 'http://localhost:3000/api',
  useStaticData: false,
  googleClientId: 'TU_CLIENT_ID_DE_GOOGLE_CONSOLE',
};
```

Añadir la misma clave a `environment.prod.ts` y `environment.ionos.ts`.

### Paso 5 — Frontend: `GoogleAuthService`

Crear `src/app/services/google-auth.service.ts`:
- Método `loadGSI()`: carga dinámicamente el script `https://accounts.google.com/gsi/client` si no está ya en el DOM.
- Método `initialize(callback: (credential: string) => void)`: llama a `google.accounts.id.initialize(...)` con el `clientId` del environment.
- Método `renderButton(element: HTMLElement)`: llama a `google.accounts.id.renderButton(...)`.
- Método `signInWithGoogle(idToken: string, linkConfirmed?: boolean): Observable<AuthResponse>`: hace `POST /auth/google` y maneja la respuesta. Si la respuesta es HTTP 409 con `code: 'ACCOUNT_EXISTS'`, re-lanza el error para que el componente lo gestione.

### Paso 6 — Frontend: añadir interfaces al modelo

Añadir `GoogleAuthRequest` y `GoogleAuthLinkNeededResponse` a `src/app/models/user.model.ts`.

### Paso 7 — Frontend: actualizar `LoginComponent`

- Añadir `GoogleAuthService` como dependencia (vía `inject()`).
- En `ngOnInit`: cargar GSI, llamar a `initialize()` con el callback que llama a `signInWithGoogle`.
- Añadir en el template un contenedor `<div #googleBtn></div>` donde GSI renderiza el botón nativo.
- Gestionar el caso `ACCOUNT_EXISTS`: mostrar modal/mensaje de confirmación de vinculación. Si el usuario acepta, llamar de nuevo con `linkConfirmed: true`.

### Paso 8 — Frontend: actualizar `RegisterComponent`

Mismo patrón que el paso 7. El flujo es idéntico: si el email ya existe, se muestra la confirmación de vinculación.

### Paso 9 — Frontend: modal de confirmación de vinculación

Añadir en los componentes de login y register (o como componente compartido) un bloque `@if` que muestre el mensaje de confirmación:

> "Ya existe una cuenta con este email. ¿Quieres vincular tu cuenta de Google con ella?"
> [Cancelar] [Vincular]

Al confirmar, se llama de nuevo a `signInWithGoogle(pendingIdToken, true)`.

---

## Criterios de aceptación

- [ ] El botón "Continuar con Google" aparece visible en `/login` y en `/register`.
- [ ] Al hacer clic, se abre el selector de cuenta de Google.
- [ ] Un usuario nuevo que selecciona su cuenta Google queda autenticado y redirigido a `/`.
- [ ] El usuario nuevo tiene `name` = `given_name` de Google y `email` = email de Google en la base de datos.
- [ ] Un usuario existente (registrado con Google) puede iniciar sesión con Google y queda autenticado.
- [ ] Un usuario existente (registrado con email/contraseña) que intenta entrar con Google ve el modal de confirmación de vinculación.
- [ ] Si el usuario confirma la vinculación, queda autenticado y la columna `google_id` queda actualizada.
- [ ] Si el usuario cancela la vinculación, no ocurre ningún cambio y vuelve al formulario.
- [ ] Si la verificación del `id_token` falla en el backend, se muestra un mensaje de error en el formulario.
- [ ] Los archivos de environment (`environment.ts`, `environment.prod.ts`, `environment.ionos.ts`) tienen la clave `googleClientId`.
- [ ] El flujo funciona correctamente en SSR (el script de GSI solo se carga en el navegador).

---

## Decisiones tomadas y descartadas

| Decisión | Elegida | Descartada | Motivo |
|---|---|---|---|
| Estrategia OAuth | Google Identity Services | Firebase, angular-oauth2-oidc | Sin dependencias extra, es la librería oficial de Google para web |
| Qué datos importar | `name` + `email` | + `lastname`, + foto | Mantener datos mínimos; el perfil se completa después |
| Vinculación de cuentas duplicadas | Con confirmación del usuario | Transparente / Error | Mejor UX: el usuario entiende qué va a pasar |
| Alcance del spec | Frontend + backend | Solo frontend | El endpoint no existe, hay que crearlo |
| Foto de perfil de Google | No importada | Importada | El proyecto tiene su propio sistema de avatares por niveles |

---

## Riesgos identificados

- **SSR (Angular Universal):** GSI accede a `window` y `document`. El `loadGSI()` debe protegerse con `isPlatformBrowser`.
- **`CLIENT_ID` en el frontend:** Es público por diseño en OAuth2 (no es un secret), pero debe quedar fuera del control de versiones si se usa el mismo para producción. Documentar en `.env` del backend.
- **Usuarios sin contraseña:** Los creados solo con Google tienen `password = null` en la BD. Si en el futuro se añade "cambiar contraseña", hay que gestionar este caso.
- **Token de Google expira:** El `id_token` de GSI tiene una vida corta (~1h). Si el usuario tarda en confirmar la vinculación, el token puede haber expirado. El backend debe devolver un error claro en ese caso.
