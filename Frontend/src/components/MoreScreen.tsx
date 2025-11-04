import { motion } from "motion/react";
import { ArrowLeft, Settings, HelpCircle, Shield, Star, Crown, LogOut, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface MoreScreenProps {
  user: any;
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export default function MoreScreen({ user, onNavigate, onBack }: MoreScreenProps) {
  const menuItems = [
    {
      id: "help-center",
      title: "Help Center",
      description: "Get help and support",
      icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
      action: () => onNavigate("help-center"),
    },
    {
      id: "settings",
      title: "App Settings",
      description: "Customize your experience",
      icon: <Settings className="w-5 h-5 text-gray-500" />,
      action: () => onNavigate("settings"),
    },
    {
      id: "premium",
      title: "Upgrade to Premium",
      description: "Unlock all features",
      icon: <Crown className="w-5 h-5 text-primary" />,
      action: () => onNavigate("premium"),
    },
    {
      id: "privacy",
      title: "Privacy & Safety",
      description: "Control your privacy settings",
      icon: <Shield className="w-5 h-5 text-green-500" />,
      action: () => onNavigate("settings"),
    },
    {
      id: "rate",
      title: "Rate Our App",
      description: "Share your feedback",
      icon: <Star className="w-5 h-5 text-yellow-500" />,
      action: () => {},
    },
  ];

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
            <h1 className="text-xl text-foreground">More</h1>
          </div>
        </div>
      </motion.div>

      <div className="p-4 pb-6 space-y-3">
        {menuItems.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
          >
            <Card 
              className="cursor-pointer hover-scale tap-scale"
              onClick={item.action}
            >
              <CardContent className="p-4 flex items-center space-x-4">
                <div className="p-3 bg-gray-100 rounded-lg">
                  {item.icon}
                </div>
                <div className="flex-1">
                  <h4 className="text-base">{item.title}</h4>
                  <p className="text-sm text-muted-foreground">{item.description}</p>
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground" />
              </CardContent>
            </Card>
          </motion.div>
        ))}

        {/* Sign Out */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.6 }}
          className="pt-4"
        >
          <Card 
            className="cursor-pointer hover-scale tap-scale border-red-200"
            onClick={() => onNavigate("login")}
          >
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-base text-red-600">Sign Out</h4>
                <p className="text-sm text-red-500">Sign out of your account</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}