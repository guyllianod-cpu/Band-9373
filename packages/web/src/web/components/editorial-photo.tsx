import { Link } from "wouter";
import { ArrowUpRight } from "lucide-react";

export const editorial = {
  partnership: {
    file: "partenariat",
    width: 678,
    height: 452,
    alt: "Poignée de main au-dessus d’un document sur un bureau",
    title: "Les projets ambitieux méritent une étude sérieuse.",
    text: "Présentez votre activité, le montant recherché et l’utilisation prévue du financement. Ces informations constituent le point de départ pour comprendre votre projet et examiner les possibilités de partenariat, sans engagement de financement.",
    action: "Présenter mon projet",
    href: "/presenter-un-projet",
  },
  vision: {
    file: "budget-projet",
    width: 678,
    height: 452,
    alt: "Échange de billets en euros près d’un ordinateur et d’un document",
    title: "Relier votre besoin à des dépenses précises.",
    text: "Achat d’équipements, constitution d’un stock ou développement d’une activité : détaillez ce que le financement permettrait de réaliser. Un budget poste par poste aide à comprendre le montant demandé et les priorités de votre projet.",
    action: "Découvrir notre démarche",
    href: "/notre-demarche",
  },
  prepare: {
    file: "preparer-projet",
    width: 783,
    height: 391,
    alt: "Billets en euros disposés entre deux personnes sur une table",
    title: "Préparez les éléments essentiels de votre projet.",
    text: "Rassemblez une présentation de votre activité, votre budget prévisionnel, le montant recherché et votre calendrier. Le formulaire de démonstration vous permet de vérifier ces informations et d’en consulter un aperçu, sans les transmettre.",
    action: "Préparer mon projet",
    href: "/presenter-un-projet",
  },
  budget: {
    file: "budget-clair",
    width: 678,
    height: 452,
    alt: "Billets en euros échangés sur un bureau avec une calculatrice",
    title: "Un budget clair pour expliquer votre besoin.",
    text: "Distinguez les dépenses de lancement, les équipements et les besoins de fonctionnement. Précisez les ressources déjà disponibles et le montant restant à rechercher : ces éléments donnent une lecture concrète de votre besoin.",
    action: "Voir les catégories de projets",
    href: "#categories-projets",
  },
  amount: {
    file: "montant-devise",
    width: 679,
    height: 452,
    alt: "Deux mains tenant un éventail de billets en euros",
    title: "Indiquez un montant, une devise et un usage.",
    text: "Présentez le montant souhaité en EUR, USD, GBP ou dans une autre devise précisée. Expliquez comment il serait utilisé et indiquez, si vous le souhaitez, votre apport personnel. Une demande complète ne vaut ni accord ni promesse de financement.",
    action: "Présenter mon besoin",
    href: "/presenter-un-projet",
  },
  exchange: {
    file: "premier-echange",
    width: 681,
    height: 450,
    alt: "Échange de billets au-dessus d’un ordinateur ouvert sur un bureau",
    title: "Préparez un premier échange utile.",
    text: "Décrivez votre marché, vos objectifs et les étapes prévues. Si vous disposez d’un business plan, indiquez-le dans le formulaire ; aucun téléchargement de document n’est proposé dans cette version. Ne joignez ni pièce d’identité ni coordonnées bancaires.",
    action: "Préparer mon dossier",
    href: "/presenter-un-projet",
  },
  project: {
    file: "presenter-besoin",
    width: 620,
    height: 320,
    alt: "Échange de billets en euros entre deux mains, cadrage panoramique",
    title: "Décrivez ce que vous souhaitez réaliser.",
    text: "Indiquez le stade de votre activité, le montant recherché et les dépenses envisagées. Avant de vérifier le formulaire, assurez-vous que votre présentation explique clairement le projet et l’usage du financement. En démonstration, aucune donnée n’est envoyée.",
    action: "Commencer mon formulaire",
    href: "#name",
  },
  international: {
    file: "contexte-international",
    width: 600,
    height: 394,
    alt: "Billets en dollars échangés entre deux personnes près d’un ordinateur",
    title: "Votre pays et votre devise font partie du contexte.",
    text: "Précisez votre pays de résidence et la devise de votre besoin. La présence d’un pays dans notre périmètre souhaité ne garantit pas l’éligibilité du projet : les règles locales, les sanctions et la faisabilité de toute relation devront être examinées avant une collaboration.",
    action: "Consulter les pays du périmètre souhaité",
    href: "#pays-etude",
  },
} as const;
export type EditorialKey = keyof typeof editorial;

export function EditorialPhoto({
  photo,
  priority = false,
  slogan = false,
}: {
  photo: EditorialKey;
  priority?: boolean;
  slogan?: boolean;
}) {
  const item = editorial[photo];
  return (
    <figure className={`mp-editorial-photo mp-photo-${photo}`}>
      <img
        src={`/images/editorial/${item.file}.webp`}
        alt={item.alt}
        width={item.width}
        height={item.height}
        loading={priority ? "eager" : "lazy"}
        fetchPriority={priority ? "high" : "auto"}
        decoding="async"
      />
      {slogan && (
        <div className="mp-photo-slogan">
          Des projets ambitieux.
          <br />
          Des partenariats réfléchis.
          <br />
          <em>Des perspectives durables.</em>
        </div>
      )}
    </figure>
  );
}
export function EditorialBlock({
  photo,
  reverse = false,
  dark = false,
  eyebrow,
}: {
  photo: EditorialKey;
  reverse?: boolean;
  dark?: boolean;
  eyebrow: string;
}) {
  const item = editorial[photo];
  return (
    <div className={`mp-editorial-block${reverse ? " reverse" : ""}${dark ? " dark" : ""}`}>
      <EditorialPhoto photo={photo} slogan={photo === "vision"} />
      <div className="mp-editorial-copy">
        <div className="mp-eyebrow">{eyebrow}</div>
        <h2>{item.title}</h2>
        <p>{item.text}</p>
        {item.href.startsWith("#") ? (
          <a className="mp-text-link" href={item.href}>
            {item.action}
            <ArrowUpRight size={17} />
          </a>
        ) : (
          <Link className={dark ? "mp-button primary" : "mp-text-link"} href={item.href}>
            {item.action}
            <ArrowUpRight size={17} />
          </Link>
        )}
      </div>
    </div>
  );
}
