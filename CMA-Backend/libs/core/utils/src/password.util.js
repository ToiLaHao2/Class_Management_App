const bcrypt = require('bcryptjs');

const SALT_ROUNDS = 10;

/**
 * Ma hoa mat khau (Hash Password)
 * @param {string} password - Mat khau goc do user nhap
 * @returns {Promise<string>} - Chuoi mat khau da duoc hash
 */
const hashPassword = async (password) => {
    return await bcrypt.hash(password, SALT_ROUNDS);
};

/**
 * Kiem tra mat khau co khop voi database khong (Compare Password)
 * @param {string} plainPassword - Mat khau goc do user nhap
 * @param {string} hashedPassword - Chuoi ma hoa luu trong DB
 * @returns {Promise<boolean>}
 */
const comparePassword = async (plainPassword, hashedPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

module.exports = {
    hashPassword,
    comparePassword
};
