import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { 
  HeartIcon, 
  MatchesIcon, 
  NoticeIcon, 
  ChatIcon, 
  PremiumIcon 
} from "./NavigationIcons";

interface BottomNavigationProps {
  currentScreen: string;
  onNavigate: (screen: string) => void;
}

export default function BottomNavigation({ currentScreen, onNavigate }: BottomNavigationProps) {
  const navigationItems = [
    {
      id: "home",
      label: "Marriage",
      screen: "home",
      badge: null,
      icon: HeartIcon
    },
    {
      id: "matches",
      label: "Matches", 
      screen: "matches",
      // badge: "10",
      icon: MatchesIcon
    },
    {
      id: "blogs",
      label: "Blogs",
      screen: "blogs",
      badge: null,
      icon: NoticeIcon
    },
    {
      id: "chat",
      label: "Chat",
      screen: "messages",
      badge: null,
      icon: ChatIcon
    },
    {
      id: "premium",
      label: "Premium",
      screen: "premium",
      badge: null,
      icon: PremiumIcon
    }
  ];

  const isActive = (screen: string) => {
    // Map current screen to navigation item
    const screenMapping: { [key: string]: string } = {
      "home": "home",
      "matches": "matches",
      "search": "matches", // Search uses matches tab
      "blogs": "blogs", // Added blogs mapping
      "blog-detail": "blogs", // Blog detail should highlight blogs tab
      "create-blog": "blogs", // Create blog should highlight blogs tab
      "notifications": "notice",
      "notice": "notice", 
      "messages": "chat",
      "chat": "chat",
      "premium": "premium",
      "pricing": "premium",
      "vip-premium": "premium",
      "checkout": "premium"
    };
    
    return screenMapping[currentScreen] === screen;
  };

  const shouldShowNavigation = () => {
    // Hide navigation on certain screens
    const hideOnScreens = [
      "splash",
      "onboarding", 
      "login",
      "signup",
      "forgot-password",
      "otp",
      "video-call"
    ];
    
    return !hideOnScreens.includes(currentScreen);
  };

  if (!shouldShowNavigation()) {
    return null;
  }

  return (
    <>
    <div className="h-20 md:h-24 lg:h-28"/>
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="fixed bottom-0 left-0 right-0 z-50"
    >
      {/* Background with enhanced gradient and glass effect */}
      <div className="absolute inset-0 nav-glass shadow-2xl border-t border-gray-200/30">
        <div className="absolute inset-0 bg-gradient-to-t from-white/95 via-white/90 to-white/80"></div>
      </div>
      
      {/* Navigation Content */}
      <div className="relative flex items-center justify-around py-3 px-2">
        {navigationItems.map((item, index) => {
          const Icon = item.icon;
          const active = isActive(item.screen);
          
          return (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Button
                variant="ghost"
                size="sm"
                className={`flex flex-col items-center justify-center space-y-1 transition-all duration-500 hover-scale relative min-w-0 flex-1 h-auto py-3 px-3 rounded-2xl group ${
                  active 
                    ? 'text-primary bg-gradient-to-t from-primary/15 to-primary/5 shadow-lg transform scale-105 border border-primary/20' 
                    : 'text-gray-500 hover:text-primary hover:bg-primary/5 hover:scale-105'
                }`}
                onClick={() => onNavigate(item.screen)}
              >
                {/* Icon Container with Enhanced Effects */}
                <div className={`relative transition-all duration-500 icon-hover ${
                  active ? 'transform scale-110 nav-glow-active' : 'nav-glow'
                }`}>
                  <Icon 
                    className={`w-7 h-7 transition-all duration-500 ${
                      active 
                        ? 'text-primary drop-shadow-lg' 
                        : 'text-gray-500 group-hover:text-primary'
                    }`}
                    active={active}
                  />
                  
                  {/* Enhanced glow effect for active icon */}
                  {active && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      className="absolute inset-0 w-7 h-7 bg-primary/25 rounded-full blur-xl -z-10"
                    />
                  )}
                  
                  {/* Notification Badge for Matches with pulse */}
                  {item.id === "matches" && item.badge && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -top-2 -right-2 bg-gradient-to-r from-red-500 to-red-600 text-white text-xs rounded-full min-w-[20px] h-[20px] flex items-center justify-center px-1 font-bold shadow-lg border-2 border-white badge-pulse"
                    >
                      {item.badge}
                    </motion.div>
                  )}
                </div>
                
                {/* Enhanced Label Typography */}
                <span className={`text-xs font-medium transition-all duration-500 ${
                  active 
                    ? 'text-primary font-bold transform scale-105' 
                    : 'text-gray-500 group-hover:text-primary'
                } ${item.id === "premium" ? 'bg-gradient-to-r from-red-500 to-pink-500 bg-clip-text text-transparent font-bold' : ''}`}>
                  {item.label}
                </span>
                
                {/* Enhanced Active indicator with gradient */}
                {active && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-10 h-1.5 bg-gradient-to-r from-primary via-red-500 to-pink-500 rounded-full shadow-lg"
                    transition={{ type: "spring", bounce: 0.3, duration: 0.8 }}
                  />
                )}
                
                {/* Hover effect background */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  whileHover={{ scale: 1.05 }}
                />
              </Button>
            </motion.div>
          );
        })}
      </div>
      
      {/* Enhanced safe area with gradient */}
      <div className="h-safe-area-inset-bottom bg-gradient-to-t from-white via-white/95 to-white/90"></div>
    </motion.div>
    </>
  );
}