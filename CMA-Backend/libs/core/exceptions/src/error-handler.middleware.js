const AppError = require('./errors/app.error');

/**
 * Handle loi MongoDB/Mongoose (Tuong lai hoac tuong tu Firebase)
 * Vd: CastError, DuplicateKey
 */
const handleCastErrorDB = err => {
    const message = `Invalid ${err.path}: ${err.value}.`;
    return new AppError(message, 400);
};

const sendErrorDev = (err, res) => {
    // Trong che do DEV: tra ve max thong tin de debug
    res.status(err.statusCode).json({
        status: err.status,
        error: err,
        message: err.message,
        stack: err.stack
    });
};

const sendErrorProd = (err, res) => {
    // Operational, trusted error: Gui message toi client (loi nghiep vu)
    if (err.isOperational) {
        res.status(err.statusCode).json({
            status: err.status,
            message: err.message
        });
    }
    // Programming or unknown error: Khong leak chi tiet cho client ra ngoai
    else {
        // 1. Log ra console hoac logger system
        console.error('ERROR 💥', err);

        // 2. Tra ve thong bao chung chung
        res.status(500).json({
            status: 'error',
            message: 'Something went very wrong!'
        });
    }
};

/**
 * Express Global Error Handling Middleware
 * Middleware co 4 tham so luon duoc Express hieu la Error Handler
 */
module.exports = (err, req, res, next) => {
    err.statusCode = err.statusCode || 500;
    err.status = err.status || 'error';

    const nodeEnv = process.env.NODE_ENV || 'development';

    if (nodeEnv === 'development') {
        sendErrorDev(err, res);
    } else if (nodeEnv === 'production') {
        let error = { ...err };
        error.message = err.message;
        error.name = err.name;

        // Bắt lỗi cú pháp/thư viện tự động chuyển thành AppError
        if (error.name === 'CastError') error = handleCastErrorDB(error);

        // Them cac loai handle khac o day (JWT Error, Validation Error...)

        sendErrorProd(error, res);
    }
};
