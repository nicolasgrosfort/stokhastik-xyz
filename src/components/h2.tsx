export const H2 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h2
      className={`text-2xl font-bold text-center ${className || "text-gray-900 dark:text-gray-100"}`}
    >
      {children}
    </h2>
  );
};
