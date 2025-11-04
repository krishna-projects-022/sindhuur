import { useState, useEffect, useCallback } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { ImageWithFallback } from './figma/ImageWithFallback';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Heart, X, User, MapPin, Briefcase, Inbox, Users, ChevronDown, ChevronUp, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";
import { useDebounce } from "use-debounce";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface Profile {
  id: string;
  name: string;
  age: number;
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

interface MatchesTabProps {
  user: any;
  onNavigate: (screen: string, data?: any) => void;
  onConnect?: (profile: any) => void;
}

export default function MatchesTab({ user, onNavigate, onConnect }: MatchesTabProps) {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [mutualMatches, setMutualMatches] = useState<Profile[]>([]);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [filters, setFilters] = useState(() => {
    const savedFilters = localStorage.getItem("matchesFilters");
    return savedFilters
      ? JSON.parse(savedFilters)
      : {
          ageRange: "",
          community: "",
          location: "",
          education: "",
        };
  });
  const [debouncedFilters] = useDebounce(filters, 500);
  const [interestsSent, setInterestsSent] = useState<string[]>([]);
  const [receivedInterests, setReceivedInterests] = useState<string[]>([]);
  const [showReceived, setShowReceived] = useState(false);
  const [showSent, setShowSent] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentSubscription, setCurrentSubscription] = useState("free");
  const [communities, setCommunities] = useState<string[]>([]);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);

  const allCities = [
    "Adilabad", "Agartala", "Agra", "Ahmedabad", "Ahmednagar", "Aizawl", "Ajmer", "Akola", "Alappuzha", "Aligarh",
    "Alwar", "Ambala", "Amravati", "Amritsar", "Anantapur", "Anantnag", "Asansol", "Aurangabad", "Ballari", "Baramulla",
    "Bareilly", "Bathinda", "Belagavi", "Bengaluru", "Berhampur", "Bhagalpur", "Bhavnagar", "Bhilai", "Bhopal", "Bhubaneswar",
    "Bidar", "Bikaner", "Bilaspur", "Bokaro", "Champhai", "Chandigarh", "Chandrapur", "Chennai", "Chitradurga", "Chittoor",
    "Churachandpur", "Coimbatore", "Cuddalore", "Cuttack", "Daman", "Darbhanga", "Darjeeling", "Davangere", "Dehradun", "Dhanbad",
    "Dharamshala", "Dharmanagar", "Dibrugarh", "Dimapur", "Dindigul", "Diu", "Durg", "Durgapur", "Dwarka", "Erode",
    "Faridabad", "Gadag", "Gandhinagar", "Gangtok", "Gaya", "Geyzing", "Ghaziabad", "Guntur", "Gurugram", "Guwahati",
    "Gwalior", "Haldwani", "Haridwar", "Hassan", "Hazaribagh", "Hisar", "Howrah", "Hubli", "Hyderabad", "Imphal",
    "Indore", "Itanagar", "Jabalpur", "Jaipur", "Jalandhar", "Jalgaon", "Jammu", "Jamnagar", "Jamshedpur", "Jhansi",
    "Jodhpur", "Jorhat", "Jowai", "Junagadh", "Kadapa", "Kanchipuram", "Kannur", "Kanpur", "Karaikal", "Kargil",
    "Karimnagar", "Karnal", "Karol Bagh", "Karur", "Kavaratti", "Khammam", "Kochi", "Kohima", "Kolhapur", "Kolkata",
    "Kollam", "Korba", "Kota", "Kottayam", "Kozhikode", "Kullu", "Kurnool", "Latur", "Leh", "Lucknow",
    "Ludhiana", "Lunglei", "Madurai", "Mahbubnagar", "Mahe", "Malappuram", "Manali", "Mancherial", "Mandi", "Mangaluru",
    "Mangan", "Mapusa", "Margao", "Meerut", "Mohali", "Mokokchung", "Moradabad", "Mumbai", "Muzaffarpur", "Mysuru",
    "Nagapattinam", "Nagpur", "Naharlagun", "Nainital", "Namchi", "Nashik", "Nellore", "New Delhi", "Nizamabad", "Noida",
    "Ongole", "Palakkad", "Panaji", "Panipat", "Pasighat", "Patiala", "Patna", "Port Blair", "Prayagraj", "Puducherry",
    "Pune", "Purnia", "Raichur", "Raipur", "Rajahmundry", "Rajkot", "Ramagundam", "Ranchi", "Rishikesh", "Rohini",
    "Rohtak", "Roorkee", "Rourkela", "Sagar", "Saket", "Salem", "Sambalpur", "Sangli", "Satara", "Satna",
    "Shillong", "Shimla", "Shivamogga", "Siddipet", "Silchar", "Siliguri", "Silvassa", "Solan", "Solapur", "Sonipat",
    "Srinagar", "Surat", "Tawang", "Tezpur", "Thanjavur", "Thiruvananthapuram", "Thoothukudi", "Thoubal", "Thrissur", "Tirunelveli",
    "Tirupati", "Trichy", "Tumakuru", "Tura", "Udaipur", "Udupi", "Ujjain", "Ukhrul", "Vadodara", "Varanasi",
    "Vasco da Gama", "Vellore", "Vijayawada", "Visakhapatnam", "Warangal", "Yanam", "Ziro"
  ];

  // Helper function to validate and parse response
  const parseResponse = async (response: Response) => {
    const contentType = response.headers.get("content-type");
    if (!contentType || !contentType.includes("application/json")) {
      const text = await response.text();
      throw new Error(
        `Expected JSON but received ${contentType || "unknown content type"}: ${text.slice(0, 100)}...`
      );
    }
    return response.json();
  };

  // Save filters to localStorage
  useEffect(() => {
    localStorage.setItem("matchesFilters", JSON.stringify(filters));
  }, [filters]);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Fetch communities
  const fetchCommunities = useCallback(async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/communities`, {
        headers: {
          "Content-Type": "application/json",
        },
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to fetch communities`);
      }
      const data = await parseResponse(response);
      setCommunities(data.map((item: any) => item.name));
      if (data.length === 0) {
        // toast.warning('No communities found in the database.', {
        //   position: "top-right",
        // });
      }
    } catch (error: any) {
      console.error("Fetch communities error:", error.message);
      // toast.error(`Failed to fetch communities: ${error.message}`, {
      //   position: "top-right",
      // });
    }
  }, []);

  useEffect(() => {
    fetchCommunities();
  }, [fetchCommunities]);

  // Fetch data (profiles, subscription, interests)
  const fetchData = useCallback(async (isRefresh = false) => {
    if (!isOnline) {
      // toast.error("You are offline. Please check your internet connection.", {
      //   position: "top-right",
      // });
      return;
    }

    try {
      setIsLoading(true);
      if (isRefresh) setIsRefreshing(true);
      const userProfile = localStorage.getItem("loggedInUser");
      if (!userProfile) {
        throw new Error("No user profile found in localStorage. Please log in.");
      }
      const userData = JSON.parse(userProfile);
      const profileId = userData?.profileId || "anonymous";
      const token = userData?.token || '';

      // Fetch user profile
      console.log(`Fetching user profile with profileId: ${profileId}`);
      const userProfileResponse = await fetch(
        `${BASE_URL}/api/user-profile?profileId=${profileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!userProfileResponse.ok) {
        throw new Error(`HTTP ${userProfileResponse.status}: Failed to fetch user profile`);
      }
      const userProfileData = await parseResponse(userProfileResponse);
      setCurrentSubscription(userProfileData.user?.subscription?.current || "free");

      // Fetch sent interests
      console.log(`Fetching interested profiles for userProfileId=${profileId}`);
      const sentResponse = await fetch(
        `${BASE_URL}/api/interested-profiles?userProfileId=${profileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!sentResponse.ok) {
        throw new Error(`HTTP ${sentResponse.status}: Failed to fetch interested profiles`);
      }
      const sentData = await parseResponse(sentResponse);
      const filteredSentData = sentData.filter(
        (profile: any) => profile.id.toString() !== profileId
      );
      setInterestsSent(sentData.map((profile: any) => profile.id.toString()));
      setProfiles(filteredSentData);

      // Fetch received interests
      console.log(`Fetching received interests for userProfileId=${profileId}`);
      const receivedResponse = await fetch(
        `${BASE_URL}/api/received-interests?userProfileId=${profileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!receivedResponse.ok) {
        throw new Error(`HTTP ${receivedResponse.status}: Failed to fetch received interests`);
      }
      const receivedData = await parseResponse(receivedResponse);
      const filteredReceivedData = receivedData.filter(
        (profile: any) => profile.id.toString() !== profileId
      );
      setReceivedInterests(receivedData.map((profile: any) => profile.id.toString()));

      // // Fetch mutual matches (uncommented and added)
      // console.log('Fetching mutual matches...');
      // const matchesResponse = await fetch(
      //   `${BASE_URL}/api/mutual-matches?userProfileId=${profileId}`,
      //   {
      //     method: "GET",
      //     headers: {
      //       "Content-Type": "application/json",
      //       Authorization: `Bearer ${token}`,
      //     },
      //   }
      // );
      // if (!matchesResponse.ok) {
      //   throw new Error(`HTTP ${matchesResponse.status}: Failed to fetch mutual matches`);
      // }
      // const matchesData = await parseResponse(matchesResponse);
      // setMutualMatches(matchesData);

      setFetchError(null);
    } catch (error: any) {
      console.error("Fetch error:", error.message);
      setFetchError(error.message || "Failed to load profiles or matches.");
    } finally {
      setIsLoading(false);
      if (isRefresh) setIsRefreshing(false);
    }
  }, [isOnline]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Fetch profiles based on showReceived/showSent
  useEffect(() => {
    if (!isOnline) return;

    if (showReceived) {
      const fetchReceivedInterests = async () => {
        try {
          setIsLoading(true);
          const userProfile = localStorage.getItem("loggedInUser");
          if (!userProfile) {
            throw new Error("No user profile found in localStorage. Please log in.");
          }
          const userData = JSON.parse(userProfile);
          const profileId = userData?.profileId || "anonymous";
          const token = userData?.token || '';

          console.log(`Fetching received interests for userProfileId=${profileId}`);
          const response = await fetch(
            `${BASE_URL}/api/received-interests?userProfileId=${profileId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch received interests`);
          }
          const data = await parseResponse(response);
          const filteredData = data.filter(
            (profile: any) => profile.id.toString() !== profileId
          );
          setProfiles(filteredData);
          setReceivedInterests(data.map((profile: any) => profile.id.toString()));
        } catch (error: any) {
          console.error("Error fetching received interests:", error.message);
          // toast.error(`Failed to load received interests: ${error.message}`, {
          //   position: "top-right",
          // });
        } finally {
          setIsLoading(false);
        }
      };
      fetchReceivedInterests();
    } else if (showSent) {
      const fetchSentInterests = async () => {
        try {
          setIsLoading(true);
          const userProfile = localStorage.getItem("loggedInUser");
          if (!userProfile) {
            throw new Error("No user profile found in localStorage. Please log in.");
          }
          const userData = JSON.parse(userProfile);
          const profileId = userData?.profileId || "anonymous";
          const token = userData?.token || '';

          console.log(`Fetching interested profiles for userProfileId=${profileId}`);
          const response = await fetch(
            `${BASE_URL}/api/interested-profiles?userProfileId=${profileId}`,
            {
              method: "GET",
              headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`,
              },
            }
          );
          if (!response.ok) {
            throw new Error(`HTTP ${response.status}: Failed to fetch interested profiles`);
          }
          const data = await parseResponse(response);
          const filteredData = data.filter(
            (profile: any) => profile.id.toString() !== profileId
          );
          setProfiles(filteredData);
          setInterestsSent(data.map((profile: any) => profile.id.toString()));
        } catch (error: any) {
          console.error("Error fetching interested profiles:", error.message);
          // toast.error(`Failed to load interested profiles: ${error.message}`, {
          //   position: "top-right",
          // });
        } finally {
          setIsLoading(false);
        }
      };
      fetchSentInterests();
    } else {
      setProfiles([]);
    }
  }, [showReceived, showSent, isOnline]);

  const handleInterest = async (id: string) => {
    if (!isOnline) {
      // toast.error("You are offline. Please check your internet connection.", {
      //   position: "top-right",
      // });
      return;
    }

    if (interestsSent.includes(id)) {
      // toast.error("You have already sent interest to this profile.", {
      //   position: "top-right",
      // });
      return;
    }

    try {
      const userProfile = localStorage.getItem("loggedInUser");
      if (!userProfile) {
        throw new Error("No user profile found in localStorage. Please log in.");
      }
      const userData = JSON.parse(userProfile);
      const profileId = userData?.profileId || "anonymous";
      const token = userData?.token || '';

      console.log(`Sending interest: userProfileId=${profileId}, interestedProfileId=${id}`);
      const response = await fetch(`${BASE_URL}/api/send-interest`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userProfileId: profileId, interestedProfileId: id }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to send interest`);
      }
      await parseResponse(response);

      setInterestsSent((prev) => [...prev, id]);
      // toast.success("Interest Sent!\nYour interest has been sent successfully.", {
      //   position: "top-right",
      // });

      console.log(`Fetching updated interested profiles for userProfileId=${profileId}`);
      const interestsResponse = await fetch(
        `${BASE_URL}/api/interested-profiles?userProfileId=${profileId}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (!interestsResponse.ok) {
        throw new Error(`HTTP ${interestsResponse.status}: Failed to fetch interested profiles`);
      }
      const interestsData = await parseResponse(interestsResponse);
      const filteredInterestsData = interestsData.filter(
        (profile: any) => profile.id.toString() !== profileId
      );
      setInterestsSent(interestsData.map((profile: any) => profile.id.toString()));
      if (showSent) {
        setProfiles(filteredInterestsData);
      }
    } catch (error: any) {
      console.error("Error sending interest:", error.message);
      // toast.error(
      //   error.message.includes("Interest already sent")
      //     ? "You have already sent interest to this profile."
      //     : error.message.includes("Interested profile not found")
      //     ? "The selected profile does not exist."
      //     : `Failed to send interest: ${error.message}`,
      //   { position: "top-right" }
      // );
    }
  };

  const handlePass = async (id: string) => {
    if (!isOnline) {
      // toast.error("You are offline. Please check your internet connection.", {
      //   position: "top-right",
      // });
      return;
    }

    try {
      const userProfile = localStorage.getItem("loggedInUser");
      if (!userProfile) {
        throw new Error("No user profile found in localStorage. Please log in.");
      }
      const userData = JSON.parse(userProfile);
      const profileId = userData?.profileId || "anonymous";
      const token = userData?.token || '';

      let fromId = profileId;
      let toId = id;
      if (showReceived) {
        fromId = id;
        toId = profileId;
      }

      console.log(`Attempting to remove interest: fromId=${fromId}, toId=${toId}`);
      const response = await fetch(`${BASE_URL}/api/remove-interest`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ userProfileId: fromId, interestedProfileId: toId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to remove interest`);
      }
      await parseResponse(response);

      setProfiles((prev) => prev.filter((profile) => profile.id.toString() !== id));
      setReceivedInterests((prev) => prev.filter((profileId) => profileId !== id));
      setInterestsSent((prev) => prev.filter((profileId) => profileId !== id));
      // toast.success("Profile passed and interest removed.", {
      //   position: "top-right",
      // });
    } catch (error: any) {
      console.error("Error removing interest:", error.message);
      // toast.error(
      //   error.message.includes("No user profile found")
      //     ? "Please log in to remove interests."
      //     : error.message.includes("Interest not found")
      //     ? "Interest not found in database."
      //     : `Failed to remove interest: ${error.message}`,
      //   { position: "top-right" }
      // );
    }
  };

  const handleProfileView = async (profileId: string) => {
    if (!isOnline) {
      // toast.error("You are offline. Please check your internet connection.", {
      //   position: "top-right",
      // });
      return;
    }

    try {
      const userProfile = localStorage.getItem("loggedInUser");
      if (!userProfile) {
        throw new Error("No user profile found in localStorage. Please log in.");
      }
      const userData = JSON.parse(userProfile);
      const token = userData?.token || '';

      console.log(`Incrementing profile views for profileId=${profileId}`);
      const response = await fetch(`${BASE_URL}/api/increment-profile-views`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ profileId }),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: Failed to increment profile views`);
      }
      await parseResponse(response);
    } catch (error: any) {
      console.error("Error incrementing profile views:", error.message);
      // toast.error(`Failed to increment profile views: ${error.message}`, {
      //   position: "top-right",
      // });
    }
  };

  const getFilteredProfiles = () => {
    const userProfile = localStorage.getItem("loggedInUser");
    const profileId = userProfile ? JSON.parse(userProfile).profileId : "anonymous";

    return profiles.filter((profile) => {
      if (profile.id.toString() === profileId) return false;

      if (debouncedFilters.ageRange) {
        const [minAge, maxAge] = debouncedFilters.ageRange
          .split("-")
          .map((val) => parseInt(val, 10));
        if (isNaN(minAge) || isNaN(maxAge)) {
          console.warn(`Invalid age range format: ${debouncedFilters.ageRange}`);
          return true;
        }
        if (profile.age < minAge || profile.age > maxAge) {
          return false;
        }
      }

      if (
        debouncedFilters.community &&
        debouncedFilters.community !== "all" &&
        profile.community !== debouncedFilters.community
      ) {
        return false;
      }
      if (
        debouncedFilters.location &&
        debouncedFilters.location !== "all" &&
        profile.location.toLowerCase() !== debouncedFilters.location.toLowerCase()
      ) {
        return false;
      }
      if (
        debouncedFilters.education &&
        debouncedFilters.education !== "all" &&
        !profile.education.includes(debouncedFilters.education)
      ) {
        return false;
      }
      return true;
    });
  };

  const displayedProfiles = showReceived
    ? profiles.filter((profile) => receivedInterests.includes(profile.id.toString()))
    : showSent
    ? profiles.filter((profile) => interestsSent.includes(profile.id.toString()))
    : profiles;

  const filteredProfiles = getFilteredProfiles();
  const isPremiumOrPlus = currentSubscription === "premium" || currentSubscription === "premium plus";

  // Pull-to-refresh handler
  const handleRefresh = async () => {
    await fetchData(true);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="p-2 touch-pan-y"
      style={{ overscrollBehaviorY: "contain" }}
    >
      {!isOnline && (
        <div className="text-center text-red-600 p-4 text-sm bg-red-50 rounded-lg mb-4">
          You are offline. Please check your internet connection.
        </div>
      )}
      {fetchError && (
        <div className="text-center text-red-600 p-4 text-sm bg-red-50 rounded-lg mb-4">
          {fetchError}
          <Button
            variant="outline"
            size="sm"
            className="mt-2 text-primary border-primary/50"
            onClick={() => fetchData(true)}
          >
            <RefreshCw size={14} className="mr-2" /> Retry
          </Button>
        </div>
      )}
      <div className="flex justify-between items-center mb-3">
        <h2 className="text-lg font-semibold text-foreground">Your Matches</h2>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleRefresh}
          disabled={isRefreshing || !isOnline}
          className="text-primary"
        >
          <RefreshCw size={16} className={`mr-2 ${isRefreshing ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>
      <div className="mb-6 flex flex-col gap-4">
        <p className="text-sm text-muted-foreground">
          Discover compatible profiles based on your preferences
        </p>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              setShowSent(true);
              setShowReceived(false);
            }}
            className={`flex-1 text-primary border-primary/50 hover:bg-primary/10 text-sm py-2 px-3 touch-manipulation ${
              showSent && !showReceived ? "bg-primary/10" : ""
            }`}
          >
            <Inbox size={14} className="mr-2" />
            Sent
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              setShowReceived(true);
              setShowSent(false);
            }}
            className={`flex-1 text-primary border-primary/50 hover:bg-primary/10 text-sm py-2 px-3 touch-manipulation ${
              showReceived && !showSent ? "bg-primary/10" : ""
            }`}
          >
            <Users size={14} className="mr-2" />
            Received
          </Button>
        </div>
      </div>

      <Collapsible open={isFilterOpen} onOpenChange={setIsFilterOpen} className="mb-6">
        <CollapsibleTrigger asChild>
          <Button
            variant="outline"
            className="w-full flex justify-between items-center border-primary/20 text-foreground hover:bg-primary/10 text-sm py-2 px-4 touch-manipulation"
          >
            <span>Filter Matches</span>
            {isFilterOpen ? (
              <ChevronUp className="h-4 w-4 transition-transform duration-200" />
            ) : (
              <ChevronDown className="h-4 w-4 transition-transform duration-200" />
            )}
          </Button>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <Card className="mt-2 border-primary/20">
            <CardContent className="p-4">
              <div className="grid grid-cols-1 gap-3">
                <Select
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, ageRange: value }))
                  }
                  defaultValue={filters.ageRange}
                >
                  <SelectTrigger className="border-primary/50 text-sm">
                    <SelectValue placeholder="Age Range" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="18-25">18-25 years</SelectItem>
                    <SelectItem value="26-30">26-30 years</SelectItem>
                    <SelectItem value="31-35">31-35 years</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, community: value }))
                  }
                  defaultValue={filters.community}
                >
                  <SelectTrigger className="border-primary/50 text-sm">
                    <SelectValue placeholder="Community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map((community) => (
                      <SelectItem key={community} value={community}>
                        {community}
                      </SelectItem>
                    ))}
                    <SelectItem value="all">All Communities</SelectItem>
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, location: value }))
                  }
                  defaultValue={filters.location}
                >
                  <SelectTrigger className="border-primary/50 text-sm">
                    <SelectValue placeholder="Location" />
                  </SelectTrigger>
                  <SelectContent className="max-h-48 overflow-y-auto">
                    <SelectItem value="all">All Locations</SelectItem>
                    {allCities.map((city) => (
                      <SelectItem key={city} value={city.toLowerCase()}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  onValueChange={(value) =>
                    setFilters((prev) => ({ ...prev, education: value }))
                  }
                  defaultValue={filters.education}
                >
                  <SelectTrigger className="border-primary/50 text-sm">
                    <SelectValue placeholder="Education" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Qualifications</SelectItem>
                    <SelectItem value="High-School">High School</SelectItem>
                    <SelectItem value="Diploma">Diploma</SelectItem>
                    <SelectItem value="Bachelor">Bachelor's Degree</SelectItem>
                    <SelectItem value="Master">Master's Degree</SelectItem>
                    <SelectItem value="Ph.D.">PhD</SelectItem>
                    <SelectItem value="Professional">Professional Degree</SelectItem>
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>

      {isLoading || isRefreshing ? (
        <div className="text-center text-muted-foreground p-4 text-sm">
          <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
          Loading profiles...
        </div>
      ) : filteredProfiles.length === 0 ? (
        <div className="text-center text-muted-foreground p-4 text-sm">
          {showReceived
            ? "No interests received yet."
            : showSent
            ? "No interests sent yet."
            : "No profiles to display."}
          {filters.ageRange && " Try adjusting your filters."}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProfiles.map((profile, index) => (
            <motion.div
              key={profile.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card
                className="cursor-pointer hover:scale-[1.01] transition-transform rounded-xl overflow-hidden shadow-md touch-manipulation"
                onClick={() => onNavigate("profile-detail", profile)}
              >
                <div className="aspect-[4/3]">
                  <ImageWithFallback
                    src={
                      profile.photos && profile.photos > 0
                        ? `/api/profile/${profile.id}/photo`
                        : "https://via.placeholder.com/150"
                    }
                    alt={profile.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                  />
                </div>
                <CardContent className="p-3">
                  <h3 className="text-base font-semibold text-foreground mb-2">
                    {profile.name}
                  </h3>
                  <div className="space-y-1 text-xs text-muted-foreground mb-3">
                    <div className="flex items-center gap-1">
                      <User size={12} />
                      <span>{profile.age} years</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase size={12} />
                      <span>{profile.profession}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <MapPin size={12} />
                      <span>{profile.location}</span>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-red-200 text-red-600 hover:bg-red-50 text-xs py-2 touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePass(profile.id.toString());
                      }}
                    >
                      <X size={14} className="mr-1" /> Decline
                    </Button>
                    <Button
                      size="sm"
                      className={`flex-1 text-xs py-2 touch-manipulation ${
                        interestsSent.includes(profile.id.toString())
                          ? "bg-green-600 hover:bg-green-700"
                          : "bg-primary hover:bg-primary/90"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleInterest(profile.id.toString());
                      }}
                      disabled={interestsSent.includes(profile.id.toString()) || !isOnline}
                    >
                      <Heart size={14} className="mr-1" />
                      {interestsSent.includes(profile.id.toString())
                        ? "Accepted"
                        : "Accept"}
                    </Button>
                  </div>
                 
                    <Button
                      variant="ghost"
                      className="w-full mt-2 text-primary hover:bg-primary/10 text-xs touch-manipulation"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleProfileView(profile.id).finally(() => {
                          onNavigate("profile-detail", profile);
                        });
                      }}
                      disabled={!isOnline}
                    >
                      View Profile
                    </Button>
                 
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      {mutualMatches.length > 0 && (
        <div className="mt-6">
          <h3 className="text-lg font-semibold text-foreground mb-3">Mutual Matches</h3>
          <div className="space-y-3">
            {mutualMatches.map((match, index) => (
              <motion.div
                key={match.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
              >
                <Card
                  className="cursor-pointer hover:scale-[1.01] transition-transform rounded-xl touch-manipulation"
                  onClick={() => isOnline && onNavigate("chat", { profile: match, user })}
                >
                  <CardContent className="p-3 flex items-center space-x-3">
                    <div className="relative">
                      <Avatar className="w-12 h-12 border-2 border-primary/20">
                        <AvatarImage src={match.image} loading="lazy" />
                        <AvatarFallback>{match.name[0]}</AvatarFallback>
                      </Avatar>
                      {match.isOnline && (
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm font-semibold">{match.name}, {match.age}</h4>
                        <span className="text-xs text-muted-foreground">
                          {match.matchDate || "Recently matched"}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mb-1">{match.profession}</p>
                      <p className="text-xs text-foreground">
                        {match.lastMessage || "Start a conversation!"}
                      </p>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-primary text-xs"
                      disabled={!isOnline}
                    >
                      Chat
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}