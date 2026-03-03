import { supabase } from "@/integrations/supabase/client";

export async function uploadBase64Image(
  base64Data: string,
  userId: string
): Promise<string> {
  // Extract the actual base64 content and mime type
  const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) {
    throw new Error("Invalid base64 image data");
  }

  const mimeType = match[1];
  const base64Content = match[2];
  const extension = mimeType.split("/")[1] || "png";

  // Convert base64 to Uint8Array
  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage
    .from("generated-images")
    .upload(fileName, bytes, {
      contentType: mimeType,
      upsert: false,
    });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("generated-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}
