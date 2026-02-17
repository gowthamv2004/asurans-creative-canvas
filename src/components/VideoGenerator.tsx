import { useState, useRef, useCallback, useEffect } from "react";
import { Video, Clock, Loader2, Download, Wand2, Sparkles, ImageIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Slider } from "@/components/ui/slider";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";

const VideoGenerator = () => {
  const [prompt, setPrompt] = useState("");
  const [duration, setDuration] = useState([5]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const stopPolling = useCallback(() => {
    if (pollRef.current) {
      clearInterval(pollRef.current);
      pollRef.current = null;
    }
  }, []);

  const pollForResult = useCallback((id: string) => {
    let attempts = 0;
    pollRef.current = setInterval(async () => {
      attempts++;
      setProgress(Math.min(10 + attempts * 2, 90));

      try {
        const { data, error } = await supabase.functions.invoke("generate-video?action=poll", {
          body: { taskId: id },
        });

        if (error) throw new Error(error.message);
        if (data?.error) throw new Error(data.error);

        if (data?.status === "SUCCEEDED" && data?.videoUrl) {
          stopPolling();
          setProgress(100);
          setGeneratedVideoUrl(data.videoUrl);
          setIsGenerating(false);
          setTaskId(null);
          toast.success("Video generated successfully!");
        } else if (data?.status === "FAILED") {
          stopPolling();
          setIsGenerating(false);
          setTaskId(null);
          setProgress(0);
          toast.error(data.failure || "Video generation failed");
        }
        // PENDING/RUNNING: keep polling
      } catch (err) {
        console.error("Poll error:", err);
        if (attempts > 60) {
          stopPolling();
          setIsGenerating(false);
          setTaskId(null);
          setProgress(0);
          toast.error("Video generation timed out");
        }
      }
    }, 5000);
  }, [stopPolling]);

  useEffect(() => {
    return () => stopPolling();
  }, [stopPolling]);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setReferenceImage(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a video description");
      return;
    }

    setIsGenerating(true);
    setProgress(5);
    setGeneratedVideoUrl(null);

    try {
      const { data, error } = await supabase.functions.invoke("generate-video", {
        body: { prompt, duration: duration[0], imageUrl: referenceImage },
      });

      if (error) throw new Error(error.message || "Failed to start video generation");
      if (data?.error) throw new Error(data.error);
      if (!data?.taskId) throw new Error("No task ID received");

      setTaskId(data.taskId);
      pollForResult(data.taskId);
    } catch (error) {
      console.error("Video generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate video");
      setIsGenerating(false);
      setProgress(0);
    }
  };

  const handleDownload = async () => {
    if (!generatedVideoUrl) return;
    try {
      const res = await fetch(generatedVideoUrl);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `asuran-video-${Date.now()}.mp4`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Video downloaded!");
    } catch {
      toast.error("Failed to download video");
    }
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
          Generate stunning AI videos from text descriptions or reference images using Runway ML.
        </p>
      </div>

      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-card p-6 md:p-8 space-y-6 glow-border">
          {/* Reference Image (optional) */}
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <ImageIcon className="w-4 h-4" />
              Reference Image (optional)
            </label>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
            {referenceImage ? (
              <div className="relative w-32 h-20 rounded-lg overflow-hidden group">
                <img src={referenceImage} alt="Reference" className="w-full h-full object-cover" />
                <button
                  onClick={() => setReferenceImage(null)}
                  className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-xs text-white"
                >
                  Remove
                </button>
              </div>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={() => fileInputRef.current?.click()}
                className="gap-2"
              >
                <ImageIcon className="w-4 h-4" />
                Upload Image
              </Button>
            )}
            <p className="text-xs text-muted-foreground">
              {referenceImage ? "Image-to-video mode" : "Add an image to use image-to-video generation"}
            </p>
          </div>

          {/* Prompt Input */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Video Description</label>
            <Textarea
              placeholder="Describe the video you want to create... e.g. 'A cinematic aerial shot of a futuristic city at sunset'"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[120px] bg-secondary/50 border-white/10 focus:border-accent resize-none"
              disabled={isGenerating}
            />
          </div>

          {/* Duration */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4" />
                Duration
              </label>
              <span className="text-sm text-muted-foreground">{duration[0]} seconds</span>
            </div>
            <Slider
              value={duration}
              onValueChange={setDuration}
              min={5}
              max={10}
              step={5}
              className="py-4"
              disabled={isGenerating}
            />
          </div>

          {/* Progress */}
          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Generating video...
                </span>
                <span className="text-muted-foreground">{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
              <p className="text-xs text-muted-foreground text-center">
                This may take 1-3 minutes depending on complexity
              </p>
            </div>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating || !prompt.trim()}
            className="w-full h-14 text-lg font-semibold btn-gradient"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Wand2 className="w-5 h-5 mr-2" />
                Generate Video
              </>
            )}
          </Button>
        </div>

        {/* Generated Video Preview */}
        {generatedVideoUrl && (
          <div className="animate-scale-in">
            <div className="glass-card p-4 md:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg font-semibold flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-accent" />
                  Generated Video
                </h3>
                <Button variant="outline" size="sm" className="gap-2" onClick={handleDownload}>
                  <Download className="w-4 h-4" />
                  Download
                </Button>
              </div>
              <div className="rounded-xl overflow-hidden bg-black">
                <video
                  src={generatedVideoUrl}
                  controls
                  autoPlay
                  loop
                  className="w-full aspect-video"
                />
              </div>
              <p className="text-sm text-muted-foreground">{prompt}</p>
            </div>
          </div>
        )}

        {/* Features */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: "Text to Video", desc: "Describe your scene and watch it come to life" },
            { title: "Image to Video", desc: "Animate any image with AI-powered motion" },
            { title: "HD Quality", desc: "High-definition 1280×720 output ready for sharing" },
          ].map((feature) => (
            <div key={feature.title} className="glass-card p-4 space-y-1 text-center">
              <p className="font-semibold text-sm">{feature.title}</p>
              <p className="text-xs text-muted-foreground">{feature.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default VideoGenerator;
