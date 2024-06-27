const { User, Staff } = require('./models'); // Adjust the path as needed
const bcrypt = require('bcryptjs');
const sequelize = require('./models').sequelize; // Adjust the path as needed

const seedAdmin = async () => {
  const email = 'admin@ecoutopia.com';
  const password = 'P@ssw0rd'; // Change this to a secure password
  const hashedPassword = await bcrypt.hash(password, 10);

  // Check if admin user already exists
  const existingUser = await User.findOne({ where: { email } });
  if (!existingUser) {
    const transaction = await sequelize.transaction();
    try {
      // Create admin user
      const newUser = await User.create(
        {
          email,
          password: hashedPassword,
          role: 'STAFF',
          is_activated: true,
        },
        { transaction }
      );

      // Create admin staff
      await Staff.create(
        {
          name: 'Administrator Account',
          mobilenum: '99999999',
          user_id: newUser.user_id,
        },
        { transaction }
      );

      await transaction.commit();
      console.log('Admin account seeded successfully');
    } catch (error) {
      await transaction.rollback();
      console.error('Error seeding admin account:', error);
    }
  } else {
    console.log('Admin account already exists');
  }
};

module.exports = seedAdmin;
