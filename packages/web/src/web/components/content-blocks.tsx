import { Link } from "wouter";
import {
  Sprout,
  ChartNoAxesCombined,
  Factory,
  Lightbulb,
  Store,
  Globe2,
  ArrowUpRight,
  ArrowRight,
  Plus,
  Minus,
} from "lucide-react";
import { faqItems } from "../../shared/site-config";

export const services = [
  {
    icon: Sprout,
    title: "Création ou reprise d’entreprise",
    text: "Clarifier votre modèle économique et vos besoins pour lancer une nouvelle entreprise ou préparer une reprise.",
    short: "Création d’entreprise",
  },
  {
    icon: ChartNoAxesCombined,
    title: "Développement d’activité",
    text: "Présenter vos objectifs de croissance et les moyens nécessaires pour développer une entreprise existante.",
    short: "Développement d’activité",
  },
  {
    icon: Store,
    title: "Commerce et distribution",
    text: "Expliquer votre positionnement, vos canaux de vente et les investissements envisagés pour votre activité commerciale.",
    short: "Commerce et distribution",
  },
  {
    icon: Factory,
    title: "Projets industriels et productifs",
    text: "Décrire vos équipements, votre capacité de production et les ressources nécessaires à la réalisation du projet.",
    short: "Projets commerciaux et industriels",
  },
  {
    icon: Lightbulb,
    title: "Innovation et technologie",
    text: "Faire connaître une solution innovante, sa maturité, son marché et les étapes de développement prévues.",
    short: "Innovation et nouvelles technologies",
  },
  {
    icon: Globe2,
    title: "Développement de nouveaux marchés",
    text: "Présenter une stratégie d’expansion, de nouveaux débouchés et les besoins liés à votre déploiement.",
    short: "Développement de nouveaux marchés",
  },
];
export function ServiceCards({ home = false }: { home?: boolean }) {
  const items = home ? [services[0], services[1], services[3], services[4]] : services;
  return (
    <div className={home ? "mp-services-grid home" : "mp-services-grid"}>
      {items.map((s, i) => (
        <article className="mp-service" key={s.title}>
          <div className="mp-service-top">
            <s.icon size={29} strokeWidth={1.4} />
            <span>0{i + 1}</span>
          </div>
          <h3>{home ? s.short : s.title}</h3>
          <p>{s.text}</p>
          <Link href={home ? "/nos-services" : "/presenter-un-projet"}>
            {home ? "Découvrir le service" : "Présenter mon projet"}
            <ArrowUpRight size={18} />
          </Link>
        </article>
      ))}
    </div>
  );
}
export const steps = [
  [
    "Présentez votre projet",
    "Décrivez votre activité, vos objectifs et vos besoins. Un dossier structuré permet de comprendre votre initiative.",
  ],
  [
    "Faites étudier votre dossier",
    "Une analyse préliminaire des informations permet d’identifier les points à approfondir.",
  ],
  [
    "Échangez avec notre équipe",
    "Des précisions complémentaires pourront être demandées si nécessaire, sans engagement de financement.",
  ],
  [
    "Étudiez les possibilités",
    "Les possibilités de partenariat sont étudiées sous réserve de viabilité, de conditions contractuelles et du cadre réglementaire.",
  ],
];
export function ProcessSteps() {
  return (
    <div className="mp-steps">
      {steps.map(([title, text], i) => (
        <article key={title}>
          <div className="mp-step-number">
            0{i + 1}
            <ArrowRight size={18} />
          </div>
          <h3>{title}</h3>
          <p>{text}</p>
        </article>
      ))}
    </div>
  );
}
export function FAQList({ short = false }: { short?: boolean }) {
  return (
    <div className="mp-faq-list">
      {(short ? faqItems.slice(1, 5) : faqItems).map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <Plus className="mp-plus" size={18} />
            <Minus className="mp-minus" size={18} />
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
