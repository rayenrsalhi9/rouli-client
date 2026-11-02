import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Blobatar } from '@blobatar/react';
import 'blobatar/motion.css';
import {
  Mail,
  Phone,
  MapPin,
  Calendar,
  Percentage,
  QrCode,
  ClockRotateRight,
  Star,
  ShieldCheck,
  Settings,
  NavArrowRight,
  Clock,
  CheckCircle,
  XmarkCircle,
  Sparks,
  Bicycle,
  Flash,
  ArrowRight,
  BadgeCheck,
  CreditCard,
  Bell,
  Medal,
  EditPencil,
} from 'iconoir-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { Reveal } from '../components/Reveal';
import {
  AGENCIES_LIST,
  USER_PROFILE,
  USER_COUPONS,
  USER_RESERVATIONS,
  getBikeById,
  getVehiclePath,
  getUserStats,
  type ReservationStatus,
} from '../data/mockData';

const riseIn = (delay: number) => ({
  initial: { opacity: 0, y: 18 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, delay, ease: [0.22, 1, 0.36, 1] as const },
});

const nf = new Intl.NumberFormat('fr-FR');
const dfLong = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
const dfShort = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** Parse a `YYYY-MM-DD` string as a *local* date, not UTC midnight. */
const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const formatDate = (iso: string) => dfLong.format(parseISODate(iso));
const formatShort = (iso: string) => dfShort.format(parseISODate(iso));

const agencyName = (agencyId: string) =>
  AGENCIES_LIST.find((a) => a.id === agencyId)?.name ?? 'Agence Rouli';

const reservationBadge: Record<
  ReservationStatus,
  { label: string; className: string; icon: React.ElementType }
> = {
  active: { label: 'En cours', className: 'text-brand-ink bg-brand/10', icon: Clock },
  completed: { label: 'Terminée', className: 'text-neutral-600 bg-neutral-100', icon: CheckCircle },
  cancelled: { label: 'Annulée', className: 'text-red-600 bg-red-50', icon: XmarkCircle },
};

