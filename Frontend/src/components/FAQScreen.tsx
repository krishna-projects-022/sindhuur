import { motion } from "motion/react";
import { ArrowLeft, ChevronDown, ChevronUp } from "lucide-react";
import { useState } from "react";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";

interface FAQScreenProps {
  onBack: () => void;
}

export default function FAQScreen({ onBack }: FAQScreenProps) {
  const [expandedFAQ, setExpandedFAQ] = useState<number | null>(null);

  const faqs = [
    {
      question: "How does the matching algorithm work?",
      answer: "Our AI-powered algorithm analyzes your profile, preferences, and behavior to find the most compatible matches. It considers factors like interests, values, lifestyle, and communication patterns to suggest profiles with the highest compatibility scores."
    },
    {
      question: "What are the benefits of Premium membership?",
      answer: "Premium members get unlimited likes, can see who liked them, get priority in search results, access to advanced filters, profile boosts, super likes, and read receipts for messages. You also get access to our AI horoscope feature."
    },
    {
      question: "How do I verify my profile?",
      answer: "Profile verification involves uploading a government-issued ID and taking a real-time selfie. Our team reviews your submission within 24-48 hours. Verified profiles get a blue checkmark and are prioritized in search results."
    },
    {
      question: "Is my personal information safe?",
      answer: "Yes, we take privacy very seriously. All data is encrypted, we never share personal information with third parties without consent, and you have full control over who can see your profile. We also offer privacy modes for discreet browsing."
    },
    {
      question: "How do I report inappropriate behavior?",
      answer: "You can report any user by going to their profile and tapping the report button. Our moderation team reviews all reports within 24 hours. We have zero tolerance for harassment, fake profiles, or inappropriate content."
    },
    {
      question: "Can I cancel my subscription anytime?",
      answer: "Yes, you can cancel your subscription at any time from your account settings. If you cancel, you'll continue to have premium features until the end of your current billing cycle."
    },
    {
      question: "How do I increase my chances of getting matches?",
      answer: "Complete your profile with high-quality photos, write an engaging bio, be active on the app, use premium features like boosts and super likes, and be genuine in your interactions with potential matches."
    },
    {
      question: "What should I do if I'm not getting matches?",
      answer: "Try updating your photos, revising your bio, adjusting your preferences, being more active, or consider using profile boost. Our customer support team can also provide personalized profile tips."
    }
  ];

  const toggleFAQ = (index: number) => {
    setExpandedFAQ(expandedFAQ === index ? null : index);
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
            <h1 className="text-xl text-foreground">FAQ</h1>
          </div>
        </div>
      </motion.div>

      <div className="p-4 pb-6 space-y-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h2 className="text-lg text-foreground mb-4">Frequently Asked Questions</h2>
        </motion.div>

        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 + 0.2 }}
          >
            <Card className="cursor-pointer hover-scale tap-scale">
              <CardContent className="p-0">
                <div
                  onClick={() => toggleFAQ(index)}
                  className="p-4 flex items-center justify-between"
                >
                  <h4 className="text-base text-foreground pr-4">{faq.question}</h4>
                  {expandedFAQ === index ? (
                    <ChevronUp className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
                
                {expandedFAQ === index && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.3 }}
                    className="px-4 pb-4"
                  >
                    <div className="border-t border-border pt-4">
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}