import {
  Drop,
  Lightning,
  ArrowsDownUp,
  ShieldCheck,
  Sparkle,
  Car,
  Tree,
  Bug,
  Question,
  type Icon,
} from "@phosphor-icons/react";
import type { ComponentType } from "react";

export const CATEGORIES = [
  "Plumbing",
  "Electrical",
  "Elevator",
  "Security",
  "Housekeeping",
  "Parking",
  "Common Area",
  "Pest Control",
  "Other",
] as const;

export type Category = (typeof CATEGORIES)[number];
export type Status = "open" | "in_progress" | "resolved";
export type Priority = "low" | "medium" | "high";

export const CATEGORY_ICONS: Record<string, Icon | ComponentType<{ className?: string }>> = {
  Plumbing: Drop,
  Electrical: Lightning,
  Elevator: ArrowsDownUp,
  Security: ShieldCheck,
  Housekeeping: Sparkle,
  Parking: Car,
  "Common Area": Tree,
  "Pest Control": Bug,
  Other: Question,
};

export const STATUS_LABELS: Record<Status, string> = {
  open: "Open",
  in_progress: "In Progress",
  resolved: "Resolved",
};

export const PRIORITY_LABELS: Record<Priority, string> = {
  low: "Low",
  medium: "Medium",
  high: "High",
};

export function daysOpen(createdAt: string, resolvedAt?: string | null) {
  const end = resolvedAt ? new Date(resolvedAt) : new Date();
  const ms = end.getTime() - new Date(createdAt).getTime();
  return Math.max(0, Math.floor(ms / 86_400_000));
}

/** Compress an image in the browser before upload. */
export async function compressImage(file: File, maxSize = 1400, quality = 0.75): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, maxSize / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  const ctx = canvas.getContext("2d");
  if (!ctx) return file;
  ctx.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, "image/jpeg", quality),
  );
  return blob ?? file;
}
