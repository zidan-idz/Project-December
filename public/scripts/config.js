// Configuration for Project December
const CONFIG = {
    // API URL - automatically detects environment
    API_URL: window.location.hostname === 'localhost'
        ? 'http://localhost:5000/api'
        : '/api',

    // Character limits
    CHAR_MIN: 4,
    CHAR_MAX: 1000,

    // December check
    isDecember: () => new Date().getMonth() === 11,

    // Snowflake animation settings
    SNOWFLAKE: {
        MIN_SIZE: 8,
        MAX_SIZE: 12,
        MIN_DURATION: 8,
        MAX_DURATION: 15,
        MAX_DELAY: 3
    }
};
