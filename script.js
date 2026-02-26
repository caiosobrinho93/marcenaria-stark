// Mobile Navbar Toggle
const mobileMenu = document.getElementById('mobile-menu');
const navMenu = document.querySelector('.nav-menu');

mobileMenu.addEventListener('click', () => {
    mobileMenu.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-link').forEach(n => n.addEventListener('click', () => {
    mobileMenu.classList.remove('active');
    navMenu.classList.remove('active');
}));

// Navbar Scroll Effect
const navbar = document.getElementById('navbar');

window.addEventListener('scroll', () => {
    if (window.scrollY > 50) {
        navbar.classList.add('scrolled');
    } else {
        navbar.classList.remove('scrolled');
    }
});

// Active Link Highlight on Scroll
const sections = document.querySelectorAll('section');
const navLinks = document.querySelectorAll('.nav-link');

window.addEventListener('scroll', () => {
    let current = '';

    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        const sectionHeight = section.clientHeight;

        // Adjust for navbar height
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

// Scroll Reveal Animations
function reveal() {
    var reveals = document.querySelectorAll('.reveal-up, .reveal-left, .reveal-right');

    for (var i = 0; i < reveals.length; i++) {
        var windowHeight = window.innerHeight;
        var elementTop = reveals[i].getBoundingClientRect().top;
        var elementVisible = 150;

        if (elementTop < windowHeight - elementVisible) {
            reveals[i].classList.add('active');
        }
    }
}

// Trigger initial reveal and on scroll
window.addEventListener('scroll', reveal);
// Add slight delay for initial load
setTimeout(reveal, 100);

// Simple Form Handling (Prevent Default and Validate)
function handleFormSubmit(formId) {
    const form = document.getElementById(formId);
    if (form) {
        form.addEventListener('submit', (e) => {
            e.preventDefault();

            let phoneEl, emailEl;
            if (formId === 'quote-form') {
                nameEl = document.getElementById('name');
            } else {
                nameEl = document.getElementById('modal-name');
            }

            // Prepare WhatsApp message
            const name = nameEl.value;
            const waPhone = '5517997448213';
            const waText = `Olá, me chamo ${name}, gostaria de um orçamento..`;
            const waUrl = `https://wa.me/${waPhone}?text=${encodeURIComponent(waText)}`;

            // Open WhatsApp
            window.open(waUrl, '_blank');

            // Success State UI
            const formContainer = form.parentElement;
            const originalContent = formContainer.innerHTML;

            formContainer.innerHTML = `
                <div class="success-message-container" style="text-align: center; padding: 40px 20px;">
                    <div style="font-size: 60px; color: #4ade80; margin-bottom: 20px;">
                        <i class="fa-solid fa-circle-check"></i>
                    </div>
                    <h3 style="margin-bottom: 15px;">Solicitação Enviada!</h3>
                    <p style="margin-bottom: 30px; color: #a1a1aa;">Obrigado, ${name}. Já abrimos seu WhatsApp para conversarmos.</p>
                    <button class="btn btn-primary" id="success-ok-btn" style="width: 100px;">OK</button>
                </div>
            `;

            document.getElementById('success-ok-btn').addEventListener('click', () => {
                formContainer.innerHTML = originalContent;
                // Re-attach the event listener to the new form
                handleFormSubmit(formId);

                // If modal, close it
                if (formId === 'modal-quote-form') {
                    const modal = document.getElementById('quote-modal');
                    modal.classList.remove('show');
                }
            });
        });
    }
}

handleFormSubmit('quote-form');
handleFormSubmit('modal-quote-form');

// Popup Modal Logic
const modal = document.getElementById('quote-modal');
const openModalBtn = document.getElementById('open-popup-btn');
const closeModalBtn = document.querySelector('.close-modal');

if (openModalBtn && modal && closeModalBtn) {
    // Open modal or scroll if mobile
    openModalBtn.addEventListener('click', (e) => {
        e.preventDefault();

        if (window.innerWidth <= 768) {
            // Scroll to form on mobile
            const heroForm = document.querySelector('.quote-form-card');
            if (heroForm) {
                const y = heroForm.getBoundingClientRect().top + window.pageYOffset - 100;
                window.scrollTo({ top: y, behavior: 'smooth' });
            }

            // Close mobile menu with a slight delay so user sees the scroll start
            setTimeout(() => {
                const mobileMenu = document.getElementById('mobile-menu');
                const navMenu = document.querySelector('.nav-menu');
                if (mobileMenu && navMenu) {
                    mobileMenu.classList.remove('active');
                    navMenu.classList.remove('active');
                }
            }, 400);
        } else {
            // Open modal on desktop
            modal.classList.add('show');
        }
    });

    // Close modal on X click
    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });

    // Close modal on outside click
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.classList.remove('show');
        }
    });
}

// =========================================
// DYNAMIC GALLERY LOADING
// =========================================
function loadMainGallery() {
    const galleryGrid = document.querySelector('.gallery-grid');
    if (!galleryGrid) return;

    const defaultGallery = [
        { url: 'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?q=80&w=2670&auto=format&fit=crop', title: 'Cozinha Gourmet', desc: 'Linha Titanium' },
        { url: 'https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?q=80&w=2600&auto=format&fit=crop', title: 'Living Integrado', desc: 'Iluminação Smart LED' },
        { url: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?q=80&w=2670&auto=format&fit=crop', title: 'Dormitório Casal', desc: 'Closet Elegance' },
        { url: 'https://images.unsplash.com/photo-1588854337236-6889d631faa8?q=80&w=2670&auto=format&fit=crop', title: 'Home Theater Smart', desc: 'Integração Alexa' }
    ];

    const stored = localStorage.getItem('stark_gallery');
    const items = stored ? JSON.parse(stored) : defaultGallery;

    galleryGrid.innerHTML = '';
    items.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = `gallery-item reveal-up ${index === 3 ? 'large' : ''}`;
        div.style.transitionDelay = `${(index + 1) * 0.1}s`;
        div.innerHTML = `
            <img src="${item.url}" alt="${item.title}">
            <div class="gallery-overlay">
                <h4>${item.title}</h4>
                <p>${item.desc}</p>
            </div>
        `;
        galleryGrid.appendChild(div);

        // Re-attach lightbox listener to new element
        div.addEventListener('click', () => openLightbox(item.url, item.title, item.desc));
    });

    // Trigger reveals for new items
    setTimeout(reveal, 100);
}

function openLightbox(src, title, desc) {
    const lightbox = document.getElementById('gallery-lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const lightboxCaption = document.getElementById('lightbox-caption');

    if (lightbox && lightboxImg && lightboxCaption) {
        lightboxImg.src = src;
        lightboxImg.alt = title;
        lightboxCaption.innerHTML = `<strong>${title}</strong><br><small>${desc}</small>`;
        lightbox.classList.add('show');
    }
}

// Gallery Lightbox Logic (Legacy/Cleanup)
const lightbox = document.getElementById('gallery-lightbox');
const closeLightbox = document.querySelector('.close-lightbox');

if (lightbox) {
    closeLightbox.addEventListener('click', () => {
        lightbox.classList.remove('show');
    });

    lightbox.addEventListener('click', (e) => {
        if (e.target === lightbox) {
            lightbox.classList.remove('show');
        }
    });
}

// Initial Gallery Load
loadMainGallery();


