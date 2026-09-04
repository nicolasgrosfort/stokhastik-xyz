// hooks/use-blog-posts.ts
import type { BlogPost } from "@/libs/blog";
import { useQuery } from "@tanstack/react-query";

async function fetchBlogPosts(): Promise<BlogPost[]> {
  const res = await fetch("/api/blog");
  if (!res.ok) throw new Error("Erreur lors du chargement des textes");
  const data = await res.json();
  return data.posts;
}

export function useBlogPosts() {
  return useQuery({
    queryKey: ["blog-posts"],
    queryFn: fetchBlogPosts,
    staleTime: 60 * 1000,
  });
}
