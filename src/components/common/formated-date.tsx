import { format } from "date-fns";

export const FormatedDate = ({ date }: { date: Date }) => {
  const formatedDate = format(date, "dd.MM.yy");
  return <span className="font-mono text-xs uppercase">{formatedDate}</span>;
};
