import { motion } from "framer-motion";
import { ArrowLeft, Heart, MessageCircle, Star, Crown, MapPin, Briefcase, GraduationCap, Share2, Flag, MessageSquare, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from './figma/ImageWithFallback';
import { useState, useEffect, useMemo } from "react";
import { useToast } from "@/components/hooks/use-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { useChat } from "@/components/hooks/useChat";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const authenticatedFetch = async (url: string, options: RequestInit = {}) => {
  const token = localStorage.getItem("token") || '';
  if (!token) {
    throw new Error('Authentication token missing. Please log in.');
  }
  return fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

const publicFetch = async (url: string, options: RequestInit = {}) => {
  return fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });
};

interface ProfileDetailScreenProps {
  profile?: any;
  onBack: () => void;
  onNavigate?: (screen: string, data?: any) => void;
}

export default function ProfileDetailScreen({ profile: propProfile, onBack, onNavigate }: ProfileDetailScreenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { onlineUsers, setReceiverId } = useChat();
  const [profileData, setProfileData] = useState<any>(null);
  const [photos, setPhotos] = useState<any[]>([]);
  const [photosError, setPhotosError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isReportModalOpen, setIsReportModalOpen] = useState(false);
  const [reportReason, setReportReason] = useState("");
  const [reportCategory, setReportCategory] = useState("");
  const [reportMessage, setReportMessage] = useState("");
  const [isReported, setIsReported] = useState(false);

  const userProfile = localStorage.getItem("loggedInUser");
  const userData = useMemo(() => (userProfile ? JSON.parse(userProfile) : null), [userProfile]);
  const isPremium = userData?.subscription?.current === "premium" || 
                   userData?.subscription?.current === "premium plus";

  console.log("ProfileDetailScreen - isPremium:", isPremium, "subscription:", userData?.subscription);
  const profileId = useMemo(() => {
    const id = propProfile?.id || propProfile?.profileId || location.state?.id || location.state?.state?.id || location.state?.profileId || location.state?.state?.profileId;
    if (!id) {
      const pathParts = location.pathname.split("/");
      return pathParts[pathParts.length - 1];
    }
    return id;
  }, [propProfile, location.state, location.pathname]);

  useEffect(() => {
    const fetchProfileAndReportStatus = async () => {
      if (!profileId) {
        console.error("No profile ID provided");
        setError("No profile selected. Please go back and try again.");
        setLoading(false);
        return;
      }

      if (!userData?.token) {
        console.error("No authentication token found");
        setError("Authentication required. Please log in.");
        toast({
          title: "Authentication Error",
          description: "Please log in to view this profile.",
          variant: "destructive",
        });
        navigate('/login');
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        // Fetch profile details
        console.log("Fetching profile details for ID:", profileId);
        const profileResponse = await authenticatedFetch(`${BASE_URL}/api/user-profile?profileId=${profileId}`);
        if (!profileResponse.ok) {
          const errorData = await profileResponse.json().catch(() => ({}));
          throw new Error(errorData.error || `Failed to fetch profile: ${profileResponse.status}`);
        }
        const fetchedProfile = await profileResponse.json();
        console.log("Raw profile API response:", JSON.stringify(fetchedProfile, null, 2));
        if (!fetchedProfile.user) {
          throw new Error("Invalid profile response: user object missing");
        }

        // Fetch photos
        console.log("Fetching photos for userId:", profileId);
        const photosResponse = await publicFetch(`${BASE_URL}/api/photos/${profileId}`);
        let fetchedPhotos: any[] = [];
        if (!photosResponse.ok) {
          const errorData = await photosResponse.json().catch(() => ({}));
          console.error("Photos fetch error:", errorData.error || `Status ${photosResponse.status}`);
          setPhotosError(isPremium ? (errorData.error || "Failed to fetch photos") : "Upgrade to Premium or Premium Plus to view additional photos.");
        } else {
          const photosData = await photosResponse.json();
          console.log("Raw photos API response:", JSON.stringify(photosData, null, 2));
          fetchedPhotos = Array.isArray(photosData.photos)
            ? photosData.photos.map((photo: any) => ({
                ...photo,
                id: photo._id || photo.id,
              }))
            : [];
          setPhotosError(isPremium ? null : "Upgrade to Premium or Premium Plus to view additional photos.");
        }
        setPhotos(fetchedPhotos);

        // Find the main photo
        const mainPhoto = fetchedPhotos.find((photo) => photo.isMain)?.url || fetchedProfile.user.image || fetchedProfile.user.profilePicture || "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg";

        const mappedProfile = {
          id: fetchedProfile.user.profileId,
          name: fetchedProfile.user.name || "Not specified",
          gender: fetchedProfile.user.gender || "Not specified",
          age: fetchedProfile.user.dateOfBirth && fetchedProfile.user.dateOfBirth !== "Not specified"
            ? Math.floor((new Date() - new Date(fetchedProfile.user.dateOfBirth)) / (1000 * 60 * 60 * 24 * 365))
            : "Not specified",
          profession: fetchedProfile.user.occupation || "Not specified",
          location: fetchedProfile.user.city && fetchedProfile.user.state
            ? `${fetchedProfile.user.city}, ${fetchedProfile.user.state}`
            : fetchedProfile.user.city || "Not specified",
          education: fetchedProfile.user.education || "Not specified",
          community: fetchedProfile.user.community || "Not specified",
          religion: fetchedProfile.user.religion || "Not specified",
          income: fetchedProfile.user.income || "Not specified",
          horoscope: fetchedProfile.user.horoscope?.generated || false,
          image: mainPhoto,
          photos: fetchedProfile.user.photos || 0,
          subscription: fetchedProfile.user.subscription || "free",
          status: fetchedProfile.user.Status || "inactive",
          familyInfo: {
            fatherOccupation: fetchedProfile.user.fatherOccupation || "Not specified",
            motherOccupation: fetchedProfile.user.motherOccupation || "Not specified",
            siblings: fetchedProfile.user.siblings || "Not specified",
          },
          personalInfo: {
            height: fetchedProfile.user.height || "Not specified",
            maritalStatus: fetchedProfile.user.maritalStatus || "Not specified",
            languages: fetchedProfile.user.languages || [],
          },
          interests: fetchedProfile.user.hobbies?.split(", ") || [],
          bio: fetchedProfile.user.hobbies || "No bio available",
          rating: "No rating",
          messages: 0,
        };
        setProfileData(mappedProfile);

        // Fetch report status
        const reportingUserId = userData.profileId || "anonymous";
        const reportStatusResponse = await authenticatedFetch(
          `${BASE_URL}/api/report-status?reportingUserId=${reportingUserId}&reportedProfileId=${profileId}`
        );
        if (reportStatusResponse.ok) {
          const reportStatus = await reportStatusResponse.json();
          setIsReported(reportStatus.hasReported);
        } else {
          console.error("Error fetching report status:", reportStatusResponse.status);
        }
      } catch (error: any) {
        console.error("Error fetching profile:", error.message);
        try {
          console.log("Falling back to /api/profiles");
          const profilesResponse = await authenticatedFetch(`${BASE_URL}/api/profiles`);
          if (!profilesResponse.ok) {
            const errorData = await profilesResponse.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to fetch profiles: ${profilesResponse.status}`);
          }
          const profiles = await profilesResponse.json();
          const matchedProfile = profiles.find((p: any) => p.id === profileId || p.profileId === profileId);
          if (!matchedProfile) {
            throw new Error("Profile not found in /api/profiles");
          }
          console.log("Fallback profile found:", JSON.stringify(matchedProfile, null, 2));
          setProfileData({
            ...matchedProfile,
            id: matchedProfile.id || matchedProfile.profileId,
            name: matchedProfile.name || "Not specified",
            image: matchedProfile.image || "https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg",
            familyInfo: {
              fatherOccupation: matchedProfile.fatherOccupation || "Not specified",
              motherOccupation: matchedProfile.motherOccupation || "Not specified",
              siblings: matchedProfile.siblings || "Not specified",
            },
            personalInfo: {
              height: matchedProfile.height || "Not specified",
              maritalStatus: matchedProfile.maritalStatus || "Not specified",
              languages: matchedProfile.languages || [],
            },
            interests: matchedProfile.interests || (matchedProfile.hobbies?.split(", ") || []),
            bio: matchedProfile.bio || matchedProfile.hobbies || "No bio available",
            rating: matchedProfile.rating || "No rating",
            messages: matchedProfile.messages || 0,
            subscription: matchedProfile.subscription || "free",
            status: matchedProfile.Status || "inactive",
          });
        } catch (fallbackError: any) {
          console.error("Fallback fetch error:", fallbackError.message);
          setError(fallbackError.message || "Failed to load profile");
          toast({
            title: "Error",
            description: "Unable to load profile. Please try again.",
            variant: "destructive",
          });
        }
      } finally {
        setLoading(false);
      }
    };

    console.log("Profile fetch useEffect triggered", { profileId, token: userData?.token });
    fetchProfileAndReportStatus();
  }, [profileId, userData?.token, navigate, toast]);

  const handleLike = () => {
    if (!profileData) return;
    toast({
      title: "Profile Liked",
      description: `You liked ${profileData.name}'s profile!`,
    });
  };

  const handleShare = () => {
    if (!profileData) return;
    navigator.clipboard.write(`${window.location.origin}/profile-detail/${profileData.id}`);
    toast({
      title: "Profile Shared",
      description: "Profile link copied to clipboard!",
    });
  };

  const handleChatNow = async () => {
    const isUserPremium = userData?.subscription?.current === "premium" || 
                         userData?.subscription?.current === "premium plus";
    
    if (!isUserPremium) {
      console.log("ProfileDetailScreen - Chat disabled: User is not premium");
      toast({
        title: "Premium Required",
        description: "Please upgrade to Premium or Premium Plus to start a chat.",
        variant: "destructive",
      });
      navigate("/pricing");
      return;
    }

    if (!profileData?.id || !profileData?.name || !profileData?.image) {
      console.error("ProfileDetailScreen - Invalid profileData for chat:", profileData);
      toast({
        title: "Error",
        description: "Cannot start chat. Profile data is incomplete.",
        variant: "destructive",
      });
      return;
    }

    try {
      const response = await authenticatedFetch(`${BASE_URL}/api/add-chat-contact`, {
        method: "POST",
        body: JSON.stringify({ profileId: userData.profileId, contactId: profileData.id }),
      });
      
      if (!response.ok) {
        throw new Error("Failed to add chat contact");
      }
      
      console.log("ProfileDetailScreen - Chat contact added:", profileData.id);

      const chatUser = {
        id: profileData.id,
        name: profileData.name,
        avatar: profileData.image,
        online: onlineUsers.includes(profileData.id),
      };
      
      console.log("ProfileDetailScreen - Navigating to chat with:", chatUser);
      setReceiverId(profileData.id);
      
      if (onNavigate) {
        onNavigate("chat", chatUser);
      } else {
        navigate("/chat", { state: { chatUser } });
      }
    } catch (error) {
      console.error("ProfileDetailScreen - Error adding chat contact:", error);
      toast({
        title: "Error",
        description: "Failed to start chat. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleReportSubmit = async () => {
    try {
      const reportingUserId = userData?.profileId || "anonymous";

      if (!reportReason || !reportCategory || !reportMessage.trim()) {
        toast({
          title: "Error",
          description: "Please fill in all required fields: reason, category, and message.",
          variant: "destructive",
        });
        return;
      }

      const reportData = {
        reportingUserId,
        reportedProfileId: profileData.id,
        reason: reportReason,
        category: reportCategory,
        message: reportMessage.trim(),
        name: profileData.name,
        location: profileData.location,
        profession: profileData.profession,
        education: profileData.education,
      };
      console.log("Submitting report with data:", reportData);

      const response = await authenticatedFetch(`${BASE_URL}/api/report-profile`, {
        method: "POST",
        body: JSON.stringify(reportData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Failed to submit report: ${response.status}`);
      }

      toast({
        title: "Report Submitted",
        description: "Your report has been submitted successfully.",
      });

      setIsReported(true);
      setIsReportModalOpen(false);
    } catch (error: any) {
      console.error("Error submitting report:", error.message);
      toast({
        title: "Error",
        description: error.message || "Failed to submit report. Please try again.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity }}>
          <Loader2 className="w-8 h-8 text-primary" />
        </motion.div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
        <p className="text-destructive mb-4">{error || "Profile not found"}</p>
        <Button onClick={onBack} variant="outline">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background relative">
      <div className="p-4 pb-20 max-w-md mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between items-center mb-4">
            <Button onClick={onBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <div className="flex space-x-2">
              <div className="bg-background/80 px-2 py-1 rounded">
                <p className="text-xl font-semibold">{profileData.name}</p>
              </div>
            </div>
          </div>

          <Card className="relative" style={{ marginTop: "10px" }}>
            <div className="relative aspect-[3/4] rounded-t-lg overflow-hidden">
              <ImageWithFallback
                src={profileData.image}
                fallbackSrc="https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg"
                alt={profileData.name}
                className="w-full h-full object-cover"
              />
              <div className="absolute top-4 left-4">
                {profileData.subscription !== "free" && (
                  <Badge variant="default" className="flex items-center space-x-1">
                    <Crown className="w-3 h-3" />
                    <span>{profileData.subscription}</span>
                  </Badge>
                )}
              </div>
            </div>
          </Card>

          <Card style={{ marginTop: "10px" }}>
            <CardContent className="pt-6 space-y-4">
              <div className="flex items-center space-x-2">
                <MapPin className="w-5 h-5 text-muted-foreground" />
                <p>{profileData.location}</p>
              </div>
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-muted-foreground" />
                <p>{profileData.profession}</p>
              </div>
              <div className="flex items-center space-x-2">
                <GraduationCap className="w-5 h-5 text-muted-foreground" />
                <p>{profileData.education}</p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ marginTop: "10px" }}>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">About</h2>
              <p className="text-muted-foreground">{profileData.bio}</p>
              <div className="flex flex-wrap gap-2">
                {profileData.interests?.map((interest: string, index: number) => (
                  <Badge key={index} variant="secondary">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>

          {isPremium ? (
            <Card style={{ marginTop: "10px" }}>
              <CardContent className="pt-6">
                <h2 className="text-lg font-semibold mb-4">Photos</h2>
                {photosError ? (
                  <p className="text-destructive">{photosError}</p>
                ) : photos.length > 1 ? (
                  <div className="grid grid-cols-2 gap-4">
                    {photos
                      .filter((photo) => !photo.isMain)
                      .map((photo, index) => (
                        <motion.div
                          key={photo.id || `photo-${index}`}
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: index * 0.1 }}
                          className="relative aspect-[3/4] rounded-lg overflow-hidden"
                        >
                          <ImageWithFallback
                            src={photo.url}
                            fallbackSrc="https://www.shutterstock.com/image-vector/user-profile-icon-vector-avatar-600nw-2220431045.jpg"
                            alt="User photo"
                            className="w-full h-full object-cover"
                          />
                        </motion.div>
                      ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No additional photos available</p>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card style={{ marginTop: "10px" }}>
              <CardContent className="pt-6 text-center">
                <p className="text-destructive">Upgrade to Premium or Premium Plus to view additional photos</p>
                <Button
                  className="mt-4"
                  onClick={() => navigate('/pricing')}
                >
                  Upgrade Now
                </Button>
              </CardContent>
            </Card>
          )}

          <Card style={{ marginTop: "10px" }}>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Family Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Father's Occupation:</span> {profileData.familyInfo?.fatherOccupation || "Not specified"}</p>
                <p><span className="font-medium">Mother's Occupation:</span> {profileData.familyInfo?.motherOccupation || "Not specified"}</p>
                <p><span className="font-medium">Siblings:</span> {profileData.familyInfo?.siblings || "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ marginTop: "10px" }}>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Personal Details</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Height:</span> {profileData.personalInfo?.height || "Not specified"}</p>
                <p><span className="font-medium">Marital Status:</span> {profileData.personalInfo?.maritalStatus || "Not specified"}</p>
                <p><span className="font-medium">Languages:</span> {profileData.personalInfo?.languages?.join(", ") || "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          <Card style={{ marginTop: "10px" }}>
            <CardContent className="pt-6 space-y-4">
              <h2 className="text-lg font-semibold">Preferences</h2>
              <div className="space-y-2">
                <p><span className="font-medium">Religion:</span> {profileData.religion || "Not specified"}</p>
                <p><span className="font-medium">Community:</span> {profileData.community || "Not specified"}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center space-x-4 mt-6">
            <Button
              variant="outline"
              className="flex-1 hover-scale"
              onClick={handleChatNow}
              disabled={!isPremium || loading || !profileData?.id || profileData.status === "inactive"}
            >
              <MessageSquare className="w-4 h-4 mr-2" />
              Chat Now
            </Button>
            {/* <Button
              variant="outline"
              className="flex-1 hover-scale"
              onClick={handleLike}
            >
              <Heart className="w-4 h-4 mr-2" />
              Like
            </Button> */}
            {/* <Button
              variant="outline"
              className="flex-1 hover-scale"
              onClick={handleShare}
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button> */}
            <Button
              variant="outline"
              className="flex-1 hover-scale"
              onClick={() => setIsReportModalOpen(true)}
              disabled={isReported}
            >
              <Flag className="w-4 h-4 mr-2" />
              {isReported ? "Reported" : "Report"}
            </Button>
          </div>
        </motion.div>
      </div>

      <Dialog open={isReportModalOpen} onOpenChange={setIsReportModalOpen}>
        <DialogContent className="w-[95vw] max-w-[600px] sm:max-w-[800px] max-h-[90vh] overflow-y-auto p-4 sm:p-6">
          <DialogHeader>
            <DialogTitle className="text-lg sm:text-xl">
              {isReported ? "Report Submitted" : "Report Profile"}
            </DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex flex-col gap-4">
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-medium text-gray-700 text-center">
                  Profile Details
                </h3>
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-medium">Name:</span> {profileData?.name || "Not specified"}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-medium">Location:</span> {profileData?.location || "Not specified"}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-medium">Profession:</span> {profileData?.profession || "Not specified"}
                </p>
                <p className="text-sm text-gray-600 text-center">
                  <span className="font-medium">Education:</span> {profileData?.education || "Not specified"}
                </p>
              </div>
              <div className="space-y-2">
                <h3 className="text-sm sm:text-base font-medium text-gray-700 text-center">
                  Report Details
                </h3>
                {isReported ? (
                  <>
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium">Reason for Report:</span> {reportReason}
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium">Category:</span> {reportCategory}
                    </p>
                    <p className="text-sm text-gray-600 text-center">
                      <span className="font-medium">Message:</span> {reportMessage}
                    </p>
                  </>
                ) : (
                  <div className="space-y-4">
                    <div className="grid gap-2">
                      <Label htmlFor="report-reason" className="text-sm sm:text-base">
                        Reason for Report
                      </Label>
                      <Select
                        value={reportReason}
                        onValueChange={setReportReason}
                      >
                        <SelectTrigger id="report-reason">
                          <SelectValue placeholder="Select a reason" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="spam">Spam</SelectItem>
                          <SelectItem value="inappropriate-content">
                            Inappropriate Content
                          </SelectItem>
                          <SelectItem value="fake-profile">
                            Fake Profile
                          </SelectItem>
                          <SelectItem value="harassment">Harassment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="report-message" className="text-sm sm:text-base">
                        Message
                      </Label>
                      <Textarea
                        id="report-message"
                        value={reportMessage}
                        onChange={(e) => setReportMessage(e.target.value)}
                        placeholder="Provide details about the issue"
                        className="min-h-[100px] text-sm"
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="report-category" className="text-sm sm:text-base">
                        Category
                      </Label>
                      <Select
                        value={reportCategory}
                        onValueChange={setReportCategory}
                      >
                        <SelectTrigger id="report-category">
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="message">Message</SelectItem>
                          <SelectItem value="profile">Profile</SelectItem>
                          <SelectItem value="behaviour">Behaviour</SelectItem>
                          <SelectItem value="photos">Photos</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="flex justify-center sm:justify-end">
            {isReported ? (
              <Button
                onClick={() => setIsReportModalOpen(false)}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-sm sm:text-base"
              >
                Close
              </Button>
            ) : (
              <Button
                type="submit"
                onClick={handleReportSubmit}
                className="w-full sm:w-auto bg-primary hover:bg-primary/90 text-white text-sm sm:text-base"
              >
                Submit Report
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}