# Band Finance Investment — publication et activation

## État livré

**Préparation contact uniquement, sans activation :** voir `CONTACT-ACTIVATION.md`. `BFI_CONTACT_ENABLED` et `BFI_PROJECT_ENABLED` sont des autorisations distinctes, absentes donc fermées dans l’environnement réel. Les cinq indicateurs existants restent false. Le contact affiche une ouverture en préparation et bascule vers la soumission serveur seulement après autorisation ; les projets restent en démonstration. Les validations et résultats de cette préparation font autorité sur les descriptions historiques ci-dessous.

Le site comporte neuf pages publiques, une page introuvable, une connexion administrateur désactivée et un tableau de bord de démonstration. Les formulaires valident les champs et affichent un aperçu **local**, sans envoi ni enregistrement. Les dossiers de l’aperçu sont synthétiques.

La base et ses migrations sont préparées et appliquées. Aucun compte privilégié n’a été créé et aucun dossier réel n’a été ajouté par cette refonte. Les tests utilisent une base SQLite temporaire séparée. Aucun e-mail n’a été envoyé, aucune campagne publicitaire n’a été lancée.

**Aucune publication effectuée par l’agent pour cette harmonisation.** La publication et le domaine se gèrent dans l’interface Runable. Le domaine officiel confirmé est https://bfinanceinvest.com/ ; republier les corrections depuis l’interface.

## Avant publication publique, même en démonstration

- Compléter les informations officielles dans `packages/web/src/shared/site-config.ts` : raison sociale ou identité réelle de l’éditeur, statut, adresse, immatriculation si applicable, responsable de publication, hébergeur et coordonnées.
- Faire valider les mentions légales et la confidentialité selon l’activité réellement exercée. Les mentions « à compléter » ne remplacent pas les obligations de publication.
- Vérifier la mesure d’audience intégrée par la plateforme, sa notice et les éventuelles obligations de consentement. Aucun pixel publicitaire n’a été ajouté.
- Conserver les preuves des autorisations et de l’authenticité des portraits et témoignages fournis.
- Utiliser l’option de publication de Runable, puis vérifier les neuf routes sur l’URL publique et sur téléphone. **Laisser les cinq indicateurs BFI à `false` pour publier seulement la démonstration.**

## Mise en service réelle : rester désactivé tant que la liste n’est pas validée

### 1. Cadre juridique et données

- Confirmer les activités autorisées, les contrôles de sanctions et les règles applicables aux personnes, pays et opérations concernés. La liste des pays ne garantit aucune éligibilité.
- Valider le responsable du traitement, la base légale, les sous-traitants, les localisations et transferts, les sauvegardes, les durées des comptes et journaux et les modalités d’exercice des droits.
- Finaliser la notice avec une nouvelle `noticeVersion`. Les dossiers stockent cette version ainsi que le consentement.
- Aucun dépôt de document n’est proposé. Préparer et tester un stockage privé avant d’ajouter un upload.

### 2. Domaine et notifications

- L’intégration Resend BAND FINVEST est préparée dans le serveur existant, sans Supabase. Voir `RESEND.md` pour les événements, la déduplication et les tests simulés. Les envois réels restent désactivés.
- Disposer d’un domaine détenu par le porteur du projet. Aucun achat n’a été effectué.
- Vérifier un domaine d’expédition dans Resend avec les enregistrements DNS demandés.
- Fournir la clé API et l’expéditeur vérifié au moyen du formulaire sécurisé de secrets de Runable, vers le `.env` racine. Ne pas donner les secrets dans le chat.
- Expéditeur : contact@bfinanceinvest.com ; domaine d’expédition à vérifier : bfinanceinvest.com. Les liens du site utilisent indépendamment https://bfinanceinvest.com/.
- Ne pas utiliser `proton.me` comme domaine d’expédition : `bfi@proton.me` reste l’identité administrateur et reçoit les e-mails de compte/projets. Les contacts vont à contact@bfinanceinvest.com et un accusé minimal à l’adresse du visiteur enregistrée.
- Vérifier `WEBSITE_URL` et, si renseignée, `VITE_WEBSITE_URL` sur le domaine public final, ainsi que les origines autorisées de Better Auth.
- Autoriser puis tester un envoi réel après résolution des blocages. Une notification de projet ne contient que la référence et le lien ; la notification contact contient le nom, l’adresse de réponse, l’objet et le message destinés à la boîte professionnelle. L’accusé visiteur ne reprend pas le message. Valider la conservation de ces copies en messagerie et la notice avant activation.
- Resend autorise l’expéditeur via le domaine vérifié, sans contrôle individuel de l’existence de la boîte. Vérifier aussi la réception de la boîte professionnelle chez son hébergeur. Dernier GET domaines avec la nouvelle clé fournie avec autorisation : HTTP 200, bfinanceinvest.com verified et sending enabled ; aucun e-mail réel envoyé.

