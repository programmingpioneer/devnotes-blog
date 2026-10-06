import { cn } from "@/lib/utils";

type ProseProps = {
  children: React.ReactNode;
  className?: string;
};

export default function Prose({ children, className }: ProseProps) {
  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert min-w-0 max-w-none",
        "prose-headings:font-semibold prose-headings:tracking-tight",
        "prose-a:text-accent prose-a:no-underline hover:prose-a:underline",
        "prose-code:rounded prose-code:bg-muted/10 prose-code:px-1 prose-code:py-0.5",
        "prose-code:before:content-none prose-code:after:content-none",
                // Body images render as a framed card: block display + border +
        // soft background + inner padding so the image sits inside a
        // visible "mat", matching the site's card language. Capped at
        // 500px tall and natural width so tall screenshots stay contained.
        "prose-img:block prose-img:rounded-lg",
        "prose-img:border prose-img:border-border prose-img:bg-muted/5",
        "prose-img:p-2 prose-img:shadow-soft-sm",
        "prose-img:mx-auto prose-img:w-auto prose-img:max-w-full",
        "prose-img:max-h-125 prose-img:h-auto",
        className
      )}
    >
      {children}
    </div>
  );
}