// Illustreret nissefigur (SVG) med udstyr, ansigtsudtryk og gang-animation.
// Et foto aflæses på enheden (hår, hud, ansigtsform, øjne, bryn, læber) og bliver til en tegnet nisse. Selve fotoet gemmes aldrig.
const Avatar = (() => {
  function shade(hex, p) {
    const n = parseInt(hex.slice(1), 16); let r = n >> 16, g = (n >> 8) & 255, b = n & 255;
    const t = p < 0 ? 0 : 255, a = Math.abs(p);
    r = Math.round((t - r) * a + r); g = Math.round((t - g) * a + g); b = Math.round((t - b) * a + b);
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
  }
  const item = id => (typeof id === 'string' ? ITEMS[id] : id) || null;

  const SKINS = ['#fbe0cc', '#f3c9a8', '#e7b48f', '#c98d63', '#a26a45', '#6e4630'];
  const HAIRS = ['#f2d27a', '#c8873d', '#8a4f24', '#4a2c18', '#1f1712', '#b23a1e', '#e8e8e8'];
  const EYES = ['#5a3a22', '#8a6a3a', '#2f6db0', '#7aa9c9', '#3c8a52', '#6b6b6b'];
  const HATS = ['#c8102e', '#1f5d3a', '#2f6db0', '#6a3d9a', '#e07a1f', '#d94f8c'];
  const CLOTHES = ['#1f5d3a', '#8e1027', '#2f4f8f', '#5b3c88', '#a0522d', '#2e6f6a'];
  const STYLES = [['buzz', 'Meget kort'], ['short', 'Kort'], ['bob', 'Pagehår'], ['long', 'Langt'], ['ponytail', 'Hestehale'], ['curly', 'Krøllet'], ['pigtails', 'Rottehaler'], ['braid', 'Fletning']];
  const RED = '#c8102e', RED_CLOTHES = '#b3122e', BEARD = '#f3f1ec';
  let maskN = 0;

  const glassesSvg = look => look.glasses ? `<g fill="#fff" fill-opacity=".18" stroke="${look.glasses === true ? '#3a2a20' : look.glasses}" stroke-width="1.8"><circle cx="51" cy="52" r="6.6"/><circle cx="69" cy="52" r="6.6"/><path d="M57.6 51.5 Q60 49.5 62.4 51.5 M44.4 51 L38 49 M75.6 51 L82 49" fill="none"/></g>` : '';

  // The traced hair from a photo: same shape behind the head and as a fringe over the forehead.
  function tracedHair(look, front) {
    const h = look.hair, id = 'th' + (++maskN);
    const grad = `<linearGradient id="${id}g" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${shade(h, 0.14)}"/><stop offset=".6" stop-color="${h}"/><stop offset="1" stop-color="${shade(h, -0.18)}"/></linearGradient>`;
    const shine = `<path d="${look.hairPath}" fill="none" stroke="${shade(h, 0.35)}" stroke-width=".9" stroke-dasharray="5 9" opacity=".45"/>`;
    if (!front) return `<defs>${grad}</defs><path d="${look.hairPath}" fill="url(#${id}g)" fill-rule="evenodd" stroke="${shade(h, -0.3)}" stroke-width="1.1" stroke-linejoin="round"/>${shine}`;
    return `<defs>${grad}<clipPath id="${id}c"><path d="M30 28 H90 V${look.fringeY || 47} H30Z"/></clipPath></defs>
      <g clip-path="url(#${id}c)"><path d="${look.hairPath}" fill="url(#${id}g)" fill-rule="evenodd" stroke="${shade(h, -0.3)}" stroke-width="1.1"/></g>`;
  }
  // Head outline: top half-ellipse plus a jaw that can be rounder or narrower than a circle.
  function headPath(look) {
    const f = look.face || {}, rx = f.rx || 23, ry = f.ry || 23, j = f.jaw || 0.552;
    return `M${60 - rx} 52 A${rx} 23 0 0 1 ${60 + rx} 52 C${60 + rx} ${(52 + ry * 0.552).toFixed(1)} ${(60 + rx * j).toFixed(1)} ${52 + ry} 60 ${52 + ry} C${(60 - rx * j).toFixed(1)} ${52 + ry} ${60 - rx} ${(52 + ry * 0.552).toFixed(1)} ${60 - rx} 52Z`;
  }

  function face(look, expr) {
    const ec = look.eyes || '#5a3a22';
    const eye = (x, y, r = 3.3) => `<circle cx="${x}" cy="${y}" r="${r}" fill="${ec}"/><circle cx="${x}" cy="${y}" r="${r * 0.52}" fill="#1a120c"/><circle cx="${x + 1.1}" cy="${y - 1.2}" r="${r * 0.32}" fill="#fff"/>`;
    const closed = (x, y) => `<path d="M${x - 3.4} ${y} Q${x} ${y - 3.6} ${x + 3.4} ${y}" stroke="#2a1a10" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    const sleepy = (x, y) => `<path d="M${x - 3.4} ${y} Q${x} ${y + 3} ${x + 3.4} ${y}" stroke="#2a1a10" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
    const brow = look.hair || '#4a2c18';
    const bc = look.brow ? look.brow.c : shade(brow, -0.2), bw = look.brow ? look.brow.w : 1.6, lip = look.lips || '#7a2b1a';
    let eyes, mouth, brows = `<path d="M47 45.5 Q51 43.5 55 45.5 M65 45.5 Q69 43.5 73 45.5" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`;
    switch (expr) {
      case 'laugh': eyes = closed(51, 53) + closed(69, 53); mouth = `<path d="M52.5 60 Q60 70 67.5 60 Z" fill="#7a2121"/><path d="M55.5 63.5 Q60 66.5 64.5 63.5" fill="#e86a6a"/>`; break;
      case 'wow': eyes = eye(51, 52, 3.9) + eye(69, 52, 3.9); mouth = `<ellipse cx="60" cy="63" rx="3.2" ry="4" fill="#7a2121"/>`;
        brows = `<path d="M47 43 Q51 40.5 55 43 M65 43 Q69 40.5 73 43" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`; break;
      case 'think': eyes = eye(52.5, 51) + eye(70.5, 51); mouth = `<path d="M56 63 Q60 62 64.5 61" stroke="${lip}" stroke-width="1.8" fill="none" stroke-linecap="round"/>`;
        brows = `<path d="M47 45.5 Q51 44 55 45.5 M65 43 Q69 40.5 73 43.5" stroke="${bc}" stroke-width="${bw}" fill="none" stroke-linecap="round"/>`; break;
      case 'wink': eyes = closed(51, 53) + eye(69, 52); mouth = `<path d="M53 60.5 Q60 67 67 60.5" stroke="${lip}" stroke-width="2" fill="none" stroke-linecap="round"/>`; break;
      case 'sleep': eyes = sleepy(51, 52) + sleepy(69, 52); mouth = `<ellipse cx="60" cy="63" rx="2" ry="1.6" fill="#7a2121"/>`; break;
      default: eyes = `<g class="blink">${eye(51, 52) + eye(69, 52)}</g>`; mouth = `<path d="M53 60.5 Q60 67 67 60.5" stroke="${lip}" stroke-width="2" fill="none" stroke-linecap="round"/>`;
    }
    if (look.brow) brows = `<g transform="translate(0 ${(look.brow.y - 45.5).toFixed(1)})">${brows}</g>`;
    const freckles = look.freckles ? `<g fill="${shade(look.skin, -0.35)}" opacity=".7">${[[44, 56], [47, 58.5], [43, 60], [76, 56], [73, 58.5], [77, 60], [58, 55], [62, 55]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r=".9"/>`).join('')}</g>` : '';
    const glasses = glassesSvg(look);
    return `${brows}${eyes}${glasses}<ellipse cx="60" cy="57.5" rx="3" ry="2.3" fill="${shade(look.skin, -0.16)}"/>
      <circle cx="45" cy="59" r="3.6" fill="#f08a8a" opacity=".45"/><circle cx="75" cy="59" r="3.6" fill="#f08a8a" opacity=".45"/>${freckles}${mouth}`;
  }

  function hairBack(look) {
    const h = look.hair, d = shade(h, -0.2);
    if (look.style === 'traced' && look.hairPath) return tracedHair(look, false);
    switch (look.style) {
      case 'long': return `<path d="M36 46 Q32 78 40 86 L80 86 Q88 78 84 46 Z" fill="${h}"/><path d="M40 60 Q40 78 44 84 M80 60 Q80 78 76 84" stroke="${d}" stroke-width="1.4" fill="none"/>`;
      case 'pigtails': return `<g fill="${h}"><ellipse cx="33" cy="66" rx="6" ry="11"/><ellipse cx="87" cy="66" rx="6" ry="11"/></g><g fill="${look.hatColor || '#c8102e'}"><circle cx="34" cy="56" r="2.6"/><circle cx="86" cy="56" r="2.6"/></g>`;
      case 'braid': return `<g fill="${h}" stroke="${d}" stroke-width="1"><ellipse cx="80" cy="66" rx="5" ry="6"/><ellipse cx="81" cy="76" rx="4.5" ry="5.5"/><ellipse cx="82" cy="85" rx="4" ry="5"/></g><circle cx="82" cy="91" r="2.4" fill="${look.hatColor || '#c8102e'}"/>`;
      case 'curly': return `<g fill="${h}">${[[37, 50], [35, 60], [38, 69], [83, 50], [85, 60], [82, 69]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="6"/>`).join('')}</g>`;
      case 'bob': return `<path d="M35 44 Q31 66 36 74 Q44 76 46 70 L74 70 Q76 76 84 74 Q89 66 85 44 Z" fill="${h}"/><path d="M38 56 Q38 68 41 72 M82 56 Q82 68 79 72" stroke="${d}" stroke-width="1.3" fill="none"/>`;
      case 'ponytail': return `<path d="M80 44 Q96 50 94 70 Q92 86 86 92 Q90 74 84 58 Z" fill="${h}"/><path d="M86 60 Q90 74 88 86" stroke="${d}" stroke-width="1.3" fill="none"/><circle cx="83" cy="48" r="3" fill="${look.hatColor || '#c8102e'}"/>`;
      default: return '';
    }
  }
  function hairFront(look) {
    const h = look.hair;
    if (look.style === 'traced' && look.hairPath) return tracedHair(look, true);
    if (look.style === 'curly') return `<g fill="${h}">${[42, 50, 58, 66, 74, 80].map((x, i) => `<circle cx="${x}" cy="${40 + (i % 2) * 2}" r="5.5"/>`).join('')}</g>`;
    if (look.style === 'buzz') return `<path d="M39 42 Q60 35 81 42 L81 44 Q60 39 39 45 Z" fill="${h}" opacity=".85"/>`;
    if (look.style === 'bob' || look.style === 'long') return `<path d="M37 41 Q60 30 83 41 L83 50 Q72 45 60 47 Q48 45 37 50 Z" fill="${h}"/>`;
    return `<path d="M38 41 Q60 30 82 41 L82 47 Q74 41 66 45 Q60 40 54 45 Q46 41 38 48 Z" fill="${h}"/><path d="M37 42 Q35 50 38 57 Q40 50 42 46 Z M83 42 Q85 50 82 57 Q80 50 78 46 Z" fill="${h}"/>`;
  }

  function hat(look, it) {
    const c = it.color || look.hatColor || '#c8102e', trim = it.trim || '#ffffff', dk = shade(c, -0.3);
    const fur = `<rect x="33" y="33.5" width="54" height="11" rx="5.5" fill="${trim}"/><path d="M36 41 Q60 46 84 41" stroke="${shade(trim, -0.12)}" stroke-width="1.2" fill="none"/>`;
    const cone = `<path d="M37 37 Q38 6 68 0 Q96 0 102 26 Q93 15 84 19 Q87 29 83 37 Z" fill="${c}"/><path d="M68 0 Q96 0 102 26 Q93 15 84 19 Q80 8 68 0Z" fill="${dk}" opacity=".45"/>`;
    switch (it.style) {
      case 'crown': return `<path d="M37 40 L36 20 L46 29 L53 13 L60 26 L67 13 L74 29 L84 20 L83 40 Z" fill="${c}" stroke="${shade(c, -0.35)}" stroke-width="1.2"/>
        <rect x="36" y="34" width="48" height="7" rx="3" fill="${shade(c, -0.15)}"/>${[[46, 37, trim], [60, 37, '#5ec8ff'], [74, 37, '#7ee08a']].map(([x, y, f]) => `<circle cx="${x}" cy="${y}" r="2.6" fill="${f}"/>`).join('')}
        <circle cx="53" cy="13" r="2.6" fill="${trim}"/><circle cx="67" cy="13" r="2.6" fill="#5ec8ff"/>`;
      case 'wizard': return `<path d="M36 38 L58 -14 Q62 -16 63 -11 L86 38 Z" fill="${c}"/><path d="M60 -12 L86 38 L72 38 Z" fill="${dk}" opacity=".4"/>
        <ellipse cx="60" cy="39" rx="31" ry="6" fill="${shade(c, -0.15)}"/>${[[52, 14], [64, 4], [68, 26], [56, 30]].map(([x, y]) => `<path d="M${x} ${y - 3} l1 2 2 .3 -1.5 1.4 .4 2.2 -1.9 -1 -1.9 1 .4 -2.2 -1.5 -1.4 2 -.3z" fill="${trim}"/>`).join('')}`;
      case 'ice': return cone + fur + `<g stroke="${trim}" stroke-width="1.8" stroke-linecap="round"><path d="M102 20 v14 M95 27 h14 M97 22 l10 10 M107 22 l-10 10"/></g><circle cx="102" cy="27" r="2.4" fill="#bfe9ff"/>`;
      case 'star': return cone + fur + `<circle cx="102" cy="27" r="6.5" fill="${trim}"/>` + [[50, 22], [62, 10], [74, 20], [58, 28], [88, 12]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="1.4" fill="${trim}" class="twinkle"/>`).join('');
      default: return cone + fur + `<circle cx="102" cy="27" r="6.5" fill="${trim}"/><circle cx="100" cy="25" r="2.2" fill="#fff" opacity=".7"/>`;
    }
  }

  function handItem(it) {
    if (!it) return '';
    const c = it.color;
    switch (it.style) {
      case 'lantern': return `<g class="lantern"><circle cx="91" cy="114" r="15" fill="#ffd36b" opacity=".22" class="flicker"/><path d="M85 103 Q91 96 97 103" stroke="#5a4020" stroke-width="1.6" fill="none"/>
        <rect x="84" y="103" width="14" height="4" rx="1" fill="${c}"/><rect x="85" y="107" width="12" height="13" rx="2" fill="#fff3c4" stroke="${c}" stroke-width="1.8"/>
        <ellipse cx="91" cy="114" rx="2.4" ry="3.6" fill="#ff9d2e" class="flicker"/><rect x="84" y="119" width="14" height="3" rx="1" fill="${c}"/></g>`;
      case 'kikkert': return `<g transform="rotate(-25 90 104)"><rect x="80" y="98" width="20" height="6" rx="2.5" fill="${c}"/><rect x="80" y="105" width="20" height="6" rx="2.5" fill="${shade(c, -0.2)}"/><rect x="98" y="97" width="4" height="15" rx="1.5" fill="#3a2a18"/></g>`;
      case 'wand': return `<path d="M86 110 L101 84" stroke="#5a3a20" stroke-width="3" stroke-linecap="round"/><path d="M99 87 L101 84" stroke="#e8b84a" stroke-width="3.4" stroke-linecap="round"/>
        <path class="twinkle" d="M102 74 l2 5 5 .6 -4 3.4 1.2 5 -4.2 -2.6 -4.2 2.6 1.2 -5 -4 -3.4 5 -.6z" fill="${c}" stroke="#ffd36b" stroke-width=".8"/>`;
      case 'compass': return `<circle cx="92" cy="105" r="8" fill="${c}"/><circle cx="92" cy="105" r="6" fill="#fffaf0"/><path d="M92 100 L94 105 L92 110 L90 105Z" fill="#c8102e"/><circle cx="92" cy="105" r="1" fill="#333"/>`;
      case 'book': return `<g transform="rotate(-12 92 108)"><rect x="83" y="99" width="18" height="14" rx="1.5" fill="${c}"/><rect x="85" y="101" width="14" height="10" fill="none" stroke="#e8b84a" stroke-width=".9"/><circle cx="92" cy="106" r="2" fill="#e8b84a"/></g>`;
      default: return '';
    }
  }
  function neckItem(it) {
    if (!it) return '';
    const c = it.color;
    const chain = `<path d="M50 76 Q60 92 70 76" stroke="#d9b45a" stroke-width="1.1" fill="none"/>`;
    switch (it.style) {
      case 'heart': return chain + `<path d="M60 96 L53 89 Q50 84 55 83 Q58 83 60 86 Q62 83 65 83 Q70 84 67 89Z" fill="${c}"/><path d="M55 86 Q60 92 65 86" stroke="#fff" stroke-width="1" fill="none"/>`;
      case 'medal': return `<path d="M54 76 L58 88 M66 76 L62 88" stroke="#c8102e" stroke-width="3"/><circle cx="60" cy="91" r="5.6" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width="1"/><path d="M60 88 l1 2 2 .2 -1.5 1.3 .5 2 -2 -1.1 -2 1.1 .5 -2 -1.5 -1.3 2 -.2z" fill="#fff6c8"/>`;
      default: return chain + `<circle cx="60" cy="90" r="7" fill="${c}" opacity=".3" class="flicker"/><path d="M60 84 L64.5 90 L60 96 L55.5 90 Z" fill="${c}" stroke="${shade(c, -0.3)}" stroke-width=".8"/><path d="M58 88 L60 85.5 L61.5 88" stroke="#fff" stroke-width=".9" fill="none" opacity=".8"/>`;
    }
  }

  // Returnerer <g> i et 120×160 koordinatsystem (fødder ved y≈150).
  function g(look, equip = {}, opts = {}) {
    const expr = opts.expr || 'happy';
    const hatIt = item(equip.hat) || { style: 'nisse' };
    const capeIt = item(equip.cape);
    const bootIt = item(equip.boots);
    const backIt = item(equip.back);
    const handIt = item(equip.hand);
    const neckIt = item(equip.neck);
    const cl = look.clothes || '#1f5d3a';
    const tunic = capeIt && capeIt.style === 'none' ? cl : cl;
    const skin = look.skin;
    const pants = shade(cl, -0.55);
    const boot = bootIt ? bootIt.color : '#4a2c1a';
    const bootDk = shade(boot, -0.3);
    const cape = capeIt && capeIt.style === 'cape' ? capeIt : null;
    const bag = backIt ? `<g><rect x="70" y="78" width="24" height="32" rx="7" fill="${backIt.color}"/><rect x="72" y="80" width="20" height="10" rx="4" fill="${shade(backIt.color, -0.2)}"/>${backIt.trim ? `<circle cx="89" cy="100" r="3" fill="${backIt.trim}"/><rect x="85" y="96" width="2" height="10" fill="${backIt.trim}"/>` : ''}</g>` : '';
    const capeBack = cape ? `<path d="M41 74 Q25 116 22 144 Q60 152 98 144 Q95 116 79 74 Z" fill="${cape.color}"/><path d="M22 144 Q60 152 98 144" stroke="${cape.trim || shade(cape.color, 0.3)}" stroke-width="3" fill="none"/><path d="M41 74 Q30 110 30 140" stroke="${shade(cape.color, -0.25)}" stroke-width="2" fill="none" opacity=".6"/>` : '';
    const spikes = bootIt && bootIt.style === 'boots' && bootIt.color === '#7cc7e8' ? `<g fill="#e8f7ff">${[44, 49, 54, 64, 69, 74].map(x => `<path d="M${x} 150 l1.5 3 1.5 -3z"/>`).join('')}</g>` : '';
    const strap = backIt ? `<path d="M46 77 L50 104 M74 77 L70 104" stroke="${shade(backIt.color, -0.25)}" stroke-width="3.4"/>` : '';
    const beard = look.beard ? `<path d="M37 54 Q34 90 60 100 Q86 90 83 54 Q74 66 60 66 Q46 66 37 54Z" fill="${look.beard === true ? BEARD : look.beard}"/><path d="M48 62 Q54 58 60 62 Q66 58 72 62 Q66 67 60 64 Q54 67 48 62Z" fill="${shade(look.beard === true ? BEARD : look.beard, -0.08)}"/>` : '';
    const must = look.mustache ? `<path d="M50 62 Q55 57 60 61 Q65 57 70 62 Q65 64 60 62.5 Q55 64 50 62Z" fill="${look.mustache}"/>` : '';
    const goggles = look.goggles ? `<g><rect x="38" y="35" width="44" height="4" fill="#5a3a20"/><circle cx="50" cy="37" r="6.5" fill="#9fe3ff" stroke="#b8862e" stroke-width="2.4"/><circle cx="70" cy="37" r="6.5" fill="#9fe3ff" stroke="#b8862e" stroke-width="2.4"/><circle cx="48" cy="35" r="1.6" fill="#fff"/><circle cx="68" cy="35" r="1.6" fill="#fff"/></g>` : '';
    const mitten = look.mittens || hatIt.color || look.hatColor || '#c8102e';
    // With a photo the child's own (drawn) face sits on the head; the cropper's oval maps onto it
    const photo = look.photo, pid = photo ? 'ph' + (++maskN) : '';
    const head = photo ? `<defs><clipPath id="${pid}"><ellipse cx="60" cy="57" rx="24" ry="25.5"/></clipPath>
      <radialGradient id="${pid}r"><stop offset=".78" stop-color="${skin}" stop-opacity="0"/><stop offset="1" stop-color="${skin}" stop-opacity=".85"/></radialGradient></defs>
      <ellipse cx="60" cy="57" rx="24" ry="25.5" fill="${skin}"/>
      <image href="${photo}" x="18.3" y="17.3" width="83.4" height="83.4" preserveAspectRatio="none" clip-path="url(#${pid})"/>
      <ellipse cx="60" cy="57" rx="24" ry="25.5" fill="url(#${pid}r)"/>
      <ellipse cx="60" cy="57" rx="24" ry="25.5" fill="none" stroke="${shade(skin, -0.3)}" stroke-width="1.1"/>
      ${look.glasses ? `<g transform="translate(60 54) scale(1.11 1) translate(-60 -52)">${glassesSvg(look)}</g>` : ''}${beard}${must}`
      : `<path d="${headPath(look)}" fill="${skin}"/>
      <path d="M60 29 A23 23 0 0 1 83 52 A23 23 0 0 1 72 72 Q80 56 60 29Z" fill="#000" opacity=".06"/>
      ${hairFront(look)}
      ${face(look, expr)}${beard}${must}`;
    const earDx = photo ? 2 : ((look.face && look.face.rx) || 23) - 23;
    return `<g class="av ${opts.walking ? 'walk' : ''}">
      <ellipse cx="60" cy="151" rx="25" ry="5" fill="#000" opacity=".22"/>
      <g class="bob">
      ${capeBack}${bag}
      <g class="leg l"><rect x="47" y="118" width="11" height="26" rx="4" fill="${pants}"/><path d="M45 140 h14 v8 q0 4 -4 4 h-12 q-5 0 -5 -3 q0 -6 7 -9z" fill="${boot}"/><path d="M38 149 q8 2 20 1" stroke="${bootDk}" stroke-width="1.5" fill="none"/></g>
      <g class="leg r"><rect x="62" y="118" width="11" height="26" rx="4" fill="${pants}"/><path d="M61 140 h14 q7 3 7 9 q0 3 -5 3 h-12 q-4 0 -4 -4z" fill="${boot}"/><path d="M62 150 q12 1 20 -1" stroke="${bootDk}" stroke-width="1.5" fill="none"/></g>
      ${spikes}
      <g class="arm l"><path d="M45 80 Q33 92 34 106" stroke="${tunic}" stroke-width="11" stroke-linecap="round" fill="none"/><circle cx="34" cy="108" r="5.6" fill="${mitten}"/></g>
      <path d="M42 76 Q60 68 78 76 L86 126 Q60 134 34 126 Z" fill="${tunic}"/>
      <path d="M66 72 Q74 73 78 76 L86 126 Q76 130 68 131 Z" fill="#000" opacity=".12"/>
      <path d="M35 125 Q60 134 85 125" stroke="#f5f5f5" stroke-width="5" fill="none" stroke-linecap="round"/>
      ${strap}
      <rect x="37" y="106" width="46" height="7" rx="2" fill="#3a2416"/><rect x="56" y="105" width="8" height="9" rx="1.5" fill="none" stroke="#e8b84a" stroke-width="1.8"/>
      <circle cx="60" cy="88" r="1.6" fill="#e8b84a"/><circle cx="60" cy="97" r="1.6" fill="#e8b84a"/>
      ${cape ? `<path d="M44 74 Q60 82 76 74 L74 78 Q60 86 46 78 Z" fill="${cape.color}"/><circle cx="60" cy="80" r="2.6" fill="${cape.trim || '#e8b84a'}"/>` : ''}
      ${neckItem(neckIt)}
      <g class="arm r"><path d="M75 80 Q87 90 88 102" stroke="${tunic}" stroke-width="11" stroke-linecap="round" fill="none"/>${handItem(handIt)}<circle cx="88" cy="104" r="5.6" fill="${mitten}"/></g>
      ${hairBack(look)}
      <g transform="translate(${-earDx} 0)"><path d="M38 50 L25 40 L37 60 Z" fill="${skin}"/><path d="M36 50 L29 45 L36 56 Z" fill="${shade(skin, -0.12)}"/></g>
      <g transform="translate(${earDx} 0)"><path d="M82 50 L95 40 L83 60 Z" fill="${skin}"/><path d="M84 50 L91 45 L84 56 Z" fill="${shade(skin, -0.12)}"/></g>
      ${head}
      ${hat(look, hatIt)}${goggles}
      </g></g>`;
  }
  function svg(look, equip, opts = {}) {
    const vb = opts.portrait ? (look.photo ? '16 -10 88 93' : '16 -12 88 88') : '0 -18 120 174';
    return `<svg class="avsvg ${opts.portrait ? 'por' : ''} ${opts.cls || ''}" viewBox="${vb}" xmlns="http://www.w3.org/2000/svg">${g(look, equip, opts)}</svg>`;
  }

  // ---------- Foto → træk til en tegnet nisse (kører kun lokalt i browseren) ----------
  // Kalderen skal selv kalde URL.revokeObjectURL(img.src), når billedet er analyseret.
  function loadImage(file) {
    return new Promise((res, rej) => {
      const url = URL.createObjectURL(file);
      const img = new Image();
      img.onload = () => res(img);
      img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('Billedet kunne ikke læses')); };
      img.src = url;
    });
  }
  const hex = ([r, g, b]) => '#' + [r, g, b].map(v => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0')).join('');
  const dist = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
  const LIN = Array.from({ length: 256 }, (_, i) => { const v = i / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); });
  function toLab(r, g, b) {
    const R = LIN[r], G = LIN[g], B = LIN[b];
    const f = t => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    const x = f((R * 0.4124 + G * 0.3576 + B * 0.1805) / 0.95047), y = f(R * 0.2126 + G * 0.7152 + B * 0.0722), z = f((R * 0.0193 + G * 0.1192 + B * 0.9505) / 1.08883);
    return [116 * y - 16, 500 * (x - y), 200 * (y - z)];
  }
  const quant = (arr, q) => { if (!arr.length) return 0; const s = arr.slice().sort((a, b) => a - b); return s[Math.min(s.length - 1, Math.floor(q * s.length))]; };
  const median = arr => quant(arr, 0.5);
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

  // Outline of a binary mask as closed loops along the cell edges, smoothed and simplified.
  function outline(mask, N) {
    const at = (x, y) => x >= 0 && y >= 0 && x < N && y < N && mask[y * N + x];
    const out = new Map();
    const add = (ax, ay, bx, by) => { const k = ax + ',' + ay; if (!out.has(k)) out.set(k, []); out.get(k).push([bx, by]); };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) {
      if (!at(x, y)) continue;
      if (!at(x, y - 1)) add(x, y, x + 1, y);
      if (!at(x + 1, y)) add(x + 1, y, x + 1, y + 1);
      if (!at(x, y + 1)) add(x + 1, y + 1, x, y + 1);
      if (!at(x - 1, y)) add(x, y + 1, x, y);
    }
    const loops = [];
    for (const [k, list] of out) {
      while (list.length) {
        const start = k.split(',').map(Number), loop = [start];
        let next = list.pop();
        for (let guard = 0; guard < N * N * 4; guard++) {
          if (next[0] === start[0] && next[1] === start[1]) break;
          loop.push(next);
          const l = out.get(next[0] + ',' + next[1]);
          if (!l || !l.length) break;
          next = l.pop();
        }
        if (loop.length >= 16) loops.push(loop);
      }
    }
    const smooth = pts => pts.map((_, i) => {
      let x = 0, y = 0;
      for (let d = -3; d <= 3; d++) { const q = pts[(i + d + pts.length) % pts.length]; x += q[0]; y += q[1]; }
      return [x / 7, y / 7];
    });
    const simplify = (pts, eps) => {
      const keep = new Uint8Array(pts.length); keep[0] = keep[pts.length - 1] = 1;
      const stack = [[0, pts.length - 1]];
      while (stack.length) {
        const [a, b] = stack.pop(), [ax, ay] = pts[a], [bx, by] = pts[b], L = Math.hypot(bx - ax, by - ay) || 1;
        let best = -1, bd = eps;
        for (let i = a + 1; i < b; i++) { const d = Math.abs((bx - ax) * (ay - pts[i][1]) - (ax - pts[i][0]) * (by - ay)) / L; if (d > bd) { bd = d; best = i; } }
        if (best > 0) { keep[best] = 1; stack.push([a, best], [best, b]); }
      }
      return pts.filter((_, i) => keep[i]);
    };
    return loops.map(l => simplify(smooth(smooth(l)), 0.28));
  }

  // crop = square {cx, cy, size} in image pixels, placed so the eyes are at (0.38, 0.44) and (0.62, 0.44).
  // Reads hair shape and colour, skin, face shape, eyes, brows and lips. Only these traits are kept; the photo is thrown away.
  function analyze(img, crop) {
    const N = 120, U = 12, MX = 60, MY = 44.5, side = crop.size * 2.4;
    const cv = document.createElement('canvas'); cv.width = cv.height = N;
    const ctx = cv.getContext('2d', { willReadFrequently: true });
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, crop.cx - side / 2, crop.cy + crop.size * 0.25 - side / 2, side, side, 0, 0, N, N);
    const px = ctx.getImageData(0, 0, N, N).data;
    const ok = new Uint8Array(N * N), rgb = [], lab = [];
    for (let i = 0; i < N * N; i++) {
      const r = px[i * 4], g = px[i * 4 + 1], b = px[i * 4 + 2];
      ok[i] = px[i * 4 + 3] > 200 ? 1 : 0;
      rgb.push([r, g, b]); lab.push(toLab(r, g, b));
    }
    const ux = i => ((i % N) + 0.5 - MX) / U, uy = i => (Math.floor(i / N) + 0.5 - MY) / U;
    // cells in a box given in eye distances from the point between the eyes
    const box = (x0, y0, x1, y1) => {
      const out = [];
      for (let y = Math.max(0, Math.round(MY + y0 * U)); y < Math.min(N, MY + y1 * U); y++)
        for (let x = Math.max(0, Math.round(MX + x0 * U)); x < Math.min(N, MX + x1 * U); x++) if (ok[y * N + x]) out.push(y * N + x);
      return out;
    };
    const medLab = ids => [0, 1, 2].map(k => median(ids.map(i => lab[i][k])));
    const medRgb = ids => [0, 1, 2].map(k => median(ids.map(i => rgb[i][k])));
    const flood = (starts, test) => {
      const m = new Uint8Array(N * N), q = starts.filter(test);
      q.forEach(i => { m[i] = 1; });
      while (q.length) {
        const i = q.pop(), x = i % N;
        for (const j of [i - N, i + N, x > 0 ? i - 1 : -1, x < N - 1 ? i + 1 : -1]) if (j >= 0 && j < N * N && !m[j] && test(j)) { m[j] = 1; q.push(j); }
      }
      return m;
    };

    // Skin from cheeks and nose; the lighter half, so shadows don't make it too dark
    let sk = [...box(-0.8, 0.45, -0.35, 0.85), ...box(0.35, 0.45, 0.8, 0.85), ...box(-0.15, 0.15, 0.15, 0.55)];
    let skinLab = sk.length ? medLab(sk) : [75, 12, 18];
    sk = sk.filter(i => dist(lab[i], skinLab) < 18);
    if (sk.length > 5) skinLab = medLab(sk);
    const lightL = quant(sk.map(i => lab[i][0]), 0.5), light = sk.filter(i => lab[i][0] >= lightL);
    const skinRGB = light.length > 3 ? medRgb(light) : [240, 200, 170];

    const bgs = [box(-5, -3.7, -4.4, -2), box(4.4, -3.7, 5, -2), box(-2, -3.7, 2, -3.2), box(-5, -1, -4.4, 1), box(4.4, -1, 5, 1)].filter(b => b.length > 4).map(medLab);
    const nearBg = c => bgs.some(b => dist(c, b) < 9);

    // Hair: seeds above the forehead and at the temples, grown over similar colours around the face
    let seeds = [...box(-0.7, -1.7, 0.7, -1.0), ...box(-1.45, -0.9, -1.05, -0.1), ...box(1.05, -0.9, 1.45, -0.1)].filter(i => dist(lab[i], skinLab) > 16);
    let hairRGB = null, hair = null, style = 'buzz';
    const region = i => {
      const x = ux(i), y = uy(i);
      if (Math.abs(x) > 2.6 || y < -3.2 || y > 4.6) return false;
      if ((x / 0.95) ** 2 + ((y - 0.75) / 1.25) ** 2 < 1) return false;
      return !(Math.abs(x) < 0.9 && y > 1.9);
    };
    if (seeds.length >= 6) {
      let hairLab = medLab(seeds);
      const close = seeds.filter(i => dist(lab[i], hairLab) < 22);
      if (close.length >= 4) { seeds = close; hairLab = medLab(seeds); }
      hairRGB = medRgb(seeds);
      const spread = median(seeds.map(i => dist(lab[i], hairLab)));
      for (const T of [clamp(spread * 2.4, 13, 26), 11]) {
        const m = flood(seeds, i => ok[i] && region(i) && dist(lab[i], hairLab) < T && dist(lab[i], skinLab) > 10 && (dist(lab[i], hairLab) < 6 || !nearBg(lab[i])));
        let edge = 0, area = 0;
        for (let i = 0; i < N * N; i++) if (m[i]) { area++; if (Math.abs(ux(i)) > 2.45 || uy(i) < -3.05) edge++; }
        if (area < 40 || edge > 45) continue;
        // close small gaps and fill small holes, but keep the big hole where the face is
        const grow = (src, on) => { const o = new Uint8Array(N * N); for (let i = 0; i < N * N; i++) { const x = i % N; const nb = [i, i - N, i + N, x > 0 ? i - 1 : i, x < N - 1 ? i + 1 : i].map(j => (j >= 0 && j < N * N ? src[j] : 0)); o[i] = on ? (nb.some(Boolean) ? 1 : 0) : (nb.every(Boolean) ? 1 : 0); } return o; };
        const closed = grow(grow(m, true), false);
        const outside = flood([0, N - 1, N * N - 1, N * N - N], i => !closed[i]);
        // fill only small holes; the big gap round the face stays open
        const seen = new Uint8Array(N * N);
        for (let i = 0; i < N * N; i++) {
          if (closed[i] || outside[i] || seen[i] || !region(i)) continue;
          const comp = flood([i], j => !closed[j] && !outside[j] && !seen[j] && region(j));
          const ids = [];
          for (let j = 0; j < N * N; j++) if (comp[j]) { seen[j] = 1; ids.push(j); }
          if (ids.length < 30) ids.forEach(j => { closed[j] = 1; });
        }
        hair = closed;
        break;
      }
    }
    let hairPath = null;
    if (hair) {
      const toAv = ([x, y]) => { const dx = (x - MX) * 1.5 * 1.1, dy = (y - MY) * 1.5; return `${(60 + dx).toFixed(1)} ${(52 + (dy > 0 ? dy * 0.72 : dy)).toFixed(1)}`; };
      const loops = outline(hair, N);
      if (loops.length) hairPath = loops.map(l => 'M' + l.map(toAv).join(' L') + 'Z').join('');
      let low = -9;
      for (let i = 0; i < N * N; i++) if (hair[i] && Math.abs(ux(i)) > 0.9) low = Math.max(low, uy(i));
      style = low > 2.4 ? 'long' : low > 1.3 ? 'bob' : 'short';
    }

    // Face shape from the skin around the cheeks
    const skinM = flood([...box(-0.7, 0.5, -0.4, 0.8), ...box(0.4, 0.5, 0.7, 0.8)], i => ok[i] && Math.abs(ux(i)) < 1.7 && uy(i) > -1 && uy(i) < 2.7 && !(hair && hair[i]) && dist(lab[i], skinLab) < 14);
    const halfW = yU => { const y = Math.round(MY + yU * U); let l = MX, r = MX; while (l > 0 && skinM[y * N + l - 1]) l--; while (r < N - 1 && skinM[y * N + r + 1]) r++; return (r - l + 1) / 2 / U; };
    let chin = 2.0;
    const below = Math.round(MY + 1.45 * U);
    if ([-1, 0, 1].some(d => skinM[below * N + MX + d])) {
      for (let y = below; y < N && [-1, 0, 1].some(d => skinM[y * N + MX + d]); y++) chin = (y + 0.5 - MY) / U;
    }
    const w1 = halfW(0.4), w2 = halfW(1.4);
    const face = w1 > 0.6 ? { rx: +clamp(23 * w1 / 1.1, 21, 25.5).toFixed(1), jaw: +clamp(0.552 * (w2 / w1) / 0.85, 0.38, 0.72).toFixed(2), ry: +clamp(23 * clamp(chin, 1.6, 2.5) / 2, 21, 26.5).toFixed(1) } : null;

    const d = details(img, crop, skinRGB);
    analyze.last = { hair, skinM, seeds, N };
    if (!hairRGB) hairRGB = d.browRGB || [110, 75, 45];
    return { skin: hex(skinRGB), hair: hex(hairRGB), style: hairPath ? 'traced' : style, hairPath, face, eyes: d.eyes, brow: d.brow, lips: d.lips, fromPhoto: true };
  }

  // Eyes, brows and lips from a sharper crop of the face itself
  function details(img, crop, skinRGB) {
    const S = 200;
    const c = document.createElement('canvas'); c.width = c.height = S;
    const x = c.getContext('2d', { willReadFrequently: true });
    x.drawImage(img, crop.cx - crop.size / 2, crop.cy - crop.size / 2, crop.size, crop.size, 0, 0, S, S);
    const data = x.getImageData(0, 0, S, S).data;
    const P = (xx, yy) => { const i = (yy * S + xx) * 4; return [data[i], data[i + 1], data[i + 2]]; };
    const skinLab = toLab(...skinRGB.map(Math.round));
    // Iris: pixels round the eye guides that are neither skin, pupil nor the white of the eye
    const iris = [0, 0, 0]; let n = 0;
    [[0.38, 0.44], [0.62, 0.44]].forEach(([ex, ey]) => {
      for (let yy = Math.round((ey - 0.035) * S); yy < (ey + 0.035) * S; yy++) for (let xx = Math.round((ex - 0.05) * S); xx < (ex + 0.05) * S; xx++) {
        const p = P(xx, yy), l = (p[0] + p[1] + p[2]) / 3;
        if (l < 40 || l > 200 || dist(p, skinRGB) < 60) continue;
        iris[0] += p[0]; iris[1] += p[1]; iris[2] += p[2]; n++;
      }
    });
    let eyes = EYES[0];
    if (n > 8) {
      const [r, g, b] = iris.map(v => v / n), mx = Math.max(r, g, b), mn = Math.min(r, g, b), sat = (mx - mn) / (mx || 1), l = (mx + mn) / 2;
      if (b > r + 6 && b >= g) eyes = l > 120 ? EYES[3] : EYES[2];
      else if (g > r && g > b) eyes = EYES[4];
      else if (sat < 0.12) eyes = EYES[5];
      else eyes = l > 110 ? EYES[1] : EYES[0];
    }
    // Brows: the darkest band above each eye
    const rows = [], darkPx = [];
    for (let yy = Math.round(0.29 * S); yy < 0.42 * S; yy++) {
      let cnt = 0;
      for (const ex of [0.38, 0.62]) for (let xx = Math.round((ex - 0.07) * S); xx < (ex + 0.07) * S; xx++) {
        const p = P(xx, yy), L = toLab(...p)[0];
        if (L < skinLab[0] - 18) { cnt++; darkPx.push(p); }
      }
      rows.push([yy, cnt]);
    }
    let brow = null, browRGB = null;
    const top = Math.max(...rows.map(r => r[1]));
    if (top > 8 && darkPx.length > 20) {
      const thick = rows.filter(r => r[1] > top * 0.45);
      const mid = thick.reduce((a, r) => a + r[0] * r[1], 0) / thick.reduce((a, r) => a + r[1], 0) / S;
      browRGB = [0, 1, 2].map(k => median(darkPx.map(p => p[k])));
      brow = { c: hex(browRGB.map(v => v * 0.85)), y: +clamp(52 + (mid - 0.44) * 75 + 1, 42.5, 47.5).toFixed(1), w: +clamp(thick.length * 0.375 * 0.8, 1.3, 2.8).toFixed(1) };
    }
    // Lips: the reddest pixels where the mouth is
    const lipPx = [];
    for (let yy = Math.round(0.65 * S); yy < 0.76 * S; yy++) for (let xx = Math.round(0.42 * S); xx < 0.58 * S; xx++) lipPx.push(P(xx, yy));
    const withA = lipPx.map(p => [p, toLab(...p)[1]]), aCut = quant(withA.map(q => q[1]), 0.75), red = withA.filter(q => q[1] >= aCut).map(q => q[0]);
    const lips = red.length && aCut > skinLab[1] + 5 ? hex([0, 1, 2].map(k => median(red.map(p => p[k])) * 0.6)) : null;
    return { eyes, brow, browRGB, lips };
  }

  // A drawn-looking copy of the face: softened, fewer colours and dark outlines. Only this small picture is kept.
  function cartoon(img, crop) {
    const S = 160, src = [crop.cx - crop.size / 2, crop.cy - crop.size / 2, crop.size, crop.size];
    const layer = n => { const c = document.createElement('canvas'); c.width = c.height = n; const x = c.getContext('2d', { willReadFrequently: true }); x.imageSmoothingQuality = 'high'; return [c, x]; };
    const [small, sx] = layer(84); sx.drawImage(img, ...src, 0, 0, 84, 84);
    const [mid, mx] = layer(100); mx.drawImage(img, ...src, 0, 0, 100, 100);
    const [out, ox] = layer(S); ox.drawImage(small, 0, 0, S, S);
    const [ed, ex] = layer(S); ex.drawImage(mid, 0, 0, S, S);
    const im = ox.getImageData(0, 0, S, S), p = im.data, e = ex.getImageData(0, 0, S, S).data;
    const L = new Float32Array(S * S);
    for (let i = 0; i < S * S; i++) L[i] = e[i * 4] * 0.3 + e[i * 4 + 1] * 0.59 + e[i * 4 + 2] * 0.11;
    const step = 16;
    for (let y = 1; y < S - 1; y++) for (let x = 1; x < S - 1; x++) {
      const i = y * S + x, a = q => L[q];
      const gx = a(i - S + 1) + 2 * a(i + 1) + a(i + S + 1) - a(i - S - 1) - 2 * a(i - 1) - a(i + S - 1);
      const gy = a(i + S - 1) + 2 * a(i + S) + a(i + S + 1) - a(i - S - 1) - 2 * a(i - S) - a(i - S + 1);
      const mag = Math.hypot(gx, gy), ink = mag > 190 ? 0.6 : mag > 130 ? 0.82 : 1;
      const k = i * 4, gr = (p[k] + p[k + 1] + p[k + 2]) / 3;
      for (let c = 0; c < 3; c++) {
        const v = gr + (p[k + c] - gr) * 1.15 + 6;
        p[k + c] = Math.max(0, Math.min(255, Math.round(v / step) * step * ink));
      }
    }
    ox.putImageData(im, 0, 0);
    return out.toDataURL('image/jpeg', 0.85);
  }

  // Faste figurer genbruger samme tegnestil, så alt ser ens ud.
  const NPC = {
    sofus: { look: { skin: '#f3c9a8', hair: '#8a4f24', style: 'short', eyes: '#2f6db0', clothes: '#8e1027', hatColor: '#c8102e' }, equip: { hat: { style: 'nisse', color: '#c8102e' }, neck: { style: 'amulet', color: '#ffd36b' } } },
    frida: { look: { skin: '#fbe0cc', hair: '#b23a1e', style: 'pigtails', eyes: '#3c8a52', clothes: '#5b3c88', hatColor: '#e07a1f', goggles: true }, equip: { hat: { style: 'nisse', color: '#e07a1f' }, hand: { style: 'book', color: '#2f6db0' } } },
    pil: { look: { skin: '#e7b48f', hair: '#4a2c18', style: 'curly', eyes: '#5a3a22', clothes: '#2e6f6a', hatColor: '#1f5d3a' }, equip: { hat: { style: 'nisse', color: '#1f5d3a', trim: '#e8f4d0' }, cape: { style: 'cape', color: '#3b5d2a', trim: '#9bd36b' } } },
    julemand: { look: { skin: '#f6cfb0', hair: '#f2f2f2', style: 'short', eyes: '#2f6db0', clothes: '#b3122e', hatColor: '#b3122e', beard: '#fafafa' }, equip: { hat: { style: 'nisse', color: '#b3122e' }, boots: { style: 'boots', color: '#1e1410' } } },
    slikkonge: { look: { skin: '#fbe0cc', hair: '#ff9ad5', style: 'curly', eyes: '#5a3a22', clothes: '#d94f8c', hatColor: '#ffd36b', mustache: '#ff9ad5' }, equip: { hat: { style: 'crown', color: '#ffd36b', trim: '#ff5f8f' }, cape: { style: 'cape', color: '#ffb3d1', trim: '#fff' } } }
  };

  return { g, svg, shade, loadImage, analyze, cartoon, NPC, SKINS, HAIRS, EYES, HATS, CLOTHES, STYLES, RED, RED_CLOTHES,
    parts: { hat: it => hat({ hatColor: '#c8102e' }, it), hand: handItem, neck: neckItem } };
})();
