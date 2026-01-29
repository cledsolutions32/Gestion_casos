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
import { siteConfig } from "@/config/site";
import { Logo } from "@/components/icons";
import { Avatar } from "@heroui/avatar";

export const Navbar = () => {
  return (
    <HeroUINavbar maxWidth="xl" position="sticky">
      {/* Brand */}
      <NavbarBrand>
        <Link href={siteConfig.navItems[0].href}><Logo size={40} /></Link>
      </NavbarBrand>
      {/* Navbar Content */}
      <NavbarContent className="hidden sm:flex gap-4" justify="center">
        {siteConfig.navItems.map((item) => (
          <NavbarItem key={item.href}>
            <Link color="foreground" href={item.href} className={window.location.pathname === item.href ? "font-semibold" : "text-foreground"}>
              {item.label}
            </Link>
          </NavbarItem>
        ))}
      </NavbarContent>
      {/* Navbar Menu Toggle - solo visible en móvil */}
      <NavbarContent justify="end" className="md:hidden">
        <NavbarMenuToggle />
      </NavbarContent>
      {/* Navbar Menu mobile*/}
      <NavbarMenu>
        {siteConfig.navMenuItems.map((item, index) => (
          <NavbarMenuItem key={`${item.href}-${index}`}>
            <Link
              color={
                index === siteConfig.navMenuItems.length - 1 ? "danger" : "foreground"
              }
              className="w-full"
              href={item.href}
              size="lg"
            >
              {item.label}
            </Link>
          </NavbarMenuItem>
        ))}
      </NavbarMenu>
      {/* Avatar */}
      <NavbarContent justify="end">
        <Avatar src="https://i.pravatar.cc/150?u=a042581f4e29026024d" /> <span>John Doe</span>
      </NavbarContent>
    </HeroUINavbar>
  );
};
