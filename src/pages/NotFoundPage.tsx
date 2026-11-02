import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { ArrowRight, Home, Compass, MapPin } from 'iconoir-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';

export const NotFoundPage: React.FC = () => (
  <div className="w-full min-h-screen bg-surface text-ink flex flex-col font-sans selection:bg-brand/20 selection:text-black">
    <Navbar />

    <main id="main" tabIndex={-1} className="flex-1 w-full pt-nav flex items-center justify-center px-4 md:px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-narrow text-center py-20 sm:py-28 flex flex-col items-center"
      >
        <span className="text-xs font-bold uppercase tracking-label text-brand-ink mb-3">
          ERREUR 404
        </span>

        <div className="text-[110px] sm:text-[160px] font-display font-semibold leading-none tracking-tight text-neutral-900">
          4<span className="text-brand-ink">0</span>4
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mt-2">
          Cette page a pris un autre itinéraire.
        </h1>
        <p className="text-sm sm:text-base text-neutral-600 mt-3 max-w-[520px] leading-relaxed">
          La page que vous cherchez n'existe pas ou a été déplacée. Revenez à l'accueil ou explorez nos véhicules et
          agences à Monastir.
        </p>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link
            to="/"
            className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-brand-on font-bold text-sm px-7 py-3.5 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] shadow-lg shadow-brand/25 active:scale-95"
          >
            <Home className="w-4 h-4" aria-hidden="true" />
            <span>Retour à l'accueil</span>
          </Link>
          <Link
            to="/vehicules"
            className="inline-flex items-center justify-center gap-2 border border-neutral-300 hover:border-neutral-500 text-neutral-800 font-semibold text-sm px-6 py-3.5 rounded-full transition-colors active:scale-95"
          >
            <Compass className="w-4 h-4" aria-hidden="true" />
            <span>Voir les véhicules</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-neutral-500">
          <Link
            to="/vehicules?type=bike"
            className="hover:text-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink rounded"
          >
            Vélos électriques
          </Link>
          <span className="text-neutral-300">•</span>
          <Link
            to="/vehicules?type=scooter"
            className="hover:text-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink rounded"
          >
            Trottinettes
          </Link>
          <span className="text-neutral-300">•</span>
          <Link to="/agences" className="inline-flex items-center gap-1 hover:text-black transition-colors">
            <MapPin className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
            Nos agences
          </Link>
          <span className="text-neutral-300">•</span>
          <Link to="/contact" className="hover:text-black transition-colors">Contact</Link>
        </div>
      </motion.div>
    </main>

    <Footer />
  </div>
);
