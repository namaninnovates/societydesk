import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { ImageSquare, SpinnerGap, X } from "@phosphor-icons/react";
import { useState } from "react";
import { toast } from "sonner";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { createComplaintServerFn } from "@/lib/complaints.functions";
import { CATEGORIES, compressImage } from "@/lib/societydesk";

export const Route = createFileRoute("/_authenticated/complaints/new")({
  head: () => ({
    meta: [
      { title: "Raise a Complaint — SocietyDesk" },
      { name: "description", content: "Report a maintenance issue with photos and location." },
      { property: "og:title", content: "Raise a Complaint — SocietyDesk" },
      { property: "og:description", content: "Report a society maintenance issue in seconds." },
    ],
  }),
  component: NewComplaint,
});

const schema = z.object({
  category: z.string().min(1, "Pick a category"),
  title: z.string().trim().min(4, "Give a short title").max(120),
  description: z.string().trim().min(10, "Describe the issue").max(2000),
  location: z.string().trim().max(120).optional(),
});

function NewComplaint() {
  const { profile } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("");
  const [busy, setBusy] = useState(false);

  const addFiles = (list: FileList | null) => {
    if (!list) return;
    const next = [...files, ...Array.from(list).filter((f) => f.type.startsWith("image/"))].slice(
      0,
      3,
    );
    setFiles(next);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    const parsed = schema.safeParse({
      category,
      title: form.get("title"),
      description: form.get("description"),
      location: form.get("location"),
    });
    if (!parsed.success) {
      toast.error(parsed.error.issues[0]?.message ?? "Please check the form");
      return;
    }
    if (!profile?.id) {
      toast.error("You must be logged in to raise a complaint");
      return;
    }

    setBusy(true);
    const photoDataUrls: string[] = [];

    for (const file of files) {
      try {
        const blob = await compressImage(file);
        const reader = new FileReader();
        const dataUrl = await new Promise<string>((resolve, reject) => {
          reader.onload = () => resolve(reader.result as string);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });
        photoDataUrls.push(dataUrl);
      } catch {
        toast.error("One photo could not be uploaded");
      }
    }

    try {
      const res = await createComplaintServerFn({
        data: {
          residentId: profile.id,
          category: parsed.data.category,
          title: parsed.data.title,
          description: parsed.data.description,
          location: parsed.data.location || undefined,
          photos: photoDataUrls,
        },
      });

      queryClient.invalidateQueries({ queryKey: ["complaints"] });
      setBusy(false);
      toast.success("Complaint raised");
      navigate({ to: "/complaints/$id", params: { id: res.id } });
    } catch (err: any) {
      setBusy(false);
      toast.error(err?.message ?? "Could not create complaint");
    }
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Raise a complaint</h1>
        <p className="text-sm text-muted-foreground">
          Add a photo where you can — it helps the team fix things faster.
        </p>
      </div>

      <form onSubmit={onSubmit} className="surface space-y-5 p-6">
        <div className="space-y-1.5">
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="Select a category" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORIES.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="title">Title</Label>
          <Input id="title" name="title" placeholder="Lift stuck between 4th and 5th" maxLength={120} />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            rows={5}
            maxLength={2000}
            placeholder="What happened, when did it start, who is affected?"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="location">Location in society</Label>
          <Input id="location" name="location" placeholder="Tower B, Lobby" maxLength={120} />
        </div>

        <div className="space-y-2">
          <Label>Photos (up to 3)</Label>
          <label
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              addFiles(e.dataTransfer.files);
            }}
            className="flex cursor-pointer flex-col items-center gap-1.5 rounded-xl border border-dashed border-border bg-muted/40 px-4 py-8 text-center text-sm text-muted-foreground"
          >
            <ImageSquare className="size-5 text-primary" />
            Drag and drop, or tap to choose
            <input
              type="file"
              accept="image/*"
              multiple
              className="hidden"
              onChange={(e) => addFiles(e.target.files)}
            />
          </label>
          {files.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {files.map((f, i) => (
                <div key={`${f.name}-${i}`} className="relative">
                  <img
                    src={URL.createObjectURL(f)}
                    alt=""
                    className="size-20 rounded-lg object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => setFiles(files.filter((_, idx) => idx !== i))}
                    className="absolute -right-2 -top-2 rounded-full bg-foreground p-1 text-background"
                    aria-label="Remove photo"
                  >
                    <X className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <Button type="submit" disabled={busy} className="w-full">
          {busy ? <SpinnerGap className="size-4 animate-spin" /> : null} Submit complaint
        </Button>
      </form>
    </div>
  );
}
