const { BadRequestError } = require('@core/exceptions');

/**
 * Validation Middleware dung Zod
 * @param {import('zod').ZodSchema} schema - Zod Schema de validate req.body, req.query, hoac req.params
 * @param {string} source - Nguon du lieu can validate: 'body' | 'query' | 'params' (Mac dinh: 'body')
 */
const validateRequest = (schema, source = 'body') => {
    return (req, res, next) => {
        try {
            // Validate data
            const validatedData = schema.parse(req[source]);

            // Thay the du lieu goc bang du lieu da duoc Zod validate & transform
            req[source] = validatedData;

            next();
        } catch (error) {
            // ZodError co property 'errors' chua chi tiet tung field bi sai
            if (error.name === 'ZodError') {
                const errorMessages = error.errors.map(err => `${err.path.join('.')}: ${err.message}`);
                const message = `Validation failed: ${errorMessages.join(', ')}`;

                return next(new BadRequestError(message));
            }
            next(error);
        }
    };
};

module.exports = validateRequest;
