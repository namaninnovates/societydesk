import { Link } from "@tanstack/react-router";
import { cn } from "@/lib/utils";

export type BrandLogoProps = {
  className?: string | undefined;
  markClassName?: string | undefined;
  textClassName?: string | undefined;
  linkTo?: string | null | undefined;
  variant?: "default" | "sidebar" | "footer" | "mono" | undefined;
};

export function BrandMark({
  className,
  variant = "default",
}: {
  className?: string | undefined;
  variant?: "default" | "sidebar" | "footer" | "mono" | undefined;
}) {
  return (
    <svg
      className={cn(
        "size-7 shrink-0",
        variant === "sidebar"
          ? "text-[#EDF3EA]"
          : variant === "mono"
            ? "text-current"
            : "text-[#1F3622]",
        className,
      )}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path d="M4 24L16 4L22 14L10 24H4Z" fill="currentColor" />
      <path d="M14 28L20 18L28 28H14Z" fill="currentColor" fillOpacity="0.85" />
    </svg>
  );
}

export function BrandLogo({
  className,
  markClassName,
  textClassName,
  linkTo = "/",
  variant = "default",
}: BrandLogoProps) {
  const content = (
    <div className={cn("inline-flex items-center gap-2.5 font-sans select-none", className)}>
      <BrandMark className={markClassName} variant={variant} />
      <span
        className={cn(
          "text-xl font-bold tracking-tight",
          variant === "sidebar"
            ? "text-white"
            : variant === "footer"
              ? "text-slate-900"
              : "text-[#111215]",
          textClassName,
        )}
      >
        societydesk
      </span>
    </div>
  );

  if (linkTo) {
    return (
      <Link to={linkTo} className="inline-flex transition-opacity hover:opacity-90">
        {content}
      </Link>
    );
  }

  return content;
}
