// ============================================================
// NAVBAR - MENÚ HAMBURGUESA CON CIERRE SUAVE
// ============================================================
const menuToggle = document.getElementById('menuToggle');
const mainMenu = document.getElementById('mainMenu');
let menuOpen = false;

menuToggle?.addEventListener('click', function (e) {
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

document.addEventListener('click', function (e) {
    if (menuOpen && !e.target.closest('.navbar-moderno')) {
        mainMenu.classList.remove('show');
        menuOpen = false;
        const icon = menuToggle?.querySelector('i');
        if (icon) icon.className = 'fas fa-bars';
        if (menuToggle) menuToggle.setAttribute('aria-label', 'Abrir menú');
    }
});

document.querySelectorAll('.menu-item a:not(.dropdown-toggle)').forEach(function (link) {
    link.addEventListener('click', function () {
        if (window.innerWidth <= 768) {
            mainMenu.classList.remove('show');
            menuOpen = false;
            const icon = menuToggle?.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
            if (menuToggle) menuToggle.setAttribute('aria-label', 'Abrir menú');
        }
        document.querySelectorAll('.dropdown.open').forEach(function (dropdown) {
            dropdown.classList.remove('open');
            dropdown.querySelector('.dropdown-menu')?.classList.remove('show');
        });
    });
});

document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') {
        if (menuOpen) {
            mainMenu.classList.remove('show');
            menuOpen = false;
            const icon = menuToggle?.querySelector('i');
            if (icon) icon.className = 'fas fa-bars';
            if (menuToggle) menuToggle.setAttribute('aria-label', 'Abrir menú');
        }
        document.querySelectorAll('.dropdown.open').forEach(function (dropdown) {
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
// HERO SLIDER - INFINITO + DRAG TO SLIDE (REESCRITO)
// ------------------------------------------------------------
// Cambios respecto a la versión anterior:
// 1. Un ÚNICO responsable de "isTransitioning": el evento
//    "transitionend" del track. Antes había un setTimeout Y un
//    listener de transitionend peleando por el mismo estado, lo
//    que hacía que a veces la transición terminara "a medias" o
//    el slider quedara trabado. Se deja un timeout de seguridad
//    (por si transitionend no llega a disparar, p.ej. pestaña en
//    segundo plano) pero se cancela apenas transitionend ocurre.
// 2. Bug real en touch: se usaba "e.clientX" en touchstart, que
//    no existe en un TouchEvent (da undefined -> NaN en los
//    cálculos de arrastre). Ahora se usa "touch.clientX".
// 3. El arrastre (mouse/touch) ya no duplica la lógica de salto
//    entre clones: reutiliza goToSlide(), así el comportamiento
//    es idéntico venga de botón, indicador o drag.
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
    const track = document.getElementById('heroSliderTrack');
    const slides = track?.querySelectorAll('.hero-slide');
    const indicators = document.querySelectorAll('.hero-slider-indicators .indicator');
    const prevBtn = document.getElementById('heroSliderPrev');
    const nextBtn = document.getElementById('heroSliderNext');
    const sliderContainer = document.querySelector('.hero-slider');

    if (!track || !slides || slides.length === 0 || !sliderContainer) return;

    const totalSlides = slides.length;
    const AUTO_PLAY_DELAY = 7000;
    const TRANSITION_DURATION = 1200;

    let autoPlayInterval = null;
    let isTransitioning = false;
    let safetyTimer = null;

    // ===== CLONAR PARA EFECTO INFINITO =====
    const firstClone = slides[0].cloneNode(true);
    const lastClone = slides[totalSlides - 1].cloneNode(true);
    firstClone.setAttribute('aria-hidden', 'true');
    lastClone.setAttribute('aria-hidden', 'true');
    track.appendChild(firstClone);
    track.insertBefore(lastClone, slides[0]);

    const allSlides = track.querySelectorAll('.hero-slide');
    const totalAllSlides = allSlides.length;
    let realIndex = 1;

    function setTransitionOn(on) {
        track.style.transition = on
            ? `transform ${TRANSITION_DURATION}ms cubic-bezier(0.65, 0, 0.35, 1)`
            : 'none';
    }

    function setPosition(index) {
        track.style.transform = `translateX(-${index * 100}%)`;
    }

    function updateIndicators(index) {
        let indicatorIndex = index - 1;
        if (indicatorIndex < 0) indicatorIndex = totalSlides - 1;
        if (indicatorIndex >= totalSlides) indicatorIndex = 0;
        indicators.forEach((ind, i) => ind.classList.toggle('active', i === indicatorIndex));
    }

    function clearSafetyTimer() {
        if (safetyTimer) {
            clearTimeout(safetyTimer);
            safetyTimer = null;
        }
    }

    // Salto silencioso (sin animación) a una posición, usado para
    // el "teletransporte" entre clon y slide real.
    function jumpTo(index) {
        realIndex = index;
        setTransitionOn(false);
        setPosition(realIndex);
        void track.offsetHeight; // forzar reflow antes de reactivar la transición
        setTransitionOn(true);
    }

    // Único punto que cierra una transición animada.
    function handleTransitionEnd() {
        if (!isTransitioning) return;
        isTransitioning = false;
        clearSafetyTimer();

        if (realIndex === totalAllSlides - 1) {
            jumpTo(1);
        } else if (realIndex === 0) {
            jumpTo(totalSlides);
        }
    }

    track.addEventListener('transitionend', function (e) {
        if (e.target !== track || e.propertyName !== 'transform') return;
        handleTransitionEnd();
    });

    // Navegación animada a un índice (puede ser un slide clon,
    // el salto se resuelve solo en handleTransitionEnd).
    function goToSlide(index) {
        if (isTransitioning) return;
        isTransitioning = true;
        realIndex = index;
        setTransitionOn(true);
        setPosition(realIndex);
        updateIndicators(realIndex);

        clearSafetyTimer();
        safetyTimer = setTimeout(handleTransitionEnd, TRANSITION_DURATION + 200);
    }

    function nextSlide() {
        if (!isTransitioning) goToSlide(realIndex + 1);
    }

    function prevSlide() {
        if (!isTransitioning) goToSlide(realIndex - 1);
    }

    function startAutoPlay() {
        stopAutoPlay();
        autoPlayInterval = setInterval(nextSlide, AUTO_PLAY_DELAY);
    }

    function stopAutoPlay() {
        if (autoPlayInterval) {
            clearInterval(autoPlayInterval);
            autoPlayInterval = null;
        }
    }

    // ===== BOTONES =====
    prevBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        stopAutoPlay();
        prevSlide();
        startAutoPlay();
    });

    nextBtn?.addEventListener('click', function (e) {
        e.stopPropagation();
        stopAutoPlay();
        nextSlide();
        startAutoPlay();
    });

    // ===== INDICADORES =====
    indicators.forEach((indicator, index) => {
        indicator.addEventListener('click', function (e) {
            e.stopPropagation();
            const targetIndex = index + 1;
            if (targetIndex !== realIndex && !isTransitioning) {
                stopAutoPlay();
                goToSlide(targetIndex);
                startAutoPlay();
            }
        });
    });

    // ===== DRAG TO SLIDE (mouse + touch, misma lógica) =====
    let isDragging = false;
    let startX = 0;
    let startTranslateX = 0;
    let currentTranslateX = 0;
    let isDraggingActive = false;
    let dragStartTime = 0;

    function getCurrentTranslate() {
        const style = window.getComputedStyle(track);
        const transform = style.transform;
        if (!transform || transform === 'none') return realIndex * 100;
        const matrix = new DOMMatrixReadOnly(transform);
        return -(matrix.m41 / sliderContainer.offsetWidth) * 100;
    }

    function dragStart(clientX) {
        // No permitir empezar a arrastrar en medio de una transición
        // animada: evita que el track quede en un estado intermedio.
        if (isTransitioning) return false;

        stopAutoPlay();
        clearSafetyTimer();

        const current = getCurrentTranslate();
        setTransitionOn(false);
        track.style.transform = `translateX(-${current}%)`;
        void track.offsetWidth;

        isDragging = true;
        isDraggingActive = false;
        startX = clientX;
        startTranslateX = current;
        currentTranslateX = current;
        dragStartTime = Date.now();
        sliderContainer.style.cursor = 'grabbing';
        return true;
    }

    function dragMove(clientX) {
        if (!isDragging) return;
        const diff = (clientX - startX) / sliderContainer.offsetWidth * 100;
        const translateX = startTranslateX - diff;
        const maxTranslate = (totalAllSlides - 1) * 100;
        if (translateX < -10 || translateX > maxTranslate + 10) return;
        track.style.transform = `translateX(-${translateX}%)`;
        currentTranslateX = translateX;
        if (Math.abs(clientX - startX) > 8) isDraggingActive = true;
    }

    function dragEnd() {
        if (!isDragging) return;
        isDragging = false;
        sliderContainer.style.cursor = 'grab';

        const diff = Math.abs(currentTranslateX - startTranslateX);
        const timeDiff = Date.now() - dragStartTime;

        if (isDraggingActive && diff > 10) {
            let targetIndex = Math.round(currentTranslateX / 100);

            // Movimiento rápido (flick): priorizar la dirección aunque
            // no se haya recorrido mucha distancia.
            if (timeDiff < 300 && diff > 30) {
                const direction = currentTranslateX < startTranslateX ? 1 : -1;
                targetIndex = Math.round(startTranslateX / 100) + direction;
            }

            targetIndex = Math.max(0, Math.min(targetIndex, totalAllSlides - 1));

            if (targetIndex !== realIndex) {
                goToSlide(targetIndex);
            } else {
                // Mismo índice: sólo asegurar que quede alineado.
                setTransitionOn(true);
                setPosition(realIndex);
            }
        } else {
            // Sin arrastre significativo: volver suavemente a donde estaba.
            setTransitionOn(true);
            setPosition(realIndex);
        }

        isDraggingActive = false;
        startAutoPlay();
    }

    // Mouse
    sliderContainer.addEventListener('mousedown', function (e) {
        if (e.button !== 0) return;
        e.preventDefault();
        dragStart(e.clientX);
    });
    document.addEventListener('mousemove', function (e) {
        dragMove(e.clientX);
    });
    document.addEventListener('mouseup', function () {
        dragEnd();
    });

    // Touch
    sliderContainer.addEventListener('touchstart', function (e) {
        const touch = e.touches[0];
        if (!touch) return;
        dragStart(touch.clientX);
    }, { passive: true });

    sliderContainer.addEventListener('touchmove', function (e) {
        const touch = e.touches[0];
        if (!touch) return;
        dragMove(touch.clientX);
    }, { passive: true });

    sliderContainer.addEventListener('touchend', function () {
        dragEnd();
    }, { passive: true });

    sliderContainer.addEventListener('dragstart', function (e) {
        e.preventDefault();
    });
    sliderContainer.style.cursor = 'grab';

    // ===== PAUSAR AL PASAR EL MOUSE =====
    sliderContainer.addEventListener('mouseenter', stopAutoPlay);
    sliderContainer.addEventListener('mouseleave', startAutoPlay);

    // ===== INICIAR =====
    setTransitionOn(false);
    setPosition(realIndex);
    void track.offsetHeight;
    setTransitionOn(true);
    updateIndicators(realIndex);
    startAutoPlay();

    document.addEventListener('visibilitychange', function () {
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
document.addEventListener('DOMContentLoaded', function () {
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
document.getElementById('whatsappToggle')?.addEventListener('click', function (e) {
    e.stopPropagation();
    document.getElementById('whatsappMenu').classList.toggle('open');
});
document.addEventListener('click', function () {
    document.getElementById('whatsappMenu')?.classList.remove('open');
});

// ============================================================
// ANIMACIONES AL SCROLL (REVEAL)
// ============================================================
document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('DOMContentLoaded', function () {
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
document.addEventListener('DOMContentLoaded', function () {
    const dropdowns = document.querySelectorAll('.dropdown');

    dropdowns.forEach(function (dropdown) {
        const link = dropdown.querySelector('.dropdown-toggle');
        const menu = dropdown.querySelector('.dropdown-menu');
        if (!link || !menu) return;
        link.addEventListener('click', handleDropdownClick);
    });

    function handleDropdownClick(e) {
        const dropdown = this.closest('.dropdown');

        e.preventDefault();
        e.stopPropagation();

        if (dropdown.classList.contains('open')) {
            closeDropdown(dropdown);
            return;
        }

        document.querySelectorAll('.dropdown.open').forEach(function (other) {
            if (other !== dropdown) closeDropdown(other);
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

    document.addEventListener('click', function (e) {
        const isDropdown = e.target.closest('.dropdown');
        if (!isDropdown) {
            document.querySelectorAll('.dropdown.open').forEach(function (dropdown) {
                closeDropdown(dropdown);
            });
        }
    });
});