import { Scramble } from "@/components/common/scramble";

export const Price = ({
  price,
  highlighted,
}: {
  price: number;
  highlighted?: boolean;
}) => {
  const text = `${price.toLocaleString("fr-CH")} STKH`;
  return (
    <span
      className={`font-mono text-xs uppercase ${
        highlighted ? "bg-yellow-300 border border-yellow-300 text-black" : ""
      } px-1 py-0.5 font-medium`}
    >
      <Scramble>{text}</Scramble>
    </span>
  );
};
