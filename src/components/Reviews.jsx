import { SITE } from "../config";
export default function Reviews() {
  return (<section className="rev" aria-labelledby="rv"><p className="eyebrow">Google Reviews</p><h2 id="rv" className="h2">Trusted by our customers</h2>
    <big>{SITE.rating}</big><div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
    <p className="lead">{SITE.reviewCount} reviews on Google</p>
    <a className="btn btn--dark" href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer">Read Reviews on Google</a></section>);
}
