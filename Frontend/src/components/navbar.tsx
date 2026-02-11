import { useMemo } from "react";
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

import { title } from "./primitives";

import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { useAuth } from "@/lib/auth-context";
import { useUsers } from "@/lib/users-context";

export const Navbar = () => {
  const { user, signOut } = useAuth();
  const { users } = useUsers();
  const location = useLocation();
  const pathname = location.pathname;

  const currentProfile = useMemo(
    () => (user?.id ? users.find((u) => u.id === user.id) : null),
    [user?.id, users],
  );

  const displayName = useMemo(() => {
    if (!user?.id) return "Usuario";
    const nombre = currentProfile?.nombre?.trim();

    return nombre || user.email?.split("@")[0] || "Usuario";
  }, [user?.id, user?.email, currentProfile]);

  const isAdmin = currentProfile?.rol === "admin";

  const navItemsToShow = useMemo(
    () =>
      siteConfig.navItems.filter((item) => item.href !== "/users" || isAdmin),
    [isAdmin],
  );

  const navMenuItemsToShow = useMemo(
    () =>
      siteConfig.navMenuItems.filter((item) =>
        "href" in item && item.href === "/users" ? isAdmin : true,
      ),
    [isAdmin],
  );

  const handleSignOut = () => {
    signOut();
  };

  return (
    <HeroUINavbar
      className="bg-white border-b border-gray py-2 px-4"
      maxWidth="full"
      position="sticky"
    >
      <NavbarBrand>
        <Link href={siteConfig.navItems[0].href}>
          <Logo size={80} />
        </Link>
      </NavbarBrand>
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {navItemsToShow.map((item) => (
          <NavbarItem key={item.href}>
            <Link
              className={
                pathname === item.href ? "font-semibold" : "text-foreground"
              }
              color="foreground"
              href={item.href}
            >
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      <NavbarContent className="md:hidden" justify="end">
        <NavbarMenuToggle />
      </NavbarContent>
      <NavbarMenu>
        {navMenuItemsToShow.map((item, index) => {
          const isSignOutItem = "isSignOut" in item && item.isSignOut;

          return (
            <NavbarMenuItem key={`${item.href}-${index}`}>
              {isSignOutItem ? (
                <Button
                  className="w-full justify-start"
                  color="danger"
                  variant="light"
                  onPress={handleSignOut}
                >
                  {item.label}
                </Button>
              ) : (
                <Link
                  className="w-full"
                  color="foreground"
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
      <NavbarContent className="hidden sm:flex" justify="end">
        <Dropdown placement="bottom-end">
          <DropdownTrigger>
            <button
              aria-label="Menú de usuario"
              className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-default-100 transition-colors focus:outline-none"
              type="button"
            >
              <Avatar
                showFallback
                className="flex-shrink-0 text-white "
                color="default"
                name={displayName.charAt(0).toUpperCase() || "U"}
                size="sm"
              />
              <span
                className={title({
                  size: "md",
                  fontWeight: "semibold",
                  color: "grayDark",
                })}
              >
                {displayName}
              </span>
              <svg
                aria-hidden="true"
                className="w-4 h-4 text-foreground-500"
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
            </button>
          </DropdownTrigger>
          <DropdownMenu aria-label="Menú de usuario">
            <DropdownItem
              key="email"
              isReadOnly
              className="opacity-100"
              textValue={user?.email ?? ""}
            >
              <span className="text-default-500 text-sm">
                {user?.email ?? ""}
              </span>
            </DropdownItem>
            <DropdownItem
              key="signout"
              color="danger"
              description="Cerrar tu sesión"
              onPress={handleSignOut}
            >
              Cerrar sesión
            </DropdownItem>
          </DropdownMenu>
        </Dropdown>
      </NavbarContent>
    </HeroUINavbar>
  );
};
