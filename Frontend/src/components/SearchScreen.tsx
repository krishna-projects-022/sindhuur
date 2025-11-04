import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Search, Filter, MapPin, Briefcase, Star, Crown, Users, Church } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { Slider } from "./ui/slider";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

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

interface SearchScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export default function SearchScreen({ onNavigate, onBack }: SearchScreenProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false); // Changed to false to hide filters by default
  const [filters, setFilters] = useState({
    ageRange: [18, 65],
    profession: "",
    education: "",
  });
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [filteredProfiles, setFilteredProfiles] = useState<Profile[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [userGender, setUserGender] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

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
    const token = userData?.token || "";
    console.log(`SearchScreen - Using token for fetch: ${token ? "Token present" : "No token"}`);

    return fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    });
  };

  // Fetch profiles with gender filtering
  const fetchProfiles = async (profileId: string, userGender: string | null) => {
    try {
      console.log(`SearchScreen - Fetching profiles from: ${BASE_URL}/api/profiles`);
      const profilesResponse = await authenticatedFetch(`${BASE_URL}/api/profiles`);
      if (!profilesResponse.ok) {
        const errorData = await profilesResponse.json().catch(() => ({}));
        throw new Error(errorData.error || "Failed to fetch profiles");
      }
      const profilesData = await profilesResponse.json();
      console.log("SearchScreen - Raw profiles data:", profilesData);

      const targetGender = userGender === "male" ? "female" : userGender === "female" ? "male" : undefined;

      const fetchedProfiles: Profile[] = profilesData
        .filter((profile: any) => {
          if (!profile.id) {
            console.warn("SearchScreen - Profile missing id:", profile);
            return false;
          }
          return profile.id !== profileId; // Exclude current user's profile
        })
        .filter((profile: any) => !targetGender || profile.gender === targetGender) // Filter by opposite gender
        .map((profile: any) => ({
          id: profile.id,
          name: profile.name || "Not specified",
          age: profile.age === "Not specified" ? calculateAge(profile.dateOfBirth) : profile.age || 0,
          profession: profile.profession || "Not specified",
          education: profile.education || "Not specified",
          location: profile.location || "Not specified",
          image: profile.images?.[0] || profile.image || "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
          isOnline: profile.isOnline || false,
          interests: profile.hobbies
            ? typeof profile.hobbies === "string"
              ? profile.hobbies.split(", ")
              : profile.hobbies
            : [],
          religion: profile.religion || "Not specified",
          community: profile.community || "Not specified",
          income: profile.income || profile.salary || "Not specified",
          photos: profile.photos || profile.images?.length || 0,
          subscription: profile.subscription || "free",
          viewCount: profile.viewCount || 0,
          interestsReceived: profile.interestsReceived || 0,
          gender: profile.gender || "Not specified",
        }));

      console.log("SearchScreen - Processed profiles:", fetchedProfiles);
      setProfiles(fetchedProfiles);
      setFilteredProfiles(fetchedProfiles); // Initialize with all profiles
      setFetchError(null);
    } catch (error: any) {
      console.warn("SearchScreen - Profiles fetch failed:", error.message);
      setFetchError("Failed to load profiles. Please try again later.");
      setProfiles([]);
      setFilteredProfiles([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const userProfile = localStorage.getItem("loggedInUser");
        const userData = userProfile ? JSON.parse(userProfile) : null;
        const profileId = userData?.profileId || "anonymous";
        console.log("SearchScreen - Fetching data for profileId:", profileId);

        try {
          console.log(`SearchScreen - Fetching user profile: ${BASE_URL}/api/user-profile?profileId=${profileId}`);
          const userProfileResponse = await authenticatedFetch(
            `${BASE_URL}/api/user-profile?profileId=${profileId}`
          );
          if (!userProfileResponse.ok) {
            const errorData = await userProfileResponse.json().catch(() => ({}));
            throw new Error(errorData.error || "Failed to fetch user profile");
          }
          const userProfileData = await userProfileResponse.json();
          console.log("SearchScreen - User profile data:", userProfileData);
          setUserGender(userProfileData.user.gender || null);
        } catch (error: any) {
          console.warn("SearchScreen - User profile fetch failed:", error.message);
          setFetchError("Failed to load your profile. Please check your login or email verification.");
          setIsLoading(false);
          return;
        }

        await fetchProfiles(profileId, userGender);
      } catch (error: any) {
        console.error("SearchScreen - Fetch error:", error.message);
        setFetchError(error.message || "Failed to load profiles. Please check your server.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [userGender]);

  useEffect(() => {
    const applyFilters = () => {
      console.log("SearchScreen - Applying filters with searchQuery:", searchQuery, "and filters:", filters);
      let results = profiles;

      // Apply search query filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        console.log("SearchScreen - Search query:", query);
        results = profiles.filter((profile) => {
          const matches = [
            profile.name || "",
            profile.profession || "",
            profile.location || "",
            profile.community || "",
            profile.religion || "",
            profile.education || "",
            ...(profile.interests || []),
          ].some((field) => {
            const fieldValue = field.toLowerCase();
            const match = fieldValue.includes(query);
            console.log(`SearchScreen - Checking field: ${fieldValue}, Match: ${match}`);
            return match;
          });
          return matches;
        });
      }

      // Apply filters for age, profession, and education
      results = results.filter((profile) => {
        const age = typeof profile.age === "string" ? parseInt(profile.age) || 0 : profile.age;
        const inAgeRange = age >= filters.ageRange[0] && age <= filters.ageRange[1];
        const matchesProfession =
          !filters.profession || profile.profession.toLowerCase() === filters.profession.toLowerCase();
        const matchesEducation = true; // Education filter removed, so always true
        return inAgeRange && matchesProfession && matchesEducation;
      });

      console.log("SearchScreen - Filtered profiles:", results);
      setFilteredProfiles(results);
    };
    applyFilters();
  }, [searchQuery, filters, profiles]);

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
            <h1 className="text-xl text-foreground">Search</h1>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              console.log("SearchScreen - Toggling filters, current showFilters:", showFilters);
              setShowFilters(!showFilters);
            }}
            className="hover-scale"
          >
            <Filter className="w-5 h-5" />
          </Button>
        </div>
      </motion.div>

      <div className="p-4 pb-6 space-y-6 relative">
        {/* Search Bar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, profession, location, community, religion, interests..."
            value={searchQuery}
            onChange={(e) => {
              console.log("SearchScreen - Search input changed:", e.target.value);
              setSearchQuery(e.target.value);
            }}
            className="pl-10 bg-input-background border-border"
          />
        </motion.div>

        {/* Filters */}
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="absolute z-40 bg-white w-full max-w-md mx-auto left-0 right-0 shadow-lg rounded-lg mt-2"
          >
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-base text-foreground">Filters</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      console.log("SearchScreen - Closing filters");
                      setShowFilters(false);
                    }}
                    className="hover-scale"
                  >
                    Close
                  </Button>
                </div>

                <div className="space-y-3">
                  <Label>Age Range: {filters.ageRange[0]} - {filters.ageRange[1]}</Label>
                  <Slider
                    value={filters.ageRange}
                    onValueChange={(value) => setFilters(prev => ({ ...prev, ageRange: value }))}
                    min={18}
                    max={65}
                    step={1}
                    className="w-full"
                  />
                </div>

                <div className="space-y-2">
                  <Label>Profession</Label>
                  <Select 
                    value={filters.profession} 
                    onValueChange={(value) => setFilters(prev => ({ ...prev, profession: value }))}
                  >
                    <SelectTrigger className="bg-input-background">
                      <SelectValue placeholder="Any profession" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doctor">Doctor</SelectItem>
                      <SelectItem value="engineer">Engineer</SelectItem>
                      <SelectItem value="teacher">Teacher</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {/* Search Results */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-4"
        >
          <h2 className="text-lg text-foreground">Search Results ({filteredProfiles.length})</h2>

          {fetchError && <div className="text-center text-red-600 p-4">{fetchError}</div>}

          {isLoading && <div className="text-center p-4">Loading profiles...</div>}

          {!isLoading && filteredProfiles.length === 0 && !fetchError && (
            <div className="text-center text-muted-foreground p-4">
              No profiles found. Enter a search query or adjust filters to find profiles.
            </div>
          )}
          {filteredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <Card
                className="cursor-pointer hover-scale tap-scale"
                onClick={() => {
                  console.log("SearchScreen - Navigating to profile-detail with ID:", profile.id);
                  onNavigate("profile-detail", { id: profile.id });
                }}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <Avatar className="w-16 h-16">
                    <AvatarImage src={profile.image} />
                    <AvatarFallback>{profile.name ? profile.name[0] : "N"}</AvatarFallback>
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <h4 className="text-base">
                        {profile.name || "Not specified"}, {typeof profile.age === "string" ? parseInt(profile.age) || 0 : profile.age}
                      </h4>
                      {/* <span className="text-sm text-primary">Compatibility N/A</span> */}
                    </div>

                    <div className="flex items-center space-x-2 mb-2">
                      <Badge variant="secondary" className="text-xs">
                        <Star className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                      {profile.subscription !== "free" && (
                        <Badge className="bg-primary text-white text-xs">
                          <Crown className="w-3 h-3 mr-1" />
                          {profile.subscription === "premium" ? "Premium" : "Premium+"}
                        </Badge>
                      )}
                      {profile.isOnline && (
                        <Badge className="bg-blue-500 text-white text-xs">Online</Badge>
                      )}
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{profile.profession}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{profile.location}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{profile.community}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Church className="w-3 h-3 text-muted-foreground" />
                        <span className="text-sm text-muted-foreground">{profile.religion}</span>
                      </div>
                      {profile.interests && profile.interests.length > 0 && (
                        <div className="flex items-center space-x-1">
                          <span className="text-sm text-muted-foreground">
                            Interests: {profile.interests.slice(0, 2).join(", ")}
                            {profile.interests.length > 2 ? "..." : ""}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </div>
    </div>
  );
}