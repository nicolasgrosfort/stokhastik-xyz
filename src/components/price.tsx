export const Price = ({ price }: { price: number }) => {
  return <p className="font-mono text-xs uppercase">CHF {price.toFixed(2)}</p>;
};
