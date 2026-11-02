import React, { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import {
  ArrowRight,
  BatteryFull,
  ControlSlider,
  DashboardSpeed,
  MapPin,
  NavArrowDown,
  Refresh,
  Search,
  Star,
  X,
} from "iconoir-react";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { ReservationModal } from "../components/ReservationModal";
import { Dialog } from "../components/Dialog";
import {
  CATALOG_BIKES,
  AGENCIES_LIST,
  getVehiclePath,
} from "../data/mockData";
import type {
  AgencyFilter,
  BikeCategory,
  CatalogBike,
  VehicleType,
} from "../types";
import { cn } from "../lib/utils";
import { navigateWithViewTransition } from "../lib/viewTransition";

type SortBy = "popularity" | "price-asc" | "price-desc" | "range-desc";

interface CatalogFilters {
  category: BikeCategory;
  agency: AgencyFilter;
  maxPrice: number;
  minRange: number;
  onlyAvailable: boolean;
  search: string;
}

interface CategoryOption {
  id: BikeCategory;
  label: string;
}

const HEADINGS: Record<
  VehicleType | "all",
  { eyebrow: string; title: string }
> = {
  all: {
    eyebrow: "Catalogue Véhicules Électriques • Monastir",
    title: "Nos Vélos et Trottinettes à Monastir",
  },
  bike: {
    eyebrow: "Vélos Électriques • Monastir",
    title: "Nos Vélos Électriques à Monastir",
  },
  scooter: {
    eyebrow: "Trottinettes Électriques • Monastir",
    title: "Nos Trottinettes Électriques à Monastir",
  },
};

const BIKE_CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Tous les vélos" },
  { id: "urbain", label: "Urbain & Ville" },
  { id: "vtc", label: "VTC & Balade" },
  { id: "vtt", label: "VTT & Sport" },
  { id: "cargo", label: "Cargo & Famille" },
  { id: "pliant", label: "Pliant Compact" },
];

const SCOOTER_CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Toutes les trottinettes" },
  { id: "trottinette", label: "Trottinettes urbaines" },
];

const ALL_CATEGORIES: CategoryOption[] = [
  { id: "all", label: "Tous les véhicules" },
  ...BIKE_CATEGORIES.filter((category) => category.id !== "all"),
  ...SCOOTER_CATEGORIES.filter((category) => category.id !== "all"),
];

const PRICE_MIN = Math.min(...CATALOG_BIKES.map((bike) => bike.pricePerDayDT));
const PRICE_MAX = Math.max(...CATALOG_BIKES.map((bike) => bike.pricePerDayDT));
const RANGE_MIN = Math.min(...CATALOG_BIKES.map((bike) => bike.rangeKm));
const RANGE_MAX = Math.max(...CATALOG_BIKES.map((bike) => bike.rangeKm));

const SORTS: { value: SortBy; label: string }[] = [
  { value: "popularity", label: "Popularité & avis" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "range-desc", label: "Autonomie maximale" },
];

const nf = new Intl.NumberFormat("fr-FR");

const matchesFilters = (
  bike: CatalogBike,
  filters: CatalogFilters,
  type: VehicleType | "all",
): boolean => {
  const query = filters.search.trim().toLowerCase();
  const matchesQuery =
    query === "" ||
    bike.name.toLowerCase().includes(query) ||
    bike.agencyName.toLowerCase().includes(query) ||
    bike.description.toLowerCase().includes(query) ||
    bike.categoryLabel.toLowerCase().includes(query);

  return (
    (type === "all" || bike.vehicleType === type) &&
    (filters.category === "all" || bike.category === filters.category) &&
    (filters.agency === "all" || bike.agencyId === filters.agency) &&
    bike.pricePerDayDT <= filters.maxPrice &&
    bike.rangeKm >= filters.minRange &&
    (!filters.onlyAvailable || bike.stockAvailable > 0) &&
    matchesQuery
  );
};

