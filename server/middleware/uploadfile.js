const multer = require("multer");
const multerS3 = require("multer-s3");
const path = require("path");
const { S3Client } = require("@aws-sdk/client-s3");

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;

// create s3 instance using S3Client 
// (this is how we create s3 instance in v3)
const s3 = new S3Client({
    credentials: {
        accessKeyId: accessKeyId, // store it in .env file to keep it safe
        secretAccessKey: secretAccessKey
    },
    region: region // this is the region that you select in AWS account
})

const s3Storage = multerS3({
    s3: s3, // s3 instance
    bucket: Bucket, // change it as per your project requirement
    acl: "public-read", // storage access type
    metadata: (req, file, cb) => {
        cb(null, {fieldname: file.fieldname})
    },
    key: (req, file, cb) => {
        //const fileName = Date.now() + "_" + file.fieldname + "_" + file.originalname;
        const fileName = `eco-${file.originalname}`;
        cb(null, fileName);
    }
});

// function to sanitize files and send error for unsupported files
function sanitizeFile(file, cb) {
    // Define the allowed extension
     //const fileExts = ["jpg", "jpeg", "png", "gif", "mp4", "mov", "webm", "pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx"];
     const fileExts = [".png", ".jpg", ".jpeg", ".gif", ".mp4"];

    // Check allowed extensions
    const isAllowedExt = fileExts.includes(
        path.extname(file.originalname.toLowerCase())
    );

    // Mime type must be a file
    const isAllowedMimeType = file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/") /*|| file.mimetype.startsWith("application/")*/;

    if (isAllowedExt && isAllowedMimeType) {
        return cb(null, true); // no errors
    } else {
        // pass error msg to callback, which can be displaye in frontend
        cb("Error: File type not allowed!");
    }
}

// our middleware
const uploadFile = multer({
    storage: s3Storage,
    fileFilter: (req, file, callback) => {
        console.log("File received:", file);
        console.log("File name:", file.originalname);
        sanitizeFile(file, callback)
    },
    limits: {
        fileSize: 1024 * 1024 * 1024 * 5 // 5 GB
    }
})

module.exports = uploadFile;