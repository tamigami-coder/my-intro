document.addEventListener('DOMContentLoaded', () => {

    // --- [1. Marquee Scroll Logic & Scroll to Top] ---
    const marquee = document.querySelector('.marquee-text');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    let currentScroll = 0;

    window.addEventListener('scroll', () => {
        currentScroll = window.scrollY;
        
        // Move text to the left as you scroll down
        if (marquee) {
            marquee.style.transform = `translateX(-${currentScroll * 0.5}px)`;
        }

        // Toggle Scroll to Top Button
        if (scrollToTopBtn) {
            if (currentScroll > 300) {
                scrollToTopBtn.style.opacity = '1';
                scrollToTopBtn.style.pointerEvents = 'auto';
            } else {
                scrollToTopBtn.style.opacity = '0';
                scrollToTopBtn.style.pointerEvents = 'none';
            }
        }
    });

    if (scrollToTopBtn) {
        scrollToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }

    // --- [2. Scroll Reveal] ---
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const revealElements = document.querySelectorAll('.brutal-reveal');
    revealElements.forEach(el => {
        observer.observe(el);
    });

    // --- [3. Secret Fragments] ---
    const secrets = document.querySelectorAll('.secret-fragment');
    const TOTAL_SECRETS = 5;
    const foundSecrets = new Set();
    const modal = document.getElementById('completion-modal');
    const closeModalBtn = document.getElementById('close-modal');

    // Create brutalist toast container
    const notificationsContainer = document.createElement('div');
    notificationsContainer.style.position = 'fixed';
    notificationsContainer.style.bottom = '20px';
    notificationsContainer.style.right = '20px';
    notificationsContainer.style.zIndex = '9999';
    notificationsContainer.style.display = 'flex';
    notificationsContainer.style.flexDirection = 'column';
    notificationsContainer.style.gap = '10px';
    document.body.appendChild(notificationsContainer);

    function showNotification(message) {
        const toast = document.createElement('div');
        toast.className = 'brutal-box';
        toast.style.padding = '10px 20px';
        toast.style.fontWeight = '900';
        toast.style.backgroundColor = '#ff3b30'; // Red alert
        toast.style.color = '#fff';
        toast.style.animation = 'slideInRight 0.2s forwards';
        
        toast.innerText = message;
        notificationsContainer.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    function triggerConfetti() {
        const duration = 2 * 1000;
        const animationEnd = Date.now() + duration;

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();
            if (timeLeft <= 0) return clearInterval(interval);

            confetti({
                particleCount: 50,
                startVelocity: 30,
                spread: 360,
                colors: ['#000000', '#ffeb3b', '#ff3b30', '#ffffff'],
                shapes: ['square'], // Brutalist shapes
                origin: { x: Math.random(), y: Math.random() - 0.2 }
            });
        }, 200);
    }

    secrets.forEach(secret => {
        secret.addEventListener('click', function(e) {
            e.stopPropagation();
            e.preventDefault();
            
            const id = this.getAttribute('data-id');
            if (!foundSecrets.has(id)) {
                foundSecrets.add(id);
                const count = foundSecrets.size;
                
                this.classList.add('found');

                if (count < TOTAL_SECRETS) {
                    showNotification(`💥 TARGET ${count}/${TOTAL_SECRETS} DESTROYED`);
                } else {
                    showNotification(`🔥 ALL SECRETS UNLOCKED`);
                    setTimeout(() => {
                        triggerConfetti();
                        modal.classList.add('show');
                    }, 500);
                }
            }
        });
    });

    if(closeModalBtn) {
        closeModalBtn.addEventListener('click', () => {
            modal.classList.remove('show');
        });
    }
});
