// Small signed login token: base64url(payload) + "." + HMAC-SHA256 signature.
const crypto = require('crypto');
const { tokenSecret, tokenLifetimeHours } = require('../config');

const sign = (data) => crypto.createHmac('sha256', tokenSecret).update(data).digest('base64url');

function createToken(user) {
    const payload = {
        id: String(user._id),
        exp: Date.now() + tokenLifetimeHours * 60 * 60 * 1000,
    };
    const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
    return `${data}.${sign(data)}`;
}

// Returns the payload, or null if the token is missing, forged or expired.
function verifyToken(token) {
    if (typeof token !== 'string' || !token.includes('.')) return null;
    const [data, signature] = token.split('.');
    const expected = sign(data);
    if (!signature || signature.length !== expected.length) return null;
    if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
    try {
        const payload = JSON.parse(Buffer.from(data, 'base64url').toString());
        return payload.exp > Date.now() ? payload : null;
    } catch {
        return null;
    }
}

module.exports = { createToken, verifyToken };
