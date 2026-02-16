import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RUNWAY_API = "https://api.dev.runwayml.com/v1";
const RUNWAY_VERSION = "2024-11-06";

async function pollTask(taskId: string, apiKey: string): Promise<any> {
  const maxAttempts = 60; // ~5 minutes with 5s intervals
  for (let i = 0; i < maxAttempts; i++) {
    const res = await fetch(`${RUNWAY_API}/tasks/${taskId}`, {
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "X-Runway-Version": RUNWAY_VERSION,
      },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Poll failed [${res.status}]: ${text}`);
    }

    const task = await res.json();
    console.log(`Poll attempt ${i + 1}: status=${task.status}`);

    if (task.status === "SUCCEEDED") {
      return task;
    }
    if (task.status === "FAILED") {
      throw new Error(task.failure || "Video generation failed");
    }

    // Wait 5 seconds before next poll
    await new Promise((r) => setTimeout(r, 5000));
  }
  throw new Error("Video generation timed out");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");
    if (!RUNWAY_API_KEY) {
      throw new Error("RUNWAY_API_KEY is not configured");
    }

    const { prompt, duration, imageUrl } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting video generation:", { prompt, duration, hasImage: !!imageUrl });

    // Decide endpoint based on whether an image is provided
    const endpoint = imageUrl ? "image_to_video" : "text_to_video";
    const body: any = {
      model: "gen4_turbo",
      ratio: "1280:768",
      duration: duration || 5,
    };

    if (imageUrl) {
      body.promptImage = imageUrl;
      body.promptText = prompt;
    } else {
      body.promptText = prompt;
    }

    const createRes = await fetch(`${RUNWAY_API}/${endpoint}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RUNWAY_API_KEY}`,
        "X-Runway-Version": RUNWAY_VERSION,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    if (!createRes.ok) {
      if (createRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const errorText = await createRes.text();
      console.error("Runway create error:", createRes.status, errorText);
      throw new Error(`Runway API error [${createRes.status}]: ${errorText}`);
    }

    const createData = await createRes.json();
    const taskId = createData.id;
    console.log("Task created:", taskId);

    // Poll until complete
    const result = await pollTask(taskId, RUNWAY_API_KEY);

    // Extract video URL from output
    const videoUrl = result.output?.[0] || result.artifacts?.[0]?.url;
    if (!videoUrl) {
      console.error("Result structure:", JSON.stringify(result, null, 2));
      throw new Error("No video URL in completed task");
    }

    return new Response(
      JSON.stringify({ success: true, videoUrl }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error generating video:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate video",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
