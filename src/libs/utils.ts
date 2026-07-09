export function padArray<T>(arr: T[], length: number, blankSlot: T): T[] {
  const newArr = [...arr];
  while (newArr.length < length) {
    newArr.push(blankSlot);
  }
  return newArr;
}
