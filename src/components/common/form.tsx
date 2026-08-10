export const Form = ({
  children,
  onSubmit,
}: {
  children: React.ReactNode;
  onSubmit: () => void;
}) => {
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit();
      }}
      className="contents"
    >
      {children}
    </form>
  );
};
