import React from "react";
import { Link } from "react-router-dom";
import { motion } from "motion/react";
import { ArrowRight } from "iconoir-react";
import { CATALOG_BIKES, getVehiclePath } from "../data/mockData";
import { Stagger } from "./Reveal";
import { itemVariants } from "../lib/motion";
import ElegantCarousel, { type CarouselSlide } from "./ui/elegant-carousel";

const nf = new Intl.NumberFormat("fr-FR");

const ACCENTS = ["#00701c", "#2f6b4a", "#356b63", "#4e6a3f", "#3f6279"];

const FEATURED = [...CATALOG_BIKES]
  .sort((a, b) => b.rating - a.rating)
  .slice(0, 5);

const SLIDES: CarouselSlide[] = FEATURED.map((bike, i) => ({
  id: bike.id,
  title: bike.name,
  subtitle: bike.categoryLabel,
  description: bike.description,
  accent: ACCENTS[i % ACCENTS.length],
  imageUrl: bike.image,
  fallbackImage: bike.fallbackImage,
  imageAlt: bike.name,
  imageFit: bike.id === "bike-cowboy-4" ? "contain" : "cover",
  href: getVehiclePath(bike),
  meta: `${nf.format(bike.pricePerDayDT)} DT / jour · ${bike.rangeKm} km d'autonomie`,
  rating: bike.rating,
  reviews: bike.reviewsCount,
  badge: bike.tag,
}));

export const VehicleCarousel: React.FC = () => {
  return (
    <div className="w-full">
      <Stagger className="mx-auto flex w-full flex-col items-center gap-2 pb-8 text-center">
        <motion.span
          variants={itemVariants}
          className="text-xs font-bold uppercase tracking-label text-brand-ink"
        >
          LA FLOTTE ROULI
        </motion.span>
        <motion.h3
          variants={itemVariants}
          className="text-balance text-2xl font-extrabold tracking-tight text-neutral-900 sm:text-3xl"
        >
          Nos meilleures machines, prêtes à partir.
        </motion.h3>
        <motion.p
          variants={itemVariants}
          className="max-w-[560px] text-xs text-neutral-500 sm:text-sm"
        >
          Notre sélection des cinq véhicules les mieux notés de la flotte.
          Faites glisser ou utilisez les flèches pour les parcourir.
        </motion.p>
        <motion.div variants={itemVariants}>
          <Link
            to="/vehicules"
            className="mt-1 inline-flex items-center gap-1.5 rounded-full text-xs font-bold text-brand-ink transition-colors hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
          >
            Voir tous les véhicules
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </motion.div>
      </Stagger>

      <ElegantCarousel slides={SLIDES} />
    </div>
  );
};
