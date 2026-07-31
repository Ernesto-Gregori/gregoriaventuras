#!/usr/bin/env python3
"""Actualiza todas las páginas HTML con mejoras de seguridad y optimización."""
import re
from pathlib import Path

ROOT = Path('/workspace')

CSP = (
    "default-src 'self'; "
    "script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://web3forms.com "
    "https://js.hcaptcha.com https://static.cloudflareinsights.com; "
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://cdn.jsdelivr.net "
    "https://hcaptcha.com https://*.hcaptcha.com; "
    "font-src 'self' https://fonts.gstatic.com https://cdn.jsdelivr.net; "
    "img-src 'self' data: https:; "
    "connect-src 'self' https://www.google-analytics.com https://region1.google-analytics.com "
    "https://api.web3forms.com https://hcaptcha.com https://*.hcaptcha.com https://newassets.hcaptcha.com "
    "https://cloudflareinsights.com https://*.cloudflareinsights.com; "
    "frame-src https://hcaptcha.com https://*.hcaptcha.com https://newassets.hcaptcha.com; "
    "base-uri 'self'; form-action 'self' https://api.web3forms.com; object-src 'none'"
)

BOOTSTRAP_OLD = re.compile(
    r'<link rel="stylesheet"\s+href="https://cdn\.jsdelivr\.net/npm/bootstrap-icons@1\.11\.3/font/bootstrap-icons\.min\.css">',
    re.I
)
BOOTSTRAP_NEW = (
    '<link rel="stylesheet"\n'
    '      href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"\n'
    '      integrity="sha384-XGjxtQfXaH2tnPFa9x+ruJTuLE3Aa6LhHSWRr1XeTyhezb4abCG4ccI5AkVDxqC+"\n'
    '      crossorigin="anonymous">'
)

# Inline SVG logo block (multiline)
SVG_PATTERN = re.compile(
    r'<!-- SVG del logo — sin cambios -->\s*'
    r'|<\!-- HEADER — idéntico en todos los templates -->\s*'
    r'|<svg class="logo-icon"[^>]*>.*?</svg>',
    re.S
)

CONSENT_BLOCK = """    gtag('consent', 'default', {
      'analytics_storage': 'denied',
      'ad_storage': 'denied',
      'wait_for_update': 500
    });
"""

GA_CONFIG_PATTERN = re.compile(
    r"(function gtag\(\)\{dataLayer\.push\(arguments\);\}\s*\n\s*)"
    r"(gtag\('js', new Date\(\)\);)",
    re.M
)


def depth(path: Path) -> int:
    rel = path.relative_to(ROOT)
    return len(rel.parts) - 1


def prefix(path: Path) -> str:
    d = depth(path)
    return '../' * d if d else ''


def contact_href(path: Path) -> str:
    p = prefix(path)
    return f'{p}index.html#conecta' if path.name != 'index.html' else '#conecta'


def privacidad_href(path: Path) -> str:
    p = prefix(path)
    return f'{p}privacidad.html'


def process_file(path: Path) -> None:
    text = path.read_text(encoding='utf-8')
    original = text
    p = prefix(path)

    # CSP meta after viewport
    if 'Content-Security-Policy' not in text:
        text = text.replace(
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">',
            '<meta name="viewport" content="width=device-width, initial-scale=1.0">\n'
            f'  <meta http-equiv="Content-Security-Policy" content="{CSP}">',
            1
        )

    # Bootstrap SRI
    text = BOOTSTRAP_OLD.sub(BOOTSTRAP_NEW, text)

    # Replace inline SVG with span logo
    text = SVG_PATTERN.sub(
        '<img src="/img/logo.svg" class="logo-icon" width="167" height="64" alt="" aria-hidden="true">',
        text
    )

    # GA consent default
    if "gtag('consent', 'default'" not in text and 'function gtag()' in text:
        text = GA_CONFIG_PATTERN.sub(r'\1' + CONSENT_BLOCK + r'    \2', text, count=1)

    # site-config.js before main.min.js
    if 'site-config.js' not in text:
        text = text.replace(
            f'<script defer src="{p}js/main.min.js"></script>',
            f'<script src="{p}js/site-config.js"></script>\n  <script defer src="{p}js/main.min.js"></script>'
        )

    # Footer mailto -> contact form
    text = re.sub(
        r'href="mailto:netoydianagregori@gmail\.com"\s*\n\s*class="social-link"\s*\n\s*aria-label="Enviar correo electrónico a Gregori Aventuras"',
        f'href="{contact_href(path)}"\n           class="social-link"\n           aria-label="Enviar mensaje desde el formulario de contacto"',
        text
    )
    text = re.sub(
        r'href="mailto:netoydianagregori@gmail\.com"\s*\n\s*class="social-link"\s*\n\s*aria-label="Enviar correo a Gregori Aventuras"',
        f'href="{contact_href(path)}"\n           class="social-link"\n           aria-label="Enviar mensaje desde el formulario de contacto"',
        text
    )

    # Copyright footer add privacy link if missing
    if 'privacidad.html' not in text and 'Copyright ©' in text:
        text = text.replace(
            'Copyright © 2026 Gregori Aventuras · Todos los derechos reservados.',
            f'Copyright © 2026 Gregori Aventuras · <a href="{privacidad_href(path)}">Privacidad</a> · Todos los derechos reservados.'
        )

    # Canonical fix for proyecto page
    text = text.replace(
        'https://gregoriaventuras.xyz/proyectos/apoyo-mensual.html',
        'https://gregoriaventuras.xyz/proyecto/apoyo-mensual-pilar-aventura.html'
    )

    if text != original:
        path.write_text(text, encoding='utf-8')
        print(f'Updated: {path.relative_to(ROOT)}')


def main():
    for html in ROOT.rglob('*.html'):
        if 'templates-blog' in str(html):
            continue
        process_file(html)


if __name__ == '__main__':
    main()
