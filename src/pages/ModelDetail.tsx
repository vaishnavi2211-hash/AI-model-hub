import { useParams, Link } from "react-router-dom";
import { ArrowLeft, Heart, Download, Calendar, User, Share2, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { models } from "@/lib/models";
import { getCommunityModels } from "@/lib/community-models";
import { ToolInterface } from "@/components/ToolInterface";
import { ChatInterface } from "@/components/ChatInterface";
import { ImageInterface } from "@/components/ImageInterface";
import { motion } from "framer-motion";
import { toast } from "sonner";

const categoryColors: Record<string, string> = {
  text: "bg-primary/10 text-primary border-primary/20",
  image: "bg-accent/10 text-accent border-accent/20",
  audio: "bg-success/10 text-success border-success/20",
  chat: "bg-warning/10 text-warning border-warning/20",
  multimodal: "bg-secondary text-secondary-foreground border-border",
};

const toolConfig: Record<string, { title: string; placeholder: string; outputLabel: string }> = {
  "text-generator": { title: "Text Generator", placeholder: "Enter a prompt to generate text...", outputLabel: "Generated Text" },
  summarizer: { title: "Text Summarizer", placeholder: "Paste text to summarize...", outputLabel: "Summary" },
  "grammar-corrector": { title: "Grammar Corrector", placeholder: "Paste text to correct grammar and style...", outputLabel: "Corrected Text" },
  "story-generator": { title: "Story Generator", placeholder: "Describe a story theme, characters, or setting...", outputLabel: "Generated Story" },
  "code-generator": { title: "Code Generator", placeholder: "Describe what code you need...\n\nExample: Create a React hook for debouncing", outputLabel: "Generated Code" },
  "image-caption": { title: "Image Caption Generator", placeholder: "Describe the image or scene you want captions for...", outputLabel: "Generated Captions" },
  "video-generator": { title: "Video Generator", placeholder: "Describe a short video scene you want to generate...\n\nExample: A sunset over the ocean with gentle waves", outputLabel: "Generated Video Concept" },
  "speech-to-text": { title: "Speech to Text", placeholder: "Enter text to simulate transcription formatting...", outputLabel: "Formatted Transcription" },
};

export default function ModelDetail() {
  const { id } = useParams();
  const allModels = [...models, ...getCommunityModels()];
  const model = allModels.find((m) => m.id === id);

  if (!model) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-display font-bold mb-2">Model Not Found</h2>
          <Button asChild variant="outline">
            <Link to="/models"><ArrowLeft className="h-4 w-4 mr-2" /> Back to Models</Link>
          </Button>
        </div>
      </div>
    );
  }

  const IconComponent = model.icon || Cpu;
  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Link copied to clipboard!");
  };

  const renderInterface = () => {
    if (!model.toolType) return null;

    if (model.interfaceType === "chat") {
      return <ChatInterface toolType={model.toolType} modelId={model.id} modelName={model.name} supportsVision={model.supportsVision} />;
    }

    if (model.interfaceType === "image") {
      return <ImageInterface modelId={model.id} modelName={model.name} />;
    }

    const config = toolConfig[model.toolType];
    if (config) {
      return (
        <ToolInterface
          title={config.title}
          placeholder={config.placeholder}
          outputLabel={config.outputLabel}
          toolType={model.toolType}
          modelId={model.id}
          modelName={model.name}
          supportsVision={model.supportsVision}
        />
      );
    }

    return null;
  };

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <Button asChild variant="ghost" className="mb-6 gap-2">
          <Link to="/models"><ArrowLeft className="h-4 w-4" /> Back to Models</Link>
        </Button>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <div className="glass rounded-xl p-8 mb-8">
            <div className="flex flex-col sm:flex-row sm:items-start gap-5 mb-6">
              <div className="h-16 w-16 rounded-xl bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center border border-primary/20 shrink-0">
                <IconComponent className="h-8 w-8 text-primary" />
              </div>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2 mb-2">
                  <Badge variant="outline" className={categoryColors[model.category]}>{model.category}</Badge>
                  {model.isCommunity && <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20">Community</Badge>}
                  {model.isFeatured && <Badge variant="outline" className="bg-warning/10 text-warning border-warning/20">Featured</Badge>}
                </div>
                <h1 className="text-3xl font-display font-bold">{model.name}</h1>
                <p className="text-muted-foreground mt-1 flex items-center gap-1.5">
                  <User className="h-3.5 w-3.5" /> {model.author}
                </p>
              </div>
              <Button variant="outline" size="icon" onClick={handleShare}>
                <Share2 className="h-4 w-4" />
              </Button>
            </div>

            <p className="text-foreground/80 mb-6 leading-relaxed">{model.description}</p>

            <div className="flex flex-wrap gap-2 mb-6">
              {model.tags.map((tag) => (
                <span key={tag} className="text-xs px-3 py-1 rounded-full bg-muted text-muted-foreground border border-border/50">{tag}</span>
              ))}
            </div>

            <div className="flex items-center gap-6 text-sm text-muted-foreground pt-4 border-t border-border/50">
              <span className="flex items-center gap-1.5"><Download className="h-4 w-4" /> {model.downloads}</span>
              <span className="flex items-center gap-1.5"><Heart className="h-4 w-4" /> {model.likes.toLocaleString()}</span>
              <span className="flex items-center gap-1.5"><Calendar className="h-4 w-4" /> {model.lastUpdated}</span>
            </div>
          </div>

          {renderInterface()}
        </motion.div>
      </div>
    </div>
  );
}
