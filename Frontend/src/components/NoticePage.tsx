import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface NoticePageProps {
  user: any;
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
  onConnect?: (profile: any) => void;
}

export default function NoticePage({ user, onNavigate, onBack, onConnect }: NoticePageProps) {
  const notices = [
    {
      id: 1,
      type: "match",
      title: "New Match!",
      message: "You and Sarah Johnson liked each other",
      time: "2 minutes ago",
      avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=100",
      unread: true,
      profileData: {
        name: "Sarah Johnson",
        age: 26,
        location: "Boston, MA",
        image: "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=400"
      }
    },
    {
      id: 2,
      type: "like",
      title: "Someone liked you!",
      message: "Emily Chen sent you a like",
      time: "15 minutes ago",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100",
      unread: true,
      profileData: {
        name: "Emily Chen",
        age: 28,
        location: "San Francisco, CA",
        image: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"
      }
    },
    {
      id: 3,
      type: "message",
      title: "New Message",
      message: "Priya Sharma: Hi! How are you doing?",
      time: "1 hour ago",
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100",
      unread: true,
      profileData: {
        name: "Priya Sharma",
        age: 25,
        location: "Mumbai, India",
        image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400"
      }
    },
    {
      id: 4,
      type: "premium",
      title: "Premium Offer",
      message: "Get 50% off on Premium subscription!",
      time: "2 hours ago",
      avatar: null,
      unread: false
    },
    {
      id: 5,
      type: "event",
      title: "Event Reminder",
      message: "5 Minute Speed Dating starts in 30 minutes",
      time: "3 hours ago",
      avatar: null,
      unread: false
    },
    {
      id: 6,
      type: "visitor",
      title: "Profile Visitor",
      message: "Jessica Adams viewed your profile",
      time: "5 hours ago",
      avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=100",
      unread: false,
      profileData: {
        name: "Jessica Adams",
        age: 27,
        location: "Los Angeles, CA",
        image: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=400"
      }
    }
  ];

  const getNoticeTypeLabel = (type: string) => {
    switch (type) {
      case "match":
        return "New Match";
      case "like":
        return "Like Received";
      case "message":
        return "New Message";
      case "premium":
        return "Premium Offer";
      case "event":
        return "Event Update";
      case "visitor":
        return "Profile View";
      default:
        return "Notification";
    }
  };

  const handleNoticeClick = (notice: any) => {
    if (notice.type === "match" || notice.type === "like" || notice.type === "visitor") {
      onNavigate("profile-detail", notice.profileData);
    } else if (notice.type === "message") {
      onNavigate("chat", { profile: notice.profileData, user });
    } else if (notice.type === "premium") {
      onNavigate("premium");
    } else if (notice.type === "event") {
      onNavigate("events");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border/50"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="hover-scale btn-text-center"
            >
              Back
            </Button>
            <h1 className="text-xl text-foreground">Notifications</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            className="text-primary hover-scale btn-text-center"
          >
            Mark all read
          </Button>
        </div>
      </motion.div>

      {/* Content with bottom padding for navigation */}
      <div className="pb-nav">
        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4"
        >
          <div className="grid grid-cols-2 gap-3">
            <Card 
              className="cursor-pointer hover-scale tap-scale rounded-2xl bg-gradient-to-r from-red-50 to-pink-50 border-red-200"
              onClick={() => onNavigate("matches")}
            >
              <CardContent className="p-4 text-center">
                <h3 className="text-sm text-red-700 mb-1">New Matches</h3>
                <p className="text-xs text-red-600 mb-3">3 waiting</p>
                <Button 
                  size="sm"
                  className="w-full btn-text-center bg-red-500 hover:bg-red-600 text-white rounded-lg"
                >
                  View Matches
                </Button>
              </CardContent>
            </Card>

            <Card 
              className="cursor-pointer hover-scale tap-scale rounded-2xl bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200"
              onClick={() => onNavigate("messages")}
            >
              <CardContent className="p-4 text-center">
                <h3 className="text-sm text-blue-700 mb-1">Messages</h3>
                <p className="text-xs text-blue-600 mb-3">5 unread</p>
                <Button 
                  size="sm"
                  className="w-full btn-text-center bg-blue-500 hover:bg-blue-600 text-white rounded-lg"
                >
                  Open Messages
                </Button>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* Notifications List */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4"
        >
          <h2 className="text-lg text-foreground mb-4">Recent Activity</h2>
          
          <div className="space-y-3">
            {notices.map((notice, index) => (
              <motion.div
                key={notice.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
              >
                <Card 
                  className={`cursor-pointer hover-scale tap-scale rounded-2xl ${
                    notice.unread ? 'bg-gradient-to-r from-red-50/50 to-white border-red-200' : 'bg-white'
                  }`}
                  onClick={() => handleNoticeClick(notice)}
                >
                  <CardContent className="p-4 flex items-center space-x-4">
                    {/* Avatar or Default */}
                    <div className="relative">
                      {notice.avatar ? (
                        <Avatar className="w-12 h-12 border-2 border-primary/20">
                          <AvatarImage src={notice.avatar} />
                          <AvatarFallback>{notice.title[0]}</AvatarFallback>
                        </Avatar>
                      ) : (
                        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center">
                          <span className="text-xs text-gray-500 text-center">
                            {getNoticeTypeLabel(notice.type)}
                          </span>
                        </div>
                      )}
                      
                      {/* Unread Indicator */}
                      {notice.unread && (
                        <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary rounded-full border-2 border-white"></div>
                      )}
                    </div>
                    
                    {/* Content */}
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className="text-sm text-foreground">{notice.title}</h4>
                        <span className="text-xs text-muted-foreground">{notice.time}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{notice.message}</p>
                    </div>
                    
                    {/* Action Button */}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="btn-text-center text-primary"
                    >
                      View
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Profile Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg text-foreground">Suggested for You</h2>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => onNavigate("matches")}
              className="text-primary hover-scale btn-text-center"
            >
              See All
            </Button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            {[
              {
                id: 1,
                name: "Anna Williams",
                age: 24,
                location: "Miami, FL",
                image: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=300",
                badge: "New"
              },
              {
                id: 2,
                name: "Lisa Rodriguez",
                age: 26,
                location: "Austin, TX",
                image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300",
                badge: "Online"
              }
            ].map((profile, index) => (
              <motion.div
                key={profile.id}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1 + 0.6 }}
              >
                <Card 
                  className="cursor-pointer hover-scale tap-scale rounded-2xl overflow-hidden"
                  onClick={() => onNavigate("profile-detail", profile)}
                >
                  <div className="relative">
                    <div className="aspect-[4/5] overflow-hidden">
                      <ImageWithFallback
                        src={profile.image}
                        alt={profile.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="absolute top-3 left-3">
                      <Badge className="bg-green-500 text-white text-xs px-2 py-1">
                        {profile.badge}
                      </Badge>
                    </div>
                  </div>

                  <CardContent className="p-3">
                    <h4 className="text-sm text-foreground mb-1 text-center">{profile.name}, {profile.age}</h4>
                    <p className="text-xs text-muted-foreground mb-2 text-center">{profile.location}</p>
                    
                    <Button 
                      size="sm"
                      className="w-full btn-text-center bg-primary hover:bg-primary/90 text-white rounded-lg text-xs py-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (onConnect) {
                          onConnect(profile);
                        } else {
                          onNavigate("premium");
                        }
                      }}
                    >
                      Like Profile
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}