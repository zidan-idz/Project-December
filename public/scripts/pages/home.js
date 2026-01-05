const HomePage = {
    render() {
        const app = document.getElementById('app');
        const isDecember = CONFIG.isDecember();

        app.innerHTML = `
            <div class="home-container">
                <div class="bg-blur-circle"></div>
                
                <div class="title-group">
                    <div class="title-badge-wrapper">
                        <div class="seasonal-badge">${isDecember ? "It's December Again" : "Not December Yet"}</div>
                    </div>
                    <h1 class="title-main text-center mb-3">Project-December</h1>
                </div>
                
                <p class="subtitle-main text-center mb-5">
                    Sebuah tempat di internet untuk melepaskan "beban" di akhir tahun.<br>
                    Anonim. Tanpa penghakiman. Hanya kejujuran.
                </p>

                <div class="form-box p-4 mb-5" id="form-container"></div>

                <div class="btn-group-bottom d-flex gap-3 mb-4">
                    <button class="btn-pill" onclick="Router.navigate('snowfall')">
                        <i class="bi bi-quote me-1"></i>See the snow fall
                    </button>
                    <button class="btn-pill" onclick="Router.navigate('about')">
                        <i class="bi bi-info-circle me-1"></i>About this site
                    </button>
                </div>
            </div>
        `;

        this.renderForm(isDecember);
        CONFIG.log('HomePage: Rendered');
    },

    renderForm(isDecember) {
        const container = document.getElementById('form-container');

        if (isDecember) {
            container.innerHTML = `
                <h2 class="form-title text-center mb-2">Apa yang ingin kamu lepaskan?</h2>
                <p class="form-desc text-center fst-italic mb-3">
                    Tuliskan pengalaman, penyesalan, atau cerita yang tersimpan di hatimu.
                </p>
                
                <textarea 
                    id="confession-input" 
                    class="input-textarea mb-2"
                    placeholder="Ketika tulisan dibaca oleh orang asing, kejujurannya muncul apa adanya..."
                    maxlength="${CONFIG.CHAR_MAX}"
                ></textarea>
                
                <div class="char-counter text-end small mb-3">
                    <span id="char-count">0 / ${CONFIG.CHAR_MAX}</span>
                </div>
                
                <div id="form-message"></div>
                
                <button class="btn-submit d-block mx-auto" onclick="HomePage.submit()">
                    Lepaskan
                </button>
            `;

            document.getElementById('confession-input')
                .addEventListener('input', this.updateCharCount);

        } else {
            container.innerHTML = `
                <div class="locked-state text-center py-3">
                    <div><i class="bi bi-lock"></i></div>
                    <h2>Come Back in December</h2>
                    <p>Halaman ini hanya membuka hatinya di bulan Desember.</p>
                    <p class="hint">Tapi kamu masih bisa membaca tulisan orang lain di bawah.</p>
                </div>
            `;
        }
    },

    updateCharCount() {
        const textarea = document.getElementById('confession-input');
        const count = textarea.value.length;
        const countEl = document.getElementById('char-count');

        countEl.textContent = `${count} / ${CONFIG.CHAR_MAX}`;
        countEl.classList.remove('warning', 'error');

        if (count < CONFIG.CHAR_MIN) {
            countEl.classList.add('error');
        } else if (count > CONFIG.CHAR_MAX - 100) {
            countEl.classList.add('warning');
        }
    },

    async submit() {
        const textarea = document.getElementById('confession-input');
        const messageEl = document.getElementById('form-message');
        const submitBtn = document.querySelector('.btn-submit');
        const text = textarea.value.trim();
        const originalBtnText = submitBtn.textContent;

        messageEl.innerHTML = '';

        if (text.length < CONFIG.CHAR_MIN || text.length > CONFIG.CHAR_MAX) {
            messageEl.innerHTML = `
                <div class="form-error">
                    Tulisanmu harus antara ${CONFIG.CHAR_MIN}-${CONFIG.CHAR_MAX} karakter.
                </div>
            `;
            return;
        }

        submitBtn.textContent = 'Melepaskan...';
        submitBtn.disabled = true;
        submitBtn.style.opacity = '0.7';
        submitBtn.style.cursor = 'wait';

        try {
            const data = await API.postMessage(text);
            messageEl.innerHTML = `
                <div class="form-success">
                    ✓ ${data.message || 'Tulisanmu telah dilepaskan ke langit Desember'}
                </div>
            `;
            textarea.value = '';
            this.updateCharCount();
            setTimeout(() => { messageEl.innerHTML = ''; }, 5000);

        } catch (error) {
            messageEl.innerHTML = `<div class="form-error">${error.message}</div>`;
        } finally {
            submitBtn.textContent = originalBtnText;
            submitBtn.disabled = false;
            submitBtn.style.opacity = '';
            submitBtn.style.cursor = '';
        }
    }
};
