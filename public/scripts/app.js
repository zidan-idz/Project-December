// --- STATE ---
let currentPage = 'home';
let confessions = [];
let musicPlaying = false;

// --- INITIALIZATION ---
document.addEventListener('DOMContentLoaded', () => {
    initMusic();

    const path = window.location.pathname;
    if (path === '/snowfall') currentPage = 'snowfall';
    else if (path === '/about') currentPage = 'about';
    else currentPage = 'home';

    render();
});

// --- MUSIC CONTROL ---
function initMusic() {
    const audio = document.getElementById('background-music');
    const toggle = document.getElementById('music-toggle');
    const control = document.getElementById('music-control');

    if (!audio || !toggle || !control) return;

    const wasPlaying = localStorage.getItem('musicPlaying') === 'true';

    if (wasPlaying) {
        audio.play().then(() => {
            musicPlaying = true;
            control.classList.add('playing');
        }).catch(err => console.log('Audio autoplay prevented:', err));
    }

    document.addEventListener('click', () => {
        if (!musicPlaying) {
            audio.play().then(() => {
                musicPlaying = true;
                control.classList.add('playing');
                localStorage.setItem('musicPlaying', 'true');
            }).catch(err => console.log('Audio autoplay prevented:', err));
        }
    }, { once: true });

    toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        if (musicPlaying) {
            audio.pause();
            musicPlaying = false;
            control.classList.remove('playing');
            localStorage.setItem('musicPlaying', 'false');
        } else {
            audio.play();
            musicPlaying = true;
            control.classList.add('playing');
            localStorage.setItem('musicPlaying', 'true');
        }
    });
}

// --- ROUTING ---
function navigateTo(page) {
    closeModal(); // Ensure modal is closed on navigation
    currentPage = page;
    render();

    const pageMap = {
        'home': '/',
        'snowfall': '/snowfall',
        'about': '/about'
    };
    history.pushState({ page }, '', pageMap[page] || '/');
}

window.addEventListener('popstate', (e) => {
    if (e.state && e.state.page) {
        currentPage = e.state.page;
        render();
    }
});

// --- RENDER ENGINE ---
function render() {
    const app = document.getElementById('app');
    app.innerHTML = '';
    app.className = `page-${currentPage}`;

    if (currentPage === 'home') renderHome();
    else if (currentPage === 'snowfall') renderSnowfall();
    else if (currentPage === 'about') renderAbout();
}

// --- HOME PAGE ---
function renderHome() {
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
                <button class="btn-pill" onclick="navigateTo('snowfall')">
                    <i class="bi bi-quote me-1"></i>See the snow fall
                </button>
                <button class="btn-pill" onclick="navigateTo('about')">
                    <i class="bi bi-info-circle me-1"></i>About this site
                </button>
            </div>
        </div>
    `;

    renderForm();
}

function renderForm() {
    const container = document.getElementById('form-container');
    const isDecember = CONFIG.isDecember();

    if (isDecember) {
        container.innerHTML = `
            <h2 class="form-title text-center mb-2">Apa yang ingin kamu lepaskan?</h2>
            <p class="form-desc text-center fst-italic mb-3">Tuliskan pengalaman, penyesalan, atau cerita yang tersimpan di hatimu.</p>
            
            <textarea 
                id="confession-input" 
                class="input-textarea mb-2"
                placeholder="Ketika tulisan dibaca oleh orang asing, kejujurannya muncul apa adanya, tanpa polesan..."
                maxlength="${CONFIG.CHAR_MAX}"
            ></textarea>
            
            <div class="char-counter text-end small mb-3">
                <span id="char-count">0 / ${CONFIG.CHAR_MAX}</span>
            </div>
            
            <div id="form-message"></div>
            
            <button class="btn-submit d-block mx-auto" onclick="submitConfession()">
                Lepaskan
            </button>
        `;

        const textarea = document.getElementById('confession-input');
        textarea.addEventListener('input', updateCharCount);
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
}

// --- CONFESSION LOGIC ---
function updateCharCount() {
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
}

async function submitConfession() {
    const textarea = document.getElementById('confession-input');
    const messageEl = document.getElementById('form-message');
    const text = textarea.value.trim();
    const submitBtn = document.querySelector('.btn-submit');
    const originalBtnText = submitBtn.textContent;

    messageEl.innerHTML = '';

    if (text.length < CONFIG.CHAR_MIN || text.length > CONFIG.CHAR_MAX) {
        messageEl.innerHTML = `<div class="form-error">Tulisanmu harus antara ${CONFIG.CHAR_MIN}-${CONFIG.CHAR_MAX} karakter.</div>`;
        return;
    }

    submitBtn.textContent = 'Melepaskan...';
    submitBtn.disabled = true;
    submitBtn.style.opacity = '0.7';
    submitBtn.style.cursor = 'wait';

    try {
        const response = await fetch(`${CONFIG.API_URL}/messages`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });

        const data = await response.json();

        if (!response.ok) throw new Error(data.error || 'Gagal melepaskan tulisanmu');

        messageEl.innerHTML = `<div class="form-success">✓ ${data.message || 'Tulisanmu telah dilepaskan ke langit Desember'}</div>`;
        textarea.value = '';
        updateCharCount();

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

// --- SNOWFALL PAGE ---
function renderSnowfall() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="page-container snowfall-page">
            <div class="bg-blur-circle"></div>
            
            <div class="nav-header justify-content-between">
                <button class="btn-pill-sm" onclick="navigateTo('home')">
                    <i class="bi bi-arrow-left"></i> Back
                </button>
                <button class="btn-pill-sm" onclick="loadConfessions()">
                    <i class="bi bi-arrow-repeat"></i> Refresh
                </button>
            </div>
            
            <p class="page-hint text-center fst-italic mt-5 mb-3">Klik salju untuk membaca tulisan seseorang...</p>
            
            <div class="snowfall-container" id="snowfall-container"></div>
        </div>
    `;

    loadConfessions();
}

