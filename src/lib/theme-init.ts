import { useEffect } from "react";

// Initialize dark mode on app load
if (typeof window !== "undefined") {
  const saved = localStorage.getItem("theme");
  if (!saved || saved === "dark") {
    document.documentElement.classList.add("dark");
  }
}
