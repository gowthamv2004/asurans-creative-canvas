import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RUNWAY_API = "https://api.dev.runwayml.com/v1";
const RUNWAY_VERSION = "2024-11-06";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const RUNWAY_API_KEY = Deno.env.get("RUNWAY_API_KEY");
    if (!RUNWAY_API_KEY) {
      throw new Error("RUNWAY_API_KEY is not configured");
    }

    const url = new URL(req.url);
    const action = url.searchParams.get("action") || "create";

    // Poll action: check task status
    if (action === "poll") {
      const { taskId } = await req.json();
      if (!taskId) {
        return new Response(
          JSON.stringify({ error: "taskId is required" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }

      const res = await fetch(`${RUNWAY_API}/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${RUNWAY_API_KEY}`,
          "X-Runway-Version": RUNWAY_VERSION,
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(`Poll failed [${res.status}]: ${text}`);
      }

      const task = await res.json();
      const videoUrl = task.output?.[0] || task.artifacts?.[0]?.url || null;

      return new Response(
        JSON.stringify({
          status: task.status,
          videoUrl: task.status === "SUCCEEDED" ? videoUrl : null,
          failure: task.failure || null,
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Create action: start a new video generation task
    const { prompt, duration, imageUrl } = await req.json();

    if (!prompt) {
      return new Response(
        JSON.stringify({ error: "Prompt is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    console.log("Starting video generation:", { prompt, duration, hasImage: !!imageUrl });

    const endpoint = imageUrl ? "image_to_video" : "text_to_video";
    const validDurations = [5, 8, 10];
    const selectedDuration = validDurations.includes(duration) ? duration : 5;
    const body: any = {
      model: "gen4.5",
      ratio: "1280:720",
      duration: selectedDuration,
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
      const errorText = await createRes.text();
      console.error("Runway create error:", createRes.status, errorText);
      
      if (createRes.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      // Check for insufficient credits
      if (errorText.includes("not enough credits") || errorText.includes("credits")) {
        return new Response(
          JSON.stringify({ error: "insufficient_credits", message: "Your Runway account doesn't have enough credits. Please add credits at runwayml.com to generate videos." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      throw new Error(`Runway API error [${createRes.status}]: ${errorText}`);
    }

    const createData = await createRes.json();
    console.log("Task created:", createData.id);

    return new Response(
      JSON.stringify({ success: true, taskId: createData.id }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error in generate-video:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Failed to generate video",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
