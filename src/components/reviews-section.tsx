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
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { StarRating } from "@/components/star-rating";
import { toast } from "sonner";
import { formatDistanceToNow } from "date-fns";
import { Trash2 } from "lucide-react";

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

  useEffect(() => {
    if (mine) {
      setRating(mine.rating);
      setTitle(mine.title ?? "");
      setBody(mine.body);
    }
  }, [mine]);

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["reviews", "business", businessId] });
    qc.invalidateQueries({ queryKey: ["reviews", "mine", businessId] });
    qc.invalidateQueries({ queryKey: ["business", businessId] });
  };

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
          <div className="mt-3 flex gap-2">
            <Button onClick={() => submit.mutate()} disabled={submit.isPending}>
              {submit.isPending ? "Saving..." : mine ? "Update review" : "Post review"}
            </Button>
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
