import { motion } from "motion/react";
import { ArrowLeft, Crown, Heart, Eye, MessageCircle, Star, Check, Shield, Sparkles, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Badge } from "./ui/badge";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/hooks/use-toast";

interface PremiumScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export default function PremiumScreen({ onNavigate, onBack }: PremiumScreenProps) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handlePlanSelection = (planName: string, price: string) => {
    if (price === "₹0") {
      navigate("/signup");
    } else {
      navigate(
        `/payment?plan=${planName.toLowerCase()}&price=${price
          .replace("₹", "")
          .replace(",", "")}`
      );
    }

    toast({
      title: "Plan Selected",
      description: `You've selected the ${planName} plan. Redirecting to ${
        price === "₹0" ? "registration" : "payment"
      }...`,
    });
  };

  const plans = [
    {
      id: "free",
      name: "Free",
      price: "₹0",
      duration: "Forever",
      color: "from-yellow-400 to-yellow-600",
      bgColor: "from-yellow-50 to-yellow-100",
      features: [
        "Create profile",
        "View 5 profiles per day",
        "Send 2 interests per day",
        "Basic search filters",
      ],
      limitations: [
        "Cannot view contact details",
        "Limited profile views",
        "No profile boost",
      ],
      popular: false,
    },
    {
      id: "premium",
      name: "Premium",
      price: "₹2,999",
      duration: "3 Months",
      color: "from-blue-500 to-blue-700",
      bgColor: "from-blue-50 to-blue-100",
      features: [
        "Everything in Free",
        "Unlimited profile views",
        "View contact details",
        "Advanced search filters",
        "Send unlimited interests",
        "Profile boost (2x visibility)",
        "Priority customer support",
        "Chat",
      ],
      limitations: [],
      popular: true,
    },
    {
      id: "premiumplus",
      name: "Premium Plus",
      price: "₹4,999",
      duration: "6 Months",
      color: "from-purple-500 to-purple-700",
      bgColor: "from-purple-50 to-purple-100",
      features: [
        "Everything in Premium",
        "Horoscope matching",
        "Profile verification badge",
        "Top profile placement",
        "Exclusive member events",
      ],
      limitations: [],
      popular: false,
    },
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
            <h1 className="text-xl text-foreground">Premium Plans</h1>
          </div>
        </div>
      </motion.div>

      <div className="pb-6">
        {/* Banner Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-r from-primary via-red-500 to-pink-500 p-6 text-white relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-black/10"></div>
          <div className="relative z-10">
            <div className="flex items-center justify-center mb-4">
              <Badge className="bg-white/20 text-white border-white/30 px-4 py-2 text-sm">
                <Shield className="w-4 h-4 mr-2" />
               Boost Your Profile
              </Badge>
            </div>
            <div className="text-center">
              <h2 className="text-3xl mb-2">Choose the perfect plan</h2>
              <p className="text-white/90 text-lg">
                All plans include our trust and safety features
              </p>
            </div>
          </div>
        </motion.div>

        {/* Plan Cards - Responsive Grid */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 }}
          className="p-4"
        >
          <h3 className="text-lg text-foreground mb-4">Choose Your Plan</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-[1440px] mx-auto">
            {plans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="w-full"
              >
                <Card className={`h-full hover-scale tap-scale cursor-pointer relative border-2 ${
                  plan.popular ? 'border-primary shadow-xl' : 'border-border'
                } rounded-2xl overflow-hidden`}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                      <Badge className="bg-primary text-white px-4 py-1">
                        <Sparkles className="w-3 h-3 mr-1" />
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  
                  {/* Plan Header */}
                  <div className={`bg-gradient-to-r ${plan.bgColor} p-6 text-center`}>
                    <div className={`w-16 h-16 bg-gradient-to-r ${plan.color} rounded-full flex items-center justify-center mx-auto mb-4`}>
                      <Crown className="w-8 h-8 text-white" />
                    </div>
                    <h4 className="text-xl text-gray-800 mb-2">{plan.name}</h4>
                    <div className="flex items-center justify-center space-x-2 mb-2">
                      <span className="text-lg text-gray-700">{plan.duration}</span>
                    </div>
                  </div>

                  <CardContent className="p-6">
                    {/* Pricing */}
                    <div className="text-center mb-6">
                      <div className="text-3xl text-primary mb-1">
                        {plan.price}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {plan.duration}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="space-y-3 mb-6">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {/* Limitations */}
                    {plan.limitations.length > 0 && (
                      <div className="space-y-3 mb-6">
                        <h4 className="font-semibold text-gray-800 mb-3">Limitations:</h4>
                        {plan.limitations.map((limitation, limitIndex) => (
                          <div key={limitIndex} className="flex items-center space-x-3">
                            <div className="w-5 h-5 border border-red-300 rounded-full flex-shrink-0"></div>
                            <span className="text-sm text-gray-500">{limitation}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* CTA Button */}
                    <Button
                      onClick={() => handlePlanSelection(plan.name, plan.price)}
                      disabled={plan.name === "Free"}
                      className={`w-full py-3 rounded-xl hover-scale tap-scale ${
                        plan.popular 
                          ? 'bg-primary hover:bg-primary/90 text-white' 
                          : plan.name === "Free"
                          ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                          : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
                      }`}
                      size="lg"
                    >
                      {plan.name === "Free" ? "Free" : "Choose This Plan"}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* VIP Section Preview */}
        {/* <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="p-4"
        >
          <Card 
            className="bg-gradient-to-r from-purple-600 to-purple-800 text-white rounded-2xl cursor-pointer hover-scale tap-scale overflow-hidden"
            onClick={() => onNavigate("vip-premium")}
          >
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                  <Users className="w-8 h-8 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl mb-2">VIP Shaadi</h3>
                  <p className="text-purple-100 text-sm mb-3">
                    Elite Matchmaking Service with Personal Consultant
                  </p>
                  <div className="flex items-center space-x-4 text-sm">
                    <div className="flex items-center space-x-1">
                      <Star className="w-4 h-4" />
                      <span>Top Consultants</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Shield className="w-4 h-4" />
                      <span>100% Discreet</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg">Starting</div>
                  <div className="text-2xl">₹65,000</div>
                </div>
              </div>
              
              <div className="flex space-x-3 mt-6">
                <Button 
                  variant="outline" 
                  className="flex-1 bg-white/10 border-white/30 text-white hover:bg-white/20"
                >
                  Book Free Consultation
                </Button>
                <Button 
                  className="flex-1 bg-white text-purple-600 hover:bg-white/90"
                >
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div> */}

        {/* Features Highlight */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4"
        >
          <h3 className="text-lg text-foreground mb-4">Why Choose Premium?</h3>
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-gradient-to-br from-red-50 to-pink-50 border-red-100 rounded-2xl">
              <CardContent className="p-4 text-center">
                <Heart className="w-8 h-8 text-red-500 mx-auto mb-2" />
                <div className="text-2xl text-red-600 mb-1">3x</div>
                <div className="text-sm text-red-700">More Matches</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-100 rounded-2xl">
              <CardContent className="p-4 text-center">
                <Eye className="w-8 h-8 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl text-blue-600 mb-1">10x</div>
                <div className="text-sm text-blue-700">Profile Views</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-100 rounded-2xl">
              <CardContent className="p-4 text-center">
                <MessageCircle className="w-8 h-8 text-green-500 mx-auto mb-2" />
                <div className="text-2xl text-green-600 mb-1">5x</div>
                <div className="text-sm text-green-700">Faster Response</div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-br from-purple-50 to-violet-50 border-purple-100 rounded-2xl">
              <CardContent className="p-4 text-center">
                <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl text-purple-600 mb-1">Premium</div>
                <div className="text-sm text-purple-700">Support</div>
              </CardContent>
            </Card>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-4"
        >
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            Frequently Asked Questions
          </h2>

          <div className="space-y-6">
            {[
              {
                question: "How secure are the payments?",
                answer:
                  "We use industry-standard SSL encryption and work with trusted payment gateways to ensure your financial information is completely secure.",
              },
              {
                question: "Can I upgrade or downgrade my plan?",
                answer:
                  "Yes, you can upgrade your plan at any time. For downgrades, the changes will take effect at the end of your current billing cycle.",
              },
              {
                question: "What happens after my membership expires?",
                answer:
                  "Your account will revert to the free plan. Your profile remains active, but premium features will be disabled until renewal.",
              },
              {
                question: "Is there a refund policy?",
                answer:
                  "We offer a 7-day money-back guarantee for premium plans if you're not satisfied with our service.",
              },
            ].map((faq, index) => (
              <Card key={index} className="border-border rounded-2xl">
                <CardContent className="p-6">
                  <h3 className="font-semibold text-foreground mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

      
      </div>
    </div>
  );
}