export const Price = ({ price }: { price: number }) => {
  return (
    <span className="font-mono text-xs uppercase">CHF {price.toFixed(2)}</span>
  );
};
