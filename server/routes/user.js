const express = require('express');
const router = express.Router();
const { User, Resident } = require('../models');
const yup = require('yup');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
// const verifyRecaptcha = require('../middleware/recaptcha');
const upload = require('../middleware/fileupload');

// Input validation schema
const userSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(8).required(),
    role: yup.string().oneOf(['RESIDENT', 'STAFF']).default('RESIDENT')
});

// Generate JWT token
const generateToken = (user) => {
    return jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Create a new user and resident with input validation
router.post('/register', async (req, res) => {
    const transaction = await User.sequelize.transaction();
    try {
        await userSchema.validate(req.body);
        const { email, password, role, firstName, lastName, contactNumber } = req.body;
        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            role
        }, { transaction });

        const newResident = await Resident.create({
            name: `${firstName} ${lastName}`,
            mobile_num: contactNumber,
            user_id: newUser.user_id
        }, { transaction });

        await transaction.commit();

        const token = generateToken(newUser);
        res.status(201).json({ user: newUser, resident: newResident, token });
    } catch (error) {
        await transaction.rollback();
        console.error('Registration error:', error);  // Add this line to log the error details
        res.status(500).json({ error: error.message });
    }
});

// Authenticate user and generate JWT token
router.post('/login', async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (user && await bcrypt.compare(req.body.password, user.password)) {
            const token = generateToken(user);
            res.status(200).json({ message: 'Authenticated successfully', role: user.role, token });
        } else {
            res.status(401).json({ error: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Validation error:', error.errors);
        res.status(500).json({ error: 'Validation error', details: error.errors });
    }
});

// Read all users (accessible by STAFF only)
router.get('/', authenticateToken, authorizeRoles('STAFF'), async (req, res) => {
    try {
        const users = await User.findAll();
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read a user by ID (accessible by STAFF only)
router.get('/:id', authenticateToken, authorizeRoles('STAFF'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user details (accessible by STAFF only)
router.put('/:id', authenticateToken, authorizeRoles('STAFF'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedUser = await user.update(req.body);
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Delete a user (soft delete, accessible by STAFF only)
router.put('/softdelete/:id', authenticateToken, authorizeRoles('STAFF'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        await user.update({ is_deleted: true });
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update account activation status (accessible by STAFF only)
router.put('/activate/:id', authenticateToken, authorizeRoles('STAFF'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedUser = await user.update({ is_activated: req.body.is_activated });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update account's deleted status (undo soft delete, accessible by STAFF only)
router.put('/softrestore/:id', authenticateToken, authorizeRoles('STAFF'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const updatedUser = await user.update({ is_deleted: false });
        res.status(200).json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Create activation code and send email
router.post('/activate', async (req, res) => { // Removed verifyRecaptcha
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const activationCode = crypto.randomBytes(20).toString('hex');
        user.activation_code = activationCode;
        user.activation_code_expiry = new Date(Date.now() + 1800000); // 30 minutes expiry
        await user.save();

        // Set up Nodemailer
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_USER,
                pass: process.env.ETHEREAL_PASS
            }
        });

        // Send email
        const mailOptions = {
            from: '"EcoUtopia" <no-reply@ecoutopia.com>',
            to: user.email,
            subject: 'Account Activation',
            text: `Your activation code is: ${activationCode}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Activation code sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset password request
router.post('/password-reset', async (req, res) => { // Removed verifyRecaptcha
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const resetCode = crypto.randomBytes(20).toString('hex');
        user.password_reset_code = resetCode;
        user.password_reset_expiry = new Date(Date.now() + 1800000); // 30 minutes expiry
        await user.save();

        // Set up Nodemailer
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_USER,
                pass: process.env.ETHEREAL_PASS
            }
        });

        // Send email
        const mailOptions = {
            from: '"EcoUtopia" <no-reply@ecoutopia.com>',
            to: user.email,
            subject: 'Password Reset',
            text: `Your password reset code is: ${resetCode}`
        };

        await transporter.sendMail(mailOptions);
        res.status(200).json({ message: 'Password reset code sent' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Reset password
router.put('/password-reset/:code', async (req, res) => {
    try {
        const user = await User.findOne({ where: { password_reset_code: req.params.code, password_reset_expiry: { [Op.gt]: new Date() } } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired password reset code' });
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        user.password = hashedPassword;
        user.password_reset_code = null;
        user.password_reset_expiry = null;
        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Route to upload or update a profile picture
router.post('/profile-picture', upload.single('profilePic'), async (req, res) => {
    const userId = req.body.userId; // Make sure the user is authenticated
    try {
        const user = await User.findByPk(userId);
        if (user) {
            // Delete old profile picture if exists
            if (user.profilePic && fs.existsSync(`./uploads/${user.profilePic}`)) {
                fs.unlinkSync(`./uploads/${user.profilePic}`);
            }
            
            // Update new profile picture filename in the database
            user.profilePic = req.file.filename;
            await user.save();
            res.send({ message: 'Profile picture updated successfully', fileName: req.file.filename });
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
});

// Route to delete a profile picture
router.delete('/profile-picture', async (req, res) => {
    const userId = req.body.userId; // Make sure the user is authenticated
    try {
        const user = await User.findByPk(userId);
        if (user && user.profilePic) {
            // Remove file from filesystem
            const filePath = `./uploads/${user.profilePic}`;
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
            
            // Update database
            user.profilePic = null;
            await user.save();
            res.send({ message: 'Profile picture removed successfully' });
        } else {
            res.status(404).send({ message: 'Profile picture not found or already removed' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
});

module.exports = router;
