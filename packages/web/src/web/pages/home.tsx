import { useEffect, useRef, useState, type FormEvent } from "react";
import { Testimonials } from "../components/testimonials";
import {
  ArrowUpRight,
  ArrowRight,
  Menu,
  X,
  Sprout,
  Building2,
  Handshake,
  ShieldCheck,
  Check,
  Mail,
  Phone,
  MapPin,
  Plus,
  Minus,
  ChevronDown,
  CircleCheck,
  Globe2,
} from "lucide-react";

const topics = [
  "Création d’entreprise",
  "Entreprise en difficulté",
  "Investisseur particulier",
  "Partenaire ou associé",
  "Autre demande",
];
const solutions = [
  {
    icon: Sprout,
    num: "01",
    title: "Donner vie à votre entreprise.",
    text: "Vous avez une idée, une ambition, un projet. Échangeons sur vos besoins de financement pour construire les bases de votre future entreprise.",
    link: "Présenter mon projet",
    topic: topics[0],
    tag: "CRÉATEURS D’ENTREPRISE",
  },
  {
    icon: Building2,
    num: "02",
    title: "Ouvrir un nouveau chapitre.",
    text: "Dirigeants de sociétés privées : parlons de vos difficultés et des pistes de financement à étudier pour accompagner la continuité de votre activité.",
    link: "Parler de ma situation",
    topic: topics[1],
    tag: "DIRIGEANTS D’ENTREPRISE",
  },
  {
    icon: Handshake,
    num: "03",
    title: "Construire ensemble.",
    text: "Investisseurs particuliers, partenaires et futurs associés : participez aux échanges autour d’un projet de société de financement en France.",
    link: "Explorer une collaboration",
    topic: topics[3],
    tag: "INVESTISSEURS & PARTENAIRES",
  },
];
const faqs = [
  [
    "À qui s’adresse Band Finance Investment ?",
    "Aux porteurs de projets de création d’entreprise, aux dirigeants de sociétés privées en difficulté et aux particuliers souhaitant échanger sur une collaboration en tant qu’investisseur, partenaire ou associé.",
  ],
  [
    "Le financement de mon projet est-il garanti ?",
    "Non. Toute piste de financement nécessite une étude de votre situation, de la viabilité du projet et de son cadre juridique. Une prise de contact ne constitue ni une offre de crédit, ni une promesse de financement.",
  ],
  [
    "Comment devenir partenaire ou associé ?",
    "Présentez votre expérience, vos compétences et le type de collaboration envisagé dans le formulaire. Un premier échange permettra de clarifier les objectifs, les responsabilités et les conditions à étudier ensemble.",
  ],
  [
    "Puis-je investir directement sur ce site ?",
    "Non. Ce site est un site de présentation et de prise de contact. Il ne collecte aucun fonds et ne propose aucun placement souscriptible. Band Finance Investment est présenté ici comme un projet de société de financement en développement. Tout investissement éventuel devra faire l’objet d’une documentation et des vérifications réglementaires nécessaires.",
  ],
  [
    "Quelles informations fournir pour un premier échange ?",
    "Décrivez votre activité, le stade de votre projet, votre besoin et votre objectif. Ne transmettez pas de coordonnées bancaires, de pièce d’identité ou de documents financiers confidentiels dans ce premier message.",
  ],
];

function Brand() {
  return (
    <a className="brand" href="#accueil" aria-label="Band Finance Investment — Accueil">
      <img src="/images/emblem.png" alt="" />
      <span>
        BAND FINANCE<small>INVESTMENT</small>
      </span>
    </a>
  );
}

