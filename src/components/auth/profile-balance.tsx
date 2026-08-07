"use client";

import { useGetTokens } from "@/hooks/useGetTokens";

type ProfileBalanceProps = {
  initialTokens: number;
};

export function ProfileBalance({ initialTokens }: ProfileBalanceProps) {
  const { tokens } = useGetTokens();

  return <p>{tokens ?? initialTokens} STKH</p>;
}
