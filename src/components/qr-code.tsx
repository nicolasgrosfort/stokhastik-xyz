"use client";

import { billing } from "@/data/billing";
import { useEffect, useRef } from "react";
import { SwissQRCode } from "swissqrbill/svg";
import { Data } from "swissqrbill/types";

function makeSvgResponsive(svgEl: SVGElement, size: number) {
  svgEl.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svgEl.style.width = "100%";
  svgEl.style.height = "auto";
  svgEl.style.display = "block";

  const attrs = ["x", "y", "width", "height"];
  svgEl.querySelectorAll("*").forEach((el) => {
    for (const attr of attrs) {
      const value = el.getAttribute(attr);
      if (value?.endsWith("mm")) {
        el.setAttribute(attr, value.replace("mm", ""));
      }
    }
  });
}

interface QRCodeProps {
  data?: Data;
  size?: number;
  price: number;
  message?: string;
}

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

  return <div ref={containerRef} className="w-full h-full" />;
}

export default QRCode;
