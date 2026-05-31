import { useState } from "react";
import { Copy, Plus, Trash2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useLocalStorage } from "@/lib/use-storage";

export type PromptCategory = "PWA" | "FTP_HOST" | "ARTIGO" | "SCROLL";
const CATS: PromptCategory[] = ["PWA", "FTP_HOST", "ARTIGO", "SCROLL"];

interface Block { id: string; title: string; code: string }
type Store = Record<PromptCategory, Block[]>;

const initialStore: Store = { PWA: [], FTP_HOST: [], ARTIGO: [], SCROLL: [] };

export function PromptManager({ siteId, siteDomain }: { siteId: string; siteDomain: string }) {
  const [store, setStore] = useLocalStorage<Store>(`prompts.v2.${siteId}`, initialStore);
  const [active, setActive] = useState<PromptCategory>("PWA");

  const blocks = store[active] ?? [];

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
    <div className="grid grid-cols-[200px_1fr] gap-6">
      <aside className="space-y-1">
        <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2 px-2">Categorias</p>
        {CATS.map((c) => (
          <button
            key={c}
            onClick={() => setActive(c)}
            className={`w-full text-left px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-between ${
              active === c
                ? "bg-primary text-primary-foreground shadow-[var(--shadow-card)]"
                : "hover:bg-secondary text-foreground"
            }`}
          >
            <span>{c}</span>
            <span className={`text-xs ${active === c ? "opacity-80" : "text-muted-foreground"}`}>
              {(store[c]?.length ?? 0)}
            </span>
          </button>
        ))}
      </aside>

      <section>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold">{active}</h2>
            <p className="text-sm text-muted-foreground">
              Snippets de <span className="font-medium text-foreground">{siteDomain}</span> · prontos para copiar e colar.
            </p>
          </div>
          <Button onClick={addBlock} size="sm"><Plus className="h-4 w-4 mr-1.5" />Novo bloco</Button>
        </div>

        {blocks.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card/40 p-12 text-center text-muted-foreground">
            Nenhum bloco em <strong>{active}</strong>. Clique em <em>Novo bloco</em> para começar.
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((b) => (
              <BlockEditor key={b.id} block={b} onChange={(p) => updateBlock(b.id, p)} onRemove={() => removeBlock(b.id)} />
            ))}
          </div>
        )}
      </section>
    </div>
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