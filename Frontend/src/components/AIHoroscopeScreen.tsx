import { motion } from "motion/react";
import { ArrowLeft, Sparkles, Heart, Star, Crown } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { Progress } from "./ui/progress";
import { useLocation, useNavigate } from "react-router-dom";

interface AIHoroscopeScreenProps {
  onNavigate: (screen: string, data?: any) => void;
  user: any;
  onBack: () => void;
}

export default function AIHoroscopeScreen({ user, onNavigate,onBack }: AIHoroscopeScreenProps) {
  const navigate = useNavigate();
  const horoscopeData = {
    sign: "Leo",
    compatibility: 87,
    insights: [
      "You're naturally charismatic and attract people with your confidence",
      "Your ideal partner appreciates your generous and warm nature", 
      "This week brings exciting romantic opportunities"
    ],
    matches: [
      { sign: "Sagittarius", percentage: 95 },
      { sign: "Aries", percentage: 89 },
      { sign: "Gemini", percentage: 82 },
    ]
  };

  return (
    <div className="min-h-screen bg-background">
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
            <h1 className="text-xl text-foreground">AI Horoscope</h1>
          </div>
          <Badge className="bg-primary text-white" onClick={() => navigate("/premium")}>
            <Crown className="w-3 h-3 mr-1" />
            Premium
          </Badge>
        </div>
      </motion.div>

      <div className="p-4 pb-6 space-y-6">
        <Card className="bg-gradient-to-br from-purple-50 to-pink-50 border-purple-200">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center mb-4">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <CardTitle className="text-xl text-purple-900">Your Sign: {horoscopeData.sign}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="text-2xl text-purple-600 mb-1">{horoscopeData.compatibility}%</div>
              <div className="text-sm text-purple-700">Overall Compatibility Score</div>
            </div>
            <Progress value={horoscopeData.compatibility} className="h-3" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Star className="w-5 h-5 text-yellow-500" />
              <span>AI Insights</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {horoscopeData.insights.map((insight, index) => (
              <div key={index} className="flex items-start space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full mt-2 flex-shrink-0"></div>
                <p className="text-sm text-foreground">{insight}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <span>Best Matches</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {horoscopeData.matches.map((match, index) => (
              <div key={index} className="flex items-center justify-between">
                <span className="text-sm">{match.sign}</span>
                <div className="flex items-center space-x-2">
                  <Progress value={match.percentage} className="w-20 h-2" />
                  <span className="text-sm text-primary">{match.percentage}%</span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}