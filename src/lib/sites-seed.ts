export type ChecklistKey = "gsc" | "ga" | "pwa" | "seo" | "adsense";

export interface SiteRecord {
  id: string;
  url: string;
  domain: string;
  emails: string[];
  notes?: string;
  da: number | null;     // Domain Authority
  pa: number | null;     // Page Authority
  ss: number | null;     // Spam Score (%)
  backlinks: number | null;
  domainAge: string | null; // ex "2 anos" - opcional
  traffic: string | null;   // ex "2.79K"
  checklist: Record<ChecklistKey, boolean>;
}

const c = (gsc=false, ga=false, pwa=false, seo=false, adsense=false) =>
  ({ gsc, ga, pwa, seo, adsense });

const mk = (
  url: string,
  emails: string[],
  da: number | null,
  pa: number | null,
  ss: number | null,
  bl: number | null,
  traffic: string | null,
  notes = "",
  seo = false,
): SiteRecord => {
  const domain = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return {
    id: domain,
    url,
    domain,
    emails,
    notes,
    da, pa, ss, backlinks: bl, domainAge: null, traffic,
    checklist: c(false, false, false, seo, false),
  };
};

export const SEED_SITES: SiteRecord[] = [
  mk("https://tradepar.com.br", ["joaodoriapresidente@gmail.com"], 28, 31, null, 747, "2.79K"),
  mk("https://upira.com.br", ["danielmoreira30@gmail.com"], 29, 22, 1, 109, "1.22K"),
  mk("https://testevocacionalgratis.com", ["danielmoreiracoach@gmail.com"], 1, 5, null, 1, "1", "27.000 buscas/mês"),
  mk("https://simuladoenem.org", ["sandercleysantosalves@gmail.com"], 1, 1, null, 0, "0", "60.500 buscas/mês"),
  mk("https://efuxico.com.br", ["danielmoreira10@gmail.com"], 25, 32, 1, 850, "4.01K", "OTIMIZADO", true),
  mk("https://helplistas.com.br", ["damarisglendha@gmail.com"], 26, 17, 1, 69, "2.88K", "ESTRUTURADO"),
  mk("https://comoeumesintoquando.com.br", ["segredosdoautismo@gmail.com"], 28, 40, 1, 8230, "32.79K", "ESTRUTURADO"),
  mk("https://lojasgratis.com.br", ["hgabrielmoreira@gmail.com"], 28, 23, null, 207, "1.72K", "ESTRUTURADO"),
  mk("https://testesdeqi.com", ["jeangabriel20082205@gmail.com"], 1, 13, null, 6, "6", "27.000 buscas/mês"),
  mk("https://gruposdewhats.com.br", ["danielmoreiradmg10@gmail.com"], 8, 18, 6, 19, "338", "40.500 buscas/mês"),
  mk("https://gruposdotelegram.org", ["naturalshapebrasil@gmail.com"], 5, 18, null, 14, "15", "33.000 buscas/mês"),
  mk("https://brokertrusted.com", ["lyonessdobrasil@gmail.com"], 1, 1, null, 0, "0"),
  mk("https://rankoffers.com", ["valemarketing5@gmail.com"], 1, 1, 41, 0, "0", "Top/Rank/Trend/Hot Offers"),
  mk("https://vaquinha.org", ["universodebitcoin@gmail.com"], 3, 15, 63, 8, "12", "49.500 buscas/mês"),
  mk("https://clubedevantagem.com", ["universidademultinivel@gmail.com", "canalsuperinterativa@gmail.com"], 28, 23, 4, 52, "339", "12.000 buscas/mês"),
  mk("https://horoscopodehoje.com", ["universidademultinivel@gmail.com", "daanielmooreira211@gmail.com"], 3, 15, null, 12, "18", "165.000 buscas/mês — OTIMIZADO", true),
  mk("https://cotacaodehoje.com", ["danielmoreira08@gmail.com"], 1, 15, null, 8, "11", "68.000 buscas/mês"),
  mk("https://vagasdetrabalhos.com", ["cryptodaycash@gmail.com"], 1, 5, null, 1, "1", "90.500 buscas/mês"),
  mk("https://genoxidil.blog", ["4movecadastrar@gmail.com"], 1, 1, null, 0, "0"),
  mk("https://climahoje.com", ["danielmoreira60@gmail.com"], 1, 18, null, 13, "34", "110.000 buscas/mês"),
  mk("https://culinariafitness.com", ["danielmoreira27@gmail.com"], 2, 16, 1, 9, "15", "https://pagin.com.br"),
  mk("https://universidademultinivel.com", ["solarineenergy@gmail.com", "sucasaimobiliaria@gmail.com", "danielmonavie2011@gmail.com"], 15, 18, 1, 78, "931", "OTIMIZADO", true),
  mk("https://politicadeprivacidade.org", ["logomarcaprofissional@gmail.com"], 1, 1, null, 0, "0", "74.000 buscas/mês"),
  mk("https://modelodecontrato.org", ["Glendhadam@gmail.com"], 2, 5, null, 1, "1", "22.000 buscas/mês — SEO OTIMIZADO — No ar com deploy", true),
  mk("https://atividadeseducacaoinfantil.com", ["danielmoreira20@gmail.com"], 12, 18, 62, 18, "20", "74.000 buscas/mês"),
  mk("https://fazercurriculo.com", ["myblendoficial@gmail.com"], 4, 14, 10, 11, "40", "40.500 buscas/mês — No ar com deploy — OTIMIZADO", true),
  mk("https://impostometro.net", ["danielmoreira71@gmail.com", "imobtaubate@gmail.com"], 1, 1, null, 0, "0"),
  mk("https://seorankglobal.com", ["danielvalenight@gmail.com"], 1, 1, null, 0, "0"),
  mk("https://geradordeebooks.com", ["infinitycoinclub@gmail.com"], 1, 1, null, 0, "0"),
  mk("https://servicolocal.com", ["universidadecriptomoedas@gmail.com"], 2, 6, null, 4, "5", "Iniciado otimização — 1º prompt"),
  mk("https://trustallamerica.com", ["multitraderoficial@gmail.com"], null, null, null, null, null),
  mk("https://beijodarua.com.br", ["danielmoreira100@gmail.com"], 28, 24, 5, 134, "4.49K", "ESTRUTURADO"),
  mk("https://zipfontes.com.br", ["cotacaodehoje@gmail.com"], 25, 23, null, 93, "1.75K"),
  mk("https://backlinksbrasil.com", ["corretor.seguros1@gmail.com"], 2, 24, 8, 137, "959"),
  mk("https://aurumfoundation.top", ["danielmoreira21@gmail.com"], null, null, null, null, null),
  mk("https://aurumfoundation.world", ["empregosvaleparaiba@gmail.com"], null, null, null, null, null),
  mk("https://energiaporassinatura.pagin.com.br", ["dmoreira258@gmail.com"], null, null, null, null, null),
  mk("https://mercadolivredenergia.pagin.com.br", ["danielmoreira27@gmail.com"], null, null, null, null, null),
  mk("https://meunegociolocal.pagin.com.br", ["crossforcetaubate@gmail.com"], null, null, null, null, null),
  mk("https://baixarvideostiktok.com", ["danivinilrock@gmail.com"], null, null, null, null, null),
  mk("https://baixarvideosinstagram.com", ["baixarvideostiktok@gmail.com"], null, null, null, null, null),
  mk("https://baixarvideosfacebook.com", ["baixarvideosdoinstagram@gmail.com"], null, null, null, null, null),
  mk("https://baixarvideoskwai.com", ["vagasetrabalhos@gmail.com"], null, null, null, null, null),
  mk("https://baixarvideoyoutube.com", ["danielmoreira81@gmail.com", "baixarvideosfacebook@gmail.com"], null, null, null, null, null),
  mk("https://mercadolivredeenergia.org", ["boulevardmondebrasil@gmail.com"], null, null, null, null, null),
];