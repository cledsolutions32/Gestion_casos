export type SiteConfig = typeof siteConfig;

export const siteConfig = {
  name: "Cled Solutions",
  description: "Cled Solutions description",
  navItems: [
    {
      label: "Casos",
      href: "/cases",
    },
    {
      label: "Usuarios",
      href: "/users",
    },
  ],
  navMenuItems: [
    {
      label: "Casos",
      href: "/cases",
    },
    {
      label: "Usuarios",
      href: "/users",
    },
    {
      label: "Cerrar sesión",
      href: "#",
      isSignOut: true,
    },
  ],
};
