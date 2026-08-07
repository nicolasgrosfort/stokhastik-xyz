export type PackId = "small" | "medium" | "large" | "huge";

export type Pack = {
  id: PackId;
  tokens: number;
};

export const exchangeRate = 0.005; // 1 token = 0.005 CHF

export const packs: Pack[] = [
  {
    id: "small",
    tokens: 1000,
  },
  {
    id: "medium",
    tokens: 2000,
  },
  {
    id: "large",
    tokens: 4000,
  },
  {
    id: "huge",
    tokens: 10000,
  },
];

export const tokensToCHF = (tokens: number): number => {
  return tokens * exchangeRate;
};

export const isPackId = (value: unknown): value is PackId => {
  return (
    typeof value === "string" &&
    ["small", "medium", "large", "huge"].includes(value)
  );
};

export const getPackById = (packId: PackId): Pack => {
  const pack = packs.find((pack) => pack.id === packId);
  if (!pack) {
    throw new Error(`Pack not found for ID: ${packId}`);
  }
  return pack;
};
