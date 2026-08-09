import { GetStoreItem } from "@/libs/store-item";
import { useQuery } from "@tanstack/react-query";

type ItemsResponse = {
  success: boolean;
  data: GetStoreItem[];
};

async function fetchItems(): Promise<ItemsResponse> {
  const response = await fetch("/api/store/items");
  if (!response.ok) throw new Error("Failed to fetch items");

  return response.json();
}

export function useGetItems(slug: GetStoreItem["slug"] | null = null) {
  const { data, error, isPending, isFetching } = useQuery({
    queryKey: ["store-items"],
    queryFn: fetchItems,
    refetchInterval: 1_000,
    select: (response) => response.data,
    refetchIntervalInBackground: true,
  });

  const items = data ?? [];

  if (slug) {
    const item = items.find((item) => item.slug === slug);
    return { items, item, error, isPending, isFetching };
  }

  return { items, error, isPending, isFetching };
}
