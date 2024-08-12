const express = require('express');
const router = express.Router();
const { User, Resident, Staff, Instructor } = require('../models');
const yup = require('yup');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { OAuth2Client } = require('google-auth-library');
const axios = require('axios');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const verifyRecaptcha = require('../middleware/recaptcha');
const upload = require('../middleware/fileupload');
const uploadfile = require('../middleware/uploadfile');

// Google OAuth2 Client
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Input validation schema
const userSchema = yup.object().shape({
    email: yup.string().email().required(),
    password: yup.string().min(8).required(),
    role: yup.string().oneOf(['RESIDENT', 'STAFF', 'INSTRUCTOR']).default('RESIDENT')
});

// Generate JWT token
const generateToken = (user, additionalInfo) => {
    const payload = {
      id: user.user_id,  // Ensure user ID is included correctly
      role: user.role,
      ...additionalInfo
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// OAuth login endpoint
router.post('/oauth-login', async (req, res) => {
    const transaction = await User.sequelize.transaction();
    try {
        const { email, firstName, lastName } = req.body;

        let user = await User.findOne({ where: { email } });

        if (!user) {
            user = await User.create({
                email,
                password: bcrypt.hashSync('OAuthPassword', 10), // Placeholder password to fulfill non-null requirement
                role: 'RESIDENT', // Default role
                is_activated: true // Set is_activated to true for social media logins
            }, { transaction });

            const newUserDetails = await Resident.create({
                name: `${firstName} ${lastName}`,
                user_id: user.user_id,
            }, { transaction });

            await transaction.commit();
        } else {
            // Ensure user is activated if using social login
            if (!user.is_activated) {
                await user.update({ is_activated: true }, { transaction });
            }
            await transaction.commit();
        }

        const userDetails = await Resident.findOne({ where: { user_id: user.user_id } });
        const token = generateToken(user, { resident: userDetails });
        res.status(200).json({ user, token, resident: userDetails });
    } catch (error) {
        await transaction.rollback();
        console.error('OAuth login error:', error);
        res.status(500).json({ error: error.message });
    }
});

// Create a new user and resident with input validation (This is for Registration, require reCaptcha)
router.post('/register', verifyRecaptcha, async (req, res) => {
    const transaction = await User.sequelize.transaction();
    try {
      await userSchema.validate(req.body);
      const { email, password, role, firstName, lastName, contactNumber } = req.body;
  
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(400).json({ error: 'Email already exists' });
      }
  
      const hashedPassword = await bcrypt.hash(password, 10);
  
      const newUser = await User.create({
        email,
        password: hashedPassword,
        role
      }, { transaction });

      const newUserDetails = await Resident.create({
        name: `${firstName} ${lastName}`,
        mobile_num: contactNumber,
        user_id: newUser.user_id
      }, { transaction });
  
      await transaction.commit();
  
      const token = generateToken(newUser, { resident: newUserDetails });
      res.status(201).json({ user: newUser, token, resident: newUserDetails });
    } catch (error) {
      await transaction.rollback();
      console.error('Registration error:', error);
      res.status(500).json({ error: error.message });
    }
});

// Create a new user and either resident, staff, or instructor with input validation (This is for AccountManagement)
router.post('/createaccount', authenticateToken, async (req, res) => {
    const transaction = await User.sequelize.transaction();
    try {
        await userSchema.validate(req.body);
        const { email, password, role, firstName, lastName, contactNumber } = req.body;

        // Check if email already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(400).json({ error: 'Email already exists' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            email,
            password: hashedPassword,
            role
        }, { transaction });

        let newUserDetails;

        if (role === 'RESIDENT') {
            newUserDetails = await Resident.create({
                name: `${firstName} ${lastName}`,
                mobile_num: contactNumber,
                user_id: newUser.user_id
            }, { transaction });
        } else if (role === 'INSTRUCTOR') {
            newUserDetails = await Instructor.create({
                name: `${firstName} ${lastName}`,
                mobilenum: contactNumber,
                user_id: newUser.user_id
            }, { transaction });
        } else if (role === 'STAFF') {
            newUserDetails = await Staff.create({
                name: `${firstName} ${lastName}`,
                mobilenum: contactNumber,
                user_id: newUser.user_id
            }, { transaction });
        } else {
            return res.status(400).json({ error: 'Invalid role' });
        }

        await transaction.commit();

        const token = generateToken(newUser);
        res.status(201).json({ user: newUser, userDetails: newUserDetails, token });
    } catch (error) {
        await transaction.rollback();
        console.error('Registration error:', error);  // Log the error details
        res.status(500).json({ error: error.message });
    }
});

