"use client";

import Link from "next/link";
import { useWishlist } from "@/hooks/use-wishlist";

interface Props {
  onAfterNavigate?: () => void;
}

/**
 * Compact wishlist indicator for the navbar. Hidden when nothing is saved,
 * so it doesn't add noise to first-time visitors.
 */
export function NavWishlist({ onAfterNavigate }: Props) {
  const { count } = useWishlist();
  if (!count) return null;

  return (
    <Link
      href="/products?saved=1"
      className="nav-wishlist-btn"
      aria-label={`View wishlist (${count} saved)`}
      onClick={onAfterNavigate}
    >
      <svg
        viewBox="0 0 24 24"
        width="18"
        height="18"
        fill="currentColor"
        aria-hidden="true"
      >
        <path d="M12 21s-7.5-4.55-9.5-9.05C1.05 8.4 3.3 5 6.8 5c1.95 0 3.4 1.05 4.2 2.3.8-1.25 2.25-2.3 4.2-2.3 3.5 0 5.75 3.4 4.3 6.95C19.5 16.45 12 21 12 21z" />
      </svg>
      <span className="nav-wishlist-count" aria-hidden="true">
        {count}
      </span>
    </Link>
  );
}
