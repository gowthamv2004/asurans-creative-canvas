import { useState } from "react";
import Header from "@/components/Header";
import ImageGenerator from "@/components/ImageGenerator";
import VideoGenerator from "@/components/VideoGenerator";
import Gallery from "@/components/Gallery";
import EnhancePanel from "@/components/EnhancePanel";
import AdminPanel from "@/components/AdminPanel";
import BackgroundVideo from "@/components/BackgroundVideo";

import { useGeneratedImages, GeneratedImage } from "@/hooks/useGeneratedImages";
import { useUserRole } from "@/hooks/useUserRole";

const Index = () => {
  const [activeTab, setActiveTab] = useState("generate");
  const [selectedEnhanceImage, setSelectedEnhanceImage] = useState<GeneratedImage | null>(null);
  const { isAdmin } = useUserRole();
  const { images, saveImage, toggleFavorite, deleteImage, refetch } = useGeneratedImages();

  const handleEnhanceImage = (image: GeneratedImage) => {
    setSelectedEnhanceImage(image);
    setActiveTab("enhance");
  };

  const handleDeleteImage = (id: string) => {
    deleteImage(id);
  };

  return (
    <div className="min-h-screen bg-background">
      <BackgroundVideo />
      <Header activeTab={activeTab} onTabChange={setActiveTab} isAdmin={isAdmin} />

      <main className="relative z-10 pt-28 pb-16 px-4">
        <div className="container mx-auto">
          {activeTab === "generate" && (
            <ImageGenerator
              onImageGenerated={() => refetch()}
              saveImage={saveImage}
            />
          )}
          {activeTab === "video" && <VideoGenerator />}
          {activeTab === "gallery" && (
            <Gallery
              images={images}
              onEnhance={handleEnhanceImage}
              onDelete={handleDeleteImage}
              toggleFavorite={toggleFavorite}
            />
          )}
          {activeTab === "enhance" && (
            <EnhancePanel
              selectedImage={selectedEnhanceImage}
              onImageSelect={setSelectedEnhanceImage}
              saveImage={saveImage}
            />
          )}
          {activeTab === "admin" && isAdmin && <AdminPanel />}
        </div>
      </main>

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
