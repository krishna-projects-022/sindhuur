import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Shield, Bell, Eye, LogOut, ChevronRight } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import { Switch } from "./ui/switch";
import { Label } from "./ui/label";

interface SettingsScreenProps {
  user: any;
  onNavigate: (screen: string) => void;
  onBack: () => void;
}

export default function SettingsScreen({ user, onNavigate, onBack }: SettingsScreenProps) {
  const [settings, setSettings] = useState({
    notifications: true,
    emailNotifications: false,
    showOnline: true,
    readReceipts: true,
  });

  const settingsGroups = [
    {
      title: "Privacy",
      icon: <Shield className="w-5 h-5 text-blue-500" />,
      items: [
        { key: "showOnline", label: "Show Online Status", description: "Let others see when you're online" },
        { key: "readReceipts", label: "Read Receipts", description: "Show when you've read messages" },
      ]
    },
    {
      title: "Notifications", 
      icon: <Bell className="w-5 h-5 text-green-500" />,
      items: [
        { key: "notifications", label: "Push Notifications", description: "Receive notifications on your device" },
        { key: "emailNotifications", label: "Email Notifications", description: "Receive updates via email" },
      ]
    }
  ];

  const handleSignOut = () => {
    localStorage.clear(); // Clear all local storage data
    onNavigate("login"); // Navigate to login screen
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
            <h1 className="text-xl text-foreground">Settings</h1>
          </div>
        </div>
      </motion.div>

      <div className="p-4 pb-6 space-y-6">
        {settingsGroups.map((group, groupIndex) => (
          <motion.div
            key={group.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: groupIndex * 0.1 }}
          >
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2 mb-4">
                  {group.icon}
                  <h3 className="text-base">{group.title}</h3>
                </div>
                <div className="space-y-4">
                  {group.items.map((item) => (
                    <div key={item.key} className="flex items-center justify-between">
                      <div className="flex-1">
                        <Label className="text-sm">{item.label}</Label>
                        <p className="text-xs text-muted-foreground">{item.description}</p>
                      </div>
                      <Switch
                        checked={settings[item.key as keyof typeof settings]}
                        onCheckedChange={(checked) => 
                          setSettings(prev => ({ ...prev, [item.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card 
            className="cursor-pointer hover-scale tap-scale border-red-200"
            onClick={handleSignOut} // Updated to use handleSignOut
          >
            <CardContent className="p-4 flex items-center space-x-4">
              <div className="p-3 bg-red-100 rounded-lg">
                <LogOut className="w-5 h-5 text-red-600" />
              </div>
              <div className="flex-1">
                <h4 className="text-base text-red-600">Sign Out</h4>
                <p className="text-sm text-red-500">Sign out of your account</p>
              </div>
              <ChevronRight className="w-5 h-5 text-red-400" />
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}