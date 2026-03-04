const multer = require('multer');
const { BadRequestError } = require('@core/exceptions');

// Dung chung luu tren RAM (MemoryStorage) de tiep tuc day len Cloudinary
const storage = multer.memoryStorage();

// Bo loc file chi chap nhan anh
const imageFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new BadRequestError('Not an image! Please upload only images.'), false);
    }
};

/**
 * Middleware cho phep Upload anh, gioi han 5MB mac dinh
 */
const uploadImage = multer({
    storage: storage,
    fileFilter: imageFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB
    }
});

module.exports = {
    uploadImage
};
