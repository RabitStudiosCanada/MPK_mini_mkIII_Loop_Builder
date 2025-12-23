import { InstrumentSlot } from '../../types';

export function VirtualRack({ slots }: { slots: InstrumentSlot[] }) {
  return (
    <section className="panel">
      <h3>Virtual Rack (prewired for MPK mini mk3)</h3>
      <p>
        All built-in instruments are ready: drum rack on pads, mini keys synth on the piano keys, and knobs for
        mixer/macros. Expand later by adding more slots.
      </p>
      <div className="grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))' }}>
        {slots.map((slot) => (
          <div key={slot.id} className="rack-slot">
            <div className="flex-row" style={{ justifyContent: 'space-between' }}>
              <strong>{slot.name}</strong>
              <span className="badge">{slot.type}</span>
            </div>
            <p>{slot.description}</p>
            <div className="muted">Preloaded</div>
          </div>
        ))}
      </div>
    </section>
  );
}
