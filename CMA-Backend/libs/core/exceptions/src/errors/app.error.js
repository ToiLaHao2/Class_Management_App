/**
 * Base class cho tat ca cac Custom Errors trong toan bo he thong.
 * Thong minh hon Error mac dinh cua Node.js vi:
 * 1. Co status code HTTP ro rang (400, 401, 404, 500)
 * 2. Phan biet duoc loi nghiep vu (isOperational = true) va loi he thong (bug do code = false)
 */
class AppError extends Error {
    constructor(message, statusCode) {
        super(message);

        this.statusCode = statusCode;
        this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';

        // isOperational = true: Loi do user (nhap sai pass, thieu email...) -> gui ve FE
        // isOperational = false: Loi he thong (mat ket noi DB, bug nho null...) -> che giau log
        this.isOperational = true;

        // Giu nguyen stack trace de de debug
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = AppError;