export const ProfilePage: React.FC = () => {
  const stats = getUserStats();

  // Editable copy of the profile. The demo has no backend, so edits live in
  // component state — but they are real, reversible, and announced.
  const [profile, setProfile] = useState({
    fullName: USER_PROFILE.fullName,
    email: USER_PROFILE.email,
    phone: USER_PROFILE.phone,
    city: USER_PROFILE.city,
    address: USER_PROFILE.address,
  });
  const [editing, setEditing] = useState(false);
  const [saveNotice, setSaveNotice] = useState('');
  const activeCoupons = USER_COUPONS.filter((c) => c.status === 'active');
  const upcoming = USER_RESERVATIONS.find((r) => r.status === 'active');
  const pastReservations = USER_RESERVATIONS.filter((r) => r.status !== 'active');
  const nextRewardAt = 1500;
  const loyaltyProgress = Math.min(100, Math.round((USER_PROFILE.loyaltyPoints / nextRewardAt) * 100));

  const statCards = [
    { label: 'Trajets réalisés', value: stats.rides, suffix: '', icon: ClockRotateRight },
    { label: 'Jours de location', value: stats.totalDays, suffix: '', icon: Calendar },
    { label: 'Total dépensé', value: stats.totalDT, suffix: '\u00a0DT', icon: CreditCard },
    { label: 'CO₂ économisé', value: stats.co2SavedKg, suffix: ' kg', icon: Sparks },
  ];

  const infoRows = [
    { label: 'Nom complet', value: profile.fullName, icon: BadgeCheck },
    { label: 'Adresse email', value: profile.email, icon: Mail },
    { label: 'Téléphone', value: profile.phone, icon: Phone },
    { label: 'Ville', value: `${profile.city}, Tunisie`, icon: MapPin },
    { label: 'Adresse', value: profile.address, icon: MapPin },
    { label: 'Membre depuis', value: formatDate(USER_PROFILE.memberSince), icon: Calendar },
  ];

  const profileFields = [
    { id: 'profile-full-name', label: 'Nom complet', type: 'text', autoComplete: 'name', key: 'fullName' as const },
    { id: 'profile-email', label: 'Adresse email', type: 'email', autoComplete: 'email', key: 'email' as const },
    { id: 'profile-phone', label: 'Téléphone', type: 'tel', autoComplete: 'tel', key: 'phone' as const },
    { id: 'profile-city', label: 'Ville', type: 'text', autoComplete: 'address-level2', key: 'city' as const },
    { id: 'profile-address', label: 'Adresse', type: 'text', autoComplete: 'street-address', key: 'address' as const },
  ];

  const startEditing = () => {
    setEditing(true);
    setSaveNotice('');
    requestAnimationFrame(() => document.getElementById('profile-full-name')?.focus());
  };

  const saveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setEditing(false);
    setSaveNotice('Profil mis à jour.');
  };

  return (
    <div className="w-full min-h-screen bg-surface text-ink flex flex-col font-sans selection:bg-brand/20 selection:text-black">
      <Navbar />

      <main id="main" tabIndex={-1} className="w-full pt-nav flex flex-col items-center">
        {/* En-tête profil */}
        <section className="w-full bg-surface">
          <div className="max-w-page w-full mx-auto px-4 md:px-6 py-12 sm:py-16">
            <motion.div {...riseIn(0)} className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
              <Blobatar
                name={USER_PROFILE.avatarSeed}
                hue={145}
                animate="hover"
                size={104}
                className="w-24 h-24 sm:w-26 sm:h-26 rounded-full border-2 border-neutral-300 shrink-0"
              />

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-neutral-900">
                    {profile.fullName}
                  </h1>
                  <span className="inline-flex items-center gap-1 text-2xs font-bold text-brand-ink bg-brand/10 px-2.5 py-1 rounded-full">
                    <Medal className="w-3 h-3" aria-hidden="true" />
                    Membre Gold
                  </span>
                </div>

                <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-neutral-600">
                  <span className="flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                    {profile.email}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                    {profile.phone}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                    {profile.city}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <ShieldCheck className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                    Compte vérifié
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={startEditing}
                  aria-controls="profile-editor"
                  className="inline-flex items-center gap-2 bg-brand hover:bg-brand-dark text-brand-on font-bold text-xs px-5 py-3 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] shadow-sm shadow-brand/25 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  <EditPencil className="w-3.5 h-3.5" aria-hidden="true" />
                  Modifier le profil
                </button>
                <Link
                  to="/vehicules"
                  className="inline-flex items-center gap-2 border border-neutral-300 hover:border-neutral-500 text-neutral-800 font-semibold text-xs px-5 py-3 rounded-full transition-colors active:scale-95"
                >
                  Réserver un véhicule
                </Link>
              </div>
            </motion.div>

            {/* Statistiques */}
            <motion.div {...riseIn(0.1)} className="mt-10 grid grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((s) => (
                <div key={s.label} className="bg-surface rounded-2xl border border-neutral-200/70 p-5">
                  <s.icon className="w-4 h-4 text-brand-ink mb-3" aria-hidden="true" />
                  <div className="text-2xl sm:text-3xl font-extrabold text-neutral-900 tracking-tight tabular-nums">
                    {s.value}
                    <span className="text-sm font-bold text-neutral-500">{s.suffix}</span>
                  </div>
                  <div className="text-2xs text-neutral-500 font-medium mt-1">{s.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        <section className="w-full max-w-page mx-auto px-4 md:px-6 py-12 sm:py-16">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Colonne principale */}
            <div className="lg:col-span-2 flex flex-col gap-6">
              {/* Réservation en cours */}
              {upcoming && (() => {
                const vehicle = getBikeById(upcoming.vehicleId);
                if (!vehicle) return null;
                return (
                  <Reveal className="w-full">
                    <div className="bg-neutral-900 text-white rounded-3xl p-6 sm:p-7 relative overflow-hidden">
                      <div className="absolute -right-10 -top-10 w-40 h-40 bg-brand/20 rounded-full blur-3xl pointer-events-none" />
                      <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
                        <img
                          src={vehicle.image}
                          onError={(e) => {
                            (e.currentTarget as HTMLImageElement).src = vehicle.fallbackImage;
                          }}
                          alt={vehicle.name}
                          width={160}
                          height={112}
                          className="w-full sm:w-40 h-28 object-contain bg-white/5 rounded-2xl shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <span className="inline-flex items-center gap-1.5 text-2xs font-bold uppercase tracking-label text-brand">
                            <Clock className="w-3 h-3" aria-hidden="true" />
                            Réservation en cours
                          </span>
                          <h2 className="text-lg font-bold tracking-tight mt-1.5">{vehicle.name}</h2>
                          <p className="text-xs text-neutral-400 mt-1">
                            {agencyName(upcoming.agencyId)} • Du {formatShort(upcoming.startDate)} au{' '}
                            {formatShort(upcoming.endDate)} ({upcoming.days} jour{upcoming.days > 1 ? 's' : ''})
                          </p>
                          <div className="mt-3 flex flex-wrap items-center gap-3">
                            <span className="text-sm font-extrabold text-white tabular-nums">
                              {nf.format(upcoming.totalDT)}&nbsp;DT
                            </span>
                            <Link
                              to={getVehiclePath(vehicle)}
                              className="inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                            >
                              Voir le véhicule
                              <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                );
              })()}

              {/* Coupons actifs */}
              <Reveal className="w-full">
                <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-7">
                  <div className="flex items-center justify-between gap-3 mb-5">
                    <div className="flex items-center gap-2">
                      <Percentage className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                      <h2 className="text-lg font-bold tracking-tight text-neutral-900">Mes coupons</h2>
                      <span className="text-2xs font-bold text-brand-ink bg-brand/10 px-2 py-0.5 rounded-full">
                        {activeCoupons.length} actif{activeCoupons.length > 1 ? 's' : ''}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-4">
                    {activeCoupons.map((coupon) => {
                      const vehicle = getBikeById(coupon.vehicleId);
                      return (
                        <div
                          key={coupon.id}
                          className="rounded-2xl border-2 border-dashed border-brand/40 bg-surface-muted p-5"
                        >
                          <div className="flex items-start justify-between gap-4 pb-3 border-b border-neutral-200/70">
                            <div>
                              <span className="text-3xs text-neutral-400 uppercase font-bold tracking-wider">
                                Code Coupon Digital
                              </span>
                              <div className="text-lg font-black text-neutral-900 tracking-wider">
                                {coupon.code}
                              </div>
                            </div>
                            <QrCode className="w-10 h-10 text-neutral-900 shrink-0" aria-hidden="true" />
                          </div>

                          <div className="mt-3 space-y-1.5 text-xs text-neutral-700">
                            <div className="flex justify-between gap-4">
                              <span className="text-neutral-500">Véhicule :</span>
                              <span className="font-bold text-neutral-900 text-right">
                                {vehicle?.name ?? 'Véhicule Rouli'}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-neutral-500">Agence de retrait :</span>
                              <span className="font-semibold text-neutral-900 text-right">
                                {agencyName(coupon.agencyId)}
                              </span>
                            </div>
                            <div className="flex justify-between gap-4">
                              <span className="text-neutral-500">Validité :</span>
                              <span className="font-medium text-neutral-800 text-right">
                                Du {formatShort(coupon.startDate)} au {formatShort(coupon.endDate)}
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-neutral-200/60 font-bold">
                              <span>Montant sur place :</span>
                              <span className="text-brand-ink tabular-nums">
                                {nf.format(coupon.totalDT)}&nbsp;DT
                              </span>
                            </div>
                          </div>

                          <div className="mt-4 flex flex-wrap gap-2">
                            {vehicle && (
                              <Link
                                to={getVehiclePath(vehicle)}
                                className="inline-flex items-center gap-1.5 bg-brand hover:bg-brand-dark text-brand-on font-bold text-xs px-4 py-2 rounded-full transition-[color,background-color,border-color,box-shadow,transform,opacity] active:scale-95"
                              >
                                <span>Détails du véhicule</span>
                                <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                              </Link>
                            )}
                            <Link
                              to={`/agences/${coupon.agencyId}`}
                              className="inline-flex items-center gap-1.5 border border-neutral-300 hover:border-neutral-500 text-neutral-800 font-semibold text-xs px-4 py-2 rounded-full transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                            >
                              <MapPin className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                              <span>Voir l'agence</span>
                            </Link>
                          </div>
                        </div>
                      );
                    })}

                    {activeCoupons.length === 0 && (
                      <p className="text-xs text-neutral-500 text-center py-6">
                        Aucun coupon actif pour le moment.
                      </p>
                    )}
                  </div>
                </div>
              </Reveal>

              {/* Historique des réservations */}
              <Reveal className="w-full">
                <div className="bg-white rounded-3xl border border-neutral-200/80 p-6 sm:p-7">
                  <div className="flex items-center gap-2 mb-5">
                    <ClockRotateRight className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                    <h2 className="text-lg font-bold tracking-tight text-neutral-900">
                      Historique des réservations
                    </h2>
                  </div>

                  <div className="divide-y divide-neutral-100">
                    {pastReservations.map((res) => {
                      const vehicle = getBikeById(res.vehicleId);
                      const badge = reservationBadge[res.status];
                      const Icon = vehicle?.vehicleType === 'scooter' ? Flash : Bicycle;
                      return (
                        <div key={res.id} className="flex items-center gap-4 py-4">
                          <div className="w-14 h-14 rounded-2xl bg-surface border border-neutral-200/70 flex items-center justify-center shrink-0 overflow-hidden">
                            {vehicle ? (
                              <img
                                src={vehicle.image}
                                onError={(e) => {
                                  (e.currentTarget as HTMLImageElement).src = vehicle.fallbackImage;
                                }}
                                alt={vehicle.name}
                                width={56}
                                height={56}
                                loading="lazy"
                                className="w-full h-full object-contain"
                              />
                            ) : (
                              <Icon className="w-5 h-5 text-brand-ink" />
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-neutral-900 truncate">
                                {vehicle?.name ?? 'Véhicule Rouli'}
                              </span>
                              <span className={`inline-flex items-center gap-1 text-3xs font-bold px-2 py-0.5 rounded-full ${badge.className}`}>
                                <badge.icon className="w-2.5 h-2.5" aria-hidden="true" />
                                {badge.label}
                              </span>
                            </div>
                            <div className="text-2xs text-neutral-500 mt-0.5 truncate">
                              {agencyName(res.agencyId)} • {formatShort(res.startDate)} – {formatShort(res.endDate)}
                            </div>
                            {typeof res.rating === 'number' && (
                              <div
                                className="flex items-center gap-0.5 mt-1 text-brand-ink"
                                aria-label={`Note ${res.rating} sur 5`}
                              >
                                {[...Array(5)].map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`w-3 h-3 ${i < res.rating! ? 'fill-current' : 'opacity-25'}`}
                                    aria-hidden="true"
                                  />
                                ))}
                              </div>
                            )}
                          </div>

                          <div className="text-right shrink-0">
                            <div className="text-sm font-extrabold text-neutral-900 tabular-nums">
                              {nf.format(res.totalDT)}&nbsp;DT
                            </div>
                            {vehicle && (
                              <Link
                                to={getVehiclePath(vehicle)}
                                className="text-2xs font-semibold text-brand-ink hover:underline inline-flex items-center gap-0.5 mt-1"
                              >
                                Relouer
                                <NavArrowRight className="w-3 h-3" aria-hidden="true" />
                              </Link>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </Reveal>
            </div>

            {/* Colonne latérale */}
            <div className="flex flex-col gap-6">
              {/* Fidélité */}
              <Reveal className="w-full">
                <div className="bg-white rounded-3xl border border-neutral-200/80 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Sparks className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                    <h2 className="text-sm font-bold tracking-tight text-neutral-900">Programme fidélité</h2>
                  </div>
                  <div className="text-2xl font-extrabold text-neutral-900 tracking-tight tabular-nums">
                    {USER_PROFILE.loyaltyPoints.toLocaleString('fr-FR')}
                    <span className="text-sm font-bold text-neutral-500"> pts</span>
                  </div>
                  <div
                    role="progressbar"
                    aria-label="Progression vers la journée offerte"
                    aria-valuenow={loyaltyProgress}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-valuetext={`${loyaltyProgress} % — ${USER_PROFILE.loyaltyPoints} points sur ${nextRewardAt}`}
                    className="mt-3 h-2 rounded-full bg-neutral-100 overflow-hidden"
                  >
                    <div className="h-full bg-brand rounded-full" style={{ width: `${loyaltyProgress}%` }} />
                  </div>
                  <p className="text-2xs text-neutral-500 mt-2">
                    Plus que {nf.format(nextRewardAt - USER_PROFILE.loyaltyPoints)} pts pour une journée
                    offerte.
                  </p>
                </div>
              </Reveal>

              {/* Informations personnelles */}
              <Reveal className="w-full">
                <div className="bg-white rounded-3xl border border-neutral-200/80 p-6">
                  <div className="flex items-center justify-between gap-3 mb-4">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                      <h2 className="text-sm font-bold tracking-tight text-neutral-900">
                        Informations personnelles
                      </h2>
                    </div>
                    <button
                      type="button"
                      onClick={startEditing}
                      aria-controls="profile-editor"
                      className="text-2xs font-bold text-brand-ink hover:underline cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink rounded"
                    >
                      Modifier
                    </button>
                  </div>

                  <div aria-live="polite" aria-atomic="true" className="empty:hidden">
                    {saveNotice && (
                      <p className="mb-3 text-2xs font-semibold text-brand-ink">{saveNotice}</p>
                    )}
                  </div>

                  {editing ? (
                    <form id="profile-editor" onSubmit={saveProfile} className="space-y-3">
                      {profileFields.map((f) => (
                        <div key={f.id}>
                          <label
                            htmlFor={f.id}
                            className="block text-3xs uppercase font-bold tracking-wider text-neutral-400 mb-1"
                          >
                            {f.label}
                          </label>
                          <input
                            id={f.id}
                            name={f.key}
                            type={f.type}
                            required
                            autoComplete={f.autoComplete}
                            spellCheck={f.type === 'email' ? false : undefined}
                            value={profile[f.key]}
                            onChange={(e) =>
                              setProfile((prev) => ({ ...prev, [f.key]: e.target.value }))
                            }
                            className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2 text-xs text-neutral-900 focus-visible:outline-none focus:border-brand-ink focus:ring-2 focus:ring-brand-ink transition-[background-color,border-color,box-shadow]"
                          />
                        </div>
                      ))}
                      <div className="flex gap-2 pt-1">
                        <button
                          type="submit"
                          className="flex-1 py-2.5 bg-brand text-brand-on font-bold text-xs rounded-full hover:bg-brand-dark transition-[background-color,box-shadow] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                        >
                          Enregistrer
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setEditing(false);
                            setProfile({
                              fullName: USER_PROFILE.fullName,
                              email: USER_PROFILE.email,
                              phone: USER_PROFILE.phone,
                              city: USER_PROFILE.city,
                              address: USER_PROFILE.address,
                            });
                          }}
                          className="flex-1 py-2.5 bg-neutral-100 text-neutral-800 font-bold text-xs rounded-full hover:bg-neutral-200 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                        >
                          Annuler
                        </button>
                      </div>
                    </form>
                  ) : (
                    <div className="space-y-3">
                      {infoRows.map((row) => (
                        <div key={row.label} className="flex items-start gap-3">
                          <row.icon
                            className="w-3.5 h-3.5 text-neutral-400 mt-0.5 shrink-0"
                            aria-hidden="true"
                          />
                          <div className="min-w-0">
                            <div className="text-3xs uppercase font-bold tracking-wider text-neutral-400">
                              {row.label}
                            </div>
                            <div className="text-xs font-medium text-neutral-800 break-words">{row.value}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Reveal>

              {/* Paramètres */}
              <Reveal className="w-full">
                <div className="bg-white rounded-3xl border border-neutral-200/80 p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <Settings className="w-4 h-4 text-brand-ink" aria-hidden="true" />
                    <h2 className="text-sm font-bold tracking-tight text-neutral-900">Paramètres du compte</h2>
                  </div>
                  <div className="space-y-1">
                    {[
                      { label: 'Notifications & rappels', icon: Bell, status: 'Activés' },
                      { label: 'Moyens de paiement', icon: CreditCard, status: 'Aucun moyen enregistré' },
                      { label: 'Documents & permis', icon: ShieldCheck, status: 'Permis vérifié' },
                    ].map((item) => (
                      <div
                        key={item.label}
                        className="w-full flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5"
                      >
                        <span className="flex items-center gap-2.5 text-xs font-medium text-neutral-800">
                          <item.icon className="w-3.5 h-3.5 text-brand-ink shrink-0" aria-hidden="true" />
                          {item.label}
                        </span>
                        <span className="text-2xs text-neutral-400">{item.status}</span>
                      </div>
                    ))}
                    <Link
                      to={`/agences/${USER_PROFILE.preferredAgencyId}`}
                      className="w-full flex items-center justify-between gap-3 rounded-xl px-2.5 py-2.5 hover:bg-surface transition-colors group focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                    >
                      <span className="flex items-center gap-2.5 text-xs font-medium text-neutral-800">
                        <MapPin className="w-3.5 h-3.5 text-brand-ink shrink-0" aria-hidden="true" />
                        Agence préférée
                      </span>
                      <span className="flex items-center gap-1.5 text-2xs text-neutral-400">
                        {agencyName(USER_PROFILE.preferredAgencyId)}
                        <NavArrowRight
                          className="w-3.5 h-3.5 group-hover:text-neutral-700 transition-colors"
                          aria-hidden="true"
                        />
                      </span>
                    </Link>
                  </div>
                </div>
              </Reveal>

              {/* Aide */}
              <Reveal className="w-full">
                <div className="bg-neutral-900 text-white rounded-3xl p-6">
                  <h2 className="text-sm font-bold tracking-tight">Besoin d'aide ?</h2>
                  <p className="text-2xs text-neutral-400 mt-1.5 leading-relaxed">
                    Notre équipe vous répond 7j/7 de 08h à 20h pour toute question sur vos réservations.
                  </p>
                  <Link
                    to="/contact"
                    className="mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-brand hover:underline"
                  >
                    Contacter le support
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </Reveal>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};
