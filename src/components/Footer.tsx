import React from "react";
import { Link } from "react-router-dom";
import { motion, useReducedMotion } from "motion/react";
import { ArrowRight, Mail, MapPin, Phone } from "iconoir-react";

const LINK_GROUPS = [
  {
    title: "Louer",
    links: [
      { to: "/vehicules?type=bike", label: "Vélos" },
      { to: "/vehicules?type=scooter", label: "Trottinettes" },
      { to: "/vehicules", label: "Tous les véhicules" },
      { to: "/agences", label: "Agences" },
    ],
  },
  {
    title: "Rouli",
    links: [
      { to: "/a-propos", label: "À propos" },
      { to: "/contact", label: "Contact" },
      { to: "/#section-faq", label: "FAQ" },
      { to: "/profil", label: "Mon profil" },
    ],
  },
  {
    title: "Légal",
    links: [
      {
        href: "mailto:support@rouli.tn?subject=Politique%20de%20confidentialit%C3%A9",
        label: "Confidentialité",
      },
      {
        href: "mailto:support@rouli.tn?subject=Mentions%20l%C3%A9gales",
        label: "Mentions légales",
      },
      {
        href: "mailto:support@rouli.tn?subject=Conditions%20G%C3%A9n%C3%A9rales%20de%20Vente",
        label: "CGV",
      },
      {
        href: "mailto:support@rouli.tn?subject=Gestion%20des%20cookies",
        label: "Cookies",
      },
    ],
  },
];

const linkClass =
  "block rounded text-neutral-500 transition-colors duration-150 hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink";

const contactClass =
  "flex size-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-500 transition-colors hover:border-brand/40 hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink";

export const Footer: React.FC = () => {
  const year = new Date().getFullYear();
  const reduce = useReducedMotion();

  return (
    <footer className="safe-area-b w-full overflow-hidden border-t border-neutral-200/50 bg-surface pt-8 text-neutral-600 sm:pt-20">
      <motion.div
        initial={reduce ? false : { y: 64, opacity: 0 }}
        whileInView={{ y: 0, opacity: 1 }}
        viewport={{ once: true, amount: 0.05 }}
        transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
        className="mx-auto max-w-page space-y-12 px-4 md:px-6 sm:space-y-16"
      >
        <div className="flex flex-wrap justify-between gap-6">
          <div className="max-w-xs space-y-6">
            <Link
              to="/"
              aria-label="Rouli — Accueil"
              className="flex size-fit items-center gap-2 rounded transition-opacity hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              <img
                src="/apple-touch-icon.png"
                alt=""
                width={40}
                height={40}
                className="size-10 rounded-[22.5%]"
              />
              <img
                src="/rouli-wordmark-brand.svg"
                alt=""
                width={64}
                height={22}
                className="h-[22px] w-auto"
              />
            </Link>

            <p className="text-balance text-sm text-neutral-500">
              Monastir, Tunisie — Skanes, Centre, Marina, Gare.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <a
              href="mailto:support@rouli.tn"
              aria-label="Écrire à Rouli"
              className={contactClass}
            >
              <Mail className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </a>
            <a
              href="tel:+21673500000"
              aria-label="Appeler Rouli"
              className={contactClass}
            >
              <Phone className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </a>
            <Link
              to="/agences"
              aria-label="Voir nos agences"
              className={contactClass}
            >
              <MapPin className="size-4" strokeWidth={1.5} aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div
          aria-hidden="true"
          className="h-px bg-[linear-gradient(90deg,var(--color-neutral-900)_1px,transparent_1px)] bg-[length:6px_1px] bg-repeat-x opacity-15"
        />

        <div className="grid gap-12 md:grid-cols-5">
          <div className="grid gap-6 sm:grid-cols-3 md:col-span-3">
            {LINK_GROUPS.map((group) => (
              <div key={group.title} className="space-y-4 text-sm">
                <span className="block font-medium text-neutral-900">
                  {group.title}
                </span>
                <div className="flex flex-wrap gap-4 sm:flex-col">
                  {group.links.map((link) =>
                    "to" in link ? (
                      <Link key={link.to} to={link.to} className={linkClass}>
                        {link.label}
                      </Link>
                    ) : (
                      <a key={link.href} href={link.href} className={linkClass}>
                        {link.label}
                      </a>
                    ),
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="md:col-span-2">
            <div className="ml-auto w-full space-y-4 md:max-w-xs">
              <p className="text-sm font-medium text-neutral-900">
                Besoin d'aide pour réserver ?
              </p>
              <p className="text-sm text-neutral-500">
                Notre équipe répond en agence, par téléphone ou par email, 7j/7.
              </p>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-brand-on px-5 py-3 text-sm font-semibold text-brand transition-colors hover:bg-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                Nous contacter
                <ArrowRight className="size-4" aria-hidden="true" />
              </Link>
              <div className="flex flex-col gap-1 pt-2 text-xs text-neutral-500">
                <a href="mailto:support@rouli.tn">support@rouli.tn</a>
                <a href="tel:+21673500000">+216 73 500 000</a>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-neutral-200/60 py-8">
          <span className="text-sm text-neutral-500">
            © {year} Rouli, Tous droits réservés.
          </span>
          <div className="flex items-center gap-2 rounded-full border border-neutral-200 bg-white py-1 pl-3 pr-4 text-xs font-medium text-neutral-600 shadow-sm">
            <span className="size-1.5 rounded-full bg-brand-ink" aria-hidden="true" />
            Réservation en ligne
          </div>
        </div>
      </motion.div>
    </footer>
  );
};
