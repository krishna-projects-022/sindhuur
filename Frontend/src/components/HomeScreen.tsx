import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Skeleton } from "./ui/skeleton";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { RefreshCw } from 'lucide-react';
import axios from "axios";
import '@fortawesome/fontawesome-free/css/all.min.css';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Profile {
  id: string;
  name: string;
  age: number | string;
  profession: string;
  education?: string;
  location: string;
  image: string;
  compatibility?: number;
  verified?: boolean;
  premium?: boolean;
  badge?: string;
  height?: string;
  community?: string;
  gender: string;
}

interface HomeScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onConnect?: (profile: any) => void;
  onLike?: (profile: any) => void;
  onSuperLike?: (profile: any) => void;
}

// Helper function for public fetch (no auth)
const publicFetch = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

// Helper function to fetch profile image
const fetchProfileImage = async (profileId: string): Promise<string> => {
  try {
    const response = await publicFetch(`${BASE_URL}/api/photos/${profileId}`);
    if (response.ok) {
      const photosData = await response.json();
      const mainPhoto = photosData.photos?.find((photo: any) => photo.isMain);
      return mainPhoto?.url || "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg";
    }
  } catch (error) {
    console.error(`Error fetching photo for profile ${profileId}:`, error);
  }
  return "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg";
};

