import { motion } from "motion/react";
import { Camera, Crown } from "lucide-react";
import { Button } from "../ui/button";
import { Avatar, AvatarImage, AvatarFallback } from "../ui/avatar";
import { Badge } from "../ui/badge";
import { Progress } from "../ui/progress";

interface ProfileHeaderProps {
  user: any;
  profileCompleteness: number;
  onEditPhoto: () => void;
}

export default function ProfileHeader({ user, profileCompleteness, onEditPhoto }: ProfileHeaderProps) {
  console.log('ProfileHeader - User prop:', user); // Debug log
  console.log('ProfileHeader - Profile image URL:', user?.profileImage); // Debug log

  // Get subscription directly from localStorage
  const getSubscriptionStatus = () => {
    try {
      const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser") || "{}");
      const subscriptionType = loggedInUser?.subscription?.current;
      
      console.log('Subscription from localStorage:', subscriptionType); // Debug log
      
      if (subscriptionType) {
        // Format the subscription text (e.g., "premium plus" becomes "Premium Plus")
        const formattedLabel = subscriptionType
          .split(' ')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
        
        return {
          type: subscriptionType,
          label: formattedLabel,
          color: "bg-purple-100 text-purple-800 border-purple-200" // You can customize colors based on subscription type if needed
        };
      }
      
      // Default if no subscription found
      return {
        type: "free",
        label: "Free",
        color: "bg-gray-100 text-gray-800 border-gray-200"
      };
    } catch (error) {
      console.error("Error getting subscription status:", error);
      return {
        type: "free",
        label: "Free",
        color: "bg-gray-100 text-gray-800 border-gray-200"
      };
    }
  };

  const subscription = getSubscriptionStatus();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="p-6 text-center bg-gradient-to-br from-primary/5 to-purple-50"
    >
      <div className="relative inline-block mb-4">
        <Avatar className="w-24 h-24 border-4 border-white shadow-lg">
          <AvatarImage
            src={user?.profileImage || "https://via.placeholder.com/150"}
            onError={(e) => {
              console.error('Image load error:', user?.profileImage); // Debug log
              e.currentTarget.src = "https://via.placeholder.com/150"; // Fallback
            }}
          />
          <AvatarFallback className="text-xl">
            {user?.name?.[0] || "J"}
          </AvatarFallback>
        </Avatar>
        <Button
          size="sm"
          onClick={onEditPhoto}
          className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-primary hover:bg-primary/90 shadow-lg hover-scale"
        >
          <Camera className="w-4 h-4 text-white" />
        </Button>
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-center space-x-2">
          <h2 className="text-xl text-foreground">{user?.name || "John Doe"}</h2>
          <Badge className={subscription.color}>
            <Crown className="w-3 h-3 mr-1" />
            {subscription.label}
          </Badge>
        </div>
        <p className="text-muted-foreground">{user?.profession || "Software Engineer"}</p>
        <p className="text-sm text-muted-foreground">{user?.location || "New York, USA"}</p>
      </div>

      <div className="mt-4 p-3 bg-white/50 rounded-lg backdrop-blur-sm">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">Profile Completeness</span>
          <span className="text-sm text-primary">{profileCompleteness}%</span>
        </div>
        <Progress value={profileCompleteness} className="h-2" />
      </div>
    </motion.div>
  );
}