const SnowfallPage = {
    confessions: [],

    render() {
        const app = document.getElementById('app');

        app.innerHTML = `
            <div class="page-container snowfall-page">
                <div class="bg-blur-circle"></div>
                
                <div class="nav-header justify-content-between">
                    <button class="btn-pill-sm" onclick="Router.navigate('home')">
                        <i class="bi bi-arrow-left"></i> Back
                    </button>
                    <button class="btn-pill-sm" onclick="SnowfallPage.loadConfessions()">
                        <i class="bi bi-arrow-repeat"></i> Refresh
                    </button>
                </div>
                
                <p class="page-hint text-center fst-italic mt-5 mb-3">
                    Klik salju untuk membaca tulisan seseorang...
                </p>
                
                <div class="snowfall-container" id="snowfall-container"></div>
            </div>
        `;

        this.loadConfessions();
        CONFIG.log('SnowfallPage: Rendered');
    },

    async loadConfessions() {
        const container = document.getElementById('snowfall-container');
        if (!container) return;

        container.innerHTML = `
            <div class="loading">
                <div class="spinner"></div>
                <p>Mengumpulkan tulisan...</p>
            </div>
        `;

        try {
            this.confessions = await API.getMessages();
            container.innerHTML = '';

            if (this.confessions.length === 0) {
                container.innerHTML = `
                    <div class="empty-state">
                        <p>Belum ada tulisan.</p>
                        <p class="empty-hint">Jadilah yang pertama berbagi.</p>
                    </div>
                `;
                return;
            }

            this.confessions.forEach((confession, index) => {
                const snowflake = this.createSnowflake(confession, index);
                container.appendChild(snowflake);
            });

            CONFIG.log('SnowfallPage: Loaded', this.confessions.length, 'confessions');

        } catch (error) {
            container.innerHTML = `
                <div class="error-state">
                    <p>Gagal memuat tulisan</p>
                    <button onclick="SnowfallPage.loadConfessions()" class="btn-retry">
                        Coba Lagi
                    </button>
                </div>
            `;
        }
    },

    createSnowflake(confession, index) {
        const snowflake = document.createElement('div');
        snowflake.className = 'snowflake';
        snowflake.setAttribute('data-id', confession.id);

        const startX = Math.random() * window.innerWidth;
        const duration = CONFIG.SNOWFLAKE.MIN_DURATION +
            Math.random() * (CONFIG.SNOWFLAKE.MAX_DURATION - CONFIG.SNOWFLAKE.MIN_DURATION);
        const delay = Math.random() * CONFIG.SNOWFLAKE.MAX_DELAY;
        const size = CONFIG.SNOWFLAKE.MIN_SIZE +
            Math.random() * (CONFIG.SNOWFLAKE.MAX_SIZE - CONFIG.SNOWFLAKE.MIN_SIZE);

        snowflake.style.left = startX + 'px';
        snowflake.style.top = '-20px';
        snowflake.style.width = size + 'px';
        snowflake.style.height = size + 'px';
        snowflake.style.animation = `fall ${duration}s linear ${delay}s infinite`;

        snowflake.addEventListener('animationiteration', () => {
            snowflake.style.left = Math.random() * window.innerWidth + 'px';
        });

        snowflake.onclick = (e) => {
            e.stopPropagation();
            Modal.show(confession);
        };

        return snowflake;
    }
};
