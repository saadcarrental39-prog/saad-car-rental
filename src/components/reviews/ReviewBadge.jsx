import Stars from "./Stars";
import { design, openReviews } from "./data";
import { useReviewSummary } from "./store";
// Small rating line that sits INSIDE the car card. Click = full reviews open (like Google).
export default function ReviewBadge({ d = design(), size }) {
  const s = useReviewSummary();
  return (<button type="button" className={`rvb rvb--d${d}`} onClick={() => openReviews(d)} aria-label={`${s.rating} stars, ${s.count} reviews. Open reviews`}>
    {d === 4 && <b className="rvb__n">{s.rating}</b>}
    <Stars value={5} size={size || (d === 4 ? 16 : 17)} line={d === 3} />
    {d !== 4 && <b className="rvb__n">{s.rating}</b>}
    <span className="rvb__c">{d === 1 ? `(${s.count} reviews)` : `${s.count} reviews`}</span></button>);
}
