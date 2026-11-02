import React, { type ReactNode } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, ShieldCheck } from "iconoir-react";
import type { Variants } from "motion/react";

export const authContainer: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.08 },
  },
};

export const authItem: Variants = {
  hidden: { opacity: 0, y: 14 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: "spring", stiffness: 320, damping: 26 },
  },
};

const Brand: React.FC<{ tint?: string }> = ({ tint = "text-neutral-900" }) => {
  const light = tint.includes("text-white");
  return (
    <Link
      to="/"
      className="flex items-center gap-2 rounded transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
      aria-label="Rouli — Accueil"
    >
      <img
        src="/apple-touch-icon.png"
        alt=""
        width={32}
        height={32}
        className="w-8 h-8 rounded-[22.5%]"
      />
      <img
        src={light ? "/rouli-wordmark-white.svg" : "/rouli-wordmark-brand.svg"}
        alt=""
        width={52}
        height={18}
        className="h-[18px] w-auto"
      />
    </Link>
  );
};

interface AuthShellProps {
  children: ReactNode;
}

export const AuthShell: React.FC<AuthShellProps> = ({ children }) => (
  <div className="min-h-screen w-full bg-white flex flex-col lg:flex-row font-sans selection:bg-brand/20 selection:text-black">
    {/* Left cover panel */}
    <aside className="relative hidden lg:block lg:w-1/2 overflow-hidden">
      <img
        src="/hero-bg.webp"
        alt=""
        width={1536}
        height={1024}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="relative z-10 p-10 xl:p-14">
        <Brand tint="text-white" />
      </div>
    </aside>

    {/* Right form panel */}
    <main
      id="main"
      tabIndex={-1}
      className="relative flex w-full flex-col lg:w-1/2"
    >
      <header className="flex items-center justify-between px-6 sm:px-10 py-5">
        <div className="lg:hidden">
          <Brand />
        </div>
        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-600 hover:text-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink rounded"
          >
            <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
            <span>Retour à l'accueil</span>
          </Link>
        </div>
      </header>

      <div className="flex flex-1 items-center justify-center px-6 sm:px-10 py-10">
        <div className="w-full max-w-100">{children}</div>
      </div>

      <footer className="px-6 py-5 text-center text-xs text-neutral-400 flex items-center justify-center gap-1.5">
        <ShieldCheck className="w-4 h-4 text-brand-ink" aria-hidden="true" />
        <span>Connexion sécurisée SSL 256-bit • Données protégées</span>
      </footer>
    </main>
  </div>
);
