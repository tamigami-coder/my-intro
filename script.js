document.addEventListener('DOMContentLoaded', () => {

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                obs.unobserve(entry.target);
            }
        });
    }, observerOptions);

    const animatedElements = document.querySelectorAll('.animate-on-scroll');
    animatedElements.forEach(el => observer.observe(el));

    // ---- [イースターエッグのロジック] ----
    const secrets = document.querySelectorAll('.secret-fragment');
    const TOTAL_SECRETS = 5;
    const foundSecrets = new Set();
    const notificationsContainer = document.getElementById('notifications');
    const modal = document.getElementById('completion-modal');
    const closeModalBtn = document.getElementById('close-modal');

    function showNotification(message) {
        const toast = document.createElement('div');
        toast.className = 'glass-card border border-white/80 p-4 shadow-xl rounded-2xl toast-enter w-64 md:w-72 text-sm flex items-center gap-3 backdrop-blur-md pointer-events-auto text-slate-800 font-bold';
        
        toast.innerHTML = `
            <div class="w-7 h-7 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
            </div>
            <div>${message}</div>
        `;
        
        notificationsContainer.appendChild(toast);

        setTimeout(() => {
            toast.classList.remove('toast-enter');
            toast.classList.add('toast-leave');
            setTimeout(() => {
                toast.remove();
            }, 400);
        }, 3000);
    }

    function triggerConfetti() {
        const duration = 3 * 1000;
        const animationEnd = Date.now() + duration;
        const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 10000 };

        function randomInRange(min, max) {
            return Math.random() * (max - min) + min;
        }

        const interval = setInterval(function() {
            const timeLeft = animationEnd - Date.now();

            if (timeLeft <= 0) {
                return clearInterval(interval);
            }

            const particleCount = 50 * (timeLeft / duration);
            confetti({
                ...defaults, particleCount,
                colors: ['#2563eb', '#3b82f6', '#93c5fd', '#dbeafe', '#ffffff'],
                origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 }
            });
            confetti({
                ...defaults, particleCount,
                colors: ['#2563eb', '#3b82f6', '#93c5fd', '#dbeafe', '#ffffff'],
                origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 }
            });
        }, 250);
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
                this.style.pointerEvents = 'none';

                this.style.filter = 'drop-shadow(0 0 10px rgba(37, 99, 235, 0.5))';
                if(this.tagName.toLowerCase() !== 'img' && !this.querySelector('img')){
                    this.style.color = '#2563eb'; // Blue accent
                }

                if (count < TOTAL_SECRETS) {
                    showNotification(`[${count}/${TOTAL_SECRETS}] Fragment Acquired!`);
                } else {
                    showNotification(`[${count}/${TOTAL_SECRETS}] All fragments combined.`);
                    
                    setTimeout(() => {
                        triggerConfetti();
                        modal.classList.add('show');
                    }, 1000);
                }
            }
        });
    });

    // ---- [トップへ戻るボタンのロジック] ----
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');

    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.style.opacity = '1';
            scrollToTopBtn.style.pointerEvents = 'auto';
        } else {
            scrollToTopBtn.style.opacity = '0';
            scrollToTopBtn.style.pointerEvents = 'none';
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });

    closeModalBtn.addEventListener('click', () => {
        modal.classList.remove('show');
    });
});
