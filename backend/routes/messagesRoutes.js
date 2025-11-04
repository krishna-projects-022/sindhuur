const express = require("express");
const router = express.Router();
const User = require("../modals/userSchema");
const Message = require("../modals/messageSchema");

// GET /api/messages - Fetch messages for a user and receiver
router.get("/messages", async (req, res) => {
  try {
    const { userId, receiverId } = req.query;
    if (!userId || !receiverId) {
      return res.status(400).json({ error: "userId and receiverId are required" });
    }

    // Use aggregation to group by content and get unique messages
    const messages = await Message.aggregate([
      {
        $match: {
          $or: [
            { senderId: userId, receiverId },
            { senderId: receiverId, receiverId: userId },
          ],
          deletedBy: { $ne: userId }
        }
      },
      {
        $group: {
          _id: {
            text: "$text",
            senderId: "$senderId",
            receiverId: "$receiverId",
            // Group by minute precision to catch duplicates
            timeWindow: {
              $dateToString: { 
                format: "%Y-%m-%dT%H:%M", 
                date: "$createdAt" 
              }
            }
          },
          doc: { $first: "$$ROOT" } // Take the first occurrence
        }
      },
      {
        $replaceRoot: { newRoot: "$doc" }
      },
      {
        $sort: { createdAt: 1 }
      }
    ]);

    const formattedMessages = messages.map((msg) => ({
      id: msg._id.toString(),
      text: msg.text,
      senderId: msg.senderId,
      receiverId: msg.receiverId,
      time: msg.createdAt.toISOString(),
      edited: msg.edited || false,
    }));

    console.log(`Fetched ${formattedMessages.length} unique messages for ${userId} with ${receiverId}`);
    
    res.status(200).json({ messages: formattedMessages });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({ error: "Failed to fetch messages" });
  }
});

// POST /api/add-chat-contact - Add a chat contact
router.post("/add-chat-contact", async (req, res) => {
  try {
    const { profileId, contactId } = req.body;
    if (!profileId || !contactId) {
      return res.status(400).json({ error: "profileId and contactId are required" });
    }

    await User.updateOne(
      { profileId },
      { $addToSet: { chatContacts: contactId } }
    );
    await User.updateOne(
      { profileId: contactId },
      { $addToSet: { chatContacts: profileId } }
    );
    res.status(200).json({ message: "Chat contact added" });
  } catch (error) {
    console.error("Error adding chat contact:", error);
    res.status(500).json({ error: "Failed to add chat contact" });
  }
});

// GET /api/chat-contacts - Fetch chat contacts for a user
router.get("/chat-contacts", async (req, res) => {
  try {
    const { profileId } = req.query;
    if (!profileId) {
      return res.status(400).json({ error: "profileId is required" });
    }
    const user = await User.findOne({ profileId });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    const contacts = await User.find({
      profileId: { $in: user.chatContacts },
    }).select("profileId personalInfo.name personalInfo.profileImage");

    const formattedContacts = await Promise.all(
      contacts.map(async (c) => {
        const lastMessage = await Message.findOne({
          $or: [
            { senderId: c.profileId, receiverId: profileId },
            { senderId: profileId, receiverId: c.profileId },
          ],
          deletedBy: { $ne: profileId }, // Exclude messages deleted by the user
        }).sort({ createdAt: -1 });

        return {
          id: c.profileId,
          name: c.personalInfo.name || "Unknown",
          avatar: c.personalInfo.profileImage
            ? `${process.env.BASE_URL || "http://localhost:5000"}/${c.personalInfo.profileImage}`
            : "https://via.placeholder.com/100",
          online: false,
          lastMessage: lastMessage?.text || "",
          lastMessageTime: lastMessage?.createdAt || "",
        };
      })
    );

    res.status(200).json({ contacts: formattedContacts });
  } catch (error) {
    console.error("Error fetching chat contacts:", error);
    res.status(500).json({ error: "Failed to fetch chat contacts" });
  }
});

// DELETE /api/chat-contacts/:contactId - Remove a chat contact and mark associated messages as deleted for the requesting user
router.delete("/chat-contacts/:contactId", async (req, res) => {
  try {
    const { profileId } = req.query;
    const { contactId } = req.params;
    if (!profileId || !contactId) {
      return res.status(400).json({ error: "profileId and contactId are required" });
    }

    // Remove contact from the requesting user's chatContacts
    await User.updateOne(
      { profileId },
      { $pull: { chatContacts: contactId } }
    );

    // Mark messages as deleted for the requesting user
    await Message.updateMany(
      {
        $or: [
          { senderId: profileId, receiverId: contactId },
          { senderId: contactId, receiverId: profileId },
        ],
      },
      { $addToSet: { deletedBy: profileId } }
    );

    res.status(200).json({ message: "Chat contact and messages marked as deleted" });
  } catch (error) {
    console.error("Error deleting chat contact:", error);
    res.status(500).json({ error: "Failed to delete chat contact" });
  }
});

