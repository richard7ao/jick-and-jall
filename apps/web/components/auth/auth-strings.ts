import type { Locale } from "../../lib/i18n";

/** Local bilingual strings for auth screens (kept behaviorally equivalent). */
export const AUTH_STRINGS: Record<Locale, Record<string, string>> = {
  en: {
    signInTitle: "Sign in",
    registerTitle: "Activate your account",
    email: "Email address",
    password: "Password",
    continueGoogle: "Continue with Google",
    submitSignIn: "Sign in",
    submitRegister: "Create account",
    noSwitcher: "Creators and brands use separate accounts.",
  },
  es: {
    signInTitle: "Iniciar sesión",
    registerTitle: "Activa tu cuenta",
    email: "Correo electrónico",
    password: "Contraseña",
    continueGoogle: "Continuar con Google",
    submitSignIn: "Iniciar sesión",
    submitRegister: "Crear cuenta",
    noSwitcher: "Creadores y marcas usan cuentas separadas.",
  },
};
