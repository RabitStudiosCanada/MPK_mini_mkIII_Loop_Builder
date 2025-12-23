import { MidiMessage } from '../types';

export type MidiConnection = {
  status: 'connected' | 'disconnected' | 'unsupported' | 'error' | 'permission-blocked';
  deviceName?: string;
  log: MidiMessage[];
  message?: string;
};

type Handler = (msg: MidiMessage) => void;

export class MidiManager {
  private access?: MIDIAccess;
  private handler?: Handler;
  public state: MidiConnection = { status: 'disconnected', log: [] };

  async connect(onMessage: Handler) {
    this.handler = onMessage;
    if (!window.isSecureContext) {
      this.state = {
        status: 'permission-blocked',
        log: [],
        message:
          'Web MIDI requires HTTPS or http://localhost. Open the dev server on loopback/https and then retry the permission prompt.'
      };
      return this.state;
    }
    if (!navigator.requestMIDIAccess) {
      this.state = { status: 'unsupported', log: [] };
      return this.state;
    }
    try {
      this.access = await navigator.requestMIDIAccess();
      this.state = {
        status: 'connected',
        deviceName: this.getFirstInput()?.name,
        log: [],
        message: this.getFirstInput() ? undefined : 'No MIDI inputs detected; check cable/power and reopen permissions.'
      };
      const input = this.getFirstInput();
      input?.addEventListener('midimessage', (ev) => this.handleMessage(ev));
      this.access.addEventListener('statechange', () => {
        const refreshed = this.getFirstInput();
        this.state = {
          ...this.state,
          status: refreshed ? 'connected' : 'error',
          deviceName: refreshed?.name,
          message: refreshed ? undefined : 'Device disconnected; reconnect USB then hit connect again.'
        };
      });
    } catch (err) {
      console.error(err);
      if (err instanceof DOMException && (err.name === 'NotAllowedError' || err.name === 'SecurityError')) {
        this.state = {
          status: 'permission-blocked',
          log: [],
          message:
            'Browser blocked MIDI. Click Request MIDI Access after a user gesture, ensure site permissions allow "MIDI devices", and avoid non-HTTPS origins.',
        };
      } else {
        this.state = {
          status: 'error',
          log: [],
          message: err instanceof DOMException ? err.message : 'Permission denied or device busy.'
        };
      }
    }
    return this.state;
  }

  private getFirstInput(): MIDIInput | undefined {
    if (!this.access) return undefined;
    const inputs = Array.from(this.access.inputs.values());
    return inputs[0];
  }

  private handleMessage(event: MIDIMessageEvent) {
    const [status, data1, data2] = event.data;
    const command = status >> 4;
    const channel = status & 0xf;
    let msg: MidiMessage | null = null;
    if (command === 9 && data2 > 0) {
      msg = { type: 'noteon', note: data1, velocity: data2, channel, receivedAt: performance.now() };
    } else if (command === 8 || (command === 9 && data2 === 0)) {
      msg = { type: 'noteoff', note: data1, velocity: data2, channel, receivedAt: performance.now() };
    } else if (command === 11) {
      msg = { type: 'cc', control: data1, value: data2, channel, receivedAt: performance.now() };
    }
    if (msg) {
      this.state.log = [msg, ...this.state.log].slice(0, 50);
      this.handler?.(msg);
    }
  }
}
