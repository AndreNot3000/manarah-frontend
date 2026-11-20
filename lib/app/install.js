// "Get the app" (round 23, BD316 to BD319): which device and browser a visitor has, and what to tell them to do to put the site on their home
// screen, taskbar or dock. Pure rules, no screen in them, so a test can check them. Shared by Bearilly for Creators and Bearilly for Schools,
// and it travels to a school's own website with the student app (Buildgram's swap copies lib/app), so it never says "Bearilly" itself: every
// sentence takes the app's name from the caller (a school's own name on its own website).
//
// What this is, plainly: a WEB APP. It is not in the Apple App Store or Google Play. The browser puts it on the device with its own icon and its own
// window, and it keeps itself up to date. It needs an internet connection, the same as the website. Browsers differ in how they offer it:
//   * Chrome, Edge, Samsung Internet and Opera (Android, Windows, Mac, Linux, ChromeOS) can offer a one-tap install while the page is open;
//   * Safari on iPhone and iPad has no install button: the person uses Share, then Add to Home Screen (iOS 16.4 and newer also offers it in Chrome,
//     Edge and Firefox);
//   * Safari 17 on a Mac has File, then Add to Dock;
//   * Firefox on a computer cannot install web apps.

const has = (re, text) => re.test(text);

// What the visitor has. `env` is { userAgent, maxTouchPoints } (in the browser: navigator.userAgent and navigator.maxTouchPoints).
//   os       'ios' | 'android' | 'windows' | 'mac' | 'linux' | 'other'
//   browser  'safari' | 'chrome' | 'edge' | 'firefox' | 'samsung' | 'opera' | 'other'
//   device   'phone' | 'tablet' | 'computer'
//   target   which of the three guides is theirs: 'ios' | 'android' | 'computer'
export function detectPlatform(env = {}) {
  const ua = String(env.userAgent || '');
  const touch = Number(env.maxTouchPoints) || 0;
  const ipadOs = has(/Macintosh/, ua) && touch > 1; // iPad on iPadOS 13 and newer says it is a Mac
  const ios = has(/iPhone|iPad|iPod/, ua) || ipadOs;
  const android = !ios && has(/Android/i, ua);
  const windows = !ios && has(/Windows/i, ua);
  const mac = !ios && has(/Macintosh/, ua);
  const linux = !ios && !android && has(/Linux|X11|CrOS/, ua);
  const os = ios ? 'ios' : android ? 'android' : windows ? 'windows' : mac ? 'mac' : linux ? 'linux' : 'other';

  let browser = 'other';
  if (has(/EdgA\/|EdgiOS\/|Edg\//, ua)) browser = 'edge';
  else if (has(/OPR\/|OPiOS\/|Opera/, ua)) browser = 'opera';
  else if (has(/SamsungBrowser\//, ua)) browser = 'samsung';
  else if (has(/FxiOS\/|Firefox\//, ua)) browser = 'firefox';
  else if (has(/CriOS\/|Chrome\/|Chromium\//, ua)) browser = 'chrome';
  else if (has(/Safari\//, ua)) browser = 'safari';

  const device = ios ? (has(/iPad/, ua) || ipadOs ? 'tablet' : 'phone') : android ? (has(/Mobile/i, ua) ? 'phone' : 'tablet') : 'computer';
  const target = ios ? 'ios' : android ? 'android' : 'computer';
  return { os, browser, device, target };
}

// The three guides, one card each. `app` is the app's own name. `steps` are written for any browser on that kind of device.
export function guides(app = 'the app') {
  return {
    ios: {
      id: 'ios',
      title: 'iPhone and iPad',
      lead: `Safari puts ${app} on your home screen in three taps.`,
      steps: [
        'Open this page in Safari.',
        'Tap the Share button, the square with an arrow pointing up. It is at the bottom of the screen on an iPhone and at the top on an iPad.',
        'Scroll down and tap Add to Home Screen.',
        `Tap Add. ${app} now sits among your apps with its own icon.`,
      ],
      note: 'On iOS 16.4 or newer, Chrome, Edge and Firefox also have Add to Home Screen in their Share menu. If you cannot see it, open this page in Safari.',
    },
    android: {
      id: 'android',
      title: 'Android phones and tablets',
      lead: `Chrome, Edge or Samsung Internet install ${app} with one tap.`,
      steps: [
        'Open this page in Chrome, Edge or Samsung Internet.',
        'Press Install on this page. If you do not see it, open the browser menu (the three dots) and tap Install app, or Add to Home screen.',
        'Confirm. The icon appears with your other apps.',
      ],
      note: 'The first time it may take a few seconds to appear.',
    },
    computer: {
      id: 'computer',
      title: 'Windows, Mac and Linux computers',
      lead: `Chrome and Edge install ${app} so it opens in its own window.`,
      steps: [
        'Open this page in Chrome or Edge.',
        'Press Install on this page, or click the install icon at the right end of the address bar.',
        'Confirm. It opens in its own window, and you can pin it to the taskbar or the Dock.',
      ],
      note: 'In Safari 17 or newer on a Mac, choose File, then Add to Dock. Firefox on a computer cannot install web apps: use Chrome or Edge.',
    },
  };
}

// What to show THIS visitor. `state` is { canPrompt, standalone } from the page.
//   mode   'installed'  already running as an installed app: nothing to do
//          'prompt'     the browser can install it now: show an Install button that calls it
//          'steps'      show the steps for this device (the visitor does them by hand)
//          'unsupported' this browser cannot install web apps: say which browsers can
export function installPlan(platform, state = {}, app = 'the app') {
  const p = platform || detectPlatform({});
  const all = guides(app);
  const guide = all[p.target] || all.computer;
  if (state.standalone) return { mode: 'installed', target: p.target, guide, headline: `${app} is installed on this device.`, steps: [] };
  if (state.canPrompt) return { mode: 'prompt', target: p.target, guide, headline: `Install ${app} on this device.`, steps: [] };
  if (p.os === 'ios') {
    const safari = p.browser === 'safari';
    return {
      mode: 'steps', target: 'ios', guide,
      headline: `Add ${app} to your home screen.`,
      steps: safari ? guide.steps.slice(1) : [...guide.steps.slice(0, 3), `Tap Add. ${app} now sits among your apps with its own icon.`],
      note: safari ? '' : guide.note,
    };
  }
  if (p.os === 'mac' && p.browser === 'safari') {
    return { mode: 'steps', target: 'computer', guide, headline: `Add ${app} to your Dock.`, steps: ['In the menu bar choose File.', 'Choose Add to Dock.', 'Confirm the name and press Add.'], note: 'This needs Safari 17 or newer on macOS Sonoma or newer.' };
  }
  if (p.target === 'computer' && (p.browser === 'firefox' || p.browser === 'other')) {
    return { mode: 'unsupported', target: 'computer', guide, headline: `This browser cannot install ${app}.`, steps: [], note: 'Open this page in Chrome or Edge to install it.' };
  }
  if (p.os === 'android') {
    const menu = p.browser === 'samsung' ? 'Open the menu, tap Add page to, then Home screen.' : 'Open the browser menu (the three dots) and tap Install app, or Add to Home screen.';
    return { mode: 'steps', target: 'android', guide, headline: `Add ${app} to your home screen.`, steps: [menu, 'Confirm. The icon appears with your other apps.'], note: '' };
  }
  return { mode: 'steps', target: 'computer', guide, headline: `Install ${app} on this computer.`, steps: ['Click the install icon at the right end of the address bar, or open the browser menu and choose Install.', 'Confirm. It opens in its own window.'], note: '' };
}

// Is the page running as an installed app right now? `env` is { standaloneMedia, navigatorStandalone }.
export const isStandalone = (env = {}) => Boolean(env.standaloneMedia || env.navigatorStandalone);

// ------------------------------------------------------------------------------------------- the install file and the icon (a school's own)
// A school's name -> up to two capital letters for the icon when it has no logo: "Ornate Tech School" -> "OT", "Manarah" -> "M", "St. Mary's College" -> "SM".
export function monogram(name) {
  const words = String(name || '').replace(/[^\p{L}\p{N}\s'-]/gu, ' ').split(/\s+/).filter(Boolean);
  const skip = new Set(['of', 'the', 'and', 'for', 'a', 'an', 'at', 'in', 'school', 'college', 'academy', 'institute', 'university', 'schools']);
  const major = words.filter((w) => !skip.has(w.toLowerCase()));
  const pick = (major.length ? major : words).slice(0, 2);
  const letters = pick.map((w) => (w.match(/\p{L}|\p{N}/u) || [''])[0].toUpperCase()).join('');
  return letters || 'S';
}

// A colour from the school's branding, or the fallback when it is not a plain #RRGGBB.
export const safeColour = (value, fallback) => (/^#[0-9a-fA-F]{6}$/.test(String(value || '')) ? String(value).toUpperCase() : fallback);

// The words that go in an install file. The name is trimmed to what a home screen can show: at most 45 characters for the name, 12 for the label
// under the icon (the label is cut at a word where it can be).
export function appNames(name) {
  const full = String(name || '').replace(/\s+/g, ' ').trim().slice(0, 45) || 'School';
  if (full.length <= 12) return { name: full, shortName: full };
  const words = full.split(' ');
  let short = '';
  for (const w of words) { if ((short ? `${short} ${w}` : w).length > 12) break; short = short ? `${short} ${w}` : w; }
  return { name: full, shortName: short || full.slice(0, 12) };
}

// The install file (a web app manifest) for one app. `base` is the path the app lives under ('' on a school's own website, '/schools' on
// Bearilly's), so every address in the file is inside it. Icons: either `iconSrc(size, purpose)` gives each address (a plain picture file), or
// they are made at `iconBase/<size>[-maskable]` (a school's own, drawn from its logo). `extra` adds more members (shortcuts, categories).
// Colours are checked here, never trusted.
export function buildManifest({ name, shortName = '', description = '', base = '', iconBase = '/app-install/icon', iconSrc = null, themeColor, backgroundColor, startPath = '/', iconVersion = '', extra = {} } = {}) {
  const names = appNames(name);
  const b = String(base || '').replace(/\/+$/, '');
  const v = iconVersion ? `?v=${encodeURIComponent(String(iconVersion).slice(0, 24))}` : '';
  const src = (size, purpose) => (iconSrc ? iconSrc(size, purpose) : `${iconBase}/${size}${purpose === 'maskable' ? '-maskable' : ''}${v}`);
  const icon = (size, purpose) => ({ src: src(size, purpose), sizes: `${size}x${size}`, type: 'image/png', purpose });
  return {
    id: `${b || ''}/`,
    name: names.name,
    short_name: String(shortName || '').trim().slice(0, 12) || names.shortName,
    description: String(description || '').slice(0, 200) || `${names.name}: lessons, quizzes and results.`,
    start_url: `${b}${startPath}`,
    scope: `${b || ''}/`,
    display: 'standalone',
    orientation: 'any',
    background_color: safeColour(backgroundColor, '#FBF4E8'),
    theme_color: safeColour(themeColor, '#1E3A5F'),
    icons: [icon(192, 'any'), icon(512, 'any'), icon(192, 'maskable'), icon(512, 'maskable')],
    ...extra,
  };
}
