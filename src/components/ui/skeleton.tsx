import { cn } from "@/lib/utils";

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-redFiredMustard-100",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
