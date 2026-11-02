import React, { useEffect, useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  AnimatePresence,
  LayoutGroup,
  motion,
  useMotionValueEvent,
  useReducedMotion,
  useScroll,
} from "motion/react";
import { Menu, X, ArrowRight } from 'iconoir-react';
import { Blobatar } from "@blobatar/react";
import "blobatar/motion.css";
import { itemVariants, sectionVariants } from "../lib/motion";

/**
 * The catalogue is one route; "Vélos" and "Trottinettes" scope it with
 * `?type=`. Each link carries the `type` it owns so exactly one of them
 * highlights — `NavLink` matches on pathname only, which would light up
 * both on `/vehicules`.
 */
interface NavItem {
  to: string;
  label: string;
  /** Set for the two vehicle-type links, which share the `/vehicules` route. */
  type?: 'bike' | 'scooter';
}

const NAV_LINKS: NavItem[] = [
  { to: "/vehicules?type=bike", label: "Vélos", type: "bike" },
  { to: "/vehicules?type=scooter", label: "Trottinettes", type: "scooter" },
  { to: "/agences", label: "Agences" },
  { to: "/a-propos", label: "À propos" },
  { to: "/contact", label: "Contact" },
];

interface NavbarProps {
  onReserveClick?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onReserveClick }) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const reduce = useReducedMotion() ?? false;
  const { scrollY, scrollYProgress } = useScroll();
  const [scrolled, setScrolled] = useState(false);

  useMotionValueEvent(scrollY, "change", (value) => {
    const next = value > 8;
    setScrolled((current) => (current === next ? current : next));
  });

  const currentType = new URLSearchParams(location.search).get('type');

  /**
   * Is this the section the visitor is currently in?
   *
   * The two vehicle-type links share the `/vehicules` pathname, so matching
   * on the pathname alone would light up both at once. React Router's
   * `NavLink` computes its own active state and offers no override, so the
   * state is derived here instead.
   */
  const isCurrent = (item: NavItem) => {
    if (item.type) {
      return location.pathname === '/vehicules' && currentType === item.type;
    }
    const [path] = item.to.split('?');
    return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  /**
   * Clicking a link that points at the page you are already on should not
   * stack a duplicate history entry.
   */
  const isSameUrl = (to: string) => {
    const [path, query = ''] = to.split('?');
    return location.pathname === path && location.search.replace(/^\?/, '') === query;
  };

  const handleReserve = () => {
    setMobileMenuOpen(false);
    if (onReserveClick) {
      onReserveClick();
    } else {
      navigate("/#section-hero-search");
    }
  };

  // Escape closes the drawer and returns focus to the toggle (APG disclosure).
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setMobileMenuOpen(false);
        menuButtonRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [mobileMenuOpen]);

  // Close the drawer if the viewport grows past the mobile breakpoint.
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 768px)');
    const onChange = () => {
      if (mq.matches) setMobileMenuOpen(false);
    };
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, []);

  return (
    <header className="fixed top-0 inset-x-0 z-50 safe-area-x">
      {/* 1. Header Top Navigation Bar */}
      <div
        className={`w-full h-11 backdrop-blur-nav backdrop-saturate-nav border-b border-black/5 transition-[background-color,box-shadow] duration-200 ${
          scrolled ? "bg-white/95 shadow-sm" : "bg-white/80"
        }`}
      >
        <div className="max-w-page h-full mx-auto px-4 md:px-6 flex items-center justify-between">
          {/* Brand Wordmark & Emblem with brand accent */}
          <div className="flex items-center gap-2">
            <Link
              to="/"
              className="flex items-center gap-2 rounded transition-opacity hover:opacity-80 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              aria-label="Rouli — Accueil"
            >
              <img
                src="/apple-touch-icon.png"
                alt=""
                width={28}
                height={28}
                className="w-7 h-7 rounded-[22.5%]"
              />
              <img
                src="/rouli-wordmark-brand.svg"
                alt=""
                width={43}
                height={15}
                className="h-[15px] w-auto"
              />
            </Link>
          </div>

          {/* 5 Requested Navbar Links */}
          <LayoutGroup>
            <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-7 text-xs text-neutral-700 font-normal">
              {NAV_LINKS.map((item) => {
                const isActive = isCurrent(item);
                return (
                  <Link
                    key={item.to}
                    to={item.to}
                    replace={isSameUrl(item.to)}
                    aria-current={isActive ? "page" : undefined}
                    className={`relative py-1 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink rounded ${
                      isActive ? "text-black font-semibold" : "hover:text-black hover:font-medium"
                    }`}
                  >
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-underline"
                        aria-hidden="true"
                        className="absolute inset-x-0 -bottom-0.5 h-0.5 rounded-full bg-brand"
                        transition={
                          reduce
                            ? { duration: 0 }
                            : { type: "spring", visualDuration: 0.26, bounce: 0 }
                        }
                      />
                    )}
                  </Link>
                );
              })}
            </nav>
          </LayoutGroup>

          {/* Right Action Icons: Connexion and Réserver */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Direct Connexion text link */}
            <Link
              to="/login"
              className="hidden sm:inline-flex text-xs font-semibold text-neutral-700 hover:text-black transition-colors px-2.5 py-1.5 rounded-full hover:bg-neutral-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              Connexion
            </Link>

            {/* Primary Action: Inscription */}
            <Link
              to="/signup"
              className="inline-flex items-center justify-center bg-brand text-brand-on font-bold text-xs px-4 py-1.5 rounded-full hover:bg-brand-dark active:scale-95 transition-[color,background-color,border-color,box-shadow,transform,opacity] shadow-sm shadow-brand/25 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              Inscription
            </Link>

            {/* Profile Avatar icon */}
            <Link
              to="/profil"
              aria-label="Mon compte"
              className="w-11 h-11 sm:w-7 sm:h-7 rounded-full overflow-hidden hover:opacity-90 transition-opacity cursor-pointer flex items-center justify-center focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              <Blobatar
                name="salhirayen69"
                hue={145}
                animate="hover"
                size={28}
                className="w-7 h-7 rounded-full border-2 border-neutral-400"
              />
            </Link>

            {/* Mobile Menu Toggle */}
            <button
              ref={menuButtonRef}
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-expanded={mobileMenuOpen}
              aria-controls="mobile-menu"
              className="md:hidden p-3 -m-1 text-neutral-700 hover:text-neutral-900 rounded-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              aria-label={mobileMenuOpen ? "Fermer le menu" : "Ouvrir le menu"}
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5" aria-hidden="true" />
              ) : (
                <Menu className="w-5 h-5" aria-hidden="true" />
              )}
            </button>
          </div>
        </div>
      </div>

      <motion.div
        aria-hidden="true"
        style={{ scaleX: scrollYProgress }}
        className="pointer-events-none absolute inset-x-0 bottom-0 h-0.5 origin-left bg-brand-ink"
      />

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            id="mobile-menu"
            ref={drawerRef}
            initial={reduce ? false : { opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={
              reduce
                ? { opacity: 1 }
                : { opacity: 0, y: -8, transition: { duration: 0.16, ease: "easeIn" } }
            }
            transition={
              reduce
                ? { duration: 0 }
                : { type: "spring", visualDuration: 0.3, bounce: 0.04 }
            }
            className="md:hidden fixed inset-x-0 top-nav bg-white/95 backdrop-blur-xl border-b border-neutral-200 shadow-xl p-5 flex flex-col gap-3 z-50 max-h-[70vh] overflow-y-auto overscroll-contain"
          >
            <motion.nav
              aria-label="Navigation mobile"
              className="flex flex-col gap-1"
              initial={reduce ? false : "hidden"}
              animate="visible"
              variants={sectionVariants}
            >
              {NAV_LINKS.map((item) => {
                const isActive = isCurrent(item);
                return (
                  <motion.div key={item.to} variants={itemVariants}>
                    <Link
                      to={item.to}
                      replace={isSameUrl(item.to)}
                      aria-current={isActive ? "page" : undefined}
                      onClick={() => setMobileMenuOpen(false)}
                      className={`relative flex items-center justify-between py-2.5 text-left border-b border-neutral-100 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${
                        isActive
                          ? "text-black font-semibold"
                          : "text-neutral-800 font-medium hover:text-black"
                      }`}
                    >
                      <span>{item.label}</span>
                      <ArrowRight
                        className={`w-4 h-4 ${isActive ? "text-brand-ink" : "text-neutral-400"}`}
                        aria-hidden="true"
                      />
                      <span
                        aria-hidden="true"
                        className={`absolute inset-x-0 bottom-0 h-0.5 rounded-full bg-brand transition-opacity ${
                          isActive ? "opacity-100" : "opacity-0"
                        }`}
                      />
                    </Link>
                  </motion.div>
                );
              })}
            </motion.nav>

            <div className="pt-2 flex flex-col gap-2">
              <button
                type="button"
                onClick={handleReserve}
                className="w-full py-2.5 bg-brand text-brand-on font-bold text-sm rounded-full shadow-md shadow-brand/25 hover:bg-brand-dark active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                Lancer une réservation
              </button>

              <Link
                to="/profil"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-center font-semibold text-xs rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                Mon profil
              </Link>

              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full py-2.5 bg-neutral-100 hover:bg-neutral-200 text-neutral-800 text-center font-semibold text-xs rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                Accéder à la connexion
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};
