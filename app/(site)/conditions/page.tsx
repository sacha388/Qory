import type { Metadata } from 'next';
import StaticInfoPage from '@/app/components/static-info-page';

const pageDescription =
  'Conditions générales d’utilisation et de vente Qory (qory.fr) : objet du service, commande, paiement Stripe, rétractation, garantie, obligations, propriété intellectuelle, médiation et droit applicable.';

export const metadata: Metadata = {
  title: 'Conditions générales Qory | CGU et CGV',
  description: pageDescription,
  alternates: {
    canonical: '/conditions',
  },
};

export default function ConditionsPage() {
  return (
    <StaticInfoPage
      title="Conditions générales d'utilisation et de vente"
      breadcrumbLabel="Conditions"
      intro={['Dernière mise à jour : 23 mars 2026.']}
      sections={[
        {
          title: '',
          paragraphs: [
            'Les présentes conditions générales d’utilisation et de vente, ci-après les « Conditions », ont pour objet de définir le cadre juridique applicable à l’accès, à la navigation, à l’utilisation et à la commande du service Qory accessible notamment depuis le site qory.fr. Elles encadrent à la fois les conditions dans lesquelles tout utilisateur peut consulter le site, utiliser les fonctionnalités mises à disposition, solliciter une analyse, commander un rapport, accéder aux résultats fournis, et plus généralement entrer en relation avec le service proposé par Paratore Group.',
            'Toute personne accédant au site, naviguant sur celui-ci, utilisant ses fonctionnalités, lançant une analyse, commandant un rapport ou recourant, directement ou indirectement, au service Qory reconnaît avoir pris connaissance des présentes Conditions et les accepter sans réserve, sous réserve toutefois des dispositions légales impératives qui trouveraient à s’appliquer. L’utilisateur est invité à lire attentivement les présentes Conditions avant toute utilisation du site ou validation de commande. Les présentes Conditions peuvent être modifiées, mises à jour, complétées ou réorganisées à tout moment, notamment pour tenir compte d’une évolution du service, d’une évolution technique, d’une évolution légale ou réglementaire, d’une évolution des prestataires tiers intervenant dans la fourniture du service, ou de toute adaptation jugée utile par l’éditeur. La version applicable est celle en vigueur au moment de l’utilisation du site ou de la validation de la commande concernée.',
          ],
        },
        {
          title: '1. Objet du service',
          paragraphs: [
            'Qory est un service en ligne permettant d’analyser certains signaux relatifs à la visibilité d’un site internet dans des environnements de réponse générés ou assistés par intelligence artificielle, incluant notamment, sans que cette liste soit limitative, des interfaces telles que ChatGPT, Claude, Perplexity ou d’autres environnements de recherche, de réponse ou de synthèse automatisée. Le service a pour finalité de produire, selon les fonctionnalités disponibles au moment de son utilisation, des scores, sous-scores, signaux, constats, observations, indicateurs, rapprochements, synthèses, recommandations, axes d’amélioration ou priorités d’action relatifs à la présence, à la lisibilité, à la compréhension, à la reprise ou à la mise en avant d’un site dans de tels environnements.',
            'Le service Qory est fourni comme un outil d’aide à la décision. Il n’a pas pour objet de garantir un classement, une citation, une recommandation, une visibilité, un trafic, une amélioration de conversion, une performance commerciale ou un avantage concurrentiel. Les résultats fournis ne constituent ni une promesse de résultat, ni un engagement de performance, ni une certification, ni un conseil juridique, financier ou stratégique exhaustif. Ils doivent être compris comme des éléments d’analyse, de lecture et d’orientation fondés sur un état donné des signaux observés et sur des traitements automatisés susceptibles d’évoluer.',
          ],
        },
        {
          title: '2. Accès au site et au service',
          paragraphs: [
            'L’accès au site en lui-même est libre et gratuit, sous réserve des coûts d’accès à internet et, le cas échéant, des coûts de matériel ou d’équipement qui demeurent à la charge exclusive de l’utilisateur. L’accès au service d’analyse complet et à la restitution intégrale d’un rapport est quant à lui susceptible d’être soumis à paiement, dans les conditions précisées ci-après.',
            'L’éditeur s’efforce d’assurer une disponibilité raisonnable du site et du service. Toutefois, l’accès peut être suspendu, limité, ralenti, interrompu ou perturbé, notamment pour des raisons de maintenance, de mise à jour, d’évolution, de sécurité, de dépendance à des prestataires tiers, d’incident technique, de saturation, de défaillance réseau, de contrainte d’hébergement ou de tout événement extérieur à sa volonté. Aucune garantie n’est donnée quant à l’accessibilité continue, permanente, ininterrompue, rapide, sécurisée ou exempte d’erreur du site ou du service.',
          ],
        },
        {
          title: '3. Description générale de l’expérience proposée',
          paragraphs: [
            'Le site peut permettre, selon son état d’évolution et les fonctionnalités disponibles, d’obtenir un aperçu initial, partiel ou préliminaire de certains éléments d’analyse avant paiement. Cet aperçu initial, lorsqu’il existe, n’a pas vocation à constituer le rapport complet et ne saurait être interprété comme une livraison définitive du service commandé. Le rapport complet, lorsqu’il est proposé, est généré après validation de la commande et confirmation du paiement, puis rendu accessible en ligne selon les modalités techniques prévues par le service.',
            'Les délais d’exécution sont donnés à titre indicatif. L’éditeur met en œuvre des moyens raisonnables pour que le rapport soit accessible dans un délai habituellement court, généralement de quelques minutes, mais ce délai peut varier en fonction de la complexité du traitement, de l’état du site analysé, de la disponibilité des services tiers sollicités, des temps de réponse des prestataires techniques ou de toute contrainte opérationnelle ponctuelle.',
          ],
        },
        {
          title: '4. Conditions de commande',
          paragraphs: [
            'Le service payant proposé par Qory consiste, au moment de la mise à jour des présentes Conditions, dans la fourniture d’un rapport d’analyse accessible en ligne après validation de la commande et confirmation du paiement. Le prix affiché au moment de la commande est le seul applicable à celle-ci. À la date de mise à jour des présentes Conditions, le rapport complet est proposé au prix de 9,99 euros toutes taxes comprises. Les prix sont indiqués en euros et incluent, le cas échéant, la taxe sur la valeur ajoutée applicable au jour de la commande.',
            'Paratore Group se réserve le droit de modifier ses prix à tout moment. Toute modification de prix est sans effet rétroactif sur les commandes déjà valablement confirmées avant l’entrée en vigueur du nouveau tarif. La validation de la commande vaut acceptation du prix affiché et des présentes Conditions.',
            'La commande n’est réputée formée qu’à compter de la confirmation effective du paiement par le prestataire de paiement utilisé par le service. Avant cette confirmation, aucune obligation de mise à disposition du rapport complet ne pèse sur l’éditeur.',
          ],
        },
        {
          title: '5. Paiement',
          paragraphs: [
            'Le paiement est effectué en ligne par carte bancaire ou par tout autre moyen proposé au moment de la commande, par l’intermédiaire de la plateforme sécurisée Stripe. Les données complètes de carte bancaire ne sont ni collectées ni conservées par Qory ou Paratore Group. Le traitement du paiement est assuré par Stripe conformément à ses propres conditions contractuelles et à ses propres standards de sécurité.',
            'En cas de refus de paiement, de défaut d’autorisation, d’échec, d’annulation ou d’interruption du paiement, la commande n’est pas validée et le rapport complet n’est pas débloqué. L’utilisateur reconnaît que l’accès au service payant suppose la bonne fin du processus de paiement.',
          ],
        },
        {
          title: '6. Informations relatives à l’éditeur et au service',
          paragraphs: [
            'Le service Qory est proposé par la société Paratore Group, société par actions simplifiée unipersonnelle (SASU) au capital social de 1 euro, dont le siège social est situé 329 chemin du Gay, 38500 La Buisse, France, immatriculée sous le numéro SIREN 992 066 357 et au Registre du commerce et des sociétés de Grenoble, identifiée à la TVA intracommunautaire sous le numéro FR75992066357, et joignable à l’adresse contact@paratoregroup.com. La direction de la publication est assurée par Sacha Paratore, agissant en qualité de président de la société Paratore Group.',
            'Le site qory.fr est hébergé par Vercel Inc., 340 S Lemon Ave #4133, Walnut, CA 91789, États-Unis.',
          ],
        },
        {
          title: '7. Exécution du service',
          paragraphs: [
            'Après confirmation du paiement, l’exécution du service commence immédiatement ou dans un délai très rapproché, sans intervention manuelle nécessaire de la part de l’utilisateur. Le service peut comporter des traitements techniques, automatiques, algorithmiques, heuristiques, statistiques ou fondés sur des technologies d’intelligence artificielle, ainsi que l’interrogation de services ou d’environnements tiers. L’utilisateur reconnaît que l’exécution du service débute sans délai après la validation de la commande, afin de permettre la génération du rapport commandé.',
            'Le rapport est ensuite mis à disposition de l’utilisateur par voie électronique, via un lien, une interface, un écran de restitution ou tout autre mode d’accès technique proposé par le service. L’utilisateur est responsable de la conservation, le cas échéant, de l’accès qui lui est fourni, ainsi que de la consultation du rapport dans des conditions compatibles avec son équipement et son environnement technique.',
          ],
        },
        {
          title: '8. Droit de rétractation',
          paragraphs: [
            'Lorsqu’il agit en qualité de consommateur, l’utilisateur bénéficie en principe d’un droit de rétractation pour les contrats conclus à distance. Toutefois, conformément aux dispositions légales applicables aux contenus et services numériques dont l’exécution commence immédiatement après accord exprès du consommateur et renoncement exprès à son droit de rétractation, ce droit ne peut être exercé lorsque les conditions légales de cette exception sont réunies.',
            'En validant sa commande, l’utilisateur consommateur reconnaît expressément :',
          ],
          bullets: [
            'qu’il demande que l’exécution du service commence immédiatement après confirmation du paiement ;',
            'qu’il consent à cette exécution immédiate ;',
            'et qu’il renonce expressément à son droit de rétractation, dans la mesure où la loi le permet pour la fourniture d’un contenu ou service numérique exécuté sans délai.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'En conséquence, sauf disposition légale impérative contraire ou incident d’exécution imputable au service empêchant durablement la fourniture de la prestation commandée, la commande ne pourra pas être annulée une fois le processus de génération du rapport engagé. En cas de difficulté technique avérée empêchant la délivrance normale du rapport après paiement, l’utilisateur est invité à contacter le support à l’adresse contact@paratoregroup.com afin qu’une solution appropriée soit recherchée, pouvant, selon les circonstances, prendre la forme d’une relance du traitement, d’une nouvelle livraison ou, le cas échéant, d’un remboursement.',
          ],
        },
        {
          title: '9. Garantie légale de conformité',
          paragraphs: [
            'Lorsqu’il agit en qualité de consommateur, l’utilisateur bénéficie de la garantie légale de conformité applicable aux contenus et services numériques, dans les conditions prévues par le Code de la consommation. L’éditeur est tenu de fournir un service conforme à la description qui en est faite et répondant aux critères de conformité prévus par la loi.',
            'En cas de défaut de conformité, le consommateur peut solliciter la mise en conformité du service. Si cette mise en conformité est impossible, disproportionnée ou n’intervient pas dans les conditions prévues par la loi, le consommateur peut, selon les cas légalement prévus, obtenir une réduction du prix ou la résolution du contrat. Le consommateur bénéficie également, le cas échéant, de la garantie des vices cachés dans les conditions du droit commun lorsque celle-ci est applicable.',
            'Toute demande relative à la conformité du service peut être adressée à l’adresse de contact figurant dans les présentes Conditions, en exposant de manière précise la difficulté rencontrée, les circonstances de son apparition et, si possible, tout élément utile à son analyse.',
          ],
        },
        {
          title: '10. Obligations de l’utilisateur',
          paragraphs: [
            'L’utilisateur s’engage à utiliser le site et le service de manière licite, loyale et conforme à leur destination. Il garantit notamment :',
          ],
          bullets: [
            'fournir une URL valide ;',
            'disposer des droits nécessaires pour soumettre l’URL concernée ou intervenir au nom du site concerné ;',
            'ne pas utiliser le service à des fins frauduleuses, illicites, abusives ou contraires à l’ordre public ;',
            'ne pas tenter de perturber, détourner, surcharger, contourner ou compromettre techniquement le fonctionnement du service ;',
            'ne pas procéder à des usages automatisés, aspirants, massifs ou détournés du site ou des résultats produits ;',
            'ne pas revendre, redistribuer, republier ou exploiter commercialement les rapports obtenus sans autorisation préalable, sauf accord exprès de l’éditeur.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'L’utilisateur demeure seul responsable des informations qu’il transmet, des données qu’il soumet, de l’interprétation qu’il fait des résultats obtenus et des décisions qu’il prend sur leur fondement.',
          ],
        },
        {
          title: '11. Propriété intellectuelle',
          paragraphs: [
            'L’ensemble des éléments du site et du service, y compris notamment les textes, présentations, logos, marques, graphismes, structures, bases de données, logiciels, codes, interfaces, compositions visuelles, méthodes de restitution et rapports générés, est protégé par le droit de la propriété intellectuelle. Sauf disposition légale impérative contraire ou autorisation écrite et préalable de l’éditeur, toute reproduction, représentation, diffusion, adaptation, extraction, modification, revente, commercialisation ou exploitation, totale ou partielle, de tout ou partie de ces éléments est strictement interdite.',
            'Les rapports générés sont fournis pour un usage personnel, professionnel interne ou décisionnel propre à l’utilisateur ou à son organisation, à l’exclusion de toute exploitation commerciale autonome non autorisée. Toute diffusion externe substantielle, toute revente, tout retraitement commercial ou toute mise à disposition à titre de produit ou sous-produit est interdite sans autorisation préalable de l’éditeur.',
          ],
        },
        {
          title: '12. Responsabilité',
          paragraphs: [
            'Paratore Group met en œuvre des moyens raisonnables pour assurer la qualité, la cohérence, la disponibilité et la fiabilité du service. Toutefois, compte tenu de la nature du service, des dépendances techniques qu’il implique, du recours éventuel à des prestataires tiers, de l’évolution constante des environnements de réponse générés par intelligence artificielle et des limites propres aux systèmes automatisés, aucune garantie n’est donnée quant à l’exactitude absolue, à l’exhaustivité, à la stabilité dans le temps ou à la pertinence universelle des résultats fournis.',
            'Paratore Group ne saurait être tenue responsable :',
          ],
          bullets: [
            'des interruptions, indisponibilités, ralentissements ou dysfonctionnements liés à des prestataires tiers ou à l’environnement internet ;',
            'des limites, erreurs, variations, biais, évolutions ou incohérences des systèmes tiers, moteurs ou modèles interrogés ;',
            'de l’inexactitude éventuelle de certains résultats, constats ou recommandations ;',
            'des décisions prises par l’utilisateur sur la base du rapport ;',
            'des conséquences économiques, commerciales, techniques ou stratégiques pouvant résulter de l’utilisation ou de la non-utilisation des résultats fournis.',
          ],
        },
        {
          title: '',
          paragraphs: [
            'L’utilisateur reconnaît que le service constitue une aide à la décision et non une garantie de résultat.',
          ],
        },
        {
          title: '13. Données personnelles',
          paragraphs: [
            'Les traitements de données personnelles relatifs à l’utilisation du site et du service sont décrits dans la Politique de confidentialité accessible à l’adresse qory.fr/confidentialite. L’utilisateur est invité à la consulter attentivement afin de connaître les finalités de traitement, les catégories de données concernées, les bases légales applicables, les durées de conservation, les destinataires des données ainsi que les droits dont il dispose.',
            'Pour toute demande relative aux données personnelles, l’utilisateur peut écrire à : contact@paratoregroup.com.',
          ],
        },
        {
          title: '14. Réclamations',
          paragraphs: [
            'En cas de difficulté, d’insatisfaction, de contestation ou de réclamation relative au site, à la commande, au paiement, au rapport ou au fonctionnement du service, l’utilisateur est invité à contacter en priorité le support à l’adresse suivante : contact@paratoregroup.com, en exposant de manière claire les faits, la commande concernée et la nature de la demande. L’éditeur s’efforcera d’apporter une réponse dans un délai raisonnable.',
          ],
        },
        {
          title: '15. Médiation de la consommation',
          paragraphs: [
            'Conformément aux dispositions du Code de la consommation, le consommateur a le droit de recourir gratuitement à un médiateur de la consommation en vue de la résolution amiable d’un litige l’opposant au professionnel, après tentative préalable de résolution directe auprès du service client.',
            'Le médiateur compétent dont relève l’éditeur devra être désigné et ses coordonnées complètes devront être indiquées ici dès finalisation de l’adhésion de l’éditeur au dispositif de médiation de la consommation applicable.',
            'Médiateur de la consommation : [à compléter]',
            'Adresse : [à compléter]',
            'Site internet : [à compléter]',
            'Tant que cette désignation n’est pas finalisée, l’éditeur reste tenu d’achever sans délai les démarches nécessaires pour permettre au consommateur un accès effectif à un dispositif de médiation de la consommation conformément aux textes applicables.',
          ],
        },
        {
          title: '16. Droit applicable et juridiction compétente',
          paragraphs: [
            'Les présentes Conditions sont régies par le droit français. Elles sont rédigées en langue française. En cas de traduction, seule la version française fera foi.',
            'Sous réserve des dispositions légales impératives plus protectrices applicables au consommateur, tout litige relatif à la validité, l’interprétation, l’exécution, la formation ou la cessation des présentes Conditions, ou plus généralement relatif à l’utilisation du site ou du service Qory, relèvera des juridictions compétentes dans le ressort du Tribunal judiciaire de Grenoble.',
          ],
        },
        {
          title: '17. Contact',
          paragraphs: [
            'Pour toute question relative au site, au service, aux présentes Conditions, à une commande, à une réclamation ou à une demande d’information, l’utilisateur peut contacter l’éditeur à l’adresse suivante : contact@paratoregroup.com.',
          ],
        },
      ]}
      seoPath="/conditions"
      seoDescription={pageDescription}
    />
  );
}
