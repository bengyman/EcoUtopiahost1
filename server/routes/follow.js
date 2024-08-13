const express = require('express');
const router = express.Router();
const { Follow, User, Resident, Instructor, Staff } = require('../models');

// Helper function to get the name based on the role
const getNameAndProfilePic = async (userId, role) => {
  if (role === 'RESIDENT') {
    const resident = await Resident.findOne({ where: { user_id: userId }, attributes: ['name', 'profile_pic'] });
    return resident;
  } else if (role === 'INSTRUCTOR') {
    const instructor = await Instructor.findOne({ where: { user_id: userId }, attributes: ['name', 'profile_pic'] });
    return instructor;
  } else if (role === 'STAFF') {
    const staff = await Staff.findOne({ where: { user_id: userId }, attributes: ['name', 'profile_pic'] });
    return staff;
  }
  return null;
};

// Fetch followers for a specific user
router.get('/followers/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;

    const followers = await Follow.findAll({
      where: { following_id: profileId },
      include: [
        {
          model: User,
          as: 'Follower',
          attributes: ['user_id', 'role'], // We only need user_id and role here
        },
      ],
    });

    // Fetch the name and profile_pic based on the role
    const followersWithDetails = await Promise.all(followers.map(async (follower) => {
      const details = await getNameAndProfilePic(follower.Follower.user_id, follower.Follower.role);
      return {
        ...follower.toJSON(),
        Follower: {
          ...follower.Follower,
          name: details ? details.name : '',
          profile_pic: details ? details.profile_pic : '',
        }
      };
    }));

    res.status(200).json(followersWithDetails);
  } catch (error) {
    console.error('Error fetching followers:', error);
    res.status(500).json({ error: 'Failed to fetch followers' });
  }
});

// Fetch following for a specific user
router.get('/following/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;

    const following = await Follow.findAll({
      where: { follower_id: profileId },
      include: [
        {
          model: User,
          as: 'Following',
          attributes: ['user_id', 'role'], // We only need user_id and role here
        },
      ],
    });

    // Fetch the name and profile_pic based on the role
    const followingWithDetails = await Promise.all(following.map(async (follow) => {
      const details = await getNameAndProfilePic(follow.Following.user_id, follow.Following.role);
      return {
        ...follow.toJSON(),
        Following: {
          ...follow.Following,
          name: details ? details.name : '',
          profile_pic: details ? details.profile_pic : '',
        }
      };
    }));

    res.status(200).json(followingWithDetails);
  } catch (error) {
    console.error('Error fetching following:', error);
    res.status(500).json({ error: 'Failed to fetch following' });
  }
});

module.exports = router;
