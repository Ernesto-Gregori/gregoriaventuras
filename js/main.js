// Menú móvil
const menuToggle = document.querySelector('.menu-toggle');
const nav = document.querySelector('nav');
const navMenu = document.querySelector('.nav-menu');
const header = document.querySelector('.header');
const shareButtons = document.querySelectorAll('.btn-share');
const copyMessage = document.getElementById('copy-message');

menuToggle.addEventListener('click', () => {
    nav.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Cerrar menú al hacer clic en un enlace
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        nav.classList.toggle('active');
        navMenu.classList.remove('active');
    });
});

// Header scroll
window.addEventListener('scroll', () => {
    if (window.scrollY > 100) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
});

// Smooth scroll
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Formulario de contacto - Resetear campos al cargar la página
window.onload = function() {
    // Reset the form fields when the page loads
    document.getElementById("form").reset();
};

// Obtener URL y título actual
const pageUrl = encodeURIComponent(window.location.href);
const pageTitle = encodeURIComponent(document.querySelector('h1').textContent);

shareButtons.forEach(button => {
button.addEventListener('click', (e) => {
    e.preventDefault();
    const shareType = button.getAttribute('data-share');
    
    let shareUrl = '';
    
    switch(shareType) {
        case 'facebook':
            shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${pageUrl}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'whatsapp':
            shareUrl = `https://wa.me/?text=${pageTitle}%20${pageUrl}`;
            window.open(shareUrl, '_blank');
            break;
            
        case 'twitter':
            shareUrl = `https://twitter.com/intent/tweet?url=${pageUrl}&text=${pageTitle}`;
            window.open(shareUrl, '_blank', 'width=600,height=400');
            break;
            
        case 'copiar':
            // Copiar al portapapeles
            navigator.clipboard.writeText(window.location.href).then(() => {
                copyMessage.style.display = 'block';
                setTimeout(() => {
                    copyMessage.style.display = 'none';
                }, 3000);
            }).catch(err => {
                console.error('Error al copiar:', err);
                // Fallback para navegadores antiguos
                const textArea = document.createElement('textarea');
                textArea.value = window.location.href;
                document.body.appendChild(textArea);
                textArea.select();
                try {
                    document.execCommand('copy');
                    copyMessage.style.display = 'block';
                    setTimeout(() => {
                        copyMessage.style.display = 'none';
                    }, 3000);
                } catch(err) {
                    console.error('Error al copiar:', err);
                }
                document.body.removeChild(textArea);
            });
            break;
    }
});
});
// ============================================
// TRACKING AVANZADO DE GOOGLE ANALYTICS
// ============================================

// Tracking de clicks en botones CTA
if (typeof gtag !== 'undefined') {
    document.querySelectorAll('.btn').forEach(button => {
        button.addEventListener('click', function() {
            gtag('event', 'button_click', {
                'event_category': 'engagement',
                'event_label': this.textContent.trim(),
                'value': 1
            });
        });
    });

    // Tracking de scroll depth
    let scrollDepths = [25, 50, 75, 90];
    let trackedDepths = [];
    
    window.addEventListener('scroll', function() {
        let scrollPercentage = Math.round((window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100);
        
        scrollDepths.forEach(depth => {
            if (scrollPercentage >= depth && !trackedDepths.includes(depth)) {
                trackedDepths.push(depth);
                gtag('event', 'scroll_depth', {
                    'event_category': 'engagement',
                    'event_label': depth + '%',
                    'value': depth
                });
            }
        });
    });

    // Tracking de tiempo en página
    let timeOnPage = 0;
    let timeInterval = setInterval(function() {
        timeOnPage += 10;
        if (timeOnPage === 30) {
            gtag('event', 'time_on_page', {
                'event_category': 'engagement',
                'event_label': '30_seconds',
                'value': 30
            });
        }
        if (timeOnPage === 60) {
            gtag('event', 'time_on_page', {
                'event_category': 'engagement',
                'event_label': '1_minute',
                'value': 60
            });
        }
        if (timeOnPage === 180) {
            gtag('event', 'time_on_page', {
                'event_category': 'engagement',
                'event_label': '3_minutes',
                'value': 180
            });
            clearInterval(timeInterval);
        }
    }, 10000);

    // Tracking de clicks en redes sociales
    document.querySelectorAll('.social-links a').forEach(link => {
        link.addEventListener('click', function() {
            let platform = this.getAttribute('aria-label') || 'social';
            gtag('event', 'social_click', {
                'event_category': 'social',
                'event_label': platform,
                'value': 1
            });
        });
    });

    // Tracking de envío de formulario
    const contactForm = document.getElementById('form');
    if (contactForm) {
        contactForm.addEventListener('submit', function() {
            gtag('event', 'form_submission', {
                'event_category': 'contact',
                'event_label': 'contact_form',
                'value': 1
            });
        });
    }
}