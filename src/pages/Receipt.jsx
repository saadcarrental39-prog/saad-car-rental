import { Link, useSearchParams } from "react-router-dom";
import { SITE } from "../config";
import { allVehicles } from "../data/fleet";
import { decode, receiptRows } from "../booking";
import ReceiptActions from "../components/ReceiptActions";
export function ReceiptCard({ data, v }) {
  return (<article className="rcp" aria-label={`Booking receipt ${data.r}`}>
    <header className="rcp__h"><p>{SITE.name}</p><span>BOOKING RECEIPT</span><b>{data.r}</b></header>
    <div className="rcp__car"><img src={v.image} alt={`${v.color} ${v.name}`} /><h2>{v.name} {v.trim}</h2><p>{v.color} · With professional driver</p></div>
    <div className="rcp__perf" aria-hidden="true" />
    <dl className="rcp__rows">{receiptRows(data).map(([k, val]) => <div key={k}><dt>{k}</dt><dd>{val}</dd></div>)}</dl>
    <p className="rcp__status"><b>REQUEST RECEIVED</b>We will confirm your booking on WhatsApp</p>
    <footer className="rcp__f"><strong>{SITE.name}</strong>{SITE.address.map((l) => <span key={l}>{l}</span>)}<span>{SITE.phoneDisplay}</span><small>Issued {data.i ? new Date(data.i).toLocaleString() : ""}</small></footer></article>);
}
export default function Receipt() {
  const [q] = useSearchParams(), data = decode(q.get("d") || ""), v = data && allVehicles.find((x) => x.id === data.v);
  if (!data || !v) return <div className="pad narrow"><h1>Receipt not found</h1><p>This receipt link looks incomplete.</p><Link className="btn btn--dark" to="/">Back to Home</Link></div>;
  return (<div className="rcpw"><ReceiptCard data={data} v={v} />
    <div className="row noprint rcpw__a"><ReceiptActions data={data} v={v} /><button type="button" className="btn" onClick={() => window.print()}>Print / Save as PDF</button><Link className="btn" to="/">Back to site</Link></div></div>);
}
