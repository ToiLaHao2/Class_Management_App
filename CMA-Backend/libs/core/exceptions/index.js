const AppError = require('./src/errors/app.error');
const {
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError
} = require('./src/errors/http.error');

const globalErrorHandler = require('./src/error-handler.middleware');

module.exports = {
    AppError,
    BadRequestError,
    UnauthorizedError,
    ForbiddenError,
    NotFoundError,
    ConflictError,
    globalErrorHandler
};
