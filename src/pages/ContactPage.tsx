import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle, ArrowRight } from 'iconoir-react';
import { Navbar } from '../components/Navbar';
import { Footer } from '../components/Footer';
import { FaqSection } from '../components/FaqSection';
import { Stagger } from '../components/Reveal';
import { itemVariants, sectionVariants } from '../lib/motion';
import { AGENCIES_LIST } from '../data/mockData';

const CONTACT_CHANNELS = [
  {
    icon: Phone,
    label: 'Téléphone',
    value: '+216 73 500 000',
    hint: 'Lun – Dim, 8h à 20h',
    href: 'tel:+21673500000',
  },
  {
    icon: Mail,
    label: 'E-mail',
    value: 'support@rouli.tn',
    hint: 'Réponse sous 24h ouvrées',
    href: 'mailto:support@rouli.tn',
  },
  {
    icon: MapPin,
    label: 'Siège',
    value: 'Av. Habib Bourguiba, Monastir 5000',
    hint: 'Grand Monastir, Tunisie',
    href: 'https://maps.google.com/?q=Avenue+Habib+Bourguiba+Monastir',
    external: true,
  },
  {
    icon: Clock,
    label: 'Horaires',
    value: 'Tous les jours, 8h – 20h',
    hint: 'Assistance 7j/7',
  },
];

const SUBJECTS = [
  'Question sur une réservation',
  'Assistance pendant une location',
  'Devenir agence partenaire',
  'Presse & médias',
  'Autre demande',
];

