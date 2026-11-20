// What a school's own app is called and looks like when it is put on a home screen (round 23, BD317): the install file (web app manifest) and the icon.
// On a school's own website (Buildgram's full swap) and on a school's address on Bearilly, the app takes the SCHOOL's name, colour and logo, so a
// student sees their school on the home screen, never Bearilly. On Bearilly's own address, with no school behind it, it is Bearilly's own app.
//
// The school's details come from the same public lookup the student app already uses (GET /api/v1/tenant). It is read here on the server, once
// every few minutes per address, so the install file and the icon cost the school's website almost nothing.
import { CONNECTED, SCHOOL_NAME } from './connected.js';
import { SCHOOLS_BASE } from './paths.js';
import { PLATFORM_APP, platformIconPath } from './brand.js';
import { buildManifest, safeColour, monogram } from './install.js';
import { acceptablePicture, logoPng, monogramPng, rgb, MAX_LOGO_BYTES } from './schoolIcon.js';

const WAIT_MS = 4000;
const REMEMBER_MS = 10 * 60 * 1000;
const remembered = new Map(); // host -> { school, until }

// The default environment of this running copy: connected to a school's website or not, the school's name Buildgram found, the address prefix.
export const here = () => ({ connected: CONNECTED, schoolName: String(SCHOOL_NAME || '').trim(), base: SCHOOLS_BASE, apiBase: '' });

const withTimeout = async (fn) => {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), WAIT_MS);
  try { return await fn(controller.signal); } finally { clearTimeout(timer); }
};

// Which school is behind this address? -> { name, logoUrl, primary, secondary } or null (no school, or the lookup could not be reached).
// `apiBase` is where the lookup lives: a school's own website asks Bearilly (BEARILLY_URL), Bearilly's own address asks itself.
export async function readSchool({ host, apiBase }, fetchImpl = fetch) {
  if (!host || !apiBase) return null;
  const known = remembered.get(host);
  if (known && known.until > Date.now()) return known.school;
  let school = null;
  try {
    const url = new URL('/api/v1/tenant', apiBase);
    url.searchParams.set('host', host);
    const res = await withTimeout((signal) => fetchImpl(url, { headers: { Accept: 'application/json', 'x-bearilly-host': host }, cache: 'no-store', signal }));
    const body = res.ok ? await res.json().catch(() => null) : null;
    const data = body && body.data;
    const name = data && data.school && typeof data.school.name === 'string' ? data.school.name.trim() : '';
    if (name) {
      const b = data.branding || {};
      school = { name, logoUrl: typeof b.logo_url === 'string' ? b.logo_url : '', primary: safeColour(b.primary_color, ''), secondary: safeColour(b.secondary_color, '') };
    }
  } catch (error) {
    return known ? known.school : null; // the lookup could not be reached: keep what was known, remember nothing new
  }
  if (remembered.size > 200) remembered.clear();
  remembered.set(host, { school, until: Date.now() + REMEMBER_MS });
  return school;
}

export const forgetSchools = () => remembered.clear();

// A short fingerprint of what the icon is drawn from, so a browser asks again when the school changes its name, colour or logo (the logo's address
// carries a one-hour signature, so only its path counts).
export function iconVersion(school, name) {
  let logo = '';
  try { logo = school && school.logoUrl ? new URL(school.logoUrl).pathname : ''; } catch (error) { logo = ''; }
  const text = `${name}|${school ? school.primary : ''}|${logo}`;
  let h = 5381;
  for (let i = 0; i < text.length; i += 1) h = ((h << 5) + h + text.charCodeAt(i)) >>> 0;
  return h.toString(36);
}

// The name this address's app has: the school behind it, else (on a school's own website) the name Buildgram found, else null (Bearilly's own).
export function schoolNameFor(school, env) {
  if (school && school.name) return school.name;
  if (env.connected) return env.schoolName || 'Student portal';
  return null;
}

// The install file for this address.
export function manifestFor(school, env = here()) {
  const name = schoolNameFor(school, env);
  const base = env.base || '';
  if (!name) {
    // no school behind this address: the app of Bearilly's own address. Its first page sits at the prefix itself ("/schools"), so the scope is the prefix
    // (a start page that redirects out of the scope would open the app with a browser bar).
    return buildManifest({
      name: PLATFORM_APP.name, shortName: PLATFORM_APP.shortName, description: PLATFORM_APP.description, base, startPath: base ? '' : '/',
      iconSrc: (size, purpose) => platformIconPath({ size, kind: purpose === 'maskable' ? 'maskable' : 'any' }),
      extra: base ? { id: base, scope: base, start_url: base } : {},
    });
  }
  return buildManifest({
    name, base, startPath: '/home', iconBase: `${base}/app-install/icon`, iconVersion: iconVersion(school, name),
    description: `${name}: your lessons, quizzes and results.`,
    themeColor: school && school.primary, backgroundColor: '#FFFFFF',
  });
}

const safeLogoAddress = (value) => {
  try {
    const u = new URL(value);
    const local = ['localhost', '127.0.0.1'].includes(u.hostname);
    return u.protocol === 'https:' || (u.protocol === 'http:' && local && process.env.NODE_ENV !== 'production');
  } catch (error) { return false; }
};

async function fetchLogo(url, fetchImpl) {
  if (!url || !safeLogoAddress(url)) return null;
  try {
    return await withTimeout(async (signal) => {
      const res = await fetchImpl(url, { signal, cache: 'no-store', redirect: 'error' });
      if (!res.ok) return null;
      const declared = Number(res.headers.get('content-length')) || 0;
      if (declared > MAX_LOGO_BYTES) return null;
      const bytes = Buffer.from(await res.arrayBuffer());
      return acceptablePicture(res.headers.get('content-type'), bytes.length) ? bytes : null;
    });
  } catch (error) {
    return null;
  }
}

// The icon for this address, as { png } to send, or { redirect } to a picture file (Bearilly's own icon, with no school behind the address).
export async function iconFor(school, spec, env = here(), fetchImpl = fetch, load) {
  const name = schoolNameFor(school, env);
  if (!name) return { redirect: platformIconPath(spec) };
  const background = rgb(school && school.primary ? school.primary : '#1E3A5F');
  const bytes = await fetchLogo(school && school.logoUrl, fetchImpl);
  const drawn = bytes ? await logoPng(bytes, { size: spec.size, kind: spec.kind, ...(load ? { load } : {}) }) : null;
  return { png: drawn || monogramPng(monogram(name), { size: spec.size, kind: spec.kind, background }), logo: Boolean(drawn) };
}

// The two things a route needs to know about the request: whose address it is, and where the school lookup lives.
export function whereFrom(request, env = here()) {
  const host = request.nextUrl.hostname;
  if (!env.connected && /^(?:localhost|127\.0\.0\.1|\[::1\])$/.test(host)) return { host, apiBase: '' }; // a developer's own computer has no school behind it
  const apiBase = env.connected ? String(process.env.BEARILLY_URL || '').replace(/\/+$/, '') : request.nextUrl.origin;
  let sameSite = false;
  try { sameSite = Boolean(apiBase) && new URL(apiBase).hostname === host && env.connected; } catch (error) { sameSite = true; }
  return { host, apiBase: sameSite ? '' : apiBase };
}
