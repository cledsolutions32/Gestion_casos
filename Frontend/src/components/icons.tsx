import CledLogo from "@/assets/CledLogo.png";

export type LogoProps = {
  size?: number;
  className?: string;
  alt?: string;
};

/** Logo Cled (CledLogo.svg) */
export const Logo = ({
  size = 48,
  className = "",
  alt = "Cled Logo",
}: LogoProps) => (
  <img
    src={CledLogo}
    alt={alt}
    width={size}
    height={size * (60 / 113)}
    className={className}
    style={{ display: "block" }}
  />
);

export const SearchIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className="size-4 shrink-0 text-default"
    aria-hidden
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export const ArrowUpRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-default" aria-hidden>
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
);

export const AlertCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-4 shrink-0 text-default" aria-hidden>
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);