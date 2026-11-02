"use client";

import React, { useRef } from "react";
import { motion, useReducedMotion, useScroll, useSpring } from "motion/react";

interface CardProps {
  number: string;
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  className?: string;
  rotate?: string;
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

const Pin = ({ className }: { className?: string }) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="currentColor"
    className={className}
    aria-hidden="true"
  >
    <path stroke="none" d="M0 0h24v24H0z" fill="none" />
    <path d="M16 3a1 1 0 0 1 .117 1.993l-.117 .007v4.764l1.894 3.789a1 1 0 0 1 .1 .331l.006 .116v2a1 1 0 0 1 -.883 .993l-.117 .007h-4v4a1 1 0 0 1 -1.993 .117l-.007 -.117v-4h-4a1 1 0 0 1 -.993 -.883l-.007 -.117v-2a1 1 0 0 1 .06 -.34l.046 -.107l1.894 -3.791v-4.762a1 1 0 0 1 -.117 -1.993l.117 -.007h8z" />
  </svg>
);

const Card = ({
  number,
  title,
  description,
  colorTheme = "blue",
  className,
  rotate,
  colors: customColors,
}: CardProps) => {
  const defaultBgColors = {
    orange: "bg-orange-50",
    blue: "bg-blue-50",
    purple: "bg-purple-50",
  };
  const defaultTextColors = {
    orange: "text-orange-500",
    blue: "text-blue-600",
    purple: "text-purple-600",
  };
  const defaultBorderColors = {
    orange: "border-orange-100",
    blue: "border-blue-100",
    purple: "border-purple-100",
  };

  const bgColor = customColors?.bg || defaultBgColors[colorTheme];
  const textColor = customColors?.text || defaultTextColors[colorTheme];
  const borderColor = customColors?.border || defaultBorderColors[colorTheme];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className={`relative w-full md:w-[280px] transition-transform duration-300 hover:z-30 hover:scale-105 motion-reduce:transition-none motion-reduce:hover:scale-100 ${rotate} ${className}`}
    >
      <div className="rounded-[25px] border border-neutral-100 bg-white p-2 shadow-[0px_10px_20px_0px_#D3D3D3]">
        <Pin className={`mx-auto mb-6 h-8 w-8 ${textColor}`} />
        <div
          className={`${bgColor} relative flex h-full flex-col overflow-hidden rounded-[15px] border p-[15px] ${borderColor}`}
        >
          <span
            className={`${textColor} mb-5 font-display text-4xl font-semibold`}
          >
            {number}
          </span>
          <h3 className="mb-[10px] text-2xl font-semibold leading-none text-neutral-800">
            {title}
          </h3>
          <p className="text-sm/5 tracking-tight text-neutral-500">
            {description}
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export interface Step {
  title: string;
  description: string;
  colorTheme?: "orange" | "blue" | "purple";
  colors?: {
    bg: string;
    text: string;
    border: string;
  };
}

export interface StepPosition {
  className?: string;
  rotate?: string;
}

export interface HowItWorksProps {
  features?: Step[];
  className?: string;
  stepPositions?: StepPosition[];
}

const DEFAULT_CARD_POSITIONS: StepPosition[] = [
  { className: "md:absolute md:top-0 md:left-[15%]", rotate: "md:rotate-8" },
  {
    className: "md:absolute md:top-[120px] md:right-[15%]",
    rotate: "md:-rotate-8",
  },
  { className: "md:absolute md:top-[450px] md:left-[15%]", rotate: "md:rotate-8" },
  {
    className: "md:absolute md:top-[570px] md:right-[10%]",
    rotate: "md:-rotate-8",
  },
  { className: "md:absolute md:top-[850px] md:left-[15%]", rotate: "md:rotate-8" },
];

export default function HowItWorks({
  features,
  className,
  stepPositions,
}: HowItWorksProps) {
  const defaultFeatures: Step[] = [
    {
      title: "Create Account",
      description:
        "Sign up in minutes. Enter your details and verify your email to get started.",
      colorTheme: "orange",
    },
    {
      title: "Verify Identity",
      description:
        "Complete your profile verification to ensure secure transactions and compliance.",
      colorTheme: "blue",
    },
    {
      title: "Select Plan",
      description:
        "Choose from a variety of investment plans tailored to your financial goals.",
      colorTheme: "purple",
    },
    {
      title: "Analyze & Invest",
      description:
        "Review returns and make your first investment with confidence.",
      colorTheme: "orange",
    },
    {
      title: "Track Growth",
      description:
        "Monitor your portfolio in real-time and watch your wealth grow over time.",
      colorTheme: "blue",
    },
  ];

  const data = features && features.length > 0 ? features : defaultFeatures;
  const positions = stepPositions || DEFAULT_CARD_POSITIONS;

  let height = 1130;
  if (data.length === 1) height = 400;
  else if (data.length === 2) height = 450;
  else if (data.length === 3) height = 800;
  else if (data.length === 4) height = 900;
  else height = 1130;

  const pathD = data.reduce((acc, _, index) => {
    if (index >= data.length - 1) return acc;
    if (index === 0) return "M 290 150 C 500 150, 550 270, 710 270";
    if (index === 1) return acc + " C 850 270, 500 350, 290 450";
    if (index === 2) return acc + " C 290 600, 550 720, 750 720";
    if (index === 3) return acc + " C 950 720, 500 800, 290 850";
    return acc;
  }, "");

  const sectionRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start 80%", "end 55%"],
  });
  const drawn = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 26,
    restDelta: 0.001,
  });

  return (
    <div
      ref={sectionRef}
      className={`relative overflow-x-clip bg-white px-8 max-md:pt-10 max-md:pb-25 md:py-20 ${className ?? ""}`}
    >
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.08]"
          style={{
            backgroundImage: "linear-gradient(#000 1px, transparent 1px)",
            backgroundSize: "100% 32px",
            marginTop: "4px",
          }}
          aria-hidden="true"
        />
        <div className="pointer-events-none absolute inset-y-0 left-0 w-1/2 bg-linear-to-r from-background" />
        <div className="pointer-events-none absolute inset-y-0 right-0 w-1/2 bg-linear-to-l from-background" />

        <div className="relative z-10 mx-auto max-w-6xl">
          <div
            className="relative mx-auto flex h-auto w-full max-w-[1000px] flex-col space-y-8 md:block md:h-[var(--md-height)] md:space-y-0"
            style={{ "--md-height": `${height}px` } as React.CSSProperties}
          >
            {data.length > 1 && (
              <svg
                className="pointer-events-none absolute left-0 top-0 z-0 hidden h-full w-full md:block"
                viewBox={`0 0 1000 ${height}`}
                preserveAspectRatio="none"
                aria-hidden="true"
              >
                <path
                  d={pathD}
                  stroke="currentColor"
                  className="text-neutral-200"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                />
                <motion.path
                  d={pathD}
                  stroke="currentColor"
                  className="text-brand-ink"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  vectorEffect="non-scaling-stroke"
                  style={{ pathLength: reduce ? 1 : drawn }}
                />
              </svg>
            )}

            {data.map((step, index) => {
              const position = positions[index % positions.length];

              return (
                <Card
                  key={step.title}
                  number={`0${index + 1}`}
                  title={step.title}
                  description={step.description}
                  colorTheme={step.colorTheme || "blue"}
                  colors={step.colors}
                  rotate={position.rotate}
                  className={position.className}
                />
              );
            })}
          </div>
        </div>
      </div>
  );
}
