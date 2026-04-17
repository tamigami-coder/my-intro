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

    // --- [4. Language Toggle Logic] ---
    const langToggle = document.getElementById('langToggle');
    let currentLang = localStorage.getItem('lang') || 'jp';

    function setLanguage(lang) {
        const translatable = document.querySelectorAll('[data-jp]');
        translatable.forEach(el => {
            const jpText = el.getAttribute('data-jp');
            const enText = el.getAttribute('data-en');
            
            // If the element has children (like bold tags), we might need to handle HTML
            // But for this simple portfolio, textContent/innerHTML is usually fine
            if (lang === 'en') {
                el.innerHTML = enText;
            } else {
                el.innerHTML = jpText;
            }
        });
        
        currentLang = lang;
        localStorage.setItem('lang', lang);
        
        // Visual feedback on button
        const langDisplay = langToggle?.querySelector('.lang-display');
        if(langDisplay) {
            const jpClass = lang === 'jp' ? 'active' : 'opacity-40';
            const enClass = lang === 'en' ? 'active' : 'opacity-40';
            
            langDisplay.innerHTML = `
                <span class="${jpClass}">JP</span>
                <span class="opacity-20">/</span>
                <span class="${enClass}">EN</span>
            `;
        }
    }

    // Initialize Language
    setLanguage(currentLang);

    // --- [5. Admin Panel Logic] ---
    const adminMenuBtn = document.getElementById('adminMenuBtn');
    const adminSidebar = document.getElementById('adminSidebar');
    const closeSidebar = document.getElementById('closeSidebar');
    const goToAdminBtn = document.getElementById('goToAdminBtn');
    const adminAuthModal = document.getElementById('adminAuthModal');
    const cancelAuth = document.getElementById('cancelAuth');
    const submitAuth = document.getElementById('submitAuth');
    const adminDashboardModal = document.getElementById('adminDashboardModal');
    const closeDashboard = document.getElementById('closeDashboard');
    const logoutAdmin = document.getElementById('logoutAdmin');
    const passwordInput = document.getElementById('adminPasswordInput');

    // SHA-256 hash of "1234"
    const ADMIN_PASS_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    function toggleElement(el, show) {
        if (!el) return;
        if (show) {
            el.classList.add('show');
            el.style.opacity = '1';
            el.style.pointerEvents = 'auto';
        } else {
            el.classList.remove('show');
            el.style.opacity = '0';
            el.style.pointerEvents = 'none';
        }
    }

    // Sidebar Toggles
    if (adminMenuBtn) {
        adminMenuBtn.addEventListener('click', () => {
            adminSidebar.style.transform = 'translateX(0)';
        });
    }

    if (closeSidebar) {
        closeSidebar.addEventListener('click', () => {
            adminSidebar.style.transform = 'translateX(100%)';
        });
    }

    // Auth Modal Toggles
    if (goToAdminBtn) {
        goToAdminBtn.addEventListener('click', () => {
            adminSidebar.style.transform = 'translateX(100%)';
            toggleElement(adminAuthModal, true);
            passwordInput.focus();
        });
    }

    if (cancelAuth) {
        cancelAuth.addEventListener('click', () => {
            toggleElement(adminAuthModal, false);
            passwordInput.value = '';
        });
    }

    // Auth Submission
    if (submitAuth) {
        submitAuth.addEventListener('click', async () => {
            const input = passwordInput.value;
            const hashedInput = await sha256(input);
            
            if (hashedInput === ADMIN_PASS_HASH) {
                toggleElement(adminAuthModal, false);
                toggleElement(adminDashboardModal, true);
                passwordInput.value = '';
                // Realistic mock number logic
                const mockCount = Math.floor(Math.random() * 500) + 1000;
                document.getElementById('visitorCount').innerText = mockCount.toLocaleString();
            } else {
                alert('ACCESS DENIED: INVALID KEY');
                passwordInput.value = '';
            }
        });
    }

    // Dashboard Close / Logout
    if (closeDashboard) {
        closeDashboard.addEventListener('click', () => {
            toggleElement(adminDashboardModal, false);
        });
    }

    if (logoutAdmin) {
        logoutAdmin.addEventListener('click', () => {
            toggleElement(adminDashboardModal, false);
            showNotification('LOGGED OUT');
        });
    }
});
