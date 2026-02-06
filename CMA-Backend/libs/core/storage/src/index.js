// ket noi kho luu tru file,anh, sau nay co the doi sang dung cloudflare r2 o day

const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const storageConfig = require('../../config/src/configs/storage.config');

class StorageManager {
  constructor() {
    this.cloudinaryConfigured = false;
    this.uploadMiddleware = null;

    this.init();
  }

  init() {
    // lay cau hinh cloudinary tu file .env
    // config nay se tu dong doc tu process.env neu co
    const cloudName = storageConfig.cloudinary.cloudName;
    const apiKey = storageConfig.cloudinary.apiKey;
    const apiSecret = storageConfig.cloudinary.apiSecret;

    if (cloudName && apiKey && apiSecret) {
      cloudinary.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret
      });
      this.cloudinaryConfigured = true;
      console.log('✅ Cloudinary Configured Successfully!');
    } else {
      console.warn('⚠️ Cloudinary Credentials Missing in .env. Upload will fail.');
    }

    // cau hinh multer de luu file vao RAM truoc khi day len cloudinary
    // co the customize sizeLimit qua constructor neu can, hien tai hardcode 10MB
    const storage = multer.memoryStorage();
    this.uploadMiddleware = multer({
      storage: storage,
      limits: { fileSize: 10 * 1024 * 1024 } // gioi han file 10MB
    });
  }


  // getter cho middleware upload file (multer)
  getUploadMiddleware() {
    return this.uploadMiddleware;
  }


  //  ham upload file len cloudinary
  //  @param {Buffer} fileBuffer - du lieu file
  //  @param {String} folder - ten thu muc tren cloud (vd: 'bai-tap', 'avatar')
  //  @param {String} originalName - ten file goc (de check duoi file)

  async uploadToCloud(fileBuffer, folder = 'general', originalName = 'file') {
    if (!this.cloudinaryConfigured) {
      throw new Error('❌ Cloudinary is not configured.');
    }

    return new Promise((resolve, reject) => {
      // logic tu dong chon loai resource
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
            url: result.secure_url,       // link tai file (https)
            public_id: result.public_id,  // ID file (dung de xoa sau nay)
            format: result.format,        // duoi file
            name: result.original_filename
          });
        }
      );

      // day du lieu vao luong upload
      uploadStream.end(fileBuffer);
    });
  }
}

// Singleton Export
const storageManager = new StorageManager();
module.exports = storageManager;