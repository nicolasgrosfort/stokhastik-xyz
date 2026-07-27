"use client";

import { billing } from "@/data/billing";
import { makeSvgResponsive } from "@/libs/utils";
import { useEffect, useRef } from "react";
import { SwissQRCode } from "swissqrbill/svg";
import { Data } from "swissqrbill/types";

type QRCodeProps = {
  data?: Data;
  size?: number;
  price: number;
  message?: string;
};

function QRCode({ data = billing, size = 46, price, message }: QRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const qrCode = new SwissQRCode({ ...data, amount: price, message }, size);
    const svgEl = qrCode.element;

    makeSvgResponsive(svgEl, size);

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(svgEl);
  }, [data, size, price, message]);

  return (
    <div
      ref={containerRef}
      className="w-full h-full bg-white border border-white"
    />
  );
}

export default QRCode;
