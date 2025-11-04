import { useState, useEffect } from 'react';
import axios from 'axios';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Plus,
  Search,
  Eye,
  Edit,
  Trash2,
  MoreHorizontal,
  CalendarDays,
  Clock,
  ThumbsUp,
  BookOpen,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useToast } from '@/components/hooks/use-toast';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';

interface Blog {
  _id: string;
  title: string;
  content: string;
  excerpt: string;
  author: string;
  category: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  featuredImage: string;
  readTime: number;
  views: number;
  likes: number;
  createdDate: string;
  updatedDate: string;
  publishedDate: string;
  slug: string;
}

const Blogs = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [selectedBlog, setSelectedBlog] = useState<Blog | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const blogsPerPage = 10;

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    author: '',
    category: 'technology',
    tags: [] as string[],
    status: 'draft' as 'draft' | 'published' | 'archived',
    featuredImage: '',
    readTime: 5,
  });

  const categories = [
    'technology',
    'lifestyle',
    'relationships',
    'career',
    'health',
    'entertainment'
  ];

  // Fetch blogs from backend
  const fetchBlogs = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${BASE_URL}/api/blogs`, {
        params: { 
          search: searchTerm, 
          status: statusFilter, 
          category: categoryFilter,
          admin: true 
        },
      });
      setBlogs(response.data);
    } catch (error) {
      setError('Failed to fetch blogs');
      toast({
        title: 'Error',
        description: 'Failed to fetch blogs',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogs();
  }, [searchTerm, statusFilter, categoryFilter, toast]);

  // Filter blogs based on search, status, and category
  const filteredBlogs = blogs.filter((blog) => {
    const matchesSearch =
      blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
      blog.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || blog.status === statusFilter;
    const matchesCategory = categoryFilter === 'all' || blog.category === categoryFilter;

    return matchesSearch && matchesStatus && matchesCategory;
  });

  // Pagination calculations
  const totalPages = Math.ceil(filteredBlogs.length / blogsPerPage);
  const paginatedBlogs = filteredBlogs.slice(
    (currentPage - 1) * blogsPerPage,
    currentPage * blogsPerPage
  );

  const handleViewBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setIsViewDialogOpen(true);
    toast({
      title: 'Blog Details',
      description: `Viewing details for ${blog.title}`,
    });
  };

  const handleEditBlog = (blog: Blog) => {
    setSelectedBlog(blog);
    setFormData({
      title: blog.title,
      content: blog.content,
      excerpt: blog.excerpt,
      author: blog.author,
      category: blog.category,
      tags: blog.tags,
      status: blog.status,
      featuredImage: blog.featuredImage,
      readTime: blog.readTime,
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteBlog = async (blogId: string) => {
    setIsLoading(true);
    try {
      await axios.delete(`${BASE_URL}/api/blogs/${blogId}`);
      setBlogs(blogs.filter((blog) => blog._id !== blogId));
      toast({
        title: 'Blog Deleted',
        description: 'Blog has been successfully deleted.',
        variant: 'destructive',
      });
      await fetchBlogs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete blog',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBlog = async () => {
    if (
      !formData.title ||
      !formData.content ||
      !formData.excerpt ||
      !formData.author
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(`${BASE_URL}/api/blogs`, formData);
      setBlogs([response.data, ...blogs]);
      setIsAddDialogOpen(false);
      setFormData({
        title: '',
        content: '',
        excerpt: '',
        author: '',
        category: 'technology',
        tags: [],
        status: 'draft',
        featuredImage: '',
        readTime: 5,
      });
      toast({
        title: 'Blog Created',
        description: 'New blog has been successfully created.',
      });
      setCurrentPage(1);
      await fetchBlogs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to create blog',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateBlog = async () => {
    if (!selectedBlog) return;

    if (
      !formData.title ||
      !formData.content ||
      !formData.excerpt ||
      !formData.author
    ) {
      toast({
        title: 'Error',
        description: 'Please fill in all required fields',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.put(`${BASE_URL}/api/blogs/${selectedBlog._id}`, formData);
      setBlogs(
        blogs.map((blog) => (blog._id === selectedBlog._id ? response.data : blog))
      );
      setIsEditDialogOpen(false);
      toast({
        title: 'Blog Updated',
        description: 'Blog has been successfully updated.',
      });
      await fetchBlogs();
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to update blog',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'published':
        return 'default';
      case 'draft':
        return 'secondary';
      case 'archived':
        return 'destructive';
      default:
        return 'secondary';
    }
  };

  const getCategoryBadgeVariant = (category: string) => {
    switch (category) {
      case 'technology':
        return 'default';
      case 'lifestyle':
        return 'secondary';
      case 'relationships':
        return 'destructive';
      case 'career':
        return 'outline';
      case 'health':
        return 'secondary';
      case 'entertainment':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const handleTagsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const tags = e.target.value.split(',').map(tag => tag.trim()).filter(tag => tag);
    setFormData({ ...formData, tags });
  };

  // Pagination controls
  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-2">
        <div className="flex items-center space-x-2">
          <BookOpen className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold text-foreground">Blog Management</h1>
        </div>

        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button
              className="bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
              disabled={isLoading}
            >
              <Plus className="h-4 w-4 mr-2" />
              Create Blog
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Blog Post</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="addTitle">Blog Title</Label>
                <Input
                  id="addTitle"
                  placeholder="Enter blog title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  disabled={isLoading}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addAuthor">Author</Label>
                  <Input
                    id="addAuthor"
                    placeholder="Enter author name"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="addCategory">Category</Label>
                  <Select
                    value={formData.category}
                    onValueChange={(value) => setFormData({ ...formData, category: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(category => (
                        <SelectItem key={category} value={category}>
                          {category.charAt(0).toUpperCase() + category.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="addExcerpt">Excerpt</Label>
                <Textarea
                  id="addExcerpt"
                  placeholder="Enter brief excerpt (will be shown in blog list)"
                  value={formData.excerpt}
                  onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                  disabled={isLoading}
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="addContent">Content</Label>
                <Textarea
                  id="addContent"
                  placeholder="Write your blog content here..."
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  disabled={isLoading}
                  rows={10}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addTags">Tags (comma separated)</Label>
                  <Input
                    id="addTags"
                    placeholder="technology, lifestyle, tips"
                    value={formData.tags.join(', ')}
                    onChange={handleTagsChange}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="addReadTime">Read Time (minutes)</Label>
                  <Input
                    id="addReadTime"
                    type="number"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="addFeaturedImage">Featured Image URL</Label>
                  <Input
                    id="addFeaturedImage"
                    placeholder="https://example.com/image.jpg"
                    value={formData.featuredImage}
                    onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="addStatus">Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(value) => setFormData({ ...formData, status: value })}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="published">Published</SelectItem>
                      <SelectItem value="archived">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Button
                className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
                onClick={handleAddBlog}
                disabled={isLoading}
              >
                {isLoading ? 'Creating...' : 'Create Blog Post'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle>Filters & Search</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              {searchTerm === '' && (
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              )}
              <Input
                placeholder="    Search blogs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 bg-background border-border w-full"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="published">Published</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>

            <Select value={categoryFilter} onValueChange={setCategoryFilter} disabled={isLoading}>
              <SelectTrigger>
                <SelectValue placeholder="Filter by category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Categories</SelectItem>
                {categories.map(category => (
                  <SelectItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Blogs Table */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle>
            Blog Posts ({filteredBlogs.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading && <p>Loading blogs...</p>}
          {error && <p className="text-destructive">{error}</p>}
          {!isLoading && !error && (
            <div className="space-y-4">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Blog Post</TableHead>
                      <TableHead>Author & Category</TableHead>
                      <TableHead>Stats</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {paginatedBlogs.map((blog) => (
                      <TableRow key={blog._id}>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="font-medium">{blog.title}</div>
                            <div className="text-sm text-muted-foreground line-clamp-2">
                              {blog.excerpt}
                            </div>
                            {blog.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-1">
                                {blog.tags.slice(0, 3).map((tag, index) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                                {blog.tags.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{blog.tags.length - 3}
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="text-sm font-medium">{blog.author}</div>
                            <Badge variant={getCategoryBadgeVariant(blog.category)}>
                              {blog.category}
                            </Badge>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-4 text-sm">
                            <div className="flex items-center space-x-1">
                              <Eye className="h-4 w-4 text-muted-foreground" />
                              <span>{blog.views}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <ThumbsUp className="h-4 w-4 text-muted-foreground" />
                              <span>{blog.likes}</span>
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{blog.readTime}m</span>
                            </div>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant={getStatusBadgeVariant(blog.status)}>
                            {blog.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="text-sm text-muted-foreground">
                            {new Date(blog.createdDate).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleViewBlog(blog)}
                              disabled={isLoading}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="sm" disabled={isLoading}>
                                  <MoreHorizontal className="h-4 w-4" />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end">
                                <DropdownMenuItem onClick={() => handleEditBlog(blog)}>
                                  <Edit className="h-4 w-4 mr-2" />
                                  Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={() => handleDeleteBlog(blog._id)}
                                  className="text-destructive"
                                >
                                  <Trash2 className="h-4 w-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
              {/* Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <div className="text-sm text-muted-foreground">
                    Showing {paginatedBlogs.length} of {filteredBlogs.length} blogs
                  </div>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handlePreviousPage}
                      disabled={currentPage === 1 || isLoading}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleNextPage}
                      disabled={currentPage === totalPages || isLoading}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* View Blog Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Blog Details</DialogTitle>
          </DialogHeader>
          {selectedBlog && (
            <div className="space-y-6">
              <div>
                <h3 className="text-2xl font-bold mb-2">{selectedBlog.title}</h3>
                <div className="flex items-center space-x-2 mb-4">
                  <Badge variant={getStatusBadgeVariant(selectedBlog.status)}>
                    {selectedBlog.status}
                  </Badge>
                  <Badge variant={getCategoryBadgeVariant(selectedBlog.category)}>
                    {selectedBlog.category}
                  </Badge>
                </div>
                {selectedBlog.featuredImage && (
                  <img
                    src={selectedBlog.featuredImage}
                    alt={selectedBlog.title}
                    className="w-full h-64 object-cover rounded-lg mb-4"
                  />
                )}
                <p className="text-lg text-muted-foreground mb-4">{selectedBlog.excerpt}</p>
                <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: selectedBlog.content }} />
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium">Author</Label>
                  <p className="text-sm">{selectedBlog.author}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Read Time</Label>
                  <p className="text-sm">{selectedBlog.readTime} minutes</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Views</Label>
                  <p className="text-sm">{selectedBlog.views}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Likes</Label>
                  <p className="text-sm">{selectedBlog.likes}</p>
                </div>
              </div>

              {selectedBlog.tags.length > 0 && (
                <div>
                  <Label className="text-sm font-medium">Tags</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {selectedBlog.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-sm font-medium">Created Date</Label>
                  <p className="text-sm">{new Date(selectedBlog.createdDate).toLocaleDateString()}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Last Updated</Label>
                  <p className="text-sm">{new Date(selectedBlog.updatedDate).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Blog Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Blog Post</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="editTitle">Blog Title</Label>
              <Input
                id="editTitle"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                disabled={isLoading}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editAuthor">Author</Label>
                <Input
                  id="editAuthor"
                  value={formData.author}
                  onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="editCategory">Category</Label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => setFormData({ ...formData, category: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map(category => (
                      <SelectItem key={category} value={category}>
                        {category.charAt(0).toUpperCase() + category.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="editExcerpt">Excerpt</Label>
              <Textarea
                id="editExcerpt"
                value={formData.excerpt}
                onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })}
                disabled={isLoading}
                rows={3}
              />
            </div>

            <div>
              <Label htmlFor="editContent">Content</Label>
              <Textarea
                id="editContent"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                disabled={isLoading}
                rows={10}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editTags">Tags (comma separated)</Label>
                <Input
                  id="editTags"
                  value={formData.tags.join(', ')}
                  onChange={handleTagsChange}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="editReadTime">Read Time (minutes)</Label>
                <Input
                  id="editReadTime"
                  type="number"
                  value={formData.readTime}
                  onChange={(e) => setFormData({ ...formData, readTime: parseInt(e.target.value) || 5 })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="editFeaturedImage">Featured Image URL</Label>
                <Input
                  id="editFeaturedImage"
                  value={formData.featuredImage}
                  onChange={(e) => setFormData({ ...formData, featuredImage: e.target.value })}
                  disabled={isLoading}
                />
              </div>
              <div>
                <Label htmlFor="editStatus">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value) => setFormData({ ...formData, status: value })}
                  disabled={isLoading}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button
              className="w-full bg-gradient-to-r from-blue-400 to-blue-600 hover:from-blue-500 hover:to-blue-700"
              onClick={handleUpdateBlog}
              disabled={isLoading}
            >
              {isLoading ? 'Updating...' : 'Update Blog Post'}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Blogs;