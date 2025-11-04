import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { 
  ArrowLeft, 
  Save, 
  User, 
  MapPin, 
  Briefcase, 
  GraduationCap, 
  Calendar, 
  Camera,
  Heart,
  Book,
  DollarSign,
  Users,
  Globe,
  Utensils,
  Music,
  Film,
  Languages,
  Star,
  Eye,
  EyeOff
} from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Checkbox } from "./ui/checkbox";
import { useToast } from "@/components/hooks/use-toast";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

// State cities list
const stateCities = {
  andhra_pradesh: ["Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool", "Rajahmundry", "Tirupati"],
  karnataka: ["Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi", "Davangere", "Tumakuru"],
  maharashtra: ["Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur", "Kolhapur"],
  tamil_nadu: ["Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Erode", "Vellore"],
  telangana: ["Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam"],
  kerala: ["Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Alappuzha"],
  other: []
};

const stateList = [
  { value: "andhra_pradesh", label: "Andhra Pradesh" },
  { value: "karnataka", label: "Karnataka" },
  { value: "maharashtra", label: "Maharashtra" },
  { value: "tamil_nadu", label: "Tamil Nadu" },
  { value: "telangana", label: "Telangana" },
  { value: "kerala", label: "Kerala" },
  { value: "other", label: "Other" }
];

// Course options
const getCourseOptions = (education: string) => {
  const options: { [key: string]: { value: string; label: string }[] } = {
    'High-School': [
      { value: 'science-stream', label: 'Science Stream' },
      { value: 'commerce-stream', label: 'Commerce Stream' },
      { value: 'arts-humanities-stream', label: 'Arts/Humanities Stream' },
      { value: 'vocational', label: 'Vocational' },
      { value: 'other', label: 'Other' },
    ],
    'Diploma': [
      { value: 'civil-engineering', label: 'Civil Engineering' },
      { value: 'mechanical-engineering', label: 'Mechanical Engineering' },
      { value: 'computer-engineering', label: 'Computer Engineering' },
      { value: 'business-administration', label: 'Business Administration' },
      { value: 'other', label: 'Other' },
    ],
    'Bachelor': [
      { value: 'B.Com', label: 'B.Com (Bachelor of Commerce)' },
      { value: 'B.Sc', label: 'B.Sc (Bachelor of Science)' },
      { value: 'BE/Btech-CSE', label: 'B.E./B.Tech (Computer Science Engineering)' },
      { value: 'BA', label: 'B.A. (Bachelor of Arts)' },
      { value: 'BBA', label: 'BBA (Bachelor of Business Administration)' },
      { value: 'Other', label: 'Other' },
    ],
    'Master': [
      { value: 'M.com', label: 'M.Com (Master of Commerce)' },
      { value: 'M.Sc', label: 'M.Sc (Master of Science)' },
      { value: 'MBA', label: 'MBA (Master of Business Administration)' },
      { value: 'M.Tech', label: 'M.Tech (Master of Technology)' },
      { value: 'MA', label: 'M.A. (Master of Arts)' },
      { value: 'Other', label: 'Other' },
    ],
    'Ph.D.': [
      { value: 'Ph.D.-Engineering', label: 'Ph.D. (Engineering)' },
      { value: 'Ph.D.-Science', label: 'Ph.D. (Science)' },
      { value: 'Ph.D.-Arts', label: 'Ph.D. (Arts)' },
      { value: 'Other', label: 'Other' },
    ],
    'Professional': [
      { value: 'CA', label: 'CA (Chartered Accountancy)' },
      { value: 'MD', label: 'MD (Doctor of Medicine)' },
      { value: 'JD', label: 'JD (Law)' },
      { value: 'Other', label: 'Other' },
    ],
  };
  return options[education] || [];
};

// Horoscope data
const nakshatras = [
  "Ashwini", "Bharani", "Krittika", "Rohini", "Mrigashira", "Ardra", "Punarvasu", "Pushya", "Ashlesha",
  "Magha", "Purva Phalguni", "Uttara Phalguni", "Hasta", "Chitra", "Swati", "Vishakha", "Anuradha", "Jyeshtha",
  "Mula", "Purva Ashadha", "Uttara Ashadha", "Shravana", "Dhanishta", "Shatabhisha", "Purva Bhadrapada", "Uttara Bhadrapada", "Revati"
];

const rashis = [
  "Aries", "Taurus", "Gemini", "Cancer", "Leo", "Virgo",
  "Libra", "Scorpio", "Sagittarius", "Capricorn", "Aquarius", "Pisces"
];

