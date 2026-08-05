import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";

type TokensResponse = {
  success: boolean;
  data: { tokens: number };
};

async function fetchTokens(): Promise<TokensResponse> {
  const response = await fetch("/api/user/tokens");
  if (!response.ok) throw new Error("Failed to fetch tokens");

  return response.json();
}

export function useGetTokens() {
  const { status } = useSession();

  const { data, error, isPending } = useQuery({
    queryKey: ["user-tokens"],
    queryFn: fetchTokens,
    select: (response) => response.data.tokens,
    enabled: status === "authenticated",
  });

  return { tokens: data, error, isPending };
}
