"use client";

import { Scramble } from "@/components/common/scramble";
import { useGetTokens } from "@/hooks/useGetTokens";

type ProfileBalanceProps = {
  initialTokens: number;
};

export function ProfileBalance({ initialTokens }: ProfileBalanceProps) {
  const { tokens } = useGetTokens();

  const text = `${(tokens ?? initialTokens).toLocaleString("fr-CH")} STKH`;

  return <Scramble scrambleOnMount>{text}</Scramble>;
}
