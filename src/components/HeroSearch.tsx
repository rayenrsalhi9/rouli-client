import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import {
  Search,
  MapPin,
  DashboardSpeed,
} from "iconoir-react";
import { ASSETS, AGENCIES_LIST } from "../data/mockData";
import { itemVariants, lineVariants, sectionVariants } from "../lib/motion";

export const HeroSearch: React.FC = () => {
  const navigate = useNavigate();
  const heroRef = useRef<HTMLElement>(null);
  const reduce = useReducedMotion() ?? false;
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const imageY = useTransform(scrollYProgress, [0, 1], ["0%", "6%"]);
  const agencies = AGENCIES_LIST.filter((a) => a.id !== "all");
  const [selectedAgencyId, setSelectedAgencyId] = useState<string>(
    agencies[0]?.id ?? "marina",
  );
  const [vehicleType, setVehicleType] = useState<"all" | "bike" | "scooter">(
    "all",
  );


  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The catalogue is one route: the type and the agency are query params.
    const params = new URLSearchParams({ agency: selectedAgencyId });
    if (vehicleType !== "all") {
      params.set("type", vehicleType);
    }
    navigate(`/vehicules?${params.toString()}`);
  };

  return (
    <section
      ref={heroRef}
      id="section-hero-search"
      className="w-full bg-surface pt-16 md:pt-24 pb-20 flex flex-col items-center"
    >
      <div className="max-w-page w-full mx-auto px-4 md:px-6 flex flex-col items-center text-center">
        {/* Value Proposition Headline for Monastir */}
        <motion.div
          className="flex flex-col items-center max-w-narrow"
          initial={reduce ? false : "hidden"}
          animate="visible"
          variants={sectionVariants}
        >
          <motion.span
            variants={itemVariants}
            className="text-xs font-semibold uppercase tracking-label text-brand-ink mb-4"
          >
            MOBILITÉ ÉLECTRIQUE À MONASTIR
          </motion.span>
          <h1 className="text-4xl sm:text-5xl md:text-display font-semibold text-neutral-900 leading-[1.05] overflow-hidden text-balance">
            <motion.span
              className="block pb-1 -mb-1"
              initial={reduce ? false : "hidden"}
              animate="visible"
              variants={lineVariants}
            >
              Monastir à votre rythme, sans bouchons ni galère de parking.
            </motion.span>
          </h1>
          <motion.p
            variants={itemVariants}
            className="text-base sm:text-lg md:text-subheading text-neutral-600 max-w-[680px] mt-4 leading-[1.3]"
          >
            Réservez votre vélo ou votre trottinette électrique en ligne en 2
            minutes, retirez-le avec votre coupon dans l'agence de votre choix
            et payez sur place.
          </motion.p>
        </motion.div>

        {/* Instant Search Bar */}
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18, scale: 0.985 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{
            type: "spring",
            visualDuration: 0.4,
            bounce: 0,
            delay: 0.18,
          }}
          className="w-full max-w-search mt-10 bg-white rounded-3xl border border-black/5 p-5 sm:p-6"
        >
          <form
            onSubmit={handleSearch}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 items-end text-left"
          >
            {/* 1. Nouveau champ « Type de véhicule » : Tous · Vélo · Trottinette */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="vehicle-type-select"
                className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5"
              >
                <DashboardSpeed
                  className="w-3.5 h-3.5 text-brand-ink"
                  aria-hidden="true"
                />
                <span>Type de véhicule</span>
              </label>
              <div className="relative">
                <select
                  id="vehicle-type-select"
                  value={vehicleType}
                  onChange={(e) =>
                    setVehicleType(e.target.value as "all" | "bike" | "scooter")
                  }
                  className="w-full appearance-none bg-neutral-100 hover:bg-neutral-200/60 text-neutral-900 text-base sm:text-sm font-medium px-3.5 py-3 rounded-xl border border-transparent focus-visible:border-brand-ink focus-visible:bg-white focus-visible:outline-none transition-colors cursor-pointer pr-8"
                >
                  <option value="all">Tous</option>
                  <option value="bike">Vélo</option>
                  <option value="scooter">Trottinette</option>
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 2. Quartier / Agence de Monastir (from API) */}
            <div className="flex flex-col gap-1.5">
              <label
                htmlFor="area-select"
                className="text-xs font-semibold text-neutral-700 flex items-center gap-1.5"
              >
                <MapPin
                  className="w-3.5 h-3.5 text-brand-ink"
                  aria-hidden="true"
                />
                <span>Agence à Monastir</span>
              </label>
              <div className="relative">
                <select
                  id="area-select"
                  value={selectedAgencyId}
                  onChange={(e) => setSelectedAgencyId(e.target.value)}
                  className="w-full appearance-none bg-neutral-100 hover:bg-neutral-200/60 text-neutral-900 text-base sm:text-sm font-medium px-3.5 py-3 rounded-xl border border-transparent focus-visible:border-brand-ink focus-visible:bg-white focus-visible:outline-none transition-colors cursor-pointer pr-8"
                >
                  {agencies.map((agency) => (
                    <option key={agency.id} value={agency.id}>
                      {agency.name} ({agency.postalCode})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* 3. Bouton plein : Rechercher un véhicule */}
            <div>
              <button
                type="submit"
                className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark active:scale-95 text-brand-on font-semibold text-xs sm:text-sm py-3 px-5 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                <Search className="w-4 h-4" aria-hidden="true" />
                <span>Rechercher un véhicule</span>
              </button>
            </div>
          </form>

          {/* Réassurance : « Retrait dans l'agence de votre choix » reste tel quel */}
          <div className="mt-3.5 pt-3 border-t border-neutral-100 flex flex-wrap items-center justify-between gap-3 text-xs text-neutral-500">
            <span className="flex items-center gap-1.5 font-medium text-neutral-700">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Retrait dans l'agence de votre choix
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Réservation gratuite sans paiement immédiat
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-brand"></span>
              Règlement sur place au retrait
            </span>
          </div>
        </motion.div>

        {/* Hero background — a Monastir scene, so it is decorative. */}
        <motion.div
          style={{ y: reduce ? 0 : imageY }}
          className="relative w-full max-w-page mt-10 flex items-center justify-center"
        >
          <motion.div
            initial={reduce ? false : { clipPath: "inset(0 0 100% 0)" }}
            animate={{ clipPath: "inset(0 0 0% 0)" }}
            transition={{
              duration: 0.9,
              delay: 0.24,
              ease: [0.65, 0, 0.35, 1],
            }}
            className="relative w-full aspect-16/10 max-h-[560px] flex items-center justify-center overflow-hidden"
          >
            <motion.img
              src={ASSETS.hero}
              alt=""
              width={1536}
              height={1024}
              referrerPolicy="no-referrer"
              initial={reduce ? false : { scale: 1.06 }}
              animate={{ scale: 1 }}
              transition={{
                duration: 1.2,
                delay: 0.24,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="w-full h-full object-cover pointer-events-none select-none"
              loading="eager"
              fetchPriority="high"
            />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
};
