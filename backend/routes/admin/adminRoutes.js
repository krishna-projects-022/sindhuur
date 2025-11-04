const express = require("express");
const fs = require("fs");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const multer = require("multer");
const path = require("path");
require("dotenv").config();
const { createAdmins } = require("../../createUser");
const { updateEventStatuses } = require("../admin/cronJobs");

const User = require("../../modals/userSchema");
const Admin = require("../../modals/admin/adminSchema");

const authMiddleware = require("../../middleware/auth");

const router = express.Router();
const SECRET_KEY = process.env.JWT_SECRET || "your-secret-key";

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(process.cwd(), "uploads", "avatars");
    fs.mkdirSync(uploadPath, { recursive: true });
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    // Use the ID from URL params
    const userId = req.params?.id || "unknown";
    cb(null, `${userId}-${uniqueSuffix}${path.extname(file.originalname)}`);
  },
});

// Start the cron job
updateEventStatuses(); // Run once on startup
console.log("Cron job for event status updates started");

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
});

router.use("/uploads/avatars", express.static("uploads/avatars"));

// Initialize admin users after MongoDB connection
mongoose.connection.once("open", async () => {
  try {
    await createAdmins();
    console.log("Admin initialization completed");
  } catch (error) {
    console.error("Failed to initialize admins:", error);
  }
});

// Login endpoint for admins
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", email);
    const user = await Admin.findOne({ email, role: "admin" });
    if (!user) {
      console.log("Admin user not found:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log("Invalid password for:", email);
      return res.status(401).json({ message: "Invalid email or password" });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      SECRET_KEY,
      { expiresIn: "1h" }
    );
    console.log("Login successful, token generated:", token);
    res.json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        department: user.department,
        bio: user.bio,
        language: user.language,
        timezone: user.timezone,
        role: user.role,
        avatar: user.avatar || "/placeholder.svg",
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
});

router.get("/profile", async (req, res) => {
  try {
    const { userId } = req.query; // get from query param

    if (!userId) {
      return res.status(400).json({ message: "Missing userId" });
    }
    const user = await Admin.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        department: user.department,
        bio: user.bio,
        language: user.language,
        timezone: user.timezone,
        role: user.role,
        avatar: user.avatar || "/placeholder.svg",
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error("Error fetching profile:", error);
    res.status(500).json({ message: "Failed to fetch profile" });
  }
});

