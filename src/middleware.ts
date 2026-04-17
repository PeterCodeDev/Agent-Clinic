import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  if (pathname.startsWith('/api/') && pathname !== '/api/health' && pathname !== '/api/events') {
     const authHeader = request.headers.get('authorization');
     const expectedKey = process.env.AGENTCLINIC_API_KEY;

     if (expectedKey) {
        if (!authHeader || !authHeader.startsWith('Bearer ') || authHeader.split(' ')[1] !== expectedKey) {
            return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
        }
     }
  }

  return NextResponse.next();
}

export const config = {
  matcher: '/api/:path*',
};
