const { getEnv } = require('../env.loader');

const appConfig = {
    nodeEnv: getEnv('NODE_ENV'),
    port: getEnv('PORT'),
    jwt: {
        secret: getEnv('JWT_SECRET'),
        expiresIn: getEnv('JWT_EXPIRES_IN'),
    },
};

module.exports = appConfig;
