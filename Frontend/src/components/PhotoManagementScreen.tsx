import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Plus, X, Star, Camera, Image as ImageIcon } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { toast } from "react-toastify";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "./ui/dialog";
import { useNavigate } from "react-router-dom";

interface PhotoManagementScreenProps {
  user: any;
  onBack: () => void;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const publicFetch = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token") || '';
  if (!token) {
    throw new Error('Authentication token missing. Please log in.');
  }
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...options.headers, // Allow FormData to set its own Content-Type
    },
  });
};

export default function PhotoManagementScreen({ user, onBack }: PhotoManagementScreenProps) {
  const [photos, setPhotos] = useState([]);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [videoReady, setVideoReady] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const navigate = useNavigate();

  // Fetch user photos on component mount
  useEffect(() => {
    const fetchPhotos = async () => {
      const userId = user?.id || JSON.parse(localStorage.getItem('loggedInUser') || '{}').profileId;
      console.log('Fetching photos - User ID:', userId);

      if (!userId) {
        console.error('No user ID available');
        toast.error('User ID not found. Please log in again.', { autoClose: 5000 });
        navigate('/login');
        return;
      }

      try {
        setIsLoading(true);
        const response = await publicFetch(`${BASE_URL}/api/photos/${userId}`);
        console.log('Fetch photos response status:', response.status);
        const data = await response.json();
        console.log('Fetch photos response data:', data);

        if (response.ok) {
          const photos = Array.isArray(data.photos)
            ? data.photos.map((photo) => ({
                ...photo,
                id: photo.id || photo._id,
              }))
            : [];
          console.log('Photos fetched:', photos);
          setPhotos(photos);
          if (photos.length === 0) {
            console.log('No photos found for user');
          }
        } else {
          console.error('Fetch photos error:', data.error || 'Unknown error');
          toast.error(data.error || 'Failed to fetch photos', { autoClose: 5000 });
        }
      } catch (error) {
        console.error('Fetch photos error:', error);
        toast.error('Failed to connect to server. Please try again.', { autoClose: 5000 });
      } finally {
        setIsLoading(false);
      }
    };

    if (user?.id || localStorage.getItem('loggedInUser')) {
      fetchPhotos();
    }
  }, [user?.id, navigate]);

  // Clean up camera stream on unmount or dialog close
  useEffect(() => {
    return () => {
      if (cameraStream) {
        console.log('Cleaning up camera stream');
        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        setVideoReady(false);
      }
    };
  }, [cameraStream]);

  // Attach stream to video element
  useEffect(() => {
    if (showPreview && cameraStream && videoRef.current) {
      console.log('Attaching stream to video element');
      videoRef.current.srcObject = cameraStream;
      videoRef.current.onloadedmetadata = () => {
        console.log('Video metadata loaded, playing video');
        videoRef.current?.play().catch((err) => {
          console.error('Video play error:', err);
          toast.error('Failed to play camera preview.', { autoClose: 5000 });
        });
        setVideoReady(true);
      };
    } else if (showPreview && cameraStream && !videoRef.current) {
      console.error('Video ref not available after showPreview');
      toast.error('Camera preview not available. Please try again.', { autoClose: 5000 });
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
      setShowPreview(false);
      setVideoReady(false);
    }
  }, [showPreview, cameraStream]);

  const handleAddPhoto = () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error('Please log in to upload photos.', { autoClose: 5000 });
      navigate('/login');
      return;
    }
    setIsDialogOpen(true);
  };

  const handleFileUpload = async (file: File) => {
    if (!file) return;
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error('Please log in to upload photos.', { autoClose: 5000 });
      navigate('/login');
      return;
    }

    const formData = new FormData();
    formData.append('photo', file);
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(`${BASE_URL}/api/photos/upload`, {
        method: 'POST',
        body: formData,
      });
      const data = await response.json();
      console.log('Upload response:', data);
      if (response.ok) {
        const newPhoto = {
          ...data.photo,
          id: data.photo.id || data.photo._id,
        };
        console.log('New photo added:', newPhoto);
        setPhotos([...photos, newPhoto]);
        toast.success('Photo uploaded successfully!', { autoClose: 5000 });
        setIsDialogOpen(false);
      } else {
        console.error('Upload error:', data.error);
        if (response.status === 401) {
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('token');
          navigate('/login');
          toast.error('Session expired. Please log in again.', { autoClose: 5000 });
        } else {
          toast.error(data.error || 'Failed to upload photo', { autoClose: 5000 });
        }
      }
    } catch (error) {
      console.error('Upload photo error:', error);
      toast.error('Failed to connect to server. Please try again.', { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMediaUpload = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleDeletePhoto = async (photoId: number | string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error('Please log in to delete photos.', { autoClose: 5000 });
      navigate('/login');
      return;
    }

    console.log('Deleting photo ID:', photoId);
    if (!photoId) {
      console.error('Invalid photo ID:', photoId);
      toast.error('Cannot delete photo: Invalid photo ID.', { autoClose: 5000 });
      return;
    }
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(`${BASE_URL}/api/photos/${photoId}`, {
        method: "DELETE",
      });
      const data = await response.json();
      console.log('Delete response:', data);
      if (response.ok) {
        setPhotos(photos.filter((photo) => photo.id !== photoId));
        toast.success("Photo deleted successfully!", { autoClose: 5000 });
      } else {
        console.error('Delete error:', data.error);
        if (response.status === 401) {
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('token');
          navigate('/login');
          toast.error('Session expired. Please log in again.', { autoClose: 5000 });
        } else {
          toast.error(data.error || "Failed to delete photo", { autoClose: 5000 });
        }
      }
    } catch (error) {
      console.error('Delete photo error:', error);
      toast.error("Failed to connect to server. Please try again.", { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetMainPhoto = async (photoId: number | string) => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error('Please log in to set main photo.', { autoClose: 5000 });
      navigate('/login');
      return;
    }

    if (!photoId) {
      console.error('Invalid photo ID for setting main:', photoId);
      toast.error('Cannot set main photo: Invalid photo ID.', { autoClose: 5000 });
      return;
    }
    try {
      setIsLoading(true);
      const response = await authenticatedFetch(`${BASE_URL}/api/photos/${photoId}/set-main`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
      });
      const data = await response.json();
      if (response.ok) {
        setPhotos(
          photos.map((photo) =>
            photo.id === photoId
              ? { ...photo, isMain: true }
              : { ...photo, isMain: false }
          )
        );
        toast.success("Main photo updated successfully!", { autoClose: 5000 });
      } else {
        console.error('Set main photo error:', data.error);
        if (response.status === 401) {
          localStorage.removeItem('loggedInUser');
          localStorage.removeItem('token');
          navigate('/login');
          toast.error('Session expired. Please log in again.', { autoClose: 5000 });
        } else {
          toast.error(data.error || "Failed to set main photo", { autoClose: 5000 });
        }
      }
    } catch (error) {
      console.error('Set main photo error:', error);
      toast.error("Failed to connect to server. Please try again.", { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  };

  const captureWithCamera = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error('Please log in to use the camera.', { autoClose: 5000 });
      navigate('/login');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" } });
      setCameraStream(stream);
      setShowPreview(true);
    } catch (err) {
      console.error('Camera access error:', err);
      toast.error('Failed to access camera. Please try again or upload a photo.', { autoClose: 5000 });
      setTimeout(() => {
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
      }, 100);
    }
  };

  const takePhoto = async () => {
    if (!cameraStream || !videoRef.current) {
      console.error('Camera stream or video element not available');
      toast.error('Failed to capture photo. Please try again.', { autoClose: 5000 });
      return;
    }

    if (videoRef.current.videoWidth === 0 || videoRef.current.videoHeight === 0) {
      console.error('Video dimensions not ready:', videoRef.current.videoWidth, videoRef.current.videoHeight);
      toast.error('Camera not ready. Please wait and try again.', { autoClose: 5000 });
      return;
    }

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    if (context) {
      context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      canvas.toBlob((blob) => {
        if (blob) {
          console.log('Photo captured, uploading...');
          const file = new File([blob], 'camera-capture.jpg', { type: 'image/jpeg' });
          handleFileUpload(file);
        } else {
          console.error('Failed to create blob from canvas');
          toast.error('Failed to capture photo.', { autoClose: 5000 });
        }

        cameraStream.getTracks().forEach(track => track.stop());
        setCameraStream(null);
        setShowPreview(false);
        setIsDialogOpen(false);
        setVideoReady(false);
      }, 'image/jpeg', 0.9);
    } else {
      console.error('Canvas context not available');
      toast.error('Failed to capture photo.', { autoClose: 5000 });
    }
  };

  const handleCameraUpload = () => {
    if (navigator.mediaDevices && navigator.mediaDevices.getUserMedia) {
      captureWithCamera();
    } else {
      console.error('MediaDevices not supported');
      toast.error('Camera not supported on this device.', { autoClose: 5000 });
      setTimeout(() => {
        if (cameraInputRef.current) {
          cameraInputRef.current.click();
        }
      }, 100);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover-scale">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl text-foreground">Manage Photos</h1>
          </div>
          <Button
            className="bg-primary hover:bg-primary/90 hover-scale"
            onClick={handleAddPhoto}
            disabled={isLoading}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Photo
          </Button>
        </div>
      </motion.div>

      <div className="p-4 pb-6">
        {isLoading ? (
          <div className="text-center text-muted-foreground">Loading photos...</div>
        ) : photos.length === 0 ? (
          <div className="text-center text-muted-foreground">No photos uploaded yet.</div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {photos.map((photo, index) => (
              <motion.div
                key={photo.id || `photo-${index}`}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card className="relative overflow-hidden aspect-[3/4] hover-scale">
                  <img src={photo.url} alt="Profile" className="w-full h-full object-cover" />
                  {photo.isMain && (
                    <Badge className="absolute top-2 left-2 bg-primary text-white">
                      <Star className="w-3 h-3 mr-1" />
                      Main
                    </Badge>
                  )}
                  <div className="absolute top-2 right-2 flex space-x-2">
                    {!photo.isMain && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full"
                        onClick={() => handleSetMainPhoto(photo.id)}
                        disabled={isLoading || !photo.id}
                      >
                        <Star className="w-4 h-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full"
                      onClick={() => handleDeletePhoto(photo.id)}
                      disabled={isLoading || !photo.id}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        )}

        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            className="aspect-[1.5/4] border-2 border-dashed border-border hover-scale tap-scale cursor-pointer mt"
            onClick={handleAddPhoto}
          >
            <CardContent className="h-full flex flex-col items-center justify-center space-y-2">
              <Plus className="w-8 h-8 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Add Photo</span>
            </CardContent>
          </Card>
        </motion.div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-sm text-blue-900 mb-2">Photo Tips</h3>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Use high-quality, recent photos</li>
            <li>• Show your face clearly in the main photo</li>
            <li>• Include photos that show your interests</li>
          </ul>
        </div>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={(open) => {
        setIsDialogOpen(open);
        if (!open && cameraStream) {
          console.log('Dialog closed, stopping camera stream');
          cameraStream.getTracks().forEach(track => track.stop());
          setCameraStream(null);
          setShowPreview(false);
          setVideoReady(false);
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{showPreview ? 'Take a Photo' : 'Add a Photo'}</DialogTitle>
          </DialogHeader>
          {showPreview ? (
            <div className="flex flex-col items-center space-y-4">
              <video
                ref={videoRef}
                className="w-full max-h-96 rounded-lg bg-black"
                style={{ maxWidth: '100%', height: 'auto' }}
                autoPlay
              />
              <Button
                variant="primary"
                onClick={takePhoto}
                disabled={isLoading || !videoReady}
              >
                Capture Photo
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  if (cameraStream) {
                    console.log('Cancel clicked, stopping camera stream');
                    cameraStream.getTracks().forEach(track => track.stop());
                    setCameraStream(null);
                    setShowPreview(false);
                    setVideoReady(false);
                  }
                }}
              >
                Cancel
              </Button>
            </div>
          ) : (
            <div className="flex flex-col space-y-4">
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleCameraUpload}
                disabled={isLoading}
              >
                <Camera className="w-4 h-4" />
                Take Photo with Camera
              </Button>
              <Button
                variant="outline"
                className="w-full gap-2"
                onClick={handleMediaUpload}
                disabled={isLoading}
              >
                <ImageIcon className="w-4 h-4" />
                Choose from Media Library
              </Button>
            </div>
          )}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            ref={cameraInputRef}
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
          />
          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => handleFileUpload(e.target.files?.[0])}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}