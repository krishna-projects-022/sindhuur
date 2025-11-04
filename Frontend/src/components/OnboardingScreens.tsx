import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronRight, Heart, Shield, Sparkles } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface OnboardingScreensProps {
  onComplete: () => void;
}

export default function OnboardingScreens({ onComplete }: OnboardingScreensProps) {
  const [currentScreen, setCurrentScreen] = useState(0);

  const screens = [
    {
      icon: <Heart className="w-16 h-16 text-primary" />,
      title: "Find Your Perfect Match",
      description: "Discover meaningful connections with people who share your values and interests.",
      color: "from-red-50 to-pink-50",
    },
    {
      icon: <Shield className="w-16 h-16 text-green-500" />,
      title: "Safe & Secure",
      description: "Your privacy and security are our top priority. All profiles are verified for authenticity.",
      color: "from-green-50 to-emerald-50",
    },
    {
      icon: <Sparkles className="w-16 h-16 text-purple-500" />,
      title: "AI-Powered Matching",
      description: "Our advanced AI algorithm finds your most compatible matches based on deep compatibility analysis.",
      color: "from-purple-50 to-indigo-50",
    },
  ];

  const nextScreen = () => {
    if (currentScreen < screens.length - 1) {
      setCurrentScreen(currentScreen + 1);
    } else {
      onComplete();
    }
  };

  const skipToEnd = () => {
    onComplete();
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <div className="flex justify-between items-center p-4">
        <div className="flex space-x-2">
          {screens.map((_, index) => (
            <div
              key={index}
              className={`w-8 h-1 rounded-full transition-colors ${
                index <= currentScreen ? 'bg-primary' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
        <Button variant="ghost" onClick={skipToEnd} className="text-muted-foreground">
          Skip
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentScreen}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.5 }}
            className="text-center max-w-md"
          >
            <Card className={`bg-gradient-to-br ${screens[currentScreen].color} border-0 mb-8`}>
              <CardContent className="p-8">
                <div className="mb-6 flex justify-center">
                  {screens[currentScreen].icon}
                </div>
                <h2 className="text-2xl text-foreground mb-4">
                  {screens[currentScreen].title}
                </h2>
                <p className="text-muted-foreground leading-relaxed">
                  {screens[currentScreen].description}
                </p>
              </CardContent>
            </Card>
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="p-6">
        <Button
          onClick={nextScreen}
          className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-4 hover-scale tap-scale"
          size="lg"
        >
          {currentScreen === screens.length - 1 ? (
            "Get Started"
          ) : (
            <>
              Continue
              <ChevronRight className="w-5 h-5 ml-2" />
            </>
          )}
        </Button>
      </div>
    </div>
  );
}