import type { Metadata } from 'next';
import StaticInfoPage from '@/app/components/static-info-page';
import { buildPageMetadata } from '@/app/lib/metadata';

const pageDescription =
  'Sécurité et protection des données Qory (qory.fr) : principes, paiement Stripe, contrôle d’accès, validation, SSRF, minimisation, journaux, incidents, prestataires, limites, signalement et lien avec la confidentialité.';

export const metadata: Metadata = buildPageMetadata({
  title: 'Sécurité et protection des données Qory | qory.fr',
  description: pageDescription,
  path: '/securite',
});

export default function SecuritePage() {
  return (
    <StaticInfoPage
      title="Sécurité et protection des données"
      breadcrumbLabel="Sécurité"
      intro={['Dernière mise à jour : 23 mars 2026.']}
      sections={[
        {
          title: '',
          paragraphs: [
            'La présente page a pour objet de décrire, de manière générale, les principes, mesures, engagements et limites applicables à la sécurité du site qory.fr, au service Qory, ainsi qu’à la protection des données traitées dans le cadre de son fonctionnement. Elle a vocation à informer les utilisateurs, visiteurs, clients, prospects et, plus généralement, toute personne interagissant avec le site ou le service, sur les mesures techniques et organisationnelles raisonnablement mises en oeuvre afin de préserver la confidentialité, l’intégrité, la disponibilité et la sécurité des données et des traitements réalisés.',
            'La sécurité des systèmes d’information et la protection des données à caractère personnel constituent pour Paratore Group des objectifs permanents, intégrés à la conception, à l’exploitation, à l’évolution et à la maintenance du service. Toutefois, il est expressément rappelé qu’aucune infrastructure informatique, aucun système de transmission, aucun environnement d’hébergement, aucune architecture logicielle, aucun protocole d’échange de données et, plus généralement, aucun service en ligne accessible via internet ne peut garantir une sécurité absolue, permanente et infaillible. En conséquence, la présente page ne saurait être interprétée comme une garantie d’absence totale de faille, d’incident, de vulnérabilité, d’accès non autorisé, d’événement malveillant ou de compromission, mais comme l’expression d’un engagement de moyens sérieux, proportionnés et évolutifs au regard des risques identifiés.',
          ],
        },
        {
          title: '1. Principes généraux de sécurité',
          paragraphs: [
            'Qory est conçu et exploité selon une logique de réduction de la surface d’exposition, de limitation des accès, de contrôle des flux, de validation des entrées, de journalisation raisonnée, de segmentation des responsabilités et de recours à des prestataires techniques reconnus pour la qualité de leurs engagements opérationnels et sécuritaires. La sécurité est pensée non comme une fonctionnalité isolée, mais comme un ensemble cohérent de mécanismes, de pratiques, de contrôles, de restrictions et de choix d’architecture visant à limiter les risques affectant :',
            'Dans cette perspective, Paratore Group applique une logique d’amélioration continue, tenant compte de l’évolution du produit, des dépendances techniques, des prestataires utilisés, des usages observés, des incidents rencontrés, des signaux de risque identifiés et de l’état des connaissances techniques au moment considéré.',
          ],
          bullets: [
            'les données traitées ;',
            'les rapports générés ;',
            'les accès au service ;',
            'les flux applicatifs ;',
            'les paiements ;',
            'les traitements réseau nécessaires au fonctionnement du produit ;',
            'et, plus généralement, la stabilité et la fiabilité du service.',
          ],
        },
        {
          title: '2. Paiement sécurisé',
          paragraphs: [
            'Les paiements réalisés dans le cadre du service sont traités par l’intermédiaire de Stripe, prestataire spécialisé dans les paiements en ligne, reconnu pour ses standards de sécurité et son niveau de conformité aux exigences du secteur du paiement. Qory ne collecte pas et ne conserve pas les numéros complets de cartes bancaires utilisés lors du paiement. L’ensemble du traitement des données bancaires sensibles est délégué à Stripe via son infrastructure sécurisée.',
            'En conséquence, les informations de paiement les plus sensibles ne transitent pas comme des données librement exploitées par Qory, ni ne sont stockées dans les bases de données applicatives du service. Qory peut néanmoins conserver certains éléments strictement nécessaires à la gestion de la commande, à la preuve de l’opération, au rapprochement administratif ou au traitement d’un incident, tels que des identifiants techniques de transaction, statuts de paiement, références de commande ou autres métadonnées non assimilables à un stockage complet des données bancaires.',
            'Le recours à un prestataire de paiement spécialisé permet de limiter l’exposition directe du service aux risques propres au traitement bancaire, sans pour autant supprimer toute dépendance à un tiers, ni toute possibilité d’incident affectant l’expérience de paiement. En cas de difficulté ou d’échec de paiement, la commande n’est considérée comme validée qu’après confirmation effective de l’opération par le prestataire concerné.',
          ],
        },
        {
          title: '3. Contrôle d’accès aux rapports et aux contenus protégés',
          paragraphs: [
            'L’accès aux rapports générés, ainsi qu’aux contenus ou fonctionnalités réservés, fait l’objet de vérifications systématiques avant leur affichage ou leur restitution. Les éléments premium ne sont pas rendus librement accessibles au public avant la validation du paiement ou, le cas échéant, avant la satisfaction des conditions d’accès prévues par le service.',
            'Les mécanismes de contrôle d’accès ont notamment pour finalité :',
            'Selon la logique technique retenue, les accès peuvent être limités dans le temps, liés à un identifiant, à une session, à une référence de commande, à un jeton ou à tout autre mécanisme de contrôle jugé approprié au regard du niveau de risque identifié. Ces mécanismes peuvent évoluer à tout moment pour renforcer la sécurité du service ou tenir compte d’un changement d’architecture, sans que leur détail technique exhaustif ait vocation à être exposé publiquement.',
          ],
          bullets: [
            'd’éviter l’exposition publique involontaire de contenus réservés ;',
            'de limiter les risques de consultation non autorisée ;',
            'de réduire le risque de partage abusif ou incontrôlé des liens de restitution ;',
            'et de s’assurer, dans la mesure du raisonnable, qu’un rapport n’est accessible qu’à la personne, à la session, au contexte ou au parcours ayant vocation à y accéder.',
          ],
        },
        {
          title: '4. Validation des entrées et prévention des abus',
          paragraphs: [
            'Les données soumises par les utilisateurs, et notamment les URL, adresses e-mail, identifiants de session, paramètres de requête ou tout autre élément transmis dans le cadre de l’utilisation du site ou du service, font l’objet de contrôles destinés à limiter les risques d’entrée invalide, incohérente, abusive ou malveillante.',
            'Ces contrôles peuvent inclure, selon les cas :',
          ],
          bullets: [
            'des vérifications de format ;',
            'des vérifications de structure ;',
            'des contrôles de cohérence ;',
            'des restrictions de longueur ;',
            'des contrôles de nature ou d’origine ;',
            'des filtres de sécurité ;',
            'des règles de validation côté serveur ;',
            'des mécanismes de rejet, de normalisation, d’assainissement ou de limitation.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'L’objectif de ces mécanismes est de réduire les risques liés notamment :',
          ],
          bullets: [
            'aux entrées malformées ;',
            'aux tentatives d’injection ;',
            'aux requêtes automatisées abusives ;',
            'aux usages détournés du service ;',
            'aux surcharges volontaires ;',
            'ou à toute exploitation non conforme à la finalité du produit.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'Qory s’appuie par ailleurs sur des mécanismes de rate limiting, de filtrage ou de limitation de fréquence sur certains points sensibles du service, afin de contenir les requêtes excessives, répétitives, automatisées ou suspectes. Ces mécanismes peuvent être adaptés, renforcés ou durcis à tout moment, en fonction des usages observés et des risques rencontrés.',
          ],
        },
        {
          title: '5. Sécurité des analyses réseau et prévention des abus de type SSRF',
          paragraphs: [
            'Dans le cadre du fonctionnement du service, l’utilisateur peut soumettre une URL à des fins d’analyse. Cette caractéristique implique une vigilance renforcée sur les flux sortants, les cibles appelées et la manière dont les requêtes sont exécutées.',
            'Avant tout appel externe utile à une analyse, les URL soumises font l’objet de vérifications et de restrictions destinées à prévenir les usages détournés du service, et notamment les tentatives de type SSRF (Server-Side Request Forgery), les accès non autorisés à des ressources internes, les redirections vers des cibles interdites, ou les sollicitations de ressources ne relevant pas du périmètre normal du service.',
            'À ce titre, Qory met en oeuvre des contrôles visant notamment à :',
            'Ces mesures n’ont pas vocation à être décrites dans le détail technique sur une page publique, pour des raisons évidentes de sécurité. Elles participent néanmoins d’une logique de défense en profondeur adaptée à la nature du service.',
          ],
          bullets: [
            'refuser certaines ressources locales, internes, privées ou réservées ;',
            'bloquer certaines destinations non autorisées ;',
            'encadrer les redirections ;',
            'limiter la durée des appels sortants ;',
            'limiter la quantité de données lues ou récupérées ;',
            'et, plus généralement, contenir les effets potentiels d’une URL malveillante ou détournée de sa finalité.',
          ],
        },
        {
          title: '6. Principe de minimisation des données',
          paragraphs: [
            'Qory applique, dans sa conception et son fonctionnement, un principe de minimisation, selon lequel seules les données strictement nécessaires au fonctionnement du service, à son exécution, à sa sécurisation, à la prévention des abus, au support, à la preuve des opérations ou au respect des obligations applicables ont vocation à être traitées.',
            'À ce titre, les catégories de données traitées sont limitées, dans leur principe, à ce qui est utile au bon fonctionnement du service, telles que :',
            'Qory n’a pas vocation à collecter des données sans lien avec les besoins réels du produit ou à accumuler des informations superflues. Lorsque certaines données ne sont plus nécessaires, elles ont vocation à être supprimées, anonymisées, agrégées ou archivées selon des règles de conservation adaptées, telles que décrites plus en détail dans la page Confidentialité.',
          ],
          bullets: [
            'l’URL analysée ;',
            'les résultats de l’analyse et le rapport correspondant ;',
            'le statut de paiement ou certaines métadonnées associées ;',
            'l’adresse e-mail lorsqu’elle est volontairement fournie ;',
            'ainsi que certaines données techniques, journaux ou événements nécessaires à la sécurité, au diagnostic ou à la maintenance.',
          ],
        },
        {
          title: '7. Journalisation, supervision et détection d’incidents',
          paragraphs: [
            'Afin de diagnostiquer les anomalies, détecter certains comportements anormaux, améliorer la fiabilité du service et conserver une capacité raisonnable de réponse aux incidents, Qory met en oeuvre une journalisation de certains événements techniques jugés critiques ou utiles à la sécurité et à l’exploitation du service.',
            'Les événements journalisés peuvent notamment concerner :',
            'Cette journalisation n’a pas pour objet de surveiller inutilement les utilisateurs, mais de permettre une compréhension rapide des dysfonctionnements, une meilleure capacité de remédiation et un niveau de traçabilité minimal compatible avec la sécurité d’un service en ligne. Les journaux sont conservés pendant une durée limitée, en cohérence avec les finalités poursuivies et conformément aux principes exposés dans la politique de confidentialité.',
          ],
          bullets: [
            'les statuts d’exécution ;',
            'certaines étapes de traitement ;',
            'les échecs ou erreurs ;',
            'les événements liés au paiement ;',
            'les incidents techniques ;',
            'les tentatives de requêtes anormales ;',
            'les signaux de sécurité ;',
            'et, plus généralement, les événements nécessaires au support, à l’analyse d’un dysfonctionnement, à l’investigation d’un incident ou à l’amélioration continue du service.',
          ],
        },
        {
          title: '8. Gestion des incidents de sécurité',
          paragraphs: [
            'Paratore Group applique une logique de gestion d’incident destinée à identifier, qualifier, contenir, corriger et documenter, dans des délais raisonnables, tout événement de sécurité susceptible d’affecter le site, le service, les traitements mis en oeuvre ou les données concernées.',
            'Sans détailler publiquement les procédures internes, cette logique peut inclure, selon les cas :',
            'Lorsqu’un incident est susceptible de constituer une violation de données personnelles au sens de la réglementation applicable, Qory s’engage, lorsque les conditions légales sont réunies, à procéder aux notifications ou informations requises dans les délais et selon les modalités prévues par le droit applicable, notamment à l’égard de l’autorité de contrôle compétente et, lorsque cela est nécessaire, des personnes concernées. En matière de violation de données personnelles, le RGPD prévoit en principe une notification à l’autorité de contrôle dans un délai de 72 heures lorsqu’elle est requise. La CNIL rappelle également les obligations d’analyse, de documentation et, le cas échéant, d’information des personnes concernées (https://www.cnil.fr/fr/violation-de-donnees-personnelles-les-bons-reflexes).',
          ],
          bullets: [
            'l’identification de la nature de l’incident ;',
            'l’évaluation de son périmètre ;',
            'la limitation immédiate de son impact ;',
            'la mise en oeuvre de correctifs ;',
            'l’analyse de ses causes ;',
            'la vérification de l’intégrité du service ;',
            'la documentation de l’événement ;',
            'et la mise en place de mesures de prévention complémentaires.',
          ],
        },
        {
          title: '9. Gestion des prestataires et sous-traitants',
          paragraphs: [
            'Qory s’appuie sur différents prestataires ou services tiers pour assurer le fonctionnement du produit, notamment en matière de paiement, d’hébergement, de stockage, d’observabilité, de sécurité, de journalisation, de traitement ou de génération de certaines analyses. À la date de mise à jour de la présente page, ces prestataires peuvent notamment inclure :',
            'Ces prestataires sont sélectionnés pour leur utilité fonctionnelle, leur fiabilité opérationnelle, leur niveau de sécurité perçu, leurs engagements contractuels, leur documentation et, dans la mesure du possible, leur niveau de conformité. Leur intervention est limitée au périmètre nécessaire au fonctionnement du service. Le recours à de tels prestataires n’exonère pas Qory de ses obligations, mais implique nécessairement une dépendance partielle à des environnements techniques externes.',
          ],
          bullets: [
            'Stripe pour le traitement des paiements ;',
            'Supabase pour certaines fonctions applicatives ou de stockage ;',
            'des fournisseurs d’API ou de traitements d’intelligence artificielle ;',
            'Vercel pour l’hébergement et le déploiement ;',
            'et, le cas échéant, d’autres services techniques nécessaires à la fourniture du service.',
          ],
        },
        {
          title: '10. Protection des données personnelles',
          paragraphs: [
            'Les enjeux de sécurité sont étroitement liés à la protection des données personnelles. Qory veille, dans toute la mesure du raisonnable, à ce que les traitements de données mis en oeuvre dans le cadre du site et du service soient encadrés, proportionnés, sécurisés et limités à ce qui est nécessaire à l’exécution du service, à son amélioration, à sa sécurisation et au respect des obligations applicables.',
            'Les catégories de données traitées, les finalités correspondantes, les bases légales applicables, les destinataires, les durées de conservation, les éventuels transferts hors de l’Espace économique européen et les droits dont disposent les personnes concernées sont détaillés dans la page Confidentialité, à laquelle il convient de se référer pour toute information complète sur le traitement des données personnelles.',
          ],
        },
        {
          title: '11. Limites inhérentes à la sécurité informatique',
          paragraphs: [
            'Malgré les mesures mises en oeuvre, il doit être rappelé avec insistance qu’aucun système informatique, aucun service en ligne, aucune infrastructure cloud, aucun logiciel et aucun protocole d’échange ne peut garantir une sécurité absolue. Des incidents peuvent résulter, notamment :',
            'L’engagement de Qory consiste donc à mettre en oeuvre des mesures raisonnables, proportionnées, évolutives et adaptées aux risques identifiés, à limiter autant que possible la surface d’exposition des données, à contenir les impacts lorsqu’un événement survient, et à améliorer continuellement les protections déployées au fil de l’évolution du service.',
          ],
          bullets: [
            'd’une faille logicielle inconnue ;',
            'd’une mauvaise configuration externe ;',
            'd’une attaque sophistiquée ;',
            'd’un comportement frauduleux ;',
            'd’une compromission d’un prestataire tiers ;',
            'd’une erreur humaine ;',
            'd’un événement réseau ;',
            'ou de toute circonstance non prévisible ou non maîtrisable à l’instant où elle survient.',
          ],
        },
        {
          title: '12. Signalement de vulnérabilité ou comportement suspect',
          paragraphs: [
            'Toute personne identifiant une vulnérabilité, un comportement suspect, une anomalie pouvant affecter la sécurité du site ou du service, ou tout événement paraissant relever d’un risque de sécurité, est invitée à effectuer un signalement à l’adresse suivante : contact@paratoregroup.com, en mentionnant, dans la mesure du possible, l’objet « Sécurité » ainsi que les éléments permettant de comprendre, reproduire ou caractériser le problème rencontré.',
            'Paratore Group s’efforce d’accuser réception des signalements légitimes dans un délai raisonnable et, lorsque cela est possible, dans un délai de 48 heures ouvrées. Ce délai constitue un objectif opérationnel raisonnable et non un engagement absolu de traitement ou de réponse exhaustive dans ce laps de temps.',
            'Il est demandé à toute personne procédant à un signalement d’agir de bonne foi, de manière proportionnée, sans exploitation abusive de la faille constatée, sans atteinte aux droits de tiers, sans destruction, altération ou extraction non nécessaire de données, et sans perturbation volontaire du service.',
          ],
        },
        {
          title: '13. Confidentialité et droits',
          paragraphs: [
            'Pour toute information détaillée relative :',
            'il convient de consulter la page Confidentialité accessible depuis le site. Cette page précise notamment les modalités d’exercice des droits d’accès, de rectification, d’effacement, de limitation, d’opposition et, le cas échéant, de portabilité, ainsi que les moyens de contacter Qory à ce sujet.',
          ],
          bullets: [
            'aux catégories de données personnelles traitées ;',
            'aux finalités poursuivies ;',
            'aux bases légales applicables ;',
            'aux durées de conservation ;',
            'aux destinataires ;',
            'aux transferts éventuels hors de l’Espace économique européen ;',
            'et aux droits reconnus aux personnes concernées,',
          ],
        },
        {
          title: '14. Mise à jour de la présente page',
          paragraphs: [
            'La présente page Sécurité et protection des données peut être modifiée à tout moment afin de refléter une évolution du service, de ses fonctionnalités, de son architecture technique, de ses prestataires, de son niveau de maturité, de ses obligations légales ou réglementaires, ou de sa politique générale en matière de sécurité et de protection des données. La date de dernière mise à jour figure en tête de page. Les utilisateurs sont invités à la consulter régulièrement.',
          ],
        },
      ]}
      ctaLabel="Lancer une vérification"
      ctaHref="/audit"
      seoPath="/securite"
      seoDescription={pageDescription}
    />
  );
}
