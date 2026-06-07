import { useEffect, useMemo, useRef, useState } from "react";
import { Plus, Search, X, LogOut, Lock, Cloud, CloudDownload, Loader2, Check } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEED_SITES, SEED_VERSION, type ChecklistKey, type SiteRecord } from "@/lib/sites-seed";
import { useLocalStorage } from "@/lib/use-storage";
import { SiteCard } from "@/components/dashboard/SiteCard";
import { SiteForm } from "@/components/dashboard/SiteForm";
import { PromptManager } from "@/components/dashboard/PromptManager";
import { useAuth } from "@/lib/auth";
import { saveSnapshot, loadSnapshot, isSyncedKey } from "@/lib/cloud-sync";
import { toast } from "sonner";
import logoSrc from "@/assets/logo.avif";

export default function Dashboard() {
  const { authed, ready, login, logout } = useAuth();
  if (!ready) return null;
  if (!authed) return <LoginScreen onLogin={login} />;
  return <DashboardInner logout={logout} />;
}

function DashboardInner({ logout }: { logout: () => void }) {
  const [sites, setSites] = useLocalStorage<SiteRecord[]>("sites.v1", SEED_SITES);
  const [seedVersion, setSeedVersion] = useLocalStorage<number>("sites.seedVersion", 0);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SiteRecord | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [loadingCloud, setLoadingCloud] = useState(true);
  const [lastSaved, setLastSaved] = useState<string | null>(null);
  const [autoStatus, setAutoStatus] = useState<"idle" | "pending" | "saving" | "saved" | "error">("idle");
  const autoTimerRef = useRef<number | null>(null);
  const autoSavingRef = useRef(false);
  const rememberCloudSavedAt = (savedAt?: string | null) => {
    if (savedAt) sessionStorage.setItem("cloud.hydrated.savedAt", savedAt);
  };

  // On first mount, try to hydrate from cloud snapshot.
  // If a snapshot exists, apply it and reload so all useLocalStorage hooks re-read.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await loadSnapshot();
      if (cancelled) return;
      if (res.applied) {
        setLastSaved(res.savedAt ?? null);
        rememberCloudSavedAt(res.savedAt);
        if (res.changed) {
          // Reload so useLocalStorage hooks pick up fresh values from cloud.
          window.location.reload();
          return;
        }
        setLoadingCloud(false);
        return;
      }
      if (res.error) toast.error("Falha ao baixar dados da nuvem", { description: res.error });
      setLoadingCloud(false);
    })();
    return () => { cancelled = true; };
  }, []);

  // ---------- Auto-sync on every change ----------
  // Any write to a synced localStorage key (sites.v1, prompts.v2.*) schedules
  // a debounced push to the cloud so the user never loses data, even without
  // clicking "Salvar tudo".
  useEffect(() => {
    if (loadingCloud) return;

    const flush = async () => {
      if (autoSavingRef.current) {
        // Re-arm if a save is already in flight; we'll catch the latest state on the next tick.
        scheduleSave();
        return;
      }
      autoSavingRef.current = true;
      setAutoStatus("saving");
      const res = await saveSnapshot();
      autoSavingRef.current = false;
      if (res.ok) {
        setLastSaved(res.savedAt ?? new Date().toISOString());
        rememberCloudSavedAt(res.savedAt);
        setAutoStatus("saved");
        window.setTimeout(() => setAutoStatus((s) => (s === "saved" ? "idle" : s)), 2000);
      } else {
        setAutoStatus("error");
        toast.error("Falha ao salvar na nuvem", { description: res.error });
      }
    };

    const scheduleSave = () => {
      setAutoStatus("pending");
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
      autoTimerRef.current = window.setTimeout(flush, 1200);
    };

    const onWrite = (e: Event) => {
      const key = (e as CustomEvent<{ key: string }>).detail?.key;
      if (!key || !isSyncedKey(key)) return;
      scheduleSave();
    };

    // Flush pending save before the tab closes.
    const onBeforeUnload = () => {
      if (autoStatus === "pending" && autoTimerRef.current) {
        window.clearTimeout(autoTimerRef.current);
        // Best-effort synchronous-ish save (the request may not complete, but worth trying).
        void saveSnapshot();
      }
    };

    window.addEventListener("ls:write", onWrite);
    window.addEventListener("beforeunload", onBeforeUnload);
    return () => {
      window.removeEventListener("ls:write", onWrite);
      window.removeEventListener("beforeunload", onBeforeUnload);
      if (autoTimerRef.current) window.clearTimeout(autoTimerRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loadingCloud]);

  // Merge new seed data when SEED_VERSION bumps, preserving user-edited fields
  // for existing sites so saved emails/metrics/checklists never revert.
  useEffect(() => {
    if (loadingCloud) return;
    if (seedVersion === SEED_VERSION) return;
    setSites((prev) => {
      const byId = new Map(prev.map((s) => [s.id, s]));
      const merged: SiteRecord[] = SEED_SITES.map((seed) => {
        const existing = byId.get(seed.id);
        if (!existing) return seed;
        return {
          ...seed,
          emails: existing.emails?.length ? existing.emails : seed.emails,
          notes: existing.notes ?? seed.notes,
          da: existing.da ?? seed.da,
          pa: existing.pa ?? seed.pa,
          ss: existing.ss ?? seed.ss,
          backlinks: existing.backlinks ?? seed.backlinks,
          checklist: { ...seed.checklist, ...existing.checklist },
          domainAge: existing.domainAge ?? seed.domainAge,
          traffic: existing.traffic ?? seed.traffic,
        };
      });
      // Keep user-created sites that are not in the seed.
      const seedIds = new Set(SEED_SITES.map((s) => s.id));
      for (const s of prev) if (!seedIds.has(s.id)) merged.push(s);
      return merged;
    });
    setSeedVersion(SEED_VERSION);
  }, [loadingCloud, seedVersion, setSites, setSeedVersion]);

  const handleSaveAll = async () => {
    setSaving(true);
    const res = await saveSnapshot();
    setSaving(false);
    if (res.ok) {
      setLastSaved(res.savedAt ?? new Date().toISOString());
      rememberCloudSavedAt(res.savedAt);
      toast.success("Tudo salvo na nuvem", { description: "Sites, métricas, checklists e prompts." });
    } else {
      toast.error("Erro ao salvar", { description: res.error });
    }
  };

  const handlePullCloud = async () => {
    if (!confirm("Substituir os dados deste navegador pelos dados salvos na nuvem?")) return;
    const res = await loadSnapshot();
    if (!res.ok) { toast.error("Erro ao baixar", { description: res.error }); return; }
    if (!res.applied) { toast.info("Nenhum snapshot salvo na nuvem ainda."); return; }
    toast.success("Dados restaurados — recarregando...");
    setTimeout(() => window.location.reload(), 600);
  };

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const sorted = [...sites].sort((a, b) => a.domain.localeCompare(b.domain, "pt-BR"));
    if (!q) return sorted;
    return sorted.filter(
      (s) =>
        s.domain.toLowerCase().includes(q) ||
        s.emails.some((e) => e.toLowerCase().includes(q)) ||
        (s.notes ?? "").toLowerCase().includes(q),
    );
  }, [sites, query]);

  const selected = useMemo(
    () => sites.find((s) => s.id === selectedId) ?? null,
    [sites, selectedId],
  );

  const stats = useMemo(() => {
    const total = sites.length;
    const seoDone = sites.filter((s) => s.checklist.seo).length;
    const gscDone = sites.filter((s) => s.checklist.gsc).length;
    const adsense = sites.filter((s) => s.checklist.adsense).length;
    return { total, seoDone, gscDone, adsense };
  }, [sites]);

  const save = async (s: SiteRecord) => {
    let nextSites: SiteRecord[] = [];
    setSites((prev) => {
      const i = prev.findIndex((x) => x.id === s.id);
      if (i === -1) {
        nextSites = [s, ...prev];
        return nextSites;
      }
      const next = prev.slice();
      next[i] = s;
      nextSites = next;
      return next;
    });
    // Push to cloud immediately (no debounce) so a quick refresh can't lose the edit.
    setAutoStatus("saving");
    const res = await saveSnapshot({ "sites.v1": nextSites });
    if (res.ok) {
      setLastSaved(res.savedAt ?? new Date().toISOString());
      rememberCloudSavedAt(res.savedAt);
      setAutoStatus("saved");
      toast.success("Site salvo na nuvem", { description: s.domain });
      window.setTimeout(() => setAutoStatus((cur) => (cur === "saved" ? "idle" : cur)), 2000);
    } else {
      setAutoStatus("error");
      toast.error("Erro ao salvar na nuvem", { description: res.error });
    }
  };

  const remove = async (id: string) => {
    if (!confirm("Excluir este site?")) return;
    let nextSites: SiteRecord[] = [];
    setSites((prev) => {
      nextSites = prev.filter((s) => s.id !== id);
      return nextSites;
    });
    const res = await saveSnapshot({ "sites.v1": nextSites });
    if (res.ok) {
      setLastSaved(res.savedAt ?? new Date().toISOString());
      rememberCloudSavedAt(res.savedAt);
      toast.success("Site excluído e salvo na nuvem");
    } else {
      toast.error("Erro ao salvar exclusão", { description: res.error });
    }
  };

  const toggle = async (id: string, key: ChecklistKey, v: boolean) => {
    let nextSites: SiteRecord[] = [];
    setSites((prev) => {
      nextSites = prev.map((s) => (s.id === id ? { ...s, checklist: { ...s.checklist, [key]: v } } : s));
      return nextSites;
    });
    setAutoStatus("saving");
    const res = await saveSnapshot({ "sites.v1": nextSites });
    if (res.ok) {
      setLastSaved(res.savedAt ?? new Date().toISOString());
      rememberCloudSavedAt(res.savedAt);
      setAutoStatus("saved");
      window.setTimeout(() => setAutoStatus((cur) => (cur === "saved" ? "idle" : cur)), 2000);
    } else {
      setAutoStatus("error");
      toast.error("Erro ao salvar marcação", { description: res.error });
    }
  };

  if (loadingCloud) {
    return (
      <div className="min-h-screen flex items-center justify-center text-muted-foreground text-sm">
        <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Carregando dados da nuvem...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background lg:pl-[400px]">
      <Toaster richColors position="bottom-right" />

      <aside className="fixed inset-y-0 left-0 z-40 w-[400px] bg-card border-r border-border shadow-[var(--shadow-hover)] flex flex-col">
          <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border bg-secondary/40">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prompts</p>
              <h2 className="text-sm font-semibold mt-0.5 truncate">
                {selected ? selected.domain : "Genéricos · todos os sites"}
              </h2>
            </div>
            {selected && (
              <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="shrink-0">
                <X className="h-4 w-4 mr-1.5" />Limpar
              </Button>
            )}
          </div>
          <div className="flex-1 overflow-y-auto p-3">
            <PromptManager siteId={selected?.id ?? null} siteDomain={selected?.domain ?? null} />
          </div>
      </aside>

      <header className="sticky top-0 z-30 backdrop-blur bg-background/85 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <img
              src={logoSrc}
              alt="Logo"
              className="h-9 w-9 rounded-xl object-contain"
            />
            <div>
              <h1 className="font-semibold leading-none">Painel de Sites</h1>
              <p className="text-xs text-muted-foreground mt-1">Uso interno · organização diária</p>
            </div>
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar domínio, e-mail ou nota…"
                className="pl-9 w-80 bg-card"
              />
            </div>
            <Button onClick={() => { setEditing(null); setOpen(true); }}>
              <Plus className="h-4 w-4 mr-1.5" />Novo site
            </Button>
            <AutoSyncBadge status={autoStatus} lastSaved={lastSaved} />
            <Button
              onClick={handleSaveAll}
              disabled={saving}
              variant="default"
              className="bg-[oklch(0.55_0.18_150)] hover:bg-[oklch(0.5_0.18_150)] text-white"
              title={lastSaved ? `Último salvamento: ${new Date(lastSaved).toLocaleString("pt-BR")}` : "Enviar tudo para a nuvem"}
            >
              {saving ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Cloud className="h-4 w-4 mr-1.5" />}
              {saving ? "Salvando..." : "Salvar tudo"}
            </Button>
            <Button variant="outline" size="sm" onClick={handlePullCloud} title="Baixar dados da nuvem (substitui locais)">
              <CloudDownload className="h-4 w-4" />
            </Button>
            <Button variant="outline" size="sm" onClick={logout} title="Sair">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <Stat label="Total de sites" value={stats.total} />
              <Stat label="SEO 100%" value={stats.seoDone} accent />
              <Stat label="GSC configurado" value={stats.gscDone} />
              <Stat label="Com AdSense" value={stats.adsense} />
            </section>

            {filtered.length === 0 ? (
              <div className="rounded-xl border border-dashed border-border bg-card/40 p-16 text-center text-muted-foreground">
                Nenhum site encontrado.
              </div>
            ) : (
              <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {filtered.map((s) => (
                  <SiteCard
                    key={s.id}
                    site={s}
                    selected={s.id === selectedId}
                    onSelect={() => setSelectedId((cur) => (cur === s.id ? null : s.id))}
                    onEdit={() => { setEditing(s); setOpen(true); }}
                    onDelete={() => remove(s.id)}
                    onToggle={(k, v) => toggle(s.id, k, v)}
                  />
                ))}
              </section>
            )}

      </main>

      <SiteForm open={open} onOpenChange={setOpen} initial={editing} onSave={save} />
    </div>
  );
}

