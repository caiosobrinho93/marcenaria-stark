// Mobile Navbar Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navLinksContainer = document.querySelector('.nav-links');
const navLinks = document.querySelectorAll('.n-link');

if (mobileMenu && navLinksContainer) {
    mobileMenu.addEventListener('click', () => {
        navLinksContainer.classList.toggle('active');
    });

    navLinks.forEach(link => {
        link.addEventListener('click', () => {
            navLinksContainer.classList.remove('active');
        });
    });
}

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Active Link Highlight
const sections = document.querySelectorAll('section');

window.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (pageYOffset >= (sectionTop - 200)) {
            current = section.getAttribute('id');
        }
    });

    navLinks.forEach(link => {
        link.classList.remove('active');
        if (link.getAttribute('href').includes(current)) {
            link.classList.add('active');
        }
    });
});

// Reveal Animations
const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
};

const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('active');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function initReveals() {
    const reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');
    reveals.forEach(el => revealObserver.observe(el));
}

document.addEventListener('DOMContentLoaded', initReveals);
setTimeout(initReveals, 300);

// Modal Logic
const modal = document.getElementById('tech-modal');
const openModalBtn = document.getElementById('consultation-btn');
const closeBtn = document.querySelector('.close-modal');

if (openModalBtn && modal && closeBtn) {
    openModalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        modal.classList.add('show');
    });

    closeBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// Form Handling
const consultationForm = document.getElementById('consultation-form');
if (consultationForm) {
    consultationForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const name = document.getElementById('client-name').value;
        const waPhone = '5517997448213';
        const waText = `PROTOCOLO INICIADO: Olá, chamo-me ${name}. Solicito análise técnica de área para projeto estrutural com a STATE MARCENARIA.`;
        const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;
        window.open(waUrl, '_blank');
        if (modal) {
            modal.classList.remove('show');
        }
    });
}

// Gallery Loading
function loadMainGallery() {
    const galleryGrid = document.getElementById('portfolio-grid');
    if (!galleryGrid) return;

    const defaultGallery = [
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=1200&auto=format&fit=crop', title: 'Cozinha Gourmet', desc: 'Linha Titanium' },
        { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=800&auto=format&fit=crop', title: 'Living Integrado', desc: 'Iluminação Smart LED' },
        { url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=800&auto=format&fit=crop', title: 'Dormitório Casal', desc: 'Closet Elegance' },
        { url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=1400&auto=format&fit=crop', title: 'Home Theater', desc: 'Integração Alexa' },
        { url: 'https://images.unsplash.com/photo-1600607686527-6fb886090705?q=80&w=800&auto=format&fit=crop', title: 'Escritório Executivo', desc: 'Design Corporativo' },
        { url: 'https://images.unsplash.com/photo-1593696140826-c58b021acf8b?q=80&w=800&auto=format&fit=crop', title: 'Painel Acústico', desc: 'Módulos Fonoabsorventes' }
    ];

    galleryGrid.innerHTML = '';
    defaultGallery.forEach((item, index) => {
        const div = document.createElement('div');
        let masonryClass = 'gallery-item reveal-up';
        
        // Stagger logic
        if (index === 0) masonryClass += ' span-col-2 span-row-2';
        else if (index === 3) masonryClass += ' span-col-2';

        div.className = masonryClass;
        div.style.transitionDelay = `${(index % 3) * 0.1}s`;
        div.innerHTML = `
            <img src="${item.url}" alt="${item.title}" loading="lazy">
            <div class="gallery-overlay">
                <h4>${item.title}</h4>
                <p>SYS.DESC // ${item.desc}</p>
            </div>
        `;
        
        div.addEventListener('click', () => openLightbox(item.url, item.title, item.desc));
        galleryGrid.appendChild(div);
    });
    
    setTimeout(initReveals, 100);
}

// Lightbox logic
function openLightbox(src, title, desc) {
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    if (lightbox && lightboxImg && lightboxCaption) {
        lightboxImg.src = src;
        lightboxImg.alt = title;
        lightboxCaption.innerHTML = `<strong>${title}</strong><small>SYS.DESC // ${desc}</small>`;
        lightbox.classList.add('show');
    }
}

const lightbox = document.getElementById('gallery-lightbox');
const closeLightbox = document.querySelector('.close-lightbox');

if (lightbox && closeLightbox) {
    closeLightbox.addEventListener('click', () => {
        lightbox.classList.remove('show');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('show');
        }
    });

    document.addEventListener('keydown', (e) => {
        if (e.key === "Escape" && lightbox.classList.contains('show')) {
            lightbox.classList.remove('show');
        }
    });
}

loadMainGallery();

// Mouse parallax effect completely removed as per spec.
