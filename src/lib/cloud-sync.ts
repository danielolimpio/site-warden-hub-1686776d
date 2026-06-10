import { supabase } from "@/integrations/supabase/client";
import { SEED_SITES, type ChecklistKey, type SiteRecord } from "@/lib/sites-seed";

/**
 * Snapshot/restore of the full dashboard state.
 * Stored as a single JSONB row in `app_state` (id = 'global'),
 * shared between all authenticated users of this internal panel.
 *
 * Keys synced (every relevant localStorage entry):
 *  - sites.v1                 → list of sites + metrics + checklist + notes
 *  - prompts.v2.__global__    → global prompt snippets
 *  - prompts.v2.<siteId>      → per-site prompt snippets
 */

const STATE_ID = "global";

const SYNC_PREFIXES = ["prompts.v2."];
const SYNC_EXACT = ["sites.v1"];
const LEGACY_SYNC_EXACT = ["sites.seedVersion"];
const CHECKLIST_KEYS = Object.keys(SEED_SITES[0]?.checklist ?? {}) as ChecklistKey[];
const SEED_BY_ID = new Map(SEED_SITES.map((site) => [site.id, site]));

export function isSyncedKey(key: string): boolean {
  return SYNC_EXACT.includes(key) || SYNC_PREFIXES.some((p) => key.startsWith(p));
}

export type Snapshot = {
  version: 1;
  entries: Record<string, unknown>;
  savedAt: string;
};

function entriesMatchLocal(entries: Record<string, unknown>): boolean {
  const current = collectLocal();
  const next = mergeEntries(current, filterSyncedEntries(entries));
  const keys = new Set([...Object.keys(current), ...Object.keys(next)]);
  for (const key of keys) {
    if (JSON.stringify(current[key]) !== JSON.stringify(next[key])) return false;
  }
  return true;
}

function filterSyncedEntries(entries: Record<string, unknown>): Record<string, unknown> {
  const out: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(entries)) {
    if (isSyncedKey(key)) out[key] = value;
  }
  return out;
}

function readSites(value: unknown): SiteRecord[] | null {
  return Array.isArray(value) ? (value as SiteRecord[]) : null;
}

function mergeChecklist(seed?: SiteRecord, local?: SiteRecord, remote?: SiteRecord) {
  const checklist = { ...(seed?.checklist ?? {}) } as Record<ChecklistKey, boolean>;
  for (const key of CHECKLIST_KEYS) {
    checklist[key] = Boolean(seed?.checklist?.[key] || local?.checklist?.[key] || remote?.checklist?.[key]);
  }
  return checklist;
}

function mergeSite(local?: SiteRecord, remote?: SiteRecord): SiteRecord {
  const seed = SEED_BY_ID.get(remote?.id ?? local?.id ?? "");
  const base = seed ?? local ?? remote!;
  return {
    ...base,
    ...local,
    ...remote,
    emails: remote?.emails?.length ? remote.emails : local?.emails?.length ? local.emails : base.emails ?? [],
    notes: remote?.notes?.trim() ? remote.notes : local?.notes?.trim() ? local.notes : base.notes ?? "",
    da: remote?.da ?? local?.da ?? base.da ?? null,
    pa: remote?.pa ?? local?.pa ?? base.pa ?? null,
    ss: remote?.ss ?? local?.ss ?? base.ss ?? null,
    backlinks: remote?.backlinks ?? local?.backlinks ?? base.backlinks ?? null,
    domainAge: remote?.domainAge ?? local?.domainAge ?? base.domainAge ?? null,
    traffic: remote?.traffic ?? local?.traffic ?? base.traffic ?? null,
    checklist: mergeChecklist(seed, local, remote),
  };
}

function mergeSites(localValue: unknown, remoteValue: unknown): SiteRecord[] | undefined {
  const local = readSites(localValue) ?? [];
  const remote = readSites(remoteValue) ?? [];
  if (!local.length && !remote.length) return undefined;
  const ids = new Set<string>();
  SEED_SITES.forEach((site) => ids.add(site.id));
  local.forEach((site) => ids.add(site.id));
  remote.forEach((site) => ids.add(site.id));
  const localById = new Map(local.map((site) => [site.id, site]));
  const remoteById = new Map(remote.map((site) => [site.id, site]));
  return Array.from(ids)
    .map((id) => mergeSite(localById.get(id), remoteById.get(id)))
    .filter((site) => site.id);
}

function mergeEntries(local: Record<string, unknown>, remote: Record<string, unknown>): Record<string, unknown> {
  const out = { ...local, ...remote };
  const sites = mergeSites(local["sites.v1"], remote["sites.v1"]);
  if (sites) out["sites.v1"] = sites;
  return out;
}

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
  const merged = mergeEntries(collectLocal(), filterSyncedEntries(entries));
  // Remove existing synced keys first so deletions from cloud propagate.
  const toRemove: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (!key) continue;
    if (SYNC_EXACT.includes(key) || LEGACY_SYNC_EXACT.includes(key) || SYNC_PREFIXES.some((p) => key.startsWith(p))) {
      toRemove.push(key);
    }
  }
  toRemove.forEach((k) => localStorage.removeItem(k));
  for (const [k, v] of Object.entries(merged)) {
    localStorage.setItem(k, JSON.stringify(v));
  }
}

async function getRemoteEntries(): Promise<Record<string, unknown>> {
  const { data } = await supabase
    .from("app_state")
    .select("data")
    .eq("id", STATE_ID)
    .maybeSingle();
  const snap = data?.data as Snapshot | null | undefined;
  return filterSyncedEntries(snap?.entries ?? {});
}

export async function saveSnapshot(
  overrides: Record<string, unknown> = {},
): Promise<{ ok: boolean; error?: string; savedAt?: string }> {
  const localEntries = { ...collectLocal(), ...overrides };
  const remoteEntries = Object.prototype.hasOwnProperty.call(overrides, "sites.v1") ? {} : await getRemoteEntries();
  const snapshot: Snapshot = {
    version: 1,
    entries: mergeEntries(remoteEntries, localEntries),
    savedAt: new Date().toISOString(),
  };
  const { data, error } = await supabase
    .from("app_state")
    .upsert({ id: STATE_ID, data: snapshot as unknown as never }, { onConflict: "id" })
    .select("data")
    .maybeSingle();
  if (error) return { ok: false, error: error.message };
  const persisted = data?.data as Snapshot | null | undefined;
  if (persisted?.savedAt !== snapshot.savedAt) {
    return { ok: false, error: "A nuvem não confirmou o snapshot salvo. Tente entrar novamente e salvar outra vez." };
  }
  return { ok: true, savedAt: snapshot.savedAt };
}

export async function loadSnapshot(): Promise<{
  ok: boolean;
  applied: boolean;
  changed?: boolean;
  error?: string;
  savedAt?: string;
}> {
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
  const changed = !entriesMatchLocal(snap.entries);
  applyLocal(snap.entries);
  return { ok: true, applied: true, changed, savedAt: snap.savedAt };
}

export async function getRemoteUpdatedAt(): Promise<string | null> {
  const { data } = await supabase
    .from("app_state")
    .select("updated_at")
    .eq("id", STATE_ID)
    .maybeSingle();
  return data?.updated_at ?? null;
}
