# Desarrollo

Cómo se construye el sitio y qué archivo termina viendo el navegador.

## Qué carga cada página

| Se edita | Lo publica el navegador |
| --- | --- |
| `css/global.css` | `css/global.min.css?v=20260801` |
| `js/main.js` | `js/main.min.js` |
| `js/site-config.js` | el mismo archivo |
| `css/normalize.css` | el mismo archivo |

`global.css` concentra las variables de marca al inicio de `:root` (colores y fuentes). Un cambio ahí recorre header, tarjetas, formulario y entradas.

`main.js` cubre, en este orden: aviso de cookies, menú móvil, header al hacer scroll, botones de compartir, validación del formulario y eventos de Analytics. Analytics solo corre si `localStorage.ga_consent` vale `granted`.

`site-config.js` expone `window.SITE_CONFIG.hcaptchaEnabled`. En `true`, el envío espera el token de hCaptcha que inyecta el script de Web3Forms.

`.gitignore` nombra `templates-blog/`, `css/styles.css` y `js/main.js`, pero esos archivos ya estaban en Git, así que siguen versionados. El sitio publicado usa `global.min.css` y `main.min.js`.

## Vista local

```bash
python3 -m http.server 8000
```

Abre [http://127.0.0.1:8000](http://127.0.0.1:8000). Sirve la carpeta del repositorio: `index.html` en la raíz y las páginas de `compartir/`, `herramientas/` y `proyecto/` con sus rutas relativas.

Mientras revisas estilos, puedes apuntar una página a `global.css` y `main.js` para ver el cambio al recargar. Antes de subir, vuelve a los archivos minificados.

## Minificar y caché

Después de editar los fuentes, regenera los minificados desde la raíz:

```bash
npx --yes clean-css-cli -o css/global.min.css css/global.css
npx --yes terser js/main.js -c -m -o js/main.min.js
```

Esos comandos descargan las herramientas una vez y no agregan un `package.json`.

El CSS lleva un query de versión, hoy `?v=20260801`, en el `<link>` de cada HTML. Si cambias `global.min.css`, sustituye esa fecha por la del día (`?v=AAAAMMDD`) en **todas** las páginas, preload y stylesheet. Si no, el navegador y Cloudflare pueden seguir sirviendo el CSS anterior. `main.min.js` no lleva query: al publicarlo, conviene recargar sin caché una vez para confirmar.

`site-config.js` y `normalize.css` no se minifican.

## Publicar

El sitio sale de la rama `main` por GitHub Pages. `CNAME` fija el dominio `gregoriaventuras.xyz` y `.nojekyll` hace que Pages entregue HTML, CSS y JS sin pasarlos por Jekyll. Cloudflare queda delante del dominio; las cabeceras se configuran en el panel, no en el repositorio. El detalle está en [cloudflare-setup.md](cloudflare-setup.md).

Un push a `main` es el deploy. No hay workflow de GitHub Actions.

## Dominios externos

Cada HTML repite la misma política en `<meta http-equiv="Content-Security-Policy">`. Cloudflare aplica otra igual, documentada en [cloudflare-setup.md](cloudflare-setup.md). Si una página nueva carga un script, una fuente, una imagen de otro dominio, un `fetch` o un iframe, hay que sumar ese origen en los dos lugares. Si solo se actualiza el meta, el navegador igual bloquea el recurso cuando Cloudflare envía su propia cabecera.

Hoy la política permite, entre otros: Google Analytics y Tag Manager, Web3Forms, hCaptcha, Cloudflare Insights, Google Fonts y el CDN de Bootstrap Icons.

## Formulario

El formulario vive solo en `index.html` (`#form`). Hace `POST` a `https://api.web3forms.com/submit`, con:

- `access_key`, en el HTML y en el panel de Web3Forms.
- `redirect` hacia `https://gregoriaventuras.xyz/gracias.html`.
- `botcheck` oculto, el campo trampa de Web3Forms.
- hCaptcha, activado en el plan Free del panel y leído por `site-config.js`.

`main.js` valida nombre, correo, propósito y mensaje antes de dejar salir el envío, y guarda `sessionStorage.ga_form_submitted`. `gracias.html` registra el evento de Analytics solo si esa marca tiene menos de dos minutos y la persona aceptó cookies.

El dominio permitido en Web3Forms es `gregoriaventuras.xyz`. Un envío desde `localhost` puede rechazarse aunque el formulario se vea bien.

## Script de mantenimiento

`scripts/update-html.py` fue una pasada única: insertó la CSP, el consentimiento de Analytics, el logo en SVG, el enlace de privacidad y el canonical del proyecto. Tiene la raíz fija en `/workspace` y se salta `templates-blog/`. No forma parte de publicar una entrada. Para contenido nuevo, sigue [contenido.md](contenido.md) y parte de una página ya publicada.

## Plantillas

`templates-blog/` guarda cuatro puntos de partida (`template-compartir.html`, `template-proyectos.html`, `template-recursos.html`, `apoyo.html`). Les falta lo que las páginas vivas ya tienen: CSP, consentimiento de Analytics, Bootstrap Icons con integridad, `global.min.css` y `main.min.js`. Si se reutiliza una plantilla, hay que igualarla con la página publicada equivalente antes de subirla.

## Páginas que no son contenido

| Archivo | Notas |
| --- | --- |
| `404.html` | `noindex, nofollow`. El canonical apunta al inicio |
| `gracias.html` | Lleva `noindex, nofollow` y `robots.txt` también la excluye. No va en el sitemap |
| `privacidad.html` | Está en el sitemap con prioridad baja. El aviso de cookies apunta aquí |
| `site.webmanifest` | Nombre, color `#2C3E50` e iconos de la app |

Los comentarios `CAMBIO` y `CORRECCIÓN` dentro del HTML son notas de ediciones anteriores. El navegador no los muestra.
