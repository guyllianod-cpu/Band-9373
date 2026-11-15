# BAND FINVEST — intégration Resend

## État de la livraison

**Dernière préparation : contact uniquement, sans activation.** Voir `CONTACT-ACTIVATION.md` : autorisations contact/projet séparées et fermées par défaut, interface de confirmation serveur et résultats des deux envois, notices conditionnelles. Les deux événements de contact exigent `BFI_CONTACT_ENABLED` et les protections de collecte existantes. Les projets restent en démonstration. Vérifications actualisées : 13 tests e-mail / 194 assertions, 6 sécurité / 71 assertions, simulation navigateur des quatre résultats ; aucune requête réelle d’envoi. Aucun changement de clé, DNS ou `.env`.

Intégration préparée dans le serveur Bun/Hono du site Band Finance Investment, appelé BAND FINVEST par son propriétaire. Aucune Supabase Edge Function n’a été ajoutée : le maintien de l’infrastructure existante a été approuvé. Les pages, formulaires de démonstration, règles d’accès, inscriptions publiques bloquées et validations juridiques restent inchangés.

**Envois réels désactivés. Aucun e-mail réel n’a été envoyé.** Les cinq indicateurs BFI restent à `false`. La clé d’envoi a été fournie via formulaire sécurisé. Après remplacement autorisé via formulaire sécurisé de RESEND_DOMAIN_API_KEY, GET /domains renvoie HTTP 200 et confirme bfinanceinvest.com avec status=verified et capabilities.sending=enabled. L’ancienne erreur HTTP 400 était liée à la valeur invalide de la clé de consultation, pas aux DNS. RESEND_API_KEY est restée inchangée ; GET /domains la reconnaît comme limitée à l’envoi (HTTP 401 restricted_api_key), ce qui est attendu pour cette clé.

Le site officiel et les liens e-mail sont https://bfinanceinvest.com/ ; l’expéditeur est contact@bfinanceinvest.com sur le domaine d’expédition bfinanceinvest.com. Ces politiques sont distinctes dans le code. BFI_EMAIL_PUBLIC_URL=https://bfinanceinvest.com/ et WEBSITE_URL=https://bfinanceinvest.com ont maintenant la même origine. WEBSITE_URL et le modèle .env.template ont été harmonisés avec autorisation ; VITE_WEBSITE_URL reste absente et le client utilise l’origine de la page. Les deux blocages identifiés (URL incohérente et clé de consultation invalide) sont levés. Aucun test d’envoi réel effectué ; la portée exacte de la clé d’envoi sur ce domaine et la réception des boîtes restent à tester.

