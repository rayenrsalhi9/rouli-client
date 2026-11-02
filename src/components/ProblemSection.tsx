import React from "react";
import { ArrowRight, Bus, Clock, Coins } from "iconoir-react";
import { motion } from "motion/react";
import { Stagger } from "./Reveal";
import { itemVariants } from "../lib/motion";

interface ProblemSectionProps {
  onDiscoverSolution: () => void;
}

const CHALLENGES = [
  {
    icon: Clock,
    metric: "45 minutes",
    title: "Perdues chaque jour aux heures de pointe",
    description:
      "Bloqué entre le rond-point des dauphins, l’entrée de Skanes et le centre-ville. Rouler au ralenti sous le soleil transforme chaque trajet en épreuve de patience.",
    footer: "Axe Skanes · Centre-Ville · Facultés",
  },
  {
    icon: Coins,
    metric: "1\u202F850\u00A0DT / an",
    title: "Gaspillés en carburant et frais de parking",
    description:
      "Les pleins d’essence qui s’envolent, les parkings payants de la Marina et du port en été, l’entretien et l’usure mécanique dans les embouteillages.",
    footer: "Dépense moyenne d’un conducteur à Monastir",
  },
  {
    icon: Bus,
    metric: "Attente & chaleur",
    title: "La dépendance aux taxis et louages bondés",
    description:
      "Espérer un taxi disponible aux heures de sortie, voyager serré sous 35\u00A0°C et subir les arrêts incessants sans aucune maîtrise de son horaire d’arrivée.",
    footer: "Stress quotidien évitable",
  },
];

export const ProblemSection: React.FC<ProblemSectionProps> = ({
  onDiscoverSolution,
}) => {
  return (
    <section
      data-slot="problem"
      aria-labelledby="problem-title"
      className="flex w-full flex-col justify-center gap-12 bg-surface-wash px-4 py-20 sm:py-24 md:px-6"
    >
      <Stagger className="mx-auto flex w-full max-w-page flex-col gap-12">
        <div className="mx-auto flex max-w-[760px] flex-col gap-4 text-center">
          <motion.span
            variants={itemVariants}
            className="mx-auto inline-flex items-center rounded-full bg-neutral-100 px-3.5 py-0.5 text-xs font-bold uppercase tracking-label text-neutral-600"
          >
            Le problème
          </motion.span>
          <motion.h2
            variants={itemVariants}
            id="problem-title"
            className="text-balance text-3xl leading-display tracking-tight text-neutral-900 sm:text-4xl md:text-display"
          >
            Ce que vous coûtent vos déplacements à Monastir{" "}
            <span className="text-neutral-500">sans Rouli</span>
          </motion.h2>
          <motion.p
            variants={itemVariants}
            className="mx-auto max-w-[680px] text-body leading-[1.47] text-neutral-600"
          >
            Bouchons sur l’avenue Habib Bourguiba, stationnement introuvable
            autour de la Marina, attente sous la chaleur : le moindre trajet
            peut vite coûter du temps, de l’argent et de l’énergie.
          </motion.p>
        </div>

        <div className="grid w-full grid-cols-1 gap-5 md:grid-cols-3">
          {CHALLENGES.map((challenge) => {
            const Icon = challenge.icon;
            return (
              <motion.div
                key={challenge.title}
                variants={itemVariants}
                className="group relative flex flex-col items-center gap-6 overflow-hidden rounded-3xl border border-black/5 bg-white px-6 pb-8 pt-10 text-center transition-colors hover:border-brand/40 sm:px-7"
              >
                <div className="relative mx-auto flex size-32 items-center justify-center rounded-full border border-border bg-white text-brand-ink before:absolute before:-inset-2 before:rounded-full before:border before:border-border/60">
                  <div
                    aria-hidden="true"
                    className="absolute inset-0 z-10 scale-125 rounded-full bg-radial from-brand-ink/20 via-brand-ink/5 to-transparent blur-xl"
                  />
                  <Icon
                    className="relative z-20 size-14"
                    strokeWidth={1}
                    aria-hidden="true"
                  />
                </div>

                <div className="flex w-full flex-col gap-2">
                  <p className="text-2xl font-semibold tabular-nums text-neutral-900">
                    {challenge.metric}
                  </p>
                  <h3 className="text-base font-bold text-neutral-900">
                    {challenge.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-neutral-600">
                    {challenge.description}
                  </p>
                </div>

                <div className="mt-auto w-full border-t border-neutral-100 pt-4 text-xs font-medium text-neutral-500">
                  {challenge.footer}
                </div>
              </motion.div>
            );
          })}
        </div>

        <motion.div variants={itemVariants} className="flex justify-center">
          <button
            type="button"
            onClick={onDiscoverSolution}
            className="group inline-flex items-center gap-2 rounded text-xs font-bold text-neutral-900 transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink sm:text-sm"
          >
            <span>Découvrir la solution Rouli</span>
            <ArrowRight
              className="size-4 text-brand-ink transition-transform group-hover:translate-x-1"
              aria-hidden="true"
            />
          </button>
        </motion.div>
      </Stagger>
    </section>
  );
};
