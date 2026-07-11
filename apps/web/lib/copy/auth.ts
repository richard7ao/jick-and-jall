import type { Locale } from "@/lib/i18n";

export interface AuthCopy {
  signInTitle: string;
  signInSubtitle: string;
  registerTitle: string;
  registerSubtitle: string;
  recoverTitle: string;
  recoverSubtitle: string;
  email: string;
  password: string;
  invitationCode: string;
  google: string;
  signInAction: string;
  registerAction: string;
  recoverAction: string;
  toRegister: string;
  toSignIn: string;
  toRecover: string;
  roleCreator: string;
  roleBrand: string;
  // Enumeration-safe: never reveal whether an account/invite exists.
  genericError: string;
  recoverSent: string;
  registered: string;
}

const copy: Record<Locale, AuthCopy> = {
  en: {
    signInTitle: "Sign in",
    signInSubtitle: "Welcome back to Jick & Jall.",
    registerTitle: "Create your account",
    registerSubtitle: "Registration is invitation-only during early access.",
    recoverTitle: "Reset your password",
    recoverSubtitle: "We'll email a reset link if the account exists.",
    email: "Email address",
    password: "Password",
    invitationCode: "Invitation code",
    google: "Continue with Google",
    signInAction: "Sign in",
    registerAction: "Create account",
    recoverAction: "Send reset link",
    toRegister: "Have an invitation? Register",
    toSignIn: "Already have an account? Sign in",
    toRecover: "Forgot your password?",
    roleCreator: "Creator",
    roleBrand: "Brand",
    genericError: "Those details didn't work. Please check and try again.",
    recoverSent: "If that account exists, a reset link is on its way.",
    registered: "Account created. You can sign in now.",
  },
  es: {
    signInTitle: "Iniciar sesión",
    signInSubtitle: "Bienvenido de nuevo a Jick & Jall.",
    registerTitle: "Crea tu cuenta",
    registerSubtitle: "El registro es solo por invitación durante el acceso anticipado.",
    recoverTitle: "Restablece tu contraseña",
    recoverSubtitle: "Te enviaremos un enlace si la cuenta existe.",
    email: "Correo electrónico",
    password: "Contraseña",
    invitationCode: "Código de invitación",
    google: "Continuar con Google",
    signInAction: "Iniciar sesión",
    registerAction: "Crear cuenta",
    recoverAction: "Enviar enlace",
    toRegister: "¿Tienes invitación? Regístrate",
    toSignIn: "¿Ya tienes cuenta? Inicia sesión",
    toRecover: "¿Olvidaste tu contraseña?",
    roleCreator: "Creador",
    roleBrand: "Marca",
    genericError: "Esos datos no funcionaron. Revísalos e inténtalo de nuevo.",
    recoverSent: "Si esa cuenta existe, el enlace ya va en camino.",
    registered: "Cuenta creada. Ya puedes iniciar sesión.",
  },
};

export function getAuthCopy(locale: Locale): AuthCopy {
  return copy[locale];
}
