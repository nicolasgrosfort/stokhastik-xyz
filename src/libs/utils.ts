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
