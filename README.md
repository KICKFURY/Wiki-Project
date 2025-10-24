# Wiki de Saberes Compartidos

## Descripción General

**Wiki de Saberes Compartidos** es una aplicación móvil colaborativa diseñada para compartir conocimiento de manera comunitaria. Inspirada en wikis tradicionales, permite a los usuarios crear, editar y descubrir recursos educativos y de información en diversas categorías como Tecnología, Ciencia, Arte, Historia, Deportes y más. La app enfatiza la colaboración en tiempo real, permitiendo que múltiples usuarios editen recursos simultáneamente, sigan a autores, comenten y valoren el contenido.

La aplicación está desarrollada como un stack full-stack:
- **Frontend**: Aplicación móvil construida con Expo y React Native, compatible con iOS, Android y web.
- **Backend**: API RESTful con Node.js, Express, MongoDB (via Mongoose) y Socket.IO para funcionalidades en tiempo real.

El proyecto sigue principios SOLID en el backend para una arquitectura limpia, mantenible y escalable. El frontend utiliza hooks personalizados, servicios modulares y componentes reutilizables para una experiencia fluida.

## Funcionalidades Principales

### Autenticación y Gestión de Usuarios
- **Registro**: Los usuarios se registran con DNI, nombre de usuario, email y contraseña. Rol por defecto: 'user' (puede ser 'admin').
- **Login**: Autenticación con email y contraseña. Almacena el `userId` en AsyncStorage para sesiones persistentes.
- **Perfil de Usuario**: Dashboard personal con estadísticas (seguidores, artículos creados, likes dados). Muestra los top 3 artículos por vistas con barras de progreso.
- **Lista de Usuarios**: Explora otros usuarios, sigue/deja de seguir autores para recibir actualizaciones.
- **Lógica**: Usa servicios dedicados (`auth.service.ts`, `user.service.ts`) para llamadas API. Middleware de autenticación en backend verifica tokens/IDs de usuario.

### Gestión de Recursos (Artículos/Wikis)
- **Inicio (Home)**: Lista de recursos con búsqueda por título/categoría/autor y filtros por categoría (Popular, Tecnología, etc.). Soporte para pull-to-refresh y carga inicial.
- **Crear/Editar Recurso**: Formulario con título, contenido (multilínea), categoría (dropdown), URL de imagen y etiquetas (separadas por comas). Validación de campos requeridos.
  - **Colaboración en Tiempo Real**: Usa Socket.IO para sesiones de edición multiusuario. Indicadores de escritura (typing), conteo de colaboradores e invitación via modal. Al crear, genera una sesión temporal que se transfiere al ID real del recurso guardado.
- **Detalle de Recurso**: Vista completa con título, autor, categoría, imagen, contenido, etiquetas. Botón para seguir al autor (si no es el propio).
- **Acciones del Autor**: En home, long-press permite editar (navega a create con ID) o eliminar recursos propios.
- **Lógica**: Recursos mapeados de backend con campos como `_id`, `title`, `category.name`, `author.username`, `image`. Servicios (`recurso.service.ts`) manejan CRUD. En backend, modelos Mongoose para `recurso`, `category`, con relaciones (author, category).

### Comentarios y Interacciones
- **Agregar Comentarios**: En detalle, input para nuevo comentario (requiere auth). Se agrega al final de la lista.
- **Likes en Comentarios**: Toggle like/dislike por usuario (❤️/🤍 con conteo). Actualiza estado local optimistamente.
- **Seguir/ Dejar de Seguir**: En detalle y lista de usuarios. Actualiza contadores de followers/following en tiempo real.
- **Lógica**: Endpoint `/api/comments` para CRUD, con likes como array de userIds. Hooks como `useFollow` manejan estado de following.

### Navegación y UI/UX
- **Navegación**: Stack Navigator con rutas: `/` (bienvenida/login/register), `/home`, `/create`, `/detail?id=...`, `/profile`, `/users`.
- **Bottom Navigation**: Íconos para Home, Crear, Usuarios, Perfil.
- **Componentes Reutilizables**: `ThemedView/Text`, `Button`, `Input`, `LoadingSpinner`, `ErrorMessage`, `UserList/Item`. Efectos como parallax y partículas en algunos componentes.
- **Tema**: Soporte para light/dark mode via hooks (`use-color-scheme`).
- **Otras Features**: Haptics para feedback táctil, validación de formularios, manejo de errores (alerts), imágenes placeholder.

### Funcionalidades en Tiempo Real (Socket.IO)
- **Edición Colaborativa**: Eventos como `content-updated`, `title-updated`, `user-typing`, `collaborators-updated`. Salas por recurso/ID de sesión.
- **Lógica**: SocketService en backend maneja joins/leaves, broadcasts. Frontend conecta via `socket.io-client`, emite updates solo si no es el usuario actual (evita loops).

## Arquitectura y Estructura del Proyecto

