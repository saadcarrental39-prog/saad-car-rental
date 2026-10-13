import { SITE } from "../config";
import { RvRating, RvCount } from "./reviews/Live";
import { useT } from "../i18n";
export default function Reviews() {
  const t = useT();
  return (<section className="rev" aria-labelledby="rv"><p className="eyebrow">{t("Google Reviews")}</p><h2 id="rv" className="h2">{t("Trusted by our customers")}</h2>
    <big><RvRating /></big><div className="stars" aria-label={t("5 out of 5 stars")}>★★★★★</div>
    <p className="lead"><RvCount /> {t("reviews on Google")}</p>
    <a className="btn btn--dark" href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer">{t("Read Reviews on Google")}</a></section>);
}
