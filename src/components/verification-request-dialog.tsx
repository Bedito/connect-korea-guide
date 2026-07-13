import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { uploadVerificationDoc } from "@/lib/storage";
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
import { Badge } from "@/components/ui/badge";
import { BadgeCheck, ShieldCheck, Upload, X } from "lucide-react";
import { toast } from "sonner";

export function VerificationRequestDialog({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [proofUrl, setProofUrl] = useState("");

  const { data: existing } = useQuery({
    queryKey: ["verification-request", businessId, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("business_claims")
        .select("id, status")
        .eq("business_id", businessId)
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
  });

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
      toast("Verification request submitted — an admin will review shortly.");
      qc.invalidateQueries({ queryKey: ["verification-request", businessId] });
      setOpen(false);
    },
    onError: (e: Error) => toast(e.message),
  });

  if (existing?.status === "pending") {
    return (
      <Badge variant="outline" className="gap-1">
        <ShieldCheck className="h-3 w-3" /> Verification pending
      </Badge>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <BadgeCheck className="mr-1.5 h-4 w-4" /> Request verification
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Verify {businessName}</DialogTitle>
          <DialogDescription>
            Verified businesses get a badge and rank higher in search results. Share proof of
            ownership so our team can review — a business registration, invoice, or a website
            with matching contact details all work.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label htmlFor="vmsg">Notes for the reviewer</Label>
            <Textarea
              id="vmsg"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="e.g. I'm the founder. Attached is our business registration."
              className="min-h-24"
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="vproof">Proof link</Label>
            <Input
              id="vproof"
              value={proofUrl}
              onChange={(e) => setProofUrl(e.target.value)}
              placeholder="Link to document, website, or social profile"
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={() => submit.mutate()} disabled={!user || submit.isPending}>
            {submit.isPending ? "Submitting..." : "Submit request"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