El proyecto es un monorepo con dos carpetas principales:

### Wiki-Backend (Servidor API)
- **Tecnologías**: Node.js (ES modules), Express, Mongoose (MongoDB), Socket.IO, CORS, dotenv.
- **Estructura** (Siguiendo SOLID):
  - **models/**: Esquemas Mongoose (`usuario.js`, `recurso.js`, `comment.js`, `category.js`, `revision.js`).
  - **controllers/**: Manejan requests/responses (`userController.js`).
  - **interfaces/**: Abstracciones TypeScript-like (`IUserController.js`, `IUserRepository.js`, `IUserService.js`).
  - **middleware/**: Auth (`auth.js`), validación (`validation.js`).
  - **repositories/**: Acceso a datos (`userRepository.js`).
  - **routes/**: Rutas modulares (`users.js`, `recurso.js`, `comment.js`, etc.).
  - **services/**: Lógica de negocio (`userService.js`).
  - **sockets/**: Manejo de WebSockets (`socketService.js`).
  - **utils/**: Contenedor de dependencias (`container.js`), config de servidor (`serverConfig.js`).
  - **index.js**: Punto de entrada, configura middleware, DB, sockets, rutas.
- **Lógica**: Inyección de dependencias via contenedor. Endpoints como `/api/usuarios/login`, `/api/recursos`, `/api/comments`. Seeders para datos iniciales (`seed.js`).
- **Despliegue**: Vercel (ver `vercel.json`), puerto 4000 local.

### wiki-frontend (App Móvil)
- **Tecnologías**: Expo SDK 54, React Native 0.81, React 19, TypeScript, Tailwind (via clsx/cva), MUI, GSAP (animaciones), Socket.IO-client, AsyncStorage.
- **Estructura**:
  - **app/**: Rutas file-based (`_layout.tsx`, `index.tsx` (auth), `home.tsx`, `create.tsx`, `detail.tsx`, `profile.tsx`, `users.tsx`).
  - **components/**: UI reutilizables (`ui/button.tsx`, `FormInput.tsx`, `InviteCollaboratorsModal.tsx`, efectos como `Particles.tsx`).
  - **src/**: Lógica core.
    - **constants/**: Endpoints (`endpoints.ts`), tema (`theme.ts`).
    - **hooks/**: Estado (`useAuth.ts`, `useRecursos.ts`, `useFollow.ts`, `useInviteCollaborators.ts`).
    - **services/**: API calls (`api.ts`, `auth.service.ts`, `recurso.service.ts`, `user.service.ts`).
    - **types/**: Interfaces (`index.ts`).
    - **utils/**: Validación (`validation.ts`).
  - **assets/**: Imágenes (iconos, logos).
  - **package.json**: Scripts como `expo start`, dependencias para navegación, icons, etc.
- **Lógica**: Hooks para estado (e.g., `useRecursos` fetches/maneja recursos). Servicios encapsulan fetch con baseURL dinámica (local/vercel). Arquitectura modular con SRP (Single Responsibility Principle) en hooks/services.
- **Desarrollo**: `npx expo start` para iOS/Android/web. Reset project via script.

### Integración Full-Stack
- Frontend llama backend via fetch (e.g., `http://localhost:4000/api/...` o localhost:4000).
- Real-time: Sockets conectan a backend para colaboración.
- DB: MongoDB Atlas (via MONGO_URI en .env).

## Instalación y Configuración

### Requisitos
- Node.js >=18
- MongoDB (local o Atlas)
- Expo CLI: `npm install -g @expo/cli`

### Backend (Wiki-Backend)
1. `cd Wiki-Backend`
2. `npm install`
3. Crea `.env` con `MONGO_URI=mongodb://...` y `PORT=4000`
4. `npm run dev` (usa nodemon)
5. Seed datos: `npm run seed`
6. API disponible en `http://localhost:4000/api`

### Frontend (wiki-frontend)
1. `cd wiki-frontend`
2. `npm install`
3. `npx expo start`
4. Abre en Expo Go (móvil) o emulador.
5. Para web: `npx expo start --web`

### Despliegue
- Backend: Vercel (push a Git, configura env vars).
- Frontend: Expo EAS Build para stores, o `expo export` para web.

## Progreso y TODOs
- **Completado**: Auth, CRUD recursos/comentarios, follow, colaboración real-time, refactor SOLID en backend.
- **Pendiente** (de TODO_SOLID.md): Refactor más hooks/services, tests unitarios, React Query para caching, paginación, error boundaries.
- **Mejoras**: Autenticación JWT (actual: session via userId), upload de imágenes, notificaciones push.

## Contribución
- Usa branches `feature/...`.
- Pruebas: Agrega unit tests con Jest.
- Issues: Reporta bugs o features.

Para más detalles, consulta `Wiki-Backend/README_SOLID.md` y `wiki-frontend/TODO_SOLID.md`.

¡Únete a compartir saberes!
