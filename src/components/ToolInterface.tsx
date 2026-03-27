import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Send, Sparkles, AlertCircle, Copy, Check, Mic, ImagePlus, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { streamAI } from "@/lib/ai-client";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface ToolInterfaceProps {
  title: string;
  placeholder: string;
  toolType: string;
  outputLabel?: string;
  modelId?: string;
  modelName?: string;
  supportsVision?: boolean;
}

export function ToolInterface({ title, placeholder, toolType, outputLabel = "Output", modelId, modelName, supportsVision = false }: ToolInterfaceProps) {
  const { user, incrementUsage, usage } = useAuth();
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const outputRef = useRef("");
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be less than 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const startRecording = () => {
    try {
      // @ts-expect-error: window may not have SpeechRecognition in types
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (!SpeechRecognition) {
        toast.error("Speech recognition is not supported in this browser.");
        return;
      }

      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = 'te-IN';

      recognition.onstart = () => {
        setIsRecording(true);
        toast.info("Listening...");
      };

      recognition.onresult = (event: { results: { transcript: string }[][] }) => {
        const transcript = event.results[0][0].transcript;
        setInput((prev) => prev + (prev ? " " : "") + transcript);
      };

      recognition.onerror = (event: { error: string }) => {
        if (event.error !== 'no-speech') {
          toast.error("Speech recognition error: " + event.error);
        }
        setIsRecording(false);
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } catch (err) {
      console.error("Speech recognition error:", err);
      toast.error("Could not start speech recognition.");
      setIsRecording(false);
    }
  };

  const handleGenerate = async () => {
    if ((!input.trim() && !selectedImage) || loading) return;

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
    setOutput("");
    setError("");
    outputRef.current = "";
    
    const currentImage = selectedImage;
    setSelectedImage(null);

    await streamAI({
      prompt: input,
      imageUrl: currentImage || undefined,
      toolType,
      onDelta: (chunk) => {
        outputRef.current += chunk;
        setOutput(outputRef.current);
      },
      onDone: () => {
        setLoading(false);
        if (outputRef.current && modelId) {
          const entry = {
            id: Date.now().toString(),
            user_id: user?.id || "guest",
            model_id: modelId,
            model_name: modelName || title,
            tool_type: toolType,
            prompt: input.trim(),
            output: outputRef.current,
            created_at: new Date().toISOString()
          };
          
          if (user) {
            supabase.from("prompt_history").insert(entry).then();
          } else {
            const saved = localStorage.getItem("guest_prompt_history");
            const history = saved ? JSON.parse(saved) : [];
            localStorage.setItem("guest_prompt_history", JSON.stringify([entry, ...history].slice(0, 50)));
          }
        }
      },
      onError: (msg) => {
        setError(msg);
        setLoading(false);
      },
    });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success("Copied to clipboard!");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-display font-semibold text-lg">{title}</h3>
        {user && (
          <span className="text-xs text-muted-foreground ml-auto">{usage.remaining} left today</span>
        )}
      </div>

      <div className="glass rounded-xl p-6 space-y-4 relative">
        {selectedImage && (
          <div className="absolute top-0 right-6 -translate-y-full mb-2 bg-background/90 p-2 rounded-lg border border-border shadow-lg flex items-center gap-2 z-10">
            <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded" />
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedImage(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <Textarea
          placeholder={placeholder}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="min-h-[120px] bg-background/50 border-border/50 resize-none"
        />
        <div className="flex gap-2">
          {supportsVision && (
            <>
              <input type="file" accept="image/*" className="hidden" ref={fileInputRef} onChange={handleImageUpload} />
              <Button type="button" variant="outline" size="icon" className="shrink-0" onClick={() => fileInputRef.current?.click()}>
                <ImagePlus className="h-4 w-4" />
              </Button>
            </>
          )}
          <Button onClick={startRecording} type="button" variant="outline" size="icon" disabled={isRecording} className={`shrink-0 ${isRecording ? "text-primary border-primary bg-primary/10" : ""}`}>
            {isRecording ? <span className="h-2 w-2 rounded-full bg-primary animate-pulse" /> : <Mic className="h-4 w-4" />}
          </Button>
          <Button onClick={handleGenerate} disabled={loading || (!input.trim() && !selectedImage)} className="gap-2 flex-1">
            {loading ? (
              <><Loader2 className="h-4 w-4 animate-spin" /> Generating...</>
            ) : (
              <><Send className="h-4 w-4" /> Generate</>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-xl p-6 border-destructive/30">
            <div className="flex items-center gap-2 text-destructive">
              <AlertCircle className="h-4 w-4" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          </motion.div>
        )}
        {(loading || output) && !error && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-3">
              <p className="text-sm font-medium text-muted-foreground">{outputLabel}</p>
              {output && !loading && (
                <Button variant="ghost" size="sm" className="h-7 gap-1 text-xs" onClick={handleCopy}>
                  {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                  {copied ? "Copied" : "Copy"}
                </Button>
              )}
            </div>
            {loading && !output ? (
              <div className="flex items-center gap-3 text-muted-foreground">
                <div className="flex gap-1">
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow" />
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow [animation-delay:0.3s]" />
                  <span className="h-2 w-2 rounded-full bg-primary animate-pulse-glow [animation-delay:0.6s]" />
                </div>
                Processing your request...
              </div>
            ) : (
              <div>
                <p className="text-foreground whitespace-pre-wrap leading-relaxed">{output}</p>
                {loading && <span className="inline-block w-2 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom" />}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
