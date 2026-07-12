"use client";

import { defaultBillingData } from "@/data/billing";
import { useEffect, useRef } from "react";
import { SwissQRBill } from "swissqrbill/svg";
import type { Data } from "swissqrbill/types";

function QRBill({ data = defaultBillingData }: { data?: Data }) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const bill = new SwissQRBill(data);
    const svgEl = bill.element;

    svgEl.style.width = "100%";
    svgEl.style.height = "auto";
    svgEl.style.display = "block";

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(svgEl);
  }, [data]);

  return <div ref={containerRef} className="w-full" />;
}

export default QRBill;
