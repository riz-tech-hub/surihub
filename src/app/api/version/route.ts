import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  const buildId =
    process.env.NEXT_PUBLIC_BUILD_ID ||
    process.env.VERCEL_GIT_COMMIT_SHA ||
    `surihub-v1.0.1-${new Date().toISOString().slice(0, 10)}`;

  return NextResponse.json(
    {
      buildId,
      timestamp: new Date().toISOString(),
    },
    {
      headers: {
        'Cache-Control': 'public, max-age=0, must-revalidate, s-maxage=0',
      },
    }
  );
}
