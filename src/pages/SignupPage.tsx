import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { Eye, EyeClosed } from 'iconoir-react';
import { AuthShell, authContainer, authItem } from '../components/AuthShell';

const inputClass =
  'w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-brand-ink focus-visible:ring-2 focus-visible:ring-brand-ink transition-[background-color,border-color,box-shadow]';

export const SignupPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice("Démo : la création de compte sera disponible prochainement. Vous pouvez réserver sans compte.");
  };

  return (
    <AuthShell>
      <motion.div variants={authContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={authItem} className="mb-7">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Créez votre compte Rouli
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Réservez votre premier vélo électrique en moins de 2 minutes.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={authItem} className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="signup-first-name" className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Prénom
              </label>
              <input
                id="signup-first-name"
                name="firstName"
                type="text"
                required
                autoComplete="given-name"
                placeholder="Jean"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className={inputClass}
              />
            </div>
            <div>
              <label htmlFor="signup-last-name" className="text-xs font-semibold text-neutral-700 block mb-1.5">
                Nom
              </label>
              <input
                id="signup-last-name"
                name="lastName"
                type="text"
                required
                autoComplete="family-name"
                placeholder="Dupont"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className={inputClass}
              />
            </div>
          </motion.div>

          <motion.div variants={authItem}>
            <label htmlFor="signup-email" className="text-xs font-semibold text-neutral-700 block mb-1.5">
              Adresse email
            </label>
            <input
              id="signup-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              autoCapitalize="none"
              placeholder="jean.dupont@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </motion.div>

          <motion.div variants={authItem}>
            <label htmlFor="signup-phone" className="text-xs font-semibold text-neutral-700 block mb-1.5">
              Numéro de téléphone
            </label>
            <input
              id="signup-phone"
              name="phone"
              type="tel"
              required
              autoComplete="tel"
              inputMode="tel"
              placeholder="+216 98 123 456"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className={inputClass}
            />
          </motion.div>

          <motion.div variants={authItem}>
            <label htmlFor="signup-password" className="text-xs font-semibold text-neutral-700 block mb-1.5">
              Mot de passe
              <span className="text-neutral-400 font-normal"> (8 caractères minimum)</span>
            </label>
            <div className="relative">
              <input
                id="signup-password"
                name="password"
                type={showPassword ? 'text' : 'password'}
                required
                minLength={8}
                autoComplete="new-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-700 p-2 -m-1 rounded-full cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                {showPassword ? (
                  <EyeClosed className="w-4 h-4" aria-hidden="true" />
                ) : (
                  <Eye className="w-4 h-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </motion.div>

          <motion.div variants={authItem} className="pt-1">
            <label
              htmlFor="signup-terms"
              className="flex items-start gap-2 cursor-pointer text-2xs text-neutral-600 select-none"
            >
              <input
                id="signup-terms"
                name="acceptTerms"
                type="checkbox"
                required
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="mt-0.5 rounded border-neutral-300 text-brand-ink focus:ring-brand-ink accent-brand"
              />
              <span>
                J'accepte les{' '}
                <a
                  href="mailto:support@rouli.tn?subject=Conditions%20G%C3%A9n%C3%A9rales%20de%20Vente"
                  className="text-brand-ink font-semibold underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  Conditions Générales de Vente
                </a>{' '}
                et la{' '}
                <a
                  href="mailto:support@rouli.tn?subject=Politique%20de%20confidentialit%C3%A9"
                  className="text-brand-ink font-semibold underline hover:no-underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
                >
                  Politique de Confidentialité
                </a>
                .
              </span>
            </label>
          </motion.div>

          <motion.div variants={authItem} aria-live="polite" aria-atomic="true" className="empty:hidden">
            {notice && (
              <motion.p className="text-2xs text-neutral-700 bg-neutral-100 border border-neutral-200 rounded-xl px-3 py-2">
                {notice}
              </motion.p>
            )}
          </motion.div>

          <motion.div variants={authItem} className="pt-1">
            <button
              type="submit"
              className="w-full py-3.5 px-4 bg-brand hover:bg-brand-dark active:scale-[0.98] text-brand-on font-bold text-sm rounded-full transition-[background-color,transform] shadow-lg shadow-brand/25 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
            >
              Créer mon compte Rouli
            </button>
          </motion.div>
        </form>

        <motion.div
          variants={authItem}
          className="mt-7 pt-5 border-t border-neutral-100 text-center text-xs text-neutral-600"
        >
          <span>Vous avez déjà un compte ? </span>
          <Link to="/login" className="font-bold text-brand-ink hover:underline ml-1">
            Se connecter
          </Link>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
};
