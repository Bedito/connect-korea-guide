import { Link } from "@tanstack/react-router";
import { Compass } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/60 bg-paper-warm/40">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid gap-10 md:grid-cols-4">
          <div>
            <Link to="/" className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Compass className="h-4 w-4" />
              </span>
              <span className="text-display text-2xl leading-none">Seoul Compass</span>
            </Link>
            <p className="mt-4 max-w-sm text-sm text-muted-foreground">
              A trusted directory of English-friendly businesses across South Korea. Made for the
              international community.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Discover</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/browse" className="hover:text-foreground">Browse all</Link></li>
              <li><Link to="/browse" search={{ category: "doctors" }} className="hover:text-foreground">Doctors</Link></li>
              <li><Link to="/browse" search={{ category: "real-estate" }} className="hover:text-foreground">Real Estate</Link></li>
              <li><Link to="/browse" search={{ category: "restaurants" }} className="hover:text-foreground">Restaurants</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">For businesses</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><span className="opacity-70">List your business (soon)</span></li>
              <li><span className="opacity-70">Claim a listing (soon)</span></li>
              <li><span className="opacity-70">Featured placement (soon)</span></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold">Account</h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link to="/auth" className="hover:text-foreground">Sign in</Link></li>
              <li><Link to="/favorites" className="hover:text-foreground">Favorites</Link></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} Seoul Compass. All rights reserved.</span>
          <span>Made with care for the expat community in Korea.</span>
        </div>
      </div>
    </footer>
  );
}
