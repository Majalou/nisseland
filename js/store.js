// Lagring: localStorage på enheden + valgfri synkronisering via forældrenes egen gratis Supabase-database.
// Kalenderprogression (hvilke låger er åbne) og læringsprogression (p.tasks) er bevidst helt adskilte.
const Store = (() => {
  const KEY = 'nisseland-v1';
  let db = load();
  let pushTimer = null;

  function fresh() { return { v: 1, profiles: [], deleted: [], settings: { pin: '', cloud: null, sound: true, music: false } }; }
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(KEY));
      if (d && Array.isArray(d.profiles)) { d.deleted = d.deleted || []; d.settings = Object.assign(fresh().settings, d.settings); d.profiles.forEach(prepare); return d; }
    } catch (e) { /* korrupt lager -> start forfra */ }
    return fresh();
  }
  // Nisser går altid i rødt. look.photo er ikke-enumerabel, så portrættet aldrig følger med look ved eksport/synk.
  function prepare(p) {
    if (!p.look) return p;
    p.look.hatColor = '#c8102e'; p.look.clothes = '#b3122e'; p.look.mittens = '#f2f2f2';
    Object.defineProperty(p.look, 'photo', { value: p.portrait || null, writable: true, configurable: true, enumerable: false });
    return p;
  }
  function save(touch) {
    if (touch) touch.updatedAt = Date.now();
    try { localStorage.setItem(KEY, JSON.stringify(db)); }
    catch (e) { if (typeof App !== 'undefined') App.toast('Lageret er fuldt – prøv at fjerne et billede i forældredelen.'); }
    if (db.settings.cloud) { clearTimeout(pushTimer); pushTimer = setTimeout(() => Cloud.push().catch(() => {}), 2500); }
  }
  function uid(n = 10) {
    const a = new Uint8Array(n); crypto.getRandomValues(a);
    return Array.from(a, b => 'abcdefghijkmnpqrstuvwxyz23456789'[b % 32]).join('');
  }
  function today() { const d = new Date(); return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`; }

  function newProfile(o) {
    return {
      id: uid(), name: o.name, nisseName: o.nisseName, level: o.level || 1, minutes: 15,
      look: o.look, portrait: o.portrait || null,
      created: Date.now(), updatedAt: Date.now(),
      seen: {},       // dag -> true når historien er set (kalender/historie)
      phase: {},      // dag -> højeste fase nået i kapitlet
      gifts: {},      // dag -> gave modtaget
      tasks: {},      // dag -> { r: [resultater] } (læring)
      writings: {},   // dag -> tekst barnet har skrevet
      stars: 0, inventory: ['start_hue', 'start_kappe'], equip: { hat: 'start_hue', cape: 'start_kappe' },
      secrets: [], unlocked: [], unlockTo: 0, finale: false,
      time: { date: '', used: 0 }, pos: { x: 1270, y: 1160 }
    };
  }

  // ---------- Kalender ----------
  function calendarDay(now = new Date()) {
    const m = now.getMonth(), d = now.getDate();
    if (m === 11) return Math.min(d, 24);
    if (m === 0 && d <= 31) return 24; // januar: alt åbent, så eventyret kan færdiggøres
    return 0;
  }
  function isOpen(p, day) {
    return day === 1 || day <= calendarDay() || day <= (p.unlockTo || 0) || (p.unlocked || []).includes(day);
  }
  function maxOpen(p) { let m = 0; for (let d = 1; d <= 24; d++) if (isOpen(p, d)) m = d; return m; }

  // ---------- Skærmtid ----------
  function timeToday(p) { if (p.time.date !== today()) p.time = { date: today(), used: 0 }; return p.time; }

  // ---------- Fletning (ingen fremskridt må gå tabt) ----------
  const uniq = a => Array.from(new Set(a));
  function mergeProfile(a, b) {
    const newer = (a.updatedAt || 0) >= (b.updatedAt || 0) ? a : b;
    const out = JSON.parse(JSON.stringify(newer));
    out.portrait = a.portrait || b.portrait || null;
    out.seen = Object.assign({}, b.seen, a.seen);
    out.gifts = Object.assign({}, b.gifts, a.gifts);
    out.writings = Object.assign({}, b.writings, a.writings);
    out.phase = {}; [a, b].forEach(x => Object.entries(x.phase || {}).forEach(([k, v]) => out.phase[k] = Math.max(out.phase[k] || 0, v)));
    out.tasks = {};
    [a, b].forEach(x => Object.entries(x.tasks || {}).forEach(([k, v]) => {
      const cur = out.tasks[k] || { r: [] };
      const r = cur.r.slice();
      (v.r || []).forEach((val, i) => { if (val != null && (r[i] == null || val > r[i])) r[i] = val; });
      out.tasks[k] = { r };
    }));
    out.stars = Math.max(a.stars || 0, b.stars || 0);
    out.inventory = uniq([...(a.inventory || []), ...(b.inventory || [])]);
    out.secrets = uniq([...(a.secrets || []), ...(b.secrets || [])]);
    out.props = uniq([...(a.props || []), ...(b.props || [])]);
    out.unlocked = uniq([...(a.unlocked || []), ...(b.unlocked || [])]);
    out.unlockTo = Math.max(a.unlockTo || 0, b.unlockTo || 0);
    out.finale = a.finale || b.finale;
    if (a.time && b.time && a.time.date === b.time.date) out.time = { date: a.time.date, used: Math.max(a.time.used, b.time.used) };
    return out;
  }
  function mergeDb(remote) {
    if (!remote || !Array.isArray(remote.profiles)) return false;
    db.deleted = uniq([...(db.deleted || []), ...(remote.deleted || [])]);
    const map = new Map(db.profiles.map(p => [p.id, p]));
    remote.profiles.forEach(rp => {
      const lp = map.get(rp.id);
      map.set(rp.id, lp ? mergeProfile(lp, rp) : rp);
    });
    db.profiles = Array.from(map.values()).filter(p => !db.deleted.includes(p.id));
    db.profiles.forEach(prepare);
    return true;
  }

  // Billeder af børn synkroniseres aldrig – de bliver på enheden.
  function exportable() {
    return { v: 1, deleted: db.deleted, profiles: db.profiles.map(p => Object.assign({}, p, { portrait: null })) };
  }

  // ---------- Valgfri sky (Supabase, gratis plan) ----------
  const Cloud = {
    SQL: `create table if not exists nisseland (family text primary key, data jsonb not null, updated_at timestamptz default now());
alter table nisseland enable row level security;
-- Ingen policies = ingen direkte adgang. Kun de to funktioner herunder, som kræver den hemmelige familiekode.
create or replace function nl_load(fam text) returns jsonb language sql security definer set search_path = public as $$
  select data from nisseland where family = fam and length(fam) >= 24 $$;
create or replace function nl_save(fam text, payload jsonb) returns void language sql security definer set search_path = public as $$
  insert into nisseland(family, data, updated_at) select fam, payload, now() where length(fam) >= 24
  on conflict (family) do update set data = excluded.data, updated_at = now() $$;
grant execute on function nl_load(text), nl_save(text, jsonb) to anon;`,
    status: '',
    async call(fn, body) {
      const c = db.settings.cloud; if (!c) throw new Error('ingen sky');
      const res = await fetch(`${c.url.replace(/\/$/, '')}/rest/v1/rpc/${fn}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', apikey: c.key, Authorization: `Bearer ${c.key}` },
        body: JSON.stringify(body)
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const t = await res.text();
      return t ? JSON.parse(t) : null;
    },
    async pull() {
      const remote = await this.call('nl_load', { fam: db.settings.cloud.family });
      if (remote) { mergeDb(remote); try { localStorage.setItem(KEY, JSON.stringify(db)); } catch (e) {} }
      this.status = 'Hentet ' + new Date().toLocaleTimeString('da-DK');
      return !!remote;
    },
    async push() {
      await this.call('nl_save', { fam: db.settings.cloud.family, payload: exportable() });
      this.status = 'Gemt i skyen ' + new Date().toLocaleTimeString('da-DK');
    },
    async sync() { await this.pull(); await this.push(); }
  };

  return {
    get db() { return db; }, save, uid, today, newProfile, calendarDay, isOpen, maxOpen, timeToday,
    mergeDb, exportable, Cloud, prepare,
    replaceAll(d) { db = d; db.profiles.forEach(prepare); save(); },
    profile(id) { return db.profiles.find(p => p.id === id); },
    addProfile(p) { db.profiles.push(p); save(p); },
    removeProfile(id) { db.profiles = db.profiles.filter(p => p.id !== id); db.deleted.push(id); save(); }
  };
})();
