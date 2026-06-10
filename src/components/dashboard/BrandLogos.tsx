import gscSrc from "@/assets/brand-gsc.png";
import gaSrc from "@/assets/brand-ga.webp";
import pwaSrc from "@/assets/brand-pwa.png";
import seoSrc from "@/assets/brand-seo.png";
import adsSrc from "@/assets/brand-ads.png";
import ssgSrc from "@/assets/brand-ssg.avif";
import topSrc from "@/assets/brand-top.png";
import blSrc from "@/assets/brand-bl.png";
import imgSrc from "@/assets/brand-img.png";
import mobSrc from "@/assets/brand-mob.png";

type Props = { className?: string };

const make = (src: string, alt: string) => (props: Props) => (
  <img
    src={src}
    alt={alt}
    loading="lazy"
    decoding="async"
    className={`object-contain ${props.className ?? ""}`}
  />
);

export const GSCLogo = make(gscSrc, "Google Search Console");
export const GALogo = make(gaSrc, "Google Analytics");
export const PWALogo = make(pwaSrc, "PWA");
export const SEOLogo = make(seoSrc, "SEO");
export const AdsenseLogo = make(adsSrc, "Google AdSense");
export const SSGLogo = make(ssgSrc, "Static Site Generation");
export const TopLogo = make(topSrc, "Scroll Top");
export const BLLogo = make(blSrc, "Backlinks");
export const ImgLogo = make(imgSrc, "Otimização de imagens");
export const MobLogo = make(mobSrc, "Responsividade mobile");