export default function HomeScreen({ onNavigate, onConnect, onLike, onSuperLike }: HomeScreenProps) {
  const [isLoading, setIsLoading] = useState(true);
  const [suggestedMatches, setSuggestedMatches] = useState<Profile[]>([]);
  const [newMatches, setNewMatches] = useState<Profile[]>([]);
  const [recentlyViewed, setRecentlyViewed] = useState<Profile[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  // Mock data for testing
  const mockProfiles: Profile[] = [
    {
      id: "1",
      name: "Sarah Johnson",
      age: 26,
      profession: "Doctor",
      education: "MD, Harvard",
      location: "Boston, MA",
      image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=400",
      gender: "female",
      compatibility: 95,
      verified: true,
      premium: true,
      badge: "Verified",
      height: "5'4\"",
      community: "Not specified",
    },
    {
      id: "2",
      name: "Emily Davis",
      age: 29,
      profession: "Teacher",
      education: "BA, Education",
      location: "New York, NY",
      image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400",
      gender: "female",
      compatibility: 88,
      verified: false,
      premium: false,
      badge: "New",
      height: "5'6\"",
      community: "Not specified",
    },
  ];

  // Helper function for authenticated fetch
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const userProfile = localStorage.getItem("loggedInUser");
    const userData = userProfile ? JSON.parse(userProfile) : null;
    const token = userData?.token || '';
    
    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };

  // Load user from localStorage
  useEffect(() => {
    const fetchUserData = async () => {
      const storedUser = localStorage.getItem('loggedInUser');
      console.log('Raw localStorage loggedInUser:', storedUser);
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          console.log('Parsed user:', parsedUser);

          // Fetch main photo from /api/photos/:userId
          let profileImage = "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg";
          try {
            const response = await authenticatedFetch(`${BASE_URL}/api/photos/${parsedUser.profileId}`);
            console.log('Photos API response:', response);
            if (response.ok) {
              const photosData = await response.json();
              console.log('Photos data:', photosData);
              if (photosData.photos?.length > 0) {
                const mainPhoto = photosData.photos.find((photo: any) => photo.isMain);
                profileImage = mainPhoto?.url || parsedUser.personalInfo?.profileImage || profileImage;
                console.log('Selected main photo URL:', profileImage);
              } else {
                console.warn(`No photos found for profileId: ${parsedUser.profileId}`);
                profileImage = parsedUser.personalInfo?.profileImage || profileImage;
              }
            } else {
              console.warn(`Error fetching photos for profileId: ${parsedUser.profileId}, status: ${response.status}`);
              profileImage = parsedUser.personalInfo?.profileImage || profileImage;
            }
          } catch (photoError) {
            console.error('Error fetching main photo:', photoError);
            profileImage = parsedUser.personalInfo?.profileImage || profileImage;
            console.log('Falling back to:', profileImage);
          }

          setUser({ ...parsedUser, profileImage });
          setIsLoading(false);
        } catch (err) {
          console.error("Error parsing user from localStorage:", err);
          setError("Failed to load user data. Please log in again.");
          setIsLoading(false);
        }
      } else {
        console.warn("No user data in localStorage under 'loggedInUser'");
        setError("No user data found. Please log in.");
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, []);

  // Fetch and filter profiles with photo fetching
  useEffect(() => {
    const fetchProfiles = async () => {
      if (!user) {
        console.warn("No user data available, skipping fetch");
        setIsLoading(false);
        return;
      }

      try {
        console.log('Fetching profiles from:', `${BASE_URL}/api/profiles`);
        const response = await authenticatedFetch(`${BASE_URL}/api/profiles`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log('Fetched profiles:', data);

        const userGender = user?.gender?.toLowerCase();
        console.log('User gender:', userGender);
        const targetGender = userGender === 'male' ? 'female' : userGender === 'female' ? 'male' : null;

        if (!targetGender) {
          throw new Error("User gender not specified. Please update your profile.");
        }

        const filteredProfiles = data.filter((profile: any) =>
          profile.gender.toLowerCase() === targetGender
        );
        console.log('Filtered profiles:', filteredProfiles);

        if (filteredProfiles.length === 0) {
          console.warn(`No ${targetGender} profiles found`);
          const mockFiltered = mockProfiles.filter(p => p.gender.toLowerCase() === targetGender);
          if (mockFiltered.length > 0) {
            console.log('Using mock profiles:', mockFiltered);
            const transformedProfiles = mockFiltered.map(profile => ({ ...profile }));
            const shuffled = transformedProfiles.sort(() => 0.5 - Math.random());
            setSuggestedMatches(shuffled.slice(0, Math.min(2, shuffled.length)));
            setNewMatches(shuffled.slice(2, Math.min(6, shuffled.length)));
            setRecentlyViewed(shuffled.slice(6, Math.min(10, shuffled.length)));
            setIsLoading(false);
            return;
          }
          setError(`No ${targetGender} profiles found.`);
          setIsLoading(false);
          return;
        }

        // Transform profiles with photo fetching
        const transformedProfiles: Profile[] = await Promise.all(
          filteredProfiles.map(async (profile: any) => {
            const mainPhotoUrl = await fetchProfileImage(profile.id);
            
            return {
              id: profile.id,
              name: profile.name,
              age: profile.age,
              profession: profile.profession,
              education: profile.education,
              location: profile.location,
              image: mainPhotoUrl, // Use fetched image
              gender: profile.gender,
              compatibility: Math.floor(Math.random() * 20 + 80),
              verified: profile.verified || false,
              premium: profile.subscription === "premium" || profile.subscription === "premium plus",
              badge: getRandomBadge(),
              height: profile.height || "Not specified",
              community: profile.community || "Not specified",
            };
          })
        );

        console.log('Transformed profiles with photos:', transformedProfiles);

        const shuffled = transformedProfiles.sort(() => 0.5 - Math.random());
        setSuggestedMatches(shuffled.slice(0, Math.min(2, shuffled.length)));
        setNewMatches(shuffled.slice(2, Math.min(6, shuffled.length)));
        setRecentlyViewed(shuffled.slice(6, Math.min(10, shuffled.length)));

        setIsLoading(false);
      } catch (err: any) {
        console.error("Error fetching profiles:", err.message);
        setError(`Failed to load profiles: ${err.message}`);
        setIsLoading(false);
      }
    };

    if (user) {
      fetchProfiles();
    }
  }, [user]);

  const getRandomBadge = () => {
    const badges = ["New", "Just Joined", "Verified"];
    return badges[Math.floor(Math.random() * badges.length)];
  };

  const getBadgeColor = (badge: string) => {
    switch (badge) {
      case "New":
        return "bg-green-500 text-white";
      case "Just Joined":
        return "bg-blue-500 text-white";
      case "Verified":
        return "bg-purple-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  const handleConnectClick = (profile: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onConnect) {
      onConnect(profile);
    } else {
      if (profile.premium && user?.subscription?.current === "premium") {
        onNavigate("messages", { profile });
      } else if (!profile.premium) {
        onNavigate("messages", { profile });
      } else {
        onNavigate("premium");
      }
    }
  };

  // Handle refresh button click
  const handleRefresh = async () => {
    if (user) {
      setIsLoading(true);
      setError(null);
      setSuggestedMatches([]);
      setNewMatches([]);
      setRecentlyViewed([]);
      try {
        console.log('Refreshing profiles from:', `${BASE_URL}/api/profiles`);
        const response = await authenticatedFetch(`${BASE_URL}/api/profiles`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        const userGender = user?.gender?.toLowerCase();
        const targetGender = userGender === 'male' ? 'female' : userGender === 'female' ? 'male' : null;

        if (!targetGender) {
          throw new Error("User gender not specified. Please update your profile.");
        }

        const filteredProfiles = data.filter((profile: any) =>
          profile.gender.toLowerCase() === targetGender
        );

        if (filteredProfiles.length === 0) {
          const mockFiltered = mockProfiles.filter(p => p.gender.toLowerCase() === targetGender);
          if (mockFiltered.length > 0) {
            const transformedProfiles = mockFiltered.map(profile => ({ ...profile }));
            const shuffled = transformedProfiles.sort(() => 0.5 - Math.random());
            setSuggestedMatches(shuffled.slice(0, Math.min(2, shuffled.length)));
            setNewMatches(shuffled.slice(2, Math.min(6, shuffled.length)));
            setRecentlyViewed(shuffled.slice(6, Math.min(10, shuffled.length)));
            setIsLoading(false);
            return;
          }
          setError(`No ${targetGender} profiles found.`);
          setIsLoading(false);
          return;
        }

        // Transform profiles with photo fetching
        const transformedProfiles: Profile[] = await Promise.all(
          filteredProfiles.map(async (profile: any) => {
            const mainPhotoUrl = await fetchProfileImage(profile.id);
            
            return {
              id: profile.id,
              name: profile.name,
              age: profile.age,
              profession: profile.profession,
              education: profile.education,
              location: profile.location,
              image: mainPhotoUrl,
              gender: profile.gender,
              compatibility: Math.floor(Math.random() * 20 + 80),
              verified: profile.verified || false,
              premium: profile.subscription === "premium" || profile.subscription === "premium plus",
              badge: getRandomBadge(),
              height: profile.height || "Not specified",
              community: profile.community || "Not specified",
            };
          })
        );

        const shuffled = transformedProfiles.sort(() => 0.5 - Math.random());
        setSuggestedMatches(shuffled.slice(0, Math.min(2, shuffled.length)));
        setNewMatches(shuffled.slice(2, Math.min(6, shuffled.length)));
        setRecentlyViewed(shuffled.slice(6, Math.min(10, shuffled.length)));
        setIsLoading(false);
      } catch (err: any) {
        console.error("Error refreshing profiles:", err.message);
        setError(`Failed to refresh profiles: ${err.message}`);
        setIsLoading(false);
      }
    }
  };


  // Helper function for profile buttons
const getProfileButtonConfig = (profile: Profile) => {
  const isUserPremium = user?.subscription?.current === "premium" || user?.subscription?.current === "premium plus";
  const isProfilePremium = profile.premium;

  if (isProfilePremium && !isUserPremium) {
    return {
      text: "Upgrade to View",
      variant: "outline" as const,
      className: "border-primary text-primary hover:bg-primary/5",
      onClick: () => onNavigate("premium")
    };
  } else {
    return {
      text: "View Profile",
      variant: "ghost" as const,
      className: "text-primary hover:bg-primary/5",
      onClick: () => onNavigate("profile-detail", profile)
    };
  }
};


  // Add this helper function at the top of your component
const handleProfileNavigation = (profile: Profile) => {
  const isUserPremium = user?.subscription?.current === "premium" || user?.subscription?.current === "premium plus";
  const isProfilePremium = profile.premium;

  // If profile is premium and user is not premium, show premium screen
  if (isProfilePremium && !isUserPremium) {
    onNavigate("premium");
  } else {
    // Otherwise, navigate to profile detail
    onNavigate("profile-detail", profile);
  }
};

  // Function to determine which button to show
  const getConnectButton = (profile: Profile) => {
    const isUserPremium = user?.subscription?.current === "premium" || user?.subscription?.current === "premium plus";
    const isProfilePremium = profile.premium;

    if (isProfilePremium && !isUserPremium) {
      return (
        <Button
          variant="outline"
          className="w-full btn-text-center border-primary text-primary hover:bg-primary/5 rounded-lg sm:rounded-xl py-1 sm:py-2 text-xs sm:text-sm"
          onClick={(e) => {
            e.stopPropagation();
            onNavigate("premium");
          }}
        >
          Upgrade to Connect
        </Button>
      );
    }

    return (
      <Button
        className="w-full btn-text-center bg-primary hover:bg-primary/90 text-white rounded-lg sm:rounded-xl py-1 sm:py-2 text-xs sm:text-sm"
        onClick={(e) => handleConnectClick(profile, e)}
      >
        Connect Now
      </Button>
    );
  };

  const ProfileCard = ({ profile, index }: { profile: Profile; index: number }) => {
  const handleViewProfile = (e: React.MouseEvent) => {
    e.stopPropagation();
    
    const isUserPremium = user?.subscription?.current === "premium" || user?.subscription?.current === "premium plus";
    const isProfilePremium = profile.premium;

    // If profile is premium and user is not premium, show premium screen
    if (isProfilePremium && !isUserPremium) {
      onNavigate("premium");
    } else {
      // Otherwise, navigate to profile detail
      onNavigate("profile-detail", profile);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="w-full mx-auto"
    >
      <Card
        className="cursor-pointer hover-scale tap-scale rounded-2xl shadow-md bg-gradient-to-br from-white to-gray-50 border border-gray-100 overflow-hidden w-full"
        onClick={handleViewProfile} // Use the new handler
      >
        <div className="relative">
          <div className="aspect-[3/4] overflow-hidden bg-gray-100">
            <ImageWithFallback
              src={profile.image}
              alt={profile.name}
              className="w-full h-full object-cover"
              fallbackSrc="https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg"
            />
          </div>
          
          {/* {profile.premium && (
            <div className="absolute top-3 right-3">
              <Badge className="bg-primary text-white text-xs px-2 py-1 rounded-full">
                Premium
              </Badge>
            </div>
          )} */}
        </div>

        <CardContent className="p-2 sm:p-3 md:p-4">
          <div className="space-y-1 sm:space-y-2 mb-2 sm:mb-4">
            <h4 className="text-sm sm:text-base text-foreground truncate text-center">
              {profile.name}, {profile.age}
            </h4>

            <div className="space-y-0.5 sm:space-y-1 text-xs sm:text-sm text-muted-foreground text-center">
              <div className="text-center">
                <span className="truncate">{profile.height} • {profile.community}</span>
              </div>

              <div className="text-center">
                <span className="truncate">{profile.location}</span>
              </div>
            </div>
          </div>

          {getConnectButton(profile)}
        </CardContent>
      </Card>
    </motion.div>
  );
};

  if (isLoading) {
    console.log('Rendering HomeScreenSkeleton');
    return <HomeScreenSkeleton />;
  }

  if (error) {
    console.log('Rendering error state:', error);
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 text-sm sm:text-base mb-4">{error}</p>
          <Button onClick={handleRefresh} className="bg-primary hover:bg-primary/90">
            <RefreshCw className="w-4 h-4 mr-2" />
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  console.log('Rendering main content', { suggestedMatches, newMatches, recentlyViewed });

  return (
    <div className="min-h-screen bg-background">
      <style jsx>{`
        .custom-grid {
          display: grid;
          gap: 0.5rem;
        }
        @media (max-width: 639px) {
          .custom-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 640px) {
          .custom-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
        @media (min-width: 1024px) {
          .custom-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (min-width: 320px) {
          .profile-header {
            padding: 0.5rem;
          }
          .profile-header .avatar {
            width: 2.5rem;
            height: 2.5rem;
          }
          .profile-header h1 {
            font-size: 0.9rem;
          }
          .profile-header .badge {
            font-size: 0.65rem;
            padding: 0.25rem 0.5rem;
          }
          .section-title {
            font-size: 1rem;
          }
          .section-button {
            font-size: 0.75rem;
            padding: 0.25rem 0.5rem;
          }
          .today-match-card {
            padding: 0.5rem;
          }
          .today-match-card .avatar {
            width: 2.5rem;
            height: 2.5rem;
          }
          .today-match-card h4 {
            font-size: 0.85rem;
          }
          .today-match-card p {
            font-size: 0.7rem;
          }
          .today-match-card .badge {
            font-size: 0.65rem;
          }
          .today-match-card .view-profile {
            font-size: 0.7rem;
            padding: 0.25rem 0.5rem;
          }
        }
        @media (min-width: 640px) {
          .profile-header {
            padding: 1rem;
          }
          .profile-header .avatar {
            width: 3rem;
            height: 3rem;
          }
          .profile-header h1 {
            font-size: 1.125rem;
          }
          .profile-header .badge {
            font-size: 0.75rem;
            padding: 0.3rem 0.6rem;
          }
          .section-title {
            font-size: 1.25rem;
          }
          .section-button {
            font-size: 0.875rem;
            padding: 0.3rem 0.75rem;
          }
          .today-match-card {
            padding: 1rem;
          }
          .today-match-card .avatar {
            width: 3.5rem;
            height: 3.5rem;
          }
          .today-match-card h4 {
            font-size: 1rem;
          }
          .today-match-card p {
            font-size: 0.875rem;
          }
          .today-match-card .badge {
            font-size: 0.75rem;
          }
          .today-match-card .view-profile {
            font-size: 0.875rem;
            padding: 0.3rem 0.75rem;
          }
        }
        @media (min-width: 1024px) {
          .profile-header {
            padding: 1.25rem;
          }
          .profile-header .avatar {
            width: 3.5rem;
            height: 3.5rem;
          }
          .profile-header h1 {
            font-size: 1.25rem;
          }
          .section-title {
            font-size: 1.5rem;
          }
          .section-button {
            font-size: 1rem;
            padding: 0.4rem 1rem;
          }
          .today-match-card {
            padding: 1.25rem;
          }
          .today-match-card .avatar {
            width: 4rem;
            height: 4rem;
          }
          .today-match-card h4 {
            font-size: 1.125rem;
          }
          .today-match-card p {
            font-size: 1rem;
          }
          .today-match-card .view-profile {
            font-size: 1rem;
            padding: 0.4rem 1rem;
          }
        }
      `}</style>

      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border/50"
      >
        <div className="flex items-center justify-between profile-header">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Avatar
              className="avatar border-2 border-primary/20 cursor-pointer hover-scale"
              onClick={() => onNavigate("my-profile")}
            >
              <AvatarImage
                src={user?.profileImage || "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg"}
                onError={(e) => {
                  console.error('Image load error:', user?.profileImage);
                  e.currentTarget.src = "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg";
                }}
              />
              <AvatarFallback>{user?.name?.[0] || "U"}</AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center space-x-1 sm:space-x-2">
                <h1 className="text-foreground">{user?.name || "User"}</h1>
                <Badge variant="outline" className="badge">
                  {user?.subscription?.current || "Free"}
                </Badge>
              </div>
              <Button
                variant="link"
                className="p-0 h-auto text-primary text-xs sm:text-sm hover-scale btn-text-left"
                onClick={() => onNavigate("edit-profile")}
              >
                Edit Profile
              </Button>
            </div>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              className="relative hover-scale btn-spacing-sm"
              disabled={isLoading}
            >
              <RefreshCw className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="ml-1 sm:ml-2">Refresh</span>
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("notifications")}
              className="relative hover-scale btn-spacing-sm"
            >
              <svg
                className="absolute -top-0.5 sm:-top-1 -right-0.5 sm:-right-1 w-5 sm:w-6 h-5 sm:h-6 text-primary"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="pb-nav">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-2 sm:p-3 md:p-4"
        >
          <img
            src="https://www.bonobology.com/wp-content/uploads/2017/10/indian-wedding-600x290.jpg"
            alt="Indian Wedding"
            className="w-full h-40 sm:h-32 md:h-40 rounded-xl sm:rounded-2xl shadow-lg object-cover"
          />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-2 sm:p-3 md:p-4"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h2 className="section-title text-foreground">New Matches</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("matches")}
              className="section-button text-primary hover-scale btn-text-center"
            >
              See All
            </Button>
          </div>

          <div className="custom-grid">
            {newMatches.length > 0 ? (
              newMatches.map((profile, index) => (
                <ProfileCard key={profile.id} profile={profile} index={index} />
              ))
            ) : (
              <p className="text-muted-foreground text-xs sm:text-sm">No new matches available.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-2 sm:p-3 md:p-4"
        >
          <div className="flex items-center justify-between mb-2 sm:mb-4">
            <h2 className="section-title text-foreground">Today's Matches</h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigate("matches")}
              className="section-button text-primary hover-scale btn-text-center"
            >
              View All
            </Button>
          </div>

          <div className="space-y-2 sm:space-y-3">
            {suggestedMatches.length > 0 ? (
              suggestedMatches.map((match) => (
                <Card
  key={match.id}
  className="today-match-card cursor-pointer hover-scale tap-scale rounded-xl sm:rounded-2xl shadow-sm"
  onClick={(e) => {
    e.stopPropagation();
    const isUserPremium = user?.subscription?.current === "premium" || user?.subscription?.current === "premium plus";
    const isProfilePremium = match.premium;

    // If profile is premium and user is not premium, show premium screen
    if (isProfilePremium && !isUserPremium) {
      onNavigate("premium");
    } else {
      // Otherwise, navigate to profile detail
      onNavigate("profile-detail", match);
    }
  }}
>
  <CardContent className="p-2 sm:p-3 md:p-4 flex items-center space-x-2 sm:space-x-4">
    <Avatar className="avatar border-2 border-primary/20">
      <AvatarImage 
        src={match.image} 
        onError={(e) => {
          e.currentTarget.src = "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg";
        }}
      />
      <AvatarFallback>{match.name[0]}</AvatarFallback>
    </Avatar>
    <div className="flex-1">
      <div className="flex items-center justify-between">
        <h4 className="text-base">{match.name}, {match.age}</h4>
        {/* {match.premium && (
          <Badge className="bg-primary text-white text-xs px-2 py-1">
            Premium
          </Badge>
        )} */}
      </div>
      <p className="text-xs sm:text-sm text-muted-foreground">{match.profession}</p>
      <p className="text-[0.65rem] sm:text-xs text-muted-foreground">{match.location}</p>
    </div>
   <Button
  variant="ghost"
  size="sm"
  className="view-profile text-primary hover-scale btn-text-center"
  onClick={(e) => {
    e.stopPropagation();
    const isUserPremium = user?.subscription?.current === "premium" || user?.subscription?.current === "premium plus";
    const isProfilePremium = match.premium;

    // If profile is premium and user is not premium, show premium screen
    if (isProfilePremium && !isUserPremium) {
      onNavigate("premium");
    } else {
      // Otherwise, navigate to profile detail
      onNavigate("profile-detail", match);
    }
  }}
>
  {(() => {
    const isUserPremium = user?.subscription?.current === "premium" || user?.subscription?.current === "premium plus";
    const isProfilePremium = match.premium;
    
    if (isProfilePremium && !isUserPremium) {
      return "Upgrade to View";
    } else {
      return "View Profile";
    }
  })()}
</Button>
  </CardContent>
</Card>
              ))
            ) : (
              <p className="text-muted-foreground text-xs sm:text-sm">No matches available today.</p>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4 sm:p-3 md:p-4 text-center"
        >
          <p className="mt-4 text-base sm:text-lg md:text-xl font-semibold text-red-500 mb-2 hover:text-red-600 transition-colors duration-200 cursor-pointer">Follow us on</p>
       <div className="flex justify-center space-x-4">
  <a href="https://www.instagram.com/sindhuura_com?igsh=aTdkdHhnM3Y2czM5" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200">
    <div style={{ background: 'linear-gradient(to right, #833AB4, #FD1D1D, #FCB045)' }} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md">
      <i className="fab fa-instagram text-white text-xl sm:text-2xl"></i>
    </div>
  </a>
  <a href="https://www.youtube.com/@sindhuuracom" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200">
    <div style={{ background: '#FF0000' }} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md">
      <i className="fab fa-youtube text-white text-xl sm:text-2xl"></i>
    </div>
  </a>
  <a href="https://www.facebook.com/people/Sindhuuracom/61579646001824/?rdid=nPKI1luGnhBq5Zgi&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F1BBQykHVkB%2F" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200">
    <div style={{ background: '#1877F2' }} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md">
      <i className="fab fa-facebook-f text-white text-xl sm:text-2xl"></i>
    </div>
  </a>
  <a href="https://www.threads.net/@sindhuuracom" target="_blank" rel="noopener noreferrer" className="hover:scale-110 transition-transform duration-200">
    <div style={{ background: 'linear-gradient(to right, #000000, #4A4A4A)' }} className="w-12 h-12 sm:w-16 sm:h-16 rounded-full flex items-center justify-center shadow-md">
      <i className="fab fa-threads text-white text-xl sm:text-2xl"></i>
    </div>
  </a>
</div>
        </motion.div>
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css" />
      </div>
    </div>
  );
}

function HomeScreenSkeleton() {
  return (
    <div className="min-h-screen bg-background">
      <div className="p-2 sm:p-3 md:p-4 border-b">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 sm:space-x-3">
            <Skeleton className="w-10 sm:w-12 h-10 sm:h-12 rounded-full" />
            <div>
              <Skeleton className="w-20 sm:w-24 h-3 sm:h-4 mb-1" />
              <Skeleton className="w-16 sm:w-20 h-2.5 sm:h-3" />
            </div>
          </div>
          <Skeleton className="w-16 sm:w-20 h-6 sm:h-8 rounded" />
        </div>
      </div>

      <div className="p-2 sm:p-3 md:p-4 space-y-4 sm:space-y-6 pb-nav">
        <Skeleton className="w-full h-24 sm:h-32 md:h-40 rounded-xl sm:rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="space-y-1 sm:space-y-2">
              <Skeleton className="w-full aspect-[3/4] rounded-xl sm:rounded-2xl" />
              <Skeleton className="w-full h-3 sm:h-4" />
              <Skeleton className="w-3/4 h-2.5 sm:h-3" />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}