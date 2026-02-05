const cloudinary = require('cloudinary').v2;
const multer = require('multer');

// 1. lay cau hinh cloudinary tu file .env
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. cau hinh multer de luu file vao RAM truoc khi day len cloudinary
const storage = multer.memoryStorage();
const uploadMiddleware = multer({ 
    storage: storage,
    limits: { fileSize: 10 * 1024 * 1024 } // gioi han file 10MB
});

/**
 * ham upload file len cloudinary
 * @param {Buffer} fileBuffer - du lieu file
 * @param {String} folder - ten thu muc tren cloud (vd: 'bai-tap', 'avatar')
 * @param {String} originalName - ten file goc (de check duoi file)
 */
const uploadToCloud = (fileBuffer, folder = 'general', originalName = 'file') => {
  return new Promise((resolve, reject) => {
    
    // Logic tu dong chon loai resource
    // - raw: Danh cho file nen, docx, xlsx...
    // - auto/image: Danh cho anh, pdf, video
    let resourceType = 'auto';
    if (originalName.match(/\.(doc|docx|xls|xlsx|ppt|pptx|zip|rar|txt|csv)$/i)) {
      resourceType = 'raw'; 
    }

    const uploadStream = cloudinary.uploader.upload_stream(
      { 
        folder: folder,
        resource_type: resourceType, 
        use_filename: true,    // co goi tuan tu ten file goc
        unique_filename: true  // them chuoi random de khong trung
      },
      (error, result) => {
        if (error) return reject(error);
        
        // tra ve ket qua goan gan
        resolve({
          url: result.secure_url,       // Link tai file (HTTPS)
          public_id: result.public_id,  // ID file (dung de xoa sau nay)
          format: result.format,        // Duoi file
          name: result.original_filename
        });
      }
    );

    // day du lieu vao luong upload
    uploadStream.end(fileBuffer);
  });
};

module.exports = { uploadMiddleware, uploadToCloud };