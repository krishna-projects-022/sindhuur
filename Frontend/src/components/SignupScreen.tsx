import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Chrome, User, Mail, Phone, MapPin, Calendar, Users, Heart, Book, Briefcase, DollarSign, Globe, Music, BookOpen, Film, Utensils, Languages, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { Checkbox } from "./ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Textarea } from "./ui/textarea";

import axios from 'axios';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from "react-router-dom";
import logoImage from "../assets/logo-1.png";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface SignupScreenProps {
  onNavigateToLogin: () => void;
  onSendOTP: (data: { phone?: string; email?: string; type: string }) => void;
}

export default function SignupScreen({
  onNavigateToLogin,
  onSendOTP
}: SignupScreenProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [step, setStep] = useState(location.state?.step || 1);
  const [formData, setFormData] = useState({
    // Steps 1-5 fields
    accountFor: "",
    name: "",
    email: location.state?.email || "",
    phone: location.state?.phone || "",
    gender: "",
    lookingFor: "",
    birthDay: "",
    birthMonth: "",
    birthYear: "",
    religion: "",
    community: "",
    motherTongue: "",
    maritalStatus: "",
    height: "",
    education: "",
    fieldOfStudy: "",
    otherEducation: "",
    occupation: "",
    income: "",
    city: "",
    state: "",
    otp: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
    rememberMe: false,
    physicalStatus: "",
    numChildren: "0",
    childrenLivingTogether: "",
    subcaste: "",
    willingAnyCaste: false,
    country: "india",
    familyStatus: "",
    familyWealth: "",
    about: "",
    father: "",
    mother: "",
    familyTree: "",

    // Step 6: Hobbies & Interests
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

    // Step 7: Horoscopic Details
    timeOfBirth: "",
    placeOfBirth: "",
    nakshatra: "",
    rashi: "",

    // Step 8: Lifestyle & Education
    eatingHabits: "",
    smoking: "",
    drinking: "",
    college: "",
    course: "",
    passingYear: "",

    // Step 9: Reset Password
    newPassword: "",
    confirmNewPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(location.state?.otpVerified || false);
  const [otpButtonDisabled, setOtpButtonDisabled] = useState(false);
  const [filteredCities, setFilteredCities] = useState<string[]>([]);
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [religions, setReligions] = useState<string[]>([]);
  const [communities, setCommunities] = useState<string[]>([]);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const totalSteps = 10;

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

  useEffect(() => {
    if (location.state?.step) {
      setStep(location.state.step);
    }
    if (location.state?.otpVerified) {
      setOtpVerified(location.state.otpVerified);
      setOtpSent(true);
    }
    if (location.state?.email) {
      setFormData(prev => ({ ...prev, email: location.state.email }));
    }
    if (location.state?.phone) {
      setFormData(prev => ({ ...prev, phone: location.state.phone }));
    }
  }, [location.state]);

  useEffect(() => {
    const fetchReligions = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/religions`);
        setReligions(response.data.map((item: any) => item.name));
      } catch (error: any) {
        console.error('Failed to fetch religions:', error.message);
      }
    };

    const fetchCommunities = async () => {
      try {
        const response = await axios.get(`${BASE_URL}/api/communities`);
        setCommunities(response.data.map((item: any) => item.name));
      } catch (error: any) {
        console.error('Failed to fetch communities:', error.message);
      }
    };

    fetchReligions();
    fetchCommunities();
  }, []);


  const indianCities = [
    "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Ahmedabad", "Chennai",
    "Kolkata", "Surat", "Pune", "Jaipur", "Hospet",
  ];

  const stateCities: { [key: string]: string[] } = {
    andhra_pradesh: [
      "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
      "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Chittoor", "Ongole"
    ],
    arunachal_pradesh: ["Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"],
    assam: ["Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"],
    bihar: ["Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"],
    chhattisgarh: ["Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"],
    goa: ["Panaji", "Margao", "Vasco da Gama", "Mapusa"],
    gujarat: ["Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar", "Jamnagar", "Junagadh", "Gandhinagar"],
    haryana: ["Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar", "Rohtak", "Sonipat"],
    himachal_pradesh: ["Shimla", "Manali", "Dharamshala", "Mandi", "Kullu", "Solan"],
    jharkhand: ["Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"],
    karnataka: [
      "Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi", "Davangere",
      "Tumakuru", "Shivamogga", "Ballari", "Udupi", "Hassan", "Raichur", "Bidar", "Chitradurga", "Gadag"
    ],
    kerala: [
      "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Alappuzha",
      "Palakkad", "Kannur", "Malappuram", "Kollam", "Kottayam"
    ],
    madhya_pradesh: ["Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Satna"],
    maharashtra: [
      "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur",
      "Amravati", "Kolhapur", "Sangli", "Latur", "Jalgaon", "Akola", "Ahmednagar", "Satara", "Chandrapur"
    ],
    manipur: ["Imphal", "Thoubal", "Churachandpur", "Ukhrul"],
    meghalaya: ["Shillong", "Tura", "Jowai"],
    mizoram: ["Aizawl", "Lunglei", "Champhai"],
    nagaland: ["Kohima", "Dimapur", "Mokokchung"],
    odisha: ["Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur"],
    punjab: ["Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Mohali"],
    rajasthan: ["Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar"],
    sikkim: ["Gangtok", "Namchi", "Mangan", "Geyzing"],
    tamil_nadu: [
      "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Erode",
      "Vellore", "Tirunelveli", "Thoothukudi", "Kanchipuram", "Thanjavur", "Dindigul", "Karur", "Cuddalore", "Nagapattinam"
    ],
    telangana: [
      "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
      "Mahbubnagar", "Adilabad", "Ramagundam", "Siddipet", "Mancherial"
    ],
    tripura: ["Agartala", "Udaipur", "Dharmanagar"],
    uttar_pradesh: [
      "Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Meerut",
      "Ghaziabad", "Noida", "Bareilly", "Moradabad", "Aligarh", "Jhansi"
    ],
    uttarakhand: ["Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Nainital"],
    west_bengal: ["Kolkata", "Siliguri", "Asansol", "Durgapur", "Howrah", "Darjeeling"],
    andaman_nicobar: ["Port Blair"],
    chandigarh: ["Chandigarh"],
    dadra_nagar_haveli_daman_diu: ["Silvassa", "Daman", "Diu"],
    delhi: ["New Delhi", "Dwarka", "Rohini", "Saket", "Karol Bagh"],
    jammu_kashmir: ["Srinagar", "Jammu", "Anantnag", "Baramulla"],
    ladakh: ["Leh", "Kargil"],
    lakshadweep: ["Kavaratti"],
    puducherry: ["Puducherry", "Karaikal", "Mahe", "Yanam"],
    other: []
  };

  const stateList = [
    { value: "andhra_pradesh", label: "Andhra Pradesh" },
    { value: "arunachal_pradesh", label: "Arunachal Pradesh" },
    { value: "assam", label: "Assam" },
    { value: "bihar", label: "Bihar" },
    { value: "chhattisgarh", label: "Chhattisgarh" },
    { value: "goa", label: "Goa" },
    { value: "gujarat", label: "Gujarat" },
    { value: "haryana", label: "Haryana" },
    { value: "himachal_pradesh", label: "Himachal Pradesh" },
    { value: "jharkhand", label: "Jharkhand" },
    { value: "karnataka", label: "Karnataka" },
    { value: "kerala", label: "Kerala" },
    { value: "madhya_pradesh", label: "Madhya Pradesh" },
    { value: "maharashtra", label: "Maharashtra" },
    { value: "manipur", label: "Manipur" },
    { value: "meghalaya", label: "Meghalaya" },
    { value: "mizoram", label: "Mizoram" },
    { value: "nagaland", label: "Nagaland" },
    { value: "odisha", label: "Odisha" },
    { value: "punjab", label: "Punjab" },
    { value: "rajasthan", label: "Rajasthan" },
    { value: "sikkim", label: "Sikkim" },
    { value: "tamil_nadu", label: "Tamil Nadu" },
    { value: "telangana", label: "Telangana" },
    { value: "tripura", label: "Tripura" },
    { value: "uttar_pradesh", label: "Uttar Pradesh" },
    { value: "uttarakhand", label: "Uttarakhand" },
    { value: "west_bengal", label: "West Bengal" },
    { value: "andaman_nicobar", label: "Andaman & Nicobar Islands" },
    { value: "chandigarh", label: "Chandigarh" },
    { value: "dadra_nagar_haveli_daman_diu", label: "Dadra & Nagar Haveli and Daman & Diu" },
    { value: "delhi", label: "Delhi" },
    { value: "jammu_kashmir", label: "Jammu & Kashmir" },
    { value: "ladakh", label: "Ladakh" },
    { value: "lakshadweep", label: "Lakshadweep" },
    { value: "puducherry", label: "Puducherry" },
  ];

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
        { value: 'electrical-engineering', label: 'Electrical Engineering' },
        { value: 'electronics-engineering', label: 'Electronics Engineering' },
        { value: 'computer-engineering', label: 'Computer Engineering' },
        { value: 'automobile-engineering', label: 'Automobile Engineering' },
        { value: 'nursing', label: 'Nursing' },
        { value: 'pharmacy', label: 'Pharmacy' },
        { value: 'business-administration', label: 'Business Administration' },
        { value: 'information-technology', label: 'Information Technology' },
        { value: 'graphic-design', label: 'Graphic Design' },
        { value: 'hotel-management', label: 'Hotel Management' },
        { value: 'other', label: 'Other' },
      ],
      'Bachelor': [
        { value: 'B.Com', label: 'B.Com (Bachelor of Commerce)' },
        { value: 'B.Sc', label: 'B.Sc (Bachelor of Science)' },
        { value: 'B.Sc-BZC', label: 'B.Sc (Botany, Zoology, Chemistry)' },
        { value: 'B.Sc-CSE', label: 'B.Sc (Computer Science)' },
        { value: 'BE/Btech-Civil', label: 'B.E./B.Tech (Civil Engineering)' },
        { value: 'BE/Btech-Mechanical', label: 'B.E./B.Tech (Mechanical Engineering)' },
        { value: 'BE/Btech-Electrical', label: 'B.E./B.Tech (Electrical Engineering)' },
        { value: 'BE/Btech-ECE', label: 'B.E./B.Tech (Electronics and Communication)' },
        { value: 'BE/Btech-CSE', label: 'B.E./B.Tech (Computer Science Engineering)' },
        { value: 'BA', label: 'B.A. (Bachelor of Arts)' },
        { value: 'BBA', label: 'BBA (Bachelor of Business Administration)' },
        { value: 'BCA', label: 'BCA (Bachelor of Computer Applications)' },
        { value: 'B.Pharm', label: 'B.Pharm (Bachelor of Pharmacy)' },
        { value: 'B.Sc-Nursing', label: 'B.Sc (Nursing)' },
        { value: 'B.Sc-Agriculture', label: 'B.Sc (Agriculture)' },
        { value: 'Other', label: 'Other' },
      ],
      'Master': [
        { value: 'M.com', label: 'M.Com (Master of Commerce)' },
        { value: 'M.Sc-Chemistry', label: 'M.Sc (Chemistry)' },
        { value: 'M.Sc-Physics', label: 'M.Sc (Physics)' },
        { value: 'M.Sc-Mathematics', label: 'M.Sc (Mathematics)' },
        { value: 'M.Sc-Computer Science', label: 'M.Sc (Computer Science)' },
        { value: 'M.Sc-Biotechnology', label: 'M.Sc (Biotechnology)' },
        { value: 'MBA', label: 'MBA (Master of Business Administration)' },
        { value: 'M.Tech-Civil', label: 'M.Tech (Civil Engineering)' },
        { value: 'M.Tech-Mechanical', label: 'M.Tech (Mechanical Engineering)' },
        { value: 'M.Tech-CSE', label: 'M.Tech (Computer Science Engineering)' },
        { value: 'M.Tech-ECE', label: 'M.Tech (Electronics and Communication)' },
        { value: 'MA', label: 'M.A. (Master of Arts)' },
        { value: 'MCA', label: 'MCA (Master of Computer Applications)' },
        { value: 'MPH', label: 'MPH (Master of Public Health)' },
        { value: 'M.Sc-Psychology', label: 'M.Sc (Psychology)' },
        { value: 'Other', label: 'Other' },
      ],
      'Ph.D.': [
        { value: 'Ph.D.-Engineering', label: 'Ph.D. (Engineering)' },
        { value: 'Ph.D.-Physics', label: 'Ph.D. (Physics)' },
        { value: 'Ph.D.-Chemistry', label: 'Ph.D. (Chemistry)' },
        { value: 'Ph.D.-Biology', label: 'Ph.D. (Biology)' },
        { value: 'Ph.D.-Computer-Science', label: 'Ph.D. (Computer Science)' },
        { value: 'Ph.D.-Mathematics', label: 'Ph.D. (Mathematics)' },
        { value: 'Ph.D.-Psychology', label: 'Ph.D. (Psychology)' },
        { value: 'Ph.D.-Education', label: 'Ph.D. (Education)' },
        { value: 'Ph.D.-Management', label: 'Ph.D. (Management)' },
        { value: 'Ph.D.-Arts', label: 'Ph.D. (Arts)' },
        { value: 'Other', label: 'Other' },
      ],
      'Professional': [
        { value: 'MD', label: 'MD (Doctor of Medicine)' },
        { value: 'JD', label: 'JD (Juris Doctor - Law)' },
        { value: 'DDS', label: 'DDS (Doctor of Dental Surgery)' },
        { value: 'PharmD', label: 'PharmD (Doctor of Pharmacy)' },
        { value: 'DVM', label: 'DVM (Doctor of Veterinary Medicine)' },
        { value: 'CA', label: 'CA (Chartered Accountancy)' },
        { value: 'CFA', label: 'CFA (Chartered Financial Analyst)' },
        { value: 'CPA', label: 'CPA (Certified Public Accountant)' },
        { value: 'Other', label: 'Other' },
      ],
    };
    return options[education] || [];
  };


  // State and city data (keep your existing stateCities and stateList arrays)

  const validateField = (field: string, value: any) => {
    switch (field) {
      // Existing validations for steps 1-5...
      // Add new validations for steps 6-10
      case "musicGenre":
      case "readingType":
      case "movieGenre":
      case "sports":
      case "cuisine":
      case "dietType":
      case "nakshatra":
      case "rashi":
      case "eatingHabits":
      case "college":
      case "course":
        return ""; // These are optional fields

      case "spokenLanguages":
        if (value && value.length < 2) return "Please enter at least one language";
        return "";

      case "passingYear":
        if (value) {
          const year = parseInt(value);
          if (year < 1950 || year > new Date().getFullYear()) {
            return "Please enter a valid passing year";
          }
        }
        return "";

      case "newPassword":
        if (value && value.length < 6) return "Password must be at least 6 characters";
        return "";

      case "confirmNewPassword":
        if (formData.newPassword && value !== formData.newPassword) return "Passwords do not match";
        return "";

      default:
        return validateExistingField(field, value);
    }
  };

  const validateExistingField = (field: string, value: any) => {
    switch (field) {
      case "accountFor":
        return value ? "" : "Please select who this account is for";
      case "name":
        if (!value) {
          return "Please enter name";
        } else if (!/^[A-Za-z\s]+$/.test(value)) {
          return "Name should contain only letters";
        } else if (value.length < 3) {
          return "Name must be at least 3 characters long";
        } else {
          return "";
        }
      case "email":
        if (!value) return "Please enter your email address";
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? ""
          : "Please enter a valid email address (e.g., user@example.com, no numbers in domain or TLD)";
      case "phone":
        if (!value) return "Please enter your phone number";
        return /^[6-9][\d\s-]{9,14}$/
          .test(value)
          ? ""
          : "Please enter a valid phone number starting with 6, 7, 8, or 9 (10-15 digits)";
      case "gender":
        return value ? "" : "Please select your gender";
      case "lookingFor":
        return value ? "" : "Please select who you are looking for";
      case "birthDay":
        return value ? "" : "Please select your birth day";
      case "birthMonth":
        return value ? "" : "Please select your birth month";
      case "birthYear":
        return value ? "" : "Please select your birth year";
      case "religion":
        return value ? "" : "Please select your religion";
      case "community":
        return value ? "" : "Please select your community";
      case "motherTongue":
        return value ? "" : "Please select your mother tongue";
      case "maritalStatus":
        return value ? "" : "Please select your marital status";
      case "height":
        return value ? "" : "Please select your height";
      case "education":
        return value ? "" : "Please select your education level";
      case "fieldOfStudy":
        return formData.education && formData.education !== "other" && !value
          ? "Please select your field of study"
          : "";
      case "otherEducation":
        return formData.education === "other" && !value
          ? "Please specify your education details"
          : "";
      case "occupation":
        return value ? "" : "Please select your occupation";
      case "income":
        return value ? "" : "Please select your income range";
      case "city":
        return value ? "" : "Please enter or select your city";
      case "state":
        return value ? "" : "Please select or enter your state";
      case "otp":
        if (!otpSent) return "";
        return value.length === 6 && /^\d{6}$/.test(value)
          ? ""
          : "Please enter a valid 6-digit OTP";
      case "password":
        if (!value) return "Please create a password";
        return value.length >= 6 ? "" : "Password must be at least 6 characters long";
      case "confirmPassword":
        if (!value) return "Please re-enter your password";
        return value === formData.password ? "" : "Passwords do not match";
      case "agreeToTerms":
        return value ? "" : "Please agree to terms and conditions";
      case "rememberMe":
        return "";
      case "physicalStatus":
        return value ? "" : "Please select physical status";
      case "numChildren":
        if (["divorced", "widowed", "separated"].includes(formData.maritalStatus)) {
          return value ? "" : "Please select number of children";
        }
        return "";
      case "childrenLivingTogether":
        if (formData.numChildren !== "0" && formData.numChildren) {
          return value ? "" : "Please select if children are living together";
        }
        return "";
      case "subcaste":
        return ""; // optional
      case "country":
        return value ? "" : "Please select your country";
      case "familyStatus":
        return value ? "" : "Please select family status";
      case "familyWealth":
        return value ? "" : "Please select family wealth";
      case "about":
        if (!value) return "Please enter a few words about yourself";
        if (value.length < 20) return "Description must be at least 20 characters long";
        return "";
      default:
        return "";
    }
  };

  // const handleInputChange = (field: string, value: string | boolean) => {
  //   setFormData(prev => ({ ...prev, [field]: value }));
  //   const errorMessage = validateField(field, value);
  //   setErrors(prev => ({ ...prev, [field]: errorMessage }));

  //   // Handle field dependencies
  //   if (field === "maritalStatus" && value === "never-married") {
  //     setFormData(prev => ({ ...prev, numChildren: "0", childrenLivingTogether: "" }));
  //   }

  //   if (field === "newPassword") {
  //     setErrors(prev => ({
  //       ...prev,
  //       confirmNewPassword: validateField("confirmNewPassword", formData.confirmNewPassword),
  //     }));
  //   }
  // };

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    const errorMessage = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: errorMessage }));

    if (field === "maritalStatus" && value === "never-married") {
      setFormData(prev => ({ ...prev, numChildren: "0", childrenLivingTogether: "" }));
      setErrors(prev => ({ ...prev, numChildren: "", childrenLivingTogether: "" }));
    }

    if (field === "numChildren" && value === "0") {
      setFormData(prev => ({ ...prev, childrenLivingTogether: "" }));
      setErrors(prev => ({ ...prev, childrenLivingTogether: "" }));
    }

    if (field === "country") {
      setFormData(prev => ({ ...prev, state: "", city: "" }));
      setErrors(prev => ({ ...prev, state: "", city: "" }));
      setFilteredCities([]);
      setShowCityDropdown(false);
    }

    if (field === "state" && formData.country === "india") {
      setFormData(prev => ({ ...prev, city: "" }));
      setErrors(prev => ({ ...prev, city: "" }));
      setFilteredCities([]);
      setShowCityDropdown(false);
    }

    if (field === "city") {
      if (formData.country === "india" && typeof value === "string" && value.length > 0 && formData.state) {
        const availableCities = stateCities[formData.state] || indianCities;
        const filtered = availableCities
          .filter(city => city.toLowerCase().includes(value.toLowerCase()))
          .slice(0, 10);
        setFilteredCities(filtered);
        setShowCityDropdown(true);
      } else {
        setShowCityDropdown(false);
      }
    }

    if (field === "education" && value !== formData.education) {
      setFormData(prev => ({ ...prev, fieldOfStudy: "", otherEducation: "" }));
      setErrors(prev => ({
        ...prev,
        fieldOfStudy: validateField("fieldOfStudy", ""),
        otherEducation: validateField("otherEducation", ""),
      }));
    }

    if (field === "password") {
      setErrors(prev => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", formData.confirmPassword),
      }));
    }
    if (field === "confirmPassword") {
      setErrors(prev => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", value),
      }));
    }
    if (field === "newPassword") {
      setErrors(prev => ({
        ...prev,
        confirmNewPassword: validateField("confirmNewPassword", formData.confirmNewPassword),
      }));
    }
  };

  const handleMobileKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const allowedKeys = [
      "Backspace", "Delete", "ArrowLeft", "ArrowRight", "Tab", "Enter", " ", "-"
    ];
    if (formData.phone.length === 0 && !["6", "7", "8", "9"].includes(e.key) && !allowedKeys.includes(e.key)) {
      e.preventDefault();
    } else if (!allowedKeys.includes(e.key) && !/^\d$/.test(e.key)) {
      e.preventDefault();
    }
  };

  const selectCity = (city: string) => {
    setFormData(prev => ({ ...prev, city }));
    setErrors(prev => ({ ...prev, city: validateField("city", city) }));
    setShowCityDropdown(false);
  };

  const sendOTP = async (retries = 3, delay = 2000) => {
    const emailError = validateField("email", formData.email);
    if (!emailError) {
      setIsLoading(true);
      setError(null);
      for (let attempt = 1; attempt <= retries; attempt++) {
        try {
          const response = await axios.post(`${BASE_URL}/api/send-email-otp`, {
            email: formData.email
          });
          if (response.status === 200) {
            setOtpSent(true);
            setOtpButtonDisabled(true);
            setIsLoading(false);
            toast.success(
              `${response.data.message}`,
              { autoClose: 5000 }
            );
            return;
          }
        } catch (error: any) {
          if (attempt === retries) {
            toast.error(
              error.response?.data?.error || "Failed to send OTP. Please try again.",
              { autoClose: 5000 }
            );
            setError(error.response?.data?.error || "Failed to send OTP. Please try again.");
          } else {
            await new Promise(resolve => setTimeout(resolve, delay));
          }
        }
      }
      setIsLoading(false);
    } else {
      setErrors(prev => ({ ...prev, email: emailError }));
      toast.error(emailError, { autoClose: 5000 });
    }
  };

  const verifyOTP = async () => {
    const otpError = validateField("otp", formData.otp);
    if (!otpError) {
      setIsLoading(true);
      setError(null);
      try {
        const response = await axios.post(`${BASE_URL}/api/verify-email-otp`, {
          email: formData.email,
          otp: formData.otp
        });
        if (response.status === 200) {
          setSuccess("✅ OTP verified successfully!");
          setErrors(prev => ({ ...prev, otp: "" }));
          setOtpVerified(true);
          setTimeout(() => setSuccess(null), 3000);
          return true;
        }
      } catch (error: any) {
        let errorMessage = "An error occurred while verifying OTP. Please try again.";
        if (error.response?.status === 400) {
          errorMessage = "Invalid OTP. Please check the OTP and try again.";
        } else if (error.response?.data?.error) {
          errorMessage = error.response.data.error;
        }
        setErrors(prev => ({
          ...prev,
          otp: errorMessage
        }));
        toast.error(errorMessage, { autoClose: 5000 });
        return false;
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors(prev => ({ ...prev, otp: otpError }));
      toast.error(otpError, { autoClose: 5000 });
      return false;
    }
  };

  const nextStep = () => {
    if (validateStep() && step < totalSteps) {
      setStep(step + 1);
      setError(null);
      window.scrollTo(0, 0);
    } else {
      setError("Please fill in all required fields correctly.");
      toast.error("Please fill in all required fields correctly.", { autoClose: 5000 });
    }
  };

  const prevStep = () => {
    if (step > 1) {
      setStep(step - 1);
      setError(null);
      window.scrollTo(0, 0);
    }
  };

  const handleSkip = () => {
    if (step < totalSteps) {
      setStep(step + 1);
      setError(null);
      window.scrollTo(0, 0);
    }
  };

  const validateStep = () => {
    const newErrors: { [key: string]: string } = {};
    const stepFields: { [key: number]: string[] } = {
      1: ["accountFor", "motherTongue", "name", "phone", "gender", "lookingFor"],
      2: ["birthDay", "birthMonth", "birthYear", "height", "physicalStatus", "maritalStatus"],
      3: ["religion", "community", "education", "occupation", "income"],
      4: ["country", "state", "city", "about"],
      5: ["email", "password", "confirmPassword", "agreeToTerms"],
      6: [], // All optional
      7: [], // All optional
      8: [], // All optional
      9: ["newPassword", "confirmNewPassword"], // Only validate if passwords are provided
      10: [] // Review step
    };

    const fields = stepFields[step] || [];
    fields.forEach(field => {
      const error = validateField(field, formData[field as keyof typeof formData]);
      if (error) newErrors[field] = error;
    });

    // Special validation for step 9 - only if passwords are provided
    if (step === 9 && formData.newPassword) {
      const confirmError = validateField("confirmNewPassword", formData.confirmNewPassword);
      if (confirmError) newErrors.confirmNewPassword = confirmError;
    }

    setErrors(prev => ({ ...prev, ...newErrors }));
    return Object.keys(newErrors).length === 0;
  };

const handleSignup = async () => {
  if (validateStep() && otpVerified) {
    setIsLoading(true);
    setError(null);
    try {
      // Format date of birth properly
      const birthDate = formData.birthYear && formData.birthMonth && formData.birthDay
        ? `${formData.birthYear}-${formData.birthMonth.padStart(2, '0')}-${formData.birthDay.padStart(2, '0')}`
        : '';

      // Prepare profile data EXACTLY as backend expects
      const profileData = {
        role: "user",
        personalInfo: {
          name: formData.name,
          email: formData.email,
          mobile: formData.phone,
          gender: formData.gender,
          lookingFor: formData.lookingFor,
          about: formData.about || "",
        },
        demographics: {
          dateOfBirth: birthDate,
          height: formData.height,
          physicalStatus: formData.physicalStatus,
          maritalStatus: formData.maritalStatus,
          numChildren: formData.numChildren,
          childrenLivingTogether: formData.childrenLivingTogether,
          religion: formData.religion,
          community: formData.community,
          motherTongue: formData.motherTongue,
          subcaste: formData.subcaste || "",
          willingAnyCaste: formData.willingAnyCaste || false,
        },
        professionalInfo: {
          education: formData.education,
          fieldOfStudy: formData.fieldOfStudy || formData.otherEducation || "",
          occupation: formData.occupation,
          income: formData.income,
          college: formData.college || "",
          course: formData.course || "",
          passingYear: formData.passingYear || "",
        },
        location: {
          country: formData.country,
          state: formData.state,
          city: formData.city,
        },
        familyInfo: {
          father: formData.father || "",
          mother: formData.mother || "",
          familyStatus: formData.familyStatus,
          familyWealth: formData.familyWealth,
        },
        familyTree: formData.familyTree || "",
        // Hobbies data (Step 6)
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
        // Horoscope data (Step 7)
        horoscope: {
          timeOfBirth: formData.timeOfBirth || "",
          placeOfBirth: formData.placeOfBirth || "",
          nakshatra: formData.nakshatra || "",
          rashi: formData.rashi || "",
        },
        // Lifestyle data (Step 8)
        lifestyle: {
          eatingHabits: formData.eatingHabits || "",
          smoking: formData.smoking || "",
          drinking: formData.drinking || "",
        },
        credentials: {
          password: formData.password,
          rememberMe: formData.rememberMe || false,
        },
        subscription: {
          current: "free",
          details: {},
          history: []
        },
        profileCreatedAt: new Date().toISOString(),
        appVersion: "v2.1.3",
        profileStatus: "active"
      };

      console.log("Sending profile data to backend:", profileData);

      const response = await axios.post(`${BASE_URL}/api/create-profile`, profileData);

      if (response.status === 201) {
        const userData = response.data.user;
        
        // ✅ STORE USER DATA IN LOCALSTORAGE AFTER SUCCESSFUL SIGNUP
        if (userData && userData.token) {
          // Store user data with token in localStorage (same as login)
          localStorage.setItem("loggedInUser", JSON.stringify(userData));
          
          // Also set your auth context if you're using it
          if (login) {
            login(userData.token);
          }
          
          console.log("User data stored after signup:", userData);
          toast.success(`🎉 Congratulations ${formData.name}! Your profile has been created successfully!`, {
            autoClose: 5000
          });
        } else {
          // If backend doesn't return user data with token, create a basic user object
          const basicUserData = {
            token: response.data.token || "temp_token_" + Date.now(), // Fallback token
            name: formData.name,
            email: formData.email,
            personalInfo: {
              name: formData.name,
              email: formData.email
            },
            role: "user"
          };
          
          localStorage.setItem("loggedInUser", JSON.stringify(basicUserData));
          
          if (login) {
            login(basicUserData.token);
          }
          
          console.log("Basic user data stored after signup:", basicUserData);
          toast.success(`🎉 Congratulations ${formData.name}! Your profile has been created successfully!`, {
            autoClose: 5000
          });
        }
        
        // Reset form data
        setFormData({
          accountFor: "",
          name: "",
          email: "",
          phone: "",
          gender: "",
          lookingFor: "",
          birthDay: "",
          birthMonth: "",
          birthYear: "",
          religion: "",
          community: "",
          motherTongue: "",
          maritalStatus: "",
          height: "",
          education: "",
          fieldOfStudy: "",
          otherEducation: "",
          occupation: "",
          income: "",
          city: "",
          state: "",
          otp: "",
          password: "",
          confirmPassword: "",
          agreeToTerms: false,
          rememberMe: false,
          physicalStatus: "",
          numChildren: "0",
          childrenLivingTogether: "",
          subcaste: "",
          willingAnyCaste: false,
          country: "india",
          familyStatus: "",
          familyWealth: "",
          about: "",
          father: "",
          mother: "",
          familyTree: "",
          // Step 6 fields
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
          // Step 7 fields
          timeOfBirth: "",
          placeOfBirth: "",
          nakshatra: "",
          rashi: "",
          // Step 8 fields
          eatingHabits: "",
          smoking: "",
          drinking: "",
          college: "",
          course: "",
          passingYear: "",
          // Step 9 fields
          newPassword: "",
          confirmNewPassword: "",
        });
        
        setStep(1);
        setOtpSent(false);
        setOtpVerified(false);
        setOtpButtonDisabled(false);
        setErrors({});
        setSuccess(null);
        
        // Navigate to success screen after successful signup
        setTimeout(() => {
          navigate("/successscreen");
        }, 1000);
      }
    } catch (error) {
      console.error("Signup error:", error);
      
      // Handle specific error cases
      if (error.response?.status === 400) {
        const errorMessage = error.response?.data?.error || "Failed to create profile";
        
        if (errorMessage.includes("already registered")) {
          toast.error("This email or phone number is already registered. Please use different credentials.", { 
            autoClose: 7000 
          });
          setError("This email or phone number is already registered.");
        } else {
          toast.error(errorMessage, { autoClose: 5000 });
          setError(errorMessage);
        }
      } else if (error.response?.status === 409) {
        // Handle conflict - user already exists
        const errorMessage = error.response?.data?.error || "User already exists with this email or phone number";
        toast.error(errorMessage, { autoClose: 7000 });
        setError(errorMessage);
      } else if (error.response?.data?.error) {
        const errorMessage = error.response.data.error;
        toast.error(errorMessage, { autoClose: 5000 });
        setError(errorMessage);
      } else if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
        const errorMessage = "Unable to connect to server. Please check your internet connection.";
        toast.error(errorMessage, { autoClose: 5000 });
        setError(errorMessage);
      } else {
        const errorMessage = error.message || "Failed to create profile. Please try again.";
        toast.error(errorMessage, { autoClose: 5000 });
        setError(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  } else {
    const errorMsg = "Please fill in all required fields correctly and verify your email.";
    setError(errorMsg);
    toast.error(errorMsg, { autoClose: 5000 });
  }
};

  const getStepTitle = () => {
    const titles = {
      1: "Basic Information",
      2: "Personal Details",
      3: "Background & Career",
      4: "Location & Family",
      5: "Email Verification",
      6: "Hobbies & Interests",
      7: "Horoscopic Details",
      8: "Lifestyle & Education",
      9: "Security Settings",
      10: "Review & Submit"
    };
    return titles[step as keyof typeof titles] || "Create Account";
  };

  const getStepIcon = () => {
    const icons = {
      1: <User className="h-5 w-5" />,
      2: <Calendar className="h-5 w-5" />,
      3: <Book className="h-5 w-5" />,
      4: <MapPin className="h-5 w-5" />,
      5: <Mail className="h-5 w-5" />,
      6: <Music className="h-5 w-5" />,
      7: <Star className="h-5 w-5" />,
      8: <Utensils className="h-5 w-5" />,
      9: <Eye className="h-5 w-5" />,
      10: <Heart className="h-5 w-5" />
    };
    return icons[step as keyof typeof icons] || <User className="h-5 w-5" />;
  };


// Helper function to get name placeholder
const getPlaceholderName = () => {
  const relationshipMap = {
    myself: "Enter your name",
    son: "Enter your son's name",
    daughter: "Enter your daughter's name",
    sister: "Enter your sister's name",
    brother: "Enter your brother's name",
    friend: "Enter your friend's name"
  };
  
  return relationshipMap[formData.accountFor] || "Enter the name";
};

// Helper function to get phone placeholder
const getPlaceholderPhone = () => {
  const relationshipMap = {
    myself: "Enter your phone number",
    son: "Enter your son's phone number",
    daughter: "Enter your daughter's number",
    sister: "Enter your sister's number",
    brother: "Enter your brother's number",
    friend: "Enter your friend's number"
  };
  
  return relationshipMap[formData.accountFor] || "Enter phone number";
};


  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md" // Increased max-width for better layout
      >
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm w-full max-w-[300px] mx-auto">
      <CardHeader className="text-center space-y-3 px-3 py-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
          className="mx-auto w-12 h-12 flex items-center justify-center"
        >
          <img
            src={logoImage}
            alt="SoulMate Logo"
            className="w-full h-full object-contain"
          />
        </motion.div>
        <div>
          <CardTitle className="text-lg sm:text-xl text-primary flex items-center justify-center gap-1.5">
            {getStepIcon()}
            {getStepTitle()}
          </CardTitle>
          <CardDescription className="text-muted-foreground text-xs sm:text-sm mt-2">
            Step {step} of {totalSteps} - Start your journey
          </CardDescription>

          {/* Progress Bar */}
          <div className="flex items-center justify-center mt-4 ">
            <div className="flex items-center gap-1">
              {Array.from({ length: totalSteps }, (_, i) => i + 1).map((i) => (
                <div key={i} className="flex items-center shrink-0">
                  <div
                    className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center text-[10px] sm:text-xs font-medium ${
                      i <= step ? "bg-primary text-white" : "bg-gray-200 text-gray-600"
                    }`}
                  >
                    {i}
                  </div>
                  {i < totalSteps && (
                    <div
                      className={`w-3 sm:w-4 h-0.5 ${
                        i < step ? "bg-primary" : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {error && (
            <div className="text-red-500 text-xs mt-2 bg-red-50 p-1.5 rounded mt-5">
              {error}
            </div>
          )}
          {success && (
            <div className="text-green-500 text-xs mt-2 bg-green-50 p-1.5 rounded ">
              {success}
            </div>
          )}
        </div>
      </CardHeader>
 

          <CardContent className="space-y-6 max-h-[60vh] overflow-y-auto ">
            {/* Steps 1-5 - Keep your existing implementation */}
            {step === 1 && (
  <div className="space-y-4">
    {step === 1 && (
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="accountFor">This account is for</Label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Select
              value={formData.accountFor}
              onValueChange={(value) => handleInputChange("accountFor", value)}
            >
              <SelectTrigger className="bg-input-background border-border pl-10">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="myself">Myself</SelectItem>
                <SelectItem value="son">Son</SelectItem>
                <SelectItem value="daughter">Daughter</SelectItem>
                <SelectItem value="sister">Sister</SelectItem>
                <SelectItem value="brother">Brother</SelectItem>
                <SelectItem value="friend">Friend</SelectItem>
              </SelectContent>
            </Select>
            {errors.accountFor && (
              <p className="text-red-500 text-xs mt-1">{errors.accountFor}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="motherTongue">Mother Tongue</Label>
          <div className="relative">
            <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Select
              value={formData.motherTongue}
              onValueChange={(value) => handleInputChange("motherTongue", value)}
            >
              <SelectTrigger className="bg-input-background border-border pl-10">
                <SelectValue placeholder="Select mother tongue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="kannada">Kannada</SelectItem>
                <SelectItem value="telugu">Telugu</SelectItem>
                <SelectItem value="tamil">Tamil</SelectItem>
                <SelectItem value="hindi">Hindi</SelectItem>
                <SelectItem value="english">English</SelectItem>
                <SelectItem value="malayalam">Malayalam</SelectItem>
                <SelectItem value="marathi">Marathi</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
            {errors.motherTongue && (
              <p className="text-red-500 text-xs mt-1">{errors.motherTongue}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Name</Label>
          <div className="relative">
            <User className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="name"
              placeholder={getPlaceholderName()}
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              className="bg-input-background border-border pl-10"
            />
            {errors.name && (
              <p className="text-red-500 text-xs mt-1">{errors.name}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="phone">Phone Number</Label>
          <div className="relative">
            <Phone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              inputMode="numeric"
              placeholder={getPlaceholderPhone()}
              value={formData.phone}
              onChange={(e) => handleInputChange("phone", e.target.value)}
              onKeyDown={handleMobileKeyDown}
              maxLength={15}
              className="bg-input-background border-border pl-10"
            />
            {errors.phone && (
              <p className="text-red-500 text-xs mt-1">{errors.phone}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="gender">Gender</Label>
          <div className="relative">
            <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Select
              value={formData.gender}
              onValueChange={(value) => handleInputChange("gender", value)}
            >
              <SelectTrigger className="bg-input-background border-border pl-10">
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.gender && (
              <p className="text-red-500 text-xs mt-1">{errors.gender}</p>
            )}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="lookingFor">Looking For</Label>
          <div className="relative">
            <Heart className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Select
              value={formData.lookingFor}
              onValueChange={(value) => handleInputChange("lookingFor", value)}
            >
              <SelectTrigger className="bg-input-background border-border pl-10">
                <SelectValue placeholder="Looking for" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
              </SelectContent>
            </Select>
            {errors.lookingFor && (
              <p className="text-red-500 text-xs mt-1">{errors.lookingFor}</p>
            )}
          </div>
        </div>
      </div>
    )}
  </div>
)}

            {step === 2 && (
              <div className="space-y-4">
                {step === 2 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label>Date of Birth</Label>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="relative">
                          <Select
                            value={formData.birthDay}
                            onValueChange={(value) => handleInputChange("birthDay", value)}
                          >
                            <SelectTrigger className="bg-input-background border-border">
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
                          {errors.birthDay && (
                            <p className="text-red-500 text-xs mt-1">{errors.birthDay}</p>
                          )}
                        </div>
                        <div className="relative">
                          <Select
                            value={formData.birthMonth}
                            onValueChange={(value) => handleInputChange("birthMonth", value)}
                          >
                            <SelectTrigger className="bg-input-background border-border ">
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
                          {errors.birthMonth && (
                            <p className="text-red-500 text-xs mt-1">{errors.birthMonth}</p>
                          )}
                        </div>
                        <div className="relative">
                          <Select
                            value={formData.birthYear}
                            onValueChange={(value) => handleInputChange("birthYear", value)}
                          >
                            <SelectTrigger className="bg-input-background border-border ">
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
                          {errors.birthYear && (
                            <p className="text-red-500 text-xs mt-1">{errors.birthYear}</p>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="height">Height</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.height}
                          onValueChange={(value) => handleInputChange("height", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
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
                        {errors.height && (
                          <p className="text-red-500 text-xs mt-1">{errors.height}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="physicalStatus">Physical Status</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.physicalStatus}
                          onValueChange={(value) => handleInputChange("physicalStatus", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
                            <SelectValue placeholder="Select physical status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="normal">Normal</SelectItem>
                            <SelectItem value="physically_challenged">Physically Challenged</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.physicalStatus && (
                          <p className="text-red-500 text-xs mt-1">{errors.physicalStatus}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="maritalStatus">Marital Status</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.maritalStatus}
                          onValueChange={(value) => handleInputChange("maritalStatus", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
                            <SelectValue placeholder="Select marital status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="never-married">Never Married</SelectItem>
                            <SelectItem value="divorced">Divorced</SelectItem>
                            <SelectItem value="widowed">Widowed</SelectItem>
                            <SelectItem value="separated">Separated</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.maritalStatus && (
                          <p className="text-red-500 text-xs mt-1">{errors.maritalStatus}</p>
                        )}
                      </div>
                    </div>
                    {formData.maritalStatus !== "never-married" && (
                      <div className="space-y-2">
                        <Label htmlFor="numChildren">Number of Children</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Select
                            value={formData.numChildren}
                            onValueChange={(value) => handleInputChange("numChildren", value)}
                          >
                            <SelectTrigger className="bg-input-background border-border pl-10">
                              <SelectValue placeholder="Select number of children" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="0">None</SelectItem>
                              <SelectItem value="1">1</SelectItem>
                              <SelectItem value="2">2</SelectItem>
                              <SelectItem value="3">3</SelectItem>
                              <SelectItem value="4+">4 or more</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.numChildren && (
                            <p className="text-red-500 text-xs mt-1">{errors.numChildren}</p>
                          )}
                        </div>
                      </div>
                    )}
                    {formData.numChildren !== "0" && formData.numChildren && (
                      <div className="space-y-2">
                        <Label htmlFor="childrenLivingTogether">Children Living Together</Label>
                        <div className="relative">
                          <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Select
                            value={formData.childrenLivingTogether}
                            onValueChange={(value) => handleInputChange("childrenLivingTogether", value)}
                          >
                            <SelectTrigger className="bg-input-background border-border pl-10">
                              <SelectValue placeholder="Select if children living together" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          {errors.childrenLivingTogether && (
                            <p className="text-red-500 text-xs mt-1">{errors.childrenLivingTogether}</p>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {step === 3 && (
              <div className="space-y-4">
                {step === 3 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="religion">Religion</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.religion}
                          onValueChange={(value) => handleInputChange("religion", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
                            <SelectValue placeholder="Select religion" />
                          </SelectTrigger>
                          <SelectContent>
                            {religions.map(religion => (
                              <SelectItem key={religion} value={religion}>
                                {religion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.religion && (
                          <p className="text-red-500 text-xs mt-1">{errors.religion}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="community">Caste / Community</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.community}
                          onValueChange={(value) => handleInputChange("community", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
                            <SelectValue placeholder="Select community" />
                          </SelectTrigger>
                          <SelectContent>
                            {communities.map(community => (
                              <SelectItem key={community} value={community}>
                                {community}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {errors.community && (
                          <p className="text-red-500 text-xs mt-1">{errors.community}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="subcaste">Subcaste (Optional)</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="subcaste"
                          placeholder="Enter subcaste (optional)"
                          value={formData.subcaste}
                          onChange={(e) => handleInputChange("subcaste", e.target.value)}
                          className="bg-input-background border-border pl-10"
                        />
                        {errors.subcaste && (
                          <p className="text-red-500 text-xs mt-1">{errors.subcaste}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="willingAnyCaste"
                        checked={formData.willingAnyCaste}
                        onCheckedChange={(checked) => handleInputChange("willingAnyCaste", checked)}
                      />
                      <Label htmlFor="willingAnyCaste" className="text-sm">
                        Willing to marry from any caste
                      </Label>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="education">Education</Label>
                      <div className="relative">
                        <Book className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.education}
                          onValueChange={(value) => handleInputChange("education", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
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
                        {errors.education && (
                          <p className="text-red-500 text-xs mt-1">{errors.education}</p>
                        )}
                      </div>
                    </div>

                    {formData.education && formData.education !== 'other' && (
                      <div className="space-y-2">
                        <Label htmlFor="fieldOfStudy">Field of Study</Label>
                        <div className="relative">
                          <Book className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Select
                            value={formData.fieldOfStudy}
                            onValueChange={(value) => handleInputChange("fieldOfStudy", value)}
                          >
                            <SelectTrigger className="bg-input-background border-border pl-10">
                              <SelectValue placeholder="Select field of study" />
                            </SelectTrigger>
                            <SelectContent>
                              {getCourseOptions(formData.education).map(course => (
                                <SelectItem key={course.value} value={course.value}>
                                  {course.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          {errors.fieldOfStudy && (
                            <p className="text-red-500 text-xs mt-1">{errors.fieldOfStudy}</p>
                          )}
                        </div>
                      </div>
                    )}

                    {formData.education === 'other' && (
                      <div className="space-y-2">
                        <Label htmlFor="otherEducation">Specify Other Education</Label>
                        <div className="relative">
                          <Book className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                          <Input
                            id="otherEducation"
                            value={formData.otherEducation}
                            onChange={(e) => handleInputChange('otherEducation', e.target.value)}
                            placeholder="Enter your education details"
                            className="bg-input-background border-border pl-10"
                          />
                          {errors.otherEducation && (
                            <p className="text-red-500 text-xs mt-1">{errors.otherEducation}</p>
                          )}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <Label htmlFor="occupation">Occupation</Label>
                      <div className="relative">
                        <Briefcase className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.occupation}
                          onValueChange={(value) => handleInputChange("occupation", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
                            <SelectValue placeholder="Select occupation" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="software-engineer">Software Engineer</SelectItem>
                            <SelectItem value="doctor">Doctor</SelectItem>
                            <SelectItem value="teacher">Teacher</SelectItem>
                            <SelectItem value="business">Business</SelectItem>
                            <SelectItem value="government">Government Service</SelectItem>
                            <SelectItem value="banking">Banking</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.occupation && (
                          <p className="text-red-500 text-xs mt-1">{errors.occupation}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="income">Annual Income</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.income}
                          onValueChange={(value) => handleInputChange("income", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
                            <SelectValue placeholder="Select income range" />
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
                        {errors.income && (
                          <p className="text-red-500 text-xs mt-1">{errors.income}</p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 4 && (
              <div className="space-y-4">
                {step === 4 && (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="country">Country</Label>
                      <div className="relative">
                        <Globe className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.country}
                          onValueChange={(value) => handleInputChange("country", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
                            <SelectValue placeholder="Select country" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="india">India</SelectItem>
                            <SelectItem value="usa">USA</SelectItem>
                            <SelectItem value="uk">UK</SelectItem>
                            <SelectItem value="canada">Canada</SelectItem>
                            <SelectItem value="australia">Australia</SelectItem>
                            <SelectItem value="uae">UAE</SelectItem>
                            <SelectItem value="other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.country && (
                          <p className="text-red-500 text-xs mt-1">{errors.country}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="state">State</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        {formData.country === "india" ? (
                          <Select
                            value={formData.state}
                            onValueChange={(value) => handleInputChange("state", value)}
                          >
                            <SelectTrigger className="bg-input-background border-border pl-10">
                              <SelectValue placeholder="Select state" />
                            </SelectTrigger>
                            <SelectContent>
                              {stateList.map((s) => (
                                <SelectItem key={s.value} value={s.value}>
                                  {s.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input
                            id="state"
                            placeholder="Enter your state"
                            value={formData.state}
                            onChange={(e) => handleInputChange("state", e.target.value)}
                            className="bg-input-background border-border pl-10"
                          />
                        )}
                        {errors.state && (
                          <p className="text-red-500 text-xs mt-1">{errors.state}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2 relative">
                      <Label htmlFor="city">City</Label>
                      <div className="relative">
                        <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Input
                          id="city"
                          placeholder="Enter your city"
                          value={formData.city}
                          onChange={(e) => handleInputChange("city", e.target.value)}
                          className="bg-input-background border-border pl-10"
                          onFocus={() => {
                            if (formData.country === "india" && formData.state) {
                              const availableCities = stateCities[formData.state] || indianCities;
                              const filtered = availableCities.slice(0, 10);
                              setFilteredCities(filtered);
                              setShowCityDropdown(true);
                            }
                          }}
                          onBlur={() => {
                            setTimeout(() => setShowCityDropdown(false), 200);
                          }}
                        />
                        {errors.city && (
                          <p className="text-red-500 text-xs mt-1">{errors.city}</p>
                        )}
                      </div>
                      {showCityDropdown && formData.country === "india" && filteredCities.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-border rounded-md shadow-lg max-h-48 overflow-y-auto">
                          {filteredCities.map((city, index) => (
                            <div
                              key={index}
                              className="px-3 py-2 hover:bg-primary/10 cursor-pointer text-sm"
                              onClick={() => selectCity(city)}
                            >
                              {city}
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="familyStatus">Family Status</Label>
                      <div className="relative">
                        <Users className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.familyStatus}
                          onValueChange={(value) => handleInputChange("familyStatus", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
                            <SelectValue placeholder="Select family status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="middle_class">Middle Class</SelectItem>
                            <SelectItem value="upper_middle">Upper Middle Class</SelectItem>
                            <SelectItem value="rich">Rich</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.familyStatus && (
                          <p className="text-red-500 text-xs mt-1">{errors.familyStatus}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="familyWealth">Family Wealth / Net Worth</Label>
                      <div className="relative">
                        <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                        <Select
                          value={formData.familyWealth}
                          onValueChange={(value) => handleInputChange("familyWealth", value)}
                        >
                          <SelectTrigger className="bg-input-background border-border pl-10">
                            <SelectValue placeholder="Select family wealth" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="less_5l">5 Lakhs</SelectItem>
                            <SelectItem value="5_10l">5-10 Lakhs</SelectItem>
                            <SelectItem value="10_25l">10-25 Lakhs</SelectItem>
                            <SelectItem value="25_50l">25-50 Lakhs</SelectItem>
                            <SelectItem value="50l_1cr">50 Lakhs - 1 Crore</SelectItem>
                            <SelectItem value="above_1cr"> Crore</SelectItem>
                          </SelectContent>
                        </Select>
                        {errors.familyWealth && (
                          <p className="text-red-500 text-xs mt-1">{errors.familyWealth}</p>
                        )}
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="about">A Few Words About Yourself</Label>
                      <textarea
                        id="about"
                        value={formData.about}
                        onChange={(e) => handleInputChange("about", e.target.value)}
                        placeholder="Tell us about yourself"
                        className="w-full h-24 p-2 bg-input-background border-border rounded-md resize-none"
                      />
                      {errors.about && (
                        <p className="text-red-500 text-xs mt-1">{errors.about}</p>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {step === 5 && (
              <div className="space-y-4">
                {step === 5 && (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="email">Email Address</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        placeholder="Enter your email address"
                        className="border-orange-200 focus:border-orange-400"
                        disabled={otpSent || isLoading}
                      />
                      {errors.email && (
                        <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                      )}
                    </div>
                    <div className="text-center">
                      <Button
                        onClick={() => sendOTP()}
                        disabled={
                          otpButtonDisabled ||
                          isLoading ||
                          !!errors.email
                        }
                        className="bg-blue-500 hover:bg-blue-600 text-white px-6 py-2 rounded-md font-medium"
                      >
                        {isLoading ? "Sending..." : "Verify Your Email"}
                      </Button>
                      <p className="text-sm text-gray-600 mt-2">
                        We'll send an OTP to verify your email
                      </p>
                    </div>
                    {otpSent && (
                      <div className="space-y-4 border-t pt-4">
                        <div className="flex gap-2 items-end">
                          <div className="flex-1">
                            <Label htmlFor="otp">Enter OTP</Label>
                            <Input
                              id="otp"
                              value={formData.otp}
                              onChange={(e) => handleInputChange("otp", e.target.value)}
                              placeholder="Enter 6-digit OTP"
                              className="border-orange-200 focus:border-orange-400 text-center font-mono text-lg"
                              maxLength={6}
                              disabled={isLoading}
                            />
                            {errors.otp && (
                              <p className="text-red-500 text-xs mt-1">{errors.otp}</p>
                            )}
                          </div>
                          <Button
                            onClick={verifyOTP}
                            variant="outline"
                            className="h-10"
                            disabled={
                              isLoading ||
                              !!errors.otp
                            }
                          >
                            {isLoading ? "Verifying..." : "Verify OTP"}
                          </Button>
                        </div>
                        <p className="text-xs text-center text-gray-500">
                          Didn't receive OTP?{" "}
                          <button
                            className="text-orange-600 hover:underline"
                            onClick={() => {
                              setOtpButtonDisabled(false);
                              sendOTP();
                            }}
                            disabled={isLoading}
                          >
                            Resend
                          </button>
                        </p>
                      </div>
                    )}
                    {otpVerified && (
                      <>
                        <div>
                          <Label htmlFor="password">Create Password</Label>
                          <div className="relative">
                            <Input
                              id="password"
                              type={showPassword ? "text" : "password"}
                              value={formData.password}
                              onChange={(e) => handleInputChange("password", e.target.value)}
                              placeholder="Create password"
                              className="border-orange-200 focus:border-orange-400 pr-10"
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            {errors.password && (
                              <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="confirmPassword">Re-enter Password</Label>
                          <div className="relative">
                            <Input
                              id="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              value={formData.confirmPassword}
                              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                              placeholder="Re-enter password"
                              className="border-orange-200 focus:border-orange-400 pr-10"
                              disabled={isLoading}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="h-4 w-4 text-muted-foreground" />
                              ) : (
                                <Eye className="h-4 w-4 text-muted-foreground" />
                              )}
                            </Button>
                            {errors.confirmPassword && (
                              <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center space-x-2">
                          <Checkbox
                            id="agreeToTerms"
                            checked={formData.agreeToTerms}
                            onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
                            className="accent-orange-500"
                            disabled={isLoading}
                          />
                          <Label htmlFor="agreeToTerms" className="text-sm text-gray-700">
                            I agree to the{" "}
                            <span className="text-orange-600 hover:underline cursor-pointer">
                              Terms & Conditions
                            </span>{" "}
                            and{" "}
                            <span className="text-orange-600 hover:underline cursor-pointer">
                              Privacy Policy
                            </span>
                          </Label>
                          {errors.agreeToTerms && (
                            <p className="text-red-500 text-xs mt-1">{errors.agreeToTerms}</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Step 6 - Hobbies & Interests */}
            {step === 6 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Music className="h-12 w-12 text-primary mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Hobbies & Interests</h3>
                  <p className="text-sm text-muted-foreground">Tell us about your interests to find better matches</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Music */}
                  <div className="space-y-2">
                    <Label htmlFor="musicGenre">Music Genre</Label>
                    <Select value={formData.musicGenre} onValueChange={(v) => handleInputChange("musicGenre", v)}>
                      <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="classical">Classical</SelectItem>
                        <SelectItem value="rock">Rock</SelectItem>
                        <SelectItem value="pop">Pop</SelectItem>
                        <SelectItem value="jazz">Jazz</SelectItem>
                        <SelectItem value="folk">Folk</SelectItem>
                        <SelectItem value="devotional">Devotional</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="musicActivity">Music Activity</Label>
                    <Select value={formData.musicActivity} onValueChange={(v) => handleInputChange("musicActivity", v)}>
                      <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="listening">Listening</SelectItem>
                        <SelectItem value="singing">Singing</SelectItem>
                        <SelectItem value="playing">Playing Instrument</SelectItem>
                        <SelectItem value="composing">Composing</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Reading */}
                  <div className="space-y-2">
                    <Label htmlFor="readingType">Reading Preference</Label>
                    <Select value={formData.readingType} onValueChange={(v) => handleInputChange("readingType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="novels">Novels</SelectItem>
                        <SelectItem value="non-fiction">Non-fiction</SelectItem>
                        <SelectItem value="self-help">Self-help</SelectItem>
                        <SelectItem value="biographies">Biographies</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="readingLanguage">Reading Languages</Label>
                    <Input
                      value={formData.readingLanguage}
                      onChange={(e) => handleInputChange("readingLanguage", e.target.value)}
                      placeholder="e.g., English, Hindi"
                    />
                  </div>

                  {/* Movies */}
                  <div className="space-y-2">
                    <Label htmlFor="movieGenre">Movie/TV Genre</Label>
                    <Select value={formData.movieGenre} onValueChange={(v) => handleInputChange("movieGenre", v)}>
                      <SelectTrigger><SelectValue placeholder="Select genre" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="romance">Romance</SelectItem>
                        <SelectItem value="action">Action</SelectItem>
                        <SelectItem value="comedy">Comedy</SelectItem>
                        <SelectItem value="drama">Drama</SelectItem>
                        <SelectItem value="sci-fi">Sci-Fi</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="movieMedium">Preferred Medium</Label>
                    <Select value={formData.movieMedium} onValueChange={(v) => handleInputChange("movieMedium", v)}>
                      <SelectTrigger><SelectValue placeholder="Select medium" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cinema">Cinema</SelectItem>
                        <SelectItem value="ott">OTT Platforms</SelectItem>
                        <SelectItem value="tv">TV</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Sports & Fitness */}
                  <div className="space-y-2">
                    <Label htmlFor="sports">Favorite Sport</Label>
                    <Select value={formData.sports} onValueChange={(v) => handleInputChange("sports", v)}>
                      <SelectTrigger><SelectValue placeholder="Select sport" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cricket">Cricket</SelectItem>
                        <SelectItem value="football">Football</SelectItem>
                        <SelectItem value="badminton">Badminton</SelectItem>
                        <SelectItem value="tennis">Tennis</SelectItem>
                        <SelectItem value="swimming">Swimming</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="fitnessActivity">Fitness Activity</Label>
                    <Select value={formData.fitnessActivity} onValueChange={(v) => handleInputChange("fitnessActivity", v)}>
                      <SelectTrigger><SelectValue placeholder="Select activity" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="gym">Gym</SelectItem>
                        <SelectItem value="yoga">Yoga</SelectItem>
                        <SelectItem value="running">Running</SelectItem>
                        <SelectItem value="cycling">Cycling</SelectItem>
                        <SelectItem value="dance">Dance</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Food */}
                  <div className="space-y-2">
                    <Label htmlFor="cuisine">Favorite Cuisine</Label>
                    <Select value={formData.cuisine} onValueChange={(v) => handleInputChange("cuisine", v)}>
                      <SelectTrigger><SelectValue placeholder="Select cuisine" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="indian">Indian</SelectItem>
                        <SelectItem value="chinese">Chinese</SelectItem>
                        <SelectItem value="italian">Italian</SelectItem>
                        <SelectItem value="mexican">Mexican</SelectItem>
                        <SelectItem value="continental">Continental</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="dietType">Diet Preference</Label>
                    <Select value={formData.dietType} onValueChange={(v) => handleInputChange("dietType", v)}>
                      <SelectTrigger><SelectValue placeholder="Select diet" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                        <SelectItem value="eggetarian">Eggetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="spokenLanguages">
                    <Languages className="h-4 w-4 inline mr-2" />
                    Spoken Languages
                  </Label>
                  <Input
                    value={formData.spokenLanguages}
                    onChange={(e) => handleInputChange("spokenLanguages", e.target.value)}
                    placeholder="List languages you speak (e.g., English, Hindi, Telugu)"
                  />
                  {errors.spokenLanguages && (
                    <p className="text-red-500 text-xs mt-1">{errors.spokenLanguages}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cook">Do you cook?</Label>
                  <Select value={formData.cook} onValueChange={(v) => handleInputChange("cook", v)}>
                    <SelectTrigger><SelectValue placeholder="Select option" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="yes">Yes, I love cooking</SelectItem>
                      <SelectItem value="sometimes">Sometimes</SelectItem>
                      <SelectItem value="no">No, but willing to learn</SelectItem>
                      <SelectItem value="never">No, not interested</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </motion.div>
            )}

            {/* Step 7 - Horoscopic Details */}
            {step === 7 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Star className="h-12 w-12 text-primary mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Horoscopic Details</h3>
                  <p className="text-sm text-muted-foreground">Optional - For better astrological matching</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="timeOfBirth">Time of Birth</Label>
                    <Input
                      type="time"
                      value={formData.timeOfBirth}
                      onChange={(e) => handleInputChange("timeOfBirth", e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="placeOfBirth">Place of Birth</Label>
                    <Input
                      value={formData.placeOfBirth}
                      onChange={(e) => handleInputChange("placeOfBirth", e.target.value)}
                      placeholder="City of birth"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="nakshatra">Nakshatra (Star)</Label>
                    <Select value={formData.nakshatra} onValueChange={(v) => handleInputChange("nakshatra", v)}>
                      <SelectTrigger><SelectValue placeholder="Select nakshatra" /></SelectTrigger>
                      <SelectContent>
                        {nakshatras.map(nakshatra => (
                          <SelectItem key={nakshatra} value={nakshatra}>{nakshatra}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="rashi">Rashi (Zodiac)</Label>
                    <Select value={formData.rashi} onValueChange={(v) => handleInputChange("rashi", v)}>
                      <SelectTrigger><SelectValue placeholder="Select rashi" /></SelectTrigger>
                      <SelectContent>
                        {rashis.map(rashi => (
                          <SelectItem key={rashi} value={rashi}>{rashi}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <p className="text-sm text-blue-700">
                    💫 This information helps in finding astrologically compatible matches.
                    You can skip this section if you prefer not to share these details.
                  </p>
                </div>
              </motion.div>
            )}

            {/* Step 8 - Lifestyle & Education Details */}
            {step === 8 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Utensils className="h-12 w-12 text-primary mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Lifestyle & Education</h3>
                  <p className="text-sm text-muted-foreground">Share your lifestyle preferences and educational background</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="eatingHabits">Eating Habits</Label>
                    <Select value={formData.eatingHabits} onValueChange={(v) => handleInputChange("eatingHabits", v)}>
                      <SelectTrigger><SelectValue placeholder="Select habits" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="vegetarian">Vegetarian</SelectItem>
                        <SelectItem value="non-vegetarian">Non-Vegetarian</SelectItem>
                        <SelectItem value="eggetarian">Eggetarian</SelectItem>
                        <SelectItem value="vegan">Vegan</SelectItem>
                        <SelectItem value="jain">Jain</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="smoking">Smoking</Label>
                    <Select value={formData.smoking} onValueChange={(v) => handleInputChange("smoking", v)}>
                      <SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="occasionally">Occasionally</SelectItem>
                        <SelectItem value="regularly">Regularly</SelectItem>
                        <SelectItem value="quit">Quit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="drinking">Drinking</Label>
                    <Select value={formData.drinking} onValueChange={(v) => handleInputChange("drinking", v)}>
                      <SelectTrigger><SelectValue placeholder="Select preference" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="never">Never</SelectItem>
                        <SelectItem value="occasionally">Occasionally</SelectItem>
                        <SelectItem value="regularly">Regularly</SelectItem>
                        <SelectItem value="quit">Quit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="college">College/University</Label>
                    <Input
                      value={formData.college}
                      onChange={(e) => handleInputChange("college", e.target.value)}
                      placeholder="Your college name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="course">Course/Degree</Label>
                    <Input
                      value={formData.course}
                      onChange={(e) => handleInputChange("course", e.target.value)}
                      placeholder="Your course or degree"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="passingYear">Passing Year</Label>
                    <Input
                      type="number"
                      value={formData.passingYear}
                      onChange={(e) => handleInputChange("passingYear", e.target.value)}
                      placeholder="YYYY"
                      min="1950"
                      max={new Date().getFullYear()}
                    />
                    {errors.passingYear && (
                      <p className="text-red-500 text-xs mt-1">{errors.passingYear}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 9 - Security Settings */}
            {step === 9 && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                <div className="text-center">
                  <Eye className="h-12 w-12 text-primary mx-auto mb-2" />
                  <h3 className="text-lg font-semibold">Security Settings</h3>
                  <p className="text-sm text-muted-foreground">Optional - Update your password for better security</p>
                </div>

                <div className="bg-yellow-50 p-4 rounded-lg">
                  <p className="text-sm text-yellow-700">
                    🔒 You can skip this step if you're happy with your current password.
                    Changing password is optional during registration.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password (Optional)</Label>
                    <div className="relative">
                      <Input
                        type={showPassword ? "text" : "password"}
                        value={formData.newPassword}
                        onChange={(e) => handleInputChange("newPassword", e.target.value)}
                        placeholder="Enter new password (optional)"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.newPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.newPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirmNewPassword">Confirm New Password</Label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? "text" : "password"}
                        value={formData.confirmNewPassword}
                        onChange={(e) => handleInputChange("confirmNewPassword", e.target.value)}
                        placeholder="Confirm new password"
                        disabled={!formData.newPassword}
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </Button>
                    </div>
                    {errors.confirmNewPassword && (
                      <p className="text-red-500 text-xs mt-1">{errors.confirmNewPassword}</p>
                    )}
                  </div>
                </div>
              </motion.div>
            )}

            {/* Step 10 - Review & Submit */}
          {step === 10 && (
  <motion.div
    initial={{ opacity: 0, x: 20 }}
    animate={{ opacity: 1, x: 0 }}
    className="space-y-6"
  >
    <div className="text-center">
      <Heart className="h-12 w-12 text-primary mx-auto mb-2" />
      <h3 className="text-lg font-semibold">Review Your Profile</h3>
      <p className="text-sm text-muted-foreground">Almost there! Review your information before submitting</p>
    </div>

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Personal Information - Step 1 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Personal Information</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Account For:</strong> {formData.accountFor || "Not provided"}</p>
          <p><strong>Name:</strong> {formData.name || "Not provided"}</p>
          <p><strong>Gender:</strong> {formData.gender || "Not provided"}</p>
          <p><strong>Looking for:</strong> {formData.lookingFor || "Not provided"}</p>
          <p><strong>Mother Tongue:</strong> {formData.motherTongue || "Not provided"}</p>
        </div>
      </div>

      {/* Contact Details - Step 5 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Contact Details</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Email:</strong> {formData.email || "Not provided"}</p>
          <p><strong>Phone:</strong> {formData.phone || "Not provided"}</p>
          <p><strong>Location:</strong> {[formData.city, formData.state, formData.country].filter(Boolean).join(", ") || "Not provided"}</p>
        </div>
      </div>

      {/* Personal Details - Step 2 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Personal Details</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Date of Birth:</strong> {formData.birthDay && formData.birthMonth && formData.birthYear
            ? `${formData.birthDay}/${formData.birthMonth}/${formData.birthYear}`
            : "Not provided"}</p>
          <p><strong>Height:</strong> {formData.height || "Not provided"}</p>
          <p><strong>Physical Status:</strong> {formData.physicalStatus || "Not provided"}</p>
          <p><strong>Marital Status:</strong> {formData.maritalStatus || "Not provided"}</p>
          {formData.maritalStatus !== "never-married" && (
            <>
              <p><strong>Children:</strong> {formData.numChildren || "0"}</p>
              {formData.numChildren !== "0" && (
                <p><strong>Children Living Together:</strong> {formData.childrenLivingTogether || "Not specified"}</p>
              )}
            </>
          )}
        </div>
      </div>

      {/* Background & Career - Step 3 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Background & Career</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Religion:</strong> {formData.religion || "Not provided"}</p>
          <p><strong>Community:</strong> {formData.community || "Not provided"}</p>
          <p><strong>Subcaste:</strong> {formData.subcaste || "Not specified"}</p>
          <p><strong>Willing Any Caste:</strong> {formData.willingAnyCaste ? "Yes" : "No"}</p>
          <p><strong>Education:</strong> {formData.education || "Not provided"}</p>
          <p><strong>Field of Study:</strong> {formData.fieldOfStudy || formData.otherEducation || "Not provided"}</p>
          <p><strong>Occupation:</strong> {formData.occupation || "Not provided"}</p>
          <p><strong>Income:</strong> {formData.income || "Not provided"}</p>
        </div>
      </div>

      {/* Location & Family - Step 4 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Location & Family</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Country:</strong> {formData.country || "Not provided"}</p>
          <p><strong>State:</strong> {formData.state || "Not provided"}</p>
          <p><strong>City:</strong> {formData.city || "Not provided"}</p>
          <p><strong>Family Status:</strong> {formData.familyStatus || "Not provided"}</p>
          <p><strong>Family Wealth:</strong> {formData.familyWealth || "Not provided"}</p>
          <p><strong>Father's Occupation:</strong> {formData.father || "Not specified"}</p>
          <p><strong>Mother's Occupation:</strong> {formData.mother || "Not specified"}</p>
          <p><strong>About Yourself:</strong> {formData.about ? (formData.about.length > 100 ? formData.about.substring(0, 100) + "..." : formData.about) : "Not provided"}</p>
        </div>
      </div>

      {/* Hobbies & Interests - Step 6 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Hobbies & Interests</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Music Genre:</strong> {formData.musicGenre || "Not specified"}</p>
          <p><strong>Music Activity:</strong> {formData.musicActivity || "Not specified"}</p>
          <p><strong>Reading Type:</strong> {formData.readingType || "Not specified"}</p>
          <p><strong>Reading Language:</strong> {formData.readingLanguage || "Not specified"}</p>
          <p><strong>Movie Genre:</strong> {formData.movieGenre || "Not specified"}</p>
          <p><strong>Movie Medium:</strong> {formData.movieMedium || "Not specified"}</p>
          <p><strong>Sports:</strong> {formData.sports || "Not specified"}</p>
          <p><strong>Fitness Activity:</strong> {formData.fitnessActivity || "Not specified"}</p>
          <p><strong>Favorite Cuisine:</strong> {formData.cuisine || "Not specified"}</p>
          <p><strong>Cooking:</strong> {formData.cook || "Not specified"}</p>
          <p><strong>Diet Type:</strong> {formData.dietType || "Not specified"}</p>
          <p><strong>Spoken Languages:</strong> {formData.spokenLanguages || "Not specified"}</p>
        </div>
      </div>

      {/* Horoscopic Details - Step 7 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Horoscopic Details</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Time of Birth:</strong> {formData.timeOfBirth || "Not specified"}</p>
          <p><strong>Place of Birth:</strong> {formData.placeOfBirth || "Not specified"}</p>
          <p><strong>Nakshatra:</strong> {formData.nakshatra || "Not specified"}</p>
          <p><strong>Rashi:</strong> {formData.rashi || "Not specified"}</p>
        </div>
      </div>

      {/* Lifestyle & Education - Step 8 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Lifestyle & Education</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Eating Habits:</strong> {formData.eatingHabits || "Not specified"}</p>
          <p><strong>Smoking:</strong> {formData.smoking || "Not specified"}</p>
          <p><strong>Drinking:</strong> {formData.drinking || "Not specified"}</p>
          <p><strong>College/University:</strong> {formData.college || "Not specified"}</p>
          <p><strong>Course/Degree:</strong> {formData.course || "Not specified"}</p>
          <p><strong>Passing Year:</strong> {formData.passingYear || "Not specified"}</p>
        </div>
      </div>

      {/* Security - Step 9 */}
      <div className="space-y-4">
        <h4 className="font-semibold text-primary">Security</h4>
        <div className="space-y-2 text-sm">
          <p><strong>Password Set:</strong> {formData.password ? "✓" : "Not set"}</p>
          {formData.newPassword && (
            <>
              <p><strong>New Password Set:</strong> ✓</p>
              <p><strong>Password Updated:</strong> ✓</p>
            </>
          )}
        </div>
      </div>
    </div>

    {/* Summary Stats */}
    <div className="bg-blue-50 p-4 rounded-lg">
      <h4 className="font-semibold text-primary mb-2">Profile Summary</h4>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <div className="text-center">
          <div className="font-bold text-lg text-primary">{Object.keys(formData).filter(key => formData[key] && !['agreeToTerms', 'rememberMe', 'willingAnyCaste'].includes(key)).length}</div>
          <div className="text-muted-foreground">Fields Completed</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg text-green-600">
            {[
              formData.name, formData.email, formData.phone, formData.gender, 
              formData.lookingFor, formData.birthDay, formData.religion,
              formData.education, formData.occupation, formData.income
            ].filter(Boolean).length}/10
          </div>
          <div className="text-muted-foreground">Essential Fields</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg text-orange-600">
            {[
              formData.musicGenre, formData.sports, formData.readingType,
              formData.cuisine, formData.spokenLanguages
            ].filter(Boolean).length}/5
          </div>
          <div className="text-muted-foreground">Interests Added</div>
        </div>
        <div className="text-center">
          <div className="font-bold text-lg text-purple-600">
            {formData.agreeToTerms ? "✓" : "✗"}
          </div>
          <div className="text-muted-foreground">Terms Accepted</div>
        </div>
      </div>
    </div>

    <div className="bg-green-50 p-4 rounded-lg">
      <p className="text-sm text-green-700 text-center">
        ✅ Your profile looks great! Click submit to create your account and start your journey to find your perfect match.
      </p>
    </div>

    <div className="flex items-center space-x-2">
      <Checkbox
        id="finalAgreement"
        checked={formData.agreeToTerms}
        onCheckedChange={(checked) => handleInputChange("agreeToTerms", checked)}
      />
      <Label htmlFor="finalAgreement" className="text-sm">
        I confirm that all the information provided is accurate and I agree to the{" "}
        <span className="text-primary hover:underline cursor-pointer">Terms & Conditions</span>
      </Label>
    </div>
    {errors.agreeToTerms && (
      <p className="text-red-500 text-xs">{errors.agreeToTerms}</p>
    )}
  </motion.div>
)}
          </CardContent>

          {/* Navigation Buttons */}
    <div className="px-6 pb-6">
  <Separator className="mb-4" />
  <div className="flex justify-between items-center">
    <div>
      {step > 1 && (
        <Button
          key="back-btn"
          variant="outline"
          onClick={prevStep}
          disabled={isLoading}
          className="hover-scale tap-scale"
        >
          ⬅ Back
        </Button>
      )}
    </div>
    <div className="flex items-center gap-2">
      {step > 5 && step < totalSteps && (
        <Button
          key="skip-btn"
          variant="outline"
          onClick={handleSkip}
          disabled={isLoading}
          className="hover-scale tap-scale"
        >
          Skip
        </Button>
      )}
      {step < totalSteps ? (
        <Button
          key="continue-btn"
          onClick={nextStep}
          disabled={isLoading}
          className="bg-primary hover:bg-primary/90 text-primary-foreground hover-scale tap-scale"
        >
          Continue ➡
        </Button>
      ) : (
        <Button
          key="submit-btn"
          data-submit-btn
          onClick={handleSignup}
          disabled={isLoading || !formData.agreeToTerms}
          className="bg-green-600 hover:bg-green-700 text-primary hover-scale tap-scale px-8"
          size="lg"
        >
          {isLoading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2"></div>
              Creating Profile...
            </>
          ) : (
            "Submit & Create Account 🎉"
          )}
        </Button>
      )}
    </div>
  </div>
  <Separator className="my-4" />
  <div className="text-center">
    <span className="text-sm text-muted-foreground">
      Already have an account?{" "}
    </span>
    <Button
      key="signin-btn"
      variant="link"
      onClick={onNavigateToLogin}
      className="text-primary text-sm hover:underline p-0"
    >
      Sign In
    </Button>
  </div>
</div>
        </Card>
      </motion.div>
    </div>
  );
}