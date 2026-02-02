import { useState } from "react";
import Header from "@/components/Header";
import ImageGenerator from "@/components/ImageGenerator";
import VideoGenerator from "@/components/VideoGenerator";
import Gallery from "@/components/Gallery";
import EnhancePanel from "@/components/EnhancePanel";
import BackgroundVideo from "@/components/BackgroundVideo";
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
      {/* Background Video */}
      <BackgroundVideo />

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
