'use client';

// The browser's "install this app" offer, shared by every screen that shows an Install button (round 23, BD316). A browser fires
// `beforeinstallprompt` once, early, and only to a page that is listening: if the button's screen opens later, it would miss it. So the first
// listener is attached as soon as this file is loaded in the browser, the event is kept, and every screen reads it from here.
//
//   const { ready, platform, standalone, canPrompt, install, outcome } = useInstallApp();
//     ready       false until the browser has been asked (so a screen draws nothing wrong on the first paint)
//     platform    detectPlatform() of this browser
//     standalone  true when the page is already running as an installed app
//     canPrompt   true when the browser has offered a one-tap install and it has not been used yet
//     install()   shows the browser's own install box; resolves 'accepted' | 'dismissed' | 'unavailable'
//     outcome     the last answer, or ''
import { useCallback, useEffect, useSyncExternalStore, useState } from 'react';
import { detectPlatform, isStandalone } from './install.js';

let deferred = null;
let installed = false;
const listeners = new Set();
const emit = () => listeners.forEach((l) => l());

if (typeof window !== 'undefined' && !window.__installWatch) {
  window.__installWatch = true;
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault(); // keep the offer for our own button; the browser's mini-bar would otherwise cover the page
    deferred = e;
    emit();
  });
  window.addEventListener('appinstalled', () => {
    deferred = null;
    installed = true;
    emit();
  });
}

const subscribe = (l) => { listeners.add(l); return () => listeners.delete(l); };
const getOffer = () => deferred;
const getInstalled = () => installed;

const readStandalone = () => {
  try {
    return isStandalone({ standaloneMedia: window.matchMedia('(display-mode: standalone)').matches || window.matchMedia('(display-mode: window-controls-overlay)').matches, navigatorStandalone: window.navigator.standalone === true });
  } catch (e) {
    return false;
  }
};

export default function useInstallApp() {
  const offer = useSyncExternalStore(subscribe, getOffer, () => null);
  const justInstalled = useSyncExternalStore(subscribe, getInstalled, () => false);
  const [ready, setReady] = useState(false);
  const [platform, setPlatform] = useState(() => detectPlatform({}));
  const [standalone, setStandalone] = useState(false);
  const [outcome, setOutcome] = useState('');

  useEffect(() => {
    setPlatform(detectPlatform({ userAgent: window.navigator.userAgent, maxTouchPoints: window.navigator.maxTouchPoints }));
    setStandalone(readStandalone());
    setReady(true);
    const q = window.matchMedia('(display-mode: standalone)');
    const on = () => setStandalone(readStandalone());
    q.addEventListener('change', on);
    return () => q.removeEventListener('change', on);
  }, []);

  const install = useCallback(async () => {
    const e = deferred;
    if (!e) return 'unavailable';
    deferred = null; // a browser lets the offer be used once
    emit();
    try {
      e.prompt();
      const choice = await e.userChoice;
      const answer = choice && choice.outcome === 'accepted' ? 'accepted' : 'dismissed';
      setOutcome(answer);
      return answer;
    } catch (error) {
      setOutcome('dismissed');
      return 'dismissed';
    }
  }, []);

  return { ready, platform, standalone: standalone || justInstalled, canPrompt: Boolean(offer), install, outcome };
}