function LoginScreen({
  onLogin,
}: {
  onLogin: (e: string, p: string) => Promise<{ ok: boolean; error?: string }>;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    const res = await onLogin(email, password);
    setBusy(false);
    if (!res.ok) setError(res.error ?? "Não foi possível autenticar.");
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Toaster richColors position="bottom-right" />
      <form
        onSubmit={submit}
        className="w-full max-w-sm rounded-2xl border border-border bg-card p-8 shadow-[var(--shadow-hover)]"
      >
        <div className="flex items-center gap-3 mb-6">
          <img src={logoSrc} alt="Logo" className="h-10 w-10 rounded-xl object-contain" />
          <div>
            <h1 className="font-semibold leading-none">Painel de Sites</h1>
            <p className="text-xs text-muted-foreground mt-1">Acesso restrito</p>
          </div>
        </div>
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">E-mail</label>
        <Input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          required
          className="mb-3"
        />
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">Senha</label>
        <Input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete="current-password"
          required
          minLength={6}
          className="mb-4"
        />
        {error && <p className="text-xs text-destructive mb-3">{error}</p>}
        <Button type="submit" className="w-full" disabled={busy}>
          {busy ? <Loader2 className="h-4 w-4 mr-1.5 animate-spin" /> : <Lock className="h-4 w-4 mr-1.5" />}
          Entrar
        </Button>
      </form>
    </div>
  );
}

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-3xl font-semibold mt-2 ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}

