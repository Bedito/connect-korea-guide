import { useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  businessReviewsQuery,
  myReviewForBusinessQuery,
  type ReviewRow,
} from "@/lib/reviews";
import { uploadReviewPhoto } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Trash2, ImagePlus, X } from "lucide-react";

const MAX_PHOTOS = 6;

export function ReviewsSection({
  businessId,
  isOwner,
}: {
  businessId: string;
  isOwner: boolean;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const { data: reviews = [] } = useQuery(businessReviewsQuery(businessId));
  const { data: mine } = useQuery(myReviewForBusinessQuery(businessId, user?.id));

  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setTitle(mine.title ?? "");
      setBody(mine.body);
      setPhotos(mine.photos ?? []);
    }
  }, [mine]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reviews", "business", businessId] });
    qc.invalidateQueries({ queryKey: ["reviews", "mine", businessId] });
    qc.invalidateQueries({ queryKey: ["business", businessId] });
  };

  async function handleFiles(files: FileList | null) {
    if (!files || !user) return;
    const room = MAX_PHOTOS - photos.length;
    const list = Array.from(files).slice(0, room);
    if (list.length === 0) return;
    setUploading(true);
    try {
      const urls: string[] = [];
      for (const f of list) {
        if (!f.type.startsWith("image/")) continue;
        if (f.size > 8 * 1024 * 1024) {
          toast(`${f.name} is larger than 8MB`);
          continue;
        }
        urls.push(await uploadReviewPhoto(f, user.id));
      }
      setPhotos((p) => [...p, ...urls]);
    } catch (e) {
      toast((e as Error).message);
    } finally {
      setUploading(false);
    }
  }

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Sign in to leave a review");
      if (!body.trim()) throw new Error("Please write a review");
      const payload = {
        business_id: businessId,
        user_id: user.id,
        rating,
        title: title.trim() || null,
        body: body.trim(),
        photos: photos.length ? photos : undefined,
      };
      const { error } = await supabase
        .from("reviews")
        .upsert(payload, { onConflict: "business_id,user_id" });
      if (error) throw error;
    },
    onSuccess: () => {
      toast(mine ? "Review updated" : "Thanks for your review!");
      invalidate();
    },
    onError: (e: Error) => toast(e.message),
  });

  const remove = useMutation({
    mutationFn: async () => {
      if (!user || !mine) return;
      const { error } = await supabase.from("reviews").delete().eq("id", mine.id);
      if (error) throw error;
    },
    onSuccess: () => {
      setRating(5);
      setTitle("");
      setBody("");
      setPhotos([]);
      invalidate();
    },
  });

  return (
    <section>
      <h2 className="text-display text-3xl">
        Reviews <span className="text-muted-foreground">({reviews.length})</span>
      </h2>

      {!user ? (
        <div className="mt-4 rounded-2xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
          <Link to="/auth" className="underline underline-offset-4">
            Sign in
          </Link>{" "}
          to share your experience.
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-border/60 bg-card p-6">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">
              {mine ? "Update your review" : "Write a review"}
            </p>
            <StarRating value={rating} onChange={setRating} />
          </div>
          <Input
            className="mt-4"
            placeholder="Headline (optional)"
            value={title}
            maxLength={120}
            onChange={(e) => setTitle(e.target.value)}
          />
          <Textarea
            className="mt-3 min-h-28"
            placeholder="What was your experience?"
            value={body}
            maxLength={2000}
            onChange={(e) => setBody(e.target.value)}
          />

          {photos.length > 0 && (
            <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
              {photos.map((url, i) => (
                <div
                  key={url}
                  className="group relative aspect-square overflow-hidden rounded-lg border border-border/60"
                >
                  <img src={url} alt="" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute right-1 top-1 rounded-full bg-black/60 p-1 text-white opacity-0 transition group-hover:opacity-100"
                    aria-label="Remove photo"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button onClick={() => submit.mutate()} disabled={submit.isPending || uploading}>
              {submit.isPending ? "Saving..." : mine ? "Update review" : "Post review"}
            </Button>
            <label className="inline-flex cursor-pointer items-center gap-1.5 rounded-md border border-border/70 px-3 py-2 text-sm hover:bg-muted">
              <ImagePlus className="h-4 w-4" />
              {uploading ? "Uploading..." : "Add photos"}
              <input
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                disabled={uploading || photos.length >= MAX_PHOTOS}
                onChange={(e) => {
                  handleFiles(e.target.files);
                  e.target.value = "";
                }}
              />
            </label>
            <span className="text-xs text-muted-foreground">
              {photos.length}/{MAX_PHOTOS}
            </span>
            {mine && (
              <Button
                variant="ghost"
                onClick={() => remove.mutate()}
                disabled={remove.isPending}
              >
                <Trash2 className="mr-1.5 h-4 w-4" /> Delete
              </Button>
            )}
          </div>
        </div>
      )}

      <ul className="mt-6 space-y-6">
        {reviews.map((r) => (
          <ReviewItem
            key={r.id}
            review={r}
            businessId={businessId}
            isOwner={isOwner}
            onChanged={invalidate}
          />
        ))}
        {reviews.length === 0 && (
          <li className="rounded-2xl border border-dashed border-border/60 p-8 text-center text-sm text-muted-foreground">
            No reviews yet. Be the first!
          </li>
        )}
      </ul>
    </section>
  );
}

function ReviewItem({
  review,
  businessId,
  isOwner,
  onChanged,
}: {
  review: ReviewRow;
  businessId: string;
  isOwner: boolean;
  onChanged: () => void;
}) {
  const [reply, setReply] = useState(review.owner_reply ?? "");
  const [editing, setEditing] = useState(false);

  const saveReply = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("reviews")
        .update({
          owner_reply: reply.trim() || null,
          owner_reply_at: reply.trim() ? new Date().toISOString() : null,
        })
        .eq("id", review.id)
        .eq("business_id", businessId);
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Reply posted");
      setEditing(false);
      onChanged();
    },
    onError: (e: Error) => toast(e.message),
  });

  return (
    <li className="rounded-2xl border border-border/60 bg-card p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium">
            {review.profiles?.display_name ?? "Anonymous"}
          </div>
          <div className="mt-1 flex items-center gap-3">
            <StarRating value={review.rating} readOnly size={14} />
            <span className="text-xs text-muted-foreground">
              {formatDistanceToNow(new Date(review.created_at), { addSuffix: true })}
            </span>
          </div>
        </div>
      </div>
      {review.title && <div className="mt-3 font-semibold">{review.title}</div>}
      <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-foreground/85">
        {review.body}
      </p>

      {review.photos && review.photos.length > 0 && (
        <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-6">
          {review.photos.map((url) => (
            <a
              key={url}
              href={url}
              target="_blank"
              rel="noreferrer"
              className="aspect-square overflow-hidden rounded-lg border border-border/60"
            >
              <img
                src={url}
                alt="Review photo"
                loading="lazy"
                className="h-full w-full object-cover transition hover:scale-105"
              />
            </a>
          ))}
        </div>
      )}

      {review.owner_reply && !editing && (
        <div className="mt-4 rounded-xl bg-muted/60 p-4">
          <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Response from the owner
          </div>
          <p className="mt-1.5 whitespace-pre-line text-sm">{review.owner_reply}</p>
        </div>
      )}

      {isOwner && (
        <div className="mt-4">
          {editing ? (
            <div className="space-y-2">
              <Textarea
                value={reply}
                onChange={(e) => setReply(e.target.value)}
                placeholder="Write a public reply..."
                className="min-h-20"
              />
              <div className="flex gap-2">
                <Button size="sm" onClick={() => saveReply.mutate()}>
                  Save reply
                </Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>
                  Cancel
                </Button>
              </div>
            </div>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => setEditing(true)}
            >
              {review.owner_reply ? "Edit reply" : "Reply as owner"}
            </Button>
          )}
        </div>
      )}
    </li>
  );
}
