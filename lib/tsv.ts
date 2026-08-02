export function parseTsv(input: string): { front: string; back: string }[] {
  return input
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [front, back] = line.split("\t");
      return { front: (front ?? "").trim(), back: (back ?? "").trim() };
    })
    .filter((card) => card.front && card.back);
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
