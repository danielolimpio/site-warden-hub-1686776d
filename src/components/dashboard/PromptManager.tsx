import { useState } from "react";
import { Copy, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/use-storage";

export type PromptCategory = "PWA" | "FTP_HOST" | "ARTIGO" | "SCROLL";
const CATS: PromptCategory[] = ["PWA", "SCROLL", "FTP_HOST", "ARTIGO"];
const GLOBAL_CATS: PromptCategory[] = ["PWA", "SCROLL"];
const isGlobal = (c: PromptCategory) => GLOBAL_CATS.includes(c);

interface Block { id: string; title: string; code: string }
type Store = Record<PromptCategory, Block[]>;

const initialStore: Store = { PWA: [], FTP_HOST: [], ARTIGO: [], SCROLL: [] };

export function PromptManager({ siteId, siteDomain }: { siteId: string; siteDomain: string }) {
  const [siteStore, setSiteStore] = useLocalStorage<Store>(`prompts.v2.${siteId}`, initialStore);
  const [globalStore, setGlobalStore] = useLocalStorage<Store>(`prompts.v2.__global__`, initialStore);
  const [active, setActive] = useState<PromptCategory>("PWA");

  const activeIsGlobal = isGlobal(active);
  const store = activeIsGlobal ? globalStore : siteStore;
  const setStore = activeIsGlobal ? setGlobalStore : setSiteStore;
  const blocks = store[active] ?? [];

  const countOf = (c: PromptCategory) =>
    (isGlobal(c) ? globalStore[c]?.length : siteStore[c]?.length) ?? 0;

  const addBlock = () => {
    const nb: Block = { id: crypto.randomUUID(), title: "Novo bloco", code: "" };
    setStore({ ...store, [active]: [nb, ...blocks] });
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setStore({ ...store, [active]: blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
  };

  const removeBlock = (id: string) => {
    setStore({ ...store, [active]: blocks.filter((b) => b.id !== id) });
  };

  return (
    <div className="flex flex-col gap-4">
      <nav className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 px-2">Genéricos (todos os sites)</p>
        {GLOBAL_CATS.map((c) => (
          <CategoryButton key={c} cat={c} active={active === c} count={countOf(c)} global onClick={() => setActive(c)} />
        ))}
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 px-2 pt-3">Exclusivos deste site</p>
        {CATS.filter((c) => !isGlobal(c)).map((c) => (
          <CategoryButton key={c} cat={c} active={active === c} count={countOf(c)} onClick={() => setActive(c)} />
        ))}
      </nav>

      <section className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight flex items-center gap-2">
              {active}
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${activeIsGlobal ? "bg-[oklch(0.92_0.08_150)] text-[oklch(0.35_0.12_150)]" : "bg-secondary text-muted-foreground"}`}>
                {activeIsGlobal ? "Genérico" : "Exclusivo"}
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground truncate">
              {activeIsGlobal ? "Snippets compartilhados entre todos os sites" : `Snippets exclusivos de ${siteDomain}`}
            </p>
          </div>
          <Button onClick={addBlock} size="sm" className="shrink-0 h-8 px-2"><Plus className="h-4 w-4 mr-1" />Novo</Button>
        </div>

        {blocks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground">
            Nenhum bloco em <strong>{active}</strong>. Clique em <em>Novo</em> para começar.
          </div>
        ) : (
          <div className="space-y-3">
            {blocks.map((b) => (
              <BlockEditor key={b.id} block={b} onChange={(p) => updateBlock(b.id, p)} onRemove={() => removeBlock(b.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function CategoryButton({ cat, active, count, global: isGlobalCat, onClick }: { cat: PromptCategory; active: boolean; count: number; global?: boolean; onClick: () => void }) {
  return (
          <button
            onClick={onClick}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                : "hover:bg-secondary text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              {cat}
              {isGlobalCat && (
                <span className={`text-[9px] uppercase tracking-wider px-1 py-0.5 rounded ${active ? "bg-primary-foreground/20" : "bg-[oklch(0.92_0.08_150)] text-[oklch(0.35_0.12_150)]"}`}>
                  global
                </span>
              )}
            </span>
            <span className={`text-xs ${active ? "opacity-80" : "text-muted-foreground"}`}>{count}</span>
          </button>
  );
}

function BlockEditor({ block, onChange, onRemove }: { block: Block; onChange: (p: Partial<Block>) => void; onRemove: () => void }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(block.code);
    setCopied(true);
    toast.success("Código copiado");
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <div className="rounded-xl bg-card border border-border shadow-[var(--shadow-card)] overflow-hidden">
      <div className="flex items-center gap-2 p-3 border-b border-border bg-secondary/40">
        <Input
          value={block.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Título do bloco"
          className="border-0 bg-transparent shadow-none focus-visible:ring-0 font-medium text-sm h-8 px-2"
        />
        <Button variant="ghost" size="sm" onClick={copy} className="shrink-0">
          {copied ? <Check className="h-4 w-4 mr-1.5 text-[oklch(0.65_0.16_150)]" /> : <Copy className="h-4 w-4 mr-1.5" />}
          {copied ? "Copiado" : "Copiar"}
        </Button>
        <Button variant="ghost" size="icon" onClick={onRemove} className="h-8 w-8 hover:text-destructive shrink-0" aria-label="Excluir bloco">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
      <Textarea
        value={block.code}
        onChange={(e) => onChange({ code: e.target.value })}
        rows={10}
        placeholder="Cole seu código aqui..."
        className="font-mono text-xs border-0 rounded-none resize-y focus-visible:ring-0 bg-card"
      />
    </div>
  );
}