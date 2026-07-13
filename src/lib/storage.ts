import { supabase } from "@/integrations/supabase/client";

const BUCKET = "business-media";
// Long-lived signed URL (~10 years) since the bucket is private.
const TEN_YEARS = 60 * 60 * 24 * 365 * 10;

export type UploadKind = "logo" | "cover" | "gallery" | "staff";

export async function uploadBusinessImage(
  file: File,
  userId: string,
  kind: UploadKind,
): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const path = `${userId}/${kind}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type });
  if (upErr) throw upErr;
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS);
  if (error || !data) throw error ?? new Error("Could not create signed URL");
  return data.signedUrl;
}
