import React from 'react';
import { motion } from 'motion/react';
import HowItWorksCards, { type Step } from './ui/how-it-works';
import { Stagger } from './Reveal';
import { itemVariants } from '../lib/motion';

const brandColors = {
  bg: 'bg-brand/10',
  text: 'text-brand-ink',
  border: 'border-brand/20',
};

const steps: Step[] = [
  {
    title: 'Choisissez votre véhicule',
    description:
      'Sélectionnez un vélo ou une trottinette, une agence et vos dates (de 1 à 7 jours).',
    colors: brandColors,
  },
  {
    title: 'Obtenez votre coupon',
    description:
      'Votre réservation est confirmée instantanément avec un coupon digital sécurisé, sans payer d’avance en ligne.',
    colors: brandColors,
  },
  {
    title: 'Passez en agence',
    description:
      'Votre deux-roues électrique vous attend contrôlé, gonflé et batterie pleine à l’agence de votre choix.',
    colors: brandColors,
  },
  {
    title: 'Retirez et payez sur place',
    description:
      'Présentez votre coupon, récupérez votre véhicule et payez sur place. Rapportez-le à la fin de votre location.',
    colors: brandColors,
  },
];

export const HowItWorks: React.FC = () => {
  return (
    <section
      id="section-how-it-works"
      className="w-full bg-card"
    >
      <div className="mx-auto max-w-page px-4 pt-16 sm:pt-20 md:px-6">
        <Stagger className="mx-auto flex max-w-[760px] flex-col items-center text-center">
          <motion.span
            variants={itemVariants}
            className="mb-2 text-xs font-bold uppercase tracking-label text-brand-ink"
          >
            SIMPLICITÉ ABSOLUE
          </motion.span>
          <motion.h2
            variants={itemVariants}
            className="text-3xl font-bold leading-display tracking-tight text-neutral-900 sm:text-4xl md:text-display"
          >
            Comment ça marche : votre trajet en 4 étapes
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mt-3 max-w-[680px] text-body leading-[1.47] text-neutral-600"
          >
            Aucun contrat papier, zéro caution bloquée sur votre compte. Prenez
            le contrôle de vos déplacements en moins de deux minutes.
          </motion.p>
        </Stagger>
      </div>

      <HowItWorksCards features={steps} />
    </section>
  );
};
