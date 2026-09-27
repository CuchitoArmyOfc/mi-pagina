/**
 * TV en Vivo — client-side player logic.
 *
 * Loads channel playlists from iptv-org/iptv's public, freely-available
 * M3U lists (https://github.com/iptv-org/iptv) directly in the visitor's
 * browser. This file hosts no video itself; it only parses playlists and
 * plays back whatever URL each channel already publishes.
 */

// Forces module scope so top-level names don't collide with other
// side-effect scripts on the page (same pattern as mobile-nav.ts).
export {};

declare global {
  interface Window {
    Hls?: {
      isSupported(): boolean;
      Events: { ERROR: string; MANIFEST_PARSED: string };
      new (config?: Record<string, unknown>): HlsInstance;
    };
  }
}

interface HlsInstance {
  on(event: string, cb: (event: string, data: { fatal: boolean }) => void): void;
  loadSource(url: string): void;
  attachMedia(video: HTMLVideoElement): void;
  destroy(): void;
}

type Channel = {
  name: string;
  logo: string;
  groups: string[];
  quality: string;
  flags: string[];
  url: string;
};

const BASE = 'https://iptv-org.github.io/iptv/';
const PAGE = 250; // canales que se dibujan por tanda
const TIMEOUT_MS = 20000; // tiempo máximo para que un canal arranque

const CATS: Record<string, string> = {
  animation: 'Animación', auto: 'Motor', business: 'Negocios', classic: 'Clásicos', comedy: 'Comedia',
  cooking: 'Cocina', culture: 'Cultura', documentary: 'Documentales', education: 'Educación',
  entertainment: 'Entretenimiento', family: 'Familia', general: 'General', kids: 'Infantil',
  legislative: 'Legislativo', lifestyle: 'Estilo de vida', movies: 'Películas', music: 'Música',
  news: 'Noticias', outdoor: 'Aire libre', relax: 'Relax', religious: 'Religión', science: 'Ciencia',
  series: 'Series', shop: 'Compras', sports: 'Deportes', travel: 'Viajes', weather: 'Clima',
  undefined: 'Otros',
};
const COUNTRIES: [string, string][] = [
  ['ar', 'Argentina'], ['bo', 'Bolivia'], ['br', 'Brasil'], ['cl', 'Chile'], ['co', 'Colombia'],
  ['cr', 'Costa Rica'], ['cu', 'Cuba'], ['ec', 'Ecuador'], ['sv', 'El Salvador'], ['es', 'España'],
  ['us', 'Estados Unidos'], ['gt', 'Guatemala'], ['hn', 'Honduras'], ['mx', 'México'], ['ni', 'Nicaragua'],
  ['pa', 'Panamá'], ['py', 'Paraguay'], ['pe', 'Perú'], ['pr', 'Puerto Rico'], ['do', 'República Dominicana'],
  ['uy', 'Uruguay'], ['ve', 'Venezuela'],
];
const catEntries: [string, string][] = Object.entries(CATS).filter(([k]) => k !== 'undefined');
const LISTS: [string, [string, string][]][] = [
  ['Favoritos', [['fav', '★ Mis favoritos']]],
  ['Idioma', [['languages/spa.m3u', 'Español'], ['languages/eng.m3u', 'Inglés'], ['languages/por.m3u', 'Portugués']]],
  ['Categoría', catEntries.map(([k, label]) => ['categories/' + k + '.m3u', label])],
  ['País', COUNTRIES.map(([c, n]) => ['countries/' + c + '.m3u', n])],
  ['Todo', [['index.m3u', 'Todos los canales (lista grande)']]],
];

/* ---------- helpers sin dependencia del DOM ---------- */
const nameComma = (line: string): number => {
  let q = false;
  for (let i = 0; i < line.length; i++) {
    const c = line[i];
    if (c === '"') q = !q;
    else if (c === ',' && !q) return i;
  }
  return -1;
};

const FLAG_ES: Record<string, string> = { 'geo-blocked': 'Bloqueo regional', 'not 24/7': 'No 24/7' };

