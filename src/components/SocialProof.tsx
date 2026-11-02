import React from 'react';
import { motion } from 'motion/react';
import { Stagger } from './Reveal';
import { itemVariants } from '../lib/motion';
import TestimonialMarquee from './ui/marquee-01';

export const SocialProof: React.FC = () => {
  return (
    <section className="w-full bg-white py-20 sm:py-24">
      <Stagger className="max-w-page mx-auto px-4 md:px-6">
        
        {/* Testimonials Heading */}
        <motion.div variants={itemVariants} className="text-center max-w-xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-label text-brand-ink mb-2 block">
            ILS ROULENT À MONASTIR
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900">
            Adopté par les résidents, étudiants et pros de Monastir
          </h2>
        </motion.div>

        {/* Testimonials Marquee */}
        <motion.div variants={itemVariants}>
          <TestimonialMarquee />
        </motion.div>

      </Stagger>
    </section>
  );
};
