import { useState } from "react";
import { motion } from "motion/react";
import { ArrowLeft, Send, MessageCircle, Mail, Phone } from "lucide-react";
import { Button } from "./ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";

interface SupportScreenProps {
  onBack: () => void;
}

export default function SupportScreen({ onBack }: SupportScreenProps) {
  const [formData, setFormData] = useState({
    subject: "",
    category: "",
    message: "",
    email: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = () => {
    setIsSubmitting(true);
    // Simulate form submission
    setTimeout(() => {
      setIsSubmitting(false);
      // Reset form or show success message
      setFormData({ subject: "", category: "", message: "", email: "" });
      alert("Your message has been sent! We'll get back to you within 24 hours.");
    }, 2000);
  };

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
            <h1 className="text-xl text-foreground">Contact Support</h1>
          </div>
        </div>
      </motion.div>

      <div className="p-4 pb-6 space-y-6">
        {/* Contact Options */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-4"
        >
          <Card className="text-center hover-scale tap-scale cursor-pointer">
            <CardContent className="p-4">
              <MessageCircle className="w-8 h-8 text-blue-500 mx-auto mb-2" />
              <h4 className="text-sm">Live Chat</h4>
              <p className="text-xs text-muted-foreground">Available 24/7</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover-scale tap-scale cursor-pointer">
            <CardContent className="p-4">
              <Mail className="w-8 h-8 text-green-500 mx-auto mb-2" />
              <h4 className="text-sm">Email Support</h4>
              <p className="text-xs text-muted-foreground">Response in 24h</p>
            </CardContent>
          </Card>
          
          <Card className="text-center hover-scale tap-scale cursor-pointer">
            <CardContent className="p-4">
              <Phone className="w-8 h-8 text-purple-500 mx-auto mb-2" />
              <h4 className="text-sm">Phone Support</h4>
              <p className="text-xs text-muted-foreground">Mon-Fri 9AM-6PM</p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Contact Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>Send us a message</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="your.email@example.com"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="category">Category</Label>
                <Select 
                  value={formData.category} 
                  onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger className="bg-input-background">
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="account">Account Issues</SelectItem>
                    <SelectItem value="billing">Billing & Subscriptions</SelectItem>
                    <SelectItem value="technical">Technical Problems</SelectItem>
                    <SelectItem value="safety">Safety & Security</SelectItem>
                    <SelectItem value="features">Feature Requests</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  placeholder="Brief description of your issue"
                  value={formData.subject}
                  onChange={(e) => setFormData(prev => ({ ...prev, subject: e.target.value }))}
                  className="bg-input-background"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea
                  id="message"
                  placeholder="Please describe your issue in detail..."
                  value={formData.message}
                  onChange={(e) => setFormData(prev => ({ ...prev, message: e.target.value }))}
                  className="bg-input-background min-h-[120px]"
                />
              </div>

              <Button
                onClick={handleSubmit}
                disabled={!formData.email || !formData.subject || !formData.message || isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground hover-scale tap-scale"
              >
                {isSubmitting ? (
                  "Sending..."
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Message
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </motion.div>

        {/* Additional Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card className="bg-blue-50 border-blue-200">
            <CardContent className="p-4">
              <h4 className="text-sm text-blue-900 mb-2">Before contacting support:</h4>
              <ul className="text-xs text-blue-700 space-y-1">
                <li>• Check our FAQ section for quick answers</li>
                <li>• Make sure you're using the latest app version</li>
                <li>• Include screenshots if reporting a technical issue</li>
                <li>• Provide your account email for faster assistance</li>
              </ul>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}