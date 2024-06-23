const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: (req, file, callback) => {
        callback(null, './public/uploads/');
    },
    filename: async (req, file, callback) => {
        const { nanoid } = await import('nanoid');
        const filename = nanoid(10) + path.extname(file.originalname);
        callback(null, filename);
    }
});

const upload = multer({
    storage: storage,
});

module.exports = upload;
