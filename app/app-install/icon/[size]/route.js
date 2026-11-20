import { NextResponse } from 'next/server.js';
import { here, iconFor, readSchool, whereFrom } from '../../../../lib/app/appInstall.js';
import { iconKind } from '../../../../lib/app/schoolIcon.js';

export const dynamic = 'force-dynamic';

// One app icon, drawn from the school's logo (or the letters of its name): /app-install/icon/512, 192, 180, 512-maskable, 192-maskable.
export async function GET(request, context) {
  const spec = iconKind((await context.params).size);
  if (!spec) return new NextResponse('Not found', { status: 404 });
  const env = here();
  const made = await iconFor(await readSchool(whereFrom(request, env)), spec, env);
  if (made.redirect) return NextResponse.redirect(new URL(made.redirect, request.url), 307);
  return new NextResponse(made.png, { headers: { 'Content-Type': 'image/png', 'Cache-Control': 'public, max-age=3600, s-maxage=3600' } });
}
