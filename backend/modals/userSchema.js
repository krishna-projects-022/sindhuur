const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    fromProfileId: { type: String, required: false },
    toProfileId: { type: String, required: false },
    toUserName: { type: String },
    message: { type: String },
    type: {
      type: String,
      enum: ["interest", "message", "match"],
      default: "interest",
    },
    isRead: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { _id: true }
);

const userSchema = new mongoose.Schema({
  profileId: { 
    type: String, 
    unique: true, 
    default: () => `KM${Date.now()}` 
  },

  email: { 
    type: String, 
    required: false, 
    unique: true, 
    lowercase: true,
    trim: true,
    match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"]
  },
  role: { 
    type: String, 
    enum: ["admin", "user"], 
    default: "user" 
  },

  personalInfo: {
    name: { 
      type: String, 
      required: false, 
      trim: true,
      match: [/^[A-Za-z\s]+$/, "Name should contain only letters"]
    },
    email: { 
      type: String, 
      required: false, 
      unique: true, 
      lowercase: true,
      trim: true,
      match: [/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/, "Invalid email format"]
    },
    gender: { 
      type: String, 
      enum: ["male", "female"], 
      required: false 
    },
    mobile: { 
      type: String, 
      required: false, 
      match: [/^[6-9][\d\s-]{9,14}$/, "Invalid phone number"] 
    },
    lookingFor: { 
      type: String, 
      enum: ["male", "female"], 
      required: false 
    },
    avatar: { type: String },
    profileComplete: { type: Number, default: 0 },
    document: { type: String },
    profileImage: { type: String },
    aboutMe: { 
      type: String, 
      trim: true, 
      minlength: [20, "About me must be at least 20 characters long"]
    },
    Status: {
      type: String,
      enum: ["active", "inactive", "banned"],
      default: "active",
    },
    lastActive: { type: Date, default: Date.now },
  },

  demographics: {
    dateOfBirth: { 
      type: String, 
      required: false
    },
    height: { 
      type: String, 
      required: false,
      enum: [
        "4.6-4.8", "4.9-4.11", "5.0-5.2", "5.3-5.5", 
        "5.6-5.8", "5.9-5.11", "6.0-6.2", "6.3+"
      ]
    },
    maritalStatus: { 
      type: String, 
      required: false,
      enum: ["never-married", "divorced", "widowed", "separated"]
    },
    religion: { type: String, required: false },
    community: { type: String, required: false },
    motherTongue: { type: String, required: false },
    timeOfBirth: { type: String },
    placeOfBirth: { type: String },
    chartStyle: { type: String, default: "South Indian" },
    physicalStatus: { 
      type: String, 
      required: false,
      enum: ["normal", "physically_challenged"]
    },
    numChildren: { 
      type: String, 
      default: "0",
      enum: ["0", "1", "2", "3", "4+"]
    },
    childrenLivingTogether: { 
      type: String, 
      enum: ["yes", "no", ""],
      default: ""
    },
    willingAnyCaste: { type: Boolean, default: false },
    subcaste: { type: String },
  },

  // UPDATED: Enhanced Professional Info with new fields
  professionalInfo: {
    education: { 
      type: String, 
      required: false,
      enum: ["High-School", "Diploma", "Bachelor", "Master", "Ph.D.", "Professional", "Other"]
    },
    fieldOfStudy: { type: String },
    occupation: { type: String, required: false },
    income: { 
      type: String, 
      required: false,
      enum: ["2-5", "5-10", "10-15", "15-25", "25-50", "50+"]
    },
    college: { type: String },        // NEW: Step 8
    course: { type: String },         // NEW: Step 8  
    passingYear: { type: String }     // NEW: Step 8
  },

  location: {
    country: { type: String, required: false, default: "india" },
    city: { type: String, required: false },
    state: { type: String, required: false },
  },

  // UPDATED: Enhanced hobbies structure
  hobbies: {
    music: {
      genre: { type: String },
      activity: { type: String }
    },
    reading: {
      type: { type: String },
      language: { type: String }
    },
    movies: {
      genre: { type: String },
      medium: { type: String }
    },
    sports: { type: String },
    fitness: { type: String },
    food: {
      cuisine: { type: String },
      cooking: { type: String },
      diet: { type: String }
    },
    languages: { type: String }
  },

  familyInfo: {
    father: { 
      type: String, 
      required: false
    },
    mother: { 
      type: String, 
      required: false
    },
    familyStatus: { 
      type: String, 
      required: false,
      enum: ["middle_class", "upper_middle", "rich"]
    },
    familyWealth: { 
      type: String, 
      required: false,
      enum: ["less_5l", "5_10l", "10_25l", "25_50l", "50l_1cr", "above_1cr"]
    },
  },

  familyTree: {
    type: String,
    default: ""
  },

  // UPDATED: Enhanced horoscope structure
  horoscope: {
    timeOfBirth: { type: String },
    placeOfBirth: { type: String },
    nakshatra: { type: String },
    rashi: { type: String },
    generated: { type: Boolean, default: false },
    compatibility: { type: String },
    luckyNumbers: { type: [Number] },
    luckyColors: { type: [String] },
    favorableTime: { type: String },
    message: { type: String },
  },

  // NEW: Lifestyle section
  lifestyle: {
    eatingHabits: { type: String },
    smoking: { type: String },
    drinking: { type: String }
  },

  credentials: {
    password: { 
      type: String, 
      required: false,
      minlength: [6, "Password must be at least 6 characters long"]
    },
    rememberMe: { type: Boolean, default: false },
  },

  subscription: {
    current: {
      type: String,
      enum: ["free", "premium", "premium plus"],
      default: "free",
    },
    details: {
      startDate: { type: Date },
      expiryDate: { type: Date },
      paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
      autoRenew: { type: Boolean, default: false },
    },
    history: [
      {
        type: { 
          type: String, 
          enum: ["free", "premium", "premium plus"] 
        },
        startDate: { type: Date },
        expiryDate: { type: Date },
        paymentId: { type: mongoose.Schema.Types.ObjectId, ref: "Payment" },
        status: {
          type: String,
          enum: ["active", "expired", "cancelled", "upgraded"],
          default: "active",
        },
        upgradedAt: { type: Date, default: Date.now },
        isUpgrade: { type: Boolean, default: false },
        originalPlan: { type: String },
        proratedAmount: { type: Number },
      },
    ],
  },
  registeredEvents: [{ type: mongoose.Schema.Types.ObjectId, ref: "Event" }],

  profileCreatedAt: { type: Date, default: Date.now },
  appVersion: { 
    type: String, 
    required: false, 
    default: "v2.1.3" 
  },

  otp: {
    code: { type: String },
    expiresAt: { type: Date },
    verified: { type: Boolean, default: false },
  },

  profileStatus: {
    type: String,
    enum: ["active", "inactive", "flagged", "under_review"],
    default: "active",
  },
  chatContacts: { type: [String], default: [] },
  flagReasons: { type: [String], default: [] },
  photos: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },
  lastActive: { type: Date, default: Date.now },
  notifications: [notificationSchema],
});