interface EditProfileScreenProps {
  onSave: (userData: any) => void;
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

export default function EditProfileScreen({ onSave, onBack }: EditProfileScreenProps) {
  const [formData, setFormData] = useState({
    // Basic Information (Step 1)
    accountFor: "",
    motherTongue: "",
    name: "",
    phone: "",
    gender: "",
    lookingFor: "",
    // Personal Details (Step 2)
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    height: "",
    physicalStatus: "",
    maritalStatus: "",
    numChildren: "0",
    childrenLivingTogether: "",
    // Background & Career (Step 3)
    religion: "",
    community: "",
    subcaste: "",
    willingAnyCaste: false,
    education: "",
    fieldOfStudy: "",
    otherEducation: "",
    occupation: "",
    income: "",
    // Location & Family (Step 4)
    country: "india",
    state: "",
    city: "",
    familyStatus: "",
    familyWealth: "",
    about: "",
    father: "",
    mother: "",
    familyTree: "",
    // Hobbies & Interests (Step 6)
    musicGenre: "",
    musicActivity: "",
    readingType: "",
    readingLanguage: "",
    movieGenre: "",
    movieMedium: "",
    sports: "",
    fitnessActivity: "",
    cuisine: "",
    cook: "",
    dietType: "",
    spokenLanguages: "",
    // Horoscopic Details (Step 7)
    timeOfBirth: "",
    placeOfBirth: "",
    nakshatra: "",
    rashi: "",
    // Lifestyle & Education (Step 8)
    eatingHabits: "",
    smoking: "",
    drinking: "",
    college: "",
    course: "",
    passingYear: "",
    // Profile Image
    profileImage: "https://via.placeholder.com/150",
  });

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updating, setUpdating] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [religions, setReligions] = useState<string[]>([]);
  const [communities, setCommunities] = useState<string[]>([]);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const { toast } = useToast();

  // Helper to ensure all fields have proper defaults
  const ensureFieldDefaults = (data: any) => {
    const defaults = {
      accountFor: "",
      motherTongue: "",
      name: "",
      phone: "",
      gender: "",
      lookingFor: "",
      birthDay: "",
      birthMonth: "",
      birthYear: "",
      height: "",
      physicalStatus: "",
      maritalStatus: "",
      numChildren: "0",
      childrenLivingTogether: "",
      religion: "",
      community: "",
      subcaste: "",
      willingAnyCaste: false,
      education: "",
      fieldOfStudy: "",
      otherEducation: "",
      occupation: "",
      income: "",
      country: "india",
      state: "",
      city: "",
      familyStatus: "",
      familyWealth: "",
      about: "",
      father: "",
      mother: "",
      familyTree: "",
      musicGenre: "",
      musicActivity: "",
      readingType: "",
      readingLanguage: "",
      movieGenre: "",
      movieMedium: "",
      sports: "",
      fitnessActivity: "",
      cuisine: "",
      cook: "",
      dietType: "",
      spokenLanguages: "",
      timeOfBirth: "",
      placeOfBirth: "",
      nakshatra: "",
      rashi: "",
      eatingHabits: "",
      smoking: "",
      drinking: "",
      college: "",
      course: "",
      passingYear: "",
      profileImage: "https://via.placeholder.com/150",
    };

    return { ...defaults, ...data };
  };

  // Fetch user profile for editing
  const fetchUserProfile = async () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      console.log('Raw localStorage loggedInUser:', loggedInUser);
      
