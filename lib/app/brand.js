import { CONNECTED, SCHOOL_NAME } from './connected.js';

// What the student app calls itself. On Bearilly's own address it is "Bearilly". On a school's own website
// (CONNECTED) it is the SCHOOL's name, so a student never sees that the school uses Bearilly.
//   appName(school)  - the name to show; `school` is the tenant's school (or null while it loads).
//   pageTitle(page, school) - "Page · School name" for the browser tab.
//   tutorFallback(school)   - the study tutor's name when the school has not named it.
export function appName(school) {
  const name = school && typeof school.name === 'string' ? school.name.trim() : '';
  if (name) return name;
  if (CONNECTED) return (SCHOOL_NAME || '').trim() || 'Student portal';
  return 'Bearilly';
}

// The text of the "Get the app" button: plain on Bearilly's own address, the school's own name on its website (or its address on Bearilly).
export function getAppLabel(school) {
  const app = appName(school);
  return app === 'Bearilly' ? 'Get the app' : `Get the ${app} app`;
}

export function pageTitle(page, school) {
  const app = appName(school);
  return page ? `${page} · ${app}` : app;
}

export function tutorFallback(school) {
  const name = school && typeof school.name === 'string' ? school.name.trim() : '';
  return name ? `${name} tutor` : 'Study tutor';
}

// The study tutor's name when the school has not named it: "Bearilly" on Bearilly's own website, a neutral name on a school's website.
export function defaultTutorName() {
  return CONNECTED ? 'Study tutor' : 'Bearilly';
}

export function showsBearilly() {
  return !CONNECTED;
}

// The browser tab title once the school's name is known. The static title (set by the layout) says "Student portal" when
// Buildgram could not read the school's name; this swaps that stand-in for the real name. Anything else is left alone.
export function retitle(current, school) {
  if (!CONNECTED) return current;
  const name = school && typeof school.name === 'string' ? school.name.trim() : '';
  if (!name) return current;
  const stand = 'Student portal';
  if (current === stand) return name;
  if (typeof current === 'string' && current.endsWith(` · ${stand}`)) return `${current.slice(0, -stand.length)}${name}`;
  return current;
}

// Does this address point at an SVG picture? (An SVG works as a tab icon but not as a phone home-screen icon.)
export const isSvgUrl = (url) => typeof url === 'string' && /\.svg(?:[?#]|$)/i.test(url);

// Help-centre and other fixed texts that name Bearilly. On Bearilly's own website they are shown as written. On a school's own website
// the same sentences say the school's name (or "your school") instead, so a student is never shown which product the school uses.
export function whiteLabelText(text, school) {
  if (!CONNECTED || typeof text !== 'string') return text;
  const app = appName(school);
  return text
    .replace(/your school(?:’|')s Bearilly address \(for example [^)]*\)/g, 'your school’s website address')
    .replace(/Contact Bearilly support/g, 'Contact your school')
    .replace(/Bearilly never sees/g, 'The learning platform never sees')
    .replace(/install Bearilly like an app/gi, 'install this app on your phone')
    .replace(/Bearilly/g, app);
}

// The app as Bearilly's own address installs it (no school behind the address): its name, short name, description and where its icon pictures are.
// A school's own address or website never uses this; it gets the school's name and icon (lib/app/appInstall.js).
export const PLATFORM_APP = Object.freeze({
  name: 'Bearilly for Schools',
  shortName: 'Bearilly',
  description: 'Learn, submit and grow with your AI study buddy.',
});

// The picture file of Bearilly's own icon for a size and kind ({ size: 192, kind: 'maskable' } from iconKind in lib/app/schoolIcon.js).
export const platformIconPath = ({ size, kind }) => (kind === 'apple' ? '/bear/exports/apple-touch-180.png' : `/bear/exports/app-${kind === 'maskable' ? 'maskable-' : ''}${size}.png`);