// TEMPORARY ROUTE - Add to messagesRoutes.js to clean duplicates
router.delete("/clean-message-duplicates", async (req, res) => {
  try {
    // Find messages with the same text, sender, receiver within 10 seconds
    const duplicates = await Message.aggregate([
      {
        $group: {
          _id: {
            text: "$text",
            senderId: "$senderId", 
            receiverId: "$receiverId",
            timeWindow: {
              $dateToString: { 
                format: "%Y-%m-%dT%H:%M:%S", 
                date: "$createdAt" 
              }
            }
          },
          ids: { $push: "$_id" },
          count: { $sum: 1 },
          createdAt: { $first: "$createdAt" }
        }
      },
      { $match: { count: { $gt: 1 } } },
      { $sort: { createdAt: 1 } }
    ]);

    let deletedCount = 0;
    
    for (const group of duplicates) {
      // Keep the oldest message, delete the rest
      const [keepId, ...deleteIds] = group.ids.sort();
      
      await Message.deleteMany({ 
        _id: { $in: deleteIds } 
      });
      
      deletedCount += deleteIds.length;
      console.log(`Kept ${keepId}, deleted ${deleteIds.length} duplicates`);
    }

    res.json({ 
      message: `Cleaned ${deletedCount} duplicate messages`,
      duplicatesFound: duplicates.length 
    });
  } catch (error) {
    console.error("Error cleaning duplicates:", error);
    res.status(500).json({ error: "Failed to clean duplicates" });
  }
});

// Socket.IO event handlers
const registerSocketIO = (io, onlineUsers) => {
  io.on("connection", (socket) => {
    const userId = socket.handshake.auth.profileId;
    console.log(
      `Socket.IO connection established for userId: ${userId}, socketId: ${socket.id}`
    );
    if (userId) {
      onlineUsers.set(userId, socket.id);
      io.emit("onlineUsers", Array.from(onlineUsers.keys()));
    }

socket.on("sendMessage", async (message) => {
  try {
    console.log("Received message:", message);
    
    // Check for existing message using tempId to prevent duplicates
    if (message.tempId) {
      const existingMessage = await Message.findOne({ tempId: message.tempId });
      if (existingMessage) {
        console.log("Duplicate message detected by tempId, skipping save:", message.tempId);
        return; // Exit early, don't save duplicate
      }
    }

    await User.updateOne(
      { profileId: message.senderId },
      { $addToSet: { chatContacts: message.receiverId } }
    );
    await User.updateOne(
      { profileId: message.receiverId },
      { $addToSet: { chatContacts: message.senderId } }
    );

    const newMessage = new Message({
      senderId: message.senderId,
      receiverId: message.receiverId,
      text: message.text,
      time: message.time,
      tempId: message.tempId, // Store tempId for duplicate detection
      createdAt: new Date(),
      deletedBy: [],
    });
    await newMessage.save();

    const formattedMessage = {
      id: newMessage._id.toString(),
      text: newMessage.text,
      senderId: newMessage.senderId,
      receiverId: newMessage.receiverId,
      time: newMessage.createdAt.toISOString(),
      edited: newMessage.edited || false,
      tempId: message.tempId,
    };

    const receiverSocketId = onlineUsers.get(message.receiverId);
    const senderSocketId = onlineUsers.get(message.senderId);
    
    // Emit to receiver
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("receiveMessage", formattedMessage);
      console.log(`Message sent to receiverId: ${message.receiverId}`);
    }
    
    // Emit back to sender (but with duplicate prevention)
    if (senderSocketId) {
      io.to(senderSocketId).emit("receiveMessage", formattedMessage);
    }
  } catch (error) {
    console.error("Error saving message:", error);
  }
});

    socket.on("editMessage", async ({ messageId, newText }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        message.text = newText;
        message.edited = true;
        await message.save();

        const updatedMessage = {
          id: message._id.toString(),
          text: message.text,
          senderId: message.senderId,
          receiverId: message.receiverId,
          time: message.createdAt.toISOString(),
          edited: true,
        };

        const senderSocketId = onlineUsers.get(message.senderId);
        const receiverSocketId = onlineUsers.get(message.receiverId);

        if (senderSocketId)
          io.to(senderSocketId).emit("messageEdited", updatedMessage);
        if (receiverSocketId)
          io.to(receiverSocketId).emit("messageEdited", updatedMessage);
      } catch (error) {
        console.error("Error editing message:", error);
      }
    });

    socket.on("deleteMessage", async ({ messageId, userId }) => {
      try {
        const message = await Message.findById(messageId);
        if (!message) return;

        // Add userId to deletedBy array
        message.deletedBy = [...(message.deletedBy || []), userId];
        await message.save();

        const senderSocketId = onlineUsers.get(message.senderId);
        const receiverSocketId = onlineUsers.get(message.receiverId);

        // Notify both users to update their UI
        if (senderSocketId)
          io.to(senderSocketId).emit("messageDeleted", { messageId, userId });
        if (receiverSocketId)
          io.to(receiverSocketId).emit("messageDeleted", { messageId, userId });
      } catch (error) {
        console.error("Error marking message as deleted:", error);
      }
    });

    socket.on("disconnect", () => {
      if (userId) {
        onlineUsers.delete(userId);
        io.emit("onlineUsers", Array.from(onlineUsers.keys()));
        console.log(`User disconnected: ${userId}`);
      }
    });
  });
};

module.exports = { router, registerSocketIO };