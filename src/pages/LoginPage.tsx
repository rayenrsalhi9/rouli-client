import React, { useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import { Eye, EyeClosed } from 'iconoir-react';
import { AuthShell, authContainer, authItem } from "../components/AuthShell";

const inputClass =
  "w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm text-neutral-900 placeholder:text-neutral-400 focus-visible:outline-none focus-visible:border-brand-ink focus-visible:ring-2 focus-visible:ring-brand-ink transition-[background-color,border-color,box-shadow]";

export const LoginPage: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNotice(
      "Démo : la connexion sera disponible prochainement. La réservation reste accessible sans compte.",
    );
  };

  return (
    <AuthShell>
      <motion.div variants={authContainer} initial="hidden" animate="visible">
        {/* Header */}
        <motion.div variants={authItem} className="mb-7">
          <h1 className="text-3xl font-extrabold tracking-tight text-neutral-900">
            Bon retour parmi nous
          </h1>
          <p className="text-sm text-neutral-500 mt-2">
            Connectez-vous pour gérer vos trajets et réservations Rouli.
          </p>
        </motion.div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <motion.div variants={authItem}>
            <label
              htmlFor="login-email"
              className="text-xs font-semibold text-neutral-700 block mb-1.5"
            >
              Adresse email
            </label>
            <input
              id="login-email"
              name="email"
              type="email"
              required
              autoComplete="email"
              spellCheck={false}
              autoCapitalize="none"
              placeholder="votre.email@exemple.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className={inputClass}
            />
          </motion.div>

          <motion.div variants={authItem}>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="login-password"
                className="text-xs font-semibold text-neutral-700 block"
              >
                Mot de passe
              </label>
              <Link
                to="/contact"
                className="text-2xs font-semibold text-brand-ink hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-ink"
              >
                Mot de passe oublié ?
              </Link>
            </div>
            <div className="relative">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputClass} pr-11`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                aria-pressed={showPassword}
                aria-label={
                  showPassword
                    ? "Masquer le mot de passe"
                    : "Afficher le mot de passe"
                }
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
              htmlFor="login-remember"
              className="flex items-center gap-2 cursor-pointer text-xs text-neutral-600 select-none"
            >
              <input
                id="login-remember"
                name="remember"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="rounded border-neutral-300 text-brand-ink focus:ring-brand-ink accent-brand"
              />
              <span>Se souvenir de moi</span>
            </label>
          </motion.div>

          <motion.div
            variants={authItem}
            aria-live="polite"
            aria-atomic="true"
            className="empty:hidden"
          >
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
              Se connecter
            </button>
          </motion.div>
        </form>

        <motion.div
          variants={authItem}
          className="mt-7 pt-5 border-t border-neutral-100 text-center text-xs text-neutral-600"
        >
          <span>Pas encore de compte Rouli ? </span>
          <Link
            to="/signup"
            className="font-bold text-brand-ink hover:underline ml-1"
          >
            Créer un compte
          </Link>
        </motion.div>
      </motion.div>
    </AuthShell>
  );
};
