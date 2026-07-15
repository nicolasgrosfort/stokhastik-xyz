import { Item, ItemWithStatus, Status } from "@/components/item";
import { items } from "@/data/items";
import { useQuery } from "@tanstack/react-query";

type StatusMap = Record<Item["id"], Status>;

type StatusResponse = {
  success: boolean;
  data: StatusMap;
};

async function fetchStatus(): Promise<StatusResponse> {
  const statusApi =
    process.env.NODE_ENV === "production" ? "/api/status.php" : "/api/status";
  const response = await fetch(statusApi);
  if (!response.ok) throw new Error("Failed to fetch status");

  return response.json();
}

export function useGetItems(id: Item["id"] | null = null) {
  const { data, error, isPending, isFetching } = useQuery({
    queryKey: ["status"],
    queryFn: fetchStatus,
    refetchInterval: 1_000,
    select: (response) => response.data,
    refetchIntervalInBackground: true,
  });

  const mergedItems: ItemWithStatus[] = items.map((item) => ({
    ...item,
    status: data?.[Number(item.id)] ?? "available",
  }));

  if (id) {
    const item = mergedItems.find((item) => item.id === id);
    return { items: mergedItems, item, error, isPending, isFetching };
  }

  return { items: mergedItems, error, isPending, isFetching };
}
