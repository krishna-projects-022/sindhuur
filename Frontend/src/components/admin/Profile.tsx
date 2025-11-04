import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/hooks/use-toast";
import axios from "axios";
import {
  Bell,
  Calendar,
  Camera,
  Edit3,
  Eye,
  EyeOff,
  Lock,
  Mail,
  MapPin,
  Phone,
  Save,
  Settings,
  Shield,
  User,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const stateCities = {
  andhra_pradesh: [
    "Visakhapatnam", "Vijayawada", "Guntur", "Nellore", "Kurnool",
    "Rajahmundry", "Tirupati", "Kadapa", "Anantapur", "Chittoor", "Ongole"
  ],
  arunachal_pradesh: [
    "Itanagar", "Naharlagun", "Pasighat", "Tawang", "Ziro"
  ],
  assam: [
    "Guwahati", "Silchar", "Dibrugarh", "Jorhat", "Tezpur"
  ],
  bihar: [
    "Patna", "Gaya", "Muzaffarpur", "Bhagalpur", "Darbhanga", "Purnia"
  ],
  chhattisgarh: [
    "Raipur", "Bhilai", "Bilaspur", "Korba", "Durg"
  ],
  goa: [
    "Panaji", "Margao", "Vasco da Gama", "Mapusa"
  ],
  gujarat: [
    "Ahmedabad", "Surat", "Vadodara", "Rajkot", "Bhavnagar",
    "Jamnagar", "Junagadh", "Gandhinagar"
  ],
  haryana: [
    "Gurugram", "Faridabad", "Panipat", "Ambala", "Karnal", "Hisar",
    "Rohtak", "Sonipat"
  ],
  himachal_pradesh: [
    "Shimla", "Manali", "Dharamshala", "Mandi", "Kullu", "Solan"
  ],
  jharkhand: [
    "Ranchi", "Jamshedpur", "Dhanbad", "Bokaro", "Hazaribagh"
  ],
  karnataka: [
    "Bengaluru", "Mysuru", "Mangaluru", "Hubli", "Belagavi", "Davangere",
    "Tumakuru", "Shivamogga", "Ballari", "Udupi", "Hassan", "Raichur",
    "Bidar", "Chitradurga", "Gadag"
  ],
  kerala: [
    "Thiruvananthapuram", "Kochi", "Kozhikode", "Thrissur", "Alappuzha",
    "Palakkad", "Kannur", "Malappuram", "Kollam", "Kottayam"
  ],
  madhya_pradesh: [
    "Bhopal", "Indore", "Gwalior", "Jabalpur", "Ujjain", "Sagar", "Satna"
  ],
  maharashtra: [
    "Mumbai", "Pune", "Nagpur", "Nashik", "Aurangabad", "Solapur",
    "Amravati", "Kolhapur", "Sangli", "Latur", "Jalgaon", "Akola",
    "Ahmednagar", "Satara", "Chandrapur"
  ],
  manipur: [
    "Imphal", "Thoubal", "Churachandpur", "Ukhrul"
  ],
  meghalaya: [
    "Shillong", "Tura", "Jowai"
  ],
  mizoram: [
    "Aizawl", "Lunglei", "Champhai"
  ],
  nagaland: [
    "Kohima", "Dimapur", "Mokokchung"
  ],
  odisha: [
    "Bhubaneswar", "Cuttack", "Rourkela", "Sambalpur", "Berhampur"
  ],
  punjab: [
    "Amritsar", "Ludhiana", "Jalandhar", "Patiala", "Bathinda", "Mohali"
  ],
  rajasthan: [
    "Jaipur", "Jodhpur", "Udaipur", "Kota", "Ajmer", "Bikaner", "Alwar"
  ],
  sikkim: [
    "Gangtok", "Namchi", "Mangan", "Geyzing"
  ],
  tamil_nadu: [
    "Chennai", "Coimbatore", "Madurai", "Trichy", "Salem", "Erode",
    "Vellore", "Tirunelveli", "Thoothukudi", "Kanchipuram", "Thanjavur",
    "Dindigul", "Karur", "Cuddalore", "Nagapattinam"
  ],
  telangana: [
    "Hyderabad", "Warangal", "Nizamabad", "Karimnagar", "Khammam",
    "Mahbubnagar", "Adilabad", "Ramagundam", "Siddipet", "Mancherial"
  ],
  tripura: [
    "Agartala", "Udaipur", "Dharmanagar"
  ],
  uttar_pradesh: [
    "Lucknow", "Kanpur", "Varanasi", "Agra", "Prayagraj", "Meerut",
    "Ghaziabad", "Noida", "Bareilly", "Moradabad", "Aligarh", "Jhansi"
  ],
  uttarakhand: [
    "Dehradun", "Haridwar", "Rishikesh", "Haldwani", "Roorkee", "Nainital"
  ],
  west_bengal: [
    "Kolkata", "Siliguri", "Asansol", "Durgapur", "Howrah", "Darjeeling"
  ],
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

const Profile = () => {
  const [user, setUser] = useState({});
  const { toast } = useToast();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const [userId, setUserId] = useState(null);

  const [formData, setFormData] = useState({
    userId: "",
    name: "",
    email: "",
    phone: "",
    state: "",
    city: "",
    department: "",
    bio: "",
    language: "English",
    timezone: "Asia/Kolkata",
    avatar: "",
  });

  const [avatarUrl, setAvatarUrl] = useState("/placeholder.svg");
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isLoading, setIsLoading] = useState(false);

  // Email validation regex
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // Get all time zones
  const timeZones = Intl.supportedValuesOf('timeZone');

  // Fetch profile data on mount
  useEffect(() => {
    const adminData = localStorage.getItem("loggedInUser");
    if (adminData) {
      const parsedUser = JSON.parse(adminData);
      setUserId(parsedUser.id);
      setUser(parsedUser);

      fetch(`${BASE_URL}/api/admin/profile?userId=${parsedUser.id}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.user) {
            setFormData({
              ...data.user,
              state: data.user.state || "",
              city: data.user.city || "",
              timezone: data.user.timezone || "Asia/Kolkata",
            });
            setUser(data.user);

            const avatarPath =
              data.user.avatar && data.user.avatar !== "/placeholder.svg"
                ? `${BASE_URL}${data.user.avatar}`
                : "/placeholder.svg";
            setAvatarUrl(avatarPath);
          } else {
            throw new Error("User data not found");
          }
        })
        .catch((err) => {
          console.error("Error fetching profile:", err);
          toast({
            title: "Error",
            description: "Failed to fetch profile data.",
            variant: "destructive",
          });
        });
    }
  }, []);

  // Cleanup avatar object URL
  useEffect(() => {
    return () => {
      if (avatarUrl && avatarFile) {
        URL.revokeObjectURL(avatarUrl);
      }
    };
  }, [avatarUrl, avatarFile]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
      ...(field === "state" && { city: "" }), // Reset city when state changes
    }));
  };

  const handlePasswordInputChange = (field, value) => {
    setPasswordForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    // Phone number validation
    if (!formData.phone || formData.phone.length !== 10) {
      toast({
        title: "Error",
        description: "Phone number must be exactly 10 digits.",
        variant: "destructive",
      });
      return;
    }

    // Email validation
    if (!formData.email || !emailRegex.test(formData.email)) {
      toast({
        title: "Error",
        description: "Please enter a valid email address.",
        variant: "destructive",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No authentication token found");

      const formDataToSend = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        formDataToSend.append(key, value);
      });

      if (avatarFile) {
        formDataToSend.append("avatar", avatarFile);
      }

      const { data } = await axios.put(
        `${BASE_URL}/api/admin/profile/${userId}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (data.user) {
        setFormData(data.user);
        setUser(data.user);
        const avatarPath =
          data.user.avatar && data.user.avatar !== "/placeholder.svg"
            ? `${BASE_URL}${data.user.avatar}`
            : "/placeholder.svg";
        setAvatarUrl(avatarPath);
        setIsEditing(false);
        setAvatarFile(null);

        if (avatarUrl && avatarFile) {
          URL.revokeObjectURL(avatarUrl);
        }

        localStorage.setItem("loggedInUser", JSON.stringify(data.user));

        toast({
          title: "Profile Updated",
          description: "Your profile has been successfully updated.",
        });
      } else {
        throw new Error("Failed to update profile");
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error.response?.data?.message ||
          error.message ||
          "Failed to update profile.",
        variant: "destructive",
      });
    }
  };

  const handlePasswordChange = async () => {
    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      toast({
        title: "Error",
        description: "Please fill all the fields.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const email = formData.email;
      const response = await fetch(`${BASE_URL}/api/admin/change-password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          email,
          currentPassword: passwordForm.currentPassword,
          newPassword: passwordForm.newPassword,
          confirmPassword: passwordForm.confirmPassword,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to change password");
      }

      toast({
        title: "Success",
        description: "Password updated successfully.",
      });
      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      setIsChangePasswordOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCameraClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast({
        title: "Invalid file",
        description: "Please select an image file.",
        variant: "destructive",
      });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please choose an image smaller than 5MB.",
        variant: "destructive",
      });
      return;
    }

    if (avatarUrl && avatarFile) {
      URL.revokeObjectURL(avatarUrl);
    }

    const objectUrl = URL.createObjectURL(file);
    setAvatarUrl(objectUrl);
    setAvatarFile(file);

    toast({
      title: "Image selected",
      description: "Preview is shown. Click Save Changes to upload.",
    });
  };

  const formatJoinDate = (createdAt) => {
    if (!createdAt) return "Unknown";
    const date = new Date(createdAt);
    return date.toISOString().split("T")[0];
  };

  return (
    <div className="space-y-6 px-4 sm:px-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <User className="h-8 w-8 text-primary" />
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">
            My Profile
          </h1>
        </div>
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          {!isEditing ? (
            <Button
              onClick={() => setIsEditing(true)}
              className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
            >
              <Edit3 className="mr-2 h-4 w-4" /> Edit Profile
            </Button>
          ) : (
            <>
              <Button onClick={handleSave} className="w-full sm:w-auto bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700">
                <Save className="mr-2 h-4 w-4" /> Save Changes
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setIsEditing(false);
                  setAvatarFile(null);
                  if (avatarUrl && avatarFile) {
                    URL.revokeObjectURL(avatarUrl);
                  }
                  setFormData(user);
                  const avatarPath =
                    user.avatar && user.avatar !== "/placeholder.svg"
                      ? `${BASE_URL}${user.avatar}`
                      : "/placeholder.svg";
                  setAvatarUrl(avatarPath);
                }}
                className="w-full sm:w-auto"
              >
                Cancel
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <Card className="admin-card">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Shield className="h-5 w-5" />
            <span>Quick Actions</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Dialog
            open={isChangePasswordOpen}
            onOpenChange={setIsChangePasswordOpen}
          >
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full sm:w-auto">
                <Lock className="mr-2 h-4 w-4" /> Change Password
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Change Password</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="currentPassword">Current Password</Label>
                  <div className="relative">
                    <Input
                      id="currentPassword"
                      type={showPassword ? "text" : "password"}
                      value={passwordForm.currentPassword}
                      onChange={(e) =>
                        handlePasswordInputChange(
                          "currentPassword",
                          e.target.value
                        )
                      }
                      className="mt-1 pr-10"
                      disabled={isLoading}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute right-2 top-1/2 -translate-y-1/2"
                      onClick={() => setShowPassword(!showPassword)}
                      disabled={isLoading}
                    >
                      {showPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </Button>
                  </div>
                </div>
                <div>
                  <Label htmlFor="newPassword">New Password</Label>
                  <Input
                    id="newPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      handlePasswordInputChange("newPassword", e.target.value)
                    }
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                <div>
                  <Label htmlFor="confirmPassword">Confirm New Password</Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      handlePasswordInputChange(
                        "confirmPassword",
                        e.target.value
                      )
                    }
                    className="mt-1"
                    disabled={isLoading}
                  />
                </div>
                <Button
                  onClick={handlePasswordChange}
                  className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700"
                  disabled={isLoading}
                >
                  {isLoading ? "Updating..." : "Update Password"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <User className="h-5 w-5" />
              <span>Basic Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={avatarUrl} alt="Profile" />
                  <AvatarFallback>
                    {formData.name?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                {isEditing && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="absolute bottom-0 right-0 rounded-full"
                    onClick={handleCameraClick}
                  >
                    <Camera className="h-4 w-4" />
                  </Button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRef}
                  onChange={handleImageChange}
                  className="hidden"
                />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{formData.name}</h3>
                <p className="text-sm text-muted-foreground">
                  {user?.role || "Admin"}
                </p>
              </div>
            </div>
            <Separator />
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span>{formData.email || "Not provided"}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-muted-foreground" />
                <span>{formData.phone || "Not provided"}</span>
              </div>
              {/* <div className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{formData.city && formData.state ? `${formData.city}, ${formData.state.replace('_', ' ')}` : "Not provided"}</span>
              </div> */}
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>Join Date: {formatJoinDate(user?.createdAt)}</span>
              </div>
            </div>
            <Badge variant="secondary">
              {formData.department || "Not provided"}
            </Badge>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Settings className="h-5 w-5" />
              <span>Profile Information</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                  className="mt-1"
                />
                {formData.email && !emailRegex.test(formData.email) && (
                  <p className="text-red-500 text-sm mt-1">Please enter a valid email address</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => {
                    let onlyNums = e.target.value.replace(/[^0-9]/g, "");
                    if (onlyNums.length > 10) {
                      onlyNums = onlyNums.slice(0, 10);
                    }
                    handleInputChange("phone", onlyNums);
                  }}
                  disabled={!isEditing}
                  className="mt-1"
                />
                {formData.phone && formData.phone.length !== 10 && (
                  <p className="text-red-500 text-sm mt-1">Phone number must be exactly 10 digits</p>
                )}
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Select
                  value={formData.state || ""}
                  onValueChange={(value) => handleInputChange("state", value)}
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select State" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.keys(stateCities).map((state) => (
                      <SelectItem key={state} value={state}>
                        {state.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="city">City</Label>
                <Select
                  value={formData.city || ""}
                  onValueChange={(value) => handleInputChange("city", value)}
                  disabled={!isEditing || !formData.state}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Select City" />
                  </SelectTrigger>
                  <SelectContent>
                    {formData.state && stateCities[formData.state]?.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="department">Department</Label>
                <Input
                  id="department"
                  value={formData.department || ""}
                  onChange={(e) =>
                    handleInputChange("department", e.target.value)
                  }
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="language">Language</Label>
                <Select
                  value={formData.language || "English"}
                  onValueChange={(value) =>
                    handleInputChange("language", value)
                  }
                  disabled={!isEditing}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="English">English</SelectItem>
                    <SelectItem value="Hindi">Hindi</SelectItem>
                    <SelectItem value="Marathi">Marathi</SelectItem>
                    <SelectItem value="Tamil">Tamil</SelectItem>
                    <SelectItem value="Telugu">Telugu</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="timezone">Timezone</Label>
              <Select
                value={formData.timezone || "Asia/Kolkata"}
                onValueChange={(value) => handleInputChange("timezone", value)}
                disabled={!isEditing}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select Timezone" />
                </SelectTrigger>
                <SelectContent>
                  {timeZones.map((tz) => (
                    <SelectItem key={tz} value={tz}>
                      {tz}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={formData.bio || ""}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditing}
                rows={4}
                className="mt-1 resize-none"
                placeholder="Tell us about yourself..."
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;