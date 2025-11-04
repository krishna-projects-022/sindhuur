import { useState } from "react";
import { motion } from "motion/react";
import { Eye, EyeOff, Chrome } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { Separator } from "./ui/separator";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import logoImage from "../assets/logo.png";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface LoginScreenProps {
  onNavigateToSignup: () => void;
  onNavigateToForgotPassword: () => void;
  onSendOTP?: (data: { email: string; type: string }) => void;
}

export default function LoginScreen({
  onNavigateToSignup,
  onNavigateToForgotPassword,
  onSendOTP,
}: LoginScreenProps) {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showResend, setShowResend] = useState(false);
  const [errors, setErrors] = useState({});
  const { login } = useAuth();
  const navigate = useNavigate();

  const validateField = (field, value) => {
    switch (field) {
      case "email":
        if (!value) return "Please enter your email address";
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? ""
          : "Please enter a valid email address (e.g., user@example.com)";
      case "password":
        if (!value) return "Please enter your password";
        return value.length >= 6 ? "" : "Password must be at least 6 characters long";
      default:
        return "";
    }
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    const errorMessage = validateField(field, value);
    setErrors((prev) => ({ ...prev, [field]: errorMessage }));
  };

  const resendVerificationEmail = async () => {
    const emailError = validateField("email", formData.email);
    if (!emailError) {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/send-email-otp`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email: formData.email }),
        });
        const data = await response.json();
        if (response.ok) {
          setShowResend(false);
          toast.success(
            `${data.message}\nCheck backend console for OTP (development only).`,
            { autoClose: 7000 }
          );
          if (onSendOTP) {
            onSendOTP({ email: formData.email, type: "signup" });
          }
        } else {
          toast.error(data.error || "Failed to resend verification email", { autoClose: 5000 });
        }
      } catch (error) {
        toast.error("Failed to connect to server. Please try again.", { autoClose: 5000 });
      } finally {
        setIsLoading(false);
      }
    } else {
      setErrors((prev) => ({ ...prev, email: emailError }));
      toast.error(emailError, { autoClose: 5000 });
    }
  };

 const handleLogin = async (e) => {
  e.preventDefault();
  const newErrors = {
    email: validateField("email", formData.email),
    password: validateField("password", formData.password),
  };
  setErrors(newErrors);

  if (Object.values(newErrors).every((error) => !error)) {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });
      const data = await response.json();
      console.log("Login response:", data);

      if (data?.token) {
        login(data.token);
        const userDataWithToken = { ...data.user, token: data.token };
        localStorage.setItem("loggedInUser", JSON.stringify(userDataWithToken));
        toast.success(`Welcome   ${data.user.name}!`, { autoClose: 5000 });

        const isAdmin = data.user?.role === "admin" || data.user?.role === "moderator";
        setTimeout(() => {
          navigate(isAdmin ? "/admin" : "/home");
          setFormData({ email: "", password: "" });
          setShowResend(false);
        }, 300);
      } else {
        if (data?.error?.toLowerCase().includes("not verified")) {
          setShowResend(true);
          toast.error(
            "Your email is not verified. You can resend the verification email.",
            { autoClose: 7000 }
          );
        } else if (data?.error?.toLowerCase().includes("flagged")) {
          toast.error(data.error, { autoClose: 7000 });
        } else {
          toast.error(data.error || "Invalid email or password", { autoClose: 5000 });
        }
      }
    } catch (error) {
      console.error("Frontend error during login:", error.message);
      toast.error("Failed to connect to server. Please try again.", { autoClose: 5000 });
    } finally {
      setIsLoading(false);
    }
  } else {
    toast.error("Please fill in all required fields correctly.", { autoClose: 5000 });
  }
};

  // const handleGoogleLogin = () => {
  //   setIsLoading(true);
  //   setTimeout(() => {
  //     const userData = {
  //       id: "2",
  //       name: "Jane Smith",
  //       email: "jane@gmail.com",
  //       age: 26,
  //       profession: "Designer",
  //       location: "San Francisco, USA",
  //       verified: true,
  //       role: "user",
  //       subscription: { current: "" },
  //     };
  //     login("mock-google-token");
  //     localStorage.setItem("loggedInUser", JSON.stringify(userData));
  //     localStorage.setItem("token", "mock-google-token");
  //     toast.success("Google Login Successful!", { autoClose: 5000 });
  //     setTimeout(() => {
  //       navigate("/dashboard");
  //       setIsLoading(false);
  //     }, 300);
  //   }, 1500);
  // };

  const isFormValid = () => {
    return Object.values(errors).every((error) => !error) && formData.email && formData.password;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center space-y-4">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto w-16 h-16 flex items-center justify-center"
            >
              <img
                src={logoImage}
                alt="SoulMate Logo"
                className="w-full h-full object-contain"
              />
            </motion.div>
            <div>
              <CardTitle className="text-2xl text-primary">Welcome Back</CardTitle>
              <CardDescription className="text-muted-foreground">
                Sign in to continue your journey
              </CardDescription>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-input-background border-border"
                  disabled={isLoading}
                  required
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => handleInputChange("password", e.target.value)}
                    className="bg-input-background border-border pr-10"
                    disabled={isLoading}
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4 text-muted-foreground" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                  </Button>
                </div>
                {errors.password && (
                  <p className="text-red-500 text-xs mt-1">{errors.password}</p>
                )}
              </div>

              <div className="flex items-center justify-between">
                
                <Button
                  variant="link"
                  onClick={onNavigateToForgotPassword}
                  className="text-primary text-sm hover:underline p-0"
                  disabled={isLoading}
                >
                  Forgot Password?
                </Button>
              </div>

              {showResend && (
                <div className="text-center">
                  <Button
                    variant="link"
                    onClick={resendVerificationEmail}
                    className="text-primary text-sm hover:underline"
                    disabled={isLoading}
                  >
                    Resend Verification Email
                  </Button>
                </div>
              )}

              <Button
                type="submit"
                disabled={!isFormValid() || isLoading}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover-scale tap-scale"
              >
                {isLoading ? "Signing In..." : "Sign In"}
              </Button>
            </form>

            <Separator className="my-6" />

            {/* <Button
              variant="outline"
              onClick={handleGoogleLogin}
              disabled={isLoading}
              className="w-full gap-2 border-border hover:bg-secondary hover-scale tap-scale"
            >
              <Chrome className="w-4 w-4" />
              Continue with Google
            </Button> */}

            <div className="text-center">
              <span className="text-sm text-muted-foreground">
                Don't have an account?{" "}
              </span>
              <Button
                variant="link"
                onClick={onNavigateToSignup}
                className="text-primary text-sm hover:underline p-0"
                disabled={isLoading}
              >
                Sign Up
              </Button>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}