'use client';

// The "Get the app" screen's working part (round 23, BD316): for the device the visitor is on it shows either a real Install button (when the
// browser offers one-tap install) or the exact steps, and below it the three guides (iPhone and iPad, Android, computers). One piece shared by
// Bearilly for Creators and Bearilly for Schools; on a school's own website it carries the school's own name. It never says "Bearilly" itself:
// the caller passes the app's name and its picture.
import useInstallApp from '../../lib/app/useInstallApp.js';
import { installPlan, guides } from '../../lib/app/install.js';

export function InstallGlyph() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false">
      <rect x="6" y="2.5" width="12" height="19" rx="2.5" />
      <path d="M12 7.5v6.5M9.2 11.4 12 14.2l2.8-2.8" />
      <path d="M10.5 18.5h3" />
    </svg>
  );
}

const ORDER = ['ios', 'android', 'computer'];

export default function GetAppPanel({ app = 'the app', mark = null, headline = '' }) {
  const { ready, platform, standalone, canPrompt, install, outcome } = useInstallApp();
  const plan = installPlan(platform, { canPrompt, standalone }, app);
  const all = guides(app);
  const here = ready ? plan.target : '';
  return (
    <div className="get-app" data-testid="get-app-panel">
      <section className="get-app-now" data-testid="get-app-now" data-mode={ready ? plan.mode : 'checking'} aria-live="polite" aria-label={headline || `Install ${app}`}>
        {mark ? <span className="ga-mark">{mark}</span> : null}
        <div className="ga-text">
          <strong data-testid="get-app-headline">{ready ? plan.headline : `Checking this device…`}</strong>
          {ready && plan.mode === 'prompt' ? <span>Your browser can install it in one tap. It opens in its own window and keeps itself up to date.</span> : null}
          {ready && plan.mode === 'installed' ? <span>Open it from your home screen, your apps or your taskbar.</span> : null}
          {ready && plan.mode === 'unsupported' ? <span data-testid="get-app-note">{plan.note}</span> : null}
          {ready && plan.mode === 'steps' && plan.note ? <span data-testid="get-app-note">{plan.note}</span> : null}
          {outcome === 'accepted' ? <span data-testid="get-app-done">Done. Look for it among your apps.</span> : null}
          {outcome === 'dismissed' ? <span>No problem. You can install it any time from this page.</span> : null}
        </div>
        {ready && plan.mode === 'prompt' ? (
          <div className="ga-act">
            <button type="button" className="ga-go" data-testid="get-app-install" onClick={install}>
              <InstallGlyph />
              Install app
            </button>
          </div>
        ) : null}
        {ready && plan.mode === 'steps' ? (
          <ol className="get-app-steps" data-testid="get-app-steps">
            {plan.steps.map((s) => <li key={s}>{s}</li>)}
          </ol>
        ) : null}
      </section>

      <div className="get-app-cards">
        {ORDER.map((id) => {
          const g = all[id];
          return (
            <article key={id} className="ga-card" data-testid={`get-app-card-${id}`} data-here={here === id ? 'yes' : 'no'} aria-labelledby={`ga-${id}`}>
              <h2 id={`ga-${id}`}>
                {g.title}
                {here === id ? <span className="ga-tag">This device</span> : null}
              </h2>
              <p>{g.lead}</p>
              <ol>{g.steps.map((s) => <li key={s}>{s}</li>)}</ol>
              <p className="ga-note">{g.note}</p>
            </article>
          );
        })}
      </div>

      <p className="ga-fine">
        This is a web app, not a store app. Your browser puts it on your device with its own icon and its own window, and it updates itself. It needs an internet connection, the same as the website.
      </p>
    </div>
  );
}
