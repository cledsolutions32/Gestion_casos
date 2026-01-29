import { useLocation } from "react-router-dom";
import { Link } from "@heroui/link";
import {
  Navbar as HeroUINavbar,
  NavbarBrand,
  NavbarContent,
  NavbarItem,
  NavbarMenu,
  NavbarMenuItem,
  NavbarMenuToggle,
} from "@heroui/navbar";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import { Avatar } from "@heroui/avatar";
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const location = useLocation();
  const pathname = location.pathname;

  // Obtener nombre completo del usuario o usar email como fallback
  const fullName = user?.user_metadata?.full_name ?? null;
  const displayName = fullName || user?.email?.split("@")[0] || "Usuario";

  const handleSignOut = () => {
    signOut();
  };

  return (
    <HeroUINavbar maxWidth="full" position="sticky" className="bg-white border-b border-gray py-2 px-4">
      <NavbarBrand>
        <Link href={siteConfig.navItems[0].href}>
          <Logo size={80} />
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {siteConfig.navItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              color="foreground"
              href={item.href}
              className={pathname === item.href ? "font-semibold" : "text-foreground"}
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent justify="end" className="md:hidden">
        <NavbarMenuToggle />
      </NavbarContent>
      <NavbarMenu>
        {siteConfig.navMenuItems.map((item, index) => {
          const isSignOutItem = "isSignOut" in item && item.isSignOut;
          return (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              {isSignOutItem ? (
                <Button
                  color="danger"
                  variant="light"
                  className="w-full justify-start"
                  onPress={handleSignOut}
                >
                  {item.label}
                </Button>
              ) : (
                <Link
                  color="foreground"
                  className="w-full"
                  href={item.href}
                  size="lg"
                >
                  {item.label}
                </Link>
              )}
            </NavbarMenuItem>
          );
        })}
      </NavbarMenu>
      <NavbarContent justify="end" className="hidden sm:flex">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button
              type="button"
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-default-100 transition-colors focus:outline-none"
              aria-label="Menú de usuario"
            >
              <Avatar
                size="sm"
                name={displayName}
                showFallback
                className="flex-shrink-0 text-white"
                color="default"
              />
              <span className="text-sm font-medium text-foreground">
                {displayName}
              </span>
              <svg
                className="w-4 h-4 text-foreground-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Menú de usuario">
            <DropdownItem
              key="email"
              isReadOnly
              className="opacity-100"
              textValue={user?.email ?? ""}
            >
              <span className="text-default-500 text-sm">{user?.email ?? ""}</span>
            </DropdownItem>
            <DropdownItem
              key="signout"
              color="danger"
              onPress={handleSignOut}
              description="Cerrar tu sesión"
            >
              Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </HeroUINavbar>
  );
};
