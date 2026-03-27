import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Brain, LogIn, Loader2, Eye, EyeOff } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

export default function Login() {
  const navigate = useNavigate();
  const { signIn, resendConfirmation, debugBypass } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    setLoading(true);
    const { error } = await signIn(email, password);
    setLoading(false);
    if (error) {
      toast.error(error.message || "Invalid credentials. If you just signed up, please check your email for a verification link.");
    } else {
      toast.success("Welcome back!");
      navigate("/");
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("Please enter your email address first.");
      return;
    }
    setResending(true);
    const { error } = await resendConfirmation(email);
    setResending(false);
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Verification email resent! Please check your inbox (and Spam folder).");
    }
  };

  const handleDebugBypass = () => {
    debugBypass();
    navigate("/");
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 relative overflow-hidden">
      {/* Background animated elements */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl shadow-[0_0_50px_rgba(59,130,246,0.3)]" style={{ animation: "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite" }}></div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 30, scale: 0.95 }} 
        animate={{ opacity: 1, y: 0, scale: 1 }} 
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="w-full max-w-md z-10"
      >
        <div className="text-center mb-8">
          <div className="inline-flex h-16 w-16 items-center justify-center rounded-xl bg-primary glow-primary mb-4 p-3">
            <Brain className="h-full w-full text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-display font-bold">Welcome back</h1>
          <p className="text-muted-foreground mt-2">Sign in to your ModelHub account</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-xl p-8 space-y-5">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" placeholder="you@example.com" value={email} onChange={(e) => setEmail(e.target.value)} className="bg-background/50" required />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input 
                id="password" 
                type={showPassword ? "text" : "password"} 
                placeholder="••••••••" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                className="bg-background/50 pr-10" 
                required 
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" className="w-full gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]" disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />}
            Sign In
          </Button>

          <p className="text-center text-sm text-muted-foreground mt-6">
            Don't have an account?{" "}
            <Link to="/signup" className="text-primary hover:underline font-medium">Sign up</Link>
          </p>
          
          <div className="pt-4 border-t border-border/50 text-center space-y-3">
            <p className="text-xs text-muted-foreground">
              Trouble signing in? Make sure you have verified your email address.
            </p>
            
            <div className="flex flex-col gap-2">
              <Button 
                type="button" 
                variant="outline" 
                size="sm" 
                className="w-full text-xs" 
                onClick={handleResend}
                disabled={resending}
              >
                {resending ? <Loader2 className="h-3 w-3 animate-spin mr-2" /> : null}
                Resend Verification Email
              </Button>
              
              <Button 
                type="button" 
                variant="ghost" 
                size="sm" 
                className="w-full text-[10px] text-muted-foreground hover:text-primary transition-colors" 
                onClick={handleDebugBypass}
              >
                Debug: Skip Login & Enter as Guest
              </Button>
            </div>

            <div className="bg-primary/5 rounded-lg p-3 border border-primary/10">
              <p className="text-[11px] text-primary/80 font-medium">
                Tip: If you're using Supabase, remember to check your Spam folder for the confirmation email, or disable email verification in your dashboard.
              </p>
            </div>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
