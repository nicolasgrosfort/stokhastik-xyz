"use client";

import { H3 } from "@/components/common/h3";
import { useBlogPosts } from "@/hooks/use-blog-posts";
import Link from "next/link";

export default function BlogPage() {
  const { data: posts, isLoading, isError } = useBlogPosts();

  return (
    <div className="text-foreground h-full w-full min-h-0">
      <div className="h-full w-full min-h-0 gap-px">
        <div className="bg-background w-full h-full min-h-0 p-4 text-left">
          <H3>Articles</H3>
          {isLoading && <p>Chargement…</p>}
          {isError && <p>Une erreur est survenue.</p>}

          {posts && (
            <div className="flex flex-col gap-px">
              {posts.map((post) => (
                <article key={post.id}>
                  <Link href={`/blog/${post.id}`} className="block">
                    {post.title}
                  </Link>
                </article>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
