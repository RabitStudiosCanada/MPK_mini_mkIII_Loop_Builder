import { useEffect, useMemo, useState } from 'react';
import { AudioEngine } from '../../audio/engine';
import { MidiManager } from '../../midi/midi';
import { ControllerProfile, MidiMessage } from '../../types';
import { listProfiles, loadProfile, saveProfile } from '../../storage/db';

const defaultPadNotes = Array.from({ length: 8 }).reduce<Record<string, number>>((acc, _, idx) => {
  acc[`pad-${idx + 1}`] = 36 + idx;
  return acc;
}, {});

const defaultKeyRangeStart = 48; // C3

export function ControllerMapperView({ engine }: { engine: AudioEngine }) {
  const midi = useMemo(() => new MidiManager(), []);
  const [status, setStatus] = useState(midi.state);
  const [log, setLog] = useState<MidiMessage[]>([]);
  const [profileName, setProfileName] = useState('MPK mini mk3');
  const [knobPage, setKnobPage] = useState<'mixer' | 'macros'>('mixer');
  const [profiles, setProfiles] = useState<string[]>([]);
  const [padNotes, setPadNotes] = useState<Record<string, number>>(defaultPadNotes);
  const [keyRangeStart, setKeyRangeStart] = useState(defaultKeyRangeStart);

  useEffect(() => {
    midi.connect((msg) => {
      setStatus({ ...midi.state });
      setLog((prev) => [msg, ...prev].slice(0, 50));
    });
  }, [midi]);

  useEffect(() => {
    listProfiles().then(setProfiles);
  }, []);

  const save = async () => {
    const profile: ControllerProfile = {
      id: profileName.toLowerCase().replace(/\s+/g, '-'),
      name: profileName,
      deviceName: status.deviceName,
      padNotes,
      knobCCs: {},
      knobPage,
      keyRangeStart,
    };
    await saveProfile(profile);
    setProfiles(await listProfiles());
  };

  const load = async (id: string) => {
    const loaded = await loadProfile(id);
    if (loaded) {
      setProfileName(loaded.name);
      setPadNotes(loaded.padNotes);
      setKnobPage(loaded.knobPage);
      setKeyRangeStart(loaded.keyRangeStart ?? defaultKeyRangeStart);
    }
  };

  return (
    <div className="grid">
      <section className="panel">
        <h2>Controller Mapper</h2>
        <div className="flex-row" style={{ justifyContent: 'space-between' }}>
          <div>
            <p>Status: <span className="badge">{status.status}</span></p>
            <p>Device: {status.deviceName ?? 'Not connected'}</p>
            <button onClick={() => midi.connect(() => {})}>Retry Connect</button>
          </div>
          <div className="flex-col">
            <label>
              Profile name
              <input value={profileName} onChange={(e) => setProfileName(e.target.value)} />
            </label>
            <div className="flex-row">
              <button onClick={save}>Save Profile</button>
              <select onChange={(e) => load(e.target.value)}>
                <option value="">Load profile</option>
                {profiles.map((id) => (
                  <option key={id} value={id}>
                    {id}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </section>

      <section className="panel">
        <h3>Pad Mapping</h3>
        <div className="pad-grid">
          {Object.keys(padNotes).map((pad) => (
            <div key={pad} className="pad-card">
              <strong>{pad.toUpperCase()}</strong>
              <label>
                Note
                <input
                  type="number"
                  value={padNotes[pad]}
                  onChange={(e) => setPadNotes({ ...padNotes, [pad]: parseInt(e.target.value, 10) })}
                />
              </label>
              <button
                onClick={() =>
                  engine.triggerPad({ id: pad, gain: 0.8, note: padNotes[pad] }, undefined)
                }
              >
                Test pad
              </button>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h3>Piano Keys Mapping</h3>
        <p>The MPK mini has 25 keys. Set the starting note and preview the mapped range.</p>
        <div className="flex-row" style={{ gap: '0.75rem', flexWrap: 'wrap' }}>
          <label>
            First key MIDI note
            <input
              type="number"
              min={0}
              max={108}
              value={keyRangeStart}
              onChange={(e) => setKeyRangeStart(parseInt(e.target.value, 10))}
            />
          </label>
          <div className="keys-preview">
            {Array.from({ length: 25 }).map((_, idx) => {
              const note = keyRangeStart + idx;
              return (
                <button
                  key={note}
                  className="key-pill"
                  onClick={() => engine.triggerKey(note, 0.9)}
                  title={`MIDI ${note}`}
                >
                  {note}
                </button>
              );
            })}
          </div>
        </div>
        <p className="muted">Keys send to the default instrument rack so you can record loops from the piano keyboard.</p>
      </section>

      <section className="panel">
        <h3>Knob Pages</h3>
        <div className="flex-row">
          <label>
            Current page
            <select value={knobPage} onChange={(e) => setKnobPage(e.target.value as 'mixer' | 'macros')}>
              <option value="mixer">Mixer Volumes</option>
              <option value="macros">Instrument Macros</option>
            </select>
          </label>
        </div>
        <p>Turn a knob on your MPK to see CC values below. Page selection decides whether we map to mixer or macros.</p>
      </section>

      <section className="panel">
        <h3>Incoming MIDI</h3>
        <div className="midi-log">
          {log.map((m, idx) => (
            <div key={idx}>
              [{new Date(m.receivedAt).toLocaleTimeString()}] {m.type} {m.note ?? m.control} {m.velocity ?? m.value}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
