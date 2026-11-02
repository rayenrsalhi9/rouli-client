import { Bicycle, Clock, Group, MapPin, StarSolid } from "iconoir-react";
import { Blobatar } from "@blobatar/react";
import { motion } from "motion/react";
import "blobatar/motion.css";

import { Card, CardContent } from "@/components/ui/card";
import { Stagger } from "@/components/Reveal";
import { AnimatedNumber } from "@/components/AnimatedNumber";
import { itemVariants } from "@/lib/motion";
import { cn } from "@/lib/utils";
import { AGENCIES_LIST, CATALOG_BIKES, STATS } from "@/data/mockData";

const MotionCard = motion.create(Card);

const rating = 4.9;
const availableVehicles = CATALOG_BIKES.reduce(
  (sum, vehicle) => sum + vehicle.stockAvailable,
  0,
);
const agencies = AGENCIES_LIST.filter((agency) => agency.id !== "all");

export function Features() {
  return (
    <section className="w-full bg-surface py-16 sm:py-20">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:max-w-5xl">
        <Stagger className="grid grid-cols-6 gap-3">
          <MotionCard variants={itemVariants} className="relative col-span-full flex overflow-hidden lg:col-span-2">
            <CardContent className="relative m-auto size-fit pt-6">
              <div className="flex h-24 w-56 flex-col items-center justify-center gap-1">
                <div className="flex items-center gap-1 text-brand-ink" aria-hidden="true">
                  {Array.from({ length: 5 }).map((_, index) => (
                    <StarSolid key={index} className="size-5" />
                  ))}
                </div>
                <span className="block w-fit font-display text-5xl font-semibold tabular-nums text-foreground">
                  <AnimatedNumber value={rating} />
                  <span className="text-2xl font-normal text-muted-foreground">
                    /5
                  </span>
                </span>
              </div>
              <h2 className="mt-6 text-center text-3xl font-semibold text-foreground">
                Note moyenne
              </h2>
              <p className="mt-2 text-center text-sm text-muted-foreground">
                Plus de {STATS.reviews.toLocaleString("fr-FR")} avis à Monastir
              </p>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
            <CardContent className="pt-6">
              <div className="relative mx-auto flex aspect-square size-32 items-center justify-center rounded-full border border-border text-brand-ink before:absolute before:-inset-2 before:rounded-full before:border before:border-border/60">
                <Group className="size-14" strokeWidth={1} aria-hidden="true" />
              </div>
              <div className="relative z-10 mt-6 space-y-2 text-center">
                <h2 className="text-3xl font-semibold tabular-nums text-foreground">
                  <AnimatedNumber value={STATS.activeUsers} suffix="+" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  Monastiriens actifs
                </p>
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="relative col-span-full overflow-hidden sm:col-span-3 lg:col-span-2">
            <CardContent className="pt-6">
              <div className="relative mx-auto flex aspect-square size-32 items-center justify-center rounded-full border border-border text-brand-ink before:absolute before:-inset-2 before:rounded-full before:border before:border-border/60">
                <Bicycle className="size-14" strokeWidth={1} aria-hidden="true" />
              </div>
              <div className="relative z-10 mt-6 space-y-2 text-center">
                <h2 className="text-3xl font-semibold tabular-nums text-foreground">
                  <AnimatedNumber value={availableVehicles} suffix="+" />
                </h2>
                <p className="text-sm text-muted-foreground">
                  Véhicules disponibles
                </p>
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="relative col-span-full overflow-hidden lg:col-span-2">
            <CardContent className="pt-6">
              <div className="relative mx-auto flex aspect-square size-32 items-center justify-center rounded-full border border-border text-brand-ink before:absolute before:-inset-2 before:rounded-full before:border before:border-border/60">
                <Clock className="size-14" strokeWidth={1} aria-hidden="true" />
              </div>
              <div className="relative z-10 mt-6 space-y-2 text-center">
                <h2 className="text-3xl font-semibold tabular-nums text-foreground">
                  <AnimatedNumber value={STATS.avgBookingMinutes} suffix=" min" />
                </h2>
                <p className="text-sm text-muted-foreground">Pour réserver</p>
              </div>
            </CardContent>
          </MotionCard>

          <MotionCard variants={itemVariants} className="relative col-span-full overflow-hidden lg:col-span-4">
            <CardContent className="grid pt-6 sm:grid-cols-2">
              <div className="relative z-10 flex flex-col justify-between gap-8 sm:gap-12">
                <div className="relative flex aspect-square size-12 items-center justify-center rounded-full border border-border text-brand-ink before:absolute before:-inset-2 before:rounded-full before:border before:border-border/60">
                  <MapPin className="size-5" strokeWidth={1} aria-hidden="true" />
                </div>
                <div className="space-y-2">
                  <h2 className="text-3xl font-semibold tabular-nums text-foreground">
                    {agencies.length}
                    <span className="ml-2 text-lg font-medium">
                      agences à Monastir
                    </span>
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Marina, Skanes, Ribat, Dkhila et la gare : réservez au plus
                    près de chez vous.
                  </p>
                </div>
              </div>

              <div className="relative mt-6 before:absolute before:inset-0 before:mx-auto before:w-px before:bg-border sm:-my-6 sm:-mr-6">
                <div className="relative flex h-full flex-col justify-center gap-5 py-6">
                  {agencies.map((agency, index) => {
                    const alignRight = index % 2 === 0;
                    return (
                      <div
                        key={agency.id}
                        className={cn(
                          "relative flex items-center gap-2",
                          alignRight
                            ? "w-[calc(50%+0.875rem)] justify-end"
                            : "ml-[calc(50%-1rem)]",
                        )}
                      >
                        {alignRight ? (
                          <>
                            <span className="block h-fit max-w-32 truncate rounded border border-border px-2 py-1 text-xs shadow-sm">
                              {agency.shortName}
                            </span>
                            <div className="size-7 shrink-0 ring-4 ring-background">
                              <Blobatar
                                name={agency.shortName}
                                hue={145}
                                size={28}
                                className="size-full rounded-full"
                              />
                            </div>
                          </>
                        ) : (
                          <>
                            <div className="size-7 shrink-0 ring-4 ring-background">
                              <Blobatar
                                name={agency.shortName}
                                hue={145}
                                size={28}
                                className="size-full rounded-full"
                              />
                            </div>
                            <span className="block h-fit max-w-32 truncate rounded border border-border px-2 py-1 text-xs shadow-sm">
                              {agency.shortName}
                            </span>
                          </>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            </CardContent>
          </MotionCard>
        </Stagger>
      </div>
    </section>
  );
}
