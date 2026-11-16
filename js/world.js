// Det interaktive Nisseland-kort: gå rundt med touch/mus, besøg steder, find hemmeligheder, brug redskaber.
const World = (() => {
  const W = 2400, H = 1600;
  // The ground is seen at an angle: world y is squashed by K, while houses, trees and nisser stay upright
  const K = 0.52, HK = H * K, SKY = 260;
  const sy = y => +(y * K).toFixed(1);
  // things further back are drawn a little smaller
  const depth = y => +(0.72 + 0.48 * Math.max(0, Math.min(1, y / H))).toFixed(3);
  const at = (x, y, svg) => `<g transform="translate(${x} ${sy(y)}) scale(${depth(y)}) translate(${-x} ${-sy(y)})">${svg}</g>`;
  let svg, me, meInner, el, p, o, raf = 0, last = 0;
  let pos, target = null, pending = null, walking = false, face = 1, stepT = 0;
  const cam = { x: 0, y: 0, vw: 900, follow: true, lastPan: 0 };
  let drag = null, tool = null, overview = false;

  function seeded(seed) { let s = seed; return () => (s = (s * 9301 + 49297) % 233280) / 233280; }
  const regionAt = (x, y) => REGIONS.find(r => x >= r.box[0] && x < r.box[2] && y >= r.box[1] && y < r.box[3]);
  const LAKE = { x: 520, y: 610, rx: 185, ry: 100 };
  const inLake = (x, y) => ((x - LAKE.x) / LAKE.rx) ** 2 + ((y - LAKE.y) / LAKE.ry) ** 2 < 1;
  const has = id => p.inventory.includes(id);

  // ---------- Tegning af verden ----------
  function oak(x, y, s) {
    return `<g transform="translate(${x} ${y}) scale(${s})"><path d="M-14 0 Q-10 -40 -18 -70 L18 -70 Q10 -40 14 0Z" fill="#5a3a20"/><path d="M-4 -30 Q-16 -40 -30 -50 M6 -40 Q20 -50 30 -60" stroke="#5a3a20" stroke-width="7"/>
      <circle cx="-30" cy="-90" r="36" fill="#2c5a3a"/><circle cx="30" cy="-92" r="38" fill="#24503a"/><circle cx="0" cy="-122" r="42" fill="#2f6a44"/>
      <path d="M-62 -100 Q-40 -118 -18 -108 Q0 -170 34 -138 Q62 -128 66 -104" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/>
      <ellipse cx="0" cy="-36" rx="7" ry="10" fill="#1a0f06"/><circle cx="0" cy="-36" r="18" fill="url(#gGlow)" opacity=".5" class="pulse"/></g>`;
  }
  function den(x, y) {
    return `<g transform="translate(${x} ${y})"><path d="M-80 0 Q-70 -70 0 -76 Q70 -70 80 0Z" fill="#c9d4c2"/><path d="M-70 -30 Q-40 -80 20 -74 Q60 -66 74 -30" stroke="#fff" stroke-width="12" fill="none" stroke-linecap="round"/>
      <path d="M-28 0 Q-28 -40 0 -42 Q28 -40 28 0Z" fill="#2a1f14"/><circle cx="-8" cy="-22" r="2.4" fill="#ffd36b" class="blinky"/><circle cx="8" cy="-22" r="2.4" fill="#ffd36b" class="blinky"/></g>`;
  }
  function fest(x, y) {
    const l = [[-90, -60], [-50, -74], [-10, -80], [30, -76], [70, -64]];
    return `<g transform="translate(${x} ${y})"><path d="M-110 -50 Q-10 -96 90 -54" stroke="#3a2a18" stroke-width="2" fill="none"/>
      ${l.map(([lx, ly], i) => `<circle cx="${lx}" cy="${ly}" r="16" fill="url(#gGlow)"/><rect x="${lx - 5}" y="${ly - 6}" width="10" height="13" rx="3" fill="${['#ff5f5f', '#ffd36b', '#5ec8ff', '#7ee08a', '#ff9ad5'][i]}" class="blinky" style="animation-delay:${i * 0.3}s"/>`).join('')}
      <rect x="-60" y="-14" width="120" height="10" rx="3" fill="#8a5a2b"/><rect x="-54" y="-4" width="6" height="16" fill="#5a3a20"/><rect x="48" y="-4" width="6" height="16" fill="#5a3a20"/>
      ${[-40, -10, 20, 40].map((cx, i) => `<circle cx="${cx}" cy="-20" r="6" fill="${['#5ec8ff', '#b07cff', '#ffd36b', '#ff5f8f'][i]}"/>`).join('')}</g>`;
  }
  function iceGate(x, y) {
    return `<g transform="translate(${x} ${y})"><circle cx="0" cy="-60" r="90" fill="url(#gBlueGlow)" opacity=".5" class="pulse"/>
      <path d="M-70 0 L-70 -90 Q0 -150 70 -90 L70 0 L44 0 L44 -80 Q0 -116 -44 -80 L-44 0Z" fill="url(#gIce)" stroke="#fff" stroke-width="2"/>
      ${[-58, 58].map(tx => `<path d="M${tx - 14} -90 L${tx} -130 L${tx + 14} -90Z" fill="#e8f8ff"/>`).join('')}</g>`;
  }
  function bridge(x, y, fixed) {
    return `<g transform="translate(${x} ${y}) rotate(-12)"><rect x="-140" y="-30" width="280" height="60" rx="20" fill="#1b2840" opacity=".85"/>
      <path d="M-140 -30 Q0 -40 140 -30 M-140 30 Q0 40 140 30" stroke="#9fb8d6" stroke-width="6" fill="none"/>
      ${fixed ? Array.from({ length: 11 }, (_, i) => `<rect x="${-110 + i * 20}" y="-16" width="16" height="32" rx="3" fill="url(#gIce)" stroke="#fff"/>`).join('') :
      Array.from({ length: 11 }, (_, i) => i > 3 && i < 7 ? '' : `<rect x="${-110 + i * 20}" y="-16" width="16" height="32" rx="3" fill="url(#gIce)" stroke="#fff"/>`).join('')}
      <path d="M-120 -18 Q0 -4 120 -18 M-120 18 Q0 32 120 18" stroke="#c9dcef" stroke-width="3" fill="none"/></g>`;
  }
  function dragonCave(x, y, awake) {
    return `<g transform="translate(${x} ${y})">${Art.cave(0, 0, 1.3)}
      <g transform="translate(0 -14)"><ellipse cx="0" cy="0" rx="46" ry="20" fill="#6fb6dc"/><path d="M30 -6 Q60 -30 70 -10 Q60 0 40 4Z" fill="#6fb6dc"/>
      <path d="M-30 -14 L-20 -34 L-10 -16Z M-6 -18 L4 -38 L12 -18Z" fill="#e8f8ff"/>
      ${awake ? '<circle cx="58" cy="-14" r="3" fill="#fff"/><circle cx="58" cy="-14" r="1.6" fill="#2f6db0"/>' : '<path d="M54 -14 q4 3 8 0" stroke="#2a4a6a" stroke-width="2" fill="none"/><text x="70" y="-36" font-size="20" fill="#dff6ff" class="zz">z</text>'}</g></g>`;
  }
  function belfry(x, y) {
    return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="2" rx="60" ry="10" fill="#000" opacity=".12"/><rect x="-36" y="-150" width="72" height="150" fill="#d9cbb0"/><rect x="8" y="-150" width="28" height="150" fill="#000" opacity=".1"/>
      <path d="M-46 -150 L0 -230 L46 -150Z" fill="#2f4f8f"/><path d="M-48 -150 L0 -232 L48 -150 L38 -146 Q0 -190 -38 -146Z" fill="#fff"/><path d="M0 -232 V-252 M-8 -244 H8" stroke="#e8b84a" stroke-width="4"/>
      <path d="M-18 -110 V-130 Q0 -146 18 -130 V-110Z" fill="#1a1a2a"/><path d="M-8 -112 Q0 -126 8 -112Z" fill="#e8b84a" class="twinkle"/>
      <rect x="-12" y="-60" width="24" height="28" rx="12" fill="url(#gWin)" class="win"/><rect x="-14" y="-26" width="28" height="26" rx="10" fill="#5a2a10"/></g>`;
  }
  function sledHill(x, y) {
    return `<g transform="translate(${x} ${y})"><path d="M-110 0 Q-40 -120 40 -110 Q100 -100 110 0Z" fill="#fff" stroke="#cfe0f0" stroke-width="3"/>
      <path d="M-60 -40 Q0 -100 50 -100" stroke="#cfe0f0" stroke-width="6" fill="none" stroke-dasharray="10 8"/>
      <g class="sled"><path d="M-20 -8 h40 q6 0 8 -6" stroke="#8a5a2b" stroke-width="4" fill="none"/><rect x="-18" y="-22" width="34" height="10" rx="3" fill="#c8102e"/><circle cx="0" cy="-30" r="8" fill="#f3c9a8"/><path d="M-8 -32 L2 -50 L8 -32Z" fill="#1f5d3a"/></g></g>`;
  }
  function pond(x, y) {
    return `<g transform="translate(${x} ${y})"><ellipse cx="0" cy="-10" rx="110" ry="46" fill="url(#gLake)" stroke="#fff" stroke-width="5"/>
      <path d="M-60 -16 q30 -16 60 0 t60 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>
      <g class="skater"><circle cx="0" cy="-34" r="7" fill="#f3c9a8"/><path d="M-6 -36 L2 -52 L7 -36Z" fill="#c8102e"/><rect x="-5" y="-28" width="10" height="16" rx="3" fill="#2f6db0"/></g></g>`;
  }
  function stall(x, y) {
    return `<g transform="translate(${x} ${y})">${Art.house(0, 0, 1.15, '#a3202e', '#5a3a20', { sign: '🦌', w: 100, h: 56 })}
      <rect x="-14" y="-40" width="28" height="40" fill="#5a2a10"/><path d="M-14 -40 L14 0 M14 -40 L-14 0" stroke="#e8d0a0" stroke-width="3"/></g>`;
  }
  function stalls(x, y) {
    const st = (sx, c) => `<g transform="translate(${sx} 0)"><rect x="-26" y="-34" width="52" height="34" fill="#f4e0c8"/><path d="M-32 -34 L32 -34 L26 -54 L-26 -54Z" fill="${c}"/>
      <path d="M-26 -54 L-20 -34 M-14 -54 L-8 -34 M-2 -54 L4 -34 M10 -54 L16 -34 M22 -54 L28 -34" stroke="#fff" stroke-width="5"/>${[-14, 0, 14].map(cx => `<circle cx="${cx}" cy="-24" r="5" fill="${['#ff5f8f', '#5ec8ff', '#ffd36b'][(cx + 14) / 14]}"/>`).join('')}</g>`;
    return `<g transform="translate(${x} ${y})">${st(-70, '#e3263f')}${st(0, '#5ec8ff')}${st(70, '#7ee08a')}</g>`;
  }
  function mill(x, y) {
    return `<g transform="translate(${x} ${y})"><path d="M-34 0 L-24 -110 L24 -110 L34 0Z" fill="#f2c27a"/><path d="M-28 -110 L0 -140 L28 -110Z" fill="#b5652b"/>
      <rect x="-10" y="-30" width="20" height="30" rx="10" fill="#7a3f1a"/>
      <g class="gear" style="transform-origin:0px -110px">${[0, 90, 180, 270].map(a => `<rect x="-6" y="-196" width="12" height="80" rx="4" fill="#fff3e0" stroke="#e8b84a" stroke-width="2" transform="rotate(${a} 0 -110)"/>`).join('')}<circle cx="0" cy="-110" r="8" fill="#e8b84a"/></g>
      <path d="M30 -10 Q70 0 90 30" stroke="#e8a33a" stroke-width="10" fill="none" stroke-linecap="round"/></g>`;
  }
  function candyCastle(x, y) {
    const tw = (tx, h, c) => `<rect x="${tx - 18}" y="${-h}" width="36" height="${h}" fill="${c}"/><path d="M${tx - 24} ${-h} L${tx} ${-h - 46} L${tx + 24} ${-h}Z" fill="#fff"/><path d="M${tx - 24} ${-h} L${tx} ${-h - 46} L${tx + 24} ${-h}Z" fill="#ff5f8f" opacity=".6"/><circle cx="${tx}" cy="${-h - 50}" r="6" fill="#ffd36b"/>`;
    return `<g transform="translate(${x} ${y})"><circle cx="0" cy="-80" r="130" fill="url(#gPinkGlow)" opacity=".4" class="pulse"/>${tw(-70, 110, '#ffb3d1')}${tw(70, 110, '#b3e5ff')}
      <rect x="-60" y="-80" width="120" height="80" fill="#ffd9ea"/>${tw(0, 150, '#fff0b3')}<path d="M-18 0 V-34 Q0 -54 18 -34 V0Z" fill="#a0306a"/>
      ${[-46, 46].map(wx => `<circle cx="${wx}" cy="-50" r="8" fill="url(#gWin)" class="win"/>`).join('')}</g>`;
  }
  function academy(x, y) {
    return `<g transform="translate(${x} ${y})"><rect x="-80" y="-70" width="160" height="70" fill="#e6defa"/><path d="M-92 -70 L0 -120 L92 -70Z" fill="#5b3c88"/><path d="M-94 -70 L0 -122 L94 -70" stroke="#fff" stroke-width="7" fill="none"/>
      ${[-60, -30, 0, 30, 60].map(cx => `<rect x="${cx - 6}" y="-66" width="12" height="66" fill="#fff"/>`).join('')}<rect x="-14" y="-40" width="28" height="40" rx="12" fill="#3a2a5a"/>
      <text x="0" y="-84" font-size="24" text-anchor="middle">🎓</text></g>`;
  }
  function magicDoor(x, y) {
    return `<g transform="translate(${x} ${y})"><rect x="-50" y="-90" width="100" height="90" fill="url(#gIce)" stroke="#fff" stroke-width="2"/>
      <circle cx="0" cy="-44" r="48" fill="url(#gPinkGlow)" opacity=".6" class="pulse"/><path d="M-22 0 V-50 Q0 -76 22 -50 V0Z" fill="#4b2f7a" stroke="#ffd36b" stroke-width="3"/>
      <path d="M0 -60 l3 7 7 .5 -5.5 4.6 1.8 7 -6.3 -3.8 -6.3 3.8 1.8 -7 -5.5 -4.6 7 -.5z" fill="#ffd36b" class="twinkle"/></g>`;
  }
  function secretArt(s) {
    const k = s.kind;
    const a = {
      snowman: `<circle cx="0" cy="-14" r="16" fill="#fff" stroke="#cfe0f0"/><circle cx="0" cy="-40" r="12" fill="#fff" stroke="#cfe0f0"/><rect x="-11" y="-46" width="22" height="5" rx="2" fill="#1a1a1a"/><path d="M0 -38 l10 2 -10 2z" fill="#e07a1f"/>`,
      cat: `<ellipse cx="0" cy="-8" rx="14" ry="9" fill="#e07a1f"/><circle cx="12" cy="-16" r="7" fill="#e07a1f"/><path d="M8 -22 l2 -6 3 5 M14 -22 l3 -5 1 6" fill="#e07a1f" stroke="#e07a1f"/><path d="M-14 -8 q-10 -8 -6 -16" stroke="#e07a1f" stroke-width="4" fill="none"/>`,
      mouse: `<ellipse cx="0" cy="-6" rx="9" ry="6" fill="#9a9a9a"/><circle cx="8" cy="-10" r="4" fill="#bdbdbd"/><path d="M5 -14 L9 -24 L13 -14Z" fill="#c8102e"/><circle cx="-14" cy="-6" r="6" fill="#d9a35a"/>`,
      hut: `<g transform="scale(.7)">${Art.house(0, 0, 1, '#6b4a2b', '#2a1f14', { w: 60, h: 40 })}</g>`,
      owl: `<ellipse cx="0" cy="-14" rx="12" ry="15" fill="#8a6a4a"/><circle cx="-5" cy="-18" r="5" fill="#fff"/><circle cx="5" cy="-18" r="5" fill="#fff"/><circle cx="-5" cy="-18" r="2.4" fill="#222"/><circle cx="5" cy="-18" r="2.4" fill="#222"/><path d="M-2 -12 L0 -9 L2 -12Z" fill="#e8b84a"/>`,
      mushroom: Art.mushroom(0, 0, 1.4, '#ff7fbf'),
      rune: `<circle cx="0" cy="-16" r="26" fill="url(#gBlueGlow)"/><text x="0" y="-6" font-size="30" text-anchor="middle" fill="#7ff0ff" font-weight="900">${{ s_rune1: 'ᚾ', s_rune2: 'ᛁ', s_rune3: 'ᛋ' }[s.id]}</text>`,
      fox: `<ellipse cx="0" cy="-10" rx="14" ry="10" fill="#fff" stroke="#dfe8f0"/><circle cx="12" cy="-18" r="8" fill="#fff" stroke="#dfe8f0"/><path d="M8 -24 l2 -8 4 6 M14 -24 l4 -6 0 8" fill="#fff" stroke="#dfe8f0"/><circle cx="15" cy="-18" r="1.4" fill="#222"/>`,
      chest: `<circle cx="0" cy="-12" r="26" fill="url(#gGlow)" opacity=".6"/><rect x="-14" y="-18" width="28" height="18" rx="2" fill="#8a5a2b" stroke="#e8b84a" stroke-width="2"/><path d="M-14 -18 Q0 -30 14 -18" fill="#a0662e" stroke="#e8b84a" stroke-width="2"/>`,
      bear: `<circle cx="0" cy="-10" r="9" fill="#ff5f5f" opacity=".85"/><circle cx="0" cy="-24" r="7" fill="#ff5f5f" opacity=".85"/><circle cx="-5" cy="-30" r="3" fill="#ff5f5f"/><circle cx="5" cy="-30" r="3" fill="#ff5f5f"/>`,
      x: `<circle cx="0" cy="-6" r="26" fill="url(#gGlow)" opacity=".7"/><path d="M-12 -18 L12 6 M12 -18 L-12 6" stroke="#c8102e" stroke-width="6" stroke-linecap="round"/>`,
      robot: `<rect x="-10" y="-30" width="20" height="18" rx="3" fill="#c0c6cc"/><rect x="-12" y="-12" width="24" height="12" rx="2" fill="#9aa3ab"/><circle cx="-4" cy="-22" r="2.4" fill="#5ec8ff" class="blinky"/><circle cx="4" cy="-22" r="2.4" fill="#5ec8ff" class="blinky"/><path d="M0 -30 V-38" stroke="#9aa3ab" stroke-width="2"/><circle cx="0" cy="-39" r="2.4" fill="#e3263f"/>`,
      gift: `<rect x="-12" y="-22" width="24" height="22" fill="#2f6db0"/><rect x="-2" y="-22" width="4" height="22" fill="#ffd36b"/><path d="M0 -22 q-10 -10 -12 -2 q0 4 12 2 q10 -10 12 -2 q0 4 -12 2" fill="#ffd36b"/>`,
      star: `<circle cx="0" cy="-10" r="22" fill="url(#gGlow)"/><path d="M0 -24 l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1z" fill="#ffd36b"/>`,
      fort: `<path d="M-30 0 Q-30 -36 0 -38 Q30 -36 30 0Z" fill="#fff" stroke="#cfe0f0" stroke-width="2"/><path d="M-10 0 Q-10 -16 0 -17 Q10 -16 10 0Z" fill="#2a3a5a"/><circle cx="-3" cy="-8" r="2" fill="#ffd36b"/><circle cx="4" cy="-8" r="2" fill="#ffd36b"/>`,
      robin: `<ellipse cx="0" cy="-10" rx="10" ry="8" fill="#6b4a2b"/><circle cx="8" cy="-16" r="6" fill="#6b4a2b"/><ellipse cx="3" cy="-8" rx="6" ry="5" fill="#e3263f"/><circle cx="10" cy="-17" r="1.3" fill="#111"/><path d="M14 -16 l5 1 -5 1z" fill="#e8b84a"/>`,
      lostHat: `<path d="M-14 0 Q-12 -26 6 -30 Q20 -28 22 -14 Q16 -20 10 -18 Q12 -8 12 0Z" fill="#c8102e"/><rect x="-16" y="-4" width="30" height="7" rx="3" fill="#fff"/><circle cx="22" cy="-14" r="4" fill="#fff"/>`,
      door: magicDoor(0, 0)
    }[k] || '';
    return a;
  }

  function terrain() {
    const r = seeded(7);
    const nearSpot = (x, y, d = 110) => Object.values(SPOTS).some(s => Math.hypot(s.x - x, s.y - y) < d) || SECRETS.some(s => Math.hypot(s.x - x, s.y - y) < 60) || inLake(x, y + 20);
    const deco = [];
    const scatter = (n, box, fn) => { for (let i = 0; i < n; i++) { const x = box[0] + 30 + r() * (box[2] - box[0] - 60), y = box[1] + 60 + r() * (box[3] - box[1] - 80); if (!nearSpot(x, y)) deco.push([y, at(x, y, fn(x, sy(y), i))]); } };
    const [by, skov, is, slik, vaerk, nord] = REGIONS;
    // Grund
    let g = `<rect width="${W}" height="${H}" fill="#eef5fc"/>
      <ellipse cx="480" cy="1200" rx="520" ry="420" fill="#d5e9dc"/><ellipse cx="480" cy="450" rx="520" ry="460" fill="#d8ebfa"/>
      <ellipse cx="2000" cy="1210" rx="430" ry="380" fill="#fbe4ef"/><ellipse cx="2000" cy="460" rx="420" ry="440" fill="#f5eadc"/>
      <ellipse cx="1270" cy="330" rx="420" ry="330" fill="#e7e0f8"/><ellipse cx="1270" cy="1090" rx="380" ry="420" fill="#f7fbff"/>`;
    // Stier fra torvet
    const paths = { skov: 'M1270 1080 C1050 1150 800 1180 640 1250 S350 1200 300 1300', skov2: 'M640 1250 C560 1150 500 1100 470 1040 S300 990 190 980', skov3: 'M640 1250 Q660 1350 640 1420',
      is: 'M1270 1080 C1100 950 950 860 800 790 S420 700 200 600', is2: 'M800 790 C760 600 740 450 720 320 S400 220 260 200',
      slik: 'M1270 1080 C1500 1080 1650 1020 1800 1000 S2100 1000 2220 990', slik2: 'M1800 1000 C1900 1100 2000 1150 2010 1200 S2100 1350 2150 1400',
      vaerk: 'M1270 1080 C1450 950 1650 800 1800 720 S1950 560 2010 540', vaerk2: 'M2010 540 C2100 600 2200 680 2230 720 M2010 540 C2100 450 2180 380 2210 330 M2010 540 C1950 420 1860 300 1820 230',
      nord: 'M1270 1080 C1270 900 1270 700 1270 560 S1270 330 1290 250', nord2: 'M1270 560 C1180 450 1080 360 1020 300 M1270 560 C1380 480 1450 420 1500 380',
      by: 'M1270 1080 L1050 930 M1270 1080 L1500 1290 M1270 1080 L1040 1310 M1270 1080 L1480 880 M1270 1080 L1290 1420' };
    const regOf = k => k.replace(/\d$/, '');
    Object.entries(paths).forEach(([k, d]) => {
      const reg = REGIONS.find(x => x.id === regOf(k));
      const open = Store.maxOpen(p) >= reg.day;
      g += `<path d="${d}" stroke="${open ? '#d9c8a8' : '#c9d6e3'}" stroke-width="${open ? 34 : 22}" fill="none" stroke-linecap="round" opacity="${open ? 0.9 : 0.5}"/>`;
      if (open) g += `<path d="${d}" stroke="#fff" stroke-width="5" fill="none" stroke-dasharray="2 22" stroke-linecap="round" opacity=".8"/>`;
    });
    // Sø og kløft
    g += `<ellipse cx="${LAKE.x}" cy="${LAKE.y}" rx="${LAKE.rx}" ry="${LAKE.ry}" fill="url(#gLake)" stroke="#fff" stroke-width="6"/>
      <path d="M420 580 l40 20 30 -14 M560 640 l30 -24 40 10 M470 660 l20 -20" stroke="#fff" stroke-width="2" opacity=".8" fill="none"/>
      <ellipse cx="${LAKE.x}" cy="${LAKE.y + 6}" rx="46" ry="22" fill="#f7fbff" stroke="#cfe0f0" stroke-width="2"/>`;
    // Pynt
    scatter(70, skov.box, (x, y, i) => Art.pine(x, y, 0.7 + r() * 0.5, i % 3 ? '#1d4a33' : '#2a5c40'));
    scatter(14, skov.box, (x, y, i) => Art.mushroom(x, y, 0.8, ['#5ec8ff', '#b07cff', '#7ee08a'][i % 3]));
    deco.push([180, at(160, 180, Art.mountain(160, sy(180), 300, 200))], [160, at(480, 160, Art.mountain(480, sy(160), 360, 230))], [200, at(860, 200, Art.mountain(860, sy(200), 300, 190))], [470, at(640, 470, Art.mountain(640, sy(470), 260, 160))]);
    scatter(18, is.box, (x, y) => Art.crystal(x, y, 0.5 + r() * 0.4));
    scatter(10, is.box, (x, y) => Art.pine(x, y, 0.6, '#2a4a5a'));
    scatter(14, slik.box, (x, y, i) => i % 2 ? Art.lollipop(x, y, 0.8 + r() * 0.4, ['#ff5f8f', '#5ec8ff', '#ffd36b', '#7ee08a'][i % 4]) : Art.candyCane(x, y, 0.9));
    scatter(16, vaerk.box, (x, y, i) => i % 3 ? Art.pine(x, y, 0.7) : `<g transform="translate(${x} ${y})"><rect x="-14" y="-20" width="28" height="20" fill="${['#c8102e', '#2f6db0', '#1f5d3a'][i % 3]}"/><rect x="-3" y="-20" width="6" height="20" fill="#ffd36b"/></g>`);
    scatter(12, nord.box, (x, y) => Art.crystal(x, y, 0.5, false));
    scatter(22, by.box, (x, y) => Art.pine(x, y, 0.6 + r() * 0.3));
    [[960, 760, '#2e5a7a'], [1380, 760, '#5b3c88'], [1560, 1360, '#1f5d3a'], [980, 1440, '#8e3b2e'], [1360, 1160, '#a0522d']].forEach(([x, y, c]) => { deco.push([y, at(x, y, Art.house(x, sy(y), 0.7, c, '#2a1f2f', { wreath: true }))]); });
    // soft light from the front so the far end of the land looks further away
    g += `<rect width="${W}" height="${H}" fill="url(#gDepth)"/>`;
    return { ground: g, deco, sky: Art.aurora(500, -SKY + 20, 1400, 200) + Art.stars(90, W, SKY - 40, 3).replace(/cy="([\d.]+)"/g, (m, v) => `cy="${(+v - SKY + 10).toFixed(1)}"`) };
  }

  function spotsSvg() {
    const day = Store.maxOpen(p);
    const art = {
      torv: Art.bigTree(0, 0, 1), posthus: Art.house(0, 0, 1.05, '#c8102e', '#2a1f2f', { sign: '✉️', wreath: true }),
      stald: stall(0, 0), bibliotek: Art.house(0, 0, 1.1, '#5b3c88', '#2a1f2f', { sign: '📚', w: 96, h: 64 }),
      frida: Art.house(0, 0, 1, '#2e6f6a', '#5a3a20', { sign: '⚙️' }), bageri: Art.house(0, 0, 1, '#e8b84a', '#7a3f1a', { sign: '🥨', wreath: true }),
      sofushus: Art.house(0, 0, 0.95, '#a0522d', '#2a1f2f', { sign: '🍪', wreath: true }), skole: Art.house(0, 0, 1.1, '#2e5a7a', '#2a1f2f', { sign: '🔤', w: 100, h: 60 }),
      kirke: belfry(0, 0), kanebakke: sledHill(0, 0), skoejte: pond(0, 0), julemarked: stalls(0, 0),
      svampe: [0, 60, 120, 180, 240, 300].map(a => Art.mushroom(Math.cos(a * Math.PI / 180) * 60, Math.sin(a * Math.PI / 180) * 30, 1, ['#5ec8ff', '#b07cff', '#7ee08a'][a / 60 % 3])).join(''),
      raev: den(0, 0), eg: oak(0, 0, 1.2), fest: fest(0, 0),
      isport: iceGate(0, 0), grotte: Art.cave(0, 0, 1), bro: bridge(0, 0, p.seen[11]), drage: dragonCave(0, 0, p.seen[12]),
      marked: stalls(0, 0), peberkage: Art.gingerHouse(0, 0, 1), molle: mill(0, 0), slot: candyCastle(0, 0),
      maskin: `<g>${Art.house(0, 0, 1, '#6b6b7a', '#2a2a3a', { sign: '⚙️' })}</g>`, hal: Art.workshop(0, 0, 0.9),
      kontor: Art.house(0, 0, 1, '#8e1027', '#2a1f2f', { sign: '📋', wreath: true }), lager: Art.house(0, 0, 1.2, '#8a5a2b', '#3b2a1a', { sign: '🎁', w: 110, h: 60 }),
      taarn: Art.starTower(0, 0, 0.9), port: iceGate(0, 0), akademi: academy(0, 0), sal: Art.castle(0, 0, 0.95)
    };
    return Object.entries(SPOTS).map(([id, s]) => {
      const reg = REGIONS.find(r => r.id === s.region);
      if (day < reg.day) return null;
      return [s.y, `<g class="spot" data-spot="${id}" transform="translate(${s.x} ${sy(s.y)}) scale(${depth(s.y)})"><ellipse rx="70" ry="18" fill="#000" opacity=".14"/><circle r="80" cy="-40" fill="transparent"/>${art[id] || ''}
        <g class="label"><rect x="${-s.name.length * 5.4 - 12}" y="16" width="${s.name.length * 10.8 + 24}" height="28" rx="14" fill="#0b2219" opacity=".78"/><text y="36" text-anchor="middle">${s.name}</text></g></g>`];
    }).filter(Boolean);
  }
  function secretsSvg() {
    const day = Store.maxOpen(p);
    return SECRETS.map(s => {
      const reg = regionAt(s.x, s.y);
      if (reg && day < reg.day) return '';
      const found = p.secrets.includes(s.id);
      return `<g class="secret ${s.gate ? 'gate-' + s.gate : ''} ${found ? 'found' : ''}" data-secret="${s.id}" transform="translate(${s.x} ${sy(s.y)}) scale(${depth(s.y)})"><circle r="34" cy="-14" fill="transparent"/>${secretArt(s)}${found ? '<text y="-50" text-anchor="middle" font-size="18">✨</text>' : ''}</g>`;
    }).join('');
  }
  function fogSvg() {
    const day = Store.maxOpen(p);
    return REGIONS.filter(r => day < r.day).map(r => {
      const [x0, y0, x1, y1] = r.box, cx = (x0 + x1) / 2, cy = (y0 + y1) / 2;
      const date = r.day;
      return `<g class="fog"><rect x="${x0}" y="${sy(y0)}" width="${x1 - x0}" height="${sy(y1 - y0)}" fill="#dfe9f5" opacity=".5"/>
        ${[[-.3, -.2], [.25, -.25], [0, .1], [-.25, .3], [.3, .28]].map(([a, b]) => `<circle cx="${cx + a * (x1 - x0)}" cy="${sy(cy + b * (y1 - y0))}" r="${(x1 - x0) * 0.22}" fill="#fff" opacity=".7" filter="url(#fCloud)"/>`).join('')}
        <g transform="translate(${cx} ${sy(cy)})"><rect x="-190" y="-50" width="380" height="100" rx="24" fill="#0b2219" opacity=".75"/>
        <text y="-8" text-anchor="middle" class="foglbl">❄ ${r.name}</text><text y="28" text-anchor="middle" class="foglbl small">Åbner ${date}. december</text></g></g>`;
    }).join('');
  }

  // ---------- Nisser, der går rundt i byen ----------
  const VLOOKS = [
    { skin: '#fbe0cc', hair: '#f2d27a', style: 'pigtails', eyes: '#2f6db0', clothes: '#2f4f8f', hatColor: '#c8102e' },
    { skin: '#c98d63', hair: '#1f1712', style: 'curly', eyes: '#5a3a22', clothes: '#8e1027', hatColor: '#1f5d3a' },
    { skin: '#f3c9a8', hair: '#e8e8e8', style: 'short', eyes: '#6b6b6b', clothes: '#5b3c88', hatColor: '#e07a1f', beard: '#f5f5f5' },
    { skin: '#e7b48f', hair: '#b23a1e', style: 'ponytail', eyes: '#3c8a52', clothes: '#a0522d', hatColor: '#2f6db0' },
    { skin: '#a26a45', hair: '#4a2c18', style: 'bob', eyes: '#5a3a22', clothes: '#2e6f6a', hatColor: '#d94f8c' },
    { skin: '#fbe0cc', hair: '#8a4f24', style: 'buzz', eyes: '#2f6db0', clothes: '#1f5d3a', hatColor: '#6a3d9a', glasses: true }];
  const VLINES = ['Hej julehjælper! Har du set min anden vante?', 'Jeg skal hen og købe brændte mandler!', 'Glædelig snart-jul!',
    'Har du været inde hos Frida? Der eksploderer altid noget sjovt.', 'Psst … der gemmer sig hemmeligheder rundt omkring. Kig godt efter!',
    'Jeg øver mig på at synge ”Sikken voldsom trængsel og alarm”.', 'Sofus har spist mine pebernødder igen!', 'Prøv at kælke på Kanebakken – det kilder i maven!'];
  let villagers = [];
  function freePoint(r) {
    const [x0, y0, x1, y1] = r.box;
    for (let i = 0; i < 20; i++) { const x = x0 + 80 + Math.random() * (x1 - x0 - 160), y = y0 + 120 + Math.random() * (y1 - y0 - 160); if (!inLake(x, y)) return { x, y }; }
    return { x: (x0 + x1) / 2, y: (y0 + y1) / 2 };
  }
  function spawnVillagers() {
    const open = REGIONS.filter(r => Store.maxOpen(p) >= r.day);
    villagers = Array.from({ length: 4 + open.length * 2 }, (_, i) => {
      const r = open[i % open.length], s = freePoint(r);
      return { i, r, x: s.x, y: s.y, t: freePoint(r), wait: Math.random() * 3, face: 1, walking: false, look: VLOOKS[i % VLOOKS.length] };
    });
    svg.querySelector('#villagers').innerHTML = villagers.map(v => `<g class="villager" data-npc="${v.i}" transform="translate(${v.x} ${sy(v.y)}) scale(${depth(v.y)})"><ellipse rx="20" ry="6" fill="#000" opacity=".18"/><circle r="40" cy="-50" fill="transparent"/><g class="vflip"><g transform="translate(-33 -96) scale(.55)">${Avatar.g(v.look, { hat: { style: 'nisse', color: v.look.hatColor } })}</g></g></g>`).join('');
    villagers.forEach(v => { v.el = svg.querySelector(`[data-npc="${v.i}"]`); v.flip = v.el.querySelector('.vflip'); v.av = v.el.querySelector('.av'); });
  }
  function stepVillagers(dt) {
    villagers.forEach(v => {
      if (v.wait > 0) { v.wait -= dt; if (v.walking) { v.walking = false; v.av.classList.remove('walk'); } return; }
      const dx = v.t.x - v.x, dy = v.t.y - v.y, d = Math.hypot(dx, dy), sp = 70 * dt;
      if (!v.walking) { v.walking = true; v.av.classList.add('walk'); }
      if (d < sp) { v.wait = 1.5 + Math.random() * 4; v.t = freePoint(v.r); return; }
      v.x += dx / d * sp; v.y += dy / d * sp;
      const f = dx < 0 ? -1 : 1; if (f !== v.face) { v.face = f; v.flip.setAttribute('transform', `scale(${f} 1)`); }
      v.el.setAttribute('transform', `translate(${v.x.toFixed(1)} ${sy(v.y)}) scale(${depth(v.y)})`);
    });
  }

  // ---------- Montering ----------
  function mount(container, profile, options) {
    destroy();
    el = container; p = profile; o = options || {};
    pos = Object.assign({}, p.pos || { x: 1270, y: 1160 });
    if (regionAt(pos.x, pos.y) && Store.maxOpen(p) < regionAt(pos.x, pos.y).day) pos = { x: 1270, y: 1160 };
    const T = terrain(), objs = [...T.deco, ...spotsSvg()].sort((a, b) => a[0] - b[0]).map(x => x[1]).join('');
    el.innerHTML = `<svg class="world" id="worldsvg" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid meet">
      <mask id="lampMask"><rect x="0" y="${-SKY}" width="${W}" height="${HK + SKY}" fill="white"/><circle id="lampHole" r="280" fill="url(#lampGrad)"/></mask>
      <radialGradient id="lampGrad"><stop offset=".45" stop-color="black"/><stop offset="1" stop-color="white"/></radialGradient>
      <linearGradient id="gDepth" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#1b2b4a" stop-opacity=".28"/><stop offset=".35" stop-color="#1b2b4a" stop-opacity="0"/><stop offset="1" stop-color="#fff" stop-opacity=".12"/></linearGradient>
      <linearGradient id="gSkyW" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#07102a"/><stop offset=".7" stop-color="#1d3566"/><stop offset="1" stop-color="#5a78a8"/></linearGradient>
      <rect x="0" y="${-SKY}" width="${W}" height="${SKY + 2}" fill="url(#gSkyW)"/>${T.sky}
      <g id="terrain"><g transform="scale(1 ${K})">${T.ground}</g>
        <path d="M0 ${HK} H${W} V${HK + 70} Q${W * 0.75} ${HK + 50} ${W / 2} ${HK + 70} T0 ${HK + 70}Z" fill="#b9cde2"/><path d="M0 ${HK} H${W} V${HK + 14} Q${W / 2} ${HK + 26} 0 ${HK + 14}Z" fill="#fff"/></g>
      <g id="spots">${objs}</g>
      <g id="secrets">${secretsSvg()}</g>
      <g id="beacon" pointer-events="none"></g>
      <g id="villagers"></g>
      <g id="me" pointer-events="none"><ellipse rx="26" ry="8" fill="#000" opacity=".2"/><g id="meInner"></g><g id="compassArrow" style="display:none"><circle r="26" cy="-150" fill="#0b2219" opacity=".7"/><path d="M0 -168 L8 -144 L0 -150 L-8 -144Z" fill="#ffd36b" id="needle"/></g></g>
      <rect id="dark" x="0" y="${-SKY}" width="${W}" height="${HK + SKY}" fill="#020814" opacity="0" mask="url(#lampMask)" pointer-events="none"/>
      <g id="fog">${fogSvg()}</g>
    </svg>`;
    svg = el.querySelector('#worldsvg'); me = svg.querySelector('#me'); meInner = svg.querySelector('#meInner');
    drawMe();
    spawnVillagers();
    cam.x = pos.x; cam.y = pos.y - 60; cam.follow = true;
    setBeacon(o.target);
    svg.addEventListener('pointerdown', down);
    svg.addEventListener('pointermove', move);
    svg.addEventListener('pointerup', up);
    svg.addEventListener('pointercancel', () => drag = null);
    svg.addEventListener('wheel', e => { e.preventDefault(); zoom(e.deltaY > 0 ? 1.12 : 0.89); }, { passive: false });
    last = performance.now();
    raf = requestAnimationFrame(loop);
    applyCam();
  }
  function destroy() { cancelAnimationFrame(raf); raf = 0; svg = null; tool = null; overview = false; }
  function drawMe() {
    meInner.innerHTML = `<g transform="translate(${-45 * face} -128) scale(${0.75 * face} .75)">${Avatar.g(p.look, p.equip, { walking, expr: o.expr || 'happy' })}</g>`;
  }
  function setBeacon(id) {
    const b = svg.querySelector('#beacon');
    if (!id || !SPOTS[id]) { b.innerHTML = ''; return; }
    const s = SPOTS[id];
    b.innerHTML = `<g transform="translate(${s.x} ${sy(s.y)})" class="beacon"><circle r="70" cy="-30" fill="url(#gGlow)" class="pulse"/><g class="bounce"><path d="M0 -150 l-18 -30 h36z" fill="#ffd36b" stroke="#7a1430" stroke-width="3"/></g></g>`;
  }

  // ---------- Kamera ----------
  // cam.x/cam.y are world coordinates; the viewBox is in drawn (tilted) coordinates
  function applyCam() {
    if (!svg) return;
    const cw = svg.clientWidth || 1, ch = svg.clientHeight || 1, top = -SKY * 0.7, full = HK + 70 - top;
    let vw = overview ? Math.max(W, full * cw / ch) : cam.vw;
    let vh = vw * ch / cw;
    if (overview && vh < full) { vh = full; vw = vh * cw / ch; }
    let cyS = cam.y * K;
    if (!overview) {
      cam.x = Math.max(vw / 2, Math.min(W - vw / 2, cam.x));
      cyS = Math.max(Math.min(top + vh / 2, (top + HK + 70) / 2), Math.min(Math.max(HK + 70 - vh / 2, (top + HK + 70) / 2), cyS));
      cam.y = cyS / K;
    }
    const cx = overview ? W / 2 : cam.x, cy = overview ? (top + HK + 70) / 2 : cyS;
    svg.setAttribute('viewBox', `${cx - vw / 2} ${cy - vh / 2} ${vw} ${vh}`);
  }
  function zoom(f) { overview = false; cam.vw = Math.max(500, Math.min(2000, cam.vw * f)); applyCam(); }
  function toggleOverview() { overview = !overview; if (!overview) { cam.x = pos.x; cam.y = pos.y; } applyCam(); return overview; }
  function toWorld(e) {
    const pt = svg.createSVGPoint(); pt.x = e.clientX; pt.y = e.clientY;
    const q = pt.matrixTransform(svg.getScreenCTM().inverse());
    return { x: q.x, y: q.y / K };
  }

  // ---------- Input ----------
  function down(e) { drag = { x: e.clientX, y: e.clientY, cx: cam.x, cy: cam.y, moved: false }; Sfx.unlock(); }
  function move(e) {
    if (!drag) return;
    const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
    if (!drag.moved && Math.hypot(dx, dy) < 10) return;
    drag.moved = true;
    if (overview) return;
    const k = svg.viewBox.baseVal.width / svg.clientWidth;
    cam.x = drag.cx - dx * k; cam.y = drag.cy - dy * k / K; cam.follow = false; cam.lastPan = performance.now();
    applyCam();
  }
  function up(e) {
    if (!drag) return;
    const wasDrag = drag.moved; drag = null;
    if (wasDrag) return;
    const pt = toWorld(e);
    if (overview) { overview = false; cam.x = pt.x; cam.y = pt.y; applyCam(); o.onOverview && o.onOverview(false); }
    const spotEl = e.target.closest && e.target.closest('[data-spot]');
    const secEl = e.target.closest && e.target.closest('[data-secret]');
    const npcEl = e.target.closest && e.target.closest('[data-npc]');
    if (npcEl) { const v = villagers[+npcEl.dataset.npc]; v.wait = 4; Sfx.chime(); return o.onMsg(VLINES[Math.floor(Math.random() * VLINES.length)], v.look); }
    if (secEl) return goSecret(secEl.dataset.secret);
    if (spotEl) { const s = SPOTS[spotEl.dataset.spot]; return walkTo(s.x, s.y + 40, { spot: spotEl.dataset.spot }); }
    walkTo(pt.x, pt.y, null);
  }
  function goSecret(id) {
    const s = SECRETS.find(x => x.id === id);
    if (s.gate === 'boots' && !has('isstovler')) return o.onMsg('Isen er alt for glat! Du skal bruge isstøvler for at gå ud på søen.', 'frida');
    walkTo(s.x, s.y + 24, { secret: id });
  }
  function walkTo(x, y, pend) {
    x = Math.max(30, Math.min(W - 30, x)); y = Math.max(60, Math.min(H - 20, y));
    const reg = regionAt(x, y);
    if (reg && Store.maxOpen(p) < reg.day) return o.onMsg(`${reg.name} er stadig dækket af trylletåge. Den letter d. ${reg.day}. december!`, 'sofus');
    if (inLake(x, y) && !has('isstovler')) return o.onMsg('Isen er alt for glat! Med isstøvler kunne du gå derud.', 'frida');
    target = { x, y }; pending = pend; cam.follow = true;
    Sfx.tap();
  }

  // ---------- Løkke ----------
  function loop(t) {
    if (!svg) return;
    const dt = Math.min(0.05, (t - last) / 1000); last = t;
    if (target) {
      const dx = target.x - pos.x, dy = target.y - pos.y, d = Math.hypot(dx, dy);
      const sp = 330 * dt;
      if (Math.abs(dx) > 4) { const nf = dx < 0 ? -1 : 1; if (nf !== face) { face = nf; drawMe(); } }
      if (!walking) { walking = true; drawMe(); }
      if (d <= sp) { pos.x = target.x; pos.y = target.y; arrive(); }
      else { pos.x += dx / d * sp; pos.y += dy / d * sp; }
      stepT += dt; if (stepT > 0.28) { stepT = 0; Sfx.step(); }
    }
    me.setAttribute('transform', `translate(${pos.x.toFixed(1)} ${sy(pos.y)}) scale(${depth(pos.y)})`);
    if (!overview && (cam.follow || performance.now() - cam.lastPan > 4000) && target) {
      cam.x += (pos.x - cam.x) * Math.min(1, dt * 4); cam.y += (pos.y - 60 - cam.y) * Math.min(1, dt * 4);
      applyCam();
    }
    updateTools();
    stepVillagers(dt);
    raf = requestAnimationFrame(loop);
  }
  function arrive() {
    target = null; walking = false; drawMe();
    p.pos = { x: Math.round(pos.x), y: Math.round(pos.y) };
    const pend = pending; pending = null;
    if (o.onMove) o.onMove();
    if (!pend) return;
    if (pend.spot) o.onSpot(pend.spot);
    if (pend.secret) {
      const s = SECRETS.find(x => x.id === pend.secret);
      if (s.gate === 'stav' && !has('stav')) return o.onMsg('Døren er lukket med en gammel magi. Måske kan en tryllestav åbne den?', 'drage');
      o.onSecret(s);
      const g = svg.querySelector(`[data-secret="${s.id}"]`);
      if (g && !g.classList.contains('found')) { g.classList.add('found'); g.insertAdjacentHTML('beforeend', '<text y="-50" text-anchor="middle" font-size="18">✨</text>'); }
    }
  }
  function updateTools() {
    const dark = svg.querySelector('#dark'), hole = svg.querySelector('#lampHole');
    const lamp = tool === 'lygte';
    dark.setAttribute('opacity', lamp ? '0.62' : '0');
    if (lamp) { hole.setAttribute('cx', pos.x); hole.setAttribute('cy', sy(pos.y) - 40); }
    svg.querySelectorAll('.gate-lygte').forEach(g => {
      const s = SECRETS.find(x => x.id === g.dataset.secret);
      g.classList.toggle('show', lamp && Math.hypot(s.x - pos.x, s.y - pos.y) < 300);
    });
    svg.querySelectorAll('.gate-kikkert').forEach(g => g.classList.toggle('show', tool === 'kikkert'));
    const arrow = svg.querySelector('#compassArrow');
    if (tool === 'kompas') {
      const day = Store.maxOpen(p);
      const cands = SECRETS.filter(s => !p.secrets.includes(s.id) && (!regionAt(s.x, s.y) || regionAt(s.x, s.y).day <= day));
      const goal = cands.find(s => s.gate === 'kompas') || cands.sort((a, b) => Math.hypot(a.x - pos.x, a.y - pos.y) - Math.hypot(b.x - pos.x, b.y - pos.y))[0];
      arrow.style.display = goal ? '' : 'none';
      if (goal) svg.querySelector('#needle').setAttribute('transform', `rotate(${Math.atan2((goal.y - pos.y) * K, goal.x - pos.x) * 180 / Math.PI + 90} 0 -150)`);
      svg.querySelectorAll('.gate-kompas').forEach(g => { const s = SECRETS.find(x => x.id === g.dataset.secret); g.classList.toggle('show', Math.hypot(s.x - pos.x, s.y - pos.y) < 200); });
    } else {
      arrow.style.display = 'none';
      svg.querySelectorAll('.gate-kompas').forEach(g => g.classList.toggle('show', p.secrets.includes(g.dataset.secret)));
    }
  }
  function setTool(t) { tool = tool === t ? null : t; if (tool === 'kikkert') zoom(1.25); return tool; }
  function refreshAvatar() { if (svg) drawMe(); }
  function centerOn(id) { const s = SPOTS[id]; if (!s || !svg) return; cam.x = s.x; cam.y = s.y; overview = false; applyCam(); }

  window.addEventListener('resize', () => applyCam());
  return { mount, destroy, setTool, zoom, toggleOverview, refreshAvatar, setBeacon: id => svg && setBeacon(id), centerOn, get tool() { return tool; } };
})();
