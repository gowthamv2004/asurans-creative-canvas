import { useState, useRef } from "react";
import { Sparkles, Wand2, Loader2, Download, Star, Upload, Image as ImageIcon, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import StylePresets, { StylePreset, presets } from "./StylePresets";
import PromptHistory from "./PromptHistory";
import { usePromptHistory } from "@/hooks/usePromptHistory";
import { downloadImage } from "@/lib/imageUtils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/useAuth";
import { useGeneratedImages, GeneratedImage } from "@/hooks/useGeneratedImages";

interface ImageGeneratorProps {
  onImageGenerated: (image: GeneratedImage) => void;
}

const ImageGenerator = ({ onImageGenerated }: ImageGeneratorProps) => {
  const [prompt, setPrompt] = useState("");
  const [selectedPreset, setSelectedPreset] = useState<StylePreset>(presets[0]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState<GeneratedImage | null>(null);
  const [referenceImage, setReferenceImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isAuthenticated } = useAuth();
  const { saveImage, toggleFavorite } = useGeneratedImages();

  const {
    history,
    favorites,
    addToHistory,
    toggleFavorite: toggleHistoryFavorite,
    removeFromHistory,
    clearHistory,
  } = usePromptHistory();

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        toast.error("Please upload an image file");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setReferenceImage(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const clearReferenceImage = () => {
    setReferenceImage(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast.error("Please enter a prompt");
      return;
    }

    setIsGenerating(true);

    try {
      let result;
      
      if (referenceImage) {
        // Image-to-image generation
        const { data, error } = await supabase.functions.invoke("edit-image", {
          body: {
            prompt: `${prompt}. Style: ${selectedPreset.prompt}`,
            imageUrl: referenceImage,
            editType: "reference",
          },
        });

        if (error) throw new Error(error.message || "Failed to generate image");
        if (data?.error) throw new Error(data.error);
        if (!data?.imageUrl) throw new Error("No image received from AI");
        
        result = data;
      } else {
        // Text-to-image generation
        const { data, error } = await supabase.functions.invoke("generate-image", {
          body: {
            prompt: prompt,
            style: selectedPreset.prompt,
          },
        });

        if (error) throw new Error(error.message || "Failed to generate image");
        if (data?.error) throw new Error(data.error);
        if (!data?.imageUrl) throw new Error("No image received from AI");
        
        result = data;
      }

      const generationType = referenceImage ? "image-to-image" : "text-to-image";
      
      // Save to database if authenticated
      if (isAuthenticated) {
        const savedImage = await saveImage(
          result.imageUrl,
          prompt,
          selectedPreset.name,
          generationType
        );
        
        if (savedImage) {
          setGeneratedImage(savedImage);
          onImageGenerated(savedImage);
        }
      } else {
        // For unauthenticated users, just display the image
        const newImage: GeneratedImage = {
          id: Date.now().toString(),
          url: result.imageUrl,
          prompt: prompt,
          style: selectedPreset.name,
          timestamp: new Date(),
          isFavorite: false,
          generationType,
        };
        setGeneratedImage(newImage);
        onImageGenerated(newImage);
      }

      addToHistory(prompt, selectedPreset.name, result.imageUrl);
      toast.success("Image generated successfully!");
      clearReferenceImage();
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
    } catch {
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

  const handleToggleFavorite = async () => {
    if (!generatedImage) return;
    
    if (isAuthenticated) {
      await toggleFavorite(generatedImage.id);
      setGeneratedImage((prev) =>
        prev ? { ...prev, isFavorite: !prev.isFavorite } : null
      );
    } else {
      const historyItem = history.find((h) => h.prompt === generatedImage.prompt);
      if (historyItem) {
        toggleHistoryFavorite(historyItem.id);
      }
    }
    
    toast.success(
      generatedImage.isFavorite ? "Removed from favorites" : "Added to favorites"
    );
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
            {/* Reference Image Upload */}
            <div className="space-y-2">
              <label className="text-sm font-medium flex items-center gap-2">
                <Upload className="w-4 h-4" />
                Reference Image (Optional)
              </label>
              
              {referenceImage ? (
                <div className="relative inline-block">
                  <img
                    src={referenceImage}
                    alt="Reference"
                    className="w-32 h-32 object-cover rounded-xl border border-white/10"
                  />
                  <button
                    onClick={clearReferenceImage}
                    className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-white/20 rounded-xl p-6 text-center hover:border-primary/50 transition-colors cursor-pointer"
                >
                  <ImageIcon className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">
                    Click to upload a reference image for image-to-image generation
                  </p>
                </div>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />
            </div>

            {/* Prompt Input */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Your Prompt</label>
              <Textarea
                placeholder={
                  referenceImage
                    ? "Describe how to transform this image... (e.g., 'Make it look like a watercolor painting')"
                    : "Describe the image you want to create... (e.g., 'A majestic dragon flying over a mountain range at sunset')"
                }
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
                  {referenceImage ? "Transforming..." : "Generating with AI..."}
                </>
              ) : (
                <>
                  <Wand2 className="w-5 h-5 mr-2" />
                  {referenceImage ? "Transform Image" : "Generate Image"}
                </>
              )}
            </Button>

            {!isAuthenticated && (
              <p className="text-sm text-muted-foreground text-center">
                <a href="/auth" className="text-primary hover:underline">Sign in</a> to save your generated images
              </p>
            )}
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
                      onClick={handleToggleFavorite}
                    >
                      <Star
                        className={`w-4 h-4 ${
                          generatedImage.isFavorite ? "fill-primary text-primary" : ""
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
            onToggleFavorite={toggleHistoryFavorite}
            onRemove={removeFromHistory}
            onClearHistory={clearHistory}
          />
        </div>
      </div>
    </div>
  );
};

export default ImageGenerator;
