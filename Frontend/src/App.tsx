import React, { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes, useNavigate, useLocation } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "./context/AuthContext";
import PrivateRoute from "./components/PrivateRoute";
import BottomNavigation from "./components/BottomNavigation";
import { useToast } from "./components/hooks/use-toast";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Page Components
import SplashScreen from "./components/SplashScreen";
import OnboardingScreens from "./components/OnboardingScreens";
import LoginScreen from "./components/LoginScreen";
import SignupScreen from "./components/SignupScreen";
import ForgotPasswordScreen from "./components/ForgotPasswordScreen";
import OTPScreen from "./components/OTPScreen";
import HomeScreen from "./components/HomeScreen";
import ProfileScreen from "./components/ProfileScreen";
import MyProfileScreen from "./components/MyProfileScreen";
import EditProfileScreen from "./components/EditProfileScreen";
import PhotoManagementScreen from "./components/PhotoManagementScreen";
import PreferencesScreen from "./components/PreferencesScreen";
import AIHoroscopeScreen from "./components/AIHoroscopeScreen";
import SettingsScreen from "./components/SettingsScreen";
import MatchesScreen from "./components/MatchesScreen";
import ProfileDetailScreen from "./components/ProfileDetailScreen";
import SearchScreen from "./components/SearchScreen";
import MessagesScreen from "./components/MessagesScreen";
import ChatScreen from "./components/ChatScreen";
import NotificationsScreen from "./components/NotificationsScreen";
import NoticePage from "./components/NoticePage";
import PremiumScreen from "./components/PremiumScreen";
import PricingScreen from "./components/PricingScreen";
import CheckoutScreen from "./components/CheckoutScreen";
import MoreScreen from "./components/MoreScreen";
import HelpCenterScreen from "./components/HelpCenterScreen";
import FAQScreen from "./components/FAQScreen";
import SupportScreen from "./components/SupportScreen";
import VIPPremiumScreen from "./components/VIPPremiumScreen";
import EventsScreen from "./components/EventsScreen";
import AdminLayout from "./components/layout/AdminLayout";
import AdminDashboard from "./components/admin/Dashboard";
import UserManagement from "./components/admin/UserManagement";
import ProfileManagement from "./components/admin/ProfileManagement";
import AdminEvents from "./components/admin/Events";
import Reports from "./components/admin/Reports";
import Tickets from "./components/admin/Tickets";
import Profile from "./components/admin/Profile";
import Payment from "./components/Payment";
import SuccessScreen from "./components/Successscreen"
import BlogsScreen from "./components/BlogsScreen";
import AdminBlogs from  "./components/admin/Blogs";
import BlogDetailScreen from "./components/BlogDetailScreen";

