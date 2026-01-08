const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

const getStorage = (folderName) => {
  return new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
      folder: `todaymydream/${folderName}`,
      allowed_formats: ['jpg', 'png', 'jpeg', 'webp', 'mp4', 'mov', 'avif', 'heic', 'pdf', 'doc', 'docx'],
      resource_type: 'auto',
    },
  });
};

const storage = getStorage('shop'); // Default for shop
const generalStorage = getStorage('uploads');
const sellerStorage = getStorage('seller');
const blogStorage = getStorage('blog');

module.exports = {
  cloudinary,
  storage,
  generalStorage,
  sellerStorage,
  blogStorage,
  getStorage
};
