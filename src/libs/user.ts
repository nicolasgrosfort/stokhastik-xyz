import { Prisma } from "@prisma/client";

export const getUserArgs = {
  orderBy: [{ createdAt: "desc" }],

  select: {
    id: true,
    firstName: true,
    lastName: true,
    email: true,
    role: true,
    tokens: true,
    newsletter: true,
    createdAt: true,
  },
} satisfies Prisma.UserFindManyArgs;

export type GetUser = Prisma.UserGetPayload<typeof getUserArgs>;
