const axios = require('axios');

const verifyRecaptcha = async (req, res, next) => {
    const recaptchaToken = req.body.recaptchaToken;
    if (!recaptchaToken) {
        return res.status(400).json({ message: 'Recaptcha token is missing' });
    }

    try {
        const response = await axios.post(`https://www.google.com/recaptcha/api/siteverify`, null, {
            params: {
                secret: process.env.RECAPTCHA_SECRET_KEY,
                response: recaptchaToken
            }
        });

        if (response.data.success && response.data.score > 0.5) {
            next();
        } else {
            res.status(400).json({ message: 'Recaptcha verification failed' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Recaptcha verification failed' });
    }
};

module.exports = verifyRecaptcha;
