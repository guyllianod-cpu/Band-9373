# BANDFINVEST — contact prêt à être validé, non activé

## Modifications préparées le 14 novembre 2026

- Le contact dispose d’une autorisation indépendante : `BFI_CONTACT_ENABLED`. Les projets disposent de `BFI_PROJECT_ENABLED`. Une valeur absente est fermée par défaut ; ces variables sont documentées dans `.env.template`, **pas ajoutées ni activées dans `.env`**.
- Les cinq protections existantes restent nécessaires. Une future ouverture du contact ne suffit pas à ouvrir les projets : `BFI_PROJECT_ENABLED` doit rester absent ou `false`.
- Avant ouverture, le contact affiche « ouverture en préparation » et propose une validation locale sans transmission. Après ouverture autorisée, le même formulaire appelle le serveur réel, avec confirmation d’enregistrement et référence.
- Le résultat différencie l’enregistrement de l’acceptation des e-mails par Resend ; aucune promesse de livraison en boîte. Un échec e-mail n’annule pas le message enregistré. La répétition de la même référence de soumission n’envoie pas de nouveau message.
- Notification interne : `contact@bfinanceinvest.com`, message enregistré et Reply-To du visiteur. Accusé minimal : adresse issue uniquement de la ligne enregistrée, référence sans copie du message ni garantie financière. Les deux envois de contact exigent l’autorisation du contact et les protections existantes, y compris lors d’une reprise.
- Textes Contact et confidentialité reflètent l’état du contact. Les projets et leur démonstration restent séparés. Design, coordonnées, identité administrateur et domaine `https://bfinanceinvest.com` conservés.

## Sécurité

Champs obligatoires : nom, e-mail valide, objet, message de 20 à 4 000 caractères, consentement. Validation partagée navigateur/serveur, limite du corps de requête, champ piège, quotas persistants (5 par adresse/heure, 100 globales/heure), échappement HTML et destinataires imposés côté serveur. Aucun endpoint d’envoi arbitraire ni ajout de document.

Bouton bloqué pendant la soumission ; champs et requestId conservés lors d’un échec réseau pour retenter la même demande. Verrou applicatif d’envoi et registre persistant anti-doublons conservés. Une nouvelle requestId, notamment après rechargement de page, représente une nouvelle demande : aucun dédoublonnage universel par contenu n’est promis.

Accès aux messages réservé à l’administrateur vérifié `bfi@proton.me`. Expiration d’un mois calendaire UTC, refus des dossiers expirés et purge existante. Les copies en messagerie et journaux fournisseur ont des durées à valider séparément.

## Résultats vérifiés sans envoi

- Suites isolées : 13 tests e-mail / 194 assertions ; 6 tests sécurité / 71 assertions, sans échec. Clés synthétiques, Resend intercepté et base temporaire.
- Cas contact seul : autorisation absente refusée ; autorisation contact seule acceptée en test ; projet refusé au serveur ; consentement invalide refusé ; répétition sans double enregistrement.
- Simulation navigateur à 390px : champs obligatoires et consentement, succès, échec e-mail après enregistrement, demande déjà enregistrée, échec réseau puis reprise identique, reset après confirmation, notices actives et projets toujours démo. Tous les appels de soumission de cette vérification sont interceptés.
- Régression : 12 routes à 390/768/1440px, formulaires fermés sans dépôt, navigation et accueil SEO vérifiés. Lint/build passent ; avertissement existant du bundle >500 kB.
- Cinq flags de production `false`, nouvelles permissions absentes/fermées et deux clés absentes du frontend compilé. Aucun e-mail réel, aucune clé/DNS modifié, aucune publication.

## Blocages avant activation

1. Confirmer dans Resend le compte et la restriction de domaine de `RESEND_API_KEY`. Le HTTP 401 `restricted_api_key` de consultation ne prouve pas l’acceptation d’un envoi sur ce domaine. Le domaine a été confirmé vérifié dans le contrôle précédent, sans test de livraison.
2. Confirmer l’existence/réception de la boîte professionnelle. Aucun envoi réel n’a été autorisé ni effectué ; la livraison de l’accusé n’est pas prouvée.
3. Valider responsable du traitement, notices, sous-traitants et conservation des copies. Les champs serveur `site.legalName`, `site.address`, `site.publisher`, `site.hosting` restent vides : ne pas les remplir ou approuver implicitement à partir des mentions affichées.
4. Mettre en place et tester la purge automatisée et supervisée ; heartbeat de moins de 26 heures obligatoire. Ne pas poser `BFI_RETENTION_READY=true` pour contourner ce prérequis.
5. Provisionner et vérifier l’accès administrateur, puis tester l’authentification sur le domaine publié et l’iframe. Aucun droit transféré à la boîte professionnelle.
6. Obtenir votre autorisation finale. L’accord sur les modifications ne vaut pas autorisation d’envoi ou d’ouverture. Une validation conditionnelle ne permet pas de passer les flags à true avant résolution des prérequis.

## Future activation, uniquement après validations et accord

Conserver `BFI_PROJECT_ENABLED=false` (ou absent). Le contact exigera `BFI_CONTACT_ENABLED=true` ainsi que les cinq indicateurs existants satisfaits, les champs juridiques validés et une purge récente. Aucun de ces changements n’est réalisé dans cette livraison.

La publication est effectuée dans l’interface Runable. Contrôler ensuite l’état sur le domaine officiel, pas seulement dans l’aperçu. Prévoir un test borné de deux messages uniques avec adresse visiteur que vous contrôlez, selon le plan de test déjà livré et une autorisation distincte si nécessaire. Ne pas ouvrir la collecte générale pour contourner un test d’envoi non validé.

Arrêt d’urgence futur : fermer `BFI_CONTACT_ENABLED` et les notifications selon le périmètre approuvé. Ne pas supprimer les demandes déjà reçues ; conserver leur référence et appliquer la politique de conservation.

## Commandes de vérification

```sh
bun test packages/web/tests/email.test.ts
bun test packages/web/tests/safety.test.ts
bun run lint
bun run build
python scripts/verify-site.py
python scripts/verify-home-seo.py
python scripts/verify-contact-preparation.py
```

Les suites Bun doivent être exécutées dans des processus séparés. Le script navigateur de préparation simule le serveur et n’autorise aucun vrai dépôt.