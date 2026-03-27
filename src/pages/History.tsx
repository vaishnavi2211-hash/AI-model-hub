import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Trash2, ArrowRight, LogIn } from "lucide-react";
import { motion } from "framer-motion";
import { toast } from "sonner";

interface HistoryItem {
  id: string;
  model_id: string;
  model_name: string;
  tool_type: string;
  prompt: string;
  output: string | null;
  output_image_url: string | null;
  created_at: string;
}

export default function History() {
  const { user } = useAuth();
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) { setLoading(false); return; }

    if (user.id === "debug-user-id") {
      const saved = localStorage.getItem("guest_prompt_history");
      if (saved) {
        try {
          const history = JSON.parse(saved);
          setItems(history);
        } catch (e) {
          console.error("Failed to parse guest history", e);
        }
      }
      setLoading(false);
      return;
    }

    supabase
      .from("prompt_history")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50)
      .then(({ data }) => {
        setItems((data as HistoryItem[]) || []);
        setLoading(false);
      });
  }, [user]);

  const handleDelete = async (id: string) => {
    if (user && user.id !== "debug-user-id") {
      await supabase.from("prompt_history").delete().eq("id", id);
    } else {
      const saved = localStorage.getItem("guest_prompt_history");
      if (saved) {
        try {
          const history = JSON.parse(saved).filter((i: any) => i.id !== id);
          localStorage.setItem("guest_prompt_history", JSON.stringify(history));
        } catch (e) {
          console.error("Failed to update guest history", e);
        }
      }
    }
    setItems(items.filter((i) => i.id !== id));
    toast.success("Deleted from history");
  };

  if (!user) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-4xl text-center">
          <div className="glass rounded-xl p-12">
            <LogIn className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to view your prompt history.</p>
            <Button asChild className="gap-2">
              <Link to="/login"><LogIn className="h-4 w-4" /> Sign In / Sign Up</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-6 w-6 text-primary" />
            <h1 className="text-3xl font-display font-bold">Prompt History</h1>
          </div>
          <p className="text-muted-foreground mb-8">Your recent AI generations</p>

          {loading ? (
            <div className="glass rounded-xl p-12 text-center text-muted-foreground">Loading...</div>
          ) : items.length === 0 ? (
            <div className="glass rounded-xl p-12 text-center">
              <p className="text-muted-foreground mb-4">No history yet. Try generating something!</p>
              <Button asChild className="gap-2">
                <Link to="/models">Browse Models <ArrowRight className="h-4 w-4" /></Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {items.map((item) => (
                <motion.div key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="glass rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{item.tool_type}</Badge>
                      <Link to={`/models/${item.model_id}`} className="text-sm font-medium text-primary hover:underline">{item.model_name}</Link>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</span>
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleDelete(item.id)}>
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
                      </Button>
                    </div>
                  </div>
                  <p className="text-sm text-foreground/80 mb-2"><span className="text-muted-foreground">Prompt:</span> {item.prompt}</p>
                  {item.output_image_url && (
                    <img src={item.output_image_url} alt="Generated" className="rounded-lg max-h-48 mb-2" />
                  )}
                  {item.output && (
                    <p className="text-sm text-muted-foreground line-clamp-3">{item.output}</p>
                  )}
                  <div className="mt-3">
                    <Button asChild variant="outline" size="sm" className="gap-1 text-xs">
                      <Link to={`/models/${item.model_id}`}>Re-run <ArrowRight className="h-3 w-3" /></Link>
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
