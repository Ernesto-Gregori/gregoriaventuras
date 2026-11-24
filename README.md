# Gregori Aventuras

Sitio de Ernesto y Diana Gregori: una aventura de fe en compañía. Es un sitio estático en HTML, CSS y JavaScript, publicado en [gregoriaventuras.xyz](https://gregoriaventuras.xyz).

No hay framework ni paso de compilación en el servidor. Lo que está en la rama `main` es lo que ve la gente, a través de GitHub Pages y Cloudflare.

## Mapa del repositorio

| Ruta | Qué es |
| --- | --- |
| `index.html` | Inicio: historia, últimas entradas, proyectos, herramientas y formulario |
| `compartir/` | Entradas bimestrales de «Nuestra aventura» |
| `proyecto/` | Páginas de acompañamiento, hoy el apoyo mensual |
| `herramientas/` | Curaduría de devocionales, estudio bíblico y ministerio |
| `privacidad.html` | Política de privacidad y cookies |
| `gracias.html` | Confirmación después de enviar el formulario |
| `404.html` | Página de error. No se indexa |
| `css/global.css` | Estilos de todo el sitio. El navegador carga `css/global.min.css` |
| `js/main.js` | Menú, consentimiento, compartir y formulario. El navegador carga `js/main.min.js` |
| `js/site-config.js` | Interruptor de hCaptcha. Se sirve tal cual |
| `img/` | Fotos en JPG y WebP, en varios anchos |
| `sitemap.xml`, `robots.txt` | Lo que lee Google |
| `CNAME`, `.nojekyll` | Dominio de GitHub Pages. `.nojekyll` evita que Jekyll procese el sitio |
| `templates-blog/` | Borradores de páginas. Van detrás de las páginas publicadas |
| `docs/` | Guías de este repositorio |

`css/styles.css` y `css/styles.min.css` son el CSS anterior. Ninguna página publicada los enlaza.

## Ver el sitio en esta máquina

Desde la raíz del repositorio:

```bash
python3 -m http.server 8000
```

Abre [http://127.0.0.1:8000](http://127.0.0.1:8000). Las rutas relativas (`../css/`, `../img/`) funcionan así. El formulario de contacto solo acepta envíos desde `gregoriaventuras.xyz`, así que en local se puede revisar el diseño y la validación, y el envío real se prueba en el sitio publicado.

## Documentación

- [Publicar contenido](docs/contenido.md): una entrada nueva, la portada, el sitemap y las imágenes.
- [Desarrollo](docs/desarrollo.md): CSS, JavaScript, minificado, caché y el script de mantenimiento.
- [Cloudflare](docs/cloudflare-setup.md): cabeceras, CSP, Web3Forms, Analytics y Search Console.

## Servicios que usa el sitio

- **GitHub Pages** publica la rama `main`.
- **Cloudflare** pone el dominio delante y añade las cabeceras de seguridad.
- **Web3Forms** (plan Free) recibe el formulario de «Conecta» y redirige a `gracias.html`. La protección antispam es hCaptcha.
- **Google Analytics 4** mide visitas solo si la persona acepta el aviso de cookies (`localStorage.ga_consent`).
- **Google Fonts** (Poppins, Lora, Satisfy) y **Bootstrap Icons** 1.11.3 vienen por CDN.

La llave de Web3Forms y el ID de Analytics están en el HTML de cada página. Se administran en sus paneles, no en estas guías.
