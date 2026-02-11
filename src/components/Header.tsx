import { Sparkles, Image, Video, Grid3X3, Zap, LogIn, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isAdmin?: boolean;
}

const Header = ({ activeTab, onTabChange, isAdmin = false }: HeaderProps) => {
  const { user, isAuthenticated, signOut } = useAuth();
  const navigate = useNavigate();

  const navItems = [
    { id: "generate", label: "Generate", icon: Sparkles },
    { id: "video", label: "Video", icon: Video },
    { id: "gallery", label: "Gallery", icon: Grid3X3 },
    { id: "enhance", label: "Enhance", icon: Zap },
    ...(isAdmin ? [{ id: "admin", label: "Admin", icon: Shield }] : []),
  ];

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center animate-pulse-glow">
                <Image className="w-5 h-5 text-primary-foreground" />
              </div>
            </div>
            <div>
              <h1 className="font-display text-xl font-bold gradient-text">
                Asuran's AI
              </h1>
              <p className="text-xs text-muted-foreground">Image Generation</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-1 p-1 rounded-full bg-secondary/50 backdrop-blur-sm">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  activeTab === item.id
                    ? "bg-hero-gradient text-primary-foreground shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Auth Buttons */}
          <div className="hidden md:flex items-center gap-2">
            {isAuthenticated ? (
              <>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/50">
                  {isAdmin && <Shield className="w-4 h-4 text-destructive" />}
                  <User className="w-4 h-4 text-primary" />
                  <span className="text-sm text-muted-foreground">
                    {user?.user_metadata?.display_name || user?.email?.split("@")[0]}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleSignOut}
                  className="gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Button
                size="sm"
                onClick={() => navigate("/auth")}
                className="gap-2 btn-gradient"
              >
                <LogIn className="w-4 h-4" />
                Sign In
              </Button>
            )}
          </div>

          {/* Mobile nav */}
          <div className="flex md:hidden items-center gap-2">
            <nav className="flex items-center gap-1 p-1 rounded-full bg-secondary/50">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className={`p-2 rounded-full transition-all duration-300 ${
                    activeTab === item.id
                      ? "bg-hero-gradient text-primary-foreground"
                      : "text-muted-foreground"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                </button>
              ))}
            </nav>
            
            {isAuthenticated ? (
              <button
                onClick={handleSignOut}
                className="p-2 rounded-full bg-secondary/50 text-muted-foreground"
              >
                <LogOut className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={() => navigate("/auth")}
                className="p-2 rounded-full bg-hero-gradient text-primary-foreground"
              >
                <LogIn className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
