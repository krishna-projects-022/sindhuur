const express = require("express");
const mongoose = require("mongoose");
const Blog = require("../../modals/admin/blogSchema");
const Notification = require("../../modals/admin/notificationSchema");
const User = require("../../modals/userSchema");
const multer = require('multer');
const path = require('path');
const fs = require('fs');


const router = express.Router();



const blogImageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    const blogDir = 'Uploads/blogs/';
    if (!fs.existsSync(blogDir)) {
      fs.mkdirSync(blogDir, { recursive: true });
    }
    cb(null, blogDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `blog-${uniqueSuffix}${ext}`);
  }
});

const uploadBlogImage = multer({
  storage: blogImageStorage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
}).single('blogImage');

// Helper function to validate required fields
const validateBlogData = (data) => {
  const requiredFields = ["title", "content", "excerpt", "author", "category"];
  const missingFields = requiredFields.filter((field) => !data[field]);
  return missingFields.length > 0
    ? `Missing required fields: ${missingFields.join(", ")}`
    : null;
};

// Helper function to generate slug
const generateSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9 -]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
};

// Basic sanitization function
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return input;
  return input
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+=/gi, '');
};

// GET all blogs
router.get("/blogs", async (req, res) => {
  try {
    const { search, status, category, featured } = req.query;
    let query = {};

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { content: { $regex: search, $options: "i" } },
        { author: { $regex: search, $options: "i" } },
        { tags: { $in: [new RegExp(search, "i")] } },
      ];
    }

    if (status && status !== "all") {
      query.status = status;
    }

    if (category && category !== "all") {
      query.category = category;
    }

    if (featured === "true") {
      query.featured = true;
    }

    // For users, only show published blogs
    if (!req.query.admin) {
      query.status = "published";
    }

    const blogs = await Blog.find(query).sort({ createdDate: -1 });
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching blogs:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching blogs", error: error.message });
  }
});

// GET single blog by ID or slug
router.get("/blogs/:id", async (req, res) => {
  try {
    const { id } = req.params;
    let blog;

    // Check if ID is a valid ObjectId
    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id);
    } else {
      // If not ObjectId, treat as slug
      blog = await Blog.findOne({ slug: id });
    }

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Increment views
    blog.views += 1;
    await blog.save();

    res.json(blog);
  } catch (error) {
    console.error("Error fetching blog:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching blog", error: error.message });
  }
});

// POST a new blog
router.post("/blogs", async (req, res) => {
  try {
    const blogData = {
      title: sanitizeInput(req.body.title),
      content: sanitizeInput(req.body.content),
      excerpt: sanitizeInput(req.body.excerpt),
      author: sanitizeInput(req.body.author),
      category: req.body.category,
      tags: Array.isArray(req.body.tags) ? req.body.tags.map(tag => sanitizeInput(tag)) : [],
      status: req.body.status || "draft",
      featuredImage: req.body.featuredImage, // This will now be the uploaded image URL
      readTime: req.body.readTime || 5,
      slug: generateSlug(req.body.title),
      createdDate: new Date(),
      updatedDate: new Date(),
      publishedDate: req.body.status === "published" ? new Date() : null,
    };

    const validationError = validateBlogData(blogData);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    // Check for duplicate slug
    const existingBlog = await Blog.findOne({ slug: blogData.slug });
    if (existingBlog) {
      blogData.slug = `${blogData.slug}-${Date.now()}`;
    }

    const blog = new Blog(blogData);
    await blog.save();

    // Create notifications for all users when blog is published
    if (blog.status === "published") {
      try {
        const users = await User.find({});
        const notifications = users.map((user) => ({
          userId: user._id,
          blogId: blog._id,
          message: `New blog published: ${blog.title}`,
          read: false,
        }));
        await Notification.insertMany(notifications);
      } catch (notificationError) {
        console.error("Error creating notifications:", notificationError.message);
        // Don't fail the blog creation if notifications fail
      }
    }

    res.status(201).json(blog);
  } catch (error) {
    console.error("Error creating blog:", error.message, error.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "Blog with this title already exists" });
    }
    
    res.status(500).json({ message: "Error creating blog", error: error.message });
  }
});


