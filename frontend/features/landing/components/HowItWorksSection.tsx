"use client";

import type React from "react";
import { Layers, Search, Zap } from "lucide-react";

import { cn } from "@/lib/utils/cn";

type HowItWorksProps = React.HTMLAttributes<HTMLElement>;

interface StepCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  benefits: string[];
}

const StepCard: React.FC<StepCardProps> = ({
  icon,
  title,
  description,
  benefits,
}) => (
  <div
    className={cn(
      "relative rounded-2xl border bg-card p-6 text-card-foreground transition-all duration-300 ease-in-out",
      "hover:scale-105 hover:border-[var(--color-amethyst-accent)] hover:bg-[var(--color-cloud-canvas)] hover:shadow-lg",
    )}
  >
    <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg border border-[var(--color-amethyst-accent)] bg-[var(--color-amethyst-accent)] text-[var(--color-ink-text)]">
      {icon}
    </div>
    <h3 className="mb-2 text-xl font-semibold">{title}</h3>
    <p className="mb-6 text-muted-foreground">{description}</p>
    <ul className="space-y-3">
      {benefits.map((benefit, index) => (
        <li key={index} className="flex items-center gap-3">
          <div className="flex h-4 w-4 flex-shrink-0 items-center justify-center rounded-full bg-[var(--color-sky-blue-highlight)] ring-1 ring-[var(--color-ink-text)]/10">
            <div className="h-2 w-2 rounded-full bg-[var(--color-ink-text)]" />
          </div>
          <span className="text-muted-foreground">{benefit}</span>
        </li>
      ))}
    </ul>
  </div>
);

export const HowItWorksSection: React.FC<HowItWorksProps> = ({
  className,
  ...props
}) => {
  const stepsData = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Enter your query",
      description:
        "Enter part name or article number, and we'll instantly check availability across thousands of stores.",
      benefits: [
        "Smart search understands even imprecise queries",
        "Automatic city detection",
        "Search history for quick access",
      ],
    },
    {
      icon: <Layers className="h-6 w-6" />,
      title: "Choose the best offer",
      description:
        "Compare prices, location and availability, choose the optimal option.",
      benefits: [
        "Sort by price, distance and rating",
        "Filter by availability and manufacturer",
        "Detailed information about each offer",
      ],
    },
    {
      icon: <Zap className="h-6 w-6" />,
      title: "Contact the store",
      description:
        "Call the store directly or request a callback through our service.",
      benefits: [
        "Direct contact without intermediaries",
        "Parts reservation capability",
        "Route building to store",
      ],
    },
  ];

  return (
    <section
      id="how-it-works"
      className={cn("w-full bg-background py-16 sm:py-24", className)}
      {...props}
    >
      <div className="container mx-auto px-4">
        <div className="mx-auto mb-16 max-w-4xl text-center">
          <h2 className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            How it works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Our service uses advanced technologies for instant auto parts search
            across thousands of stores in your city
          </p>
        </div>

        <div className="relative mx-auto mb-8 w-full max-w-4xl">
          <div
            aria-hidden="true"
            className="absolute left-[16.6667%] top-1/2 h-0.5 w-[66.6667%] -translate-y-1/2 bg-border"
          />
          <div className="relative grid grid-cols-3">
            {stepsData.map((_, index) => (
              <div
                key={index}
                className="flex h-9 w-9 items-center justify-center justify-self-center rounded-full border border-[var(--color-ink-text)] bg-[var(--color-amethyst-accent)] font-semibold text-[var(--color-ink-text)] shadow-[var(--shadow-subtle)] ring-4 ring-background"
              >
                {index + 1}
              </div>
            ))}
          </div>
        </div>

        <div className="mx-auto grid max-w-4xl grid-cols-1 gap-8 md:grid-cols-3">
          {stepsData.map((step, index) => (
            <StepCard
              key={index}
              icon={step.icon}
              title={step.title}
              description={step.description}
              benefits={step.benefits}
            />
          ))}
        </div>
      </div>
    </section>
  );
};
