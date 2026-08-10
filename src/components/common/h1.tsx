export const H1 = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <h1
      className={`text-4xl font-bold text-center ${className || "text-gray-900 dark:text-gray-100"}`}
    >
      {children}
    </h1>
  );
};
