'use client';

import { useState } from 'react';
import { Button } from '../ui';
import { readStore, writeStore } from '../../lib/app/storage';
import { useTenant } from './TenantProvider';
import BrandMark from './BrandMark';
import { appName } from '../../lib/app/brand.js';
import { Link } from '../../lib/app/nav.js';
import useInstallApp from '../../lib/app/useInstallApp.js';

// OFFLINE & INSTALL screen, bottom card: offers "Install" when the browser can do it in one tap (Android, Windows, Mac, Linux), and on an iPhone or
// iPad, where there is no install button, a "Show me how" link to the Get the app page (round 23, BD316). It is never shown once the app is
// installed, and "Not now" keeps it away on this device.
const KEY = 'bearilly:install-dismissed';

export default function InstallPrompt() {
  const { school } = useTenant();
  const { ready, platform, standalone, canPrompt, install } = useInstallApp();
  const [gone, setGone] = useState(() => Boolean(readStore(KEY)));
  const app = appName(school);
  const installName = app === 'Bearilly' ? 'your school app' : app;
  const ios = platform.os === 'ios';
  if (!ready || standalone || gone || !(canPrompt || ios)) return null;
  const close = () => {
    writeStore(KEY, true);
    setGone(true);
  };
  return (
    <div className="sheet-backdrop" style={{ background: 'transparent', pointerEvents: 'none' }}>
      <div className="sheet stack" style={{ pointerEvents: 'auto', marginBottom: 'calc(var(--tabbar-h) + env(safe-area-inset-bottom))' }} role="dialog" aria-label="Install the app" data-testid="install-prompt">
        <div className="install">
          <BrandMark size={56} />
          <div>
            <p className="card-title">Install {installName}</p>
            <p className="card-sub">{canPrompt ? 'Add it to your home screen for faster learning.' : 'Add it to your home screen: it takes three taps.'}</p>
          </div>
        </div>
        {canPrompt ? (
          <Button
            block
            onClick={async () => {
              await install();
              close();
            }}
          >
            Install
          </Button>
        ) : (
          <Link href="/get-the-app" className="btn btn-primary btn-block" onClick={close}>Show me how</Link>
        )}
        <button type="button" className="link-btn center" onClick={close} style={{ color: 'var(--muted)' }}>
          Not now
        </button>
      </div>
    </div>
  );
}
