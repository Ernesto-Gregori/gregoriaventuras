// ============================================
// main.js — Gregori Aventuras
// Versión unificada para todos los templates.
//
// Orden:
// 0. Consentimiento de cookies
// 1. Referencias al DOM
// 2. Menú móvil
// 3. Header scroll
// 4. Compartir en redes sociales
// 5. Formulario de contacto (validación + envío + Turnstile)
// 6. Google Analytics tracking (solo con consentimiento)
// ============================================


// ============================================
// 0. CONSENTIMIENTO DE COOKIES
// ============================================
const CONSENT_KEY = 'ga_consent';

function analyticsAllowed() {
    return localStorage.getItem(CONSENT_KEY) === 'granted';
}

function sendAnalyticsPageView() {
    if (typeof gtag === 'undefined') return;
    gtag('event', 'page_view', {
        page_path:     location.pathname + location.search,
        page_location: location.href,
        page_title:    document.title
    });
}

function grantAnalyticsConsent() {
    localStorage.setItem(CONSENT_KEY, 'granted');
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
            analytics_storage: 'granted',
            ad_storage:         'denied'
        });
        sendAnalyticsPageView();
    }
    hideCookieBanner();
}

function denyAnalyticsConsent() {
    localStorage.setItem(CONSENT_KEY, 'denied');
    if (typeof gtag !== 'undefined') {
        gtag('consent', 'update', {
            analytics_storage: 'denied',
            ad_storage:         'denied'
        });
    }
    hideCookieBanner();
}

function hideCookieBanner() {
    document.getElementById('cookie-consent')?.remove();
}

function initCookieBanner() {
    // Visitantes recurrentes: el script inline de GA ya restauró el consentimiento.
    if (localStorage.getItem(CONSENT_KEY)) {
        return;
    }

    const banner = document.createElement('div');
    banner.id = 'cookie-consent';
    banner.setAttribute('role', 'dialog');
    banner.setAttribute('aria-label', 'Consentimiento de cookies');
    banner.innerHTML = `
        <div class="cookie-inner">
            <p>
                Usamos cookies analíticas para mejorar el sitio.
                <a href="${resolvePath('privacidad.html')}">Más información</a>
            </p>
            <div class="cookie-actions">
                <button type="button" class="cookie-reject">Rechazar</button>
                <button type="button" class="cookie-accept">Aceptar</button>
            </div>
        </div>
    `;
    document.body.appendChild(banner);
    banner.querySelector('.cookie-accept').addEventListener('click', grantAnalyticsConsent);
    banner.querySelector('.cookie-reject').addEventListener('click', denyAnalyticsConsent);
}

function resolvePath(target) {
    const path = window.location.pathname;
    if (path.includes('/compartir/') || path.includes('/herramientas/') || path.includes('/proyecto/')) {
        return '../' + target;
    }
    return target;
}


// ============================================
// 1. REFERENCIAS AL DOM
// ============================================
const doc        = document;
const menuToggle = doc.querySelector('.menu-toggle');
const nav        = doc.querySelector('nav');
const navMenu    = doc.querySelector('.nav-menu');
const header     = doc.querySelector('.header');

const contactForm = doc.getElementById('form');
const submitBtn = contactForm
    ? contactForm.querySelector('button[type="submit"]')
    : null;

let copyToast = null;

initCookieBanner();


