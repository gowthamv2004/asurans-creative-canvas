import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";
import { toast } from "sonner";

export interface GeneratedImage {
  id: string;
  url: string;
  prompt: string;
  style: string;
  timestamp: Date;
  isFavorite: boolean;
  generationType: string;
  parentImageId?: string;
}

export const useGeneratedImages = () => {
  const { user } = useAuth();
  const [images, setImages] = useState<GeneratedImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchImages = async () => {
    if (!user) {
      setImages([]);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from("generated_images")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      setImages(
        data.map((img) => ({
          id: img.id,
          url: img.image_url,
          prompt: img.prompt,
          style: img.style,
          timestamp: new Date(img.created_at),
          isFavorite: img.is_favorite,
          generationType: img.generation_type,
          parentImageId: img.parent_image_id || undefined,
        }))
      );
    } catch (error) {
      console.error("Error fetching images:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchImages();
  }, [user]);

  const saveImage = async (
    imageUrl: string,
    prompt: string,
    style: string,
    generationType: string = "text-to-image",
    parentImageId?: string
  ): Promise<GeneratedImage | null> => {
    if (!user) {
      toast.error("Please sign in to save images");
      return null;
    }

    try {
      const { data, error } = await supabase
        .from("generated_images")
        .insert({
          user_id: user.id,
          image_url: imageUrl,
          prompt,
          style,
          generation_type: generationType,
          parent_image_id: parentImageId || null,
        })
        .select()
        .single();

      if (error) throw error;

      const newImage: GeneratedImage = {
        id: data.id,
        url: data.image_url,
        prompt: data.prompt,
        style: data.style,
        timestamp: new Date(data.created_at),
        isFavorite: data.is_favorite,
        generationType: data.generation_type,
        parentImageId: data.parent_image_id || undefined,
      };

      setImages((prev) => [newImage, ...prev]);
      return newImage;
    } catch (error) {
      console.error("Error saving image:", error);
      toast.error("Failed to save image");
      return null;
    }
  };

  const toggleFavorite = async (id: string) => {
    if (!user) return;

    const image = images.find((img) => img.id === id);
    if (!image) return;

    try {
      const { error } = await supabase
        .from("generated_images")
        .update({ is_favorite: !image.isFavorite })
        .eq("id", id);

      if (error) throw error;

      setImages((prev) =>
        prev.map((img) =>
          img.id === id ? { ...img, isFavorite: !img.isFavorite } : img
        )
      );
    } catch (error) {
      console.error("Error toggling favorite:", error);
      toast.error("Failed to update favorite");
    }
  };

  const deleteImage = async (id: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from("generated_images")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setImages((prev) => prev.filter((img) => img.id !== id));
      toast.success("Image deleted");
    } catch (error) {
      console.error("Error deleting image:", error);
      toast.error("Failed to delete image");
    }
  };

  return {
    images,
    isLoading,
    saveImage,
    toggleFavorite,
    deleteImage,
    refetch: fetchImages,
    favorites: images.filter((img) => img.isFavorite),
  };
};
