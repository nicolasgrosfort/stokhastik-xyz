import { Prisma } from "@prisma/client";

export const transactionStatusLabels = {
  PENDING: "En attente",
  SUCCEEDED: "Réussi",
  FAILED: "Échoué",
};

export const transactionTypeLabels = {
  PURCHASE: "Recharge",
  SPEND: "Achat",
  REFUND: "Remboursement",
  BONUS: "Bonus",
  ADJUSTMENT: "Ajustement",
};

export const getTransactionArgs = {
  orderBy: [{ createdAt: "desc" }],

  include: {
    user: { select: { firstName: true, lastName: true, email: true } },
  },
} satisfies Prisma.TransactionFindManyArgs;

export type GetTransaction = Prisma.TransactionGetPayload<
  typeof getTransactionArgs
>;