const NavigationWrapper: React.FC<{
  children: (props: {
    navigate: (path: string, state?: any) => void;
    user: any;
    setUser: React.Dispatch<React.SetStateAction<any>>;
    selectedProfile: any;
    setSelectedProfile: React.Dispatch<React.SetStateAction<any>>;
    selectedPlan: any;
    setSelectedPlan: React.Dispatch<React.SetStateAction<any>>;
    selectedEvent: any;
    setSelectedEvent: React.Dispatch<React.SetStateAction<any>>;
    selectedBlog: any; // ADD THIS
    setSelectedBlog: React.Dispatch<React.SetStateAction<any>>; // ADD THIS
    chatData: any;
    setChatData: React.Dispatch<React.SetStateAction<any>>;
    otpData: any;
    setOtpData: React.Dispatch<React.SetStateAction<any>>;
  }) => JSX.Element;
}> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();

  const [user, setUser] = useState<any>(() => {
    const storedUser = localStorage.getItem("loggedInUser");
    return storedUser
      ? JSON.parse(storedUser)
      : {
          name: "John Doe",
          subscription: { current: "free" },
          email: "john@example.com",
          phone: "+1234567890",
          profilePicture: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=100",
          profileId: null,
        };
  });

  const [otpData, setOtpData] = useState<{ phone?: string; email?: string; type?: string }>({});
  const [selectedProfile, setSelectedProfile] = useState<any>(null);
  const [selectedPlan, setSelectedPlan] = useState<any>(null);
  const [selectedEvent, setSelectedEvent] = useState<any>(null);
  const [selectedBlog, setSelectedBlog] = useState<any>(null); // ADD THIS
  const [chatData, setChatData] = useState<any>(null);

  useEffect(() => {
    console.log("App.tsx - Current location:", location.pathname, "state:", location.state);

    if (location.pathname === "/chat") {
      const chatUser = location.state?.chatUser || location.state?.state?.chatUser;
      console.log("App.tsx - Extracted chatUser:", chatUser);

      if (chatUser?.id) {
        console.log("App.tsx - Setting chatData:", chatUser);
        setChatData(chatUser);
      } else {
        console.warn("App.tsx - Invalid chatUser in location.state:", location.state);
        toast({
          title: "Error",
          description: "No valid user selected for chat. Redirecting to messages.",
          variant: "destructive",
        });
        navigate("/messages");
      }
    } else if (chatData && location.pathname !== "/chat") {
      console.log("App.tsx - Clearing chatData for non-chat route");
      setChatData(null);
    }
  }, [location.pathname, location.state, navigate, toast]);

  useEffect(() => {
    console.log("App.tsx - chatData changed:", chatData);
  }, [chatData]);

  return children({
    navigate: (path, state) => navigate(path, { state }),
    user,
    setUser,
    selectedProfile,
    setSelectedProfile,
    selectedPlan,
    setSelectedPlan,
    selectedEvent,
    setSelectedEvent,
    selectedBlog, // ADD THIS
    setSelectedBlog, // ADD THIS
    chatData,
    setChatData,
    otpData,
    setOtpData,
  });
};

const queryClient = new QueryClient();

