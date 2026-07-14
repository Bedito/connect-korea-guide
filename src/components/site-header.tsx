import { Link, useNavigate } from "@tanstack/react-router";
import { Heart, Search, User, LogOut, LayoutDashboard, Shield, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
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

  const signOut = async () => {
    await supabase.auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="sticky top-0 z-40 border-b border-border/70 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2.5">
          <span className="relative flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-brand-glow">
            <Sparkles className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="font-display text-[1.05rem] font-bold tracking-tight text-foreground">
            Seoul Compass
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink to="/browse">Browse</NavLink>
          <NavLink to="/browse" params={{ category: "restaurants" }}>
            Restaurants
          </NavLink>
          <NavLink to="/browse" params={{ category: "doctors" }}>
            Healthcare
          </NavLink>
          <NavLink to="/browse" params={{ category: "real-estate" }}>
            Real estate
          </NavLink>
        </nav>

        <div className="flex items-center gap-1.5">
          <Link to="/browse" className="md:hidden">
            <Button size="icon" variant="ghost" aria-label="Search">
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
                  aria-label="Account"
                >
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">{user.email}</div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link to="/dashboard">
                    <LayoutDashboard className="mr-2 h-4 w-4" /> Dashboard
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link to="/favorites">
                    <Heart className="mr-2 h-4 w-4" /> Favorites
                  </Link>
                </DropdownMenuItem>
                {isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link to="/admin">
                      <Shield className="mr-2 h-4 w-4" /> Admin
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" /> Sign out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <>
              <Link to="/auth" className="hidden sm:inline-flex">
                <Button variant="ghost" size="sm" className="font-medium">
                  Sign in
                </Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="sm" className="font-medium shadow-brand-glow">
                  Get started
                </Button>
              </Link>
            </>
          )}
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
