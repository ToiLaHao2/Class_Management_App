const crypto = require('crypto');

/**
 * Tao ra mot ID ngau nhien duy nhat (UUID v4)
 * Su dung truc tiep module 'crypto' cua Node.js thay vi cai dat them thu vien UUID.
 * 
 * @returns {string} - Vi du: "11bf5b37-e0b8-42e0-8dcf-dc8c4aefc000"
 */
const generateUUID = () => {
    return crypto.randomUUID();
};

/**
 * Tao mot ID alphanumeric ngan ngau nhien (vd dung de lam code reference)
 * @param {number} length - Do dai ID (Mac dinh = 8)
 * @returns {string} - Vi du: "A2B89X7Z"
 */
const generateShortId = (length = 8) => {
    return crypto.randomBytes(length).toString('hex').slice(0, length).toUpperCase();
};

module.exports = {
    generateUUID,
    generateShortId
};
