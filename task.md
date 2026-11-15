 # Refonte approuvée — suivi

## État prioritaire — préparation du contact seul, sans activation
- [x] Plan approuvé : contact réel préparé, projets toujours en démonstration. Domaine/design conservés.
- [x] Permissions serveur BFI_CONTACT_ENABLED et BFI_PROJECT_ENABLED distinctes, absentes/false donc fermées ; aucune modification du .env. Configuration par formulaire, refus serveur projet en mode contact seul testé.
- [x] Interface contact : avant ouverture validation locale sans transmission, après ouverture RPC existante avec confirmation/référence et résultat honnête des notifications. Erreurs réseau gardent champs et requestId ; reprise de demande enregistrée sans nouvel e-mail.
- [x] Notification professionnelle et accusé issus des données persistées, soumis tous deux à l’autorisation contact et aux protections existantes. Champs obligatoires, consentement, quotas, piège et échappement conservés. Notices Contact/confidentialité conditionnelles.
- [x] Tests actualisés : e-mail 13/194 ; sécurité 6/71 ; lint/build, 12 routes responsive et accueil SEO passent. Simulation navigateur succès/échec e-mail/doublon/erreur réseau validée sans appel réel de dépôt. Clés absentes du frontend compilé ; cinq flags réels false.
- [x] Guide CONTACT-ACTIVATION.md et guides généraux adaptés. Aucun envoi, DNS, clé ou publication modifié.
- [ ] Autorisation finale et prérequis : portée du domaine de la clé d’envoi, réception réelle, validation juridique des champs serveur encore vides, purge automatisée supervisée, compte et connexion administrateur réels. Aucun de ces prérequis n’est déclaré acquis.

## État prioritaire — harmonisation définitive de l’e-mail professionnel
- [x] Adresse publique et expéditeur : contact@bfinanceinvest.com. Domaine expéditeur explicite bfinanceinvest.com, validation des liens basée séparément sur publicSiteOrigin=https://bfinanceinvest.com.
- [x] BFI_EMAIL_PUBLIC_URL=https://bfinanceinvest.com/ dans .env et .env.template ; BFI_EMAIL_FROM conforme. Toutes les autres variables, clés et flags inchangés, vérifiés lors de l’édition sans afficher les valeurs.
- [x] Contact : notification professionnelle (message + nom/e-mail/objet, Reply-To du contact enregistré) vers site.email ; projets et comptes restent vers site.adminEmail=bfi@proton.me, sans modification des droits d’accès.
- [x] Accusé automatique après enregistrement contact : modèle serveur minimal, destinataire issu uniquement de la ligne persistée, référence et réserves ; événement contact-receipt indépendant, déduplication/concurrence/reprise23h/expiration conservées.
- [x] Accusé soumis aux validations de collecte, légales, conservation et heartbeat purge. Reprise via handler administrateur existant, sans nouvel endpoint public. Échecs e-mail sans annulation de l’enregistrement.
- [x] Notice de traitement futur et documentation RESEND.md/ACTIVATION.md adaptées ; aucune refonte, collecte réelle ou migration nécessaire (kind est déjà un champ texte).
- [x] Tests : 13 e-mail/193 assertions et 5 sécurité/55 assertions, lint/build, 12 routes à 390/768/1440px et accueil SEO passent. Clés absentes du frontend final compilé ; anciennes références e-mail absentes des configurations/modèles/sources actifs.
- [x] Comptage réel en lecture seule : user, project_submissions, contact_messages, notifications, email_deliveries = 0. Cinq flags toujours false ; aucun e-mail réel envoyé.
- [x] Remplacement autorisé de RESEND_DOMAIN_API_KEY via formulaire sécurisé : GET Resend /domains HTTP200, bfinanceinvest.com verified et capabilities.sending=enabled ; validation par le code existant réussie. RESEND_API_KEY inchangée, reconnue comme Sending access (GET /domains HTTP401 restricted_api_key attendu). Aucun changement DNS ni e-mail réel.
- [x] WEBSITE_URL=https://bfinanceinvest.com harmonisée dans .env et .env.template avec autorisation. BFI_EMAIL_PUBLIC_URL=https://bfinanceinvest.com/ conservée ; VITE_WEBSITE_URL absente, origine de page conservée côté client. Aucun changement des méthodes ou droits d’authentification.
- [x] Après redémarrage et build : lint/build, tests e-mail 13/193 et sécurité 5/55, 12 routes responsive et accueil SEO passent. Aperçu HTTP200 ; deux clés absentes du frontend compilé ; cinq flags toujours false.
- [ ] Portée exacte de la clé d’envoi sur ce domaine, existence/réception de la boîte professionnelle et authentification réelle sur domaine publié/iframe non testées. La vérification du domaine ne prouve pas la réception en boîte. Prérequis juridiques, purge automatisée et approbation explicite restent nécessaires avant activation.
- [ ] Republication utilisateur via Runable et tests réels de réception/réponse/doublons/erreurs après résolution des blocages et validations d’activation. Aucune publication faite par l’agent.

