import type { Locale } from "@/lib/i18n";
import type { DealStatus } from "@/lib/deal-state";

export interface DealsCopy {
  offerTitle: string;
  amountLabel: string;
  amountHint: string;
  amountError: string;
  deliverableLabel: string;
  sendOffer: string;
  accept: string;
  offerHistory: string;
  youPay: string;
  youReceive: string;
  serviceFee: string;
  payoutsTitle: string;
  connect: string;
  connectPending: string;
  connectReady: string;
  fundTitle: string;
  fund: string;
  fundingNote: string;
  deliveryTitle: string;
  submitDelivery: string;
  requestRevision: string;
  approve: string;
  status: Record<DealStatus, string>;
}

const copy: Record<Locale, DealsCopy> = {
  en: {
    offerTitle: "Offer",
    amountLabel: "Creator amount (GBP)",
    amountHint: "£50–£10,000",
    amountError: "Enter a whole amount between £50 and £10,000.",
    deliverableLabel: "Deliverable",
    sendOffer: "Send offer",
    accept: "Accept offer",
    offerHistory: "Offer history",
    youPay: "You pay",
    youReceive: "You receive",
    serviceFee: "Service fee (10%)",
    payoutsTitle: "Payouts",
    connect: "Set up payouts",
    connectPending: "Payout setup is incomplete.",
    connectReady: "Payouts are ready.",
    fundTitle: "Fund this deal",
    fund: "Pay securely",
    fundingNote: "Payment is confirmed by our server after checkout — not by the return page.",
    deliveryTitle: "Delivery",
    submitDelivery: "Submit delivery",
    requestRevision: "Request revision",
    approve: "Approve",
    status: {
      draft: "Draft",
      offered: "Offer sent",
      accepted_by_one_party: "Accepted by one party",
      mutually_accepted: "Mutually accepted",
      funded: "Funded",
      delivered: "Delivered",
      revision_requested: "Revision requested",
      approved: "Approved",
      payout_pending: "Payout pending",
      paid: "Paid",
      complete: "Complete",
      cancelled: "Cancelled",
      disputed: "Disputed",
    },
  },
  es: {
    offerTitle: "Oferta",
    amountLabel: "Importe del creador (GBP)",
    amountHint: "£50–£10.000",
    amountError: "Introduce un importe entero entre £50 y £10.000.",
    deliverableLabel: "Entregable",
    sendOffer: "Enviar oferta",
    accept: "Aceptar oferta",
    offerHistory: "Historial de ofertas",
    youPay: "Pagas",
    youReceive: "Recibes",
    serviceFee: "Comisión de servicio (10%)",
    payoutsTitle: "Pagos",
    connect: "Configurar pagos",
    connectPending: "La configuración de pagos está incompleta.",
    connectReady: "Los pagos están listos.",
    fundTitle: "Financiar este trato",
    fund: "Pagar de forma segura",
    fundingNote: "El pago lo confirma nuestro servidor tras el checkout, no la página de retorno.",
    deliveryTitle: "Entrega",
    submitDelivery: "Enviar entrega",
    requestRevision: "Solicitar revisión",
    approve: "Aprobar",
    status: {
      draft: "Borrador",
      offered: "Oferta enviada",
      accepted_by_one_party: "Aceptada por una parte",
      mutually_accepted: "Aceptada por ambas partes",
      funded: "Financiado",
      delivered: "Entregado",
      revision_requested: "Revisión solicitada",
      approved: "Aprobado",
      payout_pending: "Pago pendiente",
      paid: "Pagado",
      complete: "Completado",
      cancelled: "Cancelado",
      disputed: "En disputa",
    },
  },
};

export function getDealsCopy(locale: Locale): DealsCopy {
  return copy[locale];
}
