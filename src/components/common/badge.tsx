export const Badge = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <span
      className={`bg-background text-foreground border border-foreground font-mono text-xs uppercase p-1 text-center ${className || ""}`}
    >
      {children}
    </span>
  );
};
