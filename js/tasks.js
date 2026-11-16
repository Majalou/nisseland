// Kører en dags opgaver. Ingen straf: forkerte svar giver hjælp, og efter to forsøg vises svaret venligt.
const TaskUI = (() => {
  const PRAISE = ['Flot klaret!', 'Sådan, julehjælper!', 'Nisserne jubler!', 'Du er en ordmagiker!', 'Fantastisk!', 'Julemagien vokser!', 'Hold da op, hvor er du skarp!'];
  const AGAIN = ['Næsten! Prøv igen.', 'Godt forsøgt – kig en gang til.', 'Ikke helt. Du kan godt!', 'Tæt på! Prøv en gang til.'];
  const rand = a => a[Math.floor(Math.random() * a.length)];
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

  function run(el, tasks, state, opts) {
    let cur = state.r.findIndex(v => v == null);
    if (cur < 0) cur = tasks.length;
    const level = opts.level;

    function dots() {
      return `<div class="tdots">${tasks.map((t, i) => {
        const v = state.r[i];
        const cls = v == null ? '' : v >= 2 ? 'ok' : v === 1 ? 'seen' : 'skip';
        return `<button class="tdot ${cls} ${i === cur ? 'cur' : ''}" data-i="${i}" aria-label="Opgave ${i + 1}">${v >= 2 ? '★' : i + 1}</button>`;
      }).join('')}</div>`;
    }

    function show() {
      if (cur >= tasks.length) return summary();
      const t = tasks[cur];
      el.innerHTML = `${dots()}<div class="tcard pop" id="tcard"></div>`;
      bindDots();
      const card = el.querySelector('#tcard');
      const sayText = t.say || [t.prompt, t.passage].filter(Boolean).join('. ');
      card.innerHTML = `
        <div class="thead"><button class="speak" id="say" title="Læs op">🔊</button><h3>${esc(t.prompt)}</h3></div>
        ${t.passage && !(level === 1) ? `<div class="passage ${t.letter ? 'letter' : ''}">${esc(t.passage)}</div>` : ''}
        ${t.pic ? `<div class="tpic">${t.pic}</div>` : ''}
        ${t.word ? `<div class="tword">${esc(t.word)}</div>` : ''}
        <div class="tbody" id="tbody"></div>
        <div class="tfeed" id="feed"></div>
        <div class="tactions"><button class="btn ghost small" id="skip">Spring over – jeg tager den senere</button><button class="btn gold" id="next" hidden>Næste ▶</button></div>`;
      card.querySelector('#say').onclick = () => Sfx.speak(sayText);
      card.querySelector('#skip').onclick = () => { if (state.r[cur] == null) opts.onResult(cur, 0); Sfx.tap(); advance(); };
      card.querySelector('#next').onclick = () => { Sfx.tap(); advance(); };
      if (level === 1 || t.autoSay) setTimeout(() => Sfx.speak(sayText), 350);
      const body = card.querySelector('#tbody');
      const ctx = { t, body, card, tries: 0, done: false };
      ({ choice: renderChoice, order: renderOrder, tap: renderTap, write: renderWrite })[t.type](ctx);
    }

    function bindDots() {
      el.querySelectorAll('.tdot').forEach(b => b.onclick = () => { cur = +b.dataset.i; Sfx.tap(); show(); });
    }

    function advance() {
      const nxt = tasks.findIndex((_, i) => i > cur && state.r[i] == null);
      const any = state.r.findIndex(v => v == null);
      cur = nxt >= 0 ? nxt : any >= 0 && any !== cur ? any : tasks.length;
      show();
    }

    function feedback(ctx, ok, extra) {
      const f = ctx.card.querySelector('#feed');
      if (ok) {
        ctx.done = true;
        const val = ctx.tries === 0 ? 3 : 2;
        opts.onResult(cur, val);
        Sfx.good(); burst(ctx.card);
        const p = rand(PRAISE);
        f.className = 'tfeed good';
        f.innerHTML = `<b>${p}</b> <span class="star-pop">+★</span>${extra ? `<div class="explain">${esc(extra)}</div>` : ''}`;
        if (level <= 2) Sfx.speak(p);
        finishCard(ctx);
      } else {
        ctx.tries++;
        Sfx.soft();
        if (ctx.tries >= 2) {
          ctx.done = true;
          if ((state.r[cur] ?? -1) < 1) opts.onResult(cur, 1);
          f.className = 'tfeed reveal';
          f.innerHTML = `<b>Det var en svær én!</b> Her er svaret – nu ved du det til næste gang. 💛${ctx.t.explain ? `<div class="explain">${esc(ctx.t.explain)}</div>` : ''}`;
          if (level <= 2) Sfx.speak('Det var en svær én. Her er svaret.');
          ctx.reveal && ctx.reveal();
          finishCard(ctx);
        } else {
          const msg = rand(AGAIN);
          f.className = 'tfeed try';
          f.innerHTML = `<b>${msg}</b>${ctx.t.hint ? `<div class="hint">💡 ${esc(ctx.t.hint)}</div>` : ''}`;
          if (level <= 2) Sfx.speak(msg + ' ' + (ctx.t.hint || ''));
        }
      }
    }
    function finishCard(ctx) {
      ctx.card.querySelector('#skip').hidden = true;
      const n = ctx.card.querySelector('#next'); n.hidden = false;
      el.querySelector('.tdots').outerHTML = dots(); bindDots();
    }

    // ---------- Typer ----------
    function renderChoice(ctx) {
      const t = ctx.t;
      const ans = t.answerKey ? t.options.findIndex(o => o.key === t.answerKey) : t.answer;
      const big = t.big ? 'big' : '';
      const picOnly = t.options.every(o => typeof o === 'object' && o.pic && !o.t);
      ctx.body.innerHTML = `<div class="opts ${big} ${picOnly ? 'pics' : ''} ${t.options.length > 3 ? 'four' : ''}">${t.options.map((o, i) => {
        const obj = typeof o === 'object' ? o : { t: o };
        return `<button class="opt" data-i="${i}">${obj.pic ? `<span class="opic">${obj.pic}</span>` : ''}${obj.t ? `<span>${esc(obj.t)}</span>` : ''}</button>`;
      }).join('')}</div>`;
      const btns = ctx.body.querySelectorAll('.opt');
      ctx.reveal = () => { btns[ans].classList.add('right'); };
      btns.forEach(b => b.onclick = () => {
        if (ctx.done) return;
        const i = +b.dataset.i;
        if (t.clap) Sfx.tap();
        if (i === ans) { b.classList.add('right'); feedback(ctx, true, t.explain); }
        else { b.classList.add('wrong'); b.disabled = true; feedback(ctx, false); if (level === 1 && !ctx.done) btns[ans].classList.add('glow'); }
      });
    }

    function renderOrder(ctx) {
      const t = ctx.t;
      const sol = t.solution;
      let pool = t.pieces.map((p, i) => ({ p, id: i }));
      let slots = sol.map(() => null);
      const locked = sol.map(() => false);
      function draw() {
        ctx.body.innerHTML = `<div class="slots ${t.joiner === ' ' ? 'words' : ''}">${slots.map((s, i) => `<button class="slot ${locked[i] ? 'locked' : ''}" data-i="${i}">${s ? esc(s.p) : ''}</button>`).join('')}</div>
          <div class="pool ${t.joiner === ' ' ? 'words' : ''}">${pool.map(x => `<button class="tile" data-id="${x.id}">${esc(x.p)}</button>`).join('')}</div>`;
        ctx.body.querySelectorAll('.tile').forEach(b => b.onclick = () => {
          if (ctx.done) return;
          const id = +b.dataset.id; const k = slots.findIndex(s => !s);
          if (k < 0) return;
          Sfx.tap();
          slots[k] = pool.find(x => x.id === id); pool = pool.filter(x => x.id !== id);
          draw();
          if (slots.every(Boolean)) check();
        });
        ctx.body.querySelectorAll('.slot').forEach(b => b.onclick = () => {
          const i = +b.dataset.i; if (ctx.done || !slots[i] || locked[i]) return;
          pool.push(slots[i]); slots[i] = null; draw();
        });
      }
      function check() {
        const ok = slots.every((s, i) => s.p === sol[i]);
        if (ok) { ctx.body.querySelector('.slots').classList.add('solved'); feedback(ctx, true); return; }
        // Behold rigtige brikker, send de forkerte tilbage.
        slots.forEach((s, i) => { if (s.p === sol[i]) locked[i] = true; });
        setTimeout(() => {
          slots = slots.map((s, i) => { if (locked[i]) return s; pool.push(s); return null; });
          if (!ctx.done) draw();
        }, 700);
        ctx.body.querySelectorAll('.slot').forEach((b, i) => b.classList.add(slots[i].p === sol[i] ? 'ok' : 'bad'));
        feedback(ctx, false);
      }
      ctx.reveal = () => { slots = sol.map((p, i) => ({ p, id: 100 + i })); pool = []; sol.forEach((_, i) => locked[i] = true); setTimeout(() => { draw(); ctx.body.querySelector('.slots').classList.add('solved'); }, 720); };
      draw();
    }

    function renderTap(ctx) {
      const t = ctx.t;
      const sel = new Set();
      ctx.body.innerHTML = `<div class="tokens ${t.letter ? 'letter' : ''}">${t.tokens.map((w, i) => `<button class="tok" data-i="${i}">${esc(w)}</button>`).join(' ')}</div>
        ${t.multi ? '<div class="center"><button class="btn gold" id="check">Tjek ✓</button></div>' : ''}`;
      const toks = ctx.body.querySelectorAll('.tok');
      const markRight = () => t.answer.forEach(i => toks[i].classList.add('right'));
      ctx.reveal = () => { markRight(); if (t.fix) toks[t.fix.i].textContent = t.fix.word; };
      toks.forEach(b => b.onclick = () => {
        if (ctx.done) return;
        const i = +b.dataset.i;
        Sfx.tap();
        if (!t.multi) {
          if (t.answer.includes(i)) {
            b.classList.add('right');
            if (t.fix) { b.textContent = t.fix.word; }
            feedback(ctx, true, t.explain);
          } else { b.classList.add('wrong'); feedback(ctx, false); }
          return;
        }
        if (sel.has(i)) { sel.delete(i); b.classList.remove('sel'); } else { sel.add(i); b.classList.add('sel'); }
      });
      const c = ctx.body.querySelector('#check');
      if (c) c.onclick = () => {
        if (ctx.done) return;
        const ok = sel.size === t.answer.length && t.answer.every(i => sel.has(i));
        if (ok) { markRight(); feedback(ctx, true); return; }
        // Venlig hjælp: fjern de forkerte valg, behold de rigtige.
        sel.forEach(i => { if (!t.answer.includes(i)) { sel.delete(i); toks[i].classList.remove('sel'); toks[i].classList.add('wrong'); setTimeout(() => toks[i].classList.remove('wrong'), 900); } });
        feedback(ctx, false);
      };
    }

    function renderWrite(ctx) {
      const t = ctx.t;
      const prev = opts.getWriting ? opts.getWriting() : '';
      ctx.body.innerHTML = `<ul class="tips">${t.tips.map(x => `<li>✨ ${esc(x)}</li>`).join('')}</ul>
        <textarea id="txt" rows="6" placeholder="Skriv her …" maxlength="2000">${esc(prev || '')}</textarea>
        <div class="wc" id="wc"></div>
        <div class="center"><button class="btn gold" id="send">Send til nisserne ✉️</button></div>`;
      const ta = ctx.body.querySelector('#txt'), wc = ctx.body.querySelector('#wc');
      const count = () => (ta.value.trim().match(/\S+/g) || []).length;
      const upd = () => { const n = count(); wc.textContent = `${n} ord${n < t.minWords ? ` · prøv at nå ${t.minWords}` : ' · flot!'}`; };
      ta.oninput = upd; upd();
      ctx.body.querySelector('#send').onclick = () => {
        if (ctx.done) return;
        const n = count();
        if (n === 0) { const f = ctx.card.querySelector('#feed'); f.className = 'tfeed try'; f.innerHTML = '<b>Skriv bare et par ord – nisserne glæder sig til at læse det.</b>'; return; }
        if (n < Math.ceil(t.minWords / 2) && !ctx.warned) {
          ctx.warned = true;
          const f = ctx.card.querySelector('#feed'); f.className = 'tfeed try';
          f.innerHTML = '<b>Vil du skrive lidt mere?</b> Du kan også bare trykke send igen. 😊';
          return;
        }
        opts.onWrite && opts.onWrite(ta.value.trim());
        ta.readOnly = true;
        feedback(ctx, true, 'Nisserne har fået dit brev og hængt det op på opslagstavlen!');
      };
    }

    function summary() {
      const got = state.r.filter(v => v >= 2).length;
      const left = state.r.filter(v => v == null || v === 0).length;
      el.innerHTML = `${dots()}<div class="tcard pop summary">
        <div class="bigstar">★</div>
        <h3>Missionen er klaret!</h3>
        <p>Du fik <b>${got}</b> stjerner i dag. Nisserne er så glade for din hjælp.</p>
        ${left ? `<p class="soft">Du sprang ${left} over – dem kan du altid prøve igen ved at trykke på tallene foroven.</p>` : ''}
        <button class="btn gold" id="fin">Videre til dagens gave 🎁</button></div>`;
      bindDots();
      Sfx.fanfare();
      el.querySelector('#fin').onclick = () => opts.onFinish();
    }

    show();
  }

  function burst(host) {
    const r = host.getBoundingClientRect();
    for (let i = 0; i < 18; i++) {
      const s = document.createElement('i');
      s.className = 'spark';
      s.textContent = ['✦', '★', '❄', '✧'][i % 4];
      s.style.left = (r.left + r.width / 2) + 'px'; s.style.top = (r.top + r.height / 2) + 'px';
      const a = Math.random() * Math.PI * 2, d = 80 + Math.random() * 140;
      s.style.setProperty('--dx', Math.cos(a) * d + 'px'); s.style.setProperty('--dy', Math.sin(a) * d + 'px');
      document.body.appendChild(s);
      setTimeout(() => s.remove(), 1000);
    }
  }
  return { run, burst, esc };
})();
