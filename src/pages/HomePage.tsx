import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import { HeroSearch } from '../components/HeroSearch';
import { Features } from '../components/ui/features-8';
import { SocialProof } from '../components/SocialProof';
import { ProblemSection } from '../components/ProblemSection';
import { SolutionSection } from '../components/SolutionSection';
import { HowItWorks } from '../components/HowItWorks';
import { FaqSection } from '../components/FaqSection';
import { FinalCta } from '../components/FinalCta';
import { Footer } from '../components/Footer';

export const HomePage: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    if (!location.hash) return;
    const id = location.hash.replace('#', '');
    const frame = requestAnimationFrame(() => {
      document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
    });
    return () => cancelAnimationFrame(frame);
  }, [location.hash]);

  /** Scroll to an in-page target and move focus there (APG disclosure). */
  const scrollTo = (id: string) => {
    const el = document.getElementById(id);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth' });
    el.setAttribute('tabindex', '-1');
    el.focus({ preventScroll: true });
  };

  const scrollToSearch = () => scrollTo('section-hero-search');
  const scrollToSolution = () => scrollTo('section-solution-bike');

  return (
    <div className="w-full min-h-screen bg-surface text-ink flex flex-col font-sans selection:bg-brand/20 selection:text-black">
      
      {/* 1. Header: naviguer sur le site, accéder à la connexion et lancer une réservation */}
      <Navbar onReserveClick={scrollToSearch} />

      {/* Main Home Page Sections in exact requested order */}
      <main id="main" tabIndex={-1} className="w-full pt-nav flex flex-col items-center">
        
        {/* 2. Hero: dire en un coup d'œil que le visiteur est au bon endroit, et lui permettre de chercher un vélo (agence, dates) tout de suite */}
        <HeroSearch />

        {/* 3. Preuve sociale: rassurer avec des chiffres et des avis de personnes qui ont déjà utilisé le service */}
        <Features />

        <SocialProof />

        {/* 4. Problème: montrer ce que vit le client sans Rouli, pour qu'il ressente le vrai coût du problème */}
        <ProblemSection onDiscoverSolution={scrollToSolution} />

        {/* 5. Solution: présenter Rouli et ses fonctionnalités principales, chacune avec son bénéfice */}
        <SolutionSection />

        {/* 6. Comment ça marche: expliquer le parcours en 4 étapes simples, pour enlever la peur de se lancer */}
        <HowItWorks />

        {/* 7. FAQ: répondre aux questions et aux doutes restants */}
        <FaqSection />

        {/* 8. CTA final: pousser une dernière fois les indécis à réserver */}
        <FinalCta />

      </main>

      {/* 9. Footer: donner les liens utiles et les mentions légales */}
      <Footer />

    </div>
  );
};
