import { useReviewSummary } from "./store";
// Drop-in replacements for {SITE.rating} and {SITE.reviewCount}: show the live Google numbers.
export const RvRating = () => <>{useReviewSummary().rating}</>;
export const RvCount = () => <>{useReviewSummary().count}</>;
