const express = require('express');
const router = express.Router();
const { Post, Resident } = require('../models');
const yup = require('yup');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');
const upload = require('../middleware/fileupload');

// Input validation schema
const postSchema = yup.object().shape({
    title: yup.string().required(),
    content: yup.string().required(),
    image: yup.mixed().nullable(),
    resident_id: yup.number().required()
});

// Generate JWT token (if needed, you can adjust based on your actual requirements)
const generateToken = (post) => {
    const payload = {
        id: post.id,
        title: post.title
    };
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1h' });
};

// Create a new post
router.post('/create-post', authenticateToken, async (req, res) => {
    const transaction = await Post.sequelize.transaction();
    try {
        await postSchema.validate(req.body);
        const { title, content, image, resident_id } = req.body;

        const newPost = await Post.create({
            title,
            content,
            image,
            resident_id
        }, { transaction });

        await transaction.commit();
        
        const token = generateToken(newPost); // Assuming you need to generate a token for the post
        res.status(201).json({ post: newPost, token });
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

// Fetch a specific post by ID
router.get('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id, {
            include: [
                {
                    model: Resident,
                    attributes: ['name']
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
router.put('/posts/:id', authenticateToken, async (req, res) => {
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
router.delete('/posts/:id', authenticateToken, async (req, res) => {
    try {
        const post = await Post.findByPk(req.params.id);
        if (!post) {
            return res.status(404).json({ error: 'Post not found' });
        }

        await post.destroy();
        res.status(204).send();
    } catch (error) {
        console.error('Error deleting post:', error);
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;
