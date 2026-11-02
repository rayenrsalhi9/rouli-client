import React, { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import Confetti from 'react-confetti';
import { X, CheckCircle, QrCode, MapPin, Calendar, ArrowRight } from 'iconoir-react';
import { CatalogBike } from '../types';
import { AGENCIES_LIST } from '../data/mockData';
import { Dialog } from './Dialog';

interface ReservationModalProps {
  bike: CatalogBike;
  onClose: () => void;
  startDate?: string;
  endDate?: string;
}

interface ConfirmedCoupon {
  code: string;
  totalDT: number;
  pickupAgency: string;
  dates: string;
}

const nf = new Intl.NumberFormat('fr-FR');
const df = new Intl.DateTimeFormat('fr-FR', { day: 'numeric', month: 'short' });

/** Parse a `YYYY-MM-DD` string as a *local* date, not UTC midnight. */
const parseISODate = (iso: string): Date => {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
};

const daysBetween = (start: string, end: string): number => {
  const startMs = parseISODate(start).getTime();
  const endMs = parseISODate(end).getTime();
  if (Number.isNaN(startMs) || Number.isNaN(endMs)) return 1;
  return Math.max(1, Math.round((endMs - startMs) / 86400000));
};

export const ReservationModal: React.FC<ReservationModalProps> = ({
  bike,
  onClose,
  startDate,
  endDate,
}) => {
  const hasDates = Boolean(startDate && endDate);
  const reducedMotion = useReducedMotion();
  const confirmationRef = useRef<HTMLHeadingElement>(null);
  const [rentalDays, setRentalDays] = useState(hasDates ? daysBetween(startDate!, endDate!) : 1);
  const [confirmedCoupon, setConfirmedCoupon] = useState<ConfirmedCoupon | null>(null);

  useEffect(() => {
    if (confirmedCoupon) confirmationRef.current?.focus();
  }, [confirmedCoupon]);

  const agency = AGENCIES_LIST.find((a) => a.id === bike.agencyId) ?? AGENCIES_LIST[1];

  const handleConfirm = (e: React.FormEvent) => {
    e.preventDefault();

    const today = new Date();
    const start = hasDates ? parseISODate(startDate!) : today;
    const end = hasDates ? parseISODate(endDate!) : new Date(today.getTime() + rentalDays * 86400000);
    const days = hasDates ? daysBetween(startDate!, endDate!) : rentalDays;

    setConfirmedCoupon({
      code: `RL-MNS-${Math.floor(1000 + Math.random() * 9000)}`,
      totalDT: bike.pricePerDayDT * days,
      pickupAgency: agency.name,
      dates: `Du ${df.format(start)} au ${df.format(end)} (${days} jour${days > 1 ? 's' : ''})`,
    });
  };

  return (
    <Dialog label={`Réservation de ${bike.name}`} onClose={onClose}>
      {({ titleId, requestClose }) => (
        <>
          <button
            onClick={requestClose}
            className="absolute top-5 right-5 text-neutral-400 hover:text-neutral-900 cursor-pointer p-2 -m-1 rounded-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            aria-label="Fermer la fenêtre de réservation"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>

          {/* Announces the confirmation to assistive tech without stealing focus. */}
          <div aria-live="polite" aria-atomic="true" className="sr-only">
            {confirmedCoupon
              ? `Réservation confirmée. Votre code coupon est ${confirmedCoupon.code}.`
              : ''}
          </div>

          {confirmedCoupon && !reducedMotion && (
            <div aria-hidden="true">
              <Confetti
                numberOfPieces={80}
                recycle={false}
                tweenDuration={2500}
                gravity={0.18}
                colors={['#00ff40', '#00cc33', '#04240c']}
                style={{ position: 'fixed', inset: 0, zIndex: 60, pointerEvents: 'none' }}
              />
            </div>
          )}

          <AnimatePresence mode="popLayout" initial={false}>
          {confirmedCoupon ? (
            <motion.div
              key="coupon"
              initial={reducedMotion ? false : { opacity: 0, y: 12, scale: 0.99 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ type: 'spring', visualDuration: 0.4, bounce: 0 }}
              className="flex flex-col items-center text-center py-2"
            >
              <div className="w-14 h-14 rounded-full bg-brand/15 text-brand-ink flex items-center justify-center mb-4">
                <CheckCircle className="w-8 h-8" aria-hidden="true" />
              </div>

              <span className="text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                Réservation confirmée
              </span>
              <h2
                ref={confirmationRef}
                id={titleId}
                tabIndex={-1}
                className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight mb-2"
              >
                Votre coupon est prêt !
              </h2>
              <p className="text-xs text-neutral-500 mb-6 max-w-sm">
                Présentez ce coupon à l'agence de retrait. Votre véhicule vous attend révisé et batterie pleine.
              </p>

              <div className="w-full bg-surface-muted rounded-2xl p-5 border-2 border-dashed border-brand/40 mb-6 text-left">
                <div className="flex items-center justify-between border-b border-neutral-200/70 pb-3 mb-3">
                  <div>
                    <span className="text-3xs text-neutral-400 uppercase font-bold tracking-wider">
                      Code Coupon Digital
                    </span>
                    <div className="text-lg font-black text-neutral-900 tracking-wider">
                      {confirmedCoupon.code}
                    </div>
                  </div>
                  <QrCode className="w-10 h-10 text-neutral-900" aria-hidden="true" />
                </div>

                <div className="space-y-1.5 text-xs text-neutral-700">
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Véhicule réservé :</span>
                    <span className="font-bold text-neutral-900 text-right">{bike.name}</span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Agence de retrait :</span>
                    <span className="font-semibold text-neutral-900 text-right">
                      {confirmedCoupon.pickupAgency}
                    </span>
                  </div>
                  <div className="flex justify-between gap-4">
                    <span className="text-neutral-500">Période :</span>
                    <span className="font-medium text-neutral-800 text-right">{confirmedCoupon.dates}</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-neutral-200/60 font-bold">
                    <span>Montant sur place :</span>
                    <span className="text-brand-ink text-sm tabular-nums">
                      {nf.format(confirmedCoupon.totalDT)}&nbsp;DT
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3 w-full">
                <button
                  onClick={requestClose}
                  className="w-full py-3 bg-brand text-brand-on font-semibold text-xs rounded-full hover:bg-brand-dark transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  Fermer et conserver mon coupon
                </button>
                <Link
                  to="/"
                  onClick={onClose}
                  className="w-full py-3 bg-brand text-brand-on font-bold text-xs rounded-full text-center hover:bg-brand-dark transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  Page d'accueil
                </Link>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={false}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8, transition: { duration: 0.18 } }}
            >
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-brand-ink mb-1">
                <span>Réservation gratuite en ligne</span>
              </div>

              <h2
                id={titleId}
                className="text-xl sm:text-2xl font-extrabold text-neutral-900 tracking-tight mb-2"
              >
                Réserver {bike.name}
              </h2>
              <p className="text-xs text-neutral-500 mb-6">
                Aucun paiement par carte n'est requis aujourd'hui. Vous réglez sur place au retrait.
              </p>

              <form onSubmit={handleConfirm} className="space-y-4">
                <div>
                  <label
                    htmlFor="reservation-agency"
                    className="block text-xs font-bold text-neutral-700 mb-1.5 flex items-center gap-1.5"
                  >
                    <MapPin className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                    <span>Agence de retrait à Monastir</span>
                  </label>
                  <div
                    id="reservation-agency"
                    className="w-full bg-neutral-100 text-neutral-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl border border-transparent"
                  >
                    {agency.name} ({agency.postalCode})
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label
                      htmlFor="reservation-duration"
                      className="text-xs font-bold text-neutral-700 flex items-center gap-1.5"
                    >
                      <Calendar className="w-3.5 h-3.5 text-brand-ink" aria-hidden="true" />
                      <span>{hasDates ? 'Dates de location' : 'Durée de la location'}</span>
                    </label>
                    <span className="text-xs font-bold text-brand-ink">
                      {rentalDays} jour{rentalDays > 1 ? 's' : ''}
                    </span>
                  </div>
                  {hasDates ? (
                    <div className="w-full bg-neutral-100 text-neutral-900 text-xs sm:text-sm px-3.5 py-2.5 rounded-xl">
                      Du {df.format(parseISODate(startDate!))} au {df.format(parseISODate(endDate!))}
                    </div>
                  ) : (
                    <div
                      id="reservation-duration"
                      role="group"
                      aria-label="Durée de la location en jours"
                      className="grid grid-cols-7 gap-1.5"
                    >
                      {[1, 2, 3, 4, 5, 6, 7].map((days) => (
                        <button
                          key={days}
                          type="button"
                          aria-pressed={rentalDays === days}
                          onClick={() => setRentalDays(days)}
                          className={`py-2 text-xs font-bold rounded-xl transition-[background-color,color,box-shadow] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink ${
                            rentalDays === days
                              ? 'bg-brand text-brand-on shadow-xs'
                              : 'bg-neutral-100 text-neutral-700 hover:bg-neutral-200/70'
                          }`}
                        >
                          {days}j
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                <div className="bg-surface-soft p-4 rounded-2xl border border-neutral-200/60 space-y-1.5 text-xs">
                  <div className="flex justify-between text-neutral-600">
                    <span>Tarif journalier :</span>
                    <span className="tabular-nums">
                      {nf.format(bike.pricePerDayDT)}&nbsp;DT / jour
                    </span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Caution bancaire :</span>
                    <span className="text-brand-ink font-semibold">0&nbsp;DT</span>
                  </div>
                  <div className="flex justify-between text-neutral-600">
                    <span>Assurance tous risques :</span>
                    <span className="text-brand-ink font-semibold">Incluse</span>
                  </div>
                  <div className="pt-2 border-t border-neutral-200 flex justify-between font-bold text-neutral-900 text-sm">
                    <span>Total à payer sur place :</span>
                    <span className="text-brand-ink font-extrabold text-base tabular-nums">
                      {nf.format(bike.pricePerDayDT * rentalDays)}&nbsp;DT
                    </span>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark active:scale-95 text-brand-on font-bold text-xs sm:text-sm py-3.5 rounded-full transition-[background-color,transform] shadow-xs shadow-brand/25 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  <span>Obtenir mon coupon de réservation gratuit</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </button>
              </form>
            </motion.div>
          )}
          </AnimatePresence>
        </>
      )}
    </Dialog>
  );
};
