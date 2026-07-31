import { Item, ItemWithStatus, Status } from "@/components/item";
import { items } from "@/data/items";
import { useQuery } from "@tanstack/react-query";

type StatusMap = Record<
  Item["id"],
  { status: Status; buyBy: string; buyAt: string }
>;

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
    status: data?.[Number(item.id)]?.status ?? "available",
    buyBy: data?.[Number(item.id)]?.buyBy ?? "",
    buyAt: data?.[Number(item.id)]?.buyAt ?? "",
  }));

  if (id) {
    const item = mergedItems.find((item) => item.id === id);
    return { items: mergedItems, item, error, isPending, isFetching };
  }

  return { items: mergedItems, error, isPending, isFetching };
}