export default function Home() {
  const [menu, setMenu] = useState(false);
  const [topic, setTopic] = useState(topics[0]);
  const [prepared, setPrepared] = useState(false);
  const [mailUrl, setMailUrl] = useState("");
  const [legal, setLegal] = useState<"legal" | "privacy" | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    if (legal) dialogRef.current?.showModal();
    else dialogRef.current?.close();
  }, [legal]);
  function contact(value: string) {
    setTopic(value);
    setPrepared(false);
  }
  function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = new FormData(e.currentTarget);
    const body = `Bonjour Band Finance Investment,\n\nObjet : ${topic}\nNom : ${data.get("name")}\nE-mail : ${data.get("email")}\nTéléphone : ${data.get("phone") || "Non renseigné"}\n\n${data.get("message")}\n\nCordialement,\n${data.get("name")}`;
    const url = `mailto:contact@bfinanceinvest.com?subject=${encodeURIComponent(`Demande — ${topic}`)}&body=${encodeURIComponent(body)}`;
    setMailUrl(url);
    setPrepared(true);
    window.location.href = url;
  }
  return (
    <>
      <a className="skip" href="#solutions">
        Aller au contenu
      </a>
      <header className="header">
        <div className="container header-inner">
          <Brand />
          <nav className={menu ? "nav open" : "nav"} aria-label="Navigation principale">
            {[
              ["Notre vision", "#vision"],
              ["Nos solutions", "#solutions"],
              ["Investisseurs & partenaires", "#partenaires"],
              ["FAQ", "#faq"],
            ].map(([label, href]) => (
              <a key={href} href={href} onClick={() => setMenu(false)}>
                {label}
              </a>
            ))}
            <a className="button gold nav-contact" href="#contact" onClick={() => setMenu(false)}>
              Parlons de votre projet <ArrowUpRight size={16} />
            </a>
          </nav>
          <button
            className="menu-toggle"
            aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main>
        <section className="hero" id="accueil">
          <img
            className="hero-image"
            src="/images/defense.jpg"
            alt="Les tours du quartier de La Défense à la nuit tombée"
            fetchPriority="high"
          />
          <div className="hero-shade" />
          <div className="hero-orbit" />
          <div className="container hero-content">
            <div className="eyebrow light">
              <span /> LES AMBITIONS SE CONSTRUISENT ENSEMBLE
            </div>
            <h1>
              Investir aujourd’hui.
              <br />
              <em>Construire demain.</em>
            </h1>
            <p>
              Des projets à faire naître. Des entreprises à accompagner.
              <br className="desktop-br" /> Des partenaires à réunir. Donnons une nouvelle dimension
              <br className="desktop-br" /> à vos ambitions entrepreneuriales.
            </p>
            <div className="hero-actions">
              <a className="button gold" href="#contact">
                Présenter mon projet <ArrowUpRight size={18} />
              </a>
              <a className="button outline" href="#solutions">
                Découvrir notre approche <ArrowRight size={17} />
              </a>
            </div>
            <div className="hero-note">
              <ShieldCheck size={16} />
              <span>Une démarche d’échange. Aucun fonds collecté sur ce site.</span>
            </div>
          </div>
          <div className="hero-bottom container">
            <span>
              <span className="tiny-line" /> BASÉ EN FRANCE · TOURNÉ VERS L’AVENIR
            </span>
            <a href="#solutions">
              DÉCOUVRIR <ChevronDown size={15} />
            </a>
          </div>
        </section>
        <div className="values-strip">
          <div className="container">
            <span>
              <Sprout /> L’ambition entrepreneuriale
            </span>
            <span>
              <Handshake /> La force du partenariat
            </span>
            <span>
              <ShieldCheck /> La transparence avant tout
            </span>
          </div>
        </div>
        <section className="section solutions" id="solutions">
          <div className="container">
            <div className="section-top">
              <div>
                <div className="eyebrow">VOS AMBITIONS, NOTRE POINT DE DÉPART</div>
                <h2>
                  À chaque projet,
                  <br />
                  <em>une nouvelle perspective.</em>
                </h2>
              </div>
              <p>
                Créer, rebondir ou s’associer.
                <br />
                Un premier échange pour comprendre votre
                <br className="desktop-br" /> situation et explorer les possibilités.
              </p>
            </div>
            <div className="solution-grid">
              {solutions.map((s) => (
                <article className="solution" key={s.num}>
                  <div className="card-top">
                    <s.icon size={30} strokeWidth={1.3} />
                    <span>{s.num}</span>
                  </div>
                  <div className="card-tag">{s.tag}</div>
                  <h3>{s.title}</h3>
                  <p>{s.text}</p>
                  <a href="#contact" onClick={() => contact(s.topic)}>
                    {s.link}
                    <ArrowUpRight size={19} />
                  </a>
                </article>
              ))}
            </div>
            <div className="section-foot">
              <span className="dot" /> Chaque demande est étudiée au cas par cas, sans engagement ni
              garantie de financement.
            </div>
          </div>
        </section>
        <section className="section vision" id="vision">
          <div className="container vision-grid">
            <div className="vision-art">
              <img
                src="/images/defense.jpg"
                alt="Architecture du quartier d’affaires de La Défense"
                loading="lazy"
              />
              <div className="vision-overlay" />
              <div className="vision-quote">
                <span className="eyebrow light">BAND FINANCE INVESTMENT</span>
                <p>
                  L’avenir se construit
                  <br />
                  <em>
                    avec les bonnes
                    <br />
                    rencontres.
                  </em>
                </p>
                <span className="quote-line" />
              </div>
              <div className="image-label">
                FRANCE <ArrowUpRight size={15} />
              </div>
            </div>
            <div className="vision-copy">
              <div className="eyebrow">NOTRE VISION</div>
              <h2>
                Du capital.
                <br />
                Des compétences.
                <br />
                <em>Une ambition commune.</em>
              </h2>
              <p>
                Band Finance Investment porte un projet de création d’une société de financement en
                France : rapprocher les ambitions entrepreneuriales, les investisseurs particuliers
                et les partenaires qui souhaitent construire ensemble.
              </p>
              <p>
                Notre point de départ est simple : écouter votre besoin, comprendre votre projet et
                poser les bases d’une collaboration réfléchie.
              </p>
              <div className="vision-principles">
                <span>
                  <Check /> Écouter avant de proposer
                </span>
                <span>
                  <Check /> Construire une relation claire
                </span>
                <span>
                  <Check /> Étudier la viabilité de chaque projet
                </span>
              </div>
              <a className="text-link" href="#contact">
                Faisons connaissance <ArrowUpRight size={18} />
              </a>
            </div>
          </div>
        </section>
        <section className="partners section" id="partenaires">
          <div className="container partners-grid">
            <div>
              <div className="eyebrow light">INVESTISSEURS · PARTENAIRES · ASSOCIÉS</div>
              <h2>
                Et si la prochaine étape
                <br />
                se construisait <em>avec vous ?</em>
              </h2>
              <p>
                Nous recherchons des particuliers et des professionnels pour échanger sur le
                développement de Band Finance Investment. Apportez votre vision, votre expérience ou
                votre intérêt pour le projet.
              </p>
              <a className="button gold" href="#contact" onClick={() => contact(topics[3])}>
                Échanger sur une collaboration <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="partner-roles">
              <a href="#contact" onClick={() => contact(topics[2])}>
                <span className="role-icon">
                  <Globe2 />
                </span>
                <div>
                  <h3>Investisseur particulier</h3>
                  <p>Découvrir le projet et son cadre avant toute décision.</p>
                </div>
                <ArrowUpRight />
              </a>
              <a href="#contact" onClick={() => contact(topics[3])}>
                <span className="role-icon">
                  <Handshake />
                </span>
                <div>
                  <h3>Partenaire stratégique</h3>
                  <p>Mettre en commun un réseau et des expertises.</p>
                </div>
                <ArrowUpRight />
              </a>
              <a href="#contact" onClick={() => contact(topics[3])}>
                <span className="role-icon">
                  <Building2 />
                </span>
                <div>
                  <h3>Futur associé</h3>
                  <p>Explorer une vision et un engagement partagés.</p>
                </div>
                <ArrowUpRight />
              </a>
            </div>
          </div>
        </section>
        <section className="section process" id="approche">
          <div className="container">
            <div className="center-heading">
              <div className="eyebrow">UNE DÉMARCHE SIMPLE ET HUMAINE</div>
              <h2>
                Tout commence par <em>un échange.</em>
              </h2>
            </div>
            <div className="steps">
              {[
                [
                  "Présentez votre besoin",
                  "Quelques mots sur votre situation, votre projet et vos objectifs.",
                ],
                ["Échangeons ensemble", "Un premier contact pour mieux comprendre vos attentes."],
                [
                  "Étudions les possibilités",
                  "Une analyse des pistes envisageables et de leurs conditions.",
                ],
                [
                  "Définissons la suite",
                  "Si le projet le permet, un cadre clair pour avancer ensemble.",
                ],
              ].map(([title, text], i) => (
                <div className="step" key={title}>
                  <div className="step-number">
                    0{i + 1}
                    <ArrowRight size={18} />
                  </div>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
        <Testimonials />
        <section className="section faq" id="faq">
          <div className="container faq-grid">
            <div>
              <div className="eyebrow">EN TOUTE TRANSPARENCE</div>
              <h2>
                Vos questions.
                <br />
                <em>Nos réponses.</em>
              </h2>
              <p>
                Besoin d’une précision ?<br />
                Nous sommes à votre écoute.
              </p>
              <a className="text-link" href="mailto:contact@bfinanceinvest.com">
                Contactez-nous <ArrowUpRight size={18} />
              </a>
            </div>
            <div className="faq-list">
              {faqs.map(([q, a]) => (
                <details key={q}>
                  <summary>
                    {q}
                    <Plus className="plus" size={18} />
                    <Minus className="minus" size={18} />
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
        <section className="section contact" id="contact">
          <div className="container contact-grid">
            <div className="contact-copy">
              <div className="eyebrow">LE PREMIER PAS, C’EST LE VÔTRE</div>
              <h2>
                Parlons de
                <br />
                <em>votre ambition.</em>
              </h2>
              <p>
                Un projet à lancer, une situation à faire évoluer,
                <br className="desktop-br" /> une collaboration à imaginer ? Écrivez-nous.
              </p>
              <div className="contact-details">
                <a href="mailto:contact@bfinanceinvest.com">
                  <Mail />
                  <span>
                    <small>ÉCRIVEZ-NOUS</small>contact@bfinanceinvest.com
                  </span>
                  <ArrowUpRight size={17} />
                </a>
                <a href="tel:+33689689701">
                  <Phone />
                  <span>
                    <small>APPELEZ-NOUS</small>+33 6 89 68 97 01
                  </span>
                  <ArrowUpRight size={17} />
                </a>
                <div>
                  <MapPin />
                  <span>
                    <small>NOTRE ANCRAGE</small>France
                  </span>
                </div>
              </div>
            </div>
            <form className="contact-form" onSubmit={submit}>
              <h3>Faisons connaissance</h3>
              <p className="form-intro">Les champs marqués d’un * sont obligatoires.</p>
              <label htmlFor="topic">Vous souhaitez *</label>
              <select
                id="topic"
                aria-label="Vous souhaitez"
                value={topic}
                onChange={(e) => {
                  setTopic(e.target.value);
                  setPrepared(false);
                }}
              >
                {topics.map((t) => (
                  <option key={t}>{t}</option>
                ))}
              </select>
              <div className="form-row">
                <label>
                  Nom et prénom *
                  <input
                    aria-label="Nom et prénom"
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                    placeholder="Votre nom"
                  />
                </label>
                <label>
                  Adresse e-mail *
                  <input
                    aria-label="Adresse e-mail"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    maxLength={180}
                    placeholder="vous@exemple.fr"
                  />
                </label>
              </div>
              <label>
                Téléphone <span>(facultatif)</span>
                <input
                  aria-label="Téléphone facultatif"
                  name="phone"
                  type="tel"
                  autoComplete="tel"
                  maxLength={30}
                  placeholder="Votre numéro de téléphone"
                />
              </label>
              <label>
                Votre projet en quelques mots *
                <textarea
                  aria-label="Votre projet en quelques mots"
                  name="message"
                  required
                  minLength={15}
                  maxLength={4000}
                  rows={4}
                  placeholder="Votre activité, vos besoins, vos objectifs…"
                />
              </label>
              <label className="checkbox">
                <input
                  type="checkbox"
                  required
                  aria-label="J’ai lu la politique de confidentialité et souhaite être recontacté"
                />
                <span>
                  J’ai lu la{" "}
                  <button type="button" onClick={() => setLegal("privacy")}>
                    politique de confidentialité
                  </button>{" "}
                  et souhaite être recontacté(e) au sujet de ma demande.
                </span>
              </label>
              <button className="button gold form-submit" type="submit">
                Préparer ma demande <ArrowUpRight size={18} />
              </button>
              <p className="form-note">
                Votre messagerie s’ouvrira avec un e-mail prérempli. Vous devrez l’envoyer pour
                transmettre votre demande. Aucun document confidentiel à ce stade.
              </p>
              {prepared && (
                <output className="form-success">
                  <CircleCheck size={22} />
                  <div>
                    <strong>Votre e-mail est prêt, mais pas encore envoyé.</strong>
                    <p>
                      Envoyez-le depuis votre messagerie. Si elle ne s’est pas ouverte,{" "}
                      <a href={mailUrl}>ouvrez le message</a> ou écrivez à contact@bfinanceinvest.com.
                    </p>
                  </div>
                </output>
              )}
            </form>
          </div>
        </section>
        <div className="risk">
          <div className="container">
            <ShieldCheck size={22} />
            <p>
              <strong>Une décision éclairée commence par une information claire.</strong> Ce site
              présente un projet en développement, et non une offre de placement ou de crédit. Aucun
              rendement n’est garanti. Tout investissement comporte un risque de perte en capital.
              Vérifiez le statut et les autorisations de tout intervenant avant de vous engager.{" "}
              <a
                href="https://www.amf-france.org/fr/espace-epargnants/proteger-son-epargne/faire-les-verifications"
                target="_blank"
                rel="noreferrer"
              >
                Consulter les conseils de l’AMF <ArrowUpRight size={12} />
              </a>
            </p>
          </div>
        </div>
      </main>
      <footer>
        <div className="container">
          <div className="footer-top">
            <div>
              <Brand />
              <p>Investir aujourd’hui. Construire demain.</p>
            </div>
            <div className="footer-links">
              <a href="#vision">Notre vision</a>
              <a href="#solutions">Nos solutions</a>
              <a href="#partenaires">Devenir partenaire</a>
              <a href="#contact">Contact</a>
            </div>
          </div>
          <div className="footer-bottom">
            <span>© {new Date().getFullYear()} Band Finance Investment</span>
            <div>
              <button onClick={() => setLegal("legal")}>Mentions légales</button>
              <button onClick={() => setLegal("privacy")}>Confidentialité</button>
            </div>
            <span>FRANCE · FR</span>
          </div>
        </div>
      </footer>
      <dialog
        ref={dialogRef}
        className="legal-dialog"
        aria-label={legal === "legal" ? "Mentions légales" : "Politique de confidentialité"}
        onCancel={() => setLegal(null)}
      >
        <button className="dialog-close" onClick={() => setLegal(null)} aria-label="Fermer">
          <X />
        </button>
        {legal === "legal" ? (
          <>
            <div className="eyebrow">INFORMATIONS DU SITE</div>
            <h2>Mentions légales</h2>
            <p>
              Band Finance Investment est présenté sur ce site comme un projet de société de
              financement en développement en France.
            </p>
            <p>
              <strong>Contact :</strong> contact@bfinanceinvest.com · +33 6 89 68 97 01.
            </p>
            <p>
              <strong>Informations à compléter avant publication :</strong> identité et statut
              juridique de l’éditeur, adresse, SIREN/RCS le cas échéant, responsable de publication
              et coordonnées de l’hébergeur. Ces informations n’ont pas été communiquées à ce stade.
            </p>
            <p>
              Aucun statut réglementé ni agrément n’est revendiqué. Ce site ne permet pas de
              souscrire à un placement, de verser des fonds ou d’obtenir un crédit. Toute activité
              future de financement sera soumise au cadre juridique et aux autorisations
              applicables.
            </p>
            <p>Photographie : La Défense, source Unsplash. Logo fourni par le porteur du projet.</p>
          </>
        ) : (
          <>
            <div className="eyebrow">VOS DONNÉES</div>
            <h2>Confidentialité</h2>
            <p>
              Le formulaire prépare un message dans votre logiciel de messagerie. Les informations
              saisies ne sont pas enregistrées dans une base de données par ce formulaire et ne sont
              transmises à Band Finance Investment que lorsque vous envoyez l’e-mail.
            </p>
            <p>
              Les informations de votre message (nom, e-mail, téléphone facultatif et description du
              projet) sont destinées au traitement de votre demande et aux échanges qui en
              découlent. Aucun consentement à une prospection commerciale n’est demandé.
            </p>
            <p>
              Pour demander l’accès, la rectification ou la suppression des données de vos échanges,
              contactez contact@bfinanceinvest.com. Vous pouvez également saisir la CNIL. N’envoyez aucun
              document bancaire ou d’identité dans votre premier contact.
            </p>
            <p>
              <strong>Avant publication :</strong> le responsable de traitement, les durées de
              conservation des e-mails et les modalités de mesure d’audience de l’hébergement
              doivent être précisés par l’éditeur.
            </p>
          </>
        )}
      </dialog>
    </>
  );
}
