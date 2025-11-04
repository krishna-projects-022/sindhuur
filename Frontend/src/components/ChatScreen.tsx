import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Send, Phone, Video, MoreVertical, Edit, Trash } from "lucide-react";
import { useChat } from "./hooks/useChat";
import { useToast } from "./hooks/use-toast";
import { ImageWithFallback } from "./figma/ImageWithFallback";

interface ChatScreenProps {
  chatUser: {
    id: string;
    name?: string;
    avatar?: string;
    online?: boolean;
  } | null;
  onBack: () => void;
  onVideoCall: () => void;
  onNavigate: (screen: string, data?: any) => void;
}

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

export default function ChatScreen({ chatUser, onBack, onVideoCall, onNavigate }: ChatScreenProps) {
  const navigate = useNavigate();
  const [newMessage, setNewMessage] = useState("");
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editText, setEditText] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);

  const { messages, sendMessage, setReceiverId, onlineUsers, connectionError, socket, isLoadingMessages } = useChat(
    chatUser?.id || undefined
  );
  const { toast } = useToast();

  const userProfile = localStorage.getItem("loggedInUser");
  const userData = userProfile ? JSON.parse(userProfile) : null;
  const isLoggedIn = !!userData?.profileId;

  const setupCompletedRef = useRef(false);

  useEffect(() => {
    setupCompletedRef.current = false;

    if (!isLoggedIn || !userData?.profileId) {
      setError("Please log in to use chat.");
      setIsLoading(false);
      onBack();
      return;
    }

    if (!chatUser || !chatUser.id) {
      setError("No valid user selected for chat.");
      setIsLoading(false);
      onBack();
      return;
    }

    if (!setupCompletedRef.current) {
      setReceiverId(chatUser.id);
      setupCompletedRef.current = true;
      setIsLoading(false);
    }

    return () => {
      setReceiverId(null);
    };
  }, [isLoggedIn, userData, chatUser, setReceiverId, onBack]);

  useEffect(() => {
    if (!messagesContainerRef.current || isLoadingMessages) return;

    const scrollToBottom = () => {
      const container = messagesContainerRef.current;
      if (!container) return;
      
      console.log("Scroll debug:", {
        scrollHeight: container.scrollHeight,
        clientHeight: container.clientHeight,
        scrollTop: container.scrollTop,
        shouldScroll: container.scrollHeight > container.clientHeight
      });

      container.scrollTop = container.scrollHeight;
      
      setTimeout(() => {
        if (container.scrollTop + container.clientHeight < container.scrollHeight - 10) {
          container.scrollTop = container.scrollHeight;
          console.log("Retried scrolling to bottom");
        }
      }, 150);
    };

    const timeoutId = setTimeout(scrollToBottom, 200);
    return () => clearTimeout(timeoutId);
  }, [messages, isLoadingMessages]);

//  useEffect(() => {
//   if (!socket) return;

//   socket.on("messageDeleted", ({ messageId, userId }) => {
//     console.log("messageDeleted event received:", { messageId, userId });
    
//     // Instead of manually fetching, we should rely on useChat's internal state
//     // The hook should handle updating the messages when it receives socket events
//     console.log("Message deleted, expecting useChat to update messages automatically");
//   });

//   // Also add event listeners for other real-time events
//   socket.on("messageEdited", ({ messageId, newText }) => {
//     console.log("messageEdited event received:", { messageId, newText });
//   });

//   socket.on("newMessage", (message) => {
//     console.log("newMessage event received:", message);
//   });

