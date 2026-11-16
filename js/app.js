// Nisseland – hovedapp: profiler, kalender, kapitler, kort, nissesæk, nissepas, julebog, forældredel og skærmtid.
const App = (() => {
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = TaskUI.esc;
  const root = $('#app');
  let cur = null, screen = '', paused = false, warnedFor = '', exploring = false;
  // Musik kun ved velkomsten og på kortet, så den aldrig larmer oven i fortælleren.
  function music() {
    const want = Store.db.settings.bgMusic !== false && !paused && !document.hidden && !document.querySelector('.modal') &&
      (['profiles', 'create', 'map'].includes(screen) || (screen === 'chapter' && exploring));
    if (want !== Sfx.musicOn) Sfx.music(want);
  }
  const fmt = s => String(s).replace(/\{navn\}/g, cur ? cur.nisseName : 'julehjælper');
  const save = () => Store.save(cur);
  const DOOR_ORDER = [7, 15, 3, 22, 11, 1, 18, 9, 24, 5, 13, 20, 2, 16, 8, 12, 23, 4, 19, 10, 14, 6, 21, 17];
  const PHASES = ['Historie', 'Udforsk', 'Mission', 'Gave', 'Afslutning'];
  const regionOfDay = d => SPOTS[CHAPTERS[d - 1].spot].region;

  // ---------- Hjælpere ----------
  function toast(msg, ms = 3200) {
    const t = $('#toast'); t.textContent = msg; t.classList.add('show');
    clearTimeout(t._h); t._h = setTimeout(() => t.classList.remove('show'), ms);
  }
  function modal(html, cls = '') {
    const m = document.createElement('div');
    m.className = 'modal ' + cls;
    m.innerHTML = `<div class="mbox pop">${html}</div>`;
    document.body.appendChild(m);
    m.close = () => { m.remove(); music(); };
    music();
    return m;
  }
  function bubble(host, who, text, opts = {}) {
    const b = document.createElement('div');
    b.className = 'bubble pop';
    const por = typeof who === 'object' ? Avatar.svg(who, { hat: { style: 'nisse', color: who.hatColor } }, { portrait: true }) : Art.portrait(who, cur);
    b.innerHTML = `<div class="bpor">${por}</div><div class="btxt">${esc(fmt(text))}</div>${opts.close !== false ? '<button class="bx" aria-label="Luk">✕</button>' : ''}`;
    host.appendChild(b);
    const x = $('.bx', b); if (x) x.onclick = () => b.remove();
    if (opts.speak !== false && cur && cur.level <= 2) Sfx.speak(fmt(text));
    if (opts.ttl) setTimeout(() => b.remove(), opts.ttl);
    return b;
  }
  function giveItem(id, quiet) {
    if (!cur.inventory.includes(id)) { cur.inventory.push(id); if (!quiet) toast(`Ny ting i nissesækken: ${ITEMS[id].name}`); return true; }
    return false;
  }
  function addStars(n) {
    cur.stars += n;
    STAR_BONUS.forEach(([need, id]) => { if (cur.stars >= need && giveItem(id, true)) toast(`🎉 Bonus for ${need} stjerner: ${ITEMS[id].name}!`, 4500); });
  }
  function pagesFound() { return Object.keys(cur.seen).filter(k => cur.seen[k]).length; }
  function avatarMini() { return Avatar.svg(cur.look, cur.equip, { portrait: true }); }

  // ---------- Skærmtid ----------
  const TIMED = ['home', 'chapter', 'map', 'sack', 'pass', 'book'];
  function limit() { return (cur.minutes || 0) * 60; }
  function remaining() { const t = Store.timeToday(cur); return limit() ? Math.max(0, limit() - t.used) : Infinity; }
  setInterval(() => {
    music();
    if (!cur || paused || document.hidden || !TIMED.includes(screen)) return;
    const t = Store.timeToday(cur);
    t.used++;
    if (t.used % 10 === 0) save();
    const rem = remaining();
    const pill = $('#timeLeft'); if (pill) pill.textContent = rem === Infinity ? '∞' : `${Math.floor(rem / 60)}:${String(rem % 60).padStart(2, '0')}`;
    if (limit() >= 240 && rem === 180 && warnedFor !== Store.today() + cur.id) {
      warnedFor = Store.today() + cur.id;
      toast('⏳ Tre minutter tilbage i Nisseland!', 6000);
      Sfx.chime(); Sfx.speak('Tre minutter tilbage i Nisseland!');
    }
    if (rem <= 0) { save(); goodnight(); }
  }, 1000);
  document.addEventListener('visibilitychange', () => { music(); if (document.hidden && cur) save(); });
  window.addEventListener('pagehide', () => Sfx.music(false));

  function topbar() {
    const rem = remaining();
    return `<header class="top">
      <button class="me" id="tbPass" title="Nissepas">${avatarMini()}<span>${esc(cur.nisseName)}</span></button>
      <div class="stats"><span title="Stjerner">★ ${cur.stars}</span><span title="Julebogens sider">📜 ${pagesFound()}/24</span></div>
      <nav>
        <button id="tbCal" class="${screen === 'home' ? 'on' : ''}" title="Kalender">🗓️<i>Kalender</i></button>
        <button id="tbMap" class="${screen === 'map' ? 'on' : ''}" title="Kort">🗺️<i>Kort</i></button>
        <button id="tbSack" class="${screen === 'sack' ? 'on' : ''}" title="Nissesæk">🎒<i>Sæk</i></button>
        <button id="tbBook" class="${screen === 'book' ? 'on' : ''}" title="Julebogen">📖<i>Julebog</i></button>
      </nav>
      <div class="timer"><span>⏳ <b id="timeLeft">${rem === Infinity ? '∞' : `${Math.floor(rem / 60)}:${String(rem % 60).padStart(2, '0')}`}</b></span><button id="tbPause" title="Pause">⏸</button></div>
      <button class="iconbtn" id="tbSound" title="Lyd">${Sfx.on ? '🔔' : '🔕'}</button>
      <button class="iconbtn" id="tbHome" title="Skift nisse">🏠</button>
    </header>`;
  }
  function bindTop() {
    $('#tbPass').onclick = pass; $('#tbCal').onclick = home; $('#tbMap').onclick = () => map();
    $('#tbSack').onclick = sack; $('#tbBook').onclick = book; $('#tbPause').onclick = pause;
    $('#tbSound').onclick = () => { Sfx.on = !Sfx.on; Store.db.settings.sound = Sfx.on; Store.save(); $('#tbSound').textContent = Sfx.on ? '🔔' : '🔕'; };
    $('#tbHome').onclick = () => { save(); cur = null; profiles(); };
  }
  function pause() {
    paused = true; Sfx.stopSpeak(); music();
    const m = modal(`<div class="pausebox">${Avatar.svg(cur.look, cur.equip, { expr: 'sleep', cls: 'pauseav' })}<h2>Pause</h2><p>Tiden står stille, og Nisseland venter tålmodigt på dig.</p><button class="btn gold" id="resume">Fortsæt ▶</button></div>`, 'pause');
    $('#resume', m).onclick = () => { paused = false; m.close(); music(); };
  }
  function goodnight() {
    screen = 'night'; World.destroy(); Sfx.stopSpeak(); music();
    $$('.modal').forEach(m => m.remove());
    root.innerHTML = `<div class="night">${Art.scene('by')}<div class="nightbox pop">
      <div class="sleepers">${Avatar.svg(cur.look, cur.equip, { expr: 'sleep' })}${Avatar.svg(Avatar.NPC.sofus.look, Avatar.NPC.sofus.equip, { expr: 'sleep' })}</div>
      <h1>Godnat, ${esc(cur.nisseName)}!</h1>
      <p>Dagens tid i Nisseland er brugt. Alt er gemt – dine stjerner, gaver og eventyr venter på dig.</p>
      <p><b>Nisseland venter på dig igen i morgen.</b> 🌙</p>
      <div class="row center"><button class="btn" id="gnBack">Skift nisse</button><button class="btn ghost small" id="gnParent">Forælder: giv mere tid</button></div></div></div>`;
    Sfx.speak(`Godnat, ${cur.nisseName}! Nisseland venter på dig igen i morgen.`);
    $('#gnBack').onclick = () => { cur = null; profiles(); };
    $('#gnParent').onclick = () => parentGate(() => { Store.timeToday(cur).used = Math.max(0, limit() - 300); save(); toast('5 minutter ekstra'); home(); });
  }

  // ---------- Profiler ----------
  function profiles() {
    screen = 'profiles'; World.destroy();
    const ps = Store.db.profiles;
    root.innerHTML = `<div class="profiles">${Art.scene('by')}
      <div class="logo pop"><div class="logo-small">Den magiske julemission</div><h1>Nisseland</h1></div>
      <div class="pcards">${ps.map(p => `<button class="pcard" data-id="${p.id}">${Avatar.svg(p.look, p.equip, { cls: 'pav' })}
        <b>${esc(p.nisseName)}</b><small>${TaskBank.LEVELS[p.level]} · 📜 ${Object.keys(p.seen).length}/24</small></button>`).join('')}
        <button class="pcard add" id="addP"><span class="plus">＋</span><b>Ny julehjælper</b><small>Lav dit nissepas</small></button></div>
      <div class="pfoot"><button class="btn ghost small" id="parentBtn">👪 Forældre</button><button class="btn ghost small" id="musicBtn">${Store.db.settings.bgMusic !== false ? '🎵 Musik: til' : '🎵 Musik: fra'}</button><small class="ver">version 16</small></div>
      ${installHint()}</div>`;
    $$('.pcard[data-id]').forEach(b => b.onclick = () => { Sfx.unlock(); Sfx.chime(); select(b.dataset.id); });
    $('#addP').onclick = () => { Sfx.unlock(); create(); };
    $('#parentBtn').onclick = () => parentGate(parent);
    $('#musicBtn').onclick = () => { Sfx.unlock(); Store.db.settings.bgMusic = Store.db.settings.bgMusic === false; Store.save(); profiles(); };
    music();
  }
  function installHint() {
    const ios = /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
    const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
    if (!ios || standalone) return '';
    return `<div class="install">Tip: Tryk på <b>Del</b> ⎙ og vælg <b>Føj til hjemmeskærm</b> for at få Nisseland som en app.</div>`;
  }
  function select(id) {
    cur = Store.profile(id);
    if (limit() && remaining() <= 0) return goodnight();
    home();
  }

  // ---------- Opret profil ----------
  // Barnet placerer ansigtet i en guide. Kun den tegnede udgave af ansigtet gemmes – på enheden.
  function photoTraits(file, onDone) {
    Avatar.loadImage(file).then(img => {
      const W = img.naturalWidth, H = img.naturalHeight, base = Math.min(W, H), S = 260;
      let zoom = 1.8, cx = W / 2, cy = H * 0.42;
      const m = modal(`<div class="cropbox"><h3>Placér dit ansigt</h3><p class="soft">Træk i billedet, så ansigtet fylder ovalen, og øjnene er ved de to prikker.</p>
        <div class="cropper" id="cr"><img id="crImg" src="${img.src}" draggable="false" alt=""><div class="cropguide"><i class="oval"></i><i class="eye l"></i><i class="eye r"></i></div></div>
        <label class="zoomlbl">🔍<input type="range" id="crZoom" min="1" max="6" step="0.02" value="${zoom}"></label>
        <div class="row center"><button class="btn ghost" id="crNo">Annuller</button><button class="btn gold" id="crOk">Tegn min nisse ✨</button></div></div>`);
      const el = $('#crImg', m), box = $('#cr', m);
      const place = () => {
        const size = base / zoom, k = S / size;
        cx = Math.max(size / 2, Math.min(W - size / 2, cx)); cy = Math.max(size / 2, Math.min(H - size / 2, cy));
        el.style.width = W * k + 'px'; el.style.left = (S / 2 - cx * k) + 'px'; el.style.top = (S / 2 - cy * k) + 'px';
      };
      let dr = null;
      box.onpointerdown = e => { dr = { x: e.clientX, y: e.clientY, cx, cy }; box.setPointerCapture(e.pointerId); };
      box.onpointermove = e => { if (!dr) return; const k = S / (base / zoom); cx = dr.cx - (e.clientX - dr.x) / k; cy = dr.cy - (e.clientY - dr.y) / k; place(); };
      box.onpointerup = box.onpointercancel = () => { dr = null; };
      $('#crZoom', m).oninput = e => { zoom = +e.target.value; place(); };
      const done = () => { URL.revokeObjectURL(img.src); m.close(); };
      $('#crNo', m).onclick = done;
      $('#crOk', m).onclick = () => { const crop = { cx, cy, size: base / zoom }; const t = Avatar.analyze(img, crop); t.portrait = Avatar.cartoon(img, crop); done(); onDone(t); };
      place();
    }).catch(() => toast('Billedet kunne ikke læses. Prøv et andet.'));
  }
  // Ansigtstræk fra billedet lægges på look; selve det tegnede ansigt på p.portrait.
  function applyPhoto(p, t) {
    const { portrait, ...traits } = t;
    Object.assign(p.look, traits);
    p.portrait = portrait;
    Store.prepare(p);
  }
  function create() {
    screen = 'create'; music();
    const d = { name: '', nisseName: '', level: 1, portrait: null,
      look: { skin: Avatar.SKINS[1], hair: Avatar.HAIRS[2], style: 'short', eyes: Avatar.EYES[0] } };
    Store.prepare(d);
    let step = 0;
    const PRE = ['Kanel', 'Glimmer', 'Snefnug', 'Pebernød', 'Stjerne', 'Nordlys', 'Klokke', 'Marcipan', 'Isblomst', 'Risengrød', 'Lanterne', 'Bolsje'];
    function draw() {
      const prev = Avatar.svg(d.look, { hat: { style: 'nisse', color: d.look.hatColor } }, { expr: step === 4 ? 'laugh' : 'happy', cls: 'bigav' });
      let body = '';
      if (step === 0) {
        const base = d.name.trim() || 'Nisse';
        const sug = PRE.slice().sort(() => Math.random() - 0.5).slice(0, 4).map((pre, i) => i % 2 ? `${base} ${pre}` : `${pre}-${base}`);
        body = `<h2>Velkommen, julehjælper!</h2><p>Hvad hedder du?</p>
          <input id="cName" maxlength="20" placeholder="Dit fornavn" value="${esc(d.name)}" autocomplete="off">
          <p>Vælg dit nissenavn:</p><div class="chips">${sug.map(s => `<button class="chip" data-n="${esc(s)}">${esc(s)}</button>`).join('')}</div>
          <input id="cNisse" maxlength="24" placeholder="Eller skriv dit eget nissenavn" value="${esc(d.nisseName)}" autocomplete="off">`;
      } else if (step === 1) {
        body = `<h2>En nisse, der ligner dig</h2><p>Tag et billede af dit ansigt. Nisserne tegner dit ansigt og sætter det på din nisse – med rød hue og rødt nissetøj.</p>
          <div class="photo"><div class="ph">📷</div></div>
          <label class="btn gold filebtn">📷 Tag eller vælg billede<input type="file" id="cPhoto" accept="image/*" capture="user" hidden></label>
          <p class="soft small">🔒 Kun den tegnede nisse gemmes, og kun her på enheden. Den sendes aldrig nogen steder hen – heller ikke ved synkronisering.</p>`;
      } else if (step === 2) {
        body = `<h2>Din nisse</h2>
          ${d.portrait ? '<p>Sådan ser du ud som nisse! Vil du have skæg eller briller?</p>' : '<p class="soft">Du har ikke taget et billede. Gå tilbage, hvis nissen skal ligne dig.</p>'}
          <div class="chips"><button class="chip ${d.look.beard ? 'on' : ''}" data-flag="beard">🧔 Fuldskæg</button><button class="chip ${d.look.glasses ? 'on' : ''}" data-flag="glasses">👓 Briller</button></div>`;
      } else if (step === 3) {
        body = `<h2>Hvilken nisseskole?</h2><p class="soft">Vælges sammen med en voksen. Det kan altid ændres i forældredelen.</p>
          <div class="levels">${[1, 2, 3, 4].map(l => `<button class="lvl ${d.level === l ? 'on' : ''}" data-l="${l}"><b>${TaskBank.LEVELS[l]}</b><small>${['Bogstaver, lyde, rim og lytning', 'Læsning, stavning og sætninger', 'Ordklasser, grammatik og skrivning', 'Analyse, virkemidler og argumentation'][l - 1]}</small></button>`).join('')}</div>`;
      } else {
        body = `<h2>${esc(d.nisseName)}</h2><p>Dit nissepas er klar! Nisse Sofus venter på dig ved låge 1.</p>`;
      }
      root.innerHTML = `<div class="create">${Art.scene('by')}<div class="cwrap pop">
        <div class="cprev">${prev}</div>
        <div class="cform">${body}
          <div class="row"><button class="btn ghost" id="cBack">${step ? '◀ Tilbage' : 'Annuller'}</button><button class="btn gold" id="cNext">${step === 4 ? 'Ind i Nisseland ✨' : 'Videre ▶'}</button></div>
          <div class="steps">${[0, 1, 2, 3, 4].map(i => `<i class="${i <= step ? 'on' : ''}"></i>`).join('')}</div></div></div></div>`;
      bind();
    }
    function bind() {
      $('#cBack').onclick = () => { if (step) { step--; draw(); } else profiles(); };
      $('#cNext').onclick = () => {
        if (step === 0) {
          d.name = $('#cName').value.trim(); d.nisseName = $('#cNisse').value.trim();
          if (!d.nisseName) { toast('Vælg eller skriv et nissenavn'); return; }
        }
        if (step === 4) {
          const p = Store.newProfile(d);
          Store.addProfile(p); cur = p; Sfx.fanfare(); home(); return;
        }
        step++; Sfx.tap(); draw();
      };
      if (step === 0) {
        $('#cName').oninput = e => { d.name = e.target.value; };
        $('#cName').onchange = () => draw();
        $$('.chip[data-n]').forEach(b => b.onclick = () => { d.nisseName = b.dataset.n; d.name = $('#cName').value.trim(); draw(); });
        $('#cNisse').oninput = e => { d.nisseName = e.target.value; };
      }
      if (step === 1) {
        $('#cPhoto').onchange = e => {
          const f = e.target.files[0]; if (!f) return;
          photoTraits(f, t => { applyPhoto(d, t); step = 2; Sfx.magic(); draw(); toast('Nisserne har tegnet dig! ✨', 4000); });
        };
      }
      if (step === 2) {
        $$('.chip[data-flag]').forEach(b => b.onclick = () => { d.look[b.dataset.flag] = !d.look[b.dataset.flag]; Sfx.tap(); draw(); });
      }
      if (step === 3) $$('.lvl').forEach(b => b.onclick = () => { d.level = +b.dataset.l; Sfx.tap(); draw(); });
    }
    draw();
  }

  // ---------- Hjem: julekalenderen ----------
  function home() {
    screen = 'home'; World.destroy(); music();
    const calDay = Store.calendarDay();
    const doors = DOOR_ORDER.map(d => {
      const open = Store.isOpen(cur, d), seen = cur.seen[d], done = (cur.phase[d] || 0) >= 5;
      const isToday = d === calDay;
      const t = cur.tasks[d]; const stars = t ? t.r.filter(v => v >= 2).length : 0;
      return `<button class="door ${open ? 'avail' : 'locked'} ${seen ? 'open' : ''} ${isToday ? 'today' : ''}" data-d="${d}">
        <span class="inside">${seen ? `<span class="iicon">${Art.icon(CHAPTERS[d - 1].gift)}</span>${stars ? `<small>★${stars}</small>` : ''}` : ''}</span>
        <span class="leaf"><b>${d}</b>${!open ? '<i>🔒</i>' : (!seen ? '<i class="new">✦</i>' : '')}</span>
        ${done ? '<span class="tick">✓</span>' : ''}</button>`;
    }).join('');
    const unseen = []; for (let d = 1; d <= 24; d++) if (Store.isOpen(cur, d) && !cur.seen[d]) unseen.push(d);
    let msg;
    if (calDay === 0 && Store.maxOpen(cur) <= 1) msg = cur.seen[1] ? 'Julekalenderen åbner rigtigt d. 1. december. Indtil da kan du gå på opdagelse i Nissebyen på kortet!' : 'Hej {navn}! Låge 1 er åben allerede nu. Tryk på den, så starter eventyret!';
    else if (unseen.length === 1) msg = `Låge ${unseen[0]} venter på dig, {navn}!`;
    else if (unseen.length > 1) msg = `Låge ${unseen.join(', ')} er åbne. Du kan tage dem i dit eget tempo – der er ingen hast.`;
    else if (cur.finale) msg = 'Du reddede julen, {navn}! Du kan altid besøge Nisseland og finde flere hemmeligheder på kortet.';
    else msg = 'Du er helt med! Gå på opdagelse på kortet – der gemmer sig hemmeligheder overalt.';
    root.innerHTML = `${topbar()}<main class="home">${Art.scene('nord')}
      <div class="cal pop"><h1 class="caltitle">Julebogens kalender</h1><div class="doors">${doors}</div></div>
      <div id="homeBubble"></div></main>`;
    bindTop();
    bubble($('#homeBubble'), 'sofus', msg, { close: false });
    $$('.door').forEach(b => b.onclick = () => {
      const d = +b.dataset.d;
      if (!Store.isOpen(cur, d)) { Sfx.soft(); toast(`Låge ${d} åbner d. ${d}. december ❄`); return; }
      Sfx.door(); b.classList.add('opening');
      setTimeout(() => chapter(d), 550);
    });
  }

  // ---------- Kapitel ----------
  function chapter(day, startPhase) {
    screen = 'chapter'; World.destroy();
    const ch = CHAPTERS[day - 1];
    const reached = cur.phase[day] || 0;
    let ph = startPhase != null ? startPhase : (reached >= 5 ? 0 : reached);
    const region = regionOfDay(day);
    function setPhase(n) {
      ph = n; cur.phase[day] = Math.max(cur.phase[day] || 0, n); save(); render();
    }
    function render() {
      World.destroy();
      root.innerHTML = `${topbar()}<main class="chap">${ph === 1 ? '' : Art.scene(region)}
        <div class="chead"><div class="ctitle"><small>${day}. december</small><h2>${esc(ch.title)}</h2></div>
        <div class="phases">${PHASES.map((n, i) => `<button class="ph ${i === ph ? 'on' : ''} ${i <= (cur.phase[day] || 0) ? 'reach' : ''}" data-i="${i}">${n}</button>`).join('')}</div></div>
        <div class="cmain" id="cm"></div></main>`;
      bindTop();
      $$('.ph').forEach(b => b.onclick = () => { const i = +b.dataset.i; if (i <= (cur.phase[day] || 0)) { Sfx.tap(); ph = i; render(); } else toast('Følg historien – du kommer dertil om lidt!'); });
      const cm = $('#cm');
      exploring = ph === 1; music();
      [story, explore, mission, gift, ending][ph](cm);
    }
    function story(cm) {
      stage(cm, ch.scene, () => {
        if (!cur.seen[day]) { cur.seen[day] = true; Sfx.magic(); toast(`📜 Julebogens side ${day} er fundet!`); }
        setPhase(1);
      });
    }
    function explore(cm) {
      cm.innerHTML = `<div class="mapwrap" id="mw"></div><div class="maphud"><div id="mapMsg"></div>
        <div class="row"><button class="btn ghost small" id="skipEx">Spring udforskning over ▶</button></div></div>`;
      const s = SPOTS[ch.spot];
      World.mount($('#mw'), cur, {
        target: ch.spot,
        onSpot: id => {
          if (id === ch.spot) {
            Sfx.magic();
            const m = modal(`<div class="found">${Art.portrait('fortael')}<h3>${esc(s.name)}</h3><p>${esc(fmt(ch.find))}</p><button class="btn gold" id="fOk">Videre til missionen ▶</button></div>`);
            if (cur.level <= 2) Sfx.speak(fmt(ch.find));
            $('#fOk', m).onclick = () => { m.close(); setPhase(2); };
          } else if (INTERIORS[id]) enter(id);
          else { $('#mapMsg').innerHTML = ''; bubble($('#mapMsg'), 'sofus', `${SPOTS[id].name}: ${SPOTS[id].text}`, { ttl: 6000 }); }
        },
        onSecret: s2 => secretFound(s2),
        onMsg: (t, who) => { $('#mapMsg').innerHTML = ''; bubble($('#mapMsg'), who || 'sofus', t, { ttl: 6000 }); },
        onMove: save
      });
      setTimeout(() => World.centerOn(ch.spot), 50);
      bubble($('#mapMsg'), 'sofus', `Gå hen til ${s.name} – følg den gyldne stjerne! Tryk på stedet på kortet.`, { ttl: 9000 });
      $('#skipEx').onclick = () => setPhase(2);
    }
    function mission(cm) {
      const tasks = TaskBank.forDay(cur.level, day);
      cur.tasks[day] = cur.tasks[day] || { r: [] };
      const st = cur.tasks[day];
      while (st.r.length < tasks.length) st.r.push(null);
      cm.innerHTML = `<div class="mission"><div class="mintro">${Art.portrait(['sofus', 'frida', 'rudolf', 'pil'][day % 4], cur)}<p>${esc(fmt(ch.mission))}</p>
        <button class="btn ghost small" id="mLater">Gem og fortsæt historien ▶</button></div><div id="tasks"></div></div>`;
      $('#mLater').onclick = () => { save(); setPhase(3); };
      TaskUI.run($('#tasks'), tasks, st, {
        level: cur.level,
        onResult: (i, v) => {
          const prev = st.r[i];
          if (prev == null || v > prev) st.r[i] = v;
          if (v >= 2 && (prev == null || prev < 2)) addStars(1);
          save();
          const s = $('.stats span'); if (s) s.textContent = `★ ${cur.stars}`;
        },
        getWriting: () => cur.writings[day] || '',
        onWrite: txt => { cur.writings[day] = txt; save(); },
        onFinish: () => setPhase(3)
      });
    }
    function gift(cm) {
      const id = ch.gift, it = ITEMS[id];
      const already = !!cur.gifts[day];
      cm.innerHTML = `<div class="giftwrap"><p class="gtitle">${already ? 'Din gave fra i dag' : 'Der står en gave til dig!'}</p>
        <button class="gbox ${already ? 'opened' : ''}" id="gbox">${Art.giftBox(['#c8102e', '#1f5d3a', '#2f6db0', '#5b3c88'][day % 4], '#ffd36b')}</button>
        <div class="greveal" id="greveal" ${already ? '' : 'hidden'}><div class="gicon">${Art.icon(id)}</div><h3>${esc(it.name)}</h3><p>${esc(it.desc)}</p>
        <div class="row center">${it.slot ? '<button class="btn gold" id="gWear">Tag den på ✨</button>' : ''}<button class="btn" id="gNext">Videre ▶</button></div></div>
        ${already ? '' : '<p class="soft">Tryk på gaven for at åbne den</p>'}</div>`;
      const reveal = () => {
        $('#gbox').classList.add('opened'); $('#greveal').hidden = false;
        const hint = $('.giftwrap > .soft'); if (hint) hint.remove();
        if (!cur.gifts[day]) { cur.gifts[day] = true; giveItem(id, true); save(); Sfx.gift(); TaskUI.burst($('#gbox')); if (cur.level <= 2) Sfx.speak(`Du fik: ${it.name}!`); }
      };
      $('#gbox').onclick = reveal;
      const w = $('#gWear'); if (w) w.onclick = () => { if (!cur.gifts[day]) reveal(); cur.equip[it.slot] = id; save(); Sfx.magic(); toast(`Du har nu ${it.name} på!`); };
      $('#gNext').onclick = () => { if (!cur.gifts[day]) reveal(); setPhase(4); };
    }
    function ending(cm) {
      stage(cm, ch.end, () => {
        cur.phase[day] = 5; save();
        if (day === 24) return finale();
        const m = modal(`<div class="found"><h3>✨ Nisseland har ændret sig</h3><p>${esc(ch.change)}</p>
          <p class="soft">Kapitel ${day} er gemt i Julebogen. ${day < 24 ? 'Næste kapitel venter bag en ny låge.' : ''}</p>
          <div class="row center"><button class="btn" id="eMap">Gå på opdagelse 🗺️</button><button class="btn gold" id="eCal">Til kalenderen 🗓️</button></div></div>`);
        Sfx.chime();
        $('#eMap', m).onclick = () => { m.close(); map(); };
        $('#eCal', m).onclick = () => { m.close(); home(); };
      });
    }
    render();
  }

  // Scene med figurer på en scene + dialogboks.
  function stage(cm, lines, done) {
    let i = 0, typing = null;
    cm.innerHTML = `<div class="stage"><div class="actor left" id="aMe">${Avatar.svg(cur.look, cur.equip, { expr: 'happy' })}</div><div class="actor right" id="aNpc"></div></div>
      <div class="dlg pop"><div class="dpor" id="dPor"></div><div class="dbox" id="dBox"><div class="dname" id="dName"></div><div class="dtext" id="dText"></div>
      <div class="dbtns"><button class="speak" id="dSay" title="Læs op">🔊</button><span class="dcount" id="dCount"></span><button class="btn gold" id="dNext">Videre ▶</button></div></div></div>`;
    const showLine = () => {
      const [who, raw] = lines[i];
      const txt = fmt(raw);
      $('#dPor').innerHTML = Art.portrait(who, cur, who === 'player' ? 'laugh' : 'happy');
      $('#dName').textContent = fmt(CHARS[who].name);
      $('#dCount').textContent = `${i + 1}/${lines.length}`;
      const npc = $('#aNpc');
      if (who !== 'player' && who !== 'fortael') {
        npc.innerHTML = Avatar.NPC[who] ? Avatar.svg(Avatar.NPC[who].look, Avatar.NPC[who].equip, { expr: /!|\?/.test(txt) ? 'wow' : 'happy' }) : `<div class="bigpor">${Art.portrait(who)}</div>`;
        npc.className = 'actor right talk';
      }
      $('#aMe').innerHTML = Avatar.svg(cur.look, cur.equip, { expr: who === 'player' ? 'laugh' : (/!/.test(txt) ? 'wow' : 'happy') });
      $('#aMe').className = 'actor left' + (who === 'player' ? ' talk' : '');
      const el = $('#dText'); el.textContent = '';
      let k = 0; clearInterval(typing);
      typing = setInterval(() => { k += 2; el.textContent = txt.slice(0, k); if (k >= txt.length) { clearInterval(typing); typing = null; } }, 22);
      if (cur.level <= 2) Sfx.speak(txt);
    };
    const next = () => {
      if (typing) { clearInterval(typing); typing = null; $('#dText').textContent = fmt(lines[i][1]); return; }
      Sfx.tap(); i++;
      if (i >= lines.length) { clearInterval(typing); Sfx.stopSpeak(); done(); } else showLine();
    };
    $('#dNext').onclick = e => { e.stopPropagation(); next(); };
    $('#dBox').onclick = next;
    $('#dSay').onclick = e => { e.stopPropagation(); Sfx.speak(fmt(lines[i][1])); };
    showLine();
  }

  // ---------- Finale ----------
  function finale() {
    // Alle sider og gaver samles – uanset hvor mange opgaver barnet nåede.
    const missing = [];
    for (let d = 1; d <= 24; d++) {
      if (!cur.seen[d]) { cur.seen[d] = true; missing.push(d); }
      if (!cur.gifts[d]) { cur.gifts[d] = true; giveItem(CHAPTERS[d - 1].gift, true); }
    }
    cur.finale = true; save();
    const pages = Array.from({ length: 24 }, (_, i) => `<span class="fpage" style="--i:${i};--a:${(i * 37) % 360}deg">${i + 1}</span>`).join('');
    const m = modal(`<div class="finale">${Art.scene('nord')}
      <div class="fbook"><div class="fglow"></div>${pages}<div class="fcover">📖</div></div>
      <div class="sleigh">🦌🦌🦌🛷</div>
      <div class="ftext"><h1>Julen er reddet!</h1>
      <p>Julebogen lyser igen, og nordlyset danser over hele Nisseland.</p>
      ${missing.length ? `<p class="soft">Nisserne og Isdragen har hjulpet med at finde de sidste ${missing.length} sider – sådan gør man i Nisseland: Man hjælper hinanden. 💛</p>` : ''}
      <div class="diploma">${Avatar.svg(cur.look, cur.equip, { portrait: true, expr: 'laugh' })}
        <div><small>Nisseakademiet udnævner hermed</small><h2>${esc(cur.nisseName)}</h2><small>til</small><h3>Æres-julehjælper</h3><small>Glædelig jul fra Julemanden, Sofus, Frida, Rudolf og Isdragen</small></div></div>
      <button class="btn gold" id="fDone">Glædelig jul! 🎄</button></div></div>`, 'full');
    Sfx.fanfare(); setTimeout(() => Sfx.gift(), 1600);
    Sfx.speak(`Julen er reddet! Glædelig jul, ${cur.nisseName}!`);
    const fw = setInterval(() => { if (!m.isConnected) return clearInterval(fw); const r = { left: Math.random() * innerWidth, top: Math.random() * innerHeight * 0.5, width: 0, height: 0 }; const host = document.createElement('div'); host.style.cssText = `position:fixed;left:${r.left}px;top:${r.top}px;width:1px;height:1px`; document.body.appendChild(host); TaskUI.burst(host); setTimeout(() => host.remove(), 1100); }, 500);
    $('#fDone', m).onclick = () => { clearInterval(fw); m.close(); pass(); };
  }

  // ---------- Kort (fri udforskning) ----------
  function map() {
    screen = 'map';
    const tools = [['kikkert', '🔭', 'Kikkert'], ['lygte', '🏮', 'Lygte'], ['kompas', '🧭', 'Kompas']].filter(([id]) => cur.inventory.includes(id));
    root.innerHTML = `${topbar()}<main class="mapscreen"><div class="mapwrap" id="mw"></div>
      <div class="maptools">${tools.map(([id, ic, n]) => `<button class="tool" data-t="${id}" title="${n}">${ic}<i>${n}</i></button>`).join('')}
        <button class="tool" id="zIn" title="Zoom ind">＋</button><button class="tool" id="zOut" title="Zoom ud">－</button><button class="tool" id="zAll" title="Oversigtskort">🗺️<i>Oversigt</i></button></div>
      <div class="maphud"><div id="mapMsg"></div></div>
      <div class="secretcount">✨ ${cur.secrets.length}/${SECRETS.length} hemmeligheder</div></main>`;
    bindTop();
    World.mount($('#mw'), cur, {
      onSpot: id => spotInfo(id),
      onSecret: s => { secretFound(s); const c = $('.secretcount'); if (c) c.textContent = `✨ ${cur.secrets.length}/${SECRETS.length} hemmeligheder`; },
      onMsg: (t, who) => { $('#mapMsg').innerHTML = ''; bubble($('#mapMsg'), who || 'sofus', t, { ttl: 6000 }); },
      onMove: save
    });
    $$('.tool[data-t]').forEach(b => b.onclick = () => {
      const t = World.setTool(b.dataset.t);
      $$('.tool[data-t]').forEach(x => x.classList.toggle('on', x.dataset.t === t));
      Sfx.magic();
      const tips = { kikkert: 'Kig godt efter – kikkerten viser steder, der normalt er skjulte.', lygte: 'Lygten lyser op i mørket. Gå rundt i skoven og se, hvad der dukker op!', kompas: 'Følg den gyldne nål – den peger mod en hemmelighed.' };
      if (t) { $('#mapMsg').innerHTML = ''; bubble($('#mapMsg'), 'sofus', tips[t], { ttl: 6000 }); }
    });
    $('#zIn').onclick = () => World.zoom(0.8); $('#zOut').onclick = () => World.zoom(1.25);
    music();
    $('#zAll').onclick = () => { const on = World.toggleOverview(); $('#zAll').classList.toggle('on', on); };
    if (!cur.secrets.length) bubble($('#mapMsg'), 'sofus', 'Tryk et sted på kortet for at gå derhen. Træk for at kigge rundt. Der gemmer sig små hemmeligheder overalt!', { ttl: 9000 });
  }
  function spotInfo(id) {
    const s = SPOTS[id];
    const chs = CHAPTERS.filter(c => c.spot === id && Store.isOpen(cur, c.d));
    const inside = INTERIORS[id];
    const m = modal(`<div class="found"><h3>${esc(s.name)}</h3><p>${esc(s.text)}</p>
      ${inside ? `<button class="btn gold" id="sIn">${inside.room === 'outdoor' || inside.room === 'forest' || inside.room === 'ice' ? '👀 Kig dig omkring' : '🚪 Gå indenfor'}</button>` : ''}
      ${chs.map(c => `<button class="btn ${cur.seen[c.d] ? '' : 'gold'}" data-d="${c.d}">${cur.seen[c.d] ? '↻ Genoplev' : '✦ Start'} kapitel ${c.d}: ${esc(c.title)}</button>`).join('')}
      <button class="btn ghost" id="sClose">Gå videre</button></div>`);
    if (inside) $('#sIn', m).onclick = () => { m.close(); enter(id); };
    $$('[data-d]', m).forEach(b => b.onclick = () => { m.close(); chapter(+b.dataset.d, cur.seen[+b.dataset.d] ? 0 : undefined); });
    $('#sClose', m).onclick = () => m.close();
  }
  // Inde i et hus. Indendørs rum er rigtig 3D; udendørs steder er tegnede scener.
  function enter(id) {
    const it = INTERIORS[id];
    cur.props = cur.props || [];
    if (Room3D.supports(it.room)) enter3d(id); else enter2d(id);
  }
  function tapProp(id, i, fx, say, onStar) {
    const it = INTERIORS[id], [ic, , , text, star, key] = it.props[i];
    Sfx.magic();
    const k = id + i;
    if (star && !cur.props.includes(k)) {
      cur.props.push(k); addStars(1); save(); onStar(); toast('+1 ★ Du fandt noget særligt!');
      const st = $('.stats span'); if (st) st.textContent = `★ ${cur.stars}`;
    }
    const art = Art.propArt(ic, key), act = art && ROOM_ACTIONS[art.key];
    say('player', (act && act(fx, i)) || text);
  }
  function enter3d(id) {
    const it = INTERIORS[id], s = SPOTS[id], npc = it.who;
    const day = Store.maxOpen(cur);
    // new things turn up as December goes on (8th field = first day)
    const vis = it.props.map((p, i) => [p, i]).filter(([p]) => !(p[7] > day));
    const npcSvg = Avatar.NPC[npc] ? Avatar.svg(Avatar.NPC[npc].look, Avatar.NPC[npc].equip, { expr: 'happy' }) : Art.fullBody(npc);
    const npcArt = { raev: 'raev', drage: 'drage' }[npc];
    const outside = ['outdoor', 'forest', 'ice'].includes(it.room);
    const m = modal(`<div class="room">
      <div class="r3dhost" id="r3d"></div>
      <div class="roomtitle">${esc(s.name)}</div>
      <div class="r3dhint">👆 Træk for at kigge rundt · Tryk på ${outside ? 'sneen' : 'gulvet'} for at gå · Tryk på tingene</div>
      <div class="roomhud" id="roomHud"></div>
      <button class="btn gold roomexit" id="rExit">⟵ Gå ud</button></div>`, 'full');
    const roomEl = $('.room', m), hud = $('#roomHud', m);
    const say = (who, t) => { hud.innerHTML = ''; bubble(hud, who, t); };
    const props = vis.map(([[ic, , , , , key]]) => { const a = Art.propArt(ic, key); return a ? { key: a.key, svg: a.svg, emoji: ic } : { key: null, svg: null, emoji: ic }; });
    const room = Room3D.open($('#r3d', m), {
      kind: it.room, place: id, day, props,
      npc: npc === 'fortael' ? null : npcSvg ? { svg: npcSvg, h: Avatar.NPC[npc] ? 1.45 : 1.75 } : npcArt ? { art: npcArt, h: npc === 'drage' ? 2.6 : 1.2 } : null,
      onTap: k => {
        if (k < 0) { say(npc, it.hello); return; }
        tapProp(id, vis[k][1], fx, say, () => room.setShiny(k, false));
      },
    });
    const fx = Object.assign({}, room.fx, { confetti: () => confetti(roomEl) });
    vis.forEach(([[, , , , star], i], k) => room.setShiny(k, !!star && !cur.props.includes(id + i)));
    say(npc, it.hello);
    Sfx.door();
    const close = m.close;
    m.close = () => { Room3D.close(); close(); };
    setTimeout(() => { const h = $('.r3dhint', m); if (h) h.classList.add('fade'); }, 6000);
    $('#rExit', m).onclick = () => { Sfx.stopSpeak(); m.close(); };
  }
  function enter2d(id) {
    const it = INTERIORS[id], s = SPOTS[id];
    const npc = it.who;
    const npcSvg = Avatar.NPC[npc] ? Avatar.svg(Avatar.NPC[npc].look, Avatar.NPC[npc].equip, { expr: 'happy' }) : (Art.fullBody(npc) || `<div class="bigpor">${Art.portrait(npc)}</div>`);
    const propBtn = ([ic, x, y, , star, key, size], i) => {
      const art = Art.propArt(ic, key, size), cls = `prop ${star && !cur.props.includes(id + i) ? 'shiny' : ''}`;
      if (!art) return `<button class="${cls}" data-i="${i}" style="left:${x}%;top:${y}%">${ic}</button>`;
      return `<button class="${cls} art ${art.size >= 30 ? 'back' : ''}" data-i="${i}" style="left:${x}%;top:${y}%;width:${art.size}%">${art.svg}</button>`;
    };
    const m = modal(`<div class="room">${Art.room(it.room)}
      <div class="roomtitle">${esc(s.name)}</div>
      <div class="ractor me">${Avatar.svg(cur.look, cur.equip, { expr: 'wow' })}</div>
      ${npc !== 'fortael' ? `<div class="ractor npc">${npcSvg}</div>` : ''}
      ${it.props.map(propBtn).join('')}
      <div class="roomhud" id="roomHud"></div>
      <button class="btn gold roomexit" id="rExit">⟵ Gå ud</button></div>`, 'full');
    const roomEl = $('.room', m), hud = $('#roomHud', m);
    const say = (who, t) => { hud.innerHTML = ''; bubble(hud, who, t); };
    say(npc, it.hello);
    Sfx.door();
    $$('.prop', m).forEach(b => b.onclick = () => {
      b.classList.add('poke'); setTimeout(() => b.classList.remove('poke'), 500);
      tapProp(id, +b.dataset.i, domFx(roomEl, b), say, () => { b.classList.remove('shiny'); TaskUI.burst(b); });
    });
    $('#rExit', m).onclick = () => { Sfx.stopSpeak(); m.close(); };
  }

  // ---------- Små ting man kan gøre inde i husene ----------
  const center = (room, el) => { const r = room.getBoundingClientRect(), e = el.getBoundingClientRect(); return [e.left + e.width / 2 - r.left, e.top + e.height / 2 - r.top]; };
  function confetti(room) {
    const cols = ['#ff5f5f', '#ffd36b', '#5ec8ff', '#7ee08a', '#ff7fd0', '#b07cff', '#fff'];
    for (let i = 0; i < 90; i++) {
      const c = document.createElement('i');
      c.className = 'confetti-bit';
      c.style.left = Math.random() * 100 + '%'; c.style.background = cols[i % cols.length];
      c.style.animationDuration = (1.6 + Math.random() * 1.6) + 's'; c.style.animationDelay = (Math.random() * 0.4) + 's';
      room.appendChild(c);
      setTimeout(() => c.remove(), 3800);
    }
  }
  // Same effects as the 3D rooms, made with DOM elements for the drawn (2D) scenes
  function domFx(room, self) {
    const el = t => (t === 'npc' ? $('.ractor.npc', room) : t === 'fire' ? $('.hearth', room) : self);
    return {
      fly(from, to, emoji, done) {
        const a = el(from), b = el(to);
        if (!a || !b) { if (done) done(); return; }
        const [x0, y0] = center(room, a), [x1, y1] = center(room, b);
        const f = document.createElement('span');
        f.className = 'flyer'; f.textContent = emoji;
        f.style.left = x0 + 'px'; f.style.top = y0 + 'px';
        room.appendChild(f);
        requestAnimationFrame(() => requestAnimationFrame(() => { f.style.left = x1 + 'px'; f.style.top = y1 + 'px'; f.style.transform = 'translate(-50%, -50%) rotate(300deg) scale(.8)'; }));
        setTimeout(() => { f.remove(); if (done) done(); }, 750);
      },
      floaters(t, emoji, n) {
        const e = el(t); if (!e) return;
        const [x, y] = center(room, e);
        for (let i = 0; i < n; i++) {
          const f = document.createElement('span');
          f.className = 'floaty'; f.textContent = emoji;
          f.style.left = (x + (Math.random() - 0.5) * 120) + 'px'; f.style.top = (y - Math.random() * 60) + 'px'; f.style.animationDelay = (i * 0.12) + 's';
          room.appendChild(f);
          setTimeout(() => f.remove(), 2200 + i * 120);
        }
      },
      roar() { room.querySelectorAll('.hearth').forEach(f => { f.classList.add('roar'); setTimeout(() => f.classList.remove('roar'), 5000); }); },
      bob(t) { const e = el(t); if (!e) return; e.classList.add('munch'); setTimeout(() => e.classList.remove('munch'), 1800); },
      swing() { const s = self.querySelector('.swing'); if (!s) return; s.classList.add('ring'); setTimeout(() => s.classList.remove('ring'), 1800); },
      confetti() { confetti(room); },
    };
  }
  const ROOM_ACTIONS = {
    carrots: (fx, i) => {
      fx.fly(i, 'npc', '🥕', () => { fx.bob('npc'); fx.floaters('npc', '❤️', 5); Sfx.good(); });
      return 'Du tager en gulerod fra spanden og giver den til Rudolf. Han spiser den glad, og hans røde næse lyser ekstra klart!';
    },
    woodBasket: (fx, i) => {
      fx.fly(i, 'fire', '🪵', () => { fx.roar(); fx.floaters('fire', '✨', 6); Sfx.soft(); });
      return 'Du lægger et stykke brænde på. Ilden blusser op, og hele rummet bliver varmt og hyggeligt.';
    },
    redButton: fx => { fx.confetti(); Sfx.gift(); return null; },
    cocoa: (fx, i) => { fx.floaters(i, '\ud83d\udc9b', 5); Sfx.good(); return null; },
    bells: (fx, i) => { fx.swing(i); Sfx.chime(); return null; },
    churchBell: (fx, i) => { fx.swing(i); Sfx.chime(); return null; },
  };

  function secretFound(s) {
    const isNew = !cur.secrets.includes(s.id);
    if (isNew) { cur.secrets.push(s.id); addStars(1); }
    if (s.reward) giveItem(s.reward, true);
    save(); Sfx.magic();
    const m = modal(`<div class="found"><h3>${isNew ? '✨ Hemmelighed fundet!' : 'Hemmelighed'}</h3><p>${esc(s.text)}</p>
      ${s.reward ? `<div class="gicon">${Art.icon(s.reward)}</div><p><b>${esc(ITEMS[s.reward].name)}</b> er lagt i din nissesæk.</p>` : ''}
      ${isNew ? '<p class="soft">+1 ★</p>' : ''}<button class="btn gold" id="sOk">Fedt!</button></div>`);
    if (cur.level <= 2) Sfx.speak(s.text);
    $('#sOk', m).onclick = () => m.close();
  }

  // ---------- Nissesæk ----------
  function sack() {
    screen = 'sack'; World.destroy(); music();
    const SLOTN = { hat: 'Huer', cape: 'Kapper', boots: 'Støvler', back: 'Rygsække', hand: 'I hånden', neck: 'Om halsen', '': 'Samleting' };
    let sel = null;
    function draw(expr = 'happy') {
      const groups = {};
      cur.inventory.forEach(id => { const it = ITEMS[id]; if (!it) return; (groups[it.slot] = groups[it.slot] || []).push(id); });
      root.innerHTML = `${topbar()}<main class="sack">${Art.scene('by')}<div class="sackwrap pop">
        <div class="sackav">${Avatar.svg(cur.look, cur.equip, { expr })}<p>${esc(cur.nisseName)}</p></div>
        <div class="sackgrid"><h2>Min nissesæk</h2>
        ${Object.keys(SLOTN).filter(k => groups[k]).map(k => `<h4>${SLOTN[k]}</h4><div class="items">${groups[k].map(id => `<button class="item ${Object.values(cur.equip).includes(id) ? 'worn' : ''} ${sel === id ? 'sel' : ''}" data-id="${id}" title="${esc(ITEMS[id].name)}">${Art.icon(id)}</button>`).join('')}</div>`).join('')}
        <div class="idetail" id="idetail">${sel ? detail(sel) : '<p class="soft">Tryk på en ting for at se den – og tage den på.</p>'}</div></div></div></main>`;
      bindTop();
      $$('.item').forEach(b => b.onclick = () => { sel = b.dataset.id; Sfx.tap(); draw('think'); });
      const w = $('#iWear'); if (w) w.onclick = () => {
        const it = ITEMS[sel];
        if (cur.equip[it.slot] === sel) { if (it.slot === 'hat') cur.equip.hat = 'start_hue'; else if (it.slot === 'cape') cur.equip.cape = 'start_kappe'; else delete cur.equip[it.slot]; }
        else cur.equip[it.slot] = sel;
        save(); Sfx.magic(); draw('wow');
      };
    }
    function detail(id) {
      const it = ITEMS[id];
      const worn = cur.equip[it.slot] === id;
      const canOff = !(['start_hue', 'start_kappe'].includes(id));
      return `<div class="gicon">${Art.icon(id)}</div><div><h3>${esc(it.name)}</h3><p>${esc(it.desc)}</p>
        ${it.slot ? (worn ? (canOff ? '<button class="btn" id="iWear">Tag den af</button>' : '<span class="soft">Har du på</span>') : '<button class="btn gold" id="iWear">Tag den på ✨</button>') : '<span class="soft">En samleting – den ligger trygt i sækken.</span>'}
        ${it.tool ? '<p class="soft small">Kan bruges på kortet 🗺️</p>' : ''}</div>`;
    }
    draw();
  }
  // ---------- Nissepas ----------
  function pass() {
    screen = 'pass'; World.destroy(); music();
    const stamps = Array.from({ length: 24 }, (_, i) => {
      const d = i + 1, s = cur.seen[d], t = cur.tasks[d], st = t ? t.r.filter(v => v >= 2).length : 0;
      return `<span class="stamp ${s ? 'on' : ''}">${s ? (st ? '★' : '✓') : d}</span>`;
    }).join('');
    const writings = Object.entries(cur.writings || {}).filter(([, v]) => v);
    root.innerHTML = `${topbar()}<main class="passscreen">${Art.scene('by')}<div class="passcard pop">
      <div class="pleft">${Avatar.svg(cur.look, cur.equip, { expr: 'laugh', cls: 'passav' })}</div>
      <div class="pright"><small>NISSEPAS · NISSELAND</small><h1>${esc(cur.nisseName)}</h1>
        <p>${cur.finale ? '🏅 Æres-julehjælper' : (cur.seen[22] ? '🎓 Akademi-julehjælper' : '⭐ Officiel julehjælper')}</p>
        <div class="pstats"><span>★ ${cur.stars} stjerner</span><span>📜 ${pagesFound()}/24 sider</span><span>✨ ${cur.secrets.length}/${SECRETS.length} hemmeligheder</span><span>🎒 ${cur.inventory.length} ting</span></div>
        <h4>Stempler</h4><div class="stamps">${stamps}</div>
        ${writings.length ? `<h4>Mine breve til nisserne</h4><div class="writings">${writings.map(([d, v]) => `<div><b>${d}. dec</b><p>${esc(v)}</p></div>`).join('')}</div>` : ''}
      </div></div></main>`;
    bindTop();
  }

  // ---------- Julebogen ----------
  function book() {
    screen = 'book'; World.destroy(); music();
    root.innerHTML = `${topbar()}<main class="bookscreen">${Art.scene('nord')}<div class="bookwrap pop"><h1>Julebogen</h1>
      <p class="soft">Hver side er et kapitel i dit eventyr. Tryk på en side for at læse den igen.</p>
      <div class="pages">${CHAPTERS.map(c => {
        const open = Store.isOpen(cur, c.d), seen = cur.seen[c.d];
        return `<button class="page ${seen ? 'on' : ''} ${open ? '' : 'locked'}" data-d="${c.d}"><b>${c.d}</b><span>${seen ? esc(c.title) : open ? 'Klar til at blive fundet' : `Åbner ${c.d}. dec`}</span></button>`;
      }).join('')}</div></div></main>`;
    bindTop();
    $$('.page').forEach(b => b.onclick = () => {
      const d = +b.dataset.d;
      if (!Store.isOpen(cur, d)) { toast(`Siden dukker op d. ${d}. december`); return; }
      chapter(d, cur.seen[d] ? 0 : undefined);
    });
  }

  // ---------- Forældre ----------
  function parentGate(next) {
    const pin = Store.db.settings.pin;
    const a = 3 + Math.floor(Math.random() * 7), b = 4 + Math.floor(Math.random() * 6);
    const m = modal(`<div class="gate"><h3>Kun for voksne</h3>
      ${pin ? '<p>Indtast forældre-PIN</p><input id="gIn" type="password" inputmode="numeric" maxlength="8" autocomplete="off">' : `<p>Hvad er ${a} × ${b}?</p><input id="gIn" inputmode="numeric" maxlength="3" autocomplete="off">`}
      <div class="row center"><button class="btn ghost" id="gNo">Annuller</button><button class="btn gold" id="gOk">OK</button></div></div>`);
    const inp = $('#gIn', m); setTimeout(() => inp.focus(), 50);
    const ok = () => {
      if (pin ? inp.value === pin : +inp.value === a * b) { m.close(); next(); }
      else { inp.value = ''; inp.classList.add('shake'); setTimeout(() => inp.classList.remove('shake'), 400); }
    };
    $('#gOk', m).onclick = ok; inp.onkeydown = e => { if (e.key === 'Enter') ok(); };
    $('#gNo', m).onclick = () => m.close();
  }
  function parent() {
    screen = 'parent'; World.destroy(); music();
    const st = Store.db.settings;
    const ps = Store.db.profiles;
    root.innerHTML = `<main class="parent"><div class="pwrap">
      <div class="row between"><h1>Forældredel</h1><button class="btn" id="pBack">◀ Tilbage</button></div>
      ${ps.length ? '' : '<p>Der er endnu ingen profiler.</p>'}
      ${ps.map(p => {
        const t = p.time.date === Store.today() ? p.time.used : 0;
        const mission = Object.values(p.tasks).reduce((a, x) => a + x.r.filter(v => v >= 2).length, 0);
        return `<section class="pprof" data-id="${p.id}"><div class="row"><div class="ppav">${Avatar.svg(p.look, p.equip, { portrait: true })}</div>
          <div><h2>${esc(p.nisseName)}</h2><small>${esc(p.name || '')} · oprettet ${new Date(p.created).toLocaleDateString('da-DK')}</small></div></div>
          <div class="pgrid">
            <label>Niveau<select data-f="level">${[1, 2, 3, 4].map(l => `<option value="${l}" ${p.level === l ? 'selected' : ''}>${TaskBank.LEVELS[l]}</option>`).join('')}</select></label>
            <label>Skærmtid pr. dag<select data-f="minutes">${[10, 15, 20, 25, 30, 45, 0].map(n => `<option value="${n}" ${p.minutes === n ? 'selected' : ''}>${n ? n + ' min' : 'Ingen grænse'}</option>`).join('')}</select></label>
            <label>Brugt i dag<span class="val">${Math.floor(t / 60)} min ${t % 60} s <button class="btn small" data-act="reset">Nulstil</button></span></label>
            <label>Låg op til og med dag<select data-f="unlockTo">${Array.from({ length: 25 }, (_, i) => `<option value="${i}" ${p.unlockTo === i ? 'selected' : ''}>${i ? i + '. december' : 'Følg kalenderen'}</option>`).join('')}</select></label>
          </div>
          <details><summary>Lås enkelte låger op</summary><div class="dgrid">${Array.from({ length: 24 }, (_, i) => `<label class="dchk"><input type="checkbox" data-door="${i + 1}" ${p.unlocked.includes(i + 1) ? 'checked' : ''} ${Store.calendarDay() > i || i === 0 ? 'disabled checked' : ''}>${i + 1}</label>`).join('')}</div></details>
          <p class="soft small">Fremskridt: ${Object.keys(p.seen).length}/24 kapitler set · ${mission} opgaver løst · ★ ${p.stars} · ${p.secrets.length} hemmeligheder.</p>
          <div class="row wrap"><label class="btn small filebtn">📷 Tegn nissen ud fra et nyt billede<input type="file" accept="image/*" data-act="photo" hidden></label>
          <button class="btn small ${p.look.beard ? 'gold' : ''}" data-act="beard">🧔 Fuldskæg</button><button class="btn small ${p.look.glasses ? 'gold' : ''}" data-act="glasses">👓 Briller</button>
          ${p.portrait ? '<button class="btn small" data-act="nophoto">Fjern billedet</button>' : ''}
          <button class="btn small danger" data-act="delete">Slet profil</button></div></section>`;
      }).join('')}
      <section><h2>Indstillinger</h2>
        <div class="pgrid"><label>Forældre-PIN (valgfri)<input id="pPin" type="password" inputmode="numeric" maxlength="8" value="${esc(st.pin || '')}" placeholder="Ingen – regnestykke bruges"></label></div>
        <div class="row wrap"><button class="btn small" id="pSavePin">Gem PIN</button></div></section>
      <section><h2>Flere enheder (iPads)</h2>
        <p>Fremskridt gemmes altid automatisk på enheden. For at bruge samme profil på flere iPads kan I enten:</p>
        <h4>1 · Flyt med en fil (ingen konto nødvendig)</h4>
        <div class="row wrap"><button class="btn small" id="pExport">⬇ Gem fremskridt som fil</button><label class="btn small filebtn">⬆ Indlæs fil<input type="file" id="pImport" accept="application/json,.json" hidden></label></div>
        <p class="soft small">Indlæsning fletter – intet fremskridt overskrives eller går tabt.</p>
        <h4>2 · Automatisk synkronisering (gratis Supabase-database)</h4>
        <p class="soft small">Opret et gratis projekt på supabase.com, kør SQL'en herunder i SQL Editor, og indsæt projektets URL og "anon public" nøgle. Familiekoden er jeres hemmelige nøgle – brug samme kode på alle iPads. Portrætbilleder synkroniseres aldrig.</p>
        <div class="pgrid">
          <label>Supabase URL<input id="cUrl" placeholder="https://xxxx.supabase.co" value="${esc(st.cloud ? st.cloud.url : '')}"></label>
          <label>Anon-nøgle<input id="cKey" placeholder="eyJ..." value="${esc(st.cloud ? st.cloud.key : '')}"></label>
          <label>Familiekode<input id="cFam" value="${esc(st.cloud ? st.cloud.family : '')}" placeholder="Tryk 'Ny kode' første gang"></label></div>
        <div class="row wrap"><button class="btn small" id="cNew">Ny kode</button><button class="btn small gold" id="cSave">Gem og synkronisér</button>${st.cloud ? '<button class="btn small" id="cOff">Slå fra</button>' : ''}<span class="soft small" id="cStat">${esc(Store.Cloud.status)}</span></div>
        <details><summary>Vis SQL til Supabase</summary><pre class="sql">${esc(Store.Cloud.SQL)}</pre></details>
      </section>
      <section><h2>Om Nisseland</h2>
        <ul class="soft small">
          <li>Kalender og læring er adskilt: Historien, gaverne og julebogens sider låses op af datoen – aldrig af opgaverne. Opgaver giver kun ekstra stjerner og bonus-ting.</li>
          <li>Forkerte svar giver hjælp og en ny chance. Efter to forsøg vises svaret venligt. Ingen minuspoint.</li>
          <li>Den 24. december kan alle gennemføre finalen. Mangler der sider eller gaver, bliver de givet i finalen.</li>
          <li>Nissens ansigt er tegnet af appen ud fra billedet direkte på enheden. Der bruges ingen ekstern AI-tjeneste, og det tegnede ansigt synkroniseres eller eksporteres aldrig.</li>
          <li>Oplæsning bruger enhedens indbyggede danske stemme (iPad: Indstillinger → Tilgængelighed → Oplæst indhold → Stemmer).</li>
        </ul></section>
    </div></main>`;
    $('#pBack').onclick = () => cur ? home() : profiles();
    $$('.pprof').forEach(sec => {
      const p = Store.profile(sec.dataset.id);
      $$('select[data-f]', sec).forEach(s => s.onchange = () => { p[s.dataset.f] = +s.value; Store.save(p); toast('Gemt'); });
      $$('input[data-door]', sec).forEach(c => c.onchange = () => {
        const d = +c.dataset.door;
        p.unlocked = c.checked ? Array.from(new Set([...p.unlocked, d])) : p.unlocked.filter(x => x !== d);
        Store.save(p);
      });
      const act = (a, fn) => { const b = $(`[data-act="${a}"]`, sec); if (b) b[a === 'photo' ? 'onchange' : 'onclick'] = fn; };
      act('reset', () => { p.time = { date: Store.today(), used: 0 }; Store.save(p); parent(); });
      act('photo', e => {
        const f = e.target.files[0]; if (!f) return;
        photoTraits(f, t => { applyPhoto(p, t); Store.save(p); toast('Nissen er tegnet på ny'); parent(); });
      });
      act('beard', () => { p.look.beard = !p.look.beard; Store.save(p); parent(); });
      act('glasses', () => { p.look.glasses = !p.look.glasses; Store.save(p); parent(); });
      act('nophoto', () => { p.portrait = null; Store.prepare(p); Store.save(p); parent(); });
      act('delete', () => {
        const m = modal(`<div class="gate"><h3>Slet ${esc(p.nisseName)}?</h3><p>Al fremskridt for denne profil slettes. Det kan ikke fortrydes.</p>
          <div class="row center"><button class="btn" id="dNo">Nej</button><button class="btn danger" id="dYes">Ja, slet</button></div></div>`);
        $('#dNo', m).onclick = () => m.close();
        $('#dYes', m).onclick = () => { m.close(); if (cur && cur.id === p.id) cur = null; Store.removeProfile(p.id); parent(); };
      });
    });
    $('#pSavePin').onclick = () => { const v = $('#pPin').value.trim(); if (v && !/^\d{4,8}$/.test(v)) { toast('PIN skal være 4-8 cifre'); return; } st.pin = v; Store.save(); toast(v ? 'PIN gemt' : 'PIN fjernet'); };
    $('#pExport').onclick = () => {
      const blob = new Blob([JSON.stringify(Store.exportable(), null, 1)], { type: 'application/json' });
      const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nisseland-${Store.today()}.json`; a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    };
    $('#pImport').onchange = async e => {
      const f = e.target.files[0]; if (!f) return;
      try { const data = JSON.parse(await f.text()); if (!Store.mergeDb(data)) throw new Error(); Store.save(); toast('Fremskridt indlæst og flettet'); parent(); }
      catch (err) { toast('Filen kunne ikke læses'); }
    };
    $('#cNew').onclick = () => { $('#cFam').value = Store.uid(28); };
    $('#cSave').onclick = async () => {
      const url = $('#cUrl').value.trim(), key = $('#cKey').value.trim(), family = $('#cFam').value.trim();
      if (!/^https:\/\/[\w.-]+$/.test(url.replace(/\/$/, '')) || !key || family.length < 24) { toast('Udfyld https-URL, nøgle og en familiekode på mindst 24 tegn'); return; }
      st.cloud = { url, key, family }; Store.save();
      $('#cStat').textContent = 'Synkroniserer …';
      try { await Store.Cloud.sync(); $('#cStat').textContent = Store.Cloud.status; toast('Synkroniseret'); }
      catch (err) { $('#cStat').textContent = 'Fejl: ' + err.message + ' – tjek URL, nøgle og SQL.'; }
    };
    const off = $('#cOff'); if (off) off.onclick = () => { st.cloud = null; Store.save(); parent(); };
  }

  // ---------- Snefald ----------
  (function snow() {
    const c = $('#snow'), x = c.getContext('2d');
    let flakes = [];
    const resize = () => { c.width = innerWidth; c.height = innerHeight; flakes = Array.from({ length: Math.min(90, Math.floor(innerWidth / 14)) }, () => ({ x: Math.random() * innerWidth, y: Math.random() * innerHeight, r: Math.random() * 2.4 + 0.6, s: Math.random() * 0.5 + 0.25, w: Math.random() * 6.28 })); };
    resize(); addEventListener('resize', resize);
    const tick = () => {
      x.clearRect(0, 0, c.width, c.height);
      if (screen !== 'parent') {
        x.fillStyle = 'rgba(255,255,255,.85)';
        flakes.forEach(f => { f.y += f.s; f.w += 0.01; f.x += Math.sin(f.w) * 0.3; if (f.y > c.height) { f.y = -5; f.x = Math.random() * c.width; } x.beginPath(); x.arc(f.x, f.y, f.r, 0, 6.3); x.fill(); });
      }
      requestAnimationFrame(tick);
    };
    tick();
  })();

  // ---------- Start ----------
  Sfx.on = Store.db.settings.sound !== false;
  // Browsere tillader først lyd efter et tryk.
  document.addEventListener('pointerdown', () => { Sfx.unlock(); music(); }, { once: true });
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
  if (Store.db.settings.cloud) Store.Cloud.sync().then(() => { if (screen === 'profiles') profiles(); }).catch(() => {});
  profiles();

  return { toast, get cur() { return cur; }, get screen() { return screen; }, home, map, chapter, profiles, select };
})();
