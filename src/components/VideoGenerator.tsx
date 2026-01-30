import { useState } from "react";
import { Video, Loader2, Play, Pause, Download, Clock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  duration: number;
  timestamp: Date;
}

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState([5]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedVideo, setGeneratedVideo] = useState<GeneratedVideo | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    
    // Simulate video generation - in a real implementation, this would call an API
    await new Promise((resolve) => setTimeout(resolve, 3000));

    const newVideo: GeneratedVideo = {
      id: Date.now().toString(),
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
      prompt: prompt,
      duration: duration[0],
      timestamp: new Date(),
    };

    setGeneratedVideo(newVideo);
    setIsGenerating(false);
    toast.success("Video generated successfully!");
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
          Create stunning videos from text descriptions. Perfect for social media,
          presentations, and creative projects.
        </p>
      </div>

      {/* Info Banner */}
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 p-4 rounded-xl bg-accent/10 border border-accent/20">
          <AlertCircle className="w-5 h-5 text-accent flex-shrink-0" />
          <p className="text-sm text-muted-foreground">
            Video generation is currently in preview mode. Full AI video generation will be available soon!
          </p>
        </div>
      </div>

      {/* Generator Card */}
      <div className="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto glow-border">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Video Description</label>
          <Textarea
            placeholder="Describe the video you want to create... (e.g., 'A timelapse of a flower blooming in a garden')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] bg-secondary/50 border-white/10 focus:border-accent resize-none"
          />
        </div>

        {/* Duration Slider */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Duration
            </label>
            <span className="text-sm text-muted-foreground">
              {duration[0]} seconds
            </span>
          </div>
          <Slider
            value={duration}
            onValueChange={setDuration}
            min={3}
            max={15}
            step={1}
            className="py-4"
          />
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>3s</span>
            <span>15s</span>
          </div>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={isGenerating || !prompt.trim()}
          className="w-full h-14 text-lg font-semibold bg-accent hover:bg-accent/90 text-accent-foreground"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-5 h-5 mr-2 animate-spin" />
              Generating Video...
            </>
          ) : (
            <>
              <Video className="w-5 h-5 mr-2" />
              Generate Video
            </>
          )}
        </Button>
      </div>

      {/* Generated Video Preview */}
      {generatedVideo && (
        <div className="max-w-4xl mx-auto animate-scale-in">
          <div className="glass-card p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Generated Video</h3>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="gap-2"
                >
                  {isPlaying ? (
                    <Pause className="w-4 h-4" />
                  ) : (
                    <Play className="w-4 h-4" />
                  )}
                  {isPlaying ? "Pause" : "Play"}
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
            </div>
            
            <div className="relative aspect-video overflow-hidden rounded-xl bg-black">
              <video
                src={generatedVideo.url}
                className="w-full h-full object-cover"
                autoPlay={isPlaying}
                loop
                muted
                playsInline
              />
              {!isPlaying && (
                <div
                  className="absolute inset-0 flex items-center justify-center bg-black/30 cursor-pointer"
                  onClick={() => setIsPlaying(true)}
                >
                  <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                    <Play className="w-8 h-8 text-white ml-1" />
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Duration: {generatedVideo.duration}s</span>
              <span>{generatedVideo.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoGenerator;
