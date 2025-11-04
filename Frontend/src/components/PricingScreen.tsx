import { motion } from "motion/react";
import { ArrowLeft, Crown, Check, Sparkles, Heart, Eye, MessageCircle, Zap, Star, Shield } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Separator } from "./ui/separator";

interface PricingScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
}

export default function PricingScreen({ onNavigate, onBack }: PricingScreenProps) {
  const plans = [
    {
      id: "monthly",
      name: "Premium Monthly",
      price: 29.99,
      period: "month",
      popular: false,
      color: "from-gray-500 to-gray-600",
      features: [
        "Unlimited Likes",
        "See Who Liked You",
        "5 Super Likes per month",
        "Message Read Receipts",
        "Ad-free Experience",
        "Priority Customer Support",
      ],
      savings: null,
    },
    {
      id: "quarterly",
      name: "Premium Quarterly",
      price: 19.99,
      period: "month",
      popular: true,
      color: "from-primary to-pink-600",
      originalPrice: 29.99,
      totalPrice: 59.97,
      billingPeriod: "3 months",
      features: [
        "Everything in Monthly",
        "10 Super Likes per month",
        "1 Profile Boost per month",
        "See Who Read Your Messages",
        "Advanced Filters",
        "Passport Feature",
        "Rewind Last Swipe",
      ],
      savings: "Save 33%",
    },
    {
      id: "yearly",
      name: "Premium Yearly",
      price: 12.99,
      period: "month",
      popular: false,
      color: "from-purple-500 to-indigo-600",
      originalPrice: 29.99,
      totalPrice: 155.88,
      billingPeriod: "12 months",
      features: [
        "Everything in Quarterly",
        "20 Super Likes per month",
        "5 Profile Boosts per month",
        "Hide Age & Distance",
        "Control Who Sees You",
        "Priority Algorithm Boost",
        "VIP Customer Support",
        "Profile Verification Badge",
      ],
      savings: "Save 56%",
    },
  ];

  const handleSelectPlan = (plan: any) => {
    onNavigate("checkout", plan);
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
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack} className="hover-scale">
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h1 className="text-xl text-foreground">Choose Your Plan</h1>
          </div>
        </div>
      </motion.div>

      <div className="pb-6">
        {/* Hero Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="p-6 text-center"
        >
          <div className="mx-auto w-16 h-16 bg-gradient-to-br from-primary to-purple-600 rounded-full flex items-center justify-center mb-4">
            <Crown className="w-8 h-8 text-white" />
          </div>
          <h2 className="text-xl text-foreground mb-2">Find Love Faster</h2>
          <p className="text-muted-foreground">
            Join millions who found their perfect match with Premium
          </p>
        </motion.div>

        {/* Pricing Cards */}
        <div className="p-4 space-y-6">
          {plans.map((plan, index) => (
            <motion.div
              key={plan.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 + 0.2 }}
            >
              <Card className={`relative overflow-hidden hover-scale tap-scale ${
                plan.popular ? 'border-2 border-primary shadow-xl' : 'border border-border'
              }`}>
                {plan.popular && (
                  <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-primary to-pink-600 py-2">
                    <div className="flex items-center justify-center space-x-1">
                      <Sparkles className="w-4 h-4 text-white" />
                      <span className="text-white text-sm">Most Popular Choice</span>
                      <Sparkles className="w-4 h-4 text-white" />
                    </div>
                  </div>
                )}

                <CardHeader className={`text-center ${plan.popular ? 'pt-12' : 'pt-6'}`}>
                  <div className={`mx-auto w-12 h-12 bg-gradient-to-br ${plan.color} rounded-full flex items-center justify-center mb-4`}>
                    <Crown className="w-6 h-6 text-white" />
                  </div>
                  <CardTitle className="text-lg">{plan.name}</CardTitle>
                  {plan.savings && (
                    <Badge className="mx-auto bg-green-100 text-green-800 border-green-200">
                      {plan.savings}
                    </Badge>
                  )}
                </CardHeader>

                <CardContent className="space-y-6">
                  {/* Pricing */}
                  <div className="text-center">
                    <div className="flex items-baseline justify-center space-x-1">
                      <span className="text-3xl text-primary">${plan.price}</span>
                      <span className="text-muted-foreground">/{plan.period}</span>
                    </div>
                    {plan.originalPrice && (
                      <div className="flex items-center justify-center space-x-2 mt-1">
                        <span className="text-sm text-muted-foreground line-through">
                          ${plan.originalPrice}/{plan.period}
                        </span>
                      </div>
                    )}
                    {plan.billingPeriod && (
                      <p className="text-sm text-muted-foreground mt-2">
                        ${plan.totalPrice} billed every {plan.billingPeriod}
                      </p>
                    )}
                  </div>

                  <Separator />

                  {/* Features */}
                  <div className="space-y-3">
                    <h4 className="text-sm text-center text-muted-foreground">Features included:</h4>
                    <div className="space-y-2">
                      {plan.features.map((feature, featureIndex) => (
                        <div key={featureIndex} className="flex items-center space-x-3">
                          <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                            <Check className="w-3 h-3 text-green-600" />
                          </div>
                          <span className="text-sm text-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full py-3 hover-scale tap-scale ${
                      plan.popular 
                        ? 'bg-gradient-to-r from-primary to-pink-600 hover:from-primary/90 hover:to-pink-600/90 text-white' 
                        : 'bg-primary hover:bg-primary/90 text-primary-foreground'
                    }`}
                    size="lg"
                  >
                    {plan.popular ? (
                      <>
                        <Crown className="w-4 h-4 mr-2" />
                        Start Premium
                      </>
                    ) : (
                      'Choose Plan'
                    )}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Features Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="p-4"
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-center">Why Premium Members Get 3x More Matches</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2">
                    <Eye className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-sm mb-1">See Who Likes You</h4>
                  <p className="text-xs text-muted-foreground">No more guessing games</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2">
                    <Zap className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-sm mb-1">Profile Boost</h4>
                  <p className="text-xs text-muted-foreground">10x more visibility</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2">
                    <Star className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-sm mb-1">Super Likes</h4>
                  <p className="text-xs text-muted-foreground">Stand out instantly</p>
                </div>
                <div className="text-center">
                  <div className="p-3 bg-primary/10 rounded-full w-fit mx-auto mb-2">
                    <MessageCircle className="w-6 h-6 text-primary" />
                  </div>
                  <h4 className="text-sm mb-1">Priority Messages</h4>
                  <p className="text-xs text-muted-foreground">Get noticed first</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Trust & Security */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="p-4"
        >
          <div className="text-center space-y-2">
            <div className="flex items-center justify-center space-x-4 text-sm text-muted-foreground">
              <div className="flex items-center space-x-1">
                <Shield className="w-4 h-4" />
                <span>Secure Payment</span>
              </div>
              <div className="flex items-center space-x-1">
                <Check className="w-4 h-4" />
                <span>Cancel Anytime</span>
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              30-day money-back guarantee • Over 50 million happy members
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}