const App = () => {
  const navBarRoutes = [
    "/home",
    "/blogs",
    "/blogdetails",
    "/matches",
    "/messages",
    "/profile",
    "/notifications",
    "/more",
    "/events",
    "/settings",
    "/my-profile",
    "/edit-profile",
    "/photo-management",
    "/preferences",
    "/ai-horoscope",
    "/search",
    // Remove "/chat" to prevent BottomNavigation overlap
    "/notice",
    "/premium",
    "/pricing",
    "/checkout",
    "/help-center",
    "/faq",
    "/support",
    "/vip-premium",
    "/event-detail",
    "/create-event",
    "/video-call",
    "/interests",
    "/safety",
    "/account",
    "/subscription",
    "/feedback",
  ];

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <BrowserRouter>
          <ToastContainer position="top-right" autoClose={5000} />
            <NavigationWrapper>
              {({
                navigate,
                user,
                setUser,
                selectedProfile,
                setSelectedProfile,
                selectedPlan,
                setSelectedPlan,
                selectedEvent,
                setSelectedEvent,
                chatData,
                setChatData,
                otpData,
                setOtpData,
              }) => (
                <>
                  <Routes>
                    {/* Public Routes */}
                    <Route
                      path="/"
                      element={<SplashScreen onComplete={() => setTimeout(() => navigate("/onboarding"), 3000)} />}
                    />
                    <Route path="/successscreen" element={<SuccessScreen />} />
                    <Route path="/onboarding" element={<OnboardingScreens onComplete={() => navigate("/login")} />} />
                    <Route
                      path="/signup"
                      element={
                        <SignupScreen
                          onSignupSuccess={(userData) => {
                            const updatedUser = { ...user, ...userData };
                            setUser(updatedUser);
                            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
                            navigate("/home");
                          }}
                          onNavigateToLogin={() => navigate("/successscreen")}
                          onSendOTP={(data) => {
                            setOtpData(data);
                            navigate("/otp", { state: data });
                          }}
                        />
                      }
                    />
                    <Route
                      path="/login"
                      element={
                        <LoginScreen
                          onLoginSuccess={(userData) => {
                            const updatedUser = { ...user, ...userData };
                            setUser(updatedUser);
                            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
                            navigate("/home");
                          }}
                          onNavigateToSignup={() => navigate("/signup")}
                          onNavigateToForgotPassword={() => navigate("/forgot-password")}
                          onSendOTP={(data) => {
                            setOtpData(data);
                            navigate("/otp", { state: data });
                          }}
                        />
                      }
                    />
                    <Route
                      path="/forgot-password"
                      element={
                        <ForgotPasswordScreen
                          onSendOTP={(data) => {
                            setOtpData(data);
                            navigate("/otp", { state: data });
                          }}
                          onBack={() => navigate("/login")}
                        />
                      }
                    />
                    <Route
                      path="/otp"
                      element={
                        <OTPScreen
                          phone={otpData.phone}
                          email={otpData.email}
                          type={otpData.type}
                          onVerifySuccess={(userData) => {
                            const updatedUser = {
                              ...user,
                              ...userData,
                              email: userData.email || user.email,
                              phone: userData.phone || user.phone,
                            };
                            setUser(updatedUser);
                            localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));
                            navigate("/signup", {
                              state: {
                                step: 5,
                                otpVerified: true,
                                email: userData.email || otpData.email,
                                phone: userData.phone || otpData.phone,
                              },
                            });
                          }}
                          onBack={() => navigate(otpData.type === "forgot-password" ? "/forgot-password" : "/signup")}
                        />
                      }
                    />
                    <Route
                      path="/terms"
                      element={
                        <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                          <div className="text-center">
                            <h2 className="text-2xl mb-4">Terms & Conditions</h2>
                            <p className="text-muted-foreground mb-6">Terms and conditions coming soon...</p>
                            <button
                              onClick={() => navigate("/home")}
                              className="bg-primary text-white px-6 py-2 rounded-lg"
                            >
                              Back to Home
                            </button>
                          </div>
                        </div>
                      }
                    />
                    <Route
                      path="/about"
                      element={
                        <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                          <div className="text-center">
                            <h2 className="text-2xl mb-4">About Us</h2>
                            <p className="text-muted-foreground mb-6">About page coming soon...</p>
                            <button
                              onClick={() => navigate("/home")}
                              className="bg-primary text-white px-6 py-2 rounded-lg"
                            >
                              Back to Home
                            </button>
                          </div>
                        </div>
                      }
                    />
                    <Route
                      path="/success-stories"
                      element={
                        <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                          <div className="text-center">
                            <h2 className="text-2xl mb-4">Success Stories</h2>
                            <p className="text-muted-foreground mb-6">Success stories coming soon...</p>
                            <button
                              onClick={() => navigate("/home")}
                              className="bg-primary text-white px-6 py-2 rounded-lg"
                            >
                              Back to Home
                            </button>
                          </div>
                        </div>
                      }
                    />
                    <Route
                      path="/privacy"
                      element={
                        <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                          <div className="text-center">
                            <h2 className="text-2xl mb-4">Privacy Settings</h2>
                            <p className="text-muted-foreground mb-6">Privacy controls coming soon...</p>
                            <button
                              onClick={() => navigate("/settings")}
                              className="bg-primary text-white px-6 py-2 rounded-lg"
                            >
                              Back to Settings
                            </button>
                          </div>
                        </div>
                      }
                    />
                    <Route
                      path="/home"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <HomeScreen
                            user={user}
                            onNavigate={(screen, data) => {
                              if (screen === "profile-detail") {
                                setSelectedProfile(data);
                              } else if (screen === "chat") {
                                setChatData(data);
                                navigate("/chat", { state: { chatUser: data } });
                              }
                              navigate(`/${screen}`, { state: data });
                            }}
                            onConnect={(profile) => {
                              setChatData(profile);
                              navigate("/chat", { state: { chatUser: profile } });
                            }}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/matches"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <MatchesScreen
                            user={user}
                            onNavigate={(screen, data) => {
                              if (screen === "profile-detail") {
                                setSelectedProfile(data);
                              }
                              navigate(`/${screen}`, { state: data });
                            }}
                            onBack={() => navigate("/home")}
                            onConnect={(profile) => {
                              setChatData(profile);
                              navigate("/chat", { state: { chatUser: profile } });
                            }}
                            onLike={(profile) => console.log("Liked profile:", profile.name)}
                            onSuperLike={(profile) =>
                              user?.accountType === "Premium"
                                ? console.log("Super liked profile:", profile.name)
                                : navigate("/premium")
                            }
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/messages"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <MessagesScreen
                            onNavigate={(screen, data) => {
                              if (screen === "chat") {
                                setChatData(data);
                                navigate("/chat", { state: { chatUser: data } });
                              } else {
                                navigate(`/${screen}`, { state: data });
                              }
                            }}
                            onBack={() => navigate("/home")}
                          />
                        </PrivateRoute>
                      }
                    />
