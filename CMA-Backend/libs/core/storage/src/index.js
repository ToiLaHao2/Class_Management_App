const cloudinaryAdapter = require('./adapters/cloudinary.adapter');
const { uploadImage } = require('./middlewares/upload.middleware');

module.exports = {
  // Truyen thang ra ngoai cho api-gateway.
  cloudinary: cloudinaryAdapter,

  // Middleware Multer dung trong router 
  // VD: router.post('/avatar', uploadImage.single('file'), userController.uploadAvatar)
  uploadImage
};