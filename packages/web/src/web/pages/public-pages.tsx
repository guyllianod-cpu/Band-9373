import { Link } from "wouter";
import {
  ArrowUpRight,
  FileText,
  ShieldCheck,
  MessagesSquare,
  MapPin,
  Mail,
  Phone,
  MessageCircle,
  Check,
} from "lucide-react";
import { PageMeta, PageIntro, ProjectCTA, BackHome } from "../components/site-layout";
import { ServiceCards, FAQList, steps } from "../components/content-blocks";
import { countryGroups } from "../../shared/countries";
import { site } from "../../shared/site-config";
import { EditorialPhoto, EditorialBlock, editorial } from "../components/editorial-photo";
import { SubmissionForm } from "../components/submission-form";
import { useRuntimeConfig } from "../queries/submissions";

export function ServicesPage() {
  return (
    <>
      <PageMeta
        title="Nos services — étude de projets"
        description="Création d’entreprise, développement d’activité, commerce, industrie et innovation : présentez vos besoins pour une première étude de partenariat."
      />
      <PageIntro
        eyebrow="Nos services"
        title="Votre projet, ses besoins."
        emphasis="Des possibilités à étudier."
        description="De la création d’entreprise au développement de nouveaux marchés, une première analyse pour comprendre votre activité et vos objectifs."
      />
      <section className="mp-section">
        <div className="mp-container">
          <EditorialBlock photo="budget" eyebrow="COMPRENDRE VOTRE BESOIN" />
          <div id="categories-projets" className="mp-photo-service-cards">
            <ServiceCards />
          </div>
          <EditorialBlock photo="amount" reverse eyebrow="PRÉCISER VOTRE DEMANDE" />
          <div className="mp-information">
            <ShieldCheck />
            <div>
              <h2>Une étude ne constitue pas une promesse.</h2>
              <p>
                Chaque demande dépend de critères d’éligibilité, de la qualité des informations et
                d’une analyse préalable. Les critères détaillés seront précisés avant la mise en
                service. Tous les projets ne pourront pas donner lieu à un partenariat.
              </p>
            </div>
          </div>
        </div>
      </section>
      <ProjectCTA />
    </>
  );
}
export function ApproachPage() {
  return (
    <>
      <PageMeta
        title="Notre démarche — présenter un dossier"
        description="Découvrez les étapes de présentation, d’analyse préliminaire et d’étude d’un projet recherchant un partenaire financier."
      />
      <PageIntro
        eyebrow="Notre démarche"
        title="Une méthode structurée."
        emphasis="Un dialogue transparent."
        description="Comprendre votre initiative, réunir les informations utiles et examiner les possibilités : un parcours sans garantie automatique de financement."
      />
      <section className="mp-section">
        <div className="mp-container mp-detail-steps">
          {steps.map(([title, text], i) => (
            <article key={title}>
              <div className="mp-detail-num">0{i + 1}</div>
              <div>
                <div className="mp-eyebrow">ÉTAPE {i + 1}</div>
                <h2>
                  {
                    [
                      "Soumission du dossier",
                      "Analyse préliminaire des informations",
                      "Précisions complémentaires, si nécessaire",
                      "Étude des possibilités de partenariat",
                    ][i]
                  }
                </h2>
                <p>{text}</p>
                {i === 0 && (
                  <Link className="mp-text-link" href="/presenter-un-projet">
                    Préparer mon dossier
                    <ArrowUpRight size={17} />
                  </Link>
                )}
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="mp-section mp-soft">
        <div className="mp-container mp-photo-exchange">
          <EditorialBlock photo="exchange" eyebrow="PRÉPARER VOTRE PREMIER ÉCHANGE" />
        </div>
        <div className="mp-container mp-two-columns">
          <div>
            <div className="mp-eyebrow">PRÉPARER VOTRE PREMIER ÉCHANGE</div>
            <h2>
              Des informations utiles.
              <br />
              <em>Pas de documents sensibles.</em>
            </h2>
            <ul className="mp-check-list">
              <li>
                <Check />
                Une présentation de votre activité
              </li>
              <li>
                <Check />
                Le budget et l’usage du financement
              </li>
              <li>
                <Check />
                Un business plan, si disponible
              </li>
              <li>
                <Check />
                Vos hypothèses et votre calendrier
              </li>
            </ul>
            <p>
              Aucun téléchargement de document n’est disponible dans cette version. Ne communiquez
              pas de pièce d’identité ni de données bancaires.
            </p>
          </div>
          <FAQList short />
        </div>
      </section>
      <ProjectCTA />
    </>
  );
}
export function AboutPage() {
  return (
    <>
      <PageMeta
        title="À propos — Band Finance Investment"
        description="Découvrez la vision et la démarche de Band Finance Investment, un projet dédié à l’étude d’initiatives entrepreneuriales et de possibilités de partenariat."
      />
      <PageIntro
        eyebrow="À propos"
        title="Des ambitions à rapprocher."
        emphasis="Une vision à construire."
        description={site.slogan}
      />
      <section className="mp-section">
        <div className="mp-container mp-vision-grid">
          <div className="mp-vision-photo">
            <img src="/images/defense.jpg" alt="Quartier d’affaires de La Défense" loading="lazy" />
            <div>
              <span className="mp-eyebrow">NOTRE POINT DE DÉPART</span>
              <p>
                Écouter.
                <br />
                Comprendre.
                <br />
                <em>Étudier ensemble.</em>
              </p>
            </div>
          </div>
          <div>
            <div className="mp-eyebrow">BAND FINANCE INVESTMENT</div>
            <h2>
              Comprendre les projets.
              <br />
              <em>Examiner les perspectives.</em>
            </h2>
            <p>
              Band Finance Investment s’intéresse aux initiatives entrepreneuriales et aux
              opportunités de développement économique. Notre démarche consiste à comprendre les
              objectifs des porteurs de projets, à examiner leurs besoins et à étudier les
              possibilités de partenariat adaptées à chaque situation.
            </p>
            <p>
              Le site présente un projet en phase de validation. Aucun agrément, certification ou
              statut financier réglementé n’est revendiqué. Les informations officielles sur
              l’entreprise et son équipe seront ajoutées après vérification.
            </p>
            <Link className="mp-text-link" href="/contact">
              Faisons connaissance
              <ArrowUpRight size={17} />
            </Link>
          </div>
        </div>
      </section>
      <section className="mp-section mp-soft">
        <div className="mp-container">
          <div className="mp-section-heading">
            <div>
              <div className="mp-eyebrow">UNE OUVERTURE INTERNATIONALE</div>
              <h2>
                Votre pays.
                <br />
                <em>Votre contexte.</em>
              </h2>
            </div>
            <p className="mp-limited">
              Le périmètre souhaité d’étude ne garantit aucune éligibilité. Les sanctions, gels
              d’avoirs et règles locales doivent être vérifiés avant toute collaboration.
            </p>
          </div>
          <div className="mp-photo-international">
            <EditorialBlock photo="international" eyebrow="CHAQUE CONTEXTE COMPTE" />
          </div>
          <div className="mp-countries-grid" id="pays-etude">
            {Object.entries(countryGroups).map(([region, list]) => (
              <details key={region}>
                <summary>
                  {region}
                  <span>{list.length} pays / territoires</span>
                </summary>
                <p>{list.join(" · ")}</p>
              </details>
            ))}
          </div>
          <div className="mp-information">
            <FileText />
            <div>
              <h2>Informations officielles à compléter</h2>
              <p>
                Raison sociale, statut juridique, adresse, immatriculation le cas échéant,
                responsable de publication et présentation vérifiée de l’équipe : ces éléments n’ont
                pas encore été communiqués.
              </p>
              <Link href="/mentions-legales" className="mp-text-link">
                Consulter les mentions légales
                <ArrowUpRight size={16} />
              </Link>
            </div>
          </div>
        </div>
      </section>
      <ProjectCTA />
    </>
  );
}
export function ProjectPage() {
  return (
    <>
      <PageMeta
        title="Présenter un projet — demande de financement"
        description="Préparez un dossier décrivant votre projet, votre besoin de financement et vos objectifs. Formulaire complet en mode démonstration, sans transmission."
      />
      <PageIntro
        eyebrow="Présenter un projet"
        title="Votre ambition commence"
        emphasis="par une présentation claire."
        description="Expliquez votre initiative et vos besoins. Un dossier structuré est le point de départ d’une étude sérieuse, sans garantie de financement."
      />
      <section className="mp-section mp-form-section">
        <div className="mp-container mp-project-layout">
          <aside className="mp-project-aside mp-project-photo-aside">
            <EditorialPhoto photo="project" />
            <div className="mp-eyebrow">PRÉPARER VOTRE DOSSIER</div>
            <h2>{editorial.project.title}</h2>
            <p className="mp-project-photo-text">{editorial.project.text}</p>
            <a className="mp-text-link" href="#name">
              {editorial.project.action}
              <ArrowUpRight size={16} />
            </a>
            <div className="mp-aside-items">
              <div>
                <FileText />
                <p>
                  <strong>Votre activité</strong>Présentez le contexte, le marché et le stade du
                  projet.
                </p>
              </div>
              <div>
                <MessagesSquare />
                <p>
                  <strong>Votre besoin</strong>Précisez le montant, la devise et l’utilisation
                  envisagée.
                </p>
              </div>
              <div>
                <ShieldCheck />
                <p>
                  <strong>Votre confidentialité</strong>N’ajoutez ni pièce d’identité ni coordonnées
                  bancaires.
                </p>
              </div>
            </div>
            <hr />
            <p>
              Le formulaire est en démonstration. Aucun dossier ne sera transmis ou enregistré avant
              activation de la collecte réelle.
            </p>
            <Link href="/notre-demarche">
              Comprendre le parcours
              <ArrowUpRight size={16} />
            </Link>
            <Link href="/politique-de-confidentialite">
              Protection des données
              <ArrowUpRight size={16} />
            </Link>
          </aside>
          <SubmissionForm kind="project" />
        </div>
      </section>
    </>
  );
}
export function ContactPage() {
  const { data } = useRuntimeConfig();
  const active = data?.contactEnabled === true;
  return (
    <>
      <PageMeta
        title="Contact — échangeons sur votre projet"
        description={`Contactez Band Finance Investment à ${site.email} ou au ${site.phone}, également sur WhatsApp. ${active ? "Formulaire de contact avec confirmation d’enregistrement." : "Ouverture du formulaire en préparation, sans transmission."}`}
      />
      <PageIntro
        eyebrow="Contact"
        title="Un projet, une question ?"
        emphasis="Commençons par un échange."
        description="Une initiative à présenter ou une collaboration à envisager : retrouvez nos coordonnées et préparez votre message."
      />
      <section className="mp-section">
        <div className="mp-container mp-contact-layout">
          <div className="mp-contact-info">
            <h2>À votre écoute.</h2>
            <p>
              Les liens ci-dessous ouvrent votre messagerie, votre application téléphonique ou WhatsApp. Le
              {active ? "formulaire permet de transmettre votre message avec une référence après enregistrement." : "formulaire est préparé pour sa mise en service, mais la transmission reste désactivée jusqu’à validation finale."}
            </p>
            <a href={`mailto:${site.email}`}>
              <Mail />
              <span>
                <small>ADRESSE E-MAIL</small>
                {site.email}
              </span>
              <ArrowUpRight size={18} />
            </a>
            <a href={`tel:${site.phoneHref}`}>
              <Phone />
              <span>
                <small>TÉLÉPHONE</small>
                {site.phone}
              </span>
              <ArrowUpRight size={18} />
            </a>
            <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer">
              <MessageCircle />
              <span>
                <small>WHATSAPP</small>
                {site.phone}
              </span>
              <ArrowUpRight size={18} />
            </a>
            <div>
              <MapPin />
              <span>
                <small>ANCRAGE DU PROJET</small>France
              </span>
            </div>
            <div className="mp-info-muted">
              Adresse officielle et horaires de disponibilité à compléter après confirmation. Aucun
              réseau social officiel n’a été communiqué.
            </div>
            <Link className="mp-text-link" href="/questions-frequentes">
              Consulter les questions fréquentes
              <ArrowUpRight size={16} />
            </Link>
          </div>
          <SubmissionForm kind="contact" />
        </div>
      </section>
    </>
  );
}
export function FAQPage() {
  return (
    <>
      <PageMeta
        title="Questions fréquentes — financement et projets"
        description="Types de projets, documents utiles, étapes d’analyse, absence de financement garanti et protection des données : nos réponses à vos questions."
      />
      <PageIntro
        eyebrow="Questions fréquentes"
        title="Une information claire."
        emphasis="Avant toute décision."
        description="Les réponses essentielles pour comprendre le parcours de présentation d’un projet et les limites de cette version du site."
      />
      <section className="mp-section">
        <div className="mp-container mp-faq-page">
          <FAQList />
          <div className="mp-information">
            <MessagesSquare />
            <div>
              <h2>Votre question n’est pas ici ?</h2>
              <p>
                Vous pouvez nous contacter directement. La page Contact indique si la transmission
                du formulaire est ouverte ou si seule la vérification locale est disponible.
              </p>
              <Link href="/contact" className="mp-text-link">
                Nous contacter
                <ArrowUpRight size={17} />
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
export function PrivacyPage() {
  const { data } = useRuntimeConfig();
  const active = data?.contactEnabled === true;
  return (
    <>
      <PageMeta
        title="Politique de confidentialité"
        description="Informations sur l’état du formulaire de contact, le traitement des demandes, la conservation d’un mois calendaire et vos droits."
      />
      <PageIntro
        eyebrow="Confidentialité"
        title="Vos données méritent"
        emphasis="une information transparente."
        description={active ? "Le formulaire de contact est ouvert ; les projets restent en démonstration." : "Contact : ouverture en préparation, aucune transmission. Projets : démonstration uniquement."}
      />
      <section className="mp-section">
        <div className="mp-container mp-legal-content">
          <h2>1. État actuel des formulaires</h2>
          {active && <p>Le contact enregistre votre nom, adresse e-mail, objet, message et consentement pour répondre à votre demande. Une notification est adressée à {site.email} via Resend et un accusé minimal est destiné à votre adresse. Leur livraison peut échouer sans annuler l’enregistrement. Les projets restent en démonstration.</p>}
          <p>
            Dans les formulaires non ouverts, les informations saisies restent dans la mémoire de votre
            navigateur le temps de la page. Elles ne sont ni envoyées à Band Finance Investment, ni
            enregistrées dans une base de données, ni conservées dans le stockage local du
            navigateur. L’aperçu d’administration utilise uniquement des exemples synthétiques,
            clairement identifiés.
          </p>
          <h2>2. Responsable du traitement</h2>
          <p>
            L’identité juridique et l’adresse du responsable du traitement restent à compléter avant
            activation de la collecte. Contact du porteur du projet :{" "}
            <a href={`mailto:${site.email}`}>{site.email}</a>. Cette notice n’affirme pas une
            conformité finale tant que ces informations et les modalités d’hébergement ne sont pas
            validées.
          </p>
          <h2>3. Finalités et conditions du traitement</h2>
          <p>
            Les données d’identité, de contact, du pays de résidence, de l’activité et du besoin de
            financement serviront à recevoir et étudier votre demande, puis à échanger avec vous.
            Les champs obligatoires seront signalés. La base légale prévue pour le dépôt est votre
            consentement explicite ; elle doit être validée par le responsable du traitement selon
            l’activité réellement mise en service. Aucun consentement à une prospection commerciale
            n’est demandé.
          </p>
          <h2>4. Destinataires et sécurité</h2>
          <p>
            Les dossiers seront accessibles uniquement à l’administrateur autorisé, après connexion
            et vérification de son identité. Les notifications de projets destinées à cet administrateur
            contiendront une référence et un lien vers l’administration, pas une copie du dossier.
            Les messages du formulaire de contact, avec le nom, l’adresse de réponse et l’objet,
            seront transmis à la messagerie professionnelle {site.email}. Un accusé de réception
            automatique sera envoyé à l’adresse saisie par le visiteur, sans reprendre le contenu
            de son message et sans engagement de financement. Les
            sous-traitants envisagés sont le service d’hébergement, Turso pour la base, les services
            d’authentification et Resend pour les notifications ; leur localisation, leurs
            garanties, les transferts éventuels et leurs accords devront être examinés avant
            activation.
          </p>
          <h2>5. Durée de conservation</h2>
          <p>
            Les dossiers et messages seront supprimés de la base active un mois calendaire après
            réception, sans prolongation lors des échanges. Le calcul utilise UTC : si le jour
            n’existe pas dans le mois suivant, le dernier jour de ce mois est retenu. Une purge
            quotidienne doit être configurée avant activation ; l’accès est refusé dès expiration,
            et la suppression de la base active intervient au passage de purge suivant (au plus tard
            lors du prochain passage quotidien). Les politiques de sauvegarde du fournisseur doivent
            être validées séparément.
          </p>
          <p>
            Les notifications de projets ne reproduiront pas le dossier. La copie des messages de
            contact dans la messagerie professionnelle et les accusés de réception relèvent des
            durées de conservation des e-mails, à définir séparément. La durée des données de compte
            administrateur, des échanges directs par e-mail et des journaux techniques doit être
            définie séparément par l’éditeur ; la durée d’un mois ne constitue pas une promesse de
            suppression automatique des messages présents dans une messagerie externe.
          </p>
          <h2>6. Vos droits</h2>
          <p>
            Vous pouvez demander l’accès, la rectification, la suppression ou la limitation, et
            retirer votre consentement pour le traitement fondé sur celui-ci, en écrivant à{" "}
            {site.email}. Vous pouvez déposer une réclamation auprès de la{" "}
            <a href="https://www.cnil.fr" target="_blank" rel="noreferrer">
              CNIL
            </a>
            . Ces demandes seront traitées selon la situation réelle du service et les obligations
            applicables.
          </p>
          <h2>7. Mesure d’audience et navigation</h2>
          <p>
            L’hébergement inclut une mesure d’audience technique de la plateforme. Ses modalités,
            durées et éventuel besoin de consentement devront être vérifiés avant publication. Aucun
            pixel publicitaire Google, Meta ou LinkedIn n’a été ajouté dans cette refonte.
          </p>
          <h2>8. Informations à compléter</h2>
          <p>
            Responsable du traitement, adresse, sous-traitants définitifs, localisation des données,
            transferts, conservation des données d’authentification et des logs, politique de
            sauvegarde et modalités de mesure d’audience. Dernière version de la notice :{" "}
            {site.noticeVersion}.
          </p>
        </div>
      </section>
    </>
  );
}
export function LegalPage() {
  return (
    <>
      <PageMeta
        title="Mentions légales"
        description="BANDFINVEST — SAS — Responsable de la publication : Mathias Durand — Hébergement : Runable."
      />
      <PageIntro
        eyebrow="Mentions légales"
        title="Mentions légales"
        description="BANDFINVEST"
      />
      <section className="mp-section">
        <div className="mp-container mp-legal-content">
          <h2>Éditeur du site</h2>
          <dl className="mp-legal-list">
            {[
              ["Raison sociale", "BANDFINVEST"],
              ["Statut juridique", "SAS"],
              ["Adresse du siège", "12 rue Banaudon, Rhône-Alpes, 69006 LYON, France"],
              ["SIRET", "560 119 281 00049"],
              ["SIREN", "560 119 281"],
              ["RCS", "RCS Lyon B 560 119 281"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt>{label}</dt>
                <dd>{value}</dd>
              </div>
            ))}
          </dl>
          <h2>Responsable de la publication</h2>
          <p>Mathias Durand</p>
          <h2>Hébergement</h2>
          <p>Runable</p>
          <p>8 The Green # A, Dover, DE 19901-3618, États-Unis</p>
        </div>
      </section>
    </>
  );
}
export function NotFoundPage() {
  return (
    <>
      <PageMeta
        title="Page introuvable"
        description="Cette page n’existe pas. Retrouvez l’accueil de Band Finance Investment."
      />
      <PageIntro
        eyebrow="Erreur 404"
        title="Cette page n’existe pas."
        emphasis="Reprenons le bon chemin."
        description="Le lien utilisé n’a pas de destination sur ce site. Retrouvez nos services ou présentez votre projet depuis l’accueil."
      />
      <section className="mp-section">
        <div className="mp-container">
          <BackHome />
        </div>
      </section>
    </>
  );
}
