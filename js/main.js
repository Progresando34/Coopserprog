// ============================================================
// NAVBAR - MENÚ HAMBURGUESA CON CIERRE SUAVE
// ============================================================
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');
let menuOpen = false;

menuToggle?.addEventListener('click', function(e) {
    e.stopPropagation();
    menuOpen = !menuOpen;
    mainMenu.classList.toggle('show');
    const icon = this.querySelector('i');
    if (menuOpen) {
        icon.className = 'fas fa-times';
        this.setAttribute('aria-label', 'Cerrar menú');
    } else {
        icon.className = 'fas fa-bars';
        this.setAttribute('aria-label', 'Abrir menú');
    }
});

document.addEventListener('click', function(e) {
    if (menuOpen && !e.target.closest('.navbar-moderno')) {
        mainMenu.classList.remove('show');
        menuOpen = false;
        const icon = menuToggle?.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
        if (menuToggle) menuToggle.setAttribute('aria-label', 'Abrir menú');
    }
});

document.querySelectorAll('.menu-item a:not(.dropdown-toggle)').forEach(function(link) {
    link.addEventListener('click', function() {
        if (window.innerWidth <= 768) {
            mainMenu.classList.remove('show');
            menuOpen = false;
            const icon = menuToggle?.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
            if (menuToggle) menuToggle.setAttribute('aria-label', 'Abrir menú');
        }
        document.querySelectorAll('.dropdown.open').forEach(function(dropdown) {
            dropdown.classList.remove('open');
            dropdown.querySelector('.dropdown-menu')?.classList.remove('show');
        });
    });
});

document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
        if (menuOpen) {
            mainMenu.classList.remove('show');
            menuOpen = false;
            const icon = menuToggle?.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
            if (menuToggle) menuToggle.setAttribute('aria-label', 'Abrir menú');
        }
        document.querySelectorAll('.dropdown.open').forEach(function(dropdown) {
            dropdown.classList.remove('open');
            dropdown.querySelector('.dropdown-menu')?.classList.remove('show');
        });
    }
});

// ============================================================
// NAVBAR SCROLL
// ============================================================
const navbar = document.getElementById('navbar');
let lastScroll = 0;

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (currentScroll > 50) navbar.classList.add('scrolled');
    else navbar.classList.remove('scrolled');
    if (currentScroll > lastScroll && currentScroll > 100) navbar.classList.add('navbar-hidden');
    else navbar.classList.remove('navbar-hidden');
    lastScroll = currentScroll;
});

