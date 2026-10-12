import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { allVehicles } from "../data/fleet";
import { useSeo } from "../seo";
import ReceiptView from "../components/ReceiptView";
import { sendBooking } from "../sendBooking";
import { track } from "../analytics";
import { captureLead, completeLead } from "../leads";
import ServiceSwitch, { svcFrom } from "../components/ServiceSwitch";
import TripForm, { prepare, leadNote, withPhone } from "../components/TripForm";

export default function Book() {
  useSeo({ title: "Book a Car With Driver", description: "Book a premium car with professional driver in Islamabad, today or in advance. No account needed.", path: "/book" });
  const [q] = useSearchParams();
  const [vid, setVid] = useState(allVehicles.find((v) => v.id === q.get("car"))?.id || allVehicles[0].id);
  const [d, setD] = useState({ svc: svcFrom(q.get("svc")), service: "Car with driver", pickup: q.get("from") || "", drop: q.get("to") || "" });
  const [err, setErr] = useState(""); const [preview, setPreview] = useState(false); const [busy, setBusy] = useState(false); const [sent, setSent] = useState(null); const [fin, setFin] = useState(null);
  const v = allVehicles.find((x) => x.id === vid);
  const carLabel = `${v.name} ${v.trim || ""} ${v.color || ""}`.replace(/\s+/g, " ").trim();
  useEffect(() => { captureLead("book", withPhone(d), { car: carLabel, extra: leadNote(d, d.svc) }); }, [d, vid]); // eslint-disable-line react-hooks/exhaustive-deps  (saves what was typed, even if the visitor never sends)
  const submit = async (e) => {
    e.preventDefault();
    const r = prepare(d, d.svc);
    if (r.error) { track("form_error", { form: "book" }); return setErr(r.error); }
    setFin(r.dd); setErr(""); setBusy(true); track("quote_submit", { form: "book", svc: d.svc });
    completeLead("book", r.dd, { car: carLabel, extra: r.dd.extra });
    const res = await sendBooking(r.dd, v); setBusy(false); setSent(res); setPreview(true);
  };
  if (preview) return (<div className="pad narrow"><ReceiptView d={fin || d} v={v} initial={sent} onBack={() => { setSent(null); setFin(null); setPreview(false); }} /></div>);
  return (<div className="pad narrow"><h1>Book Now</h1><p className="lead">No account needed. Planning ahead? Pick any future date: visiting from abroad or coming home, you can book days or weeks in advance. Our team confirms your vehicle and quote on WhatsApp.</p>
    <ServiceSwitch value={d.svc || ""} onChange={(k) => { setD({ ...d, svc: k, driver: "", addl: [], service: "Car with driver" }); setErr(""); }} />
    {d.svc && <TripForm svc={d.svc} vid={vid} setVid={setVid} d={d} setD={setD} err={err} busy={busy} onSubmit={submit} />}
  </div>);
}
