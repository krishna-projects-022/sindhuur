import { useState } from "react";
import { motion } from "motion/react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import DiscoverTab from "./DiscoverTab";
import MatchesTab from "./MatchesTab";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

interface MatchesScreenProps {
  user: any;
  onNavigate: (screen: string, data?: any) => void;
  onBack: () => void;
  onConnect?: (profile: any) => void;
  onLike?: (profile: any) => void;
  onSuperLike?: (profile: any) => void;
}

export default function MatchesScreen({ user, onNavigate, onBack, onConnect, onLike, onSuperLike }: MatchesScreenProps) {
  const [activeTab, setActiveTab] = useState("discover");

  return (
    <div className="min-h-screen bg-background">
      <ToastContainer />
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-40 bg-white/90 backdrop-blur-sm border-b border-border/50"
      >
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center space-x-3">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={onBack} 
              className="hover-scale btn-text-center"
            >
              Back
            </Button>
            <h1 className="text-xl text-foreground">Discover</h1>
          </div>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => onNavigate("search")}
            className="hover-scale btn-text-center"
          >
            Filter
          </Button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-border/50">
          <Button
            variant="ghost"
            className={`flex-1 py-3 rounded-none border-b-2 transition-colors btn-text-center ${
              activeTab === "discover" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground"
            }`}
            onClick={() => setActiveTab("discover")}
          >
            Discover
          </Button>
          <Button
            variant="ghost"
            className={`flex-1 py-3 rounded-none border-b-2 transition-colors relative btn-text-center ${
              activeTab === "matches" 
                ? "border-primary text-primary" 
                : "border-transparent text-muted-foreground"
            }`}
            onClick={() => setActiveTab("matches")}
          >
            Matches
           
          </Button>
        </div>
      </motion.div>

      {/* Content */}
      <div className="pb-nav">
        {activeTab === "discover" && (
          <DiscoverTab
            user={user}
            onNavigate={onNavigate}
            onLike={onLike}
            onSuperLike={onSuperLike}
          />
        )}
        {activeTab === "matches" && (
          <MatchesTab
            user={user}
            onNavigate={onNavigate}
            onConnect={onConnect}
          />
        )}
      </div>
    </div>
  );
}