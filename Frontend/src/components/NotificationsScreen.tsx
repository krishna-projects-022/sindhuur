
import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageSquare, Star, Crown, Calendar, Gift, Bell, Users, Trash2, Check } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Badge } from "./ui/badge";
import { Skeleton } from "./ui/skeleton";
import axios from "axios";
import { useToast } from "@/components/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface NotificationsScreenProps {
  onBack: () => void;
  onNavigate?: (screen: string, params?: any) => void;
  handleProfileView?: (profileId: string) => Promise<void>;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  time: string;
  read: boolean;
  fromProfileId: string;
  toProfileId: string;
  toUserName: string;
  createdAt: string;
  isRead: boolean;
  _id: string;
  user?: {
    name: string;
    image?: string;
    verified?: boolean;
    age?: number;
    profession?: string;
    location?: string;
  };
}

interface Profile {
  id: string;
  name: string;
  age: string | number;
  profession: string;
  education: string;
  location: string;
  image: string;
  isOnline: boolean;
  interests: string[];
  religion: string;
  community: string;
  income: string;
  photos: number;
  subscription: string;
  viewCount: number;
  interestsReceived: number;
  gender: string;
}

// Skeleton loader component
function NotificationsSkeleton({ onBack }: { onBack: () => void }) {
  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <Skeleton className="w-20 h-6 sm:w-24 lg:w-28" />
          </div>
          <Skeleton className="w-16 h-6 sm:w-20 lg:w-24" />
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8 sm:max-w-3xl lg:max-w-4xl mx-auto space-y-4">
        <Skeleton className="w-full h-10 rounded-lg" />
        {[1, 2, 3, 4, 5].map((i) => (
          <Card key={i}>
            <CardContent className="p-4 sm:p-6 flex items-center space-x-4">
              <Skeleton className="w-10 h-10 rounded-full sm:w-12 sm:h-12 lg:w-14 lg:h-14" />
              <div className="flex-1 space-y-2">
                <Skeleton className="w-24 h-4 sm:w-32 lg:w-40" />
                <Skeleton className="w-32 h-3 sm:w-48 lg:w-64" />
                <Skeleton className="w-16 h-3 sm:w-20" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Helper functions to manage deleted notifications in localStorage
const getDeletedNotifications = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) return new Set();
    
    const user = JSON.parse(userData);
    const profileId = user.profileId;
    const deletedKey = `deleted_notifications_${profileId}`;
    const deleted = localStorage.getItem(deletedKey);
    
    if (deleted) {
      const deletedArray = JSON.parse(deleted);
      return new Set(deletedArray);
    }
  } catch (error) {
    console.error("Error reading deleted notifications:", error);
  }
  
  return new Set();
};

const addToDeletedNotifications = (notificationId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const profileId = user.profileId;
    const deletedKey = `deleted_notifications_${profileId}`;
    
    const currentDeleted = getDeletedNotifications();
    currentDeleted.add(notificationId);
    
    localStorage.setItem(deletedKey, JSON.stringify(Array.from(currentDeleted)));
    console.log(`✅ Added to deleted notifications: ${notificationId}`);
  } catch (error) {
    console.error("Error saving deleted notification:", error);
  }
};

// Store deleted frontend notifications separately since they get recreated
const getDeletedFrontendNotifications = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) return new Set();
    
    const user = JSON.parse(userData);
    const profileId = user.profileId;
    const deletedKey = `deleted_frontend_notifications_${profileId}`;
    const deleted = localStorage.getItem(deletedKey);
    
    if (deleted) {
      const deletedArray = JSON.parse(deleted);
      return new Set(deletedArray);
    }
  } catch (error) {
    console.error("Error reading deleted frontend notifications:", error);
  }
  
  return new Set();
};

