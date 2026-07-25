import { useState } from "react";
import { Copy, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/use-storage";

export type PromptCategory =
  | "PWA"
  | "SCROLL"
  | "GLOSSARIO_PT"
  | "GLOSSARIO_EN"
  | "IMG_QUEBRADA"
  | "ARTIGO";
type VisibleCategory = "PWA" | "SCROLL" | "GLOSSARIO" | "IMG_QUEBRADA" | "ARTIGO";
const GLOBAL_VIS: VisibleCategory[] = ["PWA", "SCROLL", "GLOSSARIO", "IMG_QUEBRADA"];
const SITE_VIS: VisibleCategory[] = ["ARTIGO"];
const isGlobalVis = (c: VisibleCategory) => GLOBAL_VIS.includes(c);
type GlossLang = "PT" | "EN";
const glossKey = (l: GlossLang): PromptCategory => (l === "PT" ? "GLOSSARIO_PT" : "GLOSSARIO_EN");

interface Block { id: string; title: string; code: string }
type Store = Partial<Record<PromptCategory, Block[]>>;

const initialStore: Store = { PWA: [], ARTIGO: [], SCROLL: [], GLOSSARIO_PT: [], GLOSSARIO_EN: [], IMG_QUEBRADA: [] };

const labelOf = (c: VisibleCategory) =>
  c === "IMG_QUEBRADA" ? "IMG QUEBRADA" : c === "GLOSSARIO" ? "GLOSSÁRIO" : c;

export function PromptManager({ siteId, siteDomain }: { siteId?: string | null; siteDomain?: string | null }) {
  const [siteStore, setSiteStore] = useLocalStorage<Store>(
    `prompts.v2.${siteId ?? "__none__"}`,
    initialStore,
  );
  const [globalStore, setGlobalStore] = useLocalStorage<Store>(`prompts.v2.__global__`, initialStore);
  const [active, setActive] = useState<VisibleCategory>("PWA");
  const [glossLang, setGlossLang] = useState<GlossLang>("PT");

  const activeIsGlobal = isGlobalVis(active);
  const effectiveKey: PromptCategory =
    active === "GLOSSARIO" ? glossKey(glossLang) : (active as PromptCategory);
  const store = activeIsGlobal ? globalStore : siteStore;
  const setStore = activeIsGlobal ? setGlobalStore : setSiteStore;
  const blocks = store[effectiveKey] ?? [];

  const countOf = (c: VisibleCategory) => {
    const src = isGlobalVis(c) ? globalStore : siteStore;
    if (c === "GLOSSARIO") return (src.GLOSSARIO_PT?.length ?? 0) + (src.GLOSSARIO_EN?.length ?? 0);
    return src[c as PromptCategory]?.length ?? 0;
  };

  const addBlock = () => {
    const nb: Block = { id: crypto.randomUUID(), title: "Novo bloco", code: "" };
    setStore({ ...store, [effectiveKey]: [nb, ...blocks] });
  };

  const updateBlock = (id: string, patch: Partial<Block>) => {
    setStore({ ...store, [effectiveKey]: blocks.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
  };

  const removeBlock = (id: string) => {
    setStore({ ...store, [effectiveKey]: blocks.filter((b) => b.id !== id) });
  };

  return (
    <div className="flex flex-col gap-4">
      <nav className="space-y-1">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 px-2">Genéricos (todos os sites)</p>
        {GLOBAL_VIS.map((c) => (
          <CategoryButton key={c} cat={c} active={active === c} count={countOf(c)} global onClick={() => setActive(c)} />
        ))}
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground mb-1 px-2 pt-3">
          Exclusivos {siteDomain ? `de ${siteDomain}` : "(selecione um site)"}
        </p>
        {SITE_VIS.map((c) => (
          <CategoryButton
            key={c}
            cat={c}
            active={active === c}
            count={countOf(c)}
            onClick={() => setActive(c)}
          />
        ))}
      </nav>

      <section className="border-t border-border pt-4">
        <div className="flex items-center justify-between mb-3 gap-2">
          <div className="min-w-0">
            <h2 className="text-base font-semibold leading-tight flex items-center gap-2">
              {labelOf(active)}
              <span className={`text-[10px] font-medium px-1.5 py-0.5 rounded ${activeIsGlobal ? "bg-[oklch(0.92_0.08_150)] text-[oklch(0.35_0.12_150)]" : "bg-secondary text-muted-foreground"}`}>
                {activeIsGlobal ? "Genérico" : "Exclusivo"}
              </span>
            </h2>
            <p className="text-[11px] text-muted-foreground truncate">
              {activeIsGlobal
                ? "Snippets compartilhados entre todos os sites"
                : siteDomain
                  ? `Snippets exclusivos de ${siteDomain}`
                  : "Selecione um site para ver os snippets exclusivos"}
            </p>
          </div>
          <Button
            onClick={addBlock}
            size="sm"
            className="shrink-0 h-8 px-2"
          >
            <Plus className="h-4 w-4 mr-1" />Novo
          </Button>
        </div>

        {active === "GLOSSARIO" && (
          <div className="flex gap-1 mb-3 p-1 bg-secondary/50 rounded-lg w-fit">
            {(["PT", "EN"] as GlossLang[]).map((l) => (
              <button
                key={l}
                onClick={() => setGlossLang(l)}
                className={`px-3 py-1 text-xs font-medium rounded-md transition ${
                  glossLang === l
                    ? "bg-card shadow-sm text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {l === "PT" ? "Português" : "Inglês"}
                <span className="ml-1.5 text-[10px] opacity-70">
                  {(globalStore[glossKey(l)]?.length ?? 0)}
                </span>
              </button>
            ))}
          </div>
        )}

        {blocks.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border bg-card/40 p-6 text-center text-xs text-muted-foreground">
            Nenhum bloco em <strong>{active === "GLOSSARIO" ? `GLOSSÁRIO ${glossLang}` : labelOf(active)}</strong>. Clique em <em>Novo</em> para começar.
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

function CategoryButton({ cat, active, count, global: isGlobalCat, disabled, onClick }: { cat: VisibleCategory; active: boolean; count: number; global?: boolean; disabled?: boolean; onClick: () => void }) {
  const label = cat === "GLOSSARIO" ? "GLOSSÁRIO" : cat === "IMG_QUEBRADA" ? "IMG QUEBRADA" : cat;
  return (
          <button
            onClick={onClick}
            disabled={disabled}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${
              disabled ? "opacity-40 cursor-not-allowed" :
              active
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                : "hover:bg-secondary text-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              {label}
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