      if (!loggedInUser?.profileId) {
        throw new Error("Please log in to edit your profile");
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

      // Try to get data from localStorage first (from signup)
      if (loggedInUser.personalInfo || loggedInUser.name) {
        console.log('Using data from localStorage');
        populateFormFromLocalStorage({ ...loggedInUser, profileImage: mainPhotoUrl });
        setLoading(false);
        return;
      }

      // Fallback: Fetch from API
      const response = await axios.get(`${BASE_URL}/api/edit-profile/${loggedInUser.profileId}`);
      const user = response.data.user;
      console.log('Fetched user data from API:', user);
      populateFormFromAPI({ ...user, profileImage: mainPhotoUrl });
      setLoading(false);
      
    } catch (err: any) {
      console.error("Error fetching user profile:", err);
      setError(err.response?.data?.error || err.message || "Failed to fetch user profile");
      setLoading(false);
      // toast({
      //   title: "Error",
      //   description: "Failed to load profile data",
      //   variant: "destructive",
      // });
    }
  };

  // Populate form from localStorage data (after signup)
  const populateFormFromLocalStorage = (userData: any) => {
    const rawFormData = {
      // Basic Information
      accountFor: userData.accountFor || "",
      motherTongue: userData.motherTongue || userData.demographics?.motherTongue || "",
      name: userData.name || userData.personalInfo?.name || "",
      phone: userData.phone || userData.personalInfo?.mobile || "",
      gender: userData.gender || userData.personalInfo?.gender || "",
      lookingFor: userData.lookingFor || userData.personalInfo?.lookingFor || "",
      // Personal Details
      birthDay: userData.birthDay || "",
      birthMonth: userData.birthMonth || "",
      birthYear: userData.birthYear || "",
      height: userData.height || userData.demographics?.height || "",
      physicalStatus: userData.physicalStatus || userData.demographics?.physicalStatus || "",
      maritalStatus: userData.maritalStatus || userData.demographics?.maritalStatus || "",
      numChildren: userData.numChildren || userData.demographics?.numChildren || "0",
      childrenLivingTogether: userData.childrenLivingTogether || userData.demographics?.childrenLivingTogether || "",
      // Background & Career
      religion: userData.religion || userData.demographics?.religion || "",
      community: userData.community || userData.demographics?.community || "",
      subcaste: userData.subcaste || userData.demographics?.subcaste || "",
      willingAnyCaste: userData.willingAnyCaste || userData.demographics?.willingAnyCaste || false,
      education: userData.education || userData.professionalInfo?.education || "",
      fieldOfStudy: userData.fieldOfStudy || userData.professionalInfo?.fieldOfStudy || "",
      otherEducation: userData.otherEducation || "",
      occupation: userData.occupation || userData.professionalInfo?.occupation || "",
      income: userData.income || userData.professionalInfo?.income || "",
      // Location & Family
      country: userData.country || userData.location?.country || "india",
      state: userData.state || userData.location?.state || "",
      city: userData.city || userData.location?.city || "",
      familyStatus: userData.familyStatus || userData.familyInfo?.familyStatus || "",
      familyWealth: userData.familyWealth || userData.familyInfo?.familyWealth || "",
      about: userData.about || userData.personalInfo?.about || "",
      father: userData.father || userData.familyInfo?.father || "",
      mother: userData.mother || userData.familyInfo?.mother || "",
      familyTree: userData.familyTree || "",
      // Hobbies & Interests
      musicGenre: userData.musicGenre || userData.hobbies?.music?.genre || "",
      musicActivity: userData.musicActivity || userData.hobbies?.music?.activity || "",
      readingType: userData.readingType || userData.hobbies?.reading?.type || "",
      readingLanguage: userData.readingLanguage || userData.hobbies?.reading?.language || "",
      movieGenre: userData.movieGenre || userData.hobbies?.movies?.genre || "",
      movieMedium: userData.movieMedium || userData.hobbies?.movies?.medium || "",
      sports: userData.sports || userData.hobbies?.sports || "",
      fitnessActivity: userData.fitnessActivity || userData.hobbies?.fitness || "",
      cuisine: userData.cuisine || userData.hobbies?.food?.cuisine || "",
      cook: userData.cook || userData.hobbies?.food?.cooking || "",
      dietType: userData.dietType || userData.hobbies?.food?.diet || "",
      spokenLanguages: userData.spokenLanguages || userData.hobbies?.languages || "",
      // Horoscopic Details
      timeOfBirth: userData.timeOfBirth || userData.horoscope?.timeOfBirth || "",
      placeOfBirth: userData.placeOfBirth || userData.horoscope?.placeOfBirth || "",
      nakshatra: userData.nakshatra || userData.horoscope?.nakshatra || "",
      rashi: userData.rashi || userData.horoscope?.rashi || "",
      // Lifestyle & Education
      eatingHabits: userData.eatingHabits || userData.lifestyle?.eatingHabits || "",
      smoking: userData.smoking || userData.lifestyle?.smoking || "",
      drinking: userData.drinking || userData.lifestyle?.drinking || "",
      college: userData.college || userData.professionalInfo?.college || "",
      course: userData.course || userData.professionalInfo?.course || "",
      passingYear: userData.passingYear || userData.professionalInfo?.passingYear || "",
      // Profile Image
      profileImage: userData.profileImage || "https://via.placeholder.com/150",
    };

    const formDataWithDefaults = ensureFieldDefaults(rawFormData);
    setFormData(formDataWithDefaults);
  };

  // Populate form from API data
  const populateFormFromAPI = (userData: any) => {
    const rawFormData = {
      // Basic Information
      accountFor: userData.accountFor || "",
      motherTongue: userData.motherTongue || "",
      name: userData.name || "",
      phone: userData.phone || "",
      gender: userData.gender || "",
      lookingFor: userData.lookingFor || "",
      // Personal Details
      birthDay: userData.birthDay || "",
      birthMonth: userData.birthMonth || "",
      birthYear: userData.birthYear || "",
      height: userData.height || "",
      physicalStatus: userData.physicalStatus || "",
      maritalStatus: userData.maritalStatus || "",
      numChildren: userData.numChildren || "0",
      childrenLivingTogether: userData.childrenLivingTogether || "",
      // Background & Career
      religion: userData.religion || "",
      community: userData.community || "",
      subcaste: userData.subcaste || "",
      willingAnyCaste: userData.willingAnyCaste || false,
      education: userData.education || "",
      fieldOfStudy: userData.fieldOfStudy || "",
      otherEducation: userData.otherEducation || "",
      occupation: userData.occupation || "",
      income: userData.income || "",
      // Location & Family
      country: userData.country || "india",
      state: userData.state || "",
      city: userData.city || "",
      familyStatus: userData.familyStatus || "",
      familyWealth: userData.familyWealth || "",
      about: userData.about || "",
      father: userData.father || "",
      mother: userData.mother || "",
      familyTree: userData.familyTree || "",
      // Hobbies & Interests
      musicGenre: userData.musicGenre || "",
      musicActivity: userData.musicActivity || "",
      readingType: userData.readingType || "",
      readingLanguage: userData.readingLanguage || "",
      movieGenre: userData.movieGenre || "",
      movieMedium: userData.movieMedium || "",
      sports: userData.sports || "",
      fitnessActivity: userData.fitnessActivity || "",
      cuisine: userData.cuisine || "",
      cook: userData.cook || "",
      dietType: userData.dietType || "",
      spokenLanguages: userData.spokenLanguages || "",
      // Horoscopic Details
      timeOfBirth: userData.timeOfBirth || "",
      placeOfBirth: userData.placeOfBirth || "",
      nakshatra: userData.nakshatra || "",
      rashi: userData.rashi || "",
      // Lifestyle & Education
      eatingHabits: userData.eatingHabits || "",
      smoking: userData.smoking || "",
      drinking: userData.drinking || "",
      college: userData.college || "",
      course: userData.course || "",
      passingYear: userData.passingYear || "",
      // Profile Image
      profileImage: userData.profileImage || "https://via.placeholder.com/150",
    };

    const formDataWithDefaults = ensureFieldDefaults(rawFormData);
    setFormData(formDataWithDefaults);
  };

  // Fetch religions and communities
  useEffect(() => {
    const fetchReligionsAndCommunities = async () => {
      try {
        const [religionResponse, communityResponse] = await Promise.all([
          axios.get(`${BASE_URL}/api/religions`),
          axios.get(`${BASE_URL}/api/communities`),
        ]);

        setReligions(religionResponse.data.map((item: any) => item.name));
        setCommunities(communityResponse.data.map((item: any) => item.name));
      } catch (err) {
        console.error("Error fetching religions or communities:", err);
        // toast({
        //   title: "Warning",
        //   description: "Failed to load religion or community data. You can still continue.",
        //   variant: "default",
        // });
      }
    };

    fetchUserProfile();
    fetchReligionsAndCommunities();
  }, []);

  // Handle input changes
  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    
    if (field === "state") {
      setFormData((prev) => ({ ...prev, city: "" }));
      setFilteredCities([]);
      setShowCityDropdown(false);
    }
    
    if (field === "city" && typeof value === "string") {
      if (value.length > 0 && formData.state) {
        const availableCities = stateCities[formData.state as keyof typeof stateCities] || [];
        const filtered = availableCities
          .filter((city) => city.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 10);
        setFilteredCities(filtered);
        setShowCityDropdown(true);
      } else {
        setShowCityDropdown(false);
      }
    }
    
    if (field === "education") {
      setFormData((prev) => ({ ...prev, fieldOfStudy: "" }));
    }

    if (field === "maritalStatus" && value === "never-married") {
      setFormData((prev) => ({ ...prev, numChildren: "0", childrenLivingTogether: "" }));
    }
  };

  // Handle photo upload
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setPhotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData((prev) => ({ ...prev, profileImage: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Select city from dropdown
  const selectCity = (city: string) => {
    setFormData((prev) => ({ ...prev, city }));
    setShowCityDropdown(false);
  };

  // Handle save
  const handleSave = async () => {
    if (!formData.name.trim()) {
      // toast({
      //   title: "Error",
      //   description: "Name is required.",
      //   variant: "destructive",
      // });
      return;
    }

    setUpdating(true);
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      
      if (!loggedInUser?.profileId) {
        throw new Error("User not found in localStorage");
      }

      // Format date of birth
      const dateOfBirth = formData.birthYear && formData.birthMonth && formData.birthDay
        ? `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`
        : '';

      // Prepare ALL fields with proper fallbacks
      const updatedData = {
        personalInfo: {
          name: formData.name.trim(),
          aboutMe: formData.about || "",
          profileComplete: 100,
          lastActive: new Date().toISOString(),
        },
        demographics: {
          dateOfBirth: dateOfBirth || "",
          height: formData.height || "",
          physicalStatus: formData.physicalStatus || "",
          maritalStatus: formData.maritalStatus || "",
          numChildren: formData.numChildren || "0",
          childrenLivingTogether: formData.childrenLivingTogether || "",
          religion: formData.religion || "",
          community: formData.community || "",
          motherTongue: formData.motherTongue || "",
          subcaste: formData.subcaste || "",
          willingAnyCaste: formData.willingAnyCaste || false,
        },
        professionalInfo: {
          education: formData.education || "",
          fieldOfStudy: formData.fieldOfStudy || formData.otherEducation || "",
          occupation: formData.occupation || "",
          income: formData.income || "",
          college: formData.college || "",
          course: formData.course || "",
          passingYear: formData.passingYear || "",
        },
        location: {
          country: formData.country || "india",
          state: formData.state || "",
          city: formData.city || "",
        },
        familyInfo: {
          father: formData.father || "",
          mother: formData.mother || "",
          familyStatus: formData.familyStatus || "",
          familyWealth: formData.familyWealth || "",
        },
        familyTree: formData.familyTree || "",
        hobbies: {
          music: {
            genre: formData.musicGenre || "",
            activity: formData.musicActivity || "",
          },
          reading: {
            type: formData.readingType || "",
            language: formData.readingLanguage || "",
          },
          movies: {
            genre: formData.movieGenre || "",
            medium: formData.movieMedium || "",
          },
          sports: formData.sports || "",
          fitness: formData.fitnessActivity || "",
          food: {
            cuisine: formData.cuisine || "",
            cooking: formData.cook || "",
            diet: formData.dietType || "",
          },
          languages: formData.spokenLanguages || "",
        },
        horoscope: {
          timeOfBirth: formData.timeOfBirth || "",
          placeOfBirth: formData.placeOfBirth || "",
          nakshatra: formData.nakshatra || "",
          rashi: formData.rashi || "",
        },
        lifestyle: {
          eatingHabits: formData.eatingHabits || "",
          smoking: formData.smoking || "",
          drinking: formData.drinking || "",
        },
      };

      console.log("Saving profile data:", updatedData);

      // Try the main endpoint first
      let response;
      try {
        const formDataToSend = new FormData();
        formDataToSend.append("profileId", loggedInUser.profileId);
        formDataToSend.append("updatedData", JSON.stringify(updatedData));
        
        if (photoFile) {
          formDataToSend.append("profileImage", photoFile);
        }

        response = await axios.put(
          `${BASE_URL}/api/update-profile`,
          formDataToSend,
          {
            headers: {
              'Content-Type': 'multipart/form-data',
            },
          }
        );
      } catch (endpointError) {
        console.log("Main endpoint failed, trying simple endpoint...");
        
        // Fallback to simple endpoint without file upload
        response = await axios.put(
          `${BASE_URL}/api/update-profile-simple`,
          {
            profileId: loggedInUser.profileId,
            updatedData: updatedData
          },
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );
      }

      console.log("Profile updated successfully:", response.data);

      // Update localStorage with the response
      const updatedUser = {
        ...loggedInUser,
        ...response.data.user,
        // Ensure all form data is preserved
        ...formData,
        personalInfo: {
          ...loggedInUser.personalInfo,
          ...response.data.user.personalInfo,
          name: formData.name,
          aboutMe: formData.about,
        },
        demographics: {
          ...loggedInUser.demographics,
          ...response.data.user.demographics,
          dateOfBirth: dateOfBirth,
        }
      };

      localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
      
      onSave(updatedUser);
      // toast({
      //   title: "Profile Saved",
      //   description: "Your profile has been updated successfully!",
      // });
    } catch (error: any) {
      console.error("Error saving profile:", error);
      
      let errorMessage = "Failed to save profile. Please try again.";
      if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
      } else if (error.message) {
        errorMessage = error.message;
      }

      // toast({
      //   title: "Error",
      //   description: errorMessage,
      //   variant: "destructive",
      // });
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <User className="w-16 h-16 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-foreground">Profile Not Found</h2>
          <p className="text-muted-foreground">{error}</p>
          <Button onClick={onBack} className="bg-primary hover:bg-primary/90">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-xl text-foreground">Edit Profile</h1>
          </div>
          <Button
            onClick={handleSave}
            className="bg-primary hover:bg-primary/90"
            disabled={updating}
          >
            <Save className="w-4 h-4 mr-2" />
            {updating ? "Saving..." : "Save"}
          </Button>
        </div>
      </motion.div>

      <div className="pb-6 p-4">
        {/* Profile Image Section */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5" />
              <span>Profile Photo</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            <Avatar className="w-24 h-24">
              <AvatarImage src={formData.profileImage} alt="Profile" />
              <AvatarFallback>{formData.name ? formData.name.charAt(0).toUpperCase() : "U"}</AvatarFallback>
            </Avatar>
            <div className="space-y-2 text-center">
              <Label htmlFor="profileImage" className="cursor-pointer">
                <Button variant="outline" asChild>
                  <span>
                    <Camera className="w-4 h-4 mr-2" />
                    Change Photo
                  </span>
                </Button>
                <Input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handlePhotoChange}
                />
              </Label>
            </div>
          </CardContent>
        </Card>

        {/* Basic Information */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="w-5 h-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                className="bg-input-background"
                placeholder="Enter your full name"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gender">Gender</Label>
                <Select
                  value={formData.gender}
                  onValueChange={(value) => handleInputChange("gender", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select gender" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="lookingFor">Looking For</Label>
                <Select
                  value={formData.lookingFor}
                  onValueChange={(value) => handleInputChange("lookingFor", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Looking for" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="male">Male</SelectItem>
                    <SelectItem value="female">Female</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="motherTongue">Mother Tongue</Label>
              <Select
                value={formData.motherTongue}
                onValueChange={(value) => handleInputChange("motherTongue", value)}
              >
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder="Select mother tongue" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kannada">Kannada</SelectItem>
                  <SelectItem value="telugu">Telugu</SelectItem>
                  <SelectItem value="tamil">Tamil</SelectItem>
                  <SelectItem value="hindi">Hindi</SelectItem>
                  <SelectItem value="english">English</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
                className="bg-input-background"
                placeholder="Enter your phone number"
              />
            </div>
          </CardContent>
        </Card>

        {/* Personal Details */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Personal Details</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Date of Birth</Label>
              <div className="grid grid-cols-3 gap-2">
                <Select
                  value={formData.birthDay}
                  onValueChange={(value) => handleInputChange("birthDay", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Day" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 31 }, (_, i) => (
                      <SelectItem key={i + 1} value={String(i + 1).padStart(2, "0")}>
                        {String(i + 1).padStart(2, "0")}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.birthMonth}
                  onValueChange={(value) => handleInputChange("birthMonth", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Month" />
                  </SelectTrigger>
                  <SelectContent>
                    {["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"].map(
                      (month, i) => (
                        <SelectItem key={month} value={String(i + 1).padStart(2, "0")}>
                          {month}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
                <Select
                  value={formData.birthYear}
                  onValueChange={(value) => handleInputChange("birthYear", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Year" />
                  </SelectTrigger>
                  <SelectContent>
                    {Array.from({ length: 50 }, (_, i) => (
                      <SelectItem key={2005 - i} value={String(2005 - i)}>
                        {2005 - i}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="height">Height</Label>
                <Select
                  value={formData.height}
                  onValueChange={(value) => handleInputChange("height", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select height" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="4.6-4.8">4'6" - 4'8"</SelectItem>
                    <SelectItem value="4.9-4.11">4'9" - 4'11"</SelectItem>
                    <SelectItem value="5.0-5.2">5'0" - 5'2"</SelectItem>
                    <SelectItem value="5.3-5.5">5'3" - 5'5"</SelectItem>
                    <SelectItem value="5.6-5.8">5'6" - 5'8"</SelectItem>
                    <SelectItem value="5.9-5.11">5'9" - 5'11"</SelectItem>
                    <SelectItem value="6.0-6.2">6'0" - 6'2"</SelectItem>
                    <SelectItem value="6.3+">6'3" and above</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="physicalStatus">Physical Status</Label>
                <Select
                  value={formData.physicalStatus}
                  onValueChange={(value) => handleInputChange("physicalStatus", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select physical status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="physically_challenged">Physically Challenged</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maritalStatus">Marital Status</Label>
              <Select
                value={formData.maritalStatus}
                onValueChange={(value) => handleInputChange("maritalStatus", value)}
              >
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder="Select marital status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="never-married">Never Married</SelectItem>
                  <SelectItem value="divorced">Divorced</SelectItem>
                  <SelectItem value="widowed">Widowed</SelectItem>
                  <SelectItem value="separated">Separated</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {formData.maritalStatus !== "never-married" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="numChildren">Number of Children</Label>
                  <Select
                    value={formData.numChildren}
                    onValueChange={(value) => handleInputChange("numChildren", value)}
                  >
                    <SelectTrigger className="bg-input-background">
                      <SelectValue placeholder="Select number" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">None</SelectItem>
                      <SelectItem value="1">1</SelectItem>
                      <SelectItem value="2">2</SelectItem>
                      <SelectItem value="3">3</SelectItem>
                      <SelectItem value="4+">4 or more</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.numChildren !== "0" && (
                  <div className="space-y-2">
                    <Label htmlFor="childrenLivingTogether">Children Living Together</Label>
                    <Select
                      value={formData.childrenLivingTogether}
                      onValueChange={(value) => handleInputChange("childrenLivingTogether", value)}
                    >
                      <SelectTrigger className="bg-input-background">
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="yes">Yes</SelectItem>
                        <SelectItem value="no">No</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Background & Career */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Briefcase className="w-5 h-5" />
              <span>Background & Career</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="religion">Religion</Label>
                <Select
                  value={formData.religion}
                  onValueChange={(value) => handleInputChange("religion", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select religion" />
                  </SelectTrigger>
                  <SelectContent>
                    {religions.map(religion => (
                      <SelectItem key={religion} value={religion}>{religion}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="community">Community</Label>
                <Select
                  value={formData.community}
                  onValueChange={(value) => handleInputChange("community", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select community" />
                  </SelectTrigger>
                  <SelectContent>
                    {communities.map(community => (
                      <SelectItem key={community} value={community}>{community}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="subcaste">Subcaste (Optional)</Label>
              <Input
                id="subcaste"
                value={formData.subcaste}
                onChange={(e) => handleInputChange("subcaste", e.target.value)}
                className="bg-input-background"
                placeholder="Enter subcaste"
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="willingAnyCaste"
                checked={formData.willingAnyCaste}
                onCheckedChange={(checked) => handleInputChange("willingAnyCaste", checked)}
              />
              <Label htmlFor="willingAnyCaste">Willing to marry from any caste</Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="education">Education</Label>
                <Select
                  value={formData.education}
                  onValueChange={(value) => handleInputChange("education", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select education" />
                  </SelectTrigger>
                  <SelectContent>
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
              <div className="space-y-2">
                <Label htmlFor="occupation">Occupation</Label>
                <Select
                  value={formData.occupation}
                  onValueChange={(value) => handleInputChange("occupation", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select occupation" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="software-engineer">Software Engineer</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                    <SelectItem value="teacher">Teacher</SelectItem>
                    <SelectItem value="business">Business</SelectItem>
                    <SelectItem value="government">Government Service</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {formData.education && formData.education !== 'other' && (
              <div className="space-y-2">
                <Label htmlFor="fieldOfStudy">Field of Study</Label>
                <Select
                  value={formData.fieldOfStudy}
                  onValueChange={(value) => handleInputChange("fieldOfStudy", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select field" />
                  </SelectTrigger>
                  <SelectContent>
                    {getCourseOptions(formData.education).map(course => (
                      <SelectItem key={course.value} value={course.value}>
                        {course.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="income">Annual Income</Label>
              <Select
                value={formData.income}
                onValueChange={(value) => handleInputChange("income", value)}
              >
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder="Select income" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-5">₹2-5 Lakhs</SelectItem>
                  <SelectItem value="5-10">₹5-10 Lakhs</SelectItem>
                  <SelectItem value="10-15">₹10-15 Lakhs</SelectItem>
                  <SelectItem value="15-25">₹15-25 Lakhs</SelectItem>
                  <SelectItem value="25-50">₹25-50 Lakhs</SelectItem>
                  <SelectItem value="50+">₹50+ Lakhs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Location & Family */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MapPin className="w-5 h-5" />
              <span>Location & Family</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state}
                  onValueChange={(value) => handleInputChange("state", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select state" />
                  </SelectTrigger>
                  <SelectContent>
                    {stateList.map((state) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2 relative">
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => handleInputChange("city", e.target.value)}
                  placeholder="Enter city"
                  className="bg-input-background"
                />
                {showCityDropdown && filteredCities.length > 0 && (
                  <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-48 overflow-y-auto">
                    {filteredCities.map((city, index) => (
                      <div
                        key={index}
                        className="px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm"
                        onClick={() => selectCity(city)}
                      >
                        {city}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="familyStatus">Family Status</Label>
                <Select
                  value={formData.familyStatus}
                  onValueChange={(value) => handleInputChange("familyStatus", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="middle_class">Middle Class</SelectItem>
                    <SelectItem value="upper_middle">Upper Middle Class</SelectItem>
                    <SelectItem value="rich">Rich</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="familyWealth">Family Wealth</Label>
                <Select
                  value={formData.familyWealth}
                  onValueChange={(value) => handleInputChange("familyWealth", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select wealth" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="less_5l">5 Lakhs</SelectItem>
                    <SelectItem value="5_10l">5-10 Lakhs</SelectItem>
                    <SelectItem value="10_25l">10-25 Lakhs</SelectItem>
                    <SelectItem value="25_50l">25-50 Lakhs</SelectItem>
                    <SelectItem value="50l_1cr">50 Lakhs - 1 Crore</SelectItem>
                    <SelectItem value="above_1cr">1+ Crore</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="father">Father's Occupation</Label>
                <Input
                  id="father"
                  value={formData.father}
                  onChange={(e) => handleInputChange("father", e.target.value)}
                  className="bg-input-background"
                  placeholder="Father's occupation"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="mother">Mother's Occupation</Label>
                <Input
                  id="mother"
                  value={formData.mother}
                  onChange={(e) => handleInputChange("mother", e.target.value)}
                  className="bg-input-background"
                  placeholder="Mother's occupation"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="about">About Yourself</Label>
              <Textarea
                id="about"
                value={formData.about}
                onChange={(e) => handleInputChange("about", e.target.value)}
                className="bg-input-background min-h-[100px]"
                placeholder="Tell us about yourself..."
              />
            </div>
          </CardContent>
        </Card>

        {/* Hobbies & Interests */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Music className="w-5 h-5" />
              <span>Hobbies & Interests</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="musicGenre">Music Genre</Label>
                <Select
                  value={formData.musicGenre}
                  onValueChange={(value) => handleInputChange("musicGenre", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="classical">Classical</SelectItem>
                    <SelectItem value="rock">Rock</SelectItem>
                    <SelectItem value="pop">Pop</SelectItem>
                    <SelectItem value="jazz">Jazz</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="sports">Favorite Sport</Label>
                <Select
                  value={formData.sports}
                  onValueChange={(value) => handleInputChange("sports", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select sport" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="cricket">Cricket</SelectItem>
                    <SelectItem value="football">Football</SelectItem>
                    <SelectItem value="badminton">Badminton</SelectItem>
                    <SelectItem value="tennis">Tennis</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="spokenLanguages">Spoken Languages</Label>
              <Input
                id="spokenLanguages"
                value={formData.spokenLanguages}
                onChange={(e) => handleInputChange("spokenLanguages", e.target.value)}
                className="bg-input-background"
                placeholder="e.g., English, Hindi, Telugu"
              />
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle */}
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Utensils className="w-5 h-5" />
              <span>Lifestyle</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="smoking">Smoking</Label>
                <Select
                  value={formData.smoking}
                  onValueChange={(value) => handleInputChange("smoking", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Smoking habits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="drinking">Drinking</Label>
                <Select
                  value={formData.drinking}
                  onValueChange={(value) => handleInputChange("drinking", value)}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Drinking habits" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="never">Never</SelectItem>
                    <SelectItem value="occasionally">Occasionally</SelectItem>
                    <SelectItem value="regularly">Regularly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dietType">Diet Preference</Label>
              <Select
                value={formData.dietType}
                onValueChange={(value) => handleInputChange("dietType", value)}
              >
                <SelectTrigger className="bg-input-background">
                  <SelectValue placeholder="Select diet" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                  <SelectItem value="eggetarian">Eggetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}