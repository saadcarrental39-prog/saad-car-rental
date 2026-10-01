import ReviewBadge from "../components/reviews/ReviewBadge";
import { openReviews } from "../components/reviews/data";
const N = ["Google Style (white side panel)", "Dark Glass (centered)", "Minimal Line Stars (bottom sheet)", "Gold Card (dark grid)"];
// Only available on your own computer (start-dev.bat) at /review-designs
export default function ReviewDesigns() {
  return (<div className="pad"><h1>Review designs</h1><p className="lead">Har design ka rating-line card ke andar aisa dikhega. Click karke poori window dekhein, phir mujhe number batayein.</p>
    <div className="rvd">{N.map((n, i) => (<div key={n} className={`rvd__box rvd__box--${i % 2 ? "dark" : "light"}`}><h3>Design {i + 1}: {n}</h3><ReviewBadge d={i + 1} /><button type="button" className="btn" onClick={() => openReviews(i + 1)}>Open full reviews</button></div>))}</div></div>);
}
