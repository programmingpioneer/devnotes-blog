import { cn } from "@/lib/utils";

type ContainerProps = {
  children: React.ReactNode;
  className?: string;
  size?: "default" | "wide" | "narrow";
};

const sizes = {
  default: "max-w-5xl",
  wide: "max-w-6xl",
  narrow: "max-w-3xl",
} as const;

export default function Container({
  children,
  className,
  size = "default",
}: ContainerProps) {
  return (
    <div className={cn("mx-auto w-full px-4", sizes[size], className)}>
      {children}
    </div>
  );
}