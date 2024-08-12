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

        // Generate activation token
        const activationToken = jwt.sign(
            { email: newUser.email },
            process.env.JWT_SECRET,
            { expiresIn: '30m' } // Token expires in 30 minutes
        );

        // Create activation link
        const activationLink = `${process.env.CLIENT_URL}/activate-account-link?token=${activationToken}`;

        // Set up Nodemailer
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_USER,
                pass: process.env.ETHEREAL_PASS
            }
        });

        // Send activation email with link
        const mailOptions = {
            from: '"EcoUtopia" <no-reply@ecoutopia.com>',
            to: newUser.email,
            subject: 'Account Activation',
            text: `Please click the following link to activate your account:\n\n${activationLink}\n\nIf you did not request this, please ignore this email.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ error: 'Failed to send activation email' });
            }
            console.log('Activation email sent:', info.response);
        });

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

// Public profile route (no authentication required)
router.get('/public-profile/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;
  
      // Logic to fetch the user's profile data from Resident, Instructor, or Staff
      const user = await User.findByPk(profileId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
  
      let profile;
      if (user.role === 'RESIDENT') {
        profile = await Resident.findOne({ where: { user_id: user.user_id } });
      } else if (user.role === 'INSTRUCTOR') {
        profile = await Instructor.findOne({ where: { user_id: user.user_id } });
      } else if (user.role === 'STAFF') {
        profile = await Staff.findOne({ where: { user_id: user.user_id } });
      }
  
      if (!profile) {
        return res.status(404).json({ error: 'Profile not found' });
      }
  
      res.status(200).json({
        name: profile.name,
        profilePic: profile.profile_pic,
        backgroundImage: profile.background_pic,
      });
    } catch (error) {
      console.error('Error fetching public profile:', error);
      res.status(500).json({ error: 'Internal server error' });
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

        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate activation token
        const activationToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30m' } // Token expires in 30 minutes
        );

        // Create activation link
        const activationLink = `${process.env.CLIENT_URL}/activate-account-link?token=${activationToken}`;

        // Set up Nodemailer
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_USER,
                pass: process.env.ETHEREAL_PASS
            }
        });

        // Send activation email with link
        const mailOptions = {
            from: '"EcoUtopia" <no-reply@ecoutopia.com>',
            to: user.email,
            subject: 'Account Activation',
            text: `Please click the following link to activate your account:\n\n${activationLink}\n\nIf you did not request this, please ignore this email.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                console.error('Error sending email:', err);
                return res.status(500).json({ error: 'Failed to send activation email' });
            }
            console.log('Activation email sent:', info.response);
            res.status(200).json({ message: 'Activation link sent' });
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

// Automatically activate account via the activation link
router.post('/activate-account-link', async (req, res) => {
    const { token } = req.query;

    try {
        // Verify the activation token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user by the decoded email
        const user = await User.findOne({ where: { email: decoded.email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Activate the user's account
        user.is_activated = true;
        user.activation_code = null;
        user.activation_code_expiry = null;
        await user.save();

        res.status(200).json({ message: 'Account activated successfully' });
    } catch (error) {
        console.error('Error activating account:', error);
        return res.status(401).json({ error: 'Invalid or expired activation link' });
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

// Password reset request
router.post('/password-reset', async (req, res) => {
    try {
        const user = await User.findOne({ where: { email: req.body.email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        // Generate reset token with user's email and expiration
        const resetToken = jwt.sign(
            { email: user.email },
            process.env.JWT_SECRET,
            { expiresIn: '30m' } // Token expires in 30 minutes
        );

        // Create password reset link using CLIENT_URL from .env
        const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;

        // Set up Nodemailer with Ethereal
        const transporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            auth: {
                user: process.env.ETHEREAL_USER,
                pass: process.env.ETHEREAL_PASS
            }
        });

        // Send email with only the reset link
        const mailOptions = {
            from: '"EcoUtopia" <no-reply@ecoutopia.com>',
            to: user.email,
            subject: 'Password Reset',
            text: `You requested a password reset. Click the link below to reset your password:\n\n${resetLink}\n\nIf you did not request a password reset, please ignore this email.`
        };

        transporter.sendMail(mailOptions, (err, info) => {
            if (err) {
                return res.status(500).json({ error: 'Failed to send email' });
            }
            res.status(200).json({ message: 'Password reset link sent' });
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.post('/password-reset-link', async (req, res) => {
    const { resetToken, password } = req.body;  // Extract token and password from the request body
  
    try {
        // Verify the token
        const decoded = jwt.verify(resetToken, process.env.JWT_SECRET);
  
        // Find the user by the decoded email
        const user = await User.findOne({ where: { email: decoded.email } });
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
  
        // Hash the new password and save it to the database
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword;
        await user.save();
  
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (err) {
        console.error('Error verifying token or resetting password:', err);
        return res.status(401).json({ error: 'Invalid or expired reset token' });
    }
  });

// Route to upload or update a profile picture
router.post('/profile-picture', uploadfile.single('profilePic'), async (req, res) => {
    const userId = req.body.userId; // Ensure the user is authenticated
    try {
        const resident = await Resident.findOne({ where: { user_id: userId } });
        const staff = await Staff.findOne({ where: { user_id: userId } });
        const instructor = await Instructor.findOne({ where: { user_id: userId } });

        if (resident) {
            // Update new profile picture URL in the database
            resident.profile_pic = req.file.location;
            await resident.save();
            res.send({ message: 'Resident profile picture updated successfully', fileName: req.file.location });
        } else if (staff) {
            // Update new profile picture URL in the database
            staff.profile_pic = req.file.location;
            await staff.save();
            res.send({ message: 'Staff profile picture updated successfully', fileName: req.file.location });
        } else if (instructor) {
            // Update new profile picture URL in the database
            instructor.profile_pic = req.file.location;
            await instructor.save();
            res.send({ message: 'Instructor profile picture updated successfully', fileName: req.file.location });
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
