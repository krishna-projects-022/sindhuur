import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Mail, Eye, EyeOff } from "lucide-react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import logoImage from "figma:asset/283bcaa9feb08ca21e950b1d10332be9f6258bfc.png";
import axios from "axios";
import { toast } from "react-toastify";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

interface ForgotPasswordScreenProps {
  onSendOTP: (data: { email: string; type: string }) => void;
  onBack: () => void;
}

export default function ForgotPasswordScreen({ onSendOTP, onBack }: ForgotPasswordScreenProps) {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    password: "",
  });
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [errors, setErrors] = useState({});

  axios.defaults.baseURL = BASE_URL;

  const validateField = (field, value) => {
    switch (field) {
      case "email":
        if (!value) return "Email is required";
        return /^[a-zA-Z0-9._%+-]+@[a-zA-Z.-]+\.[a-zA-Z]{2,}$/.test(value)
          ? ""
          : "Please enter a valid email address";
      case "otp":
        if (!value) return "OTP is required";
        return value.length === 6 && /^\d{6}$/.test(value)
          ? ""
          : "OTP must be a 6-digit number";
      case "password":
        if (!value) return "Password is required";
        return value.length >= 8 ? "" : "Password must be at least 8 characters";
      default:
        return "";
    }
  };

  const handleInputChange = (field, value) => {
    if (field === "otp") {
      value = value.replace(/[^0-9]/g, "").slice(0, 6);
    }
    setFormData(prev => ({ ...prev, [field]: value }));
    const errorMessage = validateField(field, value);
    setErrors(prev => ({ ...prev, [field]: errorMessage }));
  };

  const handleSendOTP = async (e) => {
    e.preventDefault();
    setInlineError("");
    const errorMessage = validateField("email", formData.email);
    setErrors(prev => ({ ...prev, email: errorMessage }));

    if (!errorMessage) {
      setIsLoading(true);
      try {
        await axios.post("/api/auth/forgot-password", { email: formData.email });
        // toast({
        //   title: "OTP sent",
        //   description: "Check your email (spam folder too).",
        //   duration: 5000,
        // });
        setStep(2);
        onSendOTP({ email: formData.email, type: "forgot-password" });
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Failed to send OTP";
        setInlineError(msg);
        // toast({
        //   title: "Error",
        //   description: msg,
        //   variant: "destructive",
        //   duration: 5000,
        // });
      } finally {
        setIsLoading(false);
      }
    } else {
      setInlineError(errorMessage);
      // toast({
      //   title: "Error",
      //   description: errorMessage,
      //   variant: "destructive",
      //   duration: 5000,
      // });
    }
  };

  const handleVerifyAndReset = async (e) => {
    e.preventDefault();
    setInlineError("");
    const newErrors = {
      email: validateField("email", formData.email),
      otp: validateField("otp", formData.otp),
      password: validateField("password", formData.password),
    };
    setErrors(prev => ({ ...prev, ...newErrors }));

    if (Object.values(newErrors).every(error => !error)) {
      setIsLoading(true);
      try {
        const payload = { email: formData.email, otp: formData.otp, password: formData.password };
        const res = await axios.post("/api/auth/reset-password", payload);
        // toast({
        //   title: "Password updated",
        //   description: res?.data?.message || "You can now log in.",
        //   duration: 5000,
        // });
        onBack();
      } catch (err) {
        const msg = err?.response?.data?.message || err.message || "Reset failed";
        setInlineError(msg);
        // toast({
        //   title: "Error",
        //   description: msg,
        //   variant: "destructive",
        //   duration: 5000,
        // });
      } finally {
        setIsLoading(false);
      }
    } else {
      setInlineError("Please fill in all required fields correctly.");
      // toast({
      //   title: "Error",
      //   description: "Please fill in all required fields correctly.",
      //   variant: "destructive",
      //   duration: 5000,
      // });
    }
  };

  const isFormValid = () => {
    if (step === 1) {
      return !errors.email && formData.email;
    }
    return !errors.email && !errors.otp && !errors.password && formData.email && formData.otp && formData.password;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex flex-col">
      <div className="flex items-center justify-between p-4">
        <Button variant="ghost" size="sm" onClick={onBack} className="gap-2">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Button>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
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
                  alt="Logo"
                  className="w-full h-full object-contain"
                />
              </motion.div>
              <div>
                <CardTitle className="text-2xl text-primary">
                  {step === 1 ? "Forgot Password?" : "Reset Password"}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  {step === 1
                    ? "Don't worry! We'll help you reset your password"
                    : "Enter the OTP and new password"}
                </CardDescription>
                {inlineError && <p className="text-red-500 text-sm mt-2">{inlineError}</p>}
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              {step === 1 ? (
                <form onSubmit={handleSendOTP} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Input
                        id="email"
                        type="email"
                        placeholder="Enter your email address"
                        value={formData.email}
                        onChange={(e) => handleInputChange("email", e.target.value)}
                        className="bg-input-background border-border pr-10"
                        disabled={isLoading}
                        required
                      />
                      <Mail className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    </div>
                    {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
                  </div>
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover-scale tap-scale"
                  >
                    {isLoading ? "Sending OTP..." : "Send Reset OTP"}
                  </Button>
                  <p className="text-xs text-muted-foreground text-center">
                    We'll send a 6-digit code to your email address
                  </p>
                </form>
              ) : (
                <form onSubmit={handleVerifyAndReset} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="otp">OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      inputMode="numeric"
                      placeholder="6-digit code"
                      value={formData.otp}
                      onChange={(e) => handleInputChange("otp", e.target.value)}
                      className="bg-input-background border-border"
                      disabled={isLoading}
                      required
                    />
                    {errors.otp && <p className="text-red-500 text-xs mt-1">{errors.otp}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="password">New Password</Label>
                    <div className="relative">
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="At least 8 characters"
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
                    {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 8 characters
                    </p>
                  </div>
                  <Button
                    type="submit"
                    disabled={!isFormValid() || isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover-scale tap-scale"
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              )}

              <div className="mt-6 text-center">
                <Button
                  variant="link"
                  onClick={onBack}
                  className="text-primary text-sm hover:underline"
                >
                  Remember your password? Sign In
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}