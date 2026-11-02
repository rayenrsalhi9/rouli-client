import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, ShieldCheck, Flash, Check } from 'iconoir-react';
import { STATS } from '../data/mockData';
import { Stagger } from './Reveal';
import { Magnetic } from './Magnetic';
import { itemVariants } from '../lib/motion';

export const FinalCta: React.FC = () => {
  return (
    <section className="w-full bg-black text-white py-24 sm:py-32">
      <Stagger className="max-w-narrow w-full mx-auto px-4 md:px-6 text-center flex flex-col items-center">
        
        {/* Kicker */}
        <motion.span
          variants={itemVariants}
          className="text-xs font-semibold uppercase tracking-label text-brand mb-4"
        >
          PASSEZ À LA VITESSE SUPÉRIEURE
        </motion.span>

        {/* Heading */}
        <motion.h2
          variants={itemVariants}
          className="text-3xl sm:text-5xl font-semibold text-white leading-[1.07] tracking-[-0.015em]"
        >
          Réservez votre vélo ou votre trottinette dès aujourd'hui.
        </motion.h2>

        {/* Subtitle */}
        <motion.p
          variants={itemVariants}
          className="text-base sm:text-lg text-white/70 max-w-[620px] mt-4 leading-[1.47]"
        >
          Rejoignez plus de {STATS.activeUsers.toLocaleString('fr-FR')} usagers qui ont déjà troqué les bouchons et le stress contre la liberté à Monastir. Votre réservation est garantie sans frais immédiats.
        </motion.p>

        {/* Action Buttons */}
        <motion.div
          variants={itemVariants}
          className="mt-8 flex flex-wrap items-center justify-center gap-4"
        >
          <Magnetic className="inline-flex">
            <Link
              to="/#section-hero-search"
              className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-brand-on font-semibold text-sm sm:text-base px-8 py-3.5 rounded-full transition-colors active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              <span>Réserver un véhicule</span>
              <ArrowRight className="w-4 h-4" aria-hidden="true" />
            </Link>
          </Magnetic>

          <Link
            to="/signup"
            className="inline-flex items-center justify-center bg-transparent border border-white/40 hover:border-white text-white font-semibold text-sm sm:text-base px-7 py-3.5 rounded-full transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
          >
            Créer un compte en 2 min
          </Link>
        </motion.div>

        {/* Trust bullets */}
        <motion.div
          variants={itemVariants}
          className="mt-12 pt-8 border-t border-white/15 flex flex-wrap items-center justify-center gap-6 text-xs text-white/60"
        >
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-brand" aria-hidden="true" />
            <span>Sans engagement de durée</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-brand" />
            <span>Assurance tous risques incluse</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Check className="w-4 h-4 text-brand" />
            <span>Assistance réactive 7j/7</span>
          </div>
        </motion.div>

      </Stagger>
    </section>
  );
};
