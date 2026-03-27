import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { categories, ModelCategory } from "@/lib/models";
import { cn } from "@/lib/utils";

interface SearchFilterProps {
  search: string;
  onSearchChange: (val: string) => void;
  activeCategory: ModelCategory | "all";
  onCategoryChange: (val: ModelCategory | "all") => void;
}

export function SearchFilter({ search, onSearchChange, activeCategory, onCategoryChange }: SearchFilterProps) {
  return (
    <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center">
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search models..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10 bg-card border-border/50"
        />
      </div>
      <div className="flex gap-1.5 flex-wrap">
        {categories.map((cat) => (
          <button
            key={cat.value}
            onClick={() => onCategoryChange(cat.value)}
            className={cn(
              "px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all",
              activeCategory === cat.value
                ? "bg-primary text-primary-foreground shadow-md"
                : "bg-muted text-muted-foreground hover:bg-muted/80"
            )}
          >
            {cat.label}
          </button>
        ))}
      </div>
    </div>
  );
}
