import packs from "@/data/client-pack.json";
import type { PrepCode, PrepPaths } from "@/lib/prep-navigation";

type Topic = { id: string; label: string };
type Counts = { published: number; free: number; pro: number; cards?: number };
type Notice = { title: string; body: string; anchor: string };

export type ClientPack = {
  code: PrepCode;
  name: string;
  slug: string;
  available: boolean;
  paths: PrepPaths;
  topics: Topic[];
  counts: Counts;
  fullCount: number;
  fullMinutes: number | null;
  fullTitle: string;
  fullDetail: string;
  anonKey: string;
  fullReady: boolean;
  quickReady: boolean;
  purchaseEnabled: boolean;
  handbookUrl?: string;
  practiceNotice?: Notice;
  freeLaunch: boolean;
  fullCountFor: (isPro: boolean) => number;
};

const catalog = packs as unknown as Record<string, Omit<ClientPack, "fullCountFor"> & { fullCountFree: number; fullCountPro: number; handbookUrl: string | null; practiceNotice: Notice | null }>;

/** Navigation and practice chrome. Question text stays on the server. */
export function packFor(state: string | null | undefined): ClientPack | null {
  const pack = state ? catalog[state] : undefined;
  if (!pack) return null;
  return {
    ...pack,
    handbookUrl: pack.handbookUrl || undefined,
    practiceNotice: pack.practiceNotice || undefined,
    fullCountFor: (isPro) => (isPro ? pack.fullCountPro : pack.fullCountFree),
  };
}
