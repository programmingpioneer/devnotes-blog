import { cn } from "@/lib/utils";

type SectionProps = {
  children: React.ReactNode;
  className?: string;
  id?: string;
};

export default function Section({ children, className, id }: SectionProps) {
  return (
      <section id={id} className={cn("py-10 md:py-20", className)}>
      {children}
    </section>
  );
}