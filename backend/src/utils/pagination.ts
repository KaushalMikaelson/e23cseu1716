import { PaginationMeta } from '../types';

export interface PaginationParams {
  page: number;
  limit: number;
}

export function parsePagination(
  rawPage: unknown,
  rawLimit: unknown,
): PaginationParams {
  const page = Math.max(1, parseInt(String(rawPage ?? 1), 10) || 1);
  const limit = Math.min(100, Math.max(1, parseInt(String(rawLimit ?? 10), 10) || 10));
  return { page, limit };
}

export function paginateArray<T>(
  items: T[],
  page: number,
  limit: number,
): { items: T[]; meta: PaginationMeta } {
  const total = items.length;
  const totalPages = Math.ceil(total / limit);
  const start = (page - 1) * limit;
  const sliced = items.slice(start, start + limit);

  return {
    items: sliced,
    meta: { page, limit, total, totalPages },
  };
}
