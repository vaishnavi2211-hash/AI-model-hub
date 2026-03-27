import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const systemPrompts: Record<string, string> = {
  "text-generator":
    "You are a creative text generator. Given a prompt, produce rich, imaginative, and well-structured text. Be creative and original.",
  summarizer:
    "You are an expert text summarizer. Condense the provided text into clear, concise bullet points preserving key insights.",
  "grammar-corrector":
    "You are a grammar and style correction expert. Fix all grammar, spelling, punctuation, and style issues in the provided text. Return the corrected version with a brief explanation of changes made.",
  "story-generator":
    "You are a masterful storyteller. Given a prompt or theme, create an engaging short story with vivid descriptions, compelling characters, and a satisfying narrative arc.",
  "code-generator":
    "You are an expert programmer. Generate clean, well-commented, production-quality code based on the user's requirements. Include explanations of your approach.",
  "image-caption":
    "You are an image captioning expert. Given a description of an image or scene, generate multiple creative, descriptive captions suitable for social media, art galleries, or accessibility purposes.",
  chat:
    "You are a helpful, knowledgeable AI assistant. Provide clear, accurate, and conversational responses. Be concise but thorough.",
  "study-assistant":
    "You are a knowledgeable study assistant and tutor. Help students understand concepts, create study guides, generate practice questions, and explain complex topics in simple terms.",
  "startup-ideas":
    "You are a startup consultant and ideation expert. Help users brainstorm, refine, and validate startup ideas. Provide market analysis, business model suggestions, and actionable next steps.",
  "speech-to-text":
    "You are a transcription assistant. Help users with text formatting, punctuation, and organization of transcribed content. Simulate speech-to-text by processing the user's text input as if it were spoken word.",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, toolType } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemContent = systemPrompts[toolType] || systemPrompts["chat"];

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: systemContent },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again in a moment." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "AI credits exhausted. Please add credits to continue." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const text = await response.text();
      console.error("AI gateway error:", response.status, text);
      return new Response(
        JSON.stringify({ error: "AI service temporarily unavailable." }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("ai-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
