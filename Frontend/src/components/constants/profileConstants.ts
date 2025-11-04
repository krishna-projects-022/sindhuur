import { Edit3, Camera, Settings, Star, Heart, Sparkles, Eye } from "lucide-react";

export const PROFILE_MENU_ITEMS = [
  {
    id: "edit-profile",
    title: "Edit Profile",
    description: "Update your basic information",
    icon: Edit3,
    iconColor: "text-blue-500",
    screen: "edit-profile",
  },
  {
    id: "photo-management",
    title: "Manage Photos",
    description: "Upload and organize your photos",
    icon: Camera,
    iconColor: "text-green-500",
    screen: "photo-management",
  },
  {
    id: "ai-horoscope",
    title: "AI Horoscope",
    description: "Get AI-powered compatibility insights",
    icon: Sparkles,
    iconColor: "text-purple-500",
    
    screen: "ai-horoscope",
  },
  
];

// export const PROFILE_STATS = [
//   { label: "Profile Views", value: "1,234", icon: Eye, iconColor: "text-blue-500" },
//   { label: "Likes Received", value: "89", icon: Heart, iconColor: "text-primary" },
//   { label: "Matches", value: "42", icon: Star, iconColor: "text-yellow-500" },
// ];