// ============================================================
// HERO SLIDER - INFINITO + DRAG TO SLIDE (CORREGIDO)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const track = document.getElementById('heroSliderTrack');
    const slides = track?.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-slider-indicators .indicator');
    const prevBtn = document.getElementById('heroSliderPrev');
    const nextBtn = document.getElementById('heroSliderNext');
    
    if (!track || !slides || slides.length === 0) return;

    const totalSlides = slides.length;
    let autoPlayInterval = null;
    let isTransitioning = false;
    const AUTO_PLAY_DELAY = 7000;
    const TRANSITION_DURATION = 1200;

    // ===== CLONAR PARA EFECTO INFINITO =====
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[totalSlides - 1].cloneNode(true);
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);
    
    const allSlides = track.querySelectorAll('.hero-slide');
    const totalAllSlides = allSlides.length;
    let realIndex = 1;
    
    track.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`;
    track.style.transform = `translateX(-${realIndex * 100}%)`;

    function updateIndicators(index) {
        let indicatorIndex = index - 1;
        if (indicatorIndex < 0) indicatorIndex = totalSlides - 1;
        if (indicatorIndex >= totalSlides) indicatorIndex = 0;
        indicators.forEach((ind, i) => {
            ind.classList.toggle('active', i === indicatorIndex);
        });
    }

    function goToSlide(index, animate = true) {
        if (isTransitioning && animate) return;
        isTransitioning = true;
        realIndex = index;
        
        if (!animate) track.style.transition = 'none';
        track.style.transform = `translateX(-${realIndex * 100}%)`;
        updateIndicators(realIndex);
        
        if (!animate) {
            void track.offsetHeight;
            track.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`;
        }
        
        setTimeout(() => {
            isTransitioning = false;
            if (realIndex === totalAllSlides - 1) {
                setTimeout(() => goToSlide(1, false), 50);
            } else if (realIndex === 0) {
                setTimeout(() => goToSlide(totalSlides, false), 50);
            }
        }, TRANSITION_DURATION + 50);
    }

    // ===== CORREGIDO: nextSlide y prevSlide =====
    function nextSlide() {
        if (!isTransitioning) goToSlide(realIndex + 1);
    }

    function prevSlide() {
        if (!isTransitioning) goToSlide(realIndex - 1);
    }

    function startAutoPlay() {
        if (autoPlayInterval) clearInterval(autoPlayInterval);
        autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    // ===== BOTONES (CORREGIDOS) =====
    if (prevBtn) {
        prevBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            stopAutoPlay();
            prevSlide(); // Ahora va hacia atrás
            setTimeout(startAutoPlay, TRANSITION_DURATION + 300);
        });
    }

    if (nextBtn) {
        nextBtn.addEventListener('click', function(e) {
            e.stopPropagation();
            stopAutoPlay();
            nextSlide(); // Ahora va hacia adelante
            setTimeout(startAutoPlay, TRANSITION_DURATION + 300);
        });
    }

    // ===== INDICADORES =====
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function() {
            const targetIndex = index + 1;
            if (targetIndex !== realIndex && !isTransitioning) {
                stopAutoPlay();
                goToSlide(targetIndex);
                setTimeout(startAutoPlay, TRANSITION_DURATION + 300);
            }
        });
    });

        // ===== DRAG TO SLIDE - MANTIENE POSICIÓN AL SOLTAR Y VOLVER A AGARRAR =====
    const sliderContainer = document.querySelector('.hero-slider');
    let isDragging = false;
    let startX = 0;
    let startTranslateX = 0;
    let currentTranslateX = 0;
    let dragOffset = 0;
    let isDraggingActive = false;

    sliderContainer.addEventListener('mousedown', function(e) {
        e.preventDefault();
        isDragging = true;
        isDraggingActive = true;
        startX = e.clientX;
        // Obtener la posición actual REAL desde el track
        const currentTransform = track.style.transform;
        let currentPos = realIndex * 100;
        if (currentTransform) {
            const match = currentTransform.match(/translateX\(-([\d.]+)%\)/);
            if (match) {
                currentPos = parseFloat(match[1]);
            }
        }
        startTranslateX = currentPos;
        currentTranslateX = currentPos;
        track.style.transition = 'none';
        sliderContainer.style.cursor = 'grabbing';
        stopAutoPlay();
    });

    document.addEventListener('mousemove', function(e) {
        if (!isDragging || !isDraggingActive) return;
        const diff = (e.clientX - startX) / sliderContainer.offsetWidth * 100;
        const translateX = startTranslateX - diff;
        const maxTranslate = (totalAllSlides - 1) * 100;
        if (translateX < -10 || translateX > maxTranslate + 10) return;
        track.style.transform = `translateX(-${translateX}%)`;
        currentTranslateX = translateX;
    });

    document.addEventListener('mouseup', function(e) {
        if (!isDragging) return;
        isDragging = false;
        sliderContainer.style.cursor = 'grab';
        
        // Si no hubo movimiento significativo, no hacer nada
        if (!isDraggingActive) {
            startAutoPlay();
            return;
        }
        isDraggingActive = false;
        
        // Calcular el índice objetivo
        let targetIndex = Math.round(currentTranslateX / 100);
        targetIndex = Math.max(0, Math.min(targetIndex, totalAllSlides - 1));
        
        const diff = Math.abs(currentTranslateX - startTranslateX);
        if (diff < 15) {
            targetIndex = Math.round(startTranslateX / 100);
        }
        
        // Aplicar la transición
        track.style.transition = `transform ${TRANSITION_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`;
        track.style.transform = `translateX(-${targetIndex * 100}%)`;
        realIndex = targetIndex;
        updateIndicators(realIndex);
        
        // Manejar clones
        setTimeout(() => {
            if (realIndex === totalAllSlides - 1) {
                setTimeout(() => goToSlide(1, false), 50);
            } else if (realIndex === 0) {
                setTimeout(() => goToSlide(totalSlides, false), 50);
            }
            startAutoPlay();
        }, TRANSITION_DURATION + 200);
    });

    sliderContainer.addEventListener('dragstart', function(e) {
        e.preventDefault();
    });
    sliderContainer.style.cursor = 'grab';

    // ===== PAUSAR AL PASAR EL MOUSE =====
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);

    // ===== INICIAR =====
    updateIndicators(1);
    startAutoPlay();

    document.addEventListener('visibilitychange', function() {
        if (!document.hidden) {
            startAutoPlay();
        } else {
            stopAutoPlay();
        }
    });
});

