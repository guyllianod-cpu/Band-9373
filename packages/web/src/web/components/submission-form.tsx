import { useRef, useState, type FormEvent } from "react";
import { Link } from "wouter";
import { ArrowUpRight, CheckCircle2, AlertCircle, Loader2, FileText } from "lucide-react";
import {
  projectSchema,
  contactSchema,
  sectors,
  stages,
  type ProjectData,
  type ContactData,
} from "../../shared/submission-schemas";
import { countryGroups } from "../../shared/countries";
import { DemoNotice } from "./site-layout";
import { useRuntimeConfig, useSubmitProject, useSubmitContact } from "../queries/submissions";

type FieldProps = {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  type?: string;
  placeholder?: string;
  max?: number;
  autoComplete?: string;
};
function Field({
  id,
  label,
  required,
  error,
  type = "text",
  placeholder,
  max = 150,
  autoComplete,
}: FieldProps) {
  return (
    <div className="mp-field">
      <label htmlFor={id}>
        {label}
        {required && <span> *</span>}
      </label>
      <input
        id={id}
        name={id}
        aria-label={label}
        type={type}
        required={required}
        aria-invalid={!!error}
        aria-describedby={error ? `${id}-error` : undefined}
        maxLength={max}
        placeholder={placeholder}
        autoComplete={autoComplete}
      />
      {error && (
        <p className="mp-field-error" id={`${id}-error`}>
          {error}
        </p>
      )}
    </div>
  );
}

