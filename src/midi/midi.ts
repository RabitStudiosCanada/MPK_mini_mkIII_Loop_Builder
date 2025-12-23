import { MidiMessage } from '../types';

export type MidiConnection = {
  status: 'connected' | 'disconnected' | 'unsupported' | 'error';
  deviceName?: string;
  log: MidiMessage[];
};

type Handler = (msg: MidiMessage) => void;

export class MidiManager {
  private access?: MIDIAccess;
  private handler?: Handler;
  public state: MidiConnection = { status: 'disconnected', log: [] };

  async connect(onMessage: Handler) {
    this.handler = onMessage;
    if (!navigator.requestMIDIAccess) {
      this.state = { status: 'unsupported', log: [] };
      return this.state;
    }
    try {
      this.access = await navigator.requestMIDIAccess();
      this.state = { status: 'connected', deviceName: this.getFirstInput()?.name, log: [] };
      this.getFirstInput()?.addEventListener('midimessage', (ev) => this.handleMessage(ev));
    } catch (err) {
      console.error(err);
      this.state = { status: 'error', log: [] };
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
