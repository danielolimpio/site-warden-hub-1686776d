import type { SVGProps } from "react";

export function GSCLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="11" cy="11" r="7" fill="none" stroke="#4285F4" strokeWidth="2.4" />
      <line x1="16.2" y1="16.2" x2="21" y2="21" stroke="#EA4335" strokeWidth="2.6" strokeLinecap="round" />
      <path d="M7 11l3 3 5-5" stroke="#34A853" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function GALogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <rect x="15" y="3" width="5" height="18" rx="2.5" fill="#F9AB00" />
      <rect x="9" y="9" width="5" height="12" rx="2.5" fill="#E37400" />
      <circle cx="5.5" cy="18.5" r="2.5" fill="#E37400" />
    </svg>
  );
}

export function PWALogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 32 32" {...props}>
      <path d="M2 22l2.5-6h2.8L4.7 22H2zm5.5 0l4-12h3.2l4 12h-2.6l-.9-2.8h-4.3L9.9 22H7.5zm3.6-4.7h3l-1.5-4.7-1.5 4.7zM18 22V10h4.4c1.6 0 2.8.4 3.6 1.2.8.8 1.2 1.9 1.2 3.3 0 1.4-.4 2.5-1.2 3.3-.8.8-2 1.2-3.6 1.2H20.4V22H18zm2.4-5h2c.9 0 1.6-.2 2-.6.5-.4.7-1 .7-1.8s-.2-1.4-.7-1.8c-.4-.4-1.1-.6-2-.6h-2v4.8z" fill="#3D3D8E" />
    </svg>
  );
}

export function SEOLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <circle cx="10" cy="10" r="6" fill="none" stroke="#34A853" strokeWidth="2.2" />
      <line x1="14.5" y1="14.5" x2="20" y2="20" stroke="#34A853" strokeWidth="2.6" strokeLinecap="round" />
      <text x="10" y="13" fontSize="6" fontWeight="700" fill="#34A853" textAnchor="middle" fontFamily="system-ui">SEO</text>
    </svg>
  );
}

export function AdsenseLogo(props: SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" {...props}>
      <path d="M12 2L2 21h20L12 2z" fill="#FBBC04" />
      <path d="M12 2L22 21H12V2z" fill="#F29900" />
      <text x="12" y="18" fontSize="6" fontWeight="800" fill="#fff" textAnchor="middle" fontFamily="system-ui">Ad</text>
    </svg>
  );
}