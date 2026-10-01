import ReviewStrip from "./reviews/ReviewStrip";
// Big reviews section (Home + About): every Google review and every website review.
export default function Reviews() {
  return (<section className="rev" aria-labelledby="rv"><h2 id="rv" className="h2">What our customers say</h2><p className="lead">Real reviews from Google and from our website.</p><ReviewStrip /></section>);
}
