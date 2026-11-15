import { z } from "zod";
import { countries } from "./countries";

export const sectors = [
  "Création ou reprise d’entreprise",
  "Développement d’activité",
  "Commerce et distribution",
  "Industrie et production",
  "Innovation et technologie",
  "Développement de nouveaux marchés",
];
export const stages = ["Idée", "Création", "Activité existante", "Expansion"];
export const statuses = ["Nouveau", "En étude", "Précisions demandées", "Clôturé"] as const;
const short = (label: string, min = 2) =>
  z.string().trim().min(min, `${label} : champ obligatoire.`).max(150, "150 caractères maximum.");
const choice = (items: readonly string[], label: string) =>
  z.string().refine((v) => items.includes(v), `Sélectionnez ${label}.`);
const money = z
  .string()
  .trim()
  .refine(
    (v) => /^\d{1,12}([.,]\d{1,2})?$/.test(v) && Number(v.replace(",", ".")) > 0,
    "Indiquez un montant positif (12 chiffres maximum, 2 décimales).",
  );
const optionalMoney = z.union([z.literal(""), money]);
const identity = {
  name: short("Nom et prénom"),
  email: z.string().trim().max(180).email("Indiquez une adresse e-mail valide."),
  phone: z
    .string()
    .trim()
    .regex(/^\+?[\d\s().-]{6,30}$/, "Indiquez un numéro de téléphone valide."),
  consent: z
    .boolean()
    .refine((v) => v === true, "Votre accord est nécessaire pour traiter la demande."),
};
export const projectSchema = z
  .object({
    ...identity,
    country: choice(countries, "un pays de la liste"),
    company: z.string().trim().max(150),
    sector: choice(sectors, "un secteur"),
    stage: choice(stages, "le stade du projet"),
    amount: money,
    currency: choice(["EUR", "USD", "GBP", "Autre"], "une devise"),
    otherCurrency: z.string().trim().max(30),
    description: z
      .string()
      .trim()
      .min(40, "Décrivez votre projet en au moins 40 caractères.")
      .max(6000, "6 000 caractères maximum."),
    purpose: z
      .string()
      .trim()
      .min(20, "Précisez l’utilisation en au moins 20 caractères.")
      .max(3000, "3 000 caractères maximum."),
    contribution: optionalMoney,
    revenue: optionalMoney,
    businessPlan: choice(["Oui", "Non"], "oui ou non"),
  })
  .refine((v) => v.currency !== "Autre" || v.otherCurrency.length >= 2, {
    path: ["otherCurrency"],
    message: "Précisez la devise souhaitée.",
  });
export const contactSchema = z.object({
  name: identity.name,
  email: identity.email,
  subject: short("Objet"),
  message: z
    .string()
    .trim()
    .min(20, "Écrivez au moins 20 caractères.")
    .max(4000, "4 000 caractères maximum."),
  consent: identity.consent,
});
const guard = { requestId: z.string().uuid(), website: z.string().max(200).default("") };
export const projectRequest = z.object({ data: projectSchema, ...guard });
export const contactRequest = z.object({ data: contactSchema, ...guard });
export type ProjectData = z.infer<typeof projectSchema>;
export type ContactData = z.infer<typeof contactSchema>;