<Route
  path="/chat"
  element={
    <PrivateRoute allowedRoles={["user"]}>
      <ChatScreen
        chatUser={chatData}
        onBack={() => navigate("/messages")}
        onVideoCall={() => navigate("/video-call")}
        onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
      />
    </PrivateRoute>
  }
/>
                    <Route
                      path="/notifications"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <NotificationsScreen
                            user={user}
                            onBack={() => navigate("/home")}
                            onNavigate={(screen, data) => {
                              if (screen === "profile-detail") {
                                setSelectedProfile(data);
                              } else if (screen === "chat") {
                                setChatData(data);
                                navigate("/chat", { state: { chatUser: data } });
                              }
                              navigate(`/${screen}`, { state: data });
                            }}
                            onConnect={(profile) => {
                              setChatData(profile);
                              navigate("/chat", { state: { chatUser: profile } });
                            }}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/profile"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <ProfileScreen
                            user={user}
                            onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
                            onBack={() => navigate("/home")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/my-profile"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <MyProfileScreen
                            user={user}
                            onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
                            onBack={() => navigate("/home")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/edit-profile"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <EditProfileScreen
                            user={user}
                            onSave={(updatedUser) => {
                              const newUser = { ...user, ...updatedUser };
                              setUser(newUser);
                              localStorage.setItem("loggedInUser", JSON.stringify(newUser));
                              navigate("/my-profile");
                            }}
                            onBack={() => navigate("/my-profile")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/photo-management"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <PhotoManagementScreen
                            user={user}
                            onSave={(updatedUser) => {
                              const newUser = { ...user, ...updatedUser };
                              setUser(newUser);
                              localStorage.setItem("loggedInUser", JSON.stringify(newUser));
                              navigate("/my-profile");
                            }}
                            onBack={() => navigate("/my-profile")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/preferences"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <PreferencesScreen
                            user={user}
                            onSave={(updatedUser) => {
                              const newUser = { ...user, ...updatedUser };
                              setUser(newUser);
                              localStorage.setItem("loggedInUser", JSON.stringify(newUser));
                              navigate("/my-profile");
                            }}
                            onBack={() => navigate("/my-profile")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/ai-horoscope"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <AIHoroscopeScreen
                            user={user}
                            onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
                            onBack={() => navigate("/my-profile")}
                          />
                          
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/settings"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <SettingsScreen
                            user={user}
                            onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
                            onBack={() => navigate("/my-profile")}
                          />
                        </PrivateRoute>
                      }
                    />
<Route
  path="/profile-detail"
  element={
    <PrivateRoute allowedRoles={["user"]}>
      <ProfileDetailScreen
        profile={selectedProfile}
        onBack={() => navigate(-1)} // Better back navigation
        onNavigate={(screen, data) => {
          if (screen === "chat") {
            setChatData(data);
            navigate("/chat", { state: { chatUser: data } });
          } else {
            navigate(`/${screen}`, { state: data });
          }
        }}
      />
    </PrivateRoute>
  }
/>
                    <Route
                      path="/search"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <SearchScreen
                            user={user}
                            onNavigate={(screen, data) => {
                              if (screen === "profile-detail") {
                                setSelectedProfile(data);
                              }
                              navigate(`/${screen}`, { state: data });
                            }}
                            onBack={() => navigate("/home")}
                            onConnect={(profile) => {
                              setChatData(profile);
                              navigate("/chat", { state: { chatUser: profile } });
                            }}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/notice"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <NoticePage
                            user={user}
                            onBack={() => navigate("/home")}
                            onNavigate={(screen, data) => {
                              if (screen === "profile-detail") {
                                setSelectedProfile(data);
                              } else if (screen === "chat") {
                                setChatData(data);
                                navigate("/chat", { state: { chatUser: data } });
                              }
                              navigate(`/${screen}`, { state: data });
                            }}
                            onConnect={(profile) => {
                              setChatData(profile);
                              navigate("/chat", { state: { chatUser: profile } });
                            }}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/premium"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <PremiumScreen
                            user={user}
                            onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
                            onBack={() => navigate("/home")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/payment"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <Payment
                            user={user}
                            onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
                            onBack={() => navigate("/payment")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/pricing"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <PricingScreen
                            user={user}
                            onNavigate={(screen, data) => {
                              if (screen === "checkout") {
                                setSelectedPlan(data);
                              }
                              navigate(`/${screen}`, { state: data });
                            }}
                            onBack={() => navigate("/premium")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/checkout"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <CheckoutScreen
                            plan={selectedPlan}
                            user={user}
                            onBack={() => navigate("/pricing")}
                            onComplete={(updatedUser) => {
                              const newUser = { ...user, ...updatedUser };
                              setUser(newUser);
                              localStorage.setItem("loggedInUser", JSON.stringify(newUser));
                              navigate("/home");
                            }}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/more"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <MoreScreen
                            user={user}
                            onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
                            onBack={() => navigate("/home")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/help-center"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <HelpCenterScreen
                            onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
                            onBack={() => navigate("/more")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/faq"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <FAQScreen onBack={() => navigate("/help-center")} />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/support"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <SupportScreen
                            user={user}
                            onBack={() => navigate("/help-center")}
                            onSubmit={(data) => {
                              console.log("Support request submitted:", data);
                              navigate("/help-center");
                            }}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/vip-premium"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <VIPPremiumScreen
                            onNavigate={(screen, data) => navigate(`/${screen}`, { state: data })}
                            onBack={() => navigate("/premium")}
                          />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/events"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <EventsScreen
                            onNavigate={(screen, data) => {
                              if (screen === "event-detail") {
                                setSelectedEvent(data);
                              }
                              navigate(`/${screen}`, { state: data });
                            }}
                            onBack={() => navigate("/home")}
                          />
                        </PrivateRoute>
                      }
                    />
           <Route
  path="/blogs"
  element={
    <PrivateRoute allowedRoles={["user"]}>
      <BlogsScreen
        onNavigate={(screen, data) => {
          // Remove the setSelectedBlog line since it's not defined
          navigate(`/${screen}`, { state: data });
        }}
        onBack={() => navigate("/home")}
      />
    </PrivateRoute>
  }
/>
<Route
  path="/blogdetails" // This matches what you're navigating to
  element={
    <PrivateRoute allowedRoles={["user"]}>
      <BlogDetailScreen /> {/* Fixed component name */}
    </PrivateRoute>
  }
/>
                    <Route
                      path="/event-detail"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                            <div className="text-center">
                              <h2 className="text-2xl mb-4">Event Details</h2>
                              <p className="text-muted-foreground mb-6">Event detail screen coming soon...</p>
                              <button
                                onClick={() => navigate("/events")}
                                className="bg-primary text-white px-6 py-2 rounded-lg"
                              >
                                Back to Events
                              </button>
                            </div>
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/create-event"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                            <div className="text-center">
                              <h2 className="text-2xl mb-4">Create Event</h2>
                              <p className="text-muted-foreground mb-6">Event creation screen coming soon...</p>
                              <button
                                onClick={() => navigate("/events")}
                                className="bg-primary text-white px-6 py-2 rounded-lg"
                              >
                                Back to Events
                              </button>
                            </div>
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/video-call"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <div className="min-h-screen bg-background flex items-center justify-center p-4">
                            <div className="text-center">
                              <h2 className="text-2xl mb-4">Video Call</h2>
                              <p className="text-muted-foreground mb-6">Video calling feature coming soon...</p>
                              <button
                                onClick={() => navigate("/messages")}
                                className="bg-primary text-white px-6 py-2 rounded-lg"
                              >
                                Back to Messages
                              </button>
                            </div>
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/interests"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                            <div className="text-center">
                              <h2 className="text-2xl mb-4">Interests</h2>
                              <p className="text-muted-foreground mb-6">Interests management coming soon...</p>
                              <button
                                onClick={() => navigate("/settings")}
                                className="bg-primary text-white px-6 py-2 rounded-lg"
                              >
                                Back to Settings
                              </button>
                            </div>
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/safety"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                            <div className="text-center">
                              <h2 className="text-2xl mb-4">Safety Center</h2>
                              <p className="text-muted-foreground mb-6">Safety guidelines and reporting tools...</p>
                              <button
                                onClick={() => navigate("/settings")}
                                className="bg-primary text-white px-6 py-2 rounded-lg"
                              >
                                Back to Settings
                              </button>
                            </div>
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/account"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                            <div className="text-center">
                              <h2 className="text-2xl mb-4">Account Settings</h2>
                              <p className="text-muted-foreground mb-6">Account management coming soon...</p>
                              <button
                                onClick={() => navigate("/settings")}
                                className="bg-primary text-white px-6 py-2 rounded-lg"
                              >
                                Back to Settings
                              </button>
                            </div>
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/subscription"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                            <div className="text-center">
                              <h2 className="text-2xl mb-4">Subscription Management</h2>
                              <p className="text-muted-foreground mb-6">Subscription details coming soon...</p>
                              <button
                                onClick={() => navigate("/settings")}
                                className="bg-primary text-white px-6 py-2 rounded-lg"
                              >
                                Back to Settings
                              </button>
                            </div>
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/feedback"
                      element={
                        <PrivateRoute allowedRoles={["user"]}>
                          <div className="min-h-screen bg-background flex items-center justify-center p-4 pb-20">
                            <div className="text-center">
                              <h2 className="text-2xl mb-4">Feedback</h2>
                              <p className="text-muted-foreground mb-6">Send us your feedback...</p>
                              <button
                                onClick={() => navigate("/more")}
                                className="bg-primary text-white px-6 py-2 rounded-lg"
                              >
                                Back to More
                              </button>
                            </div>
                          </div>
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin"
                      element={
                        <PrivateRoute allowedRoles={["admin"]}>
                          <AdminLayout />
                        </PrivateRoute>
                      }
                    >
                      <Route index element={<AdminDashboard />} />
                      <Route path="users" element={<UserManagement />} />
                      <Route path="profiles" element={<ProfileManagement />} />
                      <Route path="events" element={<AdminEvents />} />
                      <Route path="reports" element={<Reports />} />
                      <Route path="tickets" element={<Tickets />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="admin/blogs" element={<AdminBlogs />} />
                    </Route>
                    <Route
                      path="/admin/reports"
                      element={
                        <PrivateRoute allowedRoles={["admin"]}>
                          <Navigate to="/admin/reports" replace />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/tickets"
                      element={
                        <PrivateRoute allowedRoles={["admin"]}>
                          <Navigate to="/admin/tickets" replace />
                        </PrivateRoute>
                      }
                    />
                    <Route
                      path="/admin/settings"
                      element={
                        <PrivateRoute allowedRoles={["admin"]}>
                          <Navigate to="/admin/settings" replace />
                        </PrivateRoute>
                      }
                    />
                    <Route path="*" element={<Navigate to="/home" replace />} />
                  </Routes>
                  {navBarRoutes.includes(window.location.pathname) &&
                    !window.location.pathname.includes("profile-detail") &&
                    !window.location.pathname.includes("event-detail") &&
                    !window.location.pathname.includes("/admin") && (
                      <BottomNavigation
                        currentScreen={window.location.pathname.slice(1) || "home"}
                        onNavigate={(screen) => navigate(`/${screen}`)}
                      />
                    )}
                </>
              )}
            </NavigationWrapper>
          </BrowserRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;