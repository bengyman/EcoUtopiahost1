const express = require('express');
const router = express.Router();
const { User, Resident, Staff } = require('../models');
const yup = require('yup');
const fs = require('fs');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const { Op } = require('sequelize');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const verifyRecaptcha = require('../middleware/recaptcha');
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
router.post('/register', verifyRecaptcha, async (req, res) => {
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
        console.error('Registration error:', error);  // Log the error details
        res.status(500).json({ error: error.message });
    }
});

// Authenticate user and generate JWT token
router.post('/login', verifyRecaptcha, async (req, res) => {
    try {
      const user = await User.findOne({ where: { email: req.body.email } });
      if (user && await bcrypt.compare(req.body.password, user.password)) {
        const token = generateToken(user);
        res.status(200).json({ user, token }); // Ensure 'user' and 'token' are returned
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
                }
            ]
        });
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Read a user by ID
router.get('/:id', authenticateToken, authorizeRoles('RESIDENT', 'STAFF'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let resident = null;
        let staff = null;

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

        res.status(200).json({ user, resident, staff });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});


// Update user details
router.put('/:id', authenticateToken, authorizeRoles('RESIDENT', 'STAFF'), async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        let updatedUser, updatedResident, updatedStaff;

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

        res.status(200).json({ user: updatedUser, resident: updatedResident, staff: updatedStaff });
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

  router.post('/password-reset', async (req, res) => {
    try {
        console.log("Request received to /password-reset with email:", req.body.email);
        
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) {
            console.log("User not found for email:", req.body.email);
            return res.status(404).json({ error: 'User not found' });
        }

        const resetCode = crypto.randomBytes(20).toString('hex');
        user.password_reset_code = resetCode;
        user.password_reset_expiry = new Date(Date.now() + 1800000); // 30 minutes expiry
        await user.save();

        console.log("Password reset code generated and saved for user:", user.email);

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
            text: `Your password reset code is: ${resetCode}`
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

// Reset password
router.post('/validate-reset-code', async (req, res) => {
    try {
        const { email, code } = req.body;
        
        const user = await User.findOne({ where: { email, password_reset_code: code, password_reset_expiry: { [Op.gt]: new Date() } } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired reset code' });
        }

        res.status(200).json({ message: 'Reset code is valid' });
    } catch (error) {
        console.error('Error in /validate-reset-code route:', error.message);
        res.status(500).json({ error: error.message });
    }
});

// Reset password
router.put('/password-reset/:code', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await User.findOne({ where: { email, password_reset_code: req.params.code, password_reset_expiry: { [Op.gt]: new Date() } } });
        if (!user) {
            return res.status(400).json({ error: 'Invalid or expired password reset code' });
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
router.post('/profile-picture', upload.single('profilePic'), async (req, res) => {
    const userId = req.body.userId; // Ensure the user is authenticated
    try {
        const resident = await Resident.findOne({ where: { user_id: userId } });
        const staff = await Staff.findOne({ where: { user_id: userId } });

        if (resident) {
            // Delete old profile picture if exists
            if (resident.profile_pic && fs.existsSync(`./public/uploads/${resident.profile_pic}`)) {
                fs.unlinkSync(`./public/uploads/${resident.profile_pic}`);
            }

            // Update new profile picture filename in the database
            resident.profile_pic = req.file.filename;
            await resident.save();
            res.send({ message: 'Resident profile picture updated successfully', fileName: req.file.filename });
        } else if (staff) {
            // Delete old profile picture if exists
            if (staff.profile_pic && fs.existsSync(`./public/uploads/${staff.profile_pic}`)) {
                fs.unlinkSync(`./public/uploads/${staff.profile_pic}`);
            }

            // Update new profile picture filename in the database
            staff.profile_pic = req.file.filename;
            await staff.save();
            res.send({ message: 'Staff profile picture updated successfully', fileName: req.file.filename });
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

