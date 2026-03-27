import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Image as ImageIcon, Download, AlertCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ImageInterfaceProps {
  modelId: string;
  modelName: string;
}

export function ImageInterface({ modelId, modelName }: ImageInterfaceProps) {
  const { user, incrementUsage, usage } = useAuth();
  const [prompt, setPrompt] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGenerate = async () => {
    if (!prompt.trim() || loading) return;

    if (user) {
      const allowed = await incrementUsage();
      if (!allowed) {
        toast.error("Daily limit reached! Upgrade to Premium for unlimited usage.");
        return;
      }
    } else {
      const guestUsage = parseInt(localStorage.getItem("guest_usage_count") || "0");
      if (guestUsage >= 25) {
        toast.error("Free guest limit reached! Please sign in for more usage.");
        return;
      }
      localStorage.setItem("guest_usage_count", (guestUsage + 1).toString());
    }

    setLoading(true);
    setError("");
    setImageUrl("");

    try {
      const token = import.meta.env.VITE_HUGGINGFACE_TOKEN;
      if (!token) {
        throw new Error("Missing VITE_HUGGINGFACE_TOKEN in environment variables.");
      }

      // Secretly enhance the prompt to make it look like a real photograph instead of an AI image
      const photoModifiers = ", masterpiece, 8k, photorealistic, raw photography, cinematic lighting, ultra-detailed, natural textures, Canon EOS R5";
      const enhancedPrompt = prompt.trim().toLowerCase().includes("photorealistic") 
        ? prompt.trim() 
        : `${prompt.trim()}${photoModifiers}`;

      const resp = await fetch(
        "https://router.huggingface.co/hf-inference/models/black-forest-labs/FLUX.1-schnell",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ inputs: enhancedPrompt }),
        }
      );

      if (!resp.ok) {
        let errorMsg = `Request failed (${resp.status})`;
        try {
          const errData = await resp.json();
          if (errData.error) errorMsg = errData.error;
        } catch (_) {}
        throw new Error(errorMsg);
      }

      const blob = await resp.blob();
      const generatedUrl = URL.createObjectURL(blob);
      setImageUrl(generatedUrl);
      
      const commonData = {
        model_id: modelId,
        model_name: modelName,
        tool_type: "image-generator",
        prompt: prompt.trim(),
        output_image_url: generatedUrl,
        output: "Successfully generated image via Hugging Face",
      };

      if (user && user.id !== "debug-user-id") {
        supabase.from("prompt_history").insert({ ...commonData, user_id: user.id }).then();
      } else {
        const entry = {
          ...commonData,
          id: Date.now().toString(),
          user_id: "guest",
          created_at: new Date().toISOString()
        };
        const saved = localStorage.getItem("guest_prompt_history");
        const history = saved ? JSON.parse(saved) : [];
        localStorage.setItem("guest_prompt_history", JSON.stringify([entry, ...history].slice(0, 50)));
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to generate image");
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!imageUrl) return;
    const link = document.createElement("a");
    link.href = imageUrl;
    link.download = `modelhub-${Date.now()}.png`;
    link.click();
  };

  return (
    <div className="space-y-6">
      <div className="glass rounded-xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <ImageIcon className="h-5 w-5 text-primary" />
          <h3 className="font-display font-semibold text-lg">Image Generator</h3>
          {user && (
            <span className="text-xs text-muted-foreground ml-auto">{usage.remaining} left today</span>
          )}
        </div>
        <Textarea
          placeholder="Describe the image you want to generate in detail...\n\nExample: Lord Krishna playing the flute with Goddess Radha standing intimately next to him, divine, beautiful garden, highly detailed painting"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          className="min-h-[100px] bg-background/50 border-border/50 resize-none"
        />
        <Button onClick={handleGenerate} disabled={loading || !prompt.trim()} className="gap-2">
          {loading ? (
            <><Loader2 className="h-4 w-4 animate-spin" /> Generating Image...</>
          ) : (
            <><Send className="h-4 w-4" /> Generate Image</>
          )}
        </Button>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
            className="glass rounded-xl p-6 border-destructive/30">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}

        {loading && !imageUrl && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-12 text-center">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="h-16 w-16 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
              </div>
              <p className="text-muted-foreground text-sm">Creating your image... This may take a moment.</p>
            </div>
          </motion.div>
        )}

        {imageUrl && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <p className="text-sm font-medium text-muted-foreground">Generated Image</p>
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={handleDownload}>
                <Download className="h-3 w-3" /> Download
              </Button>
            </div>
            <img src={imageUrl} alt="AI Generated" className="rounded-lg w-full max-h-[500px] object-contain bg-background/50" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
