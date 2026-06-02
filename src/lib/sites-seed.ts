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
  mk("https://agoranabahia.com.br", [], 36, 32, 11, 251, null),
  mk("https://fileconvert.cloud", [], 1, 18, null, 14, null),
  mk("https://marmorarias.shop", [], 1, 1, null, 0, null),
  mk("https://polartensor.trade", [], 1, 1, null, 0, null),
  mk("https://baixarvideostwitter.com", [], 1, 5, null, 1, null),
  mk("https://baixarvideosfacebook.com", ["baixarvideosdoinstagram@gmail.com"], 8, 10, 8, 3, null),
  mk("https://baixarvideoskwai.com", ["vagasetrabalhos@gmail.com"], 1, 5, null, 1, null),
  mk("https://baixarvideoyoutube.com", ["danielmoreira81@gmail.com"], 5, 25, 9, 63, null),
  mk("https://baixarvideostiktok.com", ["danivinilrock@gmail.com"], 1, 11, null, 4, null),
  mk("https://baixarvideosinstagram.com", ["baixarvideostiktok@gmail.com"], 1, 5, null, 1, null),
  mk("https://batepapogratis.com", [], 2, 18, 14, 14, null),
  mk("https://comoeumesintoquando.com.br", ["segredosdoautismo@gmail.com"], 29, 40, 1, 8230, null),
  mk("https://fatospoliticos.com.br", [], 32, 28, 4, 602, null),
  mk("https://cebolla.app", [], 41, 31, 5, 174, null),
  mk("https://tuangacor.com", [], 59, 36, 14, 3940, null),
  mk("https://unitedubai.blog", [], 34, 33, 13, 146, null),
  mk("https://spazi.info", [], 55, 34, 31, 1090, null),
  mk("https://senin.click", [], 44, 34, 12, 170, null),
  mk("https://sashko.pro", [], 35, 35, 15, 491, null),
  mk("https://pelit.click", [], 42, 44, 12, 758, null),
  mk("https://pedis.click", [], 13, 17, 12, 13, null),
  mk("https://nikke.blog", [], 36, 33, 13, 135, null),
  mk("https://nalgonas.org", [], 52, 38, 12, 277, null),
  mk("https://mobilenumbers.me", [], 49, 35, 10, 250, null),
  mk("https://mdgroup.pro", [], 39, 36, 68, 231, null),
  mk("https://groupeforum.pro", [], 34, 45, 13, 1120, null),
  mk("https://bisnis.cam", [], 54, 31, 13, 260, null),
  mk("https://zipfontes.com.br", ["cotacaodehoje@gmail.com"], 24, 25, 15, 95, null),
  mk("https://mercadolivredenergia.org", ["boulevardmondebrasil@gmail.com"], 1, 1, null, 0, null),
  mk("https://pagin.com.br", [], 1, 1, null, 0, null),
  mk("https://acquaflux.com", ["danielmoreira33@gmail.com"], 1, 20, 12, 17, null),
  mk("https://theartofyoga.org", ["danielmoreira9@gmail.com"], 24, 43, 15, 7100, null),
  mk("https://aurumfoundation.top", ["danielmoreira21@gmail.com"], 1, 5, null, 1, null),
  mk("https://aurumfoundation.world", ["empregosvaleparaiba@gmail.com"], 2, 16, null, 9, null),
  mk("https://tradelidexapp.com", [], 37, 33, 9, 195, null),
  mk("https://maracatubrasil.com.br", [], 33, 22, 8, 76, null),
  mk("https://rankoffers.com", ["valemarketing5@gmail.com"], 1, 16, 14, 9, null),
  mk("https://siteconfiavel.pro", [], 1, 5, null, 1, null),
  mk("https://comidasjaponesas.com", [], 1, 11, null, 4, null),
  mk("https://efuxico.com.br", ["danielmoreira10@gmail.com"], 25, 32, 8, 823, null),
  mk("https://beijodarua.com.br", ["danielmoreira100@gmail.com"], 25, 27, 8, 140, null),
  mk("https://servicolocal.com", ["universidadecriptomoedas@gmail.com"], 2, 6, null, 4, null),
  mk("https://atividadeseducacaoinfantil.com", ["danielmoreira20@gmail.com"], 13, 18, 12, 18, null),
  mk("https://fazercurriculo.com", ["myblendoficial@gmail.com"], 4, 14, 7, 12, null),
  mk("https://modelodecontrato.org", ["Glendhadam@gmail.com"], 1, 17, 7, 11, null),
  mk("https://politicadeprivacidade.org", ["logomarcaprofissional@gmail.com"], 1, 8, 5, 2, null),
  mk("https://vaquinha.org", ["universodebitcoin@gmail.com"], 3, 15, 12, 8, null),
  mk("https://gaiacreative.com.br", [], 31, 27, 15, 100, null),
  mk("https://upira.com.br", ["danielmoreira30@gmail.com"], 29, 23, 10, 111, null),
  mk("https://helplistas.com.br", ["damarisglendha@gmail.com"], 26, 24, 7, 81, null),
  mk("https://tradepar.com.br", ["joaodoriapresidente@gmail.com"], 27, 30, 7, 722, null),
  mk("https://lojasgratis.com.br", ["hgabrielmoreira@gmail.com"], 27, 27, 12, 209, null),
  mk("https://clubedevantagem.com", ["universidademultinivel@gmail.com"], 30, 23, 8, 51, null),
  mk("https://horoscopodehoje.com", ["universidademultinivel@gmail.com"], 3, 17, null, 15, null),
  mk("https://cotacaodehoje.com", ["danielmoreira08@gmail.com"], 1, 18, null, 13, null),
  mk("https://vagasdetrabalhos.com", ["cryptodaycash@gmail.com"], 1, 14, 7, 7, null),
  mk("https://genoxidil.blog", ["4movecadastrar@gmail.com"], 1, 8, 11, 2, null),
  mk("https://climahoje.com", ["danielmoreira60@gmail.com"], 1, 19, null, 15, null),
  mk("https://culinariafitness.com", ["danielmoreira27@gmail.com"], 1, 13, 1, 6, null),
  mk("https://universidademultinivel.com", ["solarineenergy@gmail.com"], 15, 21, 1, 79, null),
  mk("https://danielolimpio.com", ["universidademultinivel@gmail.com"], 14, 22, 9, 25, null),
  mk("https://solarien.com.br", [], 2, 3, null, 1, null),
  mk("https://segredosdoautismo.com", ["universidademultinivel@gmail.com"], 1, 17, 3, 12, null),
  mk("https://igreenenergys.com", ["4familydobrasil@gmail.com"], 1, 16, 2, 9, null),
  mk("https://lexalexandria.com", ["oclubededesconto@gmail.com"], 1, 13, null, 6, null),
  mk("https://vesperbot.com", ["danielmoreira34@gmail.com"], 3, 11, null, 15, null),
  mk("https://vespersbot.com", ["danielmoreira34@gmail.com"], 1, 8, null, 2, null),
  mk("https://bitradex.app", ["invistribe@gmail.com"], 1, 10, 11, 3, null),
  mk("https://royalq.trade", ["alexandriadobrasil@gmail.com"], 2, 19, 19, 16, null),
  mk("https://contadordecalorias.org", ["dreamsgoldbrazil@gmail.com"], 1, 1, null, 0, null),
  mk("https://simuladodetrangratis.com", ["nemawashidobrasil@gmail.com"], 10, 14, null, 30, null),
  mk("https://visinova.com.br", ["fr.promotoradobrasil@gmail.com"], 1, 1, null, 0, null),
  mk("https://zoomimoveis.com", ["Domumpremiumbrasil@gmail.com"], 1, 4, null, 2, null),
  mk("https://vitalclin.com", ["danielmoreira91@gmail.com"], 3, 20, 7, 18, null),
  mk("https://mestredodigital.com.br", ["10reaisem20mil@gmail.com"], 1, 5, null, 1, null),
  mk("https://loyello.com.br", ["Royalprestige50@gmail.com"], 1, 1, null, 0, null),
  mk("https://veloxtel.com.br", ["canalbocarose@gmail.com"], 1, 1, null, 0, null),
  mk("https://testedevelocidade.org", ["vagasetrabalhos@gmail.com"], 5, 21, 38, 21, null),
  mk("https://extrairtextodevideo.com", ["itfashion.com.br@gmail.com"], 1, 1, null, 0, null),
  mk("https://brokertrusted.com", ["lyonessdobrasil@gmail.com"], 1, 17, null, 11, null),
  mk("https://gruposdewhats.com.br", ["danielmoreiradmg10@gmail.com"], 12, 22, 5, 30, null),
  mk("https://gruposdotelegram.org", ["naturalshapebrasil@gmail.com"], 4, 21, 4, 20, null),
  mk("https://trustallamerica.com", ["multitraderoficial@gmail.com"], 1, 15, 1, 8, null),
  mk("https://backlinksbrasil.com", ["corretor.seguros1@gmail.com"], 1, 23, 8, 135, null),
  mk("https://duiwin.pro", [], 37, 39, 11, 344, null),
  mk("https://mydash.online", [], 1, 12, 57, 5, null),
];

// Bump this whenever SEED_SITES is updated so the dashboard merges the new
// metrics/emails into existing localStorage data (preserving user checklist/notes).
export const SEED_VERSION = 2;