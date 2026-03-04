const cloudinary = require('cloudinary').v2;
const { storageConfig } = require('@core/config');

class CloudinaryAdapter {
    constructor() {
        this._connected = false;
    }

    /**
     * Khoi tao va dua key tu Config vao Thu vien Cloudinary
     */
    connect() {
        if (this._connected) return;

        const { cloudName, apiKey, apiSecret } = storageConfig;

        if (!cloudName || !apiKey || !apiSecret) {
            console.warn('⚠️ Cloudinary config is missing. Upload will fail.');
            return;
        }

        cloudinary.config({
            cloud_name: cloudName,
            api_key: apiKey,
            api_secret: apiSecret
        });

        this._connected = true;
        console.log('✅ Cloudinary Configured Successfully!');
    }

    /**
     * Upload truc tiep tu Memory Buffer (Multer) len Cloudinary bang luong Stream.
     * Cach nay an toan vi khong can tao file tam (Temp file) tren ho tro OS hien tai.
     * @param {Buffer} buffer - Buffer anh do Multer phan tach qua `req.file.buffer`
     * @param {string} folder - Thu muc luu tren Cloud. VD: avatars
     * @returns {Promise<Object>} URL hinh anh va kich thuoc hinh
     */
    async uploadImageFromBuffer(buffer, folder = 'cma_general') {
        if (!this._connected) this.connect();

        return new Promise((resolve, reject) => {
            const uploadStream = cloudinary.uploader.upload_stream(
                { folder: folder },
                (error, result) => {
                    if (error) return reject(error);
                    resolve({
                        url: result.secure_url,
                        publicId: result.public_id,
                        width: result.width,
                        height: result.height
                    });
                }
            );

            // Bom buffer tu Ram vao stream cloudinary roi upload truc tiep len internet
            import('stream').then(stream => {
                const bufferStream = new stream.PassThrough();
                bufferStream.end(buffer);
                bufferStream.pipe(uploadStream);
            });
        });
    }

    /**
     * Xoa hinh anh bang publicId tren Cloudinary
     */
    async deleteImage(publicId) {
        if (!this._connected) this.connect();

        return new Promise((resolve, reject) => {
            cloudinary.uploader.destroy(publicId, (error, result) => {
                if (error) return reject(error);
                resolve(result);
            });
        });
    }
}

// Export kieu singleton
module.exports = new CloudinaryAdapter();
