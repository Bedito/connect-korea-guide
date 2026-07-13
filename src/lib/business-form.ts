import { z } from "zod";

export const DAYS = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"] as const;
export type Day = (typeof DAYS)[number];
export const DAY_LABELS: Record<Day, string> = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
  sun: "Sunday",
};

export type DayHours = {
  closed?: boolean;
  open?: string;
  close?: string;
  lunch_start?: string;
  lunch_end?: string;
};
export type HoursMap = Partial<Record<Day, DayHours>>;

export type PricingItem = { name: string; price: string; description?: string };
export type FaqItem = { question: string; answer: string };

export const AMENITY_OPTIONS: { value: string; label: string }[] = [
  { value: "parking", label: "Parking" },
  { value: "online_consultation", label: "Online consultation" },
  { value: "emergency_service", label: "Emergency service" },
  { value: "reservation_required", label: "Reservation required" },
  { value: "wheelchair_accessible", label: "Wheelchair accessible" },
  { value: "wifi", label: "Wi-Fi" },
  { value: "card_payment", label: "Card payment" },
];

export const LANGUAGE_OPTIONS: { value: string; label: string }[] = [
  { value: "english", label: "English" },
  { value: "korean", label: "Korean" },
  { value: "chinese", label: "Chinese" },
  { value: "japanese", label: "Japanese" },
  { value: "spanish", label: "Spanish" },
  { value: "russian", label: "Russian" },
];

const optionalUrl = z
  .string()
  .trim()
  .max(500)
  .url({ message: "Must be a valid URL" })
  .optional()
  .or(z.literal("").transform(() => undefined));

export const businessFormSchema = z.object({
  name: z.string().trim().min(2, "Name is required").max(120),
  tagline: z.string().trim().max(160).optional().or(z.literal("")),
  description: z.string().trim().max(4000).optional().or(z.literal("")),
  category_id: z.string().uuid("Choose a category"),
  city_id: z.string().uuid("Choose a city"),
  district_id: z.string().uuid().optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  latitude: z.coerce.number().min(-90).max(90).optional().or(z.nan()),
  longitude: z.coerce.number().min(-180).max(180).optional().or(z.nan()),
  google_maps_url: optionalUrl,
  naver_maps_url: optionalUrl,
  languages: z.array(z.string()).min(1, "Pick at least one language"),
  services: z.array(z.string().trim().min(1)).default([]),
  amenities: z.array(z.string()).default([]),
  phone: z.string().trim().max(40).optional().or(z.literal("")),
  email: z
    .string()
    .trim()
    .max(200)
    .email("Invalid email")
    .optional()
    .or(z.literal("").transform(() => undefined)),
  website: optionalUrl,
  instagram: z.string().trim().max(80).optional().or(z.literal("")),
  kakao_id: z.string().trim().max(80).optional().or(z.literal("")),
  holiday_notice: z.string().trim().max(400).optional().or(z.literal("")),
  logo: z.string().url().optional().or(z.literal("")),
  cover_image: z.string().url().optional().or(z.literal("")),
  photos: z.array(z.string().url()).default([]),
  hours: z.record(z.string(), z.any()).default({}),
  pricing: z
    .array(
      z.object({
        name: z.string().trim().min(1),
        price: z.string().trim().min(1),
        description: z.string().trim().max(300).optional().or(z.literal("")),
      }),
    )
    .default([]),
  faqs: z
    .array(
      z.object({
        question: z.string().trim().min(1),
        answer: z.string().trim().min(1).max(1000),
      }),
    )
    .default([]),
});

export type BusinessFormValues = z.input<typeof businessFormSchema>;

export type StaffDraft = {
  id?: string;
  name: string;
  position?: string;
  photo?: string;
  languages: string[];
  sort_order?: number;
};

export function emptyBusinessForm(): BusinessFormValues {
  return {
    name: "",
    tagline: "",
    description: "",
    category_id: "",
    city_id: "",
    district_id: "",
    address: "",
    latitude: undefined as unknown as number,
    longitude: undefined as unknown as number,
    google_maps_url: "",
    naver_maps_url: "",
    languages: ["english"],
    services: [],
    amenities: [],
    phone: "",
    email: "",
    website: "",
    instagram: "",
    kakao_id: "",
    holiday_notice: "",
    logo: "",
    cover_image: "",
    photos: [],
    hours: {},
    pricing: [],
    faqs: [],
  };
}

export function slugify(input: string) {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .slice(0, 80);
}