Resend autorise toute adresse d’expédition appartenant à un domaine vérifié ; il n’expose pas, dans ce contrôle, de statut de validation individuel de la boîte contact@bfinanceinvest.com. La vérification du domaine autorise l’adresse comme expéditeur, mais ne prouve pas l’existence ni la réception dans cette boîte. Vérifier sa réception chez l’hébergeur de messagerie avant activation des notifications internes. Sources : [adresses expéditrices](https://resend.com/docs/knowledge-base/how-do-I-create-an-email-address-or-sender-in-resend), [domaines](https://resend.com/docs/dashboard/domains/introduction).

## Événements branchés

| Événement | E-mail | Destinataire / protection |
|---|---|---|
| Demande de vérification Better Auth | Confirmation avec lien personnel temporaire | Adresse administrateur autorisée uniquement |
| Inscription via le parcours Better Auth, si un jour explicitement autorisée | Confirmation automatique préparée (`sendOnSignUp`) | Les inscriptions publiques restent désactivées |
| Connexion e-mail d’un compte non vérifié | Renvoi de confirmation préparé (`sendOnSignIn`) | Authentification et notifications doivent être activées |
| Vérification réussie ou création/mise à jour d’une identité déjà vérifiée | Bienvenue | Compte réellement présent en base, vérifié et autorisé ; déduplication persistante |
| Enregistrement d’un projet | Notification importante | Administrateur `bfi@proton.me` ; référence, type et lien uniquement |
| Enregistrement d’un message de contact | Notification professionnelle | `contact@bfinanceinvest.com` ; nom, e-mail de réponse, objet, message et lien sécurisé ; Reply-To issu du contact enregistré |
| Après enregistrement réussi du contact | Accusé automatique | Visiteur : adresse issue exclusivement du contact enregistré ; référence sans copie du message, sans décision ni garantie |
| Reprise via l’administration existante | Notification et, pour un contact, accusé | Accès administrateur vérifié, dossier non expiré, déduplication indépendante des deux envois |

Les cinq modèles sont en français, HTML et texte brut, avec échappement des contenus et liens sûrs. L’expéditeur est exclusivement **`BAND FINVEST <contact@bfinanceinvest.com>`**. `bfi@proton.me` reste l’identité administrateur et le destinataire des e-mails de compte et de projets ; changer le destinataire des contacts ne lui retire ni ne transfère ses droits. `proton.me` n’est pas un domaine d’expédition.

La création contrôlée d’un premier compte administrateur n’est pas ajoutée par cette intégration. Le futur provisionnement serveur devra appeler le vrai parcours de vérification Better Auth (`auth.api.sendVerificationEmail`), et ne devra jamais écrire arbitrairement `emailVerified=true`. Aucun compte n’a été créé pour les tests réels.

## Conditions avant un envoi

1. Authentification et notifications explicitement activées après validation des prérequis existants. Le code ne change pas ces indicateurs.
2. Clé d’envoi `RESEND_API_KEY` présente côté serveur, idéalement limitée à l’envoi sur le domaine concerné.
3. Expéditeur `BFI_EMAIL_FROM` exactement égal à celui fixé ci-dessus.
4. `BFI_EMAIL_PUBLIC_URL=https://bfinanceinvest.com/`, origine officielle HTTPS provenant de seo-config.ts, sans chemin supplémentaire, paramètres ou fragment. Elle doit correspondre à l’origine de `WEBSITE_URL`. Vérifier également `VITE_WEBSITE_URL` si présente avant activation ; WEBSITE_URL a été harmonisée avec accord explicite, sans modification des méthodes d’authentification, des droits ou de trustedOrigins dans le code.
5. Consultation fraîche de l’API Resend avec `RESEND_DOMAIN_API_KEY` : domaine exact `bfinanceinvest.com`, statut `verified` et capacité `sending` activée. Aucune case ou déclaration manuelle ne peut remplacer ce contrôle.
6. Pour les demandes projet/contact, les contrôles juridiques, de collecte et de purge existants restent indispensables. Un e-mail ne les contourne pas.

RESEND_API_KEY reste la clé d’envoi : « Sending access » suffit, avec une éventuelle restriction autorisant le domaine expéditeur. RESEND_DOMAIN_API_KEY reste distincte pour GET /domains : « Full access » est nécessaire et accorde plus qu’une lecture, même si ce code ne l’utilise qu’en lecture. Les deux clés doivent concerner le même compte/domaine ; une clé restreinte à l’envoi ne peut pas lister les domaines. Seule la clé de consultation a été remplacée avec autorisation et saisie sécurisée ; la clé d’envoi est inchangée. Aucun affichage de valeur secrète ni création de clé par l’agent. Une erreur API, réseau ou de permissions bloque l’envoi. Aucun achat ni changement DNS automatique n’est effectué.

Tous les secrets résident dans le `.env` racine, jamais dans une variable `VITE_`, un composant React, un fichier public, une réponse API ou les modèles d’e-mails. Les noms de variables sont documentés dans `.env.template`, sans valeurs secrètes. Il n’existe aucun endpoint public permettant d’envoyer un e-mail arbitraire.

## Anti-doublons et erreurs

Une migration additive crée `email_deliveries`, sans modifier les tables existantes. Le registre stocke une empreinte SHA-256 de l’événement, le type, l’état, le nombre de tentatives, les dates et l’identifiant du fournisseur lorsqu’il est connu. Il ne stocke ni adresse destinataire, ni jeton de vérification, ni corps d’e-mail. Les reçus de bienvenue référencent le compte et disparaissent en cascade lors de sa suppression.

- Une ligne `sent` empêche un nouvel envoi du même événement, y compris après redémarrage.
- Un verrou atomique de 60 secondes limite les envois concurrents ; les requêtes d’envoi expirent après 15 secondes.
- La même clé d’idempotence Resend accompagne les reprises du même événement. Le fournisseur conserve ces clés pendant 24 heures ; le serveur impose une fenêtre prudente de 23 heures après la première tentative d’envoi.
- Une vérification de configuration ou de domaine échouée ne consomme pas une tentative d’envoi.
- Au-delà de cette fenêtre, un événement déjà tenté mais non confirmé `sent` reste bloqué : vérifier les journaux Resend avant une intervention serveur contrôlée. Il n’y a pas de renvoi automatique incertain après 24 heures.
- « `sent` » signifie accepté par l’API Resend, pas livré en boîte mail. Les webhooks de réception, rebond et plainte ne sont pas configurés par cette livraison.
- L’échec de la bienvenue n’annule pas une vérification réussie du compte. L’échec d’une notification n’annule pas un dossier enregistré : le parcours existant conserve l’état « enregistré, notification échouée ».
- L’accusé visiteur est un événement distinct contact-receipt, avec la même protection anti-doublons et la même expiration que le contact. Il exige aussi les contrôles de collecte, juridiques, de conservation et une purge récente. Aucun destinataire ni contenu arbitraire n’est accepté pour cet événement : seuls l’identifiant enregistré et le modèle serveur sont utilisés. Les limitations anti-abus existantes demeurent ; évaluer CAPTCHA/limitation réseau avant l’ouverture réelle pour éviter les demandes usurpant l’adresse d’un tiers.
- Une demande contact est enregistrée avant tout e-mail ; le résultat serveur distingue notification et receipt. Une soumission répétée renvoie la référence existante, sans réexpédier. Le bouton existant de reprise administrateur retente les deux événements, sans doubler ceux déjà envoyés. Aucun mécanisme public d’envoi arbitraire ajouté.
- Aucune nouvelle tâche planifiée de reprise n’est créée. Les notifications de dossiers conservent leur reprise administrateur ; les e-mails de compte échoués nécessitent un contrôle serveur. Un nouveau lien de vérification peut être demandé via Better Auth.

Les reçus de vérification expirent après 24 heures ; ceux des demandes expirent avec leur dossier. Ils sont supprimés par la purge existante, qui doit toujours être raccordée à un ordonnanceur quotidien avant activation. Les reçus de bienvenue durent autant que le compte pour empêcher les doublons sur son cycle de vie. Cela ne supprime pas les journaux Resend ni les sauvegardes du fournisseur : leurs durées doivent être validées séparément.

## Vérifications

Depuis la racine, exécuter les suites dans deux processus séparés : chacune configure sa base SQLite temporaire avant d’importer l’application.

```sh
bun test packages/web/tests/email.test.ts
bun test packages/web/tests/safety.test.ts
bun run lint
bun run build
python scripts/verify-site.py
python scripts/verify-editorial.py
```

La suite e-mail intercepte toutes les requêtes réseau : seules des réponses Resend synthétiques sont utilisées. Elle couvre les droits et statuts du domaine, les liens et expéditeur, les refus en démo, la vérification via les vrais hooks Better Auth sur base isolée, la bienvenue, les doublons concurrents, les erreurs et délais réseau simulés, les limites de reprise et la purge. Aucune clé réelle n’est utilisée par ces tests.

Dernier passage de cette harmonisation : **13 tests e-mail, 193 assertions ; 5 tests de sécurité, 55 assertions ; aucun échec**. Lint et build passent. Les tests e-mail vérifient aussi le contact complet, l’adresse professionnelle, Reply-To, l’accusé minimal, les protections destinataire, la concurrence, les blocages, la reprise administrateur protégée et l’indépendance des droits administrateur. Les contrôles navigateur de 12 routes à 390/768/1440px et de l’accueil SEO passent, sans dépôt en démo. Les cinq tables utilisateurs/projets/contacts/notifications/reçus sont vides, vérifiées par comptage en lecture seule. Les deux clés sont absentes du frontend final compilé. Ces tests ne prouvent ni les DNS réels, ni la livraison en boîte, ni la validité des clés réelles.

Le build conserve l’avertissement de bundle JavaScript supérieur à 500 kB. Le contrôle complémentaire `bun run typecheck` du monorepo échoue dans le package mobile sur les types serveur importés (`ProcessEnv`, `node:crypto`) ; web et desktop passent ce contrôle. Aucune correction mobile n’a été entreprise dans cette demande concernant le site web, et aucune validation mobile n’est revendiquée.

Diagnostic de domaine **en lecture seule**, sans envoi ni activation :

```sh
bun --env-file=.env scripts/check-resend-domain.ts
```

Avant un test réel : la consultation du domaine et l’origine serveur sont désormais validées. Vérifier encore la restriction de domaine de la clé d’envoi dans le compte Resend, l’existence/réception de la boîte professionnelle, les parcours d’authentification sur le domaine publié et dans la prévisualisation, puis approuver les activations nécessaires. Ne jamais activer la collecte pour simplement tester Resend. Le test réel devra contrôler l’acceptation API, la réception effective dans les deux boîtes, les réponses, l’absence de doublons et les liens sur le domaine publié. Tester les rebonds et plaintes ; leurs webhooks ne sont pas ajoutés par cette demande.

## Fichiers principaux

- `packages/web/src/api/services/email-policy.ts` : domaine, expéditeur, liens et indicateurs.
- `packages/web/src/api/services/email-templates.ts` : cinq modèles HTML/texte.
- `packages/web/src/api/services/email-delivery.ts` : déduplication et états d’envoi.
- `packages/web/src/api/services/notification.ts` : événements de compte et notifications existantes.
- `packages/web/src/api/routes/submissions.ts` : branchement de l’accusé après enregistrement contact.
- `packages/web/src/api/routes/admin.ts` : reprise protégée de notification et accusé contact.
- `.env` et `.env.template` : paramètres publics e-mail et URL serveur ; remplacement autorisé de la seule clé de consultation.
- `packages/web/src/web/pages/public-pages.tsx` : notice du traitement prévu adaptée aux destinataires du contact, sans activation ni refonte.
- `packages/web/src/api/auth.ts` : hooks Better Auth, sans ouverture des inscriptions.
- `packages/web/src/api/database/schema.ts` et `drizzle/0001_smart_screwball.sql` : registre additif.
- `packages/web/src/api/services/retention.ts` : purge des reçus expirés.
- `scripts/check-resend-domain.ts` : diagnostic en lecture seule.
- `ACTIVATION.md` : prérequis généraux toujours applicables.

Documentation Resend : [domaines](https://resend.com/docs/api-reference/domains/list-domains), [domaines validés](https://resend.com/docs/dashboard/domains/introduction), [idempotence](https://resend.com/docs/dashboard/emails/idempotency-keys).