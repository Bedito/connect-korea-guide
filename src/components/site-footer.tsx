import { Link } from "@tanstack/react-router";
import { Github, Twitter } from "lucide-react";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="친구Base home">
              <BrandLogo size="md" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              A trusted marketplace of English-friendly businesses across South Korea. Built for the
              international community.
            </p>
            <div className="mt-6 flex items-center gap-2">
              <a
                href="#"
                aria-label="Twitter"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="GitHub"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-border/70 text-muted-foreground transition hover:border-foreground/40 hover:text-foreground"
              >
                <Github className="h-4 w-4" />
              </a>
            </div>
          </div>
          <FooterCol title="Discover">
            <FooterLink to="/browse">Browse all</FooterLink>
            <FooterLink to="/browse" cat="doctors">
              Doctors
            </FooterLink>
            <FooterLink to="/browse" cat="real-estate">
              Real estate
            </FooterLink>
            <FooterLink to="/browse" cat="restaurants">
              Restaurants
            </FooterLink>
          </FooterCol>
          <FooterCol title="For businesses">
            <li>
              <Link to="/auth" search={{ mode: "signup" }} className="hover:text-foreground">
                List your business
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                Business dashboard
              </Link>
            </li>
            <li className="opacity-70">Featured placement</li>
          </FooterCol>
          <FooterCol title="Account">
            <li>
              <Link to="/auth" className="hover:text-foreground">
                Sign in
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="hover:text-foreground">
                Favorites
              </Link>
            </li>
          </FooterCol>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} 친구Base. All rights reserved.</span>
          <span>Made with care for the expat community in Korea.</span>
        </div>
      </div>
    </footer>
  );
}

function FooterCol({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground/80">{title}</h4>
      <ul className="mt-4 space-y-2.5 text-sm text-muted-foreground">{children}</ul>
    </div>
  );
}

function FooterLink({
  to,
  cat,
  children,
}: {
  to: string;
  cat?: string;
  children: React.ReactNode;
}) {
  return (
    <li>
      <Link to={to} search={cat ? { category: cat } : undefined} className="hover:text-foreground">
        {children}
      </Link>
    </li>
  );
}