// ============================================
// 2. MENÚ MÓVIL
// ============================================
if (menuToggle && nav && navMenu) {

    menuToggle.addEventListener('click', () => {
        const isExpanded = nav.classList.toggle('active');
        navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', String(isExpanded));
    }, { passive: true });

    navMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            nav.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    doc.addEventListener('click', (e) => {
        if (
            nav.classList.contains('active') &&
            !nav.contains(e.target) &&
            !menuToggle.contains(e.target)
        ) {
            nav.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}


// ============================================
// 3. HEADER SCROLL
// ============================================
if (header) {
    let ticking = false;

    const handleScroll = () => {
        header.classList.toggle('scrolled', window.scrollY > 100);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });

    handleScroll();
}


// ============================================
// 4. COMPARTIR EN REDES SOCIALES
// ============================================
const shareButtons = doc.querySelectorAll('.btn-share');

if (shareButtons.length > 0) {

    copyToast = doc.createElement('div');
    copyToast.id          = 'copy-toast';
    copyToast.textContent = '✓ Enlace copiado';
    copyToast.setAttribute('role', 'status');
    copyToast.setAttribute('aria-live', 'polite');
    Object.assign(copyToast.style, {
        position:      'fixed',
        bottom:        '2rem',
        left:          '50%',
        transform:     'translateX(-50%) translateY(20px)',
        background:    '#2C3E50',
        color:         '#EAE7DC',
        padding:       '0.75rem 1.5rem',
        borderRadius:  '50px',
        fontFamily:    'Poppins, sans-serif',
        fontSize:      '0.9rem',
        fontWeight:    '600',
        opacity:       '0',
        transition:    'opacity 0.3s ease, transform 0.3s ease',
        zIndex:        '9999',
        pointerEvents: 'none'
    });
    doc.body.appendChild(copyToast);

    let toastTimer = null;
    function showCopyToast() {
        if (toastTimer) clearTimeout(toastTimer);
        copyToast.style.opacity   = '1';
        copyToast.style.transform = 'translateX(-50%) translateY(0)';
        toastTimer = setTimeout(() => {
            copyToast.style.opacity   = '0';
            copyToast.style.transform = 'translateX(-50%) translateY(20px)';
        }, 3000);
    }

    function fallbackCopy() {
        const textArea          = doc.createElement('textarea');
        textArea.value          = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left     = '-9999px';
        doc.body.appendChild(textArea);
        textArea.select();
        try {
            doc.execCommand('copy');
            showCopyToast();
        } catch (err) {
            console.error('Error al copiar enlace:', err);
        }
        doc.body.removeChild(textArea);
    }

    const pageUrl   = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(
        doc.querySelector('h1')?.textContent?.trim() || 'Gregori Aventuras'
    );

    shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const shareType = button.dataset.share;

            switch (shareType) {
                case 'facebook':
                    window.open(
                        `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`,
                        '_blank',
                        'width=600,height=400,noopener,noreferrer'
                    );
                    break;
                case 'whatsapp':
                    window.open(
                        `https://wa.me/?text=${pageTitle}%20${pageUrl}`,
                        '_blank',
                        'noopener,noreferrer'
                    );
                    break;
                case 'twitter':
                    window.open(
                        `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`,
                        '_blank',
                        'width=600,height=400,noopener,noreferrer'
                    );
                    break;
                case 'copiar':
                    if (navigator.clipboard) {
                        navigator.clipboard
                            .writeText(window.location.href)
                            .then(showCopyToast)
                            .catch(fallbackCopy);
                    } else {
                        fallbackCopy();
                    }
                    break;
            }
        });
    });
}


