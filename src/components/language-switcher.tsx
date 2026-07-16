import { Globe, Check } from "lucide-react";
import { useTranslation } from "react-i18next";
import { useEffect, useState } from "react";
import { setLanguage, initClientLanguage, type Lang } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const LABELS: Record<Lang, { short: string; full: string }> = {
  en: { short: "EN", full: "English" },
  ko: { short: "한국어", full: "한국어" },
};

export function LanguageSwitcher({ compact = false }: { compact?: boolean }) {
  const { i18n, t } = useTranslation();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    initClientLanguage();
    setMounted(true);
  }, []);

  const current = (i18n.language?.startsWith("ko") ? "ko" : "en") as Lang;
  // Before mount, always show EN to match SSR and avoid hydration mismatch
  const shown = mounted ? current : "en";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={t("nav.language")}
          className="h-9 gap-1.5 rounded-full border border-border/70 px-3 font-medium text-foreground/80 hover:text-foreground"
        >
          <Globe className="h-4 w-4" />
          {!compact && <span className="text-sm">{LABELS[shown].short}</span>}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        {(Object.keys(LABELS) as Lang[]).map((l) => (
          <DropdownMenuItem
            key={l}
            onClick={() => setLanguage(l)}
            className="flex items-center justify-between"
          >
            <span>{LABELS[l].full}</span>
            {shown === l && <Check className="h-4 w-4 text-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
