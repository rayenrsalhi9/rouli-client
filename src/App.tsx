/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { lazy, Suspense, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigationType } from 'react-router-dom';
import { AnimatePresence, MotionConfig, motion, useIsPresent } from 'motion/react';
import { HomePage } from './pages/HomePage';
import { BikesCatalogPage } from './pages/BikesCatalogPage';
import { BikeDetailPage } from './pages/BikeDetailPage';
import { getBikeById, getAgencyById } from './data/mockData';
import { useViewTransitionActive } from './lib/viewTransition';

// The catalog and bike detail stay in the initial chunk: shared-element
// navigation needs their images mounted inside the View Transition snapshot.
const LoginPage = lazy(() => import('./pages/LoginPage').then((m) => ({ default: m.LoginPage })));
const SignupPage = lazy(() => import('./pages/SignupPage').then((m) => ({ default: m.SignupPage })));
const AboutPage = lazy(() => import('./pages/AboutPage').then((m) => ({ default: m.AboutPage })));
const ContactPage = lazy(() => import('./pages/ContactPage').then((m) => ({ default: m.ContactPage })));
const AgenciesPage = lazy(() => import('./pages/AgenciesPage').then((m) => ({ default: m.AgenciesPage })));
const AgencyDetailPage = lazy(() => import('./pages/AgencyDetailPage').then((m) => ({ default: m.AgencyDetailPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((m) => ({ default: m.ProfilePage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((m) => ({ default: m.NotFoundPage })));

const SITE = 'Rouli';

/** Resolve a human-readable document title for the current route. */
function resolveTitle(pathname: string, search: string): string {
  if (pathname === '/') return `${SITE} — Mobilité urbaine électrique à Monastir`;
  if (pathname === '/vehicules') {
    const type = new URLSearchParams(search).get('type');
    if (type === 'bike') return `Vélos électriques — ${SITE} Monastir`;
    if (type === 'scooter') return `Trottinettes électriques — ${SITE} Monastir`;
    return `Nos véhicules — ${SITE} Monastir`;
  }
  if (pathname === '/agences') return `Nos agences — ${SITE} Monastir`;
  if (pathname === '/a-propos') return `À propos — ${SITE} Monastir`;
  if (pathname === '/contact') return `Contact — ${SITE} Monastir`;
  if (pathname === '/login') return `Connexion — ${SITE}`;
  if (pathname === '/signup') return `Créer un compte — ${SITE}`;
  if (pathname === '/profil') return `Mon profil — ${SITE}`;

  const bikeMatch = pathname.match(/^\/vehicules\/([^/]+)$/);
  if (bikeMatch) {
    const bike = getBikeById(bikeMatch[1]);
    return bike ? `${bike.name} — ${SITE} Monastir` : `Véhicule introuvable — ${SITE}`;
  }

  const agencyMatch = pathname.match(/^\/agences\/([^/]+)$/);
  if (agencyMatch) {
    const agency = getAgencyById(agencyMatch[1]);
    return agency ? `${agency.name} — ${SITE} Monastir` : `Agence introuvable — ${SITE}`;
  }

  return `Page introuvable — ${SITE}`;
}

/**
 * Scroll management.
 *
 * Push navigations start at the top; back/forward restores the exact offset
 * the user left the page at. Hash routes are left alone — the target page
 * scrolls to its own anchor.
 *
 * Offsets are keyed by `pathname + search` rather than the history key:
 * filter changes are applied with `replace`, so the history key changes
 * without the page moving, and keying by the URL keeps the offset reachable
 * when the user navigates back to a filtered view.
 */
const ScrollManager = () => {
  const location = useLocation();
  const navType = useNavigationType();
  const positions = useRef(new Map<string, number>());
  const previousPathname = useRef(location.pathname);

  useEffect(() => {
    const key = `${location.pathname}${location.search}`;
    const saved = positions.current.get(key);
    const pathnameChanged = previousPathname.current !== location.pathname;

    // Hash routes are scrolled by the target page itself.
    if (pathnameChanged && !location.hash) {
      if (navType === 'POP' && saved !== undefined) {
        requestAnimationFrame(() => window.scrollTo(0, saved));
      } else {
        window.scrollTo(0, 0);
      }
    }
    previousPathname.current = location.pathname;

    return () => {
      positions.current.set(key, window.scrollY);
    };
  }, [location.pathname, location.search, location.hash, navType]);

  return null;
};

/** Keeps `<title>` in sync with the current context. */
const DocumentTitle = () => {
  const { pathname, search } = useLocation();
  useEffect(() => {
    document.title = resolveTitle(pathname, search);
  }, [pathname, search]);
  return null;
};

/**
 * Announces route changes to assistive tech. A polite live region is enough:
 * the announcement must not interrupt whatever the user is reading.
 */
const RouteAnnouncer = () => {
  const { pathname, search } = useLocation();
  const [message, setMessage] = React.useState('');

  useEffect(() => {
    setMessage(resolveTitle(pathname, search).split(' — ')[0]);
  }, [pathname, search]);

  return (
    <div aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </div>
  );
};

const RouteFallback = () => (
  <div
    role="status"
    aria-live="polite"
    className="flex min-h-[100svh] items-center justify-center bg-surface"
  >
    <span className="sr-only">Chargement…</span>
    <span
      aria-hidden="true"
      className="size-6 animate-spin rounded-full border-2 border-neutral-200 border-t-brand motion-reduce:animate-none"
    />
  </div>
);

function AnimatedRoutes() {
  const location = useLocation();
  const viewTransitionActive = useViewTransitionActive();

  return (
    <AnimatePresence
      mode={viewTransitionActive ? 'popLayout' : 'wait'}
      initial={false}
    >
      <RoutePage key={location.pathname} location={location} />
    </AnimatePresence>
  );
}

const RoutePage: React.FC<{
  location: ReturnType<typeof useLocation>;
}> = ({ location }) => {
  const isPresent = useIsPresent();

  return (
    <motion.div
      data-route-page="true"
      data-route-exiting={isPresent ? undefined : 'true'}
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -4, transition: { duration: 0.1, ease: 'easeIn' } }}
      transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
    >
      <Suspense fallback={<RouteFallback />}>
      <Routes location={location}>
        <Route path="/" element={<HomePage />} />
        <Route path="/vehicules" element={<BikesCatalogPage />} />
        <Route path="/vehicules/:bikeId" element={<BikeDetailPage />} />
        <Route path="/agences" element={<AgenciesPage />} />
        <Route path="/agences/:agencyId" element={<AgencyDetailPage />} />
        <Route path="/a-propos" element={<AboutPage />} />
        <Route path="/contact" element={<ContactPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />
        <Route path="/profil" element={<ProfilePage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
      </Suspense>
    </motion.div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <MotionConfig reducedMotion="user">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[100] focus:rounded-full focus:bg-brand focus:px-4 focus:py-2 focus:text-sm focus:font-bold focus:text-brand-on"
        >
          Aller au contenu principal
        </a>
        <ScrollManager />
        <DocumentTitle />
        <RouteAnnouncer />
        <AnimatedRoutes />
      </MotionConfig>
    </BrowserRouter>
  );
}
