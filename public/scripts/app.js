const Router = {
    currentPage: 'home',

    init() {
        const path = window.location.pathname;
        if (path === '/snowfall') this.currentPage = 'snowfall';
        else if (path === '/about') this.currentPage = 'about';
        else this.currentPage = 'home';

        window.addEventListener('popstate', (e) => {
            if (e.state && e.state.page) {
                this.currentPage = e.state.page;
                this.render();
            }
        });

        CONFIG.log('Router: Initialized, current page:', this.currentPage);
    },

    navigate(page) {
        Modal.close();
        this.currentPage = page;
        this.render();

        const pathMap = {
            'home': '/',
            'snowfall': '/snowfall',
            'about': '/about'
        };

        history.pushState({ page }, '', pathMap[page] || '/');
        CONFIG.log('Router: Navigated to', page);
    },

    render() {
        const app = document.getElementById('app');
        app.innerHTML = '';
        app.className = `page-${this.currentPage}`;

        switch (this.currentPage) {
            case 'home':
                HomePage.render();
                break;
            case 'snowfall':
                SnowfallPage.render();
                break;
            case 'about':
                AboutPage.render();
                break;
            default:
                HomePage.render();
        }
    }
};

function navigateTo(page) {
    Router.navigate(page);
}

document.addEventListener('DOMContentLoaded', () => {
    CONFIG.log('App: Initializing...');

    MusicController.init();
    Modal.init();
    Router.init();

    Router.render();

    CONFIG.log('App: Ready!');
});
