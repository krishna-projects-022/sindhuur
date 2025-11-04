import { motion } from "motion/react";
import { ArrowLeft, Search, MessageCircle, HelpCircle, Book, Phone, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Input } from "./ui/input";

interface HelpCenterScreenProps {
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export default function HelpCenterScreen({ onNavigate, onBack }: HelpCenterScreenProps) {
  const helpCategories = [
    {
      id: "faq",
      title: "Frequently Asked Questions",
      description: "Find answers to common questions",
      icon: <HelpCircle className="w-5 h-5 text-blue-500" />,
      action: () => onNavigate("faq"),
    },
    {
      id: "support",
      title: "Contact Support",
      description: "Get personalized help from our team",
      icon: <MessageCircle className="w-5 h-5 text-green-500" />,
      action: () => onNavigate("support"),
    },
    {
      id: "guides",
      title: "User Guides",
      description: "Learn how to use all features",
      icon: <Book className="w-5 h-5 text-purple-500" />,
      action: () => {},
    },
    {
      id: "emergency",
      title: "Emergency Help",
      description: "Report safety concerns",
      icon: <Phone className="w-5 h-5 text-red-500" />,
      action: () => {},
    },
  ];

  const quickHelp = [
    "How to create an attractive profile",
    "Understanding compatibility scores",
    "Managing your privacy settings",
    "Reporting inappropriate behavior",
    "Premium subscription benefits",
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
            <h1 className="text-xl text-foreground">Help Center</h1>
          </div>
        </div>
      </motion.div>

      <div className="p-4 pb-6 space-y-6">
        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search for help..."
            className="pl-10 bg-input-background border-border"
          />
        </motion.div>

        {/* Help Categories */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="space-y-3"
        >
          <h2 className="text-lg text-foreground">How can we help?</h2>
          {helpCategories.map((category, index) => (
            <motion.div
              key={category.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 + 0.3 }}
            >
              <Card 
                className="cursor-pointer hover-scale tap-scale"
                onClick={category.action}
              >
                <CardContent className="p-4 flex items-center space-x-4">
                  <div className="p-3 bg-gray-100 rounded-lg">
                    {category.icon}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-base">{category.title}</h4>
                    <p className="text-sm text-muted-foreground">{category.description}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>

        {/* Quick Help */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-3"
        >
          <h2 className="text-lg text-foreground">Popular Topics</h2>
          <Card>
            <CardContent className="p-4 space-y-3">
              {quickHelp.map((topic, index) => (
                <div 
                  key={index} 
                  className="flex items-center justify-between py-2 border-b border-border last:border-b-0 cursor-pointer hover:bg-gray-50 rounded px-2 -mx-2"
                >
                  <span className="text-sm text-foreground">{topic}</span>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </div>
              ))}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}