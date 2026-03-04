const { UnauthorizedError, ForbiddenError } = require('@core/exceptions');

// Trong Production, ma JWT secret nay se duoc doc tu @core/config
// file auth.config.js - de tam day cho de hieu
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-cma-2026';

/**
 * Middleware: Kiem tra xem request co mang JWT Token hop le khong.
 * Nham bao ve cac Routes can dang nhap.
 */
const requireAuth = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            throw new UnauthorizedError('You are not logged in. Please log in to get access.');
        }

        const token = authHeader.split(' ')[1];

        // TODO: Import the thu vien `jsonwebtoken` va verify(token, JWT_SECRET)
        // const decoded = jwt.verify(token, JWT_SECRET);

        // Gia lap cho viec da verify thanh cong
        req.user = { id: 1, role: 'ADMIN' }; // Du lieu fake de test

        next();
    } catch (error) {
        next(error);
    }
};

/**
 * Middleware: Kiem tra Quyen (Role)
 * Nham bao ve cac router nang cao (vd: Chi ADMIN hoac TEACHER moi duoc tao Course)
 */
const requireRole = (...roles) => {
    return (req, res, next) => {
        if (!req.user) {
            return next(new UnauthorizedError('Please log in first.'));
        }

        if (!roles.includes(req.user.role)) {
            return next(new ForbiddenError('You do not have permission to perform this action.'));
        }

        next();
    };
};

module.exports = {
    requireAuth,
    requireRole
};
