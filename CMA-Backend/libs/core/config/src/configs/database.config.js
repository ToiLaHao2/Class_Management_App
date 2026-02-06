const { getEnv } = require('../env.loader');

const databaseConfig = {
    firebaseCredentials: getEnv('FIREBASE_CREDENTIALS'),
    admin: {
        email: getEnv('ADMIN_EMAIL'),
        defaultPassword: getEnv('ADMIN_DEFAULT_PASSWORD'),
    },
};

module.exports = databaseConfig;
