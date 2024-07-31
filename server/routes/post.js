const express = require('express');
const router = express.Router();
const { Post, Resident, Comment } = require('../models');
const yup = require('yup');
const fs = require('fs');
const path = require('path'); // Import the path module
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/fileupload');

const reportedPosts = {};

// Input validation schema
const postSchema = yup.object().shape({
    title: yup.string().required(),
    content: yup.string().required(),
    image: yup.mixed().nullable(),
    resident_id: yup.number().required()
});

const commentSchema = yup.object().shape({
    content: yup.string().required(),
    resident_id: yup.number().required(),
    post_id: yup.number().required(),
});

// Function to delete a file
const deleteFile = (filePath) => {
  fs.unlink(filePath, (err) => {
    if (err) {
      console.error(`Error deleting file ${filePath}:`, err);
    } else {
      console.log(`File ${filePath} deleted successfully`);
    }
  });
};

// Create a new post
router.post('/create-post', authenticateToken, upload.single('image'), async (req, res) => {
    const transaction = await Post.sequelize.transaction();
    try {
      const { title, content, resident_id, residentName, tags } = req.body;
      let image = req.file ? req.file.path : null; // Path to the uploaded image

      if (image) {
        image = image.replace(/\\/g, '/').replace('public/', '');
      }
  
      // Validate the other fields
      await postSchema.validate({ title, content, resident_id, residentName, tags });
  
      const newPost = await Post.create({
        title,
        content,
        imageUrl: image,
        resident_id,
        residentName,
        tags,
      }, { transaction });
  
      await transaction.commit();
  
      res.status(201).json({ post: newPost });
    } catch (error) {
      await transaction.rollback();
      console.error('Post creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });

// Fetch all posts
router.get('/posts', authenticateToken, async (req, res) => {
    try {
        const posts = await Post.findAll({
            include: [
                {
                    model: Resident,
                    attributes: ['name']
                }
            ]
        });
        res.status(200).json(posts);
    } catch (error) {
        console.error('Error fetching posts:', error);
        res.status(500).json({ error: error.message });
    }
});


router.get('/:id', async (req, res) => {
    try {
      const { id } = req.params;
      
      const post = await Post.findOne({
        where: { post_id: id },
        include: [
          {
            model: Comment,
            include: [
              {
                model: Resident,
                attributes: ['name'] // Include the resident's name in the comment
              }
            ]
          }
        ]
      });
  
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      res.status(200).json(post);
    } catch (error) {
      console.error('Error fetching post:', error);
      res.status(500).json({ error: error.message });
    }
  });


  

// Update a post
router.put('/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        const { title, content, image } = req.body;
        await post.update({ 
            title,
            content,
            image
        });

        res.status(200).json(post);
    } catch (error) {
        console.error('Error updating post:', error);
        res.status(500).json({ error: error.message });
    }
});

// Delete a post
router.delete('/:id', authenticateToken, async (req, res) => {
    
  
    try {
      // Fetch the post to get the image URL
      const post = await Post.findByPk(req.params.id);
      if (!post) {
        return res.status(404).json({ error: 'Post not found' });
      }
  
      // Delete the associated image file
      if (post.imageUrl) {
        // Ensure the path matches where the images are stored
        const filePath = path.join(__dirname, '../public/', post.imageUrl)
        console.log(`Attempting to delete file at ${filePath}`);
        deleteFile(filePath);
      }
  
      // Delete the post from the database
      await Post.destroy({
        where: { post_id: req.params.id},
      });
  
      res.status(200).json({ message: 'Post deleted successfully' });
    } catch (error) {
      console.error('Error deleting post:', error);
      res.status(500).json({ error: error.message });
    }
  });

  // Report a post
  router.post('/:id/report', authenticateToken, async (req, res) => {
    try {
        const userId = req.user.id;
        const postId = req.params.id;

        if (!reportedPosts[postId]) {
            reportedPosts[postId] = new Set();
        }

        // Check if the user has already reported this post
        if (reportedPosts[postId].has(userId)) {
            return res.status(400).json({ error: 'You have already reported this post' });
        }

        const post = await Post.findByPk(postId);

        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        // Add user to the set of users who reported this post
        reportedPosts[postId].add(userId);

        // Increment the report count
        post.reports += 1;
        await post.save();

        res.json({ message: 'Post reported successfully' });
    } catch (error) {
        console.error('Error reporting post:', error);
        res.status(500).json({ error: 'An error occurred while reporting the post' });
    }
});


  
router.post('/:id/comments', authenticateToken, upload.none(), async (req, res) => {
    const transaction = await Comment.sequelize.transaction();
    try {
      const { content, resident_id, residentName } = req.body;
      const post_id = req.params.id; // Ensure post_id is taken from the URL parameter
  
      await commentSchema.validate({ content, resident_id, post_id }); // Validate post_id
  
      const newComment = await Comment.create({
        post_id, // Save post_id
        content,
        resident_id,
        residentName,
      }, { transaction });
  
      await transaction.commit();
  
      res.status(201).json({ comment: newComment });
    } catch (error) {
      await transaction.rollback();
      console.error('Comment creation error:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Edit a comment
  router.put('/comments/:commentId', authenticateToken, async (req, res) => {
    try {
      const { commentId } = req.params;
      const { content } = req.body;
      const comment = await Comment.findByPk(commentId);
      
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
  
      await comment.update({ content });
  
      res.status(200).json(comment);
    } catch (error) {
      console.error('Error updating comment:', error);
      res.status(500).json({ error: error.message });
    }
  });
  
  // Delete a comment
  router.delete('/comments/:commentId', authenticateToken, async (req, res) => {
    try {
      const { commentId } = req.params;
      const comment = await Comment.findByPk(commentId);
  
      if (!comment) {
        return res.status(404).json({ error: 'Comment not found' });
      }
  
      await comment.destroy();
  
      res.status(200).json({ message: 'Comment deleted successfully' });
    } catch (error) {
      console.error('Error deleting comment:', error);
      res.status(500).json({ error: error.message });
    }
  });

  router.get('/:id', authenticateToken, async (req, res) => {
    const { id } = req.params;

    try {
        const post = await Post.findOne({
            where: { post_id: id },
            include: [
                {
                    model: Comment,
                    include: [Resident] // Optional: Include resident details if needed
                }
            ]
        });

        if (!post) {
            return res.status(404).json({ message: 'Post not found.' });
        }

        res.json(post);
    } catch (error) {
        console.error('Error fetching post:', error);
        res.status(500).json({ message: 'An error occurred while fetching the post.' });
    }
});


router.get('/admin/posts', authenticateToken, authorizeRoles('STAFF'), async (req, res) => {
    try {
      const posts = await Post.findAll({
        include: [
          {
            model: Resident,
            attributes: ['name']
          }
        ],
        attributes: ['post_id', 'title', 'content', 'tags', 'imageUrl', 'reports', 'resident_id', 'createdAt', 'updatedAt']
      });
  
      const postsWithResidentName = posts.map(post => ({
        ...post.toJSON(),
        residentName: post.Resident ? post.Resident.name : null
      }));
  
      res.status(200).json(postsWithResidentName);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  

module.exports = router;
