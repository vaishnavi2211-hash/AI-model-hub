import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Upload, X, Plus, CheckCircle2, LogIn } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import { ModelCategory } from "@/lib/models";
import { useCommunityModels } from "@/lib/community-models";

import { useAuth } from "@/contexts/AuthContext";
import { Link } from "react-router-dom";

export default function UploadModel() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { addModel } = useCommunityModels();

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<ModelCategory | "">("");
  const [apiEndpoint, setApiEndpoint] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Model name is required";
    if (name.length > 50) e.name = "Name must be under 50 characters";
    if (!description.trim()) e.description = "Description is required";
    if (description.length > 300) e.description = "Description must be under 300 characters";
    if (!category) e.category = "Category is required";
    if (apiEndpoint && !/^https?:\/\/.+/.test(apiEndpoint)) e.apiEndpoint = "Must be a valid URL";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    addModel({
      name: name.trim(),
      description: description.trim(),
      category: category as ModelCategory,
      tags,
      apiEndpoint: apiEndpoint.trim() || undefined,
    });

    setSubmitted(true);
    toast.success("Model submitted successfully!");
    setTimeout(() => navigate("/models"), 2000);
  };

  if (!user) {
    return (
      <div className="min-h-screen py-12">
        <div className="container mx-auto px-4 max-w-2xl text-center">
          <div className="glass rounded-xl p-12">
            <LogIn className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h2 className="text-2xl font-display font-bold mb-2">Sign in Required</h2>
            <p className="text-muted-foreground mb-6">Please sign in to upload your own models to the community.</p>
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
      <div className="container mx-auto px-4 max-w-2xl">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-display font-bold mb-2">Upload Your Model</h1>
          <p className="text-muted-foreground mb-8">Share your AI model with the community</p>

          <AnimatePresence mode="wait">
            {submitted ? (
              <motion.div
                key="success"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass rounded-xl p-12 text-center"
              >
                <CheckCircle2 className="h-16 w-16 text-success mx-auto mb-4" />
                <h2 className="text-2xl font-display font-bold mb-2">Model Submitted!</h2>
                <p className="text-muted-foreground">Your model is now live in the gallery.</p>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={handleSubmit} className="glass rounded-xl p-6 space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="name">Model Name *</Label>
                  <Input id="name" placeholder="e.g. MyTextGen-7B" value={name} onChange={(e) => setName(e.target.value)} className="bg-background/50" />
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">Description *</Label>
                  <Textarea id="description" placeholder="Describe what your model does..." value={description} onChange={(e) => setDescription(e.target.value)} className="bg-background/50 min-h-[100px]" />
                  {errors.description && <p className="text-xs text-destructive">{errors.description}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Category *</Label>
                  <Select value={category} onValueChange={(v) => setCategory(v as ModelCategory)}>
                    <SelectTrigger className="bg-background/50">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="text">Text</SelectItem>
                      <SelectItem value="image">Image</SelectItem>
                      <SelectItem value="audio">Audio</SelectItem>
                      <SelectItem value="chat">Chat</SelectItem>
                      <SelectItem value="multimodal">Multimodal</SelectItem>
                    </SelectContent>
                  </Select>
                  {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endpoint">API Endpoint (optional)</Label>
                  <Input id="endpoint" placeholder="https://api.example.com/v1/predict" value={apiEndpoint} onChange={(e) => setApiEndpoint(e.target.value)} className="bg-background/50" />
                  {errors.apiEndpoint && <p className="text-xs text-destructive">{errors.apiEndpoint}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Tags (up to 5)</Label>
                  <div className="flex gap-2">
                    <Input placeholder="Add a tag" value={tagInput} onChange={(e) => setTagInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addTag())} className="bg-background/50" />
                    <Button type="button" variant="outline" size="icon" onClick={addTag}><Plus className="h-4 w-4" /></Button>
                  </div>
                  {tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {tags.map((tag) => (
                        <Badge key={tag} variant="secondary" className="gap-1 pr-1">
                          {tag}
                          <button type="button" onClick={() => removeTag(tag)} className="hover:text-destructive">
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                <Button type="submit" className="w-full gap-2">
                  <Upload className="h-4 w-4" /> Submit Model
                </Button>
              </motion.form>
            )}
          </AnimatePresence>
        </motion.div>
      </div>
    </div>
  );
}
