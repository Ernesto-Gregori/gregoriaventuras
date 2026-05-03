// ============================================
// main.js — Gregori Aventuras
// Versión unificada para todos los templates.
//
// Orden:
// 1. Referencias al DOM
// 2. Menú móvil
// 3. Header scroll
// 4. Compartir en redes sociales
// 5. Formulario de contacto (validación + envío)
// 6. Google Analytics tracking
// ============================================


// ============================================
// 1. REFERENCIAS AL DOM
// ============================================
const doc        = document;
const menuToggle = doc.querySelector('.menu-toggle');
const nav        = doc.querySelector('nav');
const navMenu    = doc.querySelector('.nav-menu');
const header     = doc.querySelector('.header');

// El formulario existe solo en index.html
// getElementById devuelve null si no existe — sin error
const contactForm = doc.getElementById('form');

// El botón de submit se busca dentro del form para no depender de un ID
const submitBtn = contactForm
    ? contactForm.querySelector('button[type="submit"]')
    : null;

// Toast de "enlace copiado" — se crea dinámicamente en la sección 4
let copyToast = null;


// ============================================
// 2. MENÚ MÓVIL
// ============================================
if (menuToggle && nav && navMenu) {

    menuToggle.addEventListener('click', () => {
        const isExpanded = nav.classList.toggle('active');
        navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', String(isExpanded));
    }, { passive: true });

    // Delegación: un solo listener en el <ul>
    navMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            nav.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });

    // Cerrar al clic fuera del menú
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
// Usa requestAnimationFrame en lugar de setTimeout
// para sincronizar con el ciclo de repintado del navegador.
// Resultado: transición más suave y sin flickering.
// ============================================
if (header) {
    let ticking = false;

    const handleScroll = () => {
        // Sin umbral de 50px — actualiza en cada scroll real
        // El rAF ya controla la frecuencia de ejecución
        header.classList.toggle('scrolled', window.scrollY > 100);
        ticking = false;
    };

    window.addEventListener('scroll', () => {
        // Si ya hay un frame pendiente, no encolar otro
        if (!ticking) {
            requestAnimationFrame(handleScroll);
            ticking = true;
        }
    }, { passive: true });
}


// ============================================
// 4. COMPARTIR EN REDES SOCIALES
// Solo se ejecuta si hay botones .btn-share en la página.
// ============================================
const shareButtons = doc.querySelectorAll('.btn-share');