//   return () => {
//     socket.off("messageDeleted");
//     socket.off("messageEdited");
//     socket.off("newMessage");
//   };
// }, [socket, userData?.profileId, chatUser?.id, toast]);

  useEffect(() => {
    if (messagesContainerRef.current) {
      const container = messagesContainerRef.current;
      const styles = window.getComputedStyle(container);
      
      console.log("Container styles:", {
        height: styles.height,
        maxHeight: styles.maxHeight,
        display: styles.display,
        flex: styles.flex,
        overflowY: styles.overflowY,
        actualHeight: container.clientHeight,
        contentHeight: container.scrollHeight,
        parentHeight: container.parentElement?.clientHeight,
        viewportHeight: window.innerHeight
      });
    }
  }, [messages, isLoadingMessages]);

  const handleSendMessage = () => {
    if (!newMessage.trim() || isSending || !chatUser?.id) return;
    
    setIsSending(true);
    const message = {
      text: newMessage,
      senderId: userData?.profileId,
      receiverId: chatUser.id,
      time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      tempId: Date.now().toString(),
    };
    
    sendMessage(message);
    setNewMessage("");
    setIsSending(false);
  };

  const toggleMenu = (messageId: string) => {
    setActiveMenuId(activeMenuId === messageId ? null : messageId);
  };

  const startEdit = (message: any) => {
    setEditingMessageId(message.id || message.tempId);
    setEditText(message.text);
    setActiveMenuId(null);
  };

  const saveEdit = (messageId: string) => {
    if (!socket || !editText.trim()) return;
    socket.emit("editMessage", { messageId, newText: editText });
    setEditingMessageId(null);
    setEditText("");
  };

  const deleteMessage = (messageId: string) => {
    if (!socket || !userData?.profileId) return;
    socket.emit("deleteMessage", { messageId, userId: userData.profileId });
    setActiveMenuId(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-white" data-testid="loading-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-green-600"></div>
      </div>
    );
  }

  if (error || !chatUser?.id) {
    return (
      <div className="min-h-screen bg-white p-6" data-testid="error-screen">
        <button
          onClick={onBack}
          className="text-green-600 hover:bg-green-100 p-3 rounded-full mb-4 flex items-center"
          data-testid="back-button"
        >
          <ArrowLeft className="w-6 h-6 mr-2" />
          Back
        </button>
        <p className="text-red-500 text-center text-lg">{error || "No user selected"}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-gray-100 relative" data-testid="chat-screen">
      <div
        ref={headerRef}
        className="bg-green-600 text-white p-3 flex items-center justify-between fixed top-0 left-0 right-0 z-50 shadow-lg"
        style={{ height: "64px", backgroundColor: "#888888" }}
        data-testid="chat-header"
      >
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="text-white hover:bg-green-700 p-2 rounded-full transition-colors"
            data-testid="back-button"
          >
            <ArrowLeft className="w-6 h-6" />
          </button>
          <div className="w-10 h-10 rounded-full border-2 border-white overflow-hidden">
            <ImageWithFallback
              src={chatUser.image || chatUser.avatar || chatUser.profilePicture || "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg"}
              alt={chatUser.name || "User"}
              className="w-full h-full object-cover"
              fallbackSrc={`https://ui-avatars.com/api/?name=${encodeURIComponent(chatUser.name || "User")}&background=random`}
            />
          </div>
          <div>
            <h2 className="text-lg font-semibold">{chatUser.name || "Unknown"}</h2>
            {onlineUsers.includes(chatUser.id) && (
              <span className="text-sm text-green-100">Online</span>
            )}
          </div>
        </div>
        <div className="flex space-x-2">
          {/* <button
            onClick={onVideoCall}
            className="text-white hover:bg-green-700 p-2 rounded-full"
            data-testid="video-call-button"
          >
            <Video className="w-6 h-6" />
          </button>
          <button
            className="text-white hover:bg-green-700 p-2 rounded-full"
            data-testid="phone-call-button"
          >
            <Phone className="w-6 h-6" />
          </button> */}
        </div>
      </div>

      <div 
        className="absolute top-16 bottom-20 left-0 right-0 min-h-0"
        style={{ 
          height: "calc(77vh)",marginTop:"10vh"
        }}
      >
        <div
          className="h-full overflow-y-auto px-4 sm:px-6 bg-gray-100"
          ref={messagesContainerRef}
          data-testid="messages-container"
        >
          {connectionError && (
            <p className="text-red-500 text-center p-4 bg-red-50 rounded-lg shadow mb-4" data-testid="connection-error">
              {connectionError}
            </p>
          )}
          {messages.length === 0 && !isLoadingMessages && (
            <p className="text-gray-500 text-center py-4" data-testid="no-messages">
              No messages yet. Start the conversation!
            </p>
          )}
          <div className="py-2 space-y-2">
            {messages.map((message, index) => {
              const isSentByMe = message.senderId === userData?.profileId;
              return (
                <motion.div
                  key={message.id || message.tempId || `msg-${index}`}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className={`flex ${isSentByMe ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`relative max-w-[70%] p-3 rounded-xl ${
                      isSentByMe
                        ? "bg-green-500 text-white"
                        : "bg-white text-gray-800 border border-gray-200"
                    }`}
                    data-testid={`message-${isSentByMe ? "sent" : "received"}`}
                  >
                    <div
                      className={`absolute bottom-0 ${
                        isSentByMe ? "right-[-6px]" : "left-[-6px]"
                      } w-0 h-0 border-t-[6px] border-t-transparent ${
                        isSentByMe
                          ? "border-l-[6px] border-l-green-500"
                          : "border-r-[6px] border-r-white"
                      } border-b-[6px] border-b-transparent`}
                    />
                    <div className="flex flex-col">
                      <p className="text-sm leading-relaxed">{message.text}</p>
                      <div className="flex items-center justify-end mt-1 space-x-1">
                        <span className="text-xs opacity-80">{isSentByMe ? "" : ""}  {message.time}</span>
                        {message.edited && (
                          <span className="text-xs opacity-80">(Edited)</span>
                        )}
                      </div>
                    </div>
                    {isSentByMe && (
                      <div className="absolute right-1 top-1">
                        <button
                          className="cursor-pointer w-5 h-5 text-white/70 hover:text-white"
                          onClick={() => toggleMenu(message.id || message.tempId)}
                          data-testid="message-menu-button"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                        {activeMenuId === (message.id || message.tempId) && (
                          <div className="absolute right-0 mt-1 w-32 bg-white border border-gray-200 rounded-lg shadow-lg z-10" data-testid="message-menu">
                            <button
                              className="block px-3 py-1.5 text-sm text-gray-700 hover:bg-gray-50 w-full text-left flex items-center"
                              onClick={() => startEdit(message)}
                              data-testid="edit-message-button"
                            >
                              <Edit className="w-3 h-3 mr-2" /> Edit
                            </button>
                            <button
                              className="block px-3 py-1.5 text-sm text-red-500 hover:bg-gray-50 w-full text-left flex items-center"
                              onClick={() => deleteMessage(message.id || message.tempId)}
                              data-testid="delete-message-button"
                            >
                              <Trash className="w-3 h-3 mr-2" /> Delete
                            </button>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </div>
          <div ref={messagesEndRef} data-testid="messages-end" />
        </div>
      </div>

      <div
        className="fixed bottom-0 left-0 right-0 bg-white p-3 border-t border-gray-200 shadow-lg z-50"
        style={{ height: "80px" }}
        data-testid="message-bar"
      >
        <div className="max-w-4xl mx-auto flex items-center space-x-2">
          {editingMessageId ? (
            <>
              <input
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && saveEdit(editingMessageId)}
                className="flex-1 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 py-2 px-4 text-sm bg-white outline-none"
                placeholder="Edit message..."
                autoFocus
                data-testid="edit-message-input"
              />
              <button
                onClick={() => saveEdit(editingMessageId)}
                disabled={!editText.trim()}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full px-4 py-2 text-sm font-medium"
                data-testid="save-edit-button"
              >
                Save
              </button>
              <button
                onClick={() => {
                  setEditingMessageId(null);
                  setEditText("");
                }}
                className="border border-gray-300 text-gray-700 hover:bg-gray-100 rounded-full px-4 py-2 text-sm"
                data-testid="cancel-edit-button"
              >
                Cancel
              </button>
            </>
          ) : (
            <>
              <input
                placeholder="Type a message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                className="flex-1 rounded-full border border-gray-300 focus:ring-2 focus:ring-green-500 py-2 px-4 text-sm bg-white outline-none"
                autoFocus
                data-testid="message-input"
              />
              <button
                onClick={handleSendMessage}
                className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-full p-2"
                disabled={!!connectionError || !newMessage.trim()}
                data-testid="send-button"
              >
                <Send className="h-5 w-5" />
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}