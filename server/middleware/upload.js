// for image/file uploads stored in uploads/
require('dotenv').config();
const multer = require('multer');
const {CloudinaryStorage} = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;

//Cloudinary config
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: (req, file) => {
            if (req.originalUrl.includes('/api/loadEvents/')) return 'event_covers';
            if (req.originalUrl.includes('/api/findClub/')) return 'club_logos';
            return 'misc';
        },
        allowed_formats: ['jpg', 'jpeg', 'png'],
        public_id: (req, file) => { 
            const timestamp = Date.now();
            if (req.originalUrl.includes('/api/loadEvents/')) return `event_${timestamp}`; 
            if (req.originalUrl.includes('/api/findClub/')) return `club_${timestamp}`;
            return `upload_${timestamp}`;
        }
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

const upload = multer({ 
    storage,
    fileFilter,
    limits: {
        fileSize: 8 * 1024 * 1024, //8MB limit
        files: 1
    }
});

module.exports = upload;