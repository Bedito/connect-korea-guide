import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import "@/lib/i18n";

import { reportLovableError } from "../lib/lovable-error-reporting";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Toaster } from "@/components/ui/sonner";

function NotFoundComponent() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-display text-8xl">404</h1>
        <p className="mt-4 text-lg text-muted-foreground">This page couldn't be found.</p>
        <Link
          to="/"
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Back home
        </Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-[60vh] items-center justify-center px-4">
      <div className="max-w-md text-center">
        <h1 className="text-display text-3xl">Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Please try again. If the problem persists, refresh the page.
        </p>
        <button
          onClick={() => {
            router.invalidate();
            reset();
          }}
          className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground hover:opacity-90"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "친구Base — Trusted English-Friendly Services in Korea" },
      {
        name: "description",
        content:
          "친구Base connects foreigners in Korea with trusted, English-friendly doctors, dentists, real estate agents, lawyers, salons and more. Verified listings, real reviews.",
      },
      { name: "author", content: "Seoul Compass" },
      { property: "og:title", content: "친구Base — Trusted English-Friendly Services in Korea" },
      {
        property: "og:description",
        content:
          "친구Base connects foreigners in Korea with trusted, English-friendly doctors, dentists, real estate agents, lawyers, salons and more. Verified listings, real reviews.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "친구Base — Trusted English-Friendly Services in Korea" },
      { name: "description", content: "친구Base connects foreigners in Korea with trusted, English-friendly doctors, dentists, real estate agents, lawyers, salons and more. Verified listings, real reviews." },
      { property: "og:description", content: "친구Base connects foreigners in Korea with trusted, English-friendly doctors, dentists, real estate agents, lawyers, salons and more. Verified listings, real reviews." },
      { name: "twitter:description", content: "친구Base connects foreigners in Korea with trusted, English-friendly doctors, dentists, real estate agents, lawyers, salons and more. Verified listings, real reviews." },
      { property: "og:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/841d8501-457c-4568-b50e-04a54f098357/id-preview-f9131d5d--42e1e024-17af-4b20-82f3-3e625f16619f.lovable.app-1783412146550.png" },
      { name: "twitter:image", content: "https://pub-bb2e103a32db4e198524a2e9ed8f35b4.r2.dev/841d8501-457c-4568-b50e-04a54f098357/id-preview-f9131d5d--42e1e024-17af-4b20-82f3-3e625f16619f.lovable.app-1783412146550.png" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=Work+Sans:wght@400;500;600;700&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen flex-col bg-background">
        <SiteHeader />
        <main className="flex-1">
          <Outlet />
        </main>
        <SiteFooter />
      </div>
      <Toaster />
    </QueryClientProvider>
  );
}
