import {
  FileText, BookOpen, CheckCheck, Feather, Code2,
  Image, Maximize, Eraser, ImageIcon,
  MessageCircle, GraduationCap, Lightbulb,
  Music, Mic, Layers, Wand2, Download, Heart,
  Headphones, Speech, Video, Play
} from "lucide-react";
import type { LucideIcon } from "lucide-react";

export type ModelCategory = "text" | "image" | "audio" | "multimodal" | "chat";

export type ToolType = 
  | "text-generator" | "summarizer" | "grammar-corrector" | "story-generator" | "code-generator"
  | "image-generator" | "image-upscaler" | "bg-remover" | "image-caption"
  | "chat" | "study-assistant" | "startup-ideas"
  | "speech-to-text" | "voice-transcription" | "voice-chat"
  | "video-generator";

export interface AIModel {
  id: string;
  name: string;
  description: string;
  category: ModelCategory;
  downloads: string;
  likes: number;
  tags: string[];
  author: string;
  lastUpdated: string;
  toolType?: ToolType;
  icon?: LucideIcon;
  isCommunity?: boolean;
  isFeatured?: boolean;
  apiEndpoint?: string;
  interfaceType?: "text" | "image" | "chat";
  supportsVision?: boolean;
}

export const models: AIModel[] = [
  // ── Text Models ──
  {
    id: "neural-text-gen-7b",
    name: "NeuralText-Gen-7B",
    description: "A powerful 7B parameter language model for creative text generation, storytelling, and content creation with state-of-the-art coherence.",
    category: "text",
    downloads: "2.4M",
    likes: 8420,
    tags: ["text-generation", "transformer", "7B"],
    author: "ModelHub Labs",
    lastUpdated: "2 days ago",
    toolType: "text-generator",
    interfaceType: "text",
    icon: FileText,
  },
  {
    id: "summarize-pro-3b",
    name: "SummarizePro-3B",
    description: "Extracts key insights and generates concise summaries from long documents, articles, and research papers with 95% accuracy.",
    category: "text",
    downloads: "1.8M",
    likes: 6230,
    tags: ["summarization", "nlp", "3B"],
    author: "TextAI Research",
    lastUpdated: "5 days ago",
    toolType: "summarizer",
    interfaceType: "text",
    icon: BookOpen,
  },
  {
    id: "grammar-corrector-v2",
    name: "GrammarFix-V2",
    description: "Advanced grammar and style correction model that fixes spelling, punctuation, tone, and sentence structure across 30+ languages.",
    category: "text",
    downloads: "1.5M",
    likes: 5100,
    tags: ["grammar", "correction", "multilingual"],
    author: "LinguaAI",
    lastUpdated: "1 day ago",
    toolType: "grammar-corrector",
    interfaceType: "text",
    icon: CheckCheck,
  },
  {
    id: "code-gen-15b",
    name: "CodeGen-15B",
    description: "Advanced code generation model supporting 20+ programming languages with intelligent autocomplete and bug detection features.",
    category: "text",
    downloads: "2.9M",
    likes: 9450,
    tags: ["code-generation", "15B", "multilang"],
    author: "DevAI Systems",
    lastUpdated: "12 hours ago",
    toolType: "code-generator",
    interfaceType: "text",
    icon: Code2,
    isFeatured: true,
  },
  // ── Image Models ──
  {
    id: "diffusion-xl-v2",
    name: "DiffusionXL-v2",
    description: "Next-generation image synthesis model producing photorealistic images from text descriptions with unparalleled detail and composition.",
    category: "image",
    downloads: "5.1M",
    likes: 15700,
    tags: ["image-generation", "diffusion", "XL"],
    author: "PixelMind AI",
    lastUpdated: "1 day ago",
    toolType: "image-generator",
    interfaceType: "image",
    icon: Image,
    isFeatured: true,
  },
  {
    id: "image-caption-gen",
    name: "CaptionAI-V3",
    description: "Generates accurate, descriptive captions for images using vision-language understanding with support for multiple styles.",
    category: "image",
    downloads: "780K",
    likes: 3500,
    tags: ["captioning", "vision-language", "V3"],
    author: "DeepVision",
    lastUpdated: "1 week ago",
    toolType: "image-caption",
    interfaceType: "text",
    icon: ImageIcon,
    supportsVision: true,
  },
  // ── Chat Models ──
  {
    id: "friendly-chat-companion",
    name: "AI Buddy - Friendly Chat",
    description: "Your friendly, human-like companion! Perfect for open-ended conversations, advice, or just chatting about your day like a friend.",
    category: "chat",
    downloads: "5.2M",
    likes: 24500,
    tags: ["chat", "assistant", "conversational"],
    author: "ModelHub Labs",
    lastUpdated: "Just now",
    toolType: "chat",
    interfaceType: "chat",
    icon: MessageCircle,
    isFeatured: true,
    supportsVision: true,
  },
  {
    id: "study-assistant",
    name: "StudyBuddy-AI",
    description: "Personalized AI tutor that explains concepts, generates quizzes, and creates study plans across all academic subjects. Supports images for homework help.",
    category: "chat",
    downloads: "1.1M",
    likes: 5400,
    tags: ["education", "tutoring", "multimodal"],
    author: "EduTech AI",
    lastUpdated: "2 days ago",
    toolType: "study-assistant",
    interfaceType: "chat",
    icon: GraduationCap,
    supportsVision: true,
    isFeatured: true,
  },
  // ── Audio Models ──
  {
    id: "audio-transcribe-large",
    name: "AudioScribe-Large",
    description: "Multilingual speech recognition model supporting 50+ languages with real-time transcription and speaker diarization capabilities.",
    category: "audio",
    downloads: "980K",
    likes: 4100,
    tags: ["speech-to-text", "multilingual", "large"],
    author: "SoundWave AI",
    lastUpdated: "1 week ago",
    toolType: "speech-to-text",
    interfaceType: "text",
    icon: Mic,
  },
  // ── Video Models ──
  {
    id: "video-gen-v1",
    name: "VideoGen-V1",
    description: "AI-powered video generation model that creates short video clips from text descriptions. Generate concept videos, animations, and visual stories.",
    category: "image",
    downloads: "1.6M",
    likes: 11200,
    tags: ["video-generation", "text-to-video", "animation"],
    author: "MotionAI Labs",
    lastUpdated: "1 day ago",
    toolType: "video-generator",
    interfaceType: "image",
    icon: Video,
  },
  // ── Multimodal ──
  {
    id: "multimodal-fusion-xl",
    name: "MultiModal-Fusion-XL",
    description: "Unified model processing text, images, and audio simultaneously for complex cross-modal reasoning and generation tasks.",
    category: "multimodal",
    downloads: "720K",
    likes: 5620,
    tags: ["multimodal", "fusion", "XL"],
    author: "OmniAI Labs",
    lastUpdated: "6 days ago",
    toolType: "chat",
    interfaceType: "chat",
    icon: Layers,
    supportsVision: true,
  },
];

export const categories: { label: string; value: ModelCategory | "all" }[] = [
  { label: "All Models", value: "all" },
  { label: "Text", value: "text" },
  { label: "Image", value: "image" },
  { label: "Chat", value: "chat" },
  { label: "Audio", value: "audio" },
];

export type SortOption = "popular" | "newest" | "name" | "trending" | "fastest";

export const sortOptions: { label: string; value: SortOption }[] = [
  { label: "Trending", value: "trending" },
  { label: "Most Popular", value: "popular" },
  { label: "Newest", value: "newest" },
  { label: "A-Z", value: "name" },
];
