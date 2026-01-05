const API = {
    async getMessages() {
        try {
            const response = await fetch(`${CONFIG.API_URL}/messages`);
            if (!response.ok) throw new Error('Failed to fetch messages');
            return await response.json();
        } catch (error) {
            CONFIG.error('API.getMessages:', error.message);
            throw error;
        }
    },

    async postMessage(text) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });
            const data = await response.json();
            if (!response.ok) throw new Error(data.error || 'Failed to post message');
            return data;
        } catch (error) {
            CONFIG.error('API.postMessage:', error.message);
            throw error;
        }
    },

    async likeMessage(id) {
        try {
            const response = await fetch(`${CONFIG.API_URL}/messages/${id}/like`, {
                method: 'POST'
            });
            if (!response.ok) throw new Error('Failed to like message');
            return await response.json();
        } catch (error) {
            CONFIG.error('API.likeMessage:', error.message);
            throw error;
        }
    }
};
