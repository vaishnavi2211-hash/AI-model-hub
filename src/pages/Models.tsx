import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { ModelCard } from "@/components/ModelCard";
import { SearchFilter } from "@/components/SearchFilter";
import { models, ModelCategory, SortOption } from "@/lib/models";
import { getCommunityModels } from "@/lib/community-models";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Upload } from "lucide-react";

import { useCommunityModels } from "@/lib/community-models";

export default function Models() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<ModelCategory | "all">("all");
  const [sort, setSort] = useState<SortOption>("trending");

  const { communityModels } = useCommunityModels();
  const allModels = useMemo(() => [...models, ...communityModels], [communityModels]);

  const filtered = useMemo(() => {
    const result = allModels.filter((m) => {
      const q = search.toLowerCase();
      const matchesSearch = !q ||
        m.name.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.tags.some((t) => t.toLowerCase().includes(q));
      const matchesCategory = category === "all" || m.category === category;
      return matchesSearch && matchesCategory;
    });

    result.sort((a, b) => {
      if (sort === "popular" || sort === "trending") return b.likes - a.likes;
      if (sort === "name") return a.name.localeCompare(b.name);
      return 0;
    });

    return result;
  }, [search, category, sort, allModels]);

  return (
    <div className="min-h-screen py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-display font-bold mb-2">Models</h1>
            <p className="text-muted-foreground">Browse {allModels.length} AI models across all categories</p>
          </div>
          <Button asChild className="gap-2 self-start">
            <Link to="/upload"><Upload className="h-4 w-4" /> Upload Model</Link>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-8">
          <div className="flex-1">
            <SearchFilter search={search} onSearchChange={setSearch} activeCategory={category} onCategoryChange={setCategory} />
          </div>
          <Select value={sort} onValueChange={(v) => setSort(v as SortOption)}>
            <SelectTrigger className="w-[160px] bg-background/50">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="trending">Trending</SelectItem>
              <SelectItem value="popular">Most Popular</SelectItem>
              <SelectItem value="newest">Newest</SelectItem>
              <SelectItem value="name">A-Z</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {filtered.length === 0 ? (
          <div className="glass rounded-xl p-12 text-center">
            <p className="text-muted-foreground">No models found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filtered.map((model, i) => (
              <ModelCard key={model.id} model={model} index={i} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
