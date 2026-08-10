export const H3 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h3 className={`text-xl font-bold text-center ${className}`}>{children}</h3>
  );
};
