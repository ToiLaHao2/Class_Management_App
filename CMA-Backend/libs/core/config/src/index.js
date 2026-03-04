// env.validation.js se tu ngam chay dong process.env va block app neu loi
const validatedEnv = require('./env.validation');

module.exports = {
    appConfig: validatedEnv.app,
    databaseConfig: validatedEnv.firebase,
    securityConfig: validatedEnv.security,
    storageConfig: validatedEnv.cloudinary,
    cacheConfig: validatedEnv.redis,
};
