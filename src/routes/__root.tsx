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
      { name: "theme-color", content: "#2563eb" },
      { title: "친구Base — Trusted English-Friendly Services in Korea" },
      {
        name: "description",
        content:
          "친구Base connects foreigners in Korea with trusted, English-friendly doctors, dentists, real estate agents, lawyers, salons and more. Verified listings, real reviews.",
      },
      { name: "author", content: "친구Base" },
      { property: "og:site_name", content: "친구Base" },
      { property: "og:title", content: "친구Base — Trusted English-Friendly Services in Korea" },
      {
        property: "og:description",
        content:
          "Find English-speaking businesses across South Korea — verified, reviewed, and made for expats.",
      },
      { property: "og:type", content: "website" },
      { property: "og:image", content: "https://connect-korea-guide.lovable.app/__l5e/assets-v1/199666d0-7f98-43a7-9046-b2033a88b885/og-image.jpg" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: "친구Base — Trusted English-Friendly Services in Korea" },
      { name: "twitter:description", content: "Find English-speaking businesses across South Korea — verified, reviewed, and made for expats." },
      { name: "twitter:image", content: "https://connect-korea-guide.lovable.app/__l5e/assets-v1/199666d0-7f98-43a7-9046-b2033a88b885/og-image.jpg" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/apple-touch-icon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700;800&family=Epilogue:wght@400;500;600;700&display=swap",
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
