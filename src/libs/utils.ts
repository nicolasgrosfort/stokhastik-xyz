// Node and browsers ship different ICU/CLDR data, so `fr-CH`'s thousand
// separator character can differ between server and client (e.g. "'" vs a
// narrow no-break space), causing SSR hydration mismatches. Intl still
// computes the correct digit grouping/rounding, but we pin the separator
// characters ourselves via formatToParts so the rendered string is stable.
export const formatSwissNumber = (value: number): string => {
  const parts = new Intl.NumberFormat("fr-CH", {
    maximumFractionDigits: 3,
  }).formatToParts(value);

  return parts
    .map((part) => {
      if (part.type === "group") return "'";
      if (part.type === "decimal") return ",";
      return part.value;
    })
    .join("");
};

export const slugify = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

export const padArray = <T>(arr: T[], length: number, blankSlot: T): T[] => {
  const newArr = [...arr];
  while (newArr.length < length) {
    newArr.push(blankSlot);
  }
  return newArr;
};

export const makeSvgResponsive = (svgEl: SVGElement, size: number) => {
  svgEl.setAttribute("viewBox", `0 0 ${size} ${size}`);
  svgEl.style.width = "100%";
  svgEl.style.height = "auto";
  svgEl.style.display = "block";

  const attrs = ["x", "y", "width", "height"];
  svgEl.querySelectorAll("*").forEach((el) => {
    for (const attr of attrs) {
      const value = el.getAttribute(attr);
      if (value?.endsWith("mm")) {
        el.setAttribute(attr, value.replace("mm", ""));
      }
    }
  });
};
