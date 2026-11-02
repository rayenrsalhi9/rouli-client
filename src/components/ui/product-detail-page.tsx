import { useEffect, useRef, useState } from 'react';
import type { ElementType, FC, ReactNode } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BatteryFull,
  Calendar,
  CheckCircle,
  Clock,
  DashboardSpeed,
  Heart,
  HeartSolid,
  MapPin,
  Phone,
  ShareIos,
  StarSolid,
  Weight,
} from 'iconoir-react';
import { cn } from '@/lib/utils';
import type { CatalogBike } from '../../types';
import type { AgencyItem } from '../../data/mockData';
import { VEHICLE_CATALOG_URL } from '../../data/mockData';

const nf = new Intl.NumberFormat('fr-FR');
const ratingFmt = new Intl.NumberFormat('fr-FR', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const FOCUS_RING =
  'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink';

const SpecPill = ({
  icon: Icon,
  children,
}: {
  icon: ElementType;
  children: ReactNode;
}) => (
  <li className="inline-flex items-center gap-1.5 rounded-full border border-neutral-200 bg-surface-subtle px-3 py-1.5 text-2xs font-medium text-neutral-700">
    <Icon className="h-3.5 w-3.5 text-brand-ink" aria-hidden="true" />
    <span>{children}</span>
  </li>
);

export interface ProductDetailPageProps {
  vehicle: CatalogBike;
  agency?: AgencyItem;
  onReserve: () => void;
}

/**
 * Vehicle detail hero, adapted from the marketplace product-page layout:
 * breadcrumb + save/share, studio image, price and rental CTAs, specs,
 * description, then the pickup agency card.
 *
 * State is local because saving and sharing are browser concerns; booking
 * stays with the page so the existing reservation modal owns that flow.
 */
export const ProductDetailPage: FC<ProductDetailPageProps> = ({
  vehicle,
  agency,
  onReserve,
}) => {
  const vehicleLabel = vehicle.vehicleType === 'scooter' ? 'trottinette' : 'vélo';
  const catalogLabel =
    vehicle.vehicleType === 'scooter'
      ? 'Trottinettes électriques'
      : 'Vélos électriques';
  const catalogHref = VEHICLE_CATALOG_URL[vehicle.vehicleType];
  const agencyHref = agency ? `/agences/${agency.id}` : '/agences';
  const favoriteKey = `rouli:favorite:${vehicle.id}`;

  const [isFavorite, setIsFavorite] = useState(() => {
    try {
      return window.localStorage.getItem(favoriteKey) === '1';
    } catch {
      return false;
    }
  });
  const [shareMessage, setShareMessage] = useState('');
  const shareTimer = useRef<number | undefined>(undefined);

  useEffect(() => {
    try {
      window.localStorage.setItem(favoriteKey, isFavorite ? '1' : '0');
    } catch {
      // Private mode or a full quota: the heart still works for this visit.
    }
  }, [favoriteKey, isFavorite]);

  useEffect(() => () => window.clearTimeout(shareTimer.current), []);

  const handleShare = async () => {
    setShareMessage('');
    try {
      if (navigator.share) {
        try {
          await navigator.share({
            title: vehicle.name,
            text: `Louez le ${vehicle.name} à Monastir`,
            url: window.location.href,
          });
          return;
        } catch (error) {
          if (error instanceof DOMException && error.name === 'AbortError') {
            return;
          }
        }
      }
      await navigator.clipboard.writeText(window.location.href);
      setShareMessage('Lien copié.');
    } catch {
      setShareMessage('Partage indisponible. Copiez l’adresse de la page.');
    }
    window.clearTimeout(shareTimer.current);
    shareTimer.current = window.setTimeout(() => setShareMessage(''), 4000);
  };

  return (
    <article className="rounded-3xl border border-neutral-200/70 bg-white p-5 text-neutral-900 sm:p-7 lg:p-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <nav
          aria-label="Fil d’Ariane"
          className="flex min-w-0 items-center gap-1.5 text-xs text-neutral-500"
        >
          <Link
            to="/"
            className={cn('inline-flex items-center rounded py-1 hover:text-neutral-900 transition-colors', FOCUS_RING)}
          >
            Accueil
          </Link>
          <span aria-hidden="true">/</span>
          <Link
            to={catalogHref}
            className={cn('inline-flex items-center rounded py-1 hover:text-neutral-900 transition-colors', FOCUS_RING)}
          >
            {catalogLabel}
          </Link>
          <span aria-hidden="true">/</span>
          <span
            aria-current="page"
            className="truncate font-semibold text-neutral-900"
          >
            {vehicle.name}
          </span>
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => setIsFavorite((value) => !value)}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `Retirer ${vehicle.name} des favoris`
                : `Ajouter ${vehicle.name} aux favoris`
            }
            title={isFavorite ? 'Retirer des favoris' : 'Ajouter aux favoris'}
            className={cn(
              'inline-flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900',
              isFavorite && 'border-brand/40 bg-brand/10 text-brand-ink',
              FOCUS_RING,
            )}
          >
            {isFavorite ? (
              <HeartSolid className="h-[18px] w-[18px]" aria-hidden="true" />
            ) : (
              <Heart className="h-[18px] w-[18px]" aria-hidden="true" />
            )}
          </button>
          <button
            type="button"
            onClick={handleShare}
            aria-label="Partager ce véhicule"
            title="Partager"
            className={cn(
              'inline-flex h-11 w-11 sm:h-10 sm:w-10 items-center justify-center rounded-full border border-neutral-200 bg-white text-neutral-600 transition-colors hover:border-neutral-300 hover:text-neutral-900',
              FOCUS_RING,
            )}
          >
            <ShareIos className="h-[18px] w-[18px]" aria-hidden="true" />
          </button>
        </div>
      </div>

      {shareMessage && (
        <div
          role="status"
          aria-live="polite"
          className="fixed inset-x-4 bottom-[calc(1.5rem+env(safe-area-inset-bottom))] z-50 mx-auto w-fit max-w-full rounded-full bg-neutral-900 px-4 py-2 text-center text-xs font-medium text-white"
        >
          {shareMessage}
        </div>
      )}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2 lg:gap-x-10 lg:gap-y-5">
        {/* Studio image + pickup context */}
        <div className="flex flex-col gap-4">
          <div className="relative aspect-[3/2] overflow-hidden rounded-2xl border border-neutral-200/80 bg-surface-subtle">
            <img
              src={vehicle.image}
              onError={(event) => {
                (event.currentTarget as HTMLImageElement).src =
                  vehicle.fallbackImage;
              }}
              alt={`${vehicle.name}, ${vehicle.categoryLabel.toLowerCase()}`}
              width={1536}
              height={1024}
              fetchPriority="high"
              style={{ viewTransitionName: `vehicle-${vehicle.id}` }}
              className="h-full w-full object-cover"
            />
            <div className="absolute inset-x-4 top-4 flex items-start justify-between gap-2">
              <span className="max-w-[70%] truncate rounded-full border border-black/5 bg-white/90 px-3 py-1.5 text-2xs font-semibold text-neutral-800 backdrop-blur">
                {vehicle.categoryLabel}
              </span>
              {vehicle.tag && (
                <span className="shrink-0 rounded-full bg-brand px-3 py-1.5 text-2xs font-bold text-brand-on">
                  {vehicle.tag}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex min-w-0 items-center gap-2.5">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand/10 text-brand-ink">
                <MapPin className="h-4 w-4" aria-hidden="true" />
              </span>
              <div className="min-w-0">
                <p className="truncate text-xs font-bold text-neutral-900">
                  Retrait immédiat à Monastir ({vehicle.agencyPostalCode})
                </p>
                <p className="text-2xs text-neutral-500">
                  <strong className="font-semibold text-brand-ink tabular-nums">
                    {nf.format(vehicle.stockAvailable)}
                  </strong>{' '}
                  disponibles aujourd’hui
                </p>
              </div>
            </div>

            <a
              href="#similaires"
              className={cn(
                'inline-flex shrink-0 items-center gap-1.5 self-start rounded py-1 text-xs font-bold text-brand-ink hover:underline sm:self-auto',
                FOCUS_RING,
              )}
            >
              <span>Voir les modèles similaires</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </a>
          </div>
        </div>

        {/* Rental details */}
        <div className="flex min-w-0 flex-col lg:row-span-2">
          <p className="text-2xs font-bold uppercase tracking-label text-brand-ink">
            Location à Monastir
          </p>
          <h1 className="mt-2 text-3xl font-extrabold leading-tight tracking-tight text-neutral-900 sm:text-4xl">
            {vehicle.name}
          </h1>

          <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-neutral-500">
            <span
              className="inline-flex items-center gap-1 font-bold text-neutral-900"
              aria-label={`Note ${ratingFmt.format(vehicle.rating)} sur 5`}
            >
              <StarSolid
                className="h-3.5 w-3.5 text-brand-ink"
                aria-hidden="true"
              />
              <span className="tabular-nums">
                {ratingFmt.format(vehicle.rating)}
              </span>
            </span>
            <span aria-hidden="true">·</span>
            <span className="tabular-nums">
              {nf.format(vehicle.reviewsCount)} avis vérifiés
            </span>
          </div>

          <div className="mt-5 border-y border-neutral-200/80 py-4">
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <span className="text-4xl font-black tracking-tight text-neutral-900 tabular-nums">
                {nf.format(vehicle.pricePerDayDT)}&nbsp;DT
              </span>
              <span className="text-sm font-medium text-neutral-500">
                / jour
              </span>
              <span className="text-xs text-neutral-500 tabular-nums sm:ml-auto">
                ou {nf.format(vehicle.pricePerHourDT)}&nbsp;DT / heure
              </span>
            </div>
            <p className="mt-1.5 text-2xs text-neutral-500">
              0&nbsp;DT d’avance · Annulation sans frais · Paiement au retrait
            </p>
          </div>

          <div className="mt-5 flex flex-col gap-2.5 sm:flex-row">
            <button
              type="button"
              onClick={onReserve}
              className={cn(
                'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full bg-brand px-5 py-3 text-sm font-bold text-brand-on transition-[background-color,transform] hover:bg-brand-dark active:scale-[0.99]',
                FOCUS_RING,
              )}
            >
              <Calendar className="h-4 w-4" aria-hidden="true" />
              <span>Réserver ce {vehicleLabel}</span>
            </button>

            {agency?.phone ? (
              <a
                href={`tel:${agency.phone.replace(/\s/g, '')}`}
                className={cn(
                  'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-50',
                  FOCUS_RING,
                )}
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                <span>Contacter l’agence</span>
              </a>
            ) : (
              <Link
                to={agencyHref}
                className={cn(
                  'inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-full border border-neutral-300 bg-white px-5 py-3 text-sm font-bold text-neutral-900 transition-colors hover:border-neutral-900 hover:bg-neutral-50',
                  FOCUS_RING,
                )}
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                <span>Voir l’agence</span>
              </Link>
            )}
          </div>

          <ul
            aria-label="Caractéristiques clés"
            className="mt-5 flex flex-wrap gap-2"
          >
            <SpecPill icon={BatteryFull}>
              {nf.format(vehicle.rangeKm)}&nbsp;km d’autonomie
            </SpecPill>
            <SpecPill icon={DashboardSpeed}>
              {nf.format(vehicle.maxSpeedKmH)}&nbsp;km/h
            </SpecPill>
            <SpecPill icon={Weight}>
              {nf.format(vehicle.weightKg)}&nbsp;kg
            </SpecPill>
            <SpecPill icon={Clock}>
              {nf.format(vehicle.chargingTimeHours)}&nbsp;h de charge
            </SpecPill>
          </ul>

          <p className="mt-6 text-sm leading-relaxed text-neutral-600">
            {vehicle.description}
          </p>

          <ul className="mt-4 space-y-2 text-xs text-neutral-700">
            {vehicle.features.map((feature) => (
              <li key={feature} className="flex items-start gap-2.5">
                <CheckCircle
                  className="mt-0.5 h-4 w-4 shrink-0 text-brand-ink"
                  aria-hidden="true"
                />
                <span>{feature}</span>
              </li>
            ))}
          </ul>

        </div>

        {/* Pickup agency */}
        <div className="min-w-0 rounded-2xl border border-neutral-200/80 bg-surface-subtle p-4 lg:col-start-1 lg:row-start-2">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <span className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-white">
                {agency?.image ? (
                  <img
                    src={agency.image}
                    alt=""
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <span
                    className="flex h-full w-full items-center justify-center text-sm font-bold text-neutral-500"
                    aria-hidden="true"
                  >
                    {vehicle.agencyName.replace('Agence ', '').charAt(0)}
                  </span>
                )}
              </span>
              <div className="min-w-0">
                <p className="text-2xs font-semibold uppercase tracking-wide text-neutral-500">
                  Agence de retrait
                </p>
                <p className="truncate text-sm font-bold text-neutral-900">
                  {agency?.name ?? vehicle.agencyName}
                </p>
                <p className="mt-0.5 flex items-center gap-1 text-2xs text-neutral-500">
                  <Clock className="h-3 w-3 shrink-0" aria-hidden="true" />
                  <span className="truncate">
                    {agency?.hours ?? '08h00 – 20h00, 7j/7'}
                  </span>
                </p>
              </div>
            </div>

            <Link
              to={agencyHref}
              className={cn(
                'inline-flex items-center gap-1 rounded py-1 text-xs font-bold text-brand-ink hover:underline',
                FOCUS_RING,
              )}
            >
              <span>Voir l’agence</span>
              <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
};
