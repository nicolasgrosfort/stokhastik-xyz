import { Status } from "@/components/item";

const STATUS_MAP: Record<Status, string | null> = {
  available: null,
  sold: "Sold out",
};

export const Badge = ({
  status,
  className,
}: {
  status: Status;
  className?: string;
}) => {
  const statusText = STATUS_MAP[status];

  if (!statusText) return null;

  return (
    <span
      className={`bg-background text-foreground border border-foreground font-mono text-xs uppercase p-1 text-center ${className || ""}`}
    >
      {statusText}
    </span>
  );
};