// ============================================
// 5. FORMULARIO DE CONTACTO + hCAPTCHA (Web3Forms Free)
// ============================================
if (contactForm && submitBtn) {

    const hcaptchaEnabled = window.SITE_CONFIG?.hcaptchaEnabled !== false;
    const hcaptchaWidget  = contactForm.querySelector('.h-captcha[data-captcha="true"]');

    window.addEventListener('pageshow', () => {
        contactForm.reset();
        contactForm.querySelectorAll('.touched').forEach(el => {
            el.classList.remove('touched');
        });
        contactForm.querySelectorAll('.field-error.visible').forEach(el => {
            el.textContent = '';
            el.classList.remove('visible');
        });
    });

    const errorMessages = {
        nombre:    { valueMissing: 'Por favor escribe tu nombre.' },
        email:     {
                     valueMissing: 'El email es necesario para responderte.',
                     typeMismatch: 'Ese no parece un email válido. Ej: tu@email.com'
                   },
        proposito: { valueMissing: 'Selecciona una opción para que podamos ayudarte mejor.' },
        mensaje:   { valueMissing: 'Cuéntanos algo — estamos aquí para escucharte.' }
    };

    function validateField(input) {
        const errorSpan = input.closest('.form-group')?.querySelector('.field-error');
        if (!errorSpan) return;

        const rules = errorMessages[input.name] || {};

        if (input.validity.valueMissing && rules.valueMissing) {
            errorSpan.textContent = rules.valueMissing;
            errorSpan.classList.add('visible');
            input.classList.add('touched');

        } else if (input.validity.typeMismatch && rules.typeMismatch) {
            errorSpan.textContent = rules.typeMismatch;
            errorSpan.classList.add('visible');
            input.classList.add('touched');

        } else {
            errorSpan.textContent = '';
            errorSpan.classList.remove('visible');
            input.classList.add('touched');
        }
    }

    contactForm.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type === 'hidden' || field.type === 'checkbox') return;

        field.addEventListener('blur', () => validateField(field));

        field.addEventListener('input', () => {
            if (field.classList.contains('touched')) validateField(field);
        });
    });

    contactForm.addEventListener('submit', (e) => {

        let firstErrorField = null;

        contactForm.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
            validateField(field);
            if (!field.validity.valid && !firstErrorField) {
                firstErrorField = field;
            }
        });

        if (firstErrorField) {
            e.preventDefault();
            firstErrorField.focus();
            return;
        }

        if (hcaptchaEnabled && hcaptchaWidget) {
            const hcaptchaResponse = contactForm.querySelector('[name="h-captcha-response"]');
            if (!hcaptchaResponse || !hcaptchaResponse.value) {
                e.preventDefault();
                alert('Por favor completa la verificación de seguridad antes de enviar.');
                return;
            }
        }

        sessionStorage.setItem('ga_form_submitted', Date.now().toString());

        submitBtn.disabled   = true;
        submitBtn.innerHTML  = `
            <span role="status" aria-live="polite">
                <svg class="spin" xmlns="http://www.w3.org/2000/svg"
                     width="16" height="16" viewBox="0 0 16 16"
                     fill="currentColor" aria-hidden="true">
                    <path d="M8 1a7 7 0 1 0 7 7A7 7 0 0 0 8 1zm0 12a5 5 0 1 1 5-5 5 5 0 0 1-5 5z"
                          opacity=".4"/>
                    <path d="M15 8a7 7 0 0 0-7-7v2a5 5 0 0 1 5 5z"/>
                </svg>
                Enviando...
            </span>
        `;

        if (typeof gtag !== 'undefined' && analyticsAllowed()) {
            gtag('event', 'form_submission', {
                event_category: 'contact',
                event_label:    'formulario_contacto',
                value:          1
            });
        }
    });
}


// ============================================
// 6. GOOGLE ANALYTICS — EVENT TRACKING REDUCIDO
// Solo corre con consentimiento explícito.
// ============================================
if (typeof gtag !== 'undefined' && analyticsAllowed()) {

    doc.addEventListener('click', (e) => {
        const shareBtn = e.target.closest('.btn-share');
        if (shareBtn) {
            gtag('event', 'share_click', {
                event_category: 'sharing',
                event_label:    shareBtn.dataset.share || 'unknown',
                value:          1
            });
        }
    });

    const trackedDepths = new Set();
    let scrollTrackTimer = null;

    window.addEventListener('scroll', () => {
        if (scrollTrackTimer) return;
        scrollTrackTimer = setTimeout(() => {
            const docHeight = doc.documentElement.scrollHeight - window.innerHeight;
            const scrollPct = docHeight > 0
                ? Math.round((window.scrollY / docHeight) * 100)
                : 0;

            if (scrollPct >= 75 && !trackedDepths.has(75)) {
                trackedDepths.add(75);
                gtag('event', 'scroll_depth', {
                    event_category: 'engagement',
                    event_label:    '75%',
                    value:          75
                });
            }

            scrollTrackTimer = null;
        }, 250);
    }, { passive: true });
}

// Conversión en gracias.html — solo tras envío real reciente
if (window.location.pathname.endsWith('/gracias.html') && typeof gtag !== 'undefined' && analyticsAllowed()) {
    const submittedAt = sessionStorage.getItem('ga_form_submitted');
    if (submittedAt && (Date.now() - parseInt(submittedAt, 10)) < 120000) {
        gtag('event', 'form_submission_success', {
            event_category: 'contact',
            event_label:    'gracias_page_reached',
            value:          1
        });
        sessionStorage.removeItem('ga_form_submitted');
    }
}
