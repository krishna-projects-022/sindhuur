import { motion } from "motion/react";
import { ArrowLeft, Edit3, LogOut } from "lucide-react";
import { Button } from "./ui/button";
import ProfileHeader from "./profile/ProfileHeader";
import ProfileStats from "./profile/ProfileStats";
import ProfileMenuItem from "./profile/ProfileMenuItem";
import { PROFILE_MENU_ITEMS } from "./constants/profileConstants";
import { useEffect, useState } from "react";
import { useToast } from "@/components/hooks/use-toast";
import { useNavigate } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface MyProfileScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

// Helper function for public fetch (no auth)
const publicFetch = async (url: string, options: RequestInit = {}) => {
  console.log(`Fetching URL: ${url}`); // Debug log
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
    console.log(`Response status for ${url}: ${response.status}`); // Debug log
    return response;
  } catch (error) {
    console.error(`Fetch error for ${url}:`, error.message); // Debug log
    throw error;
  }
};

export default function MyProfileScreen({ onNavigate, onBack }: MyProfileScreenProps) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
        console.log('Logged in user data:', loggedInUser); // Debug log
        if (!loggedInUser?.profileId) {
          throw new Error("Please log in to view your profile");
        }

        // Fetch main photo from /api/photos/:userId
        let mainPhotoUrl = "https://via.placeholder.com/150"; // Reliable default image
        try {
          const response = await publicFetch(`${BASE_URL}/api/photos/${loggedInUser.profileId}`);
          const data = await response.json();
          console.log('Photos API response:', data); // Debug log
          if (response.ok && data.photos?.length > 0) {
            const mainPhoto = data.photos.find((photo: any) => photo.isMain);
            mainPhotoUrl = mainPhoto?.url || loggedInUser.personalInfo?.profileImage || mainPhotoUrl;
            console.log('Selected main photo URL:', mainPhotoUrl); // Debug log
          } else {
            console.warn(`No photos found or error for profileId: ${loggedInUser.profileId}, status: ${response.status}`);
          }
        } catch (photoError) {
          console.error('Error fetching main photo:', photoError.message);
          mainPhotoUrl = loggedInUser.personalInfo?.profileImage || mainPhotoUrl;
          console.log('Falling back to:', mainPhotoUrl); // Debug log
        }

        const transformedUser = {
          profileId: loggedInUser.profileId || "KM" + Date.now(),
          name: loggedInUser.name || loggedInUser.personalInfo?.name || "Unknown",
          age: loggedInUser.dateOfBirth
            ? calculateAge(loggedInUser.dateOfBirth)
            : loggedInUser.demographics?.dateOfBirth
              ? calculateAge(loggedInUser.demographics.dateOfBirth)
              : "Not specified",
          height: loggedInUser.height || loggedInUser.demographics?.height || "Not specified",
          location:
            loggedInUser.city && loggedInUser.state
              ? `${loggedInUser.city}, ${loggedInUser.state}`
              : loggedInUser.location?.city && loggedInUser.location?.state
                ? `${loggedInUser.location.city}, ${loggedInUser.location.state}`
                : "Not specified",
          city: loggedInUser.city || loggedInUser.location?.city || "Not specified",
          state: loggedInUser.state || loggedInUser.location?.state || "Not specified",
          profession:
            loggedInUser.occupation ||
            loggedInUser.professionalInfo?.occupation ||
            "Not specified",
          religion:
            loggedInUser.religion || loggedInUser.demographics?.religion || "Not specified",
          caste:
            loggedInUser.community || loggedInUser.demographics?.community || "Not specified",
          education:
            loggedInUser.education || loggedInUser.professionalInfo?.education || "Not specified",
          fieldOfStudy:
            loggedInUser.fieldOfStudy || loggedInUser.professionalInfo?.fieldOfStudy || "Not specified",
          fatherOccupation:
            loggedInUser.familyInfo?.father || loggedInUser.fatherOccupation || "Not specified",
          motherOccupation:
            loggedInUser.familyInfo?.mother || loggedInUser.motherOccupation || "Not specified",
          hobbies: loggedInUser.hobbies || "Not specified",
          dob: loggedInUser.dateOfBirth
            ? formatDate(loggedInUser.dateOfBirth)
            : loggedInUser.demographics?.dateOfBirth
              ? formatDate(loggedInUser.demographics.dateOfBirth)
              : "Not specified",
          tob:
            loggedInUser.timeOfBirth || loggedInUser.demographics?.timeOfBirth || "Not specified",
          pob:
            loggedInUser.placeOfBirth ||
            loggedInUser.demographics?.placeOfBirth ||
            loggedInUser.city ||
            "Not specified",
          language:
            loggedInUser.motherTongue ||
            loggedInUser.demographics?.motherTongue ||
            "Not specified",
          chartStyle:
            loggedInUser.chartStyle || loggedInUser.demographics?.chartStyle || "South Indian",
          email: loggedInUser.email || loggedInUser.personalInfo?.email || "Not specified",
          mobile: loggedInUser.mobile || loggedInUser.personalInfo?.mobile || "Not specified",
          gender: loggedInUser.gender || loggedInUser.personalInfo?.gender || "Not specified",
          lookingFor:
            loggedInUser.lookingFor || loggedInUser.personalInfo?.lookingFor || "Not specified",
          maritalStatus:
            loggedInUser.maritalStatus ||
            loggedInUser.demographics?.maritalStatus ||
            "Not specified",
          income: loggedInUser.income || loggedInUser.professionalInfo?.income || "Not specified",
          subscription: loggedInUser.subscription || { current: "free" },
          profileImage: mainPhotoUrl,
          document: loggedInUser.document || loggedInUser.personalInfo?.document || null,
          status: loggedInUser.personalInfo?.Status || "active",
          profileComplete: loggedInUser.profileComplete || 0,
          horoscope: loggedInUser.horoscope || {
            generated: false,
            compatibility: "",
            luckyNumbers: [],
            luckyColors: [],
            favorableTime: "",
            message: "",
          },
        };

        console.log('Transformed user:', transformedUser); // Debug log
        setUser(transformedUser);
        setProfileCompleteness(transformedUser.profileComplete);
        setLoading(false);
      } catch (err) {
        console.error("Error loading user data:", err);
        setError(err.message || "Failed to load user data");
        setLoading(false);
        toast({
          title: "Error",
          description: err.message || "Failed to load user data",
          variant: "destructive",
        });
      }
    };

    loadUserData();
  }, [toast]);

  const calculateAge = (dateOfBirth) => {
    try {
      const today = new Date();
      const birthDate = new Date(dateOfBirth);
      let age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      if (
        monthDiff < 0 ||
        (monthDiff === 0 && today.getDate() < birthDate.getDate())
      ) {
        age--;
      }
      return age;
    } catch (e) {
      return "Not specified";
    }
  };

  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);
      return `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (e) {
      return "Not specified";
    }
  };

  const handleSignOut = () => {
    try {
      // Clear localStorage
      localStorage.removeItem("loggedInUser");
      localStorage.removeItem("token");
      
      // Show success toast
      toast({
        title: "Signed Out",
        description: "You have been successfully signed out",
        variant: "default",
      });

      // Navigate to login screen after a short delay
      setTimeout(() => {
        navigate("/login");
      }, 1000);
    } catch (err) {
      console.error("Error during sign out:", err);
      toast({
        title: "Error",
        description: "Failed to sign out. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Profile Not Found
          </h2>
          <p className="text-gray-600 mb-4">{error || "Failed to load profile"}</p>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  if (user?.status === "inactive") {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-2">
            Account Deactivated
          </h2>
          <p className="text-gray-600 mb-4">
            Your account is currently deactivated. Please contact support to
            reactivate your account.
          </p>
          <Button onClick={onBack} className="bg-blue-600 hover:bg-blue-700">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <h1 className="text-xl text-foreground">My Profile</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => onNavigate("edit-profile", { user })}
              className="hover-scale"
            >
              <Edit3 className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleSignOut}
              className="hover-scale text-red-600 hover:text-red-700"
            >
              <LogOut className="w-4 h-4" />
              Signout
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="pb-6">
        <ProfileHeader 
          user={user} 
          profileCompleteness={profileCompleteness}
          onEditPhoto={() => onNavigate("photo-management")}
        />
        
        {/* <ProfileStats /> */}

        {/* Menu Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4 space-y-3"
        >
          {PROFILE_MENU_ITEMS.map((item, index) => (
            <ProfileMenuItem
              key={item.id}
              item={item}
              index={index}
              onNavigate={onNavigate}
            />
          ))}
        </motion.div>
      </div>
    </div>
  );
}