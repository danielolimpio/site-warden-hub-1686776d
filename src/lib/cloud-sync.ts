import { supabase } from "@/integrations/supabase/client";

/**
 * Snapshot/restore of the full dashboard state.
 * Stored as a single JSONB row in `app_state` (id = 'global'),
 * shared between all authenticated users of this internal panel.
 *
 * Keys synced (every relevant localStorage entry):
 *  - sites.v1                 → list of sites + metrics + checklist + notes
 *  - sites.seedVersion        → seed merge version
 *  - prompts.v2.__global__    → global prompt snippets
 *  - prompts.v2.<siteId>      → per-site prompt snippets
 */

const STATE_ID = "global";

const SYNC_PREFIXES = ["prompts.v2."];
const SYNC_EXACT = ["sites.v1", "sites.seedVersion"];

export function isSyncedKey(key: string): boolean {
  return SYNC_EXACT.includes(key) || SYNC_PREFIXES.some((p) => key.startsWith(p));
}

export type Snapshot = {
  version: 1;
  entries: Record<string, unknown>;
  savedAt: string;
};

function collectLocal(): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (SYNC_EXACT.includes(key) || SYNC_PREFIXES.some((p) => key.startsWith(p))) {
      try {
        out[key] = JSON.parse(localStorage.getItem(key) ?? "null");
      } catch {
        out[key] = localStorage.getItem(key);
      }
    }
  }
  return out;
}

function applyLocal(entries: Record<string, unknown>) {
  // Remove existing synced keys first so deletions from cloud propagate.
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (SYNC_EXACT.includes(key) || SYNC_PREFIXES.some((p) => key.startsWith(p))) {
      toRemove.push(key);
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
  for (const [k, v] of Object.entries(entries)) {
    localStorage.setItem(k, JSON.stringify(v));
  }
}

export async function saveSnapshot(
  overrides: Record<string, unknown> = {},
): Promise<{ ok: boolean; error?: string; savedAt?: string }> {
  const snapshot: Snapshot = {
    version: 1,
    entries: { ...collectLocal(), ...overrides },
    savedAt: new Date().toISOString(),
  };
  const { error } = await supabase
    .from("app_state")
    .upsert({ id: STATE_ID, data: snapshot as unknown as never }, { onConflict: "id" });
  if (error) return { ok: false, error: error.message };
  return { ok: true, savedAt: snapshot.savedAt };
}

export async function loadSnapshot(): Promise<{ ok: boolean; applied: boolean; error?: string; savedAt?: string }> {
  const { data, error } = await supabase
    .from("app_state")
    .select("data, updated_at")
    .eq("id", STATE_ID)
    .maybeSingle();
  if (error) return { ok: false, applied: false, error: error.message };
  const snap = data?.data as Snapshot | null | undefined;
  if (!snap || !snap.entries || Object.keys(snap.entries).length === 0) {
    return { ok: true, applied: false };
  }
  applyLocal(snap.entries);
  return { ok: true, applied: true, savedAt: snap.savedAt };
}

export async function getRemoteUpdatedAt(): Promise<string | null> {
  const { data } = await supabase
    .from("app_state")
    .select("updated_at")
    .eq("id", STATE_ID)
    .maybeSingle();
  return data?.updated_at ?? null;
}