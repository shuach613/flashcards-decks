export function matchesStudentSearch(
  email: string,
  trackNames: string[],
  categoryNames: string[],
  query: string | undefined
) {
  if (!query) return true;
  return [email, ...trackNames, ...categoryNames]
    .join(" ")
    .toLowerCase()
    .includes(query.trim().toLowerCase());
}

export function canStudentAccessDeck(
  categoryId: string | null,
  assignedCategoryIds: Iterable<string>
) {
  return categoryId !== null && new Set(assignedCategoryIds).has(categoryId);
}
