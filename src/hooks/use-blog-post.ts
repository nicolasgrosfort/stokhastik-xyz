// hooks/use-blog-post.ts

import { BlogPost } from "@/libs/blog";
import { useQuery } from "@tanstack/react-query";

async function fetchBlogPost(id: string): Promise<BlogPost> {
  const res = await fetch(`/api/blog/${id}`);
  if (!res.ok) throw new Error("Article introuvable");
  const data = await res.json();
  return data.post;
}

export function useBlogPost(id: string) {
  return useQuery({
    queryKey: ["blog-post", id],
    queryFn: () => fetchBlogPost(id),
    enabled: !!id,
    staleTime: 60 * 1000,
  });
}
