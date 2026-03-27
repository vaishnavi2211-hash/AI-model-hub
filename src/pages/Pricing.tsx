import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Check, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const plans = [
  {
    name: "Free",
    price: "$0",
    period: "forever",
    features: [
      "20 AI generations per day",
      "Access to all models",
      "Prompt history",
      "Community model uploads",
    ],
    cta: "Get Started",
    popular: false,
  },
  {
    name: "Premium",
    price: "$19",
    period: "/month",
    features: [
      "Unlimited AI generations",
      "Priority processing",
      "Advanced models access",
      "API access",
      "Priority support",
      "No rate limits",
    ],
    cta: "Upgrade Now",
    popular: true,
  },
];

export default function Pricing() {
  const { user, profile } = useAuth();
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  const handleUpgrade = () => {
    setIsUpgradeModalOpen(true);
  };

  return (
    <div className="min-h-screen py-20">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-16">
          <Badge variant="outline" className="mb-4 gap-1"><Sparkles className="h-3 w-3" /> Pricing</Badge>
          <h1 className="text-4xl md:text-5xl font-display font-bold mb-4">
            Simple, transparent <span className="gradient-text">pricing</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-xl mx-auto">Start free and upgrade when you need more power.</p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan, i) => (
            <motion.div key={plan.name} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}
              className={`relative rounded-xl p-[1px] ${plan.popular ? "bg-gradient-to-br from-primary via-accent to-primary" : "bg-border/60"}`}>
              <div className="glass rounded-[11px] p-8 h-full flex flex-col">
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 gap-1">
                    <Zap className="h-3 w-3" /> Most Popular
                  </Badge>
                )}
                <h3 className="text-2xl font-display font-bold mb-1">{plan.name}</h3>
                <div className="flex items-baseline gap-1 mb-6">
                  <span className="text-4xl font-display font-bold">{plan.price}</span>
                  <span className="text-muted-foreground">{plan.period}</span>
                </div>
                <ul className="space-y-3 flex-1 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0" />
                      {f}
                    </li>
                  ))}
                </ul>
                {plan.popular ? (
                  <Button onClick={handleUpgrade} className="w-full gap-2" size="lg">
                    <Sparkles className="h-4 w-4" /> {profile?.is_premium ? "Current Plan" : plan.cta}
                  </Button>
                ) : (
                  <Button asChild variant="outline" className="w-full" size="lg">
                    <Link to={user ? "/models" : "/signup"}>{user ? "Current Plan" : plan.cta}</Link>
                  </Button>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <Dialog open={isUpgradeModalOpen} onOpenChange={setIsUpgradeModalOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-xl font-display">
                <Crown className="h-5 w-5 text-warning" />
                Upgrade to Premium
              </DialogTitle>
              <DialogDescription>
                Premium features are coming soon! Join the waitlist and be the first to know when we launch.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-2">
              <ul className="space-y-3 bg-muted/30 p-4 rounded-lg">
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  Unlimited AI generations
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  Faster, priority processing
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  Access to advanced & exclusive models
                </li>
                <li className="flex items-center gap-2 text-sm">
                  <Check className="h-4 w-4 text-primary shrink-0" />
                  No rate limits
                </li>
              </ul>
              <div className="pt-2 flex gap-3 justify-end">
                <Button variant="outline" onClick={() => setIsUpgradeModalOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={() => {
                  toast.success("You've been added to the waitlist!");
                  setIsUpgradeModalOpen(false);
                }} className="gap-2">
                  <Sparkles className="h-4 w-4" />
                  Join Waitlist
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
