// CONFIGURATION
const CONFIG = {
    // API
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : '/api',

    // LIMITS
    CHAR_MIN: 4,
    CHAR_MAX: 1000,

    // LOGIC
    isDecember: () => new Date().getMonth() === 11,

    // ANIMATION
    SNOWFLAKE: {
        MIN_SIZE: 8,
        MAX_SIZE: 12,
        MIN_DURATION: 8,
        MAX_DURATION: 15,
        MAX_DELAY: 3
    }
};
