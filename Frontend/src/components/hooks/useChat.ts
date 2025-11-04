import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import io from "socket.io-client";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Message {
  id?: string;
  tempId?: string;
  text: string;
  senderId: string;
  receiverId: string;
  time: string;
  edited?: boolean;
}

export const useChat = (initialReceiverId?: string) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [receiverId, setReceiverId] = useState<string | null>(initialReceiverId || null);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [socket, setSocket] = useState<any>(null);
  const [subscription, setSubscription] = useState<string>("free");
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);

  const userProfile = localStorage.getItem("loggedInUser");
  const userData = useMemo(() => (userProfile ? JSON.parse(userProfile) : null), [userProfile]);

  // Track processed message IDs to prevent duplicates
  const processedMessageIds = useRef<Set<string>>(new Set());

  useEffect(() => {
    if (!userData?.profileId) {
      console.warn("useChat - No profileId in localStorage, skipping socket");
      setConnectionError("User not logged in");
      return;
    }

    setSubscription(userData?.subscription?.current || "free");

    const newSocket = io(BASE_URL, {
      auth: { profileId: userData.profileId },
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });
    setSocket(newSocket);

    newSocket.on("connect", () => {
      console.log("useChat - Socket connected:", newSocket.id);
      setConnectionError(null);
      // Clear processed IDs on new connection
      processedMessageIds.current.clear();
    });

    newSocket.on("connect_error", (error) => {
      console.error("useChat - Socket connection error:", error.message);
      setConnectionError("Failed to connect to chat server");
    });

    newSocket.on("disconnect", (reason) => {
      console.log("useChat - Socket disconnected:", reason);
      setConnectionError("Disconnected from chat server");
    });

    newSocket.on("onlineUsers", (users: string[]) => {
      console.log("useChat - Online users:", users);
      setOnlineUsers(users);
    });

    // Handle incoming messages - listen for multiple possible event names
    const handleIncomingMessage = (message: Message) => {
  console.log("useChat - Received message:", message);
  
  // Prevent duplicate messages using both ID and tempId
  const messageId = message.id || message.tempId;
  if (!messageId || processedMessageIds.current.has(messageId)) {
    console.log("useChat - Skipping duplicate message:", messageId);
    return;
  }
  
  processedMessageIds.current.add(messageId);
  
  setMessages((prev) => {
    // Replace temp message with real message OR add new message
    if (message.tempId) {
      // This is the server response for our optimistic update
      // Replace the temp message with the real one
      const filtered = prev.filter(msg => msg.tempId !== message.tempId);
      return [...filtered, message];
    } else {
      // This is a new message from another user
      const isDuplicate = prev.some(
        (msg) => msg.id === message.id
      );
      
      if (isDuplicate) {
        console.log("useChat - Duplicate found in state, skipping");
        return prev;
      }
      
      return [...prev, message];
    }
  });
  
  if (message.receiverId === userData.profileId && window.location.pathname !== "/chat") {
    setUnreadCount((prev) => prev + 1);
  }
};

    // Listen for multiple possible event names
    newSocket.on("receiveMessage", handleIncomingMessage);
    newSocket.on("newMessage", handleIncomingMessage);
    newSocket.on("message", handleIncomingMessage);

    newSocket.on("messageEdited", (data: { messageId: string; newText: string } | Message) => {
      console.log("useChat - Message edited:", data);
      
      // Handle both data formats
      if ('messageId' in data) {
        // Format: { messageId: string, newText: string }
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.messageId ? { ...msg, text: data.newText, edited: true } : msg
          )
        );
      } else {
        // Format: Message object
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === data.id ? { ...msg, text: data.text, edited: true } : msg
          )
        );
      }
    });

    newSocket.on("messageDeleted", (data: { messageId: string } | string) => {
      console.log("useChat - Message deleted:", data);
      
      // Handle both data formats
      const messageId = typeof data === 'string' ? data : data.messageId;
      
      setMessages((prev) => prev.filter((msg) => msg.id !== messageId));
      // Remove from processed IDs when deleted
      processedMessageIds.current.delete(messageId);
    });

    // Error handling for socket events
    newSocket.on("error", (error: any) => {
      console.error("useChat - Socket error:", error);
      setConnectionError(error.message || "Chat error occurred");
    });

    return () => {
      newSocket.off("receiveMessage");
      newSocket.off("newMessage");
      newSocket.off("message");
      newSocket.off("messageEdited");
      newSocket.off("messageDeleted");
      newSocket.off("error");
      newSocket.disconnect();
      setSocket(null);
      processedMessageIds.current.clear();
    };
  }, [userData?.profileId]);

  useEffect(() => {
    if (!receiverId || !userData?.profileId) return;

    const fetchMessages = async () => {
      setIsLoadingMessages(true);
      try {
        const response = await fetch(
          `${BASE_URL}/api/messages?userId=${userData.profileId}&receiverId=${receiverId}`,
          {
            headers: {
              Authorization: `Bearer ${userData.token}`,
              "Content-Type": "application/json",
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: Failed to fetch messages`);
        }
        const data = await response.json();
        console.log("useChat - Fetched messages:", data.messages);
        
        // Clear processed IDs when fetching new conversation
        processedMessageIds.current.clear();
        
        // Add fetched messages to processed IDs
        if (data.messages) {
          data.messages.forEach((msg: Message) => {
            if (msg.id) processedMessageIds.current.add(msg.id);
            if (msg.tempId) processedMessageIds.current.add(msg.tempId);
          });
        }
        
        setMessages(data.messages || []);
      } catch (error) {
        console.error("useChat - Error fetching messages:", error);
        setConnectionError("Failed to fetch messages");
      } finally {
        setIsLoadingMessages(false);
      }
    };

    fetchMessages();
  }, [receiverId, userData?.profileId, userData?.token]);

const sendMessage = useCallback((message: Message) => {
  if (!socket || !message.receiverId) {
    console.warn("useChat - Cannot send message: socket or receiverId missing");
    return;
  }
  
  const messageWithTempId = { 
    ...message, 
    tempId: `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
  };
  
  console.log("useChat - Sending message:", messageWithTempId);
  
  // Add to processed IDs immediately to prevent duplicates
  processedMessageIds.current.add(messageWithTempId.tempId);
  
  // Add optimistic update FIRST
  setMessages((prev) => {
    // Double-check for duplicates before adding
    const isDuplicate = prev.some(
      (msg) => msg.tempId === messageWithTempId.tempId
    );
    
    if (isDuplicate) {
      console.log("useChat - Duplicate temp message detected, skipping");
      return prev;
    }
    
    return [...prev, messageWithTempId];
  });
  
  // Then emit to socket
  socket.emit("sendMessage", messageWithTempId);
}, [socket]);

  const clearUnreadCount = useCallback(() => setUnreadCount(0), []);

  console.log("useChat - State:", {
    messagesCount: messages.length,
    receiverId,
    socketConnected: !!socket?.connected,
    onlineUsersCount: onlineUsers.length,
    connectionError,
    subscription,
    unreadCount,
    isLoadingMessages,
  });

  return {
    messages,
    setReceiverId,
    onlineUsers,
    unreadCount,
    clearUnreadCount,
    sendMessage,
    connectionError,
    socket,
    subscription,
    isLoadingMessages,
  };
};