import React, { lazy, Suspense } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ArrowLeft,
  ArrowRight,
  MapPin,
  Phone,
  Clock,
  MapsArrow,
  Bicycle,
  Flash,
  Bank,
  MapPin as MapPinned,
} from 'iconoir-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { CATALOG_BIKES, getAgencyById, getVehiclePath } from '../data/mockData';

const nf = new Intl.NumberFormat('fr-FR');
const nf4 = new Intl.NumberFormat('fr-FR', { maximumFractionDigits: 4 });

// Charts pull in the visx + motion stack — load them only on detail pages.
const AgencyLoadChart = lazy(() =>
  import('../components/AgencyLoadChart').then((m) => ({ default: m.AgencyLoadChart })),
);

export const AgencyDetailPage: React.FC = () => {
  const { agencyId } = useParams<{ agencyId: string }>();

  const agency = agencyId ? getAgencyById(agencyId) : undefined;

  if (!agency || agency.id === 'all') {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-ink font-sans">
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 pt-nav pb-20 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-extrabold mb-2">Agence introuvable</h1>
          <p className="text-sm text-neutral-500 mb-6">
            Cette agence n'existe pas ou n'est plus disponible.
          </p>
          <Link
            to="/agences"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-brand-on font-bold text-xs px-5 py-3 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity]"
          >
            <span>Voir toutes les agences</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const vehicles = CATALOG_BIKES.filter((v) => v.agencyId === agency.id);
  const mapUrl = agency.coordinates
    ? `https://www.google.com/maps/search/?api=1&query=${agency.coordinates.lat},${agency.coordinates.lng}`
    : undefined;

  return (
    <div className="min-h-screen flex flex-col bg-surface text-ink font-sans selection:bg-brand/20 selection:text-black">
      <Navbar />

      <main id="main" tabIndex={-1} className="flex-1 pt-nav pb-20">
        {/* Breadcrumb */}
        <div className="bg-surface">
          <div className="max-w-page mx-auto px-4 md:px-6 py-3.5 flex items-center justify-between">
            <nav aria-label="Fil d'Ariane" className="flex items-center gap-2 text-xs text-neutral-500">
              <Link
                to="/"
                className="hover:text-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink rounded"
              >
                Accueil
              </Link>
              <span aria-hidden="true">/</span>
              <Link
                to="/agences"
                className="hover:text-black transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink rounded"
              >
                Agences
              </Link>
              <span aria-hidden="true">/</span>
              <span
                aria-current="page"
                className="text-neutral-900 font-semibold truncate max-w-[200px] sm:max-w-none"
              >
                {agency.shortName}
              </span>
            </nav>

            <Link
              to="/agences"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-neutral-700 hover:text-black transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink rounded"
            >
              <ArrowLeft className="w-3.5 h-3.5" aria-hidden="true" />
              <span>Retour aux agences</span>
            </Link>
          </div>
        </div>

        {/* Hero */}
        <section className="max-w-page mx-auto px-4 md:px-6 pt-8 sm:pt-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {agency.image && (
              <div className="relative overflow-hidden rounded-[2rem] border border-neutral-200/60 shadow-xl order-first">
                <img
                  src={agency.image}
                  alt={agency.name}
                  width={800}
                  height={480}
                  fetchPriority="high"
                  className="w-full h-[280px] sm:h-[380px] object-cover"
                />
                <span className="absolute top-4 left-4 text-2xs font-bold text-white bg-scrim/55 backdrop-blur-md px-3 py-1.5 rounded-full">
                  {agency.shortName}
                </span>
              </div>
            )}

            <div>
              <span className="text-xs font-bold uppercase tracking-label text-brand-ink mb-3 block">
                AGENCE ROULI · {agency.postalCode}
              </span>
              <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-[1.1] text-neutral-900">
                {agency.name}
              </h1>
              <p className="text-sm sm:text-base text-neutral-600 mt-4 leading-relaxed">
                {agency.description}
              </p>

              <div className="mt-6 flex flex-col gap-3 text-sm text-neutral-700">
                <span className="flex items-start gap-2.5">
                  <MapPin className="w-4 h-4 text-brand-ink mt-0.5 shrink-0" aria-hidden="true" />
                  {agency.address} — {agency.postalCode} Monastir
                </span>
                {agency.phone && (
                  <a
                    href={`tel:${agency.phone.replace(/\s/g, '')}`}
                    className="flex items-center gap-2.5 hover:text-brand-ink transition-colors"
                  >
                    <Phone className="w-4 h-4 text-brand-ink shrink-0" aria-hidden="true" />
                    {agency.phone}
                  </a>
                )}
                {agency.hours && (
                  <span className="flex items-center gap-2.5">
                    <Clock className="w-4 h-4 text-brand-ink shrink-0" aria-hidden="true" />
                    {agency.hours}
                  </span>
                )}
                {agency.coordinates && (
                  <span className="flex items-center gap-2.5">
                    <MapPinned className="w-4 h-4 text-brand-ink shrink-0" aria-hidden="true" />
                    {nf4.format(agency.coordinates.lat)}° N, {nf4.format(agency.coordinates.lng)}° E
                  </span>
                )}
              </div>

              <div className="mt-8 flex flex-wrap gap-2.5">
                <Link
                  to={`/vehicules?agency=${agency.id}`}
                  className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-brand-on font-bold text-sm px-6 py-3.5 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] shadow-lg shadow-brand/25 active:scale-95"
                >
                  <span>Voir les véhicules disponibles</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
                {mapUrl && (
                  <a
                    href={mapUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center justify-center gap-2 border border-neutral-300 hover:border-neutral-500 text-neutral-800 font-semibold text-sm px-6 py-3.5 rounded-full transition-colors active:scale-95"
                  >
                    <MapsArrow className="w-4 h-4" />
                    <span>Itinéraire</span>
                  </a>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Details */}
        <section className="max-w-page mx-auto px-4 md:px-6 mt-12 sm:mt-16 grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-brand-ink" aria-hidden="true" />
              <h2 className="text-base font-bold tracking-tight text-neutral-900">
                Affluence de l'agence
              </h2>
            </div>
            <p className="text-xs text-neutral-500">
              Taux d'occupation estimé par heure et par jour, pour choisir le meilleur moment de retrait.
            </p>
            <Suspense
              fallback={
                <div className="mt-5 h-[220px] rounded-2xl bg-neutral-100 animate-pulse" />
              }
            >
              <AgencyLoadChart agencyId={agency.id} />
            </Suspense>
          </div>

          {/* Landmarks + localities */}
          <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-7">
            <div className="flex items-center gap-2 mb-4">
              <Bank className="w-4 h-4 text-brand-ink" aria-hidden="true" />
              <h2 className="text-base font-bold tracking-tight text-neutral-900">
                Points de repère
              </h2>
            </div>

            {agency.landmarks && (
              <div className="flex flex-wrap gap-1.5 mb-4">
                {agency.landmarks.map((l) => (
                  <span
                    key={l}
                    className="text-2xs font-semibold text-neutral-600 bg-neutral-100 px-2.5 py-1 rounded-full"
                  >
                    {l}
                  </span>
                ))}
              </div>
            )}

            {agency.localities && (
              <div className="pt-4 border-t border-neutral-100">
                <div className="text-2xs font-bold uppercase tracking-label text-neutral-500 mb-2">
                  Zones desservies
                </div>
                <ul className="space-y-1.5">
                  {agency.localities.map((loc) => (
                    <li key={loc} className="flex items-center gap-2 text-xs text-neutral-700">
                      <span className="w-1.5 h-1.5 rounded-full bg-brand shrink-0" />
                      {loc}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Vehicles */}
          <div className="lg:col-span-3 bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-7">
            <div className="flex items-center justify-between gap-3 mb-5">
              <div className="flex items-center gap-2">
                <Bicycle className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                <h2 className="text-base font-bold tracking-tight text-neutral-900">
                  Véhicules disponibles dans cette agence
                </h2>
              </div>
              <span className="text-2xs font-bold text-brand-ink bg-brand/10 px-2.5 py-1 rounded-full">
                {vehicles.length} véhicule{vehicles.length > 1 ? 's' : ''}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {vehicles.map((v) => {
                const Icon = v.vehicleType === 'bike' ? Bicycle : Flash;
                return (
                  <Link
                    key={v.id}
                    to={getVehiclePath(v)}
                    className="group flex items-center gap-4 rounded-2xl border border-neutral-200/70 p-3.5 hover:border-brand/60 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
                  >
                    <div className="w-16 h-16 rounded-xl bg-surface border border-neutral-200/60 flex items-center justify-center shrink-0 overflow-hidden">
                      <img
                        src={v.image}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = v.fallbackImage;
                        }}
                        alt={v.name}
                        width={64}
                        height={64}
                        loading="lazy"
                        className="w-full h-full object-contain"
                      />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-xs font-bold text-neutral-900 truncate group-hover:text-brand-ink transition-colors">
                        {v.name}
                      </div>
                      <div className="text-2xs text-neutral-500 truncate">
                        <Icon className="w-3 h-3 text-brand-ink inline -mt-0.5 mr-1" />
                        {v.categoryLabel}
                      </div>
                      <div className="text-2xs font-bold text-brand-ink mt-0.5 tabular-nums">
                        {nf.format(v.pricePerDayDT)}&nbsp;DT / jour
                      </div>
                    </div>
                    <ArrowRight
                      className="w-4 h-4 text-neutral-300 group-hover:text-brand-ink transition-colors shrink-0"
                      aria-hidden="true"
                    />
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
