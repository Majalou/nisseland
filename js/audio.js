// Lyd: små syntetiserede klokker (ingen lydfiler) + dansk oplæsning via browserens talesyntese.
const Sfx = (() => {
  let ctx = null, on = true, musicOn = false, musicTimer = null, voice = null, master = null, bus = null;

  function ac() {
    if (!ctx) {
      try { ctx = new (window.AudioContext || window.webkitAudioContext)(); } catch (e) { return null; }
      master = ctx.createGain(); master.gain.value = on ? 1 : 0; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  }
  // Music goes through its own bus, so it can be faded out at once without cutting other sounds
  function musicBus() {
    if (!bus) { bus = ctx.createGain(); bus.connect(master); }
    return bus;
  }
  function tone(f, t0, dur, type = 'sine', vol = 0.12, dest) {
    const c = ac(); if (!c || !on) return;
    const o = c.createOscillator(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    const s = c.currentTime + t0;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(vol, s + 0.012);
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o.connect(g).connect(dest || master);
    o.start(s); o.stop(s + dur + 0.05);
  }
  function bell(f, t, d = 0.9, v = 0.1) {
    tone(f, t, d, 'sine', v); tone(f * 2.76, t, d * 0.45, 'sine', v * 0.28); tone(f * 5.4, t, d * 0.2, 'sine', v * 0.1);
  }
  // Filtered voice for the music: soft attack, warm sound
  function inst(f, t0, dur, vol, type, cutoff, attack = 0.02) {
    const c = ac(); if (!c || !on) return;
    const o = c.createOscillator(), fl = c.createBiquadFilter(), g = c.createGain();
    o.type = type; o.frequency.value = f;
    fl.type = 'lowpass'; fl.frequency.value = cutoff;
    const s = c.currentTime + t0;
    g.gain.setValueAtTime(0.0001, s);
    g.gain.linearRampToValueAtTime(vol, s + attack);
    g.gain.setValueAtTime(vol, s + Math.max(attack, dur * 0.6));
    g.gain.exponentialRampToValueAtTime(0.0001, s + dur);
    o.connect(fl).connect(g).connect(musicBus());
    o.start(s); o.stop(s + dur + 0.05);
  }

  // Kendte julesange, der er fri af ophavsret (folkemelodier og sange fra 1800-tallet).
  // Melodi: "tone:slag", | er kun taktstreg. Akkorder: én pr. takt.
  const SONGS = [
    { name: 'Jingle Bells', bpm: 118, bar: 4, bells: true,
      mel: `D4:1 B4:1 A4:1 G4:1 | D4:3 D4:.5 D4:.5 | D4:1 B4:1 A4:1 G4:1 | E4:4 | E4:1 C5:1 B4:1 A4:1 | F#4:4 | D5:1 D5:1 C5:1 A4:1 | B4:4 |
        D4:1 B4:1 A4:1 G4:1 | D4:3 D4:.5 D4:.5 | D4:1 B4:1 A4:1 G4:1 | E4:4 | E4:1 C5:1 B4:1 A4:1 | D5:1 D5:1 D5:1 D5:1 | E5:1 D5:1 C5:1 A4:1 | G4:4 |
        B4:1 B4:1 B4:2 | B4:1 B4:1 B4:2 | B4:1 D5:1 G4:1.5 A4:.5 | B4:4 | C5:1 C5:1 C5:1.5 C5:.5 | C5:1 B4:1 B4:1 B4:.5 B4:.5 | B4:1 A4:1 A4:1 B4:1 | A4:2 D5:2 |
        B4:1 B4:1 B4:2 | B4:1 B4:1 B4:2 | B4:1 D5:1 G4:1.5 A4:.5 | B4:4 | C5:1 C5:1 C5:1.5 C5:.5 | C5:1 B4:1 B4:1 B4:.5 B4:.5 | D5:1 D5:1 C5:1 A4:1 | G4:4`,
      chords: 'G G G C C D D G G G G C C D D G G G G G C G A D G G G G C G D G' },
    { name: 'Glade jul', bpm: 150, bar: 6,
      mel: `G4:1.5 A4:.5 G4:1 E4:3 | G4:1.5 A4:.5 G4:1 E4:3 | D5:2 D5:1 B4:3 | C5:2 C5:1 G4:3 | A4:2 A4:1 C5:1.5 B4:.5 A4:1 | G4:1.5 A4:.5 G4:1 E4:3 |
        A4:2 A4:1 C5:1.5 B4:.5 A4:1 | G4:1.5 A4:.5 G4:1 E4:3 | D5:2 D5:1 F5:1.5 D5:.5 B4:1 | C5:3 E5:3 | C5:1 G4:1 E4:1 G4:1.5 F4:.5 D4:1 | C4:6`,
      chords: 'C C G C F C F C G C G C' },
    { name: 'We Wish You a Merry Christmas', bpm: 132, bar: 3, pickup: 1, bells: true,
      mel: `D4:1 | G4:1 G4:.5 A4:.5 G4:.5 F#4:.5 | E4:1 E4:1 E4:1 | A4:1 A4:.5 B4:.5 A4:.5 G4:.5 | F#4:1 D4:1 D4:1 | B4:1 B4:.5 C5:.5 B4:.5 A4:.5 | G4:1 E4:1 D4:.5 D4:.5 | E4:1 A4:1 F#4:1 | G4:2 D4:1 |
        G4:1 G4:1 G4:1 | F#4:2 F#4:1 | G4:1 F#4:1 E4:1 | D4:2 A4:1 | B4:1 A4:1 G4:1 | D5:1 D4:1 D4:.5 D4:.5 | E4:1 A4:1 F#4:1 | G4:3`,
      chords: 'G C A D B Em C G G D Em D G B C G' },
    { name: 'Deck the Halls', bpm: 124, bar: 4,
      mel: `D5:1.5 C5:.5 B4:1 A4:1 | G4:1 A4:1 B4:1 G4:1 | A4:.5 B4:.5 C5:.5 A4:.5 B4:1.5 A4:.5 | G4:1 F#4:1 G4:2 |
        D5:1.5 C5:.5 B4:1 A4:1 | G4:1 A4:1 B4:1 G4:1 | A4:.5 B4:.5 C5:.5 A4:.5 B4:1.5 A4:.5 | G4:1 F#4:1 G4:2 |
        A4:1.5 B4:.5 C5:1 A4:1 | B4:1.5 C5:.5 D5:1 A4:1 | B4:.5 C5:.5 D5:1 E5:.5 F#5:.5 G5:1 | F#5:1 E5:1 D5:2 |
        D5:1.5 C5:.5 B4:1 A4:1 | G4:1 A4:1 B4:1 G4:1 | E5:.5 E5:.5 E5:.5 E5:.5 D5:1.5 C5:.5 | B4:1 A4:1 G4:2`,
      chords: 'G G D G G G D G D G G D G G C G' },
  ];
  const NOTE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
  const hz = (n, oct) => { const m = n.match(/^([A-G])(#|b)?(\d)?$/); const midi = 12 * ((oct ?? +m[3]) + 1) + NOTE[m[1]] + (m[2] === '#' ? 1 : m[2] === 'b' ? -1 : 0); return 440 * Math.pow(2, (midi - 69) / 12); };
  function prep(sg) {
    const evs = []; let b = 0;
    sg.mel.split(/\s+/).filter(x => x && x !== '|').forEach(x => { const [n, d] = x.split(':'); evs.push({ b, k: 'm', f: hz(n), d: +d }); b += +d; });
    const pick = sg.pickup || 0;
    sg.chords.split(' ').forEach((ch, i) => { const b0 = pick + i * sg.bar; if (b0 < b) evs.push({ b: b0, k: 'c', ch }); });
    if (sg.bells) for (let x = pick; x < b; x++) evs.push({ b: x, k: 'j' });
    evs.sort((p, q) => p.b - q.b);
    return { ...sg, evs, total: b };
  }
  const PREPPED = SONGS.map(prep);
  function playEv(e, off, sg) {
    const spb = 60 / sg.bpm;
    if (e.k === 'm') {
      // melody: a warm flute-like lead with a little music-box sparkle on top
      inst(e.f, off, Math.max(0.25, e.d * spb * 0.95), 0.07, 'triangle', 2400, 0.03);
      inst(e.f, off, Math.max(0.25, e.d * spb * 0.95), 0.025, 'sawtooth', 1300, 0.05);
      tone(e.f * 2, off, 0.35, 'sine', 0.015, musicBus());
    } else if (e.k === 'c') {
      const minor = e.ch.endsWith('m'), r = e.ch.replace('m', ''), barT = sg.bar * spb;
      inst(hz(r, 2), off, barT * 0.45, 0.09, 'triangle', 600, 0.01);
      inst(hz(r, 2) * 1.5, off + barT / 2, barT * 0.4, 0.07, 'triangle', 600, 0.01);
      [0, minor ? 3 : 4, 7].forEach(st => inst(hz(r, 3) * Math.pow(2, st / 12), off, barT * 0.98, 0.018, 'sawtooth', 900, barT * 0.25));
    } else if (e.k === 'j') { tone(2900 + Math.random() * 400, off, 0.08, 'square', 0.006, musicBus()); tone(3700, off + 0.03, 0.06, 'square', 0.004, musicBus()); }
  }
  let si = 0, ev = 0;
  function musicLoop() {
    let aTime = 0, aBeat = 0;
    musicTimer = setInterval(() => {
      const c = ac();
      if (!c || !musicOn || !on) return;
      if (document.hidden || ('speechSynthesis' in window && speechSynthesis.speaking)) { aTime = 0; return; }
      let sg = PREPPED[si];
      if (!aTime) { aBeat = ev < sg.evs.length ? sg.evs[ev].b : 0; aTime = c.currentTime + 0.15; }
      for (;;) {
        sg = PREPPED[si];
        if (ev >= sg.evs.length) {
          aTime += (sg.total - aBeat) * (60 / sg.bpm) + 1.6;
          si = (si + 1) % PREPPED.length; ev = 0; aBeat = 0;
          continue;
        }
        const e = sg.evs[ev], t = aTime + (e.b - aBeat) * (60 / sg.bpm);
        if (t > c.currentTime + 0.35) break;
        if (t >= c.currentTime - 0.05) playEv(e, t - c.currentTime, sg);
        ev++;
      }
    }, 100);
  }

  function pickVoice() {
    if (!('speechSynthesis' in window)) return;
    const vs = speechSynthesis.getVoices();
    voice = vs.find(v => /^da/i.test(v.lang) && /sara|naja|helle|female/i.test(v.name)) || vs.find(v => /^da/i.test(v.lang)) || null;
  }
  if ('speechSynthesis' in window) { pickVoice(); speechSynthesis.onvoiceschanged = pickVoice; }

  return {
    tap() { tone(900, 0, 0.07, 'triangle', 0.06); },
    chime() { [784, 988, 1175, 1568].forEach((f, i) => bell(f, i * 0.08)); },
    good() { [659, 784, 1047, 1319].forEach((f, i) => bell(f, i * 0.1, 1)); },
    soft() { bell(523, 0, 0.5, 0.06); bell(587, 0.14, 0.6, 0.06); },
    door() { tone(150, 0, 0.5, 'triangle', 0.08); [523, 659, 784, 1047, 1319].forEach((f, i) => bell(f, 0.25 + i * 0.07, 1.1)); },
    step() { tone(120 + Math.random() * 50, 0, 0.05, 'triangle', 0.025); },
    magic() { for (let i = 0; i < 10; i++) bell(1100 + Math.random() * 1400, i * 0.045, 0.6, 0.04); },
    gift() { [523, 659, 784, 1047, 784, 1047, 1319, 1568].forEach((f, i) => bell(f, i * 0.09, 1.1, 0.09)); },
    fanfare() { [[523, 0], [659, 0.15], [784, 0.3], [1047, 0.45], [784, 0.75], [1047, 0.9], [1319, 1.05], [1568, 1.3]].forEach(([f, t]) => { bell(f, t, 1.4, 0.1); tone(f / 2, t, 0.5, 'triangle', 0.04); }); },
    set on(v) {
      on = v;
      if (master) { master.gain.cancelScheduledValues(ctx.currentTime); master.gain.setValueAtTime(v ? 1 : 0, ctx.currentTime); }
      if (!v) this.stopSpeak();
    },
    get on() { return on; },
    music(v) {
      musicOn = v; ac();
      if (v && !musicTimer) musicLoop();
      if (!v && musicTimer) { clearInterval(musicTimer); musicTimer = null; }
      if (!v && bus) { const b = bus; bus = null; b.gain.setValueAtTime(b.gain.value, ctx.currentTime); b.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.3); setTimeout(() => b.disconnect(), 500); }
    },
    get musicOn() { return musicOn; },
    unlock() { ac(); },
    speak(text, rate = 0.92) {
      if (!on || !('speechSynthesis' in window) || !text) return;
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(String(text).replace(/[*_#]/g, '').replace(/\s+/g, ' '));
      u.lang = 'da-DK'; if (voice) u.voice = voice;
      u.rate = rate; u.pitch = 1.08;
      speechSynthesis.speak(u);
    },
    stopSpeak() { if ('speechSynthesis' in window) speechSynthesis.cancel(); },
    hasVoice() { return !!voice; }
  };
})();