const sortBikes = (bikes: CatalogBike[], sort: SortBy) => {
  if (sort === "price-asc") return bikes.sort((a, b) => a.pricePerDayDT - b.pricePerDayDT);
  if (sort === "price-desc") return bikes.sort((a, b) => b.pricePerDayDT - a.pricePerDayDT);
  if (sort === "range-desc") return bikes.sort((a, b) => b.rangeKm - a.rangeKm);
  return bikes.sort((a, b) => b.rating - a.rating);
};

const clampParam = (
  raw: string | null,
  fallback: number,
  min: number,
  max: number,
) => {
  if (raw === null || raw === "") return fallback;
  const value = Number(raw);
  return Number.isFinite(value) ? Math.min(max, Math.max(min, value)) : fallback;
};

interface FilterPanelProps {
  filters: CatalogFilters;
  type: VehicleType | "all";
  categories: CategoryOption[];
  onChange: (patch: Partial<CatalogFilters>) => void;
}

const FilterPanel: React.FC<FilterPanelProps> = ({
  filters,
  type,
  categories,
  onChange,
}) => {
  const id = React.useId();
  const categoryCount = (category: BikeCategory) =>
    CATALOG_BIKES.filter((bike) =>
      matchesFilters(bike, { ...filters, category }, type),
    ).length;
  const agencyCount = (agency: AgencyFilter) =>
    CATALOG_BIKES.filter((bike) =>
      matchesFilters(bike, { ...filters, agency }, type),
    ).length;

  return (
    <div className="divide-y divide-neutral-200">
      <fieldset className="pb-5">
        <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
          Catégorie
        </legend>
        <div className="space-y-1">
          {categories.map((category) => {
            const checked = filters.category === category.id;
            const count = categoryCount(category.id);
            return (
              <label
                key={category.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50",
                  count === 0 && !checked && "cursor-not-allowed opacity-40",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-category`}
                  value={category.id}
                  checked={checked}
                  disabled={count === 0 && !checked}
                  onChange={() => onChange({ category: category.id })}
                  className="h-4 w-4 accent-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                />
                <span className="min-w-0 flex-1 truncate">{category.label}</span>
                <span className="text-xs tabular-nums text-neutral-400">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <fieldset className="py-5">
        <legend className="mb-3 text-xs font-bold uppercase tracking-wider text-neutral-500">
          Agence à Monastir
        </legend>
        <div className="space-y-1">
          {AGENCIES_LIST.map((agency) => {
            const checked = filters.agency === agency.id;
            const count = agencyCount(agency.id);
            return (
              <label
                key={agency.id}
                className={cn(
                  "flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 text-sm text-neutral-700 transition-colors hover:bg-neutral-50",
                  count === 0 && !checked && "cursor-not-allowed opacity-40",
                )}
              >
                <input
                  type="radio"
                  name={`${id}-agency`}
                  value={agency.id}
                  checked={checked}
                  disabled={count === 0 && !checked}
                  onChange={() => onChange({ agency: agency.id })}
                  className="h-4 w-4 accent-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                />
                <span className="min-w-0 flex-1 truncate">
                  {agency.shortName}
                </span>
                <span className="text-xs tabular-nums text-neutral-400">
                  {count}
                </span>
              </label>
            );
          })}
        </div>
      </fieldset>

      <div className="py-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor={`${id}-price`}
            className="text-xs font-bold uppercase tracking-wider text-neutral-500"
          >
            Prix max / jour
          </label>
          <span className="text-xs font-extrabold tabular-nums text-brand-ink">
            {filters.maxPrice}&nbsp;DT
          </span>
        </div>
        <input
          id={`${id}-price`}
          type="range"
          min={PRICE_MIN}
          max={PRICE_MAX}
          step={1}
          value={filters.maxPrice}
          aria-valuetext={`${filters.maxPrice} DT par jour`}
          onChange={(event) => onChange({ maxPrice: Number(event.target.value) })}
          className="w-full cursor-pointer accent-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
          <span>Dès {PRICE_MIN}&nbsp;DT</span>
          <span>Jusqu'à {PRICE_MAX}&nbsp;DT</span>
        </div>
      </div>

      <div className="py-5">
        <div className="mb-2 flex items-center justify-between gap-3">
          <label
            htmlFor={`${id}-range`}
            className="text-xs font-bold uppercase tracking-wider text-neutral-500"
          >
            Autonomie min.
          </label>
          <span className="text-xs font-extrabold tabular-nums text-brand-ink">
            {filters.minRange}&nbsp;km
          </span>
        </div>
        <input
          id={`${id}-range`}
          type="range"
          min={RANGE_MIN}
          max={RANGE_MAX}
          step={5}
          value={filters.minRange}
          aria-valuetext={`${filters.minRange} kilomètres minimum`}
          onChange={(event) => onChange({ minRange: Number(event.target.value) })}
          className="w-full cursor-pointer accent-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        />
        <div className="mt-1 flex justify-between text-[11px] text-neutral-400">
          <span>Dès {RANGE_MIN}&nbsp;km</span>
          <span>Jusqu'à {RANGE_MAX}&nbsp;km</span>
        </div>
      </div>

      <label className="flex cursor-pointer items-center justify-between gap-3 py-5">
        <span className="text-xs font-bold uppercase tracking-wider text-neutral-500">
          En stock uniquement
        </span>
        <input
          type="checkbox"
          checked={filters.onlyAvailable}
          onChange={(event) =>
            onChange({ onlyAvailable: event.target.checked })
          }
          className="peer sr-only"
        />
        <span
          aria-hidden="true"
          className="relative h-6 w-11 shrink-0 rounded-full bg-neutral-200 transition-colors duration-200 after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:shadow after:transition-transform after:duration-200 peer-checked:bg-brand-ink peer-checked:after:translate-x-5 peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand-ink motion-reduce:transition-none motion-reduce:after:transition-none"
        />
      </label>
    </div>
  );
};

interface VehicleCardProps {
  bike: CatalogBike;
  index: number;
  onReserve: (bike: CatalogBike) => void;
}

const VehicleCard: React.FC<VehicleCardProps> = ({
  bike,
  index,
  onReserve,
}) => {
  const soldOut = bike.stockAvailable <= 0;
  const navigate = useNavigate();

  const openDetails = (event: React.MouseEvent<HTMLAnchorElement>) => {
    if (
      event.metaKey ||
      event.ctrlKey ||
      event.shiftKey ||
      event.altKey ||
      event.button !== 0
    ) {
      return;
    }
    event.preventDefault();
    navigateWithViewTransition(navigate, getVehiclePath(bike));
  };

  return (
    <motion.article
      layout="position"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.16 } }}
      transition={{
        layout: { type: "spring", visualDuration: 0.4, bounce: 0 },
        opacity: { duration: 0.2, delay: Math.min(index * 0.03, 0.18) },
        y: {
          duration: 0.35,
          delay: Math.min(index * 0.03, 0.18),
          ease: [0.22, 1, 0.36, 1],
        },
      }}
      className="group flex flex-col gap-3"
    >
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-neutral-200/80 bg-surface-subtle">
        <Link
          to={getVehiclePath(bike)}
          onClick={openDetails}
          aria-label={`Voir la fiche de ${bike.name}`}
          className="block h-full w-full p-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        >
          <img
            src={bike.image}
            onError={(event) => {
              (event.currentTarget as HTMLImageElement).src =
                bike.fallbackImage;
            }}
            alt={bike.name}
            width={640}
            height={480}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
            style={{ viewTransitionName: `vehicle-${bike.id}` }}
            className={cn(
              "h-full w-full object-contain transition-transform duration-500 ease-out group-hover:scale-[1.03] motion-reduce:transition-none",
              soldOut && "opacity-60",
            )}
          />
        </Link>

        <span className="pointer-events-none absolute start-3 top-3 max-w-[70%] truncate rounded-full border border-neutral-200 bg-white/90 px-2.5 py-1 text-[11px] font-semibold text-neutral-700 backdrop-blur">
          {bike.categoryLabel}
        </span>

        {soldOut ? (
          <span className="pointer-events-none absolute end-3 top-3 rounded-full border border-neutral-300 bg-white/90 px-2.5 py-1 text-[11px] font-bold text-neutral-700 backdrop-blur">
            Épuisé
          </span>
        ) : bike.tag ? (
          <span className="pointer-events-none absolute end-3 top-3 rounded-full bg-brand/15 px-2.5 py-1 text-[11px] font-bold text-brand-ink">
            {bike.tag}
          </span>
        ) : null}
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex items-start justify-between gap-3">
          <h3 className="min-w-0 text-sm font-bold text-neutral-900">
            <Link
              to={getVehiclePath(bike)}
              onClick={openDetails}
              className="rounded transition-colors hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              {bike.name}
            </Link>
          </h3>
          <span className="shrink-0 text-sm font-extrabold tabular-nums text-neutral-900">
            {bike.pricePerDayDT}&nbsp;DT
            <span className="text-[11px] font-medium text-neutral-500">
              /jour
            </span>
          </span>
        </div>

        <p className="flex items-center gap-1.5 text-xs text-neutral-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-brand-ink" aria-hidden="true" />
          <span className="truncate">{bike.agencyName}</span>
        </p>

        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-neutral-500">
          <span
            className="flex items-center gap-1"
            aria-label={`Note ${bike.rating.toFixed(1)} sur 5, ${bike.reviewsCount} avis`}
          >
            <Star className="h-3.5 w-3.5 fill-brand-ink text-brand-ink" aria-hidden="true" />
            <span className="font-semibold tabular-nums text-neutral-800">
              {bike.rating.toFixed(1)}
            </span>
            <span className="tabular-nums">({nf.format(bike.reviewsCount)})</span>
          </span>
          <span className="flex items-center gap-1">
            <BatteryFull className="h-3.5 w-3.5 text-brand-ink" aria-hidden="true" />
            <span className="tabular-nums">{bike.rangeKm}&nbsp;km</span>
          </span>
          <span className="flex items-center gap-1">
            <DashboardSpeed className="h-3.5 w-3.5 text-brand-ink" aria-hidden="true" />
            <span className="tabular-nums">{bike.maxSpeedKmH}&nbsp;km/h</span>
          </span>
        </div>

        <div className="mt-1 flex items-center gap-2">
          <Link
            to={getVehiclePath(bike)}
            onClick={openDetails}
            className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-200 bg-white px-3.5 py-2 text-xs font-semibold text-neutral-800 transition-colors hover:border-neutral-300 hover:bg-neutral-50 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
          >
            Détails
          </Link>
          <button
            type="button"
            disabled={soldOut}
            onClick={() => onReserve(bike)}
            aria-label={`Réserver ${bike.name}`}
            className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-full bg-brand px-3.5 py-2 text-xs font-bold text-brand-on shadow-xs shadow-brand/25 transition-[background-color,transform,opacity] hover:bg-brand-dark active:scale-95 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink motion-reduce:transition-none"
          >
            {soldOut ? "Indisponible" : "Réserver"}
            {!soldOut && <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />}
          </button>
        </div>
      </div>
    </motion.article>
  );
};

export const BikesCatalogPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [reservingBike, setReservingBike] = useState<CatalogBike | null>(null);

  const setParams = (updates: Record<string, string | null>) => {
    const next = new URLSearchParams(searchParams);
    for (const [key, value] of Object.entries(updates)) {
      if (value === null || value === "") next.delete(key);
      else next.set(key, value);
    }
    setSearchParams(next, { replace: true });
  };

  const rawType = searchParams.get("type");
  const selectedVehicleType: VehicleType | "all" =
    rawType === "bike" || rawType === "scooter" ? rawType : "all";
  const heading = HEADINGS[selectedVehicleType];

  const categories =
    selectedVehicleType === "scooter"
      ? SCOOTER_CATEGORIES
      : selectedVehicleType === "bike"
        ? BIKE_CATEGORIES
        : ALL_CATEGORIES;

  const rawCategory = searchParams.get("cat");
  const selectedCategory: BikeCategory =
    rawCategory && categories.some((category) => category.id === rawCategory)
      ? (rawCategory as BikeCategory)
      : "all";

  const rawAgency = searchParams.get("agency");
  const selectedAgency: AgencyFilter =
    rawAgency && AGENCIES_LIST.some((agency) => agency.id === rawAgency)
      ? (rawAgency as AgencyFilter)
      : "all";

  const maxPrice = clampParam(searchParams.get("price"), PRICE_MAX, PRICE_MIN, PRICE_MAX);
  const minRange = clampParam(searchParams.get("range"), RANGE_MIN, RANGE_MIN, RANGE_MAX);
  const searchQuery = searchParams.get("q") ?? "";
  const rawSort = searchParams.get("sort");
  const sortBy: SortBy =
    rawSort === "price-asc" ||
    rawSort === "price-desc" ||
    rawSort === "range-desc"
      ? rawSort
      : "popularity";
  const onlyAvailable = searchParams.get("stock") !== "0";

  const startDate = searchParams.get("start") ?? undefined;
  const endDate = searchParams.get("end") ?? undefined;

  const filters: CatalogFilters = {
    category: selectedCategory,
    agency: selectedAgency,
    maxPrice,
    minRange,
    onlyAvailable,
    search: searchQuery,
  };

  const filteredBikes = sortBikes(
    CATALOG_BIKES.filter((bike) =>
      matchesFilters(bike, filters, selectedVehicleType),
    ),
    sortBy,
  );

  const categoryLabel =
    categories.find((category) => category.id === selectedCategory)?.label ??
    selectedCategory;
  const agencyLabel =
    AGENCIES_LIST.find((agency) => agency.id === selectedAgency)?.shortName ??
    selectedAgency;

  const activeFilters: { key: string; label: string }[] = [];
  if (selectedCategory !== "all") {
    activeFilters.push({ key: "cat", label: categoryLabel });
  }
  if (selectedAgency !== "all") {
    activeFilters.push({ key: "agency", label: agencyLabel });
  }
  if (maxPrice !== PRICE_MAX) {
    activeFilters.push({ key: "price", label: `Jusqu'à ${maxPrice} DT / jour` });
  }
  if (minRange !== RANGE_MIN) {
    activeFilters.push({ key: "range", label: `Dès ${minRange} km d'autonomie` });
  }
  if (!onlyAvailable) {
    activeFilters.push({ key: "stock", label: "Tous les stocks" });
  }
  if (searchQuery.trim() !== "") {
    activeFilters.push({ key: "q", label: `Recherche : “${searchQuery.trim()}”` });
  }

  const updateFilters = (patch: Partial<CatalogFilters>) => {
    const updates: Record<string, string | null> = {};
    if (patch.category !== undefined) {
      updates.cat = patch.category === "all" ? null : patch.category;
    }
    if (patch.agency !== undefined) {
      updates.agency = patch.agency === "all" ? null : patch.agency;
    }
    if (patch.maxPrice !== undefined) {
      updates.price = patch.maxPrice === PRICE_MAX ? null : String(patch.maxPrice);
    }
    if (patch.minRange !== undefined) {
      updates.range = patch.minRange === RANGE_MIN ? null : String(patch.minRange);
    }
    if (patch.onlyAvailable !== undefined) {
      updates.stock = patch.onlyAvailable ? null : "0";
    }
    if (patch.search !== undefined) {
      updates.q = patch.search.trim() === "" ? null : patch.search;
    }
    setParams(updates);
  };

  const removeFilter = (key: string) => {
    if (key === "cat") updateFilters({ category: "all" });
    else if (key === "agency") updateFilters({ agency: "all" });
    else if (key === "price") updateFilters({ maxPrice: PRICE_MAX });
    else if (key === "range") updateFilters({ minRange: RANGE_MIN });
    else if (key === "stock") updateFilters({ onlyAvailable: true });
    else if (key === "q") updateFilters({ search: "" });
  };

  const resetFilters = () => {
    const next = new URLSearchParams();
    if (selectedVehicleType !== "all") next.set("type", selectedVehicleType);
    if (startDate) next.set("start", startDate);
    if (endDate) next.set("end", endDate);
    setSearchParams(next, { replace: true });
  };

  const hasActiveFilters = activeFilters.length > 0;
  const resultLabel = `${filteredBikes.length} véhicule${filteredBikes.length === 1 ? "" : "s"}`;

  const vehicleTypes: { id: VehicleType | "all"; label: string }[] = [
    { id: "all", label: "Tous" },
    { id: "bike", label: "Vélos" },
    { id: "scooter", label: "Trottinettes" },
  ];

  const filterPanel = (
    <FilterPanel
      filters={filters}
      type={selectedVehicleType}
      categories={categories}
      onChange={updateFilters}
    />
  );

  return (
    <div className="flex min-h-screen w-full flex-col bg-surface font-sans text-ink selection:bg-brand/20 selection:text-black">
      <Navbar />

      <main id="main" tabIndex={-1} className="w-full flex-grow pb-20 pt-nav-lg">
        <section
          data-slot="category-page"
          aria-labelledby="catalog-title"
          className="mx-auto flex w-full max-w-catalog flex-col gap-6 px-4 pt-6 md:px-6 sm:pt-8"
        >
          <h1 id="catalog-title" className="sr-only">
            {heading.title}
          </h1>

          <div className="flex flex-col gap-3 rounded-2xl border border-black/5 bg-white p-4 shadow-2xs sm:p-5">
            <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
              <div className="relative flex-1">
                <label htmlFor="catalog-search" className="sr-only">
                  Rechercher un véhicule par modèle, catégorie ou agence
                </label>
                <Search
                  className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400"
                  aria-hidden="true"
                />
                <input
                  id="catalog-search"
                  name="q"
                  type="search"
                  autoComplete="off"
                  placeholder="Rechercher par modèle, catégorie ou quartier…"
                  value={searchQuery}
                  onChange={(event) => updateFilters({ search: event.target.value })}
                  className="w-full rounded-xl border border-transparent bg-neutral-100/80 py-2.5 pl-10 pr-10 text-sm text-neutral-900 transition-colors hover:bg-neutral-100 focus-visible:border-brand-ink focus-visible:bg-white focus-visible:outline-none"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => updateFilters({ search: "" })}
                    aria-label="Effacer la recherche"
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-2 text-neutral-400 transition-colors hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                  >
                    <X className="h-4 w-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                <div className="relative min-w-0 flex-1 sm:min-w-44">
                  <label htmlFor="catalog-sort" className="sr-only">
                    Trier les véhicules
                  </label>
                  <select
                    id="catalog-sort"
                    name="sort"
                    value={sortBy}
                    onChange={(event) => {
                      const value = event.target.value as SortBy;
                      setParams({ sort: value === "popularity" ? null : value });
                    }}
                    className="w-full cursor-pointer appearance-none rounded-xl border border-transparent bg-neutral-100 px-3.5 py-2.5 pr-9 text-xs font-semibold text-neutral-900 transition-colors hover:bg-neutral-200/70 focus-visible:border-brand-ink focus-visible:bg-white focus-visible:outline-none"
                  >
                    {SORTS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <NavArrowDown
                    className="pointer-events-none absolute right-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-neutral-500"
                    aria-hidden="true"
                  />
                </div>

                <button
                  type="button"
                  onClick={() => setMobileFiltersOpen(true)}
                  aria-expanded={mobileFiltersOpen}
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-neutral-900 px-3.5 py-2.5 text-xs font-semibold text-white transition-colors hover:bg-neutral-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink lg:hidden"
                >
                  <ControlSlider className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Filtres</span>
                  {hasActiveFilters && (
                    <span className="tabular-nums">({activeFilters.length})</span>
                  )}
                </button>
              </div>
            </div>

            <LayoutGroup>
              <div
                role="group"
                aria-label="Type de véhicule"
                className="flex items-center gap-2 overflow-x-auto border-t border-neutral-100 pt-3 pb-1 scrollbar-none"
              >
                <span className="mr-1 whitespace-nowrap text-xs font-semibold text-neutral-500">
                  Type :
                </span>
                {vehicleTypes.map((type) => {
                  const isActive = selectedVehicleType === type.id;
                  return (
                    <button
                      key={type.id}
                      type="button"
                      aria-pressed={isActive}
                      onClick={() =>
                        setParams({
                          type: type.id === "all" ? null : type.id,
                          cat: null,
                        })
                      }
                      className={cn(
                        "relative whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink",
                        isActive
                          ? "text-white"
                          : "bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70",
                      )}
                    >
                      {isActive && (
                        <motion.span
                          layoutId="catalog-type-pill"
                          aria-hidden="true"
                          className="absolute inset-0 rounded-full bg-neutral-900 shadow-xs"
                          transition={{ type: "spring", visualDuration: 0.26, bounce: 0 }}
                        />
                      )}
                      <span className="relative z-10">{type.label}</span>
                    </button>
                  );
                })}
              </div>
            </LayoutGroup>
          </div>

          <div className="grid items-start gap-8 lg:grid-cols-[15rem_minmax(0,1fr)] lg:gap-12">
            <aside
              data-slot="category-filters"
              aria-label="Filtres du catalogue"
              className="hidden lg:sticky lg:top-nav-sticky lg:block lg:self-start"
            >
              <div className="rounded-2xl border border-neutral-200/80 bg-white p-5 shadow-2xs">
                <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                  <span className="text-sm font-bold text-neutral-900">
                    Filtres
                  </span>
                  <button
                    type="button"
                    onClick={resetFilters}
                    disabled={!hasActiveFilters}
                    className="inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-semibold text-brand-ink transition-colors hover:bg-brand/10 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                  >
                    <Refresh className="h-3 w-3" aria-hidden="true" />
                    Tout effacer
                  </button>
                </div>
                <div className="pt-5">{filterPanel}</div>
              </div>
            </aside>

            <div className="flex min-w-0 flex-col gap-5">
              <div className="flex flex-col gap-3 border-b border-neutral-200 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <p
                    aria-live="polite"
                    aria-atomic="true"
                    className="text-sm font-semibold text-neutral-700"
                  >
                    <span className="font-extrabold tabular-nums text-neutral-900">
                      {filteredBikes.length}
                    </span>{" "}
                    véhicule{filteredBikes.length === 1 ? "" : "s"} à Monastir
                  </p>
                  <span className="text-xs text-neutral-500">
                    Tri : {SORTS.find((sort) => sort.value === sortBy)?.label}
                  </span>
                </div>

                {hasActiveFilters && (
                  <ul
                    data-slot="active-filters"
                    aria-label="Filtres actifs"
                    className="flex flex-wrap items-center gap-2"
                  >
                    <AnimatePresence initial={false}>
                      {activeFilters.map((filter) => (
                        <motion.li
                          key={filter.key}
                          layout
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.95 }}
                          transition={{ duration: 0.18 }}
                        >
                          <span className="inline-flex h-7 items-center gap-1 rounded-full border border-neutral-200 bg-white ps-2.5 pe-1 text-xs font-medium text-neutral-700">
                            <span className="max-w-56 truncate">{filter.label}</span>
                            <button
                              type="button"
                              aria-label={`Retirer ${filter.label}`}
                              onClick={() => removeFilter(filter.key)}
                              className="grid h-5 w-5 place-items-center rounded-full text-neutral-500 transition-colors hover:bg-neutral-100 hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                            >
                              <X className="h-3 w-3" aria-hidden="true" />
                            </button>
                          </span>
                        </motion.li>
                      ))}
                    </AnimatePresence>
                    <li>
                      <button
                        type="button"
                        onClick={resetFilters}
                        className="rounded-full px-2 py-1 text-xs font-semibold text-neutral-500 transition-colors hover:text-neutral-900 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                      >
                        Tout effacer
                      </button>
                    </li>
                  </ul>
                )}
              </div>

              {filteredBikes.length > 0 ? (
                <div
                  data-slot="product-grid"
                  className="grid grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 xl:grid-cols-3"
                >
                  <AnimatePresence mode="popLayout" initial={false}>
                    {filteredBikes.map((bike, index) => (
                      <VehicleCard
                        key={bike.id}
                        bike={bike}
                        index={index}
                        onReserve={setReservingBike}
                      />
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  data-slot="product-empty"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  className="flex flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-neutral-300 bg-white px-6 py-16 text-center"
                >
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-neutral-100 text-neutral-400">
                    <Search className="h-6 w-6" aria-hidden="true" />
                  </div>
                  <div className="max-w-sm">
                    <h2 className="text-base font-bold text-neutral-900">
                      Aucun véhicule ne correspond à vos filtres
                    </h2>
                    <p className="mt-1 text-sm text-neutral-500">
                      Essayez d'élargir la recherche, de changer d'agence ou
                      d'augmenter le tarif maximum.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-2 rounded-full bg-brand px-5 py-2.5 text-xs font-bold text-brand-on shadow-xs shadow-brand/25 transition-[background-color,transform] hover:bg-brand-dark active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink motion-reduce:transition-none"
                  >
                    <Refresh className="h-3.5 w-3.5" aria-hidden="true" />
                    Réinitialiser les critères
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </section>
      </main>

      {reservingBike && (
        <ReservationModal
          bike={reservingBike}
          onClose={() => setReservingBike(null)}
          startDate={startDate}
          endDate={endDate}
        />
      )}

      {mobileFiltersOpen && (
        <Dialog
          label="Filtres de recherche"
          variant="sheet"
          onClose={() => setMobileFiltersOpen(false)}
        >
          {({ titleId, requestClose }) => (
            <div className="space-y-5">
              <div className="flex items-center justify-between border-b border-neutral-200 pb-3">
                <div>
                  <h2 id={titleId} className="text-base font-bold text-neutral-900">
                    Filtres de recherche
                  </h2>
                  <p className="text-xs text-neutral-500">
                    Les résultats se mettent à jour automatiquement.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={requestClose}
                  aria-label="Fermer les filtres"
                  className="rounded-full p-2 text-neutral-400 transition-colors hover:text-neutral-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              {filterPanel}

              <div className="flex gap-2 border-t border-neutral-200 pt-4">
                <button
                  type="button"
                  onClick={resetFilters}
                  disabled={!hasActiveFilters}
                  className="inline-flex flex-1 items-center justify-center rounded-full border border-neutral-200 bg-white px-4 py-3 text-xs font-semibold text-neutral-800 transition-colors hover:bg-neutral-50 disabled:cursor-not-allowed disabled:opacity-40 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  Tout effacer
                </button>
                <button
                  type="button"
                  onClick={requestClose}
                  className="inline-flex flex-[1.4] items-center justify-center rounded-full bg-brand px-4 py-3 text-xs font-bold text-brand-on shadow-xs shadow-brand/25 transition-[background-color,transform] hover:bg-brand-dark active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink motion-reduce:transition-none"
                >
                  {resultLabel}
                </button>
              </div>
            </div>
          )}
        </Dialog>
      )}

      <Footer />
    </div>
  );
};
