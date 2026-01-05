const Modal = {
    element: null,
    body: null,

    init() {
        this.element = document.getElementById('modal');
        this.body = document.getElementById('modal-body');

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') this.close();
        });

        CONFIG.log('Modal: Initialized');
    },

    show(confession) {
        if (!this.element || !this.body) return;

        const date = new Date(confession.created_at).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });

        const isLiked = localStorage.getItem(`liked_${confession.id}`);
        const likeCount = confession.likes || 0;

        this.body.innerHTML = `
            <div class="modal-confession">${confession.text}</div>
            <div class="modal-footer-row">
                <div class="modal-date">${date}</div>
                <button class="btn-like ${isLiked ? 'liked' : ''}" 
                        onclick="Modal.toggleLike('${confession.id}', this, ${isLiked ? 'true' : 'false'})">
                    <i class="bi bi-emoji-smile${isLiked ? '-fill' : ''}"></i>
                    <span class="like-count">${likeCount}</span>
                </button>
            </div>
        `;

        this.element.classList.add('active');
        document.body.style.overflow = 'hidden';

        CONFIG.log('Modal: Showing confession', confession.id);
    },

    close() {
        if (!this.element) return;
        this.element.classList.remove('active');
        document.body.style.overflow = '';
        CONFIG.log('Modal: Closed');
    },

    async toggleLike(id, btn, alreadyLiked) {
        if (alreadyLiked) return;

        const countSpan = btn.querySelector('.like-count');
        const icon = btn.querySelector('i');

        btn.classList.add('liked');
        icon.classList.remove('bi-emoji-smile');
        icon.classList.add('bi-emoji-smile-fill');
        countSpan.textContent = parseInt(countSpan.textContent) + 1;
        btn.onclick = null;

        localStorage.setItem(`liked_${id}`, 'true');

        try {
            await API.likeMessage(id);
            CONFIG.log('Modal: Liked', id);
        } catch (error) {
            CONFIG.error('Modal: Like failed', error);
        }
    }
};

function closeModal() {
    Modal.close();
}
