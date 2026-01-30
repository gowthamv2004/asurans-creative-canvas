import { useState } from "react";
import { Sparkles, Wand2, Loader2, Download, Maximize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StylePresets, { StylePreset, presets } from "./StylePresets";
import { toast } from "sonner";

interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: Date;
}

interface ImageGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

const ImageGenerator = ({ onImageGenerated }: ImageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(presets[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);
    
    // Simulate AI generation with placeholder
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Create a mock generated image
    const newImage: GeneratedImage = {
      id: Date.now().toString(),
      url: `https://picsum.photos/seed/${Date.now()}/800/800`,
      prompt: prompt,
      style: selectedPreset.name,
      timestamp: new Date(),
    };

    setGeneratedImage(newImage);
    onImageGenerated(newImage);
    setIsGenerating(false);
    toast.success("Image generated successfully!");
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Sparkles className="w-4 h-4" />
          AI-Powered Image Generation
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          Create <span className="gradient-text">stunning visuals</span>
          <br />with just words
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Transform your imagination into reality. Describe what you want to see,
          choose a style, and let our AI create breathtaking images.
        </p>
      </div>

      {/* Generator Card */}
      <div className="glass-card p-6 md:p-8 space-y-6 max-w-4xl mx-auto glow-border">
        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Your Prompt</label>
          <Textarea
            placeholder="Describe the image you want to create... (e.g., 'A majestic dragon flying over a mountain range at sunset')"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[120px] bg-secondary/50 border-white/10 focus:border-primary resize-none"
          />
        </div>

        {/* Style Presets */}
        <StylePresets
          selectedPreset={selectedPreset.id}
          onSelectPreset={setSelectedPreset}
        />

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
              Generate Image
            </>
          )}
        </Button>
      </div>

      {/* Generated Image Preview */}
      {generatedImage && (
        <div className="max-w-4xl mx-auto animate-scale-in">
          <div className="glass-card p-4 md:p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-display text-lg font-semibold">Generated Result</h3>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" className="gap-2">
                  <Download className="w-4 h-4" />
                  Download
                </Button>
                <Button variant="outline" size="sm" className="gap-2">
                  <Maximize2 className="w-4 h-4" />
                  Fullscreen
                </Button>
              </div>
            </div>
            
            <div className="image-card aspect-square md:aspect-video overflow-hidden rounded-xl">
              <img
                src={generatedImage.url}
                alt={generatedImage.prompt}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            </div>

            <div className="flex items-center justify-between text-sm text-muted-foreground">
              <span>Style: {generatedImage.style}</span>
              <span>{generatedImage.timestamp.toLocaleTimeString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGenerator;
