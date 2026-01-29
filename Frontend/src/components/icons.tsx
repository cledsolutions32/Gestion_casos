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
