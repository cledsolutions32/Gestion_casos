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
    alt={alt}
    className={className}
    height={size * (60 / 113)}
    src={CledLogo}
    style={{ display: "block" }}
    width={size}
  />
);

export const SearchIcon = () => (
  <svg
    aria-hidden
    className="size-4 shrink-0 text-default"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

export const ArrowUpRightIcon = () => (
  <svg
    aria-hidden
    className="size-4 shrink-0 text-default"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M7 17L17 7M7 7h10v10" />
  </svg>
);

export const ArrowLeftIcon = () => (
  <svg
    aria-hidden
    className="size-4 shrink-0 text-default"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M19 12H5M12 19l-7-7 7-7" />
  </svg>
);

export const AlertCircleIcon = () => (
  <svg
    aria-hidden
    className="size-4 shrink-0 text-default"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" />
  </svg>
);

export const AlerCircleWhiteIcon = () => (
  <svg
    aria-hidden
    className="size-4 shrink-0 text-white"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 8v4" />
    <path d="M12 16h.01" fill="white" />
  </svg>
);

export const CheckCircleIcon = () => (
  <svg
    aria-hidden
    className="size-6 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
    <polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);

export const ImportIcon = () => (
  <svg
    fill="none"
    height="16"
    viewBox="0 0 16 16"
    width="16"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path
      d="M14 10V12.6667C14 13.0203 13.8595 13.3594 13.6095 13.6095C13.3594 13.8595 13.0203 14 12.6667 14H3.33333C2.97971 14 2.64057 13.8595 2.39052 13.6095C2.14048 13.3594 2 13.0203 2 12.6667V10M4.66667 6.66667L8 10M8 10L11.3333 6.66667M8 10V2"
      stroke="#F5F5F5"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.6"
    />
  </svg>
);

export const DropdownIcon = () => (
  <svg
    aria-hidden="true"
    className="w-4 h-4 ml-2 text-brown"
    fill="none"
    stroke="currentColor"
    viewBox="0 0 24 24"
  >
    <path
      d="M19 9l-7 7-7-7"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth={2}
    />
  </svg>
);

export const FileIcon = () => (
  <svg
    fill="none"
    height="60"
    viewBox="0 0 60 60"
    width="60"
    xmlns="http://www.w3.org/2000/svg"
  >
    <rect height="60" rx="30" width="60" />
    <path
      d="M31.25 17.5H22.5C21.837 17.5 21.2011 17.7634 20.7322 18.2322C20.2634 18.7011 20 19.337 20 20V40C20 40.663 20.2634 41.2989 20.7322 41.7678C21.2011 42.2366 21.837 42.5 22.5 42.5H37.5C38.163 42.5 38.7989 42.2366 39.2678 41.7678C39.7366 41.2989 40 40.663 40 40V26.25M31.25 17.5L40 26.25M31.25 17.5L31.25 26.25H40"
      stroke="#030712"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2.625"
    />
  </svg>
);

export const UploadIcon = () => (
  <svg
    aria-hidden
    className="size-4 shrink-0 text-white"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" x2="12" y1="3" y2="15" />
  </svg>
);

export const TrashIcon = () => (
  <svg
    aria-hidden
    className="size-4 shrink-0"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

export const FileDocumentIcon = () => (
  <svg
    aria-hidden
    className="text-default"
    fill="none"
    stroke="currentColor"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
    <line x1="16" x2="8" y1="13" y2="13" />
    <line x1="16" x2="8" y1="17" y2="17" />
    <polyline points="10 9 9 9 8 9" />
  </svg>
);

export const DownloadIcon = () => (
  <svg
    aria-hidden
    className="size-4 shrink-0"
    fill="none"
    stroke="black"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" x2="12" y1="15" y2="3" />
  </svg>
);

export const CloseIcon = () => (
  <svg
    aria-hidden
    className="size-4 shrink-0"
    fill="none"
    stroke="white"
    strokeLinecap="round"
    strokeLinejoin="round"
    strokeWidth="2"
    viewBox="0 0 24 24"
    xmlns="http://www.w3.org/2000/svg"
  >
    <line x1="18" x2="6" y1="6" y2="18" />
    <line x1="6" x2="18" y1="6" y2="18" />
  </svg>
);
