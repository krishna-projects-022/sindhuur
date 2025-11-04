import { motion } from "motion/react";
import { ArrowLeft, Heart, MessageCircle, Star, Crown, MapPin, Briefcase, GraduationCap, Calendar } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface ProfileScreenProps {
  user: any;
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export default function ProfileScreen({ user, onNavigate, onBack }: ProfileScreenProps) {
  // Mock profile data
  const profile = {
    id: 1,
    name: "Sarah Johnson",
    age: 26,
    profession: "Doctor",
    education: "MD, Harvard Medical School",
    location: "Boston, MA",
    images: [
      "https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=400",
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400",
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400",
    ],
    bio: "Passionate about helping others and making a difference in the world. I love traveling, trying new cuisines, and spending time with family. Looking for someone who shares similar values and enjoys life's adventures.",
    interests: ["Travel", "Cooking", "Reading", "Yoga", "Photography"],
    verified: true,
    premium: true,
    compatibility: 95,
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-white/80 backdrop-blur-sm border-b border-border"
      >
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" size="sm" onClick={onBack} className="hover-scale">
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex items-center space-x-2">
            <Button variant="ghost" size="sm" className="hover-scale">
              <Star className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </motion.div>

      <div className="pb-20">
        {/* Profile Images */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <div className="h-96 relative overflow-hidden">
            <ImageWithFallback
              src={profile.images[0]}
              alt={profile.name}
              className="w-full h-full object-cover"
            />
            
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
            
            {/* Badges */}
            <div className="absolute top-4 left-4 flex space-x-2">
              {profile.verified && (
                <Badge className="bg-green-500 text-white">
                  <Star className="w-3 h-3 mr-1" />
                  Verified
                </Badge>
              )}
              {profile.premium && (
                <Badge className="bg-primary text-white">
                  <Crown className="w-3 h-3 mr-1" />
                  Premium
                </Badge>
              )}
            </div>

            {/* Compatibility Score */}
            <div className="absolute top-4 right-4">
              <div className="bg-white/90 backdrop-blur-sm rounded-full px-3 py-1">
                <span className="text-sm text-primary">{profile.compatibility}% Match</span>
              </div>
            </div>
          </div>

          {/* Image indicators */}
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {profile.images.map((_, index) => (
              <div
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === 0 ? 'bg-white' : 'bg-white/50'
                }`}
              />
            ))}
          </div>
        </motion.div>

        {/* Profile Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4 space-y-6"
        >
          <Card>
            <CardContent className="p-6">
              <h1 className="text-2xl text-foreground mb-4">{profile.name}, {profile.age}</h1>
              
              <div className="space-y-3 mb-6">
                <div className="flex items-center space-x-3">
                  <Briefcase className="w-5 h-5 text-muted-foreground" />
                  <span>{profile.profession}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <GraduationCap className="w-5 h-5 text-muted-foreground" />
                  <span>{profile.education}</span>
                </div>
                <div className="flex items-center space-x-3">
                  <MapPin className="w-5 h-5 text-muted-foreground" />
                  <span>{profile.location}</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div>
                <h3 className="text-lg text-foreground mb-3">About</h3>
                <p className="text-muted-foreground leading-relaxed">{profile.bio}</p>
              </div>
            </CardContent>
          </Card>

          {/* Interests */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg text-foreground mb-4">Interests</h3>
              <div className="flex flex-wrap gap-2">
                {profile.interests.map((interest, index) => (
                  <Badge key={index} variant="secondary" className="text-sm">
                    {interest}
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Action Buttons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-sm border-t border-border p-4"
      >
        <div className="flex space-x-4 max-w-sm mx-auto">
          <Button
            variant="outline"
            size="lg"
            className="flex-1 hover-scale tap-scale"
            onClick={onBack}
          >
            Pass
          </Button>
          <Button
            size="lg"
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground hover-scale tap-scale"
            onClick={() => onNavigate("messages")}
          >
            <Heart className="w-5 h-5 mr-2" />
            Like
          </Button>
          <Button
            variant="outline"
            size="lg"
            className="flex-1 hover-scale tap-scale"
            onClick={() => onNavigate("messages")}
          >
            <MessageCircle className="w-5 h-5 mr-2" />
            Message
          </Button>
        </div>
      </motion.div>
    </div>
  );
}