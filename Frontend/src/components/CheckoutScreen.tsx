import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Crown, CreditCard, Shield, Check, Star } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Separator } from "./ui/separator";
import { Badge } from "./ui/badge";

interface CheckoutScreenProps {
  plan: any;
  onBack: () => void;
  onComplete: () => void;
}

export default function CheckoutScreen({ plan, onBack, onComplete }: CheckoutScreenProps) {
  const [paymentData, setPaymentData] = useState({
    cardNumber: "",
    expiryDate: "",
    cvv: "",
    cardName: "",
    email: "",
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setPaymentData(prev => ({ ...prev, [field]: value }));
  };

  const handlePayment = () => {
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentComplete(true);
      
      // Show success for 2 seconds then navigate
      setTimeout(() => {
        onComplete();
      }, 2000);
    }, 3000);
  };

  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const formatExpiryDate = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    if (v.length >= 2) {
      return v.substring(0, 2) + '/' + v.substring(2, 4);
    }
    return v;
  };

  if (paymentComplete) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="text-center"
        >
          <div className="mx-auto w-20 h-20 bg-green-500 rounded-full flex items-center justify-center mb-6">
            <Check className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-2xl text-foreground mb-2">Payment Successful!</h2>
          <p className="text-muted-foreground mb-4">
            Welcome to Premium! Your subscription is now active.
          </p>
          <div className="flex items-center justify-center space-x-2">
            <Crown className="w-5 h-5 text-primary" />
            <span className="text-primary">Premium Member</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (isProcessing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center"
        >
          <motion.div
            className="mx-auto w-20 h-20 border-4 border-primary border-t-transparent rounded-full mb-6"
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          />
          <h2 className="text-xl text-foreground mb-2">Processing Payment...</h2>
          <p className="text-muted-foreground">
            Please wait while we securely process your payment
          </p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
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
            <h1 className="text-xl text-foreground">Checkout</h1>
          </div>
          <div className="flex items-center space-x-1">
            <Shield className="w-4 h-4 text-green-500" />
            <span className="text-sm text-green-600">Secure</span>
          </div>
        </div>
      </motion.div>

      <div className="p-4 pb-6 space-y-6">
        {/* Order Summary */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="w-5 h-5 text-primary" />
                <span>Order Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-base">{plan?.name}</h4>
                  {plan?.savings && (
                    <Badge className="bg-green-100 text-green-800 border-green-200 text-xs">
                      {plan.savings}
                    </Badge>
                  )}
                </div>
                <div className="text-right">
                  <div className="text-lg">${plan?.price}/{plan?.period}</div>
                  {plan?.originalPrice && (
                    <div className="text-sm text-muted-foreground line-through">
                      ${plan.originalPrice}/{plan.period}
                    </div>
                  )}
                </div>
              </div>
              
              {plan?.billingPeriod && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Billing cycle:</span>
                  <span>Every {plan.billingPeriod}</span>
                </div>
              )}

              <Separator />
              
              <div className="flex items-center justify-between text-lg">
                <span>Total</span>
                <span className="text-primary">${plan?.totalPrice || plan?.price}</span>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <div className="flex items-center space-x-2">
                  <Check className="w-4 h-4 text-green-600" />
                  <span className="text-sm text-green-800">30-day money-back guarantee</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Payment Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <CreditCard className="w-5 h-5" />
                <span>Payment Information</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={paymentData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardNumber">Card Number</Label>
                <Input
                  id="cardNumber"
                  placeholder="1234 5678 9012 3456"
                  value={paymentData.cardNumber}
                  onChange={(e) => handleInputChange("cardNumber", formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="bg-input-background border-border"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="expiryDate">Expiry Date</Label>
                  <Input
                    id="expiryDate"
                    placeholder="MM/YY"
                    value={paymentData.expiryDate}
                    onChange={(e) => handleInputChange("expiryDate", formatExpiryDate(e.target.value))}
                    maxLength={5}
                    className="bg-input-background border-border"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cvv">CVV</Label>
                  <Input
                    id="cvv"
                    placeholder="123"
                    value={paymentData.cvv}
                    onChange={(e) => handleInputChange("cvv", e.target.value.replace(/\D/g, ''))}
                    maxLength={4}
                    className="bg-input-background border-border"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cardName">Cardholder Name</Label>
                <Input
                  id="cardName"
                  placeholder="Enter name on card"
                  value={paymentData.cardName}
                  onChange={(e) => handleInputChange("cardName", e.target.value)}
                  className="bg-input-background border-border"
                />
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Security Notice */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h4 className="text-sm text-blue-900 mb-1">Secure Payment</h4>
                  <p className="text-xs text-blue-700">
                    Your payment information is encrypted and secure. We never store your card details.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Complete Payment Button */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Button
            onClick={handlePayment}
            disabled={!paymentData.cardNumber || !paymentData.expiryDate || !paymentData.cvv || !paymentData.cardName || !paymentData.email}
            className="w-full bg-primary hover:bg-primary/90 text-primary-foreground py-6 hover-scale tap-scale"
            size="lg"
          >
            <Crown className="w-5 h-5 mr-2" />
            Complete Payment • ${plan?.totalPrice || plan?.price}
          </Button>
        </motion.div>

        {/* Terms */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-center"
        >
          <p className="text-xs text-muted-foreground">
            By completing this purchase, you agree to our{" "}
            <span className="text-primary hover:underline cursor-pointer">Terms of Service</span>{" "}
            and{" "}
            <span className="text-primary hover:underline cursor-pointer">Privacy Policy</span>.
            Subscription will auto-renew unless cancelled.
          </p>
        </motion.div>
      </div>
    </div>
  );
}