# Configuración de cabeceras en Cloudflare (plan Free)

GitHub Pages no permite cabeceras HTTP personalizadas. Como el sitio usa Cloudflare como proxy, configura esto en el panel (gratis):

## Transform Rules → Modify Response Header

Crea una regla para el hostname `gregoriaventuras.xyz` y agrega:

| Header | Valor |
|--------|-------|
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains; preload` |
| `Permissions-Policy` | `camera=(), microphone=(), geolocation=(), payment=()` |
| `X-Frame-Options` | `DENY` |
| `Referrer-Policy` | `strict-origin-when-cross-origin` |
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://web3forms.com https://js.hcaptcha.com https://static.cloudflareinsights.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://hcaptcha.com https://*.hcaptcha.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://*.google-analytics.com https://analytics.google.com https://region1.google-analytics.com https://www.google.com https://www.googletagmanager.com https://api.web3forms.com https://hcaptcha.com https://*.hcaptcha.com https://newassets.hcaptcha.com https://cloudflareinsights.com https://*.cloudflareinsights.com; frame-src https://hcaptcha.com https://*.hcaptcha.com https://newassets.hcaptcha.com; base-uri 'self'; form-action 'self' https://api.web3forms.com; object-src 'none'` |

> **Importante (Google Analytics):** GA4 envía datos a `analytics.google.com` y `www.google.com`. Si la CSP de Cloudflare no incluye esos dominios en `connect-src`, el panel de Analytics quedará en cero aunque el usuario acepte cookies. Actualiza la regla si la creaste antes de julio 2026.

## Google Analytics — sin visitas tras el banner de cookies

1. **Actualiza la CSP en Cloudflare** con los dominios de arriba (sobre todo `analytics.google.com` y `www.google.com`).
2. En el navegador, abre el sitio → F12 → **Red** → filtra `collect` o `google-analytics`. Debe aparecer peticiones 204/200 tras pulsar **Aceptar**.
3. Si probaste el sitio antes, borra `localStorage.ga_consent` en DevTools → Application → Local Storage, recarga y acepta de nuevo.
4. En GA4, los informes en tiempo real pueden tardar unos minutos; el histórico requiere consentimiento (no verás visitas de quien pulsa **Rechazar**, es intencional).

## Web3Forms (plan Free)

- **Allowed Domains:** `gregoriaventuras.xyz`
- **Captcha:** activar **hCaptcha** en el dashboard (incluido en Free)
- Activa límite de envíos diarios
- Rota la access key si detectas abuso

> **Nota:** Cloudflare Turnstile y reCAPTCHA propio solo están disponibles en el plan **Pro** de Web3Forms. En Free usa hCaptcha con la integración zero-config del sitio.

## Search Console: sitemap "No se ha podido obtener"

Si Google no lee el sitemap, revisa en Cloudflare:

1. **Security → Bots → Bot Fight Mode:** desactivado, o activa **Allow verified bots** (Googlebot).
2. **Security → Settings → Security Level:** no uses "I'm Under Attack" de forma permanente.
3. **Transform Rules (CSP):** aplica la regla solo a HTML, no a `/sitemap.xml` ni `/robots.txt`:
   - Condición: `http.response.content_type.media_type` equals `text/html`
4. En Search Console la propiedad debe ser **`https://gregoriaventuras.xyz`** (sin `www`; ese subdominio no existe).
5. Elimina el sitemap en Search Console, espera 5–10 min tras el deploy, y vuelve a enviar `https://gregoriaventuras.xyz/sitemap.xml`.
