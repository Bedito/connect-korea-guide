import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/auth";
import { Link } from "@tanstack/react-router";
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
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Flag } from "lucide-react";
import { toast } from "sonner";

const REASONS = [
  { value: "wrong_info", label: "Incorrect information (name, address, hours…)" },
  { value: "closed", label: "This business is permanently closed" },
  { value: "duplicate", label: "Duplicate listing" },
  { value: "spam", label: "Spam or fake listing" },
  { value: "other", label: "Something else" },
];

export function ReportBusinessDialog({
  businessId,
  businessName,
}: {
  businessId: string;
  businessName: string;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("wrong_info");
  const [details, setDetails] = useState("");

  const submit = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Please sign in to send a report.");
      const trimmed = details.trim().slice(0, 2000);
      const { error } = await supabase.from("reports").insert({
        business_id: businessId,
        user_id: user.id,
        reason,
        details: trimmed || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast("Thanks — our team will review this shortly.");
      setOpen(false);
      setDetails("");
      setReason("wrong_info");
    },
    onError: (e: Error) => toast(e.message),
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="text-muted-foreground">
          <Flag className="mr-1.5 h-4 w-4" /> Report incorrect info
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Report an issue</DialogTitle>
          <DialogDescription>
            Help us keep {businessName} accurate. Reports are reviewed by our team.
          </DialogDescription>
        </DialogHeader>

        {!user ? (
          <div className="rounded-xl border border-dashed border-border/70 p-6 text-center text-sm text-muted-foreground">
            <Link to="/auth" className="underline underline-offset-4">
              Sign in
            </Link>{" "}
            to submit a report.
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <Label className="text-sm">What's wrong?</Label>
              <RadioGroup value={reason} onValueChange={setReason} className="mt-2 space-y-2">
                {REASONS.map((r) => (
                  <div key={r.value} className="flex items-center gap-2">
                    <RadioGroupItem id={`r-${r.value}`} value={r.value} />
                    <Label htmlFor={`r-${r.value}`} className="text-sm font-normal">
                      {r.label}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>
            <div>
              <Label htmlFor="report-details" className="text-sm">
                Details (optional)
              </Label>
              <Textarea
                id="report-details"
                className="mt-2 min-h-24"
                placeholder="Add any specifics that help us verify…"
                value={details}
                maxLength={2000}
                onChange={(e) => setDetails(e.target.value)}
              />
            </div>
          </div>
        )}

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => submit.mutate()}
            disabled={!user || submit.isPending}
          >
            {submit.isPending ? "Sending…" : "Submit report"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
