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
   - Use `http://localhost` (loopback) or `https://` — Web MIDI will be blocked on non-secure LAN IPs like `http://192.168.x.x`.
   - After the page loads, click **Request MIDI Access** in the Controller Mapper to trigger the permission prompt.

### Build for production

```bash
npm run build
```

### Project layout

- `src/audio` — transport clock, audio engine, and instruments.
- `src/midi` — Web MIDI connection helper and event parsing.
- `src/ui` — React views for the controller mapper, loop builder, and arrangement plus shared components (transport, virtual rack).
- `src/storage` — IndexedDB helper wrappers (idb-keyval).

### Notes

- Audio won’t start until you click **Enable Audio** due to browser autoplay policies.
- If no MIDI device is connected or permission is denied, the mapper view will show the connection status/message so you can retry.
- Web MIDI requires either `https://` or `http://localhost`. If you see a secure-context error, switch the URL to loopback or serve via HTTPS.
- MIDI access does **not** need special USB permissions, but the browser permission prompt must be accepted from a user gesture. If you see a `NotAllowedError/SecurityError`, open the site on `https://` or `http://localhost`, click **Request MIDI Access**, and ensure Chrome site permissions allow "MIDI devices".
- Loops are MIDI-based; changing BPM keeps them in time. Sample time-stretching is intentionally out of scope for the MVP.
- The MPK mini keybed (25 keys) and 8 pads are both mapped for recording. Use the controller mapper to set the first key's MIDI note if your keyboard octave shifts.
