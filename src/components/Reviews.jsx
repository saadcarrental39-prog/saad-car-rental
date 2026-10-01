import ReviewBadge from "./reviews/ReviewBadge";
// Home + About: one big rating block. Click opens the same reviews window as the car cards.
export default function Reviews() {
  return (<section className="rev" aria-labelledby="rv"><h2 id="rv" className="h2">Trusted by our customers</h2><p className="lead">Click to read what customers say on Google.</p><div className="rev__b"><ReviewBadge size={26} /></div></section>);
}
