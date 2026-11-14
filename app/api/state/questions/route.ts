import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { hasStatePro } from '@/lib/entitlements';
import { isFreeState } from '@/lib/free-state-catalog';
import { productionStateBlocked } from '@/lib/state-release';
import { serverStateQuestions } from '@/data/full-state-server';

export async function GET(request: Request) {
  const state = new URL(request.url).searchParams.get('state');
  if (!isFreeState(state) || productionStateBlocked(state)) {
    return NextResponse.json({ error: 'State not available' }, { status: 404 });
  }
  const session = await getSession();
  const pro = Boolean(session && await hasStatePro(session.id, state));
  return NextResponse.json({ questions: serverStateQuestions(state).filter(question => pro || question.is_free), pro }, {
    headers: { 'Cache-Control': 'private, no-store' },
  });
}
