import { motion } from "motion/react";
import { BookOpen, Clock, Eye, ThumbsUp, User, Search } from "lucide-react";
import { Button } from "../components/ui/button";
import { Card, CardContent } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Input } from "../components/ui/input";
import { useState, useEffect } from "react";
import axios from "axios";

import { useNavigate } from "react-router-dom";

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
}

export default function BlogsScreen() {
  const navigate = useNavigate();
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [featuredBlogs, setFeaturedBlogs] = useState<Blog[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);

  const categories = [
    'technology', 'lifestyle', 'relationships', 'career', 'health', 'entertainment'
  ];

  const fetchBlogs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/blogs`, {
        params: { 
          search: searchTerm, 
          category: categoryFilter,
          // Remove admin parameter for public view
        },
      });
      setBlogs(response.data);
    } catch (error) {
      console.error('Error fetching blogs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchFeaturedBlogs = async () => {
    try {
      const response = await axios.get(`${BASE_URL}/api/blogs/featured/recent`);
      setFeaturedBlogs(response.data);
    } catch (error) {
      console.error('Error fetching featured blogs:', error);
    }
  };

  useEffect(() => {
    fetchBlogs();
    fetchFeaturedBlogs();
  }, [searchTerm, categoryFilter]);

  // Remove the publishedBlogs filter since backend already filters for published
  const displayedBlogs = blogs; // Use all blogs returned from API

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

  const handleBlogClick = (blog: Blog) => {
    navigate('/blogdetails', { state: { blog } });
  };

  // Function to get proper image URL
  const getImageUrl = (imagePath: string) => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http') || imagePath.startsWith('data:')) {
      return imagePath;
    }
    return `${BASE_URL}${imagePath}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      

      <div className="pb-6">
        {/* Search and Filter */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4"
        >
          <Card className="rounded-2xl">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search blogs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="px-3 py-2 border border-input rounded-md bg-background text-sm"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>
                      {category.charAt(0).toUpperCase() + category.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Featured Blogs */}
        {featuredBlogs.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4"
          >
            <div className="flex items-center space-x-2 mb-4">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <h2 className="text-lg text-foreground">Featured Stories</h2>
            </div>

            <div className="space-y-4">
              {featuredBlogs.slice(0, 3).map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.3 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-lg transition-shadow duration-300 rounded-2xl overflow-hidden"
                    onClick={() => handleBlogClick(blog)}
                  >
                    <div className="flex flex-col md:flex-row">
                      {blog.featuredImage && (
                        <div className="md:w-48 h-48 md:h-auto overflow-hidden">
                          <img
                            src={getImageUrl(blog.featuredImage)}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/400x300?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      )}
                      
                      <CardContent className="p-4 flex-1">
                        <div className="flex items-center space-x-2 mb-3">
                          <Badge className={`${getCategoryColor(blog.category)} text-xs`}>
                            {blog.category}
                          </Badge>
                        </div>

                        <h3 className="text-lg font-semibold mb-2 text-foreground">{blog.title}</h3>
                        <p className="text-sm text-muted-foreground mb-4">{blog.excerpt}</p>
                        
                        <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <User className="w-4 h-4" />
                              <span>{blog.author}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-4 h-4" />
                              <span>{blog.readTime} min read</span>
                            </div>
                          </div>
                          <div className="flex items-center space-x-4">
                            <div className="flex items-center space-x-1">
                              <Eye className="w-4 h-4" />
                              <span>{blog.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="w-4 h-4" />
                              <span>{blog.likes}</span>
                            </div>
                          </div>
                        </div>

                        <Button 
                          className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white transition-transform duration-200 hover:scale-105"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBlogClick(blog);
                          }}
                        >
                          <BookOpen className="w-4 h-4 mr-2" />
                          Read More
                        </Button>
                      </CardContent>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {/* All Blogs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4"
        >
          <h2 className="text-lg text-foreground mb-4">All Articles</h2>
          
          {displayedBlogs.length === 0 ? (
            <Card className="rounded-2xl text-center py-12">
              <CardContent>
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">No blogs found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || categoryFilter !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'No blogs have been published yet'
                  }
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-3">
              {displayedBlogs.map((blog, index) => (
                <motion.div
                  key={blog._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 + 0.5 }}
                >
                  <Card 
                    className="cursor-pointer hover:shadow-md transition-shadow duration-300 rounded-2xl"
                    onClick={() => handleBlogClick(blog)}
                  >
                    <CardContent className="p-4 flex items-center space-x-4">
                      {blog.featuredImage && (
                        <div className="w-16 h-16 rounded-xl overflow-hidden flex-shrink-0">
                          <img
                            src={getImageUrl(blog.featuredImage)}
                            alt={blog.title}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              const target = e.target as HTMLImageElement;
                              target.src = 'https://via.placeholder.com/80x80?text=Image+Not+Found';
                            }}
                          />
                        </div>
                      )}
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-2">
                          <Badge className={`${getCategoryColor(blog.category)} text-xs`}>
                            {blog.category}
                          </Badge>
                        </div>
                        
                        <h4 className="font-semibold text-sm mb-1 line-clamp-1 text-foreground">{blog.title}</h4>
                        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{blog.excerpt}</p>
                        
                        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                          <span>By {blog.author}</span>
                          <div className="flex items-center space-x-1">
                            <Clock className="w-3 h-3" />
                            <span>{blog.readTime} min</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <Eye className="w-3 h-3" />
                            <span>{blog.views} views</span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <ThumbsUp className="w-3 h-3" />
                            <span>{blog.likes} likes</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}