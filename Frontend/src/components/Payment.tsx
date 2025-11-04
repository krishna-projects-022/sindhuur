"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import toast, { Toaster } from "react-hot-toast"; // Use react-hot-toast
import axios from "axios";
import { ArrowLeft, CreditCard, Shield, TrendingUp, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";

const BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

const Payment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  // Extract plan details from searchParams or fallback to default
  const planId = searchParams.get("plan")?.toLowerCase() || "premium";
  const price = searchParams.get("price") || "2999";
  const urlUpgrade = searchParams.get("upgrade") === "true";

  // Default plan details (fallback for plans not defined in PremiumScreen)
  const defaultPlanDetails = {
    premium: {
      name: "Premium",
      duration: "3 Months",
      price: "2,999",
      features: [
        "Unlimited profile views",
        "Direct contact details",
        "Profile boost",
        "Priority support",
      ],
    },
    "premium plus": {
      name: "Premium Plus",
      duration: "6 Months",
      price: "4,999",
      features: [
        "Unlimited profile views",
        "Direct contact details",
        "Profile boost",
        "Priority support",
        "Extended 6-month validity",
        "Advanced matching algorithms",
        "Premium customer support",
      ],
    },
    gold: {
      name: "Gold",
      duration: "3 Months",
      price: "3,599",
      features: [
        "Unlimited messages",
        "View contact numbers",
        "See who liked you",
        "Priority customer support",
      ],
    },
    goldplus: {
      name: "Gold Plus",
      duration: "6 Months",
      price: "5,399",
      features: [
        "Unlimited messages",
        "View contact numbers",
        "Video call matches",
        "Standout profile",
        "Advanced filters",
      ],
    },
    diamond: {
      name: "Diamond",
      duration: "12 Months",
      price: "7,199",
      features: [
        "Unlimited messages",
        "View contact numbers",
        "Video call matches",
        "Standout profile",
        "Priority matches",
        "Profile consultant",
      ],
    },
  };

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);
  const [upgradeDetails, setUpgradeDetails] = useState(null);
  const [currentUserPlan, setCurrentUserPlan] = useState("free");
  const [isUpgrade, setIsUpgrade] = useState(false);
  const [hasHighestPlan, setHasHighestPlan] = useState(false);

  // Get current plan details based on planId
  const currentPlan = defaultPlanDetails[planId] || defaultPlanDetails.premium;

  // Load Razorpay script dynamically
  useEffect(() => {
    if (window.Razorpay) {
      setIsRazorpayLoaded(true);
      return;
    }

    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    script.onload = () => {
      setIsRazorpayLoaded(true);
    };
    script.onerror = () => {
      toast.error("Failed to load payment gateway. Please try again later.");
    };
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

 useEffect(() => {
  const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
  if (loggedInUser) {
    // Format phone number if it's just 10 digits
    const userPhone = loggedInUser.mobile || "";
    const formattedPhone = userPhone.length === 10 ? `+91${userPhone}` : userPhone;
    
    setFormData({
      email: loggedInUser.email || "",
      phone: formattedPhone,
    });
    
    const userCurrentPlan = loggedInUser.subscription?.current || "free";
    setCurrentUserPlan(userCurrentPlan);

    const targetPlan = planId;
    const hasActiveSubscription =
      loggedInUser.subscription?.details?.expiryDate &&
      new Date(loggedInUser.subscription.details.expiryDate) > new Date();

    // Define plan hierarchy for upgrade checks
    const planHierarchy = {
      free: 0,
      premium: 1,
      gold: 1,
      "premium plus": 2,
      goldplus: 2,
      diamond: 3,
    };

    // Check if user has the highest plan (Diamond)
    if (userCurrentPlan === "diamond" && hasActiveSubscription) {
      setHasHighestPlan(true);
      toast.error(
        "Highest Plan Active: You already have the Diamond subscription, which is our highest plan."
      );
      return;
    }

    // Determine if it's an upgrade
    const shouldBeUpgrade =
      urlUpgrade ||
      (planHierarchy[userCurrentPlan] < planHierarchy[targetPlan] &&
        hasActiveSubscription);

    setIsUpgrade(shouldBeUpgrade);

    // Suggest upgrade if trying to purchase the same or lower plan
    if (
      planHierarchy[userCurrentPlan] >= planHierarchy[targetPlan] &&
      hasActiveSubscription
    ) {
      const nextPlan =
        targetPlan === "premium" || targetPlan === "gold"
          ? "goldplus"
          : "diamond";
      if (planHierarchy[userCurrentPlan] < planHierarchy[nextPlan]) {
        toast(
          `You already have a ${
            userCurrentPlan.charAt(0).toUpperCase() + userCurrentPlan.slice(1)
          } subscription. Would you like to upgrade to ${
            defaultPlanDetails[nextPlan].name
          }?`,
          {
            action: (
              <Button
                onClick={() =>
                  navigate(
                    `/payment?plan=${nextPlan}&price=${defaultPlanDetails[
                      nextPlan
                    ].price.replace(",", "")}&upgrade=true`
                  )
                }
                className="bg-orange-500 hover:bg-orange-600"
              >
                Upgrade to {defaultPlanDetails[nextPlan].name}
              </Button>
            ),
          }
        );
      }
    }

    console.log("Current user plan detected:", userCurrentPlan);
    console.log("Target plan:", targetPlan);
    console.log("URL upgrade param:", urlUpgrade);
    console.log("Auto-detected upgrade:", shouldBeUpgrade);
  }
}, [planId, urlUpgrade, navigate]);

  useEffect(() => {
    if (isUpgrade) {
      fetchUpgradeDetails();
    }
  }, [isUpgrade, planId]);

  const fetchUpgradeDetails = async () => {
    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser?.profileId) return;

    try {
      console.log("Fetching upgrade details for:", {
        currentPlan: currentUserPlan,
        targetPlan: planId,
        userId: loggedInUser.profileId,
      });

      const response = await axios.post(`${BASE_URL}/api/payment/upgrade`, {
        newPlan: planId,
        userId: loggedInUser.profileId,
      });

      if (response.data.success) {
        setUpgradeDetails(response.data.upgradeDetails);
        console.log("Upgrade details received:", response.data.upgradeDetails);
      } else {
        console.error("Upgrade details fetch failed:", response.data.message);
      }
    } catch (error) {
      console.error("Failed to fetch upgrade details:", error);
      toast.error("Failed to calculate upgrade pricing.");
    }
  };

  const handleInputChange = (field, value) => {
  if (field === "phone") {
    // Remove all non-digit characters
    const cleanedValue = value.replace(/\D/g, '');
    
    // If it's exactly 10 digits, auto-prepend +91
    // If it starts with 91 and has more digits, format as +91 followed by remaining digits
    let formattedValue;
    if (cleanedValue.length === 10) {
      formattedValue = `+91${cleanedValue}`;
    } else if (cleanedValue.length > 10 && cleanedValue.startsWith('91')) {
      formattedValue = `+91${cleanedValue.slice(2, 12)}`; // Take next 10 digits after 91
    } else if (cleanedValue.length <= 10) {
      formattedValue = `+91${cleanedValue}`;
    } else {
      formattedValue = `+91${cleanedValue.slice(0, 10)}`; // Take only first 10 digits
    }
    
    setFormData(prev => ({
      ...prev,
      [field]: formattedValue
    }));
  } else {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }
};


  

  const validateForm = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    const phoneRegex = /^\+91[0-9]{10}$/;

    if (!emailRegex.test(formData.email)) {
      toast.error("Invalid Email: Please enter a valid email address.");
      return false;
    }
    if (!phoneRegex.test(formData.phone)) {
      toast.error(
        "Invalid Phone: Please enter a valid phone number starting with +91 followed by 10 digits."
      );
      return false;
    }
    return true;
  };

  const handlePayment = async () => {
    if (hasHighestPlan) {
      toast.error(
        "Highest Plan Active: You already have the Diamond subscription, which is our highest plan."
      );
      return;
    }

    if (!validateForm()) return;

    const loggedInUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (!loggedInUser?.profileId) {
      toast.error("Authentication Error: Please log in to proceed with payment.");
      navigate("/login");
      return;
    }

    if (isUpgrade) {
      console.log("Processing upgrade from", currentUserPlan, "to", planId);

      const planHierarchy = {
        free: 0,
        premium: 1,
        gold: 1,
        "premium plus": 2,
        goldplus: 2,
        diamond: 3,
      };

      if (planHierarchy[currentUserPlan] >= planHierarchy[planId]) {
        toast.error(
          "Upgrade Error: Cannot upgrade to the same or lower plan. Please contact support."
        );
        return;
      }

      const hasActiveSubscription =
        loggedInUser.subscription?.details?.expiryDate &&
        new Date(loggedInUser.subscription.details.expiryDate) > new Date();

      if (!hasActiveSubscription) {
        toast.error(
          "Upgrade Error: No active subscription found. Please contact support."
        );
        return;
      }
    }

    if (!isRazorpayLoaded || !window.Razorpay) {
      toast.error("Payment Error: Payment gateway not loaded. Please try again.");
      return;
    }

    setIsProcessing(true);

    try {
      const requestData = {
        plan: planId,
        userId: loggedInUser.profileId,
        isUpgrade,
      };

      if (!isUpgrade) {
        requestData.price = currentPlan.price.replace(",", "");
      }

      console.log("Payment request data:", requestData);

      const res = await axios.post(`${BASE_URL}/api/payment/initiate`, requestData);

      const { order, paymentId, upgradeDetails: returnedUpgradeDetails } = res.data;

      if (!order || !paymentId) {
        throw new Error("Invalid response from payment initiation");
      }

      const paymentAmount = returnedUpgradeDetails?.proratedAmount
        ? returnedUpgradeDetails.proratedAmount * 100
        : Number(currentPlan.price.replace(",", "")) * 100;

      console.log("Payment amount calculated:", paymentAmount);

      const options = {
        key: "rzp_test_UlCC6Rw2IJrhyh", // Replace with your actual Razorpay key
        amount: paymentAmount,
        currency: "INR",
        name: "Matrimony Membership",
        description: isUpgrade
          ? `Upgrade to ${currentPlan.name}`
          : `Subscribe to ${currentPlan.name}`,
        order_id: order.id,
        handler: async (response) => {
          try {
            const verifyRes = await axios.post(`${BASE_URL}/api/payment/verify`, {
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentId,
            });

            if (verifyRes.data.success) {
              const newPlanName = planId;
              const planDurationDays = {
                premium: 90,
                gold: 90,
                "premium plus": 180,
                goldplus: 180,
                diamond: 365,
              }[newPlanName] || 90;

              const updatedUser = {
                ...loggedInUser,
                subscription: {
                  current: newPlanName,
                  details: {
                    startDate: new Date(),
                    expiryDate: new Date(
                      Date.now() + planDurationDays * 24 * 60 * 60 * 1000
                    ),
                    paymentId,
                    autoRenew: false,
                  },
                },
              };
              localStorage.setItem("loggedInUser", JSON.stringify(updatedUser));

              const successMessage = isUpgrade
                ? `Successfully upgraded to ${currentPlan.name}!`
                : "Your subscription has been activated!";

              toast.success(successMessage);
              navigate("/dashboard");
            } else {
              toast.error("Verification Failed: Please contact support.");
            }
          } catch (err) {
            console.error("Verification error:", err);
            toast.error("Payment Error: Something went wrong during verification.");
          }
        },
        prefill: {
          name: loggedInUser.name || "User",
          email: formData.email,
          contact: formData.phone,
        },
        method: {
          upi: true,
          card: true,
          netbanking: true,
          wallet: true,
          paylater: true,
        },
        modal: {
          ondismiss: () => {
            toast("Payment Cancelled: You closed the payment window.");
          },
        },
        theme: {
          color: "#f97316",
        },
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();
    } catch (err) {
      console.error("Payment error:", err.message);
      toast.error(
        err.response?.data?.message ||
          "Something went wrong while initiating payment."
      );
    } finally {
      setIsProcessing(false);
    }
  };

  const getDisplayPrice = () => {
    if (isUpgrade && upgradeDetails) {
      return upgradeDetails.proratedAmount.toLocaleString();
    }
    return currentPlan.price;
  };

  const getOriginalPrice = () => {
    if (isUpgrade && upgradeDetails) {
      return upgradeDetails.newPlanPrice.toLocaleString();
    }
    return currentPlan.price;
  };

  if (hasHighestPlan) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto text-center">
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center justify-center">
                  <Shield className="mr-2 text-orange-600" size={20} />
                  Subscription Status
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white">
                <p className="text-lg text-gray-600 mb-4">
                  You already have the Diamond subscription, which is our highest
                  plan.
                </p>
                <Button
                  onClick={() => navigate("/home")}
                  className="bg-blue-500 hover:bg-blue-600 text-white"
                >
                  Go to Dashboard
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      <Toaster /> {/* Add Toaster for react-hot-toast */}
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <Button
            variant="ghost"
            onClick={() => navigate("/premium")}
            className="mb-6 text-orange-600 hover:bg-orange-50"
          >
            <ArrowLeft size={16} className="mr-2" />
            Back to Plans
          </Button>

          <div className="grid lg:grid-cols-2 gap-8">
            {/* Summary */}
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  {isUpgrade ? (
                    <TrendingUp className="mr-2 text-orange-600" size={20} />
                  ) : (
                    <Shield className="mr-2 text-orange-600" size={20} />
                  )}
                  {isUpgrade ? "Upgrade Summary" : "Order Summary"}
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white space-y-4">
                <div className="bg-gradient-to-r from-orange-500 to-red-500 text-dark p-4 rounded-lg">
                  <h3 className="text-xl font-semibold text-black">
                    {isUpgrade
                      ? `Upgrade to ${currentPlan.name}`
                      : `${currentPlan.name} Plan`}
                  </h3>
                  <p className="text-black">{currentPlan.duration}</p>
                  {isUpgrade && (
                    <p className="text-orange-200 text-sm mt-1">
                      Current:{" "}
                      {currentUserPlan.charAt(0).toUpperCase() +
                        currentUserPlan.slice(1)}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  {isUpgrade && upgradeDetails ? (
                    <>
                      <div className="flex justify-between text-gray-600">
                        <span>Original {currentPlan.name} Price</span>
                        <span>₹{getOriginalPrice()}</span>
                      </div>
                      {upgradeDetails.refundAmount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span className="flex items-center">
                            <Clock size={14} className="mr-1" />
                            Credit for remaining time
                          </span>
                          <span>
                            -₹{upgradeDetails.refundAmount.toLocaleString()}
                          </span>
                        </div>
                      )}
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg text-black">
                        <span>Upgrade Amount</span>
                        <span>₹{getDisplayPrice()}</span>
                      </div>
                      {upgradeDetails.remainingDays > 0 && (
                        <p className="text-sm text-black">
                          You have {upgradeDetails.remainingDays} days remaining
                          in your current plan
                        </p>
                      )}
                    </>
                  ) : (
                    <>
                      <div className="flex justify-between text-black">
                        <span>Subscription Fee</span>
                        <span>₹{currentPlan.price}</span>
                      </div>
                      <div className="flex justify-between text-black">
                        <span>Discount</span>
                        <span>₹0</span>
                      </div>
                      <Separator />
                      <div className="flex justify-between font-semibold text-lg text-black">
                        <span>Total Amount</span>
                        <span>₹{currentPlan.price}</span>
                      </div>
                    </>
                  )}
                </div>
                <div className="bg-green-50 p-3 rounded-lg text-sm text-green-700">
                  <p className="font-medium">
                    {isUpgrade ? "Additional benefits:" : "What you get:"}
                  </p>
                  <ul className="list-disc list-inside mt-1 space-y-1">
                    {currentPlan.features.map((feature, index) => (
                      <li key={index}>{feature}</li>
                    ))}
                  </ul>
                </div>
              </CardContent>
            </Card>

            {/* Payment */}
            <Card className="border-orange-100">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CreditCard className="mr-2 text-orange-600" size={20} />
                  Payment Details
                </CardTitle>
              </CardHeader>
              <CardContent className="bg-white space-y-6">
                <div>
                  <Label>Email Address</Label>
                  <Input
                    placeholder="your@email.com"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="border-orange-200"
                  />
                </div>
                <div>
                  <Label>Phone Number</Label>
                  <Input
                    placeholder="+91"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="border-orange-200"
                  />
                </div>
                <div className="text-center border border-dashed border-orange-300 rounded-lg p-4 bg-orange-50 text-orange-700 text-sm font-medium">
                  All Cards and UPI Payments Are Acceptable <br />
                  <span className="text-xl mt-1 block">↓</span>
                </div>
                <Button
                  onClick={handlePayment}
                  disabled={isProcessing || !isRazorpayLoaded}
                  className="w-full bg-red-500 hover:bg-danger-600 text-white text-lg py-6"
                >
                  {isProcessing
                    ? "Processing..."
                    : isRazorpayLoaded
                    ? `${isUpgrade ? "Upgrade" : "Pay"} ₹${getDisplayPrice()}`
                    : "Loading Payment Gateway..."}
                </Button>
                <div className="text-xs text-gray-500 text-center">
                  <p>Your payment is secured with SSL encryption</p>
                  {isUpgrade && (
                    <p className="mt-1 text-orange-600">
                      Upgrade takes effect immediately after payment
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;