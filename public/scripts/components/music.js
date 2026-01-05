const MusicController = {
    audio: null,
    toggle: null,
    control: null,
    isPlaying: false,

    init() {
        this.audio = document.getElementById('background-music');
        this.toggle = document.getElementById('music-toggle');
        this.control = document.getElementById('music-control');

        if (!this.audio || !this.toggle || !this.control) {
            CONFIG.warn('MusicController: Elements not found');
            return;
        }

        const wasPlaying = localStorage.getItem('musicPlaying') === 'true';
        if (wasPlaying) {
            this.play();
        }

        document.addEventListener('click', () => {
            if (!this.isPlaying) {
                this.play();
            }
        }, { once: true });

        this.toggle.addEventListener('click', (e) => {
            e.stopPropagation();
            this.isPlaying ? this.pause() : this.play();
        });

        CONFIG.log('MusicController: Initialized');
    },

    play() {
        this.audio.play()
            .then(() => {
                this.isPlaying = true;
                this.control.classList.add('playing');
                localStorage.setItem('musicPlaying', 'true');
                CONFIG.log('MusicController: Playing');
            })
            .catch(err => CONFIG.warn('MusicController: Autoplay blocked'));
    },

    pause() {
        this.audio.pause();
        this.isPlaying = false;
        this.control.classList.remove('playing');
        localStorage.setItem('musicPlaying', 'false');
        CONFIG.log('MusicController: Paused');
    }
};