Les sections suivantes sont l’historique ; en cas de contradiction, l’état prioritaire ci-dessus fait autorité.

- [x] Plan approuvé. Livraison démo uniquement ; collecte/notifications/auth réelle inactives.
- [x] Configuration, schémas partagés et pays exacts.
- [x] Neuf pages, navigation et formulaires avec labels, erreurs et focus.
- [x] API désactivée en démo, migration DB appliquée, contrôle d’identité vérifiée testé sur base isolée.
- [x] Tableau de bord démonstration testé et futur parcours réel préparé, non activé.
- [x] Notifications et purge préparées, guide d’activation `ACTIVATION.md`.
- [x] Lint et build sans erreur ; 5 tests serveur / 53 assertions ; 12 routes à 390/768/1440 px.
- [ ] Livraison de l’application et indication honnête de la publication via Runable.

Décisions : logo fourni, témoignages autorisés, palette TXT, bfi@proton.me, téléphone +33 6 47 68 13 27. Conservation un mois calendaire UTC. Pas d’upload, de compte administrateur fictif, de données réelles ou de campagne publicitaire.

Vérification finale : tables dossiers/messages/notifications/utilisateurs vides ; les cinq indicateurs BFI sont à false. Aucun dépôt RPC lors des aperçus, aucune erreur API/JavaScript observée. Test de purge à la frontière exacte, blocage des dossiers expirés et absence de prolongation par statut.

Bloquants avant publication publique : identité/adresse/immatriculation éventuelle/publication/hébergement, notice d’audience. Bloquants avant collecte : domaine Resend, secrets sécurisés, provisionnement et vérification du compte, tests de connexion publiés/iframe, purge réellement automatisée et approbation explicite. Aucun ordonnanceur ni publication publique configuré. SEO client et fallback HTTP à vérifier au déploiement (voir guide).

## Photos — plan approuvé
- [x] Répartition et huit textes approuvés ; droits confirmés.
- [x] Copies WebP sans agrandissement, originaux conservés.
- [x] Intégration et styles responsive ; chaque photo a son titre, texte concret et action.
- [x] Lint/build sans erreur ; 12 routes et formulaires sans régression ; 8 photos/texte/légende vérifiés à 390/768/1440px, ancrages et premier écran mobile vérifiés.
- [ ] Livraison de la version mise à jour.

## Resend — intégration approuvée, envois bloqués
- [x] Cible confirmée : projet existant, nommé BAND FINVEST par le propriétaire.
- [x] Plan approuvé : serveur Bun/Hono existant, pas de Supabase ; aucune ouverture des inscriptions ni de la collecte.
- [x] Secrets recueillis par formulaire sécurisé uniquement. Dernière consultation des domaines refusée : clé de lecture invalide (HTTP 400). Aucun envoi réel autorisé sans URL publique et destinataire précis.
- [x] Service serveur : contrôle API du domaine avant envoi, expéditeur fixe, modèles FR HTML/texte, liens HTTPS du domaine confirmé. Le domaine réel reste non vérifié faute de clé valide.
- [x] Déduplication persistante, branchement des événements administrateur et maintien des notifications de dossiers.
- [x] Migration additive testée et appliquée : email_deliveries uniquement. Aucun utilisateur ni dossier ajouté en base réelle.
- [x] Tests isolés sans réseau : 9 tests e-mail / 118 assertions ; 5 tests sécurité / 53 assertions. Lint/build sans erreur (avertissement bundle >500 kB inchangé).
- [x] Navigateur : 12 routes et 8 photos à 390/768/1440 ; validations, aperçus locaux, aucune mutation de dépôt, aucune erreur JS/API. Valeurs des secrets absentes du frontend compilé.
- [ ] Livraison du site inchangé visuellement et documentation d’intégration.

Décision de sécurité : « No Preference » ne constitue ni une URL publique ni un destinataire de test. Tests simulés seulement. Les cinq indicateurs restent false. Aucun achat, publication, ordonnanceur ou compte créé. La clé serveur de consultation reste séparée de la clé d’envoi et ne sera jamais exposée au navigateur.

