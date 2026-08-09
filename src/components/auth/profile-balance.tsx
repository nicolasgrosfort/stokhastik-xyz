"use client";

import { Scramble } from "@/components/common/scramble";
import { useGetTokens } from "@/hooks/useGetTokens";
import { formatSwissNumber } from "@/libs/utils";

type ProfileBalanceProps = {
  initialTokens: number;
};

export function ProfileBalance({ initialTokens }: ProfileBalanceProps) {
  const { tokens } = useGetTokens();

  const text = `${formatSwissNumber(tokens ?? initialTokens)} STKH`;

  return <Scramble scrambleOnMount>{text}</Scramble>;
}
