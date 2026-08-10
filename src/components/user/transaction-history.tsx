import { FormatedDate } from "@/components/common/formated-date";
import {
  transactionStatusLabels as statusLabels,
  transactionTypeLabels as typeLabels,
} from "@/libs/transaction";
import { formatSwissNumber } from "@/libs/utils";
import { Transaction } from "@prisma/client";

export function TransactionHistory({
  transactions,
}: {
  transactions: Transaction[];
}) {
  if (transactions.length === 0) {
    return <p className="text-xs">Aucune transaction pour l&apos;instant.</p>;
  }

  return (
    <div className="flex flex-col gap-2 w-full">
      {transactions.map((entry) => (
        <div
          key={entry.id}
          className="grid grid-cols-4 items-center gap-4 border border-dark-green p-2 text-xs"
        >
          <FormatedDate date={entry.createdAt} />
          <span className="text-left text-ellipsis overflow-hidden whitespace-nowrap">
            {typeLabels[entry.type]}
            {entry.status !== "SUCCEEDED"
              ? ` — ${statusLabels[entry.status]}`
              : ""}
          </span>
          <span className="text-right text-ellipsis overflow-hidden whitespace-nowrap">
            {entry.amount !== null
              ? `${(entry.amount / 100).toFixed(2)} CHF`
              : entry.description}
          </span>

          <span className="text-right text-ellipsis overflow-hidden whitespace-nowrap">
            {entry.tokens >= 0 ? "+" : ""}
            {formatSwissNumber(entry.tokens)} STKH
          </span>
        </div>
      ))}
    </div>
  );
}
