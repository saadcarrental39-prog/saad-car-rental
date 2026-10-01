// All cars live in the DOM at once; the carousel hook moves them along a wheel arc.
// Visibility of each car is managed imperatively by the hook (React never touches it after mount).
export default function VehicleVisual({ vehicles, index }) {
  const active = vehicles[index];
  return (
    <div className="lc__visual">
      <span className="lc__ghost" key={active.id} aria-hidden="true">{active.tag}</span>
      <div className="lc__stage">
        {vehicles.map((v, i) => (
          <div className="lc__car" data-car key={v.id}>
            <div className="lc__counter" data-counter>
              <div className="lc__float">
                <img src={v.image} alt={`${v.color} ${v.name} ${v.trim}`.trim()} width="805" height="510"
                     decoding="async" draggable="false" />
                {/* glossy light sweep, masked to the car's silhouette so it only touches the paint */}
                <i className="lc__shine" aria-hidden="true" style={{ "--img": `url(${v.image})` }} />
              </div>
              <i className="lc__shadow" aria-hidden="true" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
