import type { ReactNode } from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { Kicker, Reveal } from "@/components/reveal";
import { cn } from "@/lib/utils";

const frameVariants = cva("scroll-mt-20", {
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
}: {
  id: string;
  children: ReactNode;
  className?: string;
} & VariantProps<typeof frameVariants>) {
  return (
    <section id={id} className={cn(frameVariants({ density }), className)}>
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

function Heading({
  kicker,
  title,
  children,
  className,
}: {
  kicker: ReactNode;
  title: ReactNode;
  children?: ReactNode;
  className?: string;
}) {
  return (
    <Reveal className={cn("grid gap-4", className)}>
      <Kicker>{kicker}</Kicker>
      <h2 className="font-serif text-[clamp(2.2rem,5.6vw,4.4rem)] leading-[1.04] tracking-[-0.025em]">{title}</h2>
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
