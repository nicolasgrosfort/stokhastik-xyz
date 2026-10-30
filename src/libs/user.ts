import { Prisma, Role } from "@prisma/client";

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

export type UserInput = {
  firstName: string;
  lastName: string;
  email: string;
  role: Role;
  newsletter: boolean;
};

export function parseUserInput(
  body: unknown,
): { data: UserInput } | { error: string } {
  if (
    typeof body !== "object" ||
    body === null ||
    !("firstName" in body) ||
    !("lastName" in body) ||
    !("email" in body) ||
    !("role" in body) ||
    !("newsletter" in body) ||
    typeof body.firstName !== "string" ||
    typeof body.lastName !== "string" ||
    typeof body.email !== "string" ||
    typeof body.newsletter !== "boolean" ||
    !body.firstName.trim() ||
    !body.lastName.trim() ||
    !body.email.trim()
  ) {
    return { error: "Merci de remplir correctement tous les champs requis." };
  }

  if (body.role !== "USER" && body.role !== "ADMIN") {
    return { error: "Rôle invalide." };
  }

  const email = body.email.trim().toLowerCase();

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { error: "Adresse email invalide." };
  }

  return {
    data: {
      firstName: body.firstName.trim(),
      lastName: body.lastName.trim(),
      email,
      role: body.role,
      newsletter: body.newsletter,
    },
  };
}
