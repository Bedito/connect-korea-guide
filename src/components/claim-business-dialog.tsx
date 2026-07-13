import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { BadgeCheck } from "lucide-react";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export function ClaimBusinessDialog({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in first");
      const { error } = await supabase.from("business_claims").upsert(
        {
          business_id: businessId,
          user_id: user.id,
          message: message.trim() || null,
          proof_url: proofUrl.trim() || null,
          status: "pending",
        },
        { onConflict: "business_id,user_id" },
      );
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Claim submitted — an admin will review it shortly.");
      setOpen(false);
    },
    onError: (e: Error) => toast(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BadgeCheck className="mr-1.5 h-4 w-4" /> Claim this business
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Claim {businessName}</DialogTitle>
          <DialogDescription>
            Tell us how you're affiliated with this business. Our team will verify before granting owner access.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <p className="text-sm text-muted-foreground">
            Please{" "}
            <Link to="/auth" className="underline underline-offset-4">
              sign in
            </Link>{" "}
            to submit a claim.
          </p>
        ) : (
          <div className="space-y-3">
            <div className="space-y-1.5">
              <Label htmlFor="msg">Your role & context</Label>
              <Textarea
                id="msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="e.g. I'm the owner / manager. Contact me at ..."
                className="min-h-24"
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="proof">Proof link (optional)</Label>
              <Input
                id="proof"
                value={proofUrl}
                onChange={(e) => setProofUrl(e.target.value)}
                placeholder="Business website, LinkedIn, invoice, etc."
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => submit.mutate()} disabled={!user || submit.isPending}>
            {submit.isPending ? "Submitting..." : "Submit claim"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
