import { Link } from "@tanstack/react-router";
import { Github, Twitter } from "lucide-react";
import { useTranslation } from "react-i18next";
import { BrandLogo } from "@/components/brand-logo";

export function SiteFooter() {
  const { t } = useTranslation();
  return (
    <footer className="mt-24 border-t border-border/70 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-12 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Link to="/" aria-label="친구Base home">
              <BrandLogo size="md" />
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              {t("footer.tagline")}
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
          <FooterCol title={t("footer.discover")}>
            <FooterLink to="/browse">{t("footer.browseAll")}</FooterLink>
            <FooterLink to="/browse" cat="doctors">
              {t("footer.doctors")}
            </FooterLink>
            <FooterLink to="/browse" cat="real-estate">
              {t("footer.realEstate")}
            </FooterLink>
            <FooterLink to="/browse" cat="restaurants">
              {t("footer.restaurants")}
            </FooterLink>
          </FooterCol>
          <FooterCol title={t("footer.forBusinesses")}>
            <li>
              <Link to="/auth" search={{ mode: "signup" }} className="hover:text-foreground">
                {t("footer.listYourBusiness")}
              </Link>
            </li>
            <li>
              <Link to="/dashboard" className="hover:text-foreground">
                {t("footer.businessDashboard")}
              </Link>
            </li>
            <li className="opacity-70">{t("footer.featuredPlacement")}</li>
          </FooterCol>
          <FooterCol title={t("footer.account")}>
            <li>
              <Link to="/auth" className="hover:text-foreground">
                {t("footer.signIn")}
              </Link>
            </li>
            <li>
              <Link to="/favorites" className="hover:text-foreground">
                {t("footer.favorites")}
              </Link>
            </li>
          </FooterCol>
        </div>
        <div className="mt-14 flex flex-col items-start justify-between gap-3 border-t border-border/70 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <span>© {new Date().getFullYear()} 친구Base. {t("footer.rights")}</span>
          <span>{t("footer.madeWith")}</span>
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