// ============================================================
// CONTADORES ANIMADOS
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const counters = document.querySelectorAll('.counter-number');
    if (counters.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const target = parseInt(entry.target.dataset.count);
                let current = 0;
                const increment = Math.ceil(target / 60);
                const timer = setInterval(() => {
                    current += increment;
                    if (current >= target) {
                        entry.target.textContent = target;
                        clearInterval(timer);
                    } else {
                        entry.target.textContent = current;
                    }
                }, 30);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.5 });
    counters.forEach(c => observer.observe(c));
});

// ============================================================
// WHATSAPP MENU TOGGLE
// ============================================================
document.getElementById('whatsappToggle')?.addEventListener('click', function(e) {
    e.stopPropagation();
    document.getElementById('whatsappMenu').classList.toggle('open');
});
document.addEventListener('click', function() {
    document.getElementById('whatsappMenu')?.classList.remove('open');
});

// ============================================================
// ANIMACIONES AL SCROLL (REVEAL)
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.feature-card, .novedad-card, .vigilancia-item, .counter-item, .mv-card, .objetivo-card, .evento-card, .beneficio-item, .contacto-card, .sede-card, .credito-info-card, .convenio-grid-item, .timeline-h-item').forEach(el => {
        el.classList.add('reveal-section');
        observer.observe(el);
    });
});

// ============================================================
// TIMELINE HORIZONTAL - REVELADO CON OBSERVER
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const timelineItems = document.querySelectorAll('.timeline-h-item');
    if (timelineItems.length === 0) return;

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const delay = parseInt(entry.target.dataset.delay) || 0;
                setTimeout(() => {
                    entry.target.classList.add('visible');
                }, delay);
            }
        });
    }, { threshold: 0.2 });

    timelineItems.forEach(el => observer.observe(el));
});

// ============================================================
// DROPDOWN
// ============================================================
document.addEventListener('DOMContentLoaded', function() {
    const dropdowns = document.querySelectorAll('.dropdown');

    function isMobile() {
        return window.innerWidth <= 768;
    }

    dropdowns.forEach(function(dropdown) {
        const link = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');

        if (!link || !menu) return;

        link.removeEventListener('click', handleDropdownClick);
        link.addEventListener('click', handleDropdownClick);
    });

    function handleDropdownClick(e) {
        const dropdown = this.closest('.dropdown');
        const menu = dropdown.querySelector('.dropdown-menu');

        e.preventDefault();
        e.stopPropagation();

        if (dropdown.classList.contains('open')) {
            closeDropdown(dropdown);
            return;
        }

        document.querySelectorAll('.dropdown.open').forEach(function(other) {
            if (other !== dropdown) {
                closeDropdown(other);
            }
        });

        openDropdown(dropdown);
    }

    function openDropdown(dropdown) {
        const menu = dropdown.querySelector('.dropdown-menu');
        dropdown.classList.add('open');
        menu.classList.add('show');
    }

    function closeDropdown(dropdown) {
        const menu = dropdown.querySelector('.dropdown-menu');
        dropdown.classList.remove('open');
        menu.classList.remove('show');
    }

    document.addEventListener('click', function(e) {
        const isDropdown = e.target.closest('.dropdown');
        if (!isDropdown) {
            document.querySelectorAll('.dropdown.open').forEach(function(dropdown) {
                closeDropdown(dropdown);
            });
        }
    });
});