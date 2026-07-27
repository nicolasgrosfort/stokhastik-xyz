import { stepParser } from "@/components/details";
import { H4 } from "@/components/h4";
import { Item } from "@/components/item";
import QRCode from "@/components/qr-code";
import { billing } from "@/data/billing";
import Link from "next/link";
import { useQueryState } from "nuqs";

export const Payment = ({ item }: { item: Item }) => {
  const [, setStep] = useQueryState("process", stepParser);

  const message = `${billing.message}: ${item.name}`;

  const qrBillApi =
    process.env.NODE_ENV === "production" ? "/api/qr-bill.php" : "/api/qr-bill";
  const qrBillHref = `${qrBillApi}?${new URLSearchParams({
    name: item.name,
    price: String(item.price ?? 0),
    message,
  }).toString()}`;

  return (
    <>
      <div className="flex gap-4 w-full items-start">
        <div className="w-50">
          <QRCode price={item.price} message={message} />
        </div>
        <div className="flex flex-col gap-2">
          <div>
            <H4>Account</H4>
            <p className="font-mono text-xs sm:text-sm">
              {billing.creditor.account}
            </p>
            <p className="font-mono text-xs sm:text-sm">
              {billing.creditor.name}
            </p>
            <p className="font-mono text-xs sm:text-sm">
              {billing.creditor.address}
            </p>
            <p className="font-mono text-xs sm:text-sm">
              {billing.creditor.city}, {billing.creditor.zip}
            </p>
          </div>

          <div>
            <H4>Additional information</H4>
            <p className="font-mono text-xs sm:text-sm">{message}</p>
          </div>

          <div className="flex gap-2">
            <div>
              <H4>Currency</H4>
              <p className="font-mono text-xs sm:text-sm">{billing.currency}</p>
            </div>
            <div>
              <H4>Amount</H4>
              <p className="font-mono text-xs sm:text-sm">
                {item.price?.toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2 w-full items-center mt-2">
        <Link
          href={qrBillHref}
          className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
        >
          Download
        </Link>
        <button
          onClick={() => setStep(null)}
          className=" border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
        >
          Back
        </button>
      </div>
    </>
  );
};
