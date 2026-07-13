import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2, ArrowLeft } from "lucide-react";
import {
  InfoSection,
  LocationSection,
  LanguagesSection,
  ServicesSection,
  HoursSection,
  MediaSection,
  ContactSection,
  PricingSection,
  StaffSection,
} from "@/components/business-form-sections";
import { businessFormSchema, emptyBusinessForm, type BusinessFormValues, type StaffDraft } from "@/lib/business-form";
import { loadBusinessForEdit, updateBusiness } from "@/lib/business-save";

export const Route = createFileRoute("/dashboard/business/$id/edit")({
  head: () => ({
    meta: [
      { title: "Edit business — Connect Korea Guide" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: EditBusinessPage,
});

function EditBusinessPage() {
  const { id } = Route.useParams();
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate({ to: "/auth" });
  }, [user, loading, navigate]);

  const { data, isLoading, error } = useQuery({
    queryKey: ["business-edit", id],
    enabled: !!user,
    queryFn: () => loadBusinessForEdit(id),
  });

  const [values, setValues] = useState<BusinessFormValues>(emptyBusinessForm());
  const [staff, setStaff] = useState<StaffDraft[]>([]);
  const [slug, setSlug] = useState<string>("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (data) {
      setValues(data.values);
      setStaff(data.staff);
      setSlug(data.slug);
    }
  }, [data]);

  if (loading || !user) return null;
  if (isLoading) return <div className="p-16 text-center"><Loader2 className="animate-spin inline" /></div>;
  if (error || !data) return <div className="p-16 text-center">Business not found or you don't have access.</div>;

  const set = (patch: Partial<BusinessFormValues>) => setValues((v) => ({ ...v, ...patch }));

  const save = async () => {
    const parsed = businessFormSchema.safeParse(values);
    if (!parsed.success) {
      toast(parsed.error.issues[0]?.message ?? "Please fix invalid fields");
      return;
    }
    setSaving(true);
    try {
      const res = await updateBusiness(id, values, user.id, staff, slug);
      setSlug(res.slug);
      toast("Changes saved");
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6 lg:px-8">
      <Link to="/dashboard" className="text-sm text-muted-foreground hover:underline inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Back to dashboard
      </Link>
      <div className="mt-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-display text-4xl sm:text-5xl">Edit business</h1>
          <p className="mt-2 text-muted-foreground">Update your public profile. Changes are visible to everyone once approved.</p>
        </div>
        <Button onClick={save} disabled={saving} size="lg">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save changes
        </Button>
      </div>

      <Tabs defaultValue="info" className="mt-8">
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="info">Info</TabsTrigger>
          <TabsTrigger value="location">Location</TabsTrigger>
          <TabsTrigger value="languages">Languages</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="hours">Hours</TabsTrigger>
          <TabsTrigger value="media">Media</TabsTrigger>
          <TabsTrigger value="contact">Contact</TabsTrigger>
          <TabsTrigger value="pricing">Pricing & FAQ</TabsTrigger>
          <TabsTrigger value="staff">Staff</TabsTrigger>
        </TabsList>
        <div className="mt-6 rounded-lg border bg-card p-6">
          <TabsContent value="info"><InfoSection values={values} set={set} /></TabsContent>
          <TabsContent value="location"><LocationSection values={values} set={set} /></TabsContent>
          <TabsContent value="languages"><LanguagesSection values={values} set={set} /></TabsContent>
          <TabsContent value="services"><ServicesSection values={values} set={set} /></TabsContent>
          <TabsContent value="hours"><HoursSection values={values} set={set} /></TabsContent>
          <TabsContent value="media"><MediaSection values={values} set={set} userId={user.id} /></TabsContent>
          <TabsContent value="contact"><ContactSection values={values} set={set} /></TabsContent>
          <TabsContent value="pricing"><PricingSection values={values} set={set} /></TabsContent>
          <TabsContent value="staff"><StaffSection staff={staff} setStaff={setStaff} userId={user.id} /></TabsContent>
        </div>
      </Tabs>

      <div className="mt-8 flex justify-end">
        <Button onClick={save} disabled={saving} size="lg">
          {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />} Save changes
        </Button>
      </div>
    </div>
  );
}
