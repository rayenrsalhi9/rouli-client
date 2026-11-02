"use client";

import { motion } from "motion/react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Stagger } from "@/components/Reveal";
import { itemVariants } from "@/lib/motion";

const faqItems = [
  {
    id: "item-1",
    question: "Dois-je payer en ligne pour réserver mon véhicule ?",
    answer:
      "Non. Vous réservez gratuitement en ligne et vous réglez à l’agence au retrait du véhicule.",
  },
  {
    id: "item-2",
    question: "Puis-je annuler ou modifier ma réservation ?",
    answer: "Oui, gratuitement, tant que le véhicule ne vous a pas été remis.",
  },
  {
    id: "item-3",
    question: "Que se passe-t-il si je ne viens pas récupérer mon véhicule ?",
    answer:
      "Si vous ne venez pas, votre coupon expire à la fermeture de l’agence le jour du début de la location, et le véhicule est remis à disposition.",
  },
  {
    id: "item-4",
    question: "Combien de temps puis-je louer un véhicule ?",
    answer: "De 1 à 7 jours, à la journée.",
  },
  {
    id: "item-5",
    question: "Une assurance est-elle incluse lors de ma location ?",
    answer:
      "Oui, une assurance complète tous risques et responsabilité civile est incluse d’office sans surcoût caché.",
  },
  {
    id: "item-6",
    question: "Où dois-je rendre mon véhicule ?",
    answer:
      "Dans l’agence où vous l’avez retiré. Le véhicule est affecté à cette agence et doit y être rapporté.",
  },
  {
    id: "item-7",
    question:
      "Y a-t-il un âge minimum, ou un équipement obligatoire (casque) ?",
    answer:
      "Le service est accessible dès 16 ans. Le port du casque est vivement recommandé pour votre sécurité, et des casques sont mis à disposition en agence sur demande.",
  },
];

export default function FAQs() {
  return (
    <section
      id="section-faq"
      className="w-full bg-surface-wash py-20 md:py-28"
    >
      <div className="mx-auto w-full max-w-page px-4 md:px-6">
        <Stagger className="grid gap-10 md:grid-cols-5 md:gap-12">
          <motion.div variants={itemVariants} className="md:col-span-2">
            <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              FAQ
            </h2>
            <p className="mt-4 text-balance text-body text-muted-foreground">
              Tout ce que vous devez savoir avant de partir.
            </p>
            <p className="mt-6 hidden text-sm leading-relaxed text-muted-foreground md:block">
              Vous avez une question spécifique ? Écrivez à notre{" "}
              <a
                href="mailto:support@rouli.tn"
                className="font-semibold text-brand-ink underline hover:no-underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                équipe d’assistance locale
              </a>
              , disponible 7j/7.
            </p>
          </motion.div>

          <motion.div variants={itemVariants} className="md:col-span-3">
            <Accordion type="single" collapsible className="w-full">
              {faqItems.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  className="border-border"
                >
                  <AccordionTrigger className="cursor-pointer py-5 text-left text-base hover:no-underline">
                    {item.question}
                  </AccordionTrigger>
                  <AccordionContent>
                    <p className="text-body leading-[1.47] text-muted-foreground">
                      {item.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>

            <p className="mt-6 text-sm leading-relaxed text-muted-foreground md:hidden">
              Vous avez une question spécifique ? Écrivez à notre{" "}
              <a
                href="mailto:support@rouli.tn"
                className="font-semibold text-brand-ink underline hover:no-underline focus-visible:rounded focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                équipe d’assistance locale
              </a>
              , disponible 7j/7.
            </p>
          </motion.div>
        </Stagger>
      </div>
    </section>
  );
}
