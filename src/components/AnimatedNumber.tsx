import React, { useRef } from 'react';
import { useInView, useReducedMotion } from 'motion/react';
import NumberFlow from '@number-flow/react';

interface AnimatedNumberProps {
  value: number;
  suffix?: string;
  prefix?: string;
  className?: string;
}

/** Counts up once the value scrolls into view. */
export const AnimatedNumber: React.FC<AnimatedNumberProps> = ({
  value,
  suffix,
  prefix,
  className,
}) => {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();

  return (
    <span ref={ref} className={className}>
      <NumberFlow
        value={reduce || inView ? value : 0}
        locales="fr-FR"
        suffix={suffix}
        prefix={prefix}
      />
    </span>
  );
};
