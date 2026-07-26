import matter from "@11ty/gray-matter";
import { useQuery } from "@tanstack/react-query";

type GithubContentItem = {
  name: string;
  path: string;
  sha: string;
  download_url: string;
  html_url: string;
};

type FragmentFrontMatter = {
  création: string;
  révision?: string | null;
  relations?: string[] | null;
  références?: string[] | null;
  citation?: string;
  embedding?: number[] | null;
  titre?: string | null;
  analyse?: string | null;
  type?: string[] | null;
  thématique?: string[] | null;
};

export type Fragment = {
  name: string;
  path: string;
  sha: string;
  downloadUrl: string;
  htmlUrl: string;
  data: FragmentFrontMatter;
  content: string;
  similarity: number;
};

type ErrorResponse = {
  success: false;
  error: string;
};

async function fetchFragmentContent(
  item: GithubContentItem,
): Promise<Fragment> {
  const response = await fetch(item.download_url);
  if (!response.ok) throw new Error(`Failed to fetch ${item.name}`);

  const raw = await response.text();
  const { data, content } = matter(raw);

  const embedding =
    typeof data.embedding === "string"
      ? (JSON.parse(data.embedding) as number[])
      : (data.embedding ?? null);

  return {
    name: item.name,
    path: item.path,
    sha: item.sha,
    downloadUrl: item.download_url,
    htmlUrl: item.html_url,
    data: { ...data, embedding } as FragmentFrontMatter,
    content: content.trim(),
    similarity: 0,
  };
}

async function fetchFragments(): Promise<Fragment[]> {
  const fragmentsApi =
    process.env.NODE_ENV === "production"
      ? "/api/fragments.php"
      : "/api/fragments";

  const response = await fetch(fragmentsApi);
  const items = await response.json();

  if (!response.ok)
    throw new Error((items as ErrorResponse).error ?? "Unknown error");

  return Promise.all((items as GithubContentItem[]).map(fetchFragmentContent));
}

export function useGetFragments() {
  const { data, error, isPending, isFetching } = useQuery({
    queryKey: ["fragments"],
    queryFn: fetchFragments,
  });

  return {
    fragments: data ?? [],
    error,
    isPending,
    isFetching,
  };
}
