import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2, Upload, X, Plus, Trash2 } from "lucide-react";
import {
  categoriesQuery,
  citiesQuery,
  districtsByCityQuery,
} from "@/lib/queries";
import {
  DAYS,
  DAY_LABELS,
  AMENITY_OPTIONS,
  LANGUAGE_OPTIONS,
  type BusinessFormValues,
  type Day,
  type DayHours,
  type StaffDraft,
} from "@/lib/business-form";
import { uploadBusinessImage, type UploadKind } from "@/lib/storage";

type Setter = (patch: Partial<BusinessFormValues>) => void;

export function InfoSection({
  values,
  set,
}: {
  values: BusinessFormValues;
  set: Setter;
}) {
  const { data: categories = [] } = useQuery(categoriesQuery);
  return (
    <div className="space-y-4">
      <div>
        <Label htmlFor="name">Business name *</Label>
        <Input
          id="name"
          value={values.name}
          onChange={(e) => set({ name: e.target.value })}
          maxLength={120}
        />
      </div>
      <div>
        <Label htmlFor="tagline">Tagline</Label>
        <Input
          id="tagline"
          value={values.tagline ?? ""}
          onChange={(e) => set({ tagline: e.target.value })}
          maxLength={160}
          placeholder="One-line summary of what you do"
        />
      </div>
      <div>
        <Label htmlFor="category">Category *</Label>
        <Select
          value={values.category_id || undefined}
          onValueChange={(v) => set({ category_id: v })}
        >
          <SelectTrigger id="category">
            <SelectValue placeholder="Select a category" />
          </SelectTrigger>
          <SelectContent>
            {categories.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          rows={5}
          value={values.description ?? ""}
          onChange={(e) => set({ description: e.target.value })}
          maxLength={4000}
          placeholder="Introduce your business, expertise, and what makes it welcoming for foreigners."
        />
      </div>
    </div>
  );
}

export function LocationSection({
  values,
  set,
}: {
  values: BusinessFormValues;
  set: Setter;
}) {
  const { data: cities = [] } = useQuery(citiesQuery);
  const selectedCity = cities.find((c) => c.id === values.city_id);
  const { data: districts = [] } = useQuery(
    districtsByCityQuery(selectedCity?.slug),
  );
  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label>City *</Label>
          <Select
            value={values.city_id || undefined}
            onValueChange={(v) => set({ city_id: v, district_id: "" })}
          >
            <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
            <SelectContent>
              {cities.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>District</Label>
          <Select
            value={values.district_id || undefined}
            onValueChange={(v) => set({ district_id: v })}
            disabled={!values.city_id}
          >
            <SelectTrigger><SelectValue placeholder="Select district" /></SelectTrigger>
            <SelectContent>
              {districts.map((d) => (
                <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div>
        <Label htmlFor="address">Address</Label>
        <Input
          id="address"
          value={values.address ?? ""}
          onChange={(e) => set({ address: e.target.value })}
          placeholder="Street, building, floor"
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <Label htmlFor="lat">Latitude</Label>
          <Input
            id="lat"
            type="number"
            step="any"
            value={Number.isFinite(values.latitude as number) ? String(values.latitude) : ""}
            onChange={(e) => set({ latitude: e.target.value === "" ? (undefined as unknown as number) : Number(e.target.value) })}
          />
        </div>
        <div>
          <Label htmlFor="lng">Longitude</Label>
          <Input
            id="lng"
            type="number"
            step="any"
            value={Number.isFinite(values.longitude as number) ? String(values.longitude) : ""}
            onChange={(e) => set({ longitude: e.target.value === "" ? (undefined as unknown as number) : Number(e.target.value) })}
          />
        </div>
      </div>
      <div>
        <Label htmlFor="gmaps">Google Maps URL</Label>
        <Input
          id="gmaps"
          value={values.google_maps_url ?? ""}
          onChange={(e) => set({ google_maps_url: e.target.value })}
          placeholder="https://maps.google.com/..."
        />
      </div>
      <div>
        <Label htmlFor="naver">Naver Maps URL</Label>
        <Input
          id="naver"
          value={values.naver_maps_url ?? ""}
          onChange={(e) => set({ naver_maps_url: e.target.value })}
          placeholder="https://map.naver.com/..."
        />
      </div>
    </div>
  );
}

export function LanguagesSection({
  values,
  set,
}: {
  values: BusinessFormValues;
  set: Setter;
}) {
  const toggle = (v: string) => {
    const has = values.languages.includes(v);
    set({
      languages: has
        ? values.languages.filter((l) => l !== v)
        : [...values.languages, v],
    });
  };
  return (
    <div>
      <p className="text-sm text-muted-foreground mb-3">
        Which languages can your staff serve customers in?
      </p>
      <div className="grid gap-2 sm:grid-cols-2">
        {LANGUAGE_OPTIONS.map((o) => (
          <label key={o.value} className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-accent">
            <Checkbox
              checked={values.languages.includes(o.value)}
              onCheckedChange={() => toggle(o.value)}
            />
            <span>{o.label}</span>
          </label>
        ))}
      </div>
    </div>
  );
}

export function ServicesSection({
  values,
  set,
}: {
  values: BusinessFormValues;
  set: Setter;
}) {
  const [input, setInput] = useState("");
  const add = () => {
    const v = input.trim();
    if (!v) return;
    if ((values.services ?? []).includes(v)) return;
    set({ services: [...(values.services ?? []), v] });
    setInput("");
  };
  const remove = (v: string) => set({ services: (values.services ?? []).filter((s) => s !== v) });
  return (
    <div className="space-y-4">
      <div>
        <Label>Services offered</Label>
        <div className="flex gap-2 mt-1">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
            placeholder="e.g. Dental cleaning"
          />
          <Button type="button" onClick={add} variant="secondary">Add</Button>
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {(values.services ?? []).map((s) => (
          <Badge key={s} variant="secondary" className="gap-1">
            {s}
            <button type="button" onClick={() => remove(s)} aria-label={`Remove ${s}`}>
              <X className="h-3 w-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="pt-4">
        <Label className="mb-2 block">Amenities</Label>
        <div className="grid gap-2 sm:grid-cols-2">
          {AMENITY_OPTIONS.map((a) => (
            <label key={a.value} className="flex items-center gap-2 rounded-md border p-3 cursor-pointer hover:bg-accent">
              <Checkbox
                checked={(values.amenities ?? []).includes(a.value)}
                onCheckedChange={(checked) => {
                  set({
                    amenities: checked
                      ? [...(values.amenities ?? []), a.value]
                      : (values.amenities ?? []).filter((x) => x !== a.value),
                  });
                }}
              />
              <span>{a.label}</span>
            </label>
          ))}
        </div>
      </div>
    </div>
  );
}

export function HoursSection({
  values,
  set,
}: {
  values: BusinessFormValues;
  set: Setter;
}) {
  const hours = (values.hours as Record<Day, DayHours>) || {};
  const update = (day: Day, patch: Partial<DayHours>) => {
    set({ hours: { ...hours, [day]: { ...(hours[day] || {}), ...patch } } });
  };
  return (
    <div className="space-y-4">
      {DAYS.map((day) => {
        const h = hours[day] || {};
        return (
          <div key={day} className="rounded-md border p-3">
            <div className="flex items-center justify-between">
              <div className="font-medium">{DAY_LABELS[day]}</div>
              <label className="flex items-center gap-2 text-sm">
                <Checkbox
                  checked={!!h.closed}
                  onCheckedChange={(c) => update(day, { closed: !!c })}
                />
                Closed
              </label>
            </div>
            {!h.closed && (
              <div className="mt-3 grid gap-3 sm:grid-cols-4">
                <div>
                  <Label className="text-xs">Open</Label>
                  <Input type="time" value={h.open ?? ""} onChange={(e) => update(day, { open: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Close</Label>
                  <Input type="time" value={h.close ?? ""} onChange={(e) => update(day, { close: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Lunch start</Label>
                  <Input type="time" value={h.lunch_start ?? ""} onChange={(e) => update(day, { lunch_start: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Lunch end</Label>
                  <Input type="time" value={h.lunch_end ?? ""} onChange={(e) => update(day, { lunch_end: e.target.value })} />
                </div>
              </div>
            )}
          </div>
        );
      })}
      <div>
        <Label htmlFor="holiday">Holiday notice</Label>
        <Textarea
          id="holiday"
          rows={2}
          value={values.holiday_notice ?? ""}
          onChange={(e) => set({ holiday_notice: e.target.value })}
          placeholder="e.g. Closed for Chuseok Sep 28–30"
        />
      </div>
    </div>
  );
}

function ImagePicker({
  value,
  onChange,
  userId,
  kind,
  aspect = "aspect-video",
  label,
}: {
  value: string;
  onChange: (url: string) => void;
  userId: string;
  kind: UploadKind;
  aspect?: string;
  label: string;
}) {
  const [busy, setBusy] = useState(false);
  const handle = async (file: File) => {
    if (!file) return;
    if (file.size > 8 * 1024 * 1024) { toast("Max file size is 8MB"); return; }
    try {
      setBusy(true);
      const url = await uploadBusinessImage(file, userId, kind);
      onChange(url);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div>
      <Label className="mb-2 block">{label}</Label>
      <div className={`relative ${aspect} w-full max-w-md overflow-hidden rounded-md border bg-muted`}>
        {value ? (
          <img src={value} alt={label} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            No image
          </div>
        )}
      </div>
      <div className="mt-2 flex gap-2">
        <label className="inline-flex">
          <input
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => e.target.files?.[0] && handle(e.target.files[0])}
          />
          <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {value ? "Replace" : "Upload"}
          </span>
        </label>
        {value && (
          <Button type="button" variant="ghost" onClick={() => onChange("")}>
            <Trash2 className="h-4 w-4 mr-1" /> Remove
          </Button>
        )}
      </div>
    </div>
  );
}

export function MediaSection({
  values,
  set,
  userId,
}: {
  values: BusinessFormValues;
  set: Setter;
  userId: string;
}) {
  const [busy, setBusy] = useState(false);
  const handleGallery = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    setBusy(true);
    try {
      const urls: string[] = [];
      for (const f of Array.from(files)) {
        if (f.size > 8 * 1024 * 1024) continue;
        const u = await uploadBusinessImage(f, userId, "gallery");
        urls.push(u);
      }
      set({ photos: [...(values.photos ?? []), ...urls] });
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="space-y-6">
      <ImagePicker
        value={values.logo ?? ""}
        onChange={(url) => set({ logo: url })}
        userId={userId}
        kind="logo"
        aspect="aspect-square"
        label="Logo"
      />
      <ImagePicker
        value={values.cover_image ?? ""}
        onChange={(url) => set({ cover_image: url })}
        userId={userId}
        kind="cover"
        aspect="aspect-video"
        label="Cover image"
      />
      <div>
        <Label className="mb-2 block">Gallery</Label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {(values.photos ?? []).map((p, i) => (
            <div key={p + i} className="relative aspect-square overflow-hidden rounded-md border">
              <img src={p} alt="" className="h-full w-full object-cover" />
              <button
                type="button"
                onClick={() => set({ photos: (values.photos ?? []).filter((_, idx) => idx !== i) })}
                className="absolute right-1 top-1 rounded-full bg-background/90 p-1 shadow"
                aria-label="Remove photo"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
        <label className="mt-3 inline-flex">
          <input
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={(e) => handleGallery(e.target.files)}
          />
          <span className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-sm cursor-pointer hover:bg-accent">
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
            Add photos
          </span>
        </label>
      </div>
    </div>
  );
}

export function ContactSection({
  values,
  set,
}: {
  values: BusinessFormValues;
  set: Setter;
}) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <div>
        <Label>Phone</Label>
        <Input value={values.phone ?? ""} onChange={(e) => set({ phone: e.target.value })} />
      </div>
      <div>
        <Label>Email</Label>
        <Input type="email" value={values.email ?? ""} onChange={(e) => set({ email: e.target.value })} />
      </div>
      <div className="sm:col-span-2">
        <Label>Website</Label>
        <Input value={values.website ?? ""} onChange={(e) => set({ website: e.target.value })} placeholder="https://" />
      </div>
      <div>
        <Label>Instagram</Label>
        <Input value={values.instagram ?? ""} onChange={(e) => set({ instagram: e.target.value })} placeholder="@handle" />
      </div>
      <div>
        <Label>KakaoTalk ID</Label>
        <Input value={values.kakao_id ?? ""} onChange={(e) => set({ kakao_id: e.target.value })} />
      </div>
    </div>
  );
}

export function PricingSection({
  values,
  set,
}: {
  values: BusinessFormValues;
  set: Setter;
}) {
  const rows = values.pricing ?? [];
  const update = (i: number, patch: Partial<typeof rows[number]>) => {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    set({ pricing: next });
  };
  const add = () => set({ pricing: [...rows, { name: "", price: "", description: "" }] });
  const remove = (i: number) => set({ pricing: rows.filter((_, idx) => idx !== i) });
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_140px_1fr_auto] items-end rounded-md border p-3">
          <div>
            <Label className="text-xs">Item</Label>
            <Input value={r.name} onChange={(e) => update(i, { name: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Price</Label>
            <Input value={r.price} onChange={(e) => update(i, { price: e.target.value })} placeholder="₩50,000" />
          </div>
          <div>
            <Label className="text-xs">Note</Label>
            <Input value={r.description ?? ""} onChange={(e) => update(i, { description: e.target.value })} />
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => remove(i)} aria-label="Remove pricing row">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={add}>
        <Plus className="h-4 w-4 mr-1" /> Add pricing row
      </Button>

      <div className="pt-6">
        <Label className="mb-2 block">FAQs</Label>
        <FaqEditor values={values} set={set} />
      </div>
    </div>
  );
}

function FaqEditor({ values, set }: { values: BusinessFormValues; set: Setter }) {
  const rows = values.faqs ?? [];
  const update = (i: number, patch: Partial<typeof rows[number]>) => {
    const next = rows.slice();
    next[i] = { ...next[i], ...patch };
    set({ faqs: next });
  };
  return (
    <div className="space-y-3">
      {rows.map((r, i) => (
        <div key={i} className="rounded-md border p-3 space-y-2">
          <Input placeholder="Question" value={r.question} onChange={(e) => update(i, { question: e.target.value })} />
          <Textarea rows={3} placeholder="Answer" value={r.answer} onChange={(e) => update(i, { answer: e.target.value })} />
          <Button type="button" variant="ghost" size="sm" onClick={() => set({ faqs: rows.filter((_, idx) => idx !== i) })}>
            <Trash2 className="h-4 w-4 mr-1" /> Remove
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => set({ faqs: [...rows, { question: "", answer: "" }] })}>
        <Plus className="h-4 w-4 mr-1" /> Add FAQ
      </Button>
    </div>
  );
}

export function StaffSection({
  staff,
  setStaff,
  userId,
}: {
  staff: StaffDraft[];
  setStaff: (s: StaffDraft[]) => void;
  userId: string;
}) {
  const [busyIdx, setBusyIdx] = useState<number | null>(null);
  const update = (i: number, patch: Partial<StaffDraft>) => {
    const next = staff.slice();
    next[i] = { ...next[i], ...patch };
    setStaff(next);
  };
  const uploadPhoto = async (i: number, file: File) => {
    if (file.size > 5 * 1024 * 1024) { toast("Max 5MB"); return; }
    try {
      setBusyIdx(i);
      const url = await uploadBusinessImage(file, userId, "staff");
      update(i, { photo: url });
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setBusyIdx(null);
    }
  };
  return (
    <div className="space-y-3">
      {staff.map((s, i) => (
        <div key={i} className="rounded-md border p-3 grid gap-3 sm:grid-cols-[80px_1fr_auto]">
          <div>
            <div className="h-20 w-20 overflow-hidden rounded-full bg-muted">
              {s.photo ? <img src={s.photo} alt="" className="h-full w-full object-cover" /> : null}
            </div>
            <label className="mt-2 inline-flex text-xs cursor-pointer text-muted-foreground">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => e.target.files?.[0] && uploadPhoto(i, e.target.files[0])}
              />
              {busyIdx === i ? "Uploading..." : "Upload"}
            </label>
          </div>
          <div className="space-y-2">
            <Input placeholder="Name" value={s.name} onChange={(e) => update(i, { name: e.target.value })} />
            <Input placeholder="Position (e.g. Head Dentist)" value={s.position ?? ""} onChange={(e) => update(i, { position: e.target.value })} />
            <div className="flex flex-wrap gap-2">
              {LANGUAGE_OPTIONS.map((o) => (
                <label key={o.value} className="flex items-center gap-1 text-xs rounded-md border px-2 py-1 cursor-pointer">
                  <Checkbox
                    checked={s.languages.includes(o.value)}
                    onCheckedChange={(c) => update(i, {
                      languages: c ? [...s.languages, o.value] : s.languages.filter((l) => l !== o.value),
                    })}
                  />
                  {o.label}
                </label>
              ))}
            </div>
          </div>
          <Button type="button" variant="ghost" size="icon" onClick={() => setStaff(staff.filter((_, idx) => idx !== i))} aria-label="Remove staff member">
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button type="button" variant="secondary" onClick={() => setStaff([...staff, { name: "", position: "", languages: [] }])}>
        <Plus className="h-4 w-4 mr-1" /> Add staff member
      </Button>
    </div>
  );
}

// Convenience hook wrapper — used by wizard/editor to share values state.
export function useFormState<T>(initial: T) {
  const [values, setValues] = useState<T>(initial);
  const set = (patch: Partial<T>) => setValues((v) => ({ ...v, ...patch }));
  const reset = (next: T) => setValues(next);
  return { values, set, reset };
}

// Update local state whenever an async initial value resolves.
export function useSyncValues<T>(remote: T | undefined, reset: (next: T) => void) {
  useEffect(() => {
    if (remote) reset(remote);
  }, [remote, reset]);
}
