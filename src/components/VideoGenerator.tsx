import { useState } from "react";
import { Video, Clock, AlertCircle, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState([5]);
  const [waitlistEmail, setWaitlistEmail] = useState("");
  const [isJoined, setIsJoined] = useState(false);

  const handleJoinWaitlist = () => {
    if (!waitlistEmail.trim() || !waitlistEmail.includes("@")) {
      toast.error("Please enter a valid email");
      return;
    }
    setIsJoined(true);
    toast.success("You've been added to the waitlist! We'll notify you when video generation is available.");
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
          <Video className="w-4 h-4" />
          AI Video Creation
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          Bring your ideas to <span className="gradient-text">motion</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          AI-powered video generation is coming soon. Be the first to know when it launches!
        </p>
      </div>

      {/* Coming Soon Banner */}
      <div className="max-w-4xl mx-auto">
        <div className="glass-card p-8 glow-border text-center space-y-6">
          <div className="w-20 h-20 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
            <Video className="w-10 h-10 text-accent" />
          </div>
          
          <div className="space-y-2">
            <h3 className="font-display text-2xl font-bold">Video Generation Coming Soon</h3>
            <p className="text-muted-foreground max-w-lg mx-auto">
              We're integrating cutting-edge AI video generation technology. Create stunning videos from text descriptions — perfect for social media, presentations, and creative projects.
            </p>
          </div>

          {/* Features Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
            {[
              { title: "Text to Video", desc: "Describe your scene and watch it come to life" },
              { title: "Custom Duration", desc: "Generate videos from 3 to 15 seconds" },
              { title: "HD Quality", desc: "High-definition output ready for sharing" },
            ].map((feature) => (
              <div key={feature.title} className="p-4 rounded-xl bg-secondary/50 space-y-1">
                <p className="font-semibold text-sm">{feature.title}</p>
                <p className="text-xs text-muted-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>

          {/* Waitlist Signup */}
          {isJoined ? (
            <div className="flex items-center justify-center gap-2 text-green-400">
              <CheckCircle2 className="w-5 h-5" />
              <span className="font-medium">You're on the waitlist! We'll notify you when it's ready.</span>
            </div>
          ) : (
            <div className="max-w-md mx-auto space-y-3">
              <p className="text-sm font-medium">Join the waitlist to get early access</p>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="your@email.com"
                    value={waitlistEmail}
                    onChange={(e) => setWaitlistEmail(e.target.value)}
                    className="pl-10 bg-secondary/50 border-white/10"
                  />
                </div>
                <Button onClick={handleJoinWaitlist} className="btn-gradient">
                  Join Waitlist
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Preview Generator (disabled) */}
      <div className="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto opacity-50 pointer-events-none">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <AlertCircle className="w-4 h-4" />
          Preview mode — generation disabled until launch
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium">Video Description</label>
          <Textarea
            placeholder="Describe the video you want to create..."
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] bg-secondary/50 border-white/10 resize-none"
            disabled
          />
        </div>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration
            </label>
            <span className="text-sm text-muted-foreground">{duration[0]} seconds</span>
          </div>
          <Slider value={duration} onValueChange={setDuration} min={3} max={15} step={1} className="py-4" disabled />
        </div>
        <Button disabled className="w-full h-14 text-lg font-semibold">
          <Video className="w-5 h-5 mr-2" />
          Generate Video
        </Button>
      </div>
    </div>
  );
};

export default VideoGenerator;