const parseM3U = (text: string): Channel[] => {
  const out: Channel[] = [];
  let cur: Partial<Channel> | null = null;
  for (const raw of text.split(/\r?\n/)) {
    const line = raw.trim();
    if (!line) continue;
    if (line.startsWith('#EXTINF')) {
      const i = nameComma(line);
      const head = i >= 0 ? line.slice(0, i) : line;
      let name = i >= 0 ? line.slice(i + 1).trim() : 'Canal';
      const attrs: Record<string, string> = {};
      const re = /([\w-]+)="([^"]*)"/g;
      let m: RegExpExecArray | null;
      while ((m = re.exec(head))) {
        const key = m[1];
        const val = m[2];
        if (key !== undefined && val !== undefined) attrs[key] = val;
      }
      const quality = (name.match(/\((\d{3,4}[pi])\)/) || [])[1] || '';
      const flags = [...name.matchAll(/\[([^\]]+)\]/g)].map((x) => {
        const raw = x[1] ?? '';
        return FLAG_ES[raw.toLowerCase()] || raw;
      });
      name = name.replace(/\(\d{3,4}[pi]\)/g, '').replace(/\[[^\]]+\]/g, '').replace(/\s+/g, ' ').trim();
      const groups = (attrs['group-title'] || 'Undefined').split(';').map((g) => g.trim().toLowerCase()).filter(Boolean);
      cur = { name, logo: attrs['tvg-logo'] || '', groups, quality, flags };
    } else if (line.startsWith('#')) {
      continue;
    } else if (cur) {
      cur.url = line;
      out.push(cur as Channel);
      cur = null;
    }
  }
  return out;
};

const norm = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
const catName = (g: string) => CATS[g] || g.charAt(0).toUpperCase() + g.slice(1);
const initials = (name: string): string =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || 'TV';

const store = {
  get<T>(k: string, fallback: T): T {
    try {
      const v = localStorage.getItem(k);
      return v ? (JSON.parse(v) as T) : fallback;
    } catch {
      return fallback;
    }
  },
  set(k: string, v: unknown) {
    try {
      localStorage.setItem(k, JSON.stringify(v));
    } catch {
      /* storage unavailable (private mode, quota, etc.) — non-fatal */
    }
  },
};

const favs = (): Channel[] => store.get<Channel[]>('tv.favs', []);
const isFav = (ch: Channel | null) => !!ch && favs().some((f) => f.url === ch.url);

/* ---------- referencias al DOM ---------- */
const $ = (id: string) => document.getElementById(id);
const sel = $('playlist') as HTMLSelectElement | null;
const video = $('video') as HTMLVideoElement | null;
const overlay = $('overlay');
const listEl = $('list');
const groupsEl = $('groups');
const statusEl = $('status');
const searchEl = $('search') as HTMLInputElement | null;

