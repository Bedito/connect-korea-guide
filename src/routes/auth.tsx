import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { fallback, zodValidator } from "@tanstack/zod-adapter";
import { z } from "zod";
import { useState } from "react";
import { Compass } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const searchSchema = z.object({
  mode: fallback(z.enum(["signin", "signup"]), "signin").default("signin"),
});

export const Route = createFileRoute("/auth")({
  validateSearch: zodValidator(searchSchema),
  head: () => ({
    meta: [
      { title: "Sign in — Seoul Compass" },
      { name: "description", content: "Sign in or create an account on Seoul Compass." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const { mode } = Route.useSearch();
  const navigate = useNavigate();
  const isSignup = mode === "signup";
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isSignup) {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/`,
            data: { display_name: name },
          },
        });
        if (error) throw error;
        toast("Account created — you're signed in.");
        navigate({ to: "/" });
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        navigate({ to: "/" });
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Something went wrong";
      toast(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto flex max-w-md flex-col px-4 py-16 sm:py-24">
      <Link to="/" className="mx-auto flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Compass className="h-4 w-4" />
        </span>
        <span className="text-display text-2xl">Seoul Compass</span>
      </Link>

      <h1 className="text-display mt-10 text-center text-4xl sm:text-5xl">
        {isSignup ? "Create your account" : "Welcome back"}
      </h1>
      <p className="mt-2 text-center text-sm text-muted-foreground">
        {isSignup
          ? "Save favorites, write reviews, and claim your business."
          : "Sign in to save favorites and manage your listings."}
      </p>

      <form onSubmit={submit} className="mt-8 space-y-4">
        {isSignup && (
          <div className="space-y-1.5">
            <Label htmlFor="name">Display name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={80}
              placeholder="Your name"
            />
          </div>
        )}
        <div className="space-y-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={255}
            autoComplete="email"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="password">Password</Label>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            maxLength={72}
            autoComplete={isSignup ? "new-password" : "current-password"}
          />
        </div>

        <Button type="submit" size="lg" disabled={loading} className="w-full">
          {loading ? "Please wait..." : isSignup ? "Create account" : "Sign in"}
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted-foreground">
        {isSignup ? "Already have an account? " : "New to Seoul Compass? "}
        <Link
          to="/auth"
          search={{ mode: isSignup ? "signin" : "signup" }}
          className="text-foreground underline underline-offset-4"
        >
          {isSignup ? "Sign in" : "Create an account"}
        </Link>
      </p>
    </div>
  );
}
