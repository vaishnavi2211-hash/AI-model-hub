import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader2, Send, User, Bot, Mic, ImagePlus, X } from "lucide-react";
import { motion } from "framer-motion";
import { streamAI, ChatMessage } from "@/lib/ai-client";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { v4 as uuidv4 } from "uuid";

interface ChatSession {
  id: string;
  title: string;
  messages: ChatMessage[];
  date: string;
}

interface ChatInterfaceProps {
  toolType: string;
  modelId: string;
  modelName: string;
  supportsVision?: boolean;
}

export function ChatInterface({ toolType, modelId, modelName, supportsVision = false }: ChatInterfaceProps) {
  const { user, incrementUsage, usage } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const assistantRef = useRef("");
  
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const key = import.meta.env.VITE_GEMINI_API_KEY || localStorage.getItem("GEMINI_API_KEY");
    if (!key) {
      const userKey = window.prompt(
        "To enable Real Image Analysis for this internship project, please enter a free Google Gemini API Key.\n\n(It will be saved locally. Get one at: https://aistudio.google.com/app/apikey)\n\nIf you cancel, the system will use a mock response."
      );
      if (userKey) {
        localStorage.setItem("GEMINI_API_KEY", userKey.trim());
        toast.success("API Key saved! Image analysis is now active.");
      } else {
        toast.info("No key provided. Yielding a mock analysis instead.");
      }
    }

    if (file.size > 4 * 1024 * 1024) {
      toast.error("Image must be less than 4MB");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => setSelectedImage(e.target?.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };
  
  // Chat History State
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string>(() => uuidv4());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load sessions on mount
  useEffect(() => {
    if (!user) {
      setSessions([]);
      setMessages([]);
      return;
    }
    const saved = localStorage.getItem(`chat_history_${user.id}_${modelId}`);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setSessions(parsed);
      } catch (e) {
        console.error("Failed to load chat history");
      }
    } else {
      setSessions([]);
      setMessages([]);
    }
  }, [modelId, user]);

  // Save sessions when messages change
  useEffect(() => {
    if (messages.length > 0 && user) {
      setSessions(prev => {
        const existingIdx = prev.findIndex(s => s.id === currentSessionId);
        let newSessions;
        
        if (existingIdx >= 0) {
          const updated = [...prev];
          updated[existingIdx] = {
            ...updated[existingIdx],
            messages,
          };
          newSessions = updated;
        } else {
          const title = messages[0].content.slice(0, 30) + (messages[0].content.length > 30 ? "..." : "");
          newSessions = [{
            id: currentSessionId,
            title,
            messages,
            date: new Date().toISOString()
          }, ...prev];
        }
        
        localStorage.setItem(`chat_history_${user.id}_${modelId}`, JSON.stringify(newSessions));
        return newSessions;
      });
    }
  }, [messages, currentSessionId, modelId, user]);

  const createNewChat = () => {
    setCurrentSessionId(uuidv4());
    setMessages([]);
    setIsSidebarOpen(false);
  };

  const loadSession = (session: ChatSession) => {
    setCurrentSessionId(session.id);
    setMessages(session.messages);
    setIsSidebarOpen(false);
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
      recognition.lang = window.navigator.language || 'en-US'; // Use browser default language

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

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
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

    const userMsg: ChatMessage = { role: "user", content: input.trim(), imageUrl: selectedImage || undefined };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput("");
    setSelectedImage(null);
    setLoading(true);
    assistantRef.current = "";

    setMessages((prev) => [...prev, { role: "assistant", content: "" }]);

    await streamAI({
      messages: newMessages,
      toolType,
      onDelta: (chunk) => {
        assistantRef.current += chunk;
        setMessages((prev) =>
          prev.map((m, i) =>
            i === prev.length - 1 ? { ...m, content: assistantRef.current } : m
          )
        );
      },
      onDone: () => {
        setLoading(false);
        if (assistantRef.current) {
          const entry = {
            id: Date.now().toString(),
            user_id: user?.id || "guest",
            model_id: modelId,
            model_name: modelName,
            tool_type: toolType,
            prompt: input.trim(),
            output: assistantRef.current,
            created_at: new Date().toISOString()
          };
          
          if (user && user.id !== "debug-user-id") {
            supabase.from("prompt_history").insert(entry).then();
          } else {
            const saved = localStorage.getItem("guest_prompt_history");
            const history = saved ? JSON.parse(saved) : [];
            localStorage.setItem("guest_prompt_history", JSON.stringify([entry, ...history].slice(0, 50)));
          }
        }
      },
      onError: (msg) => {
        setLoading(false);
        toast.error(msg);
        setMessages((prev) => prev.slice(0, -1));
      },
    });
  };

  return (
    <div className="flex w-full gap-4 relative">
      <div className={`absolute top-0 left-0 h-full w-64 bg-background border border-border/50 rounded-xl z-10 flex flex-col transition-transform duration-300 ${isSidebarOpen ? "translate-x-0" : "-translate-x-[110%]"} md:relative md:translate-x-0`}>
        <div className="p-4 border-b border-border/50 flex items-center justify-between">
          <h3 className="font-display font-semibold text-sm">Chat History</h3>
          <Button variant="ghost" size="icon" className="h-6 w-6 md:hidden" onClick={() => setIsSidebarOpen(false)}>
            <span className="sr-only">Close sidebar</span>
            &times;
          </Button>
        </div>
        <div className="p-2">
          <Button variant="outline" className="w-full justify-start text-sm h-9" onClick={createNewChat}>
            + New Chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {sessions.length === 0 && (
            <p className="text-xs text-muted-foreground text-center py-4">No previous chats</p>
          )}
          {sessions.map(s => (
            <Button 
              key={s.id} 
              variant={s.id === currentSessionId ? "secondary" : "ghost"} 
              className="w-full justify-start text-left text-xs font-normal h-auto py-2 truncate"
              onClick={() => loadSession(s)}
            >
              <div className="truncate w-full">{s.title}</div>
            </Button>
          ))}
        </div>
      </div>

    <div className="glass rounded-xl overflow-hidden flex flex-col flex-1" style={{ height: "500px" }}>
      <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8 md:hidden -ml-2" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            <div className="space-y-1">
              <span className="block w-4 h-0.5 bg-foreground"></span>
              <span className="block w-4 h-0.5 bg-foreground"></span>
              <span className="block w-4 h-0.5 bg-foreground"></span>
            </div>
          </Button>
          <Bot className="h-4 w-4 text-primary" />
          <span className="font-display font-semibold text-sm">{modelName}</span>
        </div>
        {user && (
          <span className="text-xs text-muted-foreground">{usage.remaining} generations left</span>
        )}
      </div>

      <div ref={scrollRef} className="flex-1 overflow-y-auto p-5 space-y-4">
        {messages.length === 0 && (
          <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
            Start a conversation...
          </div>
        )}
        {messages.map((msg, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
            className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
            {msg.role === "assistant" && (
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-1">
                <Bot className="h-3.5 w-3.5 text-primary" />
              </div>
            )}
            <div className={`rounded-xl px-4 py-2.5 max-w-[80%] text-sm leading-relaxed ${
              msg.role === "user"
                ? "bg-primary text-primary-foreground"
                : "bg-muted/50 text-foreground"
            }`}>
              {msg.imageUrl && (
                <div className="mb-2">
                  <img src={msg.imageUrl} alt="Uploaded" className="max-h-48 rounded bg-background/50 object-contain" />
                </div>
              )}
              <p className="whitespace-pre-wrap">{msg.content}</p>
              {msg.role === "assistant" && loading && i === messages.length - 1 && (
                <span className="inline-block w-1.5 h-4 bg-primary animate-pulse ml-0.5 align-text-bottom" />
              )}
            </div>
            {msg.role === "user" && (
              <div className="h-7 w-7 rounded-lg bg-muted flex items-center justify-center shrink-0 mt-1">
                <User className="h-3.5 w-3.5" />
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <div className="p-4 border-t border-border/50 relative">
        {selectedImage && (
          <div className="absolute bottom-full left-4 mb-2 bg-background/90 p-2 rounded-lg border border-border shadow-lg flex items-center gap-2">
            <img src={selectedImage} alt="Preview" className="h-16 w-16 object-cover rounded" />
            <Button type="button" variant="ghost" size="icon" className="h-6 w-6" onClick={() => setSelectedImage(null)}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
        <form onSubmit={(e) => { e.preventDefault(); handleSend(); }} className="flex gap-2">
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
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            className="bg-background/50"
            disabled={loading}
          />
          <Button type="submit" size="icon" disabled={loading || (!input.trim() && !selectedImage)}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          </Button>
        </form>
      </div>
    </div>
    </div>
  );
}
