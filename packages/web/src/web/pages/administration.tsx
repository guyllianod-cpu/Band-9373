import { useEffect, useState, type FormEvent } from "react";
import { Link } from "wouter";
import {
  LockKeyhole,
  ArrowUpRight,
  Loader2,
  FileText,
  MessageSquare,
  Search,
  ChevronRight,
  Mail,
  CheckCircle2,
  LogOut,
  ArrowLeft,
} from "lucide-react";
import { PageMeta, PageIntro } from "../components/site-layout";
import { useRuntimeConfig } from "../queries/submissions";
import {
  useAdminProfile,
  useAdminList,
  useAdminDetail,
  useAdminUpdate,
  useRetryNotification,
} from "../queries/admin";
import { authClient } from "../lib/auth";
import { site } from "../../shared/site-config";
import { statuses } from "../../shared/submission-schemas";

export function AdminLogin() {
  const config = useRuntimeConfig();
  return (
    <>
      <PageMeta
        title="Espace administrateur — connexion"
        description="Accès réservé à l’administration de Band Finance Investment. Aperçu de démonstration sans dossier réel."
      />
      <PageIntro
        eyebrow="Espace administrateur"
        title="Un accès réservé."
        emphasis="Des dossiers protégés."
        description="Le futur accès réel est réservé au compte administrateur autorisé, après vérification de l’identité. Aucun dossier réel n’est accessible dans cette version."
      />
      <section className="mp-section">
        <div className="mp-container mp-admin-login">
          <div className="mp-login-card">
            <LockKeyhole size={35} />
            <h2>Espace privé</h2>
            {config.isLoading ? (
              <Loading />
            ) : config.data?.authEnabled ? (
              <LiveLogin />
            ) : (
              <>
                <div className="mp-notice">
                  <LockKeyhole size={20} />
                  <div>
                    <strong>Connexion réelle non activée</strong>
                    <p>
                      L’identité de l’éditeur, le compte vérifié et le service d’envoi doivent être
                      configurés avant ouverture. Aucun mot de passe n’est demandé en démonstration.
                    </p>
                  </div>
                </div>
                <Link className="mp-button primary" href="/administration">
                  Voir l’aperçu de démonstration
                  <ArrowUpRight size={17} />
                </Link>
                <p className="mp-fineprint">
                  L’aperçu utilise uniquement des dossiers synthétiques, pas de données personnelles
                  reçues.
                </p>
              </>
            )}
          </div>
          <div className="mp-setup-list">
            <div className="mp-eyebrow">AVANT L’ACTIVATION</div>
            <h2>Les prochaines étapes.</h2>
            {[
              "Compléter les informations officielles et RGPD",
              "Vérifier un domaine d’envoi dans Resend",
              "Provisionner et vérifier le compte administrateur",
              "Raccorder la purge quotidienne des dossiers",
              "Tester les accès et valider la mise en service",
            ].map((text, i) => (
              <p key={text}>
                <span>0{i + 1}</span>
                {text}
              </p>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
function Loading() {
  return (
    <div className="mp-config-state">
      <Loader2 className="mp-spin" size={18} />
      Chargement…
    </div>
  );
}
function LiveLogin() {
  const [error, setError] = useState(""),
    [busy, setBusy] = useState(false);
  const { data: session } = authClient.useSession();
  useEffect(() => {
    void authClient.managedAuth.handleRedirect();
  }, []);
  async function email(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(fd.get("email")),
        password: String(fd.get("password")),
      });
      if (result.error)
        setError("Connexion refusée. Vérifiez votre compte et la validation de votre adresse.");
    } catch {
      setError("Connexion indisponible. Réessayez.");
    } finally {
      setBusy(false);
    }
  }
  async function google() {
    setBusy(true);
    setError("");
    try {
      const result = await authClient.managedAuth.signIn({ provider: "google" });
      if (result.error) setError("Connexion non finalisée. Réessayez avec le compte autorisé.");
    } catch {
      setError("Connexion indisponible.");
    } finally {
      setBusy(false);
    }
  }
  if (session)
    return (
      <Link className="mp-button primary" href="/administration">
        Accéder à l’administration
        <ArrowUpRight size={17} />
      </Link>
    );
  return (
    <>
      <form onSubmit={email} className="mp-login-form">
        <label htmlFor="admin-email">
          Adresse e-mail
          <input
            aria-label="Adresse e-mail"
            id="admin-email"
            name="email"
            type="email"
            required
            autoComplete="username"
            defaultValue={site.adminEmail}
          />
        </label>
        <label htmlFor="admin-password">
          Mot de passe
          <input
            aria-label="Mot de passe"
            id="admin-password"
            name="password"
            type="password"
            required
            autoComplete="current-password"
          />
        </label>
        <button type="submit" disabled={busy} className="mp-button primary">
          {busy ? "Connexion…" : "Se connecter"}
        </button>
      </form>
      <button className="mp-button light" disabled={busy} onClick={google}>
        Continuer avec Google
      </button>
      {error && (
        <p role="alert" className="mp-field-error">
          {error}
        </p>
      )}
      <p className="mp-fineprint">
        Pas d’inscription publique. L’adresse doit être vérifiée et correspondre à l’administrateur
        autorisé.
      </p>
    </>
  );
}

type DemoRecord = {
  id: string;
  kind: "project" | "contact";
  name: string;
  subject: string;
  country: string;
  amount: string;
  status: string;
  description: string;
};
const examples: DemoRecord[] = [
  {
    id: "DEMO-P-001",
    kind: "project",
    name: "Porteur de projet A — exemple",
    subject: "Création d’entreprise",
    country: "France",
    amount: "50 000 EUR",
    status: "Nouveau",
    description:
      "EXEMPLE SYNTHÉTIQUE : création d’une activité de production locale. Budget prévisionnel et besoins d’équipements à étudier. Aucun dossier reçu.",
  },
  {
    id: "DEMO-P-002",
    kind: "project",
    name: "Porteur de projet B — exemple",
    subject: "Innovation et technologie",
    country: "Sénégal",
    amount: "25 000 EUR",
    status: "En étude",
    description:
      "EXEMPLE SYNTHÉTIQUE : développement d’une solution numérique. Présentation du marché et des coûts de lancement. Aucun financement engagé.",
  },
  {
    id: "DEMO-P-003",
    kind: "project",
    name: "Porteur de projet C — exemple",
    subject: "Développement d’activité",
    country: "Maroc",
    amount: "80 000 EUR",
    status: "Précisions demandées",
    description:
      "EXEMPLE SYNTHÉTIQUE : extension d’une activité commerciale. Un complément de budget serait demandé dans un parcours réel.",
  },
  {
    id: "DEMO-C-001",
    kind: "contact",
    name: "Contact de démonstration",
    subject: "Possibilité de partenariat",
    country: "—",
    amount: "—",
    status: "Nouveau",
    description:
      "EXEMPLE SYNTHÉTIQUE : demande d’information sur la démarche de partenariat. Aucun message réel transmis.",
  },
];

export function AdminDashboard() {
  const config = useRuntimeConfig();
  return (
    <>
      <PageMeta
        title="Administration — dossiers et messages"
        description="Aperçu des fonctions d’administration. Aucun dossier réel en mode démonstration."
      />
      {config.isLoading ? (
        <section className="mp-section">
          <div className="mp-container">
            <Loading />
          </div>
        </section>
      ) : config.data?.authEnabled ? (
        <LiveDashboard />
      ) : (
        <DemoDashboard />
      )}
    </>
  );
}
function DemoDashboard() {
  const [records, setRecords] = useState(examples),
    [kind, setKind] = useState<"project" | "contact">("project"),
    [filter, setFilter] = useState(""),
    [query, setQuery] = useState(""),
    [selected, setSelected] = useState(""),
    [notice, setNotice] = useState("");
  const rows = records.filter(
    (r) =>
      r.kind === kind &&
      (!filter || r.status === filter) &&
      `${r.name} ${r.subject}`.toLowerCase().includes(query.toLowerCase()),
  );
  const item = records.find((r) => r.id === selected);
  return (
    <section className="mp-section mp-admin-section">
      <div className="mp-container">
        <div className="mp-admin-heading">
          <div>
            <div className="mp-eyebrow">APERÇU PUBLIC · AUCUN ACCÈS À DES DONNÉES RÉELLES</div>
            <h1>
              Votre espace <em>administrateur.</em>
            </h1>
            <p>
              Exemples synthétiques — toutes les modifications sont locales et disparaissent au
              rechargement.
            </p>
          </div>
          <Link href="/administration/connexion" className="mp-button light">
            <ArrowLeft size={16} />
            Retour
          </Link>
        </div>
        <div className="mp-notice">
          <LockKeyhole size={20} />
          <div>
            <strong>Démonstration uniquement</strong>
            <p>
              Vous n’êtes pas connecté à un compte administrateur. Ces chiffres illustrent
              l’interface ; ils ne représentent aucune demande reçue.
            </p>
          </div>
        </div>
        <div className="mp-stats">
          <div>
            <FileText />
            <span>Projets fictifs</span>
            <strong>3</strong>
          </div>
          <div>
            <MessageSquare />
            <span>Message fictif</span>
            <strong>1</strong>
          </div>
          <div>
            <ShieldIcon />
            <span>Conservation prévue</span>
            <strong>1 mois</strong>
          </div>
        </div>
        <div className="mp-dashboard-body">
          <div className="mp-dashboard-list">
            <div className="mp-tabs">
              <button
                className={kind === "project" ? "active" : ""}
                onClick={() => {
                  setKind("project");
                  setSelected("");
                }}
              >
                Projets
              </button>
              <button
                className={kind === "contact" ? "active" : ""}
                onClick={() => {
                  setKind("contact");
                  setSelected("");
                }}
              >
                Contacts
              </button>
            </div>
            <div className="mp-filters">
              <label>
                <span className="sr-only">Rechercher un exemple</span>
                <Search size={16} />
                <input
                  aria-label="Rechercher un exemple"
                  placeholder="Rechercher un exemple…"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                />
              </label>
              <select
                aria-label="Filtrer par statut"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="">Tous les statuts</option>
                {statuses.map((s) => (
                  <option key={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="mp-record-list">
              {rows.length ? (
                rows.map((r) => (
                  <button
                    key={r.id}
                    className={selected === r.id ? "selected" : ""}
                    onClick={() => {
                      setSelected(r.id);
                      setNotice("");
                    }}
                  >
                    <span className="mp-record-icon">
                      {r.kind === "project" ? <FileText size={20} /> : <MessageSquare size={20} />}
                    </span>
                    <div>
                      <span className="mp-record-id">{r.id}</span>
                      <h2>{r.subject}</h2>
                      <p>{r.name}</p>
                    </div>
                    <span className="mp-badge">{r.status}</span>
                    <ChevronRight size={17} />
                  </button>
                ))
              ) : (
                <p className="mp-empty">Aucun exemple ne correspond à ces filtres.</p>
              )}
            </div>
            <p className="mp-fineprint">Données d’illustration, sans enregistrement en base.</p>
          </div>
          <aside className="mp-dashboard-detail">
            {item ? (
              <>
                <div className="mp-eyebrow">DOSSIER SYNTHÉTIQUE</div>
                <h2>{item.subject}</h2>
                <p className="mp-record-id">{item.id}</p>
                <dl>
                  <div>
                    <dt>Présentation</dt>
                    <dd>{item.name}</dd>
                  </div>
                  <div>
                    <dt>Pays</dt>
                    <dd>{item.country}</dd>
                  </div>
                  <div>
                    <dt>Besoin illustratif</dt>
                    <dd>{item.amount}</dd>
                  </div>
                  <div>
                    <dt>Échéance</dt>
                    <dd>Exemple — 1 mois calendaire après réception</dd>
                  </div>
                </dl>
                <p>{item.description}</p>
                <label htmlFor="demo-status">Statut de démonstration</label>
                <select
                  id="demo-status"
                  value={item.status}
                  onChange={(e) => {
                    setRecords(
                      records.map((r) => (r.id === item.id ? { ...r, status: e.target.value } : r)),
                    );
                    setNotice("Statut modifié dans cet aperçu local uniquement.");
                  }}
                >
                  {statuses.map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
                <button
                  className="mp-button light"
                  onClick={() =>
                    setNotice(
                      "Simulation : aucun e-mail n’a été envoyé. Resend et le domaine d’expédition restent à configurer.",
                    )
                  }
                >
                  <Mail size={16} />
                  Simuler une notification
                </button>
                {notice && <output className="mp-admin-output">{notice}</output>}
              </>
            ) : (
              <div className="mp-detail-placeholder">
                <FileText size={40} strokeWidth={1} />
                <h2>Explorez un dossier.</h2>
                <p>Sélectionnez un exemple pour voir les détails et tester les statuts.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
function ShieldIcon() {
  return <LockKeyhole />;
}
function LiveDashboard() {
  const profile = useAdminProfile();
  if (profile.isLoading)
    return (
      <section className="mp-section">
        <div className="mp-container">
          <Loading />
        </div>
      </section>
    );
  if (profile.isError)
    return (
      <section className="mp-section">
        <div className="mp-container">
          <h1>Accès réservé.</h1>
          <p>Une session valide et une adresse administrateur vérifiée sont nécessaires.</p>
          <Link className="mp-button primary" href="/administration/connexion">
            Connexion
            <ArrowUpRight size={17} />
          </Link>
        </div>
      </section>
    );
  return <RealRecords />;
}
function RealRecords() {
  const [kind, setKind] = useState<"project" | "contact">("project"),
    [status, setStatus] = useState(""),
    [page, setPage] = useState(0),
    [id, setId] = useState("");
  const list = useAdminList(kind, status, page);
  return (
    <section className="mp-section mp-admin-section">
      <div className="mp-container">
        <div className="mp-admin-heading">
          <div>
            <div className="mp-eyebrow">ESPACE PRIVÉ</div>
            <h1>Dossiers & messages</h1>
          </div>
          <button
            className="mp-button light"
            onClick={async () => {
              await authClient.signOut();
              window.location.href = "/administration/connexion";
            }}
          >
            <LogOut size={17} />
            Déconnexion
          </button>
        </div>
        <div className="mp-dashboard-body">
          <div className="mp-dashboard-list">
            <div className="mp-tabs">
              <button
                className={kind === "project" ? "active" : ""}
                onClick={() => {
                  setKind("project");
                  setPage(0);
                  setId("");
                }}
              >
                Projets
              </button>
              <button
                className={kind === "contact" ? "active" : ""}
                onClick={() => {
                  setKind("contact");
                  setPage(0);
                  setId("");
                }}
              >
                Contacts
              </button>
            </div>
            <select
              aria-label="Filtrer les dossiers par statut"
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(0);
              }}
            >
              <option value="">Tous les statuts</option>
              {statuses.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
            {list.isLoading ? (
              <Loading />
            ) : list.isError ? (
              <p role="alert">
                Impossible de charger les dossiers.{" "}
                <button onClick={() => list.refetch()}>Réessayer</button>
              </p>
            ) : (
              <div className="mp-record-list">
                {list.data?.length ? (
                  list.data.map((row) => (
                    <button key={row.id} onClick={() => setId(row.id)}>
                      <FileText size={20} />
                      <div>
                        <h2>{row.subject}</h2>
                        <p>
                          {row.name} · {row.createdAt.toLocaleDateString("fr-FR")}
                        </p>
                      </div>
                      <span className="mp-badge">{row.status}</span>
                      <ChevronRight size={17} />
                    </button>
                  ))
                ) : (
                  <p className="mp-empty">Aucune demande non expirée.</p>
                )}
              </div>
            )}
            <div className="mp-pagination">
              <button
                className="mp-button light"
                disabled={page === 0}
                onClick={() => setPage(page - 1)}
              >
                Précédent
              </button>
              <span>Page {page + 1}</span>
              <button
                className="mp-button light"
                disabled={!list.data || list.data.length < 20}
                onClick={() => setPage(page + 1)}
              >
                Suivant
              </button>
            </div>
          </div>
          <aside className="mp-dashboard-detail">
            {id ? (
              <RealDetail kind={kind} id={id} />
            ) : (
              <p className="mp-empty">Sélectionnez un dossier pour consulter ses informations.</p>
            )}
          </aside>
        </div>
      </div>
    </section>
  );
}
function RealDetail({ kind, id }: { kind: "project" | "contact"; id: string }) {
  const detail = useAdminDetail(kind, id),
    update = useAdminUpdate(),
    notification = useRetryNotification();
  if (detail.isLoading) return <Loading />;
  if (detail.isError) return <p role="alert">Dossier indisponible ou expiré.</p>;
  const row = detail.data;
  if (!row) return null;
  return (
    <>
      <div className="mp-eyebrow">DOSSIER PRIVÉ</div>
      <h2>{row.name}</h2>
      <p className="mp-record-id">{row.id}</p>
      <dl>
        {Object.entries(row.data as Record<string, unknown>).map(([key, value]) => (
          <div key={key}>
            <dt>{key}</dt>
            <dd>{String(value)}</dd>
          </div>
        ))}
        <div>
          <dt>Expiration</dt>
          <dd>{row.expiresAt.toLocaleString("fr-FR")}</dd>
        </div>
        <div>
          <dt>Notification</dt>
          <dd>{row.notification}</dd>
        </div>
      </dl>
      <label htmlFor="real-status">Statut d’étude</label>
      <select
        id="real-status"
        value={row.status}
        disabled={update.isPending}
        onChange={(e) =>
          update.mutate({ kind, id, status: e.target.value as (typeof statuses)[number] })
        }
      >
        {statuses.map((s) => (
          <option key={s}>{s}</option>
        ))}
      </select>
      {update.isPending && <Loading />}
      {update.isError && <p role="alert">Modification non enregistrée.</p>}
      <button
        className="mp-button light"
        disabled={notification.isPending}
        onClick={() => notification.mutate({ kind, id })}
      >
        {notification.isPending ? <Loader2 size={16} className="mp-spin" /> : <Mail size={16} />}
        Relancer la notification
      </button>
      {notification.data && (
        <output className="mp-admin-output">
          <CheckCircle2 size={16} />
          État de notification : {notification.data.state}
        </output>
      )}
      {notification.isError && <p role="alert">Notification indisponible.</p>}
      <p className="mp-fineprint">
        Un statut d’étude ne constitue ni une décision contractuelle ni une garantie de financement.
      </p>
    </>
  );
}
