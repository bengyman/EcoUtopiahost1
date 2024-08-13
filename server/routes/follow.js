  const express = require('express');
  const router = express.Router();
  const { Follow, User, Resident, Instructor, Staff } = require('../models');

  // Helper function to get the name and profile picture based on the role
  const getNameAndProfilePic = async (userId, role) => {
    if (role === 'RESIDENT') {
      return await Resident.findOne({ where: { user_id: userId }, attributes: ['name', 'profile_pic'] });
    } else if (role === 'INSTRUCTOR') {
      return await Instructor.findOne({ where: { user_id: userId }, attributes: ['name', 'profile_pic'] });
    } else if (role === 'STAFF') {
      return await Staff.findOne({ where: { user_id: userId }, attributes: ['name', 'profile_pic'] });
    }
    return null;
  };

  // Follow a user
  router.post('/follow/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;
      const { user_id } = req.body; // Assume user_id is sent in the request body

      const existingFollow = await Follow.findOne({
        where: { follower_id: user_id, following_id: profileId },
      });

      if (existingFollow) {
        return res.status(400).json({ error: 'Already following this user' });
      }

      const newFollow = await Follow.create({
        follower_id: user_id,
        following_id: profileId,
      });

      res.status(201).json(newFollow);
    } catch (error) {
      console.error('Error following user:', error);
      res.status(500).json({ error: 'Failed to follow user' });
    }
  });

  // Unfollow a user
  router.delete('/unfollow/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;
      const { user_id } = req.body; // Assume user_id is sent in the request body

      const follow = await Follow.findOne({
        where: { follower_id: user_id, following_id: profileId },
      });

      if (!follow) {
        return res.status(400).json({ error: 'You are not following this user' });
      }

      await follow.destroy();
      res.status(200).json({ message: 'Unfollowed successfully' });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      res.status(500).json({ error: 'Failed to unfollow user' });
    }
  });

  // Check if a user is following another user
  router.get('/isFollowing/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;
      const { user_id } = req.query; // Assume user_id is sent as a query parameter

      const follow = await Follow.findOne({
        where: { follower_id: user_id, following_id: profileId },
      });

      res.status(200).json({ isFollowing: !!follow });
    } catch (error) {
      console.error('Error checking follow status:', error);
      res.status(500).json({ error: 'Failed to check follow status' });
    }
  });

  // Get follower count for a specific user
  router.get('/followerCount/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;

      const followerCount = await Follow.count({
        where: { following_id: profileId },
      });

      res.status(200).json({ followerCount });
    } catch (error) {
      console.error('Error fetching follower count:', error);
      res.status(500).json({ error: 'Failed to fetch follower count' });
    }
  });

  // Get following count for a specific user
  router.get('/followingCount/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;

      const followingCount = await Follow.count({
        where: { follower_id: profileId },
      });

      res.status(200).json({ followingCount });
    } catch (error) {
      console.error('Error fetching following count:', error);
      res.status(500).json({ error: 'Failed to fetch following count' });
    }
  });

  // Remove all followers for a specific user
  router.delete('/removeAllFollowers/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;

      await Follow.destroy({
        where: { following_id: profileId },
      });

      res.status(200).json({ message: 'All followers removed' });
    } catch (error) {
      console.error('Error removing followers:', error);
      res.status(500).json({ error: 'Failed to remove followers' });
    }
  });

  // Remove all following for a specific user
  router.delete('/removeAllFollowing/:profileId', async (req, res) => {
    try {
      const { profileId } = req.params;

      await Follow.destroy({
        where: { follower_id: profileId },
      });

      res.status(200).json({ message: 'All following removed' });
    } catch (error) {
      console.error('Error removing following:', error);
      res.status(500).json({ error: 'Failed to remove following' });
    }
  });

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
          attributes: ['user_id', 'role'],
        },
      ],
    });

    const followersWithDetails = await Promise.all(
      followers.map(async (follower) => {
        const details = await getNameAndProfilePic(follower.Follower.user_id, follower.Follower.role);
        if (!details) {
          return null; // Handle the case where details are not found
        }
        return {
          ...follower.toJSON(),
          Follower: {
            ...follower.Follower,
            name: details.name,
            profile_pic: details.profile_pic,
          },
        };
      })
    );

    const filteredFollowers = followersWithDetails.filter(f => f !== null); // Filter out null results

    res.status(200).json(filteredFollowers);
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
            attributes: ['user_id', 'role'],
          },
        ],
      });

      const followingWithDetails = await Promise.all(
        following.map(async (follow) => {
          const details = await getNameAndProfilePic(follow.Following.user_id, follow.Following.role);
          return {
            ...follow.toJSON(),
            Following: {
              ...follow.Following,
              name: details ? details.name : '',
              profile_pic: details ? details.profile_pic : '',
            },
          };
        })
      );

      res.status(200).json(followingWithDetails);
    } catch (error) {
      console.error('Error fetching following:', error);
      res.status(500).json({ error: 'Failed to fetch following' });
    }
  });

  // Check if the current user is following another user
router.get('/isFollowing/:profileId', async (req, res) => {
  try {
    const { profileId } = req.params;
    const { user_id } = req.query; // Assume user_id is sent as a query parameter

    const follow = await Follow.findOne({
      where: { follower_id: user_id, following_id: profileId },
    });

    res.status(200).json({ isFollowing: !!follow });
  } catch (error) {
    console.error('Error checking follow status:', error);
    res.status(500).json({ error: 'Failed to check follow status' });
  }
});


  module.exports = router;
