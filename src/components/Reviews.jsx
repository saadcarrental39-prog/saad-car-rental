import { SITE } from "../config";
import { RvRating, RvCount } from "./reviews/Live";
export default function Reviews() {
  return (<section className="rev" aria-labelledby="rv"><p className="eyebrow">Google Reviews</p><h2 id="rv" className="h2">Trusted by our customers</h2>
    <big><RvRating /></big><div className="stars" aria-label="5 out of 5 stars">★★★★★</div>
    <p className="lead"><RvCount /> reviews on Google</p>
    <a className="btn btn--dark" href={SITE.reviewsUrl} target="_blank" rel="noopener noreferrer">Read Reviews on Google</a></section>);
}
