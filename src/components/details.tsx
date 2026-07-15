"use client";

import { Badge } from "@/components/badge";
import { H3 } from "@/components/h3";
import { Item } from "@/components/item";
import { Payment } from "@/components/payement";
import { Price } from "@/components/price";
import { Registration } from "@/components/registration";
import { useGetItems } from "@/hooks/useGetItems";
import Link from "next/link";
import { redirect } from "next/navigation";
import { inferParserType, parseAsStringLiteral, useQueryState } from "nuqs";
import { useEffect } from "react";

export const stepParser = parseAsStringLiteral(["registration", "qr-code"]);
export type Step = inferParserType<typeof stepParser>;

export const Details = ({ id }: { id: Item["id"] }) => {
  const [step, setStep] = useQueryState("process", stepParser);
  const { item } = useGetItems(id);

  if (!item) {
    redirect("/store");
  }

  useEffect(() => {
    if (step === "registration" && item?.status !== "available") {
      setStep(null);
    }
  }, [item?.status, step, setStep]);

  return (
    <>
      <H3 className="uppercase">{item.name}</H3>
      <div>
        <p className="font-mono text-sm">{item.description}</p>
        <Price price={item.price} />
      </div>

      <hr className="border-0 border-t sm:max-w-104 w-full my-2" />

      {step === "registration" ? (
        <>
          <p className="font-mono text-xs block w-full sm:max-w-104 mb-2">
            After submitting this form, you’ll receive an invoice. The item will
            be reserved for 5 days pending payment. After that, it will be made
            available again.
          </p>
          <Registration item={item} />
        </>
      ) : step === "qr-code" ? (
        <>
          <p className="font-mono text-xs block w-full sm:max-w-104 mb-2">
            <strong>Thank you for your support!</strong> <br />
            Please use the Swiss QR Bill below to complete your payment. A
            confirmation email with your invoice and payment details has been
            sent to your email address.
          </p>
          <Payment item={item} />
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
