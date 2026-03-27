import { useState } from "react";
import { models } from "@/lib/models";
import { ToolInterface } from "@/components/ToolInterface";
import { ChatInterface } from "@/components/ChatInterface";
import { ImageInterface } from "@/components/ImageInterface";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import { Sparkles, Cpu } from "lucide-react";

import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { LogIn } from "lucide-react";

const toolModels = models.filter((m) => m.toolType);

const toolConfig: Record<string, { title: string; placeholder: string; outputLabel: string }> = {
  "text-generator": { title: "Text Generator", placeholder: "Enter a prompt to generate text...", outputLabel: "Generated Text" },
  summarizer: { title: "Text Summarizer", placeholder: "Paste text to summarize...", outputLabel: "Summary" },
  "grammar-corrector": { title: "Grammar Corrector", placeholder: "Paste text to correct...", outputLabel: "Corrected Text" },
  "story-generator": { title: "Story Generator", placeholder: "Describe a story theme...", outputLabel: "Generated Story" },
  "code-generator": { title: "Code Generator", placeholder: "Describe what code you need...", outputLabel: "Generated Code" },
  "image-caption": { title: "Image Caption", placeholder: "Describe a scene for captions...", outputLabel: "Captions" },
  "speech-to-text": { title: "Speech to Text", placeholder: "Enter text to format...", outputLabel: "Transcription" },
};

import { useCommunityModels } from "@/lib/community-models";

export default function Playground() {
  const { user } = useAuth();
  const { communityModels } = useCommunityModels();
  const allToolModels = [...models, ...communityModels].filter((m) => m.toolType);

  const [activeId, setActiveId] = useState(allToolModels[0]?.id);
  const active = allToolModels.find((m) => m.id === activeId)!;

  const renderInterface = () => {
    if (!active?.toolType) return null;

    if (active.interfaceType === "chat") {
      return <ChatInterface toolType={active.toolType} modelId={active.id} modelName={active.name} />;
    }

    if (active.interfaceType === "image") {
      return <ImageInterface modelId={active.id} modelName={active.name} />;
    }

    const config = toolConfig[active.toolType];
    if (config) {
      return (
        <ToolInterface
          key={activeId}
          title={`Test ${active.name}`}
          placeholder={config.placeholder}
          outputLabel={config.outputLabel}
          toolType={active.toolType}
          modelId={active.id}
          modelName={active.name}
        />
      );
    }

    return null;
  };

  const IconComponent = active?.icon || Cpu;

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Sparkles className="h-6 w-6 text-primary" />
            <h1 className="text-3xl md:text-4xl font-display font-bold">Prompt Playground</h1>
          </div>
          <p className="text-muted-foreground mb-10">Select a model and test your prompts with real AI</p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1">
            <h3 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wider">Select Model</h3>
            <div className="space-y-1.5 max-h-[600px] overflow-y-auto pr-1">
              {allToolModels.map((m) => {
                const Icon = m.icon || Cpu;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveId(m.id)}
                    className={cn(
                      "w-full text-left px-4 py-3 rounded-xl text-sm transition-all flex items-center gap-3",
                      activeId === m.id
                        ? "glass glow-primary border-primary/30 text-foreground"
                        : "hover:bg-muted text-muted-foreground"
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <div>
                      <span className="font-medium block">{m.name}</span>
                      <span className="text-xs text-muted-foreground capitalize">{m.category}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <div className="lg:col-span-3">
            {renderInterface()}
          </div>
        </div>
      </div>
    </div>
  );
}
