// Two service cards the customer must choose before the booking form opens:
//   "out"   = Out of Station (any trip that leaves Islamabad: Skardu, Lahore, Kumrat, Murree, Hunza ...)
//   "local" = Local (daily use inside Islamabad / Rawalpindi: markets, shopping, hotels, picnic spots, meetings)
// The price is different for each, so the owner needs to know which one it is. Out of Station is first on purpose (most customers travel out).
export const SVC = {
  out: { label: "Out of Station", full: "Out of Station (outside Islamabad)", title: "Out of Station", text: "Outside Islamabad: Skardu, Lahore, Kumrat, Murree, Hunza and every other city or valley." },
  local: { label: "Local", full: "Local (inside Islamabad)", title: "Local · Islamabad", text: "Inside Islamabad: daily travel, markets and shopping, hotels, meetings and picnic spots." },
};
export const svcFull = (k) => (SVC[k] ? SVC[k].full : "");
export const svcFrom = (v) => (v === "out" || v === "local" ? v : "");

export default function ServiceSwitch({ value, onChange, dark = false, hint = true }) {
  return (
    <div className={`svs${dark ? " svs--dark" : ""}`}>
      <p className="svs__q" id="svs-q">Choose your service {!value && <span>(required)</span>}</p>
      <div className="svs__row" role="radiogroup" aria-labelledby="svs-q">
        {["out", "local"].map((k) => (
          <button key={k} type="button" role="radio" aria-checked={value === k} className={`svs__card${value === k ? " is-on" : ""}`} onClick={() => onChange(k)}>
            <span className="svs__dot" aria-hidden="true" />
            <span className="svs__t">{SVC[k].title}</span>
            <span className="svs__s">{SVC[k].text}</span>
          </button>
        ))}
      </div>
      {hint && !value && <p className="svs__hint">Select one to continue. Out of Station and Local trips are priced differently.</p>}
    </div>
  );
}
