import React, { type ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import {
  itemVariants,
  motionTokens,
  sectionVariants,
  VIEWPORT,
} from '../lib/motion';

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  y?: number;
}

export const Reveal: React.FC<RevealProps> = ({ children, className, delay = 0, y = 16 }) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : { opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={VIEWPORT}
      transition={{
        duration: motionTokens.duration.considered,
        delay,
        ease: [...motionTokens.ease.standard],
      }}
    >
      {children}
    </motion.div>
  );
};

/** A section-level stagger container. Children opt in with `variants={itemVariants}`. */
export const Stagger: React.FC<{ children: ReactNode; className?: string }> = ({
  children,
  className,
}) => {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className={className}
      initial={reduce ? false : 'hidden'}
      whileInView="visible"
      viewport={{ once: true, amount: 'some', margin: '0px 0px -8% 0px' }}
      variants={sectionVariants}
    >
      {children}
    </motion.div>
  );
};

export { itemVariants };
