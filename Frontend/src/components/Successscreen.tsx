import { useEffect, useState } from "react";
import { motion } from "motion/react";
import { useNavigate } from "react-router-dom";
import founderImage from "../assets/founder.png"; 

export default function SuccessScreen() {
  const navigate = useNavigate();
  const [userName, setUserName] = useState('');

  // Get username from localStorage on component mount
  useEffect(() => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      try {
        const userData = JSON.parse(loggedInUser);
        console.log("User data in SuccessScreen:", userData);
        if (userData && userData.name) {
          setUserName(userData.name);
        } else if (userData && userData.personalInfo && userData.personalInfo.name) {
          setUserName(userData.personalInfo.name);
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }
    } else {
      console.log("No user data found in localStorage");
    }
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => {
      const loggedInUser = localStorage.getItem("loggedInUser");
      if (loggedInUser) {
        navigate("/home");
      } else {
        navigate("/login");
      }
    }, 500000);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleStartJourney = () => {
    const loggedInUser = localStorage.getItem("loggedInUser");
    if (loggedInUser) {
      navigate("/home");
    } else {
      navigate("/login");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 via-white to-yellow-100 flex flex-col px-6 py-6 relative overflow-hidden">
      {/* Animated background elements like original */}
      <div className="absolute inset-0">
        <motion.div
          className="absolute top-10 left-6 w-24 h-24 bg-yellow-200 rounded-full"
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3],
          }}
          transition={{
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
        <motion.div
          className="absolute bottom-20 right-8 w-20 h-20 bg-yellow-300 rounded-full"
          animate={{
            scale: [1.2, 1, 1.2],
            opacity: [0.4, 0.8, 0.4],
          }}
          transition={{
            duration: 2.5,
            repeat: Infinity,
            ease: "easeInOut",
            delay: 1,
          }}
        />
      </div>

      {/* Main content container */}
      <div className="flex flex-col items-center justify-start space-y-6 z-10 mt-4 flex-1">
        {/* Welcome Message with animations */}
        <motion.div
          className="text-center space-y-3 w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <motion.h1 
            className="text-2xl font-bold text-yellow-700 tracking-wide"
            animate={{
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 2,
            }}
          >
            {userName ? `Welcome ${userName}` : 'Welcome to Sindhuura'}
          </motion.h1>
          <motion.p 
            className="text-yellow-600 text-sm px-2 leading-relaxed font-medium"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{
              delay: 1.2,
              duration: 0.6,
            }}
          >
            Here is the Sindhuura that has helped millions find their Match.
          </motion.p>
        </motion.div>

        {/* Steps Flow with better styling */}
        <motion.div 
          className="w-full space-y-4  relative"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.6 }}
        >
          {/* Connecting dotted line */}
          <div className="absolute left-6 top-12 bottom-12 w-0.5 border-l-2 border-dashed border-yellow-300 z-0"></div>
          
          {/* Step 1 */}
          <motion.div 
            className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-yellow-100 relative z-10"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">✉️</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm">Send at least 2 Connects every day</h3>
              <p className="text-gray-600 text-xs mt-1">Increase your chances by staying active</p>
            </div>
          </motion.div>

          {/* Step 2 */}
          <motion.div 
            className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-yellow-100 relative z-10"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7, duration: 0.5 }}
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-orange-400 to-orange-600 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">💬</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm">Respond promptly to Requests</h3>
              <p className="text-gray-600 text-xs mt-1">Don't keep your matches waiting</p>
            </div>
          </motion.div>

          {/* Step 3 */}
          <motion.div 
            className="flex items-start space-x-3 bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-yellow-100 relative z-10"
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.9, duration: 0.5 }}
          >
            <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-amber-500 to-amber-700 rounded-full flex items-center justify-center shadow-lg">
              <span className="text-white text-lg">👤</span>
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-gray-800 text-sm">Keep your Profile & Photo updated</h3>
              <p className="text-gray-600 text-xs mt-1">Show your best self to potential matches</p>
            </div>
          </motion.div>
        </motion.div>

        {/* Founder Message */}
        <motion.div 
          className="text-center space-y-3  w-full"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1.1, duration: 0.6 }}
        >
          <p className="text-yellow-700 font-medium text-sm">Best wishes,</p>
          <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl shadow-lg border border-yellow-100 flex flex-col items-center">
            {/* Founder Image */}
            <motion.img
              src={founderImage}
              alt="Founder"
              className="w-16 h-16 rounded-full object-cover border-2 border-yellow-300 mb-2 shadow-md"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 1.3, type: "spring", stiffness: 200 }}
            />
            <h3 className="font-bold text-gray-800 text-base">Nethra Soranagi</h3>
            <p className="text-gray-600 text-xs">Founder and CEO of Sindhuura.com</p>
          </div>
        </motion.div>

        {/* Get Started Button */}
        <motion.div 
          className="w-full mt-6"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 1.3, duration: 0.5 }}
        >
          <motion.button
            onClick={handleStartJourney}
            className="w-full bg-gradient-to-r from-yellow-400 to-yellow-600 hover:from-yellow-500 hover:to-yellow-700 text-white font-semibold py-3 px-6 rounded-lg shadow-lg transition-all duration-300 text-sm"
            whileHover={{
              scale: 1.02,
              boxShadow: "0 10px 25px -5px rgba(180, 83, 9, 0.4)",
            }}
            whileTap={{
              scale: 0.98,
            }}
          >
            Get Started
          </motion.button>
        </motion.div>

        {/* Privacy Notice */}
        {/* <motion.div 
          className="text-center mt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 0.5 }}
        >
          <p className="text-xs text-yellow-600 underline">
            Check or Update Your Privacy Settings
          </p>
        </motion.div> */}

        {/* Auto-redirect notice */}
        <motion.div
          className="text-center mt-3"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.7, duration: 0.5 }}
        >
          <p className="text-xs text-yellow-600">
            {userName 
              ? `Taking you home in 5 seconds, ${userName.split(' ')[0]}...`
              : "Redirecting to home in 5 seconds..."
            }
          </p>
        </motion.div>
      </div>

      {/* Bottom decorative text */}
      {/* <motion.div
        className="absolute bottom-4 left-0 right-0 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{
          delay: 2.5,
          duration: 0.8,
        }}
      >
        <p className="text-xs text-yellow-600">
          Your journey to finding love begins now
        </p>
      </motion.div> */}
    </div>
  );
}