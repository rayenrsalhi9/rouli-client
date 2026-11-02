import { useRef, useState } from "react";
import { useInView } from "motion/react";
import { Blobatar } from "@blobatar/react";
import { Pause, Play } from "iconoir-react";
import "blobatar/motion.css";

import { Card, CardContent } from "@/components/ui/card";
import Marquee from "@/components/ui/marquee-01-utils/marquee";

const reviews = [
  {
    name: "Mehdi K.",
    username: "Étudiant en 5e année • Monastir",
    body: "Entre la cité universitaire, la fac et mes stages au CHU Fattouma Bourguiba, j’évite enfin les taxis collectifs bondés sous la chaleur. En 7 minutes chrono, je suis arrivé avec le Cowboy 4 ST pour 24 DT la journée.",
  },
  {
    name: "Yasmine B.",
    username: "Pharmacienne • Zone Skanes",
    body: "Je réserve ma trottinette depuis mon téléphone, le coupon m’attend. À l’agence, le retrait prend deux minutes.",
  },
  {
    name: "Karim T.",
    username: "Commerçant à la Marina",
    body: "Je fais tous mes allers-retours entre la zone hôtelière de Skanes et l’agence du port sans gaspiller une goutte d’essence. Je réserve en ligne, je présente mon coupon à l’arrivée, et je repars sur un vélo contrôlé, gonflé et rechargé.",
  },
  {
    name: "Sana M.",
    username: "Étudiante à l’ISMM • Monastir",
    body: "J’ai testé le vélo électrique pour mes trajets entre l’ISMM et la médina. Le coupon est prêt en arrivant, le vélo est impeccable, et je ne cherche plus de place en centre-ville.",
  },
  {
    name: "Amine J.",
    username: "Ingénieur • Zone industrielle",
    body: "Les embouteillages du matin me coûtaient 30 minutes. Avec une trottinette réservée la veille, je traverse Monastir en un quart d’heure et je commence ma journée sans stress.",
  },
  {
    name: "Leïla R.",
    username: "Hôtesse • Skanes",
    body: "Pour rejoindre l’aéroport ou la plage de Skanes, c’est devenu mon réflexe. Réservation en deux clics, retrait rapide à l’agence et un tarif à la journée imbattable.",
  },
];

const middle = Math.ceil(reviews.length / 2);
const firstRow = reviews.slice(0, middle);
const secondRow = reviews.slice(middle);

const ReviewCard = ({
  name,
  username,
  body,
}: {
  name: string;
  username: string;
  body: string;
}) => {
  return (
    <Card className="relative h-full w-64 shrink-0 overflow-hidden border-border bg-card p-4 shadow-none">
      <CardContent className="flex flex-col gap-2 p-0">
        <div className="flex flex-row items-center gap-2">
          <Blobatar
            name={name}
            hue={145}
            animate="hover"
            size={32}
            className="h-8 w-8 shrink-0 rounded-full border border-border"
          />
          <div className="flex min-w-0 flex-col">
            <p className="truncate text-sm font-medium text-foreground">
              {name}
            </p>
            <p className="truncate text-xs font-medium text-muted-foreground">
              {username}
            </p>
          </div>
        </div>
        <p className="line-clamp-3 text-sm leading-relaxed text-foreground">
          {body}
        </p>
      </CardContent>
    </Card>
  );
};

export default function TestimonialMarquee() {
  const [paused, setPaused] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: "200px" });

  return (
    <div ref={ref} className="relative w-full">
      <div className="flex justify-end px-4">
        <button
          type="button"
          onClick={() => setPaused((value) => !value)}
          aria-pressed={paused}
          className="motion-reduce:hidden inline-flex min-h-6 items-center gap-1.5 rounded-full border border-border bg-card px-2.5 py-1 text-2xs font-semibold text-foreground transition-colors hover:border-brand-ink/40 hover:text-brand-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
        >
          {paused ? (
            <Play className="h-3.5 w-3.5" aria-hidden="true" />
          ) : (
            <Pause className="h-3.5 w-3.5" aria-hidden="true" />
          )}
          {paused ? "Reprendre" : "Pause"}
        </button>
      </div>

      <div className="relative flex w-full flex-col items-center justify-center overflow-hidden">
        <Marquee paused={paused || !inView} pauseOnHover className="[--duration:20s]">
          {firstRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <Marquee
          paused={paused || !inView}
          pauseOnHover
          reverse
          className="[--duration:20s]"
        >
          {secondRow.map((review) => (
            <ReviewCard key={review.username} {...review} />
          ))}
        </Marquee>
        <div className="marquee-fade pointer-events-none absolute inset-y-0 left-0 w-1/4 bg-linear-to-r from-card"></div>
        <div className="marquee-fade pointer-events-none absolute inset-y-0 right-0 w-1/4 bg-linear-to-l from-card"></div>
      </div>
    </div>
  );
}
