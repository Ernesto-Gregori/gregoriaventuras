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
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://challenges.cloudflare.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://api.web3forms.com; frame-src https://challenges.cloudflare.com; base-uri 'self'; form-action 'self' https://api.web3forms.com; object-src 'none'` |

## Turnstile (gratis)

1. Cloudflare → **Turnstile** → **Add site**
2. Dominio: `gregoriaventuras.xyz`
3. Copia **Site Key** → `js/site-config.js`
4. Copia **Secret Key** → panel de Web3Forms (Captcha)

## Web3Forms

- **Allowed Domains:** `gregoriaventuras.xyz`
- Activa límite de envíos diarios
- Rota la access key si detectas abuso
