require('dotenv').config();
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// --- CONFIG ---
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
    console.error('❌ Missing Supabase credentials');
    process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

// --- MIDDLEWARE ---
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const confessionLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 900000,
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 5,
    message: { error: 'Terlalu sering. Tunggu 15 menit.' },
    standardHeaders: true,
    legacyHeaders: false,
});

// --- PROFANITY FILTER ---
const BAD_WORDS = [
    'anjng', 'anjing', 'anjg', 'uaso', 'asu', 'bab1', 'babi', 'bgst', 'bangsat',
    'kntl', 'kontol', 'memek', 'mmk', 'jembut', 'jmbut', 'peler', 'peju', 'ngentot', 'ngewe',
    'lonte', 'lont3', 'perek', 'pecun', 'bencong', 'banci', 'jablay', 'maho',
    'fuck', 'fck', 'shit', 'bitch', 'btch', 'asshole', 'dick', 'cock', 'pussy',
    'cunt', 'whore', 'slut', 'nigger', 'nigga', 'faggot'
];

function checkProfanity(text) {
    let normalized = text.toLowerCase()
        .replace(/0/g, 'o').replace(/1/g, 'i').replace(/3/g, 'e')
        .replace(/4/g, 'a').replace(/5/g, 's').replace(/@/g, 'a')
        .replace(/\$/g, 's').replace(/\(/g, 'c')
        .replace(/\+/g, 't').replace(/z/g, 's')
        .replace(/(.)\1+/g, '$1');

    const stripped = normalized.replace(/[^a-z]/g, '');

    for (const word of BAD_WORDS) {
        if (stripped.includes(word)) return true;
    }

    const patterns = [
        /k[aou]*n+t[aou]*l/i,
        /m[e3]*m[e3]*k/i,
        /n+g+[e3]w+[e3]/i,
        /b[o0]k[e3]p/i,
        /f[u4a]*c+k/i
    ];

    for (const pattern of patterns) {
        if (pattern.test(normalized)) return true;
    }

    return false;
}

// --- ROUTES ---
app.get('/api/messages', async (req, res) => {
    try {
        const { data, error } = await supabase
            .from('messages')
            .select('id, text, created_at, likes'); // Added likes

        if (error) throw error;

        // Fisher-Yates Shuffle
        for (let i = data.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [data[i], data[j]] = [data[j], data[i]];
        }

        const limit = Math.floor(Math.random() * 11) + 30; // 30-40 messages
        res.json(data.slice(0, limit));
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.post('/api/messages/:id/like', async (req, res) => {
    try {
        const { id } = req.params;

        // Use RPC if available for atomic increment, otherwise standard update
        // Assuming simple update for now based on context
        const { data, error } = await supabase.rpc('increment_likes', { row_id: id });

        if (error) {
            // Fallback if RPC doesn't exist (though RPC is better for concurrency)
            // If user just added a column, they probably didn't add a function.
            // Let's do a read-modify-write as a simple fallback or just direct update if possible?
            // Supabase doesn't support 'increment' in simple update without RPC.
            // Let's try to just fetch and update.
            const { data: msg, error: fetchError } = await supabase
                .from('messages')
                .select('likes')
                .eq('id', id)
                .single();

            if (fetchError) throw fetchError;

            const newLikes = (msg.likes || 0) + 1;

            const { error: updateError } = await supabase
                .from('messages')
                .update({ likes: newLikes })
                .eq('id', id);

            if (updateError) throw updateError;

            return res.json({ likes: newLikes });
        }

        res.json({ likes: data });
    } catch (err) {
        console.error('Like error:', err);
        res.status(500).json({ error: 'Failed to like' });
    }
});

app.post('/api/messages', confessionLimiter, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ error: 'Tulisan kosong.' });

        const sanitized = text.trim();

        if (sanitized.length < 4 || sanitized.length > 1000) {
            return res.status(400).json({ error: 'Panjang tulisan harus 4-1000 karakter.' });
        }

        if (checkProfanity(sanitized)) {
            return res.status(400).json({ error: 'Kata-kata tidak pantas terdeteksi.' });
        }

        const { data, error } = await supabase
            .from('messages')
            .insert([{ text: sanitized, likes: 0 }]) // Initialize likes
            .select();

        if (error) throw error;

        res.status(201).json({ message: 'Tulisan berhasil dilepaskan.', id: data[0].id });
    } catch (err) {
        res.status(500).json({ error: 'Server error' });
    }
});

app.get('/api/health', (req, res) => {
    res.json({ status: 'healthy', timestamp: new Date() });
});

// --- CLIENT FALLBACK ---
app.use((req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// --- START ---
app.listen(PORT, () => {
    console.log(`PROJECT DECEMBER is running... \nhttp://localhost/${PORT}`);
});
