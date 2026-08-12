import { type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/server';

export async function proxy(request: NextRequest) {
  try {
    return await updateSession(request);
  } catch {
    const { NextResponse } = await import('next/server');
    return NextResponse.next();
  }
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|manifest.json|sw.js|icons|api|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};
