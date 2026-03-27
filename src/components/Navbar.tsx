import { Link, useLocation, useNavigate } from "react-router-dom";
import { Brain, Menu, X, Crown, LogIn, LogOut, Clock } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { label: "Home", path: "/" },
  { label: "Models", path: "/models" },
  { label: "Playground", path: "/playground" },
  { label: "Upload", path: "/upload" },
  { label: "History", path: "/history" },
];

export function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile, usage, signOut } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  return (
    <nav className="sticky top-0 z-50 navbar">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary glow-primary p-1.5">
            <Brain className="h-full w-full text-primary-foreground" />
          </div>
          <span className="text-xl font-display font-bold tracking-tight">
            Model<span className="text-primary">Hub</span>
          </span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-muted"
              )}
            >
              {item.label}
            </Link>
          ))}
        </div>

        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Badge variant="outline" className="gap-1 text-xs">
                {usage.remaining}/{usage.limit} left
              </Badge>
              {!profile?.is_premium && (
                <Button asChild variant="outline" size="sm" className="gap-1 text-xs border-warning/30 text-warning hover:bg-warning/10">
                  <Link to="/pricing"><Crown className="h-3 w-3" /> Upgrade</Link>
                </Button>
              )}
              <span className="text-xs text-muted-foreground">{profile?.display_name || user.email}</span>
              <Button variant="ghost" size="icon" onClick={handleSignOut} className="rounded-full">
                <LogOut className="h-4 w-4" />
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm" className="gap-1">
                <Link to="/login"><LogIn className="h-3.5 w-3.5" /> Sign In</Link>
              </Button>
              <Button asChild size="sm">
                <Link to="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <ThemeToggle />
        </div>

        <div className="flex md:hidden items-center gap-2">
          <ThemeToggle />
          <button onClick={() => setMobileOpen(!mobileOpen)} className="p-2">
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {mobileOpen && (
        <div className="md:hidden glass border-t border-border/50 pb-4">
          {navItems.map((item) => (
            <Link key={item.path} to={item.path} onClick={() => setMobileOpen(false)}
              className={cn("block px-6 py-3 text-sm font-medium", location.pathname === item.path ? "text-primary bg-primary/10" : "text-muted-foreground")}>
              {item.label}
            </Link>
          ))}
          <div className="px-6 pt-3 border-t border-border/50 mt-2 space-y-2">
            {user ? (
              <>
                <p className="text-xs text-muted-foreground">{usage.remaining} generations remaining</p>
                <Button variant="ghost" size="sm" className="w-full justify-start gap-2" onClick={() => { handleSignOut(); setMobileOpen(false); }}>
                  <LogOut className="h-3.5 w-3.5" /> Sign Out
                </Button>
              </>
            ) : (
              <div className="flex gap-2">
                <Button asChild variant="outline" size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Link to="/login">Sign In</Link>
                </Button>
                <Button asChild size="sm" className="flex-1" onClick={() => setMobileOpen(false)}>
                  <Link to="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
