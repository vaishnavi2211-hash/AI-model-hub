import { Link } from "react-router-dom";
import { Heart, Download, ArrowRight, Sparkles, Cpu } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AIModel } from "@/lib/models";
import { motion } from "framer-motion";

const categoryColors: Record<string, string> = {
  text: "bg-primary/10 text-primary border-primary/20",
  image: "bg-accent/10 text-accent border-accent/20",
  audio: "bg-success/10 text-success border-success/20",
  chat: "bg-warning/10 text-warning border-warning/20",
  multimodal: "bg-secondary text-secondary-foreground border-border",
};

export function ModelCard({ model, index = 0, featured = false }: { model: AIModel; index?: number; featured?: boolean }) {
  const IconComponent = model.icon || Cpu;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
      className="group"
    >
      <Link to={`/models/${model.id}`} className="block h-full">
        <div className={`relative rounded-xl h-full transition-all duration-300 hover:-translate-y-1.5 p-[1px] bg-gradient-to-br from-border/60 via-border/30 to-border/60 hover:from-primary/50 hover:via-accent/30 hover:to-primary/50 ${featured ? 'shadow-lg shadow-primary/10' : ''}`}>
          <div className="glass rounded-[11px] p-5 h-full flex flex-col">
            {/* Icon + Badges row */}
            <div className="flex items-start justify-between mb-4">
              <div className="h-11 w-11 rounded-lg bg-gradient-to-br from-primary/15 to-accent/10 flex items-center justify-center border border-primary/10 group-hover:border-primary/30 transition-colors">
                <IconComponent className="h-5 w-5 text-primary" />
              </div>
              <div className="flex items-center gap-2">
                {model.isCommunity && (
                  <Badge variant="outline" className="bg-accent/10 text-accent border-accent/20 text-[10px] px-1.5">
                    Community
                  </Badge>
                )}
                {model.isFeatured && (
                  <Sparkles className="h-4 w-4 text-warning" />
                )}
                <Badge variant="outline" className={`${categoryColors[model.category]} text-[10px] px-1.5`}>
                  {model.category}
                </Badge>
              </div>
            </div>

            <h3 className="font-display font-semibold text-base mb-1.5 group-hover:text-primary transition-colors">
              {model.name}
            </h3>
            <p className="text-sm text-muted-foreground mb-3 line-clamp-2 flex-1">
              {model.description}
            </p>

            <div className="flex flex-wrap gap-1 mb-4">
              {model.tags.slice(0, 3).map((tag) => (
                <span key={tag} className="text-[10px] px-2 py-0.5 rounded-full bg-muted/80 text-muted-foreground border border-border/50">
                  {tag}
                </span>
              ))}
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-border/40">
              <div className="flex items-center gap-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" /> {model.downloads}
                </span>
                <span className="flex items-center gap-1">
                  <Heart className="h-3 w-3" /> {model.likes.toLocaleString()}
                </span>
              </div>
              <Button variant="ghost" size="sm" className="h-7 px-2 text-xs gap-1 opacity-0 group-hover:opacity-100 transition-opacity text-primary">
                Launch <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
