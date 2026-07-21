import { createFileRoute, redirect } from "@tanstack/react-router";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { BrandLogo } from "@/components/brand-logo";
import { supabase } from "@/integrations/supabase/client";

type OAuthClient = {
  name?: string;
  client_name?: string;
  redirect_uri?: string;
  redirect_uris?: string[];
};

type AuthorizationDetails = {
  client?: OAuthClient;
  scope?: string;
  scopes?: string[];
  redirect_url?: string;
  redirect_to?: string;
};

type OAuthApi = {
  getAuthorizationDetails: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  approveAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
  denyAuthorization: (
    id: string,
  ) => Promise<{ data: AuthorizationDetails | null; error: { message: string } | null }>;
};

function oauthApi(): OAuthApi {
  return (supabase.auth as unknown as { oauth: OAuthApi }).oauth;
}

export const Route = createFileRoute("/.lovable/oauth/consent")({
  ssr: false,
  validateSearch: (s: Record<string, unknown>) => ({
    authorization_id: typeof s.authorization_id === "string" ? s.authorization_id : "",
  }),
  beforeLoad: async ({ search, location }) => {
    if (!search.authorization_id) throw new Error("Missing authorization_id");
    const { data } = await supabase.auth.getSession();
    const next = location.pathname + location.searchStr;
    if (!data.session) throw redirect({ to: "/auth", search: { next } as never });
  },
  loader: async ({ location }) => {
    const authorizationId = new URLSearchParams(location.search).get("authorization_id")!;
    const { data, error } = await oauthApi().getAuthorizationDetails(authorizationId);
    if (error) throw new Error(error.message);
    const immediate = data?.redirect_url ?? data?.redirect_to;
    if (immediate && !data?.client) throw redirect({ href: immediate });
    return data;
  },
  component: Consent,
  errorComponent: ({ error }) => (
    <main className="mx-auto max-w-md px-4 py-16 text-center">
      <h1 className="text-display text-2xl">Authorization error</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        {(error as Error)?.message ?? String(error)}
      </p>
    </main>
  ),
});

function Consent() {
  const details = Route.useLoaderData();
  const { authorization_id } = Route.useSearch();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const clientName = details?.client?.client_name ?? details?.client?.name ?? "an application";
  const scopes = details?.scopes ?? (details?.scope ? details.scope.split(/\s+/) : []);

  async function decide(approve: boolean) {
    setBusy(true);
    setError(null);
    const api = oauthApi();
    const { data, error } = approve
      ? await api.approveAuthorization(authorization_id)
      : await api.denyAuthorization(authorization_id);
    if (error) {
      setBusy(false);
      setError(error.message);
      return;
    }
    const target = data?.redirect_url ?? data?.redirect_to;
    if (!target) {
      setBusy(false);
      setError("No redirect returned by the authorization server.");
      return;
    }
    window.location.href = target;
  }

  return (
    <main className="mx-auto flex max-w-md flex-col px-4 py-16">
      <div className="mx-auto">
        <BrandLogo size="lg" />
      </div>
      <h1 className="text-display mt-8 text-center text-3xl">
        Connect {clientName} to 친구Base
      </h1>
      <p className="mt-3 text-center text-sm text-muted-foreground">
        {clientName} will be able to call 친구Base's tools while you are signed in.
      </p>

      <div className="mt-8 rounded-2xl border border-border/70 bg-card p-5 text-sm">
        <p className="font-medium">This lets {clientName} use 친구Base as you.</p>
        {scopes.length > 0 && (
          <ul className="mt-3 space-y-1 text-muted-foreground">
            {scopes.map((s: string) => (
              <li key={s}>• {s}</li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-muted-foreground">
          This does not bypass 친구Base's permissions or backend policies.
        </p>
      </div>

      {error && (
        <p role="alert" className="mt-4 text-sm text-destructive">
          {error}
        </p>
      )}

      <div className="mt-6 flex flex-col gap-2">
        <Button disabled={busy} onClick={() => decide(true)} size="lg">
          Approve
        </Button>
        <Button disabled={busy} variant="outline" onClick={() => decide(false)} size="lg">
          Cancel connection
        </Button>
      </div>
    </main>
  );
}
