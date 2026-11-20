import { NextResponse } from 'next/server.js';
import { here, manifestFor, readSchool, whereFrom } from '../../../lib/app/appInstall.js';

export const dynamic = 'force-dynamic';

// The install file ("web app manifest") of this address: the school's own name, colour and icon, or Bearilly's own on Bearilly's own address.
export async function GET(request) {
  const env = here();
  const school = await readSchool(whereFrom(request, env));
  return new NextResponse(JSON.stringify(manifestFor(school, env)), {
    headers: { 'Content-Type': 'application/manifest+json; charset=utf-8', 'Cache-Control': 'public, max-age=300, s-maxage=300' },
  });
}
