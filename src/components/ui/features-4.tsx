import {
  BatteryCharging,
  CalendarCheck,
  MapPin,
  SmartphoneDevice,
  Wallet,
  XmarkCircle,
} from "iconoir-react";
import { motion } from "motion/react";
import { Stagger } from "@/components/Reveal";
import { itemVariants, sectionVariants } from "@/lib/motion";

const FEATURES = [
  {
    icon: CalendarCheck,
    title: "Disponibilité en direct",
    description:
      "Voyez en direct où votre vélo ou votre trottinette est disponible, aux dates de votre choix.",
  },
  {
    icon: Wallet,
    title: "Réservation sans avance",
    description:
      "Bloquez votre véhicule en ligne sans sortir votre carte bancaire. Vous payez directement en agence lors du retrait.",
  },
  {
    icon: SmartphoneDevice,
    title: "Coupon digital immédiat",
    description:
      "Recevez votre confirmation instantanée avec votre coupon de réservation sur smartphone, prêt à être scanné.",
  },
  {
    icon: BatteryCharging,
    title: "Véhicule prêt & rechargé",
    description:
      "À votre arrivée, votre véhicule vous attend déjà préparé, vérifié par nos équipes avec la batterie à 100 %.",
  },
  {
    icon: XmarkCircle,
    title: "Annulation 100% gratuite",
    description:
      "Annulez en un clic tant que le véhicule ne vous a pas été remis.",
  },
  {
    icon: MapPin,
    title: "Réseau d'agences locales",
    description:
      "Retirez votre véhicule dans l'agence de votre choix à Monastir (Skanes, Centre, Marina, Gare) et roulez l'esprit serein.",
  },
];

export function SolutionFeatures() {
  return (
    <section className="py-12 md:py-20">
      <Stagger className="mx-auto max-w-5xl space-y-8 px-6 md:space-y-16">
        <motion.div
          variants={itemVariants}
          className="relative z-10 mx-auto max-w-xl space-y-6 text-center md:space-y-12"
        >
          <h2 className="text-balance text-4xl font-medium text-neutral-900 lg:text-5xl">
            La solution Rouli, pensée pour rouler sans friction.
          </h2>
          <p className="text-neutral-600">
            Voyez ce qui est disponible, réservez sans avance et récupérez votre
            vélo ou trottinette préparé dans l'agence de votre choix.
          </p>
        </motion.div>

        <motion.div
          variants={sectionVariants}
          className="relative mx-auto grid max-w-2xl divide-x divide-y divide-neutral-200 border border-neutral-200 *:p-12 sm:grid-cols-2 lg:max-w-4xl lg:grid-cols-3"
        >
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <motion.div key={title} variants={itemVariants} className="space-y-3">
              <div className="flex items-center gap-2">
                <Icon
                  className="size-4 text-brand-ink"
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <h3 className="text-sm font-medium text-neutral-900">{title}</h3>
              </div>
              <p className="text-sm text-neutral-600">{description}</p>
            </motion.div>
          ))}
        </motion.div>
      </Stagger>
    </section>
  );
}