Contrôle complémentaire `bun run typecheck` du monorepo : web et desktop passent ; mobile échoue sur les types serveur importés (`ProcessEnv` et `node:crypto`). Non corrigé dans cette demande web ; ne pas annoncer une validation mobile. Le build du site est passé.

État final revérifié : user, project_submissions, contact_messages, notifications, email_deliveries = 0 ; les cinq flags false ; BFI_EMAIL_PUBLIC_URL vide ; prévisualisation HTTP 200 sur le port géré 4200.

## Coordonnées publiques — dernière modification
- [x] E-mail public remplacé par contact@bandfinvest.com, téléphone par +33 6 89 68 97 01, liens tel/mailto mis à jour.
- [x] Liens WhatsApp https://wa.me/33689689701 ajoutés dans le pied de page et la page Contact.
- [x] Mention « VERSION DE VALIDATION · DÉMO » supprimée sous Nous contacter ; autres notices de démonstration conservées.
- [x] Identité administrateur et destinataires Resend maintenus à bfi@proton.me via site.adminEmail, séparés du contact public. Aucun changement de droits, d’envoi ou d’activation.
- [x] Lint/build passent ; 5 tests sécurité / 55 assertions et 9 tests e-mail / 118 assertions passent. Navigateur : 12 routes et formulaires sans régression ; nouvelles coordonnées, liens WhatsApp et absence du libellé vérifiés à 390/768/1440.

## SEO — domaine officiel confirmé par l’utilisateur
- [x] Domaine SEO : https://bfinanceinvest.com/ ; aucune modification des domaines d’authentification ou d’e-mail, des indicateurs d’activation, des textes, du design ou des fonctionnalités.
- [x] Fichiers statiques public/sitemap.xml et public/robots.txt créés, présents à l’identique dans le build de production.
- [x] Sitemap : neuf URL publiques absolues, sans administration, API ou routes inexistantes. Aucune date de modification inventée.
- [x] Métadonnées : canonical absolue par route publique, sans paramètres ; pas de canonical pour les pages privées/fallback ; meta robots noindex pour ces dernières. Titres et descriptions existants conservés.
- [x] scripts/verify-seo.py : fichiers réels HTTP 200 en prévisualisation, XML/texte validés, neuf pages avec title/description/canonical, exclusions et navigation SPA validées. Lint/build passent ; contrôles navigateur des 12 routes et formulaires passent.
- [ ] Republication via l’interface Runable : pas effectuée par l’agent. Le dernier contrôle public, y compris avec User-Agent Googlebot, renvoie encore HTTP 200 text/html pour /sitemap.xml et /robots.txt : fallback HTML de l’ancienne version, pas les vrais fichiers.

Limites SEO : title/description/canonical sont définis après exécution de React, sans ajout de SSR/prérendu. Le fallback serveur peut toujours renvoyer HTTP 200 pour une URL inexistante ; la page est exclue du sitemap et marquée noindex côté React, pas déclarée HTTP 404. Après republication, vérifier sur le domaine officiel avec `python scripts/verify-seo.py --base https://bfinanceinvest.com` puis soumettre le sitemap dans Search Console. L’indexation effective n’est pas garantie par un sitemap.

## SEO accueil — dernière optimisation
- [x] Titre et description demandés reproduits exactement dans l’entrée HTML et les métadonnées React ; option fullTitle sans modification des titres des autres pages.
- [x] H1 unique : BANDFINVEST — Étude de projets et partenariats financiers. H2 descriptifs de l’approche, des projets étudiés et du processus ; H3 et services inchangés.
- [x] Open Graph complet, image WebP absolue avec ALT et dimensions ; og:url et titres actualisés lors des navigations SPA. Canonical accueil https://bfinanceinvest.com/ sans paramètres.
- [x] Photos déjà compressées, dimensions, ALT, chargement prioritaire/lazy préservés, décodage async ajouté. Design et réserves conservés.
- [x] Lint/build passent ; verify-site, verify-editorial, verify-seo et verify-home-seo passent. Douze routes à 390/768/1440px, formulaires démo et navigation sans régression ; screenshots desktop/mobile inspectés.
- [x] Empreintes des pages publiques/légales, services, coordonnées, auth, sitemap et robots inchangées.
- [ ] Cette optimisation doit être republiée via Runable ; aucune publication effectuée par l’agent pour cette demande.

Précision : le titre, la description et les balises Open Graph accueil sont désormais aussi présents dans le HTML initial. Le contenu et les canonical par route restent générés par React, sans SSR/prérendu. Le contrôle public antérieur du sitemap/robots avait confirmé HTTP 200 avec les bons fichiers ; la remarque sur l’ancienne version HTML plus haut est historique.
