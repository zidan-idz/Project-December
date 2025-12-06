require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// ============================================
// SUPABASE CONFIGURATION
// ============================================
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ ERROR: Missing Supabase credentials in .env file');
    console.error('Please set SUPABASE_URL and SUPABASE_ANON_KEY');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// ============================================
// MIDDLEWARE
// ============================================
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Rate limiting for confession submissions
const confessionLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
    message: {
        error: 'Kamu terlalu sering melepaskan tulisan. Istirahatlah sejenak.',
        retryAfter: '15 menit'
    },
    standardHeaders: true,
    legacyHeaders: false,
});

// ============================================
// VALIDATION UTILITIES
// ============================================
function validateCharacterCount(text) {
    const length = text.length;
    return length >= 4 && length <= 1000;
}

function validateCharacters(text) {
    const allowedRegex = /^[a-zA-Z0-9\s\n\r.,!?'"()\-—–;:…]+$/;
    return allowedRegex.test(text);
}

function sanitizeInput(text) {
    return text.trim();
}

const BAD_WORDS = [
    // INDONESIA - DASAR
    'anjng', 'anjing', 'anjg', 'uaso', 'asu', 'bab1', 'babi', 'bgst', 'bangsat',
    'kntl', 'kontol', 'memek', 'mmk', 'jembut', 'jmbut', 'peler', 'peju', 'ngentot', 'ngewe',
    'lonte', 'lont3', 'perek', 'pecun', 'bencong', 'banci', 'jablay', 'maho',
    'tobrut', 'tetek', 'toket', 'pantat', 'ngaceng', 'sange', 'bokep', 'porno',

    // INGGRIS - DASAR
    'fuck', 'fck', 'shit', 'bitch', 'btch', 'asshole', 'dick', 'cock', 'pussy',
    'cunt', 'whore', 'slut', 'nigger', 'nigga', 'faggot'
];

function checkProfanity(text) {
    // 1. Normalisasi karakter (Leetspeak -> Normal)
    let normalized = text.toLowerCase()
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/@/g, 'a')
        .replace(/\$/g, 's')
        .replace(/\(/g, 'c')
        .replace(/\+/g, 't')
        .replace(/z/g, 's');

    // 2. Hapus karakter berulang (cooontool -> contol)
    normalized = normalized.replace(/(.)\1+/g, '$1');

    // 3. Hapus semua simbol & spasi untuk cek pola (k o n t o l -> kontol)
    const stripped = normalized.replace(/[^a-z]/g, '');

    // Cek Match Pattern Dasar
    for (const word of BAD_WORDS) {
        if (stripped.includes(word)) return true;
    }

    // 4. Regex Khusus untuk kata yang riskan false positive (memek -> me.*mek)
    const patterns = [
        /k[aou]*n+t[aou]*l/i,      // Variations of k*nt*l
        /m[e3]*m[e3]*k/i,          // Variations of m*m*k
        /n+g+[e3]w+[e3]/i,        // Variations of ng*w*
        /b[o0]k[e3]p/i,           // Variations of b*k*p
        /f[u4a]*c+k/i             // Variations of f*ck
    ];

    for (const pattern of patterns) {
        if (pattern.test(normalized)) return true;
    }

    return false;
}

// ============================================
// API ROUTES
// ============================================
app.get('/api/messages', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('id, text, created_at'); // Get all messages first

        if (error) {
            console.error('Supabase error:', error);
            return res.status(500).json({ error: 'Gagal memuat tulisan' });
        }

        // Shuffle array using Fisher-Yates algorithm
        for (let i = data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [data[i], data[j]] = [data[j], data[i]];
        }

        // Take random 30-40 items
        const limit = Math.floor(Math.random() * 11) + 30; // Random between 30 and 40
        const subset = data.slice(0, limit);

        res.json(subset);
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.post('/api/messages', confessionLimiter, async (req, res) => {
    try {
        const { text } = req.body;

        if (!text) {
            return res.status(400).json({ error: 'Tulisanmu belum ada isinya.' });
        }

        const sanitized = sanitizeInput(text);

        if (!validateCharacterCount(sanitized)) {
            return res.status(400).json({
                error: 'Tulisanmu harus antara 4-1000 karakter.',
                currentLength: sanitized.length
            });
        }

        if (!validateCharacters(sanitized)) {
            return res.status(400).json({
                error: 'Tulisanmu mengandung karakter yang tidak diizinkan.'
            });
        }

        if (checkProfanity(sanitized)) {
            return res.status(400).json({
                error: 'Tulisanmu mengandung kata-kata yang tidak pantas.'
            });
        }

        const { data, error } = await supabase
            .from('messages')
            .insert([{ text: sanitized }])
            .select();

        if (error) {
            console.error('Supabase insert error:', error);
            return res.status(500).json({ error: 'Gagal melepaskan tulisanmu' });
        }

        res.status(201).json({
            id: data[0].id,
            text: data[0].text,
            message: 'Tulisanmu telah dilepaskan ke langit Desember'
        });
    } catch (err) {
        console.error('Server error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

app.get('/api/health', async (req, res) => {
    try {
        const { error } = await supabase
            .from('messages')
            .select('count', { count: 'exact', head: true });

        if (error) {
            return res.status(500).json({
                status: 'unhealthy',
                database: 'disconnected',
                error: error.message
            });
        }

        res.json({
            status: 'healthy',
            database: 'connected',
            timestamp: new Date().toISOString()
        });
    } catch (err) {
        res.status(500).json({
            status: 'unhealthy',
            error: err.message
        });
    }
});

// ============================================
// SPA FALLBACK (MUST BE LAST)
// ============================================
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// START SERVER
// ============================================
app.listen(PORT, () => {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('❄️  PROJECT DECEMBER');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`🌐 Server running on http://localhost:${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🔒 Rate limit: ${process.env.RATE_LIMIT_MAX_REQUESTS || 5} requests per ${(parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000) / 60000} minutes`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
});

// ============================================
// GRACEFUL SHUTDOWN
// ============================================
process.on('SIGINT', () => {
    console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('👋 Shutting down gracefully...');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    process.exit(0);
});
