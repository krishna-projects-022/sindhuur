import { motion } from "motion/react";
import { ChevronRight } from "lucide-react";
import { Card, CardContent } from "../ui/card";
import { Badge } from "../ui/badge";

interface ProfileMenuItemProps {
  item: any;
  index: number;
  onNavigate: (screen: string) => void;
}

export default function ProfileMenuItem({ item, index, onNavigate }: ProfileMenuItemProps) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.1 + 0.3 }}
    >
      <Card 
        className="cursor-pointer hover-scale tap-scale"
        onClick={() => onNavigate(item.screen)}
      >
        <CardContent className="p-4 flex items-center space-x-4">
          <div className="p-3 bg-gray-100 rounded-lg">
            <item.icon className={`w-5 h-5 ${item.iconColor}`} />
          </div>
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h4 className="text-base">{item.title}</h4>
              {item.badge && (
                <Badge className="bg-primary text-white text-xs">
                  {item.badge}
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{item.description}</p>
          </div>
          <ChevronRight className="w-5 h-5 text-muted-foreground" />
        </CardContent>
      </Card>
    </motion.div>
  );
}