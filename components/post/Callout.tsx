import { cn } from "@/lib/utils";

type CalloutProps = {
  type?: "tip" | "warning" | "note";
  children: React.ReactNode;
};

const styles = {
  tip: "border-l-accent bg-accent/5",
  warning: "border-l-amber-500 bg-amber-500/5",
  note: "border-l-border bg-muted/5",
} as const;

const labels = {
  tip: "Tip",
  warning: "Warning",
  note: "Note",
} as const;

export default function Callout({ type = "note", children }: CalloutProps) {
  return (
    <aside
      className={cn(
        "my-6 rounded-r-md border-l-2 px-4 py-3 text-sm",
        styles[type]
      )}
    >
      <p className="mb-1 font-semibold">{labels[type]}</p>
      <div className="text-muted [&>p]:m-0">{children}</div>
    </aside>
  );
}