const addToDeletedFrontendNotifications = (notificationKey: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const profileId = user.profileId;
    const deletedKey = `deleted_frontend_notifications_${profileId}`;
    
    const currentDeleted = getDeletedFrontendNotifications();
    currentDeleted.add(notificationKey);
    
    localStorage.setItem(deletedKey, JSON.stringify(Array.from(currentDeleted)));
    console.log(`✅ Added to deleted frontend notifications: ${notificationKey}`);
  } catch (error) {
    console.error("Error saving deleted frontend notification:", error);
  }
};

// NEW: Helper functions to manage read notifications in localStorage
const getReadNotifications = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) return new Set();
    
    const user = JSON.parse(userData);
    const profileId = user.profileId;
    const readKey = `read_notifications_${profileId}`;
    const read = localStorage.getItem(readKey);
    
    if (read) {
      const readArray = JSON.parse(read);
      return new Set(readArray);
    }
  } catch (error) {
    console.error("Error reading read notifications:", error);
  }
  
  return new Set();
};

const addToReadNotifications = (notificationId: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const profileId = user.profileId;
    const readKey = `read_notifications_${profileId}`;
    
    const currentRead = getReadNotifications();
    currentRead.add(notificationId);
    
    localStorage.setItem(readKey, JSON.stringify(Array.from(currentRead)));
    console.log(`✅ Added to read notifications: ${notificationId}`);
  } catch (error) {
    console.error("Error saving read notification:", error);
  }
};

// Store read frontend notifications separately
const getReadFrontendNotifications = (): Set<string> => {
  if (typeof window === 'undefined') return new Set();
  
  try {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) return new Set();
    
    const user = JSON.parse(userData);
    const profileId = user.profileId;
    const readKey = `read_frontend_notifications_${profileId}`;
    const read = localStorage.getItem(readKey);
    
    if (read) {
      const readArray = JSON.parse(read);
      return new Set(readArray);
    }
  } catch (error) {
    console.error("Error reading read frontend notifications:", error);
  }
  
  return new Set();
};

const addToReadFrontendNotifications = (notificationKey: string): void => {
  if (typeof window === 'undefined') return;
  
  try {
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) return;
    
    const user = JSON.parse(userData);
    const profileId = user.profileId;
    const readKey = `read_frontend_notifications_${profileId}`;
    
    const currentRead = getReadFrontendNotifications();
    currentRead.add(notificationKey);
    
    localStorage.setItem(readKey, JSON.stringify(Array.from(currentRead)));
    console.log(`✅ Added to read frontend notifications: ${notificationKey}`);
  } catch (error) {
    console.error("Error saving read frontend notification:", error);
  }
};

