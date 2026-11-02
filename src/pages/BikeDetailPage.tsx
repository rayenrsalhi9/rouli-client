import { useState, useMemo, lazy, Suspense } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import { AnimatePresence } from 'motion/react';
import {
  ArrowRight,
  BatteryFull,
  Calendar,
  CheckCircle,
  ControlSlider,
  MapPin,
  Medal,
  Star,
} from 'iconoir-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { ReservationModal } from '../components/ReservationModal';
import { ProductDetailPage } from '../components/ui/product-detail-page';

// Charts pull in the visx + motion stack — load them only on vehicle pages.
const VehicleCharts = lazy(() =>
  import('../components/VehicleCharts').then((m) => ({ default: m.VehicleCharts }))
);
import {
  getAgencyById,
  getBikeById,
  getSimilarBikes,
  getVehiclePath,
  VEHICLE_CATALOG_URL,
} from '../data/mockData';

const nf = new Intl.NumberFormat('fr-FR');

export function BikeDetailPage() {
  const { bikeId } = useParams<{ bikeId: string }>();
  const [searchParams] = useSearchParams();
  const startDate = searchParams.get('start') ?? undefined;
  const endDate = searchParams.get('end') ?? undefined;

  const bike = useMemo(() => (bikeId ? getBikeById(bikeId) : undefined), [bikeId]);
  const agency = useMemo(() => (bike ? getAgencyById(bike.agencyId) : undefined), [bike]);
  const similarBikes = useMemo(() => (bike ? getSimilarBikes(bike.id, 3) : []), [bike]);

  // Reservation modal state
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleOpenReservation = () => {
    setIsModalOpen(true);
  };

  if (!bike) {
    return (
      <div className="min-h-screen flex flex-col bg-surface text-neutral-900 font-sans">
        <Navbar />
        <main id="main" tabIndex={-1} className="flex-1 pt-nav pb-20 flex flex-col items-center justify-center px-4 text-center">
          <h1 className="text-2xl font-extrabold mb-2">Véhicule introuvable</h1>
          <p className="text-sm text-neutral-500 mb-6">
            Ce véhicule n’existe pas ou n’est plus disponible dans notre catalogue.
          </p>
          <Link
            to="/vehicules"
            className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-brand-on font-bold text-xs px-5 py-3 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
          >
            <span>Retour au catalogue</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const vehicleLabel = bike.vehicleType === 'scooter' ? 'trottinette' : 'vélo';
  const sectionBase = VEHICLE_CATALOG_URL[bike.vehicleType];

  return (
    <div className="min-h-screen flex flex-col bg-surface text-neutral-900 font-sans selection:bg-brand/20 selection:text-neutral-900">
      <Navbar />

      <main id="main" tabIndex={-1} className="flex-1 pt-nav pb-20">
        <div className="max-w-catalog mx-auto px-4 sm:px-6 pt-6 sm:pt-8">
          <ProductDetailPage
            key={bike.id}
            vehicle={bike}
            agency={agency}
            onReserve={handleOpenReservation}
          />
        </div>

        {/* SPECIFICATIONS & ACCESSORIES */}
        <section className="max-w-catalog mx-auto px-4 sm:px-6 mt-10 sm:mt-12">
          <div className="mb-5">
            <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-neutral-900">
              Caractéristiques et équipements
            </h2>
            <p className="mt-1 text-xs text-neutral-500">
              Tout ce qu’il faut savoir avant de réserver votre {vehicleLabel}.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Specs table */}
            <div className="lg:col-span-7 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80">
              <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight mb-4 flex items-center gap-2">
                <ControlSlider className="w-5 h-5 text-brand-ink" aria-hidden="true" />
                <span>Fiche technique</span>
              </h3>

              <div className="divide-y divide-neutral-100 text-xs">
                <div className="py-3 flex justify-between gap-4">
                  <span className="font-medium text-neutral-500">Motorisation</span>
                  <span className="font-semibold text-neutral-900 text-right">{bike.motorType}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="font-medium text-neutral-500">Couple maximal</span>
                  <span className="font-semibold text-neutral-900 text-right tabular-nums">
                    {nf.format(bike.motorTorqueNm)}&nbsp;Nm
                  </span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="font-medium text-neutral-500">Batterie</span>
                  <span className="font-semibold text-neutral-900 text-right">{bike.batteryCapacity}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="font-medium text-neutral-500">Transmission</span>
                  <span className="font-semibold text-neutral-900 text-right">{bike.transmission}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="font-medium text-neutral-500">Système de freinage</span>
                  <span className="font-semibold text-neutral-900 text-right">{bike.brakes}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="font-medium text-neutral-500">Châssis et cadre</span>
                  <span className="font-semibold text-neutral-900 text-right">{bike.frameMaterial}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="font-medium text-neutral-500">Pneumatiques</span>
                  <span className="font-semibold text-neutral-900 text-right">{bike.wheelSize}</span>
                </div>
                <div className="py-3 flex justify-between gap-4">
                  <span className="font-medium text-neutral-500">Connectivité et sécurité</span>
                  <span className="font-semibold text-neutral-900 text-right">{bike.connectivity}</span>
                </div>
              </div>
            </div>

            {/* Included accessories */}
            <div className="lg:col-span-5 bg-white rounded-3xl p-6 sm:p-8 border border-neutral-200/80 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-extrabold text-neutral-900 tracking-tight mb-2 flex items-center gap-2">
                  <Medal className="w-5 h-5 text-brand-ink" aria-hidden="true" />
                  <span>Inclus dans la location</span>
                </h3>
                <p className="text-xs text-neutral-500 mb-6">
                  Remis sans supplément au retrait de votre coupon à l’agence de Monastir.
                </p>

                <div className="space-y-3">
                  {bike.includedAccessories.map((acc) => (
                    <div key={acc} className="flex items-start gap-3 p-3 bg-neutral-50 rounded-xl border border-neutral-100 text-xs">
                      <div className="w-6 h-6 rounded-full bg-brand/10 text-brand-ink flex items-center justify-center shrink-0 mt-0.5">
                        <CheckCircle className="w-3.5 h-3.5" aria-hidden="true" />
                      </div>
                      <span className="font-medium text-neutral-800">{acc}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-neutral-100">
                <button
                  type="button"
                  onClick={handleOpenReservation}
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-brand-on font-semibold text-xs py-3.5 px-5 rounded-full transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  <Calendar className="w-4 h-4" aria-hidden="true" />
                  <span>Choisir mes dates pour ce {vehicleLabel}</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* VEHICLE ANALYTICS CHARTS */}
        <Suspense
          fallback={
            <section className="max-w-catalog mx-auto px-4 sm:px-6 mt-12 mb-16">
              <div className="h-6 w-52 rounded-md bg-neutral-200/70 mb-4" />
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 h-80 rounded-3xl bg-white border border-neutral-200/80" />
                <div className="lg:col-span-5 h-80 rounded-3xl bg-white border border-neutral-200/80" />
              </div>
            </section>
          }
        >
          <VehicleCharts vehicle={bike} />
        </Suspense>

        {/* SIMILAR VEHICLES */}
        <section className="max-w-catalog mx-auto px-4 sm:px-6">
          <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2
                id="similaires"
                tabIndex={-1}
                className="scroll-mt-24 rounded text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-ink"
              >
                Vous aimerez aussi
              </h2>
              <p className="mt-1 text-xs text-neutral-500">
                D’autres modèles disponibles à Monastir — comparez autonomie, tarif et agence.
              </p>
            </div>
            <Link
              to={sectionBase}
              className="shrink-0 text-xs font-semibold text-brand-ink hover:underline flex items-center gap-1 rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              <span>Voir tout le catalogue</span>
              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {similarBikes.map((simBike) => (
              <div
                key={simBike.id}
                className="bg-white rounded-3xl p-5 border border-neutral-200/80 hover:border-brand/60 transition-[color,background-color,border-color,box-shadow,transform,opacity] flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="text-2xs font-semibold text-neutral-700 bg-neutral-100 px-2.5 py-1 rounded-full">
                      {simBike.categoryLabel}
                    </span>
                    <span className="text-xs font-bold text-neutral-800 flex items-center gap-1">
                      <Star className="w-3 h-3 fill-brand-ink text-brand-ink" aria-hidden="true" />
                      <span className="tabular-nums">{nf.format(simBike.rating)}</span>
                    </span>
                  </div>

                  <Link to={getVehiclePath(simBike)} className="block rounded-2xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink">
                    <div className="w-full aspect-[16/10] bg-surface-subtle rounded-2xl flex items-center justify-center p-3 mb-4 overflow-hidden">
                      <img
                        src={simBike.image}
                        onError={(e) => {
                          (e.currentTarget as HTMLImageElement).src = simBike.fallbackImage;
                        }}
                        alt={simBike.name}
                        width={480}
                        height={300}
                        loading="lazy"
                        className="w-full h-full object-contain transition-transform duration-500 group-hover:scale-105"
                      />
                    </div>
                    <h3 className="font-bold text-neutral-900 group-hover:text-brand-ink transition-colors mb-1 truncate">
                      {simBike.name}
                    </h3>
                  </Link>

                  <p className="text-2xs text-neutral-500 line-clamp-2 mb-3">
                    {simBike.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs text-neutral-600 mb-4">
                    <BatteryFull className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                    <span className="tabular-nums">{nf.format(simBike.rangeKm)}&nbsp;km</span>
                    <span aria-hidden="true">·</span>
                    <MapPin className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                    <span className="truncate">{simBike.agencyName.replace('Agence ', '')}</span>
                  </div>
                </div>

                <div className="pt-3 border-t border-neutral-100 flex items-center justify-between">
                  <div className="text-base font-extrabold text-neutral-900 tabular-nums">
                    {nf.format(simBike.pricePerDayDT)}&nbsp;DT{' '}
                    <span className="text-xs font-normal text-neutral-500">/ j</span>
                  </div>
                  <Link
                    to={getVehiclePath(simBike)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-neutral-900 bg-neutral-100 hover:bg-neutral-200/80 px-3.5 py-1.5 rounded-full transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                  >
                    <span>Détails</span>
                    <ArrowRight className="w-3 h-3" aria-hidden="true" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <AnimatePresence>
        {isModalOpen && (
          <ReservationModal
            bike={bike}
            onClose={() => setIsModalOpen(false)}
            startDate={startDate}
            endDate={endDate}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}
