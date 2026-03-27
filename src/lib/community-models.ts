import { useState, useEffect } from "react";
import { AIModel, ModelCategory } from "./models";
import { Users } from "lucide-react";

const STORAGE_KEY = "community-models";

interface CommunityModelInput {
  name: string;
  description: string;
  category: ModelCategory;
  tags: string[];
  apiEndpoint?: string;
}

function loadModels(): AIModel[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

function saveModels(models: AIModel[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(models));
}

export function useCommunityModels() {
  const [communityModels, setCommunityModels] = useState<AIModel[]>(loadModels);

  useEffect(() => {
    saveModels(communityModels);
  }, [communityModels]);

  const addModel = (input: CommunityModelInput) => {
    const id = `community-${Date.now()}`;
    const newModel: AIModel = {
      id,
      name: input.name,
      description: input.description,
      category: input.category,
      downloads: "0",
      likes: 0,
      tags: input.tags,
      author: "Community",
      lastUpdated: "Just now",
      isCommunity: true,
      apiEndpoint: input.apiEndpoint,
    };
    setCommunityModels((prev) => [newModel, ...prev]);
    // Also persist immediately for other hook instances
    const current = loadModels();
    saveModels([newModel, ...current]);
  };

  return { communityModels, addModel };
}

export function getCommunityModels(): AIModel[] {
  return loadModels();
}
