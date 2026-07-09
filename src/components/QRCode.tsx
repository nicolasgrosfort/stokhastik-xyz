import { useEffect, useRef } from "react";
import { SwissQRCode } from "swissqrbill/svg";
import type { Data } from "swissqrbill/types";

interface QRCodeProps {
  data?: Data;
  size?: number;
}

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

function QRCode({ data = defaultData, size }: QRCodeProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const qrCode = new SwissQRCode(data, size);

    containerRef.current.innerHTML = "";
    containerRef.current.appendChild(qrCode.element);
  }, [data, size]);

  return <div ref={containerRef} />;
}

export default QRCode;
