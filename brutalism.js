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

    // Moe-Counterの設定（数値データ取得用）
    let cachedVisitorCount = null; // 重複カウント防止用のキャッシュ変数

    async function handleVisitorCounter(forceFetch = false) {
        const visitorCountEl = document.getElementById('visitorCount');
        if (!visitorCountEl) return;

        // キャッシュがあり、強制取得でない場合はキャッシュを表示して終了
        if (cachedVisitorCount !== null && !forceFetch) {
            visitorCountEl.innerText = cachedVisitorCount.toLocaleString();
            return cachedVisitorCount;
        }

        try {
            // Moe-Counterの数値データ取得用エンドポイント (/record/)
            // 注意: このエンドポイントにアクセスするとカウントが+1されます
            const response = await fetch(`https://count.getloli.com/record/@tamigami-portfolio-2026`);
            if (!response.ok) throw new Error('Network response was not ok');
            
            const data = await response.json();
            
            // data.num に現在のカウント数が含まれます
            if (data.num !== undefined) {
                cachedVisitorCount = data.num; // キャッシュに保存
                if (visitorCountEl) {
                    visitorCountEl.innerText = cachedVisitorCount.toLocaleString();
                }
            }
            return cachedVisitorCount;
        } catch (error) {
            console.error("Moe-Counter Error:", error);
            if (visitorCountEl) visitorCountEl.innerText = "---"; 
            return null;
        }
    }

    // 読み込み時に最新の来場者数を取得（カウントアップを伴う）
    handleVisitorCounter(true);

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
                
                // 管理者認証成功のログ（カウントを増やさないようキャッシュを利用）
                handleVisitorCounter(false);
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

    // --- [6. AI Mutation Agent (Terminal)] ---
    const aiTerminal = document.getElementById('ai-terminal');
    const toggleBtn = document.getElementById('toggle-terminal');
    const termHeader = document.getElementById('ai-terminal-header');
    const termLog = document.getElementById('ai-terminal-log');
    const termInput = document.getElementById('ai-terminal-input');
    
    // スタイルの動的挿入用タグ
    let styleTag = document.getElementById('ai-mutation-styles');
    if (!styleTag) {
        styleTag = document.createElement('style');
        styleTag.id = 'ai-mutation-styles';
        document.head.appendChild(styleTag);
    }

    let isTerminalOpen = true;

    // ターミナルの開閉トグル
    if (toggleBtn && aiTerminal) {
        toggleBtn.addEventListener('click', () => {
            if (isTerminalOpen) {
                // 閉じる（ヘッダーだけ残して下に隠す）
                aiTerminal.style.transform = `translateY(calc(100% - ${termHeader.offsetHeight}px))`;
                toggleBtn.innerText = '+';
            } else {
                // 開く
                aiTerminal.style.transform = 'translateY(0)';
                toggleBtn.innerText = '-';
            }
            isTerminalOpen = !isTerminalOpen;
        });
    }

    // ドラッグ移動の実装
    let isDragging = false;
    let dragOffsetX = 0;
    let dragOffsetY = 0;

    if (termHeader && aiTerminal) {
        termHeader.addEventListener('mousedown', (e) => {
            if(e.target === toggleBtn) return;
            isDragging = true;
            termHeader.style.cursor = 'grabbing';
            const rect = aiTerminal.getBoundingClientRect();
            dragOffsetX = e.clientX - rect.left;
            dragOffsetY = e.clientY - rect.top;
        });

        document.addEventListener('mousemove', (e) => {
            if (!isDragging) return;
            
            let newX = e.clientX - dragOffsetX;
            let newY = e.clientY - dragOffsetY;
            
            // 画面外に出ないように制限
            const maxX = window.innerWidth - aiTerminal.offsetWidth;
            const maxY = window.innerHeight - aiTerminal.offsetHeight;
            newX = Math.max(0, Math.min(newX, maxX));
            newY = Math.max(0, Math.min(newY, maxY));
            
            aiTerminal.style.left = `${newX}px`;
            aiTerminal.style.bottom = `auto`; // fixedなのでtopベースで上書き
            aiTerminal.style.top = `${newY}px`;
            aiTerminal.style.transform = 'none'; // transformとの競合を避ける
        });

        document.addEventListener('mouseup', () => {
            if(isDragging) {
                isDragging = false;
                termHeader.style.cursor = 'move';
            }
        });
    }

    // ログ書き込み関数
    function appendLog(text, isUser = false) {
        if (!termLog) return;
        const div = document.createElement('div');
        div.innerText = isUser ? `> USER: ${text}` : `> ${text}`;
        if(isUser) div.style.color = '#fff';
        termLog.appendChild(div);
        termLog.scrollTop = termLog.scrollHeight;
    }

    // ミューテーション実行関数
    function applyMutation(type) {
        const body = document.body;
        // 一瞬のグリッチ
        body.style.animation = 'none';
        void body.offsetWidth; // reflow
        body.style.animation = 'glitch 0.3s linear';

        let css = '';
        switch(type) {
            case 'chaos':
                appendLog('APPLYING MUTATION: CHAOS_MODE');
                css = `
                    body { animation: screenShake 0.5s infinite; filter: hue-rotate(90deg) contrast(150%); }
                    .brutal-box { transform: rotate(10deg) scale(1.05) skew(5deg) !important; background-color: #ff3b30 !important; transition: all 0.5s; }
                    .brutal-box:nth-child(even) { transform: rotate(-10deg) scale(0.95) skew(-5deg) !important; background-color: #000 !important; color: #fff !important;}
                    h1, h2, h3 { color: #fff !important; background: #000; mix-blend-mode: difference; }
                    img { filter: invert(100%); }
                    @keyframes screenShake {
                        0%, 100% { transform: translate(0, 0) rotate(0deg); }
                        25% { transform: translate(2px, 2px) rotate(1deg); }
                        50% { transform: translate(-2px, -2px) rotate(-1deg); }
                        75% { transform: translate(-2px, 2px) rotate(0deg); }
                    }
                `;
                break;
            case 'dark':
                appendLog('APPLYING MUTATION: DARK_FANTASY');
                css = `
                    body, main { background-color: #050505 !important; color: #b91c1c !important; }
                    .brutal-box { background-color: #111 !important; color: #b91c1c !important; border-color: #b91c1c !important; box-shadow: 4px 4px 0 #b91c1c !important; }
                    .bg-[#ffeb3b], .bg-[#4ade80], .bg-white, .bg-[#ff9ee5] { background-color: #1a1a1a !important; color: #dc2626 !important; border-color: #b91c1c !important; box-shadow: 4px 4px 0 #450a0a !important; }
                    h1, h2 { color: #7f1d1d !important; text-shadow: 4px 4px 0 #450a0a, -2px -2px 0 #000; drop-shadow: none !important; }
                    img { filter: grayscale(100%) contrast(150%); border-color: #b91c1c !important; }
                    .marquee-container { background-color: #000 !important; color: #dc2626 !important; border-bottom: 2px solid #b91c1c; }
                    .text-black { color: #ef4444 !important; }
                    .scroll-text { color: #ef4444 !important; }
                `;
                break;
            case 'cyber':
                appendLog('APPLYING MUTATION: CYBERPUNK');
                css = `
                    body { background-color: #000 !important; color: #0ff !important; font-family: monospace !important; }
                    .brutal-box { background-color: rgba(0, 20, 20, 0.8) !important; border: 2px solid #0ff !important; box-shadow: 0 0 10px #0ff !important; color: #f0f !important; }
                    .bg-[#ffeb3b], .bg-[#4ade80], .bg-white, .bg-[#ff9ee5] { background-color: #000 !important; color: #0ff !important; border-color: #f0f !important; box-shadow: 4px 4px 0px #0ff !important;}
                    h1, h2, h3 { text-shadow: 0 0 10px #0ff, 0 0 20px #0ff !important; color: #fff !important; }
                    .marquee-container { background-color: #f0f !important; color: #0ff !important; text-shadow: 2px 2px 0 #000; font-family: monospace; }
                    .text-black { color: #fff !important; }
                    * { cursor: crosshair !important; }
                `;
                break;
            case 'reset':
                appendLog('RESTORING ORIGINAL DOM STRUCTURE...');
                css = ''; 
                break;
        }

        setTimeout(() => {
            styleTag.innerHTML = css;
            if(type === 'reset') {
                appendLog('MUTATION CLEARED. SYSTEM NORMAL.');
            } else {
                appendLog('STYLE INJECTED SUCCESSFULLY.');
            }
        }, 800);
    }

    // コマンドの解析処理
    if (termInput) {
        termInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                const val = termInput.value.trim();
                if (!val) return;
                
                appendLog(val, true);
                termInput.value = '';

                appendLog('ANALYZING INPUT...');
                
                setTimeout(() => {
                    const lowerVal = val.toLowerCase();
                    if (/カオス|かおす|もっと|壊|めちゃくちゃ|chaos/.test(lowerVal)) {
                        applyMutation('chaos');
                    } else if (/ダーク|暗|ホラー|dark|ファンタジー|fantasy/.test(lowerVal)) {
                        applyMutation('dark');
                    } else if (/サイバー|ネオン|cyber|未|ハッカー|hack/.test(lowerVal)) {
                        applyMutation('cyber');
                    } else if (/戻|元|リセット|通常|reset|clear/.test(lowerVal)) {
                        applyMutation('reset');
                    } else {
                        appendLog('COMMAND NOT RECOGNIZED. TRY: カオス, ダーク, サイバー, リセット 等');
                    }
                }, 600);
            }
        });
    }
});
