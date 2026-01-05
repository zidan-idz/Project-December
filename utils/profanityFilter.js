const BAD_WORDS = [
    'anjng', 'anjing', 'anjg', 'uaso', 'asu', 'bab1', 'babi', 'bgst', 'bangsat',
    'kntl', 'kontol', 'memek', 'mmk', 'jembut', 'jmbut', 'peler', 'peju', 'ngentot', 'ngewe',
    'lonte', 'lont3', 'perek', 'pecun', 'bencong', 'banci', 'jablay', 'maho',
    'fuck', 'fck', 'shit', 'bitch', 'btch', 'asshole', 'dick', 'cock', 'pussy',
    'cunt', 'whore', 'slut', 'nigger', 'nigga', 'faggot'
];

const PATTERNS = [
    /k[aou]*n+t[aou]*l/i,
    /m[e3]*m[e3]*k/i,
    /n+g+[e3]w+[e3]/i,
    /b[o0]k[e3]p/i,
    /f[u4a]*c+k/i
];

function normalizeText(text) {
    return text.toLowerCase()
        .replace(/0/g, 'o')
        .replace(/1/g, 'i')
        .replace(/3/g, 'e')
        .replace(/4/g, 'a')
        .replace(/5/g, 's')
        .replace(/@/g, 'a')
        .replace(/\$/g, 's')
        .replace(/\(/g, 'c')
        .replace(/\+/g, 't')
        .replace(/z/g, 's')
        .replace(/(.)\\1+/g, '$1');
}

function checkProfanity(text) {
    const normalized = normalizeText(text);
    const stripped = normalized.replace(/[^a-z]/g, '');

    for (const word of BAD_WORDS) {
        if (stripped.includes(word)) return true;
    }

    for (const pattern of PATTERNS) {
        if (pattern.test(normalized)) return true;
    }

    return false;
}

module.exports = { checkProfanity };
