// Pure pagination computation — no React, no side effects
export const PAGE_SIZE = 10;

export type PaginationItem = number | "ellipsis";

/** When totalPages > 7, collapse middle with ellipses (e.g. 1 2 … 10 11). */
export const getPaginationItems = (
  currentPage: number,
  totalPages: number,
): PaginationItem[] => {
  if (totalPages <= 7) {
    return Array.from({ length: totalPages }, (_, i) => i + 1);
  }

  const items: PaginationItem[] = [];
  const showLeft = currentPage <= 4;
  const showRight = currentPage >= totalPages - 3;

  if (showLeft) {
    for (let p = 1; p <= 5; p++) items.push(p);
    items.push("ellipsis");
    items.push(totalPages);
    return items;
  }

  if (showRight) {
    items.push(1);
    items.push("ellipsis");
    for (let p = totalPages - 4; p <= totalPages; p++) items.push(p);
    return items;
  }

  items.push(1);
  items.push("ellipsis");
  items.push(currentPage - 1);
  items.push(currentPage);
  items.push(currentPage + 1);
  items.push("ellipsis");
  items.push(totalPages);
  return items;
};

export const computePagination = (totalItems: number, page: number) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * PAGE_SIZE;
  const end = safePage * PAGE_SIZE;
  return { totalPages, safePage, start, end };
};
