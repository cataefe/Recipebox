# RecipeBox

PWA de recetas construida a partir del diseño **RecipeBox · Estilo pastel** de Claude Design
(5 pantallas: Mis Recetas → Nueva Receta → Detalle → Modo Cocina → ¡Listo!).

**Stack:** Vite + React + Tailwind CSS · Supabase (datos y autenticación) · Vercel (publicación) · `vite-plugin-pwa` (instalable y funciona sin conexión).

## Correr en local

```bash
npm install
npm run dev
```

Sin variables de entorno la app funciona en **modo local**: sin inicio de sesión, con las recetas de ejemplo guardadas en el navegador.

## Conectar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com).
2. En **SQL Editor**, ejecuta [`supabase/schema.sql`](supabase/schema.sql). Crea la tabla `recipes` con RLS (cada persona ve solo sus recetas) y el bucket `recipe-photos` para las fotos de portada.
3. Copia `.env.example` como `.env.local` y completa `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY` (Project Settings › API).
4. En **Authentication › URL Configuration**, agrega tu URL local y la de Vercel como *Redirect URLs* (para el correo de confirmación).

Con Supabase configurado, la app pide iniciar sesión (correo y contraseña). Una cuenta nueva puede tocar **Cargar recetas de ejemplo**.

## Publicar en Vercel

1. Sube el proyecto a GitHub e impórtalo en [vercel.com/new](https://vercel.com/new). Vercel detecta Vite solo.
2. En **Settings › Environment Variables**, agrega `VITE_SUPABASE_URL` y `VITE_SUPABASE_ANON_KEY`.
3. Deploy. `vercel.json` ya redirige las rutas de la app a `index.html` y evita que el service worker quede en caché.

## Qué hace cada pantalla

| Pantalla | Ruta | Funciones |
| --- | --- | --- |
| Mis Recetas | `/` | Búsqueda por título o ingrediente, filtro por categoría, "Lo último que cocinaste" |
| Nueva Receta | `/nueva` | Validación del título, borrador automático, foto de portada, detecta cantidades y minutos |
| Detalle | `/receta/:id` | Checklist de ingredientes, "Mi versión", eliminar, interruptor Manos libres |
| Modo Cocina | `/receta/:id/cocinar` | Paso a paso, temporizador con aviso, tamaño de letra, pantalla siempre encendida (Wake Lock), deslizar para avanzar |
| ¡Listo! | `/receta/:id/listo` | Registra que la cocinaste y guarda "Mis cambios" |

## Créditos de fotos

Wikimedia Commons, licencia CC BY-SA. Pastel de choclo: Paloma Baytelman (2.0) · Charquicán: Pablo Lobos Ovalle · Empanadas: E4024 · Ensalada chilena: Diegostraight.

Leche asada y Calzones rotos: fotos sacadas de sitios de recetas (Paulina Cocina y Señor Señor). Verificar los derechos o reemplazarlas antes de publicar la app.
