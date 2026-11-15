import { useEffect, useState, type ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { ArrowUpRight, Menu, X, Mail, Phone, MessageCircle, LockKeyhole, ArrowRight } from "lucide-react";
import { navigation, site } from "../../shared/site-config";
import { canonicalURL, publicSiteOrigin } from "../../shared/seo-config";

export function Brand() {
  return (
    <Link href="/" className="mp-brand" aria-label="Band Finance Investment — accueil">
      <img src="/images/emblem.png" alt="" width={55} height={50} />
      <span>
        BAND FINANCE<small>INVESTMENT</small>
      </span>
    </Link>
  );
}
export function PageMeta({ title, description, fullTitle = false }: { title: string; description: string; fullTitle?: boolean }) {
  const [location] = useLocation();
  useEffect(() => {
    document.title = fullTitle ? title : `${title} | Band Finance Investment`;
    const canonical = canonicalURL(location);
    for (const [attribute, key, content] of [
      ["name", "description", description],
      ["property", "og:description", description],
      ["property", "og:title", document.title],
      ["property", "og:type", "website"],
      ["property", "og:url", canonical],
      ["property", "og:site_name", "BANDFINVEST"],
      ["property", "og:locale", "fr_FR"],
      ["property", "og:image", `${publicSiteOrigin}/images/editorial/partenariat.webp`],
      ["property", "og:image:alt", "Poignée de main au-dessus d’un document sur un bureau"],
      ["property", "og:image:width", "678"],
      ["property", "og:image:height", "452"],
      ["property", "og:image:type", "image/webp"],
    ] as const) {
      let meta = document.head.querySelector<HTMLMetaElement>(`meta[${attribute}="${key}"]`);
      if (!content) {
        meta?.remove();
        continue;
      }
      if (!meta) {
        meta = document.createElement("meta");
        meta.setAttribute(attribute, key);
        document.head.append(meta);
      }
      meta.content = content;
    }
    let canonicalLink = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) {
      if (!canonicalLink) {
        canonicalLink = document.createElement("link");
        canonicalLink.rel = "canonical";
        document.head.append(canonicalLink);
      }
      canonicalLink.href = canonical;
    } else {
      canonicalLink?.remove();
    }
    let robots = document.head.querySelector<HTMLMetaElement>('meta[name="robots"]');
    if (!robots) {
      robots = document.createElement("meta");
      robots.name = "robots";
      document.head.append(robots);
    }
    robots.content = canonical ? "index, follow" : "noindex, nofollow";
  }, [title, description, fullTitle, location]);
  return null;
}
export function SiteLayout({ children }: { children: ReactNode }) {
  const [location] = useLocation();
  const [menu, setMenu] = useState(false);
  useEffect(() => {
    setMenu(false);
    window.scrollTo({ top: 0, behavior: "instant" });
  }, [location]);
  return (
    <div className="mp">
      <a className="mp-skip" href="#contenu">
        Aller au contenu
      </a>
      <div className="mp-topbar">
        <div className="mp-container">
          <span>{site.slogan}</span>
          <a href={`mailto:${site.email}`}>
            <Mail size={12} />
            {site.email}
          </a>
        </div>
      </div>
      <header className="mp-header">
        <div className="mp-container">
          <Brand />
          <nav
            id="main-navigation"
            className={menu ? "mp-nav is-open" : "mp-nav"}
            aria-label="Navigation principale"
          >
            {navigation
              .filter(([label]) => label !== "Questions fréquentes")
              .map(([label, path]) => (
                <Link key={path} href={path} aria-current={location === path ? "page" : undefined}>
                  {label}
                </Link>
              ))}
            <Link href="/presenter-un-projet" className="mp-button primary">
              Présenter un projet
              <ArrowUpRight size={16} />
            </Link>
          </nav>
          <button
            type="button"
            className="mp-menu"
            aria-label={menu ? "Fermer le menu" : "Ouvrir le menu"}
            aria-controls="main-navigation"
            aria-expanded={menu}
            onClick={() => setMenu(!menu)}
          >
            {menu ? <X /> : <Menu />}
          </button>
        </div>
      </header>
      <main id="contenu">{children}</main>
      <footer className="mp-footer">
        <div className="mp-container">
          <div className="mp-footer-grid">
            <div>
              <Brand />
              <p>
                Une démarche d’écoute et d’étude pour rapprocher projets entrepreneuriaux et
                possibilités de partenariat.
              </p>
              <span className="mp-footer-label">FRANCE · OUVERTURE INTERNATIONALE</span>
            </div>
            <div>
              <h2>Découvrir</h2>
              {navigation.slice(0, 4).map(([label, path]) => (
                <Link key={path} href={path}>
                  {label}
                </Link>
              ))}
            </div>
            <div>
              <h2>Échanger</h2>
              <Link href="/presenter-un-projet">Présenter un projet</Link>
              <Link href="/questions-frequentes">Questions fréquentes</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/administration/connexion">
                <LockKeyhole size={12} />
                Espace administrateur
              </Link>
            </div>
            <div>
              <h2>Nous contacter</h2>
              <a href={`mailto:${site.email}`}>
                <Mail size={15} />
                {site.email}
              </a>
              <a href={`tel:${site.phoneHref}`}>
                <Phone size={15} />
                {site.phone}
              </a>
              <a href={site.whatsappHref} target="_blank" rel="noopener noreferrer">
                <MessageCircle size={15} />
                WhatsApp
              </a>
              <span>France</span>
            </div>
          </div>
          <p className="mp-reservation">{site.reservation}</p>
          <div className="mp-footer-bottom">
            <span>© {new Date().getFullYear()} Band Finance Investment</span>
            <div>
              <Link href="/politique-de-confidentialite">Confidentialité</Link>
              <Link href="/mentions-legales">Mentions légales</Link>
            </div>
            <span>FR</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
export function PageIntro({
  eyebrow,
  title,
  emphasis,
  description,
}: {
  eyebrow: string;
  title: string;
  emphasis?: string;
  description: string;
}) {
  return (
    <section className="mp-page-intro">
      <div className="mp-container">
        <div className="mp-breadcrumb">
          <Link href="/">Accueil</Link>
          <span>/</span>
          <span>{eyebrow}</span>
        </div>
        <div className="mp-eyebrow">{eyebrow}</div>
        <h1>
          {title}
          {emphasis && (
            <>
              <br />
              <em>{emphasis}</em>
            </>
          )}
        </h1>
        <p>{description}</p>
      </div>
    </section>
  );
}
export function ProjectCTA() {
  return (
    <section className="mp-cta">
      <div className="mp-container">
        <div>
          <div className="mp-eyebrow">LE PREMIER PAS, C’EST LE VÔTRE</div>
          <h2>
            Vous recherchez
            <br />
            <em>un partenaire financier ?</em>
          </h2>
          <p>Faites-nous découvrir votre projet et vos besoins de financement.</p>
        </div>
        <Link className="mp-button primary" href="/presenter-un-projet">
          Soumettre mon projet
          <ArrowUpRight size={19} />
        </Link>
      </div>
    </section>
  );
}
export function DemoNotice() {
  return (
    <div className="mp-notice">
      <LockKeyhole size={20} />
      <div>
        <strong>Mode démonstration — aucune transmission</strong>
        <p>
          Vérifiez votre formulaire et consultez un aperçu local. Aucune donnée saisie n’est
          transmise ou enregistrée. La collecte réelle sera activée après validation des
          informations légales et de la configuration.
        </p>
      </div>
    </div>
  );
}
export function BackHome() {
  return (
    <Link className="mp-button primary" href="/">
      Retour à l’accueil
      <ArrowRight size={16} />
    </Link>
  );
}
