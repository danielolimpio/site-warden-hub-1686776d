import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { SiteRecord } from "@/lib/sites-seed";

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  initial?: SiteRecord | null;
  onSave: (s: SiteRecord) => void;
}

const empty: SiteRecord = {
  id: "", url: "", domain: "", emails: [], notes: "",
  da: null, pa: null, ss: null, backlinks: null, domainAge: null, traffic: null,
  checklist: { gsc: false, ga: false, pwa: false, seo: false, adsense: false },
};

export function SiteForm({ open, onOpenChange, initial, onSave }: Props) {
  const [form, setForm] = useState<SiteRecord>(empty);
  const [emailsText, setEmailsText] = useState("");

  useEffect(() => {
    if (open) {
      const base = initial ?? empty;
      setForm(base);
      setEmailsText(base.emails.join("\n"));
    }
  }, [open, initial]);

  const set = <K extends keyof SiteRecord>(k: K, v: SiteRecord[K]) => setForm((f) => ({ ...f, [k]: v }));
  const setNum = (k: "da" | "pa" | "ss" | "backlinks", v: string) =>
    set(k, v.trim() === "" ? null : Number(v));

  const submit = () => {
    let url = form.url.trim();
    if (!url) return;
    if (!/^https?:\/\//.test(url)) url = "https://" + url;
    const domain = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
    const emails = emailsText.split(/\s|,|;/).map((e) => e.trim()).filter(Boolean);
    const id = initial?.id ?? domain;
    onSave({ ...form, id, url, domain, emails });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{initial ? "Editar site" : "Novo site"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="url">URL</Label>
            <Input id="url" placeholder="https://exemplo.com" value={form.url} onChange={(e) => set("url", e.target.value)} />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="emails">E-mails (um por linha)</Label>
            <Textarea id="emails" rows={2} value={emailsText} onChange={(e) => setEmailsText(e.target.value)} placeholder="conta@gmail.com" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field label="DA"><Input type="number" value={form.da ?? ""} onChange={(e) => setNum("da", e.target.value)} /></Field>
            <Field label="PA"><Input type="number" value={form.pa ?? ""} onChange={(e) => setNum("pa", e.target.value)} /></Field>
            <Field label="SS (%)"><Input type="number" value={form.ss ?? ""} onChange={(e) => setNum("ss", e.target.value)} /></Field>
            <Field label="Backlinks"><Input type="number" value={form.backlinks ?? ""} onChange={(e) => setNum("backlinks", e.target.value)} /></Field>
            <Field label="Idade do domínio"><Input value={form.domainAge ?? ""} onChange={(e) => set("domainAge", e.target.value || null)} placeholder="2 anos" /></Field>
            <Field label="Tráfego mensal"><Input value={form.traffic ?? ""} onChange={(e) => set("traffic", e.target.value || null)} placeholder="2.79K" /></Field>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notas</Label>
            <Input id="notes" value={form.notes ?? ""} onChange={(e) => set("notes", e.target.value)} placeholder="OTIMIZADO, ESTRUTURADO, etc." />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button onClick={submit}>Salvar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-1.5">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}