export const ContactPage: React.FC = () => {
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: '',
    email: '',
    subject: SUBJECTS[0],
    message: '',
  });

  const agencies = AGENCIES_LIST.filter((a) => a.id !== 'all');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  const update = (key: keyof typeof form, value: string) =>
    setForm((prev) => ({ ...prev, [key]: value }));

  const inputClass =
    'w-full bg-white border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-brand-ink focus-visible:ring-2 focus-visible:ring-brand-ink transition-[background-color,border-color,box-shadow]';

  return (
    <div className="w-full min-h-screen bg-surface text-ink flex flex-col font-sans selection:bg-brand/20 selection:text-black">
      <Navbar />

      <main id="main" tabIndex={-1} className="w-full pt-nav flex flex-col items-center">
        {/* Hero */}
        <section className="w-full bg-surface py-20 sm:py-24">
          <Stagger className="max-w-narrow w-full mx-auto px-4 md:px-6 text-center">
            <motion.span
              variants={itemVariants}
              className="text-xs font-bold uppercase tracking-label text-brand-ink mb-3 block"
            >
              CONTACT
            </motion.span>
            <motion.h1
              variants={itemVariants}
              className="text-4xl sm:text-5xl font-extrabold tracking-tight leading-[1.08] text-neutral-900"
            >
              Parlons de votre prochain trajet.
            </motion.h1>
            <motion.p
              variants={itemVariants}
              className="text-sm sm:text-base text-neutral-600 mt-5 leading-relaxed max-w-[620px] mx-auto"
            >
              Une question sur une réservation, une demande de partenariat ou un souci pendant votre location ?
              Notre équipe locale vous répond rapidement.
            </motion.p>
          </Stagger>
        </section>

        {/* Contact channels */}
        <section className="w-full bg-surface py-16 sm:py-20">
          <Stagger className="max-w-page w-full mx-auto px-4 md:px-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {CONTACT_CHANNELS.map((c) => {
                const Icon = c.icon;
                const body = (
                  <>
                    <div className="w-11 h-11 rounded-full bg-surface-brand text-brand-ink flex items-center justify-center mb-5 group-hover:bg-brand group-hover:text-brand-on transition-colors">
                      <Icon className="w-5 h-5" aria-hidden="true" />
                    </div>
                    <div className="text-2xs font-bold uppercase tracking-label text-neutral-500 mb-1">
                      {c.label}
                    </div>
                    <div className="text-sm font-bold text-neutral-900">{c.value}</div>
                    <div className="text-xs text-neutral-500 mt-1">{c.hint}</div>
                  </>
                );

                const className =
                  'bg-white rounded-3xl p-6 border border-black/5 hover:border-brand/40 transition-colors group block';

                return c.href ? (
                  <motion.a
                    key={c.label}
                    href={c.href}
                    variants={itemVariants}
                    {...(c.external ? { target: '_blank', rel: 'noreferrer' } : {})}
                    className={className}
                  >
                    {body}
                  </motion.a>
                ) : (
                  <motion.div key={c.label} variants={itemVariants} className={className}>
                    {body}
                  </motion.div>
                );
              })}
          </Stagger>
        </section>

        {/* Form + Agencies */}
        <section className="w-full bg-white py-20 sm:py-24">
          <Stagger className="max-w-page w-full mx-auto px-4 md:px-6 grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Form */}
              <motion.div variants={itemVariants}>
                <span className="text-xs font-bold uppercase tracking-label text-brand-ink mb-2 block">
                  ÉCRIVEZ-NOUS
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-6">
                  Envoyez-nous un message
                </h2>

                {submitted ? (
                  <motion.div
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    role="status"
                    aria-live="polite"
                    className="bg-surface rounded-3xl border border-brand/40 p-8 text-center flex flex-col items-center"
                  >
                    <div className="w-14 h-14 rounded-full bg-brand/10 text-brand-ink flex items-center justify-center mb-4">
                      <CheckCircle className="w-7 h-7" aria-hidden="true" />
                    </div>
                    <h3 className="text-lg font-bold text-neutral-900 mb-1">Message envoyé</h3>
                    <p className="text-sm text-neutral-600 leading-relaxed max-w-[360px]">
                      Merci {form.name.split(' ')[0] || ''} ! Notre équipe vous répondra à {form.email} sous 24h
                      ouvrées.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setForm({ name: '', email: '', subject: SUBJECTS[0], message: '' });
                      }}
                      className="mt-6 inline-flex items-center justify-center border border-brand-ink text-brand-ink hover:bg-surface-brand font-semibold text-xs px-5 py-2.5 rounded-full transition-colors active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                    >
                      Envoyer un autre message
                    </button>
                  </motion.div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label
                          htmlFor="contact-name"
                          className="block text-2xs font-bold uppercase tracking-label text-neutral-500 mb-1.5"
                        >
                          Nom complet
                        </label>
                        <input
                          id="contact-name"
                          name="name"
                          type="text"
                          required
                          autoComplete="name"
                          value={form.name}
                          onChange={(e) => update('name', e.target.value)}
                          placeholder="Votre nom"
                          className={inputClass}
                        />
                      </div>
                      <div>
                        <label
                          htmlFor="contact-email"
                          className="block text-2xs font-bold uppercase tracking-label text-neutral-500 mb-1.5"
                        >
                          E-mail
                        </label>
                        <input
                          id="contact-email"
                          name="email"
                          type="email"
                          required
                          autoComplete="email"
                          spellCheck={false}
                          autoCapitalize="none"
                          value={form.email}
                          onChange={(e) => update('email', e.target.value)}
                          placeholder="vous@exemple.tn"
                          className={inputClass}
                        />
                      </div>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-subject"
                        className="block text-2xs font-bold uppercase tracking-label text-neutral-500 mb-1.5"
                      >
                        Sujet
                      </label>
                      <select
                        id="contact-subject"
                        name="subject"
                        value={form.subject}
                        onChange={(e) => update('subject', e.target.value)}
                        className={inputClass}
                      >
                        {SUBJECTS.map((s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label
                        htmlFor="contact-message"
                        className="block text-2xs font-bold uppercase tracking-label text-neutral-500 mb-1.5"
                      >
                        Message
                      </label>
                      <textarea
                        id="contact-message"
                        name="message"
                        required
                        rows={5}
                        maxLength={2000}
                        value={form.message}
                        onChange={(e) => update('message', e.target.value)}
                        placeholder="Décrivez votre demande…"
                        className={`${inputClass} resize-none`}
                      />
                    </div>

                    <button
                      type="submit"
                      className="inline-flex items-center justify-center gap-2 bg-brand hover:bg-brand-dark text-brand-on font-bold text-sm px-7 py-3.5 rounded-full transition-[background-color,transform] shadow-lg shadow-brand/25 active:scale-95 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                    >
                      <Send className="w-4 h-4" aria-hidden="true" />
                      <span>Envoyer le message</span>
                    </button>
                  </form>
                )}
              </motion.div>

              {/* Agencies */}
              <motion.div variants={itemVariants}>
                <span className="text-xs font-bold uppercase tracking-label text-brand-ink mb-2 block">
                  NOS AGENCES
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-neutral-900 mb-6">
                  Retrouvez-nous à Monastir
                </h2>

                <motion.div variants={sectionVariants} className="space-y-3">
                  {agencies.map((a) => (
                    <motion.div
                      key={a.id}
                      variants={itemVariants}
                      className="flex items-start gap-4 bg-surface rounded-2xl border border-neutral-200/80 p-5 hover:border-brand/50 transition-[color,background-color,border-color,box-shadow,transform,opacity]"
                    >
                      <div className="w-10 h-10 rounded-xl bg-brand/10 text-brand-ink flex items-center justify-center shrink-0">
                        <MapPin className="w-5 h-5" aria-hidden="true" />
                      </div>
                      <div>
                        <div className="text-sm font-bold text-neutral-900">{a.name}</div>
                        <div className="text-xs text-neutral-600 mt-0.5">
                          {a.address} — {a.postalCode} Monastir
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </motion.div>

                <Link
                  to="/#section-hero-search"
                  className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-brand-ink hover:underline"
                >
                  <span>Voir les véhicules disponibles par agence</span>
                  <ArrowRight className="w-4 h-4" aria-hidden="true" />
                </Link>
              </motion.div>
          </Stagger>
        </section>

        {/* FAQ */}
        <FaqSection />
      </main>

      <Footer />
    </div>
  );
};
