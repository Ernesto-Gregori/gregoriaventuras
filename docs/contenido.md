# Publicar contenido

Guía para sumar una entrada, una herramienta o un proyecto sin tocar el diseño del sitio. El modelo vivo es la entrada más reciente en `compartir/`, hoy `compartir/septiembre-octubre-2026.html`. Copia esa página. Las plantillas de `templates-blog/` conservan el marcado viejo (sin CSP, sin consentimiento de Analytics y con `global.css` en lugar de `global.min.css`).

## Nueva entrada de Compartir

1. Duplica la entrada más reciente como `compartir/mes-mes-año.html`. Ejemplo: `compartir/noviembre-diciembre-2026.html`. Minúsculas, guiones y sin tildes.
2. En el `<head>`, cambia el título, la descripción, las palabras clave, el canonical, Open Graph, Twitter Card y los dos bloques Schema (`BlogPosting` y `BreadcrumbList`).
3. El canonical, `og:url` y `mainEntityOfPage` tienen que ser la URL completa de **esta** página, por ejemplo `https://gregoriaventuras.xyz/compartir/noviembre-diciembre-2026.html`.
4. En Schema, `datePublished` y `dateModified` usan hora de El Salvador: `2026-11-06T10:00:00-06:00`. Ajusta `wordCount` si el texto cambió de largo.
5. Dentro de `<body>`, actualiza la fecha visible, el `h1`, las migas de pan, el texto y las fotos. Los enlaces internos de una página dentro de `compartir/` empiezan con `../` (`../index.html`, `../img/...`, `../css/...`, `../proyecto/...`).
6. Deja el bloque de Google Analytics, la etiqueta CSP y los scripts del final como están, salvo que esta entrada necesite un dominio externo nuevo. En ese caso, mira [CSS, JavaScript y dominios externos](desarrollo.md#dominios-externos).

La portada solo muestra tres tarjetas. La entrada anterior sigue publicada y enlazada desde el sitemap.

### Tarjeta en el inicio

En `index.html`, sección `#nuestra-aventura`, el bloque a copiar es un `<article class="blog-card tarjeta-ga">`. Pégalo como primera tarjeta y quita la tercera, para que el inicio siga mostrando las tres más nuevas.

Cada tarjeta lleva:

- `<picture>` con WebP de 800 px (desde 768 px) y de 400 px, y un JPG de 800 px como respaldo.
- Fecha visible, por ejemplo `06 noviembre, 2026`.
- Título y un resumen de una o dos líneas.
- Enlace «Leer más» a `compartir/....html`, con un `aria-label` que nombre la entrada.

## Sitemap

Agrega la URL nueva en `sitemap.xml`, justo después de la portada:

```xml
<url>
  <loc>https://gregoriaventuras.xyz/compartir/noviembre-diciembre-2026.html</loc>
  <lastmod>2026-12-01</lastmod>
  <changefreq>monthly</changefreq>
  <priority>0.8</priority>
  <image:image>
    <image:loc>https://gregoriaventuras.xyz/img/foto-1200.jpg</image:loc>
    <image:title>Descripción corta de la foto</image:title>
  </image:image>
</url>
```

`lastmod` es la fecha de publicación, `AAAA-MM-DD`. Si corriges una entrada ya publicada, actualiza su `lastmod` y el `dateModified` del Schema. Las entradas viejas se quedan en el sitemap.

`robots.txt` ya permite todo el sitio salvo `js/`, `css/`, `gracias.html` y `404.html`. Una página nueva de contenido no necesita una línea ahí.

Search Console a veces tarda en volver a leer el sitemap. Si marca que no pudo obtenerlo, los pasos están en [cloudflare-setup.md](cloudflare-setup.md).

## Imágenes

Guárdalas en `img/`. Nombre en minúsculas, con guiones y sin espacios ni tildes. En el repositorio ya conviven pares como `neto-ensenando` / `neto-enseñando`: los archivos nuevos usan solo ASCII, para no duplicar la misma foto.

| Uso | Archivos | Dónde se referencia |
| --- | --- | --- |
| Foto principal y Open Graph | `nombre-1200.jpg`, `nombre-1200.webp`, `nombre-800.webp`, `nombre-400.webp` | Entrada y `og:image` (el JPG, con URL absoluta) |
| Tarjeta del inicio | `nombre-800.jpg`, `nombre-800.webp`, `nombre-400.webp` | `index.html` |
| Foto dentro del texto | `nombre-800.jpg`, `nombre-800.webp`, `nombre-400.webp` | La entrada, con `loading="lazy"` |

Open Graph usa el JPG de 1200 px. Varias redes leen mal el WebP. El `alt` describe la escena, no el nombre del archivo.

Ejemplo del `<picture>` de una foto principal:

```html
<picture>
  <source media="(min-width: 1024px)" srcset="../img/nombre-1200.webp" type="image/webp">
  <source media="(min-width: 768px)"  srcset="../img/nombre-800.webp"  type="image/webp">
  <source                              srcset="../img/nombre-400.webp"  type="image/webp">
  <img src="../img/nombre-1200.jpg" alt="Qué se ve en la foto" width="1200" height="645" fetchpriority="high">
</picture>
```

En las fotos que están debajo del primer pantallazo, cambia `fetchpriority="high"` por `loading="lazy" decoding="async"`.

Para generar los tamaños, cualquier editor que exporte WebP sirve. Con ImageMagick y `cwebp`:

```bash
magick origen.jpg -resize 1200x img/nombre-1200.jpg
magick origen.jpg -resize 800x  img/nombre-800.jpg
cwebp -q 80 img/nombre-1200.jpg -o img/nombre-1200.webp
cwebp -q 80 img/nombre-800.jpg  -o img/nombre-800.webp
magick origen.jpg -resize 400x img/nombre-400.png
cwebp -q 80 img/nombre-400.png -o img/nombre-400.webp
```

El ancho de 400 px suele existir solo en WebP: el JPG de respaldo es el de 800 o el de 1200, según la tabla de arriba.

## Herramientas

Las tres categorías viven en:

- `herramientas/devocionales.html`
- `herramientas/estudio-biblico.html`
- `herramientas/ministerio.html`

Para recomendar un recurso más, duplica un bloque `.recurso-alt` dentro de `.recursos-alt-grid` y cambia el enlace, el ícono de Bootstrap Icons, el título, el párrafo y el `aria-label`. El enlace externo lleva `target="_blank"` y `rel="noopener noreferrer"`.

El bloque `.recurso-principal` es el recurso que Ernesto y Diana usan. Hay uno por página. El aviso de «Curaduría, no creación» se queda: estas páginas enlazan a la fuente original.

Una categoría nueva implica una página en `herramientas/`, una tarjeta en `#herramientas` de `index.html` y una entrada en `sitemap.xml` con `priority` `0.7`.

## Proyectos

`#se-parte` en `index.html` explica el patrón en sus propios comentarios: se duplica `<article class="proyecto-card">` y se cambian ícono, etiqueta, título, texto y enlace. La página larga del apoyo mensual es `proyecto/apoyo-mensual-pilar-aventura.html`. Sirve de modelo para un proyecto nuevo, con las mismas reglas de canonical, Schema y rutas `../`.

La tarjeta `proyecto-card--pronto` es el espacio «Próximamente». Se reemplaza cuando el proyecto ya tiene página.

## Lista antes de publicar

- El canonical y las metas sociales apuntan a la URL nueva, no al inicio.
- Las rutas de CSS, JS, favicon e imágenes usan `../` en páginas de una carpeta.
- La foto principal tiene JPG y WebP, y el `alt` describe la imagen.
- La tarjeta nueva está de primera en el inicio y el inicio sigue con tres tarjetas.
- `sitemap.xml` incluye la URL y la imagen, con `lastmod` de hoy.
- El texto se lee bien en el servidor local, en ancho de escritorio y en un ancho estrecho (el menú hamburguesa abre y cierra).
