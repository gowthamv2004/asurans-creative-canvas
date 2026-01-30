import { useState } from "react";
import { Download, Maximize2, Trash2, Zap, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { downloadImage } from "@/lib/imageUtils";
import { toast } from "sonner";

interface GalleryImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: Date;
}

interface GalleryProps {
  images: GalleryImage[];
  onEnhance: (image: GalleryImage) => void;
  onDelete: (id: string) => void;
}

const Gallery = ({ images, onEnhance, onDelete }: GalleryProps) => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);

  const handleDownload = async (image: GalleryImage) => {
    try {
      await downloadImage(image.url, `asuran-${image.style.toLowerCase()}`);
      toast.success("Image downloaded!");
    } catch (error) {
      toast.error("Failed to download image");
    }
  };

  if (images.length === 0) {
    return (
      <div className="text-center py-20 space-y-4">
        <div className="w-24 h-24 mx-auto rounded-full bg-secondary/50 flex items-center justify-center">
          <span className="text-4xl">🖼️</span>
        </div>
        <h3 className="font-display text-2xl font-semibold">No images yet</h3>
        <p className="text-muted-foreground max-w-md mx-auto">
          Start generating images and they'll appear here. Build your collection
          of AI-created masterpieces!
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-3xl font-bold">Your Gallery</h2>
          <p className="text-muted-foreground">
            {images.length} image{images.length !== 1 ? "s" : ""} generated
          </p>
        </div>
      </div>

      {/* Gallery Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {images.map((image) => (
          <div
            key={image.id}
            className="image-card aspect-square animate-fade-in group"
          >
            <img
              src={image.url}
              alt={image.prompt}
              className="w-full h-full object-cover"
            />
            
            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex flex-col justify-end p-4 z-10">
              <p className="text-sm text-white/90 line-clamp-2 mb-2">
                {image.prompt}
              </p>
              <div className="flex items-center justify-between">
                <span className="text-xs text-white/60">{image.style}</span>
                <div className="flex gap-1">
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-white/20"
                    onClick={() => setSelectedImage(image)}
                  >
                    <Maximize2 className="w-4 h-4 text-white" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-white/20"
                    onClick={() => handleDownload(image)}
                  >
                    <Download className="w-4 h-4 text-white" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-white/20"
                    onClick={() => onEnhance(image)}
                  >
                    <Zap className="w-4 h-4 text-white" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 hover:bg-destructive/50"
                    onClick={() => onDelete(image.id)}
                  >
                    <Trash2 className="w-4 h-4 text-white" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Fullscreen Dialog */}
      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl p-0 bg-transparent border-0">
          <DialogHeader className="sr-only">
            <DialogTitle>Image Preview</DialogTitle>
          </DialogHeader>
          {selectedImage && (
            <div className="relative">
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-4 right-4 z-20 bg-black/50 hover:bg-black/70"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-5 h-5" />
              </Button>
              <img
                src={selectedImage.url}
                alt={selectedImage.prompt}
                className="w-full h-auto max-h-[90vh] object-contain rounded-xl"
              />
              <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black/80 to-transparent rounded-b-xl">
                <p className="text-white font-medium mb-2">
                  {selectedImage.prompt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-white/60 text-sm">
                    {selectedImage.style}
                  </span>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="gap-2"
                      onClick={() => handleDownload(selectedImage)}
                    >
                      <Download className="w-4 h-4" />
                      Download
                    </Button>
                    <Button
                      size="sm"
                      className="gap-2 btn-gradient"
                      onClick={() => {
                        onEnhance(selectedImage);
                        setSelectedImage(null);
                      }}
                    >
                      <Zap className="w-4 h-4" />
                      Enhance
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Gallery;
