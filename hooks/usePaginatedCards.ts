import { useCallback, useEffect, useMemo, useState } from "react";

export const CARD_PAGE_SIZE = 15;

export function usePaginatedCards<T>(
  data: T[] = [],
  pageSize: number = CARD_PAGE_SIZE,
  resetKey: string = ""
) {
  const total = data.length;

  const [visibleCount, setVisibleCount] = useState(pageSize);

  useEffect(() => {
    setVisibleCount(pageSize);
  }, [pageSize, resetKey, total]);

  const visibleData = useMemo(() => {
    return data.slice(0, visibleCount);
  }, [data, visibleCount]);

  const hasMore = visibleCount < total;

  const loadMore = useCallback(() => {
    if (!hasMore) return;

    setVisibleCount((current) => {
      return Math.min(current + pageSize, total);
    });
  }, [hasMore, pageSize, total]);

  return {
    visibleData,
    loadMore,
    hasMore,
    visibleCount,
    total,
  };
}