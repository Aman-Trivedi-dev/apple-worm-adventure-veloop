
const playGameSound = (kind = "collect") => {
  try {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;

    if (!AudioCtx) return;

    const audio = new AudioCtx();
    const osc = audio.createOscillator();
    const gain = audio.createGain();

    const tones = {
      collect: [660, 990],
      win: [523, 784],
      lose: [220, 150],
    };

    const [from, to] = tones[kind] || tones.collect;

    osc.type = kind === "lose" ? "triangle" : "sine";

    osc.frequency.setValueAtTime(from, audio.currentTime);
    osc.frequency.exponentialRampToValueAtTime(
      to,
      audio.currentTime + 0.12
    );

    gain.gain.setValueAtTime(0.0001, audio.currentTime);
    gain.gain.exponentialRampToValueAtTime(
      0.12,
      audio.currentTime + 0.015
    );
    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audio.currentTime + 0.2
    );

    osc.connect(gain);
    gain.connect(audio.destination);

    osc.start();
    osc.stop(audio.currentTime + 0.21);

    osc.onended = () => audio.close();
  } catch {
    // Audio is optional; gameplay must still work.
  }
};

export default playGameSound;
