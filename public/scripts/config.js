const CONFIG = {
    DEV_MODE: false,

    get API_URL() {
        if (this.DEV_MODE || window.location.hostname === 'localhost') {
            return 'http://localhost:5000/api';
        }
        return '/api';
    },

    CHAR_MIN: 4,
    CHAR_MAX: 1000,

    isDecember() {
        if (this.DEV_MODE) {
            this.log('🔓 DEV_MODE: December check bypassed');
            return true;
        }
        return new Date().getMonth() === 11;
    },

    SNOWFLAKE: {
        MIN_SIZE: 8,
        MAX_SIZE: 12,
        MIN_DURATION: 8,
        MAX_DURATION: 15,
        MAX_DELAY: 3
    },

    log(...args) {
        if (this.DEV_MODE) {
            console.log('[DEV]', ...args);
        }
    },

    warn(...args) {
        if (this.DEV_MODE) {
            console.warn('[DEV]', ...args);
        }
    },

    error(...args) {
        console.error('[ERROR]', ...args);
    }
};

if (CONFIG.DEV_MODE) {
    console.log(`
╔═══════════════════════════════════════════╗
║  🔧 DEVELOPMENT MODE ACTIVE               ║
║  - December check: BYPASSED               ║
║  - Console logs: ENABLED                  ║
║  - API URL: ${CONFIG.API_URL.padEnd(28)}║
╚═══════════════════════════════════════════╝
    `);
}
