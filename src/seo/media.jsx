// Page photo component. Pictures come from public/assets/pages (made by scripts/make-page-images.py) and are listed per page in data/pageImages.json.
// A picture whose file does not exist yet is simply not shown, so pages never break while photos are still being collected.
export { imagesOf, norm } from "./data/pageMeta";
export const Pic = ({ im, eager, sizes, className, caption = true }) => (
  <figure className={className || "px-fig"}>
    <img src={im.url} srcSet={im.srcSet} sizes={im.srcSet ? sizes || "(max-width: 900px) 92vw, 560px" : undefined} alt={im.alt} width={im.w} height={im.h} loading={eager ? "eager" : "lazy"} decoding="async" {...(eager ? { fetchpriority: "high" } : {})} />
    {caption && im.cap && <figcaption>{im.cap}</figcaption>}
  </figure>
);
