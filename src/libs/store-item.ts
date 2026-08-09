import { Prisma } from "@prisma/client";

export const getStoreItemArgs = {
  orderBy: { releaseDate: "desc" },

  include: {
    buyer: {
      select: {
        firstName: true,
      },
    },
  },
} satisfies Prisma.StoreItemFindManyArgs;

export type GetStoreItem = Prisma.StoreItemGetPayload<typeof getStoreItemArgs>;
