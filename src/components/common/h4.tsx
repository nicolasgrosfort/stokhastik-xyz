export const H4 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h4
      className={`text-foreground text-xs font-bold font-mono uppercase ${className || ""}`}
    >
      {children}
    </h4>
  );
};
