import { motion } from "motion/react";
import { Card, CardContent } from "../ui/card";
import { PROFILE_STATS } from "../constants/profileConstants";

export default function ProfileStats() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="p-4"
    >
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-3 gap-4 text-center">
            {PROFILE_STATS.map((stat, index) => (
              <div key={stat.label}>
                <div className="p-2 bg-gray-100 rounded-lg w-fit mx-auto mb-2">
                  <stat.icon className={`w-5 h-5 ${stat.iconColor}`} />
                </div>
                <div className="text-lg text-primary">{stat.value}</div>
                <div className="text-xs text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}