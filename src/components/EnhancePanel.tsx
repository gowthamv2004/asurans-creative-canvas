import { useState } from "react";
import { Zap, ArrowUp, Sparkles, Loader2, Upload, Image, Wand2, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { GeneratedImage } from "@/hooks/useGeneratedImages";
import { downloadImage } from "@/lib/imageUtils";

interface EnhancePanelProps {
  selectedImage: GeneratedImage | null;
  onImageSelect: (image: GeneratedImage | null) => void;
  saveImage: (
    imageUrl: string,
    prompt: string,
    style: string,
    generationType?: string,
    parentImageId?: string
  ) => Promise<GeneratedImage | null>;
}

const EnhancePanel = ({ selectedImage, onImageSelect, saveImage }: EnhancePanelProps) => {
  const [upscaleFactor, setUpscaleFactor] = useState([2]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [enhancedImage, setEnhancedImage] = useState<string | null>(null);
  const [editPrompt, setEditPrompt] = useState("");
  const [editMode, setEditMode] = useState<"upscale" | "enhance" | "edit" | "vary">("upscale");

  const { isAuthenticated } = useAuth();

  const callEditImage = async (prompt: string, editType: string) => {
    if (!selectedImage) {
      toast.error("Please select an image first");
      return null;
    }

    const { data, error } = await supabase.functions.invoke("edit-image", {
      body: {
        prompt,
        imageUrl: selectedImage.url,
        editType,
      },
    });

    if (error) throw new Error(error.message);
    if (data?.error) throw new Error(data.error);
    if (!data?.imageUrl) throw new Error("No image received");

    return data.imageUrl;
  };

  const handleAction = async (actionPrompt: string, editType: string, label: string, generationType: string) => {
    setIsProcessing(true);
    try {
      const imageUrl = await callEditImage(actionPrompt, editType);
      if (!imageUrl) return;

      setEnhancedImage(imageUrl);

      if (isAuthenticated && selectedImage) {
        await saveImage(
          imageUrl,
          `${label}: ${selectedImage.prompt}`,
          selectedImage.style,
          generationType,
          selectedImage.id
        );
      }

      toast.success(`${label} completed successfully!`);
    } catch (error) {
      console.error(`${label} error:`, error);
      toast.error(error instanceof Error ? error.message : `Failed to ${label.toLowerCase()}`);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpscale = () =>
    handleAction(
      `Enhance and upscale this image ${upscaleFactor[0]}x with more details, sharper edges, and higher quality. Maintain the original composition and style.`,
      "edit",
      `Upscaled ${upscaleFactor[0]}x`,
      "upscale"
    );

  const handleEnhance = () =>
    handleAction(
      "Enhance this image with better lighting, more vibrant colors, improved contrast, and sharper details while maintaining the original composition.",
      "edit",
      "Enhanced",
      "enhance"
    );

  const handleEdit = () => {
    if (!editPrompt.trim()) {
      toast.error("Please enter an edit description");
      return;
    }
    handleAction(editPrompt, "edit", "Edit", "edit").then(() => setEditPrompt(""));
  };

  const handleVary = () =>
    handleAction(
      selectedImage?.prompt || "Create a creative variation of this image",
      "vary",
      "Variation",
      "variation"
    );

  const handleDownload = async (url: string, type: string) => {
    try {
      await downloadImage(url, `asuran-${type}`);
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to download image");
    }
  };

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-accent/10 text-accent text-sm font-medium">
          <Zap className="w-4 h-4" />
          AI Enhancement & Editing
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          <span className="gradient-text">Edit, Enhance & Vary</span>
          <br />your images
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Upscale resolution, enhance details, edit with AI, or create variations of your images.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6 max-w-6xl mx-auto">
        <div className="glass-card p-6 space-y-6">
          <h3 className="font-display text-xl font-semibold">Enhancement Tools</h3>

          {!selectedImage ? (
            <div className="border-2 border-dashed border-white/20 rounded-xl p-8 text-center hover:border-primary/50 transition-colors">
              <Upload className="w-10 h-10 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-2">Select an image from your gallery</p>
              <p className="text-sm text-muted-foreground">Or generate a new one to enhance</p>
            </div>
          ) : (
            <div className="relative aspect-video rounded-xl overflow-hidden">
              <img src={selectedImage.url} alt={selectedImage.prompt} className="w-full h-full object-cover" />
              <Button size="sm" variant="secondary" className="absolute top-2 right-2" onClick={() => { onImageSelect(null); setEnhancedImage(null); }}>
                Change
              </Button>
            </div>
          )}

          <div className="flex gap-2 flex-wrap">
            {([
              { id: "upscale", label: "Upscale", icon: ArrowUp },
              { id: "enhance", label: "Enhance", icon: Sparkles },
              { id: "edit", label: "Edit", icon: Wand2 },
              { id: "vary", label: "Vary", icon: Shuffle },
            ] as const).map((mode) => (
              <Button key={mode.id} variant={editMode === mode.id ? "default" : "outline"} size="sm" onClick={() => setEditMode(mode.id)} className="gap-2">
                <mode.icon className="w-4 h-4" />
                {mode.label}
              </Button>
            ))}
          </div>

          {editMode === "upscale" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium flex items-center gap-2"><ArrowUp className="w-4 h-4" />Upscale Factor</label>
                <span className="text-sm font-semibold text-primary">{upscaleFactor[0]}x</span>
              </div>
              <Slider value={upscaleFactor} onValueChange={setUpscaleFactor} min={2} max={4} step={1} className="py-4" />
            </div>
          )}

          {editMode === "edit" && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Edit Description</label>
              <Textarea
                placeholder="Describe the changes you want..."
                value={editPrompt}
                onChange={(e) => setEditPrompt(e.target.value)}
                className="min-h-[100px] bg-secondary/50 border-white/10 focus:border-primary resize-none"
              />
            </div>
          )}

          <div className="space-y-3">
            {editMode === "upscale" && (
              <Button onClick={handleUpscale} disabled={isProcessing || !selectedImage} className="w-full h-12 btn-gradient">
                {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Upscaling...</> : <><ArrowUp className="w-5 h-5 mr-2" />Upscale {upscaleFactor[0]}x</>}
              </Button>
            )}
            {editMode === "enhance" && (
              <Button onClick={handleEnhance} disabled={isProcessing || !selectedImage} className="w-full h-12 btn-gradient">
                {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Enhancing...</> : <><Sparkles className="w-5 h-5 mr-2" />Auto Enhance</>}
              </Button>
            )}
            {editMode === "edit" && (
              <Button onClick={handleEdit} disabled={isProcessing || !selectedImage || !editPrompt.trim()} className="w-full h-12 btn-gradient">
                {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Editing...</> : <><Wand2 className="w-5 h-5 mr-2" />Apply Edit</>}
              </Button>
            )}
            {editMode === "vary" && (
              <Button onClick={handleVary} disabled={isProcessing || !selectedImage} className="w-full h-12 btn-gradient">
                {isProcessing ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />Creating Variation...</> : <><Shuffle className="w-5 h-5 mr-2" />Create Variation</>}
              </Button>
            )}
          </div>

          {!isAuthenticated && (
            <p className="text-sm text-muted-foreground text-center">
              <a href="/auth" className="text-primary hover:underline">Sign in</a> to save enhanced images
            </p>
          )}
        </div>

        <div className="glass-card p-6 space-y-4">
          <h3 className="font-display text-xl font-semibold">Enhanced Preview</h3>
          {enhancedImage ? (
            <div className="relative aspect-square rounded-xl overflow-hidden">
              <img src={enhancedImage} alt="Enhanced" className="w-full h-full object-cover" />
              <div className="absolute top-2 left-2 px-3 py-1 rounded-full bg-green-500/20 text-green-400 text-xs font-medium backdrop-blur-sm">Enhanced ✓</div>
            </div>
          ) : (
            <div className="aspect-square rounded-xl bg-secondary/50 flex items-center justify-center">
              <div className="text-center space-y-2">
                <Image className="w-12 h-12 mx-auto text-muted-foreground" />
                <p className="text-muted-foreground text-sm">Enhanced image will appear here</p>
              </div>
            </div>
          )}
          {enhancedImage && selectedImage && (
            <div className="flex gap-2">
              <Button className="flex-1" variant="outline" onClick={() => handleDownload(selectedImage.url, "original")}>Download Original</Button>
              <Button className="flex-1 btn-gradient" onClick={() => handleDownload(enhancedImage, "enhanced")}>Download Enhanced</Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default EnhancePanel;
