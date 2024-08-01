const Transform = require('stream').Transform;
const { Formidable } = require('formidable');
const { Upload } = require("@aws-sdk/lib-storage");
const { S3Client, S3 } = require("@aws-sdk/client-s3");

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
const region = process.env.S3_REGION;
const Bucket = process.env.S3_BUCKET;

const parsefile = async (req, res, next) => {
    return new Promise((resolve, reject) => {
        let options = {
            maxFileSize: 2 * 1024 * 1024 * 1024, // 2GB converted to bytes
            allowEmptyFiles: false
        }

        const form = new Formidable(options);

        form.parse(req, (err, fields, files) => {
            if (err) {
                reject(err.message);
            }
            req.body = fields;
            req.file = files.image;
            next();
        });

        form.on('error', error => {
            reject(error.message)
        })

        form.on('fileBegin', (formName, file) => {
            //const timestamp = new Date().toISOString().replace(/[-:.]/g, ''); // Generate timestamp

            file.open = async function () {
                this._writeStream = new Transform({
                    transform(chunk, encoding, callback) {
                        callback(null, chunk)
                    }
                })

                this._writeStream.on('error', e => {
                    form.emit('error', e)
                });

                // upload to S3
                new Upload({
                    client: new S3Client({
                        credentials: {
                            accessKeyId,
                            secretAccessKey
                        },
                        region
                    }),
                    params: {
                        ACL: 'public-read',
                        Bucket,
                        //Key: `${Date.now().toString()}-${this.originalFilename}`,
                        Key: `eco-${this.originalFilename}`,
                        //Key: `${crypto.randomUUID()}-${this.originalFilename}`,
                        //Key: `${timestamp}-${this.originalFilename}`,
                        Body: this._writeStream
                    },
                    tags: [], // optional tags
                    queueSize: 4, // optional concurrency configuration
                    partSize: 5 * 1024 * 1024, // 5MB part size
                    leavePartsOnError: false, // optional manually handle dropped parts
                })
                    .done()
                    .then(data => {
                        //console.log(`Successfully uploaded ${this.originalFilename} to ${Bucket}/${data.Key}`);
                        form.emit('data', { name: "complete", value: data });
                        console.log(`Successfully uploaded ${this.originalFilename} to ${Bucket}/${data.Key}`);
                        console.log(`Location: ${data.Location}`);
                        //localStorage.setItem('fileLocation', data.Location);
                        resolve(data.Location);
                    }).catch((err) => {
                        form.emit('error', err);
                    })
            }

            file.end = function (cb) {
                this._writeStream.on('finish', () => {
                    this.emit('end')
                    cb()
                })
                this._writeStream.end()
            }

        })
    })
}

module.exports = parsefile;