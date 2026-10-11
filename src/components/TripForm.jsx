import { allVehicles } from "../data/fleet";
import { clean } from "../booking";

// One booking form, two versions (Local / Out of Station). Used by the Book page, the car popup and the Home booking box.
// Every vehicle is hired WITH a professional driver (there is no self-drive), so "Car with driver" is the default service.
//
// DRIVER RULES (shown to the customer before sending):
//   Local          : the customer chooses
//                      (a) provide the driver's accommodation + meals, or
//                      (b) not provide them: the car goes back to our office after the schedule and is sent again at the next pickup time,
//                          and the customer pays the driver DRIVER_FOOD_PKR for food (the driver arranges his own accommodation).
//   Out of Station : providing the driver's accommodation + meals for the whole trip is COMPULSORY (checkbox must be ticked).
export const DRIVER_FOOD_PKR = 2500;   // change here if the amount changes (written as "2500 PKR" so the site's price filter ignores it)

export const COUNTRIES = ["Pakistan", "United Kingdom", "United States", "Canada", "United Arab Emirates", "Saudi Arabia", "Qatar", "Oman", "Kuwait", "Bahrain", "Australia", "New Zealand", "Germany", "France", "Italy", "Spain", "Netherlands", "Belgium", "Switzerland", "Norway", "Sweden", "Denmark", "Ireland", "Turkey", "Azerbaijan", "China", "Japan", "South Korea", "Malaysia", "Singapore", "Thailand", "India", "Bangladesh", "Sri Lanka", "Afghanistan", "Iran", "Egypt", "South Africa", "Other"];
export const DESTS = ["Skardu", "Hunza", "Gilgit", "Naran Kaghan", "Swat", "Kalam", "Kumrat Valley", "Fairy Meadows", "Murree", "Nathia Gali", "Chitral", "Neelum Valley", "Lahore", "Peshawar"];
const PAX = ["1–2", "3–4", "5–7", "8 or more"];
const SERVICES = { local: ["Car with driver", "Airport transfer", "Full tour package"], out: ["Car with driver", "Complete tour package", "Airport transfer"] };
const ADDL = { local: ["Hotel & accommodation", "Lunch, dinner & meal arrangements", "City tour / sightseeing"], out: ["Hotel & accommodation", "Lunch, dinner & meal arrangements", "Tour guide (optional)"] };
export const DRIVER_TEXT = {
  provide: "Customer provides the driver's accommodation and meals.",
  own: `Customer does not provide accommodation or meals: the car returns to our office after the schedule and is sent again at the agreed pickup time. Customer pays the driver ${DRIVER_FOOD_PKR} PKR for food, and the driver arranges his own accommodation.`,
  agree: "Customer provides the driver's accommodation and meals for the whole trip (compulsory for Out of Station).",
};
const toDay = () => { const n = new Date(); return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`; };

// Checks the form. Returns { error } or { dd }: dd is the finished booking object used for the message, the receipt, the order and the lead.
export function prepare(d, svc) {
  const out = svc === "out"; const today = toDay();
  if (!svc) return { error: "Please choose Out of Station or Local first." };
  if (!clean(d.name)) return { error: "Please enter your full name." };
  if (!/^[\d+\s()-]{7,20}$/.test(d.whatsapp || "")) return { error: "Please enter a valid WhatsApp number with country code." };
  if (d.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(d.email)) return { error: "Please check the email address, or leave it empty." };
  if (!d.country) return { error: "Please select the country you are travelling from." };
  if (out && !clean(d.drop)) return { error: "Please choose or enter your tour destination." };
  if (!clean(d.pickup)) return { error: "Please enter the pickup location." };
  if (!d.date) return { error: "Please choose the pickup date." };
  if (d.date < today) return { error: "Pickup date cannot be in the past." };
  if (!d.rdate) return { error: "Please choose the return date." };
  if (d.rdate < d.date) return { error: "Return date cannot be before the pickup date." };
  if (!d.pax) return { error: "Please choose the number of passengers." };
  if (!d.service) return { error: "Please choose the service required." };
  if (!d.consent) return { error: "Please tick the box to agree to the Privacy Policy." };
  if (out && !d.driver) return { error: "For Out of Station trips you must provide the driver's accommodation and meals. Please tick the box to continue." };
  if (!out && !d.driver) return { error: "Please choose how the driver's accommodation and meals will be arranged." };
  const driver = out ? "agree" : d.driver;
  const addl = (d.addl || []).join(", ");
  const dd = { ...d, phone: d.whatsapp, drop: out ? clean(d.drop) : clean(d.pickup), service: d.service, addlText: addl, driverText: DRIVER_TEXT[driver], driver };
  dd.extra = [`Service: ${d.service}`, `From: ${d.country}`, addl && `Extra: ${addl}`, `Driver: ${driver === "provide" ? "customer provides stay + meals" : driver === "own" ? `no stay/meals, car returns to office, ${DRIVER_FOOD_PKR} PKR food` : "customer provides stay + meals (compulsory)"}`, `Return: ${d.rdate}`, clean(d.notes)].filter(Boolean).join(" | ").slice(0, 600);
  return { dd };
}

// What is saved for the owner while the visitor is still typing (Clients tab), even if the form is never sent.
export const leadNote = (d, svc) => [d.service && `Service: ${d.service}`, d.country && `From: ${d.country}`, svc === "out" && d.drop && `To: ${d.drop}`, d.pax && `Pax: ${d.pax}`, d.driver && `Driver: ${d.driver}`, clean(d.notes)].filter(Boolean).join(" | ").slice(0, 300);

const Opts = ({ legend, name, options, value, onChange }) => (
  <fieldset className="tf-fs"><legend>{legend} *</legend>
    <div className="tf-opts">{options.map((o) => (<label key={o} className={`tf-o${value === o ? " is-on" : ""}`}><input type="radio" name={name} checked={value === o} onChange={() => onChange(o)} /><span>{o}</span></label>))}</div>
  </fieldset>
);

export default function TripForm({ svc, vid, setVid, d, setD, err, busy, onSubmit }) {
  const out = svc === "out"; const today = toDay();
  const set = (k) => (e) => setD({ ...d, [k]: e.target.value });
  const pick = (k) => (v) => setD({ ...d, [k]: v });
  const toggleAddl = (o) => { const cur = d.addl || []; setD({ ...d, addl: cur.includes(o) ? cur.filter((x) => x !== o) : [...cur, o] }); };
  const inList = DESTS.includes(d.drop); const sel = d.drop ? (inList ? d.drop : "Other") : d.destMode === "other" ? "Other" : "";
  const chooseDest = (v) => (v === "Other" ? setD({ ...d, drop: "", destMode: "other" }) : setD({ ...d, drop: v, destMode: "" }));
  return (
    <form className="tf" onSubmit={onSubmit} noValidate>
      <h3 className="tf-h"><span>1</span>Your Details</h3>
      <label className="tf-l"><span>Full Name *</span><input type="text" name="name" autoComplete="name" placeholder="Enter your full name" maxLength={120} value={d.name || ""} onChange={set("name")} /></label>
      <label className="tf-l"><span>WhatsApp Number *</span><input type="tel" name="whatsapp" autoComplete="tel" inputMode="tel" placeholder="+92 3XX XXXXXXX" maxLength={25} value={d.whatsapp || ""} onChange={set("whatsapp")} /></label>
      <label className="tf-l"><span>Country *</span><select name="country" value={d.country || ""} onChange={set("country")}><option value="">Select your country</option>{COUNTRIES.map((c) => <option key={c} value={c}>{c}</option>)}</select></label>
      <label className="tf-l"><span>Email (optional)</span><input type="email" name="email" autoComplete="email" inputMode="email" placeholder="you@example.com" maxLength={120} value={d.email || ""} onChange={set("email")} /></label>

      <h3 className="tf-h"><span>2</span>{out ? "Tour Details" : "Ride Information"}</h3>
      {out && (<>
        <label className="tf-l"><span>Tour Destination *</span><select name="dest" value={sel} onChange={(e) => chooseDest(e.target.value)}><option value="">Select destination</option>{DESTS.map((c) => <option key={c} value={c}>{c}</option>)}<option value="Other">Other (type below)</option></select></label>
        {sel === "Other" && <label className="tf-l"><span>Your destination *</span><input type="text" name="destother" placeholder="Type the city or place" maxLength={80} value={d.drop || ""} onChange={set("drop")} /></label>}
      </>)}
      <label className="tf-l"><span>Preferred Vehicle *</span><select name="vehicle" value={vid} onChange={(e) => setVid(e.target.value)}>{allVehicles.map((x) => <option key={x.id} value={x.id}>{x.name} {x.trim} – {x.color}</option>)}</select></label>
      <label className="tf-l"><span>Pickup Location *</span><input type="text" name="pickup" autoComplete="off" placeholder={out ? "e.g. Islamabad Airport / Hotel / Other" : "e.g. F-7 Markaz, Islamabad"} maxLength={120} value={d.pickup || ""} onChange={set("pickup")} /></label>
      <div className="tf-2">
        <label className="tf-l"><span>Pickup Date *</span><input type="date" name="date" min={today} value={d.date || ""} onChange={set("date")} /></label>
        <label className="tf-l"><span>Return Date *</span><input type="date" name="rdate" min={d.date || today} value={d.rdate || ""} onChange={set("rdate")} /></label>
      </div>
      <Opts legend="Number of Passengers" name="pax" options={PAX} value={d.pax || ""} onChange={pick("pax")} />
      <Opts legend="Service Required" name="service" options={SERVICES[svc]} value={d.service || ""} onChange={pick("service")} />
      <p className="tf-note">Every vehicle is provided with a professional driver. We do not offer self-drive.</p>

      <h3 className="tf-h"><span>3</span>Driver Arrangement</h3>
      {out ? (
        <label className={`tf-agree${d.driver === "agree" ? " is-on" : ""}`}><input type="checkbox" checked={d.driver === "agree"} onChange={(e) => setD({ ...d, driver: e.target.checked ? "agree" : "" })} /><span><b>I will provide the driver's accommodation and meals for the whole trip. *</b><em>This is compulsory for every Out of Station trip.</em></span></label>
      ) : (
        <fieldset className="tf-fs"><legend>Driver's accommodation and meals *</legend>
          <div className="tf-opts tf-opts--col">
            <label className={`tf-o${d.driver === "provide" ? " is-on" : ""}`}><input type="radio" name="driver" checked={d.driver === "provide"} onChange={() => setD({ ...d, driver: "provide" })} /><span><b>I will provide the driver's accommodation and meals.</b><em>The driver stays with you for the whole booking.</em></span></label>
            <label className={`tf-o${d.driver === "own" ? " is-on" : ""}`}><input type="radio" name="driver" checked={d.driver === "own"} onChange={() => setD({ ...d, driver: "own" })} /><span><b>I will not provide accommodation and meals.</b><em>After your schedule the car returns to our office and we send it again at your next pickup time. You pay the driver {DRIVER_FOOD_PKR} PKR for food, and he arranges his own accommodation.</em></span></label>
          </div>
        </fieldset>
      )}

      <h3 className="tf-h"><span>4</span>Additional Services <small>(optional)</small></h3>
      <div className="tf-checks">{ADDL[svc].map((o) => (<label key={o} className="tf-c"><input type="checkbox" checked={(d.addl || []).includes(o)} onChange={() => toggleAddl(o)} /><span>{o}</span></label>))}</div>

      <h3 className="tf-h"><span>5</span>Extra Notes</h3>
      <label className="tf-l"><span>Any special requests or details?</span><textarea rows="3" maxLength={300} placeholder={out ? "Tell us about your itinerary, hotel preferences, luggage, or budget..." : "Tell us about your plan, timing, or any other requirements..."} value={d.notes || ""} onChange={set("notes")} /></label>

      <label className={`tf-agree tf-agree--s${d.consent ? " is-on" : ""}`}><input type="checkbox" name="consent" checked={!!d.consent} onChange={(e) => setD({ ...d, consent: e.target.checked })} /><span>I agree to the <a href="/privacy-policy" target="_blank" rel="noopener">Privacy Policy</a> *</span></label>
      {err && <p role="alert" className="tf-err">{err}</p>}
      <button className="tf-btn" type="submit" disabled={busy}>{busy ? "Sending…" : out ? "Submit Out of Station Booking Request" : "Submit Local Booking Request"}</button>
      <p className="tf-note tf-note--c">After you submit, WhatsApp opens with your booking message ready. Just tap Send.</p>
    </form>
  );
}
