// Rigtig 3D inde i husene: man går rundt, kigger og trykker på ting. Tegnet med Canvas 2D – ingen biblioteker.
const Room3D = (() => {
  const RW = 5, RD = 9, RH = 3.6, EYE = 1.3, NEAR = 0.05;
  const KINDS = ['workshop', 'cozy', 'post', 'stable', 'library', 'bakery', 'school', 'church', 'castle'];
  const WALL = { workshop: '#4a5a62', cozy: '#9a4a38', post: '#36589a', stable: '#8a6038', library: '#4a3868', bakery: '#c27a3e', school: '#3a7a72', church: '#5a4a6a', castle: '#5b3f8a' };
  const FLOOR = { stable: '#c9a46a', castle: '#9fd0e6', church: '#8a7a6a' };
  // Height in metres for the drawn things, and where they belong
  const HEIGHT = { deer: 1.6, sleigh: 1.9, carrots: 0.6, bells: 0.55, hay: 0.7, cookieJar: 0.4, teddy: 0.45, stocking: 0.65, candle: 0.4, postbox: 1.3, parcel: 0.5, letters: 0.3,
    dove: 0.32, books: 0.38, owl: 0.55, buns: 0.32, layerCake: 0.6, oven: 1.9, pretzels: 0.3, rocket: 0.6, redButton: 0.5, gears: 0.9, magnet: 0.42, frame: 0.6, mouse: 0.22,
    cocoa: 0.26, snowman: 1.4, gifts: 0.6, bauble: 0.4, churchBell: 1.0, scroll: 0.4, blueprint: 0.9, woodBasket: 0.55 };
  const WALL_ITEMS = new Set(['bells', 'blueprint', 'frame', 'stocking', 'gears']);
  const FLOOR_ITEMS = new Set(['deer', 'carrots', 'hay', 'postbox', 'oven', 'snowman', 'gifts', 'woodBasket', 'mouse', 'parcel']);

  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const add = (a, b) => [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
  const mul = (a, s) => [a[0] * s, a[1] * s, a[2] * s];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const shadeCache = new Map();
  function shade(hex, p) {
    const key = hex + p;
    if (shadeCache.has(key)) return shadeCache.get(key);
    const n = parseInt(hex.slice(1), 16), t = p < 0 ? 0 : 255, a = Math.abs(p);
    const f = c => Math.round((t - c) * a + c);
    const out = `rgb(${f(n >> 16)},${f((n >> 8) & 255)},${f(n & 255)})`;
    shadeCache.set(key, out);
    return out;
  }

  const imgCache = new Map();
  function svgImage(svg) {
    if (imgCache.has(svg)) return imgCache.get(svg);
    const s = Art.standalone(svg), im = new Image();
    im.src = s.url;
    const o = { im, aspect: s.aspect };
    imgCache.set(svg, o);
    return o;
  }
  function textImage(text, emoji) {
    const key = 't:' + text + emoji;
    if (imgCache.has(key)) return imgCache.get(key);
    const c = document.createElement('canvas'), x = c.getContext('2d');
    if (emoji) {
      c.width = c.height = 160;
      x.font = '128px serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(text, 80, 88);
    } else {
      c.width = 320; c.height = 96;
      x.fillStyle = '#fff8e6'; x.strokeStyle = '#e8b84a'; x.lineWidth = 10;
      x.beginPath(); x.roundRect ? x.roundRect(6, 6, 308, 84, 16) : x.rect(6, 6, 308, 84); x.fill(); x.stroke();
      x.fillStyle = '#7a0a1a'; x.font = '900 52px Nunito, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(text, 160, 52);
    }
    const o = { im: c, aspect: c.width / c.height };
    imgCache.set(key, o);
    return o;
  }
  const artImg = (inner, vb) => svgImage(`<svg viewBox="${vb}" xmlns="http://www.w3.org/2000/svg" overflow="visible">${inner}</svg>`);
  const wreathImage = () => artImg(`<circle cx="50" cy="50" r="34" fill="none" stroke="#1f5d3a" stroke-width="18"/>
    <circle cx="50" cy="50" r="34" fill="none" stroke="#3f8f5a" stroke-width="6" stroke-dasharray="4 7"/>
    ${[0, 1, 2, 3, 4, 5, 6, 7].map(k => { const a = (k * Math.PI) / 4; return `<circle cx="${(50 + Math.cos(a) * 34).toFixed(1)}" cy="${(50 + Math.sin(a) * 34).toFixed(1)}" r="4" fill="#e0203e"/>`; }).join('')}
    <path d="M50 80 l-16 14 l3 -18z M50 80 l16 14 l-3 -18z" fill="#c8102e"/><circle cx="50" cy="80" r="6" fill="#e0203e"/>`, '0 0 100 100');

  // ---------- building the room ----------
  function makeBox(solids, blocks) {
    const face = (pts, col, n, extra = {}) => solids.push({ pts, col, n, ...extra });
    // Box with optional colour per face; blocks walking when solid
    const box = (x0, x1, y0, y1, z0, z1, col, o = {}) => {
      const c = o.side || shade(col, -0.18), top = o.top || shade(col, 0.1);
      face([[x0, y1, z0], [x1, y1, z0], [x1, y1, z1], [x0, y1, z1]], top, [0, 1, 0]);
      face([[x0, y0, z0], [x1, y0, z0], [x1, y1, z0], [x0, y1, z0]], col, [0, 0, -1], o.front ? { front: o.front } : {});
      face([[x1, y0, z1], [x0, y0, z1], [x0, y1, z1], [x1, y1, z1]], c, [0, 0, 1]);
      face([[x0, y0, z1], [x0, y0, z0], [x0, y1, z0], [x0, y1, z1]], c, [-1, 0, 0]);
      face([[x1, y0, z0], [x1, y0, z1], [x1, y1, z1], [x1, y1, z0]], shade(col, -0.3), [1, 0, 0]);
      face([[x0, y0, z1], [x1, y0, z1], [x1, y0, z0], [x0, y0, z0]], shade(col, -0.45), [0, -1, 0]);
      if (y0 < 0.5 && o.block !== false) blocks.push([x0, x1, z0, z1]);
    };
    return { face, box };
  }
  function build(kind, props, npc, day = 1) {
    const hull = [], decals = [], solids = [], bills = [], blocks = [], lights = [];
    const wallCol = WALL[kind] || WALL.cozy, floorCol = FLOOR[kind] || '#7a4a2a';
    const { box } = makeBox(solids, blocks);
    const table = (x0, x1, z0, z1, h = 0.85, col = '#8a5a2e') => {
      box(x0, x1, h - 0.08, h, z0, z1, col);
      [[x0 + 0.05, z0 + 0.05], [x1 - 0.13, z0 + 0.05], [x0 + 0.05, z1 - 0.13], [x1 - 0.13, z1 - 0.13]].forEach(([x, z]) => box(x, x + 0.08, 0, h - 0.08, z, z + 0.08, shade(col, -0.25), { block: false }));
      blocks.push([x0, x1, z0, z1]);
    };
    const shelf = (x0, x1, z0, z1, h, col = '#4a2e1a') => {
      const books = [];
      for (let r = 0; r < 4; r++) {
        let x = x0 + 0.06;
        while (x < x1 - 0.12) {
          const w = 0.06 + ((x * 37 + r * 13) % 7) / 100, bh = 0.32 - ((x * 53 + r) % 5) / 50;
          books.push({ x, w, y: 0.15 + r * (h / 4.2), h: bh, c: ['#c8102e', '#1f5d3a', '#2f6db0', '#e8b84a', '#5b3c88'][Math.floor(x * 31 + r) % 5] });
          x += w + 0.015;
        }
      }
      box(x0, x1, 0, h, z0, z1, col, { front: books });
    };

    // hull: floor, ceiling, walls
    hull.push({ pts: [[-RW, 0, 0], [RW, 0, 0], [RW, 0, RD], [-RW, 0, RD]], col: floorCol });
    hull.push({ pts: [[-RW, RH, 0], [-RW, RH, RD], [RW, RH, RD], [RW, RH, 0]], col: shade(wallCol, -0.5) });
    hull.push({ pts: [[-RW, 0, RD], [RW, 0, RD], [RW, RH, RD], [-RW, RH, RD]], col: wallCol, grad: true });
    hull.push({ pts: [[-RW, 0, 0], [-RW, 0, RD], [-RW, RH, RD], [-RW, RH, 0]], col: shade(wallCol, -0.12), grad: true });
    hull.push({ pts: [[RW, 0, RD], [RW, 0, 0], [RW, RH, 0], [RW, RH, RD]], col: shade(wallCol, -0.2), grad: true });
    hull.push({ pts: [[RW, 0, 0], [-RW, 0, 0], [-RW, RH, 0], [RW, RH, 0]], col: shade(wallCol, -0.25), grad: true });
    // wainscot and wall boards
    const wains = shade(wallCol, -0.22);
    decals.push({ pts: [[-RW, 0, RD - 0.01], [RW, 0, RD - 0.01], [RW, 1, RD - 0.01], [-RW, 1, RD - 0.01]], col: wains });
    decals.push({ pts: [[-RW + 0.01, 0, 0], [-RW + 0.01, 0, RD], [-RW + 0.01, 1, RD], [-RW + 0.01, 1, 0]], col: shade(wallCol, -0.28) });
    decals.push({ pts: [[RW - 0.01, 0, RD], [RW - 0.01, 0, 0], [RW - 0.01, 1, 0], [RW - 0.01, 1, RD]], col: shade(wallCol, -0.32) });
    const lines = [];
    for (let x = -RW + 0.5; x < RW; x += 0.5) lines.push([[x, 0, RD - 0.02], [x, RH, RD - 0.02], 'rgba(0,0,0,.12)']);
    for (let z = 0.5; z < RD; z += 0.5) { lines.push([[-RW + 0.02, 0, z], [-RW + 0.02, RH, z], 'rgba(0,0,0,.1)']); lines.push([[RW - 0.02, 0, z], [RW - 0.02, RH, z], 'rgba(0,0,0,.1)']); }
    for (let x = -RW + 0.4; x < RW; x += 0.4) lines.push([[x, 0.005, 0], [x, 0.005, RD], kind === 'castle' ? 'rgba(255,255,255,.25)' : 'rgba(0,0,0,.18)']);
    // ceiling beams
    for (let z = 1.5; z < RD; z += 2) box(-RW, RW, RH - 0.25, RH, z, z + 0.22, '#4a2e1a', { block: false });
    // window on the left wall
    const win = { z0: 1.8, z1: 3.6, y0: 1.2, y1: 2.7 };
    decals.push({ pts: [[-RW + 0.02, win.y0, win.z0], [-RW + 0.02, win.y0, win.z1], [-RW + 0.02, win.y1, win.z1], [-RW + 0.02, win.y1, win.z0]], col: '#0b1a3a', window: win });
    // rug or hay
    const rug = [], rug2 = [];
    for (let i = 0; i < 28; i++) { const a = (i / 28) * Math.PI * 2; rug.push([Math.cos(a) * 2.4, 0.01, 4.6 + Math.sin(a) * 1.5]); rug2.push([Math.cos(a) * 2.05, 0.012, 4.6 + Math.sin(a) * 1.2]); }
    if (kind !== 'stable') { decals.push({ pts: rug, col: '#a3202e' }); decals.push({ pts: rug2, col: '#a3202e', stroke: '#e8b84a' }); }
    else for (let i = 0; i < 90; i++) { const x = ((i * 137) % 97) / 97 * 2 * RW - RW, z = ((i * 61) % 89) / 89 * RD; lines.push([[x, 0.01, z], [x + (i % 2 ? 0.3 : -0.3), 0.01, z + 0.12], '#e8c860']); }

    const hasOven = props.some(p => p.key === 'oven');
    let fire = null;
    if (['cozy', 'castle', 'bakery'].includes(kind) && !hasOven) {
      box(-1.2, 1.2, 0, 1.5, RD - 0.7, RD, '#8e3b2e', { front: [{ opening: true }] });
      box(-1.4, 1.4, 1.5, 1.65, RD - 0.85, RD, '#4a2e1a');
      box(-0.6, 0.6, 1.65, RH, RD - 0.5, RD, '#7a3226', { block: false });
      fire = { p: [0, 0.12, RD - 0.68], w: 1.3, h: 0.9 };
    }
    // furniture per room
    const slots = { table: [], floor: [], wall: [], big: [[0, RD - 1.4]] };
    const tableAt = (x0, x1, z0, z1) => {
      table(x0, x1, z0, z1);
      const alongX = x1 - x0 > z1 - z0, len = alongX ? x1 - x0 : z1 - z0, n = Math.max(1, Math.round(len / 0.9));
      for (let i = n - 1; i >= 0; i--) { const t = (i + 0.5) / n; slots.table.push(alongX ? [x0 + t * (x1 - x0), (z0 + z1) / 2, 0.85] : [(x0 + x1) / 2, z0 + t * (z1 - z0), 0.85]); }
    };
    if (kind === 'library') { shelf(-RW, -RW + 0.5, 1, 8.6, 3); shelf(RW - 0.5, RW, 4.5, 8.6, 3); shelf(-3.5, 3.5, RD - 0.5, RD, 3); tableAt(-1.5, 1.5, 3.6, 4.6); }
    else if (kind === 'stable') {
      [[-RW, -2.6, 'Komet'], [2.6, RW, 'Lyn']].forEach(([x0, x1, name]) => {
        box(x0, x1, 0, 1.3, 6.2, 6.35, '#6b4423');
        box(x0 < 0 ? x1 - 0.12 : x0, x0 < 0 ? x1 : x0 + 0.12, 0, 1.3, 6.2, RD, '#5a3418');
        bills.push({ img: textImage(name), p: [(x0 + x1) / 2, 2.0, 6.15], h: 0.4 });
        bills.push({ img: { im: null, art: 'deer' }, p: [(x0 + x1) / 2, 0, 7.2], h: 1.7, flip: x0 > 0 });
        blocks.push([x0, x1, 6.2, RD]);
      });
      box(-RW, -RW + 1, 0, 0.6, 2.6, 3.6, '#e8c860', { top: '#f0d880' });
    } else if (kind === 'post') { shelf(-3, 3, RD - 0.5, RD, 2.8, '#5a3a20'); tableAt(-4.6, -3.6, 3.8, 7.4); }
    else if (kind === 'school') {
      decals.push({ pts: [[-2.6, 1.1, RD - 0.02], [2.6, 1.1, RD - 0.02], [2.6, 2.7, RD - 0.02], [-2.6, 2.7, RD - 0.02]], col: '#1f3a2a', stroke: '#8a5a2b' });
      bills.push({ img: textImage('A  B  C'), p: [0, 1.55, RD - 0.05], h: 0.6, flat: true });
      [[-2, 4], [0.6, 4], [-2, 5.6], [0.6, 5.6]].forEach(([x, z]) => table(x, x + 1.2, z, z + 0.6, 0.65, '#b07a44'));
      tableAt(-4.6, -3.6, 3.6, 6.4);
    } else if (kind === 'church') { tableAt(-1.2, 1.2, RD - 1.6, RD - 1); [[-3.5, 3], [2.3, 3], [-3.5, 5], [2.3, 5]].forEach(([x, z]) => box(x, x + 1.2, 0, 0.5, z, z + 0.5, '#6b4423')); }
    else if (kind === 'castle') { box(3, 4.2, 0, 1.6, 6.8, 7.8, '#ffd36b'); box(3.1, 4.1, 0.5, 0.75, 6.4, 7.6, '#c8102e'); tableAt(-4.6, -3.6, 3.8, 7.2); }
    else if (kind === 'workshop') {
      tableAt(-2.4, 2.4, RD - 1.5, RD - 0.7);
      decals.push({ pts: [[-2.6, 1.1, RD - 0.02], [2.6, 1.1, RD - 0.02], [2.6, 2.5, RD - 0.02], [-2.6, 2.5, RD - 0.02]], col: '#a87a4a', stroke: '#6b4423' });
      ['🔧', '🔨', '🪛', '🪚', '📏'].forEach((e, k) => bills.push({ img: textImage(e, true), p: [-2 + k, 1.45, RD - 0.06], h: 0.5 }));
      tableAt(-4.6, -3.6, 3.8, 7.2);
    } else if (kind === 'bakery') {
      if (!fire) tableAt(-2.4, 2.4, RD - 1.6, RD - 0.8);
      tableAt(-4.6, -3.6, 3.8, 7.2);
    } else {
      tableAt(-4.6, -3.6, 3.8, 7.6);
      if (kind === 'cozy') { box(2.6, 3.8, 0, 0.45, 2.4, 3.5, '#a3202e'); box(2.6, 3.8, 0.45, 1.2, 3.35, 3.55, '#8a1a26'); box(2.5, 2.7, 0.45, 0.75, 2.4, 3.55, '#8a1a26'); box(3.7, 3.9, 0.45, 0.75, 2.4, 3.55, '#8a1a26'); }
    }
    slots.floor = kind === 'stable' ? [[-2.2, 4.6], [-0.9, 3.3], [1.8, 3.4], [-3.6, 3.2]] : [[-2.8, RD - 1], [2.8, RD - 1], [4.1, 3], [-1.6, RD - 1], [1.6, RD - 1], [4.1, 5]];
    slots.wall = [[-3, 2.1, RD - 0.03, 'z'], [3, 2.1, RD - 0.03, 'z'], [RW - 0.03, 2.1, 3, 'x'], [RW - 0.03, 2.1, 6.5, 'x'], [-RW + 0.03, 2.1, 6.5, 'x'], [0, 2.4, RD - 0.03, 'z']];
    if (fire) slots.wall = slots.wall.filter(s => !(Math.abs(s[0]) < 1.5 && s[3] === 'z'));

    // the room's things
    const objs = props.map((pr, i) => {
      const k = pr.key, h = (HEIGHT[k] || 0.45) * (['deer', 'sleigh', 'oven', 'postbox', 'snowman'].includes(k) ? 1 : 1.35);
      let pos, wall = false;
      const take = list => list.length ? list.shift() : null;
      if (k === 'sleigh') pos = slots.big.shift();
      else if (k === 'woodBasket' && fire) pos = [1.9, RD - 0.9];
      else if (k === 'churchBell') pos = [0, RH - 1.25, 5.5];
      else if (WALL_ITEMS.has(k)) { const s = take(slots.wall); if (s) { pos = [s[0], s[1] - h / 2, s[2]]; wall = true; } }
      else if (!FLOOR_ITEMS.has(k) && k !== 'deer' && slots.table.length) { const s = take(slots.table); pos = [s[0], s[2], s[1]]; }
      if (!pos) { const s = take(slots.floor) || [((i * 1.7) % 6) - 3, 2 + (i % 3)]; pos = [s[0], 0, s[1]]; }
      if (pos.length === 2) pos = [pos[0], 0, pos[1]];
      const img = pr.svg ? svgImage(pr.svg) : textImage(pr.emoji, true);
      const o = { i, img, p: pos, h: k === 'sleigh' ? 1.9 : h, key: k, wall, prop: true, anim: {} };
      if (k === 'oven') fire = { p: [pos[0], 0.15, pos[2] - 0.3], w: 0.9, h: 0.6, inside: true };
      if (FLOOR_ITEMS.has(k) || k === 'sleigh' || k === 'deer') blocks.push([pos[0] - 0.4 * (k === 'sleigh' ? 4 : 1), pos[0] + 0.4 * (k === 'sleigh' ? 4 : 1), pos[2] - 0.4, pos[2] + 0.4]);
      return o;
    });
    if (npc) {
      const pos = kind === 'stable' ? [2.2, 0, 4.8] : [2.4, 0, 5.6];
      objs.push({ i: -1, img: svgImage(npc.svg), p: pos, h: npc.h, npc: true, anim: {} });
      blocks.push([pos[0] - 0.4, pos[0] + 0.4, pos[2] - 0.3, pos[2] + 0.3]);
    }
    bills.forEach(b => { if (b.img.art) { const a = Art.propArt('', 'deer'); b.img = svgImage(a.svg); } });
    // The house gets more Christmassy as December goes on
    if (day >= 5) bills.push({ img: wreathImage(), p: [-1.9, 2.6, RD - 0.04], h: 0.85 });
    if (day >= 9 && kind !== 'stable') {
      bills.push({ img: artImg(Art.bigTree(0, 0, 1), '-75 -175 150 190'), p: [-RW + 0.85, 0, RD - 0.8], h: 2.5 });
      blocks.push([-RW, -RW + 1.6, RD - 1.6, RD]);
    }
    if (day >= 13) for (let z = 0.4; z < RD; z += 0.45) [-RW + 0.04, RW - 0.04].forEach((x, s) => lights.push({ p: [x, RH - 0.45 - Math.abs(Math.sin(z * 1.3)) * 0.25, z], c: ['#ff5f5f', '#ffd36b', '#5ec8ff', '#7ee08a'][Math.round(z * 2.2 + s) % 4] }));
    if (day >= 17 && kind !== 'stable') { const g = Art.propArt('🎁'); if (g) bills.push({ img: svgImage(g.svg), p: [-RW + 1.5, 0, RD - 1.6], h: 0.55 }); }
    if (day >= 21) [[-2, 2.7, 3], [1.5, 2.9, 4.5], [-0.5, 2.8, 6.5], [3, 2.7, 2.5]].forEach(([x, y, z]) => bills.push({ img: textImage('⭐', true), p: [x, y, z], h: 0.35, spin: true }));
    return { hull, decals, lines, solids, bills, objs, blocks, fire, win, lights, bounds: [-RW + 0.6, RW - 0.6, 0.6, RD - 0.6] };
  }

  // ---------- outdoor places and the ice cave ----------
  const OUT_KINDS = ['outdoor', 'forest', 'ice'];
  const SKY = { by: ['#0b1a3a', '#24406e', '#5a6fa3'], skov: ['#06180f', '#123a2a', '#2d5a49'] };
  const circle = (cx, cz, rx, rz, y, n = 32) => Array.from({ length: n }, (_, j) => { const a = (j / n) * Math.PI * 2; return [cx + Math.cos(a) * rx, y, cz + Math.sin(a) * rz]; });
  function npcImage(id) {
    const n = typeof Avatar !== 'undefined' && Avatar.NPC[id];
    return n ? svgImage(Avatar.svg(n.look, n.equip, { expr: 'happy' })) : null;
  }
  const OAK = `<ellipse cx="100" cy="254" rx="80" ry="7" fill="#000" opacity=".22"/>
    <path d="M74 150 Q60 120 30 100 M74 150 Q90 110 80 70 M128 150 Q150 120 176 96 M128 150 Q112 110 124 64" stroke="#5a3a22" stroke-width="20" fill="none" stroke-linecap="round"/>
    <path d="M30 100 Q20 80 8 74 M30 100 Q34 76 40 58 M80 70 Q70 40 58 22 M80 70 Q96 44 104 28 M124 64 Q130 36 146 18 M176 96 Q190 80 198 70 M176 96 Q180 72 172 54" stroke="#5a3a22" stroke-width="8" fill="none" stroke-linecap="round"/>
    <path d="M30 96 Q20 77 8 70 M30 96 Q34 73 40 54 M80 66 Q70 37 58 18 M80 66 Q96 41 104 24 M124 60 Q130 33 146 14 M176 92 Q190 77 198 66" stroke="#fff" stroke-width="3" fill="none" stroke-linecap="round"/>
    <path d="M62 256 Q80 190 74 140 L130 140 Q120 190 140 256Z" fill="#6b4423"/><path d="M104 140 Q112 200 126 256 H140 Q120 190 130 140Z" fill="#000" opacity=".15"/>
    ${[84, 96, 110, 120].map((x, i) => `<path d="M${x} ${150 + i * 6} q${i % 2 ? 4 : -4} 30 0 ${60 + i * 6}" stroke="#4a2e1a" stroke-width="2.5" fill="none"/>`).join('')}
    <ellipse cx="100" cy="200" rx="17" ry="25" fill="#1a0f08" stroke="#4a2e1a" stroke-width="4"/><circle cx="94" cy="194" r="3" fill="#ffd36b"/><circle cx="106" cy="194" r="3" fill="#ffd36b"/>
    <path d="M62 256 Q100 246 140 256" stroke="#fff" stroke-width="6" fill="none"/>`;
  const DEN = `<ellipse cx="120" cy="146" rx="118" ry="6" fill="#000" opacity=".2"/>
    <path d="M4 146 Q20 40 120 30 Q220 40 236 146Z" fill="#8a7a6a"/><path d="M4 146 Q20 40 120 30 Q160 34 190 56 Q120 50 60 146Z" fill="#a89888" opacity=".6"/>
    <path d="M30 80 Q60 30 120 28 Q190 32 214 84 Q190 70 170 76 Q150 60 120 66 Q90 56 70 72 Q50 66 30 80Z" fill="#f4f9ff"/>
    <path d="M84 146 Q84 92 120 88 Q156 92 156 146Z" fill="#1a0f08"/><ellipse cx="120" cy="132" rx="26" ry="12" fill="#ffb347" opacity=".35"/>
    <rect x="166" y="104" width="44" height="22" rx="3" fill="#6b4423" stroke="#e8b84a"/><text x="188" y="120" font-size="13" font-weight="800" text-anchor="middle" fill="#ffe8b0" font-family="sans-serif">RAVN</text>`;

  const NPC_ART = {
    raev: ['0 0 120 140', `<ellipse cx="60" cy="136" rx="40" ry="5" fill="#000" opacity=".2"/>
      <path d="M86 128 Q122 120 112 82 Q106 104 84 112Z" fill="#e8742a"/><path d="M112 82 Q118 96 108 106 Q104 92 112 82Z" fill="#fff"/>
      <path d="M34 134 Q30 90 46 70 L74 70 Q90 90 86 134Z" fill="#e8742a"/><path d="M48 134 Q46 96 60 84 Q74 96 72 134Z" fill="#fff4e6"/>
      <ellipse cx="48" cy="133" rx="8" ry="4" fill="#3a2416"/><ellipse cx="72" cy="133" rx="8" ry="4" fill="#3a2416"/>
      <path d="M30 40 L36 8 L52 28 L68 28 L84 8 L90 40 Q90 64 60 76 Q30 64 30 40Z" fill="#e8742a"/><path d="M38 14 L48 28 L40 30Z M82 14 L72 28 L80 30Z" fill="#3a2416"/>
      <path d="M30 44 Q40 60 60 76 Q46 62 44 50Z M90 44 Q80 60 60 76 Q74 62 76 50Z" fill="#fff4e6"/>
      <path d="M48 56 Q60 74 72 56 Q60 62 48 56Z" fill="#fff4e6"/><ellipse cx="60" cy="66" rx="4" ry="3" fill="#2a1a10"/>
      <circle cx="48" cy="44" r="3.5" fill="#2a1a10"/><circle cx="72" cy="44" r="3.5" fill="#2a1a10"/>
      <circle cx="48" cy="44" r="8" fill="none" stroke="#3a2a20" stroke-width="2.5"/><circle cx="72" cy="44" r="8" fill="none" stroke="#3a2a20" stroke-width="2.5"/><path d="M56 44 H64" stroke="#3a2a20" stroke-width="2.5"/>
      <path d="M40 72 Q60 82 80 72 L80 80 Q60 90 40 80Z" fill="#2f6db0"/><path d="M70 80 L76 100 L66 98Z" fill="#2f6db0"/>`],
    drage: ['0 0 220 200', `<ellipse cx="110" cy="194" rx="90" ry="7" fill="#000" opacity=".2"/>
      <path d="M150 180 Q210 176 206 130 Q200 150 170 160Z" fill="#7fc6e8"/><path d="M206 130 l8 -10 l-2 14z" fill="#b8f0ff"/>
      <path d="M70 92 Q20 40 8 80 Q30 76 34 96 Q46 86 56 106Z" fill="#a8dcf2" stroke="#5fa8d0" stroke-width="2"/><path d="M150 92 Q200 40 212 80 Q190 76 186 96 Q174 86 164 106Z" fill="#a8dcf2" stroke="#5fa8d0" stroke-width="2"/>
      <ellipse cx="110" cy="140" rx="52" ry="50" fill="#7fc6e8"/><ellipse cx="110" cy="148" rx="32" ry="38" fill="#e6f8ff"/><path d="M86 128 H134 M84 144 H136" stroke="#b8dff0" stroke-width="3"/>
      <ellipse cx="80" cy="188" rx="18" ry="8" fill="#5fa8d0"/><ellipse cx="140" cy="188" rx="18" ry="8" fill="#5fa8d0"/>
      <rect x="92" y="152" width="36" height="26" rx="3" fill="#c8102e"/><path d="M110 152 V178" stroke="#7a0a1a" stroke-width="2"/><ellipse cx="90" cy="162" rx="9" ry="7" fill="#7fc6e8"/><ellipse cx="130" cy="162" rx="9" ry="7" fill="#7fc6e8"/>
      <path d="M88 42 Q80 20 70 16 Q84 22 96 38Z M132 42 Q140 20 150 16 Q136 22 124 38Z" fill="#fff3c4"/><path d="M104 38 l6 -12 l6 12z" fill="#b8f0ff"/>
      <ellipse cx="110" cy="70" rx="40" ry="34" fill="#7fc6e8"/><ellipse cx="110" cy="86" rx="26" ry="15" fill="#a8dcf2"/>
      <circle cx="101" cy="83" r="2.5" fill="#3a5a7a"/><circle cx="119" cy="83" r="2.5" fill="#3a5a7a"/><path d="M98 93 Q110 101 122 93" stroke="#3a5a7a" stroke-width="2.5" fill="none" stroke-linecap="round"/>
      <ellipse cx="94" cy="62" rx="7" ry="8" fill="#fff"/><ellipse cx="126" cy="62" rx="7" ry="8" fill="#fff"/><circle cx="95" cy="63" r="4" fill="#1d2f4a"/><circle cx="125" cy="63" r="4" fill="#1d2f4a"/>
      <circle cx="96" cy="61" r="1.4" fill="#fff"/><circle cx="126" cy="61" r="1.4" fill="#fff"/><circle cx="84" cy="76" r="5" fill="#ff9ad5" opacity=".5"/><circle cx="136" cy="76" r="5" fill="#ff9ad5" opacity=".5"/>`],
  };

  function buildOutdoor(kind, place, props, npc, day) {
    const hull = [], decals = [], solids = [], bills = [], blocks = [], lines = [], lights = [], glows = [], flies = [];
    const { face, box } = makeBox(solids, blocks);
    let seed = place.length * 97 + 13;
    const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
    const ice = kind === 'ice', forest = kind === 'forest';
    const inside = (x, z) => Math.abs(x) < 9 && z > -1 && z < 16;
    const tree = (x, z, h, col = '#1d4a33', y = 0) => {
      bills.push({ img: artImg(Art.pine(0, 0, 1, col), '-60 -120 120 132'), p: [x, y, z], h });
      if (inside(x, z) && !y) blocks.push([x - 0.45, x + 0.45, z - 0.45, z + 0.45]);
    };
    const lamp = (x, z) => {
      box(x - 0.06, x + 0.06, 0, 2.2, z - 0.06, z + 0.06, '#2a2a33', { block: false });
      box(x - 0.17, x + 0.17, 2.2, 2.55, z - 0.17, z + 0.17, '#ffe7a0', { block: false, top: '#3a2a20' });
      glows.push({ p: [x, 2.4, z], r: 1.8, c: '255,220,140' });
      blocks.push([x - 0.2, x + 0.2, z - 0.2, z + 0.2]);
    };
    let bounds = [-8, 8, 0.6, 14.5], spots = [[-2.6, 4.4], [3.4, 5.2], [-1, 6.4], [-4, 7], [3.6, 7.4], [0.9, 8.2]], npcAt = [1.6, 0, 3.4];
    if (ice) {
      const W = 6, D = 13, Hh = 5;
      hull.push({ pts: [[-W, 0, 0], [W, 0, 0], [W, 0, D], [-W, 0, D]], col: '#cfeeff' });
      hull.push({ pts: [[-W, Hh, 0], [-W, Hh, D], [W, Hh, D], [W, Hh, 0]], col: '#3d6f9a' });
      hull.push({ pts: [[-W, 0, D], [W, 0, D], [W, Hh, D], [-W, Hh, D]], col: '#8cc4ea', grad: true });
      hull.push({ pts: [[-W, 0, 0], [-W, 0, D], [-W, Hh, D], [-W, Hh, 0]], col: '#6aa3d0', grad: true });
      hull.push({ pts: [[W, 0, D], [W, 0, 0], [W, Hh, 0], [W, Hh, D]], col: '#5f97c6', grad: true });
      hull.push({ pts: [[W, 0, 0], [-W, 0, 0], [-W, Hh, 0], [W, Hh, 0]], col: '#5a8fbf', grad: true });
      for (let i = 0; i < 80; i++) { const x = -W + rnd() * 2 * W, z = rnd() * D, l = 0.3 + rnd() * 1; lines.push([[x, Hh, z], [x, Hh - l, z], 'rgba(230,248,255,.85)', 0.07]); }
      for (let i = 0; i < 40; i++) { const x = -W + rnd() * 2 * W, z = rnd() * D; lines.push([[x, 0.01, z], [x + (rnd() - 0.5) * 1.6, 0.01, z + (rnd() - 0.5) * 1.6], 'rgba(255,255,255,.7)']); }
      [[-5, 3], [-5.2, 7], [-4.8, 11], [5, 2.5], [5.1, 6.5], [4.9, 10.5], [-2.5, 12.2], [2.6, 12.2]].forEach(([x, z], k) => {
        bills.push({ img: artImg(Art.crystal(0, 0, 1, false), '-30 -90 64 96'), p: [x, 0, z], h: 1.4 + (k % 3) * 0.7 });
        glows.push({ p: [x, 1, z], r: 1.8, c: '140,220,255' });
        blocks.push([x - 0.6, x + 0.6, z - 0.6, z + 0.6]);
      });
      glows.push({ p: [0, 4, 7], r: 3.5, c: '170,235,255' });
      for (let k = 0; k < 40; k++) flies.push({ c: [-4 + rnd() * 8, 0.6 + rnd() * 3, 2 + rnd() * 10], ph: rnd() * 9, col: '200,245,255' });
      bounds = [-W + 0.7, W - 0.7, 0.6, D - 1];
    } else {
      hull.push({ pts: [[-300, 0, -200], [300, 0, -200], [300, 0, 300], [-300, 0, 300]], col: forest ? '#dbe8e2' : '#e3edf7' });
      decals.push({ pts: [[-1, 0.004, -2], [1, 0.004, -2], [1.4, 0.004, 14], [-1.4, 0.004, 14]], col: forest ? '#cddcd4' : '#d2deea' });
      for (let i = 0; i < 22; i++) { const x = -9 + rnd() * 18, z = rnd() * 16, r = 0.6 + rnd() * 1.3; decals.push({ pts: circle(x, z, r, r * 0.6, 0.006, 12), col: '#f6fbff' }); }
      for (let k = 0; k < 10; k++) { const a = (k / 10) * Math.PI * 2 + 0.2; bills.push({ img: artImg(Art.mountain(0, 0, 300, 160), '-150 -160 300 160'), p: [Math.sin(a) * 75, 0, 7 + Math.cos(a) * 75], h: 16 + (k % 3) * 7 }); }
      for (let k = 0; k < (forest ? 60 : 44); k++) { const a = rnd() * Math.PI * 2, r = (forest ? 9.5 : 13) + rnd() * 16; tree(Math.sin(a) * r, 7 + Math.cos(a) * r, 3.2 + rnd() * 3.4, forest && k % 2 ? '#174030' : '#1d4a33'); }
      if (forest) {
        for (let k = 0; k < 12; k++) { const x = (rnd() < 0.5 ? -1 : 1) * (3.6 + rnd() * 4), z = 2 + rnd() * 12; tree(x, z, 3 + rnd() * 2.5, '#174030'); }
        ['#5ec8ff', '#b07cff', '#7ee08a', '#ff7fd0'].forEach((c, k) => [[-2.8, 9.5], [3.2, 9], [-5.5, 5], [5.8, 11]].slice(k, k + 1).forEach(([x, z]) => {
          bills.push({ img: artImg(Art.mushroom(0, 0, 1, c), '-28 -48 56 50'), p: [x, 0, z], h: 0.6 });
          glows.push({ p: [x, 0.4, z], r: 1, c: c === '#5ec8ff' ? '94,200,255' : c === '#b07cff' ? '176,124,255' : c === '#7ee08a' ? '126,224,138' : '255,127,208' });
        }));
        for (let k = 0; k < 36; k++) flies.push({ c: [-6 + rnd() * 12, 0.5 + rnd() * 3, 3 + rnd() * 11], ph: rnd() * 9, col: '255,240,150' });
      }
      if (place === 'kanebakke') {
        const top = 4, z0 = 8.5, z1 = 15;
        for (let k = 0; k < 6; k++) {
          const a = k / 6, b = (k + 1) / 6, za = z0 + a * (z1 - z0), zb = z0 + b * (z1 - z0);
          face([[-6, a * top, za], [6, a * top, za], [6, b * top, zb], [-6, b * top, zb]], ['#d6e2ef', '#dde8f3', '#e4eef7', '#ebf3fa', '#f1f7fc', '#f7fbff'][k], [0, 0.85, -0.53], { soft: true });
        }
        face([[-6, top, z1], [6, top, z1], [6, top, 26], [-6, top, 26]], '#eaf2fb', [0, 1, 0]);
        face([[-6, 0, z0], [-6, top, z1], [-6, top, 26], [-6, 0, 26]], '#c9d8e8', [-1, 0, 0]);
        face([[6, 0, z0], [6, 0, 26], [6, top, 26], [6, top, z1]], '#bccbdc', [1, 0, 0]);
        blocks.push([-6, 6, z0, 26]);
        [-2.5, 2.5].forEach(x => [-0.3, 0.3].forEach(d => lines.push([[x + d, 0.03, z0 - 3], [x + d, 0.03, z0], 'rgba(150,175,205,.8)', 0.05], [[x + d, 0.03, z0], [x + d, top + 0.03, z1], 'rgba(150,175,205,.8)', 0.05])));
        [[-4.5, 17], [-1.5, 19], [2, 18], [4.6, 17.5], [0, 22]].forEach(([x, z]) => tree(x, z, 3.6, '#1d4a33', top));
        const sled = textImage('\ud83d\udef7', true);
        [[-2.5, 0, 'sofus'], [2.5, 2.7, 'pil']].forEach(([x, ph, who]) => {
          const pos = t => { const u = Math.min(1, ((t + ph) % 6) / 4.6), z = z1 - u * (z1 - 4.5); return [x, z > z0 ? ((z - z0) / (z1 - z0)) * top : 0, z]; };
          bills.push({ img: sled, h: 0.65, pos });
          const im = npcImage(who);
          if (im) bills.push({ img: im, h: 1.05, pos: t => { const p = pos(t); return [p[0], p[1] + 0.2, p[2] + 0.05]; } });
        });
        bounds = [-8, 8, 0.6, z0 - 0.6];
        spots = [[-4.5, 4.2], [4.4, 5.4], [-0.2, 6.6], [-5.5, 6.8], [5.6, 7], [0.9, 7.6]];
      } else if (place === 'skoejte') {
        decals.push({ pts: circle(0, 8.5, 6.6, 4.6, 0.005), col: '#f8fcff' });
        decals.push({ pts: circle(0, 8.5, 6.1, 4.1, 0.007), col: '#9fd6f0', stroke: '#ffffff' });
        decals.push({ pts: circle(0, 8.5, 4.6, 3, 0.009), col: '#bfe6f7' });
        for (let i = 0; i < 16; i++) { const x = -4 + rnd() * 8, z = 6.5 + rnd() * 4; lines.push([[x, 0.012, z], [x + 0.8 + rnd(), 0.012, z + 0.3], 'rgba(255,255,255,.75)']); }
        bills.push({ img: textImage('\ud83d\udc27', true), h: 0.8, pos: t => [Math.sin(t * 0.7) * 4, 0, 8.5 + Math.sin(t * 1.4) * 2.3] });
        const fr = npcImage('frida');
        if (fr) bills.push({ img: fr, h: 1.3, pos: t => [Math.cos(t * 0.5 + 2) * 3.4, 0, 8.5 + Math.sin(t * 0.5 + 2) * 2.5] });
        [[-7, 4.5], [7, 4.5], [-7, 12.5], [7, 12.5], [0, 13.6]].forEach(([x, z]) => lamp(x, z));
        box(-7.8, -6.6, 0, 0.45, 7.4, 8.6, '#7a4a22');
        spots = [[-3.4, 3.6], [3.6, 3.8], [-7, 9.6], [5.6, 9.8], [-1.4, 3.4], [7.2, 8]];
      } else if (place === 'julemarked') {
        const stall = (cx, cz, col, goods) => {
          const x0 = cx - 1.2, x1 = cx + 1.2, z0 = cz - 0.5, z1 = cz + 0.5, n = 6, w = (x1 - x0 + 0.4) / n;
          box(x0, x1, 0, 1, z0, z1, '#8a5a2e');
          box(x0, x0 + 0.1, 1, 2.2, z0, z1, '#6b4423', { block: false });
          box(x1 - 0.1, x1, 1, 2.2, z0, z1, '#6b4423', { block: false });
          box(x0, x1, 0, 2.2, z1, z1 + 0.1, '#6b4423');
          for (let k = 0; k < n; k++) {
            const a = x0 - 0.2 + k * w, b = a + w, c = k % 2 ? '#ffffff' : col;
            face([[a, 2.2, z0 - 0.4], [b, 2.2, z0 - 0.4], [b, 2.8, cz + 0.3], [a, 2.8, cz + 0.3]], c, [0, 0.8, -0.6]);
            face([[b, 2.2, z1 + 0.2], [a, 2.2, z1 + 0.2], [a, 2.8, cz + 0.3], [b, 2.8, cz + 0.3]], shade(c, -0.15), [0, 0.8, 0.6]);
          }
          face([[x0 - 0.2, 2.2, z0 - 0.4], [x0 - 0.2, 2.8, cz + 0.3], [x0 - 0.2, 2.2, z1 + 0.2]], shade(col, -0.3), [-1, 0, 0]);
          face([[x1 + 0.2, 2.2, z0 - 0.4], [x1 + 0.2, 2.2, z1 + 0.2], [x1 + 0.2, 2.8, cz + 0.3]], shade(col, -0.3), [1, 0, 0]);
          goods.forEach((e, k) => bills.push({ img: textImage(e, true), p: [cx - 0.6 + k * 0.6, 1, cz - 0.1], h: 0.42 }));
          for (let k = 0; k <= 8; k++) lights.push({ p: [x0 - 0.2 + (k / 8) * (x1 - x0 + 0.4), 2.18, z0 - 0.42], c: ['#ff5f5f', '#ffd36b', '#5ec8ff', '#7ee08a'][k % 4] });
          glows.push({ p: [cx, 1.6, cz - 0.3], r: 1.6, c: '255,210,140' });
        };
        stall(-5, 9, '#c8102e', ['\ud83c\udf6a', '\ud83e\uddc1', '\ud83c\udf6d']);
        stall(-1.8, 11.4, '#1f5d3a', ['\ud83e\udde3', '\ud83e\udde4', '\ud83c\udf85']);
        stall(1.8, 11.4, '#2f6db0', ['\u2615', '\ud83c\udf6b', '\ud83c\udf6a']);
        stall(5, 9, '#c8102e', ['\ud83c\udf30', '\ud83c\udf6c', '\ud83c\udf81']);
        const cx = 0, cz = 7, R = 1.9;
        box(cx - 0.07, cx + 0.07, 0, 2.5, cz - 0.07, cz + 0.07, '#e8b84a', { block: false });
        decals.push({ pts: circle(cx, cz, R, R, 0.02, 24), col: '#a3202e', stroke: '#e8b84a' });
        for (let k = 0; k < 12; k++) {
          const a0 = (k / 12) * Math.PI * 2, a1 = ((k + 1) / 12) * Math.PI * 2, p0 = [cx + Math.cos(a0) * R, 2.5, cz + Math.sin(a0) * R], p1 = [cx + Math.cos(a1) * R, 2.5, cz + Math.sin(a1) * R];
          const am = (a0 + a1) / 2;
          face([p0, p1, [cx, 3.3, cz]], k % 2 ? '#ffffff' : '#c8102e', [Math.cos(am), 0.9, Math.sin(am)]);
          lights.push({ p: [p0[0], 2.47, p0[2]], c: k % 2 ? '#ffd36b' : '#fff3c4' });
        }
        const deer = Art.propArt('\ud83e\udd8c');
        const deerImg = deer ? svgImage(deer.svg) : textImage('\ud83e\udd8c', true);
        for (let k = 0; k < 4; k++) bills.push({ img: deerImg, h: 0.9, pos: t => { const a = t * 0.7 + (k * Math.PI) / 2; return [cx + Math.cos(a) * 1.4, 0.25 + Math.abs(Math.sin(t * 2.4 + k)) * 0.2, cz + Math.sin(a) * 1.4]; } });
        blocks.push([cx - R, cx + R, cz - R, cz + R]);
        glows.push({ p: [cx, 2.2, cz], r: 3, c: '255,200,120' });
        spots = [[-3.4, 4.2], [3.4, 4.4], [-5.2, 6.4], [5.2, 6.6], [-3.4, 9.6], [3.4, 9.6]];
      } else if (place === 'torv') {
        decals.push({ pts: circle(0, 9, 6.8, 6.8, 0.005, 40), col: '#ccd5e1', stroke: '#b5c1d0' });
        for (let r = 1.5; r < 6.8; r += 1.1) decals.push({ pts: circle(0, 9, r, r, 0.006, 36), col: 'rgba(0,0,0,0)', stroke: 'rgba(120,135,160,.35)' });
        [[-8.5, 7, '#8e3b2e'], [-6.5, 14, '#2e5a7a'], [-2.2, 16, '#5b3c88'], [2.6, 16, '#1f5d3a'], [6.6, 14, '#b5652b'], [8.6, 7, '#2f4f8f']].forEach(([x, z, c]) => {
          bills.push({ img: artImg(Art.house(0, 0, 1, c, '#2a1f2f', { wreath: day >= 5 }), '-56 -152 112 160'), p: [x, 0, z], h: 4.6 });
          blocks.push([x - 1.6, x + 1.6, z - 0.8, z + 0.8]);
        });
        [[-4.6, 4], [4.6, 4], [-5.4, 12.6], [5.4, 12.6]].forEach(([x, z]) => lamp(x, z));
        blocks.push([-1.3, 1.3, 7.7, 10.3]);
        glows.push({ p: [0, 3.5, 9], r: 5, c: '255,215,140' });
        spots = [[-2.6, 5.2], [2.8, 5.4], [-3.6, 7.4], [3.8, 8], [-2.4, 11.6], [2.4, 11.8]];
      } else if (place === 'eg') {
        bills.push({ img: artImg(OAK, '0 0 200 262'), p: [0, 0, 11], h: 7.5 });
        blocks.push([-1.3, 1.3, 10.2, 11.8]);
        spots = [[-2.6, 5], [2.8, 5.4], [-1.2, 7.4], [-3.4, 8.6], [2.4, 8.4], [0.8, 9]];
      } else if (place === 'raev') {
        bills.push({ img: artImg(DEN, '0 0 240 150'), p: [0, 0, 10.6], h: 3.2 });
        blocks.push([-2.6, 2.6, 9.8, 11.4]);
        glows.push({ p: [0, 0.7, 10.2], r: 2, c: '255,180,100' });
        spots = [[-2.6, 5], [2.8, 5.4], [-1.2, 7.4], [-3.4, 8.6], [2.4, 8.4], [0.8, 8.6]];
      }
    }
    // the place's things
    const objs = props.map((pr, i) => {
      const k = pr.key;
      if (place === 'torv' && pr.emoji === '\ud83c\udf84') return { i, img: artImg(Art.bigTree(0, 0, 1), '-75 -175 150 190'), p: [0, 0, 9], h: 8, key: k, prop: true, anim: {} };
      const s = spots[i % spots.length], h = (HEIGHT[k] || 0.45) * (['snowman', 'deer'].includes(k) ? 1.1 : 1.6);
      const img = pr.svg ? svgImage(pr.svg) : textImage(pr.emoji, true);
      return { i, img, p: [s[0], 0, s[1]], h, key: k, prop: true, anim: {} };
    });
    if (npc) {
      const img = npc.art ? artImg(NPC_ART[npc.art][1], NPC_ART[npc.art][0]) : npc.emoji ? textImage(npc.emoji, true) : svgImage(npc.svg);
      objs.push({ i: -1, img, p: npc.art === 'drage' ? [1.8, 0, 6] : npcAt, h: npc.h, npc: true, anim: {} });
    }
    if (place === 'torv' && !objs.some(o => o.h === 8)) bills.push({ img: artImg(Art.bigTree(0, 0, 1), '-75 -175 150 190'), p: [0, 0, 9], h: 8 });
    return { hull, decals, lines, solids, bills, objs, blocks, fire: null, win: null, lights, glows, flies, bounds, outdoor: !ice, ice, sky: SKY[forest ? 'skov' : 'by'] };
  }

  // ---------- running ----------
  let live = null;
  function open(host, o) {
    close();
    host.innerHTML = '<canvas class="r3d"></canvas>';
    const cv = host.querySelector('canvas'), ctx = cv.getContext('2d');
    const S = OUT_KINDS.includes(o.kind) ? buildOutdoor(o.kind, o.place || '', o.props, o.npc, o.day || 1) : build(o.kind, o.props, o.npc, o.day || 1);
    const open3 = S.outdoor || S.ice;
    let W = 800, H = 600, f = 500;
    const resize = () => {
      const dpr = Math.min(1.5, window.devicePixelRatio || 1);
      W = host.clientWidth || 800; H = host.clientHeight || 600;
      cv.width = W * dpr; cv.height = H * dpr; ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      f = Math.max(W, H) * 0.5;
    };
    resize();
    window.addEventListener('resize', resize);
    const cam = { x: 0, z: 1.1, yaw: 0, pitch: S.outdoor ? -0.04 : -0.12, tx: null, tz: null };
    const st = { t: 0, roar: 0, fly: [], float: [], hits: [] };
    let R, F, C, cp, sp;
    const setCam = () => { R = [Math.cos(cam.yaw), 0, -Math.sin(cam.yaw)]; F = [Math.sin(cam.yaw), 0, Math.cos(cam.yaw)]; C = [cam.x, EYE, cam.z]; cp = Math.cos(cam.pitch); sp = Math.sin(cam.pitch); };
    const toCam = q => { const d = sub(q, C), x = dot(d, R), y = d[1], z = dot(d, F); return [x, y * cp - z * sp, y * sp + z * cp]; };
    const proj = c => [W / 2 + (f * c[0]) / c[2], H / 2 - (f * c[1]) / c[2]];
    const clipPoly = poly => {
      const out = [];
      for (let i = 0; i < poly.length; i++) {
        const a = poly[i], b = poly[(i + 1) % poly.length];
        if (a[2] >= NEAR) out.push(a);
        if ((a[2] >= NEAR) !== (b[2] >= NEAR)) { const t = (NEAR - a[2]) / (b[2] - a[2]); out.push(add(a, mul(sub(b, a), t))); }
      }
      return out;
    };
    const path = pts => { const c = clipPoly(pts.map(toCam)); if (c.length < 3) return null; const s = c.map(proj); ctx.beginPath(); s.forEach(([x, y], i) => (i ? ctx.lineTo(x, y) : ctx.moveTo(x, y))); ctx.closePath(); return { s, z: c.reduce((a, q) => a + q[2], 0) / c.length }; };
    const fogRgb = S.outdoor ? '30,45,85' : S.ice ? '25,60,110' : '12,6,2';
    const fog = (z) => (z > (S.outdoor ? 8 : 3) ? `rgba(${fogRgb},${Math.min(S.outdoor ? 0.55 : 0.45, (z - (S.outdoor ? 8 : 3)) * (S.outdoor ? 0.025 : 0.05)).toFixed(3)})` : null);
    const seg = (a, b, col, w) => {
      let p = toCam(a), q = toCam(b);
      if (p[2] < NEAR && q[2] < NEAR) return;
      if (p[2] < NEAR) p = add(p, mul(sub(q, p), (NEAR - p[2]) / (q[2] - p[2])));
      if (q[2] < NEAR) q = add(q, mul(sub(p, q), (NEAR - q[2]) / (p[2] - q[2])));
      const [x1, y1] = proj(p), [x2, y2] = proj(q);
      ctx.strokeStyle = col; ctx.lineWidth = w ? Math.max(1, (f * w) / ((p[2] + q[2]) / 2)) : 1.5;
      ctx.beginPath(); ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
    };
    const bb = (o, extraY = 0) => {
      const a = toCam([o.p[0], o.p[1] + extraY, o.p[2]]), b = toCam([o.p[0], o.p[1] + extraY + o.h, o.p[2]]);
      if (a[2] < 0.15 || b[2] < 0.15) return null;
      const [x, y0] = proj(a), [, y1] = proj(b), hp = y0 - y1, wp = hp * (o.img.aspect || 1);
      return { x: x - wp / 2, y: y1, w: wp, h: hp, z: a[2] };
    };
    function drawFire(z) {
      const F0 = S.fire, r = 1 + st.roar * 0.9;
      const base = toCam(F0.p);
      if (base[2] < 0.15) return;
      const [x, y] = proj(base), s = f / base[2];
      const g = ctx.createRadialGradient(x, y - s * 0.3, 0, x, y - s * 0.3, s * (1.6 + st.roar));
      g.addColorStop(0, `rgba(255,190,90,${0.35 + st.roar * 0.25})`); g.addColorStop(1, 'rgba(255,140,40,0)');
      ctx.fillStyle = g; ctx.fillRect(x - s * 3, y - s * 3, s * 6, s * 4);
      if (F0.inside) return;
      for (let k = 0; k < 5; k++) {
        const fx = x + (k - 2) * s * F0.w * 0.16, fh = s * F0.h * r * (0.55 + 0.45 * Math.abs(Math.sin(st.t * 7 + k * 1.7)));
        ctx.fillStyle = k % 2 ? '#ffd36b' : '#ff8a2a';
        ctx.beginPath(); ctx.moveTo(fx - s * 0.12, y); ctx.quadraticCurveTo(fx - s * 0.1, y - fh * 0.5, fx, y - fh); ctx.quadraticCurveTo(fx + s * 0.1, y - fh * 0.5, fx + s * 0.12, y); ctx.fill();
      }
      ctx.fillStyle = '#5a3418';
      ctx.fillRect(x - s * 0.4, y - s * 0.05, s * 0.8, s * 0.08);
    }
    function frontDecor(sf) {
      const [p0, p1, , p3] = sf.pts;
      const ux = sub(p1, p0), uy = sub(p3, p0), L = Math.hypot(...ux), Hh = Math.hypot(...uy);
      const at = (u, v) => add(add(p0, mul(ux, u)), mul(uy, v));
      for (const d of sf.front) {
        if (d.opening) {
          const pp = path([at(0.2, 0), at(0.8, 0), at(0.8, 0.62), at(0.2, 0.62)].map(q => [q[0], q[1], q[2] - 0.01]));
          if (pp) { ctx.fillStyle = '#1a0f08'; ctx.fill(); }
        } else {
          const u0 = (d.x - Math.min(p0[0], p1[0])) / L, u1 = u0 + d.w / L, v0 = d.y / Hh, v1 = v0 + d.h / Hh;
          const q = [at(u0, v0), at(u1, v0), at(u1, v1), at(u0, v1)].map(t => [t[0], t[1], t[2] - 0.01]);
          if (path(q)) { ctx.fillStyle = d.c; ctx.fill(); }
        }
      }
    }
    // Night sky with stars, moon and northern lights; fixed in world directions
    const skyStars = Array.from({ length: 140 }, (_, k) => [((k * 2.399) % (Math.PI * 2)), 0.05 + ((k * 0.618) % 1) * 1.2, (k % 3) + 1]);
    const dirCam = d => { const x = dot(d, R), y = d[1], z = dot(d, F); return [x, y * cp - z * sp, y * sp + z * cp]; };
    const dirOf = (a, e) => [Math.sin(a) * Math.cos(e), Math.sin(e), Math.cos(a) * Math.cos(e)];
    function drawSky() {
      const hz = dirCam([F[0], 0, F[2]]), hy = hz[2] > 0 ? H / 2 - (f * hz[1]) / hz[2] : H / 2;
      const g = ctx.createLinearGradient(0, 0, 0, Math.max(10, hy));
      g.addColorStop(0, S.sky[0]); g.addColorStop(0.65, S.sky[1]); g.addColorStop(1, S.sky[2]);
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
      for (const [a, e, s] of skyStars) {
        const c = dirCam(dirOf(a, e)); if (c[2] <= 0.05) continue;
        const [x, y] = proj(c); if (y > hy) continue;
        ctx.globalAlpha = 0.45 + 0.55 * Math.abs(Math.sin(st.t * 1.3 + a * 7)); ctx.fillStyle = '#fff'; ctx.fillRect(x, y, s * 0.8, s * 0.8);
      }
      ctx.globalAlpha = 1;
      // northern lights: soft bands that wave slowly
      [['94,240,192', 0], ['138,108,255', 1.7], ['255,127,208', 3.1]].forEach(([col, ph], b) => {
        ctx.beginPath(); let started = false;
        for (let k = 0; k <= 40; k++) {
          const a = -1.4 + (k / 40) * 2.8 + 0.3, e = 0.45 + b * 0.08 + Math.sin(k * 0.35 + st.t * 0.4 + ph) * 0.08;
          const c = dirCam(dirOf(a, e)); if (c[2] <= 0.05) { started = false; continue; }
          const [x, y] = proj(c); if (!started) { ctx.moveTo(x, y); started = true; } else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(${col},${(0.16 + 0.08 * Math.sin(st.t * 0.7 + ph)).toFixed(3)})`; ctx.lineWidth = f * 0.12; ctx.lineCap = 'round'; ctx.stroke();
      });
      const mc = dirCam(dirOf(0.7, 0.5));
      if (mc[2] > 0.05) {
        const [x, y] = proj(mc), r = f * 0.05;
        const mg = ctx.createRadialGradient(x, y, r * 0.5, x, y, r * 4); mg.addColorStop(0, 'rgba(255,248,220,.5)'); mg.addColorStop(1, 'rgba(255,248,220,0)');
        ctx.fillStyle = mg; ctx.fillRect(x - r * 4, y - r * 4, r * 8, r * 8);
        ctx.fillStyle = '#fff8e0'; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
      }
    }
    const flakes = Array.from({ length: 90 }, (_, k) => [((k * 137) % 1000) / 1000, ((k * 89) % 1000) / 1000, 1 + (k % 3), 0.04 + (k % 5) * 0.012]);
    function render() {
      setCam();
      if (S.outdoor) drawSky();
      else { const g = ctx.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#1a0f0a'); g.addColorStop(1, '#2a1a10'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H); }
      for (const p of S.hull) {
        const pp = path(p.pts); if (!pp) continue;
        if (p.grad) { const sy = pp.s.map(q => q[1]), gg = ctx.createLinearGradient(0, Math.min(...sy), 0, Math.max(...sy)); gg.addColorStop(0, shade(p.col, -0.35)); gg.addColorStop(1, p.col); ctx.fillStyle = gg; }
        else ctx.fillStyle = p.col;
        ctx.fill();
      }
      ctx.lineCap = 'round';
      for (const [a, b, col, w] of S.lines) seg(a, b, col, w ?? (col === '#e8c860' ? 0.03 : 0));
      for (const d of S.decals) {
        const pp = path(d.pts); if (!pp) continue;
        ctx.fillStyle = d.col; ctx.fill();
        if (d.stroke) { ctx.strokeStyle = d.stroke; ctx.lineWidth = Math.max(2, f * 0.05 / pp.z); ctx.stroke(); }
        if (d.window) {
          const w = d.window, X = -RW + 0.03;
          for (let k = 0; k < 14; k++) { const z = w.z0 + 0.1 + ((k * 0.37) % 1) * (w.z1 - w.z0 - 0.2), y = w.y0 + 0.5 + ((k * 0.61) % 1) * (w.y1 - w.y0 - 0.6); const c = toCam([X, y, z]); if (c[2] > NEAR) { const [sx, sy] = proj(c); ctx.fillStyle = `rgba(255,255,255,${0.5 + 0.5 * Math.abs(Math.sin(st.t * 2 + k))})`; ctx.fillRect(sx, sy, 2, 2); } }
          const snow = path([[X, w.y0, w.z0], [X, w.y0, w.z1], [X, w.y0 + 0.35, w.z1], [X, w.y0 + 0.2, (w.z0 + w.z1) / 2], [X, w.y0 + 0.3, w.z0]]);
          if (snow) { ctx.fillStyle = '#eef6ff'; ctx.fill(); }
          seg([X, w.y0, (w.z0 + w.z1) / 2], [X, w.y1, (w.z0 + w.z1) / 2], '#e8b84a', 0.08);
          seg([X, (w.y0 + w.y1) / 2, w.z0], [X, (w.y0 + w.y1) / 2, w.z1], '#e8b84a', 0.08);
          [[w.z0, w.y0, w.z1, w.y0], [w.z1, w.y0, w.z1, w.y1], [w.z1, w.y1, w.z0, w.y1], [w.z0, w.y1, w.z0, w.y0]].forEach(([z0, y0, z1, y1]) => seg([X, y0, z0], [X, y1, z1], '#e8b84a', 0.12));
        }
      }
      // garland along the back wall
      const gp = [];
      if (!open3) for (let i = 0; i <= 20; i++) { const x = -RW + (i / 20) * 2 * RW; gp.push([x, RH - 0.35 - Math.sin(((i % 5) / 5) * Math.PI) * 0.35, RD - 0.05]); }
      for (let i = 0; i < gp.length - 1; i++) seg(gp[i], gp[i + 1], '#1f5d3a', 0.14);
      gp.forEach((q, i) => { if (i % 2) return; const c = toCam(q); if (c[2] < NEAR) return; const [x, y] = proj(c); ctx.fillStyle = ['#ff5f5f', '#ffd36b', '#5ec8ff'][(i / 2) % 3]; ctx.globalAlpha = 0.6 + 0.4 * Math.abs(Math.sin(st.t * 2 + i)); ctx.beginPath(); ctx.arc(x, y + (f * 0.06) / c[2], Math.max(2, (f * 0.06) / c[2]), 0, 7); ctx.fill(); ctx.globalAlpha = 1; });

      // everything inside, far to near
      const list = [];
      for (const sf of S.solids) {
        const ctr = mul(sf.pts.reduce((a, q) => add(a, q), [0, 0, 0]), 1 / sf.pts.length);
        if (dot(sf.n, sub(C, ctr)) <= 0) continue;
        const c = toCam(ctr);
        list.push({ z: c[2], draw: () => { const pp = path(sf.pts); if (!pp) return; ctx.fillStyle = sf.col; ctx.fill(); const fg = fog(pp.z); if (fg) { ctx.fillStyle = fg; ctx.fill(); } if (!sf.soft) { ctx.strokeStyle = 'rgba(0,0,0,.25)'; ctx.lineWidth = 1; ctx.stroke(); } else { ctx.strokeStyle = sf.col; ctx.lineWidth = 1; ctx.stroke(); } if (sf.front) frontDecor(sf); } });
      }
      st.hits = [];
      const drawBill = (o, isObj) => {
        const an = o.anim || {};
        if (o.pos) o.p = o.pos(st.t);
        const lift = an.bob ? Math.abs(Math.sin(an.bob * 9)) * 0.06 : 0;
        const r = bb(o, lift); if (!r) return;
        list.push({ z: r.z - (o.wall ? 0.05 : 0), draw: () => {
          if (!o.img.im || (o.img.im.complete === false)) return;
          const sc = an.poke ? 1 + Math.sin((an.poke / 0.4) * Math.PI) * 0.12 : 1;
          ctx.save();
          ctx.translate(r.x + r.w / 2, r.y + r.h);
          if (an.swing) ctx.rotate(Math.sin(an.swing * 18) * 0.12 * Math.min(1, an.swing));
          if (o.flip) ctx.scale(-1, 1);
          if (o.spin) ctx.scale(Math.cos(st.t * 1.5 + o.p[0]), 1);
          ctx.scale(sc, sc);
          if (o.back) ctx.globalAlpha = 0.85;
          ctx.drawImage(o.img.im, -r.w / 2, -r.h, r.w, r.h);
          ctx.restore();
          if (isObj && o.prop && o.shiny) { ctx.fillStyle = '#ffd36b'; ctx.globalAlpha = 0.5 + 0.5 * Math.abs(Math.sin(st.t * 3)); ctx.font = `${Math.max(14, r.h * 0.25)}px serif`; ctx.fillText('\u2726', r.x + r.w, r.y + r.h * 0.15); ctx.globalAlpha = 1; }
        } });
        if (isObj) st.hits.push({ o, r, z: r.z });
      };
      S.bills.forEach(b => drawBill(b, false));
      S.objs.forEach(o => drawBill(o, true));
      for (const lt of S.lights || []) { const c = toCam(lt.p); if (c[2] < 0.15) continue; list.push({ z: c[2] - 0.02, draw: () => { const [x, y] = proj(c), r = Math.max(1.5, (f * 0.045) / c[2]); ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(st.t * 2 + lt.p[0] * 3 + lt.p[2])); ctx.fillStyle = lt.c; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; } }); }
      for (const gl of S.glows || []) { const c = toCam(gl.p); if (c[2] < 0.3) continue; list.push({ z: c[2] + 0.3, draw: () => { const [x, y] = proj(c), r = (f * gl.r) / c[2], gg = ctx.createRadialGradient(x, y, 0, x, y, r); gg.addColorStop(0, `rgba(${gl.c},.42)`); gg.addColorStop(1, `rgba(${gl.c},0)`); ctx.fillStyle = gg; ctx.fillRect(x - r, y - r, r * 2, r * 2); } }); }
      for (const fl of S.flies || []) { const q = [fl.c[0] + Math.sin(st.t * 0.5 + fl.ph) * 0.8, fl.c[1] + Math.sin(st.t * 0.9 + fl.ph * 2) * 0.3, fl.c[2] + Math.cos(st.t * 0.4 + fl.ph) * 0.8], c = toCam(q); if (c[2] < 0.2) continue; list.push({ z: c[2], draw: () => { const [x, y] = proj(c), r = Math.max(1.5, (f * 0.04) / c[2]); ctx.globalAlpha = 0.4 + 0.6 * Math.abs(Math.sin(st.t * 2.5 + fl.ph)); ctx.fillStyle = `rgba(${fl.col},.35)`; ctx.beginPath(); ctx.arc(x, y, r * 3, 0, 7); ctx.fill(); ctx.fillStyle = `rgb(${fl.col})`; ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); ctx.globalAlpha = 1; } }); }
      if (S.fire) { const c = toCam(S.fire.p); if (c[2] > 0.15) list.push({ z: c[2] - (S.fire.inside ? 0.4 : 0.35), draw: () => drawFire() }); }
      for (const fl of st.fly) { const p = add(fl.a, mul(sub(fl.b, fl.a), fl.u)); p[1] += Math.sin(fl.u * Math.PI) * 0.8; const c = toCam(p); if (c[2] > 0.15) list.push({ z: c[2], draw: () => { const [x, y] = proj(c); ctx.font = `${(f * 0.3) / c[2]}px serif`; ctx.textAlign = 'center'; ctx.fillText(fl.e, x, y); } }); }
      for (const fl of st.float) { const c = toCam([fl.p[0], fl.p[1] + fl.t * 0.8, fl.p[2]]); if (c[2] > 0.15) list.push({ z: c[2] - 0.1, draw: () => { const [x, y] = proj(c); ctx.globalAlpha = Math.max(0, 1 - fl.t / 1.6); ctx.font = `${(f * 0.22) / c[2]}px serif`; ctx.textAlign = 'center'; ctx.fillText(fl.e, x, y); ctx.globalAlpha = 1; } }); }
      list.sort((a, b) => b.z - a.z).forEach(it => it.draw());
      // hanging lamp glow and vignette
      const lc = toCam([0, RH - 0.9, 4.5]);
      if (!open3 && lc[2] > 0.2) {
        const [x, y] = proj(lc), s = f / lc[2];
        seg([0, RH, 4.5], [0, RH - 0.8, 4.5], '#3a2416', 0.02);
        const lg = ctx.createRadialGradient(x, y, 0, x, y, s * 2.4); lg.addColorStop(0, 'rgba(255,236,170,.55)'); lg.addColorStop(1, 'rgba(255,200,120,0)');
        ctx.fillStyle = lg; ctx.fillRect(x - s * 2.4, y - s * 2.4, s * 4.8, s * 4.8);
        ctx.fillStyle = '#fff3c4'; ctx.beginPath(); ctx.arc(x, y, Math.max(3, s * 0.12), 0, 7); ctx.fill();
      }
      if (S.outdoor) {
        ctx.fillStyle = 'rgba(255,255,255,.85)';
        for (const [fx0, fy0, s, sp] of flakes) { const x = ((fx0 + Math.sin(st.t * 0.6 + fy0 * 9) * 0.02 - cam.yaw * 0.25) % 1 + 1) % 1, y = (fy0 + st.t * sp) % 1; ctx.beginPath(); ctx.arc(x * W, y * H, s, 0, 7); ctx.fill(); }
      }
      const v = ctx.createRadialGradient(W / 2, H / 2, Math.min(W, H) * 0.35, W / 2, H / 2, Math.max(W, H) * 0.75);
      v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, open3 ? 'rgba(5,10,30,.4)' : 'rgba(10,4,0,.55)');
      ctx.fillStyle = v; ctx.fillRect(0, 0, W, H);
      ctx.textAlign = 'left';
    }
    function update(dt) {
      st.t += dt;
      st.roar = Math.max(0, st.roar - dt * 0.2);
      if (cam.tx !== null) {
        const dx = cam.tx - cam.x, dz = cam.tz - cam.z, d = Math.hypot(dx, dz);
        if (d < 0.05) cam.tx = null;
        else {
          const s = Math.min(d, dt * (S.outdoor ? 3.2 : 2.2)), nx = cam.x + (dx / d) * s, nz = cam.z + (dz / d) * s;
          if (S.blocks.some(([x0, x1, z0, z1]) => nx > x0 - 0.35 && nx < x1 + 0.35 && nz > z0 - 0.35 && nz < z1 + 0.35)) cam.tx = null;
          else { cam.x = nx; cam.z = nz; const want = Math.atan2(dx, dz); let dy = want - cam.yaw; while (dy > Math.PI) dy -= 2 * Math.PI; while (dy < -Math.PI) dy += 2 * Math.PI; cam.yaw += dy * Math.min(1, dt * 2); }
        }
      }
      [...S.objs, ...S.bills].forEach(o => { const a = o.anim || {}; ['poke', 'bob', 'swing'].forEach(k => { if (a[k]) { a[k] -= dt; if (a[k] <= 0) delete a[k]; } }); });
      st.fly = st.fly.filter(fl => { fl.u += dt / 0.8; if (fl.u >= 1) { if (fl.done) fl.done(); return false; } return true; });
      st.float = st.float.filter(fl => (fl.t += dt) < 1.6);
    }
    // input: drag to look around, tap things, tap the floor to walk
    let drag = null;
    const down = e => { drag = { x: e.clientX, y: e.clientY, yaw: cam.yaw, pitch: cam.pitch, moved: false }; cv.setPointerCapture(e.pointerId); };
    const move = e => {
      if (!drag) return;
      const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.hypot(dx, dy) > 12) drag.moved = true;
      if (drag.moved) { cam.yaw = drag.yaw - dx * 0.006; cam.pitch = Math.max(-0.5, Math.min(0.35, drag.pitch + dy * 0.003)); cam.tx = null; }
    };
    const up = e => {
      if (!drag) return;
      const was = drag; drag = null;
      if (was.moved) return;
      const rc = cv.getBoundingClientRect(), sx = e.clientX - rc.left, sy = e.clientY - rc.top;
      // small things get a finger-sized hit area
      const pad = h => [Math.max(0, (56 - h.r.w) / 2), Math.max(0, (56 - h.r.h) / 2)];
      const hit = st.hits.filter(h => { const [px, py] = pad(h); return sx >= h.r.x - px && sx <= h.r.x + h.r.w + px && sy >= h.r.y - py && sy <= h.r.y + h.r.h + py; }).sort((a, b) => a.z - b.z)[0];
      if (hit) {
        hit.o.anim.poke = 0.4;
        const tx = hit.o.p[0], tz = hit.o.p[2], d = Math.hypot(tx - cam.x, tz - cam.z);
        if (d > 2.4) { cam.tx = cam.x + ((tx - cam.x) * (d - 1.8)) / d; cam.tz = cam.z + ((tz - cam.z) * (d - 1.8)) / d; }
        o.onTap(hit.o.i);
        return;
      }
      setCam();
      const x = (sx - W / 2) / f, y = -(sy - H / 2) / f, cy = y * cp + sp, cz = -y * sp + cp;
      const dir = add(add(mul(R, x), [0, cy, 0]), mul(F, cz));
      if (dir[1] >= -0.01) return;
      const t = -EYE / dir[1];
      cam.tx = Math.max(S.bounds[0], Math.min(S.bounds[1], C[0] + dir[0] * t));
      cam.tz = Math.max(S.bounds[2], Math.min(S.bounds[3], C[2] + dir[2] * t));
    };
    cv.addEventListener('pointerdown', down);
    cv.addEventListener('pointermove', move);
    cv.addEventListener('pointerup', up);
    cv.addEventListener('pointercancel', () => { drag = null; });
    let last = performance.now(), raf = 0;
    const loop = now => { const dt = Math.min(0.05, (now - last) / 1000); last = now; update(dt); render(); raf = requestAnimationFrame(loop); };
    raf = requestAnimationFrame(loop);
    const target = t => {
      if (t === 'npc') return S.objs.find(x => x.npc);
      if (t === 'fire') return S.fire ? { p: S.fire.p, h: 0.6 } : null;
      return S.objs.find(x => x.i === t);
    };
    const mid = o => [o.p[0], o.p[1] + (o.h || 0.5) * 0.6, o.p[2]];
    live = {
      close() { cancelAnimationFrame(raf); window.removeEventListener('resize', resize); },
      setShiny(i, on) { const ob = S.objs.find(x => x.i === i); if (ob) ob.shiny = on; },
      fx: {
        fly(from, to, e, done) { const a = target(from), b = target(to); if (!a || !b) { if (done) done(); return; } st.fly.push({ a: mid(a), b: mid(b), u: 0, e, done }); },
        floaters(t, e, n) { const a = target(t); if (!a) return; for (let k = 0; k < n; k++) st.float.push({ p: add(mid(a), [(Math.random() - 0.5) * 0.8, Math.random() * 0.3, 0]), t: -k * 0.12, e }); },
        roar() { st.roar = 1; },
        bob(t) { const a = target(t); if (a && a.anim) a.anim.bob = 1.8; },
        swing(t) { const a = target(t); if (a && a.anim) a.anim.swing = 1.8; },
      },
    };
    return live;
  }
  function close() { if (live) { live.close(); live = null; } }

  return { open, close, supports: kind => KINDS.includes(kind) || OUT_KINDS.includes(kind) };
})();
