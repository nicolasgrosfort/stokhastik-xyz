"use client";

import { Badge } from "@/components/badge";
import { H3 } from "@/components/H3";
import { H4 } from "@/components/h4";
import { Item } from "@/components/item";
import { Price } from "@/components/price";
import QRCode from "@/components/qr-code";
import { billing } from "@/data/billing";
import Link from "next/link";
import { parseAsBoolean, useQueryState } from "nuqs";

export const Details = ({ item }: { item: Item }) => {
  const [showQR, setShowQR] = useQueryState(
    "showQR",
    parseAsBoolean.withDefault(false),
  );

  const message = `${billing.message}: ${item.name}`;

  return (
    <>
      <H3 className="uppercase">{item.name}</H3>
      <p className="font-mono text-sm">{item.description}</p>
      <Price price={item.price} />

      {showQR ? (
        <>
          <div className="flex gap-4 w-full items-center">
            <div className="w-50">
              <QRCode price={item.price} message={message} />
            </div>
            <div className="flex flex-col gap-2">
              <div>
                <H4>Account</H4>
                <p className="font-mono text-sm">{billing.creditor.account}</p>
                <p className="font-mono text-sm">{billing.creditor.name}</p>
                <p className="font-mono text-sm">{billing.creditor.address}</p>
                <p className="font-mono text-sm">
                  {billing.creditor.city}, {billing.creditor.zip}
                </p>
              </div>

              <div>
                <H4>Additional information</H4>
                <p className="font-mono text-sm">{message}</p>
              </div>

              <div className="flex gap-2">
                <div>
                  <H4>Currency</H4>
                  <p className="font-mono text-sm">{billing.currency}</p>
                </div>
                <div>
                  <H4>Amount</H4>
                  <p className="font-mono text-sm">{item.price?.toFixed(2)}</p>
                </div>
              </div>
            </div>
          </div>

          <Link
            href="/store"
            className="text-xs uppercase block sm:w-50 w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
          >
            Back
          </Link>
        </>
      ) : (
        <>
          <div className="flex gap-4 w-full items-center">
            {item.status === "available" ? (
              <button
                onClick={() => setShowQR(true)}
                className="bg-foreground text-background hover:bg-background hover:text-foreground border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
              >
                I want it
              </button>
            ) : (
              <Badge status={item.status} className="sm:w-50 w-full" />
            )}
            <Link
              href="/store"
              className="text-xs uppercase block sm:w-50 w-full cursor-pointer text-center border border-foreground font-mono p-1 hover:underline"
            >
              Back
            </Link>
          </div>
        </>
      )}
    </>
  );
};
