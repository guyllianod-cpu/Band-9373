import { Link } from "wouter";
import {
  ArrowUpRight,
  ArrowRight,
  ShieldCheck,
  Handshake,
  FileSearch,
  ChevronDown,
} from "lucide-react";
import { PageMeta } from "../components/site-layout";
import { ServiceCards, ProcessSteps } from "../components/content-blocks";
import { EditorialPhoto, EditorialBlock, editorial } from "../components/editorial-photo";
import { Testimonials } from "../components/testimonials";

export default function Landing() {
  return (
    <>
      <PageMeta
        fullTitle
        title="BANDFINVEST | Finance, Investissement et Conseil financier"
        description="BANDFINVEST accompagne les particuliers et les entreprises dans leurs réflexions financières et leurs projets d’investissement grâce à une approche structurée, transparente et adaptée à leurs objectifs."
      />
      <section className="mp-hero mp-photo-hero" id="accueil" aria-labelledby="accueil-title">
        <div className="mp-container mp-photo-hero-grid">
          <div className="mp-hero-ring" />
          <div className="mp-hero-content">
            <div className="mp-eyebrow">UNE AMBITION COMMUNE, UN AVENIR À CONSTRUIRE</div>
            <h1 id="accueil-title">
              BANDFINVEST —
              <br />
              Étude de projets{" "}
              <em>
                et partenariats
                <br />
                financiers.
              </em>
            </h1>
            <p>{editorial.partnership.text}</p>
            <div className="mp-hero-actions">
              <Link href="/presenter-un-projet" className="mp-button primary">
                Présenter mon projet
                <ArrowUpRight size={18} />
              </Link>
              <Link href="/nos-services" className="mp-button secondary">
                Découvrir nos services
                <ArrowRight size={17} />
              </Link>
            </div>
            <div className="mp-hero-note">
              <ShieldCheck size={15} />
              Une étude préalable. Aucun financement garanti.
            </div>
          </div>
          <EditorialPhoto photo="partnership" priority />
        </div>
        <div className="mp-hero-bottom mp-container">
          <span>FRANCE · PERSPECTIVES INTERNATIONALES</span>
          <a href="#approche">
            DÉCOUVRIR
            <ChevronDown size={14} />
          </a>
        </div>
      </section>
      <div className="mp-values">
        <div className="mp-container">
          <span>
            <FileSearch />
            Une étude sérieuse
          </span>
          <span>
            <Handshake />
            Des partenariats réfléchis
          </span>
          <span>
            <ShieldCheck />
            Une information transparente
          </span>
        </div>
      </div>
      <section className="mp-section" id="approche" aria-labelledby="approche-title">
        <div className="mp-container mp-approach-grid">
          <div>
            <div className="mp-eyebrow">NOTRE APPROCHE</div>
            <h2 id="approche-title">
              Comprendre votre projet
              <br />
              <em>et vos besoins financiers.</em>
            </h2>
          </div>
          <div>
            <p>
              Chaque projet possède ses propres objectifs, ses contraintes et son potentiel. Nous
              invitons les porteurs de projets à présenter clairement leur activité et leurs besoins
              afin de permettre une première analyse.
            </p>
            <Link className="mp-text-link" href="/notre-demarche">
              Découvrir notre démarche
              <ArrowUpRight size={18} />
            </Link>
          </div>
        </div>
      </section>
      <section className="mp-section mp-soft" id="solutions" aria-labelledby="solutions-title">
        <div className="mp-container">
          <div className="mp-section-heading">
            <div>
              <div className="mp-eyebrow">LES PROJETS RECHERCHÉS</div>
              <h2 id="solutions-title">
                Création et développement :
                <br />
                <em>les projets étudiés.</em>
              </h2>
            </div>
            <Link className="mp-text-link" href="/nos-services">
              Tous nos services
              <ArrowUpRight size={17} />
            </Link>
          </div>
          <ServiceCards home />
          <p className="mp-fineprint">
            Chaque demande dépend de critères d’éligibilité et d’une analyse préalable. Aucune offre
            de crédit ou de placement n’est proposée sur ce site.
          </p>
        </div>
      </section>
      <section className="mp-section">
        <div className="mp-container">
          <EditorialBlock photo="vision" eyebrow="DU BESOIN AU BUDGET" />
        </div>
      </section>
      <section className="mp-section mp-process-section" aria-labelledby="process-title">
        <div className="mp-container">
          <div className="mp-center-heading">
            <div className="mp-eyebrow">COMMENT ÇA FONCTIONNE ?</div>
            <h2 id="process-title">
              Les étapes d’étude
              <br />
              <em>de votre projet.</em>
            </h2>
          </div>
          <ProcessSteps />
        </div>
      </section>
      <Testimonials />
      <section className="mp-section mp-photo-cta">
        <div className="mp-container">
          <EditorialBlock photo="prepare" dark reverse eyebrow="LE PREMIER PAS, C’EST LE VÔTRE" />
        </div>
      </section>
    </>
  );
}
