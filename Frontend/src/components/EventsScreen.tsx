import { motion } from "motion/react";
import { ArrowLeft, Calendar, Clock, Users, Video, MapPin, Star, Heart, Crown, Plus } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Avatar, AvatarImage, AvatarFallback } from "./ui/avatar";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface EventsScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export default function EventsScreen({ onNavigate, onBack }: EventsScreenProps) {
  const liveEvents = [
    {
      id: 1,
      title: "5 Minute Speed Dating",
      description: "Quick video meetings with potential matches",
      time: "7:00 PM - 9:00 PM",
      date: "Today",
      participants: 24,
      maxParticipants: 30,
      image: "https://images.unsplash.com/photo-1573164713714-d95e436ab8d6?w=300",
      status: "live",
      premium: false
    },
    {
      id: 2,
      title: "Mumbai Professionals Meetup",
      description: "Connect with professionals in your city",
      time: "6:30 PM - 8:30 PM",
      date: "Tomorrow",
      participants: 18,
      maxParticipants: 25,
      image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=300",
      status: "upcoming",
      premium: true
    },
    {
      id: 3,
      title: "Virtual Coffee Chat",
      description: "Casual virtual meetup over coffee",
      time: "11:00 AM - 12:00 PM",
      date: "Sunday",
      participants: 12,
      maxParticipants: 20,
      image: "https://images.unsplash.com/photo-1521017432531-fbd92d768814?w=300",
      status: "upcoming",
      premium: false
    }
  ];

  const pastEvents = [
    {
      id: 4,
      title: "Bollywood Night Mixer",
      description: "Fun evening with Bollywood music and games",
      date: "Last Friday",
      participants: 35,
      matches: 8,
      image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=300"
    },
    {
      id: 5,
      title: "Tech Professionals Network",
      description: "Networking event for IT professionals",
      date: "Last Wednesday",
      participants: 22,
      matches: 5,
      image: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=300"
    }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "live":
        return "bg-red-500 text-white";
      case "upcoming":
        return "bg-blue-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/90 backdrop-blur-sm border-b border-border/50"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover-scale">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl text-foreground">Events</h1>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => onNavigate("create-event")}
            className="hover-scale"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Event
          </Button>
        </div>
      </motion.div>

      <div className="pb-6">
        {/* Live Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-4"
        >
          <div className="flex items-center space-x-2 mb-4">
            <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
            <h2 className="text-lg text-foreground">Live & Upcoming Events</h2>
          </div>

          <div className="space-y-4">
            {liveEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.2 }}
              >
                <Card 
                  className="cursor-pointer hover-scale tap-scale rounded-2xl overflow-hidden shadow-md"
                  onClick={() => onNavigate("event-detail", event)}
                >
                  <div className="relative">
                    <div className="h-40 overflow-hidden">
                      <ImageWithFallback
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* Status Badge */}
                    <div className="absolute top-3 left-3">
                      <Badge className={`${getStatusColor(event.status)} text-xs px-3 py-1`}>
                        {event.status === "live" && (
                          <div className="w-2 h-2 bg-white rounded-full mr-2 animate-pulse"></div>
                        )}
                        {event.status.toUpperCase()}
                      </Badge>
                    </div>

                    {/* Premium Badge */}
                    {event.premium && (
                      <div className="absolute top-3 right-3">
                        <Badge className="bg-primary text-white">
                          <Crown className="w-3 h-3 mr-1" />
                          Premium
                        </Badge>
                      </div>
                    )}

                    {/* Participants */}
                    <div className="absolute bottom-3 right-3 bg-black/60 text-white rounded-full px-3 py-1 text-xs">
                      <Users className="w-3 h-3 inline mr-1" />
                      {event.participants}/{event.maxParticipants}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-base mb-2">{event.title}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{event.description}</p>
                    
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="w-4 h-4" />
                        <span>{event.date}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Clock className="w-4 h-4" />
                        <span>{event.time}</span>
                      </div>
                    </div>

                    <Button 
                      className={`w-full rounded-xl hover-scale tap-scale ${
                        event.status === "live" 
                          ? "bg-red-500 hover:bg-red-600 text-white" 
                          : "bg-primary hover:bg-primary/90 text-white"
                      }`}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (event.premium) {
                          onNavigate("premium");
                        } else {
                          onNavigate("event-detail", event);
                        }
                      }}
                    >
                      {event.status === "live" ? (
                        <>
                          <Video className="w-4 h-4 mr-2" />
                          Join Now
                        </>
                      ) : (
                        <>
                          <Calendar className="w-4 h-4 mr-2" />
                          Register
                        </>
                      )}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Past Events */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4"
        >
          <h2 className="text-lg text-foreground mb-4">Past Events</h2>
          
          <div className="space-y-3">
            {pastEvents.map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.5 }}
              >
                <Card 
                  className="cursor-pointer hover-scale tap-scale rounded-2xl"
                  onClick={() => onNavigate("event-detail", event)}
                >
                  <CardContent className="p-4 flex items-center space-x-4">
                    <div className="w-16 h-16 rounded-xl overflow-hidden">
                      <ImageWithFallback
                        src={event.image}
                        alt={event.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <h4 className="text-sm mb-1">{event.title}</h4>
                      <p className="text-xs text-muted-foreground mb-2">{event.description}</p>
                      <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                        <span>{event.date}</span>
                        <div className="flex items-center space-x-1">
                          <Users className="w-3 h-3" />
                          <span>{event.participants} attended</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Heart className="w-3 h-3 text-primary" />
                          <span>{event.matches} matches</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4"
        >
          <Card className="bg-gradient-to-r from-primary/10 to-pink-50 border-primary/20 rounded-2xl">
            <CardContent className="p-6 text-center">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-lg text-foreground mb-2">Create Your Own Event</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Host a meetup and connect with like-minded people in your area
              </p>
              <Button 
                className="bg-primary hover:bg-primary/90 text-white rounded-xl px-8 hover-scale tap-scale"
                onClick={() => onNavigate("create-event")}
              >
                Get Started
              </Button>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}