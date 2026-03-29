// Pure pagination computation — no React, no side effects
export const PAGE_SIZE = 10;

export const computePagination = (totalItems: number, page: number) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const safePage = Math.max(1, Math.min(page, totalPages));
  const start = (safePage - 1) * PAGE_SIZE;
  const end = safePage * PAGE_SIZE;
  return { totalPages, safePage, start, end };
};
