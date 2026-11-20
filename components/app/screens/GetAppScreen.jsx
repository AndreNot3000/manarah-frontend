'use client';

import { Link } from '../../../lib/app/nav.js';
import { useTenant } from '../TenantProvider';
import BrandMark from '../BrandMark';
import GetAppPanel from '../GetAppPanel';
import { appName } from '../../../lib/app/brand.js';
import { CONNECTED } from '../../../lib/app/connected.js';

// "Get the app" (round 23, BD317): for a student on their school's own website the app has the SCHOOL's name and the school's logo (or a monogram of
// its name); nobody is told which product the school uses. The same screen on Bearilly's own address says Bearilly.
export default function GetAppScreen() {
  const { school, ready } = useTenant();
  const app = appName(school);
  const waiting = CONNECTED && !school && ready === false;
  return (
    <main className="app-main" id="main" style={{ maxWidth: 980, margin: '0 auto', padding: '28px 18px 90px' }} data-testid="get-app-page">
      <div className="get-app">
        <div className="get-app-head">
          <h1 data-testid="get-app-title">{waiting ? 'Get the app' : `Get the ${app} app`}</h1>
          <p>Put {waiting ? 'it' : app} on your phone, tablet or computer. It gets its own icon and opens in its own window, like any other app.</p>
        </div>
        <GetAppPanel app={waiting ? 'the app' : app} mark={<BrandMark size={64} />} />
        <div>
          <Link href="/" className="btn btn-outline">Back</Link>
        </div>
      </div>
    </main>
  );
}
