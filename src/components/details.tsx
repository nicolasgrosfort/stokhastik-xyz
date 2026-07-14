"use client";

import { Badge } from "@/components/badge";
import { H3 } from "@/components/h3";
import { H4 } from "@/components/h4";
import { Item } from "@/components/item";
import { Price } from "@/components/price";
import QRCode from "@/components/qr-code";
import { Registration } from "@/components/registration";
import { billing } from "@/data/billing";
import Link from "next/link";
import { inferParserType, parseAsStringLiteral, useQueryState } from "nuqs";

export const stepParser = parseAsStringLiteral(["registration", "qr-code"]);
export type Step = inferParserType<typeof stepParser>;

export const Details = ({ item }: { item: Item }) => {
  const [step, setStep] = useQueryState("process", stepParser);

  const message = `${billing.message}: ${item.name}`;

  return (
    <>
      <H3 className="uppercase">{item.name}</H3>
      <p className="font-mono text-sm">{item.description}</p>
      <Price price={item.price} />
      <hr className="border-0 border-t sm:max-w-104 w-full my-2" />

      {step === "registration" ? (
        <Registration id={item.id} />
      ) : step === "qr-code" ? (
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
                  <p className="font-mono text-xs sm:text-sm">
                    {billing.currency}
                  </p>
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

          <button
            onClick={() => setStep(null)}
            className=" border border-foreground font-mono text-xs uppercase p-1 block sm:w-50 w-full cursor-pointer text-center hover:underline"
          >
            Back
          </button>
        </>
      ) : (
        <>
          <div className="flex gap-4 w-full items-center">
            {item.status === "available" ? (
              <button
                onClick={() => setStep("registration")}
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
