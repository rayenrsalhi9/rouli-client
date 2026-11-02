import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Leaf, Wallet, Flash, ShieldCheck } from 'iconoir-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { SocialProof } from '../components/SocialProof';
import { HowItWorks } from '../components/HowItWorks';
import { FinalCta } from '../components/FinalCta';
import { Stagger } from '../components/Reveal';
import { AnimatedNumber } from '../components/AnimatedNumber';
import { itemVariants, sectionVariants } from '../lib/motion';
import { STATS } from '../data/mockData';

export const AboutPage: React.FC = () => {
  const navigate = useNavigate();

  const values = [
    {
      icon: Leaf,
      title: 'Mobilité décarbonée',
      text: 'Chaque trajet en Rouli remplace un moteur thermique. Nos véhicules sont 100 % électriques, rechargés sur le réseau local.',
    },
    {
      icon: Wallet,
      title: 'Accessible à tous',
      text: 'Des tarifs à l’heure ou à la journée, sans engagement, sans caution bloquée et sans frais cachés.',
    },
    {
      icon: Flash,
      title: 'Simplicité radicale',
      text: 'Réserver prend moins de deux minutes. Aucun contrat papier, aucun débit en ligne : on règle au retrait.',
    },
    {
      icon: ShieldCheck,
      title: 'Sécurité & fiabilité',
      text: 'Chaque véhicule est contrôlé, gonflé et batterie pleine avant votre passage. Assurance tous risques incluse.',
    },
  ];

  return (
    <div className="w-full min-h-screen bg-surface text-ink flex flex-col font-sans selection:bg-brand/20 selection:text-black">
      <Navbar />

      <main id="main" tabIndex={-1} className="w-full pt-nav flex flex-col items-center">
        {/* Hero */}
        <section className="w-full bg-surface">
          <div className="max-w-page w-full mx-auto px-4 md:px-6 py-20 sm:py-28 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <Stagger>
              <motion.span
                variants={itemVariants}
                className="text-xs font-bold uppercase tracking-label text-brand-ink mb-3 block"
              >
                À PROPOS DE ROULI
              </motion.span>
              <motion.h1
                variants={itemVariants}
                className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-neutral-900"
              >
                La mobilité urbaine électrique, pensée pour Monastir.
              </motion.h1>
              <motion.p
                variants={itemVariants}
                className="text-sm sm:text-base text-neutral-600 mt-5 leading-relaxed max-w-[560px]"
              >
                Rouli est né d’un constat simple : se déplacer à Monastir devrait être rapide, abordable et propre.
                Nous mettons à disposition des vélos et trottinettes électriques en location partagée, réservables
                en ligne et à retirer dans nos agences partenaires.
              </motion.p>

              <motion.div
                variants={itemVariants}
                className="mt-8 flex flex-wrap items-center gap-4"
              >
                <Link
                  to="/#section-hero-search"
                  className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-brand-on font-bold text-sm px-7 py-3.5 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] shadow-lg shadow-brand/25 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  <span>Réserver un véhicule</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                <Link
                  to="/contact"
                  className="inline-flex items-center justify-center border border-neutral-300 hover:border-neutral-500 text-neutral-800 font-semibold text-sm px-6 py-3.5 rounded-full transition-colors active:scale-95"
                >
                  Nous contacter
                </Link>
              </motion.div>
            </Stagger>

            <div className="relative">
              <div className="absolute inset-0 bg-brand/10 rounded-[2rem] blur-2xl pointer-events-none" />
              <img
                src="/scooters/segway-ninebot-max-g2.webp"
                alt="Trottinette électrique Segway Ninebot KickScooter Max G2"
                width={1408}
                height={768}
                fetchPriority="high"
                className="relative w-full h-[320px] sm:h-[420px] object-contain drop-shadow-xl"
              />
            </div>
          </div>
        </section>

        {/* Mission / Story */}
        <section className="w-full bg-surface py-20 sm:py-24">
          <Stagger className="max-w-narrow w-full mx-auto px-4 md:px-6">
            <motion.div variants={itemVariants} className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-label text-brand-ink mb-2 block">
                NOTRE MISSION
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900 leading-display">
                Rendre chaque déplacement plus simple, plus vert et plus sûr
              </h2>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              className="grid grid-cols-1 md:grid-cols-3 gap-8"
            >
              <motion.div variants={itemVariants}>
                <h3 className="text-base font-bold text-neutral-900 mb-2">Notre histoire</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Lancé à Monastir, Rouli fédère des agences locales autour d’une flotte partagée. Nous avons
                  commencé avec quelques vélos pour les étudiants et les résidents, avant d’étendre le service
                  aux trottinettes et à la zone touristique.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-base font-bold text-neutral-900 mb-2">Notre approche</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Pas de stationnement sauvage ni d’application opaque : un véhicule, une agence, un coupon
                  digital. Vous savez exactement ce que vous réservez, à quel prix, et où le récupérer.
                </p>
              </motion.div>
              <motion.div variants={itemVariants}>
                <h3 className="text-base font-bold text-neutral-900 mb-2">Notre engagement</h3>
                <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">
                  Réduire le trafic et la pollution en ville tout en soutenant le commerce local. Chaque
                  réservation profite directement aux agences partenaires de Monastir.
                </p>
              </motion.div>
            </motion.div>
          </Stagger>
        </section>

        {/* Values */}
        <section className="w-full bg-white py-20 sm:py-24">
          <Stagger className="max-w-page w-full mx-auto px-4 md:px-6">
            <motion.div variants={itemVariants} className="text-center mb-14">
              <span className="text-xs font-bold uppercase tracking-label text-brand-ink mb-2 block">
                NOS VALEURS
              </span>
              <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-neutral-900">
                Ce qui guide chaque décision chez Rouli
              </h2>
            </motion.div>

            <motion.div
              variants={sectionVariants}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5"
            >
              {values.map((v) => {
                const Icon = v.icon;
                return (
                  <motion.div
                    key={v.title}
                    variants={itemVariants}
                    className="bg-surface rounded-3xl p-6 border border-black/5 hover:border-brand/40 transition-colors group"
                  >
                    <div className="w-11 h-11 rounded-full bg-surface-brand text-brand-ink flex items-center justify-center mb-5 group-hover:bg-brand group-hover:text-brand-on transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <h3 className="text-base font-bold text-neutral-900 mb-2">{v.title}</h3>
                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed">{v.text}</p>
                  </motion.div>
                );
              })}
            </motion.div>
          </Stagger>
        </section>

        {/* How it works */}
        <HowItWorks />

        {/* Social proof / testimonials */}
        <SocialProof />

        {/* Stats band */}
        <section className="w-full bg-surface py-16">
          <Stagger className="max-w-page mx-auto px-4 md:px-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <motion.div variants={itemVariants}>
              <div className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight tabular-nums">
                <AnimatedNumber value={STATS.activeUsers} suffix="+" />
              </div>
              <div className="text-xs text-neutral-500 mt-1 font-medium">Usagers actifs</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight tabular-nums">
                <AnimatedNumber value={STATS.reviews} suffix="+" />
              </div>
              <div className="text-xs text-neutral-500 mt-1 font-medium">Avis à Monastir</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-3xl sm:text-4xl font-semibold text-neutral-900 tracking-tight tabular-nums">
                <AnimatedNumber value={4.9} suffix="/5" />
              </div>
              <div className="text-xs text-neutral-500 mt-1 font-medium">Note moyenne</div>
            </motion.div>
            <motion.div variants={itemVariants}>
              <div className="text-3xl sm:text-4xl font-semibold text-brand-ink tracking-tight tabular-nums">
                <AnimatedNumber value={100} suffix=" %" />
              </div>
              <div className="text-xs text-neutral-500 mt-1 font-medium">Véhicules électriques</div>
            </motion.div>
          </Stagger>
        </section>

        {/* Final CTA */}
        <FinalCta />
      </main>

      <Footer />
    </div>
  );
};
