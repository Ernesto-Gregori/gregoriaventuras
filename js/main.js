// ============================================
// OPTIMIZACIONES DE RENDIMIENTO
// ============================================

// Usar delegación de eventos para mejor rendimiento
const doc = document;
const menuToggle = doc.querySelector('.menu-toggle');
const nav = doc.querySelector('nav');
const navMenu = doc.querySelector('.nav-menu');
const header = doc.querySelector('.header');
const contactForm = doc.getElementById('form');

// ============================================
// MENÚ MÓVIL
// ============================================
if (menuToggle) {
    menuToggle.addEventListener('click', () => {
        const isExpanded = nav.classList.toggle('active');
        navMenu.classList.toggle('active');
        menuToggle.setAttribute('aria-expanded', isExpanded);
    }, { passive: true });
}

// Cerrar menú al hacer clic en un enlace (delegación de eventos)
if (navMenu) {
    navMenu.addEventListener('click', (e) => {
        if (e.target.tagName === 'A') {
            nav.classList.remove('active');
            navMenu.classList.remove('active');
            menuToggle.setAttribute('aria-expanded', 'false');
        }
    });
}

// ============================================
// HEADER SCROLL (con throttle para rendimiento)
// ============================================
let scrollTimer;
let lastScrollY = 0;

const handleScroll = () => {
    const currentScrollY = window.scrollY;
    
    // Solo actualizar si hay cambio significativo
    if (Math.abs(currentScrollY - lastScrollY) > 50) {
        if (currentScrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
        lastScrollY = currentScrollY;
    }
};

window.addEventListener('scroll', () => {
    if (scrollTimer) return;
    scrollTimer = setTimeout(() => {
        handleScroll();
        scrollTimer = null;
    }, 100);
}, { passive: true });

// ============================================
// SMOOTH SCROLL
// ============================================
doc.addEventListener('click', (e) => {
    if (e.target.matches('a[href^="#"]')) {
        e.preventDefault();
        const targetId = e.target.getAttribute('href');
        const target = doc.querySelector(targetId);
        
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    }
});

// ============================================
// FORMULARIO DE CONTACTO
// ============================================
// Resetear campos al cargar la página
window.addEventListener('load', () => {
    if (contactForm) {
        contactForm.reset();
    }
});

// ============================================
// COMPARTIR EN REDES SOCIALES
// ============================================
const shareButtons = doc.querySelectorAll('.btn-share');
const copyMessage = doc.getElementById('copy-message');

if (shareButtons.length > 0) {
    const pageUrl = encodeURIComponent(window.location.href);
    const pageTitle = encodeURIComponent(doc.querySelector('h1')?.textContent || 'Gregori Aventuras');
    
    shareButtons.forEach(button => {
        button.addEventListener('click', (e) => {
            e.preventDefault();
            const shareType = button.getAttribute('data-share');
            
            let shareUrl = '';
            
            switch(shareType) {
                case 'facebook':
                    shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
                    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
                    break;
                    
                case 'whatsapp':
                    shareUrl = `https://wa.me/?text=${pageTitle}%20${pageUrl}`;
                    window.open(shareUrl, '_blank', 'noopener,noreferrer');
                    break;
                    
                case 'twitter':
                    shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
                    window.open(shareUrl, '_blank', 'width=600,height=400,noopener,noreferrer');
                    break;
                    
                case 'copiar':
                    // Usar API moderna de clipboard
                    if (navigator.clipboard) {
                        navigator.clipboard.writeText(window.location.href)
                            .then(() => showCopyMessage())
                            .catch(() => fallbackCopy());
                    } else {
                        fallbackCopy();
                    }
                    break;
            }
        });
    });
    
    // Función para mostrar mensaje de copiado
    function showCopyMessage() {
        if (copyMessage) {
            copyMessage.style.display = 'block';
            setTimeout(() => {
                copyMessage.style.display = 'none';
            }, 3000);
        }
    }
    
    // Fallback para navegadores antiguos
    function fallbackCopy() {
        const textArea = doc.createElement('textarea');
        textArea.value = window.location.href;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        doc.body.appendChild(textArea);
        textArea.select();
        
        try {
            doc.execCommand('copy');
            showCopyMessage();
        } catch(err) {
            console.error('Error al copiar:', err);
        }
        
        doc.body.removeChild(textArea);
    }
}

// ============================================
// GOOGLE ANALYTICS TRACKING
// ============================================
// Solo ejecutar si gtag está disponible
if (typeof gtag !== 'undefined') {
    
    // Tracking de clicks en botones CTA (delegación de eventos)
    doc.addEventListener('click', (e) => {
        if (e.target.matches('.btn')) {
            gtag('event', 'button_click', {
                'event_category': 'engagement',
                'event_label': e.target.textContent.trim(),
                'value': 1
            });
        }
        
        // Tracking de clicks en redes sociales
        if (e.target.closest('.social-links a')) {
            const link = e.target.closest('a');
            const platform = link.getAttribute('aria-label') || 'social';
            gtag('event', 'social_click', {
                'event_category': 'social',
                'event_label': platform,
                'value': 1
            });
        }
    });

    // Tracking de scroll depth (optimizado)
    const scrollDepths = [25, 50, 75, 90];
    const trackedDepths = new Set();
    
    let scrollTrackTimer;
    
    window.addEventListener('scroll', () => {
        if (scrollTrackTimer) return;
        
        scrollTrackTimer = setTimeout(() => {
            const scrollPercentage = Math.round(
                (window.scrollY / (doc.documentElement.scrollHeight - window.innerHeight)) * 100
            );
            
            scrollDepths.forEach(depth => {
                if (scrollPercentage >= depth && !trackedDepths.has(depth)) {
                    trackedDepths.add(depth);
                    gtag('event', 'scroll_depth', {
                        'event_category': 'engagement',
                        'event_label': depth + '%',
                        'value': depth
                    });
                }
            });
            
            scrollTrackTimer = null;
        }, 250);
    }, { passive: true });

    // Tracking de tiempo en página (optimizado)
    const timeMarkers = [
        { seconds: 30, label: '30_seconds' },
        { seconds: 60, label: '1_minute' },
        { seconds: 180, label: '3_minutes' }
    ];
    
    timeMarkers.forEach(marker => {
        setTimeout(() => {
            gtag('event', 'time_on_page', {
                'event_category': 'engagement',
                'event_label': marker.label,
                'value': marker.seconds
            });
        }, marker.seconds * 1000);
    });

    // Tracking de envío de formulario
    if (contactForm) {
        contactForm.addEventListener('submit', () => {
            gtag('event', 'form_submission', {
                'event_category': 'contact',
                'event_label': 'contact_form',
                'value': 1
            });
        });
    }
}

const form = document.getElementById('supportForm');
const submitBtn = document.getElementById('submitBtn');
const loadingMessage = document.getElementById('loadingMessage');

form.addEventListener('submit', function(e) {
    // Deshabilitar botón y mostrar loading
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<span>⏳</span><span>Enviando...</span>';
    loadingMessage.classList.add('active');
});