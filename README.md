# MPK mini mk3 Loop Builder

A minimal web-based "mini-DAW" prototype tailored for the Akai MPK mini mk3. It combines Web MIDI input, Web Audio playback, a drum rack loop builder, and a simple arrangement timeline. Built with React, TypeScript, and Vite so it can run locally without extra back-end services.

## Getting Started

1. Install dependencies

```bash
npm install
```

> If you are offline behind a proxy, make sure `npm config get registry` points to a reachable registry.

2. Run the dev server

```bash
npm run dev
```

3. Open the printed local URL in a Chromium-based browser (Chrome/Edge) because the Web MIDI API is required.

### Build for production

```bash
npm run build
```

### Project layout

- `src/audio` — transport clock, audio engine, and instruments.
- `src/midi` — Web MIDI connection helper and event parsing.
- `src/ui` — React views for the controller mapper, loop builder, and arrangement plus shared components.
- `src/storage` — IndexedDB helper wrappers (idb-keyval).

### Notes

- Audio won’t start until you click **Enable Audio** due to browser autoplay policies.
- If no MIDI device is connected or permission is denied, the mapper view will show the connection status so you can retry.
- Loops are MIDI-based; changing BPM keeps them in time. Sample time-stretching is intentionally out of scope for the MVP.
