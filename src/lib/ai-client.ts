const HF_URL = "https://router.huggingface.co/v1/chat/completions";

export type ChatMessage = { role: "user" | "assistant" | "system"; content: string; imageUrl?: string };

const BASE_PROMPT = "You are a friendly, helpful, and highly accurate AI assistant. IMPORTANT RULE: You MUST reply in the EXACT SAME LANGUAGE the user writes in. If the user writes in English, you must respond strictly in English. If the user writes in Telugu, you must respond in Telugu. Keep your tone natural, human-like, and conversational. Do not generate unsafe content. ";

const systemPrompts: Record<string, string> = {
  "text-generator":
    BASE_PROMPT + "You are a helpful text generator assistant. Always directly and factually answer exactly what the user asks. Provide rich and well-structured responses, but do not hallucinate or create random stories unless explicitly requested.",
  summarizer:
    BASE_PROMPT + "You are an expert text summarizer. Directly answer the user's prompt or concisely summarize the provided text preserving key insights.",
  "grammar-corrector":
    BASE_PROMPT + "You are a helpful AI assistant. Answer the user's questions clearly. If they provide text to fix, fix grammar and style issues.",
  "story-generator":
    BASE_PROMPT + "You are a masterful storyteller. If the user asks a factual question, answer it directly. If they ask for a story, create an engaging narrative.",
  "code-generator":
    BASE_PROMPT + "You are an expert AI programmer. Directly answer what the user asks. Generate clean code and explain your approach.",
  "image-caption":
    BASE_PROMPT + "You are a creative Image Caption Generator. The system will provide you with a visual analysis of an uploaded image. Write creative, engaging captions based ONLY on this analysis, and answer the user directly.",
  chat:
    BASE_PROMPT + "You are a helpful, highly accurate AI assistant. Always directly answer exactly what the user asks in a conversational but concise manner.",
  "study-assistant":
    BASE_PROMPT + "You are a knowledgeable study assistant. Directly answer the user's questions clearly, explain complex concepts, and be highly accurate.",
  "startup-ideas":
    BASE_PROMPT + "You are a helpful startup consultant. Directly answer exactly what the user asks regarding business, markets, or startup ideas.",
  "speech-to-text":
    BASE_PROMPT + "You are a helpful assistant. Directly answer the user's prompt clearly and concisely.",
};

export async function streamAI({
  prompt,
  imageUrl,
  messages = [],
  toolType,
  onDelta,
  onDone,
  onError,
}: {
  prompt?: string;
  imageUrl?: string;
  messages?: ChatMessage[];
  toolType: string;
  onDelta: (text: string) => void;
  onDone: () => void;
  onError: (msg: string) => void;
}) {
  if (toolType === "video-generator") {
    onDelta("Video generation coming soon");
    onDone();
    return;
  }

  const token = import.meta.env.VITE_HUGGINGFACE_TOKEN;

  if (!token) {
    onError("Hugging Face API token is missing. Please add VITE_HUGGINGFACE_TOKEN to your Vercel environment variables.");
    return;
  }

  const systemContent = systemPrompts[toolType] || systemPrompts["chat"];
  
  let extractedImageText = "";
  const lastImageMsg = messages.slice().reverse().find(m => m.imageUrl);
  const targetImageUrl = imageUrl || lastImageMsg?.imageUrl;

  const geminiKey = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("GEMINI_API_KEY");

  if (targetImageUrl) {
    if (!geminiKey) {
      console.warn("Gemini API key is missing. Yielding a mock analysis for the uploaded image.");
      extractedImageText = "A beautiful and highly detailed visual provided by the user (Vision API key missing for actual analysis in this demo).";
    } else {
    
    try {
      let base64Data = "";
      let mimeType = "image/jpeg";
      
      if (targetImageUrl.startsWith("data:")) {
        base64Data = targetImageUrl.split(",")[1];
        mimeType = targetImageUrl.split(";")[0].split(":")[1] || "image/jpeg";
      } else {
        const response = await fetch(targetImageUrl);
        const blob = await response.blob();
        mimeType = blob.type;
        base64Data = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
      }

      const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
      
      const geminiResp = await fetch(geminiUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: "Analyze and describe what you see in this image in detail. Be helpful and accurate." },
              { inline_data: { mime_type: mimeType, data: base64Data } }
            ]
          }]
        })
      });
      
      if (geminiResp.ok) {
        const geminiData = await geminiResp.json();
        const text = geminiData.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
          extractedImageText = text;
        } else {
          throw new Error("Invalid response from Gemini vision model");
        }
      } else {
        const errText = await geminiResp.text();
        console.error("Gemini API Error details:", errText);
        throw new Error(`API Error: ${geminiResp.status}`);
      }
    } catch (e: any) {
      console.error("Vision fallback error", e);
      onError("Image analysis failed: " + (e.message || "Please try again."));
      return;
      }
    }
  }

  const chatMessages: ChatMessage[] = messages.length > 0 
    ? messages.map(m => {
        let content = m.content;
        if (m.imageUrl && extractedImageText) {
          content = `System Note: The user uploaded an image. The AI vision model analyzed it and saw: "${extractedImageText}".\n\nUser's message: ${content || "Please process this image."}`;
        }
        return { role: m.role, content: content || (extractedImageText ? `System Note: The uploaded image shows: "${extractedImageText}". Please analyze it.` : "") };
      })
    : (prompt || extractedImageText ? [
        { role: "user", content: extractedImageText ? `System Note: The user uploaded an image. Analysis: "${extractedImageText}".\n\nUser's request: ${prompt || "Please write something about this image."}` : prompt! }
      ] : []);

  const enhancedMessages = [
    { role: "system", content: systemContent },
    ...chatMessages,
  ];

  const modelToUse = "meta-llama/Meta-Llama-3-8B-Instruct";

  let resp: Response;
  try {
    resp = await fetch(HF_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        model: modelToUse,
        messages: enhancedMessages,
        stream: true,
        max_tokens: 1500,
      }),
    });
  } catch {
    onError("Network error. Please check your connection.");
    return;
  }

  if (!resp.ok) {
    try {
      const body = await resp.json();
      const errorMsg = typeof body.error === "string" 
        ? body.error 
        : (body.error ? JSON.stringify(body.error) : null);
      onError(errorMsg || `Error (${resp.status})`);
    } catch {
      onError(`Request failed (${resp.status})`);
    }
    return;
  }

  if (!resp.body) {
    onError("No response body received.");
    return;
  }

  const reader = resp.body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });

      let idx: number;
      while ((idx = buffer.indexOf("\n")) !== -1) {
        let line = buffer.slice(0, idx);
        buffer = buffer.slice(idx + 1);
        if (line.endsWith("\r")) line = line.slice(0, -1);
        if (!line.startsWith("data: ")) continue;

        const data = line.slice(6).trim();
        if (data === "[DONE]") {
          onDone();
          return;
        }

        try {
           // HF can also send keep-alive or empty objects, so gracefully handle
           if (data.trim() !== "") {
             const parsed = JSON.parse(data);
             const content = parsed.choices?.[0]?.delta?.content;
             if (content) onDelta(content);
           }
        } catch {
          // partial JSON (e.g. split across boundary)
          buffer = line + "\n" + buffer;
          break;
        }
      }
    }
  } catch {
    onError("Stream interrupted.");
    return;
  }

  onDone();
}