### 3. Administrateur

- L’API exige une session authentifiée, une adresse **vérifiée** et exactement `bfi@proton.me`. Une autre adresse ou une adresse non vérifiée est refusée, même avec une session valide.
- Les inscriptions e-mail publiques sont désactivées. Aucun « premier inscrit devient administrateur » et aucun rôle fourni par le navigateur.
- Provisionner le compte par une opération serveur contrôlée, à mettre en place lors de l’activation. Utiliser le hachage Better Auth et un mot de passe saisi via formulaire sécurisé, jamais un mot de passe codé en dur. Envoyer puis faire suivre le vrai parcours de vérification ; ne pas marquer l’e-mail vérifié sans preuve.
- Google géré par Runable est préparé, mais l’identité vérifiée renvoyée doit correspondre à l’adresse autorisée. Un autre compte Google ne convient pas.
- Tester la connexion sur le domaine publié **et dans l’iframe de prévisualisation** (cookies/bearer), la déconnexion, l’expiration des sessions et les protections CSRF. Ces parcours réels ne sont pas déclarés opérationnels dans la livraison démo.

### 4. Conservation et purge

La fonction `addCalendarMonth` calcule un mois calendaire en UTC avec plafonnement au dernier jour du mois suivant, en conservant l’heure. Le changement de statut ne prolonge pas l’expiration. Les lectures et modifications administrateur refusent les dossiers expirés.

Script depuis la racine du projet :

```sh
bun --env-file=.env scripts/purge-expired-submissions.ts
```

- Raccorder ce script à un ordonnanceur du déploiement **au moins quotidien**, avec supervision et alertes d’échec. Aucune tâche récurrente n’est configurée par cette livraison.
- Exécuter et tester le raccordement avant de cocher `BFI_RETENTION_READY`. La réception réelle refuse les demandes si le dernier passage de purge est absent ou date de plus de 26 heures.
- La purge supprime les dossiers, messages, notifications et compteurs anti-abus expirés ; elle ne supprime pas les comptes administrateur ni les sauvegardes du fournisseur. Vérifier séparément leur cycle de conservation.
- Un passage quotidien peut laisser une ligne expirée dans la base jusqu’à la purge suivante ; elle n’est plus accessible par l’API dès l’échéance. Informer précisément de cette cadence et ne pas promettre une suppression physique à la milliseconde.

### 5. Variables serveur — `.env` racine uniquement