// UPDATED: More flexible validation
userSchema.pre("save", async function (next) {
  try {
    // Only validate on create
    if (!this.isNew) return next();

    // Basic required fields validation
    const requiredFields = [
      'personalInfo.name',
      'personalInfo.email', 
      'personalInfo.mobile',
      'personalInfo.gender',
      'personalInfo.lookingFor',
      'credentials.password'
    ];

    const missingFields = [];
    for (const field of requiredFields) {
      const [parent, child] = field.split('.');
      if (child) {
        if (!this[parent] || !this[parent][child]) {
          missingFields.push(field);
        }
      } else {
        if (!this[field]) {
          missingFields.push(field);
        }
      }
    }

    if (missingFields.length > 0) {
      throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.personalInfo.email)) {
      throw new Error("Invalid email format");
    }

    // Mobile format validation
    const mobileRegex = /^[6-9][\d\s-]{9,14}$/;
    if (!mobileRegex.test(this.personalInfo.mobile)) {
      throw new Error("Invalid mobile number format");
    }

    // OTP verification check
    if (!this.otp?.verified) {
      throw new Error("Email verification is required");
    }

    next();
  } catch (error) {
    next(error);
  }
});

// Email uniqueness check
userSchema.pre("save", async function (next) {
  if (this.isNew || this.isModified("personalInfo.email")) {
    const existingUser = await mongoose.model("User").findOne({
      $or: [
        { "personalInfo.email": this.personalInfo.email },
        { email: this.personalInfo.email },
      ],
      _id: { $ne: this._id },
    });
    if (existingUser) {
      return next(new Error("Email is already registered"));
    }
  }
  next();
});

module.exports = mongoose.model("User", userSchema);