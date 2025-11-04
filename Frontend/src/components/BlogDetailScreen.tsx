import { motion } from "motion/react";
import { ArrowLeft, Clock, Eye, ThumbsUp, User, Calendar, Share2, Bookmark, Heart } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { useState, useEffect } from "react";
import axios from "axios";

import { useNavigate, useLocation } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  featuredImage: string;
  readTime: number;
  views: number;
  likes: number;
  createdDate: string;
  slug: string;
  status: string;
  relatedBlogs?: Blog[];
}

export default function BlogDetailScreen() {
  const navigate = useNavigate();
  const location = useLocation();
  const [blog, setBlog] = useState<Blog | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isLiking, setIsLiking] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Get blog data from navigation state
  const blogFromState = location.state?.blog;

  // Function to get proper image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    return `${BASE_URL}${imagePath}`;
  };

  const fetchBlogDetail = async () => {
    try {
      let response;
      if (blogFromState?._id) {
        response = await axios.get(`${BASE_URL}/api/blogs/${blogFromState._id}`);
      } else {
        console.error('No blog data provided');
        return;
      }
      setBlog(response.data);
    } catch (error) {
      console.error('Error fetching blog details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLike = async () => {
    if (!blog || isLiking) return;
    
    setIsLiking(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/blogs/${blog._id}/like`);
      setBlog(prev => prev ? { ...prev, likes: response.data.likes } : null);
    } catch (error) {
      console.error('Error liking blog:', error);
    } finally {
      setIsLiking(false);
    }
  };

  const handleSave = () => {
    setIsSaved(!isSaved);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: blog?.title,
          text: blog?.excerpt,
          url: window.location.href,
        });
      } catch (error) {
        console.error('Error sharing:', error);
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
  };

  const getCategoryColor = (category: string) => {
    const colors = {
      technology: "bg-blue-100 text-blue-800",
      lifestyle: "bg-green-100 text-green-800", 
      relationships: "bg-pink-100 text-pink-800",
      career: "bg-purple-100 text-purple-800",
      health: "bg-red-100 text-red-800",
      entertainment: "bg-yellow-100 text-yellow-800"
    };
    return colors[category as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  useEffect(() => {
    if (blogFromState) {
      setBlog(blogFromState);
      setIsLoading(false);
      // Optionally fetch fresh data from API
      fetchBlogDetail();
    } else {
      fetchBlogDetail();
    }
  }, [blogFromState]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!blog) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Blog not found</h2>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
    
      
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
        >
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-6 hover:bg-accent"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Blogs
          </Button>
        </motion.div>

        {/* Blog Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <Badge className={`${getCategoryColor(blog.category)} mb-4`}>
            {blog.category}
          </Badge>
          <h1 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">{blog.title}</h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-6">{blog.excerpt}</p>
          
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center space-x-1">
              <User className="w-4 h-4" />
              <span>By {blog.author}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Calendar className="w-4 h-4" />
              <span>{new Date(blog.createdDate).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-4 h-4" />
              <span>{blog.readTime} min read</span>
            </div>
            <div className="flex items-center space-x-1">
              <Eye className="w-4 h-4" />
              <span>{blog.views} views</span>
            </div>
          </div>
        </motion.div>

        {/* Featured Image */}
        {blog.featuredImage && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="mb-8 rounded-2xl overflow-hidden shadow-lg"
          >
            <img
              src={getImageUrl(blog.featuredImage)}
              alt={blog.title}
              className="w-full h-64 md:h-96 object-cover"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.src = 'https://via.placeholder.com/800x400?text=Image+Not+Found';
              }}
            />
          </motion.div>
        )}

        {/* Blog Content */}
        <motion.article
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="prose prose-lg max-w-none mb-8 prose-headings:text-foreground prose-p:text-foreground prose-strong:text-foreground prose-li:text-foreground"
        >
          <div dangerouslySetInnerHTML={{ 
            __html: blog.content.replace(/\n/g, '<br>') 
          }} />
        </motion.article>

        {/* Tags */}
        {blog.tags && blog.tags.length > 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-lg font-semibold mb-3">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {blog.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-sm">
                  #{tag}
                </Badge>
              ))}
            </div>
          </motion.div>
        )}

        {/* Action Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="flex flex-wrap gap-4 mb-12"
        >
          <Button
            onClick={handleLike}
            disabled={isLiking}
            className="flex items-center space-x-2 bg-primary hover:bg-primary/90"
          >
            <Heart className="w-4 h-4" fill={isLiking ? "currentColor" : "none"} />
            <span>Like ({blog.likes})</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleShare}
            className="flex items-center space-x-2"
          >
            <Share2 className="w-4 h-4" />
            <span>Share</span>
          </Button>
          
          <Button
            variant="outline"
            onClick={handleSave}
            className="flex items-center space-x-2"
          >
            <Bookmark className="w-4 h-4" fill={isSaved ? "currentColor" : "none"} />
            <span>{isSaved ? 'Saved' : 'Save'}</span>
          </Button>
        </motion.div>

        {/* Related Blogs */}
        {blog.relatedBlogs && blog.relatedBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <h2 className="text-2xl font-bold mb-6 text-foreground">Related Articles</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {blog.relatedBlogs.map((relatedBlog) => (
                <Card
                  key={relatedBlog._id}
                  className="cursor-pointer hover:shadow-lg transition-shadow duration-300 rounded-2xl"
                  onClick={() => navigate('/blogdetails', { state: { blog: relatedBlog } })}
                >
                  <CardContent className="p-4">
                    {relatedBlog.featuredImage && (
                      <img
                        src={getImageUrl(relatedBlog.featuredImage)}
                        alt={relatedBlog.title}
                        className="w-full h-32 object-cover rounded-lg mb-3"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          target.src = 'https://via.placeholder.com/400x200?text=Image+Not+Found';
                        }}
                      />
                    )}
                    <Badge className={`${getCategoryColor(relatedBlog.category)} text-xs mb-2`}>
                      {relatedBlog.category}
                    </Badge>
                    <h3 className="font-semibold mb-2 line-clamp-2 text-foreground">
                      {relatedBlog.title}
                    </h3>
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {relatedBlog.excerpt}
                    </p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{relatedBlog.readTime} min read</span>
                      <span>{new Date(relatedBlog.createdDate).toLocaleDateString()}</span>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}