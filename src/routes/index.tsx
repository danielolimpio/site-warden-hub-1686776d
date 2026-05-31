import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Toaster } from "@/components/ui/sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SEED_SITES, type ChecklistKey, type SiteRecord } from "@/lib/sites-seed";
import { useLocalStorage } from "@/lib/use-storage";
import { SiteCard } from "@/components/dashboard/SiteCard";
import { SiteForm } from "@/components/dashboard/SiteForm";
import { PromptManager } from "@/components/dashboard/PromptManager";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Painel de Sites — Uso interno" },
      { name: "description", content: "Dashboard interno para organizar sites, contas, métricas SEO e snippets." },
    ],
  }),
  component: Dashboard,
});

function Dashboard() {
  const [sites, setSites] = useLocalStorage<SiteRecord[]>("sites.v1", SEED_SITES);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<SiteRecord | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);

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

  const save = (s: SiteRecord) => {
    setSites((prev) => {
      const i = prev.findIndex((x) => x.id === s.id);
      if (i === -1) return [s, ...prev];
      const next = prev.slice();
      next[i] = s;
      return next;
    });
  };

  const remove = (id: string) => {
    if (!confirm("Excluir este site?")) return;
    setSites((prev) => prev.filter((s) => s.id !== id));
  };

  const toggle = (id: string, key: ChecklistKey, v: boolean) => {
    setSites((prev) => prev.map((s) => (s.id === id ? { ...s, checklist: { ...s.checklist, [key]: v } } : s)));
  };

  return (
    <div className={`min-h-screen bg-background transition-[padding] ${selected ? "lg:pl-[520px]" : ""}`}>
      <Toaster richColors position="bottom-right" />

      {selected && (
        <aside className="fixed inset-y-0 left-0 z-40 w-full lg:w-[520px] bg-card border-r border-border shadow-[var(--shadow-hover)] flex flex-col">
          <div className="flex items-center justify-between gap-2 px-5 py-4 border-b border-border bg-secondary/40">
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Prompts do site</p>
              <h2 className="text-sm font-semibold mt-0.5 truncate">{selected.domain}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setSelectedId(null)} className="shrink-0">
              <X className="h-4 w-4 mr-1.5" />Fechar
            </Button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            <PromptManager siteId={selected.id} siteDomain={selected.domain} />
          </div>
        </aside>
      )}

      <header className="sticky top-0 z-30 backdrop-blur bg-background/85 border-b border-border">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center gap-4">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-primary text-primary-foreground grid place-items-center font-bold">
              SD
            </div>
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

function Stat({ label, value, accent = false }: { label: string; value: number; accent?: boolean }) {
  return (
    <div className="rounded-xl bg-card border border-border p-4 shadow-[var(--shadow-card)]">
      <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      <p className={`text-3xl font-semibold mt-2 ${accent ? "text-primary" : "text-foreground"}`}>{value}</p>
    </div>
  );
}
