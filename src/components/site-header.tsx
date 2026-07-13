import { Link, useNavigate } from "@tanstack/react-router";
import { Compass, Heart, Search, User, LogOut, LayoutDashboard, Shield } from "lucide-react";
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
    <header className="sticky top-0 z-40 border-b border-border/60 bg-background/85 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
            <Compass className="h-4 w-4" />
          </span>
          <span className="text-display text-2xl leading-none">Seoul Compass</span>
        </Link>

        <nav className="hidden items-center gap-6 md:flex">
          <Link
            to="/browse"
            className="text-sm text-foreground/80 transition hover:text-foreground"
          >
            Browse
          </Link>
          <Link
            to="/browse"
            search={{ category: "restaurants" }}
            className="text-sm text-foreground/80 transition hover:text-foreground"
          >
            Restaurants
          </Link>
          <Link
            to="/browse"
            search={{ category: "doctors" }}
            className="text-sm text-foreground/80 transition hover:text-foreground"
          >
            Healthcare
          </Link>
        </nav>

        <div className="flex items-center gap-2">
          <Link to="/browse" className="md:hidden">
            <Button size="icon" variant="ghost" aria-label="Search">
              <Search className="h-5 w-5" />
            </Button>
          </Link>
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" aria-label="Account">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-52">
                <div className="px-2 py-1.5 text-xs text-muted-foreground">
                  {user.email}
                </div>
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
                <Button variant="ghost" size="sm">
                  Sign in
                </Button>
              </Link>
              <Link to="/auth" search={{ mode: "signup" }}>
                <Button size="sm">Join</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
