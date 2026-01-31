import { useState } from "react";
import Header from "@/components/Header";
import ImageGenerator from "@/components/ImageGenerator";
import VideoGenerator from "@/components/VideoGenerator";
import Gallery from "@/components/Gallery";
import EnhancePanel from "@/components/EnhancePanel";
import { toast } from "sonner";
import { GeneratedImage } from "@/hooks/useGeneratedImages";

const Index = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [galleryImages, setGalleryImages] = useState<GeneratedImage[]>([]);
  const [selectedEnhanceImage, setSelectedEnhanceImage] = useState<GeneratedImage | null>(null);

  const handleImageGenerated = (image: GeneratedImage) => {
    setGalleryImages((prev) => [image, ...prev]);
  };

  const handleDeleteImage = (id: string) => {
    setGalleryImages((prev) => prev.filter((img) => img.id !== id));
    toast.success("Image deleted");
  };

  const handleEnhanceImage = (image: GeneratedImage) => {
    setSelectedEnhanceImage(image);
    setActiveTab("enhance");
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-glow-primary/20 rounded-full blur-[120px] animate-float" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-glow-accent/20 rounded-full blur-[100px] animate-float" style={{ animationDelay: "-3s" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-glow-warm/10 rounded-full blur-[150px]" />
      </div>

      <Header activeTab={activeTab} onTabChange={setActiveTab} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="container mx-auto">
          {activeTab === "generate" && (
            <ImageGenerator onImageGenerated={handleImageGenerated} />
          )}
          {activeTab === "video" && <VideoGenerator />}
          {activeTab === "gallery" && (
            <Gallery
              images={galleryImages}
              onEnhance={handleEnhanceImage}
              onDelete={handleDeleteImage}
            />
          )}
          {activeTab === "enhance" && (
            <EnhancePanel
              selectedImage={selectedEnhanceImage}
              onImageSelect={setSelectedEnhanceImage}
            />
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/5 py-8">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>
            © 2024 <span className="gradient-text font-semibold">Asuran's AI</span>. 
            All rights reserved. Powered by Lovable AI.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
