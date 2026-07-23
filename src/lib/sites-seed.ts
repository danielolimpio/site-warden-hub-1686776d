export type ChecklistKey =
  | "gsc"
  | "ga"
  | "pwa"
  | "seo"
  | "adsense"
  | "ssg"
  | "top"
  | "bl"
  | "img"
  | "mob";

export interface SiteRecord {
  id: string;
  url: string;
  domain: string;
  description: string;
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
  ({ gsc, ga, pwa, seo, adsense, ssg: false, top: false, bl: false, img: false, mob: false });

const DOMAIN_AGES: Record<string, string> = {
  "agoranabahia.com.br":"4 meses","fileconvert.cloud":"<1 mês","polartensor.trade":"1 mês",
  "baixarvideostwitter.com":"1 mês","baixarvideosfacebook.com":"1 mês","baixarvideoskwai.com":"1 mês",
  "baixarvideoyoutube.com":"1 mês","baixarvideostiktok.com":"2 meses","baixarvideosinstagram.com":"1 mês",
  "batepapogratis.com":"3 meses","comoeumesintoquando.com.br":"7 meses","fatospoliticos.com.br":"4 meses",
  "cebolla.app":"4 meses","tuangacor.com":"4 meses","unitedubai.blog":"4 meses","spazi.info":"4 meses",
  "senin.click":"4 meses","sashko.pro":"4 meses","pelit.click":"4 meses","pedis.click":"4 meses",
  "nikke.blog":"4 meses","nalgonas.org":"4 meses","mdgroup.pro":"4 meses","groupeforum.pro":"4 meses",
  "bisnis.cam":"4 meses","zipfontes.com.br":"4 meses","pagin.com.br":"4 meses","acquaflux.com":"4 meses",
  "theartofyoga.org":"7 meses","aurumfoundation.top":"5 meses","aurumfoundation.world":"5 meses",
  "tradelidexapp.com":"5 meses","maracatubrasil.com.br":"5 meses","rankoffers.com":"6 meses",
  "siteconfiavel.pro":"6 meses","comidasjaponesas.com":"1 ano 3 meses","efuxico.com.br":"7 meses",
  "beijodarua.com.br":"6 meses","servicolocal.com":"6 meses","atividadeseducacaoinfantil.com":"7 meses",
  "fazercurriculo.com":"7 meses","modelodecontrato.org":"7 meses","politicadeprivacidade.org":"7 meses",
  "vaquinha.org":"7 meses","gaiacreative.com.br":"7 meses","upira.com.br":"7 meses",
  "helplistas.com.br":"7 meses","tradepar.com.br":"7 meses","lojasgratis.com.br":"7 meses",
  "clubedevantagem.com":"10 meses","horoscopodehoje.com":"1 ano 9 meses","cotacaodehoje.com":"1 ano 3 meses",
  "vagasdetrabalhos.com":"7 meses","genoxidil.blog":"10 meses","climahoje.com":"1 ano 3 meses",
  "culinariafitness.com":"1 ano 5 meses","universidademultinivel.com":"12 anos 2 meses",
  "danielolimpio.com":"1 ano 9 meses","solarien.com.br":"1 ano 2 meses","segredosdoautismo.com":"11 meses",
  "igreenenergys.com":"1 ano 2 meses","lexalexandria.com":"1 ano 5 meses","vesperbot.com":"1 ano",
  "vespersbot.com":"1 ano","bitradex.app":"7 meses","royalq.trade":"7 meses",
  "vitalclin.com":"7 meses","mestredodigital.com.br":"4 meses","loyello.com.br":"10 meses",
  "brokertrusted.com":"8 meses","gruposdotelegram.org":"1 ano 4 meses","trustallamerica.com":"1 ano 7 meses",
  "duiwin.pro":"4 meses",
};

const mk = (
  url: string,
  emails: string[],
  da: number | null,
  pa: number | null,
  ss: number | null,
  bl: number | null,
  traffic: string | null,
  description = "",
  notes = "",
  seo = false,
): SiteRecord => {
  const domain = url.replace(/^https?:\/\//, "").replace(/\/$/, "");
  return {
    id: domain,
    url,
    domain,
    description,
    emails,
    notes,
    da, pa, ss, backlinks: bl, domainAge: DOMAIN_AGES[domain] ?? null, traffic,
    checklist: c(false, false, false, seo, false),
  };
};

export const SEED_SITES: SiteRecord[] = [
  mk("https://acquaflux.com", ["4familydobrasil@gmail.com"], 1, 20, 12, 17, null, "Gestão hídrica, economia de água, sustentabilidade"),
  mk("https://agoranabahia.com.br", [], 36, 32, 11, 251, null, "Investimentos em Imóveis regionais"),
  mk("https://marmorarias.shop", [], 1, 1, null, 0, null, "Mármore, granito, pedras para construção"),
  mk("https://polartensor.trade", [], 1, 1, null, 0, null, "Binance, Trading, criptomoedas, investimentos"),
  mk("https://baixarvideostwitter.com", ["baixarvideosyoutube@gmail.com"], 1, 5, null, 1, null, "Download de vídeos do Twitter/X"),
  mk("https://baixarvideosfacebook.com", ["baixarvideosdoinstagram@gmail.com"], 8, 10, 8, 3, null, "Download de vídeos do Facebook"),
  mk("https://baixarvideoskwai.com", ["vagasetrabalhos@gmail.com"], 1, 5, null, 1, null, "Download de vídeos do Kwai"),
  mk("https://baixarvideoyoutube.com", ["danielmoreira81@gmail.com"], 5, 25, 9, 63, null, "Download de vídeos do YouTube"),
  mk("https://baixarvideostiktok.com", ["danivinilrock@gmail.com"], 1, 11, null, 4, null, "Download de vídeos do TikTok"),
  mk("https://baixarvideosinstagram.com", ["baixarvideostiktok@gmail.com"], 1, 5, null, 1, null, "Download de vídeos do Instagram"),
  mk("https://batepapogratis.com", [], 2, 18, 14, 14, null, "Sites confiáveis para bater papo, chat online"),
  mk("https://comoeumesintoquando.com.br", ["segredosdoautismo@gmail.com"], 29, 40, 1, 8230, null, "Saúde masculina, saúde mental, sentimentos"),
  mk("https://fatospoliticos.com.br", [], 32, 28, 4, 602, null, "Fact-checking político e análise de dados públicos"),
  mk("https://cebolla.app", [], 41, 31, 5, 174, null, "Privacidade digital, Segurança online, Criptografia de ponta"),
  mk("https://tuangacor.com", [], 59, 36, 14, 3940, null, "Software B2B, CRM, Marketing, Finance, Productivity e Commerce (EUA)"),
  mk("https://unitedubai.blog", [], 34, 33, 13, 146, null, "Dubai Real Estate for Digital Nomads (EUA)"),
  mk("https://spazi.info", [], 55, 34, 31, 1090, null, "Investimento em imóveis comerciais e espaços para renda"),
  mk("https://senin.click", [], 44, 34, 12, 170, null, "Recuperação financeira para brasileiros"),
  mk("https://sashko.pro", [], 35, 35, 15, 491, null, "SaaS para pequenas empresas brasileiras"),
  mk("https://pelit.click", [], 42, 44, 12, 758, null, "Jogos AAA e hardware gamer premium"),
  mk("https://pedis.click", [], 13, 17, 12, 13, null, "Automação e vendas via WhatsApp, Instagram e marketplaces"),
  mk("https://nikke.blog", [], 36, 33, 13, 135, null, "Metais preciosos, commodities e proteção patrimonial"),
  mk("https://nalgonas.org", [], 52, 38, 12, 277, null, "Treino de glúteos, hipertrofia e nutrição esportiva"),
  mk("https://mobilenumbers.me", [], 49, 35, 10, 250, null, "Marketing Ético com WhatsApp Business e SMS"),
  mk("https://mdgroup.pro", [], 39, 36, 68, 231, null, "Inteligência Artificial, Tecnologia das IAs, Ferramentas de IA"),
  mk("https://groupeforum.pro", [], 34, 45, 13, 1120, null, ""),
  mk("https://bisnis.cam", [], 54, 31, 13, 260, null, "Monetização, Afiliados, Infoprodutos, Tráfego Pago"),
  mk("https://zipfontes.com.br", ["cotacaodehoje@gmail.com"], 24, 25, 15, 95, null, "Fontes, ícones, emojis, paletas de cores"),
  mk("https://mercadolivredenergia.org", ["boulevardmondebrasil@gmail.com"], 1, 1, null, 0, null, "Energia por assinatura, mercado livre de energia"),
  mk("https://pagin.com.br", [], 1, 1, null, 0, null, "Portal de páginas, diretório, SEO local, subdomínios"),
  mk("https://theartofyoga.org", ["danielmoreira9@gmail.com"], 24, 43, 15, 7100, null, "Yoga, bem-estar, meditação"),
  mk("https://aurumfoundation.top", ["danielmoreira21@gmail.com"], 1, 5, null, 1, null, "Blockchain, Criptomoedas, investimentos DeFi, inteligência artificial"),
  mk("https://aurumfoundation.world", ["empregosvaleparaiba@gmail.com"], 2, 16, null, 9, null, "Blockchain, Criptomoedas, investimentos DeFi, inteligência artificial"),
  mk("https://tradelidexapp.com", [], 37, 33, 9, 195, null, "Blog de aplicativos, trading, cripto, tecnologia, finanças"),
  mk("https://maracatubrasil.com.br", [], 33, 22, 8, 76, null, "Benefícios do governo, direitos sociais"),
  mk("https://rankoffers.com", ["valemarketing5@gmail.com"], 1, 16, 14, 9, null, "Reviews de afiliados e ofertas CPA"),
  mk("https://siteconfiavel.pro", [], 1, 5, null, 1, null, "Análise de confiabilidade de sites, segurança digital"),
  mk("https://comidasjaponesas.com", [], 1, 11, null, 4, null, "Culinária japonesa, receitas"),
  mk("https://efuxico.com.br", ["danielmoreira10@gmail.com"], 25, 32, 8, 823, null, "Entretenimento, celebridades, fofocas, notícias e curiosidades"),
  mk("https://beijodarua.com.br", ["danielmoreira100@gmail.com"], 25, 27, 8, 140, null, "Aplicativos de namoro, relacionamentos"),
  mk("https://servicolocal.com", ["universidadecriptomoedas@gmail.com"], 2, 6, null, 4, null, "Serviço local, diretório de profissionais"),
  mk("https://atividadeseducacaoinfantil.com", ["danielmoreira20@gmail.com"], 13, 18, 12, 18, null, "Educação Infantil, atividades pedagógicas"),
  mk("https://fazercurriculo.com", ["myblendoficial@gmail.com"], 4, 14, 7, 12, null, "Gerador de Currículo, modelos de CV"),
  mk("https://modelodecontrato.org", ["Glendhadam@gmail.com"], 1, 17, 7, 11, null, "Gerador de Contratos, Modelos de contrato, documentos jurídicos"),
  mk("https://politicadeprivacidade.org", ["logomarcaprofissional@gmail.com"], 1, 8, 5, 2, null, "Gerador de Políticas, LGPD, política de privacidade, compliance"),
  mk("https://vaquinha.org", ["universodebitcoin@gmail.com"], 3, 15, 12, 8, null, "Financiamento coletivo, vaquinha para tratamento médico"),
  mk("https://gaiacreative.com.br", [], 31, 27, 15, 100, null, "Agência B2B, publicidade e marketing"),
  mk("https://upira.com.br", ["danielmoreira30@gmail.com"], 29, 23, 10, 111, null, "Estilo de vida off-grid, sustentabilidade, natureza"),
  mk("https://helplistas.com.br", ["damarisglendha@gmail.com"], 26, 24, 7, 81, null, "Listas de mercado, casamento e escolares"),
  mk("https://tradepar.com.br", ["joaodoriapresidente@gmail.com"], 27, 30, 7, 722, null, "Reviews de Corretoras de Forex"),
  mk("https://lojasgratis.com.br", ["hgabrielmoreira@gmail.com"], 27, 27, 12, 209, null, "Reviews Loja gratuita online, e-commerce sem custo"),
  mk("https://clubedevantagem.com", ["universidademultinivel@gmail.com"], 30, 23, 8, 51, null, "Clube de vantagens, programas de fidelidade"),
  mk("https://horoscopodehoje.com", ["universidademultinivel@gmail.com"], 3, 17, null, 15, null, "Signo, astrologia, horóscopo"),
  mk("https://cotacaodehoje.com", ["danielmoreira08@gmail.com"], 1, 18, null, 13, null, "Cotação de moedas, dólar, euro, bolsa, crypto, câmbio e forex"),
  mk("https://vagasdetrabalhos.com", ["cryptodaycash@gmail.com"], 1, 14, 7, 7, null, "Empregos, oportunidades de trabalho"),
  mk("https://genoxidil.blog", ["4movecadastrar@gmail.com"], 1, 8, 11, 2, null, ""),
  mk("https://climahoje.com", ["danielmoreira60@gmail.com"], 1, 19, null, 15, null, "Previsão do tempo, clima, El Niño"),
  mk("https://culinariafitness.com", ["danielmoreira27@gmail.com"], 1, 13, 1, 6, null, "Dieta fitness, receitas saudáveis"),
  mk("https://universidademultinivel.com", ["solarienenergy@gmail.com"], 15, 21, 1, 79, null, "Marketing de rede, MLM, vendas diretas"),
  mk("https://danielolimpio.com", ["universidademultinivel@gmail.com"], 14, 22, 9, 25, null, "Portfólio pessoal, desenvolvimento web, web design"),
  mk("https://solarien.com.br", ["universidademultinivel@gmail.com"], 2, 3, null, 1, null, "Energia por assinatura, mercado livre de energia"),
  mk("https://segredosdoautismo.com", ["universidademultinivel@gmail.com"], 1, 17, 3, 12, null, "Curso de Autismo, inclusão, desenvolvimento infantil"),
  mk("https://igreenenergys.com", ["4familydobrasil@gmail.com"], 1, 16, 2, 9, null, ""),
  mk("https://lexalexandria.com", ["oclubededesconto@gmail.com"], 1, 13, null, 6, null, "Energia por assinatura, mercado livre de energia"),
  mk("https://vesperbot.com", ["danielmoreira34@gmail.com"], 3, 11, null, 15, null, "Automação, bots de trading de criptomoedas"),
  mk("https://vespersbot.com", ["danielmoreira34@gmail.com"], 1, 8, null, 2, null, "Automação, bots de trading de criptomoedas"),
  mk("https://bitradex.app", ["invistribe@gmail.com"], 1, 10, 11, 3, null, "Criptomoedas, trading, Exchanges"),
  mk("https://royalq.trade", ["alexandriadobrasil@gmail.com"], 2, 19, 19, 16, null, "Robô de trading de criptomoedas, investimentos"),
  mk("https://contadordecalorias.org", ["dreamsgoldbrazil@gmail.com"], 1, 1, null, 0, null, "Dieta, emagrecimento, saúde, nutrição"),
  mk("https://simuladodetrangratis.com", ["nemawashidobrasil@gmail.com"], 10, 14, null, 30, null, "Simulado Detran, educação para trânsito, CNH"),
  mk("https://visinova.com.br", ["fr.promotoradobrasil@gmail.com"], 1, 1, null, 0, null, "Um clube. Sete soluções: Economia de Energia, Clube de Descontos, Telemedicina, convênio Saúde, Convênio Farmácias, Seguro de Vida e Plano Odonto"),
  mk("https://zoomimoveis.com", ["Domumpremiumbrasil@gmail.com"], 1, 4, null, 2, null, "Portal de Imóveis, corretora de imóveis, mercado imobiliário"),
  mk("https://vitalclin.com", ["danielmoreira91@gmail.com"], 3, 20, 7, 18, null, "Saúde, clínica médica, bem-estar, tratamentos"),
  mk("https://mestredodigital.com.br", ["10reaisem20mil@gmail.com"], 1, 5, null, 1, null, ""),
  mk("https://loyello.com.br", ["royalprestige50@gmail.com"], 1, 1, null, 0, null, ""),
  mk("https://veloxtel.com.br", ["canalbocarose@gmail.com"], 1, 1, null, 0, null, ""),
  mk("https://testedevelocidade.org", ["vagasetrabalhos@gmail.com"], 5, 21, 38, 21, null, "Teste de velocidade de internet, telecomunicações"),
  mk("https://extrairtextodevideo.com", ["itfashion.com.br@gmail.com"], 1, 1, null, 0, null, "Ferramentas online, OCR, extração de texto de vídeo"),
  mk("https://brokertrusted.com", ["lyonessdobrasil@gmail.com"], 1, 17, null, 11, null, "Análise de corretoras, reviews de brokers"),
  mk("https://gruposdewhats.com.br", ["danielmoreiradmg10@gmail.com"], 12, 22, 5, 30, null, "Grupos de WhatsApp, links de grupos"),
  mk("https://gruposdotelegram.org", ["naturalshapebrasil@gmail.com"], 4, 21, 4, 20, null, "Grupos de Telegram, links de canais"),
  mk("https://trustallamerica.com", ["multitraderoficial@gmail.com"], 1, 15, 1, 8, null, "Seguros, planos de saúde, finanças, imóveis (EUA)"),
  mk("https://backlinksbrasil.com", ["corretor.seguros1@gmail.com"], 1, 23, 8, 135, null, "SEO, backlinks, marketing digital"),
  mk("https://duiwin.pro", [], 37, 39, 11, 344, null, "Trading, investimentos e análise técnica"),
  mk("https://mydash.online", ["canalbocarose@gmail.com"], 1, 12, 57, 5, null, ""),
];

// Bump this whenever SEED_SITES is updated so the dashboard merges the new
// metrics/emails into existing localStorage data (preserving user checklist/notes).
export const SEED_VERSION = 7;
