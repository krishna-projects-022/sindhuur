import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from "./figma/ImageWithFallback";
import { Link } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Profile {
  id: string;
  name: string;
  age: number | string;
  profession: string;
  education: string;
  location: string;
  image: string;
  isOnline?: boolean;
  interests?: string[];
  religion?: string;
  community?: string;
  income?: string;
  photos?: number;
  subscription?: string;
  viewCount?: number;
  interestsReceived?: number;
  gender?: string;
}

interface DiscoverTabProps {
  user: any;
  onNavigate: (screen: string, data?: any) => void;
  onLike?: (profile: any) => void;
  onSuperLike?: (profile: any) => void;
}

// Simple Pop-Up Component
const PopUp = ({ message, onClose }: { message: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0, y: -50 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -50 }}
    className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-white rounded-lg shadow-xl p-4 border border-gray-200"
  >
    <div className="flex items-center justify-between">
      <p className="text-sm text-foreground">{message}</p>
      <Button variant="ghost" size="sm" className="ml-4" onClick={onClose}>
        Close
      </Button>
    </div>
  </motion.div>
);

export default function DiscoverTab({ user, onNavigate, onLike, onSuperLike }: DiscoverTabProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [likedProfiles, setLikedProfiles] = useState<Set<string>>(new Set());
  const [userGender, setUserGender] = useState<string | null>(null);
  const [popUpMessage, setPopUpMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>("free");

  // Utility to calculate age from dateOfBirth
  const calculateAge = (dateOfBirth: string): number => {
    if (!dateOfBirth || dateOfBirth === "Not specified") return 0;
    const birthDate = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  // Helper function for authenticated fetch
  const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
    const userProfile = localStorage.getItem("loggedInUser");
    const userData = userProfile ? JSON.parse(userProfile) : null;
    const token = userData?.token || '';
    console.log(`DiscoverTab - Using token for fetch: ${token ? "Token present" : "No token"}`);

    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });
  };

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

  // Fetch liked profiles
  const fetchLikedProfiles = async (profileId: string) => {
    try {
      console.log(`DiscoverTab - Fetching liked profiles for profileId: ${profileId}`);
      const response = await authenticatedFetch(`${BASE_URL}/api/interested-profiles?userProfileId=${profileId}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch liked profiles");
      }
      const interestsData = await response.json();
      console.log("DiscoverTab - Fetched liked profiles:", interestsData);
      const likedProfileIds = new Set(interestsData.map((p: any) => p.id) || []);
      setLikedProfiles(likedProfileIds);
    } catch (error: any) {
      console.warn("DiscoverTab - Failed to fetch liked profiles:", error.message);
      setFetchError("Failed to load liked profiles. Please try again.");
    }
  };

  // Increment profile view count
  const handleProfileView = async (profileId: string) => {
    try {
      console.log(`DiscoverTab - Incrementing view count for profileId: ${profileId}`);
      const response = await authenticatedFetch(`${BASE_URL}/api/increment-profile-views`, {
        method: "POST",
        body: JSON.stringify({ profileId }),
      });
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to increment profile views");
      }
      console.log(`DiscoverTab - Successfully incremented view count for profileId: ${profileId}`);
    } catch (error: any) {
      console.error("DiscoverTab - Error incrementing profile views:", error.message);
    }
  };

  // Handle like profile - UPDATED
  const handleLikeProfile = async (profile: Profile, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      console.log(`DiscoverTab - ${likedProfiles.has(profile.id) ? "Removing" : "Sending"} interest for profile: ${profile.id}`);
      const userProfile = localStorage.getItem("loggedInUser");
      const userData = userProfile ? JSON.parse(userProfile) : null;
      const profileId = userData?.profileId;
      if (!profileId) {
        console.error("DiscoverTab - No profileId found in localStorage");
        setPopUpMessage("Please log in to send interest.");
        return;
      }

      // If already liked, remove interest
      if (likedProfiles.has(profile.id)) {
        const response = await authenticatedFetch(`${BASE_URL}/api/remove-interest`, {
          method: "DELETE",
          body: JSON.stringify({
            userProfileId: profileId,
            interestedProfileId: profile.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to remove interest");
        }

        const updatedLikedProfiles = new Set(likedProfiles);
        updatedLikedProfiles.delete(profile.id);
        setLikedProfiles(updatedLikedProfiles);
        setPopUpMessage(`Interest removed for ${profile.name}`);
        console.log(`DiscoverTab - Successfully removed interest for profile: ${profile.id}`);
      } else {
        // Send new interest
        const response = await authenticatedFetch(`${BASE_URL}/api/send-interest`, {
          method: "POST",
          body: JSON.stringify({
            userProfileId: profileId,
            interestedProfileId: profile.id,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error || "Failed to send interest");
        }

        const updatedLikedProfiles = new Set(likedProfiles);
        updatedLikedProfiles.add(profile.id);
        setLikedProfiles(updatedLikedProfiles);
        setPopUpMessage(`Interest sent to ${profile.name}`);
        if (onLike) onLike(profile);
        console.log(`DiscoverTab - Successfully sent interest for profile: ${profile.id}`);
      }
    } catch (error: any) {
      console.error("DiscoverTab - Error handling interest:", error.message);
      setPopUpMessage(error.message || "Failed to handle interest");
    }
  };

  // Handle pass profile - UPDATED
  const handlePassProfile = async (profile: Profile, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      console.log(`DiscoverTab - Passing profile and removing interest: ${profile.id}`);
      const userProfile = localStorage.getItem("loggedInUser");
      const userData = userProfile ? JSON.parse(userProfile) : null;
      const profileId = userData?.profileId;

      if (profileId && likedProfiles.has(profile.id)) {
        // Remove interest if it exists
        const response = await authenticatedFetch(`${BASE_URL}/api/remove-interest`, {
          method: "DELETE",
          body: JSON.stringify({
            userProfileId: profileId,
            interestedProfileId: profile.id,
          }),
        });

        if (!response.ok) {
          console.warn("DiscoverTab - Failed to remove interest when passing, but continuing with pass");
        } else {
          console.log(`DiscoverTab - Successfully removed interest when passing profile: ${profile.id}`);
        }
      }

      // Remove from local state regardless
      const updatedLikedProfiles = new Set(likedProfiles);
      updatedLikedProfiles.delete(profile.id);
      setLikedProfiles(updatedLikedProfiles);
      setProfiles(profiles.filter((p) => p.id !== profile.id));
      
    } catch (error: any) {
      console.error("DiscoverTab - Error passing profile:", error.message);
      // Still remove from local state even if API call fails
      setProfiles(profiles.filter((p) => p.id !== profile.id));
    }
  };

  // Fetch profiles with gender and subscription filtering
  const fetchProfiles = async (profileId: string, userGender: string | null, subscriptionStatus: string) => {
    try {
      console.log(`DiscoverTab - Fetching profiles from: ${BASE_URL}/api/profiles`);
      const profilesResponse = await authenticatedFetch(`${BASE_URL}/api/profiles`);
      if (!profilesResponse.ok) {
        const errorData = await profilesResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch profiles");
      }
      const profilesData = await profilesResponse.json();
      console.log("DiscoverTab - Raw profiles data:", profilesData);

      const targetGender = userGender === "male" ? "female" : userGender === "female" ? "male" : undefined;

      const fetchedProfiles: Profile[] = await Promise.all(
        profilesData.map(async (profile: any) => {
          try {
            // Fetch main photo for profile image
            const photosResponse = await publicFetch(`${BASE_URL}/api/photos/${profile.id}`);
            let mainPhotoUrl = "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg";
            if (photosResponse.ok) {
              const photosData = await photosResponse.json();
              const mainPhoto = photosData.photos?.find((photo: any) => photo.isMain);
              mainPhotoUrl = mainPhoto?.url || profile.image || mainPhotoUrl;
            }

            return {
              id: profile.id || "Not specified",
              name: profile.name || "Not specified",
              age: profile.age || "Not specified",
              profession: profile.profession || "Not specified",
              education: profile.education || "Not specified",
              location: profile.location || "Not specified",
              image: mainPhotoUrl,
              isOnline: false, // No status field in API; default to false (shows "New")
              interests: profile.horoscope?.generated ? ["Horoscope Available"] : [],
              religion: profile.religion || "Not specified",
              community: profile.community || "Not specified",
              income: profile.income || "Not specified",
              photos: profile.photos || 0,
              subscription: profile.subscription || "free",
              viewCount: profile.viewCount || 0,
              interestsReceived: profile.interestsReceived || 0,
              gender: profile.gender || "Not specified",
            };
          } catch (error) {
            console.error(`DiscoverTab - Error fetching photo for profile ${profile.id}:`, error);
            return {
              id: profile.id || "Not specified",
              name: profile.name || "Not specified",
              age: profile.age || "Not specified",
              profession: profile.profession || "Not specified",
              education: profile.education || "Not specified",
              location: profile.location || "Not specified",
              image: "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg",
              isOnline: false, // No status field in API
              interests: profile.horoscope?.generated ? ["Horoscope Available"] : [],
              religion: profile.religion || "Not specified",
              community: profile.community || "Not specified",
              income: profile.income || "Not specified",
              photos: profile.photos || 0,
              subscription: profile.subscription || "free",
              viewCount: profile.viewCount || 0,
              interestsReceived: profile.interestsReceived || 0,
              gender: profile.gender || "Not specified",
            };
          }
        })
      );

      const filteredProfiles = fetchedProfiles
        .filter((profile: any) => {
          if (!profile.id) {
            console.warn("DiscoverTab - Profile missing id:", profile);
            return false;
          }
          // Exclude current user's profile
          if (profileId && profile.id === profileId) return false;
          // Filter by target gender if specified
          if (targetGender && profile.gender !== targetGender) return false;
          // Filter by subscription status (free users see only free and premium, premium users see all)
          if (subscriptionStatus === "free") {
            return profile.subscription === "free" || profile.subscription === "premium";
          }
          return true;
        })
        .sort((a: Profile, b: Profile) => {
          const aScore = (a.isOnline ? 100 : 0) + (a.subscription === "premium plus" ? 50 : a.subscription === "premium" ? 25 : 0);
          const bScore = (b.isOnline ? 100 : 0) + (b.subscription === "premium plus" ? 50 : b.subscription === "premium" ? 25 : 0);
          return bScore - aScore;
        });

      console.log("DiscoverTab - Filtered profiles:", filteredProfiles);
      setProfiles(filteredProfiles);
      setFetchError(null);
    } catch (error: any) {
      console.error("DiscoverTab - Error fetching profiles:", error.message);
      setFetchError(error.message || "Failed to fetch profiles");
      setPopUpMessage(error.message || "Failed to fetch profiles");
    } finally {
      setIsLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    const initialize = async () => {
      console.log("DiscoverTab - Initializing with user:", user);
      const userProfile = localStorage.getItem("loggedInUser");
      const userData = userProfile ? JSON.parse(userProfile) : null;
      const profileId = userData?.profileId || user?.profileId || "anonymous";
      const gender = userData?.gender || user?.gender || null;
      const subscription = userData?.subscription?.current || user?.subscription?.current || "free";

      console.log("DiscoverTab - Profile ID:", profileId);
      console.log("DiscoverTab - User Gender:", gender);
      console.log("DiscoverTab - Subscription Status:", subscription);

      setUserGender(gender);
      setSubscriptionStatus(subscription);
      setIsLoading(true);
      await fetchProfiles(profileId, gender, subscription);
      await fetchLikedProfiles(profileId);
    };

    initialize();
  }, [user]);

  // Badge color logic
  const getBadgeColor = (status: string) => {
    switch (status) {
      case "Online":
        return "bg-green-500 text-white";
      case "New":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };


  const handleProfileClick = (profile: Profile) => {
    console.log(`DiscoverTab - Navigating to profile-detail with ID: ${profile.id}`);
    handleProfileView(profile.id).finally(() => {
      onNavigate("profile-detail", { id: profile.id });
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-4 pb-20"
    >
      {fetchError && (
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-destructive/10 text-destructive p-4 rounded-lg mb-4 text-center"
        >
          {fetchError}
        </motion.div>
      )}

      {popUpMessage && (
        <PopUp
          message={popUpMessage}
          onClose={() => setPopUpMessage(null)}
        />
      )}

      {isLoading && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex justify-center items-center h-64"
        >
          <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </motion.div>
      )}

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="mb-6"
      >
        {/* <Card className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl shadow-lg">
          <CardContent className="p-6 text-center">
            <h2 className="text-2xl mb-2">Unlock Premium Features</h2>
            <p className="text-sm mb-4">See who liked you, get unlimited likes, and connect instantly with Premium features</p>
            <Button
              variant="secondary"
              className="bg-white text-purple-600 hover:bg-gray-100 rounded-xl btn-text-center"
              onClick={(e) => {
                e.stopPropagation();
                onNavigate("premium");
              }}
            >
              Upgrade Now
            </Button>
          </CardContent>
        </Card> */}
      </motion.div>

      <div className="space-y-6">
        {profiles.length === 0 && !fetchError && !isLoading && (
          <div className="text-center text-muted-foreground p-4">
            No profiles available. Try liking some profiles!
          </div>
        )}
        {profiles.map((profile, index) => (
          <motion.div
            key={profile.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <Card
              className="cursor-pointer hover-scale tap-scale rounded-2xl overflow-hidden shadow-lg"
              onClick={() => handleProfileClick(profile)}
            >
              <div className="relative">
                <div className="h-80 overflow-hidden">
                  <ImageWithFallback
                    src={profile.image}
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    fallbackSrc="https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg"
                  />
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent"></div>
                {/* <div className="absolute top-4 left-4">
                  <Badge className={`${getBadgeColor(profile.isOnline ? "Online" : "New")} text-xs px-3 py-1`}>
                    {profile.isOnline ? "Online" : "New"}
                  </Badge>
                </div> */}
                <div className="absolute top-4 right-4 flex flex-col space-y-2">
                  {profile.subscription && profile.subscription !== "free" && (
                    <Badge className="bg-primary text-white text-xs px-2 py-1">
                      {profile.subscription === "premium" ? "Premium" : "Premium+"}
                    </Badge>
                  )}
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 text-white">
                  <div className="text-center">
                    <h3 className="text-xl mb-1">{profile.name}, {profile.age}</h3>
                    <p className="text-sm opacity-90 mb-1">{profile.profession}</p>
                    <p className="text-xs opacity-75 mb-2">{profile.location}</p>
                    {profile.interests && profile.interests.length > 0 && (
                      <p className="text-xs">Interests: {profile.interests.join(", ")}</p>
                    )}
                  </div>
                </div>
              </div>
              <CardContent className="p-4">
                <div className="flex items-center justify-center space-x-4 mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 btn-text-center border-gray-300 hover:border-gray-400 hover-scale tap-scale"
                    onClick={(e) => handlePassProfile(profile, e)}
                  >
                    Pass
                  </Button>
                  <Button
                    size="sm"
                    className={`flex-1 btn-text-center ${
                      likedProfiles.has(profile.id)
                        ? "bg-gray-500 hover:bg-gray-600"
                        : "bg-primary hover:bg-primary/90"
                    } text-white hover-scale tap-scale`}
                    onClick={(e) => handleLikeProfile(profile, e)}
                  >
                    {likedProfiles.has(profile.id) ? "Unlike" : "Like"}
                  </Button>
                  {/* <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 btn-text-center border-blue-300 hover:border-blue-400 hover-scale tap-scale"
                    onClick={(e) => handleSuperLikeProfile(profile, e)}
                  >
                    Super Like
                  </Button> */}
                </div>
                <Button
                  variant="ghost"
                  className="w-full mt-2 text-yellow-600 hover:bg-yellow-50"
                  onClick={() => handleProfileClick(profile)}
                >
                  View Profile
                </Button>
                <div className="text-center">
                  <div className="flex flex-wrap justify-center gap-2">
                    {profile.interests?.slice(0, 3).map((interest, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {interest}
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8 }}
        className="text-center mt-8"
      >
        <Button
          variant="outline"
          className="rounded-xl px-8 btn-text-center"
          onClick={async () => {
            console.log("DiscoverTab - Loading more profiles...");
            const userProfile = localStorage.getItem("loggedInUser");
            const userData = userProfile ? JSON.parse(userProfile) : null;
            const profileId = userData?.profileId || "anonymous";
            setIsLoading(true);
            await fetchProfiles(profileId, userGender, subscriptionStatus);
            await fetchLikedProfiles(profileId);
            console.log("DiscoverTab - Load more profiles completed, profiles:", profiles);
          }}
        >
          Load More Profiles
        </Button>
      </motion.div>
    </motion.div>
  );
}