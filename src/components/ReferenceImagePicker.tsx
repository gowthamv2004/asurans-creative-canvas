import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, GalleryHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { GeneratedImage } from "@/hooks/useGeneratedImages";
import { toast } from "sonner";

interface ReferenceImagePickerProps {
  referenceImages: string[];
  onImagesChange: (images: string[]) => void;
  galleryImages: GeneratedImage[];
  maxImages?: number;
}

const ReferenceImagePicker = ({
  referenceImages,
  onImagesChange,
  galleryImages,
  maxImages = 4,
}: ReferenceImagePickerProps) => {
  const [galleryOpen, setGalleryOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const remaining = maxImages - referenceImages.length;

    if (files.length > remaining) {
      toast.error(`You can add up to ${remaining} more reference image(s)`);
    }

    const filesToProcess = files.slice(0, remaining);

    filesToProcess.forEach((file) => {
      if (!file.type.startsWith("image/")) {
        toast.error(`${file.name} is not an image file`);
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        onImagesChange([...referenceImages, result]);
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeImage = (index: number) => {
    onImagesChange(referenceImages.filter((_, i) => i !== index));
  };

  const addFromGallery = (image: GeneratedImage) => {
    if (referenceImages.length >= maxImages) {
      toast.error(`Maximum ${maxImages} reference images allowed`);
      return;
    }
    if (referenceImages.includes(image.url)) {
      toast.error("This image is already added as reference");
      return;
    }
    onImagesChange([...referenceImages, image.url]);
    setGalleryOpen(false);
  };

  return (
    <div className="space-y-3">
      <label className="text-sm font-medium flex items-center gap-2">
        <Upload className="w-4 h-4" />
        Reference Images (Optional — up to {maxImages})
      </label>

      {/* Thumbnails of selected references */}
      {referenceImages.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {referenceImages.map((img, i) => (
            <div key={i} className="relative group">
              <img
                src={img}
                alt={`Reference ${i + 1}`}
                className="w-24 h-24 object-cover rounded-xl border border-white/10"
              />
              <button
                onClick={() => removeImage(i)}
                className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Add more actions */}
      {referenceImages.length < maxImages && (
        <div className="flex flex-wrap gap-2">
          <label
            htmlFor="multi-ref-upload"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-white/20 text-sm text-muted-foreground hover:border-primary/50 hover:text-foreground transition-colors cursor-pointer"
          >
            <ImageIcon className="w-4 h-4" />
            Upload Image
          </label>
          <input
            id="multi-ref-upload"
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleFileUpload}
            className="hidden"
          />

          {galleryImages.length > 0 && (
            <Dialog open={galleryOpen} onOpenChange={setGalleryOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <GalleryHorizontal className="w-4 h-4" />
                  From Gallery
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[70vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Select from Gallery</DialogTitle>
                </DialogHeader>
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-3 mt-4">
                  {galleryImages.map((image) => (
                    <button
                      key={image.id}
                      onClick={() => addFromGallery(image)}
                      className="aspect-square rounded-xl overflow-hidden border border-white/10 hover:border-primary/60 transition-colors focus:outline-none focus:ring-2 focus:ring-primary"
                    >
                      <img
                        src={image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}
        </div>
      )}
    </div>
  );
};

export default ReferenceImagePicker;
