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