// Danskopgaver på fire niveauer. Hvert niveau har sine egne opgavetyper – ikke blot sværere ord.
const TaskBank = (() => {
  function rng(seed) { let s = (seed >>> 0) || 1; return () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; }; }
  function hash(str) { let h = 2166136261; for (const c of str) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; }
  function shuffle(a, r) { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
  const pick = (bank, day, k) => bank[(day - 1 + k * 11) % bank.length];
  function choice(base, correct, wrongs, r) {
    const opts = shuffle([correct, ...wrongs], r);
    return Object.assign({ type: 'choice', options: opts, answer: opts.indexOf(correct) }, base);
  }

  // ===================== NIVEAU 1 · BØRNEHAVE =====================
  const W1 = [['MUS', '🐭'], ['HUS', '🏠'], ['SOL', '☀️'], ['FISK', '🐟'], ['RÆV', '🦊'], ['BJØRN', '🐻'], ['STJERNE', '⭐'], ['GAVE', '🎁'],
    ['KAGE', '🍪'], ['LYS', '🕯️'], ['TRÆ', '🌲'], ['KLOKKE', '🔔'], ['SNEMAND', '⛄'], ['ÆBLE', '🍎'], ['UGLE', '🦉'], ['KAT', '🐱'],
    ['HUND', '🐶'], ['BIL', '🚗'], ['MÅNE', '🌙'], ['BI', '🐝'], ['KRONE', '👑'], ['NØGLE', '🔑'], ['HEST', '🐴'], ['AND', '🦆'],
    ['BANAN', '🍌'], ['FRØ', '🐸'], ['KO', '🐮'], ['GRIS', '🐷'], ['KANE', '🛷'], ['JULETRÆ', '🎄'], ['PINDSVIN', '🦔'], ['KANIN', '🐰'],
    ['BAMSE', '🧸'], ['FUGL', '🐦'], ['TAND', '🦷'], ['SKO', '👟'], ['HAT', '🎩'], ['DRAGE', '🐉'], ['ELEFANT', '🐘'], ['ØRN', '🦅'],
    ['VANTE', '🧤'], ['LØVE', '🦁'], ['RENSDYR', '🦌'], ['IS', '🍦'], ['OST', '🧀'], ['PIGE', '👧'], ['DRENG', '👦'], ['ROSE', '🌹']];
  const LETTERS = 'ABDEFGHIJKLMNOPRSTUVÆØÅ'.split('');
  const RHYME = [['MUS', '🐭', 'HUS', '🏠', [['SOL', '☀️'], ['BIL', '🚗']]], ['KAT', '🐱', 'HAT', '🎩', [['KO', '🐮'], ['FISK', '🐟']]],
    ['SOL', '☀️', 'STOL', '🪑', [['HUND', '🐶'], ['KAGE', '🍪']]], ['KO', '🐮', 'SKO', '👟', [['MUS', '🐭'], ['TRÆ', '🌲']]],
    ['MAND', '🧔', 'TAND', '🦷', [['GAVE', '🎁'], ['LYS', '🕯️']]], ['HEST', '🐴', 'FEST', '🎉', [['BIL', '🚗'], ['MÅNE', '🌙']]],
    ['TRÆ', '🌲', 'KNÆ', '🦵', [['SOL', '☀️'], ['GRIS', '🐷']]], ['GRIS', '🐷', 'IS', '🍦', [['KO', '🐮'], ['HUS', '🏠']]],
    ['BI', '🐝', 'SKI', '🎿', [['FRØ', '🐸'], ['KAT', '🐱']]], ['SNE', '❄️', 'SKE', '🥄', [['BIL', '🚗'], ['HEST', '🐴']]],
    ['GÅS', '🪿', 'LÅS', '🔒', [['KANE', '🛷'], ['SOL', '☀️']]], ['PIL', '🏹', 'BIL', '🚗', [['MUS', '🐭'], ['TRÆ', '🌲']]],
    ['HUND', '🐶', 'MUND', '👄', [['KAT', '🐱'], ['SNE', '❄️']]], ['NØD', '🌰', 'BRØD', '🍞', [['ÆBLE', '🍎'], ['KAT', '🐱']]],
    ['KAGE', '🍰', 'DRAGE', '🐉', [['SOL', '☀️'], ['MUS', '🐭']]], ['BÅD', '⛵', 'TRÅD', '🧵', [['KO', '🐮'], ['IS', '🍦']]],
    ['RIS', '🍚', 'GRIS', '🐷', [['HAT', '🎩'], ['KO', '🐮']]], ['SKO', '👟', 'KO', '🐮', [['BI', '🐝'], ['HUS', '🏠']]]];
  const SYL = [['SOL', 1], ['NISSE', 2], ['JULEMAND', 3], ['KAGE', 2], ['STJERNE', 2], ['SNEMAND', 2], ['JULETRÆ', 3], ['PEBERKAGE', 4],
    ['RENSDYR', 2], ['LYS', 1], ['KLOKKE', 2], ['PEBERNØD', 3], ['ELEFANT', 3], ['KO', 1], ['BANAN', 2], ['MARCIPAN', 3],
    ['CHOKOLADE', 4], ['JULEAFTEN', 4], ['GAVE', 2], ['KANE', 2], ['RISENGRØD', 3], ['IS', 1], ['DRAGE', 2], ['PINDSVIN', 2]];
  const STORY1 = [
    ['Rudolf er et rensdyr. Hvilket dyr er Rudolf?', ['🦌', '🐱', '🐟']],
    ['Frida spiser et rødt æble. Hvad spiser Frida?', ['🍎', '🍌', '🥕']],
    ['Det sner. Nissen bygger en snemand. Hvad bygger nissen?', ['⛄', '🏠', '🚗']],
    ['Uglen sidder i træet om natten. Hvad kan man se på himlen om natten?', ['🌙', '☀️', '🌈']],
    ['Julemanden kører i sin kane. Hvad kører han i?', ['🛷', '🚗', '🚲']],
    ['Sofus tænder et lys i vinduet. Hvad tænder han?', ['🕯️', '📺', '🎈']],
    ['Pil finder en svamp i skoven. Hvad finder Pil?', ['🍄', '🐟', '⭐']],
    ['Isdragen bor i et bjerg af is. Hvem bor i bjerget?', ['🐉', '🐮', '🐷']],
    ['Slikkongen har en krone på hovedet. Hvad har han på hovedet?', ['👑', '👟', '🧤']],
    ['Nisserne pakker en gave. Hvad pakker de?', ['🎁', '🍞', '🐟']],
    ['Ræven gemmer sig i sin hule. Hvilket dyr gemmer sig?', ['🦊', '🐴', '🐝']],
    ['Frida ringer med en klokke. Hvad ringer hun med?', ['🔔', '🥄', '📖']],
    ['Sofus har kolde fingre. Hvad skal han have på hænderne?', ['🧤', '🎩', '👟']],
    ['Nissen bager småkager i ovnen. Hvad bager nissen?', ['🍪', '🧀', '🐸']]];
  const wordOf = l => W1.filter(w => w[0][0] === l);
  // Børnehave: få og tydeligt forskellige bogstaver, altid kun 3 valg.
  const EASY = 'AEIOSMLBKTFRHGP'.split('');
  const W1E = W1.filter(w => EASY.includes(w[0][0]));
  const L1 = {
    findLetter(day, r, k) {
      const pool = EASY.filter(l => wordOf(l).length);
      const target = pool[Math.floor(r() * pool.length)];
      const others = shuffle(EASY.filter(l => l !== target), r).slice(0, 2);
      const ex = wordOf(target)[0];
      return choice({ prompt: `Find bogstavet ${target}`, say: `Find bogstavet ${target}. ${target} som i ${ex[0].toLowerCase()}.`, pic: ex[1], big: true,
        hint: `Kig efter bogstavet, der ser sådan ud: ${target}` }, target, others, r);
    },
    firstSound(day, r) {
      const w = W1E[Math.floor(r() * W1E.length)];
      const l = w[0][0];
      return choice({ prompt: 'Hvilket bogstav starter ordet med?', say: `${w[0].toLowerCase()}. Hvilket bogstav starter ${w[0].toLowerCase()} med?`, pic: w[1], big: true,
        hint: `Sig ordet langsomt: ${w[0].toLowerCase()}. Hvilken lyd kommer først?` }, l, shuffle(EASY.filter(x => x !== l), r).slice(0, 2), r);
    },
    rhyme(day, r, k) {
      const [w, p, c, cp, wr] = pick(RHYME, day, k);
      const opts = shuffle([[c, cp], ...wr], r);
      return { type: 'choice', prompt: `Hvad rimer på ${w.toLowerCase()}? ${p}`, say: `Hvad rimer på ${w.toLowerCase()}? ${opts.map(o => o[0].toLowerCase()).join(', ')}?`,
        options: opts.map(o => ({ pic: o[1], t: o[0].toLowerCase() })), answer: opts.findIndex(o => o[0] === c),
        hint: `Ord der rimer, lyder ens til sidst. ${w.toLowerCase()} – ${c.toLowerCase()}…` };
    },
    listenPick(day, r) {
      const ws = shuffle(W1, r).slice(0, 3);
      return { type: 'choice', prompt: 'Lyt godt efter 🔊 Hvilket billede passer til ordet?', say: ws[0][0].toLowerCase(), autoSay: true,
        options: shuffle(ws, r).map(w => ({ pic: w[1], key: w[0] })), answerKey: ws[0][0], hint: 'Tryk på højtaleren og lyt igen.' };
    },
    wordPic(day, r) {
      const ws = shuffle(W1.filter(w => w[0].length <= 4), r).slice(0, 3);
      return { type: 'choice', prompt: 'Kan du læse ordet? Find billedet.', word: ws[0][0], say: 'Kan du læse ordet? Find det rigtige billede.',
        options: shuffle(ws, r).map(w => ({ pic: w[1], key: w[0] })), answerKey: ws[0][0], hint: `Det første bogstav er ${ws[0][0][0]}.` };
    },
    missing(day, r) {
      const list = W1E.filter(x => x[0].length >= 3 && x[0].length <= 5);
      const w = list[Math.floor(r() * list.length)];
      const pos = 0;
      const l = w[0][pos];
      const shown = '_' + w[0].slice(1);
      return choice({ prompt: `Hvilket bogstav mangler? ${shown}`, word: shown, say: `${w[0].toLowerCase()}. Hvilket bogstav mangler forrest?`, pic: w[1], big: true,
        hint: `Sig ordet langsomt: ${w[0].toLowerCase()}` }, l, shuffle(EASY.filter(x => x !== l), r).slice(0, 2), r);
    },
    syllables(day, r, k) {
      const [w, n] = pick(SYL.filter(s => s[1] <= 3), day, k);
      const opts = [1, 2, 3];
      return { type: 'choice', prompt: `Klap ordet: ${w}. Hvor mange klap?`, say: `Klap ordet ${w.toLowerCase()}. Hvor mange klap er der?`, clap: true,
        options: opts.map(o => ({ t: '👏'.repeat(o) })), answer: n - 1, hint: 'Sig ordet langsomt og klap for hver del.' };
    },
    listenStory(day, r, k) {
      const [s, pics] = pick(STORY1, day, k);
      const opts = shuffle(pics, r);
      return { type: 'choice', prompt: '🔊 Lyt til historien', say: s, autoSay: true, passage: s,
        options: opts.map(p => ({ pic: p })), answer: opts.indexOf(pics[0]), hint: 'Tryk på højtaleren og hør historien igen.' };
    }
  };

  // ===================== NIVEAU 2 · 1.–2. KLASSE =====================
  const W2 = [['NISSE', '🧝'], ['KANE', '🛷'], ['GAVE', '🎁'], ['SNE', '❄️'], ['LYS', '🕯️'], ['KAGE', '🍪'], ['STJERNE', '⭐'], ['KLOKKE', '🔔'],
    ['TRÆ', '🌲'], ['RÆV', '🦊'], ['UGLE', '🦉'], ['MÅNE', '🌙'], ['HJERTE', '❤️'], ['SOK', '🧦'], ['BOG', '📖'], ['BREV', '✉️'],
    ['DRAGE', '🐉'], ['KRONE', '👑'], ['SLIK', '🍬'], ['NØGLE', '🔑'], ['PAKKE', '📦'], ['ÆBLE', '🍎'], ['BJERG', '⛰️'], ['JUL', '🎄'],
    ['VANTE', '🧤'], ['SVAMP', '🍄'], ['FUGL', '🐦'], ['MUS', '🐭'], ['SNEMAND', '⛄'], ['RENSDYR', '🦌']];
  const SPELL = [['gave', 'gafe', 'gawe'], ['kage', 'kaje', 'kague'], ['nisse', 'nise', 'nisze'], ['julemand', 'julemann', 'jullemand'],
    ['stjerne', 'stjærne', 'sjerne'], ['hjerte', 'jerte', 'hjærte'], ['hvid', 'vihd', 'hvit'], ['rød', 'røð', 'rødd'],
    ['julelys', 'jullelys', 'juhlelys'], ['pebernød', 'pebbernød', 'pebernødd'], ['klokke', 'kloke', 'klåkke'], ['rensdyr', 'rendsdyr', 'rensdyrr'],
    ['vinter', 'vintr', 'vinnter'], ['skov', 'skow', 'skouv'], ['mørk', 'mørck', 'mœrk'], ['tak', 'takk', 'tagk'],
    ['sød', 'søð', 'sødd'], ['fugl', 'fuhl', 'fugel'], ['bager', 'baager', 'baker'], ['godnat', 'godnatt', 'gonat'],
    ['hygge', 'hyge', 'hygje'], ['øje', 'øjhe', 'øie'], ['sne', 'snee', 'sneh'], ['træ', 'træh', 'tra']];
  const CONF = { E: 'ÆI', Æ: 'EA', O: 'ÅU', Å: 'OA', B: 'PD', P: 'BT', D: 'TB', T: 'DP', G: 'KJ', K: 'GC', I: 'EY', Y: 'IØ', U: 'OY', Ø: 'OY', A: 'ÆE', S: 'CZ', N: 'MR', M: 'NV', L: 'RJ', R: 'LN', J: 'GI', V: 'FW', H: 'KF', F: 'VH', C: 'SK' };
  const SENT = ['Nissen har en rød hue.', 'Rudolf har en lysende tud.', 'Det sner i hele Nisseland.', 'Frida bygger en ny maskine.',
    'Sofus spiser en stor kage.', 'Isdragen sover i en hule.', 'Julemanden pakker mange gaver.', 'Pil bor i den store skov.',
    'Vi finder en gylden side.', 'Ræven løser en svær gåde.', 'Kanen kører over sneen.', 'Slikkongen har en sød krone.',
    'Lyset skinner i vinduet.', 'Nisserne synger en julesang.', 'Jeg hjælper nisserne i dag.', 'Uglen sidder på en gren.'];
  const READ2 = [
    ['Sofus har en rød hue. Han bor i et lille hus. Huset har et gult vindue.', 'Hvilken farve har Sofus\' hue?', 'rød', ['blå', 'gul']],
    ['Frida bygger en maskine. Maskinen kan lave sne. Men den laver alt for meget sne!', 'Hvad kan maskinen lave?', 'sne', ['kage', 'breve']],
    ['Rudolf har en rød tud. Den lyser i mørket. Så kan kanen finde vej.', 'Hvorfor er tuden god?', 'Kanen kan finde vej', ['Den er sød', 'Den er kold']],
    ['Pil bor i skoven. Han sover i en svamp. Svampen lyser blåt om natten.', 'Hvor sover Pil?', 'I en svamp', ['I et træ', 'I en kane']],
    ['Isdragen er stor og blå. Den er ikke ond. Den passer på julebogen.', 'Hvad gør Isdragen?', 'Passer på julebogen', ['Spiser kager', 'Bygger huse']],
    ['I Sukkerland er husene lavet af kage. Taget er af chokolade. Sofus vil gerne spise taget.', 'Hvad er taget lavet af?', 'chokolade', ['is', 'sne']],
    ['Julemanden har et langt, hvidt skæg. Han går med en rød frakke. Han er glad for småkager.', 'Hvad er Julemanden glad for?', 'småkager', ['fisk', 'sne']],
    ['Det sner i Nisseland. Mia laver en snemand. Den får en gulerod som næse.', 'Hvad får snemanden som næse?', 'en gulerod', ['en sten', 'en pind']],
    ['Nisserne pakker gaver. De bruger rødt papir og guldbånd. Der er hundrede gaver!', 'Hvor mange gaver er der?', 'hundrede', ['ti', 'to']],
    ['Ræven har briller. Den læser en bog om stjerner. Den vil gerne være klog.', 'Hvad læser ræven om?', 'stjerner', ['kager', 'sne']],
    ['Slikkongen har en krone af bolsjer. Han taler mærkeligt. Han siger "sokkemarmelade"!', 'Hvad er kronen lavet af?', 'bolsjer', ['guld', 'is']],
    ['Om aftenen tænder nisserne lys. Lysene står i vinduerne. Så kan Julemanden se byen.', 'Hvor står lysene?', 'I vinduerne', ['I sneen', 'I skoven']],
    ['Frida har en ugle. Uglen hedder Hugo. Hugo kan lide at sove om dagen.', 'Hvornår sover Hugo?', 'om dagen', ['om natten', 'aldrig']],
    ['Sofus mistede sin vante i sneen. Rudolf fandt den med sin næse. Sofus blev glad.', 'Hvem fandt vanten?', 'Rudolf', ['Frida', 'Sofus']]];
  const COMP = [['jule', 'træ', '🎄'], ['sne', 'mand', '⛄'], ['peber', 'nød', '🍪'], ['is', 'bjerg', '🏔️'], ['slik', 'konge', '👑'],
    ['sne', 'bold', '⚪'], ['jule', 'mand', '🎅'], ['post', 'kasse', '📮'], ['jule', 'lys', '🕯️'], ['is', 'drage', '🐉'],
    ['kage', 'dåse', '🥫'], ['sne', 'fnug', '❄️'], ['stjerne', 'skud', '🌠'], ['gave', 'papir', '🎁'], ['nisse', 'hue', '🧢'], ['rens', 'dyr', '🦌']];
  const L2 = {
    unscramble(day, r, k) {
      const w = pick(W2, day, k * 2 + 1);
      let pieces = shuffle(w[0].split(''), r);
      if (pieces.join('') === w[0]) pieces = pieces.reverse();
      return { type: 'order', prompt: 'Sæt bogstaverne i den rigtige rækkefølge', pic: w[1], say: w[0].toLowerCase(), pieces, solution: w[0].split(''), joiner: '',
        hint: `Ordet starter med ${w[0][0]}.` };
    },
    spelling(day, r, k) {
      const [c, ...wr] = pick(SPELL, day, k);
      return choice({ prompt: 'Hvilket ord er stavet rigtigt?', say: `Hvilket ord er stavet rigtigt? ${c}.`, hint: 'Læs ordene langsomt, ét bogstav ad gangen.' }, c, wr, r);
    },
    fillLetter(day, r, k) {
      const w = pick(W2.filter(x => x[0].length >= 4), day, k);
      const pos = 1 + Math.floor(r() * (w[0].length - 1));
      const l = w[0][pos];
      const wr = (CONF[l] || 'EA').split('').filter(x => x !== l).slice(0, 2);
      return choice({ prompt: 'Hvilket bogstav mangler?', word: w[0].slice(0, pos) + '_' + w[0].slice(pos + 1), pic: w[1], big: true,
        say: `${w[0].toLowerCase()}. Hvilket bogstav mangler?`, hint: `Sig ordet langsomt: ${w[0].toLowerCase()}` }, l, wr, r);
    },
    sentence(day, r, k) {
      const s = pick(SENT, day, k);
      const words = s.replace('.', '').split(' ');
      words[words.length - 1] += '.';
      let pieces = shuffle(words, r);
      if (pieces.join(' ') === words.join(' ')) pieces = pieces.reverse();
      return { type: 'order', prompt: 'Byg sætningen. Stort bogstav først – punktum til sidst!', say: s, pieces, solution: words, joiner: ' ',
        hint: `Sætningen starter med "${words[0]}".` };
    },
    readcomp(day, r, k) {
      const [t, q, c, wr] = pick(READ2, day, k);
      return choice({ prompt: q, passage: t, say: `${t} ${q}`, hint: 'Læs teksten igen – svaret står i den.' }, c, wr, r);
    },
    compound(day, r, k) {
      const [a, b, p] = pick(COMP, day, k);
      const other = pick(COMP, day, k + 3);
      const wr = [b + a, a + other[1], other[0] + b, b + other[1]].filter((x, i, arr) => x !== a + b && arr.indexOf(x) === i).slice(0, 2);
      return choice({ prompt: `${a} + ${b} = ?`, pic: p, say: `${a} plus ${b}. Hvilket ord bliver det?`, hint: 'Sæt de to ord sammen i samme rækkefølge.' }, a + b, wr, r);
    }
  };

  // ===================== NIVEAU 3 · 3.–4. KLASSE =====================
  const WC3 = ['Den glade:T nisse:N spiser:U en stor:T kage:N', 'Rudolf:N løber:U hurtigt over den hvide:T sne:N',
    'Frida:N bygger:U en mærkelig:T maskine:N', 'Den kolde:T drage:N sover:U i en mørk:T hule:N',
    'Sofus:N finder:U en gylden:T side:N', 'De små:T nisser:N synger:U en smuk:T sang:N',
    'Slikkongen:N bærer:U en klistret:T krone:N', 'Ræven:N læser:U en tyk:T bog:N',
    'Julemanden:N pakker:U røde:T gaver:N', 'Uglen:N kigger:U på den store:T måne:N',
    'Pil:N gemmer:U sig bag et gammelt:T træ:N', 'Kanen:N glider:U over den glatte:T is:N',
    'Nisserne:N bager:U lækre:T småkager:N', 'Den lille:T mus:N stjæler:U en hemmelig:T opskrift:N'];
  const WCNAME = { N: ['navneord', 'Navneord er ting, dyr og personer. Man kan sætte "en" eller "et" foran.'],
    U: ['udsagnsord', 'Udsagnsord fortæller, hvad nogen gør. Man kan sætte "at" foran.'],
    T: ['tillægsord', 'Tillægsord fortæller, hvordan noget er – fx stor, glad eller kold.'],
    P: ['stedord', 'Stedord (pronominer) står i stedet for et navneord – fx han, hun, vi, den.'],
    F: ['forholdsord', 'Forholdsord fortæller, hvor noget er i forhold til noget andet – fx under, over, ved.'],
    B: ['biord', 'Biord fortæller om måden, tiden eller graden – fx hurtigt, aldrig, ofte.'] };
  const LETTER3 = ['Kære Julemand. Jeg har {været|vært} sød hele året. Hilsen Sofus.', 'Hej Frida. Din maskine {laver|lavr} alt for meget sne! Kom hurtigt.',
    'Kære Rudolf. Kan du {hjælpe|jælpe} mig med at finde vej?', 'Hej Pil. Vi {ses|ces} til festen i skoven i aften.',
    'Kære Isdrage. Tak, fordi du {passede|pasede} på siderne.', 'Hej Slikkonge. Dine bolsjer er de {bedste|beste} i verden.',
    'Kære nisser. Husk at {tænde|tænne} lysene i aften.', 'Hej Sofus. Du må ikke spise {skiltene|skildtene} på peberkagehuset!',
    'Kære Julemand. Jeg {ønsker|ønnsker} mig en ny kælk.', 'Hej Frida. Din raket fløj {igennem|igenem} taget.',
    'Kære Ravn. Dine gåder var meget {svære|sværre}.', 'Hej alle sammen. {Hvornår|Vornår} starter julefesten?',
    'Kære Uglemor. Jeg har {fundet|fundt} din fjer i sneen.', 'Hej Julemand. Nisserne har {mistet|misted} arbejdsplanen.'];
  const PUNCT = [['Hvor er julebogen?', 'Hvor er julebogen.', 'Hvor er, julebogen?'],
    ['Vi skal bruge mel, sukker, smør og kanel.', 'Vi skal bruge mel sukker smør og kanel.', 'Vi skal, bruge mel sukker smør og kanel.'],
    ['Det sner. Nisserne leger i sneen.', 'Det sner nisserne leger i sneen.', 'Det sner, nisserne. Leger i sneen.'],
    ['Kommer du til festen i aften?', 'Kommer du til festen i aften.', 'Kommer du, til festen i aften'],
    ['Frida råbte: "Pas på raketten!"', 'Frida råbte "Pas på raketten"', 'Frida: råbte Pas på raketten!'],
    ['Rudolf, Sofus og Frida går ind i skoven.', 'Rudolf Sofus og Frida går ind i skoven.', 'Rudolf, Sofus, og, Frida går ind i skoven.'],
    ['Isdragen vågnede. Den var sulten.', 'Isdragen vågnede den var sulten.', 'Isdragen, vågnede den. Var sulten.'],
    ['Hvad hedder du?', 'Hvad hedder du.', 'Hvad, hedder du'],
    ['Vi fandt sider i skoven, i bjergene og i Sukkerland.', 'Vi fandt sider i skoven i bjergene og i Sukkerland.', 'Vi fandt sider, i skoven i bjergene, og i Sukkerland.'],
    ['Av! Jeg trådte på en tegnestift.', 'Av jeg trådte på en tegnestift.', 'Av, jeg. Trådte på en tegnestift'],
    ['Julemanden spurgte: "Er gaverne klar?"', 'Julemanden spurgte "Er gaverne klar."', 'Julemanden spurgte, er gaverne klar.'],
    ['Pil har en hue, en kappe og et par støvler.', 'Pil har en hue en kappe og et par støvler.', 'Pil har, en hue en kappe, og et par støvler.']];
  const SYN = [['glad', 'munter', ['træt', 'sur']], ['stor', 'kæmpe', ['lille', 'smal']], ['hurtig', 'rask', ['langsom', 'tung']],
    ['smuk', 'flot', ['grim', 'våd']], ['bange', 'ræd', ['modig', 'glad']], ['klog', 'kvik', ['dum', 'høj']],
    ['trist', 'ked af det', ['glad', 'sulten']], ['kold', 'kølig', ['varm', 'blød']], ['lille', 'bitte', ['enorm', 'bred']],
    ['sige', 'udtale', ['tie', 'løbe']]];
  const ANT = [['varm', 'kold', ['hed', 'lun']], ['lys', 'mørk', ['klar', 'skarp']], ['høj', 'lav', ['lang', 'stor']], ['stor', 'lille', ['kæmpe', 'tyk']],
    ['op', 'ned', ['over', 'oppe']], ['tung', 'let', ['stærk', 'svær']], ['hurtig', 'langsom', ['rask', 'kvik']], ['først', 'sidst', ['før', 'nu']],
    ['åben', 'lukket', ['fri', 'tom']], ['ny', 'gammel', ['frisk', 'ren']], ['våd', 'tør', ['fugtig', 'kold']], ['glad', 'trist', ['munter', 'fro']]];
  const CONJ = [['Nissen var træt, ___ han ville ikke sove.', 'men', ['fordi', 'eller']], ['Rudolf kan finde vej, ___ hans tud lyser.', 'fordi', ['men', 'eller']],
    ['Vil du have kage ___ kakao?', 'eller', ['men', 'fordi']], ['Frida tændte raketten, ___ den fløj op i luften.', 'og', ['eller', 'selvom']],
    ['Vi går ud i sneen, ___ vi har spist.', 'når', ['men', 'eller']], ['Isdragen var stor, ___ den var slet ikke farlig.', 'men', ['fordi', 'eller']],
    ['Det var koldt, ___ vi tog varmt tøj på.', 'så', ['men', 'eller']], ['Sofus spiste skiltet, ___ det lignede en kage.', 'fordi', ['eller', 'men']],
    ['Pil gemte sig, ___ han var bange.', 'fordi', ['og', 'eller']], ['Vi skal finde siderne, ___ juleaften kommer.', 'før', ['men', 'eller']],
    ['Slikkongen lo, ___ han ikke forstod sine egne ord.', 'selvom', ['eller', 'så']], ['Du kan tage lygten ___ kikkerten med.', 'eller', ['fordi', 'men']]];
  const READ3 = [
    ['Langt inde i Den fortryllede skov bor skovnissen Pil. Han har en grøn hue med en lille klokke på. En dag fandt han et lysende spor i sneen. Sporet var koldt som is og gik mod bjergene.', 'Hvem tror du har lavet sporet?', 'Noget af is fra bjergene – måske Isdragen', ['Pil selv', 'En kat fra byen']],
    ['Frida har et værksted fyldt med skruer, fjedre og mærkelige maskiner. Hendes nyeste opfindelse er en kagemaskine. Den skulle lave tre kager, men den lavede tre hundrede. Nu bor Frida i et hus fyldt med kage.', 'Hvad gik galt med kagemaskinen?', 'Den lavede alt for mange kager', ['Den gik i stykker', 'Den lavede is']],
    ['Slikkongen var ikke ond. Han var bare ensom. Hans slot var fyldt med slik, men ingen kom på besøg. Derfor begyndte sliknisserne at lave drillerier, så nogen ville lægge mærke til Sukkerland.', 'Hvorfor lavede sliknisserne drillerier?', 'De ville have, at nogen lagde mærke til Sukkerland', ['De var sultne', 'Slikkongen var ond']],
    ['Om natten flyver Isdragen over Nisseland. Dens vinger er så store, at de dækker månen. Mange nisser er bange for den, men Isdragen er faktisk en vogter. Den passer på ting, der er gamle og vigtige.', 'Hvad betyder ordet "vogter" i teksten?', 'En, der passer på noget', ['En, der stjæler', 'En, der sover']],
    ['Rudolf blev drillet, da han var lille, fordi hans tud lyste. Men en tåget juleaften kunne ingen finde vej – undtagen Rudolf. Siden da har alle været glade for hans lysende tud.', 'Hvad vil teksten lære os?', 'Det, der gør os anderledes, kan være en styrke', ['Man skal ikke flyve i tåge', 'Rensdyr kan ikke lide jul']],
    ['Julemandens værksted har 100 maskiner og 300 nisser. Hver nisse har sin opgave. Nogle maler tog, andre syr bamser. Uden arbejdsplanen ved ingen, hvem der skal gøre hvad.', 'Hvorfor er arbejdsplanen vigtig?', 'Den fortæller nisserne, hvad de skal lave', ['Den er flot at se på', 'Den kan spises']],
    ['Uglemor sidder i den gamle eg. Hun har set alt, hvad der er sket i skoven i hundrede år. Når nogen er kede af det, flyver hun ned og fortæller en historie.', 'Hvordan er Uglemor?', 'Klog og omsorgsfuld', ['Doven og sur', 'Ny i skoven']],
    ['Sofus elsker kage mere end noget andet. Han kan dufte en peberkage på tre kilometers afstand. Men da han spiste skiltene på peberkagehuset, fik han ondt i maven – og dårlig samvittighed.', 'Hvorfor fik Sofus dårlig samvittighed?', 'Han havde spist noget, der ikke var hans', ['Han havde tabt sin hue', 'Han havde glemt Rudolf']]];
  function tokens(s) { return s.split(' ').map(t => { const [w, tag] = t.split(':'); return { w, tag: tag || '' }; }); }
  const L3 = {
    wordclass(day, r, k) {
      const s = tokens(pick(WC3, day, k));
      const tags = ['N', 'U', 'T'].filter(t => s.some(x => x.tag === t));
      const tag = tags[(day + k) % tags.length];
      const [nm, ex] = WCNAME[tag];
      return { type: 'tap', multi: true, prompt: `Tryk på alle ${nm} i sætningen`, say: `Tryk på alle ${nm}.`,
        tokens: s.map(t => t.w), answer: s.map((t, i) => t.tag === tag ? i : -1).filter(i => i >= 0), hint: ex, explain: ex };
    },
    fixletter(day, r, k) {
      const raw = pick(LETTER3, day, k);
      const m = raw.match(/\{(.+?)\|(.+?)\}/);
      const shownText = raw.replace(m[0], m[2]);
      const toks = shownText.split(' ');
      const idx = toks.findIndex(t => t.replace(/[.,!?]/g, '') === m[2]);
      return { type: 'tap', multi: false, prompt: 'Der er én stavefejl i brevet. Tryk på det forkerte ord.', say: 'Find stavefejlen i brevet.', letter: true,
        tokens: toks, answer: [idx], fix: { i: idx, word: toks[idx].replace(m[2], m[1]) }, hint: 'Læs brevet langsomt, ord for ord.', explain: `Det skal staves: ${m[1]}` };
    },
    punct(day, r, k) {
      const [c, ...wr] = pick(PUNCT, day, k);
      return choice({ prompt: 'Hvilken sætning har den rigtige tegnsætning?', hint: 'Spørgsmål slutter med ?, og man sætter komma mellem ting i en opremsning.' }, c, wr, r);
    },
    synant(day, r, k) {
      const ant = (day + k) % 2 === 0;
      const [w, c, wr] = pick(ant ? ANT : SYN, day, k);
      return choice({ prompt: ant ? `Hvad er det MODSATTE af "${w}"?` : `Hvilket ord betyder det SAMME som "${w}"?`,
        hint: ant ? 'Det modsatte kaldes et antonym – fx stor og lille.' : 'Et ord, der betyder det samme, kaldes et synonym.' }, c, wr, r);
    },
    bindeord(day, r, k) {
      const [s, c, wr] = pick(CONJ, day, k);
      return choice({ prompt: 'Hvilket bindeord passer bedst?', passage: s, hint: 'Læs sætningen med hvert ord – hvilket giver mening?' }, c, wr, r);
    },
    read3(day, r, k) {
      const [t, q, c, wr] = pick(READ3, day, k);
      return choice({ prompt: q, passage: t, say: `${t} ${q}`, hint: 'Læs teksten igen. Nogle gange skal man tænke selv – svaret står mellem linjerne.' }, c, wr, r);
    },
    write(day) {
      return { type: 'write', prompt: CHAPTERS[day - 1].w3, minWords: 8, tips: ['Stort bogstav i starten', 'Punktum til sidst', 'Brug gerne et tillægsord'] };
    }
  };

  // ===================== NIVEAU 4 · 5.–6. KLASSE =====================
  const LED = ['Nisserne:G pakker:U gaver i værkstedet', 'I morgen skal:U Isdragen:G flyve:U over bjergene', 'Den:G gamle:G ræv:G læste:U en bog om stjerner',
    'Frida:G har:U bygget:U en ny raket', 'Over skoven fløj:U en:G kæmpe:G drage:G', 'Julemanden:G kunne:U ikke finde:U sin dagbog',
    'Hver aften tænder:U nisserne:G lys i vinduerne', 'Slikkongens:G krone:G sad:U fast', 'Sofus:G spiste:U skiltene på peberkagehuset',
    'I Sukkerland bor:U mange:G sliknisser:G', 'Rudolfs:G tud:G lyser:U i mørket', 'Pil:G og:G Sofus:G løb:U gennem sneen'];
  const FIG = [['Sneen lå som et hvidt tæppe over byen.', 'Sammenligning'], ['Nordlyset var et dansende slør på himlen.', 'Metafor'],
    ['Vinden hviskede hemmeligheder i trætoppene.', 'Besjæling'], ['Søde sliknisser sælger sukkerspind.', 'Allitteration'],
    ['Sofus havde spist en million peberkager.', 'Overdrivelse'], ['Rudolfs tud lyste som en lille sol.', 'Sammenligning'],
    ['Frida er en hvirvelvind af idéer.', 'Metafor'], ['Månen smilede ned til de sovende nisser.', 'Besjæling'],
    ['Kolde krystaller klirrede i kløften.', 'Allitteration'], ['Julemandens skæg er ti kilometer langt.', 'Overdrivelse'],
    ['Slottet glimtede som en diamant i mørket.', 'Sammenligning'], ['Julebogen er Nisselands hjerte.', 'Metafor'],
    ['Træerne strakte deres arme mod himlen.', 'Besjæling'], ['Glade gnister glimtede i gløderne.', 'Allitteration'],
    ['Jeg har ventet en evighed på juleaften!', 'Overdrivelse'], ['Dragens stemme var et tordenbrag i den stille hule.', 'Metafor']];
  const FIGS = ['Sammenligning', 'Metafor', 'Besjæling', 'Allitteration', 'Overdrivelse'];
  const FIGHELP = 'Sammenligning bruger "som". Metafor siger, at noget ER noget andet. Besjæling giver ting liv. Allitteration: samme startlyd. Overdrivelse: alt for meget.';
  const IND = [['Sofus sagde: "Jeg er sulten."', 'Sofus sagde, at han var sulten.', ['Sofus sagde, at jeg er sulten.', 'Sofus sagde, om han var sulten.']],
    ['Frida spurgte: "Virker min maskine?"', 'Frida spurgte, om hendes maskine virkede.', ['Frida spurgte, om min maskine virker?', 'Frida spurgte, at maskinen virkede.']],
    ['Julemanden sagde: "Vi skal finde siderne."', 'Julemanden sagde, at de skulle finde siderne.', ['Julemanden sagde, at vi skal finde siderne?', 'Julemanden sagde: at de skal finde siderne.']],
    ['Isdragen sagde: "Jeg passede på bogen."', 'Isdragen sagde, at den havde passet på bogen.', ['Isdragen sagde, at jeg passede på bogen.', 'Isdragen sagde, om den passede på bogen.']],
    ['Pil spurgte: "Hvor er festen?"', 'Pil spurgte, hvor festen var.', ['Pil spurgte, hvor er festen?', 'Pil spurgte, at festen var.']],
    ['Rudolf sagde: "Min tud blinker."', 'Rudolf sagde, at hans tud blinkede.', ['Rudolf sagde, at min tud blinker.', 'Rudolf sagde, hvis hans tud blinkede.']],
    ['Slikkongen råbte: "Jeg kan tale igen!"', 'Slikkongen råbte, at han kunne tale igen.', ['Slikkongen råbte, at jeg kan tale igen!', 'Slikkongen råbte, om han kan tale igen.']],
    ['Ræven spurgte mig: "Kan du løse min gåde?"', 'Ræven spurgte mig, om jeg kunne løse dens gåde.', ['Ræven spurgte mig, kan du løse min gåde.', 'Ræven spurgte mig, at jeg løste gåden.']],
    ['Uglemor sagde: "Jeg har boet her i hundrede år."', 'Uglemor sagde, at hun havde boet der i hundrede år.', ['Uglemor sagde, at jeg har boet her i hundrede år.', 'Uglemor sagde, om hun boede her.']],
    ['Frida sagde: "I morgen bygger jeg en raket."', 'Frida sagde, at hun dagen efter ville bygge en raket.', ['Frida sagde, at i morgen bygger jeg en raket.', 'Frida sagde, om hun byggede en raket i går.']]];
  const CORR = [['Hun lagde gaven under træet.', 'Hun lå gaven under træet.', 'Hun lagt gaven under træet.'],
    ['Jeg prøver at finde siden.', 'Jeg prøver og finde siden.', 'Jeg prøver ad finde siden.'],
    ['Nogle nisser er bange for dragen.', 'Nogen nisser er bange for dragen.', 'Noget nisser er bange for dragen.'],
    ['De løbende nisser råbte højt.', 'De løbene nisser råbte højt.', 'De løbenne nisser råbte højt.'],
    ['Sofus gav dem en kage.', 'Sofus gav de en kage.', 'Sofus gav deres en kage.'],
    ['Frida og hendes bror bygger en robot.', 'Frida og sin bror bygger en robot.', 'Frida og sit bror bygger en robot.'],
    ['Bogen ligger på bordet.', 'Bogen lægger på bordet.', 'Bogen ligge på bordet.'],
    ['Han gik ud ad døren.', 'Han gik ud at døren.', 'Han gik ud og døren.'],
    ['Da nisserne kom hjem, var der kage.', 'Da nisserne kom hjem var der, kage.', 'Da nisserne, kom hjem var der kage.'],
    ['Isdragen, som bor i bjergene, er venlig.', 'Isdragen som, bor i bjergene er venlig.', 'Isdragen som bor, i bjergene, er venlig.'],
    ['Hvis det sner, bygger vi en snemand.', 'Hvis det sner bygger, vi en snemand.', 'Hvis, det sner bygger vi en snemand.'],
    ['Er der nogen, der har set min hue?', 'Er der nogle, der har set min hue?', 'Er der noget, der har set min hue?'],
    ['Julemanden fortæller en historie.', 'Julemanden fortælle en historie.', 'Julemanden fortællr en historie.'],
    ['Vi hørte dem synge.', 'Vi hørte de synge.', 'Vi hørte deres synge.']];
  const INTERP = [
    ['Isdragen sad alene på bjergtoppen. Under den lå Nisseland og funklede som et smykke. Den ville så gerne derned, men hver gang den fløj over byen, løb nisserne skrigende ind i husene. Så den blev siddende. Og sneen faldt, og faldt.', 'Hvilken stemning er der i teksten?', 'Ensom og vemodig', ['Sjov og fjollet', 'Spændende og farlig']],
    ['Isdragen sad alene på bjergtoppen. Den ville så gerne ned til nisserne, men de var bange for den. Så den blev siddende. Og sneen faldt, og faldt.', 'Hvad fortæller den gentagne sætning "Og sneen faldt, og faldt" om dragen?', 'At den sad der meget længe og ventede', ['At det var sommer', 'At dragen var vred']],
    ['Frida kiggede på den rygende maskine. "Det var ikke en fiasko," sagde hun og tørrede sod af næsen. "Det var en meget lærerig eksplosion."', 'Hvad siger Fridas replik om hende som person?', 'Hun giver ikke op og ser det positive', ['Hun er ked af det og vil stoppe', 'Hun synes, maskiner er kedelige']],
    ['Slikkongen rejste sig fra sin trone af karamel. Han havde alt det slik, man kunne ønske sig. Alligevel spiste han ikke en eneste bid. "Slik smager bedst," sukkede han, "når man deler det med nogen."', 'Hvad er tekstens tema?', 'Venskab og fællesskab', ['Sund kost', 'Konger og magt']],
    ['Julemanden åbnede den gamle dagbog. Siderne var gule, og blækket var falmet. Men hans eget barnlige håndskrift sprang ham i øjnene: "Når jeg bliver stor, vil jeg gøre alle glade." Han smilede, og en tåre løb ned i skægget.', 'Hvorfor græder Julemanden?', 'Han bliver rørt over at genfinde sin barndomsdrøm', ['Han har slået sig', 'Dagbogen er gået i stykker']],
    ['Nordlyset bølgede over himlen i grønt og violet. Det lignede et gardin, som nogen langsomt trak til side – som om himlen ville vise noget, der havde været skjult i hundrede år.', 'Hvad forbereder billedet med gardinet læseren på?', 'At noget hemmeligt snart bliver afsløret', ['At det bliver sommer', 'At slottet bliver revet ned']],
    ['Pil var den mindste skovnisse. Når de andre klatrede i de høje træer, blev han nede. Men da sporet i sneen skulle følges ind i den smalle hule, var der kun én, der kunne passe ind.', 'Hvad vil fortælleren sige med teksten?', 'Alle har noget særligt at bidrage med', ['Små nisser skal blive hjemme', 'Huler er farlige']],
    ['Rudolf stod helt stille i tågen. Bag ham ventede otte rensdyr og en tung kane. Ingen kunne se noget. Så trak han vejret dybt, og hans tud begyndte at gløde – først svagt, så stærkere og stærkere.', 'Hvordan bygges spændingen op i teksten?', 'Det er stille og mørkt, og så bliver det langsomt lysere', ['Der kommer mange sjove replikker', 'Rudolf griner højt']]];
  const WC4 = ['Han:P lagde forsigtigt:B gaven under:F træet', 'Vi:P gik hurtigt:B gennem:F skoven', 'De:P sad stille:B ved:F bålet',
    'Hun:P kiggede ofte:B op:B mod:F stjernerne', 'Jeg:P har aldrig:B set en drage på:F så nært hold', 'Den:P lå altid:B på:F hylden',
    'Sofus gav hende:P en kage efter:F festen', 'Vi:P skal snart:B over:F broen', 'Hun:P sang højt:B for:F dragen', 'Han:P kiggede aldrig:B bag:F døren'];
  const L4 = {
    led(day, r, k) {
      const s = tokens(pick(LED, day, k));
      const tag = (day + k) % 2 ? 'U' : 'G';
      const nm = tag === 'G' ? 'grundleddet (den, der gør noget)' : 'udsagnsleddet (alle udsagnsord)';
      const ex = tag === 'G' ? 'Grundleddet findes ved at spørge "hvem eller hvad + udsagnsled?". Det kan være flere ord.' : 'Udsagnsleddet er sætningens udsagnsord – det kan være to ord, fx "skal flyve".';
      return { type: 'tap', multi: true, prompt: `Sætningsanalyse: Tryk på ${nm}`, tokens: s.map(t => t.w),
        answer: s.map((t, i) => t.tag === tag ? i : -1).filter(i => i >= 0), hint: ex, explain: ex };
    },
    figure(day, r, k) {
      const [s, c] = pick(FIG, day, k);
      const wr = shuffle(FIGS.filter(f => f !== c), r).slice(0, 3);
      return choice({ prompt: 'Hvilket sprogligt virkemiddel bruges her?', passage: s, hint: FIGHELP, explain: FIGHELP }, c, wr, r);
    },
    indirect(day, r, k) {
      const [d, c, wr] = pick(IND, day, k);
      return choice({ prompt: 'Hvordan skrives replikken som indirekte tale?', passage: d,
        hint: 'I indirekte tale forsvinder anførselstegnene, "jeg" bliver til han/hun, og tiden rykker ofte tilbage (er → var).' }, c, wr, r);
    },
    correct(day, r, k) {
      const [c, ...wr] = pick(CORR, day, k);
      return choice({ prompt: 'Kun én sætning er helt korrekt. Hvilken?', hint: 'Tjek fx at/og, ligge/lægge, nogen/nogle og kommaer ved ledsætninger.' }, c, wr, r);
    },
    interpret(day, r, k) {
      const [t, q, c, wr] = pick(INTERP, day, k);
      return choice({ prompt: q, passage: t, hint: 'Tænk over, hvad teksten viser – ikke kun hvad den siger direkte.' }, c, wr, r);
    },
    wordclass4(day, r, k) {
      const s = tokens(pick(WC4, day, k));
      const tags = ['P', 'F', 'B'].filter(t => s.some(x => x.tag === t));
      const tag = tags[(day + k) % tags.length];
      const [nm, ex] = WCNAME[tag];
      return { type: 'tap', multi: true, prompt: `Tryk på alle ${nm} i sætningen`, tokens: s.map(t => t.w),
        answer: s.map((t, i) => t.tag === tag ? i : -1).filter(i => i >= 0), hint: ex, explain: ex };
    },
    write(day) {
      return { type: 'write', prompt: CHAPTERS[day - 1].w4, minWords: 25,
        tips: ['Varier dine sætningsstarter', 'Brug mindst ét sprogligt billede', 'Afslut med en tydelig pointe'] };
    }
  };

  const PLAN = {
    1: ['listenPick', 'findLetter', 'rhyme', 'listenStory', 'syllables', 'firstSound', 'missing'],
    2: ['unscramble', 'spelling', 'fillLetter', 'sentence', 'readcomp', 'compound'],
    3: ['wordclass', 'fixletter', 'punct', 'synant', 'bindeord', 'read3'],
    4: ['led', 'figure', 'indirect', 'correct', 'interpret', 'wordclass4']
  };
  const GEN = { 1: L1, 2: L2, 3: L3, 4: L4 };
  const LEVELS = { 1: 'Børnehave', 2: '1.–2. klasse', 3: '3.–4. klasse', 4: '5.–6. klasse' };

  // 7 opgaver pr. dag (~7 minutter). Deterministisk, så en afbrudt mission genoptages med samme opgaver.
  function forDay(level, day) {
    const r = rng(hash(`nl-${level}-${day}`));
    const types = PLAN[level], g = GEN[level], out = [], count = {};
    const n = level === 1 ? 6 : (level >= 3) ? 6 : 7;
    for (let i = 0; i < n; i++) {
      const t = types[(day + i) % types.length];
      count[t] = (count[t] || 0);
      out.push(Object.assign({ kind: t }, g[t](day, r, count[t]++)));
    }
    if (level >= 3) out.push(Object.assign({ kind: 'write' }, g.write(day)));
    return out;
  }
  return { forDay, LEVELS };
})();
