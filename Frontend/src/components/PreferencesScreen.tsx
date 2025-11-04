import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Save, Heart, MapPin, Cake, Users } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Label } from "./ui/label";
import { Slider } from "./ui/slider";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Switch } from "./ui/switch";

interface PreferencesScreenProps {
  user: any;
  onBack: () => void;
}

export default function PreferencesScreen({ user, onBack }: PreferencesScreenProps) {
  const [preferences, setPreferences] = useState({
    ageRange: [25, 35],
    maxDistance: 50,
    education: "",
    religion: "",
    smoking: false,
    drinking: false,
    verified: true,
  });

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
            <h1 className="text-xl text-foreground">Preferences</h1>
          </div>
          <Button className="bg-primary hover:bg-primary/90 hover-scale">
            <Save className="w-4 h-4 mr-2" />
            Save
          </Button>
        </div>
      </motion.div>

      <div className="p-4 pb-6 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Heart className="w-5 h-5 text-primary" />
              <span>Basic Preferences</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              <Label>Age Range: {preferences.ageRange[0]} - {preferences.ageRange[1]}</Label>
              <Slider
                value={preferences.ageRange}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, ageRange: value }))}
                min={18}
                max={65}
                step={1}
                className="w-full"
              />
            </div>
            
            <div className="space-y-3">
              <Label>Maximum Distance: {preferences.maxDistance} km</Label>
              <Slider
                value={[preferences.maxDistance]}
                onValueChange={(value) => setPreferences(prev => ({ ...prev, maxDistance: value[0] }))}
                min={5}
                max={100}
                step={5}
                className="w-full"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifestyle Preferences</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Verified Profiles Only</Label>
                <p className="text-sm text-muted-foreground">Show only verified members</p>
              </div>
              <Switch
                checked={preferences.verified}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, verified: checked }))}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label>Non-smokers Only</Label>
                <p className="text-sm text-muted-foreground">Exclude smoking profiles</p>
              </div>
              <Switch
                checked={preferences.smoking}
                onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, smoking: checked }))}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}