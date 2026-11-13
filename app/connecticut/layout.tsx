import type { ReactNode } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { prepPageEnabled } from '@/lib/state-release';

export const metadata: Metadata = { robots: { index: true, follow: true } };
export default function Layout({ children }: { children: ReactNode }) {
  if (!prepPageEnabled('connecticut')) notFound();
  return children;
}
