export const Price = ({ price }: { price: number }) => {
  return (
    <span className="font-mono text-xs uppercase">STKH {price.toFixed(0)}</span>
  );
};
