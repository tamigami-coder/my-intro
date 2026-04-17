document.addEventListener('DOMContentLoaded', () => {

    // --- [1. マーキー（流れる文字）とトップへ戻るボタンのロジック] ---
    const marquee = document.querySelector('.marquee-text');
    const scrollToTopBtn = document.getElementById('scrollToTopBtn');
    let currentScroll = 0;

    window.addEventListener('scroll', () => {
        currentScroll = window.scrollY;
        
        // スクロールに合わせてテキストを左に移動
        if (marquee) {
            marquee.style.transform = `translateX(-${currentScroll * 0.5}px)`;
        }

        // トップへ戻るボタンの表示・非表示切り替え
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

    // --- [2. スクロール時の要素表示（Scroll Reveal）] ---
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

    // --- [3. 隠し要素（シークレット・フラグメント）のロジック] ---
    const secrets = document.querySelectorAll('.secret-fragment');
    const TOTAL_SECRETS = 5;
    const foundSecrets = new Set();
    const modal = document.getElementById('completion-modal');
    const closeModalBtn = document.getElementById('close-modal');

    // ブルータリズム風通知（トースト）コンテナの作成
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
        toast.style.backgroundColor = '#ff3b30'; // 赤色の警告色
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
                shapes: ['square'], // ブルータリズムに合わせた四角形の紙吹雪
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

    // --- [4. 言語切り替えロジック] ---
    const langToggle = document.getElementById('langToggle');
    let currentLang = localStorage.getItem('lang') || 'jp';

    function setLanguage(lang) {
        const translatable = document.querySelectorAll('[data-jp]');
        translatable.forEach(el => {
            const jpText = el.getAttribute('data-jp');
            const enText = el.getAttribute('data-en');
            
            // テキストの流し込み（HTMLタグを含む場合があるため innerHTML を使用）
            if (lang === 'en') {
                el.innerHTML = enText;
            } else {
                el.innerHTML = jpText;
            }
        });
        
        currentLang = lang;
        localStorage.setItem('lang', lang);
        
        // ボタンの見た目を更新（アクティブな言語を強調）
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

    // 初期言語の設定
    setLanguage(currentLang);

    if (langToggle) {
        langToggle.addEventListener('click', () => {
            setLanguage(currentLang === 'jp' ? 'en' : 'jp');
            
            // ボタンクリック時のグリッチ演出
            langToggle.style.animation = 'glitch 0.2s linear';
            setTimeout(() => langToggle.style.animation = '', 200);
        });
    }

    // --- [5. 管理者パネルのロジック] ---
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

    // パスワード "1234" の SHA-256 ハッシュ
    const ADMIN_PASS_HASH = '03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4';

    // 文字列を SHA-256 でハッシュ化する関数（ブラウザ標準の Crypto API を使用）
    async function sha256(message) {
        const msgBuffer = new TextEncoder().encode(message);
        const hashBuffer = await crypto.subtle.digest('SHA-256', msgBuffer);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        return hashHex;
    }

    // モーダル等の表示・非表示を制御するヘルパー関数
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

    // サイドバーの開閉
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

    // 管理者ログイン用モーダルの開閉
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

    // 管理者認証の実行
    if (submitAuth) {
        submitAuth.addEventListener('click', async () => {
            const input = passwordInput.value;
            const hashedInput = await sha256(input);
            
            if (hashedInput === ADMIN_PASS_HASH) {
                toggleElement(adminAuthModal, false);
                toggleElement(adminDashboardModal, true);
                passwordInput.value = '';
                
                // 管理者認証成功のログ（数値表示は画像埋め込みのため自動更新）
                console.log('ADMIN ACCESS GRANTED');
            } else {
                alert('ACCESS DENIED: INVALID KEY');
                passwordInput.value = '';
            }
        });
    }

    // ダッシュボードの終了 / ログアウト
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
