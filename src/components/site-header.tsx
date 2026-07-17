import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/brand-logo";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useAuth } from "@/lib/auth";
import { useIsAdmin } from "@/lib/roles";
import { supabase } from "@/integrations/supabase/client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function SiteHeader() {
  const { user } = useAuth();
  const { isAdmin } = useIsAdmin();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 sm:gap-4 sm:px-6 lg:px-8">
        <Link to="/" aria-label="친구Base home" className="shrink-0">
          <BrandLogo size="md" />
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          <NavLink to="/browse">{t("nav.browse")}</NavLink>
          <NavLink to="/browse" params={{ category: "Beauty & Wellness" }}>
            {t("nav.beauty")}
          </NavLink>
          <NavLink to="/browse" params={{ category: "doctors" }}>
            {t("nav.healthcare")}
          </NavLink>
          <NavLink to="/browse" params={{ category: "real-estate" }}>
            {t("nav.realEstate")}
          </NavLink>
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          <Link to="/browse" className="lg:hidden">
            <Button size="icon" variant="ghost" aria-label={t("nav.search")}>
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full ring-1 ring-border/70"
                  aria-label={t("nav.account")}
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> {t("nav.dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites">
                    <Heart className="mr-2 h-4 w-4" /> {t("nav.favorites")}
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Shield className="mr-2 h-4 w-4" /> {t("nav.admin")}
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> {t("nav.signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="whitespace-nowrap font-medium">
                  {t("nav.signIn")}
                </Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="sm" className="whitespace-nowrap px-3 font-medium shadow-brand-glow sm:px-4">
                  {t("nav.becomePartner")}
                </Button>
              </Link>
            </>
          )}
          <LanguageSwitcher />
        </div>
      </div>
    </header>
  );
}

function NavLink({
  to,
  params,
  children,
}: {
  to: string;
  params?: { category: string };
  children: React.ReactNode;
}) {
  return (
    <Link
      to={to}
      search={params}
      className="rounded-md px-3 py-1.5 text-sm font-medium text-foreground/70 transition hover:bg-secondary hover:text-foreground"
    >
      {children}
    </Link>
  );
}
