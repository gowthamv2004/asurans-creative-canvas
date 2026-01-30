import { useState } from "react";
import { Sparkles, Wand2, Loader2, Download, Maximize2, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StylePresets, { StylePreset, presets } from "./StylePresets";
import PromptHistory from "./PromptHistory";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { downloadImage } from "@/lib/imageUtils";
import { supabase } from "@/integrations/supabase/client";
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

  const {
    history,
    favorites,
    addToHistory,
    toggleFavorite,
    removeFromHistory,
    clearHistory,
  } = usePromptHistory();

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      const { data, error } = await supabase.functions.invoke("generate-image", {
        body: {
          prompt: prompt,
          style: selectedPreset.prompt,
        },
      });

      if (error) {
        console.error("Edge function error:", error);
        throw new Error(error.message || "Failed to generate image");
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      if (!data?.imageUrl) {
        throw new Error("No image received from AI");
      }

      const newImage: GeneratedImage = {
        id: Date.now().toString(),
        url: data.imageUrl,
        prompt: prompt,
        style: selectedPreset.name,
        timestamp: new Date(),
      };

      setGeneratedImage(newImage);
      onImageGenerated(newImage);
      addToHistory(prompt, selectedPreset.name, data.imageUrl);
      toast.success("Image generated successfully!");
    } catch (error) {
      console.error("Generation error:", error);
      toast.error(error instanceof Error ? error.message : "Failed to generate image");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) return;

    try {
      await downloadImage(generatedImage.url, `asuran-${generatedImage.style.toLowerCase()}`);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  const handleSelectFromHistory = (historyPrompt: string, style: string) => {
    setPrompt(historyPrompt);
    const preset = presets.find((p) => p.name === style);
    if (preset) {
      setSelectedPreset(preset);
    }
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

      <div className="grid lg:grid-cols-[1fr_320px] gap-6 max-w-6xl mx-auto">
        {/* Main Generator */}
        <div className="space-y-6">
          {/* Generator Card */}
          <div className="glass-card p-6 md:p-8 space-y-6 glow-border">
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
                  Generating with AI...
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
            <div className="animate-scale-in">
              <div className="glass-card p-4 md:p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-semibold">Generated Result</h3>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={() => {
                        const historyItem = history.find(
                          (h) => h.prompt === generatedImage.prompt
                        );
                        if (historyItem) {
                          toggleFavorite(historyItem.id);
                          toast.success(
                            historyItem.isFavorite
                              ? "Removed from favorites"
                              : "Added to favorites"
                          );
                        }
                      }}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          history.find(
                            (h) => h.prompt === generatedImage.prompt && h.isFavorite
                          )
                            ? "fill-primary text-primary"
                            : ""
                        }`}
                      />
                      Favorite
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2"
                      onClick={handleDownload}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="image-card aspect-square md:aspect-video overflow-hidden rounded-xl group">
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

        {/* Sidebar - History & Favorites */}
        <div className="space-y-4">
          <h3 className="font-display text-lg font-semibold">Prompt History</h3>
          <PromptHistory
            history={history}
            favorites={favorites}
            onSelectPrompt={handleSelectFromHistory}
            onToggleFavorite={toggleFavorite}
            onRemove={removeFromHistory}
            onClearHistory={clearHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
