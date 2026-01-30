import { useState } from "react";
import { Zap, ArrowUp, Sparkles, Loader2, Upload, Image } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

interface EnhanceImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: Date;
}

interface EnhancePanelProps {
  selectedImage: EnhanceImage | null;
  onImageSelect: (image: EnhanceImage | null) => void;
}

const EnhancePanel = ({ selectedImage, onImageSelect }: EnhancePanelProps) => {
  const [upscaleFactor, setUpscaleFactor] = useState([2]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);

  const handleUpscale = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);
    
    // Simulate upscaling
    await new Promise((resolve) => setTimeout(resolve, 2500));

    setEnhancedImage(selectedImage.url);
    setIsProcessing(false);
    toast.success(`Image upscaled ${upscaleFactor[0]}x successfully!`);
  };

  const handleEnhance = async () => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return;
    }

    setIsProcessing(true);
    
    // Simulate enhancement
    await new Promise((resolve) => setTimeout(resolve, 2000));

    setEnhancedImage(selectedImage.url);
    setIsProcessing(false);
    toast.success("Image enhanced successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-glow-pink/10 text-glow-pink text-sm font-medium">
          <Zap className="w-4 h-4" />
          AI Enhancement
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          <span className="gradient-text">Upscale & Enhance</span>
          <br />your images
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Boost resolution up to 4x and enhance details with our AI-powered tools.
          Perfect for printing and high-resolution displays.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        {/* Controls */}
        <div className="glass-card p-6 space-y-6">
          <h3 className="font-display text-xl font-semibold">Enhancement Tools</h3>

          {/* Image Upload/Select */}
          {!selectedImage ? (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">
                Select an image from your gallery
              </p>
              <p className="text-sm text-muted-foreground">
                Or generate a new one to enhance
              </p>
            </div>
          ) : (
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="w-full h-full object-cover"
              />
              <Button
                size="sm"
                variant="secondary"
                className="absolute top-2 right-2"
                onClick={() => {
                  onImageSelect(null);
                  setEnhancedImage(null);
                }}
              >
                Change
              </Button>
            </div>
          )}

          {/* Upscale Control */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium flex items-center gap-2">
                <ArrowUp className="w-4 h-4" />
                Upscale Factor
              </label>
              <span className="text-sm font-semibold text-primary">
                {upscaleFactor[0]}x
              </span>
            </div>
            <Slider
              value={upscaleFactor}
              onValueChange={setUpscaleFactor}
              min={2}
              max={4}
              step={1}
              className="py-4"
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>2x</span>
              <span>3x</span>
              <span>4x</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleUpscale}
              disabled={isProcessing || !selectedImage}
              className="w-full h-12 btn-gradient"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <ArrowUp className="w-5 h-5 mr-2" />
                  Upscale {upscaleFactor[0]}x
                </>
              )}
            </Button>
            
            <Button
              onClick={handleEnhance}
              disabled={isProcessing || !selectedImage}
              variant="outline"
              className="w-full h-12"
            >
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Auto Enhance
                </>
              )}
            </Button>
          </div>

          {/* Info */}
          <div className="p-4 bg-secondary/50 rounded-xl text-sm text-muted-foreground">
            <p>
              <strong className="text-foreground">Pro tip:</strong> Upscaling works best
              with images that have clear details. Very blurry images may not improve
              significantly.
            </p>
          </div>
        </div>

        {/* Preview */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display text-xl font-semibold">Enhanced Preview</h3>
          
          {enhancedImage ? (
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img
                src={enhancedImage}
                alt="Enhanced"
                className="w-full h-full object-cover"
              />
              <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium backdrop-blur-sm">
                Enhanced ✓
              </div>
            </div>
          ) : (
            <div className="aspect-square rounded-xl bg-secondary/50 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Image className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground text-sm">
                  Enhanced image will appear here
                </p>
              </div>
            </div>
          )}

          {enhancedImage && (
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline">
                Download Original
              </Button>
              <Button className="flex-1 btn-gradient">
                Download Enhanced
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancePanel;
