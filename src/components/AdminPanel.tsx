import { useState } from "react";
import { Shield, Users, Image as ImageIcon, Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useGeneratedImages, GeneratedImage } from "@/hooks/useGeneratedImages";
import { downloadImage } from "@/lib/imageUtils";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const AdminPanel = () => {
  const { images, isLoading } = useGeneratedImages(true); // adminViewAll = true
  const [searchTerm, setSearchTerm] = useState("");

  // Group images by userId
  const imagesByUser = images.reduce((acc, img) => {
    const uid = img.userId || "unknown";
    if (!acc[uid]) acc[uid] = [];
    acc[uid].push(img);
    return acc;
  }, {} as Record<string, GeneratedImage[]>);

  const filteredImages = searchTerm
    ? images.filter(
        (img) =>
          img.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.style.toLowerCase().includes(searchTerm.toLowerCase()) ||
          img.userId?.includes(searchTerm)
      )
    : images;

  const handleDownload = async (image: GeneratedImage) => {
    try {
      await downloadImage(image.url, `admin-${image.style.toLowerCase()}`);
      toast.success("Image downloaded!");
    } catch {
      toast.error("Failed to download");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-destructive/10 text-destructive text-sm font-medium">
          <Shield className="w-4 h-4" />
          Admin Dashboard
        </div>
        <h2 className="font-display text-4xl md:text-5xl font-bold">
          All <span className="gradient-text">User Activity</span>
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          View all users' image generation history across the platform.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
        <div className="glass-card p-6 text-center">
          <Users className="w-8 h-8 mx-auto text-primary mb-2" />
          <p className="text-2xl font-bold">{Object.keys(imagesByUser).length}</p>
          <p className="text-sm text-muted-foreground">Total Users</p>
        </div>
        <div className="glass-card p-6 text-center">
          <ImageIcon className="w-8 h-8 mx-auto text-accent mb-2" />
          <p className="text-2xl font-bold">{images.length}</p>
          <p className="text-sm text-muted-foreground">Total Images</p>
        </div>
        <div className="glass-card p-6 text-center">
          <ImageIcon className="w-8 h-8 mx-auto text-green-400 mb-2" />
          <p className="text-2xl font-bold">{images.filter((i) => i.isFavorite).length}</p>
          <p className="text-sm text-muted-foreground">Favorited</p>
        </div>
      </div>

      {/* Search */}
      <div className="max-w-4xl mx-auto">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            placeholder="Search by prompt, style, or user ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 bg-secondary/50 border-white/10"
          />
        </div>
      </div>

      {/* All Images Grid */}
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredImages.map((image) => (
            <div
              key={image.id}
              className="glass-card overflow-hidden rounded-xl group"
            >
              <div className="aspect-square overflow-hidden">
                <img
                  src={image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </div>
              <div className="p-3 space-y-2">
                <p className="text-sm line-clamp-2">{image.prompt}</p>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{image.style}</span>
                  <span>{image.generationType}</span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>User: {image.userId?.slice(0, 8)}...</span>
                  <span>{image.timestamp.toLocaleDateString()}</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => handleDownload(image)}
                >
                  Download
                </Button>
              </div>
            </div>
          ))}
        </div>

        {filteredImages.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No images found.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;