| Variable | État livré / condition d’activation |
|---|---|
| `BFI_AUTH_ENABLED` | `false` ; passer à `true` après provisionnement et tests |
| `BFI_COLLECTION_ENABLED` | `false` ; activer seulement après approbation explicite |
| `BFI_CONTACT_ENABLED` | absente donc fermée ; future autorisation contact uniquement, en complément des protections existantes |
| `BFI_PROJECT_ENABLED` | absente donc fermée ; conserver absent/false lors de l’activation contact uniquement |
| `BFI_LEGAL_APPROVED` | `false` ; informations et notices validées |
| `BFI_RETENTION_READY` | `false` ; purge automatisée testée et supervisée |
| `BFI_NOTIFICATIONS_ENABLED` | `false` ; expéditeur vérifié et test de réception réussi |
| `RESEND_API_KEY` | fournie par formulaire sécurisé ; inchangée ; restriction à l’envoi confirmée par GET /domains ; portée exacte sur le domaine et envoi réel non testés |
| `RESEND_DOMAIN_API_KEY` | remplacée avec autorisation via formulaire sécurisé ; consultation GET /domains réussie (HTTP 200), domaine verified/sending enabled |
| `BFI_EMAIL_FROM` | `BAND FINVEST <contact@bfinanceinvest.com>` ; utilisation bloquée sans vérification du domaine |
| `BFI_EMAIL_PUBLIC_URL` | `https://bfinanceinvest.com/` ; validation de l’origine officielle distincte du domaine expéditeur |
| `WEBSITE_URL` | `https://bfinanceinvest.com` ; harmonisée avec autorisation, origine identique à BFI_EMAIL_PUBLIC_URL |

Le serveur exige les indicateurs de collecte, juridique et conservation, l’authentification activée, les champs d’identité/adresse/publication/hébergement renseignés et une purge récente. Une simple modification d’interface ne permet pas de contourner ces contrôles.

### 6. Vérifications finales avant réception de données

- Tester le flux complet avec données synthétiques : enregistrement, référence, notification, connexion, liste, détail, statut, expiration et purge.
- Tester les erreurs DB/réseau, la répétition d’une demande et le cas « enregistré mais notification échouée ». Ne jamais demander un nouveau dépôt lorsque l’enregistrement a réussi.
- Tester contact vers boîte professionnelle + accusé vers visiteur ; réception réelle et Reply-To, aucune copie du message dans l’accusé, aucun transfert de droits administrateur. La reprise administrateur existante retente indépendamment les deux e-mails et ne duplique pas ceux déjà acceptés par Resend.
- Les protections des accusés exigent un contact enregistré, non expiré, toutes les validations de collecte et une purge récente. Aucun destinataire ou contenu arbitraire fourni par le navigateur n’est utilisé pour l’accusé.
- Vérifier les protections persistantes (5 demandes par adresse/heure, 100 globales/heure, champ piège, limite de corps 40 000 octets). Évaluer le risque de déni de service et ajouter un CAPTCHA serveur ou une limitation réseau avant activation si nécessaire.
- Faire valider explicitement l’ouverture de la collecte. Redéployer avec les variables approuvées, puis contrôler l’état sur le domaine publié.

## Tests réalisés

```sh
bun run lint
bun run build
bun test packages/web/tests/safety.test.ts
python scripts/verify-site.py
```

- Lint et build : sans erreur. Avertissement de taille du bundle JavaScript à optimiser si nécessaire.
- Tests serveur isolés : 5 tests de sécurité, 55 assertions ; 13 tests e-mail, 193 assertions. Calcul calendaire, validation, refus en démo, taille du corps, droits vérifiés, idempotence, expiration/purge ; contacts et accusés avec Resend entièrement simulé, destinataires protégés, reprise administrateur et absence de transfert de droits. Aucun envoi réel.
- Navigateur : 12 routes à 390, 768 et 1440 pixels, métadonnées, H1, absence de débordement horizontal, formulaires et devise alternative, aucune mutation de dépôt en démo, administration synthétique, menu mobile, historique, portraits et étoiles. Aucune erreur JavaScript ou API observée.

## SEO : limites connues

Titres et descriptions sont définis par route côté React. La page introuvable est fonctionnelle dans l’interface ; le fallback du serveur géré peut renvoyer HTTP 200 sur une route inconnue. Aucun statut HTTP 404 ni pré-rendu indexable n’est prétendu finalisé. Vérifier l’indexation et le fallback au déploiement ; établir les URLs canonical et le sitemap seulement avec le domaine final.