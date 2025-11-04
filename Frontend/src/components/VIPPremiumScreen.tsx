import { motion } from "motion/react";
import { ArrowLeft, Crown, Star, Shield, Users, Phone, Video, MessageCircle, CheckCircle, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { ImageWithFallback } from './figma/ImageWithFallback';

interface VIPPremiumScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export default function VIPPremiumScreen({ onNavigate, onBack }: VIPPremiumScreenProps) {
  const features = [
    {
      icon: <Users className="w-6 h-6 text-white" />,
      title: "Top Consultants",
      description: "Dedicated relationship experts"
    },
    {
      icon: <Star className="w-6 h-6 text-white" />,
      title: "Handpicked Matches",
      description: "Personally curated profiles"
    },
    {
      icon: <Shield className="w-6 h-6 text-white" />,
      title: "100% Discreet",
      description: "Complete privacy guaranteed"
    },
    {
      icon: <Crown className="w-6 h-6 text-white" />,
      title: "Private Service",
      description: "Exclusive matchmaking experience"
    }
  ];

  const services = [
    "Personal relationship consultant",
    "Priority profile placement",
    "Assisted profile creation", 
    "Direct contact facilitation",
    "Background verification",
    "Compatibility assessment",
    "Meeting coordination",
    "Feedback and guidance"
  ];

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
            <h1 className="text-xl text-foreground">VIP Premium</h1>
          </div>
        </div>
      </motion.div>

      <div className="pb-6">
        {/* Hero Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-purple-600 via-purple-700 to-purple-800 relative overflow-hidden"
        >
          {/* Background Pattern */}
          <div className="absolute inset-0 opacity-10">
            <div className="absolute inset-0 bg-purple-900/20"></div>
            <div className="absolute inset-0" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='7' cy='7' r='7'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
              backgroundSize: '60px 60px'
            }}></div>
          </div>
          
          <div className="relative z-10 p-6 text-white">
            <div className="text-center mb-6">
              <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Crown className="w-10 h-10 text-white" />
              </div>
              <Badge className="bg-white/20 text-white border-white/30 mb-4">
                <Sparkles className="w-3 h-3 mr-1" />
                EXCLUSIVE SERVICE
              </Badge>
              <h2 className="text-3xl mb-2">VIP Shaadi</h2>
              <p className="text-purple-100 text-lg">
                Elite Matchmaking Service
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              {features.map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 + 0.2 }}
                  className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center"
                >
                  <div className="w-12 h-12 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-2">
                    {feature.icon}
                  </div>
                  <h4 className="text-sm mb-1">{feature.title}</h4>
                  <p className="text-xs text-purple-100">{feature.description}</p>
                </motion.div>
              ))}
            </div>

            {/* Pricing */}
            <div className="text-center mb-6">
              <div className="text-purple-100 mb-1">Price starting</div>
              <div className="text-4xl mb-4">₹65,000</div>
            </div>
          </div>
        </motion.div>

        {/* Profile Consultant Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="p-4"
        >
          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200 rounded-2xl overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4 mb-4">
                <div className="w-16 h-16 rounded-full overflow-hidden">
                  <ImageWithFallback
                    src="https://images.unsplash.com/photo-1494790108755-2616b612b77c?w=150"
                    alt="Profile Consultant"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <h3 className="text-lg text-purple-800">Your Personal Consultant</h3>
                  <p className="text-purple-600 text-sm">Expert matchmaker with 10+ years experience</p>
                  <div className="flex items-center space-x-1 mt-1">
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <Star className="w-4 h-4 text-yellow-500 fill-current" />
                    <span className="text-sm text-purple-600 ml-1">5.0</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-white/60 rounded-xl p-4">
                <p className="text-purple-700 text-sm italic">
                  "I personally ensure each match is carefully selected based on your preferences, 
                  values, and compatibility. Your privacy and satisfaction are my top priorities."
                </p>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Services Included */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="p-4"
        >
          <h3 className="text-lg text-foreground mb-4">What's Included</h3>
          <Card className="rounded-2xl">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 gap-3">
                {services.map((service, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.05 + 0.5 }}
                    className="flex items-center space-x-3"
                  >
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <CheckCircle className="w-4 h-4 text-purple-600" />
                    </div>
                    <span className="text-sm text-foreground">{service}</span>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Success Stories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4"
        >
          <h3 className="text-lg text-foreground mb-4">Success Stories</h3>
          <div className="space-y-4">
            <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                      R
                    </div>
                    <div className="w-8 h-8 rounded-full bg-pink-500 flex items-center justify-center text-white text-xs">
                      S
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-green-800">Rahul & Sneha</div>
                    <div className="text-xs text-green-600">Matched in 2 weeks</div>
                  </div>
                </div>
                <p className="text-sm text-green-700 italic">
                  "The personalized attention and quality matches exceeded our expectations. 
                  Found my life partner through VIP service!"
                </p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200 rounded-2xl">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-3">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-white text-xs">
                      A
                    </div>
                    <div className="w-8 h-8 rounded-full bg-purple-500 flex items-center justify-center text-white text-xs">
                      P
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-blue-800">Arjun & Priya</div>
                    <div className="text-xs text-blue-600">Matched in 1 month</div>
                  </div>
                </div>
                <p className="text-sm text-blue-700 italic">
                  "Professional, discreet, and effective. The consultant understood exactly 
                  what we were looking for."
                </p>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-4 space-y-3"
        >
          <Button
            variant="outline"
            className="w-full py-6 border-purple-300 text-purple-700 hover:bg-purple-50 rounded-2xl"
            size="lg"
          >
            <Phone className="w-5 h-5 mr-2" />
            Book Free Consultation
          </Button>
          
          <Button
            onClick={() => onNavigate("checkout", { 
              id: "vip", 
              name: "VIP Shaadi", 
              price: "₹65,000",
              type: "VIP Service"
            })}
            className="w-full py-6 bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white rounded-2xl hover-scale tap-scale"
            size="lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            Continue with VIP Service
          </Button>
        </motion.div>

        {/* Guarantee */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
          className="p-4"
        >
          <div className="text-center text-sm text-muted-foreground space-y-1">
            <div className="flex items-center justify-center space-x-2">
              <Shield className="w-4 h-4 text-purple-500" />
              <span>100% Privacy Guaranteed</span>
            </div>
            <div>Premium support • Verified profiles • Trusted service</div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}