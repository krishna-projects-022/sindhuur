import { useState, useEffect, useRef } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Timer, RotateCcw } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "./ui/card";
import { toast } from 'react-toastify';
import logoImage from "figma:asset/283bcaa9feb08ca21e950b1d10332be9f6258bfc.png";

interface OTPScreenProps {
  phone?: string;
  email?: string;
  VerifySuccess: (userData: any) => void;
  onBack: () => void;
}

export default function OTPScreen({ phone, email, type, onVerifySuccess, onBack }: OTPScreenProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [canResend, setCanResend] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1 || !/^\d*$/.test(value)) return; // Allow only digits
    
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // Auto-focus next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleVerify = async () => {
    const otpValue = otp.join("");
    if (otpValue.length !== 6 || !/^\d{6}$/.test(otpValue)) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`${BASE_URL}/api/verify-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email, otp: otpValue }),
      });
      const data = await response.json();

      if (response.ok) {
        toast.success("✅ OTP verified successfully!");
        setIsVerified(true);
        const userData = {
          email: email || "john@example.com",
          phone: phone || "+1234567890",
          verified: true,
          step: 5,
          otpVerified: true,
        };
        onVerifySuccess(userData);
      } else {
        setError(data.error || "Invalid OTP");
        toast.error(data.error || "Invalid OTP");
      }
    } catch (error: any) {
      setError("Failed to verify OTP. Please check your network or try again.");
      toast.error("Failed to verify OTP. Please check your network or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    setTimeLeft(60);
    setCanResend(false);
    setOtp(["", "", "", "", "", ""]);
    setError(null);
    inputRefs.current[0]?.focus();

    try {
      const response = await fetch(`${BASE_URL}/api/send-email-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email }),
      });
      const data = await response.json();
      if (response.ok) {
        toast.success("OTP resent successfully! Check your email.");
      } else {
        setError(data.error || "Failed to resend OTP");
        toast.error(data.error || "Failed to resend OTP");
      }
    } catch (error) {
      setError("Failed to resend OTP. Please check your network.");
      toast.error("Failed to resend OTP. Please check your network.");
    }
  };

  const getTitle = () => {
    if (type === "forgot-password") return "Reset Password";
    return "Verify Account";
  };

  const getDescription = () => {
    const contact = phone || email;
    if (type === "forgot-password") {
      return `Enter the 6-digit code sent to ${contact} to reset your password`;
    }
    return `Enter the 6-digit code sent to ${contact} to verify your account`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/5 via-white to-primary/10 flex flex-col">
      {/* Header */}
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
                  {getTitle()}
                </CardTitle>
                <CardDescription className="text-muted-foreground mt-2">
                  {isVerified
                    ? "Your account has been verified."
                    : getDescription()}
                </CardDescription>
                {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
                {isVerified && (
                  <p className="text-green-500 text-sm mt-2">Successfully verified!</p>
                )}
              </div>
            </CardHeader>

            <CardContent className="space-y-6">
              {!isVerified ? (
                <>
                  {/* OTP Input */}
                  <div className="flex justify-center space-x-3">
                    {otp.map((digit, index) => (
                      <motion.input
                        key={index}
                        ref={(el) => (inputRefs.current[index] = el)}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(index, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(index, e)}
                        className="w-12 h-12 text-center border-2 border-border rounded-lg bg-input-background focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all"
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ delay: index * 0.1 + 0.3 }}
                        disabled={isLoading}
                      />
                    ))}
                  </div>

                  {/* Timer */}
                  <div className="flex items-center justify-center space-x-2 text-muted-foreground">
                    <Timer className="w-4 h-4" />
                    <span className="text-sm">
                      {timeLeft > 0 ? `Resend in ${timeLeft}s` : "You can resend now"}
                    </span>
                  </div>

                  {/* Verify Button */}
                  <Button
                    onClick={handleVerify}
                    disabled={otp.join("").length !== 6 || isLoading}
                    className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover-scale tap-scale"
                  >
                    {isLoading ? "Verifying..." : "Verify & Continue"}
                  </Button>

                  {/* Resend Button */}
                  <Button
                    variant="outline"
                    onClick={handleResend}
                    disabled={!canResend || isLoading}
                    className="w-full gap-2 border-border hover:bg-secondary"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Resend Code
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    Didn't receive the code? Check your spam folder or try resending
                  </p>
                </>
              ) : (
                <p className="text-center text-muted-foreground">
                  Verification complete. You can now proceed.
                </p>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}