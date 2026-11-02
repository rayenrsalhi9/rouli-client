import React from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { motion } from 'motion/react';
import { Search, MapPin, Phone, Clock, MapsArrow, ArrowRight, Bicycle } from 'iconoir-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Stagger } from '../components/Reveal';
import { itemVariants } from '../lib/motion';
import { AGENCIES_LIST, CATALOG_BIKES } from '../data/mockData';

type SortKey = 'relevance' | 'name' | 'vehicles';

const vehicleCountFor = (agencyId: string) =>
  CATALOG_BIKES.filter((v) => v.agencyId === agencyId).length;

export const AgenciesPage: React.FC = () => {
  const allAgencies = AGENCIES_LIST.filter((a) => a.id !== 'all');
  const postalCodes = Array.from(new Set(allAgencies.map((a) => a.postalCode))).sort();

  /** The URL is the source of truth so the search can be shared and restored. */
  const [searchParams, setSearchParams] = useSearchParams();
  /** Apply several param changes at once (one-by-one would clobber stale state). */
  const setParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === '') next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const query = searchParams.get('q') ?? '';
  const postal = searchParams.get('zone') ?? 'all';
  const rawSort = searchParams.get('sort');
  const sort: SortKey = rawSort === 'name' || rawSort === 'vehicles' ? rawSort : 'relevance';

  const setQuery = (value: string) => setParams({ q: value.trim() === '' ? null : value });
  const setPostal = (value: string) => setParams({ zone: value === 'all' ? null : value });
  const setSort = (value: SortKey) => setParams({ sort: value === 'relevance' ? null : value });

  const q = query.trim().toLowerCase();
  const agencies = allAgencies
    .filter((a) => {
      if (postal !== 'all' && a.postalCode !== postal) return false;
      if (!q) return true;
      return [
        a.name,
        a.shortName,
        a.address,
        a.postalCode,
        a.description ?? '',
        ...(a.landmarks ?? []),
        ...(a.localities ?? []),
      ]
        .join(' ')
        .toLowerCase()
        .includes(q);
    })
    .sort((a, b) => {
      if (sort === 'name') return a.name.localeCompare(b.name, 'fr');
      if (sort === 'vehicles') return vehicleCountFor(b.id) - vehicleCountFor(a.id);
      return 0;
    });

  return (
    <div className="w-full min-h-screen bg-surface text-ink flex flex-col font-sans selection:bg-brand/20 selection:text-black">
      <Navbar />

      <main id="main" tabIndex={-1} className="w-full pt-nav flex flex-col items-center">
        {/* Agencies */}
        <section className="w-full bg-surface py-12 sm:py-16">
          <div className="max-w-page w-full mx-auto px-4 md:px-6">
            <Stagger>
              <motion.div variants={itemVariants} className="mb-10 mt-4">
                <span className="text-xs font-bold uppercase tracking-label text-brand-ink mb-2 block">
                  NOS AGENCES
                </span>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-neutral-900">
                  {allAgencies.length} agences à Monastir, un véhicule toujours proche.
                </h1>
                <p className="text-sm text-neutral-600 mt-3 max-w-[640px]">
                  Retirez et rapportez votre vélo ou votre trottinette dans l'agence de votre choix. Chaque véhicule
                  est affecté à une agence : le retrait et le retour se font au même endroit.
                </p>
              </motion.div>

              {/* Barre de recherche & filtres */}
              <motion.div variants={itemVariants} className="bg-white rounded-3xl border border-neutral-200/80 p-4 sm:p-5 mb-6">
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative flex-1">
                    <label htmlFor="agencies-search" className="sr-only">
                      Rechercher une agence, une zone ou un repère
                    </label>
                    <Search
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400 pointer-events-none"
                      aria-hidden="true"
                    />
                    <input
                      id="agencies-search"
                      name="q"
                      type="search"
                      autoComplete="off"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                      placeholder="Rechercher une agence, une zone, un repère…"
                      className="w-full bg-neutral-50 border border-neutral-200 rounded-xl pl-10 pr-4 py-2.5 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-brand-ink focus-visible:ring-2 focus-visible:ring-brand-ink transition-[color,background-color,border-color,box-shadow,transform,opacity]"
                    />
                  </div>
                  <select
                    id="agencies-sort"
                    name="sort"
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortKey)}
                    aria-label="Trier les agences"
                    className="bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm text-neutral-900 focus-visible:outline-none focus-visible:border-brand-ink focus-visible:ring-2 focus-visible:ring-brand-ink transition-[color,background-color,border-color,box-shadow,transform,opacity] cursor-pointer"
                  >
                    <option value="relevance">Tri : pertinence</option>
                    <option value="name">Tri : nom (A–Z)</option>
                    <option value="vehicles">Tri : plus de véhicules</option>
                  </select>
                </div>

                <div
                  role="group"
                  aria-label="Filtrer par zone"
                  className="mt-3.5 flex flex-wrap items-center gap-2"
                >
                  <button
                    type="button"
                    aria-pressed={postal === 'all'}
                    onClick={() => setPostal('all')}
                    className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${
                      postal === 'all'
                        ? 'bg-brand text-brand-on shadow-xs'
                        : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                    }`}
                  >
                    Toutes les zones
                  </button>
                  {postalCodes.map((code) => (
                    <button
                      key={code}
                      type="button"
                      aria-pressed={postal === code}
                      onClick={() => setPostal(code)}
                      className={`text-xs font-semibold px-3 py-1.5 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${
                        postal === code
                          ? 'bg-brand text-brand-on shadow-xs'
                          : 'bg-neutral-100 text-neutral-600 hover:text-neutral-900'
                      }`}
                    >
                      {code}
                    </button>
                  ))}
                  <span
                    aria-live="polite"
                    className="ml-auto text-2xs font-medium text-neutral-500 tabular-nums"
                  >
                    {agencies.length} agence{agencies.length > 1 ? 's' : ''}
                  </span>
                </div>
              </motion.div>
            </Stagger>

            <Stagger className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {agencies.map((a) => {
                const count = vehicleCountFor(a.id);
                const mapUrl = a.coordinates
                  ? `https://www.google.com/maps/search/?api=1&query=${a.coordinates.lat},${a.coordinates.lng}`
                  : undefined;

                return (
                  <motion.div
                    key={a.id}
                    variants={itemVariants}
                    className="bg-white rounded-3xl border border-black/5 p-6 sm:p-7 flex flex-col hover:border-brand/40 transition-colors"
                  >
                    {/* Image */}
                    {a.image && (
                      <Link
                        to={`/agences/${a.id}`}
                        className="relative mb-5 block overflow-hidden rounded-2xl border border-neutral-200/60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                      >
                        <img
                          src={a.image}
                          alt={a.name}
                          width={640}
                          height={320}
                          loading="lazy"
                          className="w-full h-44 sm:h-52 object-cover transition-transform duration-500 hover:scale-[1.03]"
                        />
                        <span className="absolute top-3 left-3 text-2xs font-bold text-white bg-scrim/55 backdrop-blur-md px-2.5 py-1 rounded-full">
                          {a.shortName}
                        </span>
                      </Link>
                    )}

                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <Link to={`/agences/${a.id}`} className="group">
                          <h2 className="text-lg font-bold text-neutral-900 tracking-tight group-hover:text-brand-ink transition-colors">
                            {a.name}
                          </h2>
                        </Link>
                        <p className="text-xs text-neutral-500 mt-0.5">
                          {a.address} — {a.postalCode} Monastir
                        </p>
                      </div>
                      <span className="text-2xs font-bold text-brand-ink bg-brand/10 px-2.5 py-1 rounded-full whitespace-nowrap">
                        {a.postalCode}
                      </span>
                    </div>

                    <p className="text-xs sm:text-sm text-neutral-600 leading-relaxed mb-4">
                      {a.description}
                    </p>

                    {/* Info rows */}
                    <div className="flex flex-wrap gap-x-5 gap-y-2 text-xs text-neutral-700 mb-4">
                      {a.phone && (
                        <a href={`tel:${a.phone.replace(/\s/g, '')}`} className="flex items-center gap-1.5 hover:text-brand-ink">
                          <Phone className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                          {a.phone}
                        </a>
                      )}
                      {a.hours && (
                        <span className="flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                          {a.hours}
                        </span>
                      )}
                      {a.coordinates && (
                        <span className="flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                          {a.coordinates.lat.toFixed(4)}° N, {a.coordinates.lng.toFixed(4)}° E
                        </span>
                      )}
                    </div>

                    {/* Landmarks + localities */}
                    {a.landmarks && (
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {a.landmarks.map((l) => (
                          <span
                            key={l}
                            className="text-2xs font-semibold text-neutral-600 bg-neutral-100 px-2 py-0.5 rounded-full"
                          >
                            {l}
                          </span>
                        ))}
                      </div>
                    )}
                    {a.localities && (
                      <p className="text-2xs text-neutral-500 mb-4">
                        Dessert : {a.localities.join(' • ')}
                      </p>
                    )}

                    {/* Footer */}
                    <div className="mt-auto pt-4 border-t border-neutral-100 flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 text-2xs font-bold text-neutral-700 bg-neutral-100 px-2.5 py-1.5 rounded-full mr-auto">
                        <Bicycle className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                        {count} véhicule{count > 1 ? 's' : ''} disponible{count > 1 ? 's' : ''}
                      </span>
                      <Link
                        to={`/agences/${a.id}`}
                        className="inline-flex items-center justify-center gap-1.5 bg-brand hover:bg-brand-dark text-brand-on font-bold text-xs px-4 py-2.5 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] shadow-sm shadow-brand/25 active:scale-95"
                      >
                        <span>Détails de l'agence</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </Link>
                      {mapUrl && (
                        <a
                          href={mapUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 border border-neutral-300 hover:border-neutral-500 text-neutral-800 font-semibold text-xs px-4 py-2.5 rounded-full transition-colors active:scale-95"
                        >
                          <MapsArrow className="w-3.5 h-3.5" aria-hidden="true" />
                          <span>Itinéraire</span>
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </Stagger>

              {agencies.length === 0 && (
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-10 text-center">
                  <p className="text-sm font-semibold text-neutral-900">Aucune agence ne correspond à votre recherche.</p>
                  <p className="text-xs text-neutral-500 mt-1">
                    Essayez une autre zone ou réinitialisez les filtres.
                  </p>
                  <button
                    type="button"
                    onClick={() => setParams({ q: null, zone: null })}
                    className="mt-5 inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-brand-on font-bold text-xs px-5 py-2.5 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                  >
                    Réinitialiser les filtres
                  </button>
                </div>
              )}

              {/* Note */}
              <div className="mt-8">
                <div className="bg-white rounded-2xl border border-neutral-200/80 p-5 text-xs text-neutral-600 text-center">
                  Le retrait et le retour se font dans la même agence. Horaires d'ouverture : 08h00 – 20h00, 7j/7.
                  Paiement sur place au retrait, réservation gratuite en ligne.
                </div>
              </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
