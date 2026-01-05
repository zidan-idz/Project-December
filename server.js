require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const { checkProfanity } = require('./utils/profanityFilter');
const setupRoutes = require('./routes/api');

const app = express();

const CONFIG = {
    NODE_ENV: process.env.NODE_ENV || 'development',
    PORT: process.env.PORT || 5000,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_KEY: process.env.SUPABASE_ANON_KEY,
    RATE_LIMIT_WINDOW: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    RATE_LIMIT_MAX: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
    CHAR_MIN: 4,
    CHAR_MAX: 1000,
    isDev() { return this.NODE_ENV === 'development'; },
    isProd() { return this.NODE_ENV === 'production'; }
};

if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_KEY) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const confessionLimiter = rateLimit({
    windowMs: CONFIG.RATE_LIMIT_WINDOW,
    max: CONFIG.RATE_LIMIT_MAX,
    message: { error: 'Terlalu sering. Tunggu 15 menit.' },
    standardHeaders: true,
    legacyHeaders: false,
});

const apiRoutes = setupRoutes(supabase, checkProfanity, confessionLimiter, CONFIG);
app.use('/api', apiRoutes);

app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(CONFIG.PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║         PROJECT DECEMBER                  ║
║  Mode: ${CONFIG.NODE_ENV.padEnd(12)}                       ║
║  Port: ${String(CONFIG.PORT).padEnd(12)}                       ║
║  http://localhost:${CONFIG.PORT}                    ║
╚═══════════════════════════════════════════╝
    `);
});
