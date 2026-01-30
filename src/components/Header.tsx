import { Sparkles, Image, Video, Grid3X3, Zap } from "lucide-react";

interface HeaderProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

const Header = ({ activeTab, onTabChange }: HeaderProps) => {
  const navItems = [
    { id: "generate", label: "Generate", icon: Sparkles },
    { id: "video", label: "Video", icon: Video },
    { id: "gallery", label: "Gallery", icon: Grid3X3 },
    { id: "enhance", label: "Enhance", icon: Zap },
  ];

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-card border-b border-white/5">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-10 h-10 rounded-xl bg-hero-gradient flex items-center justify-center animate-pulse-glow">
                <Image className="w-5 h-5 text-white" />
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
                    ? "bg-hero-gradient text-white shadow-lg"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"
                }`}
              >
                <item.icon className="w-4 h-4" />
                {item.label}
              </button>
            ))}
          </nav>

          {/* Mobile nav */}
          <nav className="flex md:hidden items-center gap-1 p-1 rounded-full bg-secondary/50">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`p-2 rounded-full transition-all duration-300 ${
                  activeTab === item.id
                    ? "bg-hero-gradient text-white"
                    : "text-muted-foreground"
                }`}
              >
                <item.icon className="w-5 h-5" />
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
