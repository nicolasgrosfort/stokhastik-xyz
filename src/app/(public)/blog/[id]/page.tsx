// app/blog/[id]/page.tsx
"use client";

import { H1 } from "@/components/common/h1";
import { useBlogPost } from "@/hooks/use-blog-post";
import { resolveCraftLinks } from "@/libs/solve-craft-links";
import { useParams } from "next/navigation";
import ReactMarkdown from "react-markdown";

export default function BlogPostPage() {
  const { id } = useParams<{ id: string }>();
  const { data: post, isLoading, isError } = useBlogPost(id);

  return (
    <div className="text-foreground h-full w-full min-h-0">
      <div className="h-full w-full min-h-0 gap-px">
        <article className="bg-background w-full h-full min-h-0 overflow-y-auto p-4 text-left">
          {" "}
          {isLoading && <p>Chargement…</p>}
          {!isLoading && (isError || !post) ? (
            <p>Article introuvable.</p>
          ) : null}
          {!isLoading && !isError && post && (
            <>
              <h1 className="text-3xl font-medium mb-8">{post.title}</h1>
              <div className="flex flex-col gap-4 prose">
                {post.content.map((paragraph, i) => (
                  <ReactMarkdown
                    key={i}
                    components={{
                      a(props) {
                        const { node, ...rest } = props;
                        console.log(props);
                        return <a style={{ color: "red" }} {...rest} />;
                      },
                      h1(props) {
                        return <H1 className="">{props.children}</H1>;
                      },
                    }}
                  >
                    {resolveCraftLinks(paragraph)}
                  </ReactMarkdown>
                ))}
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  );
}
