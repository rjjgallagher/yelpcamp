const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Read more about this in the official documentation: https://github.com/affanshahid/multer-storage-cloudinary

// Configuring the cloudinary instance
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

// Configuring the storage for multer
const storage = new CloudinaryStorage({
    cloudinary,
    folder: 'YelpCamp',
    allowedFormats: ['jpeg', 'png', 'jpg']
})

module.exports = {
    cloudinary,
    storage
};