// Todo lo que sigue vive dentro de este bloque para que TypeScript pueda
// comprobar, una sola vez, que los elementos existen: las funciones se
// declaran como `const nombre = () => {}` (no `function`) porque solo así
// el compilador arrastra ese "no son null" hacia adentro de sus cuerpos
// (mismo patrón que ya usa scripts/mobile-nav.ts en este proyecto).
if (sel && video && overlay && listEl && groupsEl && statusEl && searchEl) {
  const secure = location.protocol === 'https:';
  const cache = new Map<string, Channel[]>();
  const bad = new Set<string>();
  let all: Channel[] = [];
  let filtered: Channel[] = [];
  let group = 'all';
  let query = '';
  let shown = PAGE;
  let current: Channel | null = null;
  let hls: HlsInstance | null = null;
  let timer: ReturnType<typeof setTimeout> | undefined;
  let triedNative = false;

  const makeLogo = (ch: Channel): HTMLElement => {
    const fallback = () => {
      const d = document.createElement('div');
      d.className = 'tv__logo';
      d.textContent = initials(ch.name);
      return d;
    };
    if (!ch.logo) return fallback();
    const img = document.createElement('img');
    img.className = 'tv__logo';
    img.loading = 'lazy';
    img.alt = '';
    img.src = ch.logo;
    img.referrerPolicy = 'no-referrer';
    img.onerror = () => img.replaceWith(fallback());
    return img;
  };

  const setStatus = (msg: string, err?: boolean) => {
    statusEl.textContent = msg;
    statusEl.className = 'tv__status' + (err ? ' tv__status--err' : '');
  };

  /* ---------- lista ---------- */
  const buildSelect = () => {
    for (const [label, items] of LISTS) {
      const og = document.createElement('optgroup');
      og.label = label;
      for (const [val, text] of items) {
        const o = document.createElement('option');
        o.value = val;
        o.textContent = text;
        og.appendChild(o);
      }
      sel.appendChild(og);
    }
    const saved = store.get('tv.list', 'languages/spa.m3u');
    sel.value = [...sel.options].some((o) => o.value === saved) ? saved : 'languages/spa.m3u';
  };

  const loadList = async (key: string): Promise<void> => {
    store.set('tv.list', key);
    group = 'all';
    shown = PAGE;
    if (key === 'fav') {
      setChannels(favs());
      return;
    }
    listEl.innerHTML = '';
    groupsEl.innerHTML = '';
    setStatus('Cargando canales…');
    try {
      let data = cache.get(key);
      if (!data) {
        const r = await fetch(BASE + key);
        if (!r.ok) throw new Error('HTTP ' + r.status);
        data = parseM3U(await r.text());
        cache.set(key, data);
      }
      if (sel.value !== key) return;
      setChannels(data);
    } catch {
      setStatus('No se pudo cargar la lista. Revisa tu conexión e inténtalo de nuevo.', true);
    }
  };

  const isInsecure = (ch: Channel): boolean => secure && !ch.url.startsWith('https:');

  const setChannels = (data: Channel[]) => {
    all = data.filter((ch) => !ch.groups.includes('xxx'));
    renderGroups();
    applyFilter();
  };

  const renderGroups = () => {
    const count: Record<string, number> = {};
    for (const ch of all) for (const g of ch.groups) count[g] = (count[g] || 0) + 1;
    const keys = Object.keys(count).sort((a, b) => (count[b] ?? 0) - (count[a] ?? 0));
    groupsEl.innerHTML = '';
    if (keys.length < 2) return;
    for (const g of ['all', ...keys]) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tv__chip' + (g === group ? ' tv__chip--on' : '');
      b.textContent = g === 'all' ? 'Todos' : catName(g);
      b.onclick = () => {
        group = g;
        shown = PAGE;
        renderGroups();
        applyFilter();
      };
      groupsEl.appendChild(b);
    }
  };

  const applyFilter = () => {
    const q = norm(query.trim());
    filtered = all.filter((ch) => (group === 'all' || ch.groups.includes(group)) && (!q || norm(ch.name).includes(q)));
    const insecureCount = filtered.filter(isInsecure).length;
    let msg = filtered.length + (filtered.length === 1 ? ' canal' : ' canales');
    if (insecureCount) msg += ' · ' + insecureCount + ' no disponibles (conexión insegura)';
    setStatus(msg);
    renderList();
  };

  const renderList = () => {
    listEl.innerHTML = '';
    if (!filtered.length) {
      const li = document.createElement('li');
      li.className = 'tv__empty';
      li.textContent = sel.value === 'fav' ? 'Aún no tienes favoritos. Toca ☆ mientras ves un canal.' : 'No hay canales que coincidan.';
      listEl.appendChild(li);
      return;
    }
    const frag = document.createDocumentFragment();
    for (const ch of filtered.slice(0, shown)) {
      const insecure = isInsecure(ch);
      const li = document.createElement('li');
      li.className = 'tv__item'
        + (current && current.url === ch.url ? ' tv__item--active' : '')
        + (bad.has(ch.url) ? ' tv__item--bad' : '')
        + (insecure ? ' tv__item--insecure' : '');
      li.appendChild(makeLogo(ch));
      const t = document.createElement('div');
      t.className = 'tv__item-text';
      const n = document.createElement('div');
      n.className = 'tv__item-name';
      n.textContent = ch.name;
      const meta = document.createElement('div');
      meta.className = 'tv__item-meta';
      const g = document.createElement('span');
      g.textContent = ch.groups.map(catName).join(' · ');
      meta.appendChild(g);
      if (ch.quality) {
        const s = document.createElement('span');
        s.className = 'tv__tag';
        s.textContent = ch.quality;
        meta.appendChild(s);
      }
      for (const f of ch.flags) {
        const s = document.createElement('span');
        s.className = 'tv__tag tv__tag--warn';
        s.textContent = f;
        meta.appendChild(s);
      }
      if (insecure) {
        const s = document.createElement('span');
        s.className = 'tv__tag tv__tag--warn';
        s.textContent = 'No disponible';
        meta.appendChild(s);
      }
      t.append(n, meta);
      li.appendChild(t);
      li.onclick = () => play(ch);
      frag.appendChild(li);
    }
    listEl.appendChild(frag);
    if (filtered.length > shown) {
      const li = document.createElement('li');
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'tv__more';
      b.textContent = 'Mostrar más (' + (filtered.length - shown) + ' restantes)';
      b.onclick = () => {
        shown += PAGE;
        renderList();
      };
      li.appendChild(b);
      listEl.appendChild(li);
    }
  };

  /* ---------- reproductor ---------- */
  const showOverlay = (html: string) => {
    overlay.innerHTML = html;
    overlay.hidden = false;
  };

  const stop = () => {
    clearTimeout(timer);
    if (hls) {
      hls.destroy();
      hls = null;
    }
    video.removeAttribute('src');
    video.load();
  };

  const play = (ch: Channel) => {
    if (isInsecure(ch)) {
      setStatus('Este canal transmite por una conexión insegura (http) y el navegador no deja reproducirlo dentro de esta página (https).', true);
      return;
    }
    stop();
    current = ch;
    triedNative = false;
    updateNow();
    renderList();
    showOverlay('<div class="tv__spinner"></div><p>Conectando…</p>');
    timer = setTimeout(() => fail(ch), TIMEOUT_MS);
    const HlsCtor = window.Hls;
    if (HlsCtor && HlsCtor.isSupported()) {
      hls = new HlsCtor({ maxBufferLength: 30 });
      hls.on(HlsCtor.Events.ERROR, (_event, data) => {
        if (data.fatal) tryNative(ch);
      });
      hls.loadSource(ch.url);
      hls.attachMedia(video);
      hls.on(HlsCtor.Events.MANIFEST_PARSED, () => video.play().catch(() => {}));
    } else {
      tryNative(ch);
    }
  };

  const tryNative = (ch: Channel) => {
    if (current !== ch) return;
    if (triedNative) return fail(ch);
    triedNative = true;
    if (hls) {
      hls.destroy();
      hls = null;
    }
    video.src = ch.url;
    video.play().catch(() => {});
  };

  const fail = (ch: Channel) => {
    if (current !== ch) return;
    clearTimeout(timer);
    bad.add(ch.url);
    renderList();
    showOverlay('<p>Este canal no está disponible ahora (puede estar caído o bloqueado en tu región).</p><button type="button" class="tv__btn" id="skip">Siguiente canal ▶</button>');
    const skipBtn = $('skip');
    if (skipBtn) skipBtn.onclick = () => step(1);
  };

  video.addEventListener('playing', () => {
    clearTimeout(timer);
    overlay.hidden = true;
    if (current) bad.delete(current.url);
  });
  video.addEventListener('error', () => {
    if (current && video.getAttribute('src')) fail(current);
  });

  const updateNow = () => {
    const logoSlot = $('nowLogo');
    const logo = current ? makeLogo(current) : null;
    if (logo && logoSlot) {
      logo.id = 'nowLogo';
      logoSlot.replaceWith(logo);
    }
    const nameEl = $('nowName');
    if (nameEl) nameEl.textContent = current ? current.name : 'Ningún canal';
    const metaEl = $('nowMeta');
    if (metaEl) metaEl.textContent = current ? current.groups.map(catName).join(' · ') + (current.quality ? ' · ' + current.quality : '') : '';
    const f = $('fav');
    if (f) {
      const on = isFav(current);
      f.textContent = on ? '★' : '☆';
      f.classList.toggle('tv__icon-btn--on', on);
      f.title = on ? 'Quitar de favoritos' : 'Agregar a favoritos';
    }
    document.title = current ? current.name + ' · TV en Vivo' : 'TV en Vivo';
  };

  const step = (dir: number) => {
    if (!filtered.length) return;
    let i = current ? filtered.findIndex((c) => c.url === current?.url) : -1;
    i = (i + dir + filtered.length) % filtered.length;
    if (i >= shown) shown = i + 1;
    const next = filtered[i];
    if (!next) return;
    play(next);
    const act = listEl.querySelector('.tv__item--active');
    if (act) act.scrollIntoView({ block: 'nearest' });
  };

  /* ---------- eventos ---------- */
  const prevBtn = $('prev');
  const nextBtn = $('next');
  const favBtn = $('fav');
  if (prevBtn) prevBtn.onclick = () => step(-1);
  if (nextBtn) nextBtn.onclick = () => step(1);
  if (favBtn) {
    favBtn.onclick = () => {
      if (!current) return;
      let f = favs();
      if (isFav(current)) f = f.filter((x) => x.url !== current?.url);
      else f.push({ name: current.name, url: current.url, logo: current.logo, groups: current.groups, quality: current.quality, flags: current.flags });
      store.set('tv.favs', f);
      updateNow();
      if (sel.value === 'fav') setChannels(f);
    };
  }
  sel.onchange = () => loadList(sel.value);
  let deb: ReturnType<typeof setTimeout>;
  searchEl.oninput = () => {
    clearTimeout(deb);
    deb = setTimeout(() => {
      query = searchEl.value;
      shown = PAGE;
      applyFilter();
    }, 150);
  };

  buildSelect();
  loadList(sel.value);
}