// PUT update a blog
router.put("/blogs/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    const updateData = {
      ...req.body,
      updatedDate: new Date(),
    };

    // Sanitize inputs if provided
    if (req.body.title) {
      updateData.title = sanitizeInput(req.body.title);
      updateData.slug = generateSlug(req.body.title);
    }
    if (req.body.content) updateData.content = sanitizeInput(req.body.content);
    if (req.body.excerpt) updateData.excerpt = sanitizeInput(req.body.excerpt);
    if (req.body.author) updateData.author = sanitizeInput(req.body.author);
    if (req.body.tags) {
      updateData.tags = Array.isArray(req.body.tags) ? req.body.tags.map(tag => sanitizeInput(tag)) : [];
    }

    // Check for duplicate slug if title changed
    if (req.body.title) {
      const existingBlog = await Blog.findOne({ 
        slug: updateData.slug, 
        _id: { $ne: req.params.id } 
      });
      if (existingBlog) {
        updateData.slug = `${updateData.slug}-${Date.now()}`;
      }
    }

    // Set published date if status changed to published
    if (req.body.status === "published") {
      const existingBlog = await Blog.findById(req.params.id);
      if (existingBlog && existingBlog.status !== "published") {
        updateData.publishedDate = new Date();
      }
    }

    const validationError = validateBlogData(updateData);
    if (validationError) {
      return res.status(400).json({ message: validationError });
    }

    const blog = await Blog.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    res.json(blog);
  } catch (error) {
    console.error("Error updating blog:", error.message, error.stack);
    
    if (error.code === 11000) {
      return res.status(400).json({ message: "Blog with this title already exists" });
    }
    
    res.status(500).json({ message: "Error updating blog", error: error.message });
  }
});

// DELETE a blog
router.delete("/blogs/:id", async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid blog ID" });
    }

    const blog = await Blog.findByIdAndDelete(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    // Delete associated notifications
    try {
      await Notification.deleteMany({ blogId: req.params.id });
    } catch (notificationError) {
      console.error("Error deleting notifications:", notificationError.message);
      // Continue even if notification deletion fails
    }

    res.json({ message: "Blog deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog:", error.message, error.stack);
    res.status(500).json({ message: "Error deleting blog", error: error.message });
  }
});

// POST like a blog
router.post("/blogs/:id/like", async (req, res) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ message: "Blog not found" });
    }

    blog.likes += 1;
    await blog.save();

    res.json({ likes: blog.likes });
  } catch (error) {
    console.error("Error liking blog:", error.message, error.stack);
    res.status(500).json({ message: "Error liking blog", error: error.message });
  }
});

// GET featured blogs
router.get("/blogs/featured/recent", async (req, res) => {
  try {
    const blogs = await Blog.find({ status: "published" })
      .sort({ createdDate: -1 })
      .limit(5);
    res.json(blogs);
  } catch (error) {
    console.error("Error fetching featured blogs:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching featured blogs", error: error.message });
  }
});

// GET blog statistics (optional - for admin dashboard)
router.get("/blogs-stats", async (req, res) => {
  try {
    const totalBlogs = await Blog.countDocuments();
    const publishedBlogs = await Blog.countDocuments({ status: "published" });
    const draftBlogs = await Blog.countDocuments({ status: "draft" });
    const archivedBlogs = await Blog.countDocuments({ status: "archived" });
    
    const totalViews = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$views" } } }
    ]);
    
    const totalLikes = await Blog.aggregate([
      { $group: { _id: null, total: { $sum: "$likes" } } }
    ]);

    const categoryStats = await Blog.aggregate([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json({
      totalBlogs,
      publishedBlogs,
      draftBlogs,
      archivedBlogs,
      totalViews: totalViews[0]?.total || 0,
      totalLikes: totalLikes[0]?.total || 0,
      categoryStats
    });
  } catch (error) {
    console.error("Error fetching blog stats:", error.message, error.stack);
    res.status(500).json({ message: "Error fetching blog statistics", error: error.message });
  }
});



router.post("/blogs/upload-image", (req, res) => {
  uploadBlogImage(req, res, async (err) => {
    if (err) {
      console.error("Error uploading blog image:", err.message);
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({ 
            message: "File too large. Maximum size is 5MB." 
          });
        }
      }
      return res.status(400).json({ 
        message: "Error uploading image", 
        error: err.message 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No image file provided" });
    }

    try {
      const imageUrl = `/Uploads/blogs/${req.file.filename}`;
      res.json({
        message: "Image uploaded successfully",
        imageUrl: imageUrl,
        filename: req.file.filename
      });
    } catch (error) {
      console.error("Error processing upload:", error.message);
      // Delete the uploaded file if there was an error
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ 
        message: "Error processing upload", 
        error: error.message 
      });
    }
  });
});





module.exports = router;