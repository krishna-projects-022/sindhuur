import { useState, useEffect, useRef, useMemo } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Heart, Calendar, MessageCircle, MoreVertical, Users, MapPin, Clock, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "./ui/tabs";
import { useChat } from "./hooks/useChat";
import { useToast } from "./hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import axios from "axios";

interface MessagesScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

interface Event {
  _id: string;
  title: string;
  description: string;
  date: string;
  time: string;
  location: string;
  type: string;
  category: string;
  status: string;
  maxAttendees: number;
  currentAttendees: number;
  isOnline: boolean;
  organizer: string;
  registeredUsers: any[];
  image?: string;
  featured?: boolean;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";
axios.defaults.baseURL = BASE_URL;

export default function MessagesScreen({ onNavigate, onBack }: MessagesScreenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [chatList, setChatList] = useState([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [registeredEvents, setRegisteredEvents] = useState<string[]>([]);
  const [subscription, setSubscription] = useState("free");
  const [isLoadingEvents, setIsLoadingEvents] = useState(false);
  const [showScrollToTop, setShowScrollToTop] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedContactId, setSelectedContactId] = useState<string | null>(null);
  const [selectedContactName, setSelectedContactName] = useState<string>("");
  const [openSuccessDialog, setOpenSuccessDialog] = useState<string | null>(null);
  const [openCancelDialog, setOpenCancelDialog] = useState<string | null>(null);
  const chatListRef = useRef(null);

  const { messages, setReceiverId, onlineUsers, socket, unreadCount, clearUnreadCount } = useChat();
  const { toast } = useToast();

  const userProfile = localStorage.getItem("loggedInUser");
  const userData = useMemo(() => (userProfile ? JSON.parse(userProfile) : null), [userProfile]);
  const isLoggedIn = !!userData?.profileId;

  // Sort chat list by last message time (newest first)
  const sortedChatList = useMemo(() => {
    return [...chatList].sort((a, b) => {
      const dateA = a.lastMessageTime ? new Date(a.lastMessageTime) : null;
      const dateB = b.lastMessageTime ? new Date(b.lastMessageTime) : null;
      if (!dateA && !dateB) return 0;
      if (!dateA) return 1;
      if (!dateB) return -1;
      if (isNaN(dateA.getTime()) && isNaN(dateB.getTime())) return 0;
      if (isNaN(dateA.getTime())) return 1;
      if (isNaN(dateB.getTime())) return -1;
      return dateB.getTime() - dateA.getTime();
    });
  }, [chatList]);

  // Fetch subscription status
  const fetchSubscriptionStatus = async () => {
    try {
      const userProfile = localStorage.getItem("loggedInUser");
      const userProfileId = userProfile
        ? JSON.parse(userProfile).profileId
        : "anonymous";
      if (userProfileId === "anonymous") {
        setSubscription("free");
        return;
      }

      const response = await axios.get(`/api/user-profile?profileId=${userProfileId}`);
      const userSubscription =
        response.data.user.subscription?.current ||
        response.data.user.subscription ||
        "free";
      setSubscription(userSubscription);
    } catch (error) {
      console.error("Error fetching subscription status:", error.message);
      setSubscription("free");
    }
  };

  // Fetch events from API
  const fetchEvents = async () => {
    if (!isLoggedIn) return;

    setIsLoadingEvents(true);
    try {
      console.log("MessagesScreen - Fetching events...");
      
      const response = await axios.get("/api/events");
      const eventsData = response.data;
      console.log("MessagesScreen - Events fetched:", eventsData);
      
      setEvents(eventsData);

      // Set registered events
      if (userData?.profileId) {
        const registered = eventsData
          .filter(
            (event) =>
              Array.isArray(event.registeredUsers) &&
              event.registeredUsers.some((user) => user.profileId === userData.profileId)
          )
          .map((event) => event._id);
        setRegisteredEvents(registered);
      }
    } catch (error) {
      console.error("MessagesScreen - fetchEvents - Error:", error.message);
      toast({
        title: "Error",
        description: "Failed to fetch events. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoadingEvents(false);
    }
  };

  // Handle event registration toggle
  const handleToggleRegistration = async (eventId: string) => {
    if (subscription !== "premium plus") {
      toast({
        title: "Access Restricted",
        description: "Events are exclusive to Premium Plus users. Please upgrade your subscription.",
        variant: "destructive",
      });
      return;
    }

    try {
      const userProfile = localStorage.getItem("loggedInUser");
      const userId = userProfile ? JSON.parse(userProfile).profileId : null;

      if (!userId) {
        toast({
          title: "Error",
          description: "You must be logged in to register for events.",
          variant: "destructive",
        });
        return;
      }

      const response = await axios.post(`/api/events/${eventId}/register`, {
        userId,
      });
      const updatedEvent = response.data;

      if (updatedEvent.isRegistered) {
        setRegisteredEvents((prev) => [...new Set([...prev, eventId])]);
        setOpenSuccessDialog(eventId);
        toast({
          title: "Registration Successful!",
          description: "You have successfully registered for this event.",
        });
      } else {
        setRegisteredEvents((prev) => prev.filter((id) => id !== eventId));
        setOpenCancelDialog(eventId);
        toast({
          title: "Registration Cancelled",
          description: "You have successfully cancelled your registration.",
        });
      }

      // Update the local events state
      setEvents((prevEvents) =>
        prevEvents.map((e) =>
          e._id === eventId ? { ...e, ...updatedEvent } : e
        )
      );
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          "Failed to register or unregister for the event.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!isLoggedIn || !userData?.profileId) {
      console.warn("MessagesScreen - User not logged in or missing profileId");
      setError("Please log in to view messages.");
      setIsLoading(false);
      return;
    }

    const fetchChatList = async () => {
      try {
        console.log("MessagesScreen - fetchChatList - Fetching for profileId:", userData.profileId);
        const response = await fetch(`${BASE_URL}/api/chat-contacts?profileId=${userData.profileId}`);
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || `HTTP ${response.status}: Failed to fetch chat list`);
        }
        const data = await response.json();
        console.log("MessagesScreen - fetchChatList - Response:", data);

        // Fetch main photo for each contact
        const processedContacts = await Promise.all(
          (data.contacts || []).map(async (contact) => {
            let mainPhotoUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(contact.name || "User")}&background=random`;
            try {
              const photoResponse = await fetch(`${BASE_URL}/api/photos/${contact.id}`);
              if (photoResponse.ok) {
                const photoData = await photoResponse.json();
                const mainPhoto = photoData.photos.find((photo) => photo.isMain);
                if (mainPhoto) {
                  mainPhotoUrl = mainPhoto.url;
                }
              }
            } catch (photoError) {
              console.warn(`MessagesScreen - Failed to fetch photo for user ${contact.id}:`, photoError.message);
            }
            return {
              ...contact,
              image: mainPhotoUrl,
              lastMessageTime: contact.lastMessageTime || "",
              online: onlineUsers.includes(contact.id),
            };
          })
        );

        setChatList(processedContacts);
        setError(null);
      } catch (error) {
        console.error("MessagesScreen - fetchChatList - Error:", error.message);
        setError("Failed to fetch chat contacts");
        toast({
          title: "Error",
          description: "Failed to fetch chat contacts. Please try again.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSubscriptionStatus();
    fetchChatList();
    fetchEvents();
  }, [isLoggedIn, userData?.profileId, toast, onlineUsers]);

  useEffect(() => {
    if (!socket) {
      console.warn("MessagesScreen - Socket not initialized, skipping socket events");
      return;
    }

    socket.on("onlineUsers", (users) => {
      console.log("MessagesScreen - Online users updated:", users);
      setChatList((prev) =>
        prev.map((contact) => ({
          ...contact,
          online: users.includes(contact.id),
        }))
      );
    });

    socket.on("receiveMessage", (message) => {
      console.log("MessagesScreen - Received message:", message);
      setChatList((prev) => {
        const contactIndex = prev.findIndex(
          (c) => c.id === message.senderId || c.id === message.receiverId
        );
        if (contactIndex === -1) return prev;

        const updatedChatList = [...prev];
        updatedChatList[contactIndex] = {
          ...updatedChatList[contactIndex],
          lastMessage: message.text,
          lastMessageTime: message.time,
        };

        const updatedContact = updatedChatList.splice(contactIndex, 1)[0];
        updatedChatList.unshift(updatedContact);

        return updatedChatList;
      });
    });

    return () => {
      if (socket) {
        socket.off("onlineUsers");
        socket.off("receiveMessage");
      }
    };
  }, [socket, userData?.profileId]);

  const handleScroll = () => {
    if (chatListRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = chatListRef.current;
      setShowScrollToTop(scrollTop > 100);
      setShowScrollToBottom(scrollTop + clientHeight < scrollHeight - 100);
    }
  };

  const scrollToTop = () => {
    chatListRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const scrollToBottom = () => {
    chatListRef.current?.scrollTo({ top: chatListRef.current.scrollHeight, behavior: "smooth" });
  };

  const openDeleteModal = (contactId: string, contactName: string) => {
    setSelectedContactId(contactId);
    setSelectedContactName(contactName);
    setDeleteModalOpen(true);
  };

  const deleteChat = async () => {
    if (!selectedContactId) return;
    try {
      const response = await fetch(`${BASE_URL}/api/chat-contacts/${selectedContactId}?profileId=${userData.profileId}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to delete chat");
      }
      setChatList((prev) => prev.filter((contact) => contact.id !== selectedContactId));
      setDeleteModalOpen(false);
      setSelectedContactId(null);
      setSelectedContactName("");
      toast({
        title: "Success",
        description: "Chat deleted successfully",
      });
    } catch (error) {
      console.error("MessagesScreen - deleteChat - Error:", error.message);
      toast({
        title: "Error",
        description: "Failed to delete chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleChatClick = (chat) => {
    const chatUser = {
      id: chat.id,
      name: chat.name,
      image: chat.image,
      online: chat.online || false,
    };
    console.log("MessagesScreen - handleChatClick - Navigating to chat with:", chatUser);
    if (!chatUser.id) {
      console.error("MessagesScreen - handleChatClick - Missing chatUser.id");
      toast({
        title: "Error",
        description: "Cannot open chat: No user selected",
        variant: "destructive",
      });
      return;
    }
    setReceiverId(chatUser.id);
    if (chat.unreadCount > 0) {
      clearUnreadCount(chatUser.id);
    }
    onNavigate("chat", chatUser);
  };

  const handleEventClick = (event: Event) => {
    console.log("MessagesScreen - handleEventClick - Navigating to event:", event);
    onNavigate("event-details", { event });
  };

  const filteredChatList = sortedChatList.filter((chat) =>
    chat.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Format time for display
  const formatTime = (timestamp) => {
    if (!timestamp) {
      return "No messages";
    }

    const date = new Date(timestamp);
    if (isNaN(date.getTime())) {
      return "No messages";
    }

    const now = new Date();
    const diffInMinutes = (now - date) / (1000 * 60);
    const diffInHours = diffInMinutes / 60;
    const diffInDays = diffInHours / 24;

    if (diffInMinutes < 1) {
      return "Just now";
    } else if (diffInHours < 1) {
      return `${Math.floor(diffInMinutes)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else if (diffInDays < 7) {
      return `${Math.floor(diffInDays)}d ago`;
    } else {
      return date.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: diffInDays >= 365 ? "numeric" : undefined,
      });
    }
  };

  // Format event date for display
  const formatEventDate = (dateString: string) => {
    if (!dateString) return "Date TBD";
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Date TBD";
    }
    
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      month: 'short', 
      day: 'numeric'
    });
  };

  // Get category color (matching your Events component)
  const getCategoryColor = (category) => {
    switch (category) {
      case "social":
        return "bg-blue-100 text-blue-800";
      case "cultural":
        return "bg-purple-100 text-purple-800";
      case "dating":
        return "bg-pink-100 text-pink-800";
      case "lifestyle":
        return "bg-green-100 text-green-800";
      case "adventure":
        return "bg-orange-100 text-orange-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Get default event image based on category
  const getEventImage = (event: Event) => {
    if (event.image) return event.image;
    
    const categoryImages = {
      'social': 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300',
      'cultural': 'https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300',
      'dating': 'https://images.unsplash.com/photo-1519125323398-675f0ddb6308?w=300',
      'lifestyle': 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=300',
      'adventure': 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=300'
    };
    
    return categoryImages[event.category] || 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300';
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Button variant="ghost" onClick={onBack} className="mb-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className="flex items-center justify-between mb-6">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold">Messages</h1>
          <div className="w-10"></div>
        </div>

        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        <Tabs defaultValue="messages" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="messages">
              Messages {unreadCount > 0 && <Badge className="ml-2">{unreadCount}</Badge>}
            </TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
          </TabsList>

          <TabsContent value="messages" className="space-y-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="space-y-4 max-h-[60vh] overflow-y-auto"
              ref={chatListRef}
              onScroll={handleScroll}
            >
              {filteredChatList.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No conversations yet</p>
              ) : (
                filteredChatList.map((chat, index) => (
                  <motion.div
                    key={chat.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <Card
                      className="cursor-pointer hover-scale tap-scale"
                      onClick={() => handleChatClick(chat)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center space-x-4">
                          <div className="relative w-12 h-12">
                            <div className="w-12 h-12 rounded-full overflow-hidden">
                              <ImageWithFallback
                                src={chat.image}
                                alt={chat.name}
                                className="w-full h-full object-cover"
                                fallbacksrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(chat.name || "User")}&background=random`}
                              />
                            </div>
                            {chat.online && (
                              <span className="absolute bottom-[-2px] right-[-2px] w-3 h-3 bg-green-500 rounded-full border-2 border-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                              <h4 className="text-base font-medium truncate">{chat.name}</h4>
                              <div className="flex items-center space-x-2">
                                <span className="text-xs text-muted-foreground whitespace-nowrap">
                                  {formatTime(chat.lastMessageTime)}
                                </span>
                                <DropdownMenu>
                                  <DropdownMenuTrigger asChild>
                                    <Button variant="ghost" size="icon" className="h-6 w-6">
                                      <MoreVertical className="w-4 h-4" />
                                    </Button>
                                  </DropdownMenuTrigger>
                                  <DropdownMenuContent align="end">
                                    <DropdownMenuItem
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        openDeleteModal(chat.id, chat.name);
                                      }}
                                      className="text-destructive"
                                    >
                                      Delete Chat
                                    </DropdownMenuItem>
                                  </DropdownMenuContent>
                                </DropdownMenu>
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">
                              {chat.lastMessage || "No messages yet"}
                            </p>
                            <div className="flex items-center justify-end mt-1">
                              {chat.unreadCount > 0 && (
                                <Badge className="bg-primary text-white text-xs">
                                  {chat.unreadCount}
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))
              )}
              {showScrollToTop && (
                <Button
                  variant="outline"
                  size="icon"
                  className="fixed bottom-20 right-4 z-10"
                  onClick={scrollToTop}
                >
                  ↑
                </Button>
              )}
              {showScrollToBottom && (
                <Button
                  variant="outline"
                  size="icon"
                  className="fixed bottom-12 right-4 z-10"
                  onClick={scrollToBottom}
                >
                  ↓
                </Button>
              )}
            </motion.div>
          </TabsContent>

          <TabsContent value="events" className="space-y-4">
            {subscription !== "premium plus" ? (
              <div className="text-center py-8 bg-white rounded-lg border border-yellow-200">
                <Star className="w-12 h-12 text-yellow-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-800 mb-2">Premium Plus Feature</h3>
                <p className="text-gray-600 mb-4">
                  Access to exclusive events is only available for Premium Plus members.
                </p>
                <Button
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white"
                  onClick={() => navigate("/premium")}
                >
                  Upgrade to Premium Plus
                </Button>
              </div>
            ) : (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="space-y-6"
              >
                {/* Featured Events Section */}
                {events.filter(event => event.featured).length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-4 flex items-center">
                      <Star className="w-5 h-5 text-yellow-500 mr-2" />
                      Featured Events
                    </h3>
                    <div className="grid gap-4">
                      {events
                        .filter((event) => event.featured)
                        .map((event) => (
                          <Card key={event._id} className="overflow-hidden border-yellow-200 shadow-lg">
                            <div className="flex">
                              <div className="w-24 h-24 flex-shrink-0">
                                <ImageWithFallback
                                  src={getEventImage(event)}
                                  alt={event.title}
                                  className="w-full h-full object-cover"
                                  fallbacksrc="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300"
                                />
                              </div>
                              <div className="flex-1 p-4">
                                <div className="flex items-start justify-between mb-2">
                                  <h4 className="text-lg font-semibold truncate flex-1 mr-2">
                                    {event.title}
                                  </h4>
                                  <div className="flex items-center space-x-2">
                                    <Badge className="bg-yellow-500 text-white text-xs">
                                      Featured
                                    </Badge>
                                    <Badge className={`${getCategoryColor(event.category)} text-xs capitalize`}>
                                      {event.category}
                                    </Badge>
                                  </div>
                                </div>
                                <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                                  {event.description}
                                </p>
                                <div className="space-y-1 text-sm text-gray-500 mb-4">
                                  <div className="flex items-center">
                                    <Calendar className="w-4 h-4 mr-2" />
                                    {formatEventDate(event.date)} • {event.time}
                                  </div>
                                  <div className="flex items-center">
                                    <MapPin className="w-4 h-4 mr-2" />
                                    {event.location} {event.isOnline && "(Online)"}
                                  </div>
                                  <div className="flex items-center">
                                    <Users className="w-4 h-4 mr-2" />
                                    <Badge variant="secondary" className="font-bold">
                                      {event.currentAttendees}/{event.maxAttendees} registered
                                    </Badge>
                                  </div>
                                </div>
                                <Button
                                  onClick={() => handleToggleRegistration(event._id)}
                                  className={`w-full text-sm ${
                                    registeredEvents.includes(event._id)
                                      ? "bg-red-500 hover:bg-red-600"
                                      : "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                                  } text-white`}
                                >
                                  {registeredEvents.includes(event._id) ? "Cancel Registration" : "Register Now"}
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                    </div>
                  </div>
                )}

                {/* All Events Section */}
                <div>
                  <h3 className="text-xl font-semibold text-gray-800 mb-4">All Events</h3>
                  <div className="grid gap-4">
                    {events.length === 0 ? (
                      <div className="text-center py-8">
                        <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No events available at the moment.</p>
                      </div>
                    ) : (
                      events.map((event) => (
                        <Card key={event._id} className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow">
                          <div className="flex">
                            <div className="w-20 h-20 flex-shrink-0">
                              <ImageWithFallback
                                src={getEventImage(event)}
                                alt={event.title}
                                className="w-full h-full object-cover"
                                fallbacksrc="https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=300"
                              />
                            </div>
                            <div className="flex-1 p-3">
                              <div className="flex items-start justify-between mb-1">
                                <h4 className="text-base font-medium truncate flex-1 mr-2">
                                  {event.title}
                                </h4>
                                <div className="flex items-center space-x-1">
                                  {event.featured && (
                                    <Star className="w-3 h-3 text-yellow-500" />
                                  )}
                                  <Badge className={`${getCategoryColor(event.category)} text-xs capitalize`}>
                                    {event.category}
                                  </Badge>
                                </div>
                              </div>
                              <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                                {event.description}
                              </p>
                              <div className="space-y-1 text-xs text-gray-500 mb-3">
                                <div className="flex items-center">
                                  <Calendar className="w-3 h-3 mr-1" />
                                  {formatEventDate(event.date)}
                                </div>
                                <div className="flex items-center">
                                  <Clock className="w-3 h-3 mr-1" />
                                  {event.time}
                                </div>
                                <div className="flex items-center">
                                  <Users className="w-3 h-3 mr-1" />
                                  <span className="font-medium">
                                    {event.currentAttendees}/{event.maxAttendees}
                                  </span>
                                </div>
                              </div>
                              <Button
                                onClick={() => handleToggleRegistration(event._id)}
                                className={`w-full text-xs ${
                                  registeredEvents.includes(event._id)
                                    ? "bg-red-500 hover:bg-red-600"
                                    : "bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                                } text-white`}
                              >
                                {registeredEvents.includes(event._id) ? "Cancel" : "Register"}
                              </Button>
                            </div>
                          </div>
                        </Card>
                      ))
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Success Dialog */}
            <Dialog open={!!openSuccessDialog} onOpenChange={() => setOpenSuccessDialog(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle className="text-green-600">Registration Confirmed!</DialogTitle>
                </DialogHeader>
                <p>You have successfully registered for this event.</p>
                <Button 
                  onClick={() => setOpenSuccessDialog(null)}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                >
                  Close
                </Button>
              </DialogContent>
            </Dialog>

            {/* Cancel Dialog */}
            <Dialog open={!!openCancelDialog} onOpenChange={() => setOpenCancelDialog(null)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Registration Cancelled</DialogTitle>
                </DialogHeader>
                <p>You have successfully unregistered from this event.</p>
                <Button 
                  onClick={() => setOpenCancelDialog(null)}
                  className="bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                >
                  Close
                </Button>
              </DialogContent>
            </Dialog>
          </TabsContent>
        </Tabs>

        <Dialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Chat</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete your chat with {selectedContactName}? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setDeleteModalOpen(false);
                  setSelectedContactId(null);
                  setSelectedContactName("");
                }}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={deleteChat}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}