async function loadConfessions() {
    const container = document.getElementById('snowfall-container');
    if (!container) return;

    container.innerHTML = '<div class="loading"><div class="spinner"></div><p>Mengumpulkan tulisan...</p></div>';

    try {
        const response = await fetch(`${CONFIG.API_URL}/messages`);
        confessions = await response.json();

        container.innerHTML = '';

        if (confessions.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <p>Belum ada tulisan.</p>
                    <p class="empty-hint">Jadilah yang pertama berbagi.</p>
                </div>
            `;
            return;
        }

        confessions.forEach((confession, index) => {
            const snowflake = createSnowflake(confession, index);
            container.appendChild(snowflake);
        });

    } catch (error) {
        container.innerHTML = `
            <div class="error-state">
                <p>Gagal memuat tulisan</p>
                <button onclick="loadConfessions()" class="btn-retry">Coba Lagi</button>
            </div>
        `;
    }
}

function createSnowflake(confession, index) {
    const snowflake = document.createElement('div');
    snowflake.className = 'snowflake';
    snowflake.setAttribute('data-id', confession.id);

    const startX = Math.random() * window.innerWidth;
    const duration = CONFIG.SNOWFLAKE.MIN_DURATION + Math.random() * (CONFIG.SNOWFLAKE.MAX_DURATION - CONFIG.SNOWFLAKE.MIN_DURATION);
    const delay = Math.random() * CONFIG.SNOWFLAKE.MAX_DELAY;
    const size = CONFIG.SNOWFLAKE.MIN_SIZE + Math.random() * (CONFIG.SNOWFLAKE.MAX_SIZE - CONFIG.SNOWFLAKE.MIN_SIZE);

    snowflake.style.left = startX + 'px';
    snowflake.style.top = '-20px';
    snowflake.style.width = size + 'px';
    snowflake.style.height = size + 'px';
    snowflake.style.animation = `fall ${duration}s linear ${delay}s infinite`;

    snowflake.addEventListener('animationiteration', () => {
        const newX = Math.random() * window.innerWidth;
        snowflake.style.left = newX + 'px';
    });

    snowflake.onclick = (e) => {
        e.stopPropagation();
        showModal(confession);
    };

    return snowflake;
}

// --- ABOUT PAGE ---
function renderAbout() {
    const app = document.getElementById('app');

    app.innerHTML = `
        <div class="page-container about-page">
            <div class="bg-blur-circle"></div>
            
            <div class="nav-header justify-content-between">
                <button class="btn-pill-sm" onclick="navigateTo('home')">
                    <i class="bi bi-arrow-left"></i> Back
                </button>
                <div style="width: 80px;"></div> <!-- Spacer -->
            </div>
            
            <div class="about-glass-box py-4 px-3 p-lg-5">
                <h1 class="about-title text-center mb-5">Tentang Project-December</h1>
                
                <section class="about-section mb-5">
                    <h2>Apa itu Project-December?</h2>
                    <p>Project-December adalah platform web musiman yang hanya berfungsi penuh setiap bulan Desember. Situs ini menjadi ruang anonim bagi siapa pun yang ingin menuliskan pengalaman, penyesalan, kenangan, atau konflik emosional yang mereka bawa sepanjang tahun.</p>
                    <p>Setiap tulisan muncul sebagai animasi butiran salju yang jatuh di layar. Masing-masing butir salju berisi satu tulisan. Ketika diklik, salju itu pecah menjadi paragraf tulisan lengkap beserta tanggal pembuatannya.</p>
                    <p class="about-italic">Project-December adalah tempat sederhana di internet untuk meletakkan "beban" menjelang akhir tahun.</p>
                </section>

                <section class="about-section mb-5">
                    <h2>Kenapa Project-December dibuat?</h2>
                    <p>Setiap kali Desember tiba, orang-orang cenderung menjadi lebih reflektif. Berbagai hal yang terkubur selama tahun itu muncul kembali: penyesalan, nostalgia, kehilangan, atau hal-hal yang tidak pernah selesai.</p>
                    <p>Project-December adalah tempat sederhana di internet untuk memberi ruang tersebut. Tanpa identitas, tanpa tekanan sosial, tanpa tuntutan pencitraan.</p>
                    <ul class="about-list">
                        <li>Mengakui bahwa tahun ini berat</li>
                        <li>Menaruh sesuatu yang masih menggantung</li>
                        <li>Melepaskan memori yang seharusnya dilepas</li>
                        <li>Menulis hal-hal yang tidak mungkin diposting di media sosial</li>
                    </ul>
                    <p class="about-italic">Situs ini adalah ruang aman untuk jujur.</p>
                </section>

                <section class="about-section mb-5">
                    <h2>Mengapa konsepnya seperti ini?</h2>
                    <ul class="about-list">
                        <li><strong>Anonim membuat tulisan lebih jujur.</strong> Tanpa identitas, tulisan menjadi lebih apa adanya, langsung dari hati, tanpa topeng.</li>
                        <li><strong>Hanya aktif di bulan Desember.</strong> Pembatasan waktu menciptakan tradisi dan momentum emosional. Setahun sekali memberi rasa kesempatan yang langka.</li>
                        <li><strong>Salju sebagai simbol "beban" yang jatuh.</strong> Setiap tulisan adalah serpihan kecil dari seseorang. Semuanya turun pelan-pelan, masing-masing membawa beratnya sendiri.</li>
                        <li><strong>Random karena semua orang sama.</strong> Tidak ada yang tahu siapa menulis apa. Namun pembaca sering menemukan kalimat yang terasa akrab.</li>
                        <li><strong>Menjaga ruang ini tetap aman.</strong> Kebebasan bukan berarti melukai. Kami menyaring kata-kata kasar agar tempat ini tetap nyaman bagi siapa pun yang sedang rapuh.</li>
                    </ul>
                </section>

                <section class="about-section mb-5">
                    <h2>Kebiasaan Internet</h2>
                    <p>Selama bertahun-tahun, komunitas internet punya kebiasaan tidak tertulis: memutar lagu "December" dari Neck Deep ketika bulan Desember dimulai. Tradisi ini tersebar secara organik di forum dan media sosial, menjadi semacam penanda emosional bahwa tahun hampir berakhir.</p>
                    <p>Project-December mengambil inspirasi dari fenomena tersebut.</p>
                </section>

                <section class="about-section mb-5">
                    <h2>Bagaimana cara kerja situs ini?</h2>
                    <ul class="about-list">
                        <li><strong>Home Page:</strong> Menampilkan kotak input tulisan yang aktif hanya di bulan Desember. Di luar Desember, pengunjung hanya dapat membaca.</li>
                        <li><strong>Snowfall Page:</strong> Bagian inti situs. Animasi salju sebagai representasi tulisan. Klik salju untuk membuka isi tulisan.</li>
                        <li><strong>About Page:</strong> (Halaman ini). Menjelaskan konsep dan aturan anonim.</li>
                    </ul>
                </section>

                <section class="about-section mb-5">
                    <h2>Tujuan</h2>
                    <p>Project-December bukan ruang yang menuntut kesempurnaan. Tidak ada standar harus cantik, produktif, bahagia, atau tampil keren. Yang ada hanyalah manusia dengan ceritanya masing-masing.</p>
                    <p>Project-December ini adalah tradisi tahunan: membaca luka dan harapan kecil milik orang lain, sambil meninggalkan sesuatu yang ingin dilepas sebelum tahun berakhir.</p>
                </section>

                <section class="about-section about-credit">
                    <p>"Project-December" dibuat oleh <strong>Zidan IDz</strong></p>
                    <p class="small opacity-75">Hanya manusia biasa yang punya sisi emosional dan kebetulan bisa ngoding dikit</p>
                    <div class="about-social mt-3 d-flex gap-4 justify-content-center">
                        <a href="https://facebook.com/muhammadraid.zaidani" target="_blank"><i class="bi bi-facebook"></i></a>
                        <a href="https://instagram.com/zidan_idz" target="_blank"><i class="bi bi-instagram"></i></a>
                        <a href="https://github.com/zidan-idz" target="_blank"><i class="bi bi-github"></i></a>
                    </div>
                </section>
            </div>
        </div>
    `;
}

// --- MODAL CONTROLLER ---
function showModal(confession) {
    const modal = document.getElementById('modal');
    const modalBody = document.getElementById('modal-body');

    const date = new Date(confession.created_at).toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });

    modalBody.innerHTML = `
        <div class="modal-confession">${confession.text}</div>
        <div class="modal-date">${date}</div>
    `;

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
}

function closeModal() {
    const modal = document.getElementById('modal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeModal();
});
