// Fælles tegne-byggeklodser (SVG) til kort, scener, portrætter og ikoner.
const Art = (() => {
  const sh = (c, p) => Avatar.shade(c, p);

  // Fælles gradienter ligger én gang i dokumentet; alle SVG'er refererer til dem.
  function defs() { return ''; }
  function globalDefs() {
    return `<defs>
      <linearGradient id="gIce" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f4fdff"/><stop offset=".5" stop-color="#9fe3ff"/><stop offset="1" stop-color="#4f9fd1"/></linearGradient>
      <linearGradient id="gMount" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#9fb8d6"/><stop offset=".5" stop-color="#c9dcef"/><stop offset=".5" stop-color="#7f98ba"/><stop offset="1" stop-color="#6a84a8"/></linearGradient>
      <radialGradient id="gGlow"><stop offset="0" stop-color="#fff3c4" stop-opacity=".95"/><stop offset=".4" stop-color="#ffd36b" stop-opacity=".45"/><stop offset="1" stop-color="#ffb347" stop-opacity="0"/></radialGradient>
      <radialGradient id="gBlueGlow"><stop offset="0" stop-color="#e0fbff" stop-opacity=".9"/><stop offset="1" stop-color="#5ec8ff" stop-opacity="0"/></radialGradient>
      <radialGradient id="gPinkGlow"><stop offset="0" stop-color="#fff0f8" stop-opacity=".9"/><stop offset="1" stop-color="#ff7fbf" stop-opacity="0"/></radialGradient>
      <linearGradient id="gAur" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#5ef0c0" stop-opacity="0"/><stop offset=".3" stop-color="#5ef0c0" stop-opacity=".55"/><stop offset=".6" stop-color="#8a6cff" stop-opacity=".45"/><stop offset="1" stop-color="#ff7fd0" stop-opacity="0"/></linearGradient>
      <linearGradient id="gWin" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff6c8"/><stop offset="1" stop-color="#ffb347"/></linearGradient>
      <linearGradient id="gLake" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#e8fbff"/><stop offset=".6" stop-color="#a8dcf2"/><stop offset="1" stop-color="#6fb6dc"/></linearGradient>
      <filter id="fSoft" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="6"/></filter>
      <filter id="fCloud" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="18"/></filter>
      <radialGradient id="gNose"><stop offset="0" stop-color="#ff6b6b" stop-opacity=".9"/><stop offset="1" stop-color="#ff2a2a" stop-opacity="0"/></radialGradient>
      <linearGradient id="gGoldA" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff1a8"/><stop offset=".5" stop-color="#e8b84a"/><stop offset="1" stop-color="#9a6a1a"/></linearGradient>
      <linearGradient id="gSleigh" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ff4a5a"/><stop offset=".55" stop-color="#c8102e"/><stop offset="1" stop-color="#7a0a1a"/></linearGradient>
      <linearGradient id="gWood" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7a4a22"/><stop offset=".45" stop-color="#b07a44"/><stop offset="1" stop-color="#6a3c18"/></linearGradient>
      <linearGradient id="gBrass" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff3c4"/><stop offset=".4" stop-color="#d9a441"/><stop offset="1" stop-color="#8a5a14"/></linearGradient>
      <linearGradient id="gGlass" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#dff4ff" stop-opacity=".55"/><stop offset=".3" stop-color="#ffffff" stop-opacity=".25"/><stop offset="1" stop-color="#9fd0ea" stop-opacity=".4"/></linearGradient>
    </defs>`;
  }
  const T = (x, y, s, inner) => `<g transform="translate(${x} ${y}) scale(${s})">${inner}</g>`;

  function pine(x, y, s = 1, col = '#1d4a33') {
    const d = sh(col, -0.25);
    return T(x, y, s, `<rect x="-5" y="-4" width="10" height="14" fill="#4a2e1a"/>
      <path d="M0 -112 L-30 -66 L-18 -66 L-42 -32 L-26 -32 L-54 0 L54 0 L26 -32 L42 -32 L18 -66 L30 -66Z" fill="${col}"/>
      <path d="M0 -112 L30 -66 L18 -66 L42 -32 L26 -32 L54 0 L10 0 Z" fill="${d}" opacity=".55"/>
      <path d="M0 -112 L-13 -92 Q0 -86 13 -92Z" fill="#fff"/>
      <path d="M-30 -66 Q-16 -60 -4 -64 Q8 -59 30 -66 M-42 -32 Q-22 -26 -6 -30 Q12 -25 42 -32 M-54 0 Q-28 6 0 2 Q28 6 54 0" stroke="#fff" stroke-width="5" fill="none" stroke-linecap="round"/>`);
  }
  function bigTree(x, y, s = 1) {
    const lights = [[-8, -88, '#ff5f5f'], [12, -76, '#ffd36b'], [-20, -58, '#5ec8ff'], [18, -46, '#ff5f8f'], [-30, -24, '#ffd36b'], [6, -30, '#7ee08a'], [30, -14, '#5ec8ff'], [-12, -8, '#ff5f5f']];
    return pine(x, y, s * 1.3, '#17402c') + T(x, y, s * 1.3, lights.map(([lx, ly, c], i) => `<circle cx="${lx}" cy="${ly}" r="4" fill="${c}" class="blinky" style="animation-delay:${i * 0.23}s"/>`).join('') +
      `<circle cx="0" cy="-116" r="22" fill="url(#gGlow)"/><path d="M0 -128 l4 9 10 1 -8 6 3 10 -9 -5 -9 5 3 -10 -8 -6 10 -1z" fill="#ffd36b" stroke="#fff3c4" stroke-width="1.5"/>`);
  }
  function house(x, y, s = 1, wall = '#8e3b2e', roof = '#3b2a3a', o = {}) {
    const w = o.w || 80, h = o.h || 56;
    const win = (wx, wy) => `<g><rect x="${wx}" y="${wy}" width="14" height="16" rx="2" fill="url(#gWin)" class="win"/><path d="M${wx + 7} ${wy} v16 M${wx} ${wy + 8} h14" stroke="${sh(wall, -0.45)}" stroke-width="2"/><rect x="${wx - 2}" y="${wy + 15}" width="18" height="4" fill="#fff"/></g>`;
    return T(x, y, s, `
      <ellipse cx="0" cy="2" rx="${w * 0.7}" ry="10" fill="#000" opacity=".12"/>
      <rect x="${w / 2 - 22}" y="${-h - 46}" width="12" height="26" fill="${sh(wall, -0.3)}"/><rect x="${w / 2 - 24}" y="${-h - 50}" width="16" height="6" fill="#fff"/>
      <g class="smoke"><circle cx="${w / 2 - 16}" cy="${-h - 58}" r="6" fill="#fff" opacity=".6"/><circle cx="${w / 2 - 10}" cy="${-h - 72}" r="8" fill="#fff" opacity=".4"/><circle cx="${w / 2 - 4}" cy="${-h - 90}" r="10" fill="#fff" opacity=".25"/></g>
      <rect x="${-w / 2}" y="${-h}" width="${w}" height="${h}" fill="${wall}"/>
      <rect x="${w / 6}" y="${-h}" width="${w / 3}" height="${h}" fill="#000" opacity=".12"/>
      <path d="M${-w / 2 - 10} ${-h + 2} L0 ${-h - 44} L${w / 2 + 10} ${-h + 2} Z" fill="${roof}"/>
      <path d="M${-w / 2 - 12} ${-h + 2} L0 ${-h - 46} L${w / 2 + 12} ${-h + 2} L${w / 2 + 4} ${-h + 8} Q${w / 4} ${-h - 4} 0 ${-h - 30} Q${-w / 4} ${-h - 4} ${-w / 2 - 4} ${-h + 8} Z" fill="#fff"/>
      <rect x="-9" y="-28" width="18" height="28" rx="9" fill="${sh(wall, -0.5)}"/><circle cx="5" cy="-14" r="1.6" fill="#ffd36b"/>
      ${win(-w / 2 + 8, -h + 12)}${win(w / 2 - 22, -h + 12)}
      ${o.wreath ? `<circle cx="0" cy="-36" r="7" fill="none" stroke="#1f5d3a" stroke-width="4"/><circle cx="0" cy="-30" r="2" fill="#c8102e"/>` : ''}
      ${o.sign ? `<g transform="translate(${-w / 2 - 6} ${-h + 4})"><rect x="-22" y="0" width="26" height="20" rx="3" fill="#5a3a20" stroke="#e8b84a" stroke-width="1.5"/><text x="-9" y="15" font-size="14" text-anchor="middle">${o.sign}</text></g>` : ''}
      <path d="M${-w / 2} 0 Q0 6 ${w / 2} 0" stroke="#fff" stroke-width="6" fill="none"/>`);
  }
  function mountain(x, y, w, h, snow = true) {
    return `<path d="M${x - w / 2} ${y} L${x - w * 0.12} ${y - h} L${x + w * 0.02} ${y - h * 0.9} L${x + w * 0.12} ${y - h * 0.97} L${x + w / 2} ${y} Z" fill="url(#gMount)"/>
      ${snow ? `<path d="M${x - w * 0.12} ${y - h} L${x - w * 0.26} ${y - h * 0.62} Q${x - w * 0.16} ${y - h * 0.68} ${x - w * 0.08} ${y - h * 0.6} Q${x} ${y - h * 0.72} ${x + w * 0.06} ${y - h * 0.62} Q${x + w * 0.14} ${y - h * 0.7} ${x + w * 0.22} ${y - h * 0.6} L${x + w * 0.12} ${y - h * 0.97} L${x + w * 0.02} ${y - h * 0.9} Z" fill="#fff"/>` : ''}`;
  }
  function crystal(x, y, s = 1, glow = true) {
    return T(x, y, s, `${glow ? '<circle cx="0" cy="-30" r="44" fill="url(#gBlueGlow)" opacity=".7" class="pulse"/>' : ''}
      <path d="M-18 0 L-24 -40 L-14 -58 L-6 -40 L-8 0Z" fill="url(#gIce)" stroke="#fff" stroke-width="1.2"/>
      <path d="M-6 0 L-8 -60 L4 -84 L14 -60 L10 0Z" fill="url(#gIce)" stroke="#fff" stroke-width="1.2"/>
      <path d="M10 0 L14 -34 L24 -48 L30 -32 L22 0Z" fill="url(#gIce)" stroke="#fff" stroke-width="1.2"/>
      <path d="M4 -84 L2 -10" stroke="#fff" stroke-width="1.5" opacity=".7"/>`);
  }
  function lollipop(x, y, s = 1, c = '#ff5f8f') {
    return T(x, y, s, `<rect x="-2.5" y="-50" width="5" height="50" fill="#fff"/><circle cx="0" cy="-62" r="18" fill="${c}"/>
      <path d="M0 -62 m-12 0 a12 12 0 1 1 12 12 a8 8 0 1 1 -8 -8 a4 4 0 1 1 4 4" stroke="#fff" stroke-width="3" fill="none"/>`);
  }
  function candyCane(x, y, s = 1) {
    return T(x, y, s, `<path d="M0 0 V-50 Q0 -66 14 -66 Q28 -66 28 -52" stroke="#fff" stroke-width="9" fill="none" stroke-linecap="round"/>
      <path d="M0 0 V-50 Q0 -66 14 -66 Q28 -66 28 -52" stroke="#e3263f" stroke-width="9" fill="none" stroke-linecap="round" stroke-dasharray="7 7"/>`);
  }
  function gingerHouse(x, y, s = 1) {
    return T(x, y, s, `<ellipse cx="0" cy="2" rx="70" ry="12" fill="#000" opacity=".12"/>
      <rect x="-50" y="-60" width="100" height="60" fill="#b5652b"/><rect x="10" y="-60" width="40" height="60" fill="#000" opacity=".1"/>
      <path d="M-62 -56 L0 -112 L62 -56 Z" fill="#7a3f1a"/>
      <path d="M-64 -56 L0 -114 L64 -56" stroke="#fff" stroke-width="8" fill="none" stroke-linejoin="round"/>
      <path d="M-56 -60 q7 8 14 0 q7 8 14 0 q7 8 14 0 q7 8 14 0 q7 8 14 0 q7 8 14 0 q7 8 14 0 q7 8 14 0" stroke="#fff" stroke-width="3" fill="none"/>
      ${[-36, -12, 12, 36].map((cx, i) => `<circle cx="${cx * 0.7}" cy="${-80 + Math.abs(cx) * 0.5}" r="5" fill="${['#ff5f8f', '#5ec8ff', '#7ee08a', '#ffd36b'][i]}"/>`).join('')}
      <rect x="-12" y="-34" width="24" height="34" rx="12" fill="#5a2a10"/><path d="M-12 -20 h24" stroke="#fff" stroke-width="2" stroke-dasharray="3 3"/>
      <rect x="-42" y="-48" width="18" height="18" rx="9" fill="url(#gWin)" class="win"/><rect x="24" y="-48" width="18" height="18" rx="9" fill="url(#gWin)" class="win"/>
      <path d="M-50 0 q10 -7 20 0 q10 -7 20 0 q10 -7 20 0 q10 -7 20 0 q10 -7 20 0" stroke="#fff" stroke-width="4" fill="none"/>`) + candyCane(x - 60 * s, y, s * 0.8) + candyCane(x + 50 * s, y, s * 0.8);
  }
  function workshop(x, y, s = 1) {
    return T(x, y, s, `<ellipse cx="0" cy="4" rx="160" ry="18" fill="#000" opacity=".12"/>
      <rect x="-140" y="-90" width="280" height="90" fill="#8e1027"/><rect x="40" y="-90" width="100" height="90" fill="#000" opacity=".12"/>
      <path d="M-156 -86 L-100 -150 L100 -150 L156 -86Z" fill="#3b2a3a"/><path d="M-158 -86 L-100 -152 L100 -152 L158 -86 L148 -80 Q0 -100 -148 -80Z" fill="#fff"/>
      <rect x="60" y="-196" width="22" height="56" fill="#5a3a3a"/><rect x="56" y="-202" width="30" height="8" fill="#fff"/>
      <g class="smoke"><circle cx="71" cy="-214" r="9" fill="#fff" opacity=".6"/><circle cx="80" cy="-234" r="12" fill="#fff" opacity=".4"/><circle cx="90" cy="-258" r="15" fill="#fff" opacity=".25"/></g>
      ${[-110, -70, 50, 90].map(wx => `<rect x="${wx}" y="-70" width="24" height="28" rx="3" fill="url(#gWin)" class="win"/>`).join('')}
      <rect x="-26" y="-60" width="52" height="60" rx="6" fill="#5a2a10"/><path d="M0 -60 V0" stroke="#3a1a08" stroke-width="3"/>
      <g class="gear" style="transform-origin:0px -118px"><circle cx="0" cy="-118" r="22" fill="#e8b84a"/>${Array.from({ length: 8 }, (_, i) => `<rect x="-5" y="-146" width="10" height="10" fill="#e8b84a" transform="rotate(${i * 45} 0 -118)"/>`).join('')}<circle cx="0" cy="-118" r="8" fill="#8e1027"/></g>`);
  }
  function castle(x, y, s = 1) {
    const tower = (tx, th, tw) => `<rect x="${tx - tw / 2}" y="${-th}" width="${tw}" height="${th}" fill="url(#gIce)" stroke="#e8f8ff" stroke-width="1.5"/>
      <path d="M${tx - tw / 2 - 8} ${-th} L${tx} ${-th - tw * 1.5} L${tx + tw / 2 + 8} ${-th} Z" fill="#5b3c88"/><path d="M${tx} ${-th - tw * 1.5} L${tx + tw / 2 + 8} ${-th} L${tx} ${-th}Z" fill="#000" opacity=".2"/>
      <circle cx="${tx}" cy="${-th - tw * 1.5 - 6}" r="4" fill="#ffd36b"/><rect x="${tx - 5}" y="${-th + 20}" width="10" height="16" rx="5" fill="url(#gWin)" class="win"/>`;
    return T(x, y, s, `<circle cx="0" cy="-120" r="190" fill="url(#gBlueGlow)" opacity=".35" class="pulse"/>
      <ellipse cx="0" cy="4" rx="190" ry="20" fill="#000" opacity=".12"/>
      ${tower(-130, 150, 40)}${tower(130, 150, 40)}
      <rect x="-110" y="-110" width="220" height="110" fill="url(#gIce)" stroke="#e8f8ff" stroke-width="2"/>
      ${tower(-60, 200, 46)}${tower(60, 200, 46)}${tower(0, 260, 56)}
      <path d="M-34 0 V-60 Q0 -96 34 -60 V0Z" fill="#2a1f4a"/><path d="M-26 0 V-56 Q0 -86 26 -56 V0Z" fill="#5b3c88" opacity=".6" class="pulse"/>
      ${Array.from({ length: 11 }, (_, i) => `<rect x="${-110 + i * 20}" y="-122" width="12" height="12" fill="#e8f8ff"/>`).join('')}`);
  }
  function starTower(x, y, s = 1) {
    return T(x, y, s, `<ellipse cx="0" cy="4" rx="50" ry="10" fill="#000" opacity=".12"/>
      <path d="M-34 0 L-24 -200 L24 -200 L34 0Z" fill="#5a4a6a"/><path d="M6 -200 L24 -200 L34 0 L10 0Z" fill="#000" opacity=".18"/>
      ${[-40, -90, -140].map(wy => `<rect x="-7" y="${wy - 22}" width="14" height="20" rx="7" fill="url(#gWin)" class="win"/>`).join('')}
      <path d="M-40 -200 Q0 -260 40 -200Z" fill="#2f4f8f"/><rect x="8" y="-246" width="40" height="10" rx="4" fill="#e8b84a" transform="rotate(-28 8 -240)"/>
      ${[[-30, -270], [20, -290], [50, -250]].map(([sx, sy]) => `<path d="M${sx} ${sy - 6} l2 4 4 .6 -3 2.8 .8 4.2 -3.8 -2 -3.8 2 .8 -4.2 -3 -2.8 4 -.6z" fill="#ffd36b" class="twinkle"/>`).join('')}`);
  }
  function mushroom(x, y, s = 1, c = '#5ec8ff') {
    return T(x, y, s, `<circle cx="0" cy="-18" r="26" fill="${c}" opacity=".18" class="pulse"/><path d="M-5 0 Q-6 -12 -4 -16 L4 -16 Q6 -12 5 0Z" fill="#f4ecd8"/>
      <path d="M-20 -14 Q-20 -36 0 -36 Q20 -36 20 -14 Z" fill="${c}"/><circle cx="-8" cy="-26" r="3" fill="#fff" opacity=".8"/><circle cx="7" cy="-22" r="2.4" fill="#fff" opacity=".8"/>`);
  }
  function cave(x, y, s = 1) {
    return T(x, y, s, `<path d="M-90 0 Q-90 -110 0 -120 Q90 -110 90 0Z" fill="#7f98ba"/><path d="M-90 0 Q-90 -110 0 -120 Q20 -118 30 -114 Q-40 -90 -50 0Z" fill="#c9dcef" opacity=".5"/>
      <path d="M-50 0 Q-50 -70 0 -76 Q50 -70 50 0Z" fill="#1b2840"/><path d="M-80 -60 Q-40 -126 40 -118 Q80 -100 86 -60" stroke="#fff" stroke-width="10" fill="none" stroke-linecap="round"/>
      ${[-30, -10, 14, 32].map(ix => `<path d="M${ix} ${-70 + Math.abs(ix) * 0.3} l4 16 4 -16z" fill="#dff6ff"/>`).join('')}`);
  }
  function stars(n, w, h, seed = 1) {
    let s = seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280;
    return Array.from({ length: n }, (_, i) => `<circle cx="${r() * w}" cy="${r() * h}" r="${r() * 1.6 + 0.4}" fill="#fff" class="${i % 3 ? '' : 'twinkle'}" style="animation-delay:${(r() * 3).toFixed(2)}s"/>`).join('');
  }
  function aurora(x, y, w, h) {
    return `<g class="aurora" opacity=".9"><path d="M${x} ${y + h * 0.6} Q${x + w * 0.25} ${y} ${x + w * 0.5} ${y + h * 0.5} T${x + w} ${y + h * 0.3} L${x + w} ${y + h * 0.55} Q${x + w * 0.75} ${y + h * 0.8} ${x + w * 0.5} ${y + h} T${x} ${y + h}Z" fill="url(#gAur)" filter="url(#fSoft)"/>
      <path d="M${x} ${y + h * 0.3} Q${x + w * 0.3} ${y + h * 0.9} ${x + w * 0.55} ${y + h * 0.2} T${x + w} ${y + h * 0.5}" stroke="#5ef0c0" stroke-width="${h * 0.12}" opacity=".35" fill="none" filter="url(#fSoft)"/></g>`;
  }

  // Baggrundsscene til dialoger, kalender og finale.
  function scene(region = 'by') {
    const W = 1600, H = 900;
    const sky = { by: ['#0b1a3a', '#24406e', '#5a6fa3'], skov: ['#06180f', '#123a2a', '#2d5a49'], is: ['#0a1a3a', '#1e4a7a', '#7fb6e0'],
      slik: ['#2a0f2f', '#6a2a5a', '#d97aa8'], vaerk: ['#1a0d10', '#4a1a22', '#a0523a'], nord: ['#07061a', '#1c1446', '#3d2a7a'] }[region] || ['#0b1a3a', '#24406e', '#5a6fa3'];
    let mid = '', front = '';
    if (region === 'by') {
      mid = [[200, 760, 1.4, '#8e3b2e'], [430, 740, 1.1, '#2e5a7a'], [1180, 750, 1.3, '#5b3c88'], [1420, 770, 1.2, '#1f5d3a']].map(([x, y, s, c]) => house(x, y, s, c, '#2a1f2f', { wreath: true })).join('') + bigTree(800, 780, 1.8);
      front = pine(60, 900, 1.6) + pine(1540, 900, 1.8);
    } else if (region === 'skov') {
      mid = [120, 330, 560, 1050, 1280, 1500].map((x, i) => pine(x, 780 + (i % 2) * 30, 1.8 + (i % 3) * 0.3, i % 2 ? '#1d4a33' : '#174030')).join('') + [700, 820, 940].map((x, i) => mushroom(x, 800, 2, ['#5ec8ff', '#b07cff', '#7ee08a'][i])).join('');
      front = pine(0, 900, 2.6, '#0f2d20') + pine(1600, 900, 2.6, '#0f2d20');
    } else if (region === 'is') {
      mid = mountain(300, 780, 700, 520) + mountain(900, 800, 900, 640) + mountain(1400, 780, 600, 460) + crystal(560, 800, 2.2) + crystal(1150, 820, 1.8);
      front = crystal(120, 900, 2.6) + crystal(1500, 900, 2.4);
    } else if (region === 'slik') {
      mid = gingerHouse(500, 780, 2) + gingerHouse(1150, 790, 1.6) + lollipop(820, 800, 2.4, '#ff5f8f') + lollipop(1400, 790, 2, '#5ec8ff') + lollipop(160, 800, 2.2, '#ffd36b');
      front = candyCane(60, 900, 2.4) + candyCane(1480, 900, 2.4);
    } else if (region === 'vaerk') {
      mid = workshop(800, 790, 2.2) + starTower(1380, 800, 1.4) + pine(200, 800, 1.8);
      front = pine(30, 900, 2.4) + pine(1580, 900, 2.4);
    } else if (region === 'nord') {
      mid = castle(800, 800, 1.9) + crystal(300, 820, 2) + crystal(1300, 820, 2.2);
      front = crystal(60, 900, 2.6) + crystal(1550, 900, 2.6);
    }
    const ground = region === 'slik' ? '#fdeaf3' : region === 'skov' ? '#e3f0ea' : '#eef6ff';
    return `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">${defs()}
      <linearGradient id="sky_${region}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${sky[0]}"/><stop offset=".6" stop-color="${sky[1]}"/><stop offset="1" stop-color="${sky[2]}"/></linearGradient>
      <rect width="${W}" height="${H}" fill="url(#sky_${region})"/>
      ${stars(120, W, 500, region.length * 7)}
      ${['nord', 'is', 'by'].includes(region) ? aurora(0, 60, W, 260) : ''}
      <circle cx="1320" cy="140" r="54" fill="#fff8e0"/><circle cx="1300" cy="128" r="54" fill="${sky[0]}" opacity=".0"/><circle cx="1320" cy="140" r="110" fill="url(#gGlow)" opacity=".35"/>
      <path d="M0 700 Q400 620 800 690 T1600 670 V900 H0Z" fill="${sh(ground, -0.12)}"/>
      ${mid}
      <path d="M0 800 Q420 740 820 800 T1600 790 V900 H0Z" fill="${ground}"/>
      ${front}</svg>`;
  }

  // Indendørs rum til husene på kortet.
  function room(kind) {
    if (kind === 'outdoor') return scene('by');
    if (kind === 'forest') return scene('skov');
    if (kind === 'ice') return scene('is');
    const W = 1600, H = 900;
    const wall = { workshop: ['#3a4a52', '#26323a'], cozy: ['#8e3b2e', '#5a1a14'], post: ['#2f4f8f', '#182a52'], stable: ['#7a5230', '#4a2e18'],
      library: ['#3b2a5a', '#22163a'], bakery: ['#b5652b', '#7a3f1a'], school: ['#2e6f6a', '#17403c'], church: ['#4a3a5a', '#2a1f3a'], castle: ['#4b2f7a', '#1c1446'] }[kind] || ['#8e3b2e', '#5a1a14'];
    const floor = kind === 'castle' ? '#9fd8f0' : kind === 'stable' ? '#c9a46a' : '#7a4a2a';
    const win = (x, y) => `<g><rect x="${x}" y="${y}" width="220" height="260" rx="110" fill="#0b1a3a" stroke="#e8b84a" stroke-width="10"/>
      <circle cx="${x + 150}" cy="${y + 80}" r="26" fill="#fff8e0"/>${stars(18, 200, 160, x).replace(/cx="([\d.]+)"/g, (m, v) => `cx="${+v + x + 10}"`).replace(/cy="([\d.]+)"/g, (m, v) => `cy="${+v + y + 20}"`)}
      <path d="M${x} ${y + 200} Q${x + 110} ${y + 170} ${x + 220} ${y + 200} V${y + 260} H${x}Z" fill="#eef6ff"/>
      <path d="M${x + 110} ${y} V${y + 260} M${x} ${y + 130} H${x + 220}" stroke="#e8b84a" stroke-width="8"/></g>`;
    let deco = '', floorDeco = '';
    if (['cozy', 'bakery', 'castle', 'church'].includes(kind)) deco += `<g transform="translate(1180 520)"><rect x="-170" y="-40" width="340" height="300" fill="#6b4a3a"/><rect x="-190" y="-60" width="380" height="40" fill="#4a2e1a"/>
      <path d="M-110 260 V60 Q0 -10 110 60 V260Z" fill="#1a0f08"/><g class="flicker hearth"><path d="M-60 250 Q-40 150 0 120 Q40 160 60 250Z" fill="#ff8a2a"/><path d="M-30 250 Q-10 180 10 160 Q30 200 30 250Z" fill="#ffd36b"/></g>
      <circle cx="0" cy="200" r="160" fill="url(#gGlow)" opacity=".5"/>${[-140, -60, 20, 100].map((sx, i) => `<path d="M${sx} -60 v40 h30 v-40" fill="${['#c8102e', '#1f5d3a', '#2f6db0', '#e8b84a'][i]}"/>`).join('')}</g>`;
    if (kind === 'library') deco += [200, 560, 1040].map(x => `<g transform="translate(${x} 160)"><rect width="320" height="560" fill="#4a2e1a"/>${[0, 1, 2, 3].map(r => `<rect y="${r * 140 + 120}" width="320" height="16" fill="#2a1a0a"/>` + Array.from({ length: 11 }, (_, i) => `<rect x="${12 + i * 27}" y="${r * 140 + 30 + (i % 3) * 8}" width="22" height="${90 - (i % 3) * 8}" fill="${['#c8102e', '#1f5d3a', '#2f6db0', '#e8b84a', '#5b3c88'][(i + r) % 5]}"/>`).join('')).join('')}</g>`).join('');
    if (kind === 'workshop') deco += `<g class="gear" style="transform-origin:300px 200px"><circle cx="300" cy="200" r="90" fill="#e8b84a" opacity=".8"/>${Array.from({ length: 10 }, (_, i) => `<rect x="285" y="90" width="30" height="30" fill="#e8b84a" opacity=".8" transform="rotate(${i * 36} 300 200)"/>`).join('')}<circle cx="300" cy="200" r="30" fill="#26323a"/></g>
      <rect x="200" y="560" width="1200" height="40" fill="#8a5a2b"/><rect x="240" y="600" width="30" height="160" fill="#5a3a20"/><rect x="1330" y="600" width="30" height="160" fill="#5a3a20"/>`;
    if (kind === 'stable') {
      const head = (hx, hy) => `<g transform="translate(${hx} ${hy}) scale(1.7)"><g stroke="#6b4423" stroke-width="5" stroke-linecap="round" fill="none"><path d="M-10 -26 Q-18 -46 -34 -54 M-20 -40 L-36 -38 M-24 -48 L-22 -62"/><path d="M10 -26 Q18 -46 34 -54 M20 -40 L36 -38 M24 -48 L22 -62"/></g>
        <ellipse cx="-22" cy="-14" rx="12" ry="6" fill="#8a5a2e" transform="rotate(-25 -22 -14)"/><ellipse cx="22" cy="-14" rx="12" ry="6" fill="#8a5a2e" transform="rotate(25 22 -14)"/><path d="M-18 -20 Q0 -36 18 -20 L14 26 Q0 40 -14 26Z" fill="#8a5a2e"/>
        <path d="M-10 14 Q0 8 10 14 L8 28 Q0 36 -8 28Z" fill="#ecd3aa"/><g class="blink"><circle cx="-8" cy="-6" r="3.6" fill="#2a1a10"/><circle cx="8" cy="-6" r="3.6" fill="#2a1a10"/></g><ellipse cx="0" cy="27" rx="5" ry="4" fill="#2a1a10"/></g>`;
      const stall = (x, name, deer) => `<g><rect x="${x}" y="330" width="400" height="372" fill="#2a1808"/>${deer ? head(x + 200, 500) : ''}
        <rect x="${x}" y="320" width="400" height="22" fill="#6b4423"/><rect x="${x - 10}" y="320" width="22" height="382" fill="#6b4423"/><rect x="${x + 388}" y="320" width="22" height="382" fill="#6b4423"/>
        <rect x="${x + 12}" y="548" width="376" height="154" fill="url(#gWood)"/>${[0, 1, 2, 3].map(i => `<path d="M${x + 12} ${560 + i * 38} H${x + 388}" stroke="#5a3410" stroke-width="3" opacity=".5"/>`).join('')}
        <path d="M${x + 16} 552 L${x + 384} 698 M${x + 384} 552 L${x + 16} 698" stroke="#5a3410" stroke-width="14"/><rect x="${x + 12}" y="540" width="376" height="16" fill="#7a4a22"/>
        <rect x="${x + 120}" y="270" width="160" height="44" rx="8" fill="#fff8e6" stroke="#e8b84a" stroke-width="5"/><text x="${x + 200}" y="303" font-size="30" font-weight="900" text-anchor="middle" fill="#7a0a1a" font-family="Nunito, sans-serif">${name}</text>
        <path d="M${x + 150} 270 L${x + 170} 250 M${x + 250} 270 L${x + 230} 250" stroke="#5d6b75" stroke-width="3"/></g>`;
      deco += `${Array.from({ length: 22 }, (_, i) => `<rect x="${i * 74}" y="0" width="70" height="${H * 0.78}" fill="${i % 2 ? '#6e4a2a' : '#7a5230'}" opacity=".55"/>`).join('')}
        ${stall(110, 'Komet', 1)}${stall(1090, 'Lyn', 1)}
        <path d="M560 220 Q800 120 1040 220" stroke="#1f5d3a" stroke-width="26" fill="none"/>${[600, 680, 760, 840, 920, 1000].map((x, i) => `<circle cx="${x}" cy="${190 - Math.sin((i + 0.5) / 6 * Math.PI) * 50}" r="10" fill="${['#ff5f5f', '#ffd36b', '#5ec8ff'][i % 3]}" class="blinky" style="animation-delay:${i * 0.3}s"/>`).join('')}
        <path d="M778 228 V250 A22 22 0 0 0 822 250 V228" stroke="url(#gBrass)" stroke-width="10" fill="none" stroke-linecap="round"/>
        ${[560, 1040].map(x => `<g><path d="M${x} 300 V340" stroke="#3a2416" stroke-width="4"/><rect x="${x - 16}" y="340" width="32" height="44" rx="5" fill="#fff3c4" stroke="url(#gBrass)" stroke-width="4"/><ellipse cx="${x}" cy="362" rx="6" ry="10" fill="#ff9d2e" class="flicker"/><circle cx="${x}" cy="362" r="70" fill="url(#gGlow)" opacity=".55" class="flicker"/></g>`).join('')}`;
      floorDeco = `<g opacity=".85">${Array.from({ length: 60 }, (_, i) => `<path d="M${(i * 137) % W} ${712 + (i * 53) % 170} l${i % 2 ? 18 : -18} ${-6 - (i % 4) * 3}" stroke="#e8c860" stroke-width="4" stroke-linecap="round"/>`).join('')}</g>`;
    }
    if (kind === 'post') deco += `<g transform="translate(200 160)"><rect width="520" height="420" fill="#5a3a20"/>${Array.from({ length: 30 }, (_, i) => `<rect x="${14 + (i % 6) * 84}" y="${14 + Math.floor(i / 6) * 82}" width="74" height="70" fill="#3a2410"/>${i % 3 ? `<rect x="${24 + (i % 6) * 84}" y="${30 + Math.floor(i / 6) * 82}" width="54" height="34" fill="#fff8e6"/>` : ''}`).join('')}</g>`;
    if (kind === 'school') deco += `<rect x="500" y="140" width="600" height="300" rx="10" fill="#1f3a2a" stroke="#8a5a2b" stroke-width="16"/><text x="800" y="320" font-size="110" text-anchor="middle" fill="#fff" font-family="Nunito" font-weight="900" opacity=".85">A B C</text>`;
    if (kind === 'bakery' && !deco.includes('gear')) deco += `<rect x="150" y="560" width="800" height="50" fill="#e8d0a0"/>${[220, 380, 540, 700, 860].map(x => `<circle cx="${x}" cy="545" r="34" fill="#c8873d"/>`).join('')}`;
    if (kind === 'church' || kind === 'castle') deco += `<path d="M800 0 V260" stroke="#c9a77a" stroke-width="10"/><path d="M700 260 Q800 180 900 260 Z" fill="#e8b84a"/>`;
    const garland = `<path d="M0 60 Q200 130 400 60 T800 60 T1200 60 T1600 60" stroke="#1f5d3a" stroke-width="22" fill="none"/>${[100, 300, 500, 700, 900, 1100, 1300, 1500].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 66 : 96}" r="11" fill="${['#ff5f5f', '#ffd36b', '#5ec8ff'][i % 3]}" class="blinky" style="animation-delay:${i * 0.2}s"/>`).join('')}`;
    return `<svg class="scene" viewBox="0 0 ${W} ${H}" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg">
      <linearGradient id="wall_${kind}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${wall[1]}"/><stop offset="1" stop-color="${wall[0]}"/></linearGradient>
      <rect width="${W}" height="${H}" fill="url(#wall_${kind})"/>
      ${Array.from({ length: 16 }, (_, i) => `<rect x="${i * 100}" y="0" width="4" height="${H * 0.78}" fill="#000" opacity=".08"/>`).join('')}
      ${kind === 'library' || kind === 'stable' ? '' : win(kind === 'workshop' ? 1150 : 160, 150)}
      ${deco}
      <rect y="${H * 0.78}" width="${W}" height="${H * 0.22}" fill="${floor}"/>${Array.from({ length: 9 }, (_, i) => `<rect x="0" y="${H * 0.78 + i * 22}" width="${W}" height="2" fill="#000" opacity=".15"/>`).join('')}
      ${floorDeco || `<ellipse cx="800" cy="${H * 0.9}" rx="420" ry="50" fill="#a3202e" opacity=".75"/><ellipse cx="800" cy="${H * 0.9}" rx="360" ry="36" fill="none" stroke="#e8b84a" stroke-width="6" opacity=".7"/>`}
      ${garland}<rect width="${W}" height="${H}" fill="url(#gGlow)" opacity=".12"/></svg>`;
  }

  // ---------- Portrætter ----------
  function rudolf() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><g stroke="#6b4423" stroke-width="4" stroke-linecap="round" fill="none">
      <path d="M34 30 Q24 14 14 8 M24 18 L12 20 M30 22 L28 8"/><path d="M66 30 Q76 14 86 8 M76 18 L88 20 M70 22 L72 8"/></g>
      <ellipse cx="26" cy="38" rx="9" ry="5" fill="#a0662e" transform="rotate(-30 26 38)"/><ellipse cx="74" cy="38" rx="9" ry="5" fill="#a0662e" transform="rotate(30 74 38)"/>
      <path d="M30 40 Q30 22 50 22 Q70 22 70 40 L66 72 Q50 92 34 72Z" fill="#a0662e"/><path d="M40 64 Q50 58 60 64 L58 78 Q50 86 42 78Z" fill="#d4a373"/>
      <circle cx="41" cy="44" r="4.4" fill="#2a1a10"/><circle cx="59" cy="44" r="4.4" fill="#2a1a10"/><circle cx="42.4" cy="42.6" r="1.4" fill="#fff"/><circle cx="60.4" cy="42.6" r="1.4" fill="#fff"/>
      <circle cx="50" cy="74" r="16" fill="#ff3b3b" opacity=".25" class="pulse"/><circle cx="50" cy="73" r="8" fill="#e3263f"/><circle cx="47" cy="70" r="2.4" fill="#fff" opacity=".8"/>
      <path d="M38 88 Q50 96 62 88" stroke="#c8102e" stroke-width="6" fill="none"/><circle cx="50" cy="93" r="3.4" fill="#ffd36b"/></svg>`;
  }
  function drage() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${defs()}<circle cx="50" cy="50" r="46" fill="url(#gBlueGlow)" opacity=".5"/>
      <path d="M28 30 L18 6 L36 24Z M72 30 L82 6 L64 24Z" fill="#e8f8ff" stroke="#7fb6e0" stroke-width="1.5"/>
      <path d="M22 50 Q20 22 50 20 Q80 22 78 50 Q80 64 72 70 L62 86 Q50 92 38 86 L28 70 Q20 64 22 50Z" fill="#6fb6dc"/>
      <path d="M30 72 Q50 66 70 72 L62 86 Q50 92 38 86Z" fill="#a8dcf2"/><circle cx="43" cy="80" r="1.8" fill="#2a4a6a"/><circle cx="57" cy="80" r="1.8" fill="#2a4a6a"/>
      <path d="M50 20 L46 30 L50 28 L54 30Z M50 30 L47 38 L50 36 L53 38Z" fill="#e8f8ff"/>
      <ellipse cx="38" cy="50" rx="7" ry="8" fill="#fff"/><ellipse cx="62" cy="50" rx="7" ry="8" fill="#fff"/>
      <ellipse cx="38" cy="51" rx="4" ry="6" fill="#2f6db0"/><ellipse cx="62" cy="51" rx="4" ry="6" fill="#2f6db0"/>
      <path d="M38 47 l1 2 2 .3 -1.5 1.4 .4 2 -1.9 -1 -1.9 1 .4 -2 -1.5 -1.4 2 -.3z M62 47 l1 2 2 .3 -1.5 1.4 .4 2 -1.9 -1 -1.9 1 .4 -2 -1.5 -1.4 2 -.3z" fill="#fff"/>
      <path d="M14 56 L24 52 L22 60Z M86 56 L76 52 L78 60Z" fill="#e8f8ff"/></svg>`;
  }
  function raev() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg"><path d="M18 14 L36 34 L22 44Z M82 14 L64 34 L78 44Z" fill="#d9661f"/><path d="M22 20 L32 34 L25 38Z M78 20 L68 34 L75 38Z" fill="#3a1a0a"/>
      <path d="M20 40 Q22 26 50 26 Q78 26 80 40 Q84 60 50 88 Q16 60 20 40Z" fill="#e07a1f"/><path d="M26 54 Q38 60 50 88 Q62 60 74 54 Q66 70 50 74 Q34 70 26 54Z" fill="#fff4e6"/>
      <circle cx="50" cy="80" r="5" fill="#2a1a10"/>
      <circle cx="38" cy="48" r="9" fill="#fff" fill-opacity=".25" stroke="#b8862e" stroke-width="2.5"/><circle cx="62" cy="48" r="9" fill="#fff" fill-opacity=".25" stroke="#b8862e" stroke-width="2.5"/><path d="M47 48 h6" stroke="#b8862e" stroke-width="2.5"/>
      <circle cx="38" cy="49" r="3.4" fill="#2a1a10"/><circle cx="62" cy="49" r="3.4" fill="#2a1a10"/><circle cx="39" cy="47.6" r="1" fill="#fff"/><circle cx="63" cy="47.6" r="1" fill="#fff"/></svg>`;
  }
  function book() {
    return `<svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">${defs()}<circle cx="50" cy="52" r="46" fill="url(#gGlow)" opacity=".7" class="pulse"/>
      <path d="M50 30 Q34 22 14 26 V76 Q34 72 50 80Z" fill="#fff8e6" stroke="#b8862e" stroke-width="2"/><path d="M50 30 Q66 22 86 26 V76 Q66 72 50 80Z" fill="#fff3d6" stroke="#b8862e" stroke-width="2"/>
      <path d="M22 38 h20 M22 46 h20 M22 54 h16 M58 38 h20 M58 46 h20 M58 54 h14" stroke="#c9a77a" stroke-width="2"/>
      <path d="M50 14 l2.5 6 6.5 .6 -5 4.3 1.5 6.4 -5.5 -3.3 -5.5 3.3 1.5 -6.4 -5 -4.3 6.5 -.6z" fill="#ffd36b" class="twinkle"/></svg>`;
  }
  function portrait(id, player, expr) {
    if (id === 'player' && player) return Avatar.svg(player.look, player.equip, { portrait: true, expr: expr || 'happy' });
    if (Avatar.NPC[id]) return Avatar.svg(Avatar.NPC[id].look, Avatar.NPC[id].equip, { portrait: true, expr: expr || 'happy' });
    return ({ rudolf, drage, raev, fortael: book })[id] ? ({ rudolf, drage, raev, fortael: book })[id]() : book();
  }

  // ---------- Ikoner til nissesækken ----------
  function icon(id) {
    const it = ITEMS[id]; if (!it) return '';
    const look = typeof App !== 'undefined' && App.cur ? App.cur.look : {};
    const c = it.color || look.hatColor || '#c8102e';
    const wrap = (vb, inner) => `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${defs()}${inner}</svg>`;
    if (it.slot === 'hat') return wrap('28 -18 82 66', Avatar.parts.hat(Object.assign({}, it, { color: c })));
    if (['lantern', 'kikkert', 'wand', 'compass', 'book'].includes(it.style)) return wrap('74 66 38 52', Avatar.parts.hand(Object.assign({}, it, { color: c })));
    if (['amulet', 'heart', 'medal'].includes(it.style)) return wrap('44 72 32 30', Avatar.parts.neck(it));
    switch (it.style) {
      case 'cape': return wrap('0 0 64 64', `<path d="M20 8 Q6 40 4 58 Q32 64 60 58 Q58 40 44 8 Z" fill="${c}"/><path d="M4 58 Q32 64 60 58" stroke="${it.trim || '#fff'}" stroke-width="3" fill="none"/><path d="M18 8 Q32 16 46 8" stroke="${it.trim || '#e8b84a'}" stroke-width="4" fill="none"/><circle cx="32" cy="14" r="3" fill="${it.trim || '#e8b84a'}"/>`);
      case 'none': return wrap('0 0 64 64', `<path d="M14 14 Q32 6 50 14 L56 56 Q32 62 8 56Z" fill="${look.clothes || '#1f5d3a'}"/><path d="M9 55 Q32 62 55 55" stroke="#fff" stroke-width="4" fill="none"/><rect x="10" y="38" width="44" height="5" fill="#3a2416"/>`);
      case 'boots': return wrap('0 0 64 64', `<path d="M8 10 h14 v34 q14 2 16 10 q0 4 -4 4 h-26 z" fill="${c}"/><path d="M34 10 h14 v34 q14 2 16 10 q0 4 -4 4 h-26 z" fill="${sh(c, -0.15)}"/><rect x="6" y="8" width="18" height="6" rx="3" fill="#fff"/><rect x="32" y="8" width="18" height="6" rx="3" fill="#fff"/>`);
      case 'bag': return wrap('0 0 64 64', `<path d="M20 14 Q32 2 44 14" stroke="${sh(c, -0.3)}" stroke-width="4" fill="none"/><rect x="10" y="14" width="44" height="44" rx="10" fill="${c}"/><rect x="14" y="16" width="36" height="16" rx="6" fill="${sh(c, -0.2)}"/><rect x="28" y="28" width="8" height="8" rx="2" fill="#e8b84a"/>`);
      case 'candy': return wrap('0 0 64 64', `<path d="M6 20 L18 28 L18 36 L6 44Z M58 20 L46 28 L46 36 L58 44Z" fill="${sh(c, -0.15)}"/><circle cx="32" cy="32" r="16" fill="${c}"/><path d="M22 26 Q32 18 42 26" stroke="#fff" stroke-width="3" fill="none" opacity=".7"/>`);
      case 'crystal': return wrap('-40 -100 80 104', `<g>${crystal(0, 0, 1).replace(/url\(#gIce\)/g, c)}</g>`);
      default: return wrap('0 0 64 64', `<circle cx="32" cy="32" r="20" fill="${c}"/>`);
    }
  }

  function giftBox(c = '#c8102e', rb = '#ffd36b') {
    return `<svg class="giftbox" viewBox="0 0 200 200" xmlns="http://www.w3.org/2000/svg">${defs()}
      <circle cx="100" cy="110" r="96" fill="url(#gGlow)" opacity=".5" class="pulse"/>
      <rect x="40" y="90" width="120" height="96" rx="6" fill="${c}"/><rect x="100" y="90" width="60" height="96" fill="#000" opacity=".15"/>
      <rect x="90" y="90" width="20" height="96" fill="${rb}"/>
      <g class="lid"><rect x="32" y="66" width="136" height="30" rx="6" fill="${sh(c, 0.12)}"/><rect x="90" y="66" width="20" height="30" fill="${rb}"/>
      <path d="M100 66 Q70 30 60 50 Q56 66 100 66 Q130 30 140 50 Q144 66 100 66Z" fill="${rb}" stroke="${sh(rb, -0.25)}" stroke-width="2"/></g></svg>`;
  }

  // ---------- Store tegnede ting inde i husene ----------
  function reindeer(o = {}) {
    const fur = o.fur || '#8a5a2e', dk = sh(fur, -0.3), lt = '#ecd3aa';
    const nose = o.red
      ? `<circle cx="197" cy="86" r="22" fill="url(#gNose)" class="pulse"/><circle cx="196" cy="85" r="8.5" fill="#e3263f"/><circle cx="193" cy="81.5" r="2.8" fill="#fff" opacity=".9"/>`
      : '<ellipse cx="196" cy="85" rx="5.5" ry="4.4" fill="#2a1a10"/>';
    const leg = (x, back) => `<path d="M${x} 118 Q${x - 6} 150 ${x - 2} 166 L${x + (back ? -4 : 2)} 198 L${x + 8} 198 L${x + 8} 166 Q${x + 12} 146 ${x + 14} 120Z" fill="${back ? dk : fur}"/><rect x="${x + (back ? -6 : 0)}" y="196" width="13" height="8" rx="2" fill="#2a1a10"/>`;
    const body = `<ellipse cx="110" cy="208" rx="80" ry="7" fill="#000" opacity=".22"/>
      ${leg(56, 1)}${leg(132, 1)}
      <path d="M40 100 Q24 92 28 80 Q40 86 46 96Z" fill="#fff"/>
      <path d="M38 104 Q30 142 62 148 L138 148 Q170 142 162 104 Q150 82 100 84 Q52 84 38 104Z" fill="${fur}"/>
      <path d="M58 142 Q100 156 142 142 Q122 132 100 134 Q78 132 58 142Z" fill="${lt}"/>
      <path d="M70 92 Q100 86 130 94" stroke="${sh(fur, 0.15)}" stroke-width="6" fill="none" stroke-linecap="round" opacity=".6"/>
      ${leg(42, 0)}${leg(118, 0)}
      <path d="M140 106 Q148 72 163 52 L184 64 Q170 86 164 114Z" fill="${fur}"/>
      <path d="M150 98 Q162 120 150 138 Q174 128 170 102Z" fill="#f6ead2"/>
      <g stroke="#6b4423" stroke-width="5.5" stroke-linecap="round" fill="none"><path d="M168 46 Q160 24 146 12 M158 30 L142 30 M152 21 L154 6"/><path d="M178 44 Q184 20 200 8 M186 26 L202 27 M193 16 L190 2"/></g>
      <path d="M163 54 Q172 38 188 50 L201 78 Q203 93 190 95 Q176 93 170 80 Q160 66 163 54Z" fill="${fur}"/>
      <path d="M186 72 Q201 74 202 87 Q199 96 189 95 Q180 90 182 80Z" fill="${lt}"/>
      <path d="M166 54 Q148 44 145 52 Q154 60 168 60Z" fill="${fur}"/><path d="M164 55 Q152 49 149 52 Q156 57 165 57Z" fill="#d99a8a"/>
      <ellipse cx="178" cy="62" rx="4.4" ry="5" fill="#2a1a10"/><circle cx="179.6" cy="60.2" r="1.6" fill="#fff"/><path d="M173 56 l-3 -3 M176 55 l-1 -4 M179 55 l1 -4" stroke="#2a1a10" stroke-width="1.4"/>
      <path d="M188 96 Q194 99 198 95" stroke="#5a3418" stroke-width="2" fill="none" stroke-linecap="round"/>
      ${nose}
      <path d="M150 90 Q166 106 184 94" stroke="#c8102e" stroke-width="9" fill="none" stroke-linecap="round"/>
      ${[[155, 97], [166, 102], [177, 99]].map(([x, y]) => `<circle cx="${x}" cy="${y + 5}" r="5" fill="url(#gBrass)" stroke="#8a5a14"/><path d="M${x - 3} ${y + 6} h6" stroke="#5a3a10" stroke-width="1.4"/>`).join('')}
      ${o.scarf ? `<path d="M146 96 Q164 116 186 98 L188 108 Q164 128 144 106Z" fill="#1f5d3a"/><path d="M150 108 L142 140 L154 138 L158 112Z" fill="#1f5d3a"/><path d="M143 134 h12 M144 128 h12" stroke="#fff" stroke-width="2"/>` : ''}`;
    const flip = o.flip ? 'transform="translate(220 0) scale(-1 1)"' : '';
    return `<svg viewBox="0 0 220 214" xmlns="http://www.w3.org/2000/svg"><g ${flip}>${body}</g></svg>`;
  }

  const PROP_ART = {
    blueprint: () => ['0 0 220 170', `<g transform="rotate(-4 110 85)"><rect x="10" y="14" width="200" height="140" fill="#1f4f8f"/><rect x="10" y="14" width="200" height="140" fill="none" stroke="#e8f4ff" stroke-width="2" opacity=".5"/>
      ${Array.from({ length: 10 }, (_, i) => `<path d="M${10 + i * 20} 14 V154" stroke="#fff" stroke-width=".6" opacity=".2"/>`).join('')}${Array.from({ length: 7 }, (_, i) => `<path d="M10 ${14 + i * 20} H210" stroke="#fff" stroke-width=".6" opacity=".2"/>`).join('')}
      <g stroke="#e8f4ff" stroke-width="2" fill="none" stroke-linecap="round"><path d="M30 40 L60 40 L52 70 L38 70Z"/><path d="M45 70 V90 H90"/><rect x="90" y="70" width="50" height="44" rx="6"/><circle cx="115" cy="92" r="12"/><path d="M115 80 V92 L124 98"/><path d="M140 92 H160 V110"/><path d="M150 112 h22 l-3 26 h-16z"/><path d="M172 118 q10 2 8 10 q-2 6 -8 4"/></g>
      <g fill="#e8f4ff">${[[36, 32], [46, 26], [56, 32]].map(([x, y]) => `<path d="M${x} ${y - 4} v8 M${x - 4} ${y} h8" stroke="#e8f4ff" stroke-width="1.6"/>`).join('')}</g>
      <path d="M156 106 q4 -8 8 0 q4 -8 8 0" stroke="#ffd36b" stroke-width="2" fill="none"/>
      <text x="20" y="148" font-size="10" fill="#e8f4ff" font-family="sans-serif" font-weight="700">SNE → KAKAO  v.0.3</text><text x="150" y="30" font-size="9" fill="#ffd36b" font-family="sans-serif">IKKE FÆRDIG!</text>
      <path d="M100 66 l-14 -14 M100 66 l6 -18" stroke="#ffd36b" stroke-width="1.4" stroke-dasharray="3 3"/><circle cx="90" cy="46" r="8" fill="none" stroke="#ffd36b" stroke-width="1.4"/><text x="90" y="50" font-size="10" text-anchor="middle" fill="#ffd36b" font-family="sans-serif">?</text></g>
      <circle cx="22" cy="20" r="5" fill="#c8102e"/><circle cx="200" cy="16" r="5" fill="#c8102e"/>
      <g transform="rotate(20 170 150)"><rect x="120" y="146" width="90" height="10" rx="2" fill="#ffd36b"/><path d="M126 146 v4 M136 146 v6 M146 146 v4 M156 146 v6 M166 146 v4 M176 146 v6 M186 146 v4 M196 146 v6" stroke="#5a3a10" stroke-width="1.2"/></g>
      <g transform="rotate(-30 40 150)"><rect x="20" y="146" width="56" height="7" rx="2" fill="#e8b84a"/><path d="M76 146 l10 3.5 -10 3.5z" fill="#f4d9a8"/><path d="M84 148.5 l2 1" stroke="#333" stroke-width="1.5"/></g>`],
    woodBasket: () => ['0 0 170 140', `<ellipse cx="85" cy="134" rx="76" ry="6" fill="#000" opacity=".22"/>
      ${[[30, 40, -14], [56, 30, 8], [84, 34, -6], [110, 28, 12], [44, 50, 20], [96, 46, -16]].map(([x, y, a]) => `<g transform="rotate(${a} ${x + 22} ${y + 9})"><rect x="${x}" y="${y}" width="44" height="18" rx="9" fill="#8a5a2e"/><path d="M${x + 6} ${y + 5} h24 M${x + 10} ${y + 12} h20" stroke="#6b4423" stroke-width="2"/><ellipse cx="${x + 44}" cy="${y + 9}" rx="6" ry="9" fill="#d9a86a"/><ellipse cx="${x + 44}" cy="${y + 9}" rx="3" ry="5" fill="none" stroke="#a8743a" stroke-width="1.2"/></g>`).join('')}
      <path d="M14 60 L156 60 L140 132 L30 132Z" fill="#b07a44"/>${Array.from({ length: 6 }, (_, i) => `<path d="M16 ${68 + i * 11} H154" stroke="#7a4a22" stroke-width="4" opacity=".6"/>`).join('')}
      ${Array.from({ length: 9 }, (_, i) => `<path d="M${26 + i * 15} 60 L${32 + i * 13} 132" stroke="#8a5a2e" stroke-width="3"/>`).join('')}<path d="M12 60 H158" stroke="#6b4423" stroke-width="7" stroke-linecap="round"/>
      <path d="M40 60 Q85 6 130 60" stroke="#6b4423" stroke-width="6" fill="none"/>`],
    deer: () => ['0 0 220 214', reindeer().replace(/^<svg[^>]*>|<\/svg>$/g, '')],
    sleigh: () => ['0 0 340 220', `<ellipse cx="170" cy="210" rx="160" ry="9" fill="#000" opacity=".25"/>
      <circle cx="320" cy="58" r="40" fill="url(#gGlow)" class="flicker"/>
      <path d="M24 194 H262 Q318 194 320 150 Q320 124 296 126 Q284 130 290 142" stroke="url(#gGoldA)" stroke-width="9" fill="none" stroke-linecap="round"/>
      ${[60, 130, 200, 252].map(x => `<path d="M${x} 170 L${x - 6} 194" stroke="url(#gGoldA)" stroke-width="6"/>`).join('')}
      <path d="M74 104 Q62 36 116 26 Q160 22 158 66 Q156 96 146 108Z" fill="#a0522d"/><path d="M96 44 Q118 36 140 48" stroke="#6b3a1a" stroke-width="3" fill="none"/><path d="M84 76 Q110 62 150 74" stroke="#7a3e1c" stroke-width="2" fill="none" opacity=".6"/>
      ${[[150, 64, 36, 44, '#2f6db0', '#ffd36b'], [184, 76, 34, 32, '#1f5d3a', '#ff5f5f'], [214, 58, 30, 50, '#ffd36b', '#c8102e']].map(([x, y, w, h, c, r]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="3" fill="${c}"/><rect x="${x + w / 2 - 3}" y="${y}" width="6" height="${h}" fill="${r}"/><path d="M${x + w / 2} ${y} q-12 -14 -14 -2 q2 6 14 2 q12 -14 14 -2 q-2 6 -14 2" fill="${r}"/>`).join('')}
      <path d="M34 176 Q14 96 34 46 Q54 30 80 46 Q70 92 86 112 L232 112 Q262 104 272 68 Q290 52 306 70 Q300 140 252 176Z" fill="url(#gSleigh)" stroke="#6a0a16" stroke-width="3"/>
      <path d="M40 58 Q56 44 74 52" stroke="#ff8a96" stroke-width="4" fill="none" opacity=".7" stroke-linecap="round"/>
      <path d="M34 176 Q14 96 34 46 Q54 30 80 46 Q70 92 86 112 L232 112 Q262 104 272 68 Q290 52 306 70" stroke="url(#gGoldA)" stroke-width="5" fill="none"/>
      <path d="M62 150 q18 -26 36 0 t36 0 t36 0 t36 0 t36 0" stroke="url(#gGoldA)" stroke-width="4" fill="none"/>
      ${[62, 98, 134, 170, 206, 242].map(x => `<circle cx="${x}" cy="150" r="4" fill="url(#gBrass)"/>`).join('')}
      <path d="M300 74 q-14 -4 -12 10 q4 10 14 2" stroke="url(#gGoldA)" stroke-width="4" fill="none"/><path d="M48 70 q-10 10 0 18 q10 4 10 -6" stroke="url(#gGoldA)" stroke-width="4" fill="none"/>
      <rect x="86" y="104" width="146" height="14" rx="7" fill="#1f5d3a"/><path d="M92 110 h134" stroke="#2e7d4f" stroke-width="3" stroke-dasharray="10 8"/>
      <rect x="204" y="128" width="40" height="16" rx="5" fill="#2a1a10"/><circle cx="213" cy="136" r="4.5" fill="#ff3b3b" class="blinky"/><text x="230" y="140" font-size="9" font-weight="900" text-anchor="middle" fill="#ffd36b" font-family="sans-serif">TURBO</text>
      <path d="M318 120 V40" stroke="#3a2416" stroke-width="4"/><rect x="308" y="40" width="20" height="28" rx="3" fill="#fff3c4" stroke="url(#gBrass)" stroke-width="3"/><ellipse cx="318" cy="55" rx="4" ry="6" fill="#ff9d2e" class="flicker"/><path d="M306 40 L318 30 L330 40Z" fill="#3a2416"/>
      ${[[30, 20], [180, 14], [270, 30], [120, 8]].map(([x, y]) => `<path d="M${x} ${y - 7} l2 5 6 .6 -4.5 3.6 1.4 5.6 -4.9 -3 -4.9 3 1.4 -5.6 -4.5 -3.6 6 -.6z" fill="#fff3c4" class="twinkle"/>`).join('')}`],
    carrots: () => {
      const carrot = (x, y, a, len = 62) => `<g transform="translate(${x} ${y}) rotate(${a})"><g stroke="#3c8a3c" stroke-width="4.5" fill="none" stroke-linecap="round"><path d="M0 0 Q-12 -18 -8 -30"/><path d="M0 0 Q2 -24 6 -34"/><path d="M0 0 Q12 -16 16 -22"/></g>
        <path d="M-8 0 L8 0 L1 ${len} Q0 ${len + 4} -1 ${len}Z" fill="#f28c28"/><path d="M-3 0 L-1 ${len * 0.8}" stroke="#ffb35c" stroke-width="2.4" opacity=".8"/><path d="M-6 ${len * 0.2} h7 M-4 ${len * 0.42} h6 M-3 ${len * 0.62} h4" stroke="#c96a12" stroke-width="1.6"/></g>`;
      return ['0 -24 190 194', `<ellipse cx="92" cy="162" rx="86" ry="7" fill="#000" opacity=".22"/>
        <ellipse cx="80" cy="64" rx="54" ry="12" fill="#3a2410"/>
        ${[[44, 30, -22], [60, 22, -10], [76, 18, 2], [92, 22, 12], [108, 30, 24], [68, 34, -4], [100, 36, 8], [52, 38, -16], [84, 32, 18]].map(([x, y, a]) => carrot(x, y, a)).join('')}
        <path d="M26 64 L134 64 L122 152 L38 152Z" fill="url(#gWood)"/>
        ${[46, 62, 80, 98, 114].map(x => `<path d="M${x} 66 L${x + (x - 80) * -0.08} 150" stroke="#5a3410" stroke-width="1.6" opacity=".55"/>`).join('')}
        <path d="M30 86 L130 86 M34 128 L126 128" stroke="#5d6b75" stroke-width="6"/><path d="M30 84 L130 84" stroke="#9aa7b0" stroke-width="1.6"/>
        <ellipse cx="80" cy="64" rx="54" ry="12" fill="none" stroke="#6a3c18" stroke-width="5"/>
        <path d="M28 68 Q80 -16 132 68" stroke="#5d6b75" stroke-width="4" fill="none"/>
        ${carrot(150, 150, -100, 56)}${carrot(140, 160, -82, 50)}`];
    },
    bells: () => ['0 0 220 120', `<circle cx="110" cy="8" r="5" fill="#5d6b75"/><g class="swing" style="transform-origin:110px 8px">
      <path d="M110 8 L20 30 M110 8 L200 30" stroke="#3a2416" stroke-width="3"/>
      <path d="M14 30 Q110 96 206 30" stroke="#6b3a1a" stroke-width="16" fill="none" stroke-linecap="round"/><path d="M14 30 Q110 96 206 30" stroke="#e8b84a" stroke-width="2" fill="none" stroke-dasharray="4 6"/>
      ${[[34, 48], [70, 66], [110, 74], [150, 66], [186, 48]].map(([x, y]) => `<circle cx="${x}" cy="${y + 10}" r="15" fill="url(#gBrass)" stroke="#8a5a14" stroke-width="1.5"/><path d="M${x - 8} ${y + 14} h16" stroke="#4a2a08" stroke-width="3" stroke-linecap="round"/><circle cx="${x}" cy="${y + 19}" r="3" fill="#4a2a08"/><circle cx="${x - 5}" cy="${y + 4}" r="4" fill="#fff" opacity=".7"/>`).join('')}
      <path d="M110 64 q-26 -18 -26 2 q8 10 26 -2 q26 -18 26 2 q-8 10 -26 -2" fill="#c8102e"/><path d="M106 68 l-10 26 M114 68 l10 26" stroke="#c8102e" stroke-width="6" stroke-linecap="round"/></g>`],
    hay: () => ['0 0 200 120', `<ellipse cx="100" cy="112" rx="94" ry="7" fill="#000" opacity=".2"/><rect x="14" y="30" width="172" height="80" rx="10" fill="#e8c860"/>
      ${Array.from({ length: 22 }, (_, i) => `<path d="M${18 + i * 8} ${34 + (i % 3) * 6} l${(i % 2 ? 4 : -4)} ${60 + (i % 4) * 4}" stroke="#c9a23a" stroke-width="2"/>`).join('')}
      <path d="M14 56 H186 M14 86 H186" stroke="#8a5a2b" stroke-width="4"/>${Array.from({ length: 12 }, (_, i) => `<path d="M${20 + i * 15} 30 l${i % 2 ? 6 : -6} -10" stroke="#e8c860" stroke-width="3" stroke-linecap="round"/>`).join('')}`],
    cookieJar: () => ['0 0 140 160', `<ellipse cx="70" cy="154" rx="60" ry="6" fill="#000" opacity=".2"/>
      ${[[46, 120], [80, 128], [60, 96], [94, 104], [44, 76], [78, 80]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="18" fill="#d9a05a" stroke="#a8702e" stroke-width="2"/>${[[-6, -4], [5, 3], [-2, 8], [7, -7]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="2.6" fill="#5a3418"/>`).join('')}`).join('')}
      <path d="M22 40 Q14 40 14 54 V138 Q14 150 30 150 H110 Q126 150 126 138 V54 Q126 40 118 40Z" fill="url(#gGlass)" stroke="#bfe3f5" stroke-width="3"/>
      <path d="M28 56 V130" stroke="#fff" stroke-width="6" opacity=".55" stroke-linecap="round"/>
      <rect x="18" y="22" width="104" height="20" rx="8" fill="#c8102e"/><circle cx="70" cy="16" r="9" fill="#ffd36b"/>
      <rect x="36" y="96" width="68" height="24" rx="4" fill="#fff8e6" stroke="#c9a77a"/><text x="70" y="112" font-size="11" font-weight="900" text-anchor="middle" fill="#c8102e" font-family="sans-serif">IKKE SOFUS</text>`],
    teddy: (one) => ['0 0 140 160', `<ellipse cx="70" cy="154" rx="52" ry="6" fill="#000" opacity=".2"/>
      <g fill="#a8703e"><circle cx="36" cy="26" r="14"/><circle cx="104" cy="26" r="14"/><ellipse cx="70" cy="112" rx="40" ry="38"/><ellipse cx="34" cy="140" rx="18" ry="14"/><ellipse cx="106" cy="140" rx="18" ry="14"/><ellipse cx="28" cy="98" rx="12" ry="20" transform="rotate(25 28 98)"/><ellipse cx="112" cy="98" rx="12" ry="20" transform="rotate(-25 112 98)"/><circle cx="70" cy="52" r="34"/></g>
      <circle cx="36" cy="26" r="7" fill="#e8b48a"/><circle cx="104" cy="26" r="7" fill="#e8b48a"/><ellipse cx="70" cy="116" rx="24" ry="24" fill="#e8b48a"/><ellipse cx="70" cy="64" rx="16" ry="12" fill="#e8b48a"/>
      <ellipse cx="70" cy="58" rx="6" ry="4.5" fill="#3a2416"/><path d="M70 62 v6 M62 70 Q70 76 78 70" stroke="#3a2416" stroke-width="2.4" fill="none" stroke-linecap="round"/>
      ${one ? `<circle cx="56" cy="44" r="6" fill="#5a3a20"/><circle cx="56" cy="44" r="2" fill="#c9a77a"/><path d="M80 40 l8 8 M88 40 l-8 8" stroke="#3a2416" stroke-width="2.4"/>` : '<circle cx="56" cy="44" r="5" fill="#2a1a10"/><circle cx="84" cy="44" r="5" fill="#2a1a10"/>'}
      <path d="M86 104 h14 v14 h-14z" fill="#5ec8ff" opacity=".8"/><path d="M86 104 l14 14 M100 104 l-14 14" stroke="#2f6db0" stroke-width="1.4"/>
      <path d="M44 84 Q70 96 96 84 L92 94 Q70 104 48 94Z" fill="#c8102e"/>`],
    stocking: () => ['0 0 120 170', `<circle cx="50" cy="8" r="4" fill="#5d6b75"/><path d="M50 8 L40 22 M50 8 L64 22" stroke="#c8102e" stroke-width="3"/>
      <path d="M28 30 H82 V108 Q82 120 94 126 Q116 136 110 156 Q104 168 84 164 L40 150 Q20 142 24 118Z" fill="#c8102e"/><path d="M78 34 V108 Q78 120 90 128" stroke="#7a0a1a" stroke-width="4" fill="none" opacity=".4"/>
      ${[[42, 70], [64, 92], [40, 118], [74, 140]].map(([x, y]) => `<path d="M${x} ${y - 6} l1.6 4 4 .4 -3 2.6 1 4 -3.6 -2 -3.6 2 1 -4 -3 -2.6 4 -.4z" fill="#ffd36b"/>`).join('')}
      <rect x="20" y="18" width="70" height="24" rx="10" fill="#fff"/><path d="M24 30 q6 -6 12 0 t12 0 t12 0 t12 0 t12 0" stroke="#e6eef5" stroke-width="3" fill="none"/>
      <path d="M84 160 Q100 166 108 154" stroke="#fff" stroke-width="8" fill="none" stroke-linecap="round"/>`],
    candle: () => ['0 0 100 170', `<circle cx="50" cy="40" r="40" fill="url(#gGlow)" class="flicker"/>
      <ellipse cx="50" cy="160" rx="38" ry="8" fill="url(#gBrass)"/><path d="M22 156 Q50 132 78 156" fill="url(#gBrass)"/><path d="M80 150 q16 -4 14 -18 q-2 -10 -12 -6" stroke="url(#gBrass)" stroke-width="5" fill="none"/>
      <rect x="36" y="60" width="28" height="86" rx="4" fill="#fff8e6"/><rect x="52" y="60" width="12" height="86" fill="#000" opacity=".08"/><path d="M40 62 q2 14 0 22 M58 62 q-2 10 0 16" stroke="#f4ead2" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M50 58 v-6" stroke="#3a2416" stroke-width="2"/><g class="flicker"><path d="M50 20 Q62 38 50 54 Q38 38 50 20Z" fill="#ff9d2e"/><path d="M50 32 Q56 42 50 52 Q44 42 50 32Z" fill="#fff3c4"/></g>`],
    postbox: () => ['0 0 120 180', `<ellipse cx="60" cy="174" rx="44" ry="6" fill="#000" opacity=".22"/><rect x="50" y="130" width="20" height="44" fill="#3a2a20"/>
      <path d="M18 50 Q18 14 60 14 Q102 14 102 50 V136 H18Z" fill="#c8102e"/><path d="M80 18 Q102 24 102 50 V136 H84Z" fill="#000" opacity=".15"/>
      <rect x="30" y="56" width="60" height="10" rx="4" fill="#2a1a10"/><path d="M30 52 H90" stroke="#ffd36b" stroke-width="3"/>
      <g fill="none" stroke="#ffd36b" stroke-width="4"><path d="M42 98 Q42 84 56 86 Q66 88 70 98 L84 92"/><circle cx="52" cy="98" r="6"/></g><path d="M46 30 l14 -8 14 8" stroke="#ffd36b" stroke-width="3" fill="none"/>
      <rect x="36" y="112" width="48" height="14" rx="3" fill="#fff"/><text x="60" y="123" font-size="10" font-weight="900" text-anchor="middle" fill="#c8102e" font-family="sans-serif">TAK!</text>`],
    parcel: () => ['0 0 160 140', `<ellipse cx="80" cy="134" rx="70" ry="6" fill="#000" opacity=".2"/><path d="M14 50 L80 30 L146 50 L80 72Z" fill="#d9a86a"/><path d="M14 50 L80 72 V132 L14 110Z" fill="#c08a4e"/><path d="M146 50 L80 72 V132 L146 110Z" fill="#a8743a"/>
      <path d="M47 40 L113 61 V121 M113 40 L47 61 V121" stroke="#c8102e" stroke-width="5" fill="none"/><path d="M80 52 q-18 -20 -22 -6 q4 8 22 6 q18 -20 22 -6 q-4 8 -22 6" fill="#c8102e"/>
      <g transform="rotate(-14 120 96)"><rect x="92" y="84" width="50" height="24" fill="#fff8e6" stroke="#c9a77a"/><text x="117" y="95" font-size="7" font-weight="900" text-anchor="middle" fill="#c8102e" font-family="sans-serif">MÅ IKKE</text><text x="117" y="104" font-size="7" font-weight="900" text-anchor="middle" fill="#c8102e" font-family="sans-serif">RYSTES</text></g>`],
    letters: () => ['0 0 160 130', `<ellipse cx="80" cy="124" rx="70" ry="6" fill="#000" opacity=".18"/>
      ${[[20, 84, -8, '#fff8e6'], [30, 66, 6, '#e8f4ff'], [16, 48, -4, '#fff0f0'], [28, 28, 8, '#fff8e6']].map(([x, y, a, c]) => `<g transform="rotate(${a} ${x + 60} ${y + 22})"><rect x="${x}" y="${y}" width="120" height="44" rx="3" fill="${c}" stroke="#c9a77a" stroke-width="1.5"/><path d="M${x} ${y} L${x + 60} ${y + 26} L${x + 120} ${y}" stroke="#c9a77a" stroke-width="1.5" fill="none"/><rect x="${x + 98}" y="${y + 6}" width="14" height="16" fill="#c8102e"/><path d="M${x + 102} ${y + 12} l3 4 3 -4" stroke="#fff" stroke-width="1.4" fill="none"/></g>`).join('')}
      <circle cx="80" cy="58" r="7" fill="#c8102e"/>`],
    dove: () => ['0 0 160 120', `<g class="swing" style="transform-origin:80px 60px"><path d="M30 70 Q60 40 100 60 Q130 70 140 56 Q136 84 104 90 Q70 96 44 86Z" fill="#fff" stroke="#c9d6e2" stroke-width="2"/>
      <path d="M60 64 Q70 20 112 18 Q96 44 100 62Z" fill="#f4f8fb" stroke="#c9d6e2" stroke-width="2"/><path d="M76 50 Q86 34 100 30 M80 58 Q92 44 104 42" stroke="#c9d6e2" stroke-width="1.6" fill="none"/>
      <circle cx="38" cy="68" r="14" fill="#fff" stroke="#c9d6e2" stroke-width="2"/><circle cx="34" cy="66" r="2.4" fill="#2a1a10"/><path d="M24 70 L14 72 L24 75Z" fill="#f2a33a"/>
      <path d="M28 58 Q34 34 54 40 Q46 46 48 56Z" fill="#c8102e"/><circle cx="54" cy="40" r="4" fill="#fff"/><rect x="26" y="55" width="24" height="5" rx="2.5" fill="#fff"/>
      <rect x="74" y="82" width="22" height="14" rx="2" fill="#fff8e6" stroke="#c9a77a"/><path d="M74 82 l11 7 11 -7" stroke="#c9a77a" fill="none"/></g>`],
    books: () => ['0 0 160 140', `<ellipse cx="80" cy="134" rx="70" ry="6" fill="#000" opacity=".2"/>
      ${[[20, 106, 120, '#c8102e', 0], [30, 84, 104, '#2f6db0', -3], [18, 62, 118, '#1f5d3a', 2], [34, 42, 96, '#5b3c88', -4], [26, 22, 108, '#b8862e', 3]].map(([x, y, w, c, a]) => `<g transform="rotate(${a} ${x + w / 2} ${y + 10})"><rect x="${x}" y="${y}" width="${w}" height="22" rx="3" fill="${c}"/><rect x="${x + w - 10}" y="${y + 3}" width="8" height="16" fill="#fff8e6"/><path d="M${x + 10} ${y + 4} v14 M${x + w - 24} ${y + 4} v14" stroke="#e8b84a" stroke-width="2"/></g>`).join('')}`],
    owl: () => ['0 0 120 170', `<path d="M10 150 H110" stroke="#5a3a20" stroke-width="10" stroke-linecap="round"/>
      <ellipse cx="60" cy="100" rx="40" ry="48" fill="#8a6a4a"/><ellipse cx="60" cy="112" rx="26" ry="32" fill="#e9d6b8"/>${[[50, 100], [62, 108], [54, 120], [68, 124], [58, 134]].map(([x, y]) => `<path d="M${x - 4} ${y} q4 5 8 0" stroke="#a8875e" stroke-width="2" fill="none"/>`).join('')}
      <path d="M22 86 Q14 120 30 140 Q36 112 30 92Z M98 86 Q106 120 90 140 Q84 112 90 92Z" fill="#6b4f34"/>
      <path d="M26 60 L32 34 L46 52 Z M94 60 L88 34 L74 52Z" fill="#8a6a4a"/><circle cx="44" cy="72" r="16" fill="#fff8e6"/><circle cx="76" cy="72" r="16" fill="#fff8e6"/>
      <g class="blink"><circle cx="44" cy="72" r="8" fill="#f2a33a"/><circle cx="76" cy="72" r="8" fill="#f2a33a"/><circle cx="44" cy="72" r="4" fill="#1a120c"/><circle cx="76" cy="72" r="4" fill="#1a120c"/></g><path d="M56 82 L60 92 L64 82Z" fill="#e8a030"/>
      ${[44, 56, 68, 76].map(x => `<path d="M${x} 146 v6" stroke="#e8a030" stroke-width="3" stroke-linecap="round"/>`).join('')}`],
    buns: () => ['0 0 180 130', `<g class="smoke" opacity=".7"><path d="M50 40 q-8 -12 0 -22 q8 -10 0 -20 M90 36 q-8 -12 0 -22 q8 -10 0 -20 M130 40 q-8 -12 0 -22 q8 -10 0 -20" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <path d="M8 96 H172 L160 120 H20Z" fill="#9aa7b0"/><path d="M8 96 H172" stroke="#c9d3da" stroke-width="4"/>
      ${[[42, 78], [90, 74], [138, 78], [66, 90], [114, 90]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="24" ry="14" fill="#c8873d"/><path d="M${x} ${y} m-14 0 a14 8 0 1 1 14 6 a9 5 0 1 1 -8 -5 a4 2.4 0 1 1 4 2" stroke="#7a4a1a" stroke-width="2.6" fill="none"/><path d="M${x - 12} ${y - 6} q12 -6 24 0" stroke="#fff" stroke-width="2" fill="none" opacity=".8"/>`).join('')}`],
    layerCake: () => ['0 0 160 200', `<ellipse cx="80" cy="190" rx="70" ry="8" fill="#000" opacity=".2"/><path d="M10 184 H150" stroke="#e6eef5" stroke-width="8" stroke-linecap="round"/>
      ${Array.from({ length: 12 }, (_, i) => `<rect x="${28 + i * 0.8}" y="${170 - i * 11}" width="${104 - i * 1.6}" height="11" fill="${i % 2 ? '#fff3e0' : ['#f4a6b8', '#c8873d', '#ffd36b'][i % 3]}"/>`).join('')}
      <path d="M36 40 Q80 26 124 40 L124 52 Q114 60 106 52 Q96 62 86 52 Q76 62 66 52 Q56 62 46 52 Q40 58 36 52Z" fill="#fff"/>
      ${[[50, 36], [80, 30], [110, 36]].map(([x, y], i) => `<rect x="${x - 3}" y="${y - 22}" width="6" height="22" fill="${['#5ec8ff', '#ff5f8f', '#7ee08a'][i]}"/><path d="M${x} ${y - 34} q6 8 0 12 q-6 -4 0 -12" fill="#ff9d2e" class="flicker"/>`).join('')}
      ${[[48, 46], [70, 44], [92, 44], [114, 46]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="5" fill="#c8102e"/>`).join('')}
      <rect x="110" y="110" width="36" height="22" rx="4" fill="#fff8e6" stroke="#c9a77a" transform="rotate(8 128 121)"/><text x="128" y="126" font-size="12" font-weight="900" text-anchor="middle" fill="#c8102e" font-family="sans-serif" transform="rotate(8 128 121)">24</text>`],
    oven: () => ['0 0 200 190', `<rect x="20" y="40" width="160" height="146" rx="10" fill="#8e3b2e"/>${Array.from({ length: 7 }, (_, r) => Array.from({ length: 5 }, (_, c) => `<rect x="${22 + c * 32 + (r % 2) * 16}" y="${44 + r * 20}" width="28" height="16" rx="2" fill="#a5483a"/>`).join('')).join('')}
      <path d="M50 186 V120 Q100 70 150 120 V186Z" fill="#1a0f08"/><g class="flicker hearth"><path d="M62 184 Q74 140 100 120 Q126 142 138 184Z" fill="#ff8a2a"/><path d="M80 184 Q90 156 100 146 Q112 160 118 184Z" fill="#ffd36b"/></g>
      <circle cx="100" cy="160" r="70" fill="url(#gGlow)" opacity=".6"/>${[[66, 178], [100, 182], [132, 178]].map(([x, y]) => `<rect x="${x - 18}" y="${y - 6}" width="36" height="10" rx="5" fill="#6b3a1a"/>`).join('')}
      <rect x="10" y="28" width="180" height="16" rx="4" fill="#5a2a1a"/><rect x="130" y="0" width="26" height="30" fill="#5a2a1a"/>`],
    pretzels: () => ['0 0 180 120', `<path d="M10 60 Q90 130 170 60Z" fill="#b07a44"/><path d="M10 60 Q90 130 170 60" stroke="#7a4a22" stroke-width="5" fill="none"/>${[30, 50, 70, 90, 110, 130, 150].map(x => `<path d="M${x} 64 L${x + (90 - x) * 0.15} 100" stroke="#7a4a22" stroke-width="2"/>`).join('')}
      ${[[50, 50], [90, 42], [130, 50]].map(([x, y]) => `<path d="M${x - 20} ${y + 10} Q${x - 26} ${y - 22} ${x} ${y - 4} Q${x + 26} ${y - 22} ${x + 20} ${y + 10} Q${x} ${y + 22} ${x - 12} ${y - 4} M${x + 20} ${y + 10} Q${x} ${y + 22} ${x + 12} ${y - 4}" stroke="#a8622a" stroke-width="9" fill="none" stroke-linecap="round"/>${[[-12, -6], [8, -10], [14, 6], [-6, 10]].map(([dx, dy]) => `<circle cx="${x + dx}" cy="${y + dy}" r="1.6" fill="#fff"/>`).join('')}`).join('')}
      <text x="90" y="30" font-size="22" font-weight="900" text-anchor="middle" fill="#a8622a" stroke="#fff" stroke-width="1" font-family="sans-serif">N</text>`],
    rocket: () => ['0 0 120 190', `<ellipse cx="60" cy="184" rx="40" ry="6" fill="#000" opacity=".2"/><g class="bob"><path d="M60 10 Q92 44 90 120 H30 Q28 44 60 10Z" fill="#eef3f7" stroke="#9aa7b0" stroke-width="2"/><path d="M60 10 Q74 24 82 44 H38 Q46 24 60 10Z" fill="#c8102e"/>
      <circle cx="60" cy="70" r="14" fill="#5ec8ff" stroke="#2f6db0" stroke-width="4"/><circle cx="55" cy="65" r="4" fill="#fff" opacity=".8"/><text x="60" y="108" font-size="16" font-weight="900" text-anchor="middle" fill="#c8102e" font-family="sans-serif">47</text>
      <path d="M30 92 L10 130 L30 124Z M90 92 L110 130 L90 124Z" fill="#c8102e"/><g class="flicker"><path d="M38 120 Q60 176 82 120Z" fill="#ff9d2e"/><path d="M48 120 Q60 150 72 120Z" fill="#ffd36b"/></g></g>`],
    redButton: () => ['0 0 140 160', `<ellipse cx="70" cy="154" rx="56" ry="6" fill="#000" opacity=".2"/><rect x="30" y="70" width="80" height="84" rx="6" fill="#3a4a52"/>${Array.from({ length: 6 }, (_, i) => `<path d="M${30 + i * 16} 140 l12 -12 h8 l-12 12z" fill="#ffd36b"/>`).join('')}
      <rect x="22" y="58" width="96" height="18" rx="6" fill="#5d6b75"/><ellipse cx="70" cy="58" rx="30" ry="12" fill="#7a0a1a"/><path d="M40 58 Q40 30 70 30 Q100 30 100 58Z" fill="#e3263f"/><ellipse cx="60" cy="40" rx="10" ry="5" fill="#fff" opacity=".6"/>
      <text x="70" y="108" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">IKKE</text><text x="70" y="121" font-size="11" font-weight="900" text-anchor="middle" fill="#fff" font-family="sans-serif">TRYK</text>`],
    gears: () => ['0 0 160 140', `${[[56, 70, 40, 10, '#e8b84a'], [118, 50, 26, 8, '#c0c7cf']].map(([x, y, r, n, c], k) => `<g class="gear" style="transform-origin:${x}px ${y}px;${k ? 'animation-direction:reverse' : ''}"><circle cx="${x}" cy="${y}" r="${r}" fill="${c}" stroke="${sh(c, -0.3)}" stroke-width="3"/>${Array.from({ length: n }, (_, i) => `<rect x="${x - 6}" y="${y - r - 10}" width="12" height="14" rx="2" fill="${c}" transform="rotate(${(i * 360) / n} ${x} ${y})"/>`).join('')}<circle cx="${x}" cy="${y}" r="${r * 0.35}" fill="#3a4a52"/></g>`).join('')}
      <path d="M24 120 q20 -10 40 0 t40 0" stroke="#5ec8ff" stroke-width="3" fill="none" class="twinkle"/>`],
    magnet: () => ['0 0 140 150', `<path d="M30 20 V80 Q30 130 70 130 Q110 130 110 80 V20 H82 V80 Q82 100 70 100 Q58 100 58 80 V20Z" fill="#c8102e" stroke="#7a0a1a" stroke-width="3"/>
      <rect x="30" y="14" width="28" height="22" fill="#d9dee3" stroke="#8a959d" stroke-width="2"/><rect x="82" y="14" width="28" height="22" fill="#d9dee3" stroke="#8a959d" stroke-width="2"/>
      <path d="M36 4 l6 -8 M70 2 v-8 M104 4 l-6 -8" stroke="#5ec8ff" stroke-width="3" stroke-linecap="round" class="twinkle"/>${[[24, 0], [116, 2]].map(([x, y]) => `<circle cx="${x}" cy="${y + 12}" r="5" fill="url(#gBrass)"/>`).join('')}`],
    frame: () => ['0 0 140 140', `<rect x="8" y="8" width="124" height="124" rx="6" fill="url(#gBrass)"/><rect x="22" y="22" width="96" height="96" fill="#cfe8f5"/>
      <circle cx="70" cy="76" r="26" fill="#f3c9a8"/><path d="M42 66 Q50 18 86 30 Q100 40 98 66Z" fill="#c8102e"/><rect x="40" y="60" width="60" height="10" rx="5" fill="#fff"/><circle cx="86" cy="30" r="6" fill="#fff"/>
      <circle cx="62" cy="80" r="3" fill="#2a1a10"/><circle cx="78" cy="80" r="3" fill="#2a1a10"/><path d="M60 92 Q70 100 80 92" stroke="#7a2b1a" stroke-width="2.4" fill="none"/>
      ${[[56, 96], [84, 88], [66, 104], [52, 86]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="3.4" fill="#8a4f24"/>`).join('')}`],
    mouse: () => ['0 0 120 90', `<ellipse cx="60" cy="84" rx="44" ry="5" fill="#000" opacity=".2"/><path d="M96 70 Q118 60 110 40" stroke="#c9a6a0" stroke-width="3" fill="none"/>
      <ellipse cx="66" cy="62" rx="32" ry="20" fill="#9aa0a6"/><circle cx="34" cy="52" r="18" fill="#a8aeb4"/><circle cx="30" cy="32" r="11" fill="#a8aeb4"/><circle cx="30" cy="32" r="6" fill="#f4b8c0"/>
      <circle cx="26" cy="50" r="3" fill="#1a120c"/><circle cx="16" cy="56" r="3.4" fill="#f48aa0"/><path d="M18 58 l-12 -3 M18 60 l-12 3" stroke="#5a5a5a" stroke-width="1"/>
      <g class="swing" style="transform-origin:44px 62px"><path d="M44 62 L52 34" stroke="#a8aeb4" stroke-width="5" stroke-linecap="round"/><path d="M46 30 q0 -12 10 -10 q8 2 6 12 q-2 8 -10 6Z" fill="#c8102e"/><rect x="45" y="34" width="14" height="4" fill="#fff"/></g>`],
    cocoa: () => ['0 0 130 140', `<g class="smoke" opacity=".7"><path d="M50 30 q-8 -10 0 -18 q8 -8 0 -16 M72 26 q-8 -10 0 -18 q8 -8 0 -16" stroke="#fff" stroke-width="4" fill="none" stroke-linecap="round"/></g>
      <ellipse cx="60" cy="132" rx="50" ry="6" fill="#000" opacity=".2"/><path d="M22 54 H98 L92 122 Q90 132 80 132 H40 Q30 132 28 122Z" fill="#c8102e"/><path d="M98 66 q24 2 22 26 q-2 20 -26 18" stroke="#c8102e" stroke-width="9" fill="none"/>
      <path d="M24 56 Q34 30 50 44 Q60 26 74 42 Q90 30 96 56Z" fill="#fff"/><path d="M54 44 q6 -8 12 0 q-6 8 -12 0" fill="#ff8fa3"/>
      <path d="M36 82 H84" stroke="#fff" stroke-width="4" stroke-dasharray="6 5"/><path d="M56 100 l4 4 4 -4 q2 -4 -4 -4 q-6 0 -4 4" fill="#fff"/>`],
    snowman: () => ['0 0 160 200', `<ellipse cx="80" cy="192" rx="62" ry="8" fill="#000" opacity=".15"/><circle cx="80" cy="150" r="44" fill="#fff" stroke="#d5e4ef" stroke-width="3"/><circle cx="80" cy="92" r="32" fill="#fff" stroke="#d5e4ef" stroke-width="3"/><circle cx="80" cy="46" r="24" fill="#fff" stroke="#d5e4ef" stroke-width="3"/>
      <rect x="56" y="6" width="48" height="14" rx="3" fill="#2a1a10"/><rect x="64" y="-14" width="32" height="24" rx="3" fill="#2a1a10"/><rect x="64" y="0" width="32" height="5" fill="#c8102e"/>
      <circle cx="72" cy="40" r="4.4" fill="#1a120c"/><circle cx="88" cy="40" r="4.4" fill="#1a120c"/><ellipse cx="80" cy="58" rx="5" ry="6" fill="#1a120c"/><path d="M80 48 L112 54 L80 54Z" fill="#f28c28"/>
      <path d="M56 70 Q80 82 104 70 L104 80 Q80 92 56 80Z" fill="#2f6db0"/><path d="M96 76 L104 108 L112 104 L104 76Z" fill="#2f6db0"/>
      <path d="M50 92 L18 70 M24 74 l-8 -2 M104 92 L138 72 M132 76 l8 -4" stroke="#6b4423" stroke-width="4" stroke-linecap="round"/>${[90, 104, 118].map(y => `<circle cx="80" cy="${y}" r="4" fill="#1a120c"/>`).join('')}`],
    gifts: () => ['0 0 200 150', `<ellipse cx="100" cy="144" rx="90" ry="6" fill="#000" opacity=".2"/>
      ${[[14, 70, 74, 72, '#c8102e', '#ffd36b'], [92, 54, 90, 88, '#1f5d3a', '#ff5f5f'], [56, 102, 60, 40, '#2f6db0', '#fff'], [150, 100, 44, 42, '#ffd36b', '#c8102e']].map(([x, y, w, h, c, r]) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${c}"/><rect x="${x + w * 0.6}" y="${y}" width="${w * 0.4}" height="${h}" fill="#000" opacity=".12"/><rect x="${x + w / 2 - 4}" y="${y}" width="8" height="${h}" fill="${r}"/><rect x="${x}" y="${y + h / 2 - 4}" width="${w}" height="8" fill="${r}"/><path d="M${x + w / 2} ${y} q-18 -18 -20 -2 q4 8 20 2 q18 -18 20 -2 q-4 8 -20 2" fill="${r}"/>`).join('')}
      <g transform="rotate(-10 126 76)"><rect x="110" y="70" width="36" height="16" fill="#fff8e6"/><text x="128" y="81" font-size="7" font-weight="900" text-anchor="middle" fill="#c8102e" font-family="sans-serif">JULEAFTEN</text></g>`],
    bauble: () => ['0 0 120 150', `<path d="M60 0 V24" stroke="#e8b84a" stroke-width="2"/><rect x="50" y="22" width="20" height="14" rx="3" fill="url(#gBrass)"/><circle cx="60" cy="88" r="54" fill="#c8102e"/>
      <circle cx="60" cy="88" r="54" fill="url(#gGlass)"/><path d="M14 80 Q60 104 106 80" stroke="#ffd36b" stroke-width="5" fill="none"/><path d="M18 104 Q60 124 102 104" stroke="#fff" stroke-width="3" fill="none" stroke-dasharray="4 6"/>
      <ellipse cx="40" cy="62" rx="12" ry="18" fill="#fff" opacity=".45" transform="rotate(30 40 62)"/>`],
    churchBell: () => ['0 0 160 190', `<path d="M10 10 H150" stroke="#5a3a20" stroke-width="14" stroke-linecap="round"/><path d="M80 14 V30" stroke="#3a2416" stroke-width="6"/>
      <g class="swing" style="transform-origin:80px 20px"><path d="M80 30 Q44 30 42 80 Q40 120 18 136 H142 Q120 120 118 80 Q116 30 80 30Z" fill="url(#gBrass)" stroke="#7a5010" stroke-width="3"/>
      <path d="M22 132 H138" stroke="#7a5010" stroke-width="6"/><path d="M50 92 H110" stroke="#a87420" stroke-width="3"/><ellipse cx="62" cy="62" rx="8" ry="20" fill="#fff" opacity=".35"/><circle cx="80" cy="146" r="10" fill="#5a3a10"/></g>
      <path d="M128 136 Q132 160 124 186" stroke="#d9c08a" stroke-width="5" fill="none"/>`],
    scroll: () => ['0 0 180 140', `<path d="M30 20 H160 V110 H30Z" fill="#f4e2b8"/><path d="M30 20 Q16 20 16 32 Q16 44 30 44 M160 110 Q174 110 174 122 Q174 134 160 134 H30 Q16 134 16 122 Q16 110 30 110" fill="#e2c890" stroke="#a8875e" stroke-width="2"/>
      <path d="M44 90 Q70 50 96 76 T150 46" stroke="#c8102e" stroke-width="3" fill="none" stroke-dasharray="6 5"/><path d="M46 60 q10 -12 20 0 M110 96 q10 -10 22 0" stroke="#3c8a52" stroke-width="4" fill="none"/>
      ${[[60, 40], [120, 70], [140, 40], [80, 96]].map(([x, y]) => `<path d="M${x} ${y - 6} l1.6 4 4.4 .4 -3.4 2.8 1 4.2 -3.6 -2.2 -3.6 2.2 1 -4.2 -3.4 -2.8 4.4 -.4z" fill="#e8b84a" class="twinkle"/>`).join('')}<path d="M144 92 l8 8 M152 92 l-8 8" stroke="#c8102e" stroke-width="3"/>`],
  };
  // Emoji, der automatisk får en stor tegning (kan overskrives pr. ting med 6. felt i INTERIORS).
  const ART_BY_EMOJI = { '🍪': 'cookieJar', '🧸': 'teddy', '🧦': 'stocking', '🕯️': 'candle', '📮': 'postbox', '📦': 'parcel', '✉️': 'letters', '🕊️': 'dove', '📚': 'books',
    '🦉': 'owl', '🥐': 'buns', '🍰': 'layerCake', '🔥': 'oven', '🥨': 'pretzels', '🚀': 'rocket', '🔴': 'redButton', '⚙️': 'gears', '🧲': 'magnet', '🖼️': 'frame',
    '🐭': 'mouse', '☕': 'cocoa', '⛄': 'snowman', '🎁': 'gifts', '🔔': 'churchBell', '📜': 'scroll', '🦌': 'deer', '📐': 'blueprint', '🪵': 'woodBasket' };
  const ART_SIZE = { deer: 22, sleigh: 40, carrots: 13, bells: 15, hay: 14, cookieJar: 10, teddy: 10, stocking: 8, candle: 7, postbox: 9, parcel: 11, letters: 11, dove: 11, books: 11,
    owl: 8, buns: 13, layerCake: 10, oven: 16, pretzels: 12, rocket: 8, redButton: 9, gears: 12, magnet: 9, frame: 9, mouse: 8, cocoa: 8, snowman: 12, gifts: 14, bauble: 8, churchBell: 12, scroll: 12, blueprint: 16, woodBasket: 11 };
  function propArt(emoji, key, size) {
    const k = key || ART_BY_EMOJI[emoji];
    if (!k) return null;
    const [base, arg] = k.split(':');
    if (!PROP_ART[base]) return null;
    const [vb, inner] = PROP_ART[base](arg);
    return { key: base, size: size || ART_SIZE[base] || 10, svg: `<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" overflow="visible">${inner}</svg>` };
  }
  // Hele figurer til rummene, når figuren ikke er en nisse.
  function fullBody(id) {
    if (id === 'rudolf') return reindeer({ red: true, scarf: true, flip: true, fur: '#9a6232' });
    return null;
  }

  // SVG som selvstændigt billede (til 3D-rummene); de fælles gradienter lægges med ind.
  function standalone(svg) {
    const vb = (svg.match(/viewBox="([^"]+)"/) || [])[1] || '0 0 100 100';
    const [, , w, h] = vb.split(/[\s,]+/).map(Number), k = 512 / Math.max(w, h);
    let s = svg.replace(/<svg([^>]*)>/, (m, a) => `<svg${a.replace(/\s(width|height|class)="[^"]*"/g, '')} width="${Math.round(w * k)}" height="${Math.round(h * k)}">${globalDefs()}`);
    if (!/^<svg[^>]*xmlns=/.test(s)) s = s.replace('<svg', '<svg xmlns="http://www.w3.org/2000/svg"');
    return { url: 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(s), aspect: w / h };
  }

  const holder = document.createElement('div');
  holder.innerHTML = `<svg width="0" height="0" style="position:absolute;width:0;height:0" aria-hidden="true">${globalDefs()}</svg>`;
  document.body.prepend(holder.firstChild);

  return { defs, pine, bigTree, house, mountain, crystal, lollipop, candyCane, gingerHouse, workshop, castle, starTower, mushroom, cave, stars, aurora, scene, room, portrait, icon, giftBox, propArt, fullBody, standalone };
})();
