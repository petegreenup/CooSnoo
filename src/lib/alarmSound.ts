// Alarm sound utility using Web Audio API — generates a repeating beep pattern
let audioCtx: AudioContext | null = null;
let oscillator: OscillatorNode | null = null;
let gainNode: GainNode | null = null;
let intervalId: ReturnType<typeof setInterval> | null = null;

export function startAlarmSound() {
  stopAlarmSound(); // ensure clean state

  audioCtx = new AudioContext();
  gainNode = audioCtx.createGain();
  gainNode.connect(audioCtx.destination);
  gainNode.gain.value = 0;

  oscillator = audioCtx.createOscillator();
  oscillator.type = "square";
  oscillator.frequency.value = 880;
  oscillator.connect(gainNode);
  oscillator.start();

  // Beep pattern: 200ms on, 200ms off
  let on = true;
  gainNode.gain.value = 0.5;

  intervalId = setInterval(() => {
    if (!gainNode) return;
    on = !on;
    gainNode.gain.value = on ? 0.5 : 0;
  }, 200);
}

export function stopAlarmSound() {
  if (intervalId) {
    clearInterval(intervalId);
    intervalId = null;
  }
  if (oscillator) {
    try { oscillator.stop(); } catch {}
    oscillator = null;
  }
  if (audioCtx) {
    try { audioCtx.close(); } catch {}
    audioCtx = null;
  }
  gainNode = null;
}
