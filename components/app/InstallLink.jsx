'use client';

// The small "Get the app" button (or round icon) that points to the Get the app page (round 23, BD316). It disappears once the site is running as
// an installed app. `LinkComponent` is the product's own Link (Schools and Creators each add their own address prefix); `label` is its text
// (a school's website says "Get the <school> app").
import useInstallApp from '../../lib/app/useInstallApp.js';
import { InstallGlyph } from './GetAppPanel.jsx';

export default function InstallLink({ href, label = 'Get the app', LinkComponent = 'a', variant = 'button', className = '', onNavigate }) {
  const { standalone } = useInstallApp();
  if (standalone) return null;
  const L = LinkComponent;
  if (variant === 'icon') {
    return (
      <L href={href} className={`install-icon ${className}`.trim()} aria-label={label} title={label} data-testid="install-link" onClick={onNavigate}>
        <InstallGlyph />
      </L>
    );
  }
  return (
    <L href={href} className={`install-btn ${className}`.trim()} data-testid="install-link" onClick={onNavigate}>
      <InstallGlyph />
      <span className="ga-label">{label}</span>
    </L>
  );
}