if (shareButtons.length > 0) {

    // Crear el toast dinámicamente — no necesita estar en el HTML
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

    // Fallback para navegadores sin navigator.clipboard
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
// 5. FORMULARIO DE CONTACTO
// Un solo bloque unificado: validación + envío.
// CORRECCIÓN: antes había DOS bloques if (contactForm) separados
// con listeners 'submit' distintos — generaba comportamiento
// inesperado cuando el form tenía errores.
// ============================================
if (contactForm && submitBtn) {

    // Limpiar al cargar — evita que el navegador recuerde
    // campos de sesiones anteriores.
    // CORRECCIÓN: 'pageshow' en lugar de 'load' para funcionar
    // también cuando el usuario vuelve con el botón "Atrás".
    window.addEventListener('pageshow', () => {
        contactForm.reset();
        // Limpiar estado visual de validación al reiniciar
        contactForm.querySelectorAll('.touched').forEach(el => {
            el.classList.remove('touched');
        });
        contactForm.querySelectorAll('.field-error.visible').forEach(el => {
            el.textContent = '';
            el.classList.remove('visible');
        });
    });

    // --- Mensajes de error personalizados por campo ---
    const errorMessages = {
        nombre:    { valueMissing: 'Por favor escribe tu nombre.' },
        email:     {
                     valueMissing: 'El email es necesario para responderte.',
                     typeMismatch: 'Ese no parece un email válido. Ej: tu@email.com'
                   },
        proposito: { valueMissing: 'Selecciona una opción para que podamos ayudarte mejor.' },
        mensaje:   { valueMissing: 'Cuéntanos algo — estamos aquí para escucharte.' }
    };

    // Valida un campo y muestra/oculta su .field-error
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

    // Validar al salir del campo (blur)
    contactForm.querySelectorAll('input, select, textarea').forEach(field => {
        if (field.type === 'hidden' || field.type === 'checkbox') return;

        field.addEventListener('blur', () => validateField(field));

        // Revalidar mientras escribe (solo después del primer blur)
        field.addEventListener('input', () => {
            if (field.classList.contains('touched')) validateField(field);
        });
    });

    // --- Submit unificado: valida + envía + trackea ---
    contactForm.addEventListener('submit', (e) => {

        // 1. Validar todos los campos requeridos
        let firstErrorField = null;

        contactForm.querySelectorAll('input[required], select[required], textarea[required]').forEach(field => {
            validateField(field);
            // CORRECCIÓN: guardar referencia directa al primer campo inválido
            if (!field.validity.valid && !firstErrorField) {
                firstErrorField = field;
            }
        });

        // 2. Si hay errores: enfocar el primero y detener envío
        if (firstErrorField) {
            e.preventDefault();
            firstErrorField.focus();
            return; // Salir — no ejecutar el bloque de envío
        }

        // 3. Si no hay errores: feedback visual de envío
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

        // 4. Trackear envío en Analytics (solo si gtag disponible)
        if (typeof gtag !== 'undefined') {
            gtag('event', 'form_submission', {
                event_category: 'contact',
                event_label:    'formulario_contacto',
                value:          1
            });
        }
    });
}


// ============================================
// 6. GOOGLE ANALYTICS — EVENT TRACKING
// Solo corre si gtag está disponible.
// CORRECCIÓN: el tracking de form_submission se movió al
// bloque del formulario (sección 5) para evitar duplicación.
// ============================================
if (typeof gtag !== 'undefined') {

    // --- Clicks en botones CTA ---
    doc.addEventListener('click', (e) => {
        const btn = e.target.closest('.btn, .btn-marca, .btn-blue, .btn-blanco, .btn-secondary');
        if (btn) {
            gtag('event', 'button_click', {
                event_category: 'engagement',
                event_label:    btn.textContent.trim().substring(0, 50),
                value:          1
            });
        }

        // --- Clicks en redes sociales ---
        const socialLink = e.target.closest('.social-links a');
        if (socialLink) {
            gtag('event', 'social_click', {
                event_category: 'social',
                event_label:    socialLink.getAttribute('aria-label') || 'social',
                value:          1
            });
        }

        // --- Clicks en botones de compartir ---
        const shareBtn = e.target.closest('.btn-share');
        if (shareBtn) {
            gtag('event', 'share_click', {
                event_category: 'sharing',
                event_label:    shareBtn.dataset.share || 'unknown',
                value:          1
            });
        }
    });

    // --- Scroll depth ---
    // Registra 25%, 50%, 75% y 90% — una sola vez cada uno.
    const scrollDepths  = [25, 50, 75, 90];
    const trackedDepths = new Set();
    let scrollTrackTimer = null;

    window.addEventListener('scroll', () => {
        if (scrollTrackTimer) return;
        scrollTrackTimer = setTimeout(() => {
            const docHeight = doc.documentElement.scrollHeight - window.innerHeight;
            const scrollPct = docHeight > 0
                ? Math.round((window.scrollY / docHeight) * 100)
                : 0;

            scrollDepths.forEach(depth => {
                if (scrollPct >= depth && !trackedDepths.has(depth)) {
                    trackedDepths.add(depth);
                    gtag('event', 'scroll_depth', {
                        event_category: 'engagement',
                        event_label:    depth + '%',
                        value:          depth
                    });
                }
            });

            scrollTrackTimer = null;
        }, 250);
    }, { passive: true });

    // --- Tiempo en página ---
    const timeMarkers = [
        { seconds: 30,  label: '30_segundos' },
        { seconds: 60,  label: '1_minuto'    },
        { seconds: 180, label: '3_minutos'   }
    ];

    timeMarkers.forEach(({ seconds, label }) => {
        setTimeout(() => {
            gtag('event', 'tiempo_en_pagina', {
                event_category: 'engagement',
                event_label:    label,
                value:          seconds
            });
        }, seconds * 1000);
    });
}