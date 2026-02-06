const { getEnv } = require('../env.loader');

const storageConfig = {
    cloudinary: {
        cloudName: getEnv('CLOUDINARY_CLOUD_NAME'),
        apiKey: getEnv('CLOUDINARY_API_KEY'),
        apiSecret: getEnv('CLOUDINARY_API_SECRET'),
    },
};

module.exports = storageConfig;
