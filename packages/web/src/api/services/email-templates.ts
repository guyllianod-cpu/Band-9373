export type EmailContent = { subject: string; text: string; html: string };

function escapeHTML(value: string) {
  return value.replace(/[&<>"']/g, (character) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  })[character]!);
}

function template(subject: string, title: string, paragraphs: string[], action: string, url: string): EmailContent {
  const safeURL = escapeHTML(url);
  return {
    subject,
    text: `${title}\n\n${paragraphs.join("\n\n")}\n\n${action} :\n${url}\n\nBAND FINVEST`,
    html: `<!doctype html><html lang="fr"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="margin:0;background:#F5F7FA;color:#0A1B33;font-family:Arial,sans-serif"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td align="center" style="padding:32px 16px"><table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:600px;background:#ffffff"><tr><td style="padding:24px 32px;background:#0A1B33;color:#D7AD55;font-size:18px;font-weight:bold">BAND FINVEST</td></tr><tr><td style="padding:32px"><h1 style="font-size:26px;line-height:1.3;margin:0 0 24px">${escapeHTML(title)}</h1>${paragraphs.map((paragraph) => `<p style="font-size:16px;line-height:1.7;margin:0 0 20px">${escapeHTML(paragraph)}</p>`).join("")}<p style="margin:28px 0"><a href="${safeURL}" style="display:inline-block;padding:14px 20px;background:#0A1B33;color:#ffffff;text-decoration:none">${escapeHTML(action)}</a></p><p style="font-size:13px;line-height:1.6;color:#526174">Si le bouton ne fonctionne pas, copiez ce lien dans votre navigateur :<br><a href="${safeURL}" style="color:#112B4C;overflow-wrap:anywhere">${safeURL}</a></p></td></tr><tr><td style="padding:20px 32px;border-top:1px solid #e3e8ef;font-size:12px;color:#526174">Message transactionnel BAND FINVEST. Aucun financement ni résultat n’est garanti.</td></tr></table></td></tr></table></body></html>`,
  };
}

export function verificationEmail(url: string) {
  return template("BAND FINVEST — confirmez votre adresse e-mail", "Confirmez votre adresse e-mail", [
    "Une demande de vérification de votre compte administrateur BAND FINVEST a été reçue.",
    "Utilisez le lien ci-dessous pour confirmer votre adresse. Ce lien est personnel et temporaire ; ne le partagez pas.",
    "Si vous n’êtes pas à l’origine de cette demande, ignorez ce message. Aucun compte ne sera vérifié par cet e-mail sans votre action.",
  ], "Confirmer mon adresse", url);
}

export function welcomeEmail(url: string) {
  return template("BAND FINVEST — bienvenue", "Bienvenue dans votre espace administrateur", [
    "Votre adresse e-mail a été vérifiée. Vous pouvez accéder à votre espace administrateur avec votre compte autorisé.",
    "La vérification de votre compte n’active pas la collecte des demandes, les notifications ni les autres services. Leur mise en service reste soumise aux validations prévues.",
  ], "Accéder à mon espace", url);
}

export function submissionEmail(id: string, kind: string, url: string) {
  const label = kind === "project" || kind === "projet" ? "projet" : "contact";
  return template(`BAND FINVEST — nouvelle demande ${id}`, "Une nouvelle demande est disponible", [
    `Type : ${label}. Référence : ${id}.`,
    "Consultez cette demande dans votre espace administrateur sécurisé. Cet e-mail ne contient ni les coordonnées du demandeur ni le contenu du dossier.",
  ], "Consulter les demandes", url);
}

export function contactNotificationEmail(
  record: { id: string; name: string; email: string; subject: string; message: string },
  url: string,
) {
  return template(`BAND FINVEST — nouveau message ${record.id}`, "Un nouveau message de contact", [
    `Référence : ${record.id}.`,
    `Nom : ${record.name}. Adresse de réponse : ${record.email}.`,
    `Objet : ${record.subject}`,
    `Message : ${record.message}`,
  ], "Consulter le message dans l’espace sécurisé", url);
}

export function contactReceiptEmail(id: string, url: string) {
  return template("BAND FINVEST — réception de votre message", "Votre message a été reçu", [
    `Votre message de contact a été enregistré sous la référence ${id}.`,
    "Cet accusé de réception est automatique. Il ne constitue ni une décision sur votre projet, ni un engagement de financement ou de partenariat.",
    "Nous ne reprenons pas le contenu de votre message dans cet e-mail. Si vous n’êtes pas à l’origine de cette demande, vous pouvez nous le signaler à contact@bfinanceinvest.com.",
  ], "Consulter les coordonnées de BANDFINVEST", url);
}