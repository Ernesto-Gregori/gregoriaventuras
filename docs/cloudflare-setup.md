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
| `Content-Security-Policy` | `default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://web3forms.com https://js.hcaptcha.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net https://hcaptcha.com; font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; img-src 'self' data: https:; connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com https://api.web3forms.com https://api.hcaptcha.com https://hcaptcha.com; frame-src https://hcaptcha.com https://newassets.hcaptcha.com; base-uri 'self'; form-action 'self' https://api.web3forms.com; object-src 'none'` |

## Web3Forms (plan Free)

- **Allowed Domains:** `gregoriaventuras.xyz`
- **Captcha:** activar **hCaptcha** en el dashboard (incluido en Free)
- Activa límite de envíos diarios
- Rota la access key si detectas abuso

> **Nota:** Cloudflare Turnstile y reCAPTCHA propio solo están disponibles en el plan **Pro** de Web3Forms. En Free usa hCaptcha con la integración zero-config del sitio.