function AutoSyncBadge({
  status,
  lastSaved,
}: {
  status: "idle" | "pending" | "saving" | "saved" | "error";
  lastSaved: string | null;
}) {
  const title = lastSaved
    ? `Último salvamento automático: ${new Date(lastSaved).toLocaleString("pt-BR")}`
    : "Salvamento automático na nuvem";
  const map = {
    idle: { icon: <Cloud className="h-3.5 w-3.5" />, text: "Sincronizado", tone: "text-muted-foreground" },
    pending: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: "Pendente…", tone: "text-muted-foreground" },
    saving: { icon: <Loader2 className="h-3.5 w-3.5 animate-spin" />, text: "Salvando…", tone: "text-muted-foreground" },
    saved: { icon: <Check className="h-3.5 w-3.5" />, text: "Salvo", tone: "text-[oklch(0.55_0.18_150)]" },
    error: { icon: <Cloud className="h-3.5 w-3.5" />, text: "Erro ao salvar", tone: "text-destructive" },
  } as const;
  const cur = map[status];
  return (
    <span
      title={title}
      className={`hidden md:inline-flex items-center gap-1.5 text-xs px-2.5 py-1 rounded-md border border-border bg-card ${cur.tone}`}
    >
      {cur.icon}
      {cur.text}
    </span>
  );
}