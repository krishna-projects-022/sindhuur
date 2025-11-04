const mongoose = require("mongoose");

const blogSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  excerpt: { type: String, required: true },
  author: { type: String, required: true },
  category: {
    type: String,
    enum: ["technology", "lifestyle", "relationships", "career", "health", "entertainment"],
    required: true,
  },
  tags: [{ type: String }],
  status: {
    type: String,
    enum: ["draft", "published", "archived"],
    default: "published",
  },
  featuredImage: { type: String },
  readTime: { type: Number, default: 5 }, // in minutes
  views: { type: Number, default: 0 },
  likes: { type: Number, default: 0 },
  createdDate: { type: Date, default: Date.now },
  updatedDate: { type: Date, default: Date.now },
  publishedDate: { type: Date },
  slug: { type: String, unique: true },
});

module.exports = mongoose.model("Blog", blogSchema);