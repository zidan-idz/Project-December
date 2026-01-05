const AboutPage = {
    render() {
        const app = document.getElementById('app');

        app.innerHTML = `
            <div class="page-container about-page">
                <div class="bg-blur-circle"></div>
                
                <div class="nav-header justify-content-between">
                    <button class="btn-pill-sm" onclick="Router.navigate('home')">
                        <i class="bi bi-arrow-left"></i> Back
                    </button>
                    <div style="width: 80px;"></div>
                </div>
                
                <div class="about-glass-box py-4 px-3 p-lg-5">
                    <h1 class="about-title text-center mb-5">Tentang Project-December</h1>
                    
                    ${this.renderSection('Apa itu Project-December?', `
                        <p>Project-December adalah platform web musiman yang hanya berfungsi penuh setiap bulan Desember. Situs ini menjadi ruang anonim bagi siapa pun yang ingin menuliskan pengalaman, penyesalan, kenangan, atau konflik emosional yang mereka bawa sepanjang tahun.</p>
                        <p>Setiap tulisan muncul sebagai animasi butiran salju yang jatuh di layar. Masing-masing butir salju berisi satu tulisan. Ketika diklik, salju itu pecah menjadi paragraf tulisan lengkap beserta tanggal pembuatannya.</p>
                        <p class="about-italic">Project-December adalah tempat sederhana di internet untuk meletakkan "beban" menjelang akhir tahun.</p>
                    `)}

                    ${this.renderSection('Kenapa Project-December dibuat?', `
                        <p>Setiap kali Desember tiba, orang-orang cenderung menjadi lebih reflektif. Berbagai hal yang terkubur selama tahun itu muncul kembali: penyesalan, nostalgia, kehilangan, atau hal-hal yang tidak pernah selesai.</p>
                        <p>Project-December adalah tempat sederhana di internet untuk memberi ruang tersebut. Tanpa identitas, tanpa tekanan sosial, tanpa tuntutan pencitraan.</p>
                        <ul class="about-list">
                            <li>Mengakui bahwa tahun ini berat</li>
                            <li>Menaruh sesuatu yang masih menggantung</li>
                            <li>Melepaskan memori yang seharusnya dilepas</li>
                            <li>Menulis hal-hal yang tidak mungkin diposting di media sosial</li>
                        </ul>
                        <p class="about-italic">Situs ini adalah ruang aman untuk jujur.</p>
                    `)}

                    ${this.renderSection('Mengapa konsepnya seperti ini?', `
                        <ul class="about-list">
                            <li><strong>Anonim membuat tulisan lebih jujur.</strong> Tanpa identitas, tulisan menjadi lebih apa adanya, langsung dari hati, tanpa topeng.</li>
                            <li><strong>Hanya aktif di bulan Desember.</strong> Pembatasan waktu menciptakan tradisi dan momentum emosional. Setahun sekali memberi rasa kesempatan yang langka.</li>
                            <li><strong>Salju sebagai simbol "beban" yang jatuh.</strong> Setiap tulisan adalah serpihan kecil dari seseorang. Semuanya turun pelan-pelan, masing-masing membawa beratnya sendiri.</li>
                            <li><strong>Random karena semua orang sama.</strong> Tidak ada yang tahu siapa menulis apa. Namun pembaca sering menemukan kalimat yang terasa akrab.</li>
                            <li><strong>Menjaga ruang ini tetap aman.</strong> Kebebasan bukan berarti melukai. Kami menyaring kata-kata kasar agar tempat ini tetap nyaman bagi siapa pun yang sedang rapuh.</li>
                        </ul>
                    `)}

                    ${this.renderSection('Kebiasaan Internet', `
                        <p>Selama bertahun-tahun, komunitas internet punya kebiasaan tidak tertulis: memutar lagu "December" dari Neck Deep ketika bulan Desember dimulai. Tradisi ini tersebar secara organik di forum dan media sosial, menjadi semacam penanda emosional bahwa tahun hampir berakhir.</p>
                        <p>Project-December mengambil inspirasi dari fenomena tersebut.</p>
                    `)}

                    ${this.renderSection('Bagaimana cara kerja situs ini?', `
                        <ul class="about-list">
                            <li><strong>Home Page:</strong> Menampilkan kotak input tulisan yang aktif hanya di bulan Desember. Di luar Desember, pengunjung hanya dapat membaca.</li>
                            <li><strong>Snowfall Page:</strong> Bagian inti situs. Animasi salju sebagai representasi tulisan. Klik salju untuk membuka isi tulisan.</li>
                            <li><strong>About Page:</strong> (Halaman ini). Menjelaskan konsep dan aturan anonim.</li>
                        </ul>
                    `)}

                    ${this.renderSection('Tujuan', `
                        <p>Project-December bukan ruang yang menuntut kesempurnaan. Tidak ada standar harus cantik, produktif, bahagia, atau tampil keren. Yang ada hanyalah manusia dengan ceritanya masing-masing.</p>
                        <p>Project-December ini adalah tradisi tahunan: membaca luka dan harapan kecil milik orang lain, sambil meninggalkan sesuatu yang ingin dilepas sebelum tahun berakhir.</p>
                    `)}

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

        CONFIG.log('AboutPage: Rendered');
    },

    renderSection(title, content) {
        return `
            <section class="about-section mb-5">
                <h2>${title}</h2>
                ${content}
            </section>
        `;
    }
};