// Create new Login Request
router.post('/login', verifyRecaptcha, async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email } });
      if (user && await bcrypt.compare(req.body.password, user.password)) {
        let additionalInfo = {};
        if (user.role === 'RESIDENT') {
          const resident = await Resident.findOne({ where: { user_id: user.user_id } });
          additionalInfo = { resident };
        } else if (user.role === 'STAFF') {
          const staff = await Staff.findOne({ where: { user_id: user.user_id } });
          additionalInfo = { staff };
        } else if (user.role === 'INSTRUCTOR') {
          const instructor = await Instructor.findOne({ where: { user_id: user.user_id } });
          additionalInfo = { instructor };
        }
        const token = generateToken(user, additionalInfo);
        res.status(200).json({ user, token, ...additionalInfo });
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
        const users = await User.findAll({
            include: [
                {
                    model: Staff,
                    attributes: ['name', 'mobilenum']
                },
                {
                    model: Resident,
                    attributes: ['name', 'mobile_num']
                },
                {
                    model: Instructor,
                    attributes: ['name', 'mobilenum']
                }
            ]
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read a user by ID
router.get('/:id', authenticateToken, authorizeRoles('RESIDENT', 'STAFF', 'INSTRUCTOR'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let resident = null;
        let staff = null;
        let instructor = null;

        if (user.role === 'RESIDENT') {
            resident = await Resident.findOne({ where: { user_id: user.user_id } });
            if (!resident) {
                return res.status(404).json({ error: 'Resident details not found' });
            }
        }

        if (user.role === 'STAFF') {
            staff = await Staff.findOne({ where: { user_id: user.user_id } });
            if (!staff) {
                return res.status(404).json({ error: 'Staff details not found' });
            }
        }

        if (user.role === 'INSTRUCTOR') {
            instructor = await Instructor.findOne({ where: { user_id: user.user_id } });
            if (!instructor) {
                return res.status(404).json({ error: 'Instructor details not found' });
            }
        }

        res.status(200).json({ user, resident, staff, instructor });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update user details
router.put('/:id', authenticateToken, authorizeRoles('RESIDENT', 'STAFF', 'INSTRUCTOR'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let updatedUser, updatedResident, updatedStaff, updatedInstructor;

        // Update user details
        updatedUser = await user.update({
            email: req.body.email
        });

        if (user.role === 'RESIDENT') {
            const resident = await Resident.findOne({ where: { user_id: req.params.id } });
            if (!resident) {
                return res.status(404).json({ error: 'Resident details not found' });
            }
            updatedResident = await resident.update({
                name: `${req.body.firstName} ${req.body.lastName}`,
                mobile_num: req.body.mobileNumber
            });
        }

        if (user.role === 'STAFF') {
            const staff = await Staff.findOne({ where: { user_id: req.params.id } });
            if (!staff) {
                return res.status(404).json({ error: 'Staff details not found' });
            }
            updatedStaff = await staff.update({
                name: `${req.body.firstName} ${req.body.lastName}`,
                mobilenum: req.body.mobileNumber
            });
        }

        if (user.role === 'INSTRUCTOR') {
            const instructor = await Instructor.findOne({ where: { user_id: req.params.id } });
            if (!instructor) {
                return res.status(404).json({ error: 'Instructor details not found' });
            }
            updatedInstructor = await instructor.update({
                name: `${req.body.firstName} ${req.body.lastName}`,
                mobilenum: req.body.mobileNumber
            });
        }

        res.status(200).json({ user: updatedUser, resident: updatedResident, staff: updatedStaff, instructor: updatedInstructor });
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
        const updatedUser = await user.update({ is_deleted: true });
        res.status(200).json(updatedUser);
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

// Create activation code and send email. Token is available here since User has logged in(Email is not verified but login is still authenticated).
router.post('/activate', authenticateToken, async (req, res) => {
    try {
        const { email } = req.body;
        console.log('Received email for activation:', email); // Debugging line to check email value

        const user = await User.findOne({ where: { email } });
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

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ error: 'Failed to send activation email' });
            }
            console.log('Activation email sent:', info.response);
            res.status(200).json({ message: 'Activation code sent' });
        });

    } catch (error) {
        console.error('Activation error:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Verify activation code and activate account. Token is available here since User has logged in(Email is not verified but login is still authenticated).
router.post('/activate-account', authenticateToken, async (req, res) => {
    try {
        const { email, code } = req.body;
        const user = await User.findOne({
            where: {
                email,
                activation_code: code,
                activation_code_expiry: { [Op.gt]: new Date() }
            }
        });

        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired activation code' });
        }

        user.is_activated = true;
        user.activation_code = null;
        user.activation_code_expiry = null;
        await user.save();

        res.status(200).json({ message: 'Account activated successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Change password
router.put('/change-password/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;
    const { currentPassword, newPassword, confirmPassword } = req.body;
  
    try {
      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      const isMatch = await bcrypt.compare(currentPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ error: 'Current password is incorrect' });
      }
  
      if (newPassword !== confirmPassword) {
        return res.status(400).json({ error: 'New passwords do not match' });
      }
  
      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();
  
      res.status(200).json({ message: 'Password changed successfully' });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
});

// Reset password request
router.post('/password-reset', async (req, res) => {
    try {
        console.log("Request received to /password-reset with email:", req.body.email);

        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) {
            console.log("User not found for email:", req.body.email);
            return res.status(404).json({ error: 'User not found' });
        }

        const resetCode = crypto.randomBytes(20).toString('hex');
        const resetToken = jwt.sign({ email: user.email, resetCode }, process.env.JWT_SECRET, { expiresIn: '30m' });

        user.password_reset_expiry = new Date(Date.now() + 1800000); // 30 minutes expiry
        await user.save();

        console.log("Password reset token generated and saved for user:", user.email);

        // Set up Nodemailer with permanent Ethereal account credentials
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.ETHEREAL_USER, // your Ethereal user
                pass: process.env.ETHEREAL_PASS  // your Ethereal password
            }
        });

        // Send email
        const mailOptions = {
            from: '"EcoUtopia" <no-reply@ecoutopia.com>',
            to: user.email,
            subject: 'Password Reset',
            text: `Your password reset code is: ${resetCode}\nReset token: ${resetToken}`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.log('Error occurred. ' + err.message);
                return res.status(500).json({ error: 'Failed to send email' });
            }

            console.log('Message sent: %s', info.messageId);
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

            res.status(200).json({ message: 'Password reset code sent', previewUrl: nodemailer.getTestMessageUrl(info) });
        });
    } catch (error) {
        console.error('Error in /password-reset route:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Verify reset code
router.post('/validate-reset-code', async (req, res) => {
    try {
        const { email, code, token } = req.body;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.email !== email || decoded.resetCode !== code) {
                return res.status(400).json({ error: 'Invalid reset code or token' });
            }
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = await User.findOne({ where: { email, password_reset_expiry: { [Op.gt]: new Date() } } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        res.status(200).json({ message: 'Reset code and token are valid' });
    } catch (error) {
        console.error('Error in /validate-reset-code route:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Reset password
router.put('/password-reset/:code', async (req, res) => {
    try {
        const { email, password, token } = req.body;

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            if (decoded.email !== email || decoded.resetCode !== req.params.code) {
                return res.status(400).json({ error: 'Invalid reset code or token' });
            }
        } catch (err) {
            return res.status(400).json({ error: 'Invalid or expired reset token' });
        }

        const user = await User.findOne({ where: { email, password_reset_expiry: { [Op.gt]: new Date() } } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
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
router.post('/profile-picture', uploadfile.single('profilePic'), async (req, res) => {
    const userId = req.body.userId; // Ensure the user is authenticated
    try {
        const resident = await Resident.findOne({ where: { user_id: userId } });
        const staff = await Staff.findOne({ where: { user_id: userId } });

        if (resident) {
            // Delete old profile picture if exists
            /*if (resident.profile_pic && fs.existsSync(`./public/uploads/${resident.profile_pic}`)) {
                fs.unlinkSync(`./public/uploads/${resident.profile_pic}`);
            }*/

            // Update new profile picture filename in the database
            resident.profile_pic = req.file.location;
            await resident.save();
            res.send({ message: 'Resident profile picture updated successfully', fileName: req.file.filename });
        } else if (staff) {
            // Delete old profile picture if exists
            /*if (staff.profile_pic && fs.existsSync(`./public/uploads/${staff.profile_pic}`)) {
                fs.unlinkSync(`./public/uploads/${staff.profile_pic}`);
            }*/

            // Update new profile picture filename in the database
            staff.profile_pic = req.file.location;
            await staff.save();
            res.send({ message: 'Staff profile picture updated successfully', fileName: req.file.filename });
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
});

// Route to upload or update a background image
router.post('/background-image', uploadfile.single('backgroundImage'), async (req, res) => {
    const userId = req.body.userId; // Ensure the user is authenticated
    try {
        const resident = await Resident.findOne({ where: { user_id: userId } });
        const staff = await Staff.findOne({ where: { user_id: userId } });
        const instructor = await Instructor.findOne({ where: { user_id: userId } });

        if (resident) {
            resident.background_pic = req.file.location;
            await resident.save();
            res.send({ message: 'Resident background image updated successfully', fileName: req.file.location });
        } else if (staff) {
            staff.background_pic = req.file.location;
            await staff.save();
            res.send({ message: 'Staff background image updated successfully', fileName: req.file.location });
        } else if (instructor) {
            instructor.background_pic = req.file.location;
            await instructor.save();
            res.send({ message: 'Instructor background image updated successfully', fileName: req.file.location });
        } else {
            res.status(404).send({ message: 'User not found' });
        }
    } catch (error) {
        res.status(500).send({ message: 'Server error', error: error.message });
    }
});

// Hard delete a user (accessible by STAFF only, but never used)
router.delete('/:id', authenticateToken, authorizeRoles('STAFF'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Delete associated records
        if (user.role === 'RESIDENT') {
            await Resident.destroy({ where: { user_id: user.user_id } });
        } else if (user.role === 'STAFF') {
            await Staff.destroy({ where: { user_id: user.user_id } });
        } else if (user.role === 'INSTRUCTOR') {
            await Instructor.destroy({ where: { user_id: user.user_id } });
        }

        await user.destroy();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