export default function NotificationsScreen({ onBack, onNavigate, handleProfileView }: NotificationsScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [lastRefreshTrigger, setLastRefreshTrigger] = useState<string | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [deletingNotifications, setDeletingNotifications] = useState<Set<string>>(new Set());
  const [markingAsReadNotifications, setMarkingAsReadNotifications] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const navigate = useNavigate();

  const iconMap: Record<string, any> = {
    interest: Heart,
    message: MessageSquare,
    match: Users,
    system: Bell,
    profile_update: Bell,
    event: Calendar,
    premium: Crown,
    boost: Gift,
  };

  // Default implementation for handleProfileView
  const defaultHandleProfileView = async (profileId: string): Promise<void> => {
    try {
      const userData = localStorage.getItem("loggedInUser");
      if (!userData) throw new Error("User not logged in");
      
      const user = JSON.parse(userData);
      const token = user?.token || '';
      
      await axios.post(
        `${BASE_URL}/api/profile-views`,
        { 
          viewerProfileId: user.profileId,
          viewedProfileId: profileId 
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      console.log(`✅ Profile view tracked for: ${profileId}`);
    } catch (error) {
      console.error("❌ Failed to track profile view:", error);
    }
  };

  // Create profile object from notification for handleProfileClick
  const createProfileFromNotification = (notification: Notification): Profile => {
    return {
      id: notification.fromProfileId,
      name: notification.toUserName || notification.title || "Unknown User",
      age: notification.user?.age || "Not specified",
      profession: notification.user?.profession || "Not specified",
      education: "Not specified",
      location: notification.user?.location || "Not specified",
      image: notification.user?.image || "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg",
      isOnline: false,
      interests: [],
      religion: "Not specified",
      community: "Not specified",
      income: "Not specified",
      photos: 0,
      subscription: "free",
      viewCount: 0,
      interestsReceived: 0,
      gender: "Not specified"
    };
  };

  // handleProfileClick with fallback implementations
  const handleProfileClick = (profile: Profile) => {
    console.log(`NotificationsScreen - Navigating to profile with ID: ${profile.id}`);
    
    const profileViewHandler = handleProfileView || defaultHandleProfileView;
    
    profileViewHandler(profile.id).finally(() => {
      if (onNavigate) {
        onNavigate("profile-detail", { id: profile.id });
      } else {
        navigate(`/profile-detail/${profile.id}`);
      }
    });
  };

  // Mark as read function with persistent storage
  const markAsRead = async (notification: Notification) => {
    console.log("📖 Marking as read:", notification._id);
    
    setMarkingAsReadNotifications(prev => new Set(prev).add(notification._id));
    
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) {
      toast({ title: "Error", description: "No logged in user found. Please log in again.", variant: "destructive" });
      setMarkingAsReadNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
      return;
    }

    const { token, profileId } = JSON.parse(userData);
    if (!token) {
      toast({ title: "Error", description: "Invalid authentication token. Please log in again.", variant: "destructive" });
      setMarkingAsReadNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
      return;
    }

    try {
      // Check if it's a frontend notification (sent-/received-)
      const isFrontendNotification = notification._id.startsWith('sent-') || notification._id.startsWith('received-');
      
      if (isFrontendNotification) {
        // For frontend notifications, store in localStorage
        const frontendNotificationKey = `${notification.type}-${notification.fromProfileId}-${notification.toProfileId}`;
        addToReadFrontendNotifications(frontendNotificationKey);
        console.log(`📖 Frontend notification marked as read: ${frontendNotificationKey}`);
      } else {
        // For backend notifications, call the API
        await axios.post(
          `${BASE_URL}/api/notifications/${profileId}/mark-read`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        addToReadNotifications(notification._id);
        console.log("✅ Backend notification marked as read via API");
      }

      // Update UI immediately
      setNotifications(prev => 
        prev.map((n) => 
          n._id === notification._id 
            ? { ...n, isRead: true, read: true }
            : n
        )
      );
      
      toast({ 
        title: "Success", 
        description: "Notification marked as read" 
      });
    } catch (error: any) {
      console.error("❌ Failed to mark notification as read", error);
      
      // Even if API fails, update UI and store in localStorage for better UX
      const isFrontendNotification = notification._id.startsWith('sent-') || notification._id.startsWith('received-');
      if (isFrontendNotification) {
        const frontendNotificationKey = `${notification.type}-${notification.fromProfileId}-${notification.toProfileId}`;
        addToReadFrontendNotifications(frontendNotificationKey);
      } else {
        addToReadNotifications(notification._id);
      }
      
      setNotifications(prev => 
        prev.map((n) => 
          n._id === notification._id 
            ? { ...n, isRead: true, read: true }
            : n
        )
      );
      
      toast({ 
        title: "Success", 
        description: "Notification marked as read" 
      });
    } finally {
      setMarkingAsReadNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
    }
  };

  // Delete notification function with proper dynamic handling
  const deleteNotification = async (notification: Notification) => {
    console.log("🗑️ Deleting notification:", notification._id);
    
    setDeletingNotifications(prev => new Set(prev).add(notification._id));
    
    const userData = localStorage.getItem("loggedInUser");
    if (!userData) {
      toast({ title: "Error", description: "No logged in user found. Please log in again.", variant: "destructive" });
      setDeletingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
      return;
    }

    const { token, profileId } = JSON.parse(userData);
    if (!token) {
      toast({ title: "Error", description: "Invalid authentication token. Please log in again.", variant: "destructive" });
      setDeletingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
      return;
    }

    try {
      // Check if it's a frontend notification (sent-/received-)
      const isFrontendNotification = notification._id.startsWith('sent-') || notification._id.startsWith('received-');
      
      if (isFrontendNotification) {
        // For frontend notifications, create a unique key based on the profile data
        const frontendNotificationKey = `${notification.type}-${notification.fromProfileId}-${notification.toProfileId}`;
        addToDeletedFrontendNotifications(frontendNotificationKey);
        console.log(`🗑️ Frontend notification marked as deleted: ${frontendNotificationKey}`);
      } else {
        // For backend notifications, call the API
        await axios.delete(
          `${BASE_URL}/api/admin/notifications/${notification._id}/${profileId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        console.log("✅ Backend notification deleted via API");
      }

      // Remove from UI immediately
      setNotifications(prev => prev.filter((n) => n._id !== notification._id));
      
      toast({ 
        title: "Success", 
        description: "Notification deleted successfully" 
      });
    } catch (error: any) {
      console.error("❌ Failed to delete notification", error);
      
      // Even if API fails, update UI for better UX
      setNotifications(prev => prev.filter((n) => n._id !== notification._id));
      
      toast({ 
        title: "Success", 
        description: "Notification deleted" 
      });
    } finally {
      setDeletingNotifications(prev => {
        const newSet = new Set(prev);
        newSet.delete(notification._id);
        return newSet;
      });
    }
  };

  // Filter out deleted notifications and apply read status
  const processNotifications = (notifications: Notification[]): Notification[] => {
    const deletedBackendNotifications = getDeletedNotifications();
    const deletedFrontendNotifications = getDeletedFrontendNotifications();
    const readBackendNotifications = getReadNotifications();
    const readFrontendNotifications = getReadFrontendNotifications();
    
    return notifications
      .filter(notification => {
        // Check if it's a backend notification that was deleted
        if (deletedBackendNotifications.has(notification._id)) {
          return false;
        }
        
        // Check if it's a frontend notification that was deleted
        const isFrontendNotification = notification._id.startsWith('sent-') || notification._id.startsWith('received-');
        if (isFrontendNotification) {
          const frontendNotificationKey = `${notification.type}-${notification.fromProfileId}-${notification.toProfileId}`;
          if (deletedFrontendNotifications.has(frontendNotificationKey)) {
            return false;
          }
        }
        
        return true;
      })
      .map(notification => {
        // Apply read status from localStorage
        const isFrontendNotification = notification._id.startsWith('sent-') || notification._id.startsWith('received-');
        
        if (isFrontendNotification) {
          const frontendNotificationKey = `${notification.type}-${notification.fromProfileId}-${notification.toProfileId}`;
          if (readFrontendNotifications.has(frontendNotificationKey)) {
            return { ...notification, isRead: true, read: true };
          }
        } else {
          if (readBackendNotifications.has(notification._id)) {
            return { ...notification, isRead: true, read: true };
          }
        }
        
        return notification;
      });
  };

  const fetchNotifications = useCallback(async () => {
    console.log('🔄 Fetching notifications...');
    const profileDataStr = localStorage.getItem("loggedInUser");
    if (!profileDataStr) {
      console.error("No logged in user found in localStorage");
      setFetchError("No logged in user found. Please log in again.");
      setIsLoading(false);
      return;
    }

    let profileData;
    try {
      profileData = JSON.parse(profileDataStr);
    } catch (e) {
      console.error("Invalid loggedInUser data in localStorage:", e);
      setFetchError("Invalid user data. Please log in again.");
      setIsLoading(false);
      return;
    }

    if (!profileData?.profileId || !/^[A-Z0-9]+$/.test(profileData.profileId)) {
      console.error("Profile ID not found or invalid:", profileData);
      setFetchError("Profile ID not found or invalid. Please log in again.");
      setIsLoading(false);
      return;
    }

    const profileId = profileData.profileId;
    const token = profileData?.token || '';

    try {
      setIsLoading(true);

      // Fetch system notifications
      console.log(`🔔 Fetching system notifications for profileId: ${profileId}`);
      const notificationsResponse = await axios.get(
        `${BASE_URL}/api/admin/notifications/${profileId}`,
        {
          timeout: 10000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📨 Raw system notifications response:", notificationsResponse.data);
      const notificationsData = notificationsResponse.data;
      if (!Array.isArray(notificationsData)) {
        throw new Error("Invalid data format from API: expected an array for notifications");
      }

      const systemNotifications = notificationsData.map((notification: any, index: number) => ({
        id: notification._id || notification.id || `notif-${Date.now()}-${index}`,
        _id: notification._id || notification.id || `notif-${Date.now()}-${index}`,
        type: notification.type || "system",
        title: notification.toUserName || notification.title || "System Notification",
        message: notification.message || "You have a new notification",
        time: notification.createdAt ? new Date(notification.createdAt).toLocaleString() : new Date().toLocaleString(),
        read: notification.isRead || false,
        isRead: notification.isRead || false,
        fromProfileId: notification.fromProfileId || "unknown",
        toProfileId: notification.toProfileId || profileId,
        toUserName: notification.toUserName || "Unknown User",
        createdAt: notification.createdAt || new Date().toISOString(),
        user: notification.user || { name: notification.toUserName || "Unknown User" },
      }));

      // Fetch sent interests - ONLY if not deleted
      const deletedFrontendNotifications = getDeletedFrontendNotifications();
      console.log(`Fetching interested profiles for userProfileId=${profileId}`);
      const sentResponse = await axios.get(
        `${BASE_URL}/api/interested-profiles?userProfileId=${profileId}`,
        {
          timeout: 10000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📨 Raw sent interests response:", sentResponse.data);
      const sentData = sentResponse.data;
      if (!Array.isArray(sentData)) {
        throw new Error("Invalid data format from API: expected an array for sent interests");
      }

      const sentNotifications = sentData
        .filter((profile: any) => {
          // Filter out profiles that have been deleted
          const profileKey = `interest-${profileId}-${profile.id}`;
          return !deletedFrontendNotifications.has(profileKey);
        })
        .filter((profile: any) => profile.id.toString() !== profileId)
        .map((profile: any, index: number) => ({
          id: `sent-${profile.id}-${Date.now()}-${index}`,
          _id: `sent-${profile.id}-${Date.now()}-${index}`,
          type: "interest",
          title: profile.name,
          message: `You sent an interest to ${profile.name}, ${profile.age} years old`,
          time: new Date().toLocaleString(),
          read: false,
          isRead: false,
          fromProfileId: profileId,
          toProfileId: profile.id.toString(),
          toUserName: profile.name,
          createdAt: new Date().toISOString(),
          user: {
            name: profile.name,
            image: profile.image || "https://via.placeholder.com/150",
            verified: profile.verified || false,
            age: profile.age,
            profession: profile.profession,
            location: profile.location,
          },
        }));

      // Fetch received interests - ONLY if not deleted
      console.log(`Fetching received interests for userProfileId=${profileId}`);
      const receivedResponse = await axios.get(
        `${BASE_URL}/api/received-interests?userProfileId=${profileId}`,
        {
          timeout: 10000,
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      console.log("📨 Raw received interests response:", receivedResponse.data);
      const receivedData = receivedResponse.data;
      if (!Array.isArray(receivedData)) {
        throw new Error("Invalid data format from API: expected an array for received interests");
      }

      const receivedNotifications = receivedData
        .filter((profile: any) => {
          // Filter out profiles that have been deleted
          const profileKey = `interest-${profile.id}-${profileId}`;
          return !deletedFrontendNotifications.has(profileKey);
        })
        .filter((profile: any) => profile.id.toString() !== profileId)
        .map((profile: any, index: number) => ({
          id: `received-${profile.id}-${Date.now()}-${index}`,
          _id: `received-${profile.id}-${Date.now()}-${index}`,
          type: "interest",
          title: profile.name,
          message: `${profile.name}, ${profile.age} years old, sent you an interest`,
          time: new Date().toLocaleString(),
          read: false,
          isRead: false,
          fromProfileId: profile.id.toString(),
          toProfileId: profileId,
          toUserName: profile.name,
          createdAt: new Date().toISOString(),
          user: {
            name: profile.name,
            image: profile.image || "https://via.placeholder.com/150",
            verified: profile.verified || false,
            age: profile.age,
            profession: profile.profession,
            location: profile.location,
          },
        }));

      // Combine all notifications and sort by createdAt (newest first)
      const allNotifications = [...systemNotifications, ...sentNotifications, ...receivedNotifications].sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );

      // Apply deletion filtering and read status from localStorage
      const processedNotifications = processNotifications(allNotifications);
      
      setNotifications(processedNotifications);
      setFetchError(null);
      console.log(`✅ Processed ${processedNotifications.length} notifications after filtering (original: ${allNotifications.length})`);
    } catch (error: any) {
      console.error("❌ Failed to fetch notifications:", error);
      if (error.response) {
        const status = error.response.status;
        const errorMessage = error.response.data?.message || "Unknown error";
        console.error(`Error ${status}:`, errorMessage);
        setFetchError(`Failed to load notifications: ${errorMessage} (Status: ${status})`);
      } else if (error.request) {
        setFetchError("Network error. Please check your internet connection.");
      } else {
        setFetchError(`An unexpected error occurred: ${error.message}`);
      }
      setNotifications([]);
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'notificationRefreshTrigger') {
        console.log('🔔 Notification refresh triggered by localStorage change');
        fetchNotifications();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    fetchNotifications();

    return () => window.removeEventListener('storage', handleStorageChange);
  }, [fetchNotifications]);

  const refreshNotifications = useCallback(() => {
    console.log('🔄 Manual notification refresh called');
    fetchNotifications();
  }, [fetchNotifications]);

  useEffect(() => {
    const interval = setInterval(() => {
      const currentTrigger = localStorage.getItem('notificationRefreshTrigger');
      if (currentTrigger !== lastRefreshTrigger) {
        console.log('🔄 Polling detected notification refresh');
        setLastRefreshTrigger(currentTrigger);
        fetchNotifications();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [lastRefreshTrigger, fetchNotifications]);

  const getNotificationColor = (type: string, read: boolean) => {
    if (read) return "text-gray-500";
    switch (type) {
      case "interest": return "text-red-500";
      case "message": return "text-blue-500";
      case "match": return "text-green-500";
      case "event": return "text-green-500";
      case "premium": return "text-purple-500";
      case "boost": return "text-orange-500";
      default: return "text-yellow-500";
    }
  };

  if (isLoading) return <NotificationsSkeleton onBack={onBack} />;

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100">
      <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="p-2 hover-scale">
              <ArrowLeft className="w-5 h-5 lg:w-6 lg:h-6" />
            </Button>
            <h1 className="text-lg sm:text-xl lg:text-2xl font-bold text-foreground">
              Notifications 
            </h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={refreshNotifications}
              className="text-primary hover:bg-primary/5"
            >
              🔄 Refresh
            </Button>
          </div>
        </div>
      </div>

      <div className="px-4 py-6 sm:px-6 lg:px-8 sm:max-w-3xl lg:max-w-4xl mx-auto">
        <div className="mb-6 sm:mb-8">
          <p className="text-gray-600 text-sm sm:text-base lg:text-lg">
            {fetchError ? fetchError : unreadCount > 0
              ? `You have ${unreadCount} unread notifications`
              : "You're all caught up!"}
          </p>
        </div>

        <div className="space-y-4">
          {fetchError && (
            <Card className="border-red-200">
              <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                <Bell size={40} className="mx-auto text-red-400 mb-4 sm:mb-6 lg:mb-8 lg:w-12 lg:h-12" />
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 mb-2">
                  Error Loading Notifications
                </h3>
                <p className="text-gray-500 text-sm sm:text-base lg:text-lg">{fetchError}</p>
                <Button onClick={refreshNotifications} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  Try Again
                </Button>
              </CardContent>
            </Card>
          )}
          {!fetchError && notifications.length === 0 && (
            <Card className="border-yellow-200">
              <CardContent className="p-6 sm:p-8 lg:p-10 text-center">
                <Bell size={40} className="mx-auto text-gray-400 mb-4 sm:mb-6 lg:mb-8 lg:w-12 lg:h-12" />
                <h3 className="text-base sm:text-lg lg:text-xl font-semibold text-gray-700 mb-2">
                  No notifications yet
                </h3>
                <p className="text-gray-500 text-sm sm:text-base lg:text-lg">
                  When you receive interests, messages, matches, or other updates, they'll appear here.
                </p>
                <Button onClick={refreshNotifications} className="mt-4 bg-primary text-primary-foreground hover:bg-primary/90">
                  Check for new notifications
                </Button>
              </CardContent>
            </Card>
          )}
          {notifications.map((notification, index) => {
            const IconComponent = iconMap[notification.type] || Bell;
            const isDeleting = deletingNotifications.has(notification._id);
            const isMarkingAsRead = markingAsReadNotifications.has(notification._id);
            
            const profileForButton = createProfileFromNotification(notification);
            
            return (
              <motion.div
                key={notification._id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className={`cursor-pointer hover:shadow-md transition-shadow ${
                    !notification.isRead ? "bg-yellow-50 border-yellow-200" : "bg-white"
                  }`}
                >
                  <CardContent className="p-4 sm:p-6 lg:p-8 flex items-start gap-3 sm:gap-4 lg:gap-6">
                    <div className={`p-2 rounded-full bg-white ${getNotificationColor(notification.type, notification.isRead)}`}>
                      <IconComponent size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4 lg:gap-6">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h4 className="text-sm sm:text-base lg:text-lg font-semibold text-gray-800 truncate">
                              {notification.toUserName || notification.title || "Notification"}
                            </h4>
                            {notification.user?.verified && (
                              <Badge variant="secondary" className="text-xs sm:text-sm lg:text-base">
                                <Star className="w-3 h-3 mr-1 sm:w-4 sm:h-4 lg:w-5 lg:h-5" /> Verified
                              </Badge>
                            )}
                            {!notification.isRead && (
                              <Badge className="bg-yellow-400 text-yellow-900 hover:bg-yellow-500 text-xs sm:text-sm lg:text-base">
                                New
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm sm:text-base lg:text-lg text-muted-foreground break-words">
                            {notification.message}
                          </p>
                          <span className="text-xs sm:text-sm lg:text-base text-muted-foreground block mt-1">
                            {notification.time}
                          </span>
                          {/* {notification.fromProfileId && (
                            <Button
                              variant="ghost"
                              className="w-full mt-2 text-yellow-600 hover:bg-yellow-50"
                              onClick={() => handleProfileClick(profileForButton)}
                            >
                              View Profile
                            </Button>
                          )} */}
                        </div>
                        {/* ACTION BUTTONS */}
                        <div className="flex sm:flex-col gap-2 shrink-0">
                          {/* MARK AS READ BUTTON - Only show for unread notifications */}
                          {!notification.isRead && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => markAsRead(notification)}
                              disabled={isMarkingAsRead}
                              className="text-green-500 hover:bg-green-50 p-2 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
                            >
                              {isMarkingAsRead ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-500"></div>
                              ) : (
                                <Check size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                              )}
                            </Button>
                          )}
                          {/* DELETE BUTTON */}
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => deleteNotification(notification)}
                            disabled={isDeleting}
                            className="text-red-500 hover:bg-red-50 p-2 w-10 h-10 sm:w-12 sm:h-12 lg:w-14 lg:h-14"
                          >
                            {isDeleting ? (
                              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-red-500"></div>
                            ) : (
                              <Trash2 size={18} className="sm:w-5 sm:h-5 lg:w-6 lg:h-6" />
                            )}
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}