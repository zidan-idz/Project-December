const express = require('express');
const router = express.Router();

function setupRoutes(supabase, checkProfanity, limiter, config) {

    router.get('/messages', async (req, res) => {
        try {
            const { data, error } = await supabase
                .from('messages')
                .select('id, text, created_at, likes');

            if (error) throw error;

            for (let i = data.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [data[i], data[j]] = [data[j], data[i]];
            }

            const limit = Math.floor(Math.random() * 11) + 30;
            res.json(data.slice(0, limit));

        } catch (err) {
            console.error('GET /messages error:', err.message);
            res.status(500).json({ error: 'Server error' });
        }
    });

    router.post('/messages', limiter, async (req, res) => {
        try {
            const { text } = req.body;

            if (!text) {
                return res.status(400).json({ error: 'Tulisan kosong.' });
            }

            const sanitized = text.trim();

            if (sanitized.length < config.CHAR_MIN || sanitized.length > config.CHAR_MAX) {
                return res.status(400).json({
                    error: `Panjang tulisan harus ${config.CHAR_MIN}-${config.CHAR_MAX} karakter.`
                });
            }

            if (checkProfanity(sanitized)) {
                return res.status(400).json({ error: 'Kata-kata tidak pantas terdeteksi.' });
            }

            const { data, error } = await supabase
                .from('messages')
                .insert([{ text: sanitized, likes: 0 }])
                .select();

            if (error) throw error;

            res.status(201).json({
                message: 'Tulisan berhasil dilepaskan.',
                id: data[0].id
            });

        } catch (err) {
            console.error('POST /messages error:', err.message);
            res.status(500).json({ error: 'Server error' });
        }
    });

    router.post('/messages/:id/like', async (req, res) => {
        try {
            const { id } = req.params;

            const { data, error } = await supabase.rpc('increment_likes', { row_id: id });

            if (error) {
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
            console.error('POST /messages/:id/like error:', err.message);
            res.status(500).json({ error: 'Failed to like' });
        }
    });

    router.get('/health', (req, res) => {
        res.json({
            status: 'healthy',
            timestamp: new Date(),
            env: config.NODE_ENV
        });
    });

    return router;
}

module.exports = setupRoutes;