// Route
router.put("/profile/:id", upload.single("avatar"), async (req, res) => {
  try {
    const { id } = req.params;

    // Convert null-prototype object into normal object
    const updateData = { ...req.body };

    // Only allow certain fields to be updated
    const allowedFields = [
      "name",
      "email",
      "phone",
      "location",
      "department",
      "bio",
      "language",
      "timezone",
      "role",
    ];
    Object.keys(updateData).forEach((key) => {
      if (!allowedFields.includes(key)) {
        delete updateData[key];
      }
    });

    // If avatar uploaded, store file path
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    const updatedAdmin = await Admin.findByIdAndUpdate(id, updateData, {
      new: true,
    }).select("-password");

    if (!updatedAdmin) {
      return res.status(404).json({ message: "Admin not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: {
        id: updatedAdmin._id,
        name: updatedAdmin.name,
        email: updatedAdmin.email,
        phone: updatedAdmin.phone,
        location: updatedAdmin.location,
        department: updatedAdmin.department,
        bio: updatedAdmin.bio,
        language: updatedAdmin.language,
        timezone: updatedAdmin.timezone,
        role: updatedAdmin.role,
        avatar: updatedAdmin.avatar || "/placeholder.svg",
        createdAt: updatedAdmin.createdAt,
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
});

// Profile endpoint (PATCH)
router.patch("/profile", upload.single("avatar"), async (req, res) => {
  try {
    const {
      name,
      email,
      phone,
      location,
      department,
      bio,
      language,
      timezone,
    } = req.body;
    const updateData = {
      name,
      email,
      phone,
      location,
      department,
      bio,
      language,
      timezone,
      personalInfo: { email },
    };
    if (req.file) {
      updateData.avatar = `/uploads/avatars/${req.file.filename}`;
    }
    const user = await Admin.findByIdAndUpdate(
      req.user.userId,
      { $set: updateData },
      { new: true, runValidators: true }
    ).select("-password");
    if (!user) {
      return res.status(404).json({ message: "Admin not found" });
    }
    res.json({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone,
        location: user.location,
        department: user.department,
        bio: user.bio,
        language: user.language,
        timezone: user.timezone,
        role: user.role,
        avatar: user.avatar || "/placeholder.svg",
      },
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    res.status(500).json({ message: "Failed to update profile" });
  }
});

// Change password endpoint
router.put("/change-password", async (req, res) => {
  try {
    const { email, currentPassword, newPassword, confirmPassword } = req.body;

    // Basic validation
    if (!email || !currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Validate password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ message: "New passwords do not match" });
    }

    // Validate password length
    if (newPassword.length < 8) {
      return res
        .status(400)
        .json({ message: "New password must be at least 8 characters long" });
    }

    // Find user by email
    const user = await Admin.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Verify current password
    const isValidPassword = await bcrypt.compare(
      currentPassword,
      user.password
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Current password is incorrect" });
    }

    // Hash and update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    res.json({ message: "Password changed successfully" });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({ message: "Failed to change password" });
  }
});

// Profiles route
// Profiles route
router.get("/profiles", async (req, res) => {
  try {
    console.log("Profiles route accessed, user:", req.user);
    const users = await User.find({ role: "user" }).select(
      "profileId personalInfo.name personalInfo.email personalInfo.gender personalInfo.mobile personalInfo.lookingFor " +
      "personalInfo.profileImage demographics.dateOfBirth demographics.height demographics.maritalStatus " +
      "demographics.religion demographics.community demographics.motherTongue demographics.timeOfBirth " +
      "demographics.placeOfBirth demographics.chartStyle professionalInfo.education professionalInfo.occupation " +
      "professionalInfo.income location.city location.state familyInfo.father familyInfo.mother credentials.password " +
      "appVersion hobbies profileStatus flagReasons photos lastActive profileCreatedAt subscription"
    );
    console.log(
      "Queried users with role: user, found:",
      users.length,
      "documents"
    );

    const profiles = users.map((user) => {
      console.log("Processing user:", user.profileId);

      // Calculate profile completion percentage
      const fieldsToCheck = [
        user.personalInfo.name,
        user.personalInfo.email,
        user.personalInfo.mobile,
        user.personalInfo.gender,
        user.personalInfo.lookingFor,
        user.hobbies,
        user.demographics.dateOfBirth,
        user.demographics.height,
        user.demographics.maritalStatus,
        user.demographics.religion,
        user.demographics.community,
        user.demographics.motherTongue,
        user.demographics.timeOfBirth,
        user.demographics.placeOfBirth,
        user.demographics.chartStyle,
        user.professionalInfo.education,
        user.professionalInfo.occupation,
        user.professionalInfo.income,
        user.location.city,
        user.location.state,
        user.familyInfo.father,
        user.familyInfo.mother,
        user.credentials.password,
        user.appVersion,
      ];

      const totalFields = fieldsToCheck.length;
      const filledFields = fieldsToCheck.filter(field =>
        field !== null && field !== undefined && field !== '' && field !== 'Not specified'
      ).length;
      const profileCompletePercentage = Math.round((filledFields / totalFields) * 100);

      return {
        id: user.profileId,
        name: user.personalInfo.name || "Unknown",
        age: calculateAge(user.demographics?.dateOfBirth),
        gender: user.personalInfo?.gender
          ? user.personalInfo.gender.toLowerCase()
          : "unknown",
        location:
          user.location?.city && user.location?.state
            ? `${user.location.city}, ${user.location.state}`
            : "Unknown",
        profession: user.professionalInfo?.occupation || "Unknown",
        community: user.demographics?.community || "Unknown",
        education: user.professionalInfo?.education || "Unknown",
        maritalStatus:
          user.demographics?.maritalStatus?.toLowerCase().replace(" ", "_") ||
          "never_married",
        profileStatus: user.profileStatus || "active",
        verified: user.otp?.verified || false,
        premium:
          user.subscription?.current === "premium" ||
          user.subscription?.current === "premium plus",
        subscription: {
          current: user.subscription?.current || "free",
          startDate: user.subscription?.details?.startDate
            ? user.subscription.details.startDate.toISOString().split("T")[0]
            : null,
          expiryDate: user.subscription?.details?.expiryDate
            ? user.subscription.details.expiryDate.toISOString().split("T")[0]
            : null,
          autoRenew: user.subscription?.details?.autoRenew || false,
        },
        photos: user.photos || 0,
        profileComplete: profileCompletePercentage,
        lastActive: user.lastActive
          ? user.lastActive.toISOString().split("T")[0]
          : "Unknown",
        joinDate: user.profileCreatedAt
          ? user.profileCreatedAt.toISOString().split("T")[0]
          : "Unknown",
        flagReasons: user.flagReasons || [],
        profileImage: user.personalInfo?.profileImage || null,
      };
    });
    res.json(profiles);
  } catch (error) {
    console.error("Error fetching profiles:", error);
    res
      .status(500)
      .json({ message: "Failed to fetch profiles", error: error.message });
  }
});


// Profile flag endpoint
router.patch("/profiles/:profileId/flag", async (req, res) => {
  try {
    const { profileId } = req.params;
    const { reason } = req.body;
    const user = await User.findOneAndUpdate(
      { profileId },
      { profileStatus: "flagged", $push: { flagReasons: reason } },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }
    user.personalInfo.Status = "inactive";
    await user.save();
    res.json({ message: "Profile flagged successfully" });
  } catch (error) {
    console.error("Error flagging profile:", error);
    res.status(500).json({ message: "Failed to flag profile" });
  }
});

// Profile unflag endpoint
router.patch("/profiles/:profileId/unflag", async (req, res) => {
  try {
    const { profileId } = req.params;
    const user = await User.findOneAndUpdate(
      { profileId },
      { profileStatus: "active", flagReasons: [] },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }
    user.personalInfo.Status = "active";
    await user.save();
    res.json({ message: "Profile unflagged successfully" });
  } catch (error) {
    console.error("Error unflagging profile:", error);
    res.status(500).json({ message: "Failed to unflag profile" });
  }
});

// Profile verify endpoint
router.patch("/profiles/:profileId/verify", async (req, res) => {
  try {
    const { profileId } = req.params;
    const user = await User.findOneAndUpdate(
      { profileId },
      { "otp.verified": true },
      { new: true }
    );
    if (!user) {
      return res.status(404).json({ message: "Profile not found" });
    }
    res.json({ message: "Profile verified successfully" });
  } catch (error) {
    console.error("Error verifying profile:", error);
    res.status(500).json({ message: "Failed to verify profile" });
  }
});

// Placeholder for calculateAge and calculateProfileCompleteness
function calculateAge(dateOfBirth) {
  if (!dateOfBirth) return 0;
  const dob = new Date(dateOfBirth);
  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

function calculateProfileCompleteness(user) {
  let completeness = 0;
  if (user.personalInfo?.name) completeness += 20;
  if (user.personalInfo?.gender) completeness += 10;
  if (user.demographics?.dateOfBirth) completeness += 10;
  if (user.demographics?.maritalStatus) completeness += 10;
  if (user.demographics?.community) completeness += 10;
  if (user.professionalInfo?.education) completeness += 10;
  if (user.professionalInfo?.occupation) completeness += 10;
  if (user.location?.city && user.location?.state) completeness += 10;
  if (user.photos > 0) completeness += 10;
  if (user.otp?.verified) completeness += 10;
  return completeness;
}

// |.......................................................change................................|

//usermanangement

// Get all users
// Helper to check if a value is "filled"
function isFilled(value) {
  if (Array.isArray(value)) return value.length > 0;
  return value !== undefined && value !== null && value !== "";
}

// Get all users
router.get("/get/users", async (req, res) => {
  try {
    const users = await User.find();

    const formattedUsers = await Promise.all(
      users.map(async (user, index) => {
        // Define fields for completion tracking

        const fieldsToCheck = [
          user.personalInfo.name, // Required
          user.personalInfo.email, // Required
          user.personalInfo.mobile, // Optional (validation requires it, but schema allows optional)
          user.personalInfo.gender, // Required
          user.personalInfo.lookingFor, // Optional (validation requires it, but schema allows optional)
          user.hobbies, // Optional, default "Not specified"
          user.demographics.dateOfBirth, // Required
          user.demographics.height, // Required
          user.demographics.maritalStatus, // Required
          user.demographics.religion, // Required
          user.demographics.community, // Required
          user.demographics.motherTongue, // Required
          user.demographics.timeOfBirth, // Optional
          user.demographics.placeOfBirth, // Optional
          user.demographics.chartStyle, // Optional, default "South Indian"
          user.professionalInfo.education, // Required
          user.professionalInfo.occupation, // Required
          user.professionalInfo.income, // Required
          user.location.city, // Required
          user.location.state, // Required
          user.familyInfo.father, // Optional (validation requires it)
          user.familyInfo.mother, // Optional (validation requires it)
          user.credentials.password, // Required
          user.appVersion, // Required
        ];

        const isFilled = (value) =>
          value !== undefined && value !== null && value !== "";

        const totalFields = fieldsToCheck.length;
        const filledFields = fieldsToCheck.filter(isFilled).length;
        const profileComplete = Math.round((filledFields / totalFields) * 100);

        return {
          id: index + 1,
          _id: user._id,
          name: user.personalInfo.name,
          email: user.personalInfo.email,
          phone: user.personalInfo.mobile,
          verified: user.otp?.verified,
          joinDate: user.profileCreatedAt,
          role: user.role, // ❌ FIXED: role is top-level, not inside personalInfo
          status: user.personalInfo.Status,
          lastActive: user.lastActive,
          profileComplete,
        };
      })
    );

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error("Error fetching users:", error.message);
    res
      .status(500)
      .json({ error: `Failed to fetch users: ${error.message}` });
  }
});

// PUT /user/:id/status
router.put("/user/:id/status", async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;

  try {
    const updatedUser = await User.findByIdAndUpdate(
      id,
      { "personalInfo.Status": status },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // ✅ Return exactly how frontend expects it
    res.status(200).json({
      _id: updatedUser._id.toString(),
      status: updatedUser.personalInfo.Status,
    });
  } catch (err) {
    console.error("Status update failed:", err.message);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user data by ID
router.put("/update/user/:id", async (req, res) => {
  try {
    const userId = req.params.id;
    const { name, email, phone, role, status } = req.body;
    console.log(role, status);

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          "personalInfo.name": name,
          "personalInfo.email": email,
          "personalInfo.mobile": phone,
          "personalInfo.role": role,
          "personalInfo.Status": status,
        },
      },
      { new: true } // return the updated document
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    res
      .status(200)
      .json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.error("Update error:", error.message);
    res.status(500).json({ error: "Server error while updating user" });
  }
});

// DELETE user by MongoDB _id
router.delete("/delete/user/:id", async (req, res) => {
  const { id } = req.params;
  try {
    const deletedUser = await User.findByIdAndDelete(id);
    if (!deletedUser) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ error: "Failed to delete user" });
  }
});

//
///....................................admin dashbaoard.........................................................
// User count endpoint
router.get("/users/count", async (req, res) => {
  try {
    const count = await User.countDocuments({});
    console.log(`User count fetched: ${count}`);
    res.status(200).json({ count });
  } catch (error) {
    console.error("Error fetching user count:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch user count" });
  }
});


router.get("/status-counts", async (req, res) => {
  try {
    const counts = await User.aggregate([
      {
        $group: {
          _id: "$personalInfo.Status",
          count: { $sum: 1 },
        },
      },
    ]);

    let active = 0,
      inactive = 0,
      banned = 0;

    counts.forEach((c) => {
      if (c._id === "active") active = c.count;
      else if (c._id === "inactive") inactive = c.count;
      else if (c._id === "banned") banned = c.count;
    });

    res.json({ active, inactive, banned });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Recent logins endpoint
router.get("/users/recent-logins", async (req, res) => {
  try {
    console.log("Fetching recent logins from database...");
    const users = await User.find({})
      .sort({ lastLogin: -1, profileCreatedAt: -1 })
      .limit(5)
      .select(
        "personalInfo.name personalInfo.email personalInfo.mobile status otp.verified profileCreatedAt lastLogin role profileCompletion"
      );
    if (users.length === 0) {
      console.warn("No users found in database");
      const totalCount = await User.countDocuments({});
      console.log(`Total users in database: ${totalCount}`);
      if (totalCount > 0) {
        console.warn(
          "Mismatch: countDocuments reports users, but find query returned none"
        );
      }
    } else {
      console.log(
        `Found ${users.length} users:`,
        users.map((u) => ({
          _id: u._id,
          name: u.personalInfo?.name || "N/A",
          email: u.personalInfo?.email || "N/A",
          mobile: u.personalInfo?.mobile || "N/A",
          status: u.status || "N/A",
          lastLogin: u.lastLogin || "N/A",
          profileCreatedAt: u.profileCreatedAt || "N/A",
          role: u.role || "N/A",
          profileCompletion: u.profileCompletion || 0,
          verified: u.otp?.verified || false,
        }))
      );
    }
    const formattedUsers = users.map((user, index) => ({
      id: index + 1,
      name: user.personalInfo?.name || `User${index + 1}`,
      email: user.personalInfo?.email || `user${index + 1}@domain.com`,
      phone: user.personalInfo?.mobile || "N/A",
      status: user.status || "Active",
      verified: user.otp?.verified || false,
      joinDate: user.profileCreatedAt
        ? user.profileCreatedAt.toISOString().split("T")[0]
        : "2024-01-01",
      lastLogin: user.lastLogin
        ? user.lastLogin.toISOString().split("T")[0]
        : "N/A",
      role: user.role || "user",
      profileCompletion: user.profileCompletion || 50,
    }));
    console.log(
      `Returning ${formattedUsers.length} users for recent logins:`,
      formattedUsers
    );
    res.status(200).json({ users: formattedUsers });
  } catch (error) {
    console.error("Error fetching recent logins:", error.message, error.stack);
    res.status(500).json({ error: "Failed to fetch recent logins" });
  }
});

router.get("/subscription-counts", async (req, res) => {
  try {
    const counts = await User.aggregate([
      {
        $group: {
          _id: "$subscription.current",
          count: { $sum: 1 },
        },
      },
    ]);

    let free = 0,
      premium = 0,
      premiumPlus = 0;

    counts.forEach((c) => {
      if (c._id === "free") free = c.count;
      else if (c._id === "premium") premium = c.count;
      else if (c._id === "premium plus") premiumPlus = c.count;
    });

    const totalSubscribed = premium + premiumPlus;

    res.json({
      free,
      premium,
      premium_plus: premiumPlus,
      subscribed: totalSubscribed,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// router.get("/notifications/:profileId", async (req, res) => {
//   try {
//     const { profileId } = req.params;
//     console.log(`Fetching notifications for profileId: ${profileId}`);
//     const user = await User.findOne(
//       { profileId },
//       { notifications: 1, _id: 0 }
//     ).lean();
//     if (!user) {
//       console.log(`User not found for profileId: ${profileId}`);
//       return res.status(404).json({ message: "User not found" });
//     }
//     res.json(user.notifications || []);
//   } catch (error) {
//     console.error("❌ Error fetching notifications:", error);
//     res.status(500).json({ message: "Server error while fetching notifications" });
//   }
// });
// backend routes

// In your backend route - improve the notifications endpoint

 
// POST /api/send-interest
router.post("/send-interest", async (req, res) => {
  try {
    const { userProfileId, interestedProfileId } = req.body;

    console.log(`❤️ Received send-interest request: userProfileId=${userProfileId}, interestedProfileId=${interestedProfileId}`);

    if (!userProfileId || !interestedProfileId) {
      return res.status(400).json({ message: "userProfileId and interestedProfileId are required" });
    }

    const profileIdRegex = /^[A-Z0-9]+$/;
    if (!profileIdRegex.test(userProfileId) || !profileIdRegex.test(interestedProfileId)) {
      return res.status(400).json({ message: "Invalid profile ID format" });
    }

    const user = await User.findOne({ profileId: userProfileId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const interest = {
      _id: new mongoose.Types.ObjectId(),
      userProfileId,
      interestedProfileId,
      createdAt: new Date(),
    };

    user.interests = user.interests || [];
    if (!user.interests.some(i => i.interestedProfileId === interestedProfileId)) {
      user.interests.push(interest);
      await user.save();
    }

    console.log(`✅ Interest stored successfully for user ${userProfileId} on ${interestedProfileId}`);
    res.status(200).json({ message: "Interest stored successfully", interest });
  } catch (error) {
    console.error("❌ Error storing interest:", error);
    res.status(500).json({ message: "Server error while storing interest", error: error.message });
  }
});

router.post("/notifications/:toProfileId", async (req, res) => {
  try {
    const { toProfileId } = req.params;
    const { fromProfileId, type, message } = req.body;

    console.log(`📨 Received notification request: toProfileId=${toProfileId}, fromProfileId=${fromProfileId}, type=${type}`);

    if (!fromProfileId || !toProfileId) {
      return res.status(400).json({ message: "fromProfileId and toProfileId are required" });
    }

    const userToUpdate = await User.findOne({ profileId: toProfileId });
    if (!userToUpdate) {
      console.error(`❌ User not found with profileId: ${toProfileId}`);
      return res.status(404).json({ message: "User not found" });
    }

    const sender = await User.findOne({ profileId: fromProfileId }, { "personalInfo.name": 1 }).lean();
    const senderName = sender?.personalInfo?.name || "Someone";
    const existingNotifications = userToUpdate.notifications || [];

    const existingNotif = existingNotifications.find(n => n.fromProfileId === fromProfileId && n.type === type);
    if (existingNotif) {
      return res.status(200).json({ message: "Notification already exists", notification: existingNotif });
    }

    const newNotification = {
      _id: new mongoose.Types.ObjectId(),
      fromProfileId,
      toProfileId,
      toUserName: senderName,
      type: type || "interest",
      message: message || `${senderName} showed interest in you`,
      isRead: false,
      createdAt: new Date(),
    };

    userToUpdate.notifications = [newNotification, ...existingNotifications];
    if (userToUpdate.notifications.length > 100) {
      userToUpdate.notifications = userToUpdate.notifications.slice(0, 100);
    }
    await userToUpdate.save();

    console.log(`✅ Notification stored successfully for user ${toProfileId}`);
    res.status(200).json({ message: "Notification stored successfully", notification: newNotification });
  } catch (error) {
    console.error("❌ Error storing notification:", error);
    res.status(500).json({ message: "Server error while storing notification", error: error.message });
  }
});

// Other existing routes (/api/notifications/:profileId/unread-count, /api/notifications/:profileId/mark-read, /api/notifications/:profileId) remain unchanged
// GET /api/notifications/:profileId/unread-count
router.get("/notifications/:profileId/unread-count", async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ message: "profileId is required" });
    }

    const user = await User.findOne({ profileId });

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const unreadCount = (user.notifications || []).filter(
      (notification) => !notification.isRead
    ).length;

    res.status(200).json({
      message: "Unread notifications count retrieved successfully",
      count: unreadCount,
    });
  } catch (error) {
    console.error(
      `❌ Error fetching unread notifications count for profileId ${req.params.profileId}:`,
      error,
      `at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
    );
    res
      .status(500)
      .json({ message: "Server error while fetching unread notifications count" });
  }
});

// POST /api/notifications/:profileId/mark-read
router.post("/notifications/:profileId/mark-read", async (req, res) => {
  try {
    const { profileId } = req.params;

    if (!profileId) {
      return res.status(400).json({ message: "profileId is required" });
    }

    const user = await User.findOne({ profileId });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    user.notifications = user.notifications.map((notification) => ({
      ...notification,
      isRead: true,
    }));

    await user.save();

    res.status(200).json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error(
      `❌ Error marking notifications as read for profileId ${req.params.profileId}:`,
      error,
      `at ${new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })}`
    );
    res
      .status(500)
      .json({ message: "Server error while marking notifications as read" });
  }
});

// GET /api/notifications/:profileId
router.get("/notifications/:profileId", async (req, res) => {
  try {
    const { profileId } = req.params;
    
    console.log(`🔔 Fetching notifications for profileId: ${profileId}`);

    if (!profileId) {
      return res.status(400).json({ message: "profileId is required" });
    }

    const profileIdRegex = /^[A-Z0-9]+$/;
    if (!profileIdRegex.test(profileId)) {
      return res.status(400).json({ message: "Invalid user ID format" });
    }

    const user = await User.findOne(
      { profileId: profileId },
      { notifications: 1, _id: 0 }
    ).lean();

    if (!user) {
      console.log(`❌ User not found with profileId: ${profileId}`);
      return res.status(200).json([]); // Return empty array instead of error
    }

    if (!user.notifications || user.notifications.length === 0) {
      console.log(`ℹ️ No notifications found for profileId: ${profileId}`);
      return res.status(200).json([]);
    }

    const sortedNotifications = [...user.notifications].sort(
      (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
    );
    
    console.log(`✅ Found ${sortedNotifications.length} notifications for profileId: ${profileId}`);
    
    res.status(200).json(sortedNotifications);
  } catch (error) {
    console.error(`❌ Error fetching notifications for profileId ${req.params.profileId}:`, error);
    res.status(500).json({ 
      message: "Server error while fetching notifications",
      error: error.message 
    });
  }
});


// PUT /api/admin/notifications/:toProfileId/:notificationId/read
router.put(
  "/notifications/:toProfileId/:notificationId/read",
  async (req, res) => {
    try {
      const user = await User.findOneAndUpdate(
        {
          profileId: req.params.toProfileId,
          "notifications._id": req.params.notificationId,
        },
        { $set: { "notifications.$.isRead": true } },
        { new: true }
      ).lean();

      if (!user) return res.status(404).json({ message: "User not found" });

      res.json(user.notifications); // send updated notifications
    } catch (err) {
      console.error("Error marking as read:", err);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Mark ALL notifications as read for a specific user
router.put("/notifications/:toProfileId/read-all", async (req, res) => {
  try {
    const user = await User.findOneAndUpdate(
      { profileId: req.params.toProfileId },
      { $set: { "notifications.$[].isRead": true } }, // $[] updates all elements
      { new: true }
    ).lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    res.json(user.notifications); // send updated notifications
  } catch (err) {
    console.error("Error marking all as read:", err);
    res.status(500).json({ message: "Server error" });
  }
});


// DELETE /api/admin/notifications/:notificationId/:toProfileId
router.delete(
  "/notifications/:notificationId/:toProfileId",
  async (req, res) => {
    try {
      const { notificationId, toProfileId } = req.params;
      console.log(notificationId + " and " + toProfileId);

      // Remove notification with _id = notificationId from user's notifications array
      const updatedUser = await User.findOneAndUpdate(
        { profileId: toProfileId },
        { $pull: { notifications: { _id: notificationId } } },
        { new: true }
      ).lean();

      if (!updatedUser) {
        return res
          .status(404)
          .json({ message: "User or notification not found" });
      }

      res.json({ message: "Notification deleted successfully" });
    } catch (error) {
      console.error("Error deleting notification:", error);
      res
        .status(500)
        .json({ message: "Server error while deleting notification" });
    }
  }
);

module.exports = router;
