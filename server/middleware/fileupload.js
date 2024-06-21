const multer = require('multer');

let nanoid;
import('nanoid').then(nanoidModule => {
    nanoid = nanoidModule.nanoid;
}).catch(error => {
    console.error('Failed to load nanoid:', error);
});

// Configure multer storage with dynamic nanoid import
const storage = multer.diskStorage({
    destination: function(req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function(req, file, cb) {
        if (!nanoid) {
            console.error('nanoid not loaded');
            return cb(new Error('nanoid not loaded'), '');
        }
        const fileExt = file.originalname.split('.').pop();
        cb(null, `${nanoid()}.${fileExt}`);
    }
});

const upload = multer({ storage: storage });

module.exports = upload;
