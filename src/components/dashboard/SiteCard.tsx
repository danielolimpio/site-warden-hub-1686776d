import { ExternalLink, Mail, Pencil, Trash2, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { toast } from "sonner";
import type { ChecklistKey, SiteRecord } from "@/lib/sites-seed";
import { GSCLogo, GALogo, PWALogo, SEOLogo, AdsenseLogo, SSGLogo, TopLogo, BLLogo, ImgLogo, MobLogo } from "./BrandLogos";

const METRICS: { key: keyof SiteRecord; label: string; full: string; format?: (v: unknown) => string }[] = [
  { key: "da", label: "DA", full: "Domain Authority" },
  { key: "pa", label: "PA", full: "Page Authority" },
  { key: "ss", label: "SS", full: "Spam Score (%)", format: (v) => v == null ? "—" : `${v}%` },
  { key: "backlinks", label: "BL", full: "Total Backlinks", format: (v) => v == null ? "—" : Intl.NumberFormat("pt-BR").format(Number(v)) },
  { key: "domainAge", label: "Idade", full: "Tempo de Domínio" },
  { key: "traffic", label: "Tráfego", full: "Tráfego Mensal" },
];

const CHECKS: { key: ChecklistKey; label: string; Logo: typeof GSCLogo }[] = [
  { key: "gsc", label: "GSC", Logo: GSCLogo },
  { key: "ga", label: "GA", Logo: GALogo },
  { key: "pwa", label: "PWA", Logo: PWALogo },
  { key: "seo", label: "SEO", Logo: SEOLogo },
  { key: "adsense", label: "AdSense", Logo: AdsenseLogo },
];

const CHECKS_EXTRA: { key: ChecklistKey; label: string; full: string; Logo: typeof GSCLogo }[] = [
  { key: "ssg", label: "SSG", full: "Transformar o site em páginas HTML para indexação", Logo: SSGLogo },
  { key: "top", label: "TOP", full: "Configurar o Scroll Top", Logo: TopLogo },
  { key: "bl", label: "BL", full: "Criar Backlinks", Logo: BLLogo },
  { key: "img", label: "IMG", full: "Otimizar imagens", Logo: ImgLogo },
  { key: "mob", label: "MOB", full: "Verificar responsividade mobile", Logo: MobLogo },
];

interface Props {
  site: SiteRecord;
  selected?: boolean;
  onSelect?: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (key: ChecklistKey, value: boolean) => void;
}

function ssTone(ss: number | null) {
  if (ss == null) return "text-muted-foreground";
  if (ss >= 30) return "text-destructive";
  if (ss >= 10) return "text-[oklch(0.75_0.15_70)]";
  return "text-foreground";
}

export function SiteCard({ site, selected = false, onSelect, onEdit, onDelete, onToggle }: Props) {
  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast.success("E-mail copiado", { description: email });
  };

  const fmt = (key: string, v: unknown) => {
    if (v == null || v === "") return "—";
    const m = METRICS.find((x) => x.label === key || x.key === key);
    return m?.format ? m.format(v) : String(v);
  };

  return (
    <TooltipProvider delayDuration={150}>
      <article
        onClick={(e) => {
          // ignore clicks on interactive children
          const tag = (e.target as HTMLElement).closest("a,button,input,label,[role='checkbox']");
          if (tag) return;
          onSelect?.();
        }}
        className={`group rounded-xl p-5 transition-all cursor-pointer shadow-[var(--shadow-card)] ${
          selected
            ? "bg-[oklch(0.96_0.06_150)] border-2 border-[oklch(0.65_0.18_150)] ring-2 ring-[oklch(0.65_0.18_150)]/30 shadow-[var(--shadow-hover)]"
            : "bg-card border border-border hover:border-primary/40 hover:shadow-[var(--shadow-hover)]"
        }`}
      >
        <header className="flex items-start justify-between gap-3 mb-3">
          <div className="min-w-0 flex-1 flex items-start gap-2.5">
            <img
              src={`https://www.google.com/s2/favicons?domain=${site.domain}&sz=64`}
              alt=""
              loading="lazy"
              referrerPolicy="no-referrer"
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).style.visibility = "hidden";
              }}
              className="h-6 w-6 rounded-md bg-secondary/60 border border-border/60 p-0.5 shrink-0 mt-0.5"
            />
            <div className="min-w-0 flex-1">
              <a
                href={site.url}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 font-semibold text-foreground hover:text-primary transition truncate"
              >
                <span className="truncate">{site.domain}</span>
                <ExternalLink className="h-3.5 w-3.5 opacity-60 shrink-0" />
              </a>
              {site.notes && (
                <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{site.notes}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition">
            <Button variant="ghost" size="icon" className="h-7 w-7" onClick={onEdit} aria-label="Editar">
              <Pencil className="h-3.5 w-3.5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 hover:text-destructive" onClick={onDelete} aria-label="Excluir">
              <Trash2 className="h-3.5 w-3.5" />
            </Button>
          </div>
        </header>

        <div className="space-y-1.5 mb-4">
          {site.emails.map((email) => (
            <button
              key={email}
              type="button"
              onClick={() => copyEmail(email)}
              className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground rounded-md bg-secondary/60 hover:bg-secondary px-2 py-1.5 transition group/email"
              title="Copiar e-mail"
            >
              <Mail className="h-3 w-3 shrink-0" />
              <span className="truncate flex-1 text-left">{email}</span>
              <Copy className="h-3 w-3 opacity-0 group-hover/email:opacity-100" />
            </button>
          ))}
        </div>

        <div className="grid grid-cols-6 gap-1.5 mb-4">
          {METRICS.map((m) => {
            const val = (site as unknown as Record<string, unknown>)[m.key as string];
            return (
              <Tooltip key={m.key as string}>
                <TooltipTrigger asChild>
                  <div className="rounded-md bg-secondary/40 border border-border/60 px-1.5 py-2 text-center">
                    <div className={`text-sm font-semibold leading-none ${m.key === "ss" ? ssTone(site.ss) : "text-foreground"}`}>
                      {fmt(m.label, val)}
                    </div>
                    <div className="text-[10px] text-muted-foreground mt-1 leading-none uppercase tracking-wider">
                      {m.label}
                    </div>
                  </div>
                </TooltipTrigger>
                <TooltipContent side="top"><span className="text-xs">{m.full}</span></TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-border/60">
          {CHECKS.map(({ key, label, Logo }) => {
            const checked = site.checklist[key];
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <label
                    className={`flex flex-col items-center gap-1 cursor-pointer select-none transition ${
                      checked ? "opacity-100" : "opacity-40 hover:opacity-70"
                    }`}
                  >
                    <Logo className="h-5 w-5" />
                    <div className="flex items-center gap-1">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => onToggle(key, Boolean(v))}
                        className="h-3 w-3"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                    </div>
                  </label>
                </TooltipTrigger>
                <TooltipContent side="bottom"><span className="text-xs">{label} {checked ? "✓ configurado" : "— pendente"}</span></TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 mt-3 border-t border-border/60">
          {CHECKS_EXTRA.map(({ key, label, full, Logo }) => {
            const checked = site.checklist[key];
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <label
                    className={`flex flex-col items-center gap-1 cursor-pointer select-none transition ${
                      checked ? "opacity-100" : "opacity-40 hover:opacity-70"
                    }`}
                  >
                    <Logo className="h-5 w-5" />
                    <div className="flex items-center gap-1">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => onToggle(key, Boolean(v))}
                        className="h-3 w-3"
                      />
                      <span className="text-[10px] font-medium text-muted-foreground">{label}</span>
                    </div>
                  </label>
                </TooltipTrigger>
                <TooltipContent side="bottom"><span className="text-xs">{full} {checked ? "✓" : "— pendente"}</span></TooltipContent>
              </Tooltip>
            );
          })}
        </div>
      </article>
    </TooltipProvider>
  );
}