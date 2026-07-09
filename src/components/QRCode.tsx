import { useEffect, useRef } from "react";
import { SwissQRCode } from "swissqrbill/svg";
import type { Data } from "swissqrbill/types";

const defaultData: Data = {
  amount: 1994.75,
  creditor: {
    account: "CH44 3199 9123 0008 8901 2",
    address: "Musterstrasse",
    buildingNumber: 7,
    city: "Musterstadt",
    country: "CH",
    name: "SwissQRBill",
    zip: 1234,
  },
  currency: "CHF",
  debtor: {
    address: "Musterstrasse",
    buildingNumber: 1,
    city: "Musterstadt",
    country: "CH",
    name: "Peter Muster",
    zip: 1234,
  },
  reference: "21 00000 00003 13947 14300 09017",
};

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
}

function QRCode({ data = defaultData, size = 46 }: QRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const qrCode = new SwissQRCode(data, size);
    const svgEl = qrCode.element;

    makeSvgResponsive(svgEl, size);

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(svgEl);
  }, [data, size]);

  return <div ref={containerRef} className="w-full h-full p-2" />;
}

export default QRCode;
