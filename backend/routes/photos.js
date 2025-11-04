const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const Photo = require('../modals/Photo');
const authMiddleware = require('../middleware/auth');

const BASE_URL = process.env.BASE_URL || 'http://localhost:5000';

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const userId = req.user.id; // Use authenticated user ID
    if (!userId) {
      return cb(new Error('User ID not found in request'), false);
    }
    const uploadPath = path.join(__dirname, '../Uploads/photos', userId.toString());
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed'), false);
    }
    cb(null, true);
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
}).single('photo');

router.get('/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const photos = await Photo.find({ userId });
    res.json({ photos });
  } catch (error) {
    console.error('Error fetching photos:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.post('/upload', authMiddleware, upload, async (req, res) => {
  try {
    const userId = req.user.id;
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }
    const existingPhotos = await Photo.find({ userId });
    const photo = new Photo({
      userId,
      url: `${BASE_URL}/Uploads/photos/${userId}/${req.file.filename}`,
      isMain: existingPhotos.length === 0,
    });
    await photo.save();
    res.json({ photo });
  } catch (error) {
    console.error('Upload error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.patch('/:photoId/set-main', authMiddleware, async (req, res) => {
  try {
    const photo = await Photo.findById(req.params.photoId);
    if (!photo || photo.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await Photo.updateMany({ userId: req.user.id.toString() }, { isMain: false });
    photo.isMain = true;
    await photo.save();
    res.json({ message: 'Main photo updated' });
  } catch (error) {
    console.error('Set main photo error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

router.delete('/:photoId', authMiddleware, async (req, res) => {
  try {
    const photoId = req.params.photoId;
    if (!photoId || !/^[0-9a-fA-F]{24}$/.test(photoId)) {
      return res.status(400).json({ error: 'Invalid photo ID' });
    }
    const photo = await Photo.findById(photoId);
    if (!photo || photo.userId.toString() !== req.user.id.toString()) {
      return res.status(403).json({ error: 'Unauthorized' });
    }
    await photo.deleteOne();
    res.json({ message: 'Photo deleted successfully' });
  } catch (error) {
    console.error('Delete photo error:', error.message);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;