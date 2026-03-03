import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function uploadBase64ToStorage(base64Data: string, userId: string): Promise<string> {
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  const match = base64Data.match(/^data:(image\/\w+);base64,(.+)$/);
  if (!match) throw new Error("Invalid base64 image data");

  const mimeType = match[1];
  const base64Content = match[2];
  const extension = mimeType.split("/")[1] || "png";

  const binaryString = atob(base64Content);
  const bytes = new Uint8Array(binaryString.length);
  for (let i = 0; i < binaryString.length; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }

  const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${extension}`;

  const { error } = await supabase.storage
    .from("generated-images")
    .upload(fileName, bytes, { contentType: mimeType, upsert: false });

  if (error) throw error;

  const { data: urlData } = supabase.storage
    .from("generated-images")
    .getPublicUrl(fileName);

  return urlData.publicUrl;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { prompt, imageUrl, additionalImages, editType, userId } = body;
    console.log("Request body:", JSON.stringify({ prompt, editType, hasImage: !!imageUrl, hasAdditional: !!additionalImages, imageUrlLength: imageUrl?.length }));

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!imageUrl) {
      return new Response(
        JSON.stringify({ error: "Image URL is required for editing" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const editPrompt = editType === "vary" 
      ? `Create a variation of this image: ${prompt}. Keep the same style and composition but add creative differences.`
      : editType === "edit"
      ? `Edit this image: ${prompt}`
      : `Use these reference images and create: ${prompt}`;

    const contentParts: unknown[] = [
      { type: "text", text: editPrompt },
      { type: "image_url", image_url: { url: imageUrl } },
    ];

    if (additionalImages && Array.isArray(additionalImages)) {
      for (const img of additionalImages) {
        contentParts.push({ type: "image_url", image_url: { url: img } });
      }
    }

    const messages = [{ role: "user", content: contentParts }];

    console.log("Editing image with prompt:", prompt, "type:", editType);

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image",
        messages,
        modalities: ["image", "text"],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await response.text();
      console.error("AI gateway error:", response.status, errorText);
      throw new Error(`AI gateway error [${response.status}]: ${errorText}`);
    }

    const data = await response.json();
    console.log("AI response received");

    const imageData = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;
    const textContent = data.choices?.[0]?.message?.content || "";

    if (!imageData) {
      throw new Error("No image generated in response");
    }

    // Upload to storage if userId provided and image is base64
    let finalUrl = imageData;
    if (userId && imageData.startsWith("data:")) {
      try {
        finalUrl = await uploadBase64ToStorage(imageData, userId);
        console.log("Image uploaded to storage:", finalUrl);
      } catch (uploadErr) {
        console.error("Storage upload failed, returning base64:", uploadErr);
      }
    }

    return new Response(
      JSON.stringify({ success: true, imageUrl: finalUrl, description: textContent }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error editing image:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Failed to edit image" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
