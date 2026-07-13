import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, ArrowRight, Check } from "lucide-react";
import {
  InfoSection,
  LocationSection,
  LanguagesSection,
  ServicesSection,
  HoursSection,
  MediaSection,
  ContactSection,
  StaffSection,
} from "@/components/business-form-sections";
import {
  businessFormSchema,
  emptyBusinessForm,
  DAY_LABELS,
  type BusinessFormValues,
  type Day,
  type DayHours,
  type StaffDraft,
} from "@/lib/business-form";
import { createBusinessDraft } from "@/lib/business-save";

export const Route = createFileRoute("/register-business")({
  head: () => ({
    meta: [
      { title: "List your business — Connect Korea Guide" },
      { name: "description", content: "Get discovered by foreigners in South Korea. List your business in nine simple steps." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: RegisterBusinessPage,
});

type StepId =
  | "info" | "location" | "languages" | "services"
  | "hours" | "gallery" | "contact" | "staff" | "review";

const STEPS: { id: StepId; label: string }[] = [
  { id: "info", label: "Business info" },
  { id: "location", label: "Location" },
  { id: "languages", label: "Languages" },
  { id: "services", label: "Services" },
  { id: "hours", label: "Business hours" },
  { id: "gallery", label: "Gallery" },
  { id: "contact", label: "Contact" },
  { id: "staff", label: "Staff" },
  { id: "review", label: "Review & submit" },
];

function validateStep(step: StepId, v: BusinessFormValues): string | null {
  if (step === "info") {
    if (!v.name.trim()) return "Business name is required";
    if (!v.category_id) return "Choose a category";
  }
  if (step === "location") {
    if (!v.city_id) return "Choose a city";
  }
  if (step === "languages") {
    if (!v.languages.length) return "Pick at least one language";
  }
  return null;
}

function RegisterBusinessPage() {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [values, setValues] = useState<BusinessFormValues>(emptyBusinessForm());
  const [staff, setStaff] = useState<StaffDraft[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth", search: { redirect: "/register-business" } as never });
  }, [user, loading, navigate]);
  if (loading || !user) return null;

  const set = (patch: Partial<BusinessFormValues>) => setValues((v) => ({ ...v, ...patch }));
  const current = STEPS[step].id;
  const progress = ((step + 1) / STEPS.length) * 100;

  const next = () => {
    const err = validateStep(current, values);
    if (err) { toast(err); return; }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const prev = () => { setStep((s) => Math.max(s - 1, 0)); window.scrollTo({ top: 0, behavior: "smooth" }); };

  const submit = async () => {
    const parsed = businessFormSchema.safeParse(values);
    if (!parsed.success) { toast(parsed.error.issues[0]?.message ?? "Please fix invalid fields"); return; }
    setSaving(true);
    try {
      const { id } = await createBusinessDraft(values, user.id, staff);
      toast("Submitted for review!");
      navigate({ to: "/dashboard/business/$id/edit", params: { id } });
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/dashboard" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Cancel
      </Link>
      <h1 className="mt-4 text-display text-4xl sm:text-5xl">List your business</h1>
      <p className="mt-2 text-muted-foreground">Step {step + 1} of {STEPS.length} — {STEPS[step].label}</p>
      <Progress value={progress} className="mt-4" />

      <ol className="mt-6 flex flex-wrap gap-2 text-xs text-muted-foreground">
        {STEPS.map((s, i) => (
          <li
            key={s.id}
            className={`inline-flex items-center gap-1 rounded-full border px-2 py-1 ${
              i === step ? "bg-foreground text-background border-foreground" : i < step ? "opacity-70" : ""
            }`}
          >
            {i < step && <Check className="h-3 w-3" />} {s.label}
          </li>
        ))}
      </ol>

      <div className="mt-8 rounded-lg border bg-card p-6">
        {current === "info" && <InfoSection values={values} set={set} />}
        {current === "location" && <LocationSection values={values} set={set} />}
        {current === "languages" && <LanguagesSection values={values} set={set} />}
        {current === "services" && <ServicesSection values={values} set={set} />}
        {current === "hours" && <HoursSection values={values} set={set} />}
        {current === "gallery" && <MediaSection values={values} set={set} userId={user.id} />}
        {current === "contact" && <ContactSection values={values} set={set} />}
        {current === "staff" && <StaffSection staff={staff} setStaff={setStaff} userId={user.id} />}
        {current === "review" && <ReviewSummary values={values} staff={staff} />}
      </div>

      <div className="mt-6 flex justify-between">
        <Button variant="ghost" onClick={prev} disabled={step === 0}>
          <ArrowLeft className="h-4 w-4 mr-1" /> Back
        </Button>
        {step < STEPS.length - 1 ? (
          <Button onClick={next}>Next <ArrowRight className="h-4 w-4 ml-1" /></Button>
        ) : (
          <Button onClick={submit} disabled={saving}>
            {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Submit for review
          </Button>
        )}
      </div>
    </div>
  );
}

function ReviewSummary({ values, staff }: { values: BusinessFormValues; staff: StaffDraft[] }) {
  const hours = (values.hours ?? {}) as Record<Day, DayHours>;
  return (
    <div className="space-y-6 text-sm">
      <section>
        <h3 className="font-medium text-base">Business</h3>
        <dl className="mt-2 grid gap-1">
          <Row label="Name" value={values.name} />
          <Row label="Tagline" value={values.tagline} />
          <Row label="Description" value={values.description} />
        </dl>
      </section>
      <section>
        <h3 className="font-medium text-base">Location</h3>
        <dl className="mt-2 grid gap-1">
          <Row label="Address" value={values.address} />
          <Row label="Google Maps" value={values.google_maps_url} />
          <Row label="Naver Maps" value={values.naver_maps_url} />
        </dl>
      </section>
      <section>
        <h3 className="font-medium text-base">Languages</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {values.languages.map((l) => <Badge key={l} variant="secondary">{l}</Badge>)}
        </div>
      </section>
      <section>
        <h3 className="font-medium text-base">Services</h3>
        <div className="mt-2 flex flex-wrap gap-2">
          {(values.services ?? []).map((s) => <Badge key={s} variant="secondary">{s}</Badge>)}
          {(values.services ?? []).length === 0 && <p className="text-muted-foreground">None added</p>}
        </div>
      </section>
      <section>
        <h3 className="font-medium text-base">Hours</h3>
        <ul className="mt-2 space-y-1">
          {(["mon","tue","wed","thu","fri","sat","sun"] as Day[]).map((d) => {
            const h = hours[d];
            return (
              <li key={d} className="flex justify-between">
                <span>{DAY_LABELS[d]}</span>
                <span className="text-muted-foreground">
                  {!h || h.closed ? "Closed" : `${h.open ?? "—"} – ${h.close ?? "—"}`}
                </span>
              </li>
            );
          })}
        </ul>
      </section>
      <section>
        <h3 className="font-medium text-base">Media</h3>
        <p className="text-muted-foreground">
          Logo: {values.logo ? "uploaded" : "—"} · Cover: {values.cover_image ? "uploaded" : "—"} · Gallery: {(values.photos ?? []).length} photo(s)
        </p>
      </section>
      <section>
        <h3 className="font-medium text-base">Contact</h3>
        <dl className="mt-2 grid gap-1">
          <Row label="Phone" value={values.phone} />
          <Row label="Email" value={values.email} />
          <Row label="Website" value={values.website} />
          <Row label="Instagram" value={values.instagram} />
          <Row label="KakaoTalk" value={values.kakao_id} />
        </dl>
      </section>
      <section>
        <h3 className="font-medium text-base">Staff</h3>
        <p className="text-muted-foreground">{staff.length} team member(s)</p>
      </section>
      <p className="text-xs text-muted-foreground pt-2 border-t">
        Your listing will be reviewed by our team before appearing publicly. You can keep editing it from your dashboard.
      </p>
    </div>
  );
}

function Row({ label, value }: { label: string; value?: string }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3">
      <dt className="text-muted-foreground">{label}</dt>
      <dd>{value?.trim() ? value : <span className="text-muted-foreground">—</span>}</dd>
    </div>
  );
}
