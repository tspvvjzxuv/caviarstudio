import type { ReactNode, Ref } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Kicker, Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

const frameVariants = cva("scroll-mt-[calc(var(--header-h)+0.75rem)]", {
  variants: {
    density: {
      default: "py-[clamp(4.5rem,11vw,8.25rem)]",
      compact: "py-[clamp(3rem,8vw,5.5rem)]",
    },
  },
  defaultVariants: { density: "default" },
});

function Frame({
  id,
  children,
  className,
  density,
  ref,
}: {
  id: string;
  children: ReactNode;
  className?: string;
  ref?: Ref<HTMLElement>;
} & VariantProps<typeof frameVariants>) {
  return (
    <section id={id} ref={ref} className={cn(frameVariants({ density }), className)}>
      {children}
    </section>
  );
}

function Body({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-[min(1120px,calc(100%-2*clamp(1.25rem,5vw,5rem)))]", className)}>
      {children}
    </div>
  );
}

function Wide({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("mx-auto w-[min(1360px,calc(100%-2*clamp(1.25rem,5vw,5rem)))]", className)}>
      {children}
    </div>
  );
}

export function ChromeHeading({
  as: Tag = "h2",
  className,
  children,
}: {
  as?: "h2" | "h3";
  className?: string;
  children: ReactNode;
}) {
  return (
    <Tag className={className}>
      <span className="chrome-bloom" aria-hidden="true">
        {children}
      </span>
      <span className="chrome-fill">{children}</span>
    </Tag>
  );
}

function Heading({
  kicker,
  title,
  children,
  className,
}: {
  kicker?: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("grid gap-4 overflow-visible", className)}>
      {kicker ? <Kicker>{kicker}</Kicker> : null}
      <ChromeHeading as="h2" className="section-title">
        {title}
      </ChromeHeading>
      {children}
    </Reveal>
  );
}

export const Section = {
  Frame,
  Body,
  Wide,
  Heading,
};