export function SubmissionForm({ kind }: { kind: "project" | "contact" }) {
  const project = kind === "project",
    config = useRuntimeConfig(),
    projectMutation = useSubmitProject(),
    contactMutation = useSubmitContact();
  const formRef = useRef<HTMLFormElement>(null),
    resultRef = useRef<HTMLDivElement>(null),
    lock = useRef(false),
    requestId = useRef(crypto.randomUUID());
  const [errors, setErrors] = useState<Record<string, string>>({}),
    [currency, setCurrency] = useState("EUR");
  const [preview, setPreview] = useState<ProjectData | ContactData | null>(null),
    [reference, setReference] = useState(""),
    [deliveryNotice, setDeliveryNotice] = useState(""),
    [networkError, setNetworkError] = useState("");
  const [contactAttempt, setContactAttempt] = useState<{
    data: ContactData; requestId: string; website: string;
  } | null>(null);
  const demo = project ? config.data?.projectEnabled !== true : config.data?.contactEnabled !== true,
    pending = projectMutation.isPending || contactMutation.isPending;
  const contactFrozen = !project && (pending || contactAttempt !== null);
  const error = (id: string) => errors[id];
  function select(id: string, label: string, items: readonly string[], required = true) {
    return (
      <div className="mp-field">
        <label htmlFor={id}>
          {label}
          {required && <span> *</span>}
        </label>
        <select
          id={id}
          name={id}
          required={required}
          defaultValue=""
          aria-invalid={!!error(id)}
          aria-describedby={error(id) ? `${id}-error` : undefined}
        >
          <option value="" disabled>
            Choisissez une option
          </option>
          {items.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
        {error(id) && (
          <p className="mp-field-error" id={`${id}-error`}>
            {error(id)}
          </p>
        )}
      </div>
    );
  }
  function textarea(id: string, label: string, min: number, max: number, placeholder: string) {
    return (
      <div className="mp-field">
        <label htmlFor={id}>
          {label} <span>*</span>
        </label>
        <textarea
          id={id}
          name={id}
          aria-label={label}
          rows={5}
          minLength={min}
          maxLength={max}
          required
          placeholder={placeholder}
          aria-invalid={!!error(id)}
          aria-describedby={error(id) ? `${id}-error` : `${id}-hint`}
        />
        <span className="mp-field-hint" id={`${id}-hint`}>
          {min} à {max.toLocaleString("fr-FR")} caractères · aucun document sensible
        </span>
        {error(id) && (
          <p className="mp-field-error" id={`${id}-error`}>
            {error(id)}
          </p>
        )}
      </div>
    );
  }
  async function submit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (lock.current || pending) return;
    setNetworkError("");
    setReference("");
    setDeliveryNotice("");
    setPreview(null);
    const fd = new FormData(e.currentTarget);
    const snapshot = !project ? contactAttempt : null;
    const get = (key: string) => snapshot
      ? key === "website" ? snapshot.website : String(snapshot.data[key as keyof ContactData] ?? "")
      : String(fd.get(key) ?? "");
    const identity = {
      name: get("name"),
      email: get("email"),
      consent: snapshot ? snapshot.data.consent : fd.get("consent") === "on",
    };
    const parsed = project
      ? projectSchema.safeParse({
          ...identity,
          phone: get("phone"),
          country: get("country"),
          company: get("company"),
          sector: get("sector"),
          stage: get("stage"),
          amount: get("amount"),
          currency: get("currency"),
          otherCurrency: get("otherCurrency"),
          description: get("description"),
          purpose: get("purpose"),
          contribution: get("contribution"),
          revenue: get("revenue"),
          businessPlan: get("businessPlan"),
        })
      : contactSchema.safeParse({ ...identity, subject: get("subject"), message: get("message") });
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = String(issue.path[0]);
        next[key] ??= issue.message;
      });
      setErrors(next);
      const first = Object.keys(next)[0];
      formRef.current?.querySelector<HTMLElement>(`[name="${first}"]`)?.focus();
      return;
    }
    setErrors({});
    if (demo) {
      setPreview(parsed.data);
      requestAnimationFrame(() => {
        resultRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
        resultRef.current?.focus();
      });
      return;
    }
    lock.current = true;
    try {
      const input = { requestId: requestId.current, website: get("website") };
      const attempt = snapshot ?? { ...input, data: parsed.data as ContactData };
      if (!project) setContactAttempt(attempt);
      const result = project
        ? await projectMutation.mutateAsync({ ...input, data: parsed.data as ProjectData })
        : await contactMutation.mutateAsync(attempt);
      setReference(result.id);
      if (!project) {
        setContactAttempt(null);
        const receipt = "receipt" in result ? result.receipt : undefined;
        setDeliveryNotice(result.notification === "already-recorded"
          ? "Cette demande était déjà enregistrée. Aucun nouvel e-mail n’a été déclenché."
          : result.notification === "sent" && receipt === "sent"
            ? "La notification professionnelle et l’accusé ont été acceptés par le service d’envoi. Vérifiez aussi vos courriers indésirables ; la livraison en boîte n’est pas garantie."
            : "Votre message est enregistré. Un ou plusieurs e-mails n’ont pas été confirmés par le service d’envoi. Ne soumettez pas de nouveau ce message ; conservez votre référence.");
      }
      formRef.current?.reset();
      requestId.current = crypto.randomUUID();
      requestAnimationFrame(() => resultRef.current?.focus());
    } catch {
      setNetworkError(
        "La demande n’a pas pu être confirmée. Vos champs sont conservés : réessayez sans modifier la demande. Aucun envoi n’est annoncé sans confirmation du serveur.",
      );
    } finally {
      lock.current = false;
    }
  }
  return (
    <form
      className="mp-form"
      ref={formRef}
      onSubmit={submit}
      noValidate
      onChange={() => {
        setPreview(null);
        setReference("");
      }}
    >
      <div className="mp-form-heading">
        <span className="mp-eyebrow">{project ? "DOSSIER DE PRÉSENTATION" : "VOTRE MESSAGE"}</span>
        <h2>{project ? "Présentez votre projet." : "Faisons connaissance."}</h2>
        <p>Les champs marqués d’un * sont obligatoires.</p>
      </div>
      {config.isLoading ? (
        <div className="mp-config-state">
          <Loader2 className="mp-spin" size={17} />
          Vérification du mode de réception…
        </div>
      ) : demo && project ? (
        <DemoNotice />
      ) : demo ? (
        <output className="mp-config-state">Ouverture du formulaire de contact en préparation. Vous pouvez vérifier vos champs, sans transmission ni enregistrement.</output>
      ) : null}
      {config.isError && (
        <p className="mp-field-hint">
          Configuration indisponible : seule la vérification locale est accessible, sans transmission.{" "}
          <button type="button" onClick={() => config.refetch()}>
            Réessayer
          </button>
        </p>
      )}
      {Object.keys(errors).length > 0 && (
        <div className="mp-error-summary" role="alert">
          <AlertCircle size={18} />
          <div>
            <strong>Vérifiez les champs signalés.</strong>
            <ul>
              {Object.entries(errors).map(([id, message]) => (
                <li key={id}>
                  <a href={`#${id}`}>{message}</a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
      <fieldset disabled={contactFrozen}>
        <legend>
          <span>01</span> {project ? "Vos coordonnées" : "Votre identité"}
        </legend>
        <div className="mp-form-grid">
          <Field
            id="name"
            label="Nom et prénom"
            required
            error={error("name")}
            placeholder="Votre nom complet"
            autoComplete="name"
          />
          <Field
            id="email"
            label="Adresse e-mail"
            type="email"
            required
            error={error("email")}
            placeholder="vous@exemple.fr"
            max={180}
            autoComplete="email"
          />
          {project && (
            <>
              <Field
                id="phone"
                label="Numéro de téléphone"
                type="tel"
                required
                error={error("phone")}
                placeholder="Avec indicatif international"
                max={30}
                autoComplete="tel"
              />
              <div className="mp-field">
                <label htmlFor="country">
                  Pays de résidence <span>*</span>
                </label>
                <select
                  name="country"
                  id="country"
                  required
                  defaultValue=""
                  aria-invalid={!!error("country")}
                  aria-describedby={error("country") ? "country-error" : undefined}
                >
                  <option value="" disabled>
                    Sélectionnez votre pays
                  </option>
                  {Object.entries(countryGroups).map(([region, list]) => (
                    <optgroup key={region} label={region}>
                      {list.map((country) => (
                        <option key={country}>{country}</option>
                      ))}
                    </optgroup>
                  ))}
                </select>
                {error("country") && (
                  <p className="mp-field-error" id="country-error">
                    {error("country")}
                  </p>
                )}
              </div>
            </>
          )}
        </div>
      </fieldset>
      {project ? (
        <>
          <fieldset>
            <legend>
              <span>02</span> Votre activité
            </legend>
            <Field
              id="company"
              label="Nom de l’entreprise (facultatif)"
              error={error("company")}
              placeholder="Entreprise ou nom du projet"
              autoComplete="organization"
            />
            <div className="mp-form-grid">
              {select("sector", "Secteur d’activité", sectors)}
              {select("stage", "Stade du projet", stages)}
            </div>
            {textarea(
              "description",
              "Présentation détaillée du projet",
              40,
              6000,
              "Votre activité, vos objectifs, votre marché, vos atouts et les étapes envisagées…",
            )}
          </fieldset>
          <fieldset>
            <legend>
              <span>03</span> Votre besoin de financement
            </legend>
            <div className="mp-form-grid">
              <Field
                id="amount"
                label="Montant recherché"
                required
                error={error("amount")}
                max={15}
                placeholder="Ex. : 50000"
              />
              <div className="mp-field">
                <label htmlFor="currency">
                  Devise souhaitée <span>*</span>
                </label>
                <select
                  id="currency"
                  name="currency"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  aria-invalid={!!error("currency")}
                >
                  {["EUR", "USD", "GBP", "Autre"].map((value) => (
                    <option key={value}>{value}</option>
                  ))}
                </select>
              </div>
            </div>
            {currency === "Autre" && (
              <Field
                id="otherCurrency"
                label="Précisez la devise"
                required
                error={error("otherCurrency")}
                max={30}
                placeholder="Ex. : XOF"
              />
            )}
            {textarea(
              "purpose",
              "Utilisation prévue du financement",
              20,
              3000,
              "Équipements, lancement commercial, production, développement…",
            )}
            <div className="mp-form-grid">
              <Field
                id="contribution"
                label="Apport personnel (facultatif)"
                error={error("contribution")}
                max={15}
                placeholder="Dans la devise sélectionnée"
              />
              <Field
                id="revenue"
                label="Chiffre d’affaires actuel (facultatif)"
                error={error("revenue")}
                max={15}
                placeholder="Dans la devise sélectionnée"
              />
            </div>
            {select("businessPlan", "Business plan disponible", ["Oui", "Non"])}
            <div className="mp-form-help">
              <FileText size={16} />
              Aucun dépôt de document n’est activé. Le business plan est simplement déclaré
              disponible.
            </div>
          </fieldset>
        </>
      ) : (
        <fieldset disabled={contactFrozen}>
          <legend>
            <span>02</span> Votre demande
          </legend>
          <Field
            id="subject"
            label="Objet"
            required
            error={error("subject")}
            placeholder="Projet, question ou collaboration"
          />
          {textarea(
            "message",
            "Votre message",
            20,
            4000,
            "Décrivez votre demande ou la collaboration que vous souhaitez envisager…",
          )}
        </fieldset>
      )}
      <div className="mp-honeypot" aria-hidden="true">
        <label htmlFor="website">Ne pas remplir ce champ</label>
        <input
          id="website"
          name="website"
          aria-label="Ne pas remplir ce champ"
          disabled={contactFrozen}
          tabIndex={-1}
          autoComplete="off"
        />
      </div>
      <label className="mp-consent" htmlFor="consent">
        <input
          id="consent"
          name="consent"
          aria-label="Accepter la politique de confidentialité"
          disabled={contactFrozen}
          type="checkbox"
          required
          aria-invalid={!!error("consent")}
          aria-describedby={error("consent") ? "consent-error" : undefined}
        />
        <span>
          J’ai lu la{" "}
          <Link href="/politique-de-confidentialite" target="_blank">
            politique de confidentialité
          </Link>{" "}
          et j’accepte le traitement de mes informations pour répondre à ma demande.
          {demo && " Avant l’ouverture de ce formulaire, aucune donnée n’est transmise."}
        </span>
      </label>
      {error("consent") && (
        <p className="mp-field-error" id="consent-error">
          {error("consent")}
        </p>
      )}
      <button
        type="submit"
        className="mp-button primary mp-submit"
        disabled={pending || config.isLoading}
      >
        {pending ? (
          <>
            <Loader2 className="mp-spin" size={18} />
            Transmission en cours…
          </>
        ) : (
          <>
            {demo
              ? "VÉRIFIER MON FORMULAIRE"
              : project
                ? "SOUMETTRE MON PROJET"
                : "ENVOYER MON MESSAGE"}
            <ArrowUpRight size={18} />
          </>
        )}
      </button>
      <p className="mp-form-disclaimer">
        {demo
          ? project ? "Démonstration : ce bouton vérifie les champs et affiche un aperçu, sans envoi." : "Avant ouverture : vérification locale uniquement, sans envoi ni enregistrement."
          : "Une confirmation et une référence seront affichées après enregistrement réussi."}{" "}
        La soumission ne garantit ni financement ni partenariat.
      </p>
      {networkError && (
        <div className="mp-error-summary" role="alert">
          {networkError}
        </div>
      )}
      {(preview || reference) && (
        <div ref={resultRef} className="mp-form-result" tabIndex={-1}>
          <CheckCircle2 size={23} />
          <div>
            <h3>
              {preview
                ? project ? "Vérification terminée — mode démonstration" : "Vérification terminée — aucune transmission"
                : "Votre demande a été enregistrée"}
            </h3>
            <p>
              {preview
                ? "Aucune demande n’a été transmise ni enregistrée. Cet aperçu reste uniquement dans cette page."
                : `Référence : ${reference}. Conservez-la pour vos échanges.`}
            </p>
            {reference && deliveryNotice && <output>{deliveryNotice}</output>}
            {preview && (
              <dl>
                <div>
                  <dt>Présentation</dt>
                  <dd>{preview.name}</dd>
                </div>
                <div>
                  <dt>Type</dt>
                  <dd>{project ? "Projet entrepreneurial" : "Contact"}</dd>
                </div>
                {"country" in preview && (
                  <>
                    <div>
                      <dt>Pays</dt>
                      <dd>{preview.country}</dd>
                    </div>
                    <div>
                      <dt>Besoin</dt>
                      <dd>
                        {preview.amount}{" "}
                        {preview.currency === "Autre" ? preview.otherCurrency : preview.currency}
                      </dd>
                    </div>
                    <div>
                      <dt>Projet</dt>
                      <dd>{preview.description}</dd>
                    </div>
                  </>
                )}
                {"subject" in preview && (
                  <>
                    <div>
                      <dt>Objet</dt>
                      <dd>{preview.subject}</dd>
                    </div>
                    <div>
                      <dt>Message</dt>
                      <dd>{preview.message}</dd>
                    </div>
                  </>
                )}
              </dl>
            )}
            <button
              type="button"
              className="mp-text-link"
              onClick={() => {
                setPreview(null);
                setReference("");
                formRef.current?.querySelector<HTMLInputElement>("#name")?.focus();
              }}
            >
              Revenir au formulaire
            </button>
          </div>
        </div>
      )}
    </